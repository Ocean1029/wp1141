import { ProfileContainer } from "@/components/profile/ProfileContainer";

export default function ProfilePage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  return (
    <div className="border-x border-gray-200">
      <ProfileContainer userId={params} />
    </div>
  );
}

