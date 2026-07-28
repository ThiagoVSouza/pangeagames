# The Outpost website — Living Valley implementation plan

## 1. Outcome

Build the production Pangea Games website using the selected **Living Valley** direction: a warm, immersive, game-first experience for The Outpost. Until public store listings exist, the website's primary conversion is release-update registration. When Steam becomes public, the primary conversion changes to a Steam wishlist; community discovery, press support, and player support remain secondary goals.

The production site will be a small dynamic Node.js application hosted as its own Azure Web App inside the existing S1 App Service Plan. A lightweight Express server will serve the static multilingual website from `public/` and expose SendGrid handlers from `server/`. This cleanly separates public browser assets from private server code while keeping deployment to a single Azure Web App.

## Confirmed project decisions

- Canonical public hostname: **`www.pangeagames.com`**.
- English is the default language, with architecture for 20+ translated languages.
- The Outpost is planned for Windows and macOS through Steam, plus Android and iOS.
- No Steam, App Store, or Google Play listings exist yet.
- No final trailer, screenshots, or social destinations exist yet; use clearly marked mock content during implementation.
- SendGrid is not configured yet. The server integration will read future credentials exclusively from Azure App Service environment variables.
- Public frontend files and private SendGrid/server code will live in separate `public/` and `server/` folders.
- The existing Azure S1 App Service Plan runs **Linux**; the production Web App will use the same plan and operating system.

## 2. Scope

### Version 1 routes

| Route | Purpose | Primary action |
| --- | --- | --- |
| `/` | Redirect to or serve default English experience | Explore The Outpost |
| `/en/` | English The Outpost marketing page | Get release updates |
| `/{locale}/` | Localized marketing page | Get release updates |
| `/press` | Press facts and downloadable media | Download press kit |
| `/support` | FAQ and player support form | Submit support request |
| `/contact` | Business, press, privacy, and general inquiries | Send inquiry |
| `/privacy` | Explain data handling and user rights | — |
| `/api/newsletter` | Server-only newsletter subscription handler | — |
| `/api/contact` | Server-only general inquiry handler | — |
| `/api/support` | Server-only support handler | — |
| `/health` | Deployment and monitoring health check | — |

### Deferred

- News/blog until Pangea can maintain a publishing cadence.
- Games index until the studio has a second title.
- User accounts, customer portal, database, and full ticketing system.
- App Store and Google Play buttons until real listings exist.
- Localization beyond the initial agreed language set.

## 3. Production stack

### Application

- Node.js with a small Express server.
- TypeScript with strict checking for server code and build tooling.
- Static semantic HTML, CSS, and minimal browser JavaScript in `public/`.
- Express API routes in `server/routes/` for SendGrid integration.
- Zod or equivalent schema validation for every incoming form request.
- Vitest for units and Playwright for a small set of critical browser journeys.
- A lightweight static build step for translations, responsive image manifests, asset fingerprints, and HTML metadata. Avoid a client-side SPA framework because the site does not need application-style state.

The current concept prototype is a visual reference, not the production foundation. Port its Living Valley layout and CSS into semantic production templates; remove the temporary concept selector and the two rejected styles.

### Target repository structure

```text
/
├── public/                         # Everything directly web-accessible
│   ├── en/
│   │   ├── index.html
│   │   ├── press/index.html
│   │   ├── support/index.html
│   │   ├── contact/index.html
│   │   └── privacy/index.html
│   ├── {locale}/                   # Same generated route structure per locale
│   ├── assets/
│   │   ├── css/
│   │   ├── js/
│   │   ├── fonts/
│   │   └── images/
│   ├── robots.txt
│   └── sitemap.xml
├── server/                         # Never exposed as static files
│   ├── app.ts
│   ├── config.ts
│   ├── middleware/
│   ├── routes/
│   │   ├── newsletter.ts
│   │   ├── contact.ts
│   │   └── support.ts
│   ├── services/sendgrid.ts
│   └── validation/
├── content/                        # Source translations and game facts
│   ├── en.json
│   └── {locale}.json
├── scripts/                        # Static page and asset generation
├── tests/
├── package.json
├── tsconfig.json
└── .env.example                    # Names only; never real secrets
```

### Azure

