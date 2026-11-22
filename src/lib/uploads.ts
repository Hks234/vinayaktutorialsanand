import { mkdir, writeFile, unlink } from "fs/promises";
import path from "path";
import { randomBytes } from "crypto";

const imageTypes = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);
const docTypes = new Set([...imageTypes, "application/pdf"]);

function extension(type: string) {
  if (type === "image/jpeg") return "jpg";
  if (type === "image/png") return "png";
  if (type === "image/webp") return "webp";
  if (type === "image/gif") return "gif";
  if (type === "application/pdf") return "pdf";
  return "bin";
}

export async function savePublicFile(file: File | null, folder: string, kind: "image" | "doc" = "image") {
  if (!file || file.size === 0) return null;
  const allowed = kind === "image" ? imageTypes : docTypes;
  if (!allowed.has(file.type)) {
    throw new Error(kind === "image" ? "Upload a JPG, PNG, WEBP or GIF image." : "Upload a JPG, PNG, WEBP, GIF or PDF file.");
  }
  const limit = kind === "image" ? 5 * 1024 * 1024 : 10 * 1024 * 1024;
  if (file.size > limit) throw new Error(kind === "image" ? "Image must be under 5 MB." : "File must be under 10 MB.");
  const name = `${Date.now()}-${randomBytes(6).toString("hex")}.${extension(file.type)}`;
  const dir = path.join(process.cwd(), "public", "uploads", folder);
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, name), Buffer.from(await file.arrayBuffer()));
  return `/uploads/${folder}/${name}`;
}

export async function savePrivateFile(file: File | null, folder: string) {
  if (!file || file.size === 0) return null;
  if (!docTypes.has(file.type)) throw new Error("Upload a JPG, PNG, WEBP, GIF or PDF file.");
  if (file.size > 10 * 1024 * 1024) throw new Error("File must be under 10 MB.");
  const name = `${Date.now()}-${randomBytes(6).toString("hex")}.${extension(file.type)}`;
  const relative = path.posix.join("private", folder, name);
  const dir = path.join(process.cwd(), "storage", "private", folder);
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, name), Buffer.from(await file.arrayBuffer()));
  return relative;
}

export async function removePublicFile(publicPath?: string | null) {
  if (!publicPath || !publicPath.startsWith("/uploads/")) return;
  const abs = path.join(process.cwd(), "public", publicPath);
  await unlink(abs).catch(() => undefined);
}
