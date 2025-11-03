import { redirect } from "next/navigation";

export default function Home() {
  // Root route redirects to login (public) or home (authenticated)
  redirect("/login");
}
