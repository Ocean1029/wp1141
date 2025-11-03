import { AuthProviders } from "@/components/auth/AuthProviders";

export default function LoginPage() {
  return (
    <div className="w-full max-w-md space-y-8 rounded-lg bg-white p-8 shadow-lg">
      <div>
        <h1 className="text-center text-2xl font-bold">Welcome</h1>
        <p className="mt-2 text-center text-gray-600">
          Sign in to continue
        </p>
      </div>
      <AuthProviders />
    </div>
  );
}

