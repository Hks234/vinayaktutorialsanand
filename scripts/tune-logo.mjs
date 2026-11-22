import sharp from "sharp";

const logos = [
  { name: "l4", left: 300, top: 130, width: 320, height: 320 },
  { name: "l5", left: 320, top: 145, width: 300, height: 280 },
  { name: "l6", left: 310, top: 120, width: 340, height: 300 },
];
for (const t of logos) {
  await sharp("brochure-pages/page-1.jpg").extract(t).jpeg({ quality: 92 }).toFile(`brochure-pages/tune/${t.name}.jpg`);
}
console.log("ok");
