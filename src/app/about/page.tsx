import type { Metadata } from "next";
import { PageHero } from "@/components/site/PageHero";
import { SiteFrame } from "@/components/site/SiteFrame";
import { getAbout } from "@/lib/content";

export const metadata: Metadata = { title: "About Us" };

export default async function AboutPage() {
  const about = await getAbout();
  return (
    <SiteFrame>
      <PageHero eyebrow={about.eyebrow} title={about.title} text={about.body} />
      <section className="mx-auto grid max-w-6xl gap-4 px-4 py-12 md:grid-cols-2">
        {[
          ["Our Mission", about.mission],
          ["Our Vision", about.vision],
          ["Our Teaching Philosophy", about.philosophy],
          ["Our Commitment", about.commitment],
        ].map(([title, text]) => (
          <article key={title} className="card p-6">
            <h2 className="text-2xl font-semibold text-plum">{title}</h2>
            <p className="mt-3 text-sm leading-7 text-slate-600">{text}</p>
          </article>
        ))}
      </section>
    </SiteFrame>
  );
}
