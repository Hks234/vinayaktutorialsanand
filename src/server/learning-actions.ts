"use server";

import { revalidatePath } from "next/cache";
import { logActivity, notifyMany } from "@/lib/activity";
import { requireFaculty, requireStudent } from "@/lib/auth";
import { many, optional, str } from "@/lib/form";
import { prisma } from "@/lib/prisma";
import { homeworkWhereForStudent } from "@/lib/visibility";
import { parseDateOnly } from "@/lib/utils";
import { savePrivateFile } from "@/lib/uploads";

function refresh() {
  revalidatePath("/", "layout");
}

async function facultyAllows(facultyId: string, classId: string, batchId: string | null) {
  const rows = await prisma.facultyClassAssignment.findMany({ where: { facultyId, classId } });
  return rows.some((row) => !row.batchId || row.batchId === batchId);
}

async function studentsForAssignment(classId: string, batchId: string | null, studentIds: string[]) {
  return prisma.student.findMany({
    where: {
      deletedAt: null,
      status: "active",
      classId,
      ...(batchId ? { batchId } : {}),
      ...(studentIds.length ? { id: { in: studentIds } } : {}),
    },
    select: { id: true },
  });
}

export async function saveHomework(formData: FormData) {
  const faculty = await requireFaculty();
  try {
    const id = optional(formData, "id");
    const title = str(formData, "title");
    const description = str(formData, "description");
    const classId = str(formData, "classId");
    const batchId = optional(formData, "batchId");
    const subjectName = str(formData, "subjectName");
    const assignedDate = parseDateOnly(str(formData, "assignedDate"));
    const dueDate = parseDateOnly(str(formData, "dueDate"));
    if (title.length < 2 || !classId || !subjectName || !assignedDate || !dueDate) {
      return { ok: false as const, error: "Enter the title, subject, class and dates." };
    }
    if (!(await facultyAllows(faculty.id, classId, batchId))) {
      return { ok: false as const, error: "You can assign homework only for your classes." };
    }
    const existing = id ? await prisma.homework.findUnique({ where: { id } }) : null;
    if (existing && existing.facultyId !== faculty.id) return { ok: false as const, error: "You can edit only your own homework." };
    const studentIds = many(formData, "studentIds");
    const file = formData.get("attachment");
    const attachmentPath = file instanceof File && file.size > 0 ? await savePrivateFile(file, "homework") : undefined;
    const data = {
      title,
      description,
      subjectName,
      facultyId: faculty.id,
      classId,
      batchId,
      assignedDate,
      dueDate,
      instructions: optional(formData, "instructions"),
      allowUpload: formData.get("allowUpload") === "on",
      ...(attachmentPath ? { attachmentPath } : {}),
    };
    const homework = existing
      ? await prisma.homework.update({ where: { id }, data })
      : await prisma.homework.create({ data });
    await prisma.homeworkTarget.deleteMany({ where: { homeworkId: homework.id } });
    if (studentIds.length) {
      const allowed = await studentsForAssignment(classId, batchId, studentIds);
      await prisma.homeworkTarget.createMany({ data: allowed.map((student) => ({ homeworkId: homework.id, studentId: student.id })) });
    }
    const recipients = await studentsForAssignment(classId, batchId, studentIds);
    await notifyMany(
      recipients.map((student) => ({
        role: "student",
        userRecordId: student.id,
        title: "New homework",
        body: homework.title,
        href: `/student/homework/${homework.id}`,
        dedupeKey: `hw:${homework.id}:${student.id}`,
      })),
    );
    await logActivity({
      actorRole: "faculty",
      actorId: faculty.id,
      action: existing ? "Updated homework" : "Created homework",
      entity: "homework",
      entityId: homework.id,
      details: homework.title,
    });
    refresh();
    return { ok: true as const, id: homework.id };
  } catch (error) {
    return { ok: false as const, error: error instanceof Error ? error.message : "Could not save homework." };
  }
}

export async function deleteHomework(id: string) {
  const faculty = await requireFaculty();
  const homework = await prisma.homework.findUnique({ where: { id } });
  if (!homework || homework.facultyId !== faculty.id) return { ok: false as const, error: "Homework not found." };
  await prisma.homework.update({ where: { id }, data: { deletedAt: new Date() } });
  await logActivity({ actorRole: "faculty", actorId: faculty.id, action: "Deleted homework", entity: "homework", entityId: id });
  refresh();
  return { ok: true as const };
}

export async function submitHomework(formData: FormData) {
  const student = await requireStudent();
  try {
    const homeworkId = str(formData, "homeworkId");
    const homework = await prisma.homework.findFirst({ where: { id: homeworkId, ...homeworkWhereForStudent(student) } });
    if (!homework) return { ok: false as const, error: "This homework is not assigned to you." };
    const text = optional(formData, "text");
    let attachmentPath: string | undefined;
    const file = formData.get("attachment");
    if (file instanceof File && file.size > 0) {
      if (!homework.allowUpload) return { ok: false as const, error: "File upload is not enabled for this homework." };
      attachmentPath = (await savePrivateFile(file, "submissions")) || undefined;
    }
    await prisma.homeworkSubmission.upsert({
      where: { homeworkId_studentId: { homeworkId, studentId: student.id } },
      update: {
        status: "completed",
        text,
        submittedAt: new Date(),
        ...(attachmentPath ? { attachmentPath } : {}),
      },
      create: {
        homeworkId,
        studentId: student.id,
        status: "completed",
        text,
        submittedAt: new Date(),
        attachmentPath,
      },
    });
    if (homework.facultyId) {
      await notifyMany([
        {
          role: "faculty",
          userRecordId: homework.facultyId,
          title: "Homework submitted",
          body: `${student.fullName} submitted ${homework.title}`,
          href: `/faculty/homework/${homework.id}`,
        },
      ]);
    }
    refresh();
    return { ok: true as const };
  } catch (error) {
    return { ok: false as const, error: error instanceof Error ? error.message : "Could not submit homework." };
  }
}

