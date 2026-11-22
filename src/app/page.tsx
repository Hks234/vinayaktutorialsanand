import { EnquiryForm } from "@/components/forms";
import { BannerSlider } from "@/components/site/BannerSlider";
import { PageHero } from "@/components/site/PageHero";
import { Reveal } from "@/components/site/Reveal";
import { SiteFrame } from "@/components/site/SiteFrame";
import { Avatar } from "@/components/ui";
import { scoreLabel } from "@/lib/brochure-toppers";
import { activeBanners, getAbout, getFeatures, getHero, getMethods, getPrograms } from "@/lib/content";
import { prisma } from "@/lib/prisma";
import { publicNoticeWhere } from "@/lib/visibility";

export default async function HomePage() {
  const [hero, about, programs, features, methods, banners, toppers, faculty, notices] = await Promise.all([
    getHero(),
    getAbout(),
    getPrograms(),
    getFeatures(),
    getMethods(),
    activeBanners(),
    prisma.topper.findMany({ where: { deletedAt: null }, orderBy: [{ featured: "desc" }, { displayOrder: "asc" }], take: 8 }),
    prisma.faculty.findMany({
      where: { deletedAt: null, visibleOnWebsite: true, status: "active" },
      include: { subjects: { include: { subject: true } } },
      orderBy: { displayOrder: "asc" },
      take: 5,
    }),
    prisma.notice.findMany({
      where: publicNoticeWhere(),
      orderBy: { publishAt: "desc" },
      take: 3,
    }),
  ]);

  return (
    <SiteFrame>
      <section className="relative overflow-hidden bg-navy text-white">
        {hero.backgroundImage ? (
          <img src={hero.backgroundImage} alt="" className="absolute inset-0 h-full w-full object-cover opacity-20" />
        ) : null}
        <div className="absolute inset-0 bg-gradient-to-r from-navy via-royal/40 to-navy/70" />
        <div className={`relative mx-auto grid max-w-6xl items-center gap-10 px-4 py-16 md:py-24 ${hero.image ? "md:grid-cols-[1.05fr_0.95fr]" : ""}`}>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-blush">Vinayak Tutorials · Anand</p>
            <h1 className="mt-4 max-w-3xl font-serif text-4xl leading-tight md:text-6xl">{hero.heading}</h1>
            <p className="mt-5 max-w-xl text-base leading-7 text-white/80">{hero.description}</p>
            <div className="mt-7 flex flex-wrap gap-3">
              <a className="btn-primary" href={hero.primaryCtaHref}>
                {hero.primaryCtaText}
              </a>
              <a className="btn-ghost border-white/20 bg-white/10 text-white hover:bg-white/15" href={hero.secondaryCtaHref}>
                {hero.secondaryCtaText}
              </a>
            </div>
            <div className="mt-8 flex flex-wrap gap-2">
              {hero.pills.map((pill) => (
                <span key={pill} className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs font-semibold text-blush">
                  {pill}
                </span>
              ))}
            </div>
          </div>
          {hero.image ? (
            <img src={hero.image} alt="" className="h-[380px] w-full rounded-[2rem] object-cover shadow-[0_30px_80px_-28px_rgba(0,0,0,0.55)] ring-1 ring-white/20" />
          ) : null}
        </div>
      </section>

      <BannerSlider banners={banners} />

      <Reveal className="mx-auto grid max-w-6xl gap-6 px-4 py-12 lg:grid-cols-[1.1fr_0.9fr]">
        <article>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-hot">{about.eyebrow}</p>
          <h2 className="mt-3 font-serif text-4xl text-navy">{about.title}</h2>
          <p className="mt-4 text-sm leading-7 text-slate-600">{about.body}</p>
          <a className="btn-navy mt-6" href="/about">
            About the institute
          </a>
        </article>
        <div className="grid gap-3">
          {features.slice(0, 4).map((feature) => (
            <article key={feature.title} className="card p-5">
              <h3 className="font-semibold text-navy">{feature.title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">{feature.description}</p>
            </article>
          ))}
        </div>
      </Reveal>

      <section className="bg-white py-12">
        <div className="mx-auto max-w-6xl px-4">
          <Reveal>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-hot">Academics</p>
            <h2 className="mt-2 font-serif text-4xl">Personal group tuition, standard by standard.</h2>
          </Reveal>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {programs.map((program) => (
              <Reveal key={program.title}>
                <article className="card h-full p-6">
                  <p className="text-xs font-semibold uppercase tracking-wider text-hot">{program.board}</p>
                  <h3 className="mt-2 font-serif text-2xl">{program.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-slate-600">{program.blurb}</p>
                  <ul className="mt-4 grid gap-1 text-sm text-navy">
                    {program.subjects.map((subject) => (
                      <li key={subject}>{subject}</li>
                    ))}
                  </ul>
                  <a className="btn-primary mt-5" href={program.enquire}>
                    Enquire Now
                  </a>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12">
        <Reveal>
          <h2 className="font-serif text-4xl">How teaching moves through the week</h2>
        </Reveal>
        <ol className="mt-6 grid gap-3 md:grid-cols-2">
          {methods.map((step) => (
            <li key={step.step} className="rounded-3xl bg-white p-5 shadow-card">
              <span className="text-sm font-semibold text-royal">{step.step}</span>
              <h3 className="mt-1 font-semibold">{step.title}</h3>
              <p className="mt-1 text-sm text-slate-600">{step.description}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="bg-navy py-12 text-white">
        <div className="mx-auto max-w-6xl px-4">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blush">Results</p>
              <h2 className="mt-2 font-serif text-4xl">Shining stars of Vinayak</h2>
            </div>
            <a className="btn-primary" href="/achievements">
              All achievements
            </a>
          </div>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {toppers.map((topper) => (
              <article key={topper.id} className="overflow-hidden rounded-[1.75rem] bg-white text-navy shadow-card">
                {topper.photoPath ? (
                  <img src={topper.photoPath} alt="" className="h-56 w-full object-cover object-top" />
                ) : null}
                <div className="p-5">
                  <p className="font-serif text-2xl text-royal">{scoreLabel(topper.percentage, topper.description)}</p>
                  <h3 className="mt-2 font-semibold">{topper.name}</h3>
                  <p className="text-sm text-slate-500">Standard {topper.standard}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-6 px-4 py-12 lg:grid-cols-2">
        <div>
          <h2 className="font-serif text-4xl">Subject teachers</h2>
          <div className="mt-6 grid gap-3">
            {faculty.map((member) => (
              <article key={member.id} className="card flex items-center gap-4 p-4">
                <Avatar name={member.name} src={member.photoPath} className="h-14 w-14" />
                <div>
                  <h3 className="font-semibold">{member.name}</h3>
                  <p className="text-sm text-royal">{member.subjects.map((item) => item.subject.name).join(" · ") || member.description}</p>
                </div>
              </article>
            ))}
          </div>
          <a className="btn-ghost mt-5" href="/faculty">
            Meet the faculty
          </a>
        </div>
        <div>
          <h2 className="font-serif text-4xl">Notices</h2>
          <div className="mt-6 grid gap-3">
            {notices.map((notice) => (
              <article key={notice.id} className="card p-5">
                <h3 className="font-semibold">{notice.title}</h3>
                <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-600">{notice.description}</p>
                <a className="mt-3 inline-block text-sm font-semibold text-royal" href="/notices">
                  Read notice
                </a>
              </article>
            ))}
            {!notices.length ? <p className="text-sm text-slate-500">Notices published by the institute will appear here.</p> : null}
          </div>
          <a className="btn-ghost mt-5" href="/notices">
            All notices
          </a>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-6 px-4 pb-16 lg:grid-cols-[1fr_320px]">
        <div className="card p-6">
          <h2 className="font-serif text-3xl">Enquire for admission</h2>
          <p className="mt-2 text-sm text-slate-600">This form does not take a payment. The institute will call you on the number you enter.</p>
          <div className="mt-5">
            <EnquiryForm />
          </div>
        </div>
        <aside className="overflow-hidden rounded-[2rem]">
          <PageHero eyebrow="Visit" title="Gopi Cinema Road, Anand." text="204, 205, Radha Swami Sumit. Monday to Saturday." />
        </aside>
      </section>
    </SiteFrame>
  );
}
