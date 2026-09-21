import { redirect } from "next/navigation";

// Customers pay by bank transfer now and there is no wallet to manage. Old
// links and bookmarks to /wallet land on the orders page, where any unpaid
// order shows its payment instructions.
export default function WalletRedirect() {
  redirect("/orders");
}
