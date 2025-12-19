import fs from 'fs';
import path from 'path';

const SRC = path.resolve('src/data/theaters.ts');
const OUT = path.resolve('public/theaters.json');

function readRawTheaters() {
  const src = fs.readFileSync(SRC, 'utf8');
  const marker = 'export const rawTheaters';
  const markerIndex = src.indexOf(marker);
  if (markerIndex === -1) {
    throw new Error('Could not find rawTheaters declaration');
  }

  const arrayStart = src.indexOf('[', markerIndex);
  const arrayEnd = src.indexOf('];', arrayStart);
  if (arrayStart === -1 || arrayEnd === -1) {
    throw new Error('Could not find rawTheaters array bounds');
  }

  const arrayLiteral = src.slice(arrayStart, arrayEnd + 2);
  // Unsafe in general, but safe here because the file is trusted and checked into the repo.
  // eslint-disable-next-line no-new-func
  const fn = new Function(`return ${arrayLiteral}`);
  return fn();
}

function main() {
  const theaters = readRawTheaters();
  fs.writeFileSync(OUT, JSON.stringify(theaters, null, 2));
  console.log(`✅ Exported ${theaters.length} theaters to ${OUT}`);
}

main();

