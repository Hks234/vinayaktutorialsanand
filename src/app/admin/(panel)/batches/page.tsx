import { BoundForm, Field, RunButton } from "@/components/forms";
import { catalog } from "@/lib/catalog";
import { prisma } from "@/lib/prisma";
import { deleteBatch, saveBatch } from "@/server/academic-actions";

export default async function BatchesPage() {
  const [{ classes }, batches] = await Promise.all([
    catalog(),
    prisma.batch.findMany({ where: { deletedAt: null }, include: { class: true, _count: { select: { students: true } } }, orderBy: { name: "asc" } }),
  ]);
  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
      <section className="panel">
        <h1 className="font-serif text-3xl">Batches</h1>
        <p className="mt-1 text-sm text-slate-500">A batch holds at most the capacity you set. The institute keeps batches to 30 students.</p>
        <ul className="mt-4 divide-y divide-slate-100 text-sm">
          {batches.map((batch) => (
            <li key={batch.id} className="flex items-center justify-between gap-3 py-3">
              <span>{batch.class.name} · {batch.name} · {batch._count.students}/{batch.capacity}</span>
              <RunButton label="Remove" danger confirm="Remove this batch?" run={deleteBatch.bind(null, batch.id)} />
            </li>
          ))}
        </ul>
      </section>
      <section className="panel h-fit">
        <h2 className="font-serif text-2xl">Add batch</h2>
        <BoundForm action={saveBatch} className="mt-4 grid gap-3">
          <label className="text-sm"><span className="label">Class</span><select name="classId" className="field" required>{classes.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
          <Field label="Batch name" name="name" required />
          <Field label="Capacity" name="capacity" type="number" defaultValue={30} />
        </BoundForm>
      </section>
    </div>
  );
}
