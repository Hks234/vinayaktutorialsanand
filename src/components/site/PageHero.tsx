export function PageHero({ eyebrow, title, text }: { eyebrow: string; title: string; text: string }) {
  return (
    <section className="relative overflow-hidden text-white">
      <div className="hero-mesh absolute inset-0" />
      <div className="orb left-[10%] top-6 h-40 w-40 bg-orange/25" />
      <div className="orb right-[8%] bottom-0 h-48 w-48 bg-royal/50" />
      <p className="pointer-events-none absolute -right-6 top-6 select-none text-[16vw] font-semibold leading-none text-white/[0.06] md:text-[8.5rem]">
        VINAYAK
      </p>
      <div className="relative mx-auto max-w-6xl px-4 py-16 md:py-20">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-orange">{eyebrow}</p>
        <h1 className="mt-3 max-w-3xl text-4xl font-semibold leading-tight md:text-5xl">{title}</h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-white/80">{text}</p>
      </div>
    </section>
  );
}
