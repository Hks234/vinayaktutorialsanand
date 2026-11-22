import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!id) return new Response("Not found", { status: 404 });
  const file = await prisma.mediaFile.findUnique({ where: { id } });
  if (!file?.payload) return new Response("Not found", { status: 404 });
  const bytes = Buffer.from(file.payload, "base64");
  return new Response(bytes, {
    headers: {
      "Content-Type": file.mime,
      "Content-Disposition": "inline",
      "X-Content-Type-Options": "nosniff",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
