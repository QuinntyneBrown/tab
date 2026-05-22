// L2-041 / L2-040 guardrail.
// projects/tab is the application shell. It must contain only:
//   - root config:   app.config.ts, app.routes.ts, app.ts, app.html, main.ts, index.html, styles.scss
//   - guards/        functional CanActivateFn files (*.guard.ts)
//   - pages/<r>/     *.page.ts/.html/.scss only
// No reusable UI components, directives, pipes outside pages/.
//
// Run: `npx tsx projects/tab/scripts/check-app-structure.ts` from frontend root.

import { readdirSync, statSync } from 'node:fs';
import { join, relative, resolve, sep } from 'node:path';

const tabRoot = resolve(__dirname, '..');
const srcRoot = join(tabRoot, 'src');

const allowedRootFiles = new Set([
  'index.html',
  'main.ts',
  'styles.scss',
]);

const allowedAppFiles = new Set([
  'app.config.ts',
  'app.routes.ts',
  'app.ts',
  'app.html',
  'app.scss',
]);

const violations: string[] = [];

function walk(dir: string): string[] {
  const out: string[] = [];
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    const stat = statSync(full);
    if (stat.isDirectory()) {
      out.push(...walk(full));
    } else {
      out.push(full);
    }
  }
  return out;
}

for (const file of walk(srcRoot)) {
  const rel = relative(srcRoot, file).split(sep);
  if (rel.length === 1) {
    if (!allowedRootFiles.has(rel[0])) {
      violations.push(`unexpected file in src/: ${rel.join('/')}`);
    }
    continue;
  }
  if (rel[0] !== 'app') {
    violations.push(`unexpected top-level src/${rel[0]} (only app/ allowed)`);
    continue;
  }

  if (rel.length === 2) {
    if (!allowedAppFiles.has(rel[1])) {
      violations.push(`unexpected file in src/app/: ${rel.join('/')}`);
    }
    continue;
  }

  const area = rel[1];
  if (area === 'guards') {
    if (!/\.guard\.ts$/.test(rel[rel.length - 1])) {
      violations.push(`src/app/guards may only contain *.guard.ts files: ${rel.join('/')}`);
    }
    continue;
  }

  if (area === 'layout') {
    if (!/^shell-layout\.component\.(ts|html|scss)$/.test(rel[rel.length - 1])) {
      violations.push(`src/app/layout may only hold shell-layout.component.*: ${rel.join('/')}`);
    }
    continue;
  }

  if (area === 'pages') {
    if (rel.length < 4) {
      violations.push(`pages/ files must live under pages/<route>/: ${rel.join('/')}`);
      continue;
    }
    const leaf = rel[rel.length - 1];
    if (!/\.page\.(ts|html|scss)$/.test(leaf)) {
      violations.push(`pages/<route> may only contain *.page.{ts,html,scss}: ${rel.join('/')}`);
    }
    continue;
  }

  violations.push(`unexpected directory src/app/${area}/`);
}

if (violations.length > 0) {
  console.error('projects/tab structure violations:');
  for (const v of violations) console.error(`  ${v}`);
  process.exit(1);
}

console.log('projects/tab structure ok.');
