"use server";

import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { logActivity } from "@/lib/activity";
import { requireAdmin } from "@/lib/auth";
import { many, optional, str } from "@/lib/form";
import { generateCode, generatePassword } from "@/lib/password";
import { prisma } from "@/lib/prisma";
import { isSenior, slugUser } from "@/lib/utils";
import { takePublicUpload } from "@/lib/uploads";

function refresh() {
  revalidatePath("/", "layout");
}

async function uniqueUserId(base: string) {
  let candidate = base.slice(0, 24);
  for (let i = 0; i < 20; i += 1) {
    const taken = await prisma.student.findUnique({ where: { userId: candidate } });
    const facultyTaken = await prisma.faculty.findUnique({ where: { userId: candidate } });
    const adminTaken = await prisma.admin.findUnique({ where: { userId: candidate } });
    if (!taken && !facultyTaken && !adminTaken) return candidate;
    candidate = `${base.slice(0, 18)}.${generatePassword(3).toLowerCase()}`;
  }
  return `${base}.${Date.now()}`;
}

export async function createStudent(formData: FormData) {
  const admin = await requireAdmin();
  try {
    const fullName = str(formData, "fullName");
    const classId = str(formData, "classId");
    const board = str(formData, "board");
    if (fullName.length < 2) return { ok: false as const, error: "Enter the student's full name." };
    if (!classId) return { ok: false as const, error: "Select a class." };
    const classGroup = await prisma.classGroup.findUnique({ where: { id: classId } });
    if (!classGroup) return { ok: false as const, error: "Selected class was not found." };
    const stream = optional(formData, "stream");
    if (isSenior(classGroup.name) && stream !== "PCM" && stream !== "PCB") {
      return { ok: false as const, error: "Select PCM or PCB for Standard 11 and 12." };
    }
    const batchId = optional(formData, "batchId");
    if (batchId) {
      const batch = await prisma.batch.findFirst({ where: { id: batchId, classId } });
      if (!batch) return { ok: false as const, error: "Selected batch does not belong to that class." };
    }
    const requestedUser = optional(formData, "userId");
    const userId = requestedUser || (await uniqueUserId(`stu.${slugUser(fullName)}`));
    const clash = await prisma.student.findUnique({ where: { userId } });
    if (clash) return { ok: false as const, error: "That user ID is already in use." };
    const password = generatePassword(10);
    const count = await prisma.student.count();
    const year = await prisma.academicYear.findFirst({ where: { isCurrent: true } });
    const photoPath = await takePublicUpload(formData, "photo", "students");
    const student = await prisma.student.create({
      data: {
        studentCode: generateCode("VT-S-", count),
        userId,
        passwordHash: await bcrypt.hash(password, 12),
        mustChangePassword: true,
        fullName,
        parentName: optional(formData, "parentName"),
        mobile: optional(formData, "mobile"),
        email: optional(formData, "email"),
        photoPath,
        classId,
        batchId,
        board: board === "CBSE" ? "CBSE" : "GSEB",
        stream: isSenior(classGroup.name) ? stream : null,
        previousSchool: optional(formData, "previousSchool"),
        status: "active",
        lastPasswordResetAt: new Date(),
      },
    });
    await prisma.studentClassAssignment.create({
      data: { studentId: student.id, classId, batchId, academicYearId: year?.id, isCurrent: true },
    });
    const subjectIds = many(formData, "subjectIds");
    if (subjectIds.length) {
      await prisma.studentSubjectAssignment.createMany({
        data: subjectIds.map((subjectId) => ({ studentId: student.id, subjectId })),
      });
    }
    const facultyIds = many(formData, "facultyIds");
    if (facultyIds.length) {
      await prisma.studentFacultyAssignment.createMany({
        data: facultyIds.map((facultyId) => ({ studentId: student.id, facultyId })),
      });
    }
    await logActivity({
      actorRole: "admin",
      actorId: admin.id,
      action: "Created student",
      entity: "student",
      entityId: student.id,
      details: `${student.fullName} · ${student.userId}`,
    });
    refresh();
    return { ok: true as const, userId, password, code: student.studentCode, name: student.fullName };
  } catch (error) {
    return { ok: false as const, error: error instanceof Error ? error.message : "Could not create the student." };
  }
}

