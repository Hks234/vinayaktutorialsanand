import type { Prisma } from "@prisma/client";

export function activeNoticeFilter(now = new Date()): Prisma.NoticeWhereInput {
  return {
    deletedAt: null,
    published: true,
    AND: [
      { OR: [{ publishAt: null }, { publishAt: { lte: now } }] },
      { OR: [{ expiresAt: null }, { expiresAt: { gte: now } }] },
    ],
  };
}

export function studentNoticeWhere(classId?: string | null, now = new Date()): Prisma.NoticeWhereInput {
  return {
    ...activeNoticeFilter(now),
    OR: [
      { audience: "everyone" },
      { audience: "students" },
      { audience: "classes", targets: { some: { classId: classId || "__none__" } } },
    ],
  };
}

export function facultyNoticeWhere(now = new Date()): Prisma.NoticeWhereInput {
  return {
    ...activeNoticeFilter(now),
    OR: [{ audience: "everyone" }, { audience: "faculty" }],
  };
}

export function publicNoticeWhere(now = new Date()): Prisma.NoticeWhereInput {
  return { ...activeNoticeFilter(now), audience: "everyone" };
}

type StudentScope = { id: string; classId: string | null; batchId: string | null };

export function homeworkWhereForStudent(student: StudentScope): Prisma.HomeworkWhereInput {
  if (!student.classId) return { id: "__none__" };
  return {
    deletedAt: null,
    classId: student.classId,
    AND: [
      { OR: [{ batchId: null }, { batchId: student.batchId }] },
      { OR: [{ targets: { none: {} } }, { targets: { some: { studentId: student.id } } }] },
    ],
  };
}

export function testWhereForStudent(student: StudentScope): Prisma.TestExamWhereInput {
  if (!student.classId) return { id: "__none__" };
  return {
    deletedAt: null,
    status: { not: "cancelled" },
    classId: student.classId,
    AND: [
      { OR: [{ batchId: null }, { batchId: student.batchId }] },
      { OR: [{ targets: { none: {} } }, { targets: { some: { studentId: student.id } } }] },
    ],
  };
}

export function facultyClassWhere(assignments: { classId: string; batchId: string | null }[]): Prisma.StudentWhereInput {
  if (!assignments.length) return { id: "__none__" };
  return {
    deletedAt: null,
    OR: assignments.map((item) =>
      item.batchId ? { classId: item.classId, batchId: item.batchId } : { classId: item.classId },
    ),
  };
}
