import { Clock, MapPin, Phone } from "lucide-react";
import { whatsAppLink } from "@/lib/utils";
import type { ContactContent, FooterContent } from "@/lib/defaults";

const explore = [
  ["/", "Home"],
  ["/about", "About"],
  ["/academics", "Academics"],
  ["/faculty", "Faculty"],
  ["/achievements", "Achievements"],
  ["/gallery", "Gallery"],
  ["/notices", "Notices"],
  ["/contact", "Contact"],
] as const;

export function SiteFooter({
  footer,
  contact,
  logo,
}: {
  footer: FooterContent;
  contact: ContactContent;
  logo: string;
}) {
  return (
    <footer className="relative mt-20 overflow-hidden bg-navy text-white">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-blush/80 to-transparent" />
      <div className="pointer-events-none absolute -left-24 top-10 h-64 w-64 rounded-full bg-royal/30 blur-3xl" />
      <div className="pointer-events-none absolute -right-16 bottom-0 h-72 w-72 rounded-full bg-hot/20 blur-3xl" />
      <p className="pointer-events-none absolute -bottom-10 left-0 select-none font-serif text-[18vw] leading-none text-white/[0.04]">
        VINAYAK
      </p>
      <div className="relative mx-auto max-w-6xl px-4 py-14">
        <div className="grid gap-10 lg:grid-cols-[1.35fr_0.85fr_0.85fr_0.9fr]">
          <div>
            <div className="flex items-center gap-3">
              <img src={logo} alt="" className="h-12 w-12 rounded-2xl bg-white object-cover p-1" />
              <div>
                <p className="font-serif text-2xl leading-none">{footer.name}</p>
                <p className="mt-1 text-sm text-blush">{footer.tagline}</p>
              </div>
            </div>
            <p className="mt-5 max-w-sm text-sm leading-7 text-white/70">{footer.statement}</p>
            <div className="mt-6 flex flex-wrap gap-2">
              <a className="rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold text-blush" href="/admission-enquiry">
                Enquire for admission
              </a>
              <a className="rounded-full bg-[#25D366] px-3 py-1.5 text-xs font-semibold text-white" href={whatsAppLink(contact.phone)}>
                WhatsApp
              </a>
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blush">Explore</p>
            <div className="mt-4 grid gap-2 text-sm text-white/80">
              {explore.map(([href, label]) => (
                <a key={href} href={href} className="transition hover:text-white">
                  {label}
                </a>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blush">Visit</p>
            <div className="mt-4 grid gap-4 text-sm text-white/75">
              <p className="flex gap-2">
                <MapPin size={16} className="mt-0.5 shrink-0 text-blush" />
                {contact.address}
              </p>
              <p className="flex gap-2">
                <Clock size={16} className="mt-0.5 shrink-0 text-blush" />
                {contact.hours}
              </p>
              <a className="flex gap-2 hover:text-white" href={`tel:${contact.phone.replace(/\s/g, "")}`}>
                <Phone size={16} className="mt-0.5 shrink-0 text-blush" />
                {contact.phone}
              </a>
              {contact.email ? <p>{contact.email}</p> : null}
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blush">Portals</p>
            <div className="mt-4 grid gap-2 text-sm">
              <a className="rounded-2xl bg-white/10 px-4 py-3 text-white/85 transition hover:bg-white/15" href="/student/login">
                Student Login
              </a>
              <a className="rounded-2xl bg-white/10 px-4 py-3 text-white/85 transition hover:bg-white/15" href="/faculty/login">
                Faculty Login
              </a>
              <a className="rounded-2xl bg-white/10 px-4 py-3 text-white/85 transition hover:bg-white/15" href="/admin/login">
                Admin Login
              </a>
            </div>
          </div>
        </div>
        <div className="mt-12 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-5 text-xs text-white/50">
          <p>© {new Date().getFullYear()} Vinayak Tutorials, Anand. English-medium personal group tuition since 2003.</p>
          <p>GSEB · CBSE · Standards 6–12</p>
        </div>
        <p className="mt-4 text-center text-xs text-white/45">
          Made by HKS Web Development Company{" "}
          <a className="text-blush hover:text-white" href="tel:9406112110">
            9406112110
          </a>
        </p>
      </div>
    </footer>
  );
}
