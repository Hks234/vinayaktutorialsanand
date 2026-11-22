"use server";

import { revalidatePath } from "next/cache";
import { logActivity, notifyMany } from "@/lib/activity";
import { requireAdmin } from "@/lib/auth";
import { getHero } from "@/lib/content";
import { optional, str } from "@/lib/form";
import { prisma } from "@/lib/prisma";
import { parseDateOnly } from "@/lib/utils";
import { savePublicFile } from "@/lib/uploads";
import { z } from "zod";

function refresh() {
  revalidatePath("/", "layout");
}

async function adminActor() {
  return requireAdmin();
}

async function persistHero(extra: Awaited<ReturnType<typeof getHero>>) {
  await prisma.websiteSection.upsert({
    where: { key: "hero" },
    update: { title: extra.heading, subtitle: "Hero", body: extra.description, extra: JSON.stringify(extra) },
    create: { key: "hero", title: extra.heading, subtitle: "Hero", body: extra.description, extra: JSON.stringify(extra) },
  });
}

async function uploadedOrExisting(file: FormDataEntryValue | null, existing: string) {
  if (file instanceof File && file.size > 0) return (await savePublicFile(file, "hero")) || existing;
  return existing;
}

export async function saveHero(formData: FormData) {
  const admin = await adminActor();
  const previous = await getHero();
  const pills = str(formData, "pills")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
  const extra = {
    ...previous,
    heading: str(formData, "heading") || previous.heading,
    description: str(formData, "description") || previous.description,
    backgroundImage: await uploadedOrExisting(formData.get("backgroundImage"), previous.backgroundImage),
    image: await uploadedOrExisting(formData.get("image"), previous.image),
    primaryCtaText: str(formData, "primaryCtaText") || previous.primaryCtaText,
    primaryCtaHref: str(formData, "primaryCtaHref") || previous.primaryCtaHref || "/admission-enquiry",
    secondaryCtaText: str(formData, "secondaryCtaText") || previous.secondaryCtaText,
    secondaryCtaHref: str(formData, "secondaryCtaHref") || previous.secondaryCtaHref || "/about",
    pills: pills.length ? pills : previous.pills,
  };
  await persistHero(extra);
  await logActivity({ actorRole: "admin", actorId: admin.id, action: "Updated website content", entity: "hero" });
  refresh();
  return { ok: true as const };
}

export async function saveHeroPhotos(formData: FormData) {
  const admin = await adminActor();
  const previous = await getHero();
  const extra = {
    ...previous,
    backgroundImage: await uploadedOrExisting(formData.get("backgroundImage"), previous.backgroundImage),
    image: await uploadedOrExisting(formData.get("image"), previous.image),
  };
  await persistHero(extra);
  await logActivity({ actorRole: "admin", actorId: admin.id, action: "Updated homepage photographs", entity: "hero" });
  refresh();
  return { ok: true as const };
}

export async function saveAbout(formData: FormData) {
  const admin = await adminActor();
  const extra = {
    eyebrow: str(formData, "eyebrow"),
    title: str(formData, "title"),
    body: str(formData, "body"),
    mission: str(formData, "mission"),
    vision: str(formData, "vision"),
    philosophy: str(formData, "philosophy"),
    commitment: str(formData, "commitment"),
  };
  await prisma.websiteSection.upsert({
    where: { key: "about" },
    update: { title: extra.title, subtitle: extra.eyebrow, body: extra.body, extra: JSON.stringify(extra) },
    create: { key: "about", title: extra.title, subtitle: extra.eyebrow, body: extra.body, extra: JSON.stringify(extra) },
  });
  await logActivity({ actorRole: "admin", actorId: admin.id, action: "Updated website content", entity: "about" });
  refresh();
  return { ok: true as const };
}

