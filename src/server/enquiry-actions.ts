"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { logActivity, notifyMany } from "@/lib/activity";
import { requireAdmin } from "@/lib/auth";
import { optional, str } from "@/lib/form";
import { generateCode } from "@/lib/password";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

function refresh() {
  revalidatePath("/", "layout");
}

const enquirySchema = z.object({
  studentName: z.string().trim().min(2, "Enter the student's full name.").max(120),
  parentName: z.string().trim().min(2, "Enter the parent or guardian name.").max(120),
  mobile: z.string().trim().regex(/^[0-9+\-\s]{10,16}$/, "Enter a valid mobile number."),
  email: z.string().trim().email("Enter a valid email address.").or(z.literal("")).optional(),
  standard: z.string().trim().min(1, "Select a standard."),
  board: z.enum(["GSEB", "CBSE"]),
  stream: z.string().optional(),
  previousSchool: z.string().trim().max(200).optional(),
  message: z.string().trim().max(2000).optional(),
});

async function tooMany(key: string, limit: number, windowMs: number) {
  const since = new Date(Date.now() - windowMs);
  const count = await prisma.loginAttempt.count({ where: { key, createdAt: { gte: since } } });
  return count >= limit;
}

export async function submitEnquiry(_prev: { error: string; code: string }, formData: FormData) {
  const headerStore = await headers();
  const ip = headerStore.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  const key = `enquiry:${ip}`;
  if (await tooMany(key, 6, 60 * 60 * 1000)) {
    return { error: "Too many enquiries from this connection. Please call or use WhatsApp.", code: "" };
  }
  const parsed = enquirySchema.safeParse({
    studentName: str(formData, "studentName"),
    parentName: str(formData, "parentName"),
    mobile: str(formData, "mobile"),
    email: str(formData, "email"),
    standard: str(formData, "standard"),
    board: str(formData, "board"),
    stream: str(formData, "stream"),
    previousSchool: str(formData, "previousSchool"),
    message: str(formData, "message"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message || "Please check the form.", code: "" };
  const level = Number(parsed.data.standard.replace(/\D/g, ""));
  if (level >= 11 && parsed.data.stream !== "PCM" && parsed.data.stream !== "PCB") {
    return { error: "Select PCM or PCB for Standard 11 and 12.", code: "" };
  }
  const count = await prisma.admissionEnquiry.count();
  const enquiryCode = generateCode(`VT-ENQ-${new Date().getFullYear()}-`, count);
  const enquiry = await prisma.admissionEnquiry.create({
    data: {
      enquiryCode,
      source: "admission",
      studentName: parsed.data.studentName,
      parentName: parsed.data.parentName,
      mobile: parsed.data.mobile,
      email: parsed.data.email || null,
      standard: parsed.data.standard,
      board: parsed.data.board,
      stream: level >= 11 ? parsed.data.stream : null,
      previousSchool: parsed.data.previousSchool || null,
      message: parsed.data.message || null,
      status: "New",
    },
  });
  await prisma.loginAttempt.create({ data: { key } });
  const admins = await prisma.admin.findMany({ select: { id: true } });
  await notifyMany(
    admins.map((admin) => ({
      role: "admin",
      userRecordId: admin.id,
      title: "New admission enquiry",
      body: `${enquiry.studentName} · ${enquiry.enquiryCode}`,
      href: "/admin/enquiries",
      dedupeKey: `enquiry:${enquiry.id}:${admin.id}`,
    })),
  );
  return { error: "", code: enquiry.enquiryCode };
}

export async function submitContact(_prev: { error: string; code: string }, formData: FormData) {
  const headerStore = await headers();
  const ip = headerStore.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  const key = `contact:${ip}`;
  if (await tooMany(key, 6, 60 * 60 * 1000)) return { error: "Please wait a while before sending another message.", code: "" };
  const name = str(formData, "name");
  const mobile = str(formData, "mobile");
  const email = str(formData, "email");
  const message = str(formData, "message");
  if (name.length < 2) return { error: "Enter your name.", code: "" };
  if (!/^[0-9+\-\s]{10,16}$/.test(mobile)) return { error: "Enter a valid mobile number.", code: "" };
  if (message.length < 5) return { error: "Enter a short message.", code: "" };
  const count = await prisma.admissionEnquiry.count();
  const enquiryCode = generateCode(`VT-ENQ-${new Date().getFullYear()}-`, count);
  const enquiry = await prisma.admissionEnquiry.create({
    data: {
      enquiryCode,
      source: "contact",
      studentName: name,
      mobile,
      email: email || null,
      message,
      standard: "Contact",
      status: "New",
    },
  });
  await prisma.loginAttempt.create({ data: { key } });
  const admins = await prisma.admin.findMany({ select: { id: true } });
  await notifyMany(
    admins.map((admin) => ({
      role: "admin",
      userRecordId: admin.id,
      title: "New contact message",
      body: `${name} · ${enquiryCode}`,
      href: "/admin/enquiries",
      dedupeKey: `enquiry:${enquiry.id}:${admin.id}`,
    })),
  );
  return { error: "", code: enquiry.enquiryCode };
}

export async function updateEnquiry(formData: FormData) {
  await requireAdmin();
  const id = str(formData, "id");
  const status = str(formData, "status");
  const allowed = ["New", "Contacted", "Interested", "Admitted", "Rejected"];
  if (!allowed.includes(status)) return { ok: false as const, error: "Choose a valid status." };
  await prisma.admissionEnquiry.update({
    where: { id },
    data: { status, remarks: optional(formData, "remarks") },
  });
  refresh();
  return { ok: true as const };
}
