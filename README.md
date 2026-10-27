# Pangea Games website

The production website for Pangea Games and **The Outpost**. It uses a static Living Valley frontend served by a small Express application, with server-only endpoints prepared for SendGrid.

## Structure

- `public/` — browser-accessible localized pages and assets
- `server/` — Express server, validation, rate limiting, and SendGrid transport
- `content/` — release state and localization source data
- `templates/` — shared, keyed page/header/footer templates
- `tests/` — automated validation tests
- `site/` — earlier visual-comparison prototype; not used by production

## Local development

### Approved UI review

The production frontend in `public/` now uses the approved Outpost UI from `../brand/outpost-ui-components`. The existing `site/` prototype is unchanged.

Run `npm run preview:local`, then open `http://127.0.0.1:4180/en/`. This preview binds only to loopback and removes SendGrid delivery keys from its process. Submissions use mock delivery. No production deployment is performed.

`npm run ui:sync` refreshes the reusable UI core and required assets in `public/assets/ui/outpost/`. The sync excludes component-catalog layout styles and records source/asset hashes in `manifest.json`. Set `OUTPOST_UI_SOURCE` to override the canonical library location. A standalone checkout without that sibling library uses its checked-in approved snapshot.

Shared page, navigation and footer markup live in `templates/`. `npm run content` generates complete localized pages, form-language options, runtime messages and SEO files. Form language defaults follow the page locale. Site composition remains in `public/assets/css/site.css`; form handling, gallery and navigation behavior remain in `public/assets/js/site.js`.

The integration includes the tighter warm focus halo, the inset panel backgrounds, and the restored title divider. See [the local review notes](docs/approved-ui-integration.md).

### Standard development server

1. Install dependencies with `npm install`.
2. Copy `.env.example` to `.env` if local overrides are needed.
3. Run `npm run dev`.
4. Open `http://localhost:3000`.

Without SendGrid settings, development submissions use a mock transport. In production, missing SendGrid settings cause form delivery to fail safely rather than pretending to accept a message.

## Azure App Service

Use a Linux Web App in the existing S1 plan. Set the Node runtime to a supported Node 22+ LTS release, enable Always On and HTTPS Only, and set the health check path to `/health`.

Configure these App Service environment variables before enabling production forms:

- `NODE_ENV=production`
- `PUBLIC_ORIGIN=https://www.pangeagames.com`
- `SENDGRID_API_KEY`
- `SENDGRID_FROM_EMAIL`
- `SENDGRID_FROM_NAME`
- `SENDGRID_CONTACT_TO_EMAIL`
- `SENDGRID_SUPPORT_TO_EMAIL`
- `SENDGRID_NEWSLETTER_LIST_ID`
- `SENDGRID_LANGUAGE_FIELD_ID` — ID of a SendGrid text custom field such as `preferred_language`
- `TRUST_PROXY=1`

The application starts with `npm start` and listens on Azure's injected `PORT` value.

## Localization

English (`/en/`) and Brazilian Portuguese (`/pt-BR/`) are complete for local review, with 214 messages each. All five content pages and the 404 page are generated from shared templates and the flat `messages` catalogs in `content/en.json` and `content/pt-BR.json`. Edit those sources rather than generated files in `public/<locale>/`.

The site-language selector changes the complete page, retaining its route, query and section anchor. The root language gateway uses the saved preference or browser language, with English fallback; explicit locale URLs take precedence. Only complete generated locales appear in site navigation. The remaining planned languages are still available as newsletter/reply preferences.

Run `npm run i18n:build` or `npm run content` after editing copy. `npm run build`, `npm run dev` and `npm run preview:local` also generate the localized content. Catalog completeness and named placeholders are enforced during generation; no automatic translation service runs at build time.

See [the localization guide](docs/localization.md) for adding languages, translating rich-text fragments, and reviewing metadata, validation, accessibility and email confirmation copy. Brazilian Portuguese content is prepared for local review; production deployment remains unchanged.

For multilingual newsletters, create one SendGrid text custom field named `preferred_language`, place its SendGrid field ID in `SENDGRID_LANGUAGE_FIELD_ID`, and build dynamic segments using values such as `en`, `pt-BR`, `ja`, or `zh-TW`. Keep subscribers in one master newsletter list rather than duplicating them across language-specific lists.
