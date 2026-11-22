"use server";

import { revalidatePath } from "next/cache";
import { logActivity } from "@/lib/activity";
import { requireAdmin } from "@/lib/auth";
import { optional, str } from "@/lib/form";
import { prisma } from "@/lib/prisma";

function refresh() {
  revalidatePath("/", "layout");
}

export async function saveClass(formData: FormData) {
  const admin = await requireAdmin();
  const id = optional(formData, "id");
  const name = str(formData, "name");
  const sortOrder = Number(str(formData, "sortOrder") || 0);
  if (name.length < 2) return { ok: false as const, error: "Enter a class name." };
  if (id) {
    await prisma.classGroup.update({ where: { id }, data: { name, sortOrder, deletedAt: null } });
  } else {
    await prisma.classGroup.create({ data: { name, sortOrder } });
  }
  await logActivity({ actorRole: "admin", actorId: admin.id, action: "Saved class", entity: "class", details: name });
  refresh();
  return { ok: true as const };
}

export async function deleteClass(id: string) {
  const admin = await requireAdmin();
  const count = await prisma.student.count({ where: { classId: id, deletedAt: null } });
  if (count > 0) return { ok: false as const, error: "Move or deactivate students in this class before deleting it." };
  await prisma.classGroup.update({ where: { id }, data: { deletedAt: new Date() } });
  await logActivity({ actorRole: "admin", actorId: admin.id, action: "Deleted class", entity: "class", entityId: id });
  refresh();
  return { ok: true as const };
}

export async function saveBatch(formData: FormData) {
  const admin = await requireAdmin();
  const id = optional(formData, "id");
  const name = str(formData, "name");
  const classId = str(formData, "classId");
  const capacity = Number(str(formData, "capacity") || 30);
  if (!name || !classId) return { ok: false as const, error: "Choose a class and batch name." };
  if (id) await prisma.batch.update({ where: { id }, data: { name, classId, capacity, deletedAt: null } });
  else await prisma.batch.create({ data: { name, classId, capacity } });
  await logActivity({ actorRole: "admin", actorId: admin.id, action: "Saved batch", entity: "batch", details: name });
  refresh();
  return { ok: true as const };
}

export async function deleteBatch(id: string) {
  const admin = await requireAdmin();
  const count = await prisma.student.count({ where: { batchId: id, deletedAt: null } });
  if (count > 0) return { ok: false as const, error: "Students are still assigned to this batch." };
  await prisma.batch.update({ where: { id }, data: { deletedAt: new Date() } });
  await logActivity({ actorRole: "admin", actorId: admin.id, action: "Deleted batch", entity: "batch", entityId: id });
  refresh();
  return { ok: true as const };
}

export async function saveSubject(formData: FormData) {
  const admin = await requireAdmin();
  const id = optional(formData, "id");
  const name = str(formData, "name");
  const code = optional(formData, "code");
  const band = str(formData, "band") || "all";
  if (name.length < 2) return { ok: false as const, error: "Enter a subject name." };
  if (id) await prisma.subject.update({ where: { id }, data: { name, code, band } });
  else await prisma.subject.create({ data: { name, code, band } });
  await logActivity({ actorRole: "admin", actorId: admin.id, action: "Saved subject", entity: "subject", details: name });
  refresh();
  return { ok: true as const };
}

export async function deleteSubject(id: string) {
  const admin = await requireAdmin();
  await prisma.subject.delete({ where: { id } });
  await logActivity({ actorRole: "admin", actorId: admin.id, action: "Deleted subject", entity: "subject", entityId: id });
  refresh();
  return { ok: true as const };
}

export async function saveYear(formData: FormData) {
  const admin = await requireAdmin();
  const name = str(formData, "name");
  const makeCurrent = formData.get("isCurrent") === "on";
  if (!name) return { ok: false as const, error: "Enter an academic year." };
  if (makeCurrent) await prisma.academicYear.updateMany({ data: { isCurrent: false } });
  await prisma.academicYear.upsert({
    where: { name },
    update: { isCurrent: makeCurrent },
    create: { name, isCurrent: makeCurrent },
  });
  await logActivity({ actorRole: "admin", actorId: admin.id, action: "Saved academic year", entity: "academic_year", details: name });
  refresh();
  return { ok: true as const };
}

export async function assignFacultyClass(formData: FormData) {
  const admin = await requireAdmin();
  const facultyId = str(formData, "facultyId");
  const classId = str(formData, "classId");
  const batchId = optional(formData, "batchId");
  if (!facultyId || !classId) return { ok: false as const, error: "Select a faculty member and a class." };
  const existing = await prisma.facultyClassAssignment.findFirst({ where: { facultyId, classId, batchId } });
  if (!existing) await prisma.facultyClassAssignment.create({ data: { facultyId, classId, batchId } });
  await logActivity({ actorRole: "admin", actorId: admin.id, action: "Assigned faculty class", entity: "faculty", entityId: facultyId });
  refresh();
  return { ok: true as const };
}

export async function removeFacultyClass(id: string) {
  const admin = await requireAdmin();
  await prisma.facultyClassAssignment.delete({ where: { id } });
  await logActivity({ actorRole: "admin", actorId: admin.id, action: "Removed faculty class", entity: "faculty_class", entityId: id });
  refresh();
  return { ok: true as const };
}
