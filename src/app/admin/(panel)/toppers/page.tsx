import { BoundForm, Field, RunButton } from "@/components/forms";
import { Empty } from "@/components/ui";
import { getTopperPdfs } from "@/lib/content";
import { deleteTopperPdf, saveTopperPdf } from "@/server/content-actions";

export default async function ToppersAdmin() {
  const pdfs = await getTopperPdfs();
  return (
    <div className="grid gap-6">
      <div>
        <h1 className="font-serif text-3xl">Toppers</h1>
        <p className="text-sm text-slate-500">Upload a PDF of our toppers. It is shown on the homepage and the achievements page instead of photographs. The public headline stays “Shining stars of Vinayak”.</p>
      </div>
      <section className="panel">
        <h2 className="font-serif text-2xl">Add toppers PDF</h2>
        <BoundForm action={saveTopperPdf} uploadFolder="toppers" className="mt-4 grid gap-3 md:grid-cols-2" submit="Upload PDF">
          <Field label="Headline on the PDF card" name="title" defaultValue="Our toppers" />
          <label className="text-sm">
            <span className="label">PDF file</span>
            <input name="pdf" type="file" accept="application/pdf,.pdf" className="field" required />
            <span className="mt-1 block text-xs text-slate-500">PDF only, under 10 MB.</span>
          </label>
        </BoundForm>
      </section>
      <div className="grid gap-3">
        {pdfs.map((item) => (
          <article key={item.id} className="card grid gap-3 p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-semibold">{item.title}</p>
                <a className="text-sm font-semibold text-royal" href={item.path} target="_blank" rel="noreferrer">Open PDF</a>
              </div>
              <RunButton label="Remove" danger confirm="Remove this toppers PDF from the website?" run={deleteTopperPdf.bind(null, item.id)} />
            </div>
            <iframe src={`${item.path}#view=FitH`} title={item.title} className="h-80 w-full rounded-2xl border-0 bg-ice" />
          </article>
        ))}
        {!pdfs.length ? <Empty title="No toppers PDF yet" text="Upload a PDF above. Visitors will see it on the homepage under Shining stars of Vinayak." /> : null}
      </div>
    </div>
  );
}
