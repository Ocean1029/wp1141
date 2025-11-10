"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Home, User, PenSquare } from "lucide-react";
import { UserMenu } from "./UserMenu";
import type { Session } from "next-auth";

interface SideNavProps {
  session: Session | null;
}

export function SideNav({ session }: SideNavProps) {
  const pathname = usePathname();
  const router = useRouter();

  const currentUserID = session?.user?.userID;
  const profileHref = currentUserID ? `/profile/${currentUserID}` : "/profile";

  const navItems = [
    { href: "/home", icon: Home, label: "Home" },
    { href: profileHref, icon: User, label: "Profile" },
  ];

  const handlePostClick = (e: React.MouseEvent) => {
    e.preventDefault();
    // Navigate to home and focus on compose area
    router.push("/home?focus=compose");
  };

  return (
    <aside className="fixed top-0 left-0 h-screen w-64 border-r border-gray-200 p-4 overflow-y-auto bg-white z-10">
      <nav className="space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-lg px-4 py-3 transition-colors ${
                isActive
                  ? "bg-blue-500 text-white"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              <Icon className="h-5 w-5" />
              <span className="font-medium">{item.label}</span>
            </Link>
          );
        })}
        <button
          onClick={handlePostClick}
          className="flex w-full items-center gap-3 rounded-lg px-4 py-3 transition-colors text-gray-700 hover:bg-gray-100"
        >
          <PenSquare className="h-5 w-5" />
          <span className="font-medium">Post</span>
        </button>
      </nav>
      <UserMenu session={session} />
    </aside>
  );
}

