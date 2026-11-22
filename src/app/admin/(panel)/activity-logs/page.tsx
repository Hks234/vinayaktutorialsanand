import { Pager } from "@/components/ui";
import { prisma } from "@/lib/prisma";
import { formatDateTime, one, pageCount, parsePage } from "@/lib/utils";

const size = 20;

export default async function ActivityPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const page = parsePage(one((await searchParams).page));
  const [total, logs] = await Promise.all([
    prisma.activityLog.count(),
    prisma.activityLog.findMany({ orderBy: { createdAt: "desc" }, skip: (page - 1) * size, take: size }),
  ]);
  return (
    <div>
      <h1 className="font-serif text-3xl">Activity</h1>
      <div className="mt-4 overflow-x-auto rounded-3xl bg-white shadow-card">
        <table className="min-w-full text-left text-sm">
          <thead className="text-xs uppercase tracking-wider text-slate-500"><tr>{["When", "Who", "Action", "Details"].map((head) => <th key={head} className="px-4 py-3">{head}</th>)}</tr></thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log.id} className="border-t border-slate-100">
                <td className="px-4 py-3">{formatDateTime(log.createdAt)}</td>
                <td className="px-4 py-3">{log.actorRole}</td>
                <td className="px-4 py-3">{log.action}</td>
                <td className="px-4 py-3">{log.details || log.entity}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Pager page={page} pages={pageCount(total, size)} href="/admin/activity-logs" />
    </div>
  );
}
