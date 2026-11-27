import type { Metadata } from "next";
import { PageHero } from "@/components/site/PageHero";
import { SiteFrame } from "@/components/site/SiteFrame";
import { Avatar } from "@/components/ui";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = { title: "Our Faculty" };

export default async function FacultyPage() {
  const faculty = await prisma.faculty.findMany({
    where: { deletedAt: null, visibleOnWebsite: true, status: "active" },
    include: { subjects: { include: { subject: true } } },
    orderBy: { displayOrder: "asc" },
  });
  return (
    <SiteFrame>
      <PageHero eyebrow="Teachers" title="Subject teachers who stay with the batch." text="Profiles published by the institute. Qualifications appear when the admin adds them." />
      <section className="mx-auto grid max-w-6xl gap-4 px-4 py-12 md:grid-cols-2">
        {!faculty.length ? (
          <p className="text-sm text-slate-500 md:col-span-2">Faculty profiles appear here after the institute publishes them.</p>
        ) : null}
        {faculty.map((member) => (
          <article key={member.id} className="card overflow-hidden p-0">
            <div className="flex gap-4 p-5">
              {member.photoPath ? (
                <img src={member.photoPath} alt={member.name} className="portrait-photo h-36 w-28 shrink-0 rounded-2xl" />
              ) : (
                <Avatar name={member.name} className="h-36 w-28" />
              )}
              <div>
                <h2 className="text-2xl font-semibold text-plum">{member.name}</h2>
                <p className="mt-1 text-sm font-medium text-orange">{member.subjects.map((item) => item.subject.name).join(" · ") || member.description}</p>
                {member.qualifications ? <p className="mt-2 text-sm text-slate-600">{member.qualifications}</p> : null}
                {member.description ? <p className="mt-2 text-sm leading-6 text-slate-600">{member.description}</p> : null}
              </div>
            </div>
          </article>
        ))}
      </section>
    </SiteFrame>
  );
}
