import { initials } from "@/lib/utils";

export function Stat({ label, value, hint }: { label: string; value: string | number; hint?: string }) {
  return (
    <div className="card p-5">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-2 font-serif text-3xl text-navy">{value}</p>
      {hint ? <p className="mt-1 text-xs text-slate-500">{hint}</p> : null}
    </div>
  );
}

export function Empty({ title, text }: { title: string; text: string }) {
  return (
    <div className="card border-dashed p-8 text-center">
      <p className="font-semibold text-navy">{title}</p>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">{text}</p>
    </div>
  );
}

export function Avatar({ name, src, className = "h-11 w-11" }: { name: string; src?: string | null; className?: string }) {
  if (src) return <img src={src} alt="" className={`${className} rounded-2xl object-cover`} />;
  return (
    <span className={`${className} grid place-items-center rounded-2xl bg-ice font-semibold text-royal`}>
      {initials(name) || "VT"}
    </span>
  );
}

export function Pager({ page, pages, href }: { page: number; pages: number; href: string }) {
  if (pages <= 1) return null;
  const link = (next: number) => `${href}${href.includes("?") ? "&" : "?"}page=${next}`;
  return (
    <div className="mt-4 flex items-center justify-between text-sm">
      <a className={`btn-ghost ${page <= 1 ? "pointer-events-none opacity-40" : ""}`} href={link(page - 1)}>Previous</a>
      <span className="text-slate-500">Page {page} of {pages}</span>
      <a className={`btn-ghost ${page >= pages ? "pointer-events-none opacity-40" : ""}`} href={link(page + 1)}>Next</a>
    </div>
  );
}

export function Badge({ children, tone = "blue" }: { children: React.ReactNode; tone?: "blue" | "pink" | "orange" | "slate" }) {
  const tones = {
    blue: "bg-ice text-royal",
    pink: "bg-blush/50 text-navy",
    orange: "bg-orange/10 text-orange",
    slate: "bg-slate-100 text-slate-600",
  };
  return <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${tones[tone]}`}>{children}</span>;
}