export async function updateStudent(formData: FormData) {
  const admin = await requireAdmin();
  try {
    const id = str(formData, "id");
    const existing = await prisma.student.findUnique({ where: { id } });
    if (!existing) return { ok: false as const, error: "Student not found." };
    const fullName = str(formData, "fullName");
    const classId = optional(formData, "classId");
    const classGroup = classId ? await prisma.classGroup.findUnique({ where: { id: classId } }) : null;
    const stream = optional(formData, "stream");
    if (classGroup && isSenior(classGroup.name) && stream !== "PCM" && stream !== "PCB") {
      return { ok: false as const, error: "Select PCM or PCB for Standard 11 and 12." };
    }
    const userId = str(formData, "userId");
    if (userId.length < 3) return { ok: false as const, error: "Enter a user ID." };
    const clash = await prisma.student.findUnique({ where: { userId } });
    if (clash && clash.id !== id) return { ok: false as const, error: "That user ID is already in use." };
    const batchId = optional(formData, "batchId");
    let photoPath = existing.photoPath;
    photoPath = (await takePublicUpload(formData, "photo", "students")) || photoPath;
    await prisma.student.update({
      where: { id },
      data: {
        fullName,
        userId,
        parentName: optional(formData, "parentName"),
        mobile: optional(formData, "mobile"),
        email: optional(formData, "email"),
        photoPath,
        classId,
        batchId,
        board: str(formData, "board") === "CBSE" ? "CBSE" : "GSEB",
        stream: classGroup && isSenior(classGroup.name) ? stream : null,
        previousSchool: optional(formData, "previousSchool"),
        status: str(formData, "status") === "inactive" ? "inactive" : "active",
      },
    });
    if (classId && (classId !== existing.classId || batchId !== existing.batchId)) {
      await prisma.studentClassAssignment.updateMany({ where: { studentId: id, isCurrent: true }, data: { isCurrent: false } });
      const year = await prisma.academicYear.findFirst({ where: { isCurrent: true } });
      await prisma.studentClassAssignment.create({
        data: { studentId: id, classId, batchId, academicYearId: year?.id, isCurrent: true },
      });
    }
    await prisma.studentSubjectAssignment.deleteMany({ where: { studentId: id } });
    await prisma.studentFacultyAssignment.deleteMany({ where: { studentId: id } });
    const subjectIds = many(formData, "subjectIds");
    const facultyIds = many(formData, "facultyIds");
    if (subjectIds.length) {
      await prisma.studentSubjectAssignment.createMany({ data: subjectIds.map((subjectId) => ({ studentId: id, subjectId })) });
    }
    if (facultyIds.length) {
      await prisma.studentFacultyAssignment.createMany({ data: facultyIds.map((facultyId) => ({ studentId: id, facultyId })) });
    }
    if (str(formData, "status") === "inactive") {
      await prisma.session.deleteMany({ where: { role: "student", userId: id } });
    }
    await logActivity({ actorRole: "admin", actorId: admin.id, action: "Updated student", entity: "student", entityId: id, details: fullName });
    refresh();
    return { ok: true as const };
  } catch (error) {
    return { ok: false as const, error: error instanceof Error ? error.message : "Could not update the student." };
  }
}

export async function resetStudentPassword(studentId: string) {
  const admin = await requireAdmin();
  const student = await prisma.student.findUnique({ where: { id: studentId } });
  if (!student || student.deletedAt) return { ok: false as const, error: "Student not found." };
  const password = generatePassword(10);
  await prisma.student.update({
    where: { id: studentId },
    data: { passwordHash: await bcrypt.hash(password, 12), mustChangePassword: true, lastPasswordResetAt: new Date() },
  });
  await prisma.session.deleteMany({ where: { role: "student", userId: studentId } });
  await prisma.passwordResetLog.create({ data: { role: "student", targetId: studentId, actorId: admin.id } });
  await logActivity({
    actorRole: "admin",
    actorId: admin.id,
    action: "Reset student password",
    entity: "student",
    entityId: studentId,
    details: student.userId,
  });
  refresh();
  return { ok: true as const, userId: student.userId, password, code: student.studentCode, name: student.fullName };
}

export async function deactivateStudent(studentId: string) {
  const admin = await requireAdmin();
  const student = await prisma.student.findUnique({ where: { id: studentId } });
  if (!student) return { ok: false as const, error: "Student not found." };
  await prisma.student.update({ where: { id: studentId }, data: { status: "inactive", deletedAt: new Date() } });
  await prisma.session.deleteMany({ where: { role: "student", userId: studentId } });
  await logActivity({
    actorRole: "admin",
    actorId: admin.id,
    action: "Deactivated student",
    entity: "student",
    entityId: studentId,
    details: student.fullName,
  });
  refresh();
  return { ok: true as const };
}

