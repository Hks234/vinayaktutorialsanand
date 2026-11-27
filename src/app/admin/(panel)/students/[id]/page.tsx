import { notFound } from "next/navigation";
import { Avatar, Badge } from "@/components/ui";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatDateTime, percent } from "@/lib/utils";

export default async function StudentProfile({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const student = await prisma.student.findUnique({
    where: { id },
    include: {
      class: true,
      batch: true,
      subjects: { include: { subject: true } },
      mentors: { include: { faculty: true } },
      marks: { include: { test: true }, orderBy: { createdAt: "desc" } },
      submissions: true,
    },
  });
  if (!student) notFound();
  return (
    <div className="grid gap-4">
      <a href="/admin/students" className="text-sm font-semibold text-royal">Back to students</a>
      <section className="panel flex flex-wrap gap-4">
        <Avatar name={student.fullName} src={student.photoPath} className="h-28 w-24" />
        <div>
          <h1 className="font-serif text-3xl">{student.fullName}</h1>
          <p className="text-sm text-slate-500">{student.studentCode} · User ID {student.userId}</p>
          <div className="mt-2 flex gap-2"><Badge>{student.class?.name || "No class"}</Badge><Badge tone="pink">{student.board}</Badge>{student.stream ? <Badge tone="orange">{student.stream}</Badge> : null}</div>
        </div>
      </section>
      <section className="grid gap-4 md:grid-cols-2">
        <article className="panel text-sm leading-7">
          <p>Parent: {student.parentName || "—"}</p>
          <p>Mobile: {student.mobile || "—"}</p>
          <p>Email: {student.email || "—"}</p>
          <p>Batch: {student.batch?.name || "—"}</p>
          <p>Previous school: {student.previousSchool || "—"}</p>
          <p>Account: {student.status}</p>
          <p>Last password reset: {formatDateTime(student.lastPasswordResetAt)}</p>
          <p>Subjects: {student.subjects.map((item) => item.subject.name).join(", ") || "—"}</p>
          <p>Faculty: {student.mentors.map((item) => item.faculty.name).join(", ") || "—"}</p>
        </article>
        <article className="panel">
          <h2 className="font-serif text-2xl">Marks</h2>
          <ul className="mt-3 grid gap-2 text-sm">
            {student.marks.map((mark) => (
              <li key={mark.id}>{mark.test.name} · {mark.marks}/{mark.total} · {percent(mark.marks, mark.total)}%</li>
            ))}
            {!student.marks.length ? <li className="text-slate-500">No marks yet.</li> : null}
          </ul>
          <p className="mt-4 text-sm text-slate-500">Homework records: {student.submissions.length}</p>
        </article>
      </section>
    </div>
  );
}
