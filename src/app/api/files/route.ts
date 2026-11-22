import { readFile } from "fs/promises";
import path from "path";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { facultyNoticeWhere, homeworkWhereForStudent, publicNoticeWhere, studentNoticeWhere } from "@/lib/visibility";

function contentType(filePath: string) {
  const ext = path.extname(filePath).toLowerCase();
  if (ext === ".pdf") return "application/pdf";
  if (ext === ".png") return "image/png";
  if (ext === ".webp") return "image/webp";
  if (ext === ".gif") return "image/gif";
  return "image/jpeg";
}

async function allowed(role: string, userId: string, stored: string) {
  if (role === "admin") return true;
  const homework = await prisma.homework.findFirst({ where: { attachmentPath: stored, deletedAt: null } });
  if (homework) {
    if (role === "faculty") return homework.facultyId === userId;
    if (role === "student") {
      const student = await prisma.student.findUnique({ where: { id: userId } });
      if (!student) return false;
      const match = await prisma.homework.findFirst({ where: { id: homework.id, ...homeworkWhereForStudent(student) } });
      return Boolean(match);
    }
  }
  const submission = await prisma.homeworkSubmission.findFirst({
    where: { attachmentPath: stored },
    include: { homework: true },
  });
  if (submission) {
    if (role === "student") return submission.studentId === userId;
    if (role === "faculty") return submission.homework.facultyId === userId;
  }
  const notice = await prisma.notice.findFirst({ where: { attachmentPath: stored, deletedAt: null } });
  if (notice) {
    if (role === "faculty") {
      const visible = await prisma.notice.findFirst({ where: { id: notice.id, ...facultyNoticeWhere() } });
      return Boolean(visible);
    }
    if (role === "student") {
      const student = await prisma.student.findUnique({ where: { id: userId } });
      const visible = await prisma.notice.findFirst({ where: { id: notice.id, ...studentNoticeWhere(student?.classId) } });
      return Boolean(visible);
    }
  }
  return false;
}

export async function GET(request: Request) {
  const stored = new URL(request.url).searchParams.get("p") || "";
  if (!stored.startsWith("private/") || stored.includes("..") || stored.includes("\\")) {
    return new Response("Not found", { status: 404 });
  }
  const session = await getSession();
  if (!session) {
    const notice = await prisma.notice.findFirst({ where: { attachmentPath: stored, ...publicNoticeWhere() } });
    if (!notice) return new Response("Sign in required", { status: 401 });
  } else if (!(await allowed(session.role, session.userId, stored))) {
    return new Response("Forbidden", { status: 403 });
  }
  const root = path.join(process.cwd(), "storage");
  const abs = path.resolve(root, stored);
  if (!abs.startsWith(root)) return new Response("Not found", { status: 404 });
  try {
    const bytes = await readFile(abs);
    return new Response(bytes, {
      headers: {
        "Content-Type": contentType(abs),
        "Content-Disposition": "inline",
        "X-Content-Type-Options": "nosniff",
        "Cache-Control": "private, no-store",
      },
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
