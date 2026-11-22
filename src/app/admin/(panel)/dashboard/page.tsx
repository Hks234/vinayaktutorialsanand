import { Bars, Lines } from "@/components/charts";
import { Stat } from "@/components/ui";
import { prisma } from "@/lib/prisma";
import { formatDateTime } from "@/lib/utils";

export default async function AdminDashboard() {
  const [students, faculty, enquiries, classes, pendingHomework, upcomingTests, logs, classGroups, enquiryRows, marks] = await Promise.all([
    prisma.student.count({ where: { deletedAt: null, status: "active" } }),
    prisma.faculty.count({ where: { deletedAt: null, status: "active" } }),
    prisma.admissionEnquiry.count(),
    prisma.classGroup.count({ where: { deletedAt: null } }),
    prisma.homework.count({ where: { deletedAt: null, dueDate: { gte: new Date() } } }),
    prisma.testExam.count({ where: { deletedAt: null, status: "scheduled", testDate: { gte: new Date(Date.now() - 86400000) } } }),
    prisma.activityLog.findMany({ orderBy: { createdAt: "desc" }, take: 8 }),
    prisma.classGroup.findMany({ where: { deletedAt: null }, include: { _count: { select: { students: { where: { deletedAt: null, status: "active" } } } } }, orderBy: { sortOrder: "asc" } }),
    prisma.admissionEnquiry.findMany({ orderBy: { createdAt: "desc" }, take: 400 }),
    prisma.testMark.findMany({ include: { test: { include: { class: true } } }, take: 500 }),
  ]);
  const recentStudents = await prisma.student.findMany({ where: { deletedAt: null }, orderBy: { createdAt: "desc" }, take: 5, include: { class: true } });
  const byClass = classGroups.map((item) => ({ name: item.name.replace("Standard ", "Std "), value: item._count.students }));
  const months = Array.from({ length: 6 }).map((_, index) => {
    const date = new Date();
    date.setMonth(date.getMonth() - (5 - index));
    const key = `${date.getFullYear()}-${date.getMonth()}`;
    const label = date.toLocaleString("en-IN", { month: "short" });
    const value = enquiryRows.filter((row) => {
      const created = new Date(row.createdAt);
      return `${created.getFullYear()}-${created.getMonth()}` === key;
    }).length;
    return { name: label, value };
  });
  const performanceMap = new Map<string, { sum: number; count: number }>();
  for (const mark of marks) {
    const name = mark.test.class.name.replace("Standard ", "Std ");
    const current = performanceMap.get(name) || { sum: 0, count: 0 };
    current.sum += mark.total ? (mark.marks / mark.total) * 100 : 0;
    current.count += 1;
    performanceMap.set(name, current);
  }
  const performance = [...performanceMap.entries()].map(([name, item]) => ({ name, value: Math.round(item.sum / item.count) }));

  return (
    <div className="grid gap-4">
      <div>
        <h1 className="font-serif text-3xl">Institute dashboard</h1>
        <p className="text-sm text-slate-500">Students, enquiries and academic work in one place.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-4">
        <Stat label="Active students" value={students} />
        <Stat label="Active faculty" value={faculty} />
        <Stat label="Enquiries" value={enquiries} />
        <Stat label="Classes" value={classes} />
        <Stat label="Open homework" value={pendingHomework} hint="Not yet past the due date" />
        <Stat label="Upcoming tests" value={upcomingTests} />
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <section className="panel"><h2 className="mb-4 font-serif text-2xl">Class-wise students</h2><Bars data={byClass} label="Students" /></section>
        <section className="panel"><h2 className="mb-4 font-serif text-2xl">Monthly enquiries</h2><Lines data={months} label="Enquiries" /></section>
        <section className="panel"><h2 className="mb-4 font-serif text-2xl">Average performance</h2><Bars data={performance} label="Average %" /></section>
        <section className="panel">
          <h2 className="font-serif text-2xl">Recent admissions</h2>
          <ul className="mt-3 grid gap-2 text-sm">
            {recentStudents.length ? recentStudents.map((student) => (
              <li key={student.id} className="flex justify-between gap-3"><span>{student.fullName}</span><span className="text-slate-500">{student.class?.name}</span></li>
            )) : <li className="text-slate-500">No student accounts yet.</li>}
          </ul>
          <h2 className="mt-6 font-serif text-2xl">Recent activity</h2>
          <ul className="mt-3 grid gap-2 text-sm">
            {logs.map((log) => (
              <li key={log.id}><span className="font-medium">{log.action}</span> <span className="text-slate-500">{log.details} · {formatDateTime(log.createdAt)}</span></li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
