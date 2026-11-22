import sharp from "sharp";
import { mkdir } from "node:fs/promises";

await mkdir("brochure-pages/tune", { recursive: true });

const trials = [
  { name: "a", left: 54, top: 210, width: 96, height: 108 },
  { name: "b", left: 48, top: 198, width: 100, height: 120 },
  { name: "c", left: 60, top: 220, width: 88, height: 100 },
  { name: "d", left: 40, top: 188, width: 110, height: 125 },
];

for (const t of trials) {
  await sharp("brochure-pages/page-4.jpg")
    .extract({ left: t.left, top: t.top, width: t.width, height: t.height })
    .jpeg()
    .toFile(`brochure-pages/tune/${t.name}.jpg`);
  console.log("wrote", t.name);
}

await sharp("brochure-pages/page-1.jpg")
  .extract({ left: 330, top: 230, width: 290, height: 290 })
  .jpeg()
  .toFile("brochure-pages/tune/logo.jpg");

await sharp("brochure-pages/page-1.jpg")
  .extract({ left: 500, top: 10, width: 440, height: 240 })
  .jpeg()
  .toFile("brochure-pages/tune/class.jpg");

console.log("done");
