import sharp from "sharp";
import { mkdir } from "node:fs/promises";

await mkdir("public/media/toppers", { recursive: true });
await mkdir("public/uploads", { recursive: true });

const rows = [206, 418, 630, 872, 1092];
const originX = 70;
const pitchX = 151;
const width = 78;
const height = 84;

for (let i = 0; i < 30; i++) {
  const col = i % 6;
  const row = Math.floor(i / 6);
  const left = originX + col * pitchX;
  const top = rows[row];
  const n = String(i + 1).padStart(2, "0");
  await sharp("brochure-pages/page-4.jpg")
    .extract({ left, top, width, height })
    .resize(320, 360, { fit: "cover" })
    .jpeg({ quality: 90 })
    .toFile(`public/media/toppers/${n}.jpg`);
}

const logoSize = 280;
const logo = await sharp("brochure-pages/page-1.jpg")
  .extract({ left: 318, top: 142, width: 292, height: 292 })
  .resize(logoSize, logoSize)
  .png()
  .toBuffer();

const mask = Buffer.from(
  `<svg width="${logoSize}" height="${logoSize}"><circle cx="${logoSize / 2}" cy="${logoSize / 2}" r="${logoSize / 2 - 1}" fill="white"/></svg>`,
);

await sharp(logo)
  .composite([{ input: mask, blend: "dest-in" }])
  .png()
  .toFile("public/media/logo.png");

await sharp("brochure-pages/page-1.jpg")
  .extract({ left: 600, top: 12, width: 340, height: 168 })
  .resize(1400, 780, { fit: "cover" })
  .jpeg({ quality: 88 })
  .toFile("public/media/classroom.jpg");

await sharp("brochure-pages/page-1.jpg")
  .resize(900, 1220, { fit: "inside" })
  .jpeg({ quality: 86 })
  .toFile("public/media/brochure-cover.jpg");

console.log("media exported");
