import type { Metadata } from "next";
import { LoginForm } from "@/components/forms";
import { one } from "@/lib/utils";

export const metadata: Metadata = { title: "Faculty login" };

export default async function FacultyLogin({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const next = one((await searchParams).next);
  return (
    <main className="grid min-h-screen place-items-center bg-[radial-gradient(circle_at_top_left,#ffb6d5,transparent_30%),#f2f7ff] px-4 py-12">
      <LoginForm role="faculty" title="Faculty portal" text="Sign in with the user ID issued by the institute." next={next} />
    </main>
  );
}
