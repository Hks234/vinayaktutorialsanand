import { BoundForm, Field, RunButton } from "@/components/forms";
import { Badge } from "@/components/ui";
import { noticeCategories } from "@/lib/defaults";
import { prisma } from "@/lib/prisma";
import { formatDateTime, one, toDateTimeLocal } from "@/lib/utils";
import { deleteNotice, saveNotice, setNoticePublished } from "@/server/notice-actions";

export default async function NoticesAdmin({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const editId = one((await searchParams).edit);
  const [notices, classes, editing] = await Promise.all([
    prisma.notice.findMany({ where: { deletedAt: null }, include: { targets: true }, orderBy: { createdAt: "desc" } }),
    prisma.classGroup.findMany({ where: { deletedAt: null }, orderBy: { sortOrder: "asc" } }),
    editId ? prisma.notice.findUnique({ where: { id: editId }, include: { targets: true } }) : null,
  ]);
  return (
    <div className="grid gap-6">
      <h1 className="font-serif text-3xl">Notices</h1>
      <section className="panel">
        <h2 className="font-serif text-2xl">{editing ? "Edit notice" : "New notice"}</h2>
        <BoundForm action={saveNotice} uploadFolder="notices" className="mt-4 grid gap-3">
          {editing ? <input type="hidden" name="id" value={editing.id} /> : null}
          <Field label="Title" name="title" required defaultValue={editing?.title} />
          <label className="text-sm"><span className="label">Description</span><textarea name="description" className="field min-h-32" required defaultValue={editing?.description} /></label>
          <div className="grid gap-3 md:grid-cols-3">
            <label className="text-sm"><span className="label">Category</span><select name="category" className="field" defaultValue={editing?.category}>{noticeCategories.map((item) => <option key={item}>{item}</option>)}</select></label>
            <label className="text-sm"><span className="label">Audience</span><select name="audience" className="field" defaultValue={editing?.audience || "everyone"}><option value="everyone">Everyone</option><option value="students">Students</option><option value="faculty">Faculty</option><option value="classes">Selected classes</option></select></label>
            <label className="text-sm"><span className="label">Priority</span><select name="priority" className="field" defaultValue={editing?.priority || "normal"}><option value="normal">Normal</option><option value="important">Important</option></select></label>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <Field label="Publish at" name="publishAt" type="datetime-local" defaultValue={toDateTimeLocal(editing?.publishAt)} />
            <Field label="Expires at" name="expiresAt" type="datetime-local" defaultValue={toDateTimeLocal(editing?.expiresAt)} />
          </div>
          <fieldset>
            <legend className="label">Classes, when audience is selected classes</legend>
            <div className="flex flex-wrap gap-3">{classes.map((item) => <label key={item.id} className="text-sm"><input type="checkbox" name="classIds" value={item.id} defaultChecked={editing?.targets.some((target) => target.classId === item.id)} /> {item.name}</label>)}</div>
          </fieldset>
          <label className="text-sm"><span className="label">Attachment</span><input name="attachment" type="file" accept="image/*,.pdf" className="field" /></label>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="published" value="on" defaultChecked={editing ? editing.published : true} /> Publish now</label>
        </BoundForm>
      </section>
      <div className="grid gap-3">
        {notices.map((notice) => (
          <article key={notice.id} className="card p-5">
            <div className="flex flex-wrap items-center gap-2"><Badge>{notice.category}</Badge><Badge tone="pink">{notice.audience}</Badge>{notice.published ? <Badge tone="orange">Published</Badge> : <Badge tone="slate">Draft</Badge>}</div>
            <h2 className="mt-2 font-semibold">{notice.title}</h2>
            <p className="mt-1 text-xs text-slate-500">{formatDateTime(notice.publishAt || notice.createdAt)}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <a className="btn-ghost" href={`/admin/notices?edit=${notice.id}`}>Edit</a>
              <RunButton label={notice.published ? "Unpublish" : "Publish"} run={setNoticePublished.bind(null, notice.id, !notice.published)} />
              <RunButton label="Delete" danger confirm="Delete this notice?" run={deleteNotice.bind(null, notice.id)} />
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
