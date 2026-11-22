import { prisma } from "@/lib/prisma";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!id) return new Response("Not found", { status: 404 });
  const file = await prisma.mediaFile.findUnique({ where: { id } });
  if (!file) return new Response("Not found", { status: 404 });
  return new Response(Uint8Array.from(file.bytes), {
    headers: {
      "Content-Type": file.mime,
      "Content-Disposition": "inline",
      "X-Content-Type-Options": "nosniff",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
