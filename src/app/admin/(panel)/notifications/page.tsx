import { NotificationList } from "@/components/portal/notifications";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function AdminNotifications() {
  const admin = await requireAdmin();
  const items = await prisma.notification.findMany({ where: { role: "admin", userRecordId: admin.id }, orderBy: { createdAt: "desc" }, take: 50 });
  return <NotificationList items={items.map((item) => ({ ...item, createdAt: item.createdAt.toISOString(), readAt: item.readAt?.toISOString() || null }))} />;
}