export async function createFacultyAccount(formData: FormData) {
  const admin = await requireAdmin();
  try {
    const name = str(formData, "name");
    if (name.length < 2) return { ok: false as const, error: "Enter the faculty name." };
    const requested = optional(formData, "userId");
    const userId = requested || (await uniqueFacultyUser(`fac.${slugUser(name)}`));
    const password = generatePassword(10);
    const count = await prisma.faculty.count();
    const photoPath = await takePublicUpload(formData, "photo", "faculty");
    const faculty = await prisma.faculty.create({
      data: {
        facultyCode: generateCode("VT-F-", count),
        userId,
        passwordHash: await bcrypt.hash(password, 12),
        mustChangePassword: true,
        name,
        qualifications: optional(formData, "qualifications"),
        description: optional(formData, "description"),
        photoPath,
        phone: optional(formData, "phone"),
        email: optional(formData, "email"),
        visibleOnWebsite: formData.get("visibleOnWebsite") === "on",
        status: "active",
        displayOrder: Number(str(formData, "displayOrder") || 0),
        lastPasswordResetAt: new Date(),
      },
    });
    await syncFacultyLinks(faculty.id, many(formData, "subjectIds"), many(formData, "classIds"), optional(formData, "batchId"));
    await logActivity({
      actorRole: "admin",
      actorId: admin.id,
      action: "Created faculty",
      entity: "faculty",
      entityId: faculty.id,
      details: `${faculty.name} · ${userId}`,
    });
    refresh();
    return { ok: true as const, userId, password, code: faculty.facultyCode, name: faculty.name };
  } catch (error) {
    return { ok: false as const, error: error instanceof Error ? error.message : "Could not create the faculty account." };
  }
}

async function uniqueFacultyUser(base: string) {
  let candidate = base.slice(0, 24);
  for (let i = 0; i < 20; i += 1) {
    const facultyTaken = await prisma.faculty.findUnique({ where: { userId: candidate } });
    const studentTaken = await prisma.student.findUnique({ where: { userId: candidate } });
    const adminTaken = await prisma.admin.findUnique({ where: { userId: candidate } });
    if (!facultyTaken && !studentTaken && !adminTaken) return candidate;
    candidate = `${base.slice(0, 18)}.${generatePassword(3).toLowerCase()}`;
  }
  return `${base}.${Date.now()}`;
}

async function syncFacultyLinks(facultyId: string, subjectIds: string[], classIds: string[], batchId?: string | null) {
  const linkedBatch = batchId || null;
  await prisma.facultySubjectAssignment.deleteMany({ where: { facultyId } });
  await prisma.facultyClassAssignment.deleteMany({ where: { facultyId } });
  if (subjectIds.length) {
    await prisma.facultySubjectAssignment.createMany({ data: subjectIds.map((subjectId) => ({ facultyId, subjectId })) });
  }
  if (classIds.length) {
    await prisma.facultyClassAssignment.createMany({
      data: classIds.map((classId) => ({ facultyId, classId, batchId: linkedBatch })),
    });
  }
}

export async function updateFaculty(formData: FormData) {
  const admin = await requireAdmin();
  try {
    const id = str(formData, "id");
    const existing = await prisma.faculty.findUnique({ where: { id } });
    if (!existing) return { ok: false as const, error: "Faculty record not found." };
    const userId = optional(formData, "userId");
    if (userId) {
      const clash = await prisma.faculty.findUnique({ where: { userId } });
      if (clash && clash.id !== id) return { ok: false as const, error: "That user ID is already in use." };
    }
    let photoPath = existing.photoPath;
    photoPath = (await takePublicUpload(formData, "photo", "faculty")) || photoPath;
    await prisma.faculty.update({
      where: { id },
      data: {
        name: str(formData, "name"),
        userId,
        qualifications: optional(formData, "qualifications"),
        description: optional(formData, "description"),
        photoPath,
        phone: optional(formData, "phone"),
        email: optional(formData, "email"),
        visibleOnWebsite: formData.get("visibleOnWebsite") === "on",
        status: str(formData, "status") === "inactive" ? "inactive" : "active",
        displayOrder: Number(str(formData, "displayOrder") || 0),
      },
    });
    await syncFacultyLinks(id, many(formData, "subjectIds"), many(formData, "classIds"), optional(formData, "batchId"));
    if (str(formData, "status") === "inactive") {
      await prisma.session.deleteMany({ where: { role: "faculty", userId: id } });
    }
    await logActivity({ actorRole: "admin", actorId: admin.id, action: "Updated faculty", entity: "faculty", entityId: id });
    refresh();
    return { ok: true as const };
  } catch (error) {
    return { ok: false as const, error: error instanceof Error ? error.message : "Could not update faculty." };
  }
}

export async function saveFacultyPhoto(formData: FormData) {
  const admin = await requireAdmin();
  try {
    const id = str(formData, "id");
    const existing = await prisma.faculty.findUnique({ where: { id } });
    if (!existing || existing.deletedAt) return { ok: false as const, error: "Faculty record not found." };
    const photoPath = await takePublicUpload(formData, "photo", "faculty");
    if (!photoPath) return { ok: false as const, error: "Choose a photograph to upload." };
    await prisma.faculty.update({ where: { id }, data: { photoPath } });
    await logActivity({
      actorRole: "admin",
      actorId: admin.id,
      action: "Updated faculty photograph",
      entity: "faculty",
      entityId: id,
      details: existing.name,
    });
    refresh();
    return { ok: true as const };
  } catch (error) {
    return { ok: false as const, error: error instanceof Error ? error.message : "Could not save the photograph." };
  }
}

