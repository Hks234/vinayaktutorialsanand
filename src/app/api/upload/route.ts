import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { asUpload, savePrivateFile, savePublicFile } from "@/lib/uploads";

export const runtime = "nodejs";

const publicFolders = new Set(["toppers", "gallery", "hero", "banners", "brand", "students", "faculty", "uploads"]);
const privateFolders = new Set(["homework", "notices", "submissions"]);

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Sign in to upload a file." }, { status: 401 });
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "The file was too large or could not be read. Use a JPG or PNG under 10 MB." }, { status: 413 });
  }

  const folderRaw = String(formData.get("folder") || "uploads").toLowerCase().replace(/[^a-z0-9-]/g, "");
  const folder = folderRaw || "uploads";
  const file = asUpload(formData.get("file"));
  if (!file) {
    return NextResponse.json({ error: "Choose a photograph to upload." }, { status: 400 });
  }

  try {
    if (privateFolders.has(folder)) {
      const stored = await savePrivateFile(file, folder);
      if (!stored) return NextResponse.json({ error: "Choose a file to upload." }, { status: 400 });
      return NextResponse.json({ path: stored });
    }
    if (!publicFolders.has(folder)) {
      return NextResponse.json({ error: "That upload folder is not allowed." }, { status: 400 });
    }
    const filename = "name" in file ? String((file as File).name || "") : "";
    const isPdf = (file.type || "").toLowerCase().includes("pdf") || filename.toLowerCase().endsWith(".pdf");
    const stored = await savePublicFile(file, folder, isPdf ? "doc" : "image");
    if (!stored) return NextResponse.json({ error: "Choose a file to upload." }, { status: 400 });
    return NextResponse.json({ path: stored });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not store the image." },
      { status: 400 },
    );
  }
}
