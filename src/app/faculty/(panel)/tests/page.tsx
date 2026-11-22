import { BoundForm, Field, RunButton } from "@/components/forms";
import { Empty } from "@/components/ui";
import { requireFaculty } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatDate, one, toDateInput } from "@/lib/utils";
import { cancelTest, saveTest } from "@/server/learning-actions";

export default async function FacultyTests({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const faculty = await requireFaculty();
  const editId = one((await searchParams).edit);
  const [tests, editing] = await Promise.all([
    prisma.testExam.findMany({
      where: { deletedAt: null, facultyId: faculty.id },
      include: { class: true, batch: true },
      orderBy: { testDate: "desc" },
    }),
    editId ? prisma.testExam.findFirst({ where: { id: editId, facultyId: faculty.id, deletedAt: null } }) : null,
  ]);
  return (
    <div className="grid gap-6">
      <h1 className="font-serif text-3xl">Tests</h1>
      <section className="panel">
        <h2 className="font-serif text-2xl">{editing ? "Edit test" : "Schedule a test"}</h2>
        <BoundForm action={saveTest} className="mt-4 grid gap-3 md:grid-cols-2" submit={editing ? "Update test" : "Schedule test"}>
          {editing ? <input type="hidden" name="id" value={editing.id} /> : null}
          <Field label="Test name" name="name" required defaultValue={editing?.name} />
          <Field label="Subject" name="subjectName" required defaultValue={editing?.subjectName} />
          <label className="text-sm">
            <span className="label">Class</span>
            <select name="classId" className="field" required defaultValue={editing?.classId}>
              {[...new Map(faculty.classes.map((item) => [item.classId, item])).values()].map((item) => (
                <option key={item.classId} value={item.classId}>
                  {item.class.name}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm">
            <span className="label">Batch</span>
            <select name="batchId" className="field" defaultValue={editing?.batchId || ""}>
              <option value="">All batches in that class</option>
              {faculty.classes
                .filter((item) => item.batch)
                .map((item) => (
                  <option key={item.id} value={item.batchId || ""}>
                    {item.class.name} · {item.batch?.name}
                  </option>
                ))}
            </select>
          </label>
          <Field label="Date" name="testDate" type="date" required defaultValue={toDateInput(editing?.testDate)} />
          <Field label="Start time" name="startTime" defaultValue={editing?.startTime || "09:00"} />
          <Field label="Duration (minutes)" name="durationMin" type="number" defaultValue={editing?.durationMin || 60} />
          <Field label="Total marks" name="totalMarks" type="number" defaultValue={editing?.totalMarks || 100} />
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
      {!tests.length ? <Empty title="No tests scheduled" text="New tests will appear here." /> : null}
      {tests.map((test) => (
        <article key={test.id} className="card flex flex-wrap items-center justify-between gap-3 p-4 text-sm">
          <div>
            <p className="font-semibold">
              {test.name} · {test.subjectName}
            </p>
            <p className="text-slate-500">
              {test.class.name}
              {test.batch ? ` · ${test.batch.name}` : ""} · {formatDate(test.testDate)} {test.startTime} · {test.durationMin} min · {test.status}
            </p>
          </div>
          <div className="flex gap-2">
            <a className="btn-ghost" href={`/faculty/performance?testId=${test.id}`}>
              Marks
            </a>
            <a className="btn-ghost" href={`/faculty/tests?edit=${test.id}`}>
              Edit
            </a>
            {test.status !== "cancelled" ? <RunButton label="Cancel" danger confirm="Cancel this test?" run={cancelTest.bind(null, test.id)} /> : null}
          </div>
        </article>
      ))}
    </div>
  );
}
