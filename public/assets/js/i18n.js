/* Locale data is generated into /assets/i18n/<locale>.js before this script. */
(() => {
  const current = () => window.PangeaLocale;
  const interpolate = (message, values) => message.replace(/\{([a-zA-Z_]+)\}/g, (match, key) => String(values[key] ?? match));
  window.PangeaI18n = {
    get locale() { return current()?.locale || document.documentElement.lang; },
    t(key, values = {}) { return interpolate(current()?.messages[key] ?? key, values); },
    number(value, options) { return new Intl.NumberFormat(this.locale, options).format(value); },
    date(value, options) { return new Intl.DateTimeFormat(this.locale, options).format(new Date(value)); },
  };
  // A static host's single 404 fallback can still honor the locale in the URL,
  // without redirecting away from the missing path or losing its 404 status.
  document.addEventListener('DOMContentLoaded', () => {
    if (!document.body.hasAttribute('data-localized-404')) return;
    const requested = location.pathname.split('/')[1];
    let saved = '';
    try { saved = localStorage.getItem('pangea-language') || ''; } catch {}
    if (!saved) { try { saved = decodeURIComponent(document.cookie.split(';').map(value=>value.trim()).find(value=>value.startsWith('pangea_locale='))?.slice(14)||''); } catch {} }
    const locale = current()?.availableLocales.find(code => code.toLowerCase() === requested?.toLowerCase()) || current()?.availableLocales.find(code => code === saved);
    if (!locale || locale === current().locale) return;
    const catalog = document.createElement('script');
    catalog.src = `/assets/i18n/${encodeURIComponent(locale)}.js`;
    catalog.addEventListener('load', () => {
      document.documentElement.lang = current().locale;
      document.documentElement.dir = current().direction;
      document.documentElement.dataset.displayFont = current().displayFont;
      document.querySelectorAll('[data-i18n]').forEach(element => { element.textContent = window.PangeaI18n.t(element.dataset.i18n); });
      document.querySelectorAll('[data-locale-link]').forEach(link => {
        const url = new URL(link.href); const parts = url.pathname.split('/'); parts[1] = locale;
        url.pathname = parts.join('/'); link.href = url.href;
      });
    });
    document.head.append(catalog);
  });
})();
