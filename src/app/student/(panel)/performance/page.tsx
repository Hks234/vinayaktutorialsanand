import { Lines } from "@/components/charts";
import { Empty, Stat } from "@/components/ui";
import { requireStudent } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatDate, percent } from "@/lib/utils";
import { testWhereForStudent } from "@/lib/visibility";

export default async function StudentPerformance() {
  const student = await requireStudent();
  const marks = await prisma.testMark.findMany({
    where: { studentId: student.id, test: testWhereForStudent(student) },
    include: { test: true },
    orderBy: { createdAt: "desc" },
  });
  const chronological = [...marks].reverse();
  const average = marks.length ? Math.round(marks.reduce((sum, mark) => sum + percent(mark.marks, mark.total), 0) / marks.length) : 0;
  const chart = chronological.map((mark) => ({
    name: mark.test.subjectName,
    value: percent(mark.marks, mark.total),
  }));
  return (
    <div className="grid gap-4">
      <h1 className="font-serif text-3xl">Performance</h1>
      <Stat label="Average" value={marks.length ? `${average}%` : "—"} hint={marks.length ? `${marks.length} published tests` : "Marks appear after faculty publishes them"} />
      {marks.length ? (
        <section className="panel">
          <h2 className="mb-4 font-serif text-2xl">Marks over tests</h2>
          <Lines data={chart} label="Score %" />
        </section>
      ) : null}
      {!marks.length ? <Empty title="No marks yet" text="Results will show here when a teacher publishes them." /> : null}
      {marks.map((mark) => (
        <article key={mark.id} className="card p-5">
          <h2 className="font-semibold">{mark.test.name}</h2>
          <p className="text-sm text-slate-500">
            {mark.test.subjectName} · {formatDate(mark.test.testDate)}
          </p>
          <p className="mt-2 font-serif text-3xl text-royal">
            {mark.marks}/{mark.total} · {percent(mark.marks, mark.total)}%
          </p>
          {mark.feedback ? <p className="mt-2 text-sm text-slate-600">{mark.feedback}</p> : null}
        </article>
      ))}
    </div>
  );
}
