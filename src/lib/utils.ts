import clsx, { type ClassValue } from "clsx";

export function cn(...values: ClassValue[]) {
  return clsx(values);
}

export function one(value?: string | string[]) {
  return (Array.isArray(value) ? value[0] : value || "").trim();
}

export function formatDate(value?: Date | string | null) {
  if (!value) return "—";
  const date = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("en-IN", {
    timeZone: "Asia/Kolkata",
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

export function formatDateTime(value?: Date | string | null) {
  if (!value) return "—";
  const date = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("en-IN", {
    timeZone: "Asia/Kolkata",
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export function toDateInput(value?: Date | string | null) {
  if (!value) return "";
  const date = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

export function toDateTimeLocal(value?: Date | string | null) {
  if (!value) return "";
  const date = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return "";
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(date);
  const pick = (type: string) => parts.find((part) => part.type === type)?.value || "";
  return `${pick("year")}-${pick("month")}-${pick("day")}T${pick("hour")}:${pick("minute")}`;
}

export function parseDateOnly(value: string | null | undefined) {
  if (!value) return null;
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  return new Date(Date.UTC(year, month - 1, day, 6, 30, 0));
}

export function parseDateTimeLocal(value: string | null | undefined) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date;
}

export function digitsPhone(phone: string) {
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 10) return `91${digits}`;
  return digits;
}

export function whatsAppLink(phone: string, text?: string) {
  const base = `https://wa.me/${digitsPhone(phone)}`;
  return text ? `${base}?text=${encodeURIComponent(text)}` : base;
}

export function safeHref(href: string | null | undefined, fallback = "/") {
  if (!href) return fallback;
  if (href.startsWith("/") && !href.startsWith("//")) return href;
  try {
    const url = new URL(href);
    if (url.protocol === "http:" || url.protocol === "https:") return href;
  } catch {
    return fallback;
  }
  return fallback;
}

export function safePortalNext(role: "admin" | "faculty" | "student", value?: string | null) {
  if (!value) return null;
  if (value.includes("://") || value.includes("\\") || value.startsWith("//")) return null;
  if (!value.startsWith(`/${role}/`)) return null;
  return value;
}

export function pageCount(total: number, size: number) {
  return Math.max(1, Math.ceil(total / size));
}

export function parsePage(value?: string) {
  const page = Number(value || 1);
  return Number.isFinite(page) && page > 0 ? Math.floor(page) : 1;
}

export function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export function slugUser(name: string) {
  const base = name.toLowerCase().replace(/[^a-z0-9]+/g, ".").replace(/^\.|\.$/g, "");
  return base || "user";
}

export function percent(marks: number, total: number) {
  if (!total) return 0;
  return Math.round((marks / total) * 1000) / 10;
}

export function fileHref(stored?: string | null) {
  if (!stored) return null;
  if (stored.startsWith("/")) return stored;
  return `/api/files?p=${encodeURIComponent(stored)}`;
}

export function isSenior(className?: string | null) {
  const level = Number((className || "").replace(/\D/g, ""));
  return level >= 11;
}
