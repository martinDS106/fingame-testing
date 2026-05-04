import fs from 'node:fs/promises';
import path from 'node:path';

const DIST_DIR = path.join(process.cwd(), 'dist');

async function* walk(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      yield* walk(full);
    } else {
      yield full;
    }
  }
}

function patchHtml(html) {
  // Expo web export currently emits the entry bundle as a classic script with `defer`,
  // but the bundle uses ESM features (e.g. import.meta). Serve it as a module.
  // Example:
  // <script src="/_expo/static/js/web/entry-....js" defer></script>
  const re = /<script\s+src="(\/_expo\/static\/js\/web\/entry-[^"]+\.js)"\s+defer><\/script>/g;
  return html.replaceAll(re, '<script type="module" src="$1"></script>');
}

async function main() {
  let changed = 0;
  for await (const file of walk(DIST_DIR)) {
    if (!file.endsWith('.html')) continue;
    const raw = await fs.readFile(file, 'utf8');
    const next = patchHtml(raw);
    if (next !== raw) {
      await fs.writeFile(file, next, 'utf8');
      changed += 1;
    }
  }
  // eslint-disable-next-line no-console
  console.log(`[patch-expo-web-modules] patched ${changed} html file(s)`);
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error('[patch-expo-web-modules] failed', err);
  process.exit(1);
});

