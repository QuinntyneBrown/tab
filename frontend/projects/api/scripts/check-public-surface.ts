// L2-036 / L2-040 guardrail.
// Ensures projects/api/src/public-api.ts exports only:
//   - InjectionTokens (constants imported from *.token.ts)
//   - DTO/model types (`export type`)
//   - `provide…` factory functions
// and never exports concrete `Http*Service` implementations.
//
// Run: `npx tsx projects/api/scripts/check-public-surface.ts` from the frontend root.

import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const surfacePath = resolve(__dirname, '..', 'src', 'public-api.ts');
const surface = readFileSync(surfacePath, 'utf8');
const lines = surface.split(/\r?\n/);

const violations: string[] = [];

for (let i = 0; i < lines.length; i++) {
  const line = lines[i].trim();
  if (line.length === 0 || line.startsWith('//') || line.startsWith('/*') || line.startsWith('*')) continue;
  if (!line.startsWith('export')) continue;

  // Forbidden: any concrete Http*Service class name appearing in the export list.
  if (/\bHttp\w+Service\b/.test(line)) {
    violations.push(`line ${i + 1}: concrete HTTP class exported -> ${line}`);
    continue;
  }

  const isTypeOnly = /^export\s+type\b/.test(line);
  const valueExport = /^export\s+\{([^}]+)\}/.exec(line);
  if (!isTypeOnly && valueExport) {
    const symbols = valueExport[1].split(',').map((s) => s.trim()).filter(Boolean);
    for (const sym of symbols) {
      const name = sym.split(/\s+as\s+/i)[0].trim();
      // Allowed value exports: provide… factories, *_SERVICE tokens, API_BASE_URL, CORRELATION_ID_HEADER, ApiError.
      const allowed =
        name.startsWith('provide') ||
        /_SERVICE$/.test(name) ||
        name === 'API_BASE_URL' ||
        name === 'CORRELATION_ID_HEADER' ||
        name === 'ApiError';
      if (!allowed) {
        violations.push(`line ${i + 1}: disallowed value export "${name}"`);
      }
    }
  }
}

if (violations.length > 0) {
  console.error('public-api.ts violations:');
  for (const v of violations) console.error(`  ${v}`);
  process.exit(1);
}

console.log(`public-api.ts ok: ${lines.length} lines scanned, no violations.`);
