// Pull every post + the facts bank from the live site into data/ so GitHub holds a full copy.
// Usage: SITE=https://xrpldaily.aixalpha.workers.dev node scripts/archive.mjs
import fs from 'fs';
const SITE = (process.env.SITE || 'https://xrpldaily.aixalpha.workers.dev').replace(/\/$/, '');
fs.mkdirSync('data/posts', { recursive: true });
let off = 0, total = 1, saved = 0;
while (off < total) {
  const r = await fetch(SITE + '/api/export?offset=' + off + '&limit=40');
  if (!r.ok) throw new Error('export failed ' + r.status);
  const j = await r.json(); total = j.total;
  if (j.facts) fs.writeFileSync('data/facts.json', JSON.stringify(j.facts, null, 2) + '\n');
  for (const p of j.posts) { fs.writeFileSync('data/posts/' + p.slug + '.json', JSON.stringify(p, null, 2) + '\n'); saved++; }
  off += 40; if (!j.posts.length && off >= total) break;
}
const idx = await (await fetch(SITE + '/api/blogs')).json();
fs.writeFileSync('data/index.json', JSON.stringify(idx, null, 2) + '\n');
console.log('archived', saved, 'posts of', total);