- New Web App within the existing S1 App Service Plan.
- Linux Web App hosted inside the existing Linux S1 App Service Plan.
- Supported Node LTS version pinned consistently in Azure, `package.json`, local development, and CI.
- Always On enabled.
- HTTPS Only enabled; minimum TLS 1.2 or the highest level compatible with target browsers.
- `www` and apex domain normalized to one canonical hostname.
- Staging deployment slot if capacity permits; remember that the slot consumes the same S1 CPU and memory.
- Application Insights for server errors, latency, and failed form submissions, configured to avoid collecting form bodies or email addresses.

### Deployment

- GitHub Actions on the protected production branch.
- Authenticate to Azure with OpenID Connect rather than a long-lived publish profile where account permissions allow it.
- Pipeline stages: clean install, type-check, unit tests, production build, deploy to staging, health/smoke checks, then slot swap.
- Production start command: `npm start`, running the compiled Express entry point.
- Keep deployment and SendGrid settings outside source control.

## 4. Living Valley design system

### Brand roles

- **The Outpost** is the foreground brand: title, world, trailer, gameplay, and store CTA.
- **Pangea Games** is the trusted studio signature: compact header mark, footer identity, press information, and legal ownership.
- The game artwork should dominate; the studio logo should never compete with the title treatment.

### Core palette

| Token | Initial value | Use |
| --- | --- | --- |
| `--valley-cream` | `#F3EAD5` | Main light background |
| `--valley-ink` | `#243027` | Primary text |
| `--valley-forest` | `#314A38` | Footer and dark panels |
| `--valley-moss` | `#667665` | Secondary text |
| `--valley-gold` | `#D39A41` | Small highlights and focus accents |
| `--valley-blue` | `#456D83` | Platform and interactive accents |
| `--steam-navy` | `#1E3041` | Official Steam-oriented CTA treatment |

Values must be contrast-tested against their actual backgrounds before being frozen.

### Typography

- Display: Marcellus or a licensed alternative with a calm historical character.
- Body/UI: Atkinson Hyperlegible or Source Sans 3.
- Use uppercase letter-spaced labels sparingly for navigation and eyebrow text.
- Use fluid type with `clamp()` while imposing readable maximum line lengths.
- Self-host production font files in WOFF2 format to avoid third-party font requests and layout shifts.

### Layout rules

- Maximum text container: approximately 1,200–1,320px; narrower measures for prose.
- Full-bleed hero and platform banner; editorial content aligned to a consistent horizontal grid.
- Generous vertical rhythm to preserve the cinematic feeling.
- Alternate feature imagery and text on desktop; return to a predictable image-then-copy order on mobile.
- Persistent desktop header after the hero threshold; compact sticky primary action on small screens. It begins as “Get release updates” and later becomes “Wishlist on Steam.”
- No body text embedded in images.

### Motion

- A restrained hero reveal and subtle image depth are acceptable.
- Never autoplay sound.
- Avoid continuous decorative animation.
- Honor `prefers-reduced-motion` and keep all content available with JavaScript disabled.

## 5. Homepage component map

### `SiteHeader`

- Compact Pangea mark.
- Links to Game, Media, Press Kit, and Support.
- Persistent Wishlist CTA once the Steam page is public.
- Accessible mobile drawer with focus management, Escape handling, and scroll locking.

### `Hero`

- Responsive key art with a deliberate mobile crop.
- Separate transparent The Outpost wordmark or accessible text title.
- Release-state eyebrow, one-line player fantasy, platform line, Steam CTA, and trailer control.
- Below-the-fold cue that remains decorative to assistive technology.

### `StoryIntroduction`

- Emotional value proposition and concise description.
- No more than approximately 80 words.

### `FeatureStory`

Three editorial feature blocks:

1. Build — settlement planning and growth.
2. Cultivate — land, seasons, and community.
3. Explore — discovery beyond the settlement.

Each block requires one real gameplay image or clip that proves the claim in its copy.

### `MediaGallery`

- One featured image and a selectable thumbnail rail.
- Keyboard-operable lightbox with previous/next controls, captions, and close behavior.
- Six to eight launch images; distinguish concept art from gameplay.
- Do not load full-resolution originals until requested.

### `PlatformPanel`

