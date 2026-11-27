import { BoundForm, Field, RunButton } from "@/components/forms";
import { Avatar, Badge, Empty } from "@/components/ui";
import { catalog } from "@/lib/catalog";
import { prisma } from "@/lib/prisma";
import { formatDateTime, one } from "@/lib/utils";
import { createFacultyAccount, deactivateFaculty, grantFacultyLogin, saveFacultyPhoto, updateFaculty } from "@/server/people-actions";

export default async function FacultyAdminPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const editId = one((await searchParams).edit);
  const [members, data, editing] = await Promise.all([
    prisma.faculty.findMany({
      where: { deletedAt: null },
      include: { subjects: { include: { subject: true } }, classes: { include: { class: true, batch: true } } },
      orderBy: { displayOrder: "asc" },
    }),
    catalog(),
    editId ? prisma.faculty.findUnique({ where: { id: editId }, include: { subjects: true, classes: true } }) : null,
  ]);
  return (
    <div className="grid gap-6">
      <div>
        <h1 className="font-serif text-3xl">Faculty</h1>
        <p className="text-sm text-slate-500">Upload a photograph on each teacher. Tick “Show on the homepage” so that photo appears on the public site. A temporary password is shown only when it is generated.</p>
      </div>
      <div className="grid gap-3">
        {members.map((member) => (
          <article key={member.id} className="card flex flex-wrap items-start gap-4 p-4">
            {member.photoPath ? (
              <img src={member.photoPath} alt={member.name} className="portrait-photo h-28 w-24 rounded-2xl" />
            ) : (
              <Avatar name={member.name} className="h-28 w-24" />
            )}
            <div className="min-w-0 flex-1">
              <p className="font-semibold">{member.name}</p>
              <p className="text-sm text-slate-500">{member.facultyCode} · {member.userId || "No login yet"}</p>
              <p className="mt-1 text-sm text-slate-600">{member.subjects.map((item) => item.subject.name).join(", ") || "No subjects"}</p>
              <p className="text-sm text-slate-500">{member.classes.map((item) => item.class.name).join(", ") || "No classes"}</p>
              <div className="mt-2"><Badge tone={member.status === "active" ? "blue" : "slate"}>{member.visibleOnWebsite ? "Visible on homepage" : "Hidden from website"} · {member.status}</Badge></div>
              <BoundForm action={saveFacultyPhoto} uploadFolder="faculty" submit={member.photoPath ? "Change homepage photo" : "Add homepage photo"} className="mt-3 flex flex-wrap items-end gap-2">
                <input type="hidden" name="id" value={member.id} />
                <label className="min-w-[220px] flex-1 text-sm">
                  <span className="label">{member.photoPath ? "Replace photograph" : "Photograph for homepage"}</span>
                  <input name="photo" type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="field" required />
                </label>
              </BoundForm>
              <div className="mt-3 flex flex-wrap gap-2">
                <a className="btn-ghost" href={`/admin/faculty?edit=${member.id}`}>Edit</a>
                <RunButton label={member.passwordHash ? "Reset password" : "Create login"} run={grantFacultyLogin.bind(null, member.id)} />
                <RunButton label="Deactivate" danger confirm="Deactivate this faculty account?" run={deactivateFaculty.bind(null, member.id)} />
              </div>
              <p className="mt-1 text-xs text-slate-400">Reset: {formatDateTime(member.lastPasswordResetAt)}</p>
            </div>
          </article>
        ))}
        {!members.length ? <Empty title="No faculty" text="Add a teacher to publish a profile and create a login." /> : null}
      </div>
      <section className="panel">
        <h2 className="font-serif text-2xl">{editing ? `Edit ${editing.name}` : "Add faculty"}</h2>
        <BoundForm action={editing ? updateFaculty : createFacultyAccount} uploadFolder="faculty" className="mt-4 grid gap-3 md:grid-cols-2">
          {editing ? <input type="hidden" name="id" value={editing.id} /> : null}
          <Field label="Name" name="name" required defaultValue={editing?.name} />
          <Field label="User ID" name="userId" defaultValue={editing?.userId} />
          <Field label="Qualifications" name="qualifications" defaultValue={editing?.qualifications} />
          <Field label="Phone" name="phone" defaultValue={editing?.phone} />
          <Field label="Email" name="email" defaultValue={editing?.email} />
          <Field label="Display order" name="displayOrder" type="number" defaultValue={editing?.displayOrder ?? 0} />
          <label className="text-sm md:col-span-2"><span className="label">Description</span><textarea name="description" className="field min-h-24" defaultValue={editing?.description || ""} /></label>
          <label className="text-sm"><span className="label">Status</span><select name="status" className="field" defaultValue={editing?.status || "active"}><option value="active">Active</option><option value="inactive">Inactive</option></select></label>
          <label className="text-sm">
            <span className="label">Photograph for homepage</span>
            {editing?.photoPath ? <img src={editing.photoPath} alt="" className="portrait-photo mb-2 h-40 w-32 rounded-2xl" /> : null}
            <input name="photo" type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="field" />
            <span className="mt-1 block text-xs text-slate-500">JPG or PNG. This photo appears on the homepage and faculty page.</span>
          </label>
          <label className="flex items-center gap-2 text-sm md:col-span-2"><input type="checkbox" name="visibleOnWebsite" value="on" defaultChecked={editing ? editing.visibleOnWebsite : true} /> Show on the homepage and faculty page</label>
          <fieldset className="md:col-span-2">
            <legend className="label">Subjects</legend>
            <div className="flex flex-wrap gap-3">{data.subjects.map((subject) => <label key={subject.id} className="text-sm"><input type="checkbox" name="subjectIds" value={subject.id} defaultChecked={editing?.subjects.some((item) => item.subjectId === subject.id)} /> {subject.name}</label>)}</div>
          </fieldset>
          <fieldset className="md:col-span-2">
            <legend className="label">Classes</legend>
            <div className="flex flex-wrap gap-3">{data.classes.map((item) => <label key={item.id} className="text-sm"><input type="checkbox" name="classIds" value={item.id} defaultChecked={editing?.classes.some((link) => link.classId === item.id)} /> {item.name}</label>)}</div>
          </fieldset>
          <label className="text-sm md:col-span-2">
            <span className="label">Limit every selected class to one batch</span>
            <select name="batchId" className="field" defaultValue={editing?.classes.find((item) => item.batchId)?.batchId || ""}>
              <option value="">All batches in the class</option>
              {data.batches.map((item) => <option key={item.id} value={item.id}>{item.class.name} · {item.name}</option>)}
            </select>
          </label>
        </BoundForm>
      </section>
    </div>
  );
}
