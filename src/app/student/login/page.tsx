import type { Metadata } from "next";
import { LoginForm } from "@/components/forms";
import { one } from "@/lib/utils";

export const metadata: Metadata = { title: "Student login" };

export default async function StudentLogin({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const next = one((await searchParams).next);
  return (
    <main className="grid min-h-screen place-items-center bg-[radial-gradient(circle_at_top_right,#ffb6d5,transparent_28%),#f2f7ff] px-4 py-12">
      <LoginForm role="student" title="Student portal" text="Use the user ID and password given by the institute." next={next} />
    </main>
  );
}
