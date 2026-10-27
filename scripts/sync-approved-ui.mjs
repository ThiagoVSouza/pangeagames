import { readFile, writeFile, mkdir, copyFile, access } from 'node:fs/promises';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';

const root = fileURLToPath(new URL('../', import.meta.url));
const source = resolve(process.env.OUTPOST_UI_SOURCE || join(root, '../brand/outpost-ui-components'));
const target = join(root, 'public/assets/ui/outpost');
const hash = value => createHash('sha256').update(value).digest('hex');
try { await access(join(source, 'outpost-ui.css')); }
catch {
  if (process.env.OUTPOST_UI_SOURCE) throw new Error(`Approved UI source not found: ${source}`);
  await access(join(target, 'manifest.json'));
  console.log('Using the vendored approved UI snapshot (canonical library is outside this checkout).');
  process.exit(0);
}

// Read CSS blocks without flattening media queries or splitting quoted URLs.
function blocks(css) {
  const result = []; let start = 0, depth = 0, quote = '', escaped = false, opening = -1;
  for (let i = 0; i < css.length; i++) {
    const char = css[i];
    if (escaped) { escaped = false; continue; }
    if (char === '\\') { escaped = true; continue; }
    if (quote) { if (char === quote) quote = ''; continue; }
    if (char === '"' || char === "'") { quote = char; continue; }
    if (char === '{') { if (depth === 0) opening = i; depth++; }
    if (char === '}' && --depth === 0) { result.push([css.slice(start, opening).trim(), css.slice(opening + 1, i)]); start = i + 1; }
  }
  return result;
}
const componentSelector = selector => /^\.op-(?:panel|titlebar|button|surface|field|scroll|mark|switch|control-row|slider|progress|select|native-select|tabs|tabpanel|list|empty|domain-row|card|live|status-message|dialog|tooltip|binding|stepper|marker|conversation|reduce-motion)(?:__|--|[\s.#:[>-]|$)/.test(selector);
function core(css) {
  return blocks(css).map(([selector, body]) => {
    if (selector.startsWith('@font-face') || selector === ':root') return `${selector}{${body}}`;
    if (/^@(media|supports)\b/.test(selector)) { const children = core(body); return children ? `${selector}{\n${children}\n}` : ''; }
    const selectors = selector.split(',').map(value => value.trim()).filter(value => value.startsWith(':lang(') || componentSelector(value));
    return selectors.length ? `${selectors.join(',')}{${body}}` : '';
  }).filter(Boolean).join('\n');
}
const originalCss = await readFile(join(source, 'outpost-ui.css'), 'utf8');
const css = '/* Generated from the approved Outpost library. Catalog layout is intentionally excluded. */\n' + core(originalCss.replace(/\/\*[\s\S]*?\*\//g, '')) + '\n';
const js = await readFile(join(source, 'outpost-ui.js'));
await mkdir(target, { recursive: true });
await writeFile(join(target, 'outpost-ui.css'), css);
await writeFile(join(target, 'outpost-ui.js'), js);
const paths = new Set([...css.matchAll(/url\(["']?(assets\/[^)"']+)/g)].map(match => match[1]));
paths.add('assets/godot/icon-arrow.png');
for (const name of ['OFL-cinzel-full.txt','OFL-NotoSans.txt','OFL-NotoSansArabic.txt','OFL-NotoSansDevanagari.txt','OFL-NotoSansThai.txt','OFL-NotoSansCJK.txt']) paths.add(`assets/licenses/${name}`);
paths.add('assets/godot/textures.json');
const files = {};
for (const path of [...paths].sort()) {
  await mkdir(dirname(join(target, path)), { recursive: true });
  await copyFile(join(source, path), join(target, path));
  files[path] = hash(await readFile(join(target, path)));
}
files['outpost-ui.css'] = hash(css); files['outpost-ui.js'] = hash(js);
const manifest = { source: 'TheOutpost_Marketing/brand/outpost-ui-components', source_css_sha256: hash(originalCss), source_js_sha256: hash(js), approval: 'Approved Godot UI, including the tighter warm halo, inset panel fills and restored title divider (27 October 2026).', files };
await writeFile(join(target, 'manifest.json'), JSON.stringify(manifest, null, 2) + '\n');
console.log(`Synced approved UI core and ${paths.size} local assets.`);
