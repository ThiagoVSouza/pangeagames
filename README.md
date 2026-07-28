# Pangea Games website

The production website for Pangea Games and **The Outpost**. It uses a static Living Valley frontend served by a small Express application, with server-only endpoints prepared for SendGrid.

## Structure

- `public/` — browser-accessible localized pages and assets
- `server/` — Express server, validation, rate limiting, and SendGrid transport
- `content/` — release state and localization source data
- `tests/` — automated validation tests
- `site/` — earlier visual-comparison prototype; not used by production

## Local development

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

English is currently the only published locale. Add exact approved locale codes to `content/locales.json`. A locale must not be published until all visible copy, metadata, errors, consent language, and image alternatives have been reviewed by a human translator.

For multilingual newsletters, create one SendGrid text custom field named `preferred_language`, place its SendGrid field ID in `SENDGRID_LANGUAGE_FIELD_ID`, and build dynamic segments using values such as `en`, `pt-BR`, `ja`, or `zh-TW`. Keep subscribers in one master newsletter list rather than duplicating them across language-specific lists.
