import { getContact, getFooter, getLogo } from "@/lib/content";
import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteHeader } from "@/components/site/SiteHeader";
import { whatsAppLink } from "@/lib/utils";

export async function SiteFrame({ children }: { children: React.ReactNode }) {
  const [logo, footer, contact] = await Promise.all([getLogo(), getFooter(), getContact()]);
  return (
    <div className="min-h-screen">
      <a href="#content" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[60] focus:rounded-full focus:bg-white focus:px-4 focus:py-2">
        Skip to content
      </a>
      <SiteHeader logo={logo} />
      <main id="content">{children}</main>
      <a
        href={whatsAppLink(contact.phone, "Hello Vinayak Tutorials, I would like to enquire about admission.")}
        className="fixed bottom-5 right-5 z-40 rounded-full bg-[#25D366] px-4 py-3 text-sm font-semibold text-white shadow-[0_18px_40px_-18px_rgba(37,211,102,0.9)]"
      >
        WhatsApp
      </a>
      <SiteFooter footer={footer} contact={contact} logo={logo} />
    </div>
  );
}
