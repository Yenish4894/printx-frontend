import CustomerNav from "@/components/customer/CustomerNav";
import CustomerFooter from "@/components/customer/CustomerFooter";

export default function CustomerLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-surface text-on-surface font-body-md min-h-screen flex flex-col">
      <CustomerNav />
      <div className="flex-1">{children}</div>
      <CustomerFooter />
    </div>
  );
}
