import { BoundForm, Field, RunButton } from "@/components/forms";
import { prisma } from "@/lib/prisma";
import { toDateInput } from "@/lib/utils";
import { deleteBanner, saveBanner } from "@/server/content-actions";

export default async function BannersPage() {
  const banners = await prisma.promotionalBanner.findMany({ orderBy: { displayOrder: "asc" } });
  return (
    <div className="grid gap-6">
      <h1 className="font-serif text-3xl">Promotional banners</h1>
      <section className="panel">
        <h2 className="font-serif text-2xl">Upload banner</h2>
        <BoundForm action={saveBanner} className="mt-4 grid gap-3 md:grid-cols-2">
          <label className="text-sm md:col-span-2"><span className="label">Image</span><input name="image" type="file" accept="image/*" className="field" required /></label>
          <Field label="Heading" name="heading" />
          <Field label="Subtitle" name="subtitle" />
          <Field label="Button text" name="ctaText" defaultValue="Enquire Now" />
          <Field label="Button link" name="ctaHref" defaultValue="/admission-enquiry" />
          <Field label="Order" name="displayOrder" type="number" defaultValue={1} />
          <Field label="Start date" name="startDate" type="date" />
          <Field label="End date" name="endDate" type="date" />
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="active" value="on" defaultChecked /> Active</label>
        </BoundForm>
      </section>
      <div className="grid gap-4">
        {banners.map((banner) => (
          <article key={banner.id} className="card grid gap-4 p-4 md:grid-cols-[220px_1fr]">
            <img src={banner.imagePath} alt="" className="h-36 w-full rounded-2xl object-cover" />
            <div>
              <h2 className="font-semibold">{banner.heading || "Untitled banner"}</h2>
              <p className="text-sm text-slate-500">{banner.subtitle}</p>
              <p className="mt-1 text-xs text-slate-400">{banner.active ? "Active" : "Hidden"} · order {banner.displayOrder} · {toDateInput(banner.startDate) || "no start"} to {toDateInput(banner.endDate) || "no end"}</p>
              <div className="mt-3"><RunButton label="Delete" danger confirm="Delete this banner?" run={deleteBanner.bind(null, banner.id)} /></div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