export async function grantFacultyLogin(facultyId: string) {
  const admin = await requireAdmin();
  const faculty = await prisma.faculty.findUnique({ where: { id: facultyId } });
  if (!faculty) return { ok: false as const, error: "Faculty record not found." };
  const userId = faculty.userId || (await uniqueFacultyUser(`fac.${slugUser(faculty.name)}`));
  const password = generatePassword(10);
  await prisma.faculty.update({
    where: { id: facultyId },
    data: {
      userId,
      passwordHash: await bcrypt.hash(password, 12),
      mustChangePassword: true,
      status: "active",
      lastPasswordResetAt: new Date(),
    },
  });
  await prisma.passwordResetLog.create({ data: { role: "faculty", targetId: facultyId, actorId: admin.id } });
  await logActivity({
    actorRole: "admin",
    actorId: admin.id,
    action: "Generated faculty password",
    entity: "faculty",
    entityId: facultyId,
    details: userId,
  });
  refresh();
  return { ok: true as const, userId, password, code: faculty.facultyCode, name: faculty.name };
}

export async function deactivateFaculty(facultyId: string) {
  const admin = await requireAdmin();
  await prisma.faculty.update({ where: { id: facultyId }, data: { status: "inactive", deletedAt: new Date(), visibleOnWebsite: false } });
  await prisma.session.deleteMany({ where: { role: "faculty", userId: facultyId } });
  await logActivity({ actorRole: "admin", actorId: admin.id, action: "Deactivated faculty", entity: "faculty", entityId: facultyId });
  refresh();
  return { ok: true as const };
}

export async function admitEnquiry(enquiryId: string) {
  const admin = await requireAdmin();
  const enquiry = await prisma.admissionEnquiry.findUnique({ where: { id: enquiryId } });
  if (!enquiry) return { ok: false as const, error: "Enquiry not found." };
  if (enquiry.status === "Admitted") return { ok: false as const, error: "This enquiry is already marked admitted." };
  if (!enquiry.standard || enquiry.standard === "Contact") {
    return { ok: false as const, error: "Choose a standard on the enquiry before creating a student." };
  }
  const classGroup = await prisma.classGroup.findFirst({ where: { name: enquiry.standard, deletedAt: null } });
  if (!classGroup) return { ok: false as const, error: "Create that class in Academics before admitting the student." };
  if (isSenior(classGroup.name) && enquiry.stream !== "PCM" && enquiry.stream !== "PCB") {
    return { ok: false as const, error: "Set PCM or PCB on this enquiry before admitting." };
  }
  const batch = await prisma.batch.findFirst({ where: { classId: classGroup.id, deletedAt: null }, orderBy: { name: "asc" } });
  const year = await prisma.academicYear.findFirst({ where: { isCurrent: true } });
  const userId = await uniqueUserId(`stu.${slugUser(enquiry.studentName)}`);
  const password = generatePassword(10);
  const count = await prisma.student.count();
  const student = await prisma.student.create({
    data: {
      studentCode: generateCode("VT-S-", count),
      userId,
      passwordHash: await bcrypt.hash(password, 12),
      mustChangePassword: true,
      fullName: enquiry.studentName,
      parentName: enquiry.parentName,
      mobile: enquiry.mobile,
      email: enquiry.email,
      classId: classGroup.id,
      batchId: batch?.id,
      board: enquiry.board === "CBSE" ? "CBSE" : "GSEB",
      stream: isSenior(classGroup.name) ? enquiry.stream : null,
      previousSchool: enquiry.previousSchool,
      status: "active",
      lastPasswordResetAt: new Date(),
    },
  });
  await prisma.studentClassAssignment.create({
    data: { studentId: student.id, classId: classGroup.id, batchId: batch?.id, academicYearId: year?.id, isCurrent: true },
  });
  await prisma.admissionEnquiry.update({
    where: { id: enquiryId },
    data: { status: "Admitted", remarks: [enquiry.remarks, `Student ${student.studentCode}`].filter(Boolean).join(" · ") },
  });
  await logActivity({
    actorRole: "admin",
    actorId: admin.id,
    action: "Admitted enquiry",
    entity: "student",
    entityId: student.id,
    details: `${enquiry.enquiryCode} · ${student.fullName}`,
  });
  refresh();
  return { ok: true as const, userId, password, code: student.studentCode, name: student.fullName };
}
