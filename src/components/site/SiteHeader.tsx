"use client";

import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";

const links = [
  ["/", "Home"],
  ["/about", "About Us"],
  ["/academics", "Academics"],
  ["/faculty", "Our Faculty"],
  ["/achievements", "Achievements"],
  ["/gallery", "Gallery"],
  ["/notices", "Notices"],
  ["/contact", "Contact Us"],
] as const;

export function SiteHeader({ logo }: { logo: string }) {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header className="sticky top-0 z-50 border-b border-navy/5 bg-white/80 shadow-[0_10px_40px_-28px_rgba(16,29,66,0.45)] backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
        <a href="/" className="flex items-center gap-3">
          <img src={logo} alt="" className="h-11 w-11 rounded-2xl object-cover" />
          <span>
            <span className="block font-serif text-lg leading-none text-navy">Vinayak Tutorials</span>
            <span className="text-xs text-slate-500">Educate Your Knowledge</span>
          </span>
        </a>
        <nav className="hidden items-center gap-5 text-sm font-medium text-slate-600 xl:flex">
          {links.map(([href, label]) => (
            <a key={href} href={href} className="transition hover:text-royal">
              {label}
            </a>
          ))}
        </nav>
        <div className="hidden items-center gap-2 lg:flex">
          <a href="/student/login" className="btn-ghost">Student Login</a>
          <a href="/faculty/login" className="btn-ghost">Faculty Login</a>
          <a href="/admission-enquiry" className="btn-primary">Enquire Now</a>
        </div>
        <button type="button" className="grid h-11 w-11 place-items-center rounded-2xl border border-slate-200 xl:hidden" aria-label={open ? "Close menu" : "Open menu"} onClick={() => setOpen((value) => !value)}>
          {open ? <X size={18} /> : <Menu size={18} />}
        </button>
      </div>
      {open ? (
        <div className="border-t border-slate-100 bg-white px-4 py-4 xl:hidden">
          <div className="grid gap-2 text-sm font-medium">
            {links.map(([href, label]) => (
              <a key={href} href={href} onClick={() => setOpen(false)} className="rounded-2xl px-3 py-2 hover:bg-ice">
                {label}
              </a>
            ))}
            <a href="/student/login" className="rounded-2xl px-3 py-2 hover:bg-ice">Student Login</a>
            <a href="/faculty/login" className="rounded-2xl px-3 py-2 hover:bg-ice">Faculty Login</a>
            <a href="/admission-enquiry" className="btn-primary mt-2">Enquire Now</a>
          </div>
        </div>
      ) : null}
    </header>
  );
}
