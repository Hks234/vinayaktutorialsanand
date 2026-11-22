import { BoundForm, Field, RunButton } from "@/components/forms";
import { Avatar, Badge, Empty, Pager } from "@/components/ui";
import { catalog } from "@/lib/catalog";
import { prisma } from "@/lib/prisma";
import { formatDateTime, isSenior, one, pageCount, parsePage } from "@/lib/utils";
import { createStudent, deactivateStudent, resetStudentPassword, updateStudent } from "@/server/people-actions";

const size = 10;

export default async function StudentsPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const query = await searchParams;
  const q = one(query.q);
  const classId = one(query.classId);
  const status = one(query.status);
  const page = parsePage(one(query.page));
  const editId = one(query.edit);
  const where = {
    ...(status === "inactive" ? { status: "inactive" } : status === "all" ? {} : { deletedAt: null, status: "active" }),
    ...(classId ? { classId } : {}),
    ...(q ? { OR: [{ fullName: { contains: q } }, { userId: { contains: q } }, { studentCode: { contains: q } }, { mobile: { contains: q } }] } : {}),
  };
  const [total, students, data, editing] = await Promise.all([
    prisma.student.count({ where }),
    prisma.student.findMany({
      where,
      include: { class: true, batch: true, subjects: true, mentors: true },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * size,
      take: size,
    }),
    catalog(),
    editId ? prisma.student.findUnique({ where: { id: editId }, include: { subjects: true, mentors: true, class: true } }) : null,
  ]);
  const pages = pageCount(total, size);
  const keep = new URLSearchParams();
  if (q) keep.set("q", q);
  if (classId) keep.set("classId", classId);
  if (status) keep.set("status", status);

  return (
    <div className="grid gap-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-serif text-3xl">Students</h1>
          <p className="text-sm text-slate-500">Create accounts, assign classes and reset passwords. Passwords are shown only when generated.</p>
        </div>
        <a className="btn-ghost" href="/admin/students/export">Export CSV</a>
      </div>
      <form className="grid gap-3 md:grid-cols-4">
        <input className="field" name="q" defaultValue={q} placeholder="Search name, ID or mobile" />
        <select className="field" name="classId" defaultValue={classId}>
          <option value="">All classes</option>
          {data.classes.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
        </select>
        <select className="field" name="status" defaultValue={status || "active"}>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="all">All</option>
        </select>
        <button className="btn-navy">Filter</button>
      </form>
      <div className="overflow-x-auto rounded-3xl bg-white shadow-card">
        <table className="min-w-full text-left text-sm">
          <thead className="text-xs uppercase tracking-wider text-slate-500">
            <tr>
              {["Photo", "Name", "Student ID", "User ID", "Class", "Batch", "Mobile", "Status", "Actions"].map((head) => <th key={head} className="px-4 py-3">{head}</th>)}
            </tr>
          </thead>
          <tbody>
            {students.map((student) => (
              <tr key={student.id} className="border-t border-slate-100">
                <td className="px-4 py-3"><Avatar name={student.fullName} src={student.photoPath} /></td>
                <td className="px-4 py-3 font-medium">{student.fullName}</td>
                <td className="px-4 py-3">{student.studentCode}</td>
                <td className="px-4 py-3">{student.userId}</td>
                <td className="px-4 py-3">{student.class?.name || "—"}</td>
                <td className="px-4 py-3">{student.batch?.name || "—"}</td>
                <td className="px-4 py-3">{student.mobile || "—"}</td>
                <td className="px-4 py-3"><Badge tone={student.status === "active" && !student.deletedAt ? "blue" : "slate"}>{student.deletedAt ? "inactive" : student.status}</Badge></td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-2">
                    <a className="btn-ghost" href={`/admin/students/${student.id}`}>Profile</a>
                    <a className="btn-ghost" href={`/admin/students?${keep.toString()}&edit=${student.id}`}>Edit</a>
                    <RunButton label="Reset password" run={resetStudentPassword.bind(null, student.id)} />
                    <RunButton label="Deactivate" danger confirm="Deactivate this student account?" run={deactivateStudent.bind(null, student.id)} />
                  </div>
                  <p className="mt-1 text-xs text-slate-400">Password reset: {formatDateTime(student.lastPasswordResetAt)}</p>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!students.length ? <div className="p-6"><Empty title="No students match" text="Create an account or change the filters." /></div> : null}
      </div>
      <Pager page={page} pages={pages} href={`/admin/students?${keep.toString()}`} />

      <section className="panel">
        <h2 className="font-serif text-2xl">{editing ? `Edit ${editing.fullName}` : "Create student"}</h2>
        <BoundForm action={editing ? updateStudent : createStudent} className="mt-4 grid gap-3 md:grid-cols-2" submit={editing ? "Update student" : "Create student"}>
          {editing ? <input type="hidden" name="id" value={editing.id} /> : null}
          <Field label="Full name" name="fullName" required defaultValue={editing?.fullName} />
          <Field label="User ID" name="userId" defaultValue={editing?.userId} />
          <Field label="Parent name" name="parentName" defaultValue={editing?.parentName} />
          <Field label="Mobile" name="mobile" defaultValue={editing?.mobile} />
          <Field label="Email" name="email" type="email" defaultValue={editing?.email} />
          <Field label="Previous school" name="previousSchool" defaultValue={editing?.previousSchool} />
          <label className="text-sm">
            <span className="label">Class</span>
            <select name="classId" className="field" defaultValue={editing?.classId || ""} required>
              <option value="">Select</option>
              {data.classes.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
            </select>
          </label>
          <label className="text-sm">
            <span className="label">Batch</span>
            <select name="batchId" className="field" defaultValue={editing?.batchId || ""}>
              <option value="">Whole class</option>
              {data.batches.map((item) => <option key={item.id} value={item.id}>{item.class.name} · {item.name}</option>)}
            </select>
          </label>
          <label className="text-sm">
            <span className="label">Board</span>
            <select name="board" className="field" defaultValue={editing?.board || "GSEB"}><option>GSEB</option><option>CBSE</option></select>
          </label>
          <label className="text-sm">
            <span className="label">Stream</span>
            <select name="stream" className="field" defaultValue={editing?.stream || ""}>
              <option value="">Not applicable</option>
              <option value="PCM">PCM</option>
              <option value="PCB">PCB</option>
            </select>
          </label>
          <label className="text-sm">
            <span className="label">Status</span>
            <select name="status" className="field" defaultValue={editing?.status || "active"}><option value="active">Active</option><option value="inactive">Inactive</option></select>
          </label>
          <label className="text-sm"><span className="label">Photograph</span><input name="photo" type="file" accept="image/*" className="field" /></label>
          <fieldset className="md:col-span-2">
            <legend className="label">Subjects</legend>
            <div className="flex flex-wrap gap-3">
              {data.subjects.map((subject) => (
                <label key={subject.id} className="text-sm"><input type="checkbox" name="subjectIds" value={subject.id} defaultChecked={editing?.subjects.some((item) => item.subjectId === subject.id)} /> {subject.name}</label>
              ))}
            </div>
          </fieldset>
          <fieldset className="md:col-span-2">
            <legend className="label">Assigned faculty</legend>
            <div className="flex flex-wrap gap-3">
              {data.faculty.map((member) => (
                <label key={member.id} className="text-sm"><input type="checkbox" name="facultyIds" value={member.id} defaultChecked={editing?.mentors.some((item) => item.facultyId === member.id)} /> {member.name}</label>
              ))}
            </div>
          </fieldset>
          {editing?.class && isSenior(editing.class.name) ? <p className="text-xs text-slate-500 md:col-span-2">PCM or PCB is required for Standards 11 and 12.</p> : null}
        </BoundForm>
      </section>
    </div>
  );
}
