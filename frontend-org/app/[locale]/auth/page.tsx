"use client";

import AuthSwitchPanel from "@/app/src/components/auth/AuthSwitchPanel";

export default function AuthPage() {
  return (
    <div className="container flex items-center justify-center min-h-[calc(100vh-8rem)] py-12">
      <div className="w-full max-w-xl">
        <AuthSwitchPanel />
      </div>
    </div>
  );
}
