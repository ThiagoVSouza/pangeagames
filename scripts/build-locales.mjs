import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = fileURLToPath(new URL('../', import.meta.url));
const readJson = async path => JSON.parse(await readFile(join(root,path),'utf8'));
const config = await readJson('content/locales.json');
const languages = (await readJson('content/languages.json')).sort((a,b)=>a.nativeName.localeCompare(b.nativeName,'en',{sensitivity:'base'}));
const source = await readJson(`content/${config.default}.json`);
const sourceKeys = Object.keys(source.messages);
const catalogs = {};
const origin = (process.env.SITE_ORIGIN || 'https://www.pangeagames.com').replace(/\/$/,'');
const routes = { home:'',press:'press/',support:'support/',contact:'contact/',privacy:'privacy/',404:'404.html' };
const displayFont = locale => catalogs[locale].displayFont || (['en','pt-BR','pt-PT','de','fr','es'].includes(locale)?'cinzel':'body');
const escape = value => String(value).replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const placeholders = text => [...text.matchAll(/\{([a-zA-Z_]+)\}/g)].map(match=>match[1]).sort().join(',');
async function save(path,content) { const file=join(root,path);await mkdir(dirname(file),{recursive:true});await writeFile(file,content); }
for (const locale of config.published) {
  if (!/^[a-z]{2,3}(?:-[A-Z]{2})?$/.test(locale)) throw new Error(`Invalid locale code: ${locale}`);
  const catalog = await readJson(`content/${locale}.json`);
  if (catalog.locale!==locale || !['ltr','rtl'].includes(catalog.direction)) throw new Error(`Invalid metadata for ${locale}`);
  if (catalog.displayFont && !['cinzel','body'].includes(catalog.displayFont)) throw new Error(`Invalid display font for ${locale}`);
  for (const key of sourceKeys) {
    if (typeof catalog.messages[key]!=='string' || !catalog.messages[key].trim()) throw new Error(`Missing ${locale} translation: ${key}`);
    if (placeholders(catalog.messages[key])!==placeholders(source.messages[key])) throw new Error(`Placeholder mismatch: ${locale} / ${key}`);
  }
  for (const key of Object.keys(catalog.messages)) if (!(key in source.messages)) throw new Error(`Unknown translation key: ${locale} / ${key}`);
  catalogs[locale]=catalog;
}
if (!catalogs[config.default]) throw new Error('The default locale must be published');
const shared = {};
for (const part of ['header','footer']) shared[part]=await readFile(join(root,`templates/${part}.html`),'utf8');
const templates={};
for (const page of Object.keys(routes)) templates[page]=await readFile(join(root,`templates/pages/${page}.html`),'utf8');
function render(template,locale,page) {
  const catalog=catalogs[locale], language=languages.find(item=>item.code===locale);
  const options=(codes,flags=false)=>languages.filter(item=>codes.includes(item.code)).map(item=>`<option value="${escape(item.code)}"${flags?` data-flag="/assets/flags/${escape(item.flag)}.png"`:''}${item.code===locale?' selected':''}>${escape(item.nativeName)}</option>`).join('');
  const url=`${origin}/${locale}/${routes[page]}`;
  const seo=page==='404'?'<meta name="robots" content="noindex,follow">':`<link rel="canonical" href="${escape(url)}">`+config.published.map(code=>`<link rel="alternate" hreflang="${escape(code)}" href="${escape(`${origin}/${code}/${routes[page]}`)}">`).join('')+`<link rel="alternate" hreflang="x-default" href="${escape(`${origin}/${config.default}/${routes[page]}`)}"><meta property="og:locale" content="${escape(catalog.ogLocale || locale.replace('-','_'))}">`+config.published.filter(code=>code!==locale).map(code=>`<meta property="og:locale:alternate" content="${escape(catalogs[code].ogLocale || code.replace('-','_'))}">`).join('');
  const variables={locale:escape(locale),direction:catalog.direction,origin:escape(origin),localeFlag:`/assets/flags/${language?.flag || '1f1ec-1f1e7'}.png`,siteLanguageOptions:options(config.published,true),formLanguageOptions:options(languages.map(item=>item.code)),seo};
  return template.replace(/\{\{>(header|footer)\}\}/g,(_match,part)=>shared[part]).replace(/\{\{([^{}]+)\}\}/g,(_match,key)=>{
    if(key.startsWith('t:')) { const message=catalog.messages[key.slice(2)];if(message===undefined)throw new Error(`Unknown template key: ${key}`);return escape(message); }
    if(!(key in variables))throw new Error(`Unknown template variable: ${key}`);return variables[key];
  }).replace('<html ',`<html data-display-font="${displayFont(locale)}" `).trimEnd()+'\n';
}
for (const locale of config.published) {
  for (const [page,route] of Object.entries(routes)) await save(`public/${locale}/${page==='404'?route:`${route}index.html`}`,render(templates[page],locale,page));
  await save(`public/assets/i18n/${locale}.js`,`/* Generated from content/${locale}.json. */\nwindow.PangeaLocale=${JSON.stringify({locale,direction:catalogs[locale].direction,displayFont:displayFont(locale),availableLocales:config.published,defaultLocale:config.default,messages:catalogs[locale].messages}).replace(/</g,'\\u003c')};\n`);
}
await save('public/404.html',render(templates['404'],config.default,'404'));
await save('public/assets/i18n/locales.json',JSON.stringify({default:config.default,published:config.published,languages:config.published.map(code=>({code,name:catalogs[code].languageName,direction:catalogs[code].direction}))},null,2)+'\n');
// The gateway also works on static hosting, where no Express redirect runs.
const rootChoices=config.published.map(locale=>`<li lang="${escape(locale)}"><a href="/${escape(locale)}/">${escape(catalogs[locale].languageName)}</a></li>`).join('');
const rootPrompt=config.published.map(locale=>`<span lang="${escape(locale)}">${escape(catalogs[locale].messages['common.choose_language'])}</span>`).join(' / ');
await save('public/index.html',`<!doctype html><html lang="${config.default}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Pangea Games</title><link rel="stylesheet" href="/assets/ui/outpost/outpost-ui.css"><link rel="stylesheet" href="/assets/css/site.css"><script defer src="/assets/js/locale-redirect.js"></script></head><body class="op-site"><main class="language-gateway"><h1>${rootPrompt}</h1><ul>${rootChoices}</ul></main></body></html>\n`);
await save('public/assets/js/locale-redirect.js',`/* Generated locale gateway. Explicit locale URLs always take precedence. */
(() => {
  const published=${JSON.stringify(config.published)}, fallback=${JSON.stringify(config.default)};
  let saved='';
  try { saved=localStorage.getItem('pangea-language')||''; } catch {}
  if (!saved) { try { saved=decodeURIComponent(document.cookie.split(';').map(value=>value.trim()).find(value=>value.startsWith('pangea_locale='))?.slice(14)||''); } catch {} }
  const preferences=[saved,...(navigator.languages||[])];
  const locale=preferences.map(value=>published.find(code=>code.toLowerCase()===value.toLowerCase())||published.find(code=>code.split('-')[0]===value.split('-')[0])).find(Boolean)||fallback;
  location.replace('/'+locale+'/'+location.search+location.hash);
})();\n`);
const entries=config.published.flatMap(locale=>Object.entries(routes).filter(([page])=>page!=='404').map(([_page,route])=>`<url><loc>${escape(`${origin}/${locale}/${route}`)}</loc>${config.published.map(code=>`<xhtml:link rel="alternate" hreflang="${code}" href="${escape(`${origin}/${code}/${route}`)}"/>`).join('')}<xhtml:link rel="alternate" hreflang="x-default" href="${escape(`${origin}/${config.default}/${route}`)}"/></url>`));
await save('public/sitemap.xml',`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${entries.join('\n')}\n</urlset>\n`);
// Server output is compiled into dist/; production needs no access to content/.
const serverMessages=Object.fromEntries(config.published.map(locale=>[locale,Object.fromEntries(Object.entries(catalogs[locale].messages).filter(([key])=>key.startsWith('email.')))]));
await save('server/generated/locales.ts',`// Generated by scripts/build-locales.mjs. Edit content catalogs instead.\nexport const siteLocales = ${JSON.stringify(config.published)} as const;\nexport const replyLanguages = ${JSON.stringify(languages.map(item=>item.code))} as const;\nexport const defaultLocale = ${JSON.stringify(config.default)} as const;\nexport const emailMessages: Record<string, Record<string,string>> = ${JSON.stringify(serverMessages,null,2)};\n`);
console.log(`Generated ${config.published.length} complete locales, ${sourceKeys.length} messages each, six page types, runtime catalogs and sitemap.`);
