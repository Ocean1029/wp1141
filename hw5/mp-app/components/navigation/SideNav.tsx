"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, User, PenSquare } from "lucide-react";
import { UserMenu } from "./UserMenu";

export function SideNav() {
  const pathname = usePathname();

  const navItems = [
    { href: "/home", icon: Home, label: "Home" },
    { href: "/profile", icon: User, label: "Profile" },
    { href: "/post", icon: PenSquare, label: "Post" },
  ];

  return (
    <aside className="w-64 border-r border-gray-200 p-4">
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
      </nav>
      <UserMenu />
    </aside>
  );
}

