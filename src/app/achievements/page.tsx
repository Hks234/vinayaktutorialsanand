import type { Metadata } from "next";
import { PageHero } from "@/components/site/PageHero";
import { SiteFrame } from "@/components/site/SiteFrame";
import { TopperPdfFrame } from "@/components/site/TopperPdfFrame";
import { getTopperPdfs } from "@/lib/content";

export const metadata: Metadata = { title: "Achievements" };

export default async function AchievementsPage() {
  const pdfs = await getTopperPdfs();
  return (
    <SiteFrame>
      <PageHero eyebrow="Results" title="Shining Stars of Vinayak" text="Our toppers, as published by the institute." />
      <section className="mx-auto max-w-6xl px-4 py-10">
        <div className="grid gap-6">
          {pdfs.map((item) => (
            <TopperPdfFrame key={item.id} title={item.title} path={item.path} />
          ))}
          {!pdfs.length ? <p className="text-sm text-slate-500">The toppers PDF will appear here after the institute uploads it from the admin portal.</p> : null}
        </div>
      </section>
    </SiteFrame>
  );
}
