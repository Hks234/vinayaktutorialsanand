import { Badge, Empty } from "@/components/ui";
import { requireStudent } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";
import { testWhereForStudent } from "@/lib/visibility";

export default async function StudentTests() {
  const student = await requireStudent();
  const tests = await prisma.testExam.findMany({
    where: testWhereForStudent(student),
    include: { faculty: true, class: true },
    orderBy: { testDate: "asc" },
  });
  return (
    <div className="grid gap-4">
      <h1 className="font-serif text-3xl">Tests</h1>
      {!tests.length ? <Empty title="No tests" text="Scheduled tests for your class will appear here." /> : null}
      {tests.map((test) => (
        <article key={test.id} className="card p-5">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="font-semibold">{test.name}</h2>
            <Badge>{test.subjectName}</Badge>
          </div>
          <p className="mt-2 text-sm text-slate-500">
            {formatDate(test.testDate)} · {test.startTime} · {test.durationMin} minutes · {test.totalMarks} marks
          </p>
          <p className="text-sm text-slate-500">{test.faculty?.name || "Faculty will be assigned"}</p>
          {test.syllabus ? <p className="mt-3 text-sm leading-6">{test.syllabus}</p> : null}
          {test.instructions ? <p className="mt-2 text-sm text-slate-600">{test.instructions}</p> : null}
        </article>
      ))}
    </div>
  );
}
