import sharp from "sharp";

const src = "brochure-pages/page-4.jpg";
const buf = await sharp(src).rotate().toBuffer();
const meta = await sharp(buf).metadata();
const w = meta.width;
const h = meta.height;
const left = 16;
const right = 16;
const top = 148;
const bottom = 78;
const cols = 6;
const rows = 5;
const cw = (w - left - right) / cols;
const rh = (h - top - bottom) / rows;
let lines = "";
for (let c = 0; c <= cols; c++) {
  const x = left + c * cw;
  lines += `<line x1="${x}" y1="${top}" x2="${x}" y2="${h - bottom}" stroke="red" stroke-width="2"/>`;
}
for (let r = 0; r <= rows; r++) {
  const y = top + r * rh;
  lines += `<line x1="${left}" y1="${y}" x2="${w - right}" y2="${y}" stroke="lime" stroke-width="2"/>`;
}
const svg = Buffer.from(
  `<svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">${lines}</svg>`,
);
const overlay = await sharp(svg).resize(w, h).png().toBuffer();
console.log("overlay", await sharp(overlay).metadata());
console.log("base", await sharp(buf).metadata());
await sharp(buf)
  .composite([{ input: overlay, top: 0, left: 0 }])
  .resize(760)
  .jpeg({ quality: 72 })
  .toFile("brochure-pages/grid-preview.jpg");
console.log({ w, h, cw, rh });
