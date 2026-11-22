import { Badge, Empty } from "@/components/ui";
import { requireStudent } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";
import { homeworkWhereForStudent } from "@/lib/visibility";
import { ensureHomeworkReminders } from "@/server/content-actions";

export default async function StudentHomework() {
  const student = await requireStudent();
  await ensureHomeworkReminders(student.id);
  const homework = await prisma.homework.findMany({
    where: homeworkWhereForStudent(student),
    include: { faculty: true, submissions: { where: { studentId: student.id } } },
    orderBy: { dueDate: "asc" },
  });
  return (
    <div className="grid gap-4">
      <h1 className="font-serif text-3xl">Homework</h1>
      {!homework.length ? <Empty title="No homework" text="Assignments for your class will appear here." /> : null}
      {homework.map((item) => {
        const submission = item.submissions[0];
        const status = submission?.status || "pending";
        return (
          <article key={item.id} className="card p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="font-semibold">{item.title}</h2>
                <p className="text-sm text-slate-500">
                  {item.subjectName} · {item.faculty?.name || "Faculty"} · due {formatDate(item.dueDate)}
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-600">{item.description}</p>
              </div>
              <Badge tone={status === "reviewed" ? "blue" : status === "completed" ? "pink" : "orange"}>{status}</Badge>
            </div>
            <a className="btn-primary mt-4" href={`/student/homework/${item.id}`}>
              Open
            </a>
          </article>
        );
      })}
    </div>
  );
}
