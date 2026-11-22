import type { Metadata } from "next";
import { PageHero } from "@/components/site/PageHero";
import { SiteFrame } from "@/components/site/SiteFrame";
import { getFeatures, getMethods, getPrograms } from "@/lib/content";

export const metadata: Metadata = { title: "Academics" };

export default async function AcademicsPage() {
  const [programs, features, methods] = await Promise.all([getPrograms(), getFeatures(), getMethods()]);
  return (
    <SiteFrame>
      <PageHero eyebrow="GSEB & CBSE" title="Personal group tuition from Standard 6 to 12." text="English-medium teaching for school standards, and PCM or PCB science for Standards 11 and 12. These pages describe the institute. Nothing here is sold online." />
      <section className="mx-auto grid max-w-6xl gap-4 px-4 py-12 md:grid-cols-3">
        {programs.map((program) => (
          <article key={program.title} className="card p-6">
            <p className="text-xs font-semibold uppercase tracking-wider text-hot">{program.board}</p>
            <h2 className="mt-2 font-serif text-2xl">{program.title}</h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">{program.blurb}</p>
            <ul className="mt-4 grid gap-1 text-sm text-navy">{program.subjects.map((subject) => <li key={subject}>{subject}</li>)}</ul>
            <a className="btn-primary mt-5" href={program.enquire}>Enquire Now</a>
          </article>
        ))}
      </section>
      <section className="bg-white py-12">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="font-serif text-3xl">Teaching routine</h2>
          <ol className="mt-6 grid gap-3 md:grid-cols-2">
            {methods.map((step) => (
              <li key={step.step} className="rounded-3xl bg-ice p-5">
                <span className="text-sm font-semibold text-royal">{step.step}</span>
                <h3 className="mt-1 font-semibold">{step.title}</h3>
                <p className="mt-1 text-sm text-slate-600">{step.description}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>
      <section className="mx-auto max-w-6xl px-4 py-12">
        <h2 className="font-serif text-3xl">What stays constant</h2>
        <div className="mt-6 grid gap-3 md:grid-cols-2">
          {features.map((feature) => (
            <article key={feature.title} className="card p-5">
              <h3 className="font-semibold">{feature.title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">{feature.description}</p>
            </article>
          ))}
        </div>
      </section>
    </SiteFrame>
  );
}
