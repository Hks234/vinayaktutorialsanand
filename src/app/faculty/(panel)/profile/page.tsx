import { Avatar } from "@/components/ui";
import { requireFaculty } from "@/lib/auth";

export default async function FacultyProfile() {
  const faculty = await requireFaculty();
  return (
    <div className="grid gap-4">
      <section className="panel flex flex-wrap gap-4">
        <Avatar name={faculty.name} src={faculty.photoPath} className="h-20 w-20" />
        <div>
          <h1 className="font-serif text-3xl">{faculty.name}</h1>
          <p className="text-sm text-slate-500">{faculty.facultyCode} · User ID {faculty.userId || "Login not issued"}</p>
          <p className="mt-2 text-sm text-royal">{faculty.subjects.map((item) => item.subject.name).join(" · ") || "Subjects not assigned"}</p>
        </div>
      </section>
      <section className="panel text-sm leading-7">
        <p>Qualifications: {faculty.qualifications || "—"}</p>
        <p>Description: {faculty.description || "—"}</p>
        <p>Phone: {faculty.phone || "—"}</p>
        <p>Email: {faculty.email || "—"}</p>
        <p>Classes: {faculty.classes.map((item) => `${item.class.name}${item.batch ? ` · ${item.batch.name}` : ""}`).join(", ") || "—"}</p>
        <p className="mt-3 text-slate-500">Profile details are updated by the institute admin.</p>
      </section>
    </div>
  );
}
