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
walk(ROOT, files);

for (const file of files) {
  let s = fs.readFileSync(file, 'utf8');
  if (!s.includes('mergeScrollContentRtl(')) continue;
  if (/import\s*\{[^}]*mergeScrollContentRtl[^}]*\}\s*from\s*['"]@\/lib\/rtlStyle['"]/.test(s))
    continue;
  const next = s.replace(
    /import\s*\{([^}]+)\}\s*from\s*['"]@\/lib\/rtlStyle['"];/,
    (m, inner) => {
      const trimmed = inner.trim().replace(/,\s*$/, '');
      return `import { ${trimmed}, mergeScrollContentRtl } from '@/lib/rtlStyle';`;
    }
  );
  if (next === s) {
    console.error('no rtlStyle import in', file);
    continue;
  }
  fs.writeFileSync(file, next, 'utf8');
  console.log('fixed import', path.relative(process.cwd(), file));
}
