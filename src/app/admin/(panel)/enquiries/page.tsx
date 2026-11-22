import { BoundForm, RunButton } from "@/components/forms";
import { Badge, Empty, Pager } from "@/components/ui";
import { enquiryStatuses } from "@/lib/defaults";
import { prisma } from "@/lib/prisma";
import { formatDateTime, one, pageCount, parsePage, whatsAppLink } from "@/lib/utils";
import { updateEnquiry } from "@/server/enquiry-actions";
import { admitEnquiry } from "@/server/people-actions";

const size = 12;

export default async function EnquiriesPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const query = await searchParams;
  const q = one(query.q);
  const standard = one(query.standard);
  const status = one(query.status);
  const page = parsePage(one(query.page));
  const where = {
    ...(status ? { status } : {}),
    ...(standard ? { standard } : {}),
    ...(q ? { OR: [{ studentName: { contains: q } }, { mobile: { contains: q } }, { enquiryCode: { contains: q } }] } : {}),
  };
  const [total, rows] = await Promise.all([
    prisma.admissionEnquiry.count({ where }),
    prisma.admissionEnquiry.findMany({ where, orderBy: { createdAt: "desc" }, skip: (page - 1) * size, take: size }),
  ]);
  const keep = new URLSearchParams();
  if (q) keep.set("q", q);
  if (standard) keep.set("standard", standard);
  if (status) keep.set("status", status);
  return (
    <div className="grid gap-4">
      <h1 className="font-serif text-3xl">Admission enquiries</h1>
      <form className="grid gap-3 md:grid-cols-4">
        <input className="field" name="q" defaultValue={q} placeholder="Name, mobile or enquiry ID" />
        <select className="field" name="standard" defaultValue={standard}><option value="">All standards</option>{["Standard 6","Standard 7","Standard 8","Standard 9","Standard 10","Standard 11","Standard 12","Contact"].map((item) => <option key={item}>{item}</option>)}</select>
        <select className="field" name="status" defaultValue={status}><option value="">All statuses</option>{enquiryStatuses.map((item) => <option key={item}>{item}</option>)}</select>
        <button className="btn-navy">Filter</button>
      </form>
      {!rows.length ? <Empty title="No enquiries" text="New admission and contact forms will appear here." /> : null}
      {rows.map((row) => (
        <article key={row.id} className="card p-5">
          <div className="flex flex-wrap items-center gap-2"><Badge>{row.enquiryCode}</Badge><Badge tone="pink">{row.status}</Badge><span className="text-xs text-slate-500">{formatDateTime(row.createdAt)}</span></div>
          <h2 className="mt-2 font-semibold">{row.studentName}</h2>
          <p className="text-sm text-slate-600">{row.parentName ? `Parent: ${row.parentName} · ` : ""}{row.mobile}{row.email ? ` · ${row.email}` : ""}</p>
          <p className="text-sm text-slate-600">{[row.standard, row.board, row.stream, row.previousSchool].filter(Boolean).join(" · ")}</p>
          {row.message ? <p className="mt-2 whitespace-pre-wrap text-sm leading-6">{row.message}</p> : null}
          <div className="mt-3 flex flex-wrap gap-2">
            <a className="btn-ghost" href={whatsAppLink(row.mobile, `Hello, this is Vinayak Tutorials regarding enquiry ${row.enquiryCode}.`)}>
              WhatsApp
            </a>
            {row.status !== "Admitted" && row.standard && row.standard !== "Contact" ? (
              <RunButton label="Create student" confirm="Create a student account from this enquiry?" run={admitEnquiry.bind(null, row.id)} />
            ) : null}
          </div>
          <BoundForm action={updateEnquiry} className="mt-3 grid gap-3 md:grid-cols-[180px_1fr_auto] md:items-end">
            <input type="hidden" name="id" value={row.id} />
            <label className="text-sm"><span className="label">Status</span><select name="status" className="field" defaultValue={row.status}>{enquiryStatuses.map((item) => <option key={item}>{item}</option>)}</select></label>
            <label className="text-sm"><span className="label">Internal remarks</span><input name="remarks" className="field" defaultValue={row.remarks || ""} /></label>
          </BoundForm>
        </article>
      ))}
      <Pager page={page} pages={pageCount(total, size)} href={`/admin/enquiries?${keep.toString()}`} />
    </div>
  );
}