export async function reviewSubmission(formData: FormData) {
  const faculty = await requireFaculty();
  const id = str(formData, "id");
  const submission = await prisma.homeworkSubmission.findUnique({ where: { id }, include: { homework: true, student: true } });
  if (!submission || submission.homework.facultyId !== faculty.id) return { ok: false as const, error: "Submission not found." };
  await prisma.homeworkSubmission.update({
    where: { id },
    data: { feedback: optional(formData, "feedback"), status: "reviewed", reviewedAt: new Date() },
  });
  await notifyMany([
    {
      role: "student",
      userRecordId: submission.studentId,
      title: "Homework reviewed",
      body: submission.homework.title,
      href: `/student/homework/${submission.homeworkId}`,
    },
  ]);
  refresh();
  return { ok: true as const };
}

export async function saveTest(formData: FormData) {
  const faculty = await requireFaculty();
  try {
    const id = optional(formData, "id");
    const classId = str(formData, "classId");
    const batchId = optional(formData, "batchId");
    const name = str(formData, "name");
    const subjectName = str(formData, "subjectName");
    const testDate = parseDateOnly(str(formData, "testDate"));
    const startTime = str(formData, "startTime");
    const durationMin = Number(str(formData, "durationMin") || 0);
    const totalMarks = Number(str(formData, "totalMarks") || 100);
    if (!name || !classId || !subjectName || !testDate || !startTime || durationMin < 1) {
      return { ok: false as const, error: "Enter the test name, subject, class, date, time and duration." };
    }
    if (!(await facultyAllows(faculty.id, classId, batchId))) return { ok: false as const, error: "You can schedule tests only for your classes." };
    const existing = id ? await prisma.testExam.findUnique({ where: { id } }) : null;
    if (existing && existing.facultyId !== faculty.id) return { ok: false as const, error: "You can edit only your own tests." };
    const data = {
      name,
      subjectName,
      classId,
      batchId,
      testDate,
      startTime,
      durationMin,
      totalMarks,
      syllabus: optional(formData, "syllabus"),
      instructions: optional(formData, "instructions"),
      facultyId: faculty.id,
      status: "scheduled" as const,
    };
    const test = existing ? await prisma.testExam.update({ where: { id }, data }) : await prisma.testExam.create({ data });
    const recipients = await studentsForAssignment(classId, batchId, []);
    await notifyMany(
      recipients.map((student) => ({
        role: "student",
        userRecordId: student.id,
        title: "Test scheduled",
        body: `${test.name} · ${test.subjectName}`,
        href: "/student/tests",
        dedupeKey: `test:${test.id}:${student.id}`,
      })),
    );
    await logActivity({
      actorRole: "faculty",
      actorId: faculty.id,
      action: existing ? "Updated test" : "Created test",
      entity: "test",
      entityId: test.id,
      details: test.name,
    });
    refresh();
    return { ok: true as const, id: test.id };
  } catch (error) {
    return { ok: false as const, error: error instanceof Error ? error.message : "Could not save the test." };
  }
}

export async function cancelTest(id: string) {
  const faculty = await requireFaculty();
  const test = await prisma.testExam.findUnique({ where: { id } });
  if (!test || test.facultyId !== faculty.id) return { ok: false as const, error: "Test not found." };
  await prisma.testExam.update({ where: { id }, data: { status: "cancelled" } });
  await logActivity({ actorRole: "faculty", actorId: faculty.id, action: "Cancelled test", entity: "test", entityId: id, details: test.name });
  refresh();
  return { ok: true as const };
}

export async function saveMarks(formData: FormData) {
  const faculty = await requireFaculty();
  const testId = str(formData, "testId");
  const test = await prisma.testExam.findUnique({ where: { id: testId } });
  if (!test || test.facultyId !== faculty.id) return { ok: false as const, error: "Test not found." };
  if (!(await facultyAllows(faculty.id, test.classId, test.batchId))) return { ok: false as const, error: "You cannot edit these marks." };
  const students = await studentsForAssignment(test.classId, test.batchId, []);
  const writes = [];
  const notifications = [];
  for (const student of students) {
    const raw = str(formData, `mark_${student.id}`);
    if (raw === "") continue;
    const marks = Number(raw);
    if (!Number.isFinite(marks) || marks < 0 || marks > test.totalMarks) {
      return { ok: false as const, error: `Marks must be between 0 and ${test.totalMarks}.` };
    }
    const feedback = optional(formData, `feedback_${student.id}`);
    writes.push(
      prisma.testMark.upsert({
        where: { testId_studentId: { testId, studentId: student.id } },
        update: { marks, total: test.totalMarks, feedback },
        create: { testId, studentId: student.id, marks, total: test.totalMarks, feedback },
      }),
    );
    notifications.push({
      role: "student",
      userRecordId: student.id,
      title: "Marks published",
      body: `${test.name}: ${marks}/${test.totalMarks}`,
      href: "/student/performance",
      dedupeKey: `mark:${test.id}:${student.id}:${marks}`,
    });
  }
  await prisma.$transaction(writes);
  await notifyMany(notifications);
  await logActivity({ actorRole: "faculty", actorId: faculty.id, action: "Saved marks", entity: "test", entityId: test.id, details: test.name });
  refresh();
  return { ok: true as const };
}
