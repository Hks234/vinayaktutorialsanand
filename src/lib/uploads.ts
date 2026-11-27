import { mkdir, writeFile, unlink } from "fs/promises";
import path from "path";
import { randomBytes } from "crypto";
import { prisma } from "@/lib/prisma";

const imageMimes = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);
const docMimes = new Set([...imageMimes, "application/pdf"]);

export function asUpload(value: FormDataEntryValue | File | Blob | null | undefined) {
  if (!value || typeof value === "string") return null;
  const file = value as Blob;
  if (typeof file.size !== "number" || file.size <= 0) return null;
  if (typeof file.arrayBuffer !== "function") return null;
  return file;
}

export function getUpload(formData: FormData, key: string) {
  return asUpload(formData.get(key));
}

export function readUploadedPath(formData: FormData, key: string) {
  const url = String(formData.get(`${key}_url`) || "").trim();
  if (url.startsWith("/uploads/") || url.startsWith("/api/media/")) return url;
  if (url.startsWith("private/") && !url.includes("..") && !url.includes("\\")) return url;
  return null;
}

export async function takePublicUpload(formData: FormData, key: string, folder: string, kind: "image" | "doc" = "image") {
  const file = getUpload(formData, key);
  if (file) return savePublicFile(file, folder, kind);
  return readUploadedPath(formData, key);
}

export async function takePrivateUpload(formData: FormData, key: string, folder: string) {
  const file = getUpload(formData, key);
  if (file) return savePrivateFile(file, folder);
  const saved = readUploadedPath(formData, key);
  return saved?.startsWith("private/") ? saved : null;
}

function extensionFor(mime: string) {
  if (mime === "image/jpeg") return "jpg";
  if (mime === "image/png") return "png";
  if (mime === "image/webp") return "webp";
  if (mime === "image/gif") return "gif";
  if (mime === "application/pdf") return "pdf";
  return "bin";
}

function detectMime(bytes: Uint8Array, filename: string, reported: string) {
  const name = (filename || "").toLowerCase();
  let type = (reported || "").toLowerCase().trim();
  if (type === "image/jpg" || type === "image/pjpeg" || type === "image/jfif") type = "image/jpeg";
  if (type === "image/x-png") type = "image/png";
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return "image/jpeg";
  if (bytes.length >= 8 && bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47) return "image/png";
  if (bytes.length >= 6 && bytes[0] === 0x47 && bytes[1] === 0x49 && bytes[2] === 0x46) return "image/gif";
  if (bytes.length >= 12 && bytes[8] === 0x57 && bytes[9] === 0x45 && bytes[10] === 0x42 && bytes[11] === 0x50) return "image/webp";
  if (bytes.length >= 5 && bytes[0] === 0x25 && bytes[1] === 0x50 && bytes[2] === 0x44 && bytes[3] === 0x46) return "application/pdf";
  if (name.endsWith(".jpg") || name.endsWith(".jpeg") || name.endsWith(".jfif")) return "image/jpeg";
  if (name.endsWith(".png")) return "image/png";
  if (name.endsWith(".webp")) return "image/webp";
  if (name.endsWith(".gif")) return "image/gif";
  if (name.endsWith(".pdf")) return "application/pdf";
  return type;
}

async function persist(folder: string, mime: string, bytes: Buffer) {
  const name = `${Date.now()}-${randomBytes(6).toString("hex")}.${extensionFor(mime)}`;
  const dir = path.join(process.cwd(), "public", "uploads", folder);
  try {
    await mkdir(dir, { recursive: true });
    await writeFile(path.join(dir, name), bytes);
    return `/uploads/${folder}/${name}`;
  } catch (diskError) {
    try {
      const row = await prisma.mediaFile.create({
        data: { folder, filename: name, mime, payload: bytes.toString("base64") },
      });
      return `/api/media/${row.id}`;
    } catch (dbError) {
      const disk = diskError instanceof Error ? diskError.message : "disk write failed";
      const db = dbError instanceof Error ? dbError.message : "database write failed";
      throw new Error(`Could not store the image. ${disk}. ${db}`);
    }
  }
}

export async function savePublicFile(file: File | Blob | null, folder: string, kind: "image" | "doc" = "image") {
  if (!file || !file.size) return null;
  const buffer = Buffer.from(await file.arrayBuffer());
  const filename = "name" in file ? String((file as File).name || "") : "";
  const mime = detectMime(buffer, filename, file.type || "");
  if (mime.includes("heic") || mime.includes("heif") || filename.toLowerCase().endsWith(".heic") || filename.toLowerCase().endsWith(".heif")) {
    throw new Error("iPhone HEIC photos are not supported. Save or export the picture as JPG or PNG, then upload again.");
  }
  const allowed = kind === "doc" ? docMimes : new Set([...imageMimes, "application/pdf"]);
  if (!allowed.has(mime)) {
    throw new Error("Upload a JPG, PNG, WEBP, GIF or PDF file.");
  }
  const limit = kind === "image" ? 10 * 1024 * 1024 : 10 * 1024 * 1024;
  if (buffer.length > limit) throw new Error(kind === "image" ? "Image must be under 10 MB." : "File must be under 10 MB.");
  return persist(folder, mime, buffer);
}

export async function savePrivateFile(file: File | Blob | null, folder: string) {
  if (!file || !file.size) return null;
  const buffer = Buffer.from(await file.arrayBuffer());
  const mime = detectMime(buffer, "name" in file ? String(file.name || "") : "", file.type || "");
  if (!docMimes.has(mime)) throw new Error("Upload a JPG, PNG, WEBP, GIF or PDF file.");
  if (buffer.length > 10 * 1024 * 1024) throw new Error("File must be under 10 MB.");
  const name = `${Date.now()}-${randomBytes(6).toString("hex")}.${extensionFor(mime)}`;
  try {
    const relative = path.posix.join("private", folder, name);
    const dir = path.join(process.cwd(), "storage", "private", folder);
    await mkdir(dir, { recursive: true });
    await writeFile(path.join(dir, name), buffer);
    return relative;
  } catch {
    const row = await prisma.mediaFile.create({
      data: { folder: `private/${folder}`, filename: name, mime, payload: buffer.toString("base64") },
    });
    return `private/db/${row.id}`;
  }
}

export async function removePublicFile(publicPath?: string | null) {
  if (!publicPath) return;
  if (publicPath.startsWith("/api/media/")) {
    const id = publicPath.slice("/api/media/".length).split("/")[0];
    if (id) await prisma.mediaFile.delete({ where: { id } }).catch(() => undefined);
    return;
  }
  if (!publicPath.startsWith("/uploads/")) return;
  const abs = path.join(process.cwd(), "public", publicPath);
  await unlink(abs).catch(() => undefined);
}
