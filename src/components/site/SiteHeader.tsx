"use client";

import { useEffect, useState } from "react";
import { ChevronDown, Menu, X } from "lucide-react";

const links = [
  ["/", "Home"],
  ["/about", "About"],
  ["/faculty", "Faculty"],
  ["/achievements", "Achievements"],
  ["/gallery", "Gallery"],
  ["/notices", "Notices"],
  ["/contact", "Contact"],
] as const;

const courses = [
  ["/academics", "All programmes"],
  ["/admission-enquiry?standard=Standard%208", "Standard 6–10"],
  ["/admission-enquiry?standard=Standard%2011&stream=PCM", "Standard 11–12 PCM"],
  ["/admission-enquiry?standard=Standard%2011&stream=PCB", "Standard 11–12 PCB"],
] as const;

export function SiteHeader({ logo }: { logo: string }) {
  const [open, setOpen] = useState(false);
  const [coursesOpen, setCoursesOpen] = useState(false);
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header className="sticky top-0 z-50 border-b border-plum/5 bg-white/90 shadow-[0_10px_40px_-28px_rgba(43,11,69,0.45)] backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
        <a href="/" className="flex items-center gap-3">
          <img src={logo} alt="" className="h-11 w-11 rounded-2xl object-cover" />
          <span>
            <span className="block text-lg font-semibold leading-none text-plum">Vinayak Tutorials</span>
            <span className="text-[11px] font-medium uppercase tracking-[0.16em] text-orange">Since 2003 · Anand</span>
          </span>
        </a>
        <nav className="hidden items-center gap-1 text-sm font-medium text-plum/80 xl:flex">
          <div className="relative">
            <button
              type="button"
              className="inline-flex items-center gap-1 rounded-full border border-plum/20 px-4 py-2 text-plum"
              onClick={() => setCoursesOpen((value) => !value)}
              aria-expanded={coursesOpen}
            >
              View Courses
              <ChevronDown size={16} />
            </button>
            {coursesOpen ? (
              <div className="absolute left-0 top-full z-20 mt-2 w-56 rounded-2xl border border-plum/10 bg-white p-2 shadow-card">
                {courses.map(([href, label]) => (
                  <a key={href} href={href} className="block rounded-xl px-3 py-2 text-sm hover:bg-ice" onClick={() => setCoursesOpen(false)}>
                    {label}
                  </a>
                ))}
              </div>
            ) : null}
          </div>
          {links.map(([href, label]) => (
            <a key={href} href={href} className="rounded-full px-3 py-2 transition hover:text-orange">
              {label}
            </a>
          ))}
        </nav>
        <div className="hidden items-center gap-2 lg:flex">
          <a href="/student/login" className="text-sm font-semibold text-plum/70 hover:text-plum">
            Student Login
          </a>
          <a href="/admission-enquiry" className="btn-primary">
            Enquire Now <span aria-hidden>→</span>
          </a>
        </div>
        <button
          type="button"
          className="grid h-11 w-11 place-items-center rounded-2xl border border-slate-200 xl:hidden"
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((value) => !value)}
        >
          {open ? <X size={18} /> : <Menu size={18} />}
        </button>
      </div>
      {open ? (
        <div className="border-t border-slate-100 bg-white px-4 py-4 xl:hidden">
          <div className="grid gap-2 text-sm font-medium">
            {courses.map(([href, label]) => (
              <a key={href} href={href} onClick={() => setOpen(false)} className="rounded-2xl px-3 py-2 hover:bg-ice">
                {label}
              </a>
            ))}
            {links.map(([href, label]) => (
              <a key={href} href={href} onClick={() => setOpen(false)} className="rounded-2xl px-3 py-2 hover:bg-ice">
                {label}
              </a>
            ))}
            <a href="/student/login" className="rounded-2xl px-3 py-2 hover:bg-ice">
              Student Login
            </a>
            <a href="/faculty/login" className="rounded-2xl px-3 py-2 hover:bg-ice">
              Faculty Login
            </a>
            <a href="/admission-enquiry" className="btn-primary mt-2">
              Enquire Now →
            </a>
          </div>
        </div>
      ) : null}
    </header>
  );
}
