import { FeedContainer } from "@/components/feed/FeedContainer";
import type { FeedTab } from "@/components/feed/FeedTabs";

type HomePageSearchParams = Promise<Record<string, string | string[] | undefined>>;

interface HomePageProps {
  searchParams: HomePageSearchParams;
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const resolvedParams = await searchParams;
  const rawTab = resolvedParams?.tab;
  const tabValue = Array.isArray(rawTab) ? rawTab[0] : rawTab;
  const tabParam: FeedTab = tabValue === "following" ? "following" : "all";

  return (
    <div className="border-x border-gray-200">
      <FeedContainer activeTab={tabParam} />
    </div>
  );
}

