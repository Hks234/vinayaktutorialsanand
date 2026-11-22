import { BoundForm, Field, RunButton } from "@/components/forms";
import { Empty } from "@/components/ui";
import { requireFaculty } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { fileHref, formatDate, one, toDateInput } from "@/lib/utils";
import { facultyClassWhere } from "@/lib/visibility";
import { deleteHomework, saveHomework } from "@/server/learning-actions";

export default async function FacultyHomework({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const faculty = await requireFaculty();
  const editId = one((await searchParams).edit);
  const [students, rows, editing] = await Promise.all([
    prisma.student.findMany({
      where: { ...facultyClassWhere(faculty.classes), status: "active" },
      include: { class: true, batch: true },
      orderBy: { fullName: "asc" },
    }),
    prisma.homework.findMany({
      where: { deletedAt: null, facultyId: faculty.id },
      include: { class: true, batch: true, submissions: true },
      orderBy: { dueDate: "desc" },
    }),
    editId ? prisma.homework.findFirst({ where: { id: editId, facultyId: faculty.id, deletedAt: null }, include: { targets: true } }) : null,
  ]);
  const classes = faculty.classes;
  return (
    <div className="grid gap-6">
      <h1 className="font-serif text-3xl">Homework</h1>
      <section className="panel">
        <h2 className="font-serif text-2xl">{editing ? "Edit homework" : "Assign homework"}</h2>
        <BoundForm action={saveHomework} className="mt-4 grid gap-3 md:grid-cols-2" submit={editing ? "Update homework" : "Assign homework"}>
          {editing ? <input type="hidden" name="id" value={editing.id} /> : null}
          <Field label="Title" name="title" required defaultValue={editing?.title} className="md:col-span-2" />
          <Field label="Subject" name="subjectName" required defaultValue={editing?.subjectName} />
          <label className="text-sm">
            <span className="label">Class</span>
            <select name="classId" className="field" required defaultValue={editing?.classId}>
              {[...new Map(classes.map((item) => [item.classId, item])).values()].map((item) => (
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
              {classes
                .filter((item) => item.batch)
                .map((item) => (
                  <option key={item.id} value={item.batchId || ""}>
                    {item.class.name} · {item.batch?.name}
                  </option>
                ))}
            </select>
          </label>
          <Field label="Assigned date" name="assignedDate" type="date" required defaultValue={toDateInput(editing?.assignedDate) || toDateInput(new Date())} />
          <Field label="Due date" name="dueDate" type="date" required defaultValue={toDateInput(editing?.dueDate)} />
          <label className="text-sm md:col-span-2">
            <span className="label">Description</span>
            <textarea name="description" className="field min-h-24" required defaultValue={editing?.description} />
          </label>
          <label className="text-sm md:col-span-2">
            <span className="label">Instructions</span>
            <textarea name="instructions" className="field min-h-20" defaultValue={editing?.instructions || ""} />
          </label>
          <label className="text-sm md:col-span-2">
            <span className="label">Attachment</span>
            <input name="attachment" type="file" className="field" />
          </label>
          <label className="flex items-center gap-2 text-sm md:col-span-2">
            <input type="checkbox" name="allowUpload" value="on" defaultChecked={editing?.allowUpload ?? true} />
            Allow students to upload a file
          </label>
          <fieldset className="md:col-span-2">
            <legend className="label">Specific students (optional)</legend>
            <div className="mt-2 grid gap-2 md:grid-cols-2">
              {students.map((student) => (
                <label key={student.id} className="flex items-center gap-2 text-sm">
                  <input type="checkbox" name="studentIds" value={student.id} defaultChecked={editing?.targets.some((target) => target.studentId === student.id)} />
                  {student.fullName} · {student.class?.name}
                </label>
              ))}
            </div>
            <p className="mt-2 text-xs text-slate-500">Leave unchecked to assign the whole class or batch.</p>
          </fieldset>
        </BoundForm>
      </section>
      {!rows.length ? <Empty title="No homework assigned" text="New assignments will list here after you save them." /> : null}
      {rows.map((item) => {
        const done = item.submissions.filter((submission) => submission.status === "completed" || submission.status === "reviewed").length;
        return (
          <article key={item.id} className="card p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="font-semibold">{item.title}</h2>
                <p className="text-sm text-slate-500">
                  {item.subjectName} · {item.class.name}
                  {item.batch ? ` · ${item.batch.name}` : ""}
                </p>
                <p className="mt-2 text-sm leading-6">{item.description}</p>
                <p className="mt-2 text-sm">
                  Assigned {formatDate(item.assignedDate)} · Due {formatDate(item.dueDate)} · Completed {done}/{item.submissions.length}
                </p>
                {item.attachmentPath ? (
                  <a className="text-sm font-semibold text-royal" href={fileHref(item.attachmentPath) || "#"}>
                    Attachment
                  </a>
                ) : null}
              </div>
              <div className="flex gap-2">
                <a className="btn-ghost" href={`/faculty/homework/${item.id}`}>
                  Submissions
                </a>
                <a className="btn-ghost" href={`/faculty/homework?edit=${item.id}`}>
                  Edit
                </a>
                <RunButton label="Delete" danger confirm="Delete this homework?" run={deleteHomework.bind(null, item.id)} />
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}
