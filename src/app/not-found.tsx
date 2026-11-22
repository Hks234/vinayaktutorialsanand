import { SiteFrame } from "@/components/site/SiteFrame";

export default function NotFound() {
  return (
    <SiteFrame>
      <section className="mx-auto max-w-xl px-4 py-24 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-hot">404</p>
        <h1 className="mt-3 font-serif text-4xl">This page is not on the site.</h1>
        <a className="btn-primary mt-6" href="/">Back to home</a>
      </section>
    </SiteFrame>
  );
}
