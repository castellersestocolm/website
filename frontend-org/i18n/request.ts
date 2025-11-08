import { getRequestConfig } from "next-intl/server";

export default getRequestConfig(
  async ({ locale = "sv" }: { locale?: string }) => ({
    locale: locale || "sv",
    messages: (await import(`../public/locales/${locale || "sv"}/common.json`))
      .default,
  })
);
