import { BoundForm, Field, RunButton } from "@/components/forms";
import { prisma } from "@/lib/prisma";
import { deleteSubject, saveSubject } from "@/server/academic-actions";

export default async function SubjectsPage() {
  const subjects = await prisma.subject.findMany({ orderBy: { name: "asc" } });
  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
      <section className="panel">
        <h1 className="font-serif text-3xl">Subjects</h1>
        <ul className="mt-4 divide-y divide-slate-100 text-sm">
          {subjects.map((subject) => (
            <li key={subject.id} className="flex items-center justify-between py-3">
              <span>{subject.name} <span className="text-slate-400">{subject.code} · {subject.band}</span></span>
              <RunButton label="Delete" danger confirm="Delete this subject?" run={deleteSubject.bind(null, subject.id)} />
            </li>
          ))}
        </ul>
      </section>
      <section className="panel h-fit">
        <h2 className="font-serif text-2xl">Add subject</h2>
        <BoundForm action={saveSubject} className="mt-4 grid gap-3">
          <Field label="Name" name="name" required />
          <Field label="Code" name="code" />
          <label className="text-sm"><span className="label">Band</span><select name="band" className="field"><option value="6-10">Standards 6–10</option><option value="11-12">Standards 11–12</option><option value="all">All</option></select></label>
        </BoundForm>
      </section>
    </div>
  );
}