export async function saveJsonSection(formData: FormData) {
  const admin = await adminActor();
  const key = str(formData, "key");
  const raw = str(formData, "json");
  if (!["programs", "features", "methods"].includes(key)) return { ok: false as const, error: "Unknown section." };
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return { ok: false as const, error: "The section could not be read. Check the fields and save again." };
  }
  const schema =
    key === "programs"
      ? z.array(z.object({ title: z.string().min(2), subjects: z.array(z.string()), board: z.string(), blurb: z.string(), enquire: z.string() }))
      : key === "features"
        ? z.array(z.object({ title: z.string().min(2), description: z.string() }))
        : z.array(z.object({ step: z.string(), title: z.string().min(2), description: z.string() }));
  const result = schema.safeParse(parsed);
  if (!result.success) return { ok: false as const, error: "Each item needs a title." };
  const fallbackTitle = key === "programs" ? "Academic programs" : key === "features" ? "Why choose us" : "Teaching methodology";
  await prisma.websiteSection.upsert({
    where: { key },
    update: { title: fallbackTitle, extra: JSON.stringify(result.data) },
    create: { key, title: fallbackTitle, extra: JSON.stringify(result.data) },
  });
  await logActivity({ actorRole: "admin", actorId: admin.id, action: "Updated website content", entity: key });
  refresh();
  return { ok: true as const };
}

export async function saveContactSettings(formData: FormData) {
  const admin = await adminActor();
  const contact = {
    address: str(formData, "address"),
    phone: str(formData, "phone"),
    hours: str(formData, "hours"),
    mapQuery: str(formData, "mapQuery"),
    email: str(formData, "email"),
  };
  const footer = {
    name: str(formData, "footerName") || "VINAYAK TUTORIALS",
    tagline: str(formData, "tagline"),
    statement: str(formData, "statement"),
  };
  await prisma.websiteSetting.upsert({ where: { key: "contact" }, update: { value: JSON.stringify(contact) }, create: { key: "contact", value: JSON.stringify(contact) } });
  await prisma.websiteSetting.upsert({ where: { key: "footer" }, update: { value: JSON.stringify(footer) }, create: { key: "footer", value: JSON.stringify(footer) } });
  const logo = formData.get("logo");
  if (logo instanceof File && logo.size > 0) {
    const path = await savePublicFile(logo, "brand");
    if (path) await prisma.websiteSetting.upsert({ where: { key: "logo" }, update: { value: path }, create: { key: "logo", value: path } });
  }
  await logActivity({ actorRole: "admin", actorId: admin.id, action: "Updated website content", entity: "contact" });
  refresh();
  return { ok: true as const };
}

export async function saveBanner(formData: FormData) {
  const admin = await adminActor();
  try {
    const id = optional(formData, "id");
    const existing = id ? await prisma.promotionalBanner.findUnique({ where: { id } }) : null;
    const file = formData.get("image");
    const imagePath =
      file instanceof File && file.size > 0 ? await savePublicFile(file, "banners") : existing?.imagePath;
    if (!imagePath) return { ok: false as const, error: "Upload a banner image." };
    const data = {
      imagePath,
      heading: optional(formData, "heading"),
      subtitle: optional(formData, "subtitle"),
      ctaText: optional(formData, "ctaText"),
      ctaHref: optional(formData, "ctaHref") || "/admission-enquiry",
      displayOrder: Number(str(formData, "displayOrder") || 0),
      startDate: parseDateOnly(optional(formData, "startDate")),
      endDate: parseDateOnly(optional(formData, "endDate")),
      active: formData.get("active") === "on",
    };
    const banner = existing
      ? await prisma.promotionalBanner.update({ where: { id }, data })
      : await prisma.promotionalBanner.create({ data });
    await logActivity({ actorRole: "admin", actorId: admin.id, action: "Saved banner", entity: "banner", entityId: banner.id, details: banner.heading });
    refresh();
    return { ok: true as const };
  } catch (error) {
    return { ok: false as const, error: error instanceof Error ? error.message : "Could not save the banner." };
  }
}

export async function deleteBanner(id: string) {
  const admin = await adminActor();
  await prisma.promotionalBanner.delete({ where: { id } });
  await logActivity({ actorRole: "admin", actorId: admin.id, action: "Deleted banner", entity: "banner", entityId: id });
  refresh();
  return { ok: true as const };
}

