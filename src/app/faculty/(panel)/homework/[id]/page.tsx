import { notFound } from "next/navigation";
import { BoundForm } from "@/components/forms";
import { Empty } from "@/components/ui";
import { requireFaculty } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { fileHref, formatDateTime } from "@/lib/utils";
import { reviewSubmission } from "@/server/learning-actions";

export default async function FacultyHomeworkDetail({ params }: { params: Promise<{ id: string }> }) {
  const faculty = await requireFaculty();
  const { id } = await params;
  const homework = await prisma.homework.findFirst({
    where: { id, facultyId: faculty.id, deletedAt: null },
    include: { class: true, batch: true, targets: true, submissions: { include: { student: true }, orderBy: { updatedAt: "desc" } } },
  });
  if (!homework) notFound();
  const assigned = await prisma.student.findMany({
    where: {
      deletedAt: null,
      status: "active",
      classId: homework.classId,
      ...(homework.batchId ? { batchId: homework.batchId } : {}),
      ...(homework.targets.length ? { id: { in: homework.targets.map((target) => target.studentId) } } : {}),
    },
    orderBy: { fullName: "asc" },
  });
  const submittedIds = new Set(homework.submissions.map((submission) => submission.studentId));
  const pending = assigned.filter((student) => !submittedIds.has(student.id));
  return (
    <div className="grid gap-4">
      <a href="/faculty/homework" className="text-sm font-semibold text-royal">
        Back to homework
      </a>
      <section className="panel">
        <h1 className="font-serif text-3xl">{homework.title}</h1>
        <p className="text-sm text-slate-500">
          {homework.subjectName} · {homework.class.name}
          {homework.batch ? ` · ${homework.batch.name}` : ""}
        </p>
        <p className="mt-3 text-sm leading-6">{homework.description}</p>
      </section>
      {pending.length ? (
        <section className="panel">
          <h2 className="font-serif text-2xl">Awaiting submission</h2>
          <ul className="mt-3 grid gap-1 text-sm text-slate-600">
            {pending.map((student) => (
              <li key={student.id}>{student.fullName}</li>
            ))}
          </ul>
        </section>
      ) : null}
      {!homework.submissions.length ? <Empty title="No submissions yet" text="Students will appear here after they submit." /> : null}
      {homework.submissions.map((submission) => (
        <article key={submission.id} className="card p-5">
          <h2 className="font-semibold">{submission.student.fullName}</h2>
          <p className="text-sm text-slate-500">
            {submission.status}
            {submission.submittedAt ? ` · ${formatDateTime(submission.submittedAt)}` : ""}
          </p>
          {submission.text ? <p className="mt-2 text-sm leading-6">{submission.text}</p> : null}
          {submission.attachmentPath ? (
            <a className="mt-2 inline-block text-sm font-semibold text-royal" href={fileHref(submission.attachmentPath) || "#"}>
              View attachment
            </a>
          ) : null}
          {submission.feedback ? <p className="mt-2 text-sm text-slate-600">Feedback: {submission.feedback}</p> : null}
          <BoundForm action={reviewSubmission} className="mt-4 grid gap-3" submit="Save review">
            <input type="hidden" name="id" value={submission.id} />
            <label className="text-sm">
              <span className="label">Feedback</span>
              <textarea name="feedback" className="field min-h-20" defaultValue={submission.feedback || ""} />
            </label>
          </BoundForm>
        </article>
      ))}
    </div>
  );
}
