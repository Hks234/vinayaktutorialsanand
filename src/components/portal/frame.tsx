"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { Bell, LogOut, Menu, X } from "lucide-react";
import { logoutAction } from "@/server/auth-actions";
import { Avatar } from "@/components/ui";

export type PortalLink = { href: string; label: string };

export function PortalFrame({
  name,
  subtitle,
  photo,
  unread,
  home,
  links,
  children,
}: {
  name: string;
  subtitle: string;
  photo?: string | null;
  unread: number;
  home: string;
  links: PortalLink[];
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const nav = (
    <nav className="grid gap-1 text-sm">
      {links.map((link) => {
        const active = pathname === link.href || (link.href !== home && pathname.startsWith(link.href));
        return (
          <a
            key={link.href}
            href={link.href}
            onClick={() => setOpen(false)}
            className={`rounded-2xl px-3 py-2 font-medium ${active ? "bg-white text-royal" : "text-white/80 hover:bg-white/10"}`}
          >
            {link.label}
          </a>
        );
      })}
    </nav>
  );
  return (
    <div className="min-h-screen bg-ice lg:grid lg:grid-cols-[260px_1fr]">
      <aside className="hidden bg-navy p-5 text-white lg:block">
        <a href="/" className="block font-serif text-xl">Vinayak Tutorials</a>
        <p className="mt-1 text-xs text-white/60">Educate Your Knowledge</p>
        <div className="mt-8">{nav}</div>
      </aside>
      <div>
        <header className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-white/70 bg-white/80 px-4 py-3 backdrop-blur">
          <button type="button" className="grid h-10 w-10 place-items-center rounded-2xl border border-slate-200 lg:hidden" aria-label="Open menu" onClick={() => setOpen(true)}>
            <Menu size={18} />
          </button>
          <div className="hidden text-sm text-slate-500 lg:block">Institute portal</div>
          <div className="ml-auto flex items-center gap-3">
            <a href={`${home.replace("/dashboard", "")}/notifications`} className="relative grid h-10 w-10 place-items-center rounded-2xl border border-slate-200">
              <Bell size={16} />
              {unread > 0 ? <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-hot px-1 text-[10px] font-bold text-white">{unread}</span> : null}
            </a>
            <div className="hidden text-right sm:block">
              <p className="text-sm font-semibold">{name}</p>
              <p className="text-xs text-slate-500">{subtitle}</p>
            </div>
            <Avatar name={name} src={photo} />
            <form action={logoutAction}>
              <button className="btn-ghost" type="submit"><LogOut size={14} /> Sign out</button>
            </form>
          </div>
        </header>
        <div className="px-4 py-6 md:px-8">{children}</div>
      </div>
      {open ? (
        <div className="fixed inset-0 z-40 bg-navy/40 lg:hidden" onClick={() => setOpen(false)}>
          <div className="h-full w-72 bg-navy p-5 text-white" onClick={(event) => event.stopPropagation()}>
            <div className="mb-6 flex items-center justify-between">
              <span className="font-serif text-xl">Vinayak Tutorials</span>
              <button type="button" aria-label="Close menu" onClick={() => setOpen(false)}><X size={18} /></button>
            </div>
            {nav}
          </div>
        </div>
      ) : null}
    </div>
  );
}
