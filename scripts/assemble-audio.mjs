import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';

// Keep connector uploads bounded. Visitors receive one continuous media file,
// not a playlist of chunks; decoding and HTTP range requests remain native.
const root = new URL('../', import.meta.url);
const source = new URL('media/dark-doom-jazz/', root);
const manifest = JSON.parse(await readFile(new URL('manifest.json', source), 'utf8'));
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
const output = new URL('public/audio/dark-doom-jazz.mp3', root);
try {
  const existing = await readFile(output);
  if (existing.length === manifest.bytes && hash(existing) === manifest.sha256) process.exit(0);
} catch { /* Assemble a clean checkout. */ }
const parts = [];
for (const part of manifest.parts) {
  if (!/^part-\d{2}\.bin$/.test(part.file)) throw new Error('Unexpected audio part name');
  const bytes = await readFile(new URL(part.file, source));
  if (bytes.length !== part.bytes || hash(bytes) !== part.sha256) throw new Error(`Audio integrity mismatch: ${part.file}`);
  parts.push(bytes);
}
const combined = Buffer.concat(parts);
if (combined.length !== manifest.bytes || hash(combined) !== manifest.sha256) throw new Error('Complete soundtrack integrity mismatch');
await mkdir(new URL('public/audio/', root), {recursive:true});
await writeFile(output, combined);
console.log(`Prepared ${manifest.title}: ${combined.length} bytes, full recording verified.`);
