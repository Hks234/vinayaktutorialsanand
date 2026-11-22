import { BoundForm, Field, RunButton } from "@/components/forms";
import { catalog } from "@/lib/catalog";
import { prisma } from "@/lib/prisma";
import { formatDate, one, toDateInput } from "@/lib/utils";
import { adminDeleteTest, adminSaveTest } from "@/server/content-actions";

export default async function AdminTests({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const editId = one((await searchParams).edit);
  const [data, tests, editing] = await Promise.all([
    catalog(),
    prisma.testExam.findMany({ where: { deletedAt: null }, include: { class: true, batch: true, faculty: true }, orderBy: { testDate: "asc" } }),
    editId ? prisma.testExam.findFirst({ where: { id: editId, deletedAt: null } }) : null,
  ]);
  return (
    <div className="grid gap-6">
      <h1 className="font-serif text-3xl">Test timetable</h1>
      <section className="panel">
        <h2 className="font-serif text-2xl">{editing ? "Edit test" : "Schedule a test"}</h2>
        <BoundForm action={adminSaveTest} className="mt-4 grid gap-3 md:grid-cols-2" submit={editing ? "Update test" : "Schedule test"}>
          {editing ? <input type="hidden" name="id" value={editing.id} /> : null}
          <Field label="Test name" name="name" required defaultValue={editing?.name} />
          <Field label="Subject" name="subjectName" required defaultValue={editing?.subjectName} />
          <label className="text-sm">
            <span className="label">Class</span>
            <select name="classId" className="field" required defaultValue={editing?.classId}>
              {data.classes.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm">
            <span className="label">Batch</span>
            <select name="batchId" className="field" defaultValue={editing?.batchId || ""}>
              <option value="">All batches</option>
              {data.batches.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.class.name} · {item.name}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm">
            <span className="label">Faculty</span>
            <select name="facultyId" className="field" defaultValue={editing?.facultyId || ""}>
              <option value="">Unassigned</option>
              {data.faculty.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          </label>
          <Field label="Date" name="testDate" type="date" required defaultValue={toDateInput(editing?.testDate)} />
          <Field label="Start time" name="startTime" defaultValue={editing?.startTime || "09:00"} />
          <Field label="Duration (minutes)" name="durationMin" type="number" defaultValue={editing?.durationMin || 60} />
          <Field label="Total marks" name="totalMarks" type="number" defaultValue={editing?.totalMarks || 100} />
          <label className="text-sm">
            <span className="label">Status</span>
            <select name="status" className="field" defaultValue={editing?.status || "scheduled"}>
              <option value="scheduled">Scheduled</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </label>
          <label className="text-sm md:col-span-2">
            <span className="label">Syllabus</span>
            <textarea name="syllabus" className="field min-h-20" defaultValue={editing?.syllabus || ""} />
          </label>
          <label className="text-sm md:col-span-2">
            <span className="label">Instructions</span>
            <textarea name="instructions" className="field min-h-20" defaultValue={editing?.instructions || ""} />
          </label>
        </BoundForm>
      </section>
      <div className="grid gap-3">
        {tests.map((test) => (
          <article key={test.id} className="card flex flex-wrap items-center justify-between gap-3 p-4 text-sm">
            <div>
              <p className="font-semibold">
                {test.name} · {test.subjectName}
              </p>
              <p className="text-slate-500">
                {test.class.name}
                {test.batch ? ` · ${test.batch.name}` : ""} · {formatDate(test.testDate)} {test.startTime} · {test.durationMin} min · {test.status} · {test.faculty?.name || "No faculty"}
              </p>
            </div>
            <div className="flex gap-2">
              <a className="btn-ghost" href={`/admin/tests?edit=${test.id}`}>
                Edit
              </a>
              <RunButton label="Delete" danger confirm="Delete this test?" run={adminDeleteTest.bind(null, test.id)} />
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