- Current state: show “Coming to Windows, macOS, Android, and iOS” without clickable store badges.
- Until a Steam page exists, the primary conversion is “Get release updates,” leading to the newsletter form.
- When Steam becomes public, promote “Wishlist on Steam” to the primary CTA.
- After release, show a store chooser controlled from centralized release configuration.
- Never render official-looking store buttons that lead nowhere.

### `NewsletterSignup`

- Email address only.
- Plain explanation of email frequency/content.
- Explicit consent text and privacy link.
- Inline pending, success, duplicate, validation, rate-limit, and service-error states.
- Progressive enhancement: usable as a conventional POST without client JavaScript.

### `CommunityLinks`

- Discord emphasized as the community destination.
- X and Instagram secondary.
- Accessible labels; external-link behavior indicated consistently.

### `SiteFooter`

- Pangea mark and studio sentence.
- Press Kit, Support, Contact, and Privacy.
- Social links, copyright, and required store trademark notices.

## 6. Supporting pages

### Press kit

- Living Valley header but simpler editorial body for speed and clarity.
- Fact sheet, short/long descriptions, features, developer/publisher, release status, platforms, languages, contact, and last-updated date.
- Previewable image grid with direct individual downloads.
- Versioned ZIP generated during the build or release process, not assembled per request.
- Descriptive filenames and image dimensions/file sizes shown where helpful.

### Support

- Search-free FAQ for the initial small knowledge base.
- Form fields: category, platform/store, optional name, reply email, subject, message, and game version.
- No file upload in V1.
- Clear warning not to submit passwords or payment information.
- Reference ID returned after success and included in confirmation email.

### Contact

- Inquiry type: general, business, press, privacy, or accessibility.
- Optional name, required reply email, subject, and message.
- Support inquiries redirected to the support page.
- Public press email only if Pangea is prepared to monitor it.

### Privacy

- Identify Pangea and the privacy contact.
- Explain contact/support and newsletter purposes, legal bases applicable to the business, SendGrid and Azure processing, retention, international transfers, unsubscribe/deletion rights, and complaint channels.
- Have locally qualified counsel review the final policy; implementation work can provide structure but not legal approval.

## 7. Content model

Create one typed configuration module for facts that change at launch:

```ts
type ReleaseState = "announce" | "wishlist" | "demo" | "released";

interface GameConfig {
  releaseState: ReleaseState;
  releaseDate?: string;
  steamAppId?: string;
  stores: {
    steam?: string;
    appStore?: string;
    googlePlay?: string;
  };
  platforms: string[];
  social: {
    discord?: string;
    x?: string;
    instagram?: string;
  };
}
```

All CTA labels and availability states derive from this configuration so launch-day changes do not require editing multiple templates. The initial value is `announce`, with no store URLs and platforms set to Windows, macOS, Android, and iOS.

## Localization architecture

- English source content is canonical and lives in `content/en.json`.
- Each supported locale gets an explicit file and stable URL prefix such as `/pt-BR/` or `/ja/`.
- Generate static HTML for every locale during the build; do not translate content in the browser.
- `/` uses English by default. A non-blocking browser-language suggestion may offer another supported language, but must not force a redirect or prevent users from selecting English.
- Language picker shows language names in their own language and remains keyboard accessible.
- Add `lang`, canonical URL, and complete `hreflang` alternates to every localized page, including `x-default` for English.
- Localize titles, descriptions, Open Graph copy, form labels/errors, image alt text, consent copy, and structured data—not only visible paragraphs.
- Support longer translations and scripts with different line-breaking behavior; avoid fixed-height text containers.
- Start with English mock content. Add each translation only after human review; machine-generated draft translations must not be presented as final production copy.
- Locale-specific press kits can follow later if press copy is not translated at initial launch.

## 8. SendGrid implementation

### Required secrets/settings

- `SENDGRID_API_KEY`
- `SENDGRID_FROM_EMAIL`
- `SENDGRID_FROM_NAME`
- `SENDGRID_CONTACT_TO_EMAIL`
- `SENDGRID_SUPPORT_TO_EMAIL`
- `SENDGRID_NEWSLETTER_LIST_ID`
- Optional template IDs for confirmations and double opt-in.

Use least-privilege API keys and separate production/staging recipients. Mark every environment-specific value as a deployment-slot setting.

### Newsletter flow

