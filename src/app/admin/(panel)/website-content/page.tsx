import { BoundForm, Field, JsonSectionForm } from "@/components/forms";
import { getAbout, getContact, getFeatures, getFooter, getHero, getLogo, getMethods, getPrograms } from "@/lib/content";
import type { Feature, MethodStep, Program } from "@/lib/defaults";
import { saveAbout, saveContactSettings, saveHero } from "@/server/content-actions";

export default async function WebsiteContentPage() {
  const [hero, about, programs, features, methods, contact, footer, logo] = await Promise.all([
    getHero(), getAbout(), getPrograms(), getFeatures(), getMethods(), getContact(), getFooter(), getLogo(),
  ]);
  return (
    <div className="grid gap-6">
      <div>
        <h1 className="font-serif text-3xl">Website content</h1>
        <p className="text-sm text-slate-500">Changes here appear on the public site after you save. Current logo: {logo}</p>
      </div>
      <section className="panel">
        <h2 className="font-serif text-2xl">Homepage hero</h2>
        <BoundForm action={saveHero} uploadFolder="hero" className="mt-4 grid gap-3">
          <Field label="Heading" name="heading" defaultValue={hero.heading} />
          <label className="text-sm"><span className="label">Description</span><textarea name="description" className="field min-h-24" defaultValue={hero.description} /></label>
          <label className="text-sm"><span className="label">Highlight lines, one per line</span><textarea name="pills" className="field min-h-24" defaultValue={hero.pills.join("\n")} /></label>
          <div className="grid gap-3 md:grid-cols-2">
            <Field label="Primary button" name="primaryCtaText" defaultValue={hero.primaryCtaText} />
            <Field label="Primary link" name="primaryCtaHref" defaultValue={hero.primaryCtaHref} />
            <Field label="Secondary button" name="secondaryCtaText" defaultValue={hero.secondaryCtaText} />
            <Field label="Secondary link" name="secondaryCtaHref" defaultValue={hero.secondaryCtaHref} />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="text-sm">
              <span className="label">Classroom photograph</span>
              {hero.image ? <img src={hero.image} alt="" className="mb-2 h-40 w-full rounded-2xl object-cover" /> : null}
              <input name="image" type="file" accept="image/*" className="field" />
              <span className="mt-1 block text-xs text-slate-500">Shown on the right of the homepage. Leave empty to keep the current photo.</span>
            </label>
            <label className="text-sm">
              <span className="label">Background image</span>
              {hero.backgroundImage ? <img src={hero.backgroundImage} alt="" className="mb-2 h-40 w-full rounded-2xl object-cover" /> : null}
              <input name="backgroundImage" type="file" accept="image/*" className="field" />
              <span className="mt-1 block text-xs text-slate-500">Faded behind the headline. Leave empty to keep the current image.</span>
            </label>
          </div>
        </BoundForm>
      </section>
      <section className="panel">
        <h2 className="font-serif text-2xl">About</h2>
        <BoundForm action={saveAbout} className="mt-4 grid gap-3">
          <Field label="Eyebrow" name="eyebrow" defaultValue={about.eyebrow} />
          <Field label="Title" name="title" defaultValue={about.title} />
          <label className="text-sm"><span className="label">Introduction</span><textarea name="body" className="field min-h-24" defaultValue={about.body} /></label>
          <label className="text-sm"><span className="label">Mission</span><textarea name="mission" className="field min-h-20" defaultValue={about.mission} /></label>
          <label className="text-sm"><span className="label">Vision</span><textarea name="vision" className="field min-h-20" defaultValue={about.vision} /></label>
          <label className="text-sm"><span className="label">Philosophy</span><textarea name="philosophy" className="field min-h-20" defaultValue={about.philosophy} /></label>
          <label className="text-sm"><span className="label">Commitment</span><textarea name="commitment" className="field min-h-20" defaultValue={about.commitment} /></label>
        </BoundForm>
      </section>
      <section className="panel">
        <h2 className="font-serif text-2xl">Academic cards</h2>
        <JsonSectionForm sectionKey="programs" items={programs} render={(items, setItems) => (
          <div className="grid gap-4">
            {(items as Program[]).map((program, index) => (
              <div key={index} className="grid gap-2 rounded-2xl bg-ice p-4">
                <input className="field" value={program.title} onChange={(event) => setItems((items as Program[]).map((item, i) => i === index ? { ...item, title: event.target.value } : item))} />
                <input className="field" value={program.board} onChange={(event) => setItems((items as Program[]).map((item, i) => i === index ? { ...item, board: event.target.value } : item))} />
                <textarea className="field min-h-20" value={program.blurb} onChange={(event) => setItems((items as Program[]).map((item, i) => i === index ? { ...item, blurb: event.target.value } : item))} />
                <input className="field" value={program.subjects.join(", ")} onChange={(event) => setItems((items as Program[]).map((item, i) => i === index ? { ...item, subjects: event.target.value.split(",").map((part) => part.trim()).filter(Boolean) } : item))} />
                <input className="field" value={program.enquire} onChange={(event) => setItems((items as Program[]).map((item, i) => i === index ? { ...item, enquire: event.target.value } : item))} />
              </div>
            ))}
          </div>
        )} />
      </section>
      <section className="panel">
        <h2 className="font-serif text-2xl">Why choose us</h2>
        <JsonSectionForm sectionKey="features" items={features} render={(items, setItems) => (
          <div className="grid gap-3">
            {(items as Feature[]).map((feature, index) => (
              <div key={index} className="grid gap-2">
                <input className="field" value={feature.title} onChange={(event) => setItems((items as Feature[]).map((item, i) => i === index ? { ...item, title: event.target.value } : item))} />
                <textarea className="field min-h-16" value={feature.description} onChange={(event) => setItems((items as Feature[]).map((item, i) => i === index ? { ...item, description: event.target.value } : item))} />
              </div>
            ))}
          </div>
        )} />
      </section>
      <section className="panel">
        <h2 className="font-serif text-2xl">Teaching methodology</h2>
        <JsonSectionForm sectionKey="methods" items={methods} render={(items, setItems) => (
          <div className="grid gap-3">
            {(items as MethodStep[]).map((step, index) => (
              <div key={index} className="grid gap-2 md:grid-cols-[80px_1fr]">
                <input className="field" value={step.step} onChange={(event) => setItems((items as MethodStep[]).map((item, i) => i === index ? { ...item, step: event.target.value } : item))} />
                <input className="field" value={step.title} onChange={(event) => setItems((items as MethodStep[]).map((item, i) => i === index ? { ...item, title: event.target.value } : item))} />
                <textarea className="field min-h-16 md:col-span-2" value={step.description} onChange={(event) => setItems((items as MethodStep[]).map((item, i) => i === index ? { ...item, description: event.target.value } : item))} />
              </div>
            ))}
          </div>
        )} />
      </section>
      <section className="panel">
        <h2 className="font-serif text-2xl">Contact, footer and logo</h2>
        <BoundForm action={saveContactSettings} uploadFolder="brand" className="mt-4 grid gap-3">
          <label className="text-sm"><span className="label">Address</span><textarea name="address" className="field min-h-20" defaultValue={contact.address} /></label>
          <Field label="Phone" name="phone" defaultValue={contact.phone} />
          <Field label="Working hours" name="hours" defaultValue={contact.hours} />
          <Field label="Map search" name="mapQuery" defaultValue={contact.mapQuery} />
          <Field label="Public email" name="email" defaultValue={contact.email} />
          <Field label="Footer name" name="footerName" defaultValue={footer.name} />
          <Field label="Tagline" name="tagline" defaultValue={footer.tagline} />
          <Field label="Brand statement" name="statement" defaultValue={footer.statement} />
          <label className="text-sm"><span className="label">Logo</span><input name="logo" type="file" accept="image/*" className="field" /></label>
        </BoundForm>
      </section>
    </div>
  );
}
