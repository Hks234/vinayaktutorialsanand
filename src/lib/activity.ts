import { prisma } from "@/lib/prisma";

export async function logActivity(entry: {
  actorRole: string;
  actorId: string;
  action: string;
  entity: string;
  entityId?: string | null;
  details?: string | null;
}) {
  await prisma.activityLog.create({
    data: {
      actorRole: entry.actorRole,
      actorId: entry.actorId,
      action: entry.action,
      entity: entry.entity,
      entityId: entry.entityId ?? null,
      details: entry.details ?? null,
    },
  });
}

export async function notifyMany(
  entries: { role: string; userRecordId: string; title: string; body: string; href?: string; dedupeKey?: string }[],
) {
  if (!entries.length) return;
  const keys = entries.map((entry) => entry.dedupeKey).filter((key): key is string => Boolean(key));
  const existing = keys.length
    ? await prisma.notification.findMany({ where: { dedupeKey: { in: keys } }, select: { dedupeKey: true } })
    : [];
  const seen = new Set(existing.map((item) => item.dedupeKey));
  const data = entries.filter((entry) => !entry.dedupeKey || !seen.has(entry.dedupeKey));
  if (!data.length) return;
  await prisma.notification.createMany({ data });
}
