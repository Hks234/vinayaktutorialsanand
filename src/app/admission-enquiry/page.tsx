import type { Metadata } from "next";
import { EnquiryForm } from "@/components/forms";
import { PageHero } from "@/components/site/PageHero";
import { SiteFrame } from "@/components/site/SiteFrame";
import { getContact } from "@/lib/content";
import { one, whatsAppLink } from "@/lib/utils";

export const metadata: Metadata = { title: "Admission Enquiry" };

export default async function AdmissionPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const query = await searchParams;
  const contact = await getContact();
  return (
    <SiteFrame>
      <PageHero eyebrow="Admissions" title="Enquire for a seat in the next batch." text="Tell us the standard, board and a phone number. The institute will call you. This form does not reserve a seat or take a payment." />
      <section className="mx-auto grid max-w-6xl gap-6 px-4 py-12 lg:grid-cols-[1fr_280px]">
        <div className="card p-6">
          <EnquiryForm standard={one(query.standard)} stream={one(query.stream)} />
        </div>
        <aside className="card h-fit p-6">
          <h2 className="text-2xl font-semibold text-plum">Prefer WhatsApp?</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">Send the student’s name, standard and board on WhatsApp.</p>
          <a className="btn-primary mt-4" href={whatsAppLink(contact.phone, "Admission enquiry for Vinayak Tutorials. Student name, standard and board:")}>Open WhatsApp</a>
          <p className="mt-4 text-sm text-slate-500">{contact.phone}</p>
        </aside>
      </section>
    </SiteFrame>
  );
}
