import { Empty } from "@/components/ui";
import { prisma } from "@/lib/prisma";
import { fileHref, formatDate, one } from "@/lib/utils";

export default async function AdminHomework({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const query = await searchParams;
  const classId = one(query.classId);
  const facultyId = one(query.facultyId);
  const [classes, faculty, rows] = await Promise.all([
    prisma.classGroup.findMany({ where: { deletedAt: null }, orderBy: { sortOrder: "asc" } }),
    prisma.faculty.findMany({ where: { deletedAt: null }, orderBy: { name: "asc" } }),
    prisma.homework.findMany({
      where: { deletedAt: null, ...(classId ? { classId } : {}), ...(facultyId ? { facultyId } : {}) },
      include: { class: true, batch: true, faculty: true, submissions: { include: { student: true } }, targets: true },
      orderBy: { dueDate: "desc" },
    }),
  ]);
  return (
    <div className="grid gap-4">
      <h1 className="font-serif text-3xl">Homework monitoring</h1>
      <form className="grid gap-3 md:grid-cols-3">
        <select name="classId" className="field" defaultValue={classId}><option value="">All classes</option>{classes.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select>
        <select name="facultyId" className="field" defaultValue={facultyId}><option value="">All faculty</option>{faculty.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select>
        <button className="btn-navy">Filter</button>
      </form>
      {!rows.length ? <Empty title="No homework" text="Faculty assignments will show up here." /> : null}
      {rows.map((item) => {
        const done = item.submissions.filter((submission) => submission.status === "completed" || submission.status === "reviewed").length;
        return (
          <article key={item.id} className="card p-5">
            <h2 className="font-semibold">{item.title}</h2>
            <p className="text-sm text-slate-500">{item.subjectName} · {item.class.name}{item.batch ? ` · ${item.batch.name}` : ""} · {item.faculty?.name || "Admin"}</p>
            <p className="mt-2 text-sm leading-6">{item.description}</p>
            <p className="mt-2 text-sm">Assigned {formatDate(item.assignedDate)} · Due {formatDate(item.dueDate)} · Completed {done}/{item.submissions.length}</p>
            {item.attachmentPath ? <a className="text-sm font-semibold text-royal" href={fileHref(item.attachmentPath) || "#"}>Attachment</a> : null}
            <ul className="mt-3 grid gap-1 text-sm text-slate-600">
              {item.submissions.map((submission) => (
                <li key={submission.id}>
                  {submission.student.fullName} · {submission.status}
                  {submission.feedback ? ` · ${submission.feedback}` : ""}
                </li>
              ))}
              {!item.submissions.length ? <li>No submissions yet.</li> : null}
            </ul>
          </article>
        );
      })}
    </div>
  );
}