1. Validate email, consent, honeypot, content type, origin, and request size.
2. Apply IP/email rate limiting without permanently storing raw IP addresses.
3. Add or update the contact in the correct SendGrid Marketing Campaigns list.
4. Prefer confirmed/double opt-in before treating the address as marketable.
5. Return a generic success response that does not reveal whether an email is already registered.
6. Never log the email address or SendGrid response body in production telemetry.

### Contact/support flow

1. Validate and normalize the submitted fields.
2. Reject links or suspicious repetition when abuse rules trigger.
3. Generate a non-sequential public reference ID.
4. Send a structured notification to Pangea through SendGrid.
5. Send a minimal confirmation to the visitor.
6. Return success only after the internal notification is accepted.

Email is not durable ticket storage. If support volume grows, replace the delivery target with a help desk while preserving the public form contract.

### Abuse controls

- Hidden honeypot and minimum-completion-time signal.
- Per-IP and per-email throttles.
- Strict request body limit.
- Same-origin checks plus CSRF protection appropriate to the form implementation.
- Add a privacy-conscious challenge only after observing meaningful bot traffic.
- Never put the SendGrid key in any `NEXT_PUBLIC_*` setting.

## 9. Images and assets

### Existing assets

- `docs/capsule.png`: use as the primary prototype/mock image and as multiple deliberate crops, clearly recognizing that it is not enough to carry the final production site alone.
- `docs/pangea_logo.png`: adequate for prototype identity, but needs a transparent/vector master and responsive variants.

### Mock implementation assets

- Use the supplied capsule for the hero and color direction.
- Create neutral CSS-framed mock panels for gameplay features and the gallery, labeled “Gameplay image coming soon” where necessary.
- Use a poster-style trailer placeholder with no fake playback behavior.
- Use `#`-free disabled social controls or plain “Coming soon” labels; do not ship links that jump to the top of the page.
- Keep mock content centralized so real imagery and URLs can replace it without layout changes.

### Required production assets

- Hero/key art without embedded title, composed for desktop landscape and mobile portrait crops.
- Transparent The Outpost wordmark.
- Transparent/vector Pangea logo plus light and dark variants.
- Six to twelve real gameplay screenshots at consistent aspect ratios.
- Trailer poster and final hosted trailer URL/file.
- Favicon set and platform-independent app icon.
- 1200×630 social-sharing image.
- Press-kit originals and a versioned ZIP.
- Official Steam, App Store, and Google Play badges when applicable.

### Asset pipeline

- Preserve lossless masters outside the public bundle.
- Produce AVIF/WebP with JPEG/PNG fallbacks where appropriate.
- Set intrinsic dimensions to prevent layout shift.
- Establish a focal point for every editorial image so mobile crops remain intentional.
- Use short, descriptive alt text based on the purpose of the image in context.

## 10. Accessibility and performance acceptance criteria

### Accessibility

- Target WCAG 2.2 AA.
- Complete keyboard access and visible focus indication.
- Skip link and semantic landmarks.
- No information conveyed by color alone.
- Form errors associated with their fields and announced to assistive technology.
- Gallery and navigation tested with keyboard and a representative screen reader.
- Captions for trailer/video and text alternative for meaningful audio.
- Touch targets approximately 44px where layout permits.

### Performance

- Mobile-first image sizes and no hero video download before user intent.
- Largest Contentful Paint target below 2.5 seconds at the 75th percentile after real-user data exists.
- Cumulative Layout Shift target below 0.1.
- Interaction to Next Paint target below 200ms.
- Initial JavaScript budget kept deliberately small; marketing content should not require hydration.
- Fonts preloaded only when demonstrably beneficial.

## 11. SEO and analytics

- Page-specific title, description, canonical URL, Open Graph, and X metadata.
- `Organization`, `VideoGame`, and `VideoObject` structured data only where supported by visible facts.
- `sitemap.xml`, `robots.txt`, favicon, web manifest if needed, and useful 404 page.
- UTM-tagged store URLs by CTA placement while avoiding personal data in query parameters.
- Measure Steam CTA clicks, trailer starts, successful newsletter subscriptions, support completion, and store selection.
- Do not add advertising pixels or a cookie banner unless the chosen analytics/marketing behavior actually requires consent.

## 12. Testing strategy

### Automated

