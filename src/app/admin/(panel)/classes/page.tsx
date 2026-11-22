import { BoundForm, Field, RunButton } from "@/components/forms";
import { prisma } from "@/lib/prisma";
import { deleteClass, saveClass } from "@/server/academic-actions";

export default async function ClassesPage() {
  const classes = await prisma.classGroup.findMany({ where: { deletedAt: null }, orderBy: { sortOrder: "asc" }, include: { _count: { select: { students: true } } } });
  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <section className="panel">
        <h1 className="font-serif text-3xl">Classes</h1>
        <ul className="mt-4 divide-y divide-slate-100">
          {classes.map((item) => (
            <li key={item.id} className="flex items-center justify-between gap-3 py-3 text-sm">
              <span>{item.name} <span className="text-slate-400">· {item._count.students} students</span></span>
              <RunButton label="Remove" danger confirm="Remove this class?" run={deleteClass.bind(null, item.id)} />
            </li>
          ))}
        </ul>
      </section>
      <section className="panel h-fit">
        <h2 className="font-serif text-2xl">Add class</h2>
        <BoundForm action={saveClass} className="mt-4 grid gap-3">
          <Field label="Name" name="name" required />
          <Field label="Sort order" name="sortOrder" type="number" defaultValue={0} />
        </BoundForm>
      </section>
    </div>
  );
}
