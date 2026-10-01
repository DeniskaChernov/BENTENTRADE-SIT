import { readFileSync, writeFileSync } from 'fs';
const file = 'assets/hero.js';
let c = readFileSync(file, 'utf8');

// The UZ string uses U+2018 (left single quote) in ko'taradi
// Replace the entire UZ sub line
const oldUZ = "120 dan 180 kg gacha yuk ko\u2018taradi.\"";
const newUZ = "ko\u2018cha va ichki xonalarga mos.\"";
if (c.includes(oldUZ)) {
  c = c.replace(oldUZ, newUZ);
  console.log('UZ replacement done');
} else {
  console.log('UZ string not found - checking variants...');
  // Also try plain apostrophe variant
  const oldUZ2 = "120 dan 180 kg gacha yuk ko'taradi.\"";
  if (c.includes(oldUZ2)) {
    c = c.replace(oldUZ2, "ko'cha va ichki xonalarga mos.\"");
    console.log('UZ plain apostrophe replacement done');
  } else {
    console.log('Not found at all!');
  }
}

writeFileSync(file, c, 'utf8');
const result = readFileSync(file, 'utf8');
const lines = result.split('\n');
lines.forEach((l, i) => { if (l.includes('120')) console.log(`Line ${i+1}: ${l}`); });
console.log('Done');
