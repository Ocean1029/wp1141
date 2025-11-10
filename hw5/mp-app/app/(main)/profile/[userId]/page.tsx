import { ProfileContainer } from "@/components/profile/ProfileContainer";
import { auth } from "@/lib/auth";

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const { userId } = await params;
  const session = await auth();
  
  return (
    <div className="border-x border-gray-200">
      <ProfileContainer userId={userId} currentUserID={session?.user?.userID ?? null} />
    </div>
  );
}

