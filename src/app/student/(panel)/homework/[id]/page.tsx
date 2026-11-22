import { notFound } from "next/navigation";
import { BoundForm } from "@/components/forms";
import { Badge } from "@/components/ui";
import { requireStudent } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { fileHref, formatDate, formatDateTime } from "@/lib/utils";
import { homeworkWhereForStudent } from "@/lib/visibility";
import { submitHomework } from "@/server/learning-actions";

export default async function StudentHomeworkDetail({ params }: { params: Promise<{ id: string }> }) {
  const student = await requireStudent();
  const { id } = await params;
  const homework = await prisma.homework.findFirst({
    where: { id, ...homeworkWhereForStudent(student) },
    include: { faculty: true, class: true, submissions: { where: { studentId: student.id } } },
  });
  if (!homework) notFound();
  const submission = homework.submissions[0];
  return (
    <div className="grid gap-4">
      <a href="/student/homework" className="text-sm font-semibold text-royal">
        Back to homework
      </a>
      <section className="panel">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="font-serif text-3xl">{homework.title}</h1>
            <p className="text-sm text-slate-500">
              {homework.subjectName} · {homework.class.name} · {homework.faculty?.name || "Faculty"}
            </p>
          </div>
          <Badge>{submission?.status || "pending"}</Badge>
        </div>
        <p className="mt-3 text-sm leading-6">{homework.description}</p>
        {homework.instructions ? <p className="mt-3 text-sm text-slate-600">{homework.instructions}</p> : null}
        <p className="mt-3 text-sm">Due {formatDate(homework.dueDate)}</p>
        {homework.attachmentPath ? (
          <a className="mt-3 inline-block text-sm font-semibold text-royal" href={fileHref(homework.attachmentPath) || "#"}>
            Download attachment
          </a>
        ) : null}
      </section>
      <section className="panel">
        <h2 className="font-serif text-2xl">Your submission</h2>
        {submission?.submittedAt ? <p className="mt-2 text-sm text-slate-500">Submitted {formatDateTime(submission.submittedAt)}</p> : null}
        {submission?.feedback ? <p className="mt-2 text-sm">Teacher feedback: {submission.feedback}</p> : null}
        <BoundForm action={submitHomework} uploadFolder="submissions" className="mt-4 grid gap-3" submit={submission ? "Update submission" : "Submit homework"}>
          <input type="hidden" name="homeworkId" value={homework.id} />
          <label className="text-sm">
            <span className="label">Written answer</span>
            <textarea name="text" className="field min-h-28" defaultValue={submission?.text || ""} />
          </label>
          {homework.allowUpload ? (
            <label className="text-sm">
              <span className="label">Upload file</span>
              <input name="attachment" type="file" className="field" />
            </label>
          ) : (
            <p className="text-sm text-slate-500">File upload is not enabled for this homework.</p>
          )}
        </BoundForm>
      </section>
    </div>
  );
}
