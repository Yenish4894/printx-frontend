"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

// ─────────────────────────── Confirm dialog ───────────────────────────

interface ConfirmOptions {
  title: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
}
type ConfirmFn = (opts: ConfirmOptions) => Promise<boolean>;

// ─────────────────────────────── Toasts ───────────────────────────────

type ToastType = "success" | "error" | "info";
interface Toast {
  id: number;
  type: ToastType;
  message: string;
}
type ToastFn = (message: string, type?: ToastType) => void;

interface UICtx {
  confirm: ConfirmFn;
  toast: ToastFn;
}
const Ctx = createContext<UICtx>({
  confirm: async () => false,
  toast: () => {},
});

export const useConfirm = () => useContext(Ctx).confirm;
export const useToast = () => useContext(Ctx).toast;

let toastSeq = 0;

export default function UIProvider({ children }: { children: React.ReactNode }) {
  // confirm state
  const [dialog, setDialog] = useState<ConfirmOptions | null>(null);
  const resolver = useRef<((v: boolean) => void) | null>(null);
  const confirmBtnRef = useRef<HTMLButtonElement>(null);

  const confirm = useCallback<ConfirmFn>((opts) => {
    setDialog(opts);
    return new Promise<boolean>((resolve) => {
      resolver.current = resolve;
    });
  }, []);

  const close = useCallback((result: boolean) => {
    resolver.current?.(result);
    resolver.current = null;
    setDialog(null);
  }, []);

  // Focus the confirm button + Esc to cancel while the dialog is open.
  useEffect(() => {
    if (!dialog) return;
    confirmBtnRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [dialog, close]);

  // toast state
  const [toasts, setToasts] = useState<Toast[]>([]);
  const toast = useCallback<ToastFn>((message, type = "success") => {
    const id = ++toastSeq;
    setToasts((t) => [...t, { id, type, message }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4000);
  }, []);

  const toastStyle: Record<ToastType, string> = {
    success: "bg-emerald-600 text-white",
    error: "bg-error text-on-error",
    info: "bg-primary-container text-on-primary-container",
  };
  const toastIcon: Record<ToastType, string> = {
    success: "check_circle",
    error: "error",
    info: "info",
  };

  return (
    <Ctx.Provider value={{ confirm, toast }}>
      {children}

      {/* Confirm dialog */}
      {dialog && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/50"
          onClick={() => close(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="confirm-title"
            className="bg-surface w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <h3 id="confirm-title" className="font-headline-md text-headline-md text-on-surface mb-2">
                {dialog.title}
              </h3>
              {dialog.message && <p className="text-body-md text-on-surface-variant">{dialog.message}</p>}
            </div>
            <div className="px-6 py-4 bg-surface-container flex justify-end gap-3">
              <button
                type="button"
                onClick={() => close(false)}
                className="px-5 py-2.5 rounded-lg border border-outline-variant font-button text-on-surface hover:bg-surface-container-high transition-colors"
              >
                {dialog.cancelLabel ?? "Cancel"}
              </button>
              <button
                ref={confirmBtnRef}
                type="button"
                onClick={() => close(true)}
                className={`px-5 py-2.5 rounded-lg font-button text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${
                  dialog.danger
                    ? "bg-error hover:brightness-95 focus-visible:ring-error"
                    : "bg-secondary hover:brightness-95 focus-visible:ring-secondary"
                }`}
              >
                {dialog.confirmLabel ?? "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toasts */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[210] flex flex-col items-center gap-2 pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            role={t.type === "error" ? "alert" : "status"}
            className={`pointer-events-auto flex items-center gap-2 px-5 py-3 rounded-full shadow-xl ${toastStyle[t.type]}`}
          >
            <span className="material-symbols-outlined text-[20px]" aria-hidden="true">{toastIcon[t.type]}</span>
            <span className="font-button text-sm">{t.message}</span>
          </div>
        ))}
      </div>
    </Ctx.Provider>
  );
}
