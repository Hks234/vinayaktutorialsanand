import { Avatar, Badge, Empty } from "@/components/ui";
import { requireFaculty } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { facultyClassWhere } from "@/lib/visibility";

export default async function FacultyStudents() {
  const faculty = await requireFaculty();
  const students = await prisma.student.findMany({
    where: { ...facultyClassWhere(faculty.classes), status: "active" },
    include: { class: true, batch: true, subjects: { include: { subject: true } } },
    orderBy: { fullName: "asc" },
  });
  return (
    <div className="grid gap-4">
      <h1 className="font-serif text-3xl">Assigned students</h1>
      {!students.length ? <Empty title="No students yet" text="Students in your classes will appear here." /> : null}
      {students.map((student) => (
        <article key={student.id} className="card flex flex-wrap items-center gap-4 p-4">
          <Avatar name={student.fullName} src={student.photoPath} />
          <div className="min-w-48 flex-1">
            <h2 className="font-semibold">{student.fullName}</h2>
            <p className="text-sm text-slate-500">{student.studentCode}</p>
          </div>
          <Badge>{student.class?.name || "No class"}</Badge>
          {student.batch ? <Badge tone="pink">{student.batch.name}</Badge> : null}
          <p className="w-full text-sm text-slate-600">{student.subjects.map((item) => item.subject.name).join(" · ") || "No subjects listed"}</p>
        </article>
      ))}
    </div>
  );
}
