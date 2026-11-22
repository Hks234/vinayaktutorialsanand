import { Stat } from "@/components/ui";
import { requireFaculty } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { facultyClassWhere, facultyNoticeWhere } from "@/lib/visibility";
import { formatDate } from "@/lib/utils";

export default async function FacultyDashboard() {
  const faculty = await requireFaculty();
  const scope = facultyClassWhere(faculty.classes);
  const classIds = [...new Set(faculty.classes.map((item) => item.classId))];
  const [students, homework, tests, notices] = await Promise.all([
    prisma.student.count({ where: { ...scope, status: "active" } }),
    prisma.homework.findMany({
      where: { deletedAt: null, facultyId: faculty.id },
      include: { class: true, submissions: true },
      orderBy: { dueDate: "asc" },
      take: 6,
    }),
    prisma.testExam.findMany({
      where: { deletedAt: null, facultyId: faculty.id, status: "scheduled", testDate: { gte: new Date(Date.now() - 86400000) } },
      include: { class: true },
      orderBy: { testDate: "asc" },
      take: 5,
    }),
    prisma.notice.findMany({ where: facultyNoticeWhere(), orderBy: { publishAt: "desc" }, take: 4 }),
  ]);
  const pendingReviews = homework.reduce(
    (sum, item) => sum + item.submissions.filter((submission) => submission.status === "completed").length,
    0,
  );
  return (
    <div className="grid gap-4">
      <section className="panel">
        <h1 className="font-serif text-3xl">Hello, {faculty.name.split(" ")[0]}</h1>
        <p className="text-sm text-slate-500">
          {faculty.subjects.map((item) => item.subject.name).join(" · ") || "Faculty"} · {classIds.length} class{classIds.length === 1 ? "" : "es"} assigned
        </p>
      </section>
      <div className="grid gap-4 md:grid-cols-3">
        <Stat label="Assigned students" value={students} />
        <Stat label="Open homework" value={homework.length} />
        <Stat label="Submissions to review" value={pendingReviews} />
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <section className="panel">
          <h2 className="font-serif text-2xl">Open homework</h2>
          <ul className="mt-3 grid gap-2 text-sm">
            {homework.map((item) => (
              <li key={item.id}>
                <a className="font-medium text-royal" href={`/faculty/homework/${item.id}`}>
                  {item.title}
                </a>
                <span className="block text-slate-500">
                  {item.class.name} · due {formatDate(item.dueDate)} · {item.submissions.filter((submission) => submission.status === "completed").length} to review
                </span>
              </li>
            ))}
            {!homework.length ? <li className="text-slate-500">No homework assigned yet.</li> : null}
          </ul>
        </section>
        <section className="panel">
          <h2 className="font-serif text-2xl">Upcoming tests</h2>
          <ul className="mt-3 grid gap-2 text-sm">
            {tests.map((test) => (
              <li key={test.id}>
                <a className="font-medium text-royal" href={`/faculty/performance?testId=${test.id}`}>
                  {test.name} · {test.subjectName}
                </a>
                <span className="block text-slate-500">
                  {test.class.name} · {formatDate(test.testDate)} {test.startTime}
                </span>
              </li>
            ))}
            {!tests.length ? <li className="text-slate-500">No upcoming tests.</li> : null}
          </ul>
        </section>
        <section className="panel">
          <h2 className="font-serif text-2xl">Notices</h2>
          <ul className="mt-3 grid gap-2 text-sm">
            {notices.map((notice) => (
              <li key={notice.id}>
                <a className="font-medium text-royal" href="/faculty/notices">
                  {notice.title}
                </a>
                <span className="block text-slate-500">{formatDate(notice.publishAt)}</span>
              </li>
            ))}
            {!notices.length ? <li className="text-slate-500">No notices.</li> : null}
          </ul>
        </section>
      </div>
    </div>
  );
}
