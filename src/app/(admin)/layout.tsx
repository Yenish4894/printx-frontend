import AdminSidebar from "@/components/admin/AdminSidebar";

const ADMIN_AVATAR =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuAnBzXe1b4NoVQXlVVLV3-smkBq-Kmfb3IhNsyThYetatEYJ79sya5O8XuoW0xOAhcrq5pkHe4si4EXksdGhE7mRlE6oa8RrI0SYzWeIey97a1KcLufmOTnuWb0XQupupTbfKDqqZHjpi5OFBhfp4PaNtmu_J-ZnTxB_WWp4k30COBZTnSOf9PYiVI2lYm0MBPTgwj4L-6kqYIBNb4kTD_WdFIwedNCrt77yGmZKkvRzy_vs4yXnTPjtFXLfY5lHvucsVawcAdczBw";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-background font-body-md text-on-surface">
      <AdminSidebar />
      <main className="ml-64 min-h-screen">
        {/* Top App Bar */}
        <header className="sticky top-0 z-40 flex justify-between items-center px-margin-desktop py-4 bg-surface border-b border-outline-variant">
          <div className="flex items-center flex-1 max-w-xl">
            <div className="relative w-full">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">search</span>
              <input className="w-full pl-10 pr-4 py-2 bg-surface-container border-none rounded-lg focus:ring-2 focus:ring-secondary-container text-body-md font-body-md" placeholder="Search orders, clients, or SKU..." type="text" />
            </div>
          </div>
          <div className="flex items-center gap-6 ml-8">
            <div className="flex items-center gap-4">
              <button className="relative p-2 rounded-full hover:bg-surface-container-high transition-all">
                <span className="material-symbols-outlined text-on-surface-variant">notifications</span>
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-secondary-container rounded-full ring-2 ring-surface"></span>
              </button>
              <button className="p-2 rounded-full hover:bg-surface-container-high transition-all">
                <span className="material-symbols-outlined text-on-surface-variant">mail</span>
              </button>
            </div>
            <div className="h-8 w-[1px] bg-outline-variant"></div>
            <div className="flex items-center gap-3 cursor-pointer">
              <div className="text-right hidden sm:block">
                <p className="font-button text-on-surface leading-none">Alexander Pierce</p>
                <p className="text-[11px] text-on-surface-variant/70 uppercase font-black tracking-wider">Super Admin</p>
              </div>
              <div className="w-10 h-10 rounded-full border-2 border-secondary-container overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img className="w-full h-full object-cover" alt="Admin" src={ADMIN_AVATAR} />
              </div>
            </div>
          </div>
        </header>
        <div className="p-margin-desktop">
          <div className="max-w-container-max mx-auto">{children}</div>
        </div>
      </main>
    </div>
  );
}
