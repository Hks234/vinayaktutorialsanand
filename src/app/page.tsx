import { EnquiryForm } from "@/components/forms";
import { BannerSlider } from "@/components/site/BannerSlider";
import { AccentHeading } from "@/components/site/AccentHeading";
import { FaqAccordion } from "@/components/site/FaqAccordion";
import { FloatingChips } from "@/components/site/FloatingChips";
import { LogoMarquee } from "@/components/site/LogoMarquee";
import { Reveal } from "@/components/site/Reveal";
import { SiteFrame } from "@/components/site/SiteFrame";
import { TopperPdfFrame } from "@/components/site/TopperPdfFrame";
import { Avatar } from "@/components/ui";
import { getAbout, getFeatures, getHero, getMethods, getPrograms, getTopperPdfs, activeBanners } from "@/lib/content";
import { prisma } from "@/lib/prisma";
import { publicNoticeWhere } from "@/lib/visibility";
import { ShieldCheck } from "lucide-react";

const stats = [
  { value: "2003", label: "Teaching in Anand since" },
  { value: "6–12", label: "Standards, GSEB & CBSE" },
  { value: "30", label: "Maximum students per batch" },
  { value: "6 days", label: "Teaching, Monday to Saturday" },
];

const programmeBadges = ["Most Popular", "Science", "Science"] as const;

