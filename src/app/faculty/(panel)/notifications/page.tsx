import { NotificationList } from "@/components/portal/notifications";
import { requireFaculty } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function FacultyNotifications() {
  const faculty = await requireFaculty();
  const items = await prisma.notification.findMany({
    where: { role: "faculty", userRecordId: faculty.id },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
  return <NotificationList items={items.map((item) => ({ ...item, createdAt: item.createdAt.toISOString(), readAt: item.readAt?.toISOString() || null }))} />;
}
