/**
 * Routing configuration for next-intl
 * Defines supported locales and default locale
 */

export const routing = {
  locales: ["en", "ca", "sv"],
  defaultLocale: "sv",
} as const;

export type Locale = (typeof routing.locales)[number];
