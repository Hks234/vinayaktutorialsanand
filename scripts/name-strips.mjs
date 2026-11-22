import sharp from "sharp";
const tops = [158, 370, 582, 824, 1036];
for (const top of tops) {
  await sharp("brochure-pages/page-4.jpg")
    .extract({ left: 20, top, width: 912, height: 52 })
    .jpeg({ quality: 92 })
    .toFile(`brochure-pages/tune/names${top}.jpg`);
}
console.log("ok");
