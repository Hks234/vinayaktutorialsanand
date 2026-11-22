import { NotificationList } from "@/components/portal/notifications";
import { requireStudent } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function StudentNotifications() {
  const student = await requireStudent();
  const items = await prisma.notification.findMany({
    where: { role: "student", userRecordId: student.id },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
  return <NotificationList items={items.map((item) => ({ ...item, createdAt: item.createdAt.toISOString(), readAt: item.readAt?.toISOString() || null }))} />;
}
