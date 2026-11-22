import type { Metadata } from "next";
import { PageHero } from "@/components/site/PageHero";
import { SiteFrame } from "@/components/site/SiteFrame";
import { scoreLabel } from "@/lib/brochure-toppers";
import { prisma } from "@/lib/prisma";
import { one } from "@/lib/utils";

export const metadata: Metadata = { title: "Achievements" };

export default async function AchievementsPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const year = one((await searchParams).year);
  const toppers = await prisma.topper.findMany({
    where: { deletedAt: null, ...(year ? { academicYear: year } : {}) },
    orderBy: [{ academicYear: "desc" }, { displayOrder: "asc" }],
  });
  const years = await prisma.topper.findMany({ where: { deletedAt: null }, distinct: ["academicYear"], select: { academicYear: true } });
  return (
    <SiteFrame>
      <PageHero eyebrow="Results" title="Shining Stars of Vinayak" text="Results recorded from the institute brochure and later years added by the admin. Marks are shown as printed: PR for percentile rank and % for percentage." />
      <section className="mx-auto max-w-6xl px-4 py-10">
        <div className="flex flex-wrap gap-2">
          <a className={`chip ${year ? "" : "bg-royal text-white"}`} href="/achievements">All years</a>
          {years.map((item) => (
            <a key={item.academicYear} className={`chip ${year === item.academicYear ? "bg-royal text-white" : ""}`} href={`/achievements?year=${item.academicYear}`}>{item.academicYear}</a>
          ))}
        </div>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {toppers.map((topper) => (
            <article key={topper.id} className="card overflow-hidden">
              {topper.photoPath ? (
                <img src={topper.photoPath} alt="" className="h-64 w-full object-cover object-top" />
              ) : null}
              <div className="p-5">
                <p className="font-serif text-2xl text-royal">{scoreLabel(topper.percentage, topper.description)}</p>
                <h2 className="mt-2 font-semibold">{topper.name}</h2>
                <p className="text-sm text-slate-500">Standard {topper.standard}</p>
                <p className="text-sm text-slate-500">{topper.school}</p>
                <p className="mt-1 text-xs font-semibold text-hot">{topper.academicYear}</p>
              </div>
            </article>
          ))}
        </div>
      </section>
    </SiteFrame>
  );
}
