import sharp from "sharp";

const ys = [820, 850, 880, 980, 1005, 1025];
for (const y of ys) {
  await sharp("brochure-pages/page-4.jpg")
    .extract({ left: 68, top: y, width: 82, height: 92 })
    .jpeg()
    .toFile(`brochure-pages/tune/y${y}.jpg`);
}
console.log("ok");
