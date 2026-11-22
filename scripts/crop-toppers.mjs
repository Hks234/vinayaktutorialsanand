import sharp from "sharp";
import { mkdir } from "node:fs/promises";

const page = await sharp("brochure-pages/page-4.jpg").rotate().jpeg().toBuffer();
const meta = await sharp(page).metadata();
console.log("page4", meta.width, meta.height, "orientation", meta.orientation);

const left = 22;
const top = 168;
const cols = 6;
const rows = 5;
const gapX = 6;
const gapY = 8;
const gridW = meta.width - left * 2;
const gridH = meta.height - top - 70;
const cellW = Math.floor(gridW / cols);
const cellH = Math.floor(gridH / rows);

await mkdir("brochure-pages/samples", { recursive: true });

for (const index of [0, 1, 6, 12, 18, 24, 29]) {
  const c = index % cols;
  const r = Math.floor(index / cols);
  const x = left + c * cellW + 18;
  const y = top + r * cellH + 36;
  const width = cellW - gapX - 36;
  const height = Math.min(cellH - 78, 118);
  await sharp(page)
    .extract({ left: x, top: y, width, height })
    .jpeg()
    .toFile(`brochure-pages/samples/${index}.jpg`);
  console.log(index, { x, y, width, height });
}
