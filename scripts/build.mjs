// Assemble dist/worker.js: inlines public/index.html into src/worker.js
import fs from 'fs';
const src = fs.readFileSync(new URL('../src/worker.js', import.meta.url), 'utf8');
const html = fs.readFileSync(new URL('../public/index.html', import.meta.url), 'utf8');
if (!src.includes('__HTML__')) throw new Error('placeholder __HTML__ missing in src/worker.js');
fs.mkdirSync(new URL('../dist/', import.meta.url), { recursive: true });
const rd = f => { try { return fs.readFileSync(new URL('../public/' + f, import.meta.url), 'utf8'); } catch (e) { return ''; } };
fs.writeFileSync(new URL('../dist/worker.js', import.meta.url), src.replace('__HTML__', () => JSON.stringify(html)).replace('__X2CSS__', () => JSON.stringify(rd('x2.css'))).replace('__X2JS__', () => JSON.stringify(rd('x2.js'))).replace('__STATSJS__', () => JSON.stringify(rd('stats.js'))).replace('__ADSJS__', () => JSON.stringify(rd('ads.js'))).replace('__SQJS__', () => JSON.stringify(rd('squares.js'))).replace('__TKJS__', () => JSON.stringify(rd('token.js'))).replace('__TNJS__', () => JSON.stringify(rd('tn.js'))).replace('__MKJS__', () => JSON.stringify(rd('mk.js'))).replace('__ADMHTML__', () => JSON.stringify(rd('admin.html'))));
console.log('built dist/worker.js', (src.length + html.length), 'chars');
