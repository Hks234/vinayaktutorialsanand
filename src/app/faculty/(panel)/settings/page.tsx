import { PasswordForm } from "@/components/forms";
import { requireFaculty } from "@/lib/auth";

export default async function FacultySettings() {
  const faculty = await requireFaculty();
  return (
    <section className="panel max-w-xl">
      <h1 className="font-serif text-3xl">Password</h1>
      {faculty.mustChangePassword ? <p className="mt-2 text-sm text-orange">Change the temporary password before using the rest of the portal.</p> : null}
      <div className="mt-4">
        <PasswordForm continueHref="/faculty/dashboard" />
      </div>
    </section>
  );
}
