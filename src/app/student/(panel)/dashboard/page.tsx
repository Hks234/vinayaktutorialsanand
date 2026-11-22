import { Stat } from "@/components/ui";
import { requireStudent } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { homeworkWhereForStudent, studentNoticeWhere, testWhereForStudent } from "@/lib/visibility";
import { formatDate } from "@/lib/utils";
import { ensureHomeworkReminders } from "@/server/content-actions";
import { Avatar } from "@/components/ui";

export default async function StudentDashboard() {
  const student = await requireStudent();
  await ensureHomeworkReminders(student.id);
  const [notices, homework, tests] = await Promise.all([
    prisma.notice.findMany({ where: studentNoticeWhere(student.classId), orderBy: { publishAt: "desc" }, take: 4 }),
    prisma.homework.findMany({ where: homeworkWhereForStudent(student), include: { submissions: { where: { studentId: student.id } }, faculty: true }, orderBy: { dueDate: "asc" } }),
    prisma.testExam.findMany({ where: { ...testWhereForStudent(student), testDate: { gte: new Date(Date.now() - 86400000) } }, orderBy: { testDate: "asc" }, take: 5 }),
  ]);
  const pending = homework.filter((item) => !item.submissions.some((submission) => submission.status === "completed" || submission.status === "reviewed"));
  const done = homework.length - pending.length;
  return (
    <div className="grid gap-4">
      <section className="panel flex flex-wrap items-center gap-4">
        <Avatar name={student.fullName} src={student.photoPath} className="h-16 w-16" />
        <div>
          <h1 className="font-serif text-3xl">Hello, {student.fullName.split(" ")[0]}</h1>
          <p className="text-sm text-slate-500">{student.studentCode} · {student.class?.name || "Class not assigned"}{student.batch ? ` · ${student.batch.name}` : ""}</p>
          <p className="text-sm text-slate-500">Faculty: {student.mentors.map((item) => item.faculty.name).join(", ") || "Will be assigned by the institute"}</p>
        </div>
      </section>
      <div className="grid gap-4 md:grid-cols-3">
        <Stat label="Pending homework" value={pending.length} />
        <Stat label="Completed homework" value={done} />
        <Stat label="Upcoming tests" value={tests.length} />
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <section className="panel">
          <h2 className="font-serif text-2xl">Notices</h2>
          <ul className="mt-3 grid gap-2 text-sm">{notices.map((notice) => <li key={notice.id}><a className="font-medium text-royal" href="/student/notices">{notice.title}</a><span className="block text-slate-500">{formatDate(notice.publishAt)}</span></li>)}{!notices.length ? <li className="text-slate-500">No notices for your class.</li> : null}</ul>
        </section>
        <section className="panel">
          <h2 className="font-serif text-2xl">Coming up</h2>
          <ul className="mt-3 grid gap-2 text-sm">{tests.map((test) => <li key={test.id}><a className="font-medium text-royal" href="/student/tests">{test.name} · {test.subjectName}</a><span className="block text-slate-500">{formatDate(test.testDate)} {test.startTime}</span></li>)}{!tests.length ? <li className="text-slate-500">No upcoming tests.</li> : null}</ul>
          <h3 className="mt-5 font-semibold">Pending homework</h3>
          <ul className="mt-2 grid gap-2 text-sm">{pending.slice(0, 4).map((item) => <li key={item.id}><a className="text-royal" href={`/student/homework/${item.id}`}>{item.title}</a> · due {formatDate(item.dueDate)}</li>)}</ul>
        </section>
      </div>
    </div>
  );
}
