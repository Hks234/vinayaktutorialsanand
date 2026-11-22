"use server";

import { revalidatePath } from "next/cache";
import { logActivity, notifyMany } from "@/lib/activity";
import { requireAdmin } from "@/lib/auth";
import { many, optional, str } from "@/lib/form";
import { prisma } from "@/lib/prisma";
import { parseDateTimeLocal } from "@/lib/utils";
import { takePrivateUpload } from "@/lib/uploads";

function refresh() {
  revalidatePath("/", "layout");
}

async function notifyNotice(noticeId: string) {
  const notice = await prisma.notice.findUnique({ where: { id: noticeId }, include: { targets: true } });
  if (!notice || !notice.published) return;
  const classIds = notice.targets.map((target) => target.classId);
  const students =
    notice.audience === "faculty"
      ? []
      : await prisma.student.findMany({
          where: {
            deletedAt: null,
            status: "active",
            ...(notice.audience === "classes" ? { classId: { in: classIds.length ? classIds : ["__none__"] } } : {}),
          },
          select: { id: true },
        });
  const faculty =
    notice.audience === "students" || notice.audience === "classes"
      ? []
      : await prisma.faculty.findMany({ where: { deletedAt: null, status: "active", passwordHash: { not: null } }, select: { id: true } });
  await notifyMany([
    ...students.map((student) => ({
      role: "student",
      userRecordId: student.id,
      title: "New notice",
      body: notice.title,
      href: "/student/notices",
      dedupeKey: `notice:${notice.id}:student:${student.id}`,
    })),
    ...faculty.map((member) => ({
      role: "faculty",
      userRecordId: member.id,
      title: "New notice",
      body: notice.title,
      href: "/faculty/notices",
      dedupeKey: `notice:${notice.id}:faculty:${member.id}`,
    })),
  ]);
}

export async function saveNotice(formData: FormData) {
  const admin = await requireAdmin();
  try {
    const id = optional(formData, "id");
    const title = str(formData, "title");
    const description = str(formData, "description");
    const audience = str(formData, "audience") || "everyone";
    if (title.length < 3 || description.length < 3) return { ok: false as const, error: "Enter a title and description." };
    const classIds = many(formData, "classIds");
    if (audience === "classes" && !classIds.length) return { ok: false as const, error: "Select at least one class." };
    const attachmentPath = (await takePrivateUpload(formData, "attachment", "notices")) || undefined;
    const data = {
      title,
      description,
      category: str(formData, "category") || "General",
      audience,
      priority: str(formData, "priority") || "normal",
      publishAt: parseDateTimeLocal(optional(formData, "publishAt")),
      expiresAt: parseDateTimeLocal(optional(formData, "expiresAt")),
      published: formData.get("published") === "on",
      ...(attachmentPath ? { attachmentPath } : {}),
      createdById: admin.id,
    };
    const notice = id
      ? await prisma.notice.update({ where: { id }, data })
      : await prisma.notice.create({ data });
    await prisma.noticeTarget.deleteMany({ where: { noticeId: notice.id } });
    if (audience === "classes") {
      await prisma.noticeTarget.createMany({ data: classIds.map((classId) => ({ noticeId: notice.id, classId })) });
    }
    if (notice.published) await notifyNotice(notice.id);
    await logActivity({
      actorRole: "admin",
      actorId: admin.id,
      action: notice.published ? "Published notice" : "Saved notice",
      entity: "notice",
      entityId: notice.id,
      details: notice.title,
    });
    refresh();
    return { ok: true as const };
  } catch (error) {
    return { ok: false as const, error: error instanceof Error ? error.message : "Could not save the notice." };
  }
}

export async function setNoticePublished(id: string, published: boolean) {
  const admin = await requireAdmin();
  await prisma.notice.update({ where: { id }, data: { published } });
  if (published) await notifyNotice(id);
  await logActivity({
    actorRole: "admin",
    actorId: admin.id,
    action: published ? "Published notice" : "Unpublished notice",
    entity: "notice",
    entityId: id,
  });
  refresh();
  return { ok: true as const };
}

export async function deleteNotice(id: string) {
  const admin = await requireAdmin();
  await prisma.notice.update({ where: { id }, data: { deletedAt: new Date(), published: false } });
  await logActivity({ actorRole: "admin", actorId: admin.id, action: "Deleted notice", entity: "notice", entityId: id });
  refresh();
  return { ok: true as const };
}
