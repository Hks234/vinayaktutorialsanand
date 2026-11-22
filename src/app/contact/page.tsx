import type { Metadata } from "next";
import { ContactForm } from "@/components/forms";
import { PageHero } from "@/components/site/PageHero";
import { SiteFrame } from "@/components/site/SiteFrame";
import { getContact } from "@/lib/content";
import { whatsAppLink } from "@/lib/utils";

export const metadata: Metadata = { title: "Contact Us" };

export default async function ContactPage() {
  const contact = await getContact();
  const map = `https://maps.google.com/maps?q=${encodeURIComponent(contact.mapQuery)}&z=16&output=embed`;
  return (
    <SiteFrame>
      <PageHero eyebrow="Anand" title="Visit Vinayak Tutorials." text={contact.address} />
      <section className="mx-auto grid max-w-6xl gap-6 px-4 py-12 lg:grid-cols-[0.85fr_1.15fr]">
        <div className="card p-6">
          <h2 className="font-serif text-2xl">Talk to the institute</h2>
          <p className="mt-3 text-sm leading-6 text-slate-600">{contact.address}</p>
          <p className="mt-3 text-sm"><a className="font-semibold text-royal" href={`tel:${contact.phone.replace(/\s/g, "")}`}>{contact.phone}</a></p>
          <p className="mt-2 text-sm text-slate-600">{contact.hours}</p>
          {contact.email ? <p className="mt-2 text-sm">{contact.email}</p> : null}
          <a className="btn-primary mt-5" href={whatsAppLink(contact.phone, "Hello Vinayak Tutorials, I would like to enquire about admission.")}>WhatsApp</a>
          <div className="mt-8">
            <ContactForm />
          </div>
        </div>
        <iframe title="Map to Vinayak Tutorials" src={map} className="min-h-[420px] w-full rounded-[2rem] border-0 shadow-card" loading="lazy" />
      </section>
    </SiteFrame>
  );
}
