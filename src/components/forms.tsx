"use client";

import { useRouter } from "next/navigation";
import { useActionState, useState, useTransition } from "react";
import { changeAdminUserId, changeOwnPassword, loginAction } from "@/server/auth-actions";
import { saveJsonSection } from "@/server/content-actions";
import { submitContact, submitEnquiry } from "@/server/enquiry-actions";

type Result = {
  ok?: boolean;
  error?: string;
  userId?: string;
  password?: string;
  code?: string;
  name?: string;
};

export function LoginForm({
  role,
  title,
  text,
  next = "",
}: {
  role: "admin" | "faculty" | "student";
  title: string;
  text: string;
  next?: string;
}) {
  const [state, action, pending] = useActionState(loginAction, { error: "" });
  return (
    <form action={action} className="card w-full max-w-md p-7">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-hot">Vinayak Tutorials</p>
      <h1 className="mt-2 font-serif text-3xl text-navy">{title}</h1>
      <p className="mt-2 text-sm leading-6 text-slate-500">{text}</p>
      <input type="hidden" name="role" value={role} />
      {next ? <input type="hidden" name="next" value={next} /> : null}
      <label className="label mt-6" htmlFor="userId">User ID</label>
      <input id="userId" name="userId" className="field" autoComplete="username" required />
      <label className="label mt-4" htmlFor="password">Password</label>
      <input id="password" name="password" type="password" className="field" autoComplete="current-password" required />
      {state.error ? <p className="mt-3 text-sm text-rose-600">{state.error}</p> : null}
      <button className="btn-primary mt-6 w-full" disabled={pending}>{pending ? "Signing in…" : "Sign in"}</button>
    </form>
  );
}

export function PasswordForm({ continueHref }: { continueHref?: string }) {
  const [state, action, pending] = useActionState(changeOwnPassword, { error: "", ok: "" });
  return (
    <form action={action} className="grid gap-3">
      <label className="label" htmlFor="current">Current password</label>
      <input id="current" name="current" type="password" className="field" required />
      <label className="label" htmlFor="next">New password</label>
      <input id="next" name="next" type="password" className="field" required />
      <label className="label" htmlFor="confirm">Confirm new password</label>
      <input id="confirm" name="confirm" type="password" className="field" required />
      <p className="text-xs text-slate-500">Use at least 8 characters, with letters and numbers.</p>
      {state.error ? <p className="text-sm text-rose-600">{state.error}</p> : null}
      {state.ok ? <p className="text-sm text-emerald-700">{state.ok}</p> : null}
      <button className="btn-primary w-fit" disabled={pending}>{pending ? "Updating…" : "Update password"}</button>
      {state.ok && continueHref ? (
        <a className="btn-navy w-fit" href={continueHref}>
          Continue to dashboard
        </a>
      ) : null}
    </form>
  );
}

export function AdminProfileForm({ userId, name }: { userId: string; name: string }) {
  const [state, action, pending] = useActionState(changeAdminUserId, { error: "", ok: "" });
  return (
    <form action={action} className="grid gap-3">
      <label className="label" htmlFor="name">Display name</label>
      <input id="name" name="name" className="field" defaultValue={name} />
      <label className="label" htmlFor="userId">Admin user ID</label>
      <input id="userId" name="userId" className="field" defaultValue={userId} required />
      {state.error ? <p className="text-sm text-rose-600">{state.error}</p> : null}
      {state.ok ? <p className="text-sm text-emerald-700">{state.ok}</p> : null}
      <button className="btn-navy w-fit" disabled={pending}>{pending ? "Saving…" : "Save profile"}</button>
    </form>
  );
}

