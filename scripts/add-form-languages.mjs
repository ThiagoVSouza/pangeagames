import { readFile, writeFile } from "node:fs/promises";

const options = `<option value="en">English</option><option value="pt-BR">Brazilian Portuguese</option><option value="zh-CN">Simplified Chinese</option><option value="ru">Russian</option><option value="es">Spanish</option><option value="de">German</option><option value="nl">Dutch</option><option value="fr">French</option><option value="it">Italian</option><option value="pt-PT">Portuguese (Portugal)</option><option value="ja">Japanese</option><option value="ko">Korean</option><option value="pl">Polish</option><option value="zh-TW">Traditional Chinese</option><option value="tr">Turkish</option><option value="sv">Swedish</option><option value="da">Danish</option><option value="hi">Hindi</option><option value="fi">Finnish</option><option value="nb">Norwegian</option>`;
const field = `<div class="field"><label for="FORM-language">Preferred reply language</label><select id="FORM-language" name="preferredLanguage" required>${options}</select></div>`;

for (const [file, form] of [["public/en/contact/index.html", "contact"], ["public/en/support/index.html", "support"]]) {
  let html = await readFile(file, "utf8");
  if (!html.includes('name="preferredLanguage"')) {
    const marker = `<div class="field-grid">`;
    html = html.replace(marker, `${marker}${field.replaceAll("FORM", form)}`);
    await writeFile(file, html, "utf8");
  }
}