export default async function HomePage() {
  const [hero, about, programs, features, methods, banners, toppersPdfs, faculty, notices] = await Promise.all([
    getHero(),
    getAbout(),
    getPrograms(),
    getFeatures(),
    getMethods(),
    activeBanners(),
    getTopperPdfs(),
    prisma.faculty.findMany({
      where: { deletedAt: null, visibleOnWebsite: true, status: "active" },
      include: { subjects: { include: { subject: true } } },
      orderBy: { displayOrder: "asc" },
      take: 8,
    }),
    prisma.notice.findMany({
      where: publicNoticeWhere(),
      orderBy: { publishAt: "desc" },
      take: 3,
    }),
  ]);

  return (
    <SiteFrame>
      <section className="relative overflow-hidden text-white">
        <div className="hero-mesh absolute inset-0" />
        <div className="orb -left-10 top-10 h-72 w-72 bg-orange/25" />
        <div className="orb right-[20%] top-24 h-56 w-56 bg-fuchsia-500/20" />
        <div className="orb bottom-0 right-0 h-80 w-80 bg-royal/40" />
        {hero.backgroundImage ? (
          <img src={hero.backgroundImage} alt="" className="absolute inset-0 h-full w-full object-cover opacity-25" />
        ) : null}
        <div className="relative mx-auto grid max-w-6xl items-center gap-10 px-4 pb-24 pt-12 md:pb-28 md:pt-16 lg:grid-cols-[1.08fr_0.92fr]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-orange">Vinayak Tutorials · Anand</p>
            <AccentHeading as="h1" text={hero.heading} className="mt-4 max-w-3xl text-4xl font-semibold leading-[1.08] md:text-6xl" />
            <p className="mt-5 max-w-xl text-base leading-7 text-white/80">{hero.description}</p>
            <div className="mt-7 flex flex-wrap gap-3">
              <a className="btn-outline" href="#programmes">
                {hero.secondaryCtaText} ↓
              </a>
              <a className="btn-primary" href={hero.primaryCtaHref}>
                {hero.primaryCtaText} →
              </a>
            </div>
            <div className="mt-8 flex flex-wrap items-center gap-3 text-sm text-white/80">
              {hero.pills.map((pill) => (
                <span key={pill} className="rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-semibold">
                  {pill}
                </span>
              ))}
            </div>
          </div>
          <div className="relative min-h-[420px]">
            {hero.image ? (
              <img
                src={hero.image}
                alt=""
                className="absolute inset-0 h-full w-full rounded-[1.75rem] object-cover opacity-70"
              />
            ) : (
              <FloatingChips />
            )}
            {hero.image ? <FloatingChips /> : null}
            <div className="relative z-10 ml-auto w-full max-w-md rounded-3xl bg-white p-5 text-plum shadow-[0_30px_80px_-28px_rgba(0,0,0,0.55)]">
              <h2 className="text-lg font-semibold leading-snug">The right batch can change a school year.</h2>
              <p className="mt-1 text-sm text-slate-500">Tell us the standard. The institute will call you.</p>
              <div className="mt-4">
                <EnquiryForm variant="hero" />
              </div>
              <p className="mt-3 flex items-center gap-2 text-xs text-slate-500">
                <ShieldCheck size={14} className="text-orange" />
                100% private. Details stay with Vinayak Tutorials.
              </p>
            </div>
          </div>
        </div>
        <div className="relative z-10 mx-auto -mb-8 max-w-6xl px-4">
          <div className="grid overflow-hidden rounded-[1.75rem] bg-[#3a0d58] shadow-[0_24px_60px_-28px_rgba(0,0,0,0.55)] sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat, index) => (
              <div key={stat.label} className={`px-6 py-7 text-center ${index ? "border-t border-white/10 sm:border-t-0 sm:border-l" : ""}`}>
                <p className="text-3xl font-semibold text-white">{stat.value}</p>
                <p className="mt-1 text-sm text-white/70">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <BannerSlider banners={banners} />

      <section id="programmes" className="bg-plum pb-16 pt-20 text-white">
        <div className="mx-auto max-w-6xl px-4">
          <Reveal className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="inline-flex rounded-full border border-white/20 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em]">
                Our courses
              </p>
              <AccentHeading text="Explore Our Programmes" className="mt-3 text-4xl font-semibold" />
            </div>
            <a className="btn-outline" href="/academics">
              View All Programmes →
            </a>
          </Reveal>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {programs.map((program, index) => (
              <Reveal key={program.title} delay={index * 0.08}>
                <article className="relative flex h-full flex-col rounded-[1.6rem] bg-white p-6 text-plum">
                  <span className="absolute -top-3 left-6 rounded-full bg-plum px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-white">
                    {programmeBadges[index] || program.board}
                  </span>
                  <p className="mt-3 text-xs font-semibold uppercase tracking-wider text-orange">{program.board}</p>
                  <h3 className="mt-2 text-2xl font-semibold">{program.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-slate-600">{program.blurb}</p>
                  <ul className="mt-4 grid gap-1 text-sm text-plum">
                    {program.subjects.map((subject) => (
                      <li key={subject}>• {subject}</li>
                    ))}
                  </ul>
                  <a className="btn-primary mt-6" href={program.enquire}>
                    Enquire Now →
                  </a>
                  <a className="mt-3 text-center text-sm font-semibold text-plum/70 hover:text-plum" href="/academics">
                    Know more →
                  </a>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <LogoMarquee />

      <section className="mx-auto max-w-6xl px-4 py-16">
        <Reveal className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr]">
          <article>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-orange">{about.eyebrow}</p>
            <AccentHeading text={about.title} className="mt-3 text-4xl font-semibold text-plum" />
            <p className="mt-4 text-sm leading-7 text-slate-600">{about.body}</p>
            <a className="btn-navy mt-6" href="/about">
              About the institute →
            </a>
          </article>
          <div className="grid gap-3">
            {features.slice(0, 4).map((feature, index) => (
              <article key={feature.title} className="card p-5" style={{ transitionDelay: `${index * 40}ms` }}>
                <h3 className="font-semibold text-plum">{feature.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{feature.description}</p>
              </article>
            ))}
          </div>
        </Reveal>
      </section>

      <section className="bg-plum py-16 text-white">
        <div className="mx-auto max-w-6xl px-4">
          <Reveal>
            <AccentHeading text="The Vinayak advantage" className="text-4xl font-semibold" />
            <p className="mt-3 max-w-2xl text-sm leading-7 text-white/70">
              Built for weekday school students: daily teaching, checked homework, tests that actually follow the chapter, and a batch small enough for the teacher to know each learner.
            </p>
          </Reveal>
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {features.slice(0, 6).map((feature, index) => (
              <Reveal key={feature.title} delay={index * 0.05}>
                <article className="rounded-3xl border border-white/10 bg-white/5 p-6">
                  <h3 className="text-lg font-semibold">{feature.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-white/70">{feature.description}</p>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16">
        <Reveal>
          <AccentHeading text="How teaching moves through the week" className="text-4xl font-semibold text-plum" />
        </Reveal>
        <ol className="mt-8 grid gap-3 md:grid-cols-2">
          {methods.map((step, index) => (
            <Reveal key={step.step} delay={index * 0.04}>
              <li className="rounded-3xl bg-white p-5 shadow-card">
                <span className="text-sm font-semibold text-orange">{step.step}</span>
                <h3 className="mt-1 font-semibold text-plum">{step.title}</h3>
                <p className="mt-1 text-sm text-slate-600">{step.description}</p>
              </li>
            </Reveal>
          ))}
        </ol>
      </section>

      <section className="bg-[#140422] py-16 text-white">
        <div className="mx-auto max-w-6xl px-4">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-orange">Results</p>
              <AccentHeading text="Shining stars of Vinayak" className="mt-2 text-4xl font-semibold" />
            </div>
            <a className="btn-primary" href="/achievements">
              All achievements →
            </a>
          </div>
          <div className="mt-8 grid gap-6">
            {toppersPdfs.map((item) => (
              <TopperPdfFrame key={item.id} title={item.title} path={item.path} />
            ))}
            {!toppersPdfs.length ? (
              <p className="text-sm text-white/70">The toppers PDF will appear here after the institute uploads it.</p>
            ) : null}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <AccentHeading text="Subject teachers" className="text-4xl font-semibold text-plum" />
          <a className="btn-ghost" href="/faculty">
            Meet the faculty →
          </a>
        </div>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {faculty.map((member) => (
            <article key={member.id} className="overflow-hidden rounded-[1.6rem] bg-white shadow-card">
              {member.photoPath ? (
                <img src={member.photoPath} alt={member.name} className="portrait-photo h-72 w-full" />
              ) : (
                <div className="grid h-48 place-items-center bg-ice">
                  <Avatar name={member.name} className="h-20 w-20" />
                </div>
              )}
              <div className="p-5">
                <h3 className="font-semibold text-plum">{member.name}</h3>
                <p className="mt-1 text-sm text-orange">{member.subjects.map((item) => item.subject.name).join(" · ") || member.description}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-16">
        <AccentHeading text="Institute notices" className="text-4xl font-semibold text-plum" />
        <div className="mt-6 grid gap-3 md:grid-cols-3">
          {notices.map((notice) => (
            <article key={notice.id} className="card p-5">
              <h3 className="font-semibold">{notice.title}</h3>
              <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-600">{notice.description}</p>
              <a className="mt-3 inline-block text-sm font-semibold text-orange" href="/notices">
                Read notice →
              </a>
            </article>
          ))}
          {!notices.length ? <p className="text-sm text-slate-500">Notices published by the institute will appear here.</p> : null}
        </div>
        <a className="btn-ghost mt-5" href="/notices">
          All notices →
        </a>
      </section>

      <section className="bg-plum py-16 text-white">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 lg:grid-cols-[1.05fr_0.95fr]">
          <Reveal>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-orange">You asked, we answered</p>
            <AccentHeading text="Questions parents usually have" className="mt-3 text-4xl font-semibold" />
            <p className="mt-3 max-w-xl text-sm leading-7 text-white/70">
              If you still want to see a classroom before you decide, visit Gopi Cinema Road or send an enquiry. The office will call back.
            </p>
          </Reveal>
          <FaqAccordion />
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-6 px-4 py-16 lg:grid-cols-[1fr_340px]">
        <div className="card p-7">
          <AccentHeading text="Our counsellor can clear any confusion" className="text-3xl font-semibold text-plum" />
          <p className="mt-2 text-sm text-slate-600">This form does not take a payment. The institute will call you on the number you enter.</p>
          <div className="mt-5">
            <EnquiryForm />
          </div>
        </div>
        <aside className="overflow-hidden rounded-[1.75rem] bg-plum p-7 text-white">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-orange">Visit</p>
          <h2 className="mt-3 text-3xl font-semibold">Gopi Cinema Road, Anand.</h2>
          <p className="mt-3 text-sm leading-7 text-white/75">204, 205, Radha Swami Sumit. Monday to Saturday.</p>
          <a className="btn-primary mt-6" href="/contact">
            Get directions →
          </a>
        </aside>
      </section>
    </SiteFrame>
  );
}
