import { prisma } from "@/lib/prisma";

export async function catalog() {
  const [classes, batches, subjects, faculty, years] = await Promise.all([
    prisma.classGroup.findMany({ where: { deletedAt: null }, orderBy: { sortOrder: "asc" } }),
    prisma.batch.findMany({ where: { deletedAt: null }, include: { class: true }, orderBy: { name: "asc" } }),
    prisma.subject.findMany({ orderBy: { name: "asc" } }),
    prisma.faculty.findMany({ where: { deletedAt: null }, orderBy: { name: "asc" } }),
    prisma.academicYear.findMany({ orderBy: { name: "desc" } }),
  ]);
  return { classes, batches, subjects, faculty, years };
}

export function csvCell(value: string | number | null | undefined) {
  const text = String(value ?? "");
  if (/[",\n]/.test(text)) return `"${text.replace(/"/g, '""')}"`;
  return text;
}
