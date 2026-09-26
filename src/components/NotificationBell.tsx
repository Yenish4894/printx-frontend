"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { notifications as notificationsApi, type NotificationItem } from "@/lib/api";

const POLL_MS = 60_000;

/** "5 min ago", "3 h ago", "2 d ago"; older than a week falls back to the date. */
function timeAgo(iso: string) {
  const s = Math.max(0, (Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)} min ago`;
  if (s < 86400) return `${Math.floor(s / 3600)} h ago`;
  if (s < 7 * 86400) return `${Math.floor(s / 86400)} d ago`;
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

/** Only ever follow in-app paths: `link` is server-written, but never trust it into a redirect. */
const safeLink = (l: string | null) => (l && l.startsWith("/") && !l.startsWith("//") ? l : null);

/**
 * Bell with an unread badge and a dropdown of the signed-in user's own
 * notifications. `tone` picks the icon colour for the dark customer header
 * versus the light admin header.
 */
export default function NotificationBell({ tone }: { tone: "dark" | "light" }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [unread, setUnread] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  const alive = useRef(true);

  const refresh = useCallback(async () => {
    try {
      const res = await notificationsApi.list();
      if (!alive.current) return;
      setItems(res.notifications);
      setUnread(res.unread);
      setFailed(false);
    } catch {
      if (alive.current) setFailed(true);
    } finally {
      if (alive.current) setLoaded(true);
    }
  }, []);

  // Load once, then poll while the tab is visible (cheap: one small query).
  useEffect(() => {
    alive.current = true;
    refresh();
    const t = setInterval(() => {
      if (document.visibilityState === "visible") refresh();
    }, POLL_MS);
    return () => {
      alive.current = false;
      clearInterval(t);
    };
  }, [refresh]);

  useEffect(() => {
    if (!open) return;
    refresh();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, refresh]);

  const openItem = (n: NotificationItem) => {
    setOpen(false);
    if (!n.isRead) {
      setItems((cur) => cur.map((x) => (x.id === n.id ? { ...x, isRead: true } : x)));
      setUnread((u) => Math.max(0, u - 1));
      notificationsApi.markRead(n.id).catch(() => {});
    }
    const to = safeLink(n.link);
    if (to) router.push(to);
  };

  const markAll = () => {
    setItems((cur) => cur.map((x) => ({ ...x, isRead: true })));
    setUnread(0);
    notificationsApi.markRead().catch(() => refresh());
  };

  const iconColour = tone === "dark" ? "text-on-primary-container" : "text-on-surface";
  const hover = tone === "dark" ? "hover:bg-primary/10" : "hover:bg-surface-container";

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={unread ? `Notifications, ${unread} unread` : "Notifications"}
        aria-expanded={open}
        aria-haspopup="dialog"
        className={`relative p-2 rounded-full transition-colors ${hover}`}
      >
        <span className={`material-symbols-outlined ${iconColour}`} aria-hidden="true">notifications</span>
        {unread > 0 && (
          <span className="absolute top-0.5 right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-error text-on-error text-[10px] font-bold leading-[18px] text-center">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div
            role="dialog"
            aria-label="Notifications"
            className="fixed inset-x-4 top-[4.5rem] sm:absolute sm:inset-x-auto sm:right-0 sm:top-full sm:mt-2 sm:w-96 bg-surface text-on-surface border border-outline-variant rounded-xl shadow-xl z-50 overflow-hidden"
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-outline-variant">
              <p className="font-button">Notifications</p>
              {unread > 0 && (
                <button type="button" onClick={markAll} className="text-sm text-secondary font-bold hover:underline">
                  Mark all as read
                </button>
              )}
            </div>
            <div className="max-h-[60vh] sm:max-h-96 overflow-y-auto">
              {!loaded ? (
                <p className="px-4 py-6 text-sm text-on-surface-variant">Loading…</p>
              ) : failed && items.length === 0 ? (
                <p className="px-4 py-6 text-sm text-on-surface-variant">Couldn&apos;t load notifications. Try again in a moment.</p>
              ) : items.length === 0 ? (
                <p className="px-4 py-8 text-sm text-on-surface-variant text-center">You&apos;re all caught up.</p>
              ) : (
                <ul>
                  {items.map((n) => (
                    <li key={n.id} className="border-b border-outline-variant/40 last:border-b-0">
                      <button
                        type="button"
                        onClick={() => openItem(n)}
                        className={`w-full text-left px-4 py-3 flex gap-3 hover:bg-surface-container transition-colors ${n.isRead ? "" : "bg-secondary-container/10"}`}
                      >
                        <span
                          className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${n.isRead ? "bg-transparent" : "bg-secondary"}`}
                          aria-label={n.isRead ? undefined : "Unread"}
                        />
                        <span className="min-w-0 flex-1">
                          <span className={`block text-sm leading-snug ${n.isRead ? "" : "font-bold"}`}>{n.title}</span>
                          {n.body && <span className="block text-xs text-on-surface-variant mt-0.5 line-clamp-3">{n.body}</span>}
                          <span className="block text-[11px] text-on-surface-variant/80 mt-1">{timeAgo(n.createdAt)}</span>
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
