import { readFile, writeFile } from "node:fs/promises";

const file = "public/en/index.html";
let html = await readFile(file, "utf8");
const options = `<option value="en">English</option><option value="pt-BR">Brazilian Portuguese</option><option value="zh-CN">Simplified Chinese</option><option value="ru">Russian</option><option value="es">Spanish</option><option value="de">German</option><option value="nl">Dutch</option><option value="fr">French</option><option value="it">Italian</option><option value="pt-PT">Portuguese (Portugal)</option><option value="ja">Japanese</option><option value="ko">Korean</option><option value="pl">Polish</option><option value="zh-TW">Traditional Chinese</option><option value="tr">Turkish</option><option value="sv">Swedish</option><option value="da">Danish</option><option value="hi">Hindi</option><option value="fi">Finnish</option><option value="nb">Norwegian</option>`;
const field = `<div class="newsletter-language"><label for="newsletter-language">Newsletter language</label><select id="newsletter-language" name="locale" required>${options}</select></div>`;
html = html.replace('<input type="hidden" name="locale" value="en">', field);
await writeFile(file, html, "utf8");
