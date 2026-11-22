import { PortalFrame, type PortalLink } from "@/components/portal/frame";
import { portalIdentity, type Role } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const menus: Record<Role, PortalLink[]> = {
  admin: [
    { href: "/admin/dashboard", label: "Dashboard" },
    { href: "/admin/students", label: "Students" },
    { href: "/admin/faculty", label: "Faculty" },
    { href: "/admin/classes", label: "Classes" },
    { href: "/admin/batches", label: "Batches" },
    { href: "/admin/subjects", label: "Subjects" },
    { href: "/admin/academic", label: "Academic" },
    { href: "/admin/notices", label: "Notices" },
    { href: "/admin/banners", label: "Banners" },
    { href: "/admin/toppers", label: "Toppers" },
    { href: "/admin/gallery", label: "Gallery" },
    { href: "/admin/enquiries", label: "Enquiries" },
    { href: "/admin/homework", label: "Homework" },
    { href: "/admin/tests", label: "Tests" },
    { href: "/admin/website-content", label: "Website" },
    { href: "/admin/activity-logs", label: "Activity" },
    { href: "/admin/notifications", label: "Notifications" },
    { href: "/admin/settings", label: "Settings" },
  ],
  faculty: [
    { href: "/faculty/dashboard", label: "Dashboard" },
    { href: "/faculty/profile", label: "Profile" },
    { href: "/faculty/students", label: "Students" },
    { href: "/faculty/homework", label: "Homework" },
    { href: "/faculty/tests", label: "Tests" },
    { href: "/faculty/performance", label: "Marks" },
    { href: "/faculty/notices", label: "Notices" },
    { href: "/faculty/notifications", label: "Notifications" },
    { href: "/faculty/settings", label: "Settings" },
  ],
  student: [
    { href: "/student/dashboard", label: "Dashboard" },
    { href: "/student/profile", label: "Profile" },
    { href: "/student/notices", label: "Notices" },
    { href: "/student/homework", label: "Homework" },
    { href: "/student/tests", label: "Tests" },
    { href: "/student/performance", label: "Performance" },
    { href: "/student/notifications", label: "Notifications" },
    { href: "/student/settings", label: "Settings" },
  ],
};

export async function PortalLayout({ role, children }: { role: Role; children: React.ReactNode }) {
  const identity = await portalIdentity(role);
  const unread = await prisma.notification.count({ where: { role, userRecordId: identity.id, readAt: null } });
  return (
    <PortalFrame
      name={identity.name}
      subtitle={identity.subtitle}
      photo={identity.photo}
      unread={unread}
      home={`/${role}/dashboard`}
      links={menus[role]}
    >
      {children}
    </PortalFrame>
  );
}
