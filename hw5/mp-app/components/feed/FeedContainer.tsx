import { auth } from "@/lib/auth";
import { EditablePostCard } from "./EditablePostCard";
import { FeedTabs, type FeedTab } from "./FeedTabs";
import { FeedList } from "./FeedList";
import { NewPostNotification } from "./NewPostNotification";

interface FeedContainerProps {
  activeTab: FeedTab;
}

export async function FeedContainer({ activeTab }: FeedContainerProps) {
  const session = await auth();

  return (
    <div className="feed__container min-h-screen">
      <FeedTabs activeTab={activeTab} />
      <NewPostNotification />
      <EditablePostCard session={session} />
      <FeedList activeTab={activeTab} />
    </div>
  );
}

