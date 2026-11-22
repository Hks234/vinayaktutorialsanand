import { BoundForm, Field, RunButton } from "@/components/forms";
import { scoreLabel } from "@/lib/brochure-toppers";
import { prisma } from "@/lib/prisma";
import { deleteTopper, saveTopper, saveTopperPhoto } from "@/server/content-actions";

export default async function ToppersAdmin() {
  const toppers = await prisma.topper.findMany({ where: { deletedAt: null }, orderBy: [{ academicYear: "desc" }, { displayOrder: "asc" }] });
  return (
    <div className="grid gap-6">
      <div>
        <h1 className="font-serif text-3xl">Toppers</h1>
        <p className="text-sm text-slate-500">Enter the result exactly as printed, including decimals such as 98.52. Upload a photograph when you add a student, or add one later on an existing card.</p>
      </div>
      <section className="panel">
        <BoundForm action={saveTopper} uploadFolder="toppers" className="grid gap-3 md:grid-cols-2">
          <Field label="Student name" name="name" required />
          <Field label="Standard" name="standard" required />
          <Field label="Score" name="percentage" type="number" step="0.01" min={0} max={100} placeholder="98.52" required />
          <label className="text-sm"><span className="label">Score type</span><select name="description" className="field"><option value="%">Percentage (%)</option><option value="PR">Percentile rank (PR)</option></select></label>
          <Field label="School" name="school" />
          <Field label="Academic year" name="academicYear" required defaultValue="2024-25" />
          <Field label="Order" name="displayOrder" type="number" defaultValue={toppers.length + 1} />
          <label className="text-sm">
            <span className="label">Photograph</span>
            <input name="photo" type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="field" />
            <span className="mt-1 block text-xs text-slate-500">JPG, PNG or WEBP, under 5 MB. Optional.</span>
          </label>
          <label className="flex items-center gap-2 text-sm md:col-span-2"><input type="checkbox" name="featured" value="on" /> Feature on the homepage</label>
        </BoundForm>
      </section>
      <div className="grid gap-3">
        {toppers.map((topper) => (
          <article key={topper.id} className="card flex flex-wrap items-start gap-4 p-4">
            {topper.photoPath ? (
              <img src={topper.photoPath} alt="" className="h-20 w-20 rounded-2xl object-cover object-top" />
            ) : (
              <div className="grid h-20 w-20 place-items-center rounded-2xl bg-ice text-center text-[11px] font-semibold text-slate-400">No photo</div>
            )}
            <div className="min-w-0 flex-1">
              <p className="font-semibold">{topper.name}</p>
              <p className="text-sm text-slate-500">Std {topper.standard} · {scoreLabel(topper.percentage, topper.description)} · {topper.school} · {topper.academicYear}{topper.featured ? " · Homepage" : ""}</p>
              <BoundForm action={saveTopperPhoto} uploadFolder="toppers" submit={topper.photoPath ? "Change photo" : "Add photo"} className="mt-3 flex flex-wrap items-end gap-2">
                <input type="hidden" name="id" value={topper.id} />
                <label className="min-w-[220px] flex-1 text-sm">
                  <span className="label">{topper.photoPath ? "Replace photograph" : "Add photograph"}</span>
                  <input name="photo" type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="field" required />
                </label>
              </BoundForm>
            </div>
            <RunButton label="Remove" danger confirm="Remove this result?" run={deleteTopper.bind(null, topper.id)} />
          </article>
        ))}
      </div>
    </div>
  );
}
