import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

export type Role = "admin" | "faculty" | "student";

export type SessionPayload = {
  sid: string;
  role: Role;
  sub: string;
  mpc: boolean;
};

function secret() {
  const value = process.env.AUTH_SECRET;
  if (!value || value.length < 16) throw new Error("AUTH_SECRET is missing. Run npm run setup.");
  return new TextEncoder().encode(value);
}

export async function signSession(payload: SessionPayload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("12h")
    .sign(secret());
}

export async function verifySessionToken(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secret());
    const role = payload.role;
    if (role !== "admin" && role !== "faculty" && role !== "student") return null;
    if (typeof payload.sid !== "string" || typeof payload.sub !== "string") return null;
    return { sid: payload.sid, role, sub: payload.sub, mpc: Boolean(payload.mpc) };
  } catch {
    return null;
  }
}

export async function createSession(role: Role, userId: string, mustChangePassword: boolean) {
  const session = await prisma.session.create({
    data: {
      role,
      userId,
      expiresAt: new Date(Date.now() + 12 * 60 * 60 * 1000),
    },
  });
  const token = await signSession({ sid: session.id, role, sub: userId, mpc: mustChangePassword });
  const jar = await cookies();
  jar.set("vt_session", token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.COOKIE_SECURE === "true",
    path: "/",
    maxAge: 60 * 60 * 12,
  });
}

export async function clearSessionCookie() {
  const jar = await cookies();
  jar.delete("vt_session");
}

export async function getSession() {
  const token = (await cookies()).get("vt_session")?.value;
  if (!token) return null;
  const payload = await verifySessionToken(token);
  if (!payload) return null;
  const session = await prisma.session.findUnique({ where: { id: payload.sid } });
  if (!session || session.expiresAt.getTime() < Date.now()) return null;
  if (session.role !== payload.role || session.userId !== payload.sub) return null;
  return session;
}

export async function destroySession() {
  const session = await getSession();
  if (session) {
    await prisma.session.delete({ where: { id: session.id } }).catch(() => undefined);
  }
  await clearSessionCookie();
}

export async function requireAdmin() {
  const session = await getSession();
  if (!session || session.role !== "admin") redirect("/admin/login");
  const admin = await prisma.admin.findUnique({ where: { id: session.userId } });
  if (!admin) redirect("/admin/login");
  return admin;
}

export async function requireFaculty() {
  const session = await getSession();
  if (!session || session.role !== "faculty") redirect("/faculty/login");
  const faculty = await prisma.faculty.findUnique({
    where: { id: session.userId },
    include: { subjects: { include: { subject: true } }, classes: { include: { class: true, batch: true } } },
  });
  if (!faculty || faculty.deletedAt || faculty.status !== "active" || !faculty.passwordHash) redirect("/faculty/login");
  return faculty;
}

export async function requireStudent() {
  const session = await getSession();
  if (!session || session.role !== "student") redirect("/student/login");
  const student = await prisma.student.findUnique({
    where: { id: session.userId },
    include: {
      class: true,
      batch: true,
      subjects: { include: { subject: true } },
      mentors: { include: { faculty: true } },
    },
  });
  if (!student || student.deletedAt || student.status !== "active") redirect("/student/login");
  return student;
}

export async function portalIdentity(role: Role) {
  if (role === "admin") {
    const admin = await requireAdmin();
    return {
      role,
      id: admin.id,
      userId: admin.userId,
      name: admin.name,
      photo: null as string | null,
      mustChangePassword: admin.mustChangePassword,
      subtitle: "Institute administrator",
    };
  }
  if (role === "faculty") {
    const faculty = await requireFaculty();
    return {
      role,
      id: faculty.id,
      userId: faculty.userId || faculty.facultyCode,
      name: faculty.name,
      photo: faculty.photoPath,
      mustChangePassword: faculty.mustChangePassword,
      subtitle: faculty.subjects.map((item) => item.subject.name).join(", ") || "Faculty",
    };
  }
  const student = await requireStudent();
  return {
    role,
    id: student.id,
    userId: student.userId,
    name: student.fullName,
    photo: student.photoPath,
    mustChangePassword: student.mustChangePassword,
    subtitle: [student.class?.name, student.batch?.name].filter(Boolean).join(" · ") || "Student",
  };
}
