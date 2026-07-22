import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminUserChip from "@/components/admin/AdminUserChip";
import { SessionProvider } from "@/components/SessionProvider";
import UIProvider from "@/components/ui/UIProvider";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider requireRole="ADMIN">
    <UIProvider>
    <div className="bg-background font-body-md text-on-surface">
      <AdminSidebar />
      <main className="md:ml-64 min-h-screen">
        {/* Top App Bar */}
        <header className="sticky top-0 z-40 flex justify-end items-center px-4 md:px-margin-desktop py-4 bg-surface border-b border-outline-variant">
          <AdminUserChip />
        </header>
        <div className="p-margin-desktop">
          <div className="max-w-container-max mx-auto">{children}</div>
        </div>
      </main>
    </div>
    </UIProvider>
    </SessionProvider>
  );
}