- Unit tests for release-state CTA mapping, validators, reference IDs, and SendGrid request construction.
- Route tests for malformed input, oversized payloads, honeypot submissions, rate limits, SendGrid failures, and safe responses.
- Browser smoke tests for homepage navigation, mobile menu, gallery keyboard controls, newsletter success/error, and support completion.
- Automated accessibility scan as a guardrail, supplemented by manual checks.
- Link checker for store, social, press, and legal destinations.

### Manual release checks

- Desktop and mobile Chrome, Safari, Firefox, and Edge at representative sizes.
- Keyboard-only and reduced-motion behavior.
- High zoom and narrow viewport reflow.
- Real SendGrid deliverability to common providers.
- Social-card previews and structured-data validation.
- Staging-to-production slot swap and rollback rehearsal.

## 13. Delivery sequence

### Milestone 0 — unblock content and infrastructure

- Record `www.pangeagames.com` as canonical and plan an apex-domain redirect to it if `pangeagames.com` is also controlled.
- Confirm the existing Linux S1 plan's resource group, region, and spare capacity.
- Establish English source copy and finalize the list and codes of the 20+ target languages.
- Add mock store/social/media configuration and document the replacement workflow.
- Collect legal identity/contact details needed for privacy and future email compliance.
- Prepare environment-variable names and mocked SendGrid adapters; sender authentication, keys, lists, and templates can be supplied later.

**Exit:** the content inventory has owners and no unresolved item blocks the homepage.

### Milestone 1 — production foundation

- Create the Express/static-site project with the `public/`, `server/`, and `content/` boundaries and core quality tooling.
- Add design tokens, typography, global layout, metadata helpers, release configuration, and asset pipeline.
- Configure local environment templates without secrets.
- Add CI checks.

**Exit:** clean build, type-check, and test suite run locally and in CI.

### Milestone 2 — Living Valley homepage

- Build header, hero, introduction, features, gallery, platform panel, newsletter presentation, community links, and footer.
- Implement responsive behavior, motion preferences, loading behavior, and accessibility semantics.
- Replace prototype crops with production assets as they arrive.

**Exit:** approved desktop and mobile homepage with accurate content and working outbound links.

### Milestone 3 — press, support, contact, and privacy

- Build supporting page templates and press asset downloads.
- Implement accessible forms and success/error states using mocked server responses.
- Complete privacy content review.

**Exit:** all V1 routes are content-complete without requiring live SendGrid.

### Milestone 4 — SendGrid and operational protection

- Implement server validation, newsletter/contact/support handlers, rate limits, confirmations, safe logging, and a development mock transport.
- Configure staging settings and run real delivery tests once the user supplies Azure environment variables.
- Document how Pangea responds to support, press, unsubscribe, and deletion requests.

**Exit:** end-to-end submissions work from staging and do not leak personal information.

### Milestone 5 — Azure deployment

- Create the Web App in the existing S1 plan and configure runtime, Always On, HTTPS, health check, settings, and Application Insights.
- Configure GitHub Actions with OIDC and deploy to staging.
- Attach the confirmed domain and validate canonical redirects and certificates.

**Exit:** staging deployment is healthy and repeatable from a clean commit.

### Milestone 6 — launch QA

- Complete browser, accessibility, performance, metadata, link, email, and security checks.
- Verify analytics events and exclude PII.
- Prepare launch-state configuration change and rollback procedure.
- Swap the validated staging slot into production.

**Exit:** production smoke tests pass on the canonical domain.

## 14. Definition of done

- Living Valley visual direction is faithfully implemented at mobile and desktop sizes.
- Every public route is responsive, keyboard accessible, and has accurate metadata.
- Wishlist/store state is controlled centrally and all outbound URLs are real.
- Newsletter, contact, and support flows operate through SendGrid with validation and abuse controls.
- No secrets or personal form content appear in source control, frontend bundles, or logs.
- Production deployment is automated and recoverable.
- Performance and accessibility acceptance criteria pass before launch.
- Press kit contains approved, current production assets.
- The team has a short operational guide for submissions, releases, and content updates.

## 15. Decisions still needed

1. Which exact 20+ locale codes should be included in the first release?
2. What legal company name, address/country, and privacy contact should appear in the privacy and email disclosures?
3. When SendGrid is configured, should newsletter subscription use confirmed/double opt-in?
