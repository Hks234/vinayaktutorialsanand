export function PageHero({ eyebrow, title, text }: { eyebrow: string; title: string; text: string }) {
  return (
    <section className="relative overflow-hidden bg-navy text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(241,91,155,0.35),transparent_36%),radial-gradient(circle_at_bottom_left,rgba(255,121,59,0.25),transparent_32%)]" />
      <p className="pointer-events-none absolute -right-6 top-6 select-none font-serif text-[18vw] leading-none text-white/[0.06] md:text-[9rem]">
        VINAYAK
      </p>
      <div className="relative mx-auto max-w-6xl px-4 py-16 md:py-20">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-blush">{eyebrow}</p>
        <h1 className="mt-3 max-w-3xl font-serif text-4xl leading-tight md:text-5xl">{title}</h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-white/80">{text}</p>
      </div>
    </section>
  );
}
