import { readFile, writeFile } from "node:fs/promises";

const languages = JSON.parse(await readFile("content/languages.json", "utf8"))
  .sort((left, right) => left.nativeName.localeCompare(right.nativeName, "en", { sensitivity: "base" }));
const pages = [
  "public/en/index.html",
  "public/en/press/index.html",
  "public/en/support/index.html",
  "public/en/contact/index.html",
  "public/en/privacy/index.html",
];

const menuOptions = languages.map((language) =>
  `<button type="button" role="option" data-language-option data-code="${language.code}"><img src="/assets/flags/${language.flag}.png" alt=""><span>${language.nativeName}</span></button>`,
).join("");
const selectOptions = languages.map((language) =>
  `<option value="${language.code}">${language.nativeName}</option>`,
).join("");

for (const page of pages) {
  let html = await readFile(page, "utf8");
  html = html.replace(
    /(<div class="language-options"[^>]*>)[\s\S]*?(<\/div>)/,
    `$1${menuOptions}$2`,
  );
  html = html.replace(
    /(<select[^>]+name="(?:preferredLanguage|locale)"[^>]*>)[\s\S]*?(<\/select>)/g,
    `$1${selectOptions}$2`,
  );
  await writeFile(page, html, "utf8");
}
