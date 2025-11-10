import { SideNav } from "@/components/navigation/SideNav";
import { auth } from "@/lib/auth";

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  return (
    <div className="flex min-h-screen">
      <SideNav session={session} />
      <main className="flex-1 ml-64 mr-64">
        {children}
      </main>
      <aside className="fixed top-0 right-0 h-screen w-64 border-l border-gray-200 bg-white z-10" />
    </div>
  );
}

