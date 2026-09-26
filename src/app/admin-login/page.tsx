import { redirect } from "next/navigation";

// There is one login page for everyone; /login sends admins to /admin and
// customers to /dashboard. This route only exists so old bookmarks and links
// to /admin-login still land somewhere useful.
export default function AdminLoginRedirect() {
  redirect("/login");
}
