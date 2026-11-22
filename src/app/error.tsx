"use client";

export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <section className="mx-auto max-w-xl px-4 py-24 text-center">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-hot">Something went wrong</p>
      <h1 className="mt-3 font-serif text-4xl text-navy">This page could not be loaded.</h1>
      <p className="mt-3 text-sm text-slate-500">Try again, or return to the homepage.</p>
      <div className="mt-6 flex justify-center gap-3">
        <button type="button" className="btn-primary" onClick={reset}>
          Try again
        </button>
        <a className="btn-ghost" href="/">
          Back to home
        </a>
      </div>
    </section>
  );
}
