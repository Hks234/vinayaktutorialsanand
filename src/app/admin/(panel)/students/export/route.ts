import { csvCell } from "@/lib/catalog";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  await requireAdmin();
  const students = await prisma.student.findMany({
    where: { deletedAt: null },
    include: { class: true, batch: true },
    orderBy: { fullName: "asc" },
  });
  const header = ["Name", "Student ID", "User ID", "Class", "Batch", "Mobile", "Board", "Stream", "Status"];
  const lines = [
    header.join(","),
    ...students.map((student) =>
      [student.fullName, student.studentCode, student.userId, student.class?.name, student.batch?.name, student.mobile, student.board, student.stream, student.status]
        .map(csvCell)
        .join(","),
    ),
  ];
  return new Response(lines.join("\n"), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": "attachment; filename=vinayak-students.csv",
    },
  });
}
