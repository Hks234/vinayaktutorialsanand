import { AdminProfileForm, BoundForm, PasswordForm } from "@/components/forms";
import { requireAdmin } from "@/lib/auth";
import { getHero } from "@/lib/content";
import { saveHeroPhotos } from "@/server/content-actions";

export default async function AdminSettings() {
  const [admin, hero] = await Promise.all([requireAdmin(), getHero()]);
  return (
    <div className="grid gap-6">
      <div>
        <h1 className="font-serif text-3xl">Admin settings</h1>
        <p className="mt-1 text-sm text-slate-500">Password, profile, and the homepage classroom photograph shown on the public site.</p>
      </div>
      <section className="panel">
        <h2 className="font-serif text-2xl">Homepage photographs</h2>
        <p className="mt-1 text-sm text-slate-500">Upload a new file to replace the classroom photo on the right of the homepage, or the faded background behind the headline. Leave a field empty to keep the current image.</p>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <figure className="overflow-hidden rounded-3xl bg-ice">
            <img src={hero.image} alt="Current classroom photograph" className="h-56 w-full object-cover" />
            <figcaption className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Classroom photograph</figcaption>
          </figure>
          <figure className="overflow-hidden rounded-3xl bg-ice">
            <img src={hero.backgroundImage} alt="Current hero background" className="h-56 w-full object-cover" />
            <figcaption className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Background texture</figcaption>
          </figure>
        </div>
        <BoundForm action={saveHeroPhotos} className="mt-4 grid gap-3 md:grid-cols-2" submit="Update photographs">
          <label className="text-sm">
            <span className="label">Replace classroom photograph</span>
            <input name="image" type="file" accept="image/*" className="field" />
          </label>
          <label className="text-sm">
            <span className="label">Replace background image</span>
            <input name="backgroundImage" type="file" accept="image/*" className="field" />
          </label>
        </BoundForm>
      </section>
      <div className="grid gap-6 lg:grid-cols-2">
        <section className="panel">
          <h2 className="font-serif text-2xl">Password</h2>
          {admin.mustChangePassword ? <p className="mt-2 text-sm text-orange">Change the bootstrap password before using the rest of the portal.</p> : null}
          <div className="mt-4"><PasswordForm continueHref="/admin/dashboard" /></div>
        </section>
        <section className="panel">
          <h2 className="font-serif text-2xl">Admin profile</h2>
          <div className="mt-4"><AdminProfileForm userId={admin.userId} name={admin.name} /></div>
        </section>
      </div>
    </div>
  );
}
