"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/app/src/contexts/AuthContext";
import LoginForm from "@/app/src/components/auth/LoginForm";
import JoinForm from "@/app/src/components/membership/JoinForm";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useTranslations } from "next-intl";

export default function AuthSwitchPanel() {
  const t = useTranslations("membership");
  const tf = (key: string) => t(`form.${key}`);
  const { isAuthenticated, user, logout } = useAuth();
  const router = useRouter();
  const params = useParams();
  const locale = typeof params?.locale === "string" ? params.locale : "sv";
  const [mode, setMode] = useState<"login" | "join">("login");

  return (
    <Tabs
      value={mode}
      onValueChange={(v) => setMode(v as typeof mode)}
      className="w-full"
    >
      <TabsList className="grid w-full grid-cols-2 mb-6">
        <TabsTrigger value="login">{tf("login_tab")}</TabsTrigger>
        <TabsTrigger value="join">{tf("join_tab")}</TabsTrigger>
      </TabsList>
      <TabsContent value="login">
        {isAuthenticated && user ? (
          <Card>
            <CardHeader>
              <CardTitle>
                {user.first_name} {user.last_name}
              </CardTitle>
              <CardDescription className="space-y-1">
                <p>{user.email}</p>
                <p className="text-xs text-muted-foreground">
                  {tf("account_created")}
                </p>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="secondary"
                  onClick={() => router.push(`/${locale}/profile`)}
                >
                  Profile
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => router.push(`/${locale}/membership`)}
                >
                  Membership
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => router.push(`/${locale}/join`)}
                >
                  {tf("add_partner_children_link")}
                </Button>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => logout()}>
                  Logout
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>{tf("login_title")}</CardTitle>
              <CardDescription>{tf("login_description")}</CardDescription>
            </CardHeader>
            <CardContent>
              <LoginForm />
            </CardContent>
          </Card>
        )}
      </TabsContent>
      <TabsContent value="join">
        <Card>
          <CardHeader>
            <CardTitle>{t("title")}</CardTitle>
            <CardDescription>{t("subtitle")}</CardDescription>
          </CardHeader>
          <CardContent>
            <JoinForm locale={locale} />
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
