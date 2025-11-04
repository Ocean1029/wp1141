import { ProfileContainer } from "@/components/profile/ProfileContainer";

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const { userId } = await params;
  return (
    <div className="border-x border-gray-200">
      <ProfileContainer userId={userId} />
    </div>
  );
}

