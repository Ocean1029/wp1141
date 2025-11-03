import { UserIdForm } from "@/components/auth/UserIdForm";

export default function RegisterPage() {
  return (
    <div className="w-full max-w-md space-y-8 rounded-lg bg-white p-8 shadow-lg">
      <div>
        <h1 className="text-center text-2xl font-bold">Create your handle</h1>
        <p className="mt-2 text-center text-gray-600">
          Choose your unique user ID
        </p>
      </div>
      <UserIdForm />
    </div>
  );
}

