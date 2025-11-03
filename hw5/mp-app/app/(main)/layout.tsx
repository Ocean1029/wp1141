import { SideNav } from "@/components/navigation/SideNav";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      <SideNav />
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
}

