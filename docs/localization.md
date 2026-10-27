# Website localization

The complete website is generated in English and Brazilian Portuguese for local review. The other listed languages remain planned website translations. No deployment or external translation service is involved.

## Sources

| File | Role |
| --- | --- |
| `content/en.json` | Canonical English catalog: 214 named messages |
| `content/pt-BR.json` | Complete Brazilian Portuguese catalog |
| `content/locales.json` | Default locale, generated/published locales and planned locales |
| `content/languages.json` | Native language names, preference codes and flag metadata |
| `templates/pages/*.html` | Shared Home, Press, Support, Contact, Privacy and 404 structure |
| `templates/header.html`, `footer.html` | Shared localized shell |
| `scripts/build-locales.mjs` | Escaped HTML generation, language options, metadata, sitemap, browser/server catalogs |
| `public/assets/js/i18n.js` | Browser message interpolation and locale-aware static-host 404 fallback |
| `server/i18n.ts` | Confirmation language selection and email message interpolation |

Generated outputs include `public/en/`, `public/pt-BR/`, `public/404.html`, the root language gateway, `public/assets/i18n/`, `public/sitemap.xml`, and `server/generated/locales.ts`. Do not edit generated outputs directly. The old header/language sync commands delegate to the complete localization build for compatibility.

## Edit copy

The catalogs contain metadata (`locale`, `languageName`, `direction`, `ogLocale`) and a flat `messages` object. Keep existing message keys stable when editing their wording. Keys use dot notation for context; callers look them up as exact strings.

Templates reference text using `{{t:common.the_game}}`. Translations are plain text and are escaped in both text and attribute positions. Keep links, emphasis and other markup in the template. For a paragraph with an inline link, translate its text fragments together so the assembled sentence reads naturally. Game/studio names, OS brands, language names in their native scripts, route slugs and machine-readable form values remain stable.

Preserve named placeholders exactly, for example `{reference}`, `{min}` and `{max}`. The build rejects a missing/empty message, unknown template key, extra catalog key or changed placeholder set in any published locale. It does not silently serve an English page under an incomplete translated route.

Run:

```text
npm run content
```

This is content generation and validation, not the automated test suite. The production build also generates content before compiling the server, so email translations are bundled in `dist/` without needing the source `content/` directory in production.

## Add a language

1. Copy `content/en.json` to `content/<code>.json` and translate every message, including metadata, consent, image alternatives, accessibility labels, dynamic states and confirmations.
2. Set `locale` to its exact code, `languageName` to its native name, `direction` to `ltr` or `rtl`, and `ogLocale` to its Open Graph form such as `pt_BR`.
3. Add its native name/flag to `content/languages.json` if absent. Add the code to `published` in `content/locales.json` when the complete catalog is ready to generate, and remove it from `planned`.
4. Run `npm run content`, then `npm run build`. Restart `npm run preview:local` after adding locales or changing email copy, since the server loads its generated locale list and email messages at startup. Review the generated pages before any production release.

No JavaScript translation dictionary or duplicated page markup needs editing. Native scripts can use the bundled regional fonts; non-Latin display text falls back to the body font. RTL direction is emitted on the HTML root and the shell has logical-direction overrides; review a new script's typography and layout at narrow widths.

## Routes, preferences and SEO

- Each locale has the same route structure: `/<locale>/`, `press/`, `support/`, `contact/`, `privacy/` and `404.html`.
- The language selector preserves the current path, query and anchor. It stores `pangea-language` in local storage and the non-sensitive `pangea_locale` preference cookie.
- Explicit locale URLs win over saved/browser preferences. The root gateway chooses a saved or browser-matched available language and falls back to English. The obsolete navigation-only preference is ignored.
- Internal links, page titles/descriptions, canonical URLs, Open Graph locale/description, `hreflang` alternatives and the sitemap are generated per locale. Override the canonical production origin with `SITE_ORIGIN` when generating for a different public domain.
- Express serves a localized 404 with a real 404 status and `Content-Language`. Static hosting uses the single generic 404 fallback and localizes its text in place from the path or saved locale, retaining the missing URL and response status.
- The static-host root rule rewrites to the gateway instead of permanently redirecting everyone to English. No Azure deployment workflow was run or altered.

## Forms and runtime messages

Labels, options, placeholders, success text, sending/error/rate-limit states, native constraint validation messages and reference-number formatting all come from the catalogs. IDs, field names, enum values and API paths remain stable. Each form submits a generated `uiLocale`; old clients may omit it and default to English.

Newsletter/reply language options retain the full existing preference list; their default follows the page locale. Site navigation only lists complete website translations. A selected reply language does not imply a website translation is available.

Public contact/support email acknowledgements use the preferred reply language when a translated confirmation exists, otherwise the page locale. Internal routing emails retain their operational labels and raw submitted text. Delivery behavior is unchanged; the local preview removes delivery keys and uses mock mail. No email was sent during implementation.

Browser integrations can use `window.PangeaI18n.t(key, values)`, `.number(value, options)` and `.date(value, options)`. Keep new visible runtime strings in the catalogs rather than adding English literals to scripts.

## Review state

Both catalogs are complete, including translation of the existing draft privacy text without changing its draft status. Automated tests were skipped at the user's request. The site remains local for review; no deployment or push was performed.

The production build completed. Browser inspection covered Portuguese desktop/narrow layouts and switching the complete page between English and Portuguese while retaining `#newsletter`; no forms were submitted. Saved previews: [Portuguese homepage](ui-review/pt-BR-home.png), [Portuguese newsletter](ui-review/pt-BR-newsletter.png), [Portuguese support on a narrow screen](ui-review/pt-BR-support-mobile.png).
