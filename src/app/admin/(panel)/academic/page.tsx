import { BoundForm, Field, RunButton } from "@/components/forms";
import { catalog } from "@/lib/catalog";
import { prisma } from "@/lib/prisma";
import { assignFacultyClass, removeFacultyClass, saveYear } from "@/server/academic-actions";

export default async function AcademicPage() {
  const data = await catalog();
  const links = await prisma.facultyClassAssignment.findMany({ include: { faculty: true, class: true, batch: true }, orderBy: { faculty: { name: "asc" } } });
  return (
    <div className="grid gap-6">
      <div>
        <h1 className="font-serif text-3xl">Academic setup</h1>
        <p className="text-sm text-slate-500">Years and which teacher covers which class. Classes, batches and subjects have their own pages.</p>
      </div>
      <section className="panel">
        <h2 className="font-serif text-2xl">Academic years</h2>
        <p className="mt-2 text-sm text-slate-500">{data.years.map((year) => `${year.name}${year.isCurrent ? " (current)" : ""}`).join(" · ")}</p>
        <BoundForm action={saveYear} className="mt-4 grid gap-3 md:grid-cols-[1fr_auto_auto] md:items-end">
          <Field label="Year" name="name" required />
          <label className="mb-2 flex items-center gap-2 text-sm"><input type="checkbox" name="isCurrent" value="on" /> Set as current</label>
        </BoundForm>
      </section>
      <section className="panel">
        <h2 className="font-serif text-2xl">Faculty class assignment</h2>
        <BoundForm action={assignFacultyClass} className="mt-4 grid gap-3 md:grid-cols-4">
          <label className="text-sm"><span className="label">Faculty</span><select name="facultyId" className="field" required>{data.faculty.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
          <label className="text-sm"><span className="label">Class</span><select name="classId" className="field" required>{data.classes.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
          <label className="text-sm"><span className="label">Batch</span><select name="batchId" className="field"><option value="">All batches</option>{data.batches.map((item) => <option key={item.id} value={item.id}>{item.class.name} · {item.name}</option>)}</select></label>
        </BoundForm>
        <ul className="mt-4 divide-y divide-slate-100 text-sm">
          {links.map((link) => (
            <li key={link.id} className="flex items-center justify-between py-3">
              <span>{link.faculty.name} · {link.class.name}{link.batch ? ` · ${link.batch.name}` : ""}</span>
              <RunButton label="Remove" danger run={removeFacultyClass.bind(null, link.id)} />
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
