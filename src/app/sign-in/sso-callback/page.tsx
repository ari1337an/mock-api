import { AuthenticateWithRedirectCallback } from "@clerk/nextjs";

export default function SSOCallback() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="bg-gray-800 p-8 rounded-lg shadow-xl">
        <AuthenticateWithRedirectCallback redirectUrl="/" />
      </div>
    </div>
  );
} 