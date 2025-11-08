"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import LoginForm from "@/app/src/components/auth/LoginForm";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function AuthPage() {
  return (
    <div className="container flex items-center justify-center min-h-[calc(100vh-8rem)] py-12">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Welcome Back</h1>
          <p className="text-muted-foreground mt-2">Sign in to your account</p>
        </div>

        <LoginForm />

        <Card>
          <CardHeader>
            <CardTitle>New to the organization?</CardTitle>
            <CardDescription>Join us and become a member</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full" variant="outline">
              <Link href="/join">Create Membership Account</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
