import { BoundForm } from "@/components/forms";
import { Empty } from "@/components/ui";
import { requireFaculty } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { facultyClassWhere } from "@/lib/visibility";
import { formatDate, one } from "@/lib/utils";
import { saveMarks } from "@/server/learning-actions";

export default async function FacultyPerformance({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const faculty = await requireFaculty();
  const testId = one((await searchParams).testId);
  const tests = await prisma.testExam.findMany({
    where: { deletedAt: null, facultyId: faculty.id, status: { not: "cancelled" } },
    include: { class: true, batch: true },
    orderBy: { testDate: "desc" },
  });
  const selected = tests.find((test) => test.id === testId) || tests[0];
  const students = selected
    ? await prisma.student.findMany({
        where: {
          ...facultyClassWhere([{ classId: selected.classId, batchId: selected.batchId }]),
          status: "active",
        },
        include: { marks: { where: { testId: selected.id } } },
        orderBy: { fullName: "asc" },
      })
    : [];
  return (
    <div className="grid gap-4">
      <h1 className="font-serif text-3xl">Marks</h1>
      {!tests.length ? <Empty title="No tests yet" text="Schedule a test first, then enter marks here." /> : null}
      {tests.length ? (
        <form method="get" className="flex flex-wrap gap-3">
          <select name="testId" className="field max-w-md" defaultValue={selected?.id}>
            {tests.map((test) => (
              <option key={test.id} value={test.id}>
                {test.name} · {test.class.name} · {formatDate(test.testDate)}
              </option>
            ))}
          </select>
          <button className="btn-navy">Open</button>
        </form>
      ) : null}
      {selected ? (
        <section className="panel">
          <h2 className="font-serif text-2xl">{selected.name}</h2>
          <p className="text-sm text-slate-500">
            {selected.subjectName} · out of {selected.totalMarks}
          </p>
          <BoundForm action={saveMarks} className="mt-4 grid gap-3" submit="Save marks">
            <input type="hidden" name="testId" value={selected.id} />
            {students.map((student) => {
              const mark = student.marks[0];
              return (
                <div key={student.id} className="grid gap-2 rounded-2xl bg-ice p-3 md:grid-cols-[1fr_120px_1fr]">
                  <p className="self-center text-sm font-medium">{student.fullName}</p>
                  <label className="text-sm">
                    <span className="label">Marks</span>
                    <input name={`mark_${student.id}`} className="field" type="number" min={0} max={selected.totalMarks} defaultValue={mark?.marks ?? ""} />
                  </label>
                  <label className="text-sm">
                    <span className="label">Remark</span>
                    <input name={`feedback_${student.id}`} className="field" defaultValue={mark?.feedback ?? ""} />
                  </label>
                </div>
              );
            })}
            {!students.length ? <p className="text-sm text-slate-500">No students in this class or batch.</p> : null}
          </BoundForm>
        </section>
      ) : null}
    </div>
  );
}
