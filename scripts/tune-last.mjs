import sharp from "sharp";
for (const y of [1070, 1095, 1115, 1130]) {
  await sharp("brochure-pages/page-4.jpg")
    .extract({ left: 70, top: y, width: 78, height: 90 })
    .jpeg()
    .toFile(`brochure-pages/tune/last${y}.jpg`);
}
console.log("ok");
