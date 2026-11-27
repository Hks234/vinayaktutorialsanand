const items = [
  "GSEB",
  "CBSE",
  "Standard 6–10",
  "PCM",
  "PCB",
  "Mathematics",
  "Science",
  "Physics",
  "Chemistry",
  "Biology",
  "English",
  "Social Science",
  "A.G.W. Tests",
  "Chapter Tests",
  "Since 2003",
];

export function LogoMarquee({ label = "What students prepare for here" }: { label?: string }) {
  const loop = [...items, ...items];
  return (
    <section className="overflow-hidden bg-white py-10">
      <p className="mb-6 text-center text-xs font-semibold uppercase tracking-[0.22em] text-royal">{label}</p>
      <div className="relative">
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-white to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-white to-transparent" />
        <div className="marquee-track gap-3 px-4">
          {loop.map((item, index) => (
            <span
              key={`${item}-${index}`}
              className="rounded-full border border-plum/10 bg-ice px-5 py-2 text-sm font-semibold text-plum"
            >
              {item}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
