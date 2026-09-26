"use client";

import { useState } from "react";
import { auth, ApiError } from "@/lib/api";
import { useSession } from "@/components/SessionProvider";
import { useToast } from "@/components/ui/UIProvider";
import Button from "@/components/ui/Button";

const INPUT =
  "w-full px-4 py-3 pr-12 rounded-xl bg-surface-container border-none focus:ring-2 focus:ring-secondary-container/50";
const LABEL = "block font-label-caps text-label-caps text-on-surface-variant uppercase mb-2";

/** Who the user is, plus the form to change their own password. Shared by customers and staff. */
export default function AccountPanel() {
  const { user } = useSession();
  const toast = useToast();
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const problem =
    next.length < 8
      ? "New password must be at least 8 characters"
      : !/[A-Za-z]/.test(next) || !/\d/.test(next)
        ? "New password needs at least one letter and one number"
        : next === current
          ? "New password must be different from the current one"
          : next !== confirm
            ? "The two new passwords don't match"
            : null;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (problem) return setError(problem);
    setBusy(true);
    try {
      await auth.changePassword(current, next);
      setCurrent("");
      setNext("");
      setConfirm("");
      toast("Password changed. Other devices have been signed out.", "success");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  const type = show ? "text" : "password";
  return (
    <div className="max-w-xl space-y-8">
      <section className="bg-surface-container-lowest rounded-xl premium-shadow p-6 border border-outline-variant/10">
        <h2 className="font-headline-md text-headline-md mb-4">Your account</h2>
        <dl className="grid grid-cols-[8rem_1fr] gap-y-2 text-body-md">
          <dt className="text-on-surface-variant">Name</dt>
          <dd className="font-bold">{user?.ownerName}</dd>
          <dt className="text-on-surface-variant">Business</dt>
          <dd>{user?.businessName}</dd>
          <dt className="text-on-surface-variant">Mobile</dt>
          <dd>{user?.mobile}</dd>
        </dl>
      </section>

      <section className="bg-surface-container-lowest rounded-xl premium-shadow p-6 border border-outline-variant/10">
        <h2 className="font-headline-md text-headline-md mb-1">Change password</h2>
        <p className="text-on-surface-variant text-body-md mb-6">
          Use at least 8 characters with a letter and a number. Changing it signs you out on your other devices.
        </p>
        <form onSubmit={submit} className="space-y-5" noValidate>
          <div>
            <label htmlFor="pw-current" className={LABEL}>Current password</label>
            <input id="pw-current" type={type} autoComplete="current-password" required value={current} onChange={(e) => setCurrent(e.target.value)} className={INPUT} />
          </div>
          <div>
            <label htmlFor="pw-new" className={LABEL}>New password</label>
            <div className="relative">
              <input id="pw-new" type={type} autoComplete="new-password" required minLength={8} value={next} onChange={(e) => setNext(e.target.value)} className={INPUT} />
              <button type="button" aria-label={show ? "Hide passwords" : "Show passwords"} onClick={() => setShow((v) => !v)} className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-on-surface-variant hover:text-on-surface rounded-full">
                <span className="material-symbols-outlined text-[20px]" aria-hidden="true">{show ? "visibility_off" : "visibility"}</span>
              </button>
            </div>
          </div>
          <div>
            <label htmlFor="pw-confirm" className={LABEL}>Confirm new password</label>
            <input id="pw-confirm" type={type} autoComplete="new-password" required value={confirm} onChange={(e) => setConfirm(e.target.value)} className={INPUT} />
          </div>
          {error && (
            <p role="alert" className="text-sm text-error font-bold">{error}</p>
          )}
          <Button type="submit" loading={busy} disabled={!current || !next || !confirm}>Change password</Button>
        </form>
      </section>
    </div>
  );
}
