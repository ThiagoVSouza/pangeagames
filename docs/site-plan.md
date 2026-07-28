# Pangea Games website plan

## Purpose

The website is the official home of Pangea Games and the conversion-focused launch site for its first game, **The Outpost**. Before release, its primary job is to turn interest into Steam wishlists. After release, it should direct visitors to the best store for their device while continuing to serve press, players who need support, and newsletter subscribers.

## Product principles

1. **Lead with the game.** The Outpost artwork, trailer, hook, and gameplay should occupy the first screen. Pangea Games acts as a trusted studio signature rather than competing with the game for attention.
2. **One primary action per launch phase.** Before release: “Wishlist on Steam.” After release: “Buy on Steam” or “Play now.” Mobile store links remain secondary until their releases are live.
3. **Show, then explain.** A short gameplay trailer and strong screenshots should precede longer feature descriptions.
4. **Fast and accessible.** Optimize images/video, use semantic HTML, support keyboard and reduced-motion users, and target WCAG 2.2 AA.
5. **Low-maintenance by design.** Static pages plus narrowly scoped serverless endpoints keep cost, operational burden, and attack surface small.

## Recommended information architecture

### 1. Home (`/`)

A single, polished game-first landing page:

- Header: compact Pangea logo, The Outpost, Press Kit, Support, social links, and a persistent store/wishlist button.
- Hero: The Outpost key art or trailer, one-sentence hook, release status, platform summary, and primary Steam CTA.
- Trailer: privacy-conscious YouTube/Vimeo embed loaded only after interaction, or a lightweight poster linking to the hosted trailer.
- Game pitch: one short paragraph answering what the player does and why the game is distinctive.
- Feature highlights: three to five concrete features, each supported by gameplay imagery.
- Gallery: six to eight curated screenshots; avoid concept art presented as gameplay.
- Platforms: Steam for Windows and macOS first; official App Store and Google Play badges when listings exist. Never show dead store buttons—use “Coming later” text or newsletter signup instead.
- Newsletter: a concise value proposition such as launch news, demos, and major updates; email field; explicit consent; link to privacy policy.
- Community: Discord as the primary community destination, with X and Instagram secondary.
- Footer: studio identity, press kit, support, privacy, terms if needed, social links, copyright, and store trademark notices.

### 2. Press kit (`/press`)

An HTML page that is useful without downloading anything, plus a “Download all assets” ZIP:

- One-line and short game descriptions, fact sheet, genre, developer/publisher, release window/date, price when public, languages, and supported platforms.
- Key features and accurate contact details for press/business inquiries.
- Trailer links and downloadable trailer file if practical.
- High-resolution game logo, transparent studio logo, key art/capsule art, app/icon art, and 8–12 caption-ready screenshots.
- Studio boilerplate, team credits, website/store/social links, and a clear asset-usage note.
- Version/date stamp so journalists can tell the kit is current.
- Optional: review-key request instructions. Do not expose keys or fulfill requests automatically.

The press assets should have descriptive filenames such as `the-outpost-gameplay-farming-01.jpg`, not generic camera exports.

### 3. Support (`/support`)

- Start with a compact FAQ for known issues, save locations, supported systems, accessibility, purchases/refunds, and privacy/account questions.
- Form fields: category, platform/store, name (optional), reply email, subject, message, game version, and optional diagnostic attachment only if there is a secure storage plan.
- Do not request passwords, payment details, or unnecessary personal data.
- Show a ticket/reference number and send a confirmation email. State an honest expected response time.
- Route platform billing/refund issues to the relevant store support when Pangea cannot resolve them.

### 4. Contact (`/contact`)

Use one form with a required inquiry type: general, business/partnerships, press, privacy, or accessibility. Support should link to the dedicated support flow. Publish a press email separately if fast media contact is important.

### 5. Legal (`/privacy`, optionally `/terms`)

The privacy policy should explain newsletter and contact/support processing, processors (Azure and Twilio SendGrid), retention, international transfers where relevant, unsubscribe/deletion rights, and a privacy contact. Add terms only when there is something meaningful to govern; do not create boilerplate merely to fill a footer.

### Later, not launch-critical

- `/news` only if the team will maintain it. Steam announcements can remain the canonical news source initially.
- `/games` once Pangea has a second title. With one title, it adds navigation without value.
- Localization after target markets and supported game languages are known. Build the page structure so localization can be added without a redesign.

## Calls to action by phase

| Phase | Primary CTA | Secondary CTA |
| --- | --- | --- |
| Steam page not public | Watch trailer / Join newsletter | Join Discord |
| Steam page public, pre-release | Wishlist on Steam | Join newsletter |
| Demo live | Play demo on Steam | Wishlist on Steam |
| Released on desktop | Buy on Steam | App/mobile release updates |
| Released on all stores | Play now, with store chooser | Join community |

Use official Steam, App Store, and Google Play assets. Add UTM parameters to outbound store links by placement and campaign, while keeping analytics free of personal data.

## Visual direction

- Use `capsule.png` as the initial art-direction anchor: warm golds, greens, mountain blues, tactile landscape textures, and restrained fantasy ornament.
- Use the monochrome Pangea emblem in the header/footer and press kit. Prepare a transparent-background vector or high-resolution PNG before production; the supplied raster has a white background and is too small for every use.
- The current capsule is suitable as a planning reference, but production needs separate responsive hero/key art without embedded title text, a transparent The Outpost wordmark, and true gameplay screenshots.
- Choose a cinematic display face for short headings and a highly legible UI face for body copy. Keep ornament away from forms and small text.
- Motion should be optional and subtle. Do not autoplay video with sound, and respect `prefers-reduced-motion`.

