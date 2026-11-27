import type { Metadata } from "next";
import { PageHero } from "@/components/site/PageHero";
import { SiteFrame } from "@/components/site/SiteFrame";
import { Badge, Empty } from "@/components/ui";
import { prisma } from "@/lib/prisma";
import { publicNoticeWhere } from "@/lib/visibility";
import { fileHref, formatDate } from "@/lib/utils";

export const metadata: Metadata = { title: "Notices" };

export default async function NoticesPage() {
  const notices = await prisma.notice.findMany({ where: publicNoticeWhere(), orderBy: [{ priority: "desc" }, { publishAt: "desc" }] });
  return (
    <SiteFrame>
      <PageHero eyebrow="Notice board" title="Announcements from the institute." text="Admission updates, holidays, examinations and academic notices published for everyone." />
      <section className="mx-auto grid max-w-4xl gap-4 px-4 py-12">
        {!notices.length ? <Empty title="No public notices" text="New announcements will appear here when the admin publishes them." /> : null}
        {notices.map((notice) => (
          <article key={notice.id} className="card p-6">
            <div className="flex flex-wrap items-center gap-2">
              <Badge>{notice.category}</Badge>
              {notice.priority === "important" ? <Badge tone="orange">Important</Badge> : null}
              <span className="text-xs text-slate-500">{formatDate(notice.publishAt || notice.createdAt)}</span>
            </div>
            <h2 className="mt-3 text-2xl font-semibold text-plum">{notice.title}</h2>
            <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-slate-600">{notice.description}</p>
            {notice.attachmentPath ? <a className="mt-3 inline-block text-sm font-semibold text-orange" href={fileHref(notice.attachmentPath) || "#"}>Attachment</a> : null}
          </article>
        ))}
      </section>
    </SiteFrame>
  );
}
