import type { Metadata } from "next";
import { LoginForm } from "@/components/forms";
import { one } from "@/lib/utils";

export const metadata: Metadata = { title: "Admin login" };

export default async function AdminLogin({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const next = one((await searchParams).next);
  return (
    <main className="grid min-h-screen place-items-center bg-navy px-4 py-12">
      <LoginForm role="admin" title="Admin portal" text="Manage the website, admissions, students, faculty and academic work." next={next} />
    </main>
  );
}