export function EnquiryForm({ standard = "", stream = "" }: { standard?: string; stream?: string }) {
  const [state, action, pending] = useActionState(submitEnquiry, { error: "", code: "" });
  if (state.code) {
    return (
      <div className="card p-6">
        <p className="font-serif text-2xl text-navy">Enquiry received</p>
        <p className="mt-2 text-sm leading-6 text-slate-600">Your enquiry ID is <strong>{state.code}</strong>. The institute will contact you on the mobile number you entered.</p>
      </div>
    );
  }
  return (
    <form action={action} className="grid gap-3 md:grid-cols-2">
      <Field label="Student full name" name="studentName" required className="md:col-span-2" />
      <Field label="Parent / guardian name" name="parentName" required />
      <Field label="Mobile number" name="mobile" required />
      <Field label="Email address" name="email" type="email" />
      <label className="text-sm">
        <span className="label">Standard</span>
        <select name="standard" className="field" defaultValue={standard} required>
          <option value="">Select</option>
          {["Standard 6", "Standard 7", "Standard 8", "Standard 9", "Standard 10", "Standard 11", "Standard 12"].map((item) => (
            <option key={item}>{item}</option>
          ))}
        </select>
      </label>
      <label className="text-sm">
        <span className="label">Board</span>
        <select name="board" className="field" defaultValue="GSEB" required>
          <option>GSEB</option>
          <option>CBSE</option>
        </select>
      </label>
      <label className="text-sm">
        <span className="label">Stream (Standard 11–12)</span>
        <select name="stream" className="field" defaultValue={stream}>
          <option value="">Not applicable</option>
          <option value="PCM">PCM</option>
          <option value="PCB">PCB</option>
        </select>
      </label>
      <Field label="Previous school" name="previousSchool" />
      <label className="text-sm md:col-span-2">
        <span className="label">Message</span>
        <textarea name="message" className="field min-h-28" />
      </label>
      {state.error ? <p className="text-sm text-rose-600 md:col-span-2">{state.error}</p> : null}
      <button className="btn-primary w-fit md:col-span-2" disabled={pending}>{pending ? "Sending…" : "Submit enquiry"}</button>
    </form>
  );
}

export function ContactForm() {
  const [state, action, pending] = useActionState(submitContact, { error: "", code: "" });
  if (state.code) {
    return <p className="text-sm text-emerald-700">Message sent. Reference {state.code}.</p>;
  }
  return (
    <form action={action} className="grid gap-3">
      <Field label="Your name" name="name" required />
      <Field label="Mobile number" name="mobile" required />
      <Field label="Email" name="email" type="email" />
      <label className="text-sm">
        <span className="label">Message</span>
        <textarea name="message" className="field min-h-28" required />
      </label>
      {state.error ? <p className="text-sm text-rose-600">{state.error}</p> : null}
      <button className="btn-primary w-fit" disabled={pending}>{pending ? "Sending…" : "Send message"}</button>
    </form>
  );
}

export function Field({
  label,
  name,
  defaultValue,
  type = "text",
  required,
  className,
  as,
  step,
  min,
  max,
  placeholder,
}: {
  label: string;
  name: string;
  defaultValue?: string | number | null;
  type?: string;
  required?: boolean;
  className?: string;
  as?: "textarea";
  step?: string | number;
  min?: string | number;
  max?: string | number;
  placeholder?: string;
}) {
  return (
    <label className={`text-sm ${className || ""}`}>
      <span className="label">{label}</span>
      {as === "textarea" ? (
        <textarea name={name} className="field min-h-28" defaultValue={defaultValue ?? ""} required={required} placeholder={placeholder} />
      ) : (
        <input
          name={name}
          type={type}
          className="field"
          defaultValue={defaultValue ?? ""}
          required={required}
          step={step}
          min={min}
          max={max}
          placeholder={placeholder}
        />
      )}
    </label>
  );
}

function isBrowserFile(value: FormDataEntryValue): value is File {
  if (typeof value === "string" || !value || typeof value !== "object") return false;
  const file = value as File;
  return typeof file.size === "number" && file.size > 0 && typeof file.arrayBuffer === "function";
}