export async function saveTopper(formData: FormData) {
  const admin = await adminActor();
  try {
    const id = optional(formData, "id");
    const name = str(formData, "name");
    const standard = str(formData, "standard");
    const percentage = Math.round((Number(str(formData, "percentage").replace(",", ".")) + Number.EPSILON) * 100) / 100;
    const academicYear = str(formData, "academicYear");
    if (name.length < 2 || !standard || !academicYear) return { ok: false as const, error: "Enter the name, standard and academic year." };
    if (!Number.isFinite(percentage) || percentage < 0 || percentage > 100) return { ok: false as const, error: "Enter a score from 0 to 100. Decimals such as 98.52 are allowed." };
    const existing = id ? await prisma.topper.findUnique({ where: { id } }) : null;
    const file = formData.get("photo");
    const photoPath = file instanceof File && file.size > 0 ? await savePublicFile(file, "toppers") : existing?.photoPath;
    const data = {
      name,
      standard,
      percentage,
      academicYear,
      school: optional(formData, "school"),
      description: optional(formData, "description"),
      featured: formData.get("featured") === "on",
      displayOrder: Number(str(formData, "displayOrder") || 0),
      photoPath: photoPath || null,
      deletedAt: null,
    };
    const topper = existing ? await prisma.topper.update({ where: { id }, data }) : await prisma.topper.create({ data });
    await logActivity({ actorRole: "admin", actorId: admin.id, action: "Saved topper", entity: "topper", entityId: topper.id, details: topper.name });
    refresh();
    return { ok: true as const };
  } catch (error) {
    return { ok: false as const, error: error instanceof Error ? error.message : "Could not save the topper." };
  }
}

export async function saveTopperPhoto(formData: FormData) {
  const admin = await adminActor();
  try {
    const id = str(formData, "id");
    const existing = await prisma.topper.findUnique({ where: { id } });
    if (!existing || existing.deletedAt) return { ok: false as const, error: "That result was not found." };
    const file = formData.get("photo");
    if (!(file instanceof File) || file.size === 0) return { ok: false as const, error: "Choose a photograph to upload." };
    const photoPath = await savePublicFile(file, "toppers");
    if (!photoPath) return { ok: false as const, error: "Choose a photograph to upload." };
    await prisma.topper.update({ where: { id }, data: { photoPath } });
    await logActivity({ actorRole: "admin", actorId: admin.id, action: "Updated topper photograph", entity: "topper", entityId: id, details: existing.name });
    refresh();
    return { ok: true as const };
  } catch (error) {
    return { ok: false as const, error: error instanceof Error ? error.message : "Could not save the photograph." };
  }
}

export async function deleteTopper(id: string) {
  const admin = await adminActor();
  await prisma.topper.update({ where: { id }, data: { deletedAt: new Date(), featured: false } });
  await logActivity({ actorRole: "admin", actorId: admin.id, action: "Deleted topper", entity: "topper", entityId: id });
  refresh();
  return { ok: true as const };
}

export async function saveGalleryImage(formData: FormData) {
  const admin = await adminActor();
  try {
    const id = optional(formData, "id");
    const existing = id ? await prisma.galleryImage.findUnique({ where: { id } }) : null;
    const file = formData.get("image");
    const imagePath = file instanceof File && file.size > 0 ? await savePublicFile(file, "gallery") : existing?.imagePath;
    if (!imagePath) return { ok: false as const, error: "Upload a photograph." };
    const data = {
      imagePath,
      title: optional(formData, "title"),
      category: str(formData, "category") || "Institute",
      displayOrder: Number(str(formData, "displayOrder") || 0),
      deletedAt: null,
    };
    const image = existing ? await prisma.galleryImage.update({ where: { id }, data }) : await prisma.galleryImage.create({ data });
    await logActivity({ actorRole: "admin", actorId: admin.id, action: "Saved gallery image", entity: "gallery", entityId: image.id });
    refresh();
    return { ok: true as const };
  } catch (error) {
    return { ok: false as const, error: error instanceof Error ? error.message : "Could not save the photograph." };
  }
}

