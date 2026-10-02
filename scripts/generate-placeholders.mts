/**
 * Generates neutral placeholder images referenced by sample content: `pnpm assets:placeholders`.
 * Replace the files in public/ with real photography before launch (keep the same paths or update content).
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const files: Array<[string, number, number]> = [
  ['images/hero.jpg', 1920, 1080],
  ['og/default.jpg', 1200, 630],
  ...['paint-protection-film', 'ceramic-coating', 'window-tinting', 'car-wrapping', 'detailing'].map(
    (slug) => [`images/services/${slug}.jpg`, 1200, 800] as [string, number, number],
  ),
  ...[1, 2, 3, 4, 5, 6].map((n) => [`images/portfolio/${n}.jpg`, 1200, 800] as [string, number, number]),
  ...[1, 2, 3].map((n) => [`images/facility/${n}.jpg`, 1200, 800] as [string, number, number]),
];

const label = (text: string, w: number, h: number) =>
  Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">
      <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#1b1d22"/><stop offset="1" stop-color="#0b2a5b"/></linearGradient></defs>
      <rect width="100%" height="100%" fill="url(#g)"/>
      <text x="50%" y="50%" fill="#8fa3c7" font-family="sans-serif" font-size="${Math.round(h / 14)}" text-anchor="middle" dominant-baseline="middle">PLACEHOLDER ${text}</text>
    </svg>`,
  );

for (const [file, w, h] of files) {
  const out = path.join('public', file);
  mkdirSync(path.dirname(out), { recursive: true });
  await sharp(label(path.basename(file, '.jpg'), w, h))
    .jpeg({ quality: 70, mozjpeg: true })
    .toFile(out);
  console.log(`wrote ${out}`);
}

const icon = (size: number) =>
  Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}"><rect width="100%" height="100%" rx="${size / 6}" fill="#0b2a5b"/><text x="50%" y="54%" fill="#ffffff" font-family="sans-serif" font-weight="700" font-size="${size / 2.4}" text-anchor="middle" dominant-baseline="middle">PP</text></svg>`,
  );
mkdirSync('public/brand', { recursive: true });
for (const size of [192, 512]) await sharp(icon(size)).png().toFile(`public/brand/icon-${size}.png`);
await sharp(icon(64)).png().toFile('src/app/icon.png');

writeFileSync(
  'public/brand/logo.svg',
  `<svg xmlns="http://www.w3.org/2000/svg" width="160" height="40" viewBox="0 0 160 40"><text x="0" y="28" fill="#e8ecf4" font-family="sans-serif" font-weight="700" font-size="22">PPF PHANTOM</text></svg>\n`,
);
console.log('wrote brand icons and logo');
