"use client";

import { useTranslations } from "next-intl";
import JoinForm from "@/app/src/components/membership/JoinForm";

export default function JoinPage() {
  const t = useTranslations("membership");
  return (
    <div className="container mx-auto max-w-4xl px-4 py-12">
      <div className="mb-8 text-center">
        <h1 className="mb-2 text-4xl font-bold">{t("title")}</h1>
        <p className="text-gray-600">{t("subtitle")}</p>
      </div>
      <JoinForm />
    </div>
  );
}