export async function deleteGalleryImage(id: string) {
  const admin = await adminActor();
  await prisma.galleryImage.update({ where: { id }, data: { deletedAt: new Date() } });
  await logActivity({ actorRole: "admin", actorId: admin.id, action: "Deleted gallery image", entity: "gallery", entityId: id });
  refresh();
  return { ok: true as const };
}

export async function adminSaveTest(formData: FormData) {
  const admin = await adminActor();
  const id = optional(formData, "id");
  const classId = str(formData, "classId");
  const name = str(formData, "name");
  const subjectName = str(formData, "subjectName");
  const testDate = parseDateOnly(str(formData, "testDate"));
  if (!name || !classId || !subjectName || !testDate) return { ok: false as const, error: "Enter the test name, subject, class and date." };
  const data = {
    name,
    subjectName,
    classId,
    batchId: optional(formData, "batchId"),
    testDate,
    startTime: str(formData, "startTime") || "09:00",
    durationMin: Number(str(formData, "durationMin") || 60),
    totalMarks: Number(str(formData, "totalMarks") || 100),
    syllabus: optional(formData, "syllabus"),
    instructions: optional(formData, "instructions"),
    facultyId: optional(formData, "facultyId"),
    status: str(formData, "status") === "cancelled" ? "cancelled" : "scheduled",
  };
  const test = id ? await prisma.testExam.update({ where: { id }, data }) : await prisma.testExam.create({ data });
  if (data.status !== "cancelled") {
    const students = await prisma.student.findMany({
      where: {
        deletedAt: null,
        status: "active",
        classId,
        ...(data.batchId ? { batchId: data.batchId } : {}),
      },
      select: { id: true },
    });
    await notifyMany(
      students.map((student) => ({
        role: "student",
        userRecordId: student.id,
        title: "Test scheduled",
        body: `${test.name} · ${test.subjectName}`,
        href: "/student/tests",
        dedupeKey: `test:${test.id}:${student.id}`,
      })),
    );
    if (data.facultyId) {
      await notifyMany([
        {
          role: "faculty",
          userRecordId: data.facultyId,
          title: "Test assigned",
          body: `${test.name} · ${test.subjectName}`,
          href: "/faculty/tests",
          dedupeKey: `test-faculty:${test.id}:${data.facultyId}`,
        },
      ]);
    }
  }
  await logActivity({ actorRole: "admin", actorId: admin.id, action: "Saved test", entity: "test", entityId: test.id, details: test.name });
  refresh();
  return { ok: true as const };
}

export async function adminDeleteTest(id: string) {
  const admin = await adminActor();
  await prisma.testExam.update({ where: { id }, data: { deletedAt: new Date(), status: "cancelled" } });
  await logActivity({ actorRole: "admin", actorId: admin.id, action: "Deleted test", entity: "test", entityId: id });
  refresh();
  return { ok: true as const };
}

export async function markNotificationsRead() {
  const { getSession } = await import("@/lib/auth");
  const session = await getSession();
  if (!session) return { ok: false as const };
  await prisma.notification.updateMany({
    where: { role: session.role, userRecordId: session.userId, readAt: null },
    data: { readAt: new Date() },
  });
  refresh();
  return { ok: true as const };
}

export async function ensureHomeworkReminders(studentId: string) {
  const soon = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000);
  const student = await prisma.student.findUnique({ where: { id: studentId } });
  if (!student?.classId) return;
  const items = await prisma.homework.findMany({
    where: {
      deletedAt: null,
      classId: student.classId,
      dueDate: { lte: soon, gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
      OR: [{ batchId: null }, { batchId: student.batchId }],
      AND: [{ OR: [{ targets: { none: {} } }, { targets: { some: { studentId } } }] }],
      submissions: { none: { studentId, status: { in: ["completed", "reviewed"] } } },
    },
  });
  await notifyMany(
    items.map((item) => ({
      role: "student",
      userRecordId: studentId,
      title: "Homework deadline approaching",
      body: item.title,
      href: `/student/homework/${item.id}`,
      dedupeKey: `due:${item.id}:${studentId}`,
    })),
  );
}

