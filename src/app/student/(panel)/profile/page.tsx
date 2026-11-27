import { Avatar, Badge } from "@/components/ui";
import { requireStudent } from "@/lib/auth";

export default async function StudentProfile() {
  const student = await requireStudent();
  return (
    <div className="grid gap-4">
      <section className="panel flex flex-wrap gap-4">
        <Avatar name={student.fullName} src={student.photoPath} className="h-28 w-24" />
        <div>
          <h1 className="font-serif text-3xl">{student.fullName}</h1>
          <p className="text-sm text-slate-500">
            {student.studentCode} · User ID {student.userId}
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            <Badge>{student.class?.name || "No class"}</Badge>
            <Badge tone="pink">{student.board}</Badge>
            {student.stream ? <Badge tone="orange">{student.stream}</Badge> : null}
          </div>
        </div>
      </section>
      <section className="panel text-sm leading-7">
        <p>Parent: {student.parentName || "—"}</p>
        <p>Mobile: {student.mobile || "—"}</p>
        <p>Email: {student.email || "—"}</p>
        <p>Batch: {student.batch?.name || "—"}</p>
        <p>Previous school: {student.previousSchool || "—"}</p>
        <p>Subjects: {student.subjects.map((item) => item.subject.name).join(", ") || "—"}</p>
        <p>Faculty: {student.mentors.map((item) => item.faculty.name).join(", ") || "—"}</p>
        <p className="mt-3 text-slate-500">Ask the institute office if any of these details need to be corrected.</p>
      </section>
    </div>
  );
}
