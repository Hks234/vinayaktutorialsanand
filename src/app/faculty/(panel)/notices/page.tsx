import { Badge, Empty } from "@/components/ui";
import { prisma } from "@/lib/prisma";
import { fileHref, formatDate } from "@/lib/utils";
import { facultyNoticeWhere } from "@/lib/visibility";

export default async function FacultyNotices() {
  const notices = await prisma.notice.findMany({
    where: facultyNoticeWhere(),
    orderBy: { publishAt: "desc" },
  });
  return (
    <div className="grid gap-4">
      <h1 className="font-serif text-3xl">Notices</h1>
      {!notices.length ? <Empty title="No notices" text="Institute notices for faculty will appear here." /> : null}
      {notices.map((notice) => (
        <article key={notice.id} className="card p-5">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="font-semibold">{notice.title}</h2>
            <Badge>{notice.category}</Badge>
            {notice.priority === "important" ? <Badge tone="orange">Important</Badge> : null}
          </div>
          <p className="mt-1 text-sm text-slate-500">{formatDate(notice.publishAt)}</p>
          <p className="mt-3 text-sm leading-6 text-slate-600">{notice.description}</p>
          {notice.attachmentPath ? (
            <a className="mt-3 inline-block text-sm font-semibold text-royal" href={fileHref(notice.attachmentPath) || "#"}>
              Attachment
            </a>
          ) : null}
        </article>
      ))}
    </div>
  );
}
