import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

const cacheDir = path.join(process.cwd(), ".media-cache");

function headers(mime: string, length: number) {
  return {
    "Content-Type": mime,
    "Content-Length": String(length),
    "Content-Disposition": "inline",
    "X-Content-Type-Options": "nosniff",
    "Cache-Control": "public, max-age=31536000, immutable",
  };
}

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!id || !/^[a-z0-9]+$/i.test(id)) return new Response("Not found", { status: 404 });

  const cachedPath = path.join(cacheDir, id);
  try {
    const bytes = await readFile(cachedPath);
    const file = await prisma.mediaFile.findUnique({ where: { id }, select: { mime: true } });
    if (!file) return new Response("Not found", { status: 404 });
    return new Response(bytes, { headers: headers(file.mime, bytes.length) });
  } catch {
    const file = await prisma.mediaFile.findUnique({ where: { id } });
    if (!file?.payload) return new Response("Not found", { status: 404 });
    const bytes = Buffer.from(file.payload, "base64");
    await mkdir(cacheDir, { recursive: true }).catch(() => undefined);
    await writeFile(cachedPath, bytes).catch(() => undefined);
    return new Response(bytes, { headers: headers(file.mime, bytes.length) });
  }
}
