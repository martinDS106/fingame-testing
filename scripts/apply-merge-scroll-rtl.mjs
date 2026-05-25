/**
 * One-off: wrap ScrollView contentContainerStyle={{ ... }} with mergeScrollContentRtl(rtl, ...)
 * for files under app/ that already use `rtl` from useT/useRTL.
 */
import fs from 'fs';
import path from 'path';

const ROOT = path.join(process.cwd(), 'app');

function walk(dir, out) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) walk(p, out);
    else if (p.endsWith('.tsx')) out.push(p);
  }
}

const files = [];
if (fs.existsSync(ROOT)) walk(ROOT, files);

const REPLACEMENTS = [
  // exact one-line styles (most common)
  [
    /contentContainerStyle=\{\{\s*padding:\s*16,\s*paddingBottom:\s*100,\s*gap:\s*16\s*\}\}/g,
    'contentContainerStyle={mergeScrollContentRtl(rtl, { padding: 16, paddingBottom: 100, gap: 16 })}',
  ],
  [
    /contentContainerStyle=\{\{\s*padding:\s*16,\s*paddingBottom:\s*100,\s*gap:\s*12\s*\}\}/g,
    'contentContainerStyle={mergeScrollContentRtl(rtl, { padding: 16, paddingBottom: 100, gap: 12 })}',
  ],
  [
    /contentContainerStyle=\{\{\s*padding:\s*16,\s*paddingBottom:\s*40,\s*gap:\s*16\s*\}\}/g,
    'contentContainerStyle={mergeScrollContentRtl(rtl, { padding: 16, paddingBottom: 40, gap: 16 })}',
  ],
  [
    /contentContainerStyle=\{\{\s*padding:\s*16,\s*paddingBottom:\s*32,\s*gap:\s*16\s*\}\}/g,
    'contentContainerStyle={mergeScrollContentRtl(rtl, { padding: 16, paddingBottom: 32, gap: 16 })}',
  ],
  [
    /contentContainerStyle=\{\{\s*padding:\s*16,\s*paddingBottom:\s*24,\s*gap:\s*12\s*\}\}/g,
    'contentContainerStyle={mergeScrollContentRtl(rtl, { padding: 16, paddingBottom: 24, gap: 12 })}',
  ],
  [
    /contentContainerStyle=\{\{\s*padding:\s*16,\s*paddingBottom:\s*24,\s*gap:\s*10\s*\}\}/g,
    'contentContainerStyle={mergeScrollContentRtl(rtl, { padding: 16, paddingBottom: 24, gap: 10 })}',
  ],
  [
    /contentContainerStyle=\{\{\s*padding:\s*16,\s*paddingBottom:\s*100,\s*gap:\s*10\s*\}\}/g,
    'contentContainerStyle={mergeScrollContentRtl(rtl, { padding: 16, paddingBottom: 100, gap: 10 })}',
  ],
  [
    /contentContainerStyle=\{\{\s*padding:\s*16,\s*paddingBottom:\s*110,\s*gap:\s*12\s*\}\}/g,
    'contentContainerStyle={mergeScrollContentRtl(rtl, { padding: 16, paddingBottom: 110, gap: 12 })}',
  ],
  [
    /contentContainerStyle=\{\{\s*padding:\s*16,\s*paddingBottom:\s*120,\s*gap:\s*12\s*\}\}/g,
    'contentContainerStyle={mergeScrollContentRtl(rtl, { padding: 16, paddingBottom: 120, gap: 12 })}',
  ],
  [
    /contentContainerStyle=\{\{\s*paddingBottom:\s*100\s*\}\}/g,
    'contentContainerStyle={mergeScrollContentRtl(rtl, { paddingBottom: 100 })}',
  ],
  [
    /contentContainerStyle=\{\{\s*padding:\s*16,\s*gap:\s*12\s*\}\}/g,
    'contentContainerStyle={mergeScrollContentRtl(rtl, { padding: 16, gap: 12 })}',
  ],
  [
    /contentContainerStyle=\{\{\s*paddingBottom:\s*24\s*\}\}/g,
    'contentContainerStyle={mergeScrollContentRtl(rtl, { paddingBottom: 24 })}',
  ],
  [
    /contentContainerStyle=\{\{\s*flexGrow:\s*1,\s*padding:\s*24\s*\}\}/g,
    'contentContainerStyle={mergeScrollContentRtl(rtl, { flexGrow: 1, padding: 24 })}',
  ],
  [
    /contentContainerStyle=\{\{\s*paddingBottom:\s*16,\s*gap:\s*10\s*\}\}/g,
    'contentContainerStyle={mergeScrollContentRtl(rtl, { paddingBottom: 16, gap: 10 })}',
  ],
];

function ensureImport(src) {
  if (src.includes('mergeScrollContentRtl')) return src;
  if (!src.includes('rtl') && !src.includes('useT')) return src;
  // add to existing rtlStyle import line
  const m = src.match(/from ['"]@\/lib\/rtlStyle['"];/);
  if (!m) return src;
  const line = src.match(/import\s*\{[^}]+\}\s*from\s*['"]@\/lib\/rtlStyle['"];/);
  if (!line) return src;
  if (line[0].includes('mergeScrollContentRtl')) return src;
  const newLine = line[0].replace(/\}\s*from/, ', mergeScrollContentRtl } from');
  return src.replace(line[0], newLine);
}

let total = 0;
for (const file of files) {
  let src = fs.readFileSync(file, 'utf8');
  if (!src.includes('<ScrollView')) continue;
  if (!/\brtl\b/.test(src)) continue;
  const before = src;
  for (const [re, rep] of REPLACEMENTS) {
    src = src.replace(re, rep);
  }
  if (src === before) continue;
  src = ensureImport(src);
  fs.writeFileSync(file, src, 'utf8');
  total++;
  console.log('updated', path.relative(process.cwd(), file));
}
console.log('files touched:', total);
