import { FeedTabs } from "./FeedTabs";
import { FeedList } from "./FeedList";

export function FeedContainer() {
  return (
    <div className="min-h-screen">
      <div className="sticky top-0 z-10 border-b border-gray-200 bg-white px-4 py-4">
        <h1 className="text-xl font-bold">Home</h1>
      </div>
      <FeedTabs />
      <FeedList />
    </div>
  );
}

