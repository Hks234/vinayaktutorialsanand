import sharp from "sharp";

const faces = [
  { name: "f1", left: 68, top: 206, width: 82, height: 96 },
  { name: "f2", left: 219, top: 206, width: 82, height: 96 },
  { name: "f3", left: 68, top: 418, width: 82, height: 96 },
];
for (const t of faces) {
  await sharp("brochure-pages/page-4.jpg")
    .extract(t)
    .jpeg({ quality: 90 })
    .toFile(`brochure-pages/tune/${t.name}.jpg`);
}

const logos = [
  { name: "l1", left: 356, top: 150, width: 240, height: 240 },
  { name: "l2", left: 370, top: 175, width: 220, height: 220 },
  { name: "l3", left: 348, top: 188, width: 250, height: 230 },
];
for (const t of logos) {
  await sharp("brochure-pages/page-1.jpg")
    .extract(t)
    .jpeg({ quality: 92 })
    .toFile(`brochure-pages/tune/${t.name}.jpg`);
}

await sharp("brochure-pages/page-1.jpg")
  .extract({ left: 590, top: 8, width: 350, height: 175 })
  .jpeg({ quality: 90 })
  .toFile("brochure-pages/tune/class2.jpg");

console.log("ok");
