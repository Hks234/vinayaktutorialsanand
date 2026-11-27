export function TopperPdfFrame({ title, path }: { title: string; path: string }) {
  return (
    <article className="overflow-hidden rounded-[1.6rem] bg-white text-plum shadow-card">
      <iframe
        src={`${path}#view=FitH`}
        title={title}
        className="h-[min(82vh,980px)] w-full border-0 bg-white"
      />
      <div className="flex flex-wrap items-center justify-between gap-3 p-4">
        <p className="font-semibold">{title}</p>
        <a className="btn-ghost" href={path} target="_blank" rel="noreferrer">
          Open PDF
        </a>
      </div>
    </article>
  );
}