async function sendFilesThroughUploadApi(data: FormData, folder: string) {
  const entries = Array.from(data.entries());
  for (const [key, value] of entries) {
    if (!isBrowserFile(value)) continue;
    const body = new FormData();
    body.set("file", value);
    body.set("folder", folder);
    const response = await fetch("/api/upload", { method: "POST", body, credentials: "include" });
    const text = await response.text();
    let payload: { path?: string; error?: string } = {};
    try {
      payload = JSON.parse(text) as { path?: string; error?: string };
    } catch {
      throw new Error(text.replace(/<[^>]+>/g, " ").trim().slice(0, 180) || "Could not upload the photograph.");
    }
    if (!response.ok || !payload.path) {
      throw new Error(payload.error || "Could not upload the photograph.");
    }
    data.delete(key);
    data.set(`${key}_url`, payload.path);
  }
}

export function BoundForm({
  action,
  children,
  submit = "Save",
  className = "grid gap-3",
  uploadFolder = "uploads",
}: {
  action: (formData: FormData) => Promise<Result>;
  children: React.ReactNode;
  submit?: string;
  className?: string;
  uploadFolder?: string;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [credential, setCredential] = useState<Result | null>(null);
  return (
    <form
      className={className}
      encType="multipart/form-data"
      onSubmit={(event) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        setError("");
        setMessage("");
        start(async () => {
          try {
            await sendFilesThroughUploadApi(data, uploadFolder);
            const result = await action(data);
            if (result.ok === false) {
              setError(result.error || "Could not save.");
              return;
            }
            if (result.password && result.userId) setCredential(result);
            else setMessage("Saved.");
            router.refresh();
          } catch (caught) {
            setError(caught instanceof Error ? caught.message : "Could not save.");
          }
        });
      }}
    >
      {children}
      {error ? <p className="text-sm text-rose-600">{error}</p> : null}
      {message ? <p className="text-sm text-emerald-700">{message}</p> : null}
      {credential?.password && credential.userId ? (
        <div className="rounded-2xl bg-ice p-4 text-sm">
          <p className="font-semibold text-navy">Share these details once. The password is not stored in a readable form.</p>
          {credential.name ? <p className="mt-2">Name: {credential.name}</p> : null}
          {credential.code ? <p>ID: {credential.code}</p> : null}
          <p>User ID: {credential.userId}</p>
          <p>Temporary password: {credential.password}</p>
        </div>
      ) : null}
      <button className="btn-primary w-fit" disabled={pending}>{pending ? "Saving…" : submit}</button>
    </form>
  );
}

export function RunButton({
  label,
  run,
  danger,
  confirm,
}: {
  label: string;
  run: () => Promise<Result>;
  danger?: boolean;
  confirm?: string;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [note, setNote] = useState("");
  return (
    <span className="inline-flex flex-col gap-1">
      <button
        type="button"
        className={danger ? "btn-danger" : "btn-ghost"}
        disabled={pending}
        onClick={() => {
          if (confirm && !window.confirm(confirm)) return;
          setNote("");
          start(async () => {
            try {
              const result = await run();
              if (result.ok === false) setNote(result.error || "Could not complete that action.");
              else if (result.password && result.userId) setNote(`User ID ${result.userId} · temporary password ${result.password}`);
              else setNote("Done.");
              if (result.ok !== false) router.refresh();
            } catch (caught) {
              setNote(caught instanceof Error ? caught.message : "Could not complete that action.");
            }
          });
        }}
      >
        {pending ? "Working…" : label}
      </button>
      {note ? <span className="max-w-xs text-xs text-navy">{note}</span> : null}
    </span>
  );
}

export function JsonSectionForm({
  sectionKey,
  items,
  render,
}: {
  sectionKey: string;
  items: unknown[];
  render: (items: unknown[], setItems: (next: unknown[]) => void) => React.ReactNode;
}) {
  const [value, setValue] = useState(items);
  return (
    <BoundForm action={saveJsonSection}>
      <input type="hidden" name="key" value={sectionKey} />
      <input type="hidden" name="json" value={JSON.stringify(value)} />
      {render(value, setValue)}
    </BoundForm>
  );
}
