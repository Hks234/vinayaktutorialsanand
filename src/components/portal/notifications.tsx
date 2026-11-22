"use client";

import { useTransition } from "react";
import { markNotificationsRead } from "@/server/content-actions";
import { formatDateTime } from "@/lib/utils";

export function NotificationList({ items }: { items: { id: string; title: string; body: string; href: string | null; createdAt: string; readAt: string | null }[] }) {
  const [pending, start] = useTransition();
  return (
    <div className="grid gap-3">
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-3xl">Notifications</h1>
        <button className="btn-ghost" type="button" disabled={pending} onClick={() => start(async () => { await markNotificationsRead(); location.reload(); })}>Mark all read</button>
      </div>
      {items.map((item) => (
        <a key={item.id} href={item.href || "#"} className={`card block p-4 ${item.readAt ? "opacity-70" : ""}`}>
          <p className="font-semibold">{item.title}</p>
          <p className="text-sm text-slate-600">{item.body}</p>
          <p className="mt-1 text-xs text-slate-400">{formatDateTime(item.createdAt)}</p>
        </a>
      ))}
      {!items.length ? <p className="text-sm text-slate-500">No notifications yet.</p> : null}
    </div>
  );
}