## Technical architecture

### Application

- Use one small server-rendered application hosted in the existing Azure App Service S1 plan. Most public pages can still be rendered as cacheable HTML; dynamic server routes handle the forms.
- Keep client JavaScript limited to the mobile menu, gallery, consent-aware media, and forms.
- Store URLs, release state, social links, support email routing, and structured game facts should live in one typed configuration file so launch updates are safe and quick.

### Azure App Service

- Create a separate Web App inside the existing S1 App Service Plan, provided the plan has spare CPU and memory. This normally adds no separate compute charge, but the new app shares the plan's resources and scaling behavior with every other app in it.
- Deploy production from the protected main branch and use an App Service deployment slot for staging when useful.
- Attach the confirmed custom domain, redirect the alternate hostname to one canonical HTTPS URL, and configure `www` consistently.
- Add server routes such as `POST /api/contact` and `POST /api/newsletter` within the same application; a separate Functions resource is unnecessary.
- Keep SendGrid keys and other secrets in App Service environment variables, never frontend code or the repository. Mark environment-specific values as deployment-slot settings if a staging slot is used.
- Add security headers, custom 404/500 handling, cache rules for fingerprinted assets, and strict request validation.

### Contact and newsletter delivery

- **Newsletter:** The server route validates email and consent, applies rate limits/bot checks, then adds the address to a dedicated SendGrid Marketing Campaigns list. Prefer confirmed/double opt-in and always include one-click unsubscribe in campaigns.
- **Contact/support:** The server route validates and sanitizes the request, creates a reference ID, sends the team a structured notification through SendGrid Email API, and sends the user a minimal confirmation. For durable ticket history, add a real help desk or a small data store later; email alone is not a ticketing system.
- Use a honeypot, minimum submission time, request-size limits, IP-based throttling, and a privacy-friendly challenge such as Cloudflare Turnstile if abuse warrants it.
- Do not expose Twilio/SendGrid API keys or call SendGrid directly from the browser.

## SEO, sharing, and measurement

- Unique title and description for every page; canonical URLs; `sitemap.xml`; `robots.txt`; favicon/app icons; Open Graph and social-card images.
- Structured data for `VideoGame`, `Organization`, and trailers where the visible content supports it.
- Descriptive alt text for meaningful images, empty alt text for decoration, captions for video, visible focus states, 44px-ish touch targets, and contrast tested to WCAG 2.2 AA.
- Track only useful events: Steam CTA by placement, trailer play, newsletter success, store badge clicks, and support completion. Prefer privacy-light analytics (for example, Azure Application Insights with careful configuration or a cookieless analytics service).
- Do not add advertising pixels or a consent banner unless the actual tracking stack requires it. A banner is not a substitute for data minimization.

## Content and asset checklist

Before implementation can reach production quality, collect:

- Final one-sentence hook, short description, feature list, genre, release window/date, price, age rating status, languages, and accessibility features.
- Steam App ID/store URL; later App Store and Google Play URLs; whether Windows and macOS launch simultaneously.
- Trailer URL/file and 6–12 real gameplay screenshots.
- Transparent/high-resolution game wordmark and Pangea logo; hero/key art without baked-in text; favicon/social-card variants.
- Discord, X, and Instagram URLs.
- Public press/business contact and private support destination.
- Legal company name, country/address needed for email compliance, privacy contact, and desired retention periods.
- Confirmation that the Twilio account includes SendGrid, and which Marketing Campaigns plan/list should receive subscriptions.

## Delivery plan

### Phase 0 — decisions and content

Confirm the canonical domain spelling, release phase, game positioning, store/social URLs, languages, and available assets. Establish the content inventory and privacy requirements.

### Phase 1 — launch-ready marketing site

Build the responsive home page, press kit page, privacy page, metadata/social previews, store-link configuration, and Azure App Service deployment. If the Steam page is public, make wishlist conversion the acceptance criterion.

### Phase 2 — forms and operations

Add newsletter and contact/support routes, SendGrid integration, abuse controls, confirmation messages, error monitoring, and an operational test/checklist for handling submissions and data requests.

### Phase 3 — QA and launch

Test keyboard/screen-reader basics, color contrast, responsive layouts, Core Web Vitals, forms and failure states, email deliverability, redirects, metadata previews, broken links, and store tracking. Run a production-domain smoke test before announcement traffic.

### Phase 4 — release switch and maintenance

Make release-state changes through configuration: CTA copy, store availability, price/release facts, press ZIP, and social cards. Review support FAQ and press assets after every meaningful game update.

## Decisions to confirm

1. The supplied company name is **Pangea Games**, but the stated domain is **`poangeagames.com`**. Confirm whether that spelling is intentional. If both spellings are owned, use `pangeagames.com` as canonical and redirect the typo; otherwise use the domain actually owned consistently.
2. Is The Outpost’s Steam page already public? If yes, provide its URL/App ID. If not, the initial primary CTA should be newsletter or Discord until wishlisting is possible.
3. Does “Twilio account” include an active SendGrid account and Marketing Campaigns plan, or only Twilio messaging/phone products?
4. Is the mobile release simultaneous with Steam or planned for later? This determines whether mobile badges are active CTAs or only release-notification copy.
5. Is the initial site English-only, Portuguese-only, or bilingual?
