import { BoundForm, Field, RunButton } from "@/components/forms";
import { galleryCategories } from "@/lib/defaults";
import { prisma } from "@/lib/prisma";
import { deleteGalleryImage, saveGalleryImage } from "@/server/content-actions";

export default async function GalleryAdmin() {
  const images = await prisma.galleryImage.findMany({ where: { deletedAt: null }, orderBy: { displayOrder: "asc" } });
  return (
    <div className="grid gap-6">
      <h1 className="font-serif text-3xl">Gallery</h1>
      <section className="panel">
        <BoundForm action={saveGalleryImage} className="grid gap-3 md:grid-cols-2">
          <label className="text-sm md:col-span-2"><span className="label">Photograph</span><input name="image" type="file" accept="image/*" required className="field" /></label>
          <Field label="Title" name="title" />
          <label className="text-sm"><span className="label">Category</span><select name="category" className="field">{galleryCategories.map((item) => <option key={item}>{item}</option>)}</select></label>
          <Field label="Order" name="displayOrder" type="number" defaultValue={images.length + 1} />
        </BoundForm>
      </section>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {images.map((image) => (
          <article key={image.id} className="card overflow-hidden">
            <img src={image.imagePath} alt="" className="h-44 w-full object-cover" />
            <div className="flex items-center justify-between p-4 text-sm">
              <span>{image.title || image.category}<span className="block text-slate-400">{image.category}</span></span>
              <RunButton label="Delete" danger confirm="Delete this photograph?" run={deleteGalleryImage.bind(null, image.id)} />
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
