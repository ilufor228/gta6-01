import { buildDossier } from './vendor/makefun-game.ts';
import { cpSync, mkdirSync, writeFileSync, existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const outDir = process.env.MAKEFUN_OUTPUT_DIR || '/output';
mkdirSync(outDir, { recursive: true });

cpSync('game', join(outDir, 'game'), { recursive: true });
if (existsSync('screenshots')) {
  cpSync('screenshots', join(outDir, 'screenshots'), { recursive: true });
}

const dossier = buildDossier(outDir, {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  game_max_files: 993,
  game_max_bytes: 50331648,
});

writeFileSync(join(outDir, 'dossier.json'), dossier);

function countFiles(dir: string): number {
  let count = 0;
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      count += countFiles(join(dir, entry.name));
    } else {
      count++;
    }
  }
  return count;
}

const filesCopied = countFiles(outDir);
const dossierBytes = Buffer.byteLength(dossier, 'utf8');

const expectedScreenshots = ['1-chase.jpg', '2-city.jpg', '3-mission.jpg', '4-start.jpg'];
const missingScreenshots = expectedScreenshots.filter(f => !existsSync(join(outDir, 'screenshots', f)));
if (missingScreenshots.length > 0) {
  throw new Error(`Missing required screenshot(s): ${missingScreenshots.join(', ')}`);
}

console.log(`Summary: files copied = ${filesCopied}, dossier bytes = ${dossierBytes}`);
