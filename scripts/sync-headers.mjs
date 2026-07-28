import { readFile, writeFile } from "node:fs/promises";

const pages = [
  "public/en/index.html",
  "public/en/press/index.html",
  "public/en/support/index.html",
  "public/en/contact/index.html",
  "public/en/privacy/index.html",
];

const home = await readFile(pages[0], "utf8");
const match = home.match(/<header class="site-header">[\s\S]*?<\/header>/);
if (!match) throw new Error("Canonical homepage header not found");

const header = match[0]
  .replace('href="#game"', 'href="/en/#game"')
  .replace('<a href="#media">Media</a>', '')
  .replace('<a href="/en/#media">Media</a>', '')
  .replace('href="#newsletter"', 'href="/en/#newsletter"')
  .replace(/<button class="menu-button"([^>]*)>[^<]*<\/button>/, '<button class="menu-button"$1 data-i18n="menu">Menu</button>')
  .replace(/<a href="\/en\/#game"[^>]*>[^<]*<\/a>/, '<a href="/en/#game" data-i18n="game">The game</a>')
  .replace(/<a href="\/en\/press\/"[^>]*>[^<]*<\/a>/, '<a href="/en/press/" data-i18n="press">Press kit</a>')
  .replace(/<a href="\/en\/support\/"[^>]*>[^<]*<\/a>/, '<a href="/en/support/" data-i18n="support">Support</a>')
  .replace(/<a class="nav-cta"([^>]*)>[^<]*<\/a>/, '<a class="nav-cta"$1 data-i18n="updates">Get updates</a>')
  .replace(/ data-i18n="menu"(?: data-i18n="menu")+/g, ' data-i18n="menu"')
  .replace(/ data-i18n="updates"(?: data-i18n="updates")+/g, ' data-i18n="updates"');

for (const page of pages) {
  let html = await readFile(page, "utf8");
  html = html.replace(/<header class="site-header(?: inner-header)?">[\s\S]*?<\/header>/, header);
  await writeFile(page, html, "utf8");
}
