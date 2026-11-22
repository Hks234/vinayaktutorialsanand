"use server";

import bcrypt from "bcryptjs";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { logActivity } from "@/lib/activity";
import { createSession, destroySession, getSession, requireAdmin } from "@/lib/auth";
import { passwordError, str } from "@/lib/form";
import { prisma } from "@/lib/prisma";
import { safePortalNext } from "@/lib/utils";
import type { Role } from "@/lib/auth";

async function clientKey(role: string, userId: string) {
  const headerStore = await headers();
  const forwarded = headerStore.get("x-forwarded-for")?.split(",")[0]?.trim();
  const ip = forwarded || headerStore.get("x-real-ip") || "local";
  return `${ip}:${role}:${userId.toLowerCase()}`;
}

export async function loginAction(_prev: { error: string }, formData: FormData) {
  const role = str(formData, "role");
  const userId = str(formData, "userId");
  const password = String(formData.get("password") ?? "");
  if (role !== "admin" && role !== "faculty" && role !== "student") return { error: "Sign-in could not be started." };
  if (!userId || !password) return { error: "Enter your user ID and password." };

  const key = await clientKey(role, userId);
  const since = new Date(Date.now() - 15 * 60 * 1000);
  const attempts = await prisma.loginAttempt.count({ where: { key, createdAt: { gte: since } } });
  if (attempts >= 8) return { error: "Too many attempts. Please wait 15 minutes and try again." };

  const fail = async () => {
    await prisma.loginAttempt.create({ data: { key } });
    return { error: "Invalid user ID or password." };
  };

  if (role === "admin") {
    const admin = await prisma.admin.findUnique({ where: { userId } });
    if (!admin || !(await bcrypt.compare(password, admin.passwordHash))) return fail();
    await prisma.loginAttempt.deleteMany({ where: { key } });
    await createSession("admin", admin.id, admin.mustChangePassword);
    await logActivity({ actorRole: "admin", actorId: admin.id, action: "Signed in", entity: "admin", entityId: admin.id });
    redirect(admin.mustChangePassword ? "/admin/settings" : safePortalNext("admin", str(formData, "next")) || "/admin/dashboard");
  }

  if (role === "faculty") {
    const faculty = await prisma.faculty.findUnique({ where: { userId } });
    if (!faculty || faculty.deletedAt || !faculty.passwordHash) return fail();
    if (faculty.status !== "active") return { error: "This faculty account is inactive. Contact the admin." };
    if (!(await bcrypt.compare(password, faculty.passwordHash))) return fail();
    await prisma.loginAttempt.deleteMany({ where: { key } });
    await createSession("faculty", faculty.id, faculty.mustChangePassword);
    await logActivity({ actorRole: "faculty", actorId: faculty.id, action: "Signed in", entity: "faculty", entityId: faculty.id });
    redirect(faculty.mustChangePassword ? "/faculty/settings" : safePortalNext("faculty", str(formData, "next")) || "/faculty/dashboard");
  }

  const student = await prisma.student.findUnique({ where: { userId } });
  if (!student || student.deletedAt) return fail();
  if (student.status !== "active") return { error: "This student account is inactive. Contact the institute." };
  if (!(await bcrypt.compare(password, student.passwordHash))) return fail();
  await prisma.loginAttempt.deleteMany({ where: { key } });
  await createSession("student", student.id, student.mustChangePassword);
  await logActivity({ actorRole: "student", actorId: student.id, action: "Signed in", entity: "student", entityId: student.id });
  redirect(student.mustChangePassword ? "/student/settings" : safePortalNext("student", str(formData, "next")) || "/student/dashboard");
}

export async function logoutAction() {
  await destroySession();
  redirect("/");
}

async function hashPassword(password: string) {
  return bcrypt.hash(password, 12);
}

export async function changeOwnPassword(_prev: { error: string; ok: string }, formData: FormData) {
  const session = await getSession();
  if (!session) return { error: "Your session has ended. Sign in again.", ok: "" };
  const current = String(formData.get("current") ?? "");
  const next = String(formData.get("next") ?? "");
  const confirm = String(formData.get("confirm") ?? "");
  const issue = passwordError(next);
  if (issue) return { error: issue, ok: "" };
  if (next !== confirm) return { error: "New passwords do not match.", ok: "" };

  const role = session.role as Role;
  const record =
    role === "admin"
      ? await prisma.admin.findUnique({ where: { id: session.userId } })
      : role === "faculty"
        ? await prisma.faculty.findUnique({ where: { id: session.userId } })
        : await prisma.student.findUnique({ where: { id: session.userId } });
  if (!record || !("passwordHash" in record) || !record.passwordHash) return { error: "Account not found.", ok: "" };
  if (!(await bcrypt.compare(current, record.passwordHash))) return { error: "Current password is incorrect.", ok: "" };

  const passwordHash = await hashPassword(next);
  if (role === "admin") {
    await prisma.admin.update({ where: { id: record.id }, data: { passwordHash, mustChangePassword: false } });
  } else if (role === "faculty") {
    await prisma.faculty.update({
      where: { id: record.id },
      data: { passwordHash, mustChangePassword: false, lastPasswordResetAt: new Date() },
    });
  } else {
    await prisma.student.update({
      where: { id: record.id },
      data: { passwordHash, mustChangePassword: false, lastPasswordResetAt: new Date() },
    });
  }
  await prisma.session.deleteMany({ where: { role, userId: record.id } });
  await prisma.passwordResetLog.create({ data: { role, targetId: record.id, actorId: record.id } });
  await createSession(role, record.id, false);
  await logActivity({ actorRole: role, actorId: record.id, action: "Changed password", entity: role, entityId: record.id });
  return { error: "", ok: "Password updated. Use the new password next time you sign in." };
}

export async function changeAdminUserId(_prev: { error: string; ok: string }, formData: FormData) {
  const admin = await requireAdmin();
  const userId = str(formData, "userId");
  const name = str(formData, "name");
  if (userId.length < 4) return { error: "User ID must be at least 4 characters.", ok: "" };
  const existing = await prisma.admin.findUnique({ where: { userId } });
  if (existing && existing.id !== admin.id) return { error: "That user ID is already in use.", ok: "" };
  await prisma.admin.update({ where: { id: admin.id }, data: { userId, name: name || admin.name } });
  await logActivity({
    actorRole: "admin",
    actorId: admin.id,
    action: "Updated admin profile",
    entity: "admin",
    entityId: admin.id,
    details: userId,
  });
  return { error: "", ok: "Admin profile updated." };
}
