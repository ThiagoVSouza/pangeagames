import { defaultLocale, emailMessages, siteLocales } from "./generated/locales.js";

export const supportedSiteLocale = (value: string | undefined) => siteLocales.find(locale => locale.toLowerCase() === value?.toLowerCase());
export const siteLocale = (value: string | undefined): string => supportedSiteLocale(value) || defaultLocale;

export function emailText(key: string, locale: string, values: Record<string, string> = {}): string {
  const message = emailMessages[siteLocale(locale)]?.[key] || emailMessages[defaultLocale]?.[key];
  if (!message) throw new Error(`Missing email translation: ${key}`);
  return message.replace(/\{([a-zA-Z_]+)\}/g, (_match, name: string) => values[name] ?? `{${name}}`);
}

export function confirmationLocale(preferred: string, pageLocale: string): string {
  return siteLocales.includes(preferred as typeof siteLocales[number]) ? preferred : siteLocale(pageLocale);
}
