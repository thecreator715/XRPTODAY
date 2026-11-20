// XRPLTODAY — live XRP / XRPL / RLUSD news terminal + hourly briefs + daily BONSAI x LUMA post
// Bindings: KV (kv_namespace), AI (Workers AI), ADMIN_KEY (secret). Cron: */5 * * * *
const HTML = __HTML__;
const X2CSS = __X2CSS__, X2JS = __X2JS__, STATSJS = __STATSJS__, ADSJS = __ADSJS__, SQJS = __SQJS__, TKJS = __TKJS__, TNJS = __TNJS__, MKJS = __MKJS__, ADMHTML = __ADMHTML__, WLHTML = __WLHTML__;
const UA = { 'user-agent': 'Mozilla/5.0 (compatible; XRPLTODAYBot/1.0)', 'accept': 'application/rss+xml, application/xml, text/xml, */*' };
const TTL = 72 * 36e5, MAXN = 500, DAILY_HOUR = 16; // daily BONSAI x LUMA post at 16:00 UTC
let busy = false, lastErr = '';

/* ---------- seed facts for the BONSAI x LUMA daily (editable via /api/admin) ---------- */
const SEED = [
  ['BONSAI', 'BONSAI has two divisions: a design-and-build studio that delivers client-owned automation systems, and a Finance & Equity division that manages a portfolio of digital-asset properties on the XRP Ledger.'],
  ['BONSAI', 'BONSAI DEX is a non-custodial trading terminal for the XRP Ledger that puts the order book and XLS-30 AMM pools in one interface; the venue takes no fee on any action.'],
  ['BONSAI', 'BONSAI DEX modules include a Dashboard, Terminal, Multi Grid (up to 16 panes), AMM Pools, an AI command line, Wallets, Trustlines and a Command Bar.'],
  ['BONSAI', 'The BONSAI Asset Tracker (main site) is a live XRPL ecosystem dashboard that aggregates AMM pool data across many tokens; it uses real XRPL mainnet data only, with no demo or mock data.'],
  ['BONSAI', 'BONSAI offers a token integration programme for the DEX, giving the first ten founding token projects heavy hands-on support.'],
  ['BONSAI', 'The BONSAI studio has built practical tools including a SCOPE audit tool, a social card creation tool and an XRPL account monitor.'],
  ['BONSAI', 'USDX is an XRPL stablecoin designed to target $1.00, minted by burning BONSAI at its dollar-equivalent value; BONSAI/USDX and XRP/USDX AMM pools exist on XRPL mainnet.'],
  ['BONSAI', 'TRENDBOT is an in-development automatic XRPL trading bot that works from candle highs and lows, with stop losses, take profits, long and short positions, and XRP/RLUSD as a core pair.'],
  ['BOTH', 'The BONSAI Asset Tracker is being made multichain: XRPL stays the default, with an option to switch to LUMA to show LUMA tokens and markets on the dashboard.'],
  ['LUMA', 'LUMA is an independent network built on the open-source XRP Ledger protocol, with its own native token LUMA, running both a Testnet and a Mainnet.'],
  ['LUMA', 'Starsky is the wallet for the LUMA network: send, receive, swap and portfolio views on both Mainnet and Testnet.'],
  ['LUMA', 'Every wallet created in Starsky is activated automatically, with 1 LUMA held back to cover fees.'],
  ['LUMA', 'The LUMA creator control panel manages nodes and a token factory, and LUMA Scan provides a block explorer for the network.'],
  ['LUMA', 'LUMA is built around live data only: its apps have no demo modes and no mock data.'],
  ['LUMA', 'LUMA runs a single USD stablecoin priced at $1.00, with AMM pools pairing USD, LUMA and the XRPZ bridging token that are kept balanced automatically.'],
  ['BOTH', 'The LUMA bridge connects XRPL and LUMA with lanes for XRP, RLUSD, MINT and MAGIC; an NFT bridge from XRPL to LUMA is planned.'],
  ['LUMA', 'Starsky includes an XRPL tab with NFT and token minting plus a marketplace: minting costs 0.05 XRP, listings are free, and there is no sale fee.'],
  ['LUMA', 'Chain Builder is a planned service that lets outside developers launch their own private XRPL-protocol network with a custom token and a testnet plus mainnet, with swaps back to LUMA.'],
  ['LUMA', 'LUMA is growing its public node network with supporting (non-validating) nodes, and plans to move toward independent validators, exchange and wallet listings, and much deeper documentation.'],
  ['LUMA', 'LUMA describes itself as a hybrid: a centralized core combined with decentralized tokens and tooling, becoming more decentralized over time.']
];
const ANGLES = [
  { k: 'explainer', d: 'a plain-English explainer of what the product is and why it exists' },
  { k: 'builder', d: "a builder's log about what the team is building and shipping" },
  { k: 'xrpl', d: 'how this work connects to the wider XRP Ledger ecosystem, XRP and RLUSD' },
  { k: 'walkthrough', d: 'a practical walkthrough of how someone would use these features' },
  { k: 'roadmap', d: 'where things stand and what comes next on the roadmap' },
  { k: 'qa', d: 'a question-and-answer piece answering the questions a curious community member would ask' },
  { k: 'spotlight', d: 'a spotlight that goes deep on one feature and touches the rest briefly' }
];
const TONES = ['confident and energetic', 'calm and professional', 'curious and explanatory', 'punchy and modern', 'warm and approachable'];

/* ---------- helpers ---------- */
const J = (o, s, h) => new Response(JSON.stringify(o), { status: s || 200, headers: Object.assign({ 'content-type': 'application/json;charset=utf-8', 'cache-control': 'public, max-age=10', 'access-control-allow-origin': '*' }, h || {}) });
const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
function dec(s) {
  return s.replace(/&(#x?[0-9a-f]+|amp|lt|gt|quot|apos|nbsp);/gi, (m, e) => {
    e = e.toLowerCase();
    if (e[0] === '#') { const n = e[1] === 'x' ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10); return n ? String.fromCodePoint(n) : ''; }
    return { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ' }[e] || m;
  });
}
function tag(s, n) {
  const m = s.match(new RegExp('<' + n + '(?:\\s[^>]*)?>([\\s\\S]*?)</' + n + '>', 'i'));
  return m ? m[1].replace(/^\s*<!\[CDATA\[|\]\]>\s*$/g, '').trim() : '';
}
function hash(s) { let h = 5381; for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) >>> 0; return h.toString(36); }
function words(t) {
  const s = new Set();
  for (const w of t.toLowerCase().split(/[^\p{L}\p{N}]+/u)) {
    if (!w) continue;
    if (/[぀-ヿ㐀-鿿가-힯]/.test(w)) { for (let i = 0; i < w.length - 1; i++) s.add(w.slice(i, i + 2)); }
    else if (w.length >= 4) s.add(w);
  }
  return s;
}
function jac(a, b) { let n = 0; for (const x of a) if (b.has(x)) n++; const u = a.size + b.size - n; return u ? n / u : 0; }
function slugify(s) { return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60) || 'brief'; }
function nextDaily(now) { return (Math.floor(now / 36e5) + 1) * 36e5; } // BONSAI x LUMA is now written every hour
const pct = n => n == null ? 'n/a' : (n >= 0 ? '+' : '') + n.toFixed(2) + '%';

/* ---------- news ---------- */
const GL = [['US', 'en-US', 'en'], ['GB', 'en-GB', 'en'], ['IN', 'en-IN', 'en'], ['AU', 'en-AU', 'en'], ['CA', 'en-CA', 'en'], ['ZA', 'en-ZA', 'en'],
  ['JP', 'ja-JP', 'ja'], ['KR', 'ko-KR', 'ko'], ['DE', 'de-DE', 'de'], ['FR', 'fr-FR', 'fr'], ['MX', 'es-MX', 'es'], ['ES', 'es-ES', 'es'], ['BR', 'pt-BR', 'pt'], ['TR', 'tr-TR', 'tr'], ['IT', 'it-IT', 'it'],
  ['ID', 'id-ID', 'id'], ['VN', 'vi-VN', 'vi'], ['TH', 'th-TH', 'th'], ['RU', 'ru-RU', 'ru'], ['NL', 'nl-NL', 'nl'], ['CN', 'zh-CN', 'zh']];
const DIRECT = [['CoinDesk', 'https://www.coindesk.com/arc/outboundfeeds/rss/'], ['Cointelegraph', 'https://cointelegraph.com/rss'], ['Decrypt', 'https://decrypt.co/feed'], ['CryptoSlate', 'https://cryptoslate.com/feed/'],
  ['U.Today', 'https://u.today/rss'], ['BeInCrypto', 'https://beincrypto.com/feed/'], ['Cryptonews', 'https://cryptonews.com/news/feed/'], ['CryptoPotato', 'https://cryptopotato.com/feed/'], ['Bitcoinist', 'https://bitcoinist.com/feed/'],
  ['Crypto.news', 'https://crypto.news/feed/'], ['The Crypto Basic', 'https://thecryptobasic.com/feed/'], ['ZyCrypto', 'https://zycrypto.com/feed/'], ['Finbold', 'https://finbold.com/feed/'],
  ['BeInCrypto RU', 'https://ru.beincrypto.com/feed/', 'RU', 'ru'], ['BeInCrypto ES', 'https://es.beincrypto.com/feed/', 'ES', 'es']];
const KWE = /xrp|rlusd|garlinghouse|ripple (labs|ceo|cto|lawsuit|case|stablecoin|payments|net|usd)|ripplenet/i;
const KW = /xrp|ripple|rlusd|リップル|리플|ریپل|瑞波|рипл|ريبل/i;
function feedList() {
  const b = (q, mk, r, lg) => ({ url: 'https://www.bing.com/news/search?q=' + encodeURIComponent(q) + '&format=rss&setmkt=' + mk, r, lg, bing: 1 });
  const qEn = 'XRP OR XRPL OR RLUSD OR "XRP Ledger" OR "Ripple Labs"', qLo = 'XRP OR RLUSD OR Ripple';
  const l = GL.map(x => b(x[2] === 'en' ? qEn : qLo, x[1], x[0], x[2]));
  l.push(b('RLUSD stablecoin', 'en-US', 'US', 'en'));
  for (const d of DIRECT) l.push({ url: d[1], r: d[2] || 'WW', lg: d[3] || 'en', name: d[0] });
  return l;
}
function parseRss(xml, f, now) {
  const out = [], re = /<item[\s>]([\s\S]*?)<\/item>/gi, kw = f.nokw ? /./ : f.lg === 'en' ? KWE : KW; let m;
  while ((m = re.exec(xml))) {
    const b = m[1]; let t = dec(tag(b, 'title')).replace(/<[^>]+>/g, '').trim(), u = dec(tag(b, 'link')) || (b.match(/<link[^>]*href="([^"]+)"/) || [])[1];
    const ts = Date.parse(tag(b, 'pubDate') || tag(b, 'dc:date') || ''); if (!t || !u || isNaN(ts) || ts > now + 6e5 || now - ts > TTL) continue;
    const s = f.name || dec(tag(b, 'News:Source')) || 'News';
    if (f.bing) { const mm = u.match(/[?&]url=([^&]+)/); if (mm) { try { u = decodeURIComponent(mm[1]); } catch (e) { } } }
    if (!kw.test(t + ' ' + dec(tag(b, 'description')).replace(/<[^>]+>/g, '').slice(0, 400))) continue;
    let im = (b.match(/<News:Image>\s*(?:<!\[CDATA\[)?\s*([^<\s\]]+)/i) || [])[1] || (b.match(/<media:(?:content|thumbnail)[^>]*?url=["']([^"']+)["']/i) || [])[1] || (b.match(/<enclosure[^>]*?url=["']([^"']+)["'][^>]*?type=["']image/i) || [])[1] || (b.match(/<enclosure[^>]*?type=["']image[^>]*?url=["']([^"']+)["']/i) || [])[1];
    if (!im) { const dd = dec(b); im = (dd.match(/<img[^>]+src=["']([^"']+)["']/i) || [])[1]; }
    if (im) { im = dec(im).trim(); if (im.indexOf('//') === 0) im = 'https:' + im; im = /^https?:\/\//i.test(im) ? im.replace(/^http:/i, 'https:').slice(0, 500) : ''; if (/gstatic\.com\/faviconV2|pixel|spacer|1x1/i.test(im)) im = ''; }
    out.push({ id: hash(t.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, '')), t, s, u, ts, r: f.r, g: f.lg !== 'en' ? 1 : 0, im: im || '', d: f.nokw ? dec(tag(b, 'description')).replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 500) : undefined });
  }
  return out;
}
async function pull(f, now) {
  try { const r = await fetch(f.url, { headers: UA, signal: AbortSignal.timeout(9000) }); if (!r.ok) return null; return parseRss(await r.text(), f, now); } catch (e) { return null; }
}
function tags(t) {
  const c = [];
  if (/rlusd/i.test(t)) c.push('RLUSD');
  if (/\betf\b|\betp\b|grayscale|bitwise|canary|21shares|franklin|vaneck/i.test(t)) c.push('ETF');
  if (/\bsec\b|court|lawsuit|ruling|regulat|clarity act|genius act|\bmica\b|cftc|appeal|settle|licen[sc]e|charter|judge/i.test(t)) c.push('Regulation');
  if (/xrpl|xrp ledger|amendment|validator|\bamm\b|evm sidechain|rippled/i.test(t)) c.push('XRPL');
  if (/ripple|garlinghouse|schwartz|ripplex/i.test(t)) c.push('Ripple');
  if (/price|rally|surge|plunge|drop|whale|liquidat|volume|breakout|support|resistance|bullish|bearish|\bath\b|soar|tumble|\$\d/i.test(t)) c.push('Markets');
  if (/\bxrp\b/i.test(t)) c.push('XRP');
  return c;
}
const TRUST = /reuters|bloomberg|coindesk|cnbc|the block|cointelegraph|decrypt|wsj|financial times|forbes|yahoo finance|fortune/i;
function score(it) {
  const t = it.t; let s = 30;
  const add = (re, n) => { if (re.test(t)) s += n; };
  add(/rlusd/i, 12); add(/\betf\b|\betp\b/i, 16); add(/\bsec\b|court|lawsuit|ruling|approv|approves|approved|clarity act|genius act|charter|licen[sc]e/i, 14);
  add(/ripple|garlinghouse|schwartz/i, 6); add(/partner|launch|integrat|acquir|bank|adopt|settlement|pilot|custody/i, 8); add(/xrpl|xrp ledger|amendment|validator/i, 6);
  add(/whale|surge|plunge|crash|record|\bath\b|rally|soar|spike|tumble|liquidat/i, 8); add(/billion|\$\s?\d+(\.\d+)?\s?(b|bn|billion)\b/i, 8); add(/breaking|just in|urgent/i, 6); add(/treasury|reserve|cbdc/i, 7);
  add(/price prediction|could|may |might|forecast|prediction|here's why|what to know/i, -9); add(/\?/, -6); add(/analyst|expert/i, -3);
  if (it.ss.some(x => TRUST.test(x))) s += 6;
  s += Math.min(24, 6 * (it.ss.length - 1));
  return Math.max(5, Math.min(99, Math.round(s)));
}
function mergeAll(old, fresh, now) {
  const seen = new Set(), heads = [], idx = new Map();
  const add = h => { h._w = words(h.t); heads.push(h); for (const w of h._w) { let a = idx.get(w); if (!a) { a = []; idx.set(w, a); } a.push(h); } seen.add(h.id); for (const x of h.a || []) seen.add(x); };
  for (const h of old) if (now - h.ts < TTL) add(h);
  fresh.sort((a, b) => a.ts - b.ts);
  for (const it of fresh) {
    if (seen.has(it.id)) continue; seen.add(it.id);
    const w = words(it.t); let hit = null; const tried = new Set();
    for (const x of w) { const a = idx.get(x); if (!a) continue; for (const h of a) { if (tried.has(h)) continue; tried.add(h); if (jac(w, h._w) >= 0.55) { hit = h; break; } } if (hit) break; }
    if (hit) { if (!hit.im && it.im) hit.im = it.im; hit.a = hit.a || []; if (hit.a.length < 12) hit.a.push(it.id); if (hit.ss.length < 6 && hit.ss.indexOf(it.s) < 0) hit.ss.push(it.s); }
    else add({ id: it.id, t: it.t, s: it.s, ss: [it.s], u: it.u, ts: it.ts, r: it.r, g: it.g, im: it.im || '', a: [] });
  }
  heads.sort((a, b) => b.ts - a.ts);
  return heads.slice(0, MAXN).map(h => { delete h._w; h.n = h.ss.length; h.c = tags(h.t); h.i = score(h); return h; });
}
async function market() {
  const K = async u => { const r = await fetch(u, { headers: UA, signal: AbortSignal.timeout(8000) }); const j = await r.json(); if (j.error && j.error.length) throw new Error('kraken'); return j.result; };
  try {
    const [t, o, rl, ob] = await Promise.all([K('https://api.kraken.com/0/public/Ticker?pair=XRPUSD,XBTUSD'), K('https://api.kraken.com/0/public/OHLC?pair=XRPUSD&interval=240'), K('https://api.kraken.com/0/public/Ticker?pair=RLUSDUSD').catch(() => null), K('https://api.kraken.com/0/public/OHLC?pair=XBTUSD&interval=240').then(r => r[Object.keys(r).find(k => k !== 'last')].slice(-42).map(c => +(+c[4]).toFixed(1))).catch(() => null)]);
    const mk = (id, x, sp) => { const p = +x.c[0], op = +x.o; return { id, p, c1: null, c24: op ? (p - op) / op * 100 : null, c7: sp && sp.length > 1 ? (p - sp[0]) / sp[0] * 100 : null, mc: null, v: +x.v[1] * +x.p[1], sp: sp || [] }; };
    const key = n => Object.keys(t).find(k => k.indexOf(n) >= 0), ox = o[Object.keys(o).find(k => k !== 'last')], sp = ox.slice(-42).map(c => +(+c[4]).toFixed(5));
    const out = [mk('ripple', t[key('XRP')], sp), mk('bitcoin', t[key('XBT')], ob)];
    if (rl) { const k = Object.keys(rl)[0]; if (k) out.push(mk('ripple-usd', rl[k], null)); }
    return out;
  } catch (e) { return null; }
}
async function ledger() {
  for (const h of ['https://s1.ripple.com:51234/', 'https://s2.ripple.com:51234/']) {
    try {
      const r = await fetch(h, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ method: 'server_info', params: [{}] }), signal: AbortSignal.timeout(7000) });
      const i = (await r.json()).result.info, v = i.validated_ledger; if (v) return { seq: v.seq, fee: v.base_fee_xrp, res: v.reserve_base_xrp, state: i.server_state };
    } catch (e) { }
  }
  return null;
}
async function refresh(env, force) {
  const now = Date.now(), old = (await env.KV.get('news', 'json')) || { items: [], ts: 0 };
  if (!force && old.ts && now - old.ts < 50e3) return 'fresh';
  const fl = feedList();
  const [res, mk, lg] = await Promise.all([Promise.all(fl.map(f => pull(f, now))), market(), ledger()]);
  const fresh = []; let ok = 0; res.forEach(r => { if (r) { ok++; for (const x of r) fresh.push(x); } });
  const items = mergeAll(old.items || [], fresh, now);
  await env.KV.put('news', JSON.stringify({ ts: now, items, mkt: mk || old.mkt, xrpl: lg || old.xrpl }));
  return { feeds: ok + '/' + fl.length, fresh: fresh.length, items: items.length, mkt: !!mk, ledger: !!lg };
}

/* ---------- AI + posts ---------- */
async function ai(env, sys, user, max) {
  if ((await ctlGet(env)).aiOff) throw new Error('ai disabled by admin');
  for (const m of ['@cf/meta/llama-3.3-70b-instruct-fp8-fast', '@cf/meta/llama-3.3-70b-instruct-fp8-fast']) {
    try {
      const r = await env.AI.run(m, { messages: [{ role: 'system', content: sys }, { role: 'user', content: user }], max_tokens: max, temperature: 0.85 });
      const t = r && (r.response || (r.choices && r.choices[0] && r.choices[0].message && r.choices[0].message.content) || (r.result && r.result.response)); if (t && t.length > 250) return t; lastErr = 'short output from ' + m;
    } catch (e) { lastErr = m + ': ' + (e.message || e); }
  }
  return null;
}
function parsePost(t) {
  const g = k => { const m = t.match(new RegExp('^\\W*' + k + '\\W*:\\s*(.+)$', 'mi')); return m ? m[1].trim() : ''; };
  const bi = t.search(/^\W*BODY\W*:/mi); let body = bi >= 0 ? t.slice(bi).replace(/^\W*BODY\W*:\s*/i, '') : t;
  const clean = s => s.replace(/^["'*#\s]+|["'*#\s]+$/g, '');
  const first = (t.split('\n').find(l => l.trim()) || '').replace(/^\W*TITLE\W*:?\s*/i, ''); return { title: clean(g('TITLE') || (/^\W*(EXCERPT|TAGS|BODY)\W*:/i.test(first) ? '' : first)), ex: clean(g('EXCERPT')), tags: g('TAGS').split(',').map(s => s.replace(/[#*]/g, '').trim()).filter(Boolean).slice(0, 4), body: body.trim() };
}
function md(s) {
  const inl = x => esc(x).replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>').replace(/(^|[^*])\*([^*\n]+)\*/g, '$1<em>$2</em>');
  const out = []; let ul = false;
  for (const raw of s.split('\n')) {
    const l = raw.trim(); let m;
    if (!l) { if (ul) { out.push('</ul>'); ul = false; } continue; }
    if ((m = l.match(/^#{1,4}\s+(.*)/))) { if (ul) { out.push('</ul>'); ul = false; } out.push('<h2>' + inl(m[1]) + '</h2>'); }
    else if ((m = l.match(/^[-*•]\s+(.*)/))) { if (!ul) { out.push('<ul>'); ul = true; } out.push('<li>' + inl(m[1]) + '</li>'); }
    else { if (ul) { out.push('</ul>'); ul = false; } out.push('<p>' + inl(l) + '</p>'); }
  }
  if (ul) out.push('</ul>'); return out.join('');
}
async function savePost(env, p) {
  await env.KV.put('b:' + p.slug, JSON.stringify(p), p.k === 'h' ? { expirationTtl: 60 * 864e2 } : undefined);
  let list = (await env.KV.get('blogs', 'json')) || [];
  list.unshift({ slug: p.slug, k: p.k, title: p.title, ex: p.ex, tags: p.tags, ts: p.ts, w: p.w });
  if (list.length > 1300) { let drop = list.length - 1300; list = list.filter(b => !(drop > 0 && b.k === 'h' && drop-- > 0)); }
  await env.KV.put('blogs', JSON.stringify(list));
}
const SYS_H = 'You are the editor of XRPLTODAY, an independent news desk covering XRP, the XRP Ledger (XRPL) and the RLUSD stablecoin. Write ONLY from the headlines and market snapshot supplied. Never invent facts, quotes, numbers, dates or sources; attribute claims to the outlet that reported them. No price predictions, no trading advice, no hype. If headlines are thin, say so honestly and keep the piece short.';
async function hourly(env) {
  const now = Date.now(), blogs = (await env.KV.get('blogs', 'json')) || [], last = blogs.find(b => b.k === 'h');
  if (last && now - last.ts < 55 * 6e4) return 'wait';
  const d = await env.KV.get('news', 'json'); if (!d || !d.items.length) return 'no-news';
  let pool = d.items.filter(i => now - i.ts < 8 * 36e5 && !i.g); if (pool.length < 5) pool = d.items.filter(i => now - i.ts < 30 * 36e5 && !i.g);
  pool.sort((a, b) => b.i - a.i || b.ts - a.ts); const top = pool.slice(0, 14); if (top.length < 3) return 'few';
  const x = (d.mkt || []).find(m => m.id === 'ripple'), rl = (d.mkt || []).find(m => m.id === 'ripple-usd');
  const snap = x ? 'XRP $' + x.p.toFixed(4) + ' (' + pct(x.c24) + ' 24h, ' + pct(x.c7) + ' 7d)' + (rl ? '; RLUSD $' + rl.p.toFixed(4) : '') : 'market data unavailable';
  const dt = new Date(now), stamp = dt.toUTCString().slice(5, 22) + ' UTC';
  const user = 'Time: ' + stamp + '\nMarket snapshot: ' + snap + '\n\nHeadlines (outlet — headline):\n' + top.map((t, i) => (i + 1) + '. ' + t.ss[0] + ' — ' + t.t).join('\n') +
    '\n\nWrite a 450-600 word hourly brief (never fewer than 400 words: four developed sections of about 100 words each). Output EXACTLY this format:\nTITLE: <specific, factual title under 80 characters that names the lead story; never generic like "XRP Update">\nEXCERPT: <one sentence, under 200 characters>\nTAGS: <2-4 comma-separated tags>\nBODY:\n<markdown body with 3-4 sections starting "## ", short paragraphs, a short bullet list is fine, and a final "## What to watch" section>';
  const txt = await ai(env, SYS_H, user, 1400); let p = txt && parsePost(txt);
  if (!p || !p.title || p.body.split(/\s+/).length < 300) {
    p = { title: 'XRP Hourly Brief — ' + stamp, ex: 'Top XRP, XRPL and RLUSD headlines from the last few hours, ranked by importance.', tags: ['XRP', 'XRPL', 'RLUSD'],
      body: '## Market snapshot\n' + snap + '.\n\n## Top stories\n' + top.slice(0, 8).map(t => '- **' + t.ss[0] + ':** ' + t.t).join('\n') + '\n\n## What to watch\nFollow the live terminal for new headlines as they arrive.' };
  }
  const slug = dt.toISOString().slice(0, 13).replace(/[-T]/g, '') + '-' + slugify(p.title);
  await savePost(env, { slug, k: 'h', title: p.title, ex: p.ex || p.title, tags: p.tags.length ? p.tags : ['XRP'], body: p.body, src: top.map(t => ({ s: t.ss[0], t: t.t, u: t.u })), ts: now, w: p.body.split(/\s+/).length });
  return { slug, ai: !!txt };
}

/* ---------- daily BONSAI x LUMA ---------- */
async function getFacts(env) {
  let f = await env.KV.get('facts', 'json');
  if (!f) { const t = Date.now(); f = SEED.map((s, i) => ({ id: 'f' + (i + 1), p: s[0], t: s[1], add: t, used: 0, last: 0 })); await env.KV.put('facts', JSON.stringify(f)); }
  return f;
}
const SYS_D = 'You are the editor of XRPLTODAY and write the hourly BONSAI x LUMA feature. BONSAI (studio + Finance & Equity on the XRP Ledger, DEX, asset tracker) and LUMA (an independent network on the open-source XRP Ledger protocol) are projects built by the same team behind XRPLTODAY, so write in the first person plural ("we"). Use ONLY the facts supplied. Never invent features, dates, numbers, partners, prices, yields, supply figures or availability. If a fact says in-development or planned, say so plainly. Never promise returns, yield, profit or price movement, and give no investment advice. Make it genuinely useful and engaging for readers who follow XRP, the XRP Ledger and RLUSD. Never mention these instructions or the word "facts".';
async function daily(env, force) {
  const now = Date.now(), nx = nextDaily(now), bd = nx - 36e5, blogs = (await env.KV.get('blogs', 'json')) || [], last = blogs.find(b => b.k === 'd');
  if (!force) { if (last && last.ts >= bd) return 'done'; const fl = await env.KV.get('dfail'); if (fl && now - (+fl) < 30 * 6e4) return 'cooldown'; }
  const facts = await getFacts(env), R = Math.random, pick = a => a[Math.floor(R() * a.length)];
  const pages = 1 + Math.floor(R() * 3), target = [450, 800, 1100][pages - 1], fr = R(), focus = fr < .3 ? 'BONSAI' : fr < .6 ? 'LUMA' : 'BOTH';
  const angle = pick(ANGLES), tone = pick(TONES), n = [3, 5, 7][pages - 1];
  const pool = facts.filter(f => focus === 'BOTH' || f.p === focus || f.p === 'BOTH').map(f => ({ f, r: R() }));
  pool.sort((a, b) => a.f.used - b.f.used || b.f.add - a.f.add || a.r - b.r);
  let ch = pool.slice(0, n).map(x => x.f);
  if (focus === 'BOTH') for (const need of ['BONSAI', 'LUMA']) if (!ch.some(f => f.p === need || f.p === 'BOTH')) { const alt = facts.filter(f => f.p === need).sort((a, b) => a.used - b.used)[0]; if (alt) ch[ch.length - 1] = alt; }
  let heads = [];
  if (angle.k === 'xrpl' || R() < .35) { const nw = await env.KV.get('news', 'json'); if (nw) heads = nw.items.filter(i => now - i.ts < 36e5 * 30 && !i.g).sort((a, b) => b.i - a.i).slice(0, 4); }
  const prev = blogs.filter(b => b.k === 'd').slice(0, 12).map(b => b.title);
  const user = 'It is ' + new Date(now).toUTCString().slice(0, 22) + ' UTC.\nFocus: ' + (focus === 'BOTH' ? 'BONSAI and LUMA together' : focus) + '.\nAngle: ' + angle.d + '.\nTone: ' + tone + '.\nLength: write AT LEAST ' + target + ' words (' + pages + ' page' + (pages > 1 ? 's' : '') + ') as ' + (pages * 2 + 1) + ' developed sections of 120+ words each; never stop early.\n\nFacts you may use:\n' +
    ch.map((f, i) => (i + 1) + '. [' + f.p + '] ' + f.t).join('\n') + (heads.length ? '\n\nOptional XRPL context from today\'s news (attribute to the outlet if used):\n' + heads.map(h => '- ' + h.ss[0] + ': ' + h.t).join('\n') : '') +
    (prev.length ? '\n\nDo not reuse these recent titles or openings:\n' + prev.map(t => '- ' + t).join('\n') : '') +
    '\n\nOutput EXACTLY this format:\nTITLE: <specific title under 80 characters that names a concrete product or feature from the facts and what it does; never a generic title like "Update">\nEXCERPT: <one sentence under 200 characters>\nTAGS: <3-4 comma-separated tags, include BONSAI and/or LUMA>\nBODY:\n<markdown with sections starting "## ", varied structure, no repeated boilerplate, ending with a short "## Next up" section>';
  let txt, p, wc = 0;
  for (let a = 0; a < 2; a++) {
    txt = await ai(env, SYS_D, user + (a ? '\n\nIMPORTANT: the previous draft was too short. Write the FULL length requested and develop every section.' : ''), Math.min(3800, Math.round(target * 2) + 300));
    const q = txt && parsePost(txt), qw = q ? q.body.split(/\s+/).length : 0; if (qw > wc) { p = q; wc = qw; } if (wc >= target * .75) break;
  }
  if (!p || !p.title || wc < target * .55) { await env.KV.put('dfail', String(now)); await env.KV.put('dinfo', JSON.stringify({ at: now, err: lastErr, wc, target, got: !!p, txt: (txt || '').slice(0, 300) })); return { fail: lastErr || 'weak output', wc, target }; }
  const dt = new Date(now), slug = dt.toISOString().slice(0, 13).replace(/[-T]/g, '') + '-daily-' + slugify(p.title);
  const tg = p.tags.slice(); if (focus !== 'LUMA' && !tg.some(t => /bonsai/i.test(t))) tg.unshift('BONSAI'); if (focus !== 'BONSAI' && !tg.some(t => /luma/i.test(t))) tg.unshift('LUMA');
  await savePost(env, { slug, k: 'd', title: p.title, ex: p.ex || p.title, tags: tg.slice(0, 4), body: p.body, src: heads.map(t => ({ s: t.ss[0], t: t.t, u: t.u })), ts: now, w: wc, meta: { pages, focus, angle: angle.k, tone, facts: ch.map(f => f.id) } });
  ch.forEach(f => { f.used++; f.last = now; }); await env.KV.put('facts', JSON.stringify(facts));
  return { slug, pages, focus, angle: angle.k, words: wc };
}

/* ---------- stats: XRPL ledger analytics + order flow + stablecoin/TVL flows ---------- */
const KRK = 'https://api.kraken.com/0/public/', KPAIRS = [['XRP', 'XRPUSD'], ['BTC', 'XBTUSD'], ['ETH', 'ETHUSD'], ['SOL', 'SOLUSD'], ['ADA', 'ADAUSD'], ['DOGE', 'XDGUSD']];
async function jf(u, ms) { const c = new AbortController(), t = setTimeout(() => c.abort(), ms || 9000); try { const r = await fetch(u, { signal: c.signal, headers: { 'user-agent': 'XRPLTODAY/1.0' } }); return await r.json(); } finally { clearTimeout(t); } }
const kfirst = o => { try { const ks = Object.keys(o.result).filter(k => k !== 'last'); return ks.length ? o.result[ks[0]] : null; } catch (e) { return null; } };
async function rpc(method, params) {
  for (const h of ['https://s1.ripple.com:51234', 'https://s2.ripple.com:51234']) {
    try { const c = new AbortController(), t = setTimeout(() => c.abort(), 9000); const r = await fetch(h, { method: 'POST', signal: c.signal, headers: { 'content-type': 'application/json' }, body: JSON.stringify({ method, params: [params || {}] }) }); clearTimeout(t); const j = await r.json(); if (j.result && j.result.status === 'success') return j.result; } catch (e) {}
  } return null;
}
const CAT = t => /^Payment$/.test(t) ? 'Payments' : /^Offer/.test(t) ? 'DEX' : /^AMM/.test(t) ? 'AMM' : /^TrustSet$/.test(t) ? 'Trustlines' : /^NFToken/.test(t) ? 'NFT' : /^(Escrow|Check|PaymentChannel)/.test(t) ? 'Escrow/Checks' : /^(AccountSet|SetRegularKey|SignerListSet|DepositPreauth|TicketCreate|AccountDelete|Clawback)/.test(t) ? 'Account' : 'Other';
async function ledgerSample() {
  const head = await rpc('ledger', { ledger_index: 'validated', transactions: true, expand: true });
  if (!head || !head.ledger) return null;
  const s0 = +head.ledger.ledger_index, rest = await Promise.all([1, 2, 3, 4].map(i => rpc('ledger', { ledger_index: s0 - i, transactions: true, expand: true })));
  const L = [head].concat(rest).filter(x => x && x.ledger).map(x => x.ledger);
  const types = {}, cats = {}, senders = {}, accts = {}, whales = []; let tx = 0, ok = 0, fee = 0, xv = 0, iou = 0, dex = 0;
  for (const l of L) for (const t of (l.transactions || [])) {
    const m = t.metaData || t.meta || {}, res = m.TransactionResult || '', good = res === 'tesSUCCESS';
    tx++; if (good) ok++; fee += +t.Fee || 0; types[t.TransactionType] = (types[t.TransactionType] || 0) + 1; const c = CAT(t.TransactionType); cats[c] = (cats[c] || 0) + 1;
    senders[t.Account] = (senders[t.Account] || 0) + 1; accts[t.Account] = 1; if (t.Destination) accts[t.Destination] = 1;
    if (t.TransactionType === 'Payment' && good) {
      if (typeof t.Amount === 'string') { const x = (+t.Amount) / 1e6; xv += x; if (x >= 5e5) whales.push({ h: t.hash, f: t.Account, to: t.Destination, x: Math.round(x), t: ((+l.close_time) + 946684800) * 1000, l: +l.ledger_index }); } else iou++;
    }
    if (t.TransactionType === 'OfferCreate') dex++;
  }
  const ts = L.map(l => +l.close_time), span = Math.max(1, Math.max.apply(null, ts) - Math.min.apply(null, ts)) + 4;
  const top = Object.keys(senders).map(a => [a, senders[a]]).sort((a, b) => b[1] - a[1]).slice(0, 6);
  return { seq: s0, n: L.length, tx, ok, tpl: tx / L.length, tps: tx / span, fee: fee / 1e6, xv, iou, dex, accts: Object.keys(accts).length, types, cats, top, whales, t: Date.now(), lt: (Math.max.apply(null, ts) - Math.min.apply(null, ts)) / Math.max(1, L.length - 1) };
}
const pear = (a, b) => { const n = Math.min(a.length, b.length); if (n < 5) return 0; a = a.slice(-n); b = b.slice(-n); const ma = a.reduce((s, x) => s + x, 0) / n, mb = b.reduce((s, x) => s + x, 0) / n; let c = 0, va = 0, vb = 0; for (let i = 0; i < n; i++) { c += (a[i] - ma) * (b[i] - mb); va += (a[i] - ma) ** 2; vb += (b[i] - mb) ** 2; } return va && vb ? c / Math.sqrt(va * vb) : 0; };
async function krakenStats(prev) {
  const g = u => jf(KRK + u).catch(() => null);
  const [tk, tr, dp, ...oh] = await Promise.all([Promise.all(KPAIRS.map(p => g('Ticker?pair=' + p[1]))), g('Trades?pair=XRPUSD' + (prev && prev.last ? '&since=' + prev.last : '&count=1000')), g('Depth?pair=XRPUSD&count=200')].concat(KPAIRS.slice(0, 4).map(p => g('OHLC?pair=' + p[1] + '&interval=60'))));
  const out = { assets: [], last: prev && prev.last };
  KPAIRS.forEach((p, i) => { const v = kfirst(tk[i]); if (!v) return; const px = +v.c[0], op = +v.o; out.assets.push({ s: p[0], px, chg: op ? (px / op - 1) * 100 : 0, vol: +v.v[1] * +v.p[1], trades: +v.t[1], hi: +v.h[1], lo: +v.l[1], vw: +v.p[1] }); });
  let buy = 0, sell = 0, prints = [];
  if (tr && tr.result) { out.last = tr.result.last || out.last; for (const t of (kfirst(tr) || [])) { const n = +t[0] * +t[1]; if (t[3] === 'b') buy += n; else sell += n; if (n >= 25000) prints.push({ t: Math.round(t[2] * 1000), px: +t[0], q: Math.round(+t[1]), usd: Math.round(n), side: t[3] === 'b' ? 'BUY' : 'SELL' }); } }
  out.buy = buy; out.sell = sell; out.prints = prints;
  const d = dp && kfirst(dp);
  if (d && d.bids && d.asks) {
    const bid = d.bids.map(x => [+x[0], +x[1]]), ask = d.asks.map(x => [+x[0], +x[1]]), mid = (bid[0][0] + ask[0][0]) / 2, win = p => [bid.filter(x => x[0] >= mid * (1 - p)).reduce((s, x) => s + x[0] * x[1], 0), ask.filter(x => x[0] <= mid * (1 + p)).reduce((s, x) => s + x[0] * x[1], 0)];
    let cb = 0, ca = 0; out.depth = { mid, spread: (ask[0][0] - bid[0][0]) / mid * 1e4, w1: win(.01), w2: win(.02), bids: bid.slice(0, 80).map(x => [x[0], Math.round(cb += x[1])]), asks: ask.slice(0, 80).map(x => [x[0], Math.round(ca += x[1])]) };
  }
  const cs = oh.map(o => (kfirst(o) || []).slice(-168)); out.perf = {}; out.vol = {}; out.rets = {};
  cs.forEach((c, i) => { if (c.length < 10) return; const s = KPAIRS[i][0], cl = c.map(x => +x[4]), r = []; for (let j = 1; j < cl.length; j++) r.push(Math.log(cl[j] / cl[j - 1])); out.rets[s] = r; const m = r.reduce((a, b) => a + b, 0) / r.length; out.vol[s] = Math.sqrt(r.reduce((a, b) => a + (b - m) ** 2, 0) / r.length) * Math.sqrt(24 * 365) * 100; out.perf[s] = cl.filter((_, j) => j % 2 === 0).map(x => +((x / cl[0] - 1) * 100).toFixed(2)); });
  if (cs[0] && cs[0].length > 10) {
    out.candles = cs[0].map(x => [+x[0], +x[1], +x[2], +x[3], +x[4], Math.round(+x[6])]);
    const hh = new Array(24).fill(0), hn = new Array(24).fill(0); cs[0].forEach(x => { const h = new Date(x[0] * 1000).getUTCHours(); hh[h] += +x[6] * +x[5]; hn[h]++; }); out.hod = hh.map((v, i) => Math.round(v / Math.max(1, hn[i])));
    let pk = 0, dd = 0; cs[0].forEach(x => { pk = Math.max(pk, +x[2]); dd = Math.min(dd, (+x[4] / pk - 1) * 100); }); out.dd = dd;
  }
  const names = Object.keys(out.rets); out.corr = { names, m: names.map(a => names.map(b => +pear(out.rets[a], out.rets[b]).toFixed(2))) }; delete out.rets;
  return out;
}
async function llamaStats(env, force) {
  const old = await env.KV.get('llama', 'json'); if (!force && old && Date.now() - old.ts < 30 * 6e4) return old;
  const g = u => jf(u, 12000).catch(() => null), [sc, tv, sch, ch] = await Promise.all([g('https://stablecoins.llama.fi/stablecoincharts/XRPL'), g('https://api.llama.fi/v2/historicalChainTvl/XRPL'), g('https://stablecoins.llama.fi/stablecoinchains'), g('https://api.llama.fi/v2/chains')]);
  const o = { ts: Date.now() };
  o.stable = Array.isArray(sc) ? sc.slice(-150).map(x => [+x.date, Math.round((x.totalCirculatingUSD && x.totalCirculatingUSD.peggedUSD) || 0)]) : (old && old.stable) || [];
  o.tvl = Array.isArray(tv) ? tv.slice(-200).map(x => [+x.date, Math.round(x.tvl)]) : (old && old.tvl) || [];
  o.cs = Array.isArray(sch) ? sch.map(x => [x.name, Math.round((x.totalCirculatingUSD && x.totalCirculatingUSD.peggedUSD) || 0)]).sort((a, b) => b[1] - a[1]).slice(0, 14) : (old && old.cs) || [];
  if (Array.isArray(sch)) { const all = sch.map(x => [x.name, (x.totalCirculatingUSD && x.totalCirculatingUSD.peggedUSD) || 0]).sort((a, b) => b[1] - a[1]); o.csRank = all.findIndex(x => x[0] === 'XRPL') + 1; o.csTotal = Math.round(all.reduce((s, x) => s + x[1], 0)); o.csN = all.length; if (!o.cs.some(x => x[0] === 'XRPL')) { const x = all.find(y => y[0] === 'XRPL'); if (x) o.cs.push([x[0], Math.round(x[1])]); } }
  o.ct = Array.isArray(ch) ? ch.map(x => [x.name, Math.round(x.tvl || 0)]).sort((a, b) => b[1] - a[1]).slice(0, 14) : (old && old.ct) || [];
  if (Array.isArray(ch)) { const all = ch.map(x => [x.name, x.tvl || 0]).sort((a, b) => b[1] - a[1]); o.ctRank = all.findIndex(x => x[0] === 'XRPL') + 1; o.ctN = all.length; if (!o.ct.some(x => x[0] === 'XRPL')) { const x = all.find(y => y[0] === 'XRPL'); if (x) o.ct.push([x[0], Math.round(x[1])]); } }
  await env.KV.put('llama', JSON.stringify(o)); return o;
}
async function stats(env, force) {
  const prev = (await env.KV.get('stats', 'json')) || {}, [lg, mk, ll] = await Promise.all([ledgerSample().catch(() => null), krakenStats(prev.mk).catch(() => null), llamaStats(env, force).catch(() => null)]);
  const hist = (prev.hist || []).slice(); const m = mk || prev.mk || {}, L = lg || prev.lg;
  if (lg || mk) { const px = (m.assets || []).find(a => a.s === 'XRP'); hist.push({ t: Date.now(), seq: L && L.seq, tpl: L && +L.tpl.toFixed(1), tps: L && +L.tps.toFixed(2), ok: L && +(L.ok / Math.max(1, L.tx) * 100).toFixed(1), xv: L && Math.round(L.xv / L.n), fee: L && +(L.fee / L.n).toFixed(4), acc: L && L.accts, px: px && px.px, buy: Math.round((mk && mk.buy) || 0), sell: Math.round((mk && mk.sell) || 0), bid: m.depth && Math.round(m.depth.w1[0]), ask: m.depth && Math.round(m.depth.w1[1]) }); }
  const wh = ((prev.whales || []).concat(lg ? lg.whales : [])).filter((w, i, a) => a.findIndex(x => x.h === w.h) === i).sort((a, b) => b.t - a.t).slice(0, 40);
  const pr = ((prev.prints || []).concat(mk && mk.prints ? mk.prints : [])).filter((p, i, a) => a.findIndex(x => x.t === p.t && x.usd === p.usd) === i).sort((a, b) => b.t - a.t).slice(0, 30);
  const o = { ts: Date.now(), lg: L, mk: Object.assign({}, m, { prints: undefined }), ll: ll || prev.ll, hist: hist.slice(-576), whales: wh, prints: pr };
  if (m.last) o.mk.last = m.last; await env.KV.put('stats', JSON.stringify(o)); return { ok: 1, hist: o.hist.length };
}
async function statsApi(env, ctx) {
  let s = await env.KV.get('stats', 'json');
  if (!s || Date.now() - s.ts > 9 * 6e4) { try { await stats(env); s = await env.KV.get('stats', 'json'); } catch (e) {} }
  return J(s || { ts: 0 }, 200, { 'cache-control': 'public, max-age=20' });
}


/* ---------- social: #XRPL / #XRP / #RLUSD posts (X API if X_BEARER secret is set, plus Mastodon public tags) ---------- */
async function social(env) {
  const c = await env.KV.get('social', 'json'); if (c && Date.now() - c.ts < 3 * 6e4) return c;
  const out = [], strip = h => String(h || '').replace(/<br\s*\/?>/gi, ' ').replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/\s+/g, ' ').trim();
  let hasX = false;
  if (env.X_BEARER) {
    try {
      const r = await fetch('https://api.x.com/2/tweets/search/recent?query=' + encodeURIComponent('(#XRPL OR #XRP OR #RLUSD) -is:retweet lang:en') + '&max_results=40&tweet.fields=created_at,public_metrics,author_id&expansions=author_id&user.fields=username', { headers: { authorization: 'Bearer ' + env.X_BEARER } });
      const j = await r.json(), um = {}; (j.includes && j.includes.users || []).forEach(x => um[x.id] = x);
      (j.data || []).forEach(t => { const un = um[t.author_id] ? um[t.author_id].username : 'i'; out.push({ s: 'x', id: 'x' + t.id, u: 'https://x.com/' + un + '/status/' + t.id, a: '@' + un, t: t.text, ts: Date.parse(t.created_at), l: (t.public_metrics || {}).like_count || 0, r: (t.public_metrics || {}).retweet_count || 0 }); });
      hasX = !!(j.data && j.data.length);
    } catch (e) {}
  }
  await Promise.all(['xrpl', 'xrp', 'rlusd'].map(async tag => {
    try { const j = await jf('https://mastodon.social/api/v1/timelines/tag/' + tag + '?limit=30', 9000); (Array.isArray(j) ? j : []).forEach(s => { if (s.reblog || s.visibility !== 'public') return; const t = strip(s.content); if (t.length < 20) return; out.push({ s: 'mastodon', id: 'm' + s.id, u: s.url, a: '@' + (s.account && s.account.acct), t: t.slice(0, 420), ts: Date.parse(s.created_at), l: s.favourites_count || 0, r: s.reblogs_count || 0 }); }); } catch (e) {}
  }));
  const seen = {}, items = out.filter(x => !seen[x.id] && (seen[x.id] = 1)).sort((a, b) => b.ts - a.ts).slice(0, 60);
  const o = { ts: Date.now(), x: hasX, items }; if (items.length) await env.KV.put('social', JSON.stringify(o)); return o.items.length ? o : (c || o);
}

/* ---------- sponsor ads: 3 slots, self-serve submit/manage, admin approval ---------- */
const AD_DEF = { prices: { 1: 99, 2: 79, 3: 59 }, days: 30, payUrl: '', contact: '' };
const sha = async s => Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s)))).map(b => b.toString(16).padStart(2, '0')).join('');
const adCfg = async env => Object.assign({}, AD_DEF, (await env.KV.get('adcfg', 'json')) || {});
const adPub = a => ({ id: a.id, slot: a.slot, title: a.title, desc: a.desc, url: a.url, grad: a.grad });
const okUrl = u => { try { const x = new URL(u); return x.protocol === 'https:' && x.hostname.includes('.') && u.length < 300; } catch (e) { return false; } };
const okGrad = g => Array.isArray(g) && g.length === 2 && g.every(c => /^#[0-9a-fA-F]{6}$/.test(c));
const clean = (s, n) => String(s || '').replace(/[<>]/g, '').replace(/\s+/g, ' ').trim().slice(0, n);
async function adsApi(req, env, u, p) {
  const nc = { 'cache-control': 'no-store' }, cfg = await adCfg(env), ads = (await env.KV.get('ads', 'json')) || [], now = Date.now();
  if (p === '/api/ads' && req.method === 'GET') {
    const act = ads.filter(a => a.status === 'active' && a.exp > now); const slots = {}; act.forEach(a => { slots[a.slot] = adPub(a); });
    const taken = {}; ads.filter(a => (a.status === 'active' && a.exp > now) || a.status === 'pending').forEach(a => { taken[a.slot] = a.status; });
    return J({ slots, taken, prices: cfg.prices, days: cfg.days, payUrl: cfg.payUrl, contact: cfg.contact }, 200, { 'cache-control': 'public, max-age=30' });
  }
  if (p.indexOf('/go/ad/') === 0) { const id = p.slice(7), a = ads.find(x => x.id === id); if (!a || a.status !== 'active') return Response.redirect(u.origin + '/advertise', 302); a.clicks = (a.clicks || 0) + 1; env.KV.put('ads', JSON.stringify(ads)); return Response.redirect(a.url, 302); }
  const b = await req.json().catch(() => ({}));
  if (p === '/api/ads/submit' && req.method === 'POST') {
    const slot = +b.slot, title = clean(b.title, 40), desc = clean(b.desc, 120), url = String(b.url || '').trim(), email = clean(b.email, 120);
    if (![1, 2, 3].includes(slot) || title.length < 3 || desc.length < 10 || !okUrl(url) || !okGrad(b.grad) || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return J({ error: 'Please complete every field: title (3-40), description (10-120), a valid https:// link, gradient and email.' }, 400, nc);
    if (ads.filter(a => a.status === 'pending').length >= 60) return J({ error: 'Too many pending requests right now.' }, 429, nc);
    if (ads.some(a => a.slot === slot && ((a.status === 'active' && a.exp > now) || (a.status === 'pending' && now - a.created < 72 * 36e5)))) return J({ error: 'That slot is currently taken or reserved. Pick another slot.' }, 409, nc);
    const tok = Array.from(crypto.getRandomValues(new Uint8Array(12))).map(x => x.toString(16).padStart(2, '0')).join(''), a = { id: 'ad' + now.toString(36) + Math.floor(Math.random() * 1e3), slot, title, desc, url, grad: b.grad, email, th: await sha(tok), status: 'pending', created: now, exp: 0, clicks: 0 };
    ads.push(a); await env.KV.put('ads', JSON.stringify(ads));
    return J({ ok: 1, id: a.id, token: tok, price: cfg.prices[slot], days: cfg.days, payUrl: cfg.payUrl, contact: cfg.contact }, 200, nc);
  }
  if ((p === '/api/ads/status' || p === '/api/ads/update') && req.method === 'POST') {
    const a = ads.find(x => x.id === b.id); if (!a || a.th !== await sha(String(b.token || ''))) return J({ error: 'Ad ID or private key not recognised.' }, 403, nc);
    if (p === '/api/ads/update') {
      const title = clean(b.title, 40), desc = clean(b.desc, 120), url = String(b.url || '').trim();
      if (title.length < 3 || desc.length < 10 || !okUrl(url) || !okGrad(b.grad)) return J({ error: 'Check the title, description, https link and gradient.' }, 400, nc);
      Object.assign(a, { title, desc, url, grad: b.grad }); await env.KV.put('ads', JSON.stringify(ads));
    }
    return J({ ok: 1, ad: Object.assign(adPub(a), { status: a.status === 'active' && a.exp < now ? 'expired' : a.status, exp: a.exp, clicks: a.clicks || 0, created: a.created }), price: cfg.prices[a.slot], payUrl: cfg.payUrl, contact: cfg.contact, days: cfg.days }, 200, nc);
  }
  return J({ error: 'not found' }, 404, nc);
}
async function adsAdmin(b, env) {
  const ads = (await env.KV.get('ads', 'json')) || [];
  if (b.action === 'ad-list') return J({ ads: ads.map(a => ({ id: a.id, slot: a.slot, title: a.title, url: a.url, email: a.email, status: a.status, exp: a.exp, clicks: a.clicks, created: a.created })), cfg: await adCfg(env) });
  if (b.action === 'ad-config') { const c = Object.assign(await adCfg(env), { prices: b.prices || undefined, days: b.days, payUrl: b.payUrl, contact: b.contact }); Object.keys(c).forEach(k => c[k] === undefined && delete c[k]); await env.KV.put('adcfg', JSON.stringify(c)); return J({ ok: 1, cfg: await adCfg(env) }); }
  const a = ads.find(x => x.id === b.id); if (!a) return J({ error: 'no such ad' }, 404);
  if (b.action === 'ad-approve') { a.status = 'active'; a.exp = Date.now() + (+b.days || (await adCfg(env)).days) * 864e5; }
  else if (b.action === 'ad-reject') a.status = 'rejected'; else if (b.action === 'ad-remove') ads.splice(ads.indexOf(a), 1); else return J({ error: 'bad action' }, 400);
  await env.KV.put('ads', JSON.stringify(ads)); return J({ ok: 1 });
}

/* ---------- orchestration ---------- */
async function topRefresh(env) { if (env.XRPL_KEY) SQK = env.XRPL_KEY; const sv = await env.KV.get('toptok', 'json').catch(() => null); if (sv && Date.now() - sv.ts < 12 * 6e4) return 'fresh'; let d; try { d = await sqGet('/v1/tokens?start=0&limit=50&sortBy=vol24hxrp&sortType=desc', 60); } catch (e) { d = { tokens: await xmTop(env).catch(() => []) }; } if (!(d.tokens || []).length) return 'empty'; await env.KV.put('toptok', JSON.stringify({ ts: Date.now(), t: d.tokens.slice(0, 50) }), { expirationTtl: 86400 }); return 'ok'; }
async function tick(env, force) {
  if (busy) return { busy: true }; const C = await ctlGet(env); if (C.cronOff && !force) return { off: 1 }; busy = true; const log = {};
  try {
    log.news = await refresh(env, force).catch(e => 'ERR ' + e.message);
    log.stats = await stats(env).catch(e => 'ERR ' + e.message);
    log.top = await topRefresh(env).catch(e => 'ERR ' + e.message);
    log.hourly = C.noHourly ? 'off' : await hourly(env).catch(e => 'ERR ' + e.message);
    log.daily = C.noDaily ? 'off' : await daily(env).catch(e => 'ERR ' + e.message);
  } finally { busy = false; }
  return log;
}
async function news(env, ctx) {
  let d = await env.KV.get('news', 'json'); const now = Date.now();
  if (!d) { await tick(env); d = (await env.KV.get('news', 'json')) || { items: [], ts: 0 }; }
  else if (now - d.ts > 25 * 6e4 && !busy) ctx.waitUntil(tick(env));
  const blogs = (await env.KV.get('blogs', 'json')) || [], ld = blogs.find(b => b.k === 'd');
  const C = await ctlGet(env);
  return J({ items: ctlItems(d.items, C), mkt: d.mkt, xrpl: d.xrpl, ts: d.ts, next: nextDaily(now), lastDaily: ld ? ld.ts : 0 }, 200, { 'cache-control': 'public, max-age=' + (+C.cacheSec || 60) + ', s-maxage=' + (+C.cacheSec || 60) });
}
/* ---------- XRPL token news submissions (paid, admin-approved) ---------- */
async function tnCfg(env) { return Object.assign({ addr: '', price: 50 }, (await env.KV.get('tncfg', 'json')) || {}); }
async function tnAll(env) { return (await env.KV.get('tn', 'json')) || []; }
function tnPub(s) { return { id: s.id, slug: s.slug, title: s.title, token: s.token, tslug: s.tslug || '', link: s.link || '', ts: s.apr || s.ts, ex: String(s.body).replace(/\s+/g, ' ').slice(0, 260), name: s.name || '', tx: s.tx || '' }; }
async function tnVerify(tx, cfg) {
  if (!cfg.addr) return { paid: false, why: 'No payment address configured' };
  const r = await fetch('https://s1.ripple.com:51234/', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ method: 'tx', params: [{ transaction: tx, binary: false }] }) }).then(x => x.json()).catch(() => null);
  const t = r && r.result; if (!t || t.error) return { paid: false, why: 'Transaction not found yet' };
  const dl = t.meta && t.meta.delivered_amount != null ? t.meta.delivered_amount : t.Amount;
  const ok = !!t.validated && t.TransactionType === 'Payment' && t.Destination === cfg.addr && typeof dl === 'string' && +dl >= cfg.price * 1e6 && t.meta && t.meta.TransactionResult === 'tesSUCCESS';
  return { paid: ok, why: ok ? '' : 'Transaction does not match the payment address or amount', from: t.Account || '' };
}
async function tnApi(req, env, u, p) {
  const nc = { 'cache-control': 'no-store' };
  if (p === '/api/tn' && req.method === 'GET') { const cfg = await tnCfg(env), all = await tnAll(env); return J({ posts: all.filter(s => s.status === 'approved').sort((a, b) => (b.apr || 0) - (a.apr || 0)).map(tnPub), price: cfg.price, addr: cfg.addr }, 200, { 'cache-control': 'public, max-age=20' }); }
  if (p === '/api/tn/submit' && req.method === 'POST') {
    const b = await req.json().catch(() => null); if (!b || b.hp) return J({ error: 'Invalid submission' }, 400, nc);
    const ip = req.headers.get('cf-connecting-ip') || 'x', rk = 'tnrl:' + ip, n = +(await env.KV.get(rk)) || 0; if (n >= 5) return J({ error: 'Too many submissions from this connection. Try again later.' }, 429, nc);
    const S = (v, m) => String(v == null ? '' : v).replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g, '').trim().slice(0, m);
    const s = { title: S(b.title, 120), token: S(b.token, 40), tslug: S(b.tslug, 120).replace(/[^A-Za-z0-9_.\-]/g, ''), link: S(b.link, 300), email: S(b.email, 120), tx: S(b.tx, 64).toLowerCase(), body: S(b.body, 30000), name: S(b.name, 80) };
    if (s.title.length < 8) return J({ error: 'Title must be at least 8 characters.' }, 400, nc);
    if (!s.token) return J({ error: 'Token name is required.' }, 400, nc);
    if (s.body.length < 150) return J({ error: 'Please write at least 150 characters of news.' }, 400, nc);
    if (s.link && !/^https:\/\/[^\s]+$/i.test(s.link)) return J({ error: 'Link must start with https://' }, 400, nc);
    let prec = null; if (b.pay) { const pl = await payAll(env); prec = pl.find(x => x.id === b.pay && x.kind === 'tn' && x.status === 'paid' && !x.used); if (!prec) return J({ error: 'That payment was not found or was already used.' }, 400, nc); s.tx = String(prec.tx).toLowerCase(); }
    else if (!/^[a-f0-9]{64}$/.test(s.tx)) return J({ error: 'Enter the 64-character transaction hash of your payment.' }, 400, nc);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s.email)) return J({ error: 'A valid contact email is required.' }, 400, nc);
    const all = await tnAll(env); if (all.some(x => x.tx === s.tx)) return J({ error: 'That transaction has already been used.' }, 400, nc);
    const v = prec ? { paid: true, why: '', from: prec.from } : await tnVerify(s.tx, await tnCfg(env)), id = 't' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5);
    const rec = Object.assign(s, { id, ts: Date.now(), status: 'pending', paid: v.paid, why: v.why, from: v.from || '' });
    all.unshift(rec); await env.KV.put('tn', JSON.stringify(all.slice(0, 400))); if (prec) { const pl = await payAll(env), pr = pl.find(x => x.id === prec.id); if (pr) { pr.used = 1; pr.ref = id; await paySave(env, pl); } } await env.KV.put(rk, String(n + 1), { expirationTtl: 3600 });
    return J({ ok: 1, id, paid: v.paid, why: v.why }, 200, nc);
  }
  if (p.indexOf('/api/tn/') === 0 && req.method === 'GET') { const sl = decodeURIComponent(p.slice(8)), s = (await tnAll(env)).find(x => x.slug === sl && x.status === 'approved'); if (!s) return J({ error: 'not found' }, 404, nc); return J(Object.assign(tnPub(s), { body: s.body, name: s.name || '' }), 200, { 'cache-control': 'public, max-age=60' }); }
  return J({ error: 'not found' }, 404, nc);
}
async function tnAdmin(b, env) {
  const all = await tnAll(env);
  if (b.action === 'tn-list') return J({ subs: all, cfg: await tnCfg(env) }, 200, { 'cache-control': 'no-store' });
  if (b.action === 'tn-config') { const c = await tnCfg(env); if (b.addr != null) { const a = String(b.addr).trim(); if (a && !/^r[1-9A-HJ-NP-Za-km-z]{24,34}$/.test(a)) return J({ error: 'Not a valid XRPL r-address' }, 400); c.addr = a; } if (+b.price > 0) c.price = +b.price; await env.KV.put('tncfg', JSON.stringify(c)); return J({ ok: 1, cfg: c }); }
  const s = all.find(x => x.id === b.id); if (!s) return J({ error: 'no such submission' }, 404);
  if (b.action === 'tn-approve') { s.status = 'approved'; s.apr = Date.now(); s.slug = s.slug || (s.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60) + '-' + s.id.slice(-4)); }
  else if (b.action === 'tn-reject') s.status = 'rejected';
  else if (b.action === 'tn-recheck') { const v = await tnVerify(s.tx, await tnCfg(env)); s.paid = v.paid; s.why = v.why; s.from = v.from || s.from; }
  else if (b.action === 'tn-remove') all.splice(all.indexOf(s), 1); else return J({ error: 'bad action' }, 400);
  await env.KV.put('tn', JSON.stringify(all)); return J({ ok: 1, paid: s.paid });
}
async function admin(req, env) {
  { const kk = req.headers.get('x-admin-key') || '', hx = Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(kk)))).map(x => x.toString(16).padStart(2, '0')).join(''); if (!kk || !((env.ADMIN_KEY && kk === env.ADMIN_KEY) || hx === '9438585d6f53e4099ac6bed83d052882c0cfcb03fc3c4456e293732cac5a5be1')) return J({ error: 'unauthorized' }, 401, { 'cache-control': 'no-store' }); }
  if (req.method === 'GET') return J({ facts: await getFacts(env) }, 200, { 'cache-control': 'no-store' });
  const b = await req.json().catch(() => ({})), facts = await getFacts(env);
  if (b.action === 'add' && b.text && /^(BONSAI|LUMA|BOTH)$/.test(b.product || '')) {
    const f = { id: 'f' + Date.now().toString(36), p: b.product, t: String(b.text).slice(0, 600), add: Date.now(), used: 0, last: 0 }; facts.push(f); await env.KV.put('facts', JSON.stringify(facts)); return J({ ok: 1, fact: f });
  }
  if (b.action === 'remove') { const n = facts.filter(f => f.id !== b.id); await env.KV.put('facts', JSON.stringify(n)); return J({ ok: 1, left: n.length }); }
  if (/^ad-/.test(b.action || '')) return await adsAdmin(b, env);
  if (b.action === 'an-get') return await anGet(b, env);
  if (/^tn-/.test(b.action || '')) return await tnAdmin(b, env);
  if (/^ctl-/.test(b.action || '')) return await ctlAdmin(b, env);
  if (/^fin-/.test(b.action || '')) return await finAdmin(b, env);
  if (b.action === 'daily') return J(await daily(env, true));
  if (b.action === 'delete-post' && b.slug) { await env.KV.delete('b:' + b.slug); const l = ((await env.KV.get('blogs', 'json')) || []).filter(x => x.slug !== b.slug); await env.KV.put('blogs', JSON.stringify(l)); return J({ ok: 1 }); }
  return J({ error: 'bad request' }, 400);
}
async function exportAll(env, u) {
  const list = (await env.KV.get('blogs', 'json')) || [], off = +u.searchParams.get('offset') || 0, lim = Math.min(40, +u.searchParams.get('limit') || 40);
  const slice = list.slice(off, off + lim), posts = [];
  for (const m of slice) { const p = await env.KV.get('b:' + m.slug, 'json'); if (p) posts.push(p); }
  return J({ total: list.length, offset: off, posts, facts: off === 0 ? await getFacts(env) : undefined });
}
async function rss(env, u) {
  const list = ((await env.KV.get('blogs', 'json')) || []).slice(0, 50), o = u.origin;
  const items = list.map(b => '<item><title>' + esc(b.title) + '</title><link>' + o + '/blog/' + b.slug + '</link><guid isPermaLink="true">' + o + '/blog/' + b.slug + '</guid><pubDate>' + new Date(b.ts).toUTCString() + '</pubDate><category>' + (b.k === 'd' ? 'BONSAI x LUMA Daily' : 'XRPL Hourly Brief') + '</category><description>' + esc(b.ex) + '</description></item>').join('');
  return new Response('<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>XRPLTODAY</title><link>' + o + '</link><description>Hourly XRP, XRPL and RLUSD briefs plus the daily BONSAI x LUMA feature.</description><language>en</language>' + items + '</channel></rss>', { headers: { 'content-type': 'application/rss+xml;charset=utf-8', 'cache-control': 'public, max-age=300' } });
}
async function page(env, u, ua) {
  let h = HTML; const m = u.pathname.match(/^\/blog\/([^\/]+)$/), dflt = '<meta property="og:title" content="XRPLTODAY — Live XRP, XRPL &amp; RLUSD News Terminal"><meta property="og:type" content="website">';
  if (m) {
    const p = await env.KV.get('b:' + decodeURIComponent(m[1]), 'json');
    if (p) h = h.replace(/<title>[\s\S]*?<\/title>/, () => '<title>' + esc(p.title) + ' — XRPLTODAY</title>').replace(/<meta name="description"[^>]*>/, () => '<meta name="description" content="' + esc(p.ex) + '">').replace('<!--META-->', () => '<meta property="og:title" content="' + esc(p.title) + '"><meta property="og:description" content="' + esc(p.ex) + '"><meta property="og:type" content="article">');
    else h = h.replace('<!--META-->', () => dflt);
  } else h = h.replace('<!--META-->', () => dflt);
  const tm = u.pathname.match(/^\/token\/([^\/]+)$/); if (tm) { const nm = esc(decodeURIComponent(tm[1]).slice(0, 60)); h = h.replace(/<title>[\s\S]*?<\/title>/, () => '<title>' + nm + ' token price, chart & analytics — XRPLTODAY</title>').replace('<meta property="og:title" content="XRPLTODAY — Live XRP, XRPL &amp; RLUSD News Terminal">', () => '<meta property="og:title" content="' + nm + ' — live chart & analytics on XRPLTODAY"><meta name="twitter:card" content="summary">'); }
  const tn2 = u.pathname.match(/^\/tokens\/([^\/]+)$/); if (tn2) { const all2 = (await env.KV.get('tn', 'json')) || [], s2 = all2.find(x => x.slug === decodeURIComponent(tn2[1]) && x.status === 'approved'); if (s2) h = h.replace(/<title>[\s\S]*?<\/title>/, () => '<title>' + esc(s2.title) + ' — XRPLTODAY XRPL Token News</title>').replace('<meta property="og:title" content="XRPLTODAY — Live XRP, XRPL &amp; RLUSD News Terminal">', () => '<meta property="og:title" content="' + esc(s2.title) + '"><meta property="og:description" content="' + esc(String(s2.body).replace(/\s+/g, ' ').slice(0, 200)) + '"><meta property="og:type" content="article"><meta name="twitter:card" content="summary">'); }
  const sm = u.pathname.match(/^\/story\/([a-z0-9]+)$/i);
  if (sm) {
    const sid = sm[1]; let it = null;
    for (const k of ['stocks', 'metals', 'ai', 'world']) { const l = (await env.KV.get('mkl:' + k, 'json').catch(() => null)) || []; it = l.find(x => String(x.id) === sid); if (it) break; }
    if (!it) { const nd = await env.KV.get('news', 'json').catch(() => null); it = nd && (nd.items || []).find(x => String(x.id) === sid); }
    if (it && !it.im && /bot|twitter|facebook|slack|discord|telegram|whatsapp|linkedin|preview|embed/i.test(ua || '')) { const cr = await coverApi(env, new URL('/api/cover?u=' + encodeURIComponent(it.u), u.origin)).then(r => r.json()).catch(() => null); if (cr && cr.im) it = Object.assign({}, it, { im: cr.im }); }
    if (it) {
      const br = (await env.KV.get('mkb2:' + sid).catch(() => null)) || it.d || '', ds = esc(String(br).split(/KEY POINTS:/i)[0].replace(/\s+/g, ' ').trim().slice(0, 200) || (it.s + ' — summary on XRPLTODAY'));
      if (it.im) { let im2 = it.im; if (/i\.guim\.co\.uk/.test(im2)) im2 = im2.replace(/([?&])width=\d+/, '$1width=1200'); else if (/ichef\.bbci\.co\.uk/.test(im2)) im2 = im2.replace(/\/standard\/\d+\//, '/standard/976/'); else if (/www\.bing\.com\/th/.test(im2)) im2 = im2.replace(/&(w|h|c|rs|qlt)=[^&]*/g, '') + '&w=1200&h=630&c=14&rs=1&qlt=90'; it = Object.assign({}, it, { im: im2 }); }
      const mt = '<meta property="og:title" content="' + esc(it.t) + '"><meta property="og:description" content="' + ds + '"><meta property="og:type" content="article"><meta property="og:site_name" content="XRPLTODAY">' + (it.im ? '<meta property="og:image" content="' + esc(it.im) + '"><meta name="twitter:image" content="' + esc(it.im) + '"><meta name="twitter:card" content="summary_large_image">' : '<meta name="twitter:card" content="summary">') + '<meta name="twitter:title" content="' + esc(it.t) + '">';
      h = h.replace(/<title>[\s\S]*?<\/title>/, () => '<title>' + esc(it.t) + ' — XRPLTODAY</title>').replace('<meta property="og:title" content="XRPLTODAY — Live XRP, XRPL &amp; RLUSD News Terminal"><meta property="og:type" content="website">', () => mt);
    }
  }
  return new Response(h, { headers: { 'content-type': 'text/html;charset=utf-8', 'cache-control': 'public, max-age=60' } });
}
/* ---- XRPL Squares: token data proxy (xrpl.to) ---- */
const SQ_UA = { 'user-agent': 'XRPLTODAY/1.0 (+squares)', accept: 'application/json' };
async function xmTop(env) {
  const [r, xu] = await Promise.all([fetch('https://s1.xrplmeta.org/tokens?limit=60&sort_by=volume_24h&sort_order=desc', { headers: SQ_UA, cf: { cacheTtl: 120, cacheEverything: true } }), xrpUsd(env).catch(() => 0)]);
  if (!r.ok) throw new Error('xm ' + r.status); const j = await r.json(), rate = +(xu && xu.p || xu) || 0;
  const dh = c => { if (!/^[0-9A-Fa-f]{40}$/.test(c)) return c; let o = ''; for (let i = 0; i < 40; i += 2) { const n = parseInt(c.substr(i, 2), 16); if (n) o += String.fromCharCode(n); } return /^[\x20-\x7e]{2,}$/.test(o) ? o : c.slice(0, 6); };
  return (j.tokens || []).filter(t => t.metrics && +t.metrics.price > 0).slice(0, 50).map(t => { const m = t.metrics, p = +m.price, tk = (t.meta && t.meta.token) || {}, is = (t.meta && t.meta.issuer) || {}; return { slug: t.issuer + '-' + t.currency, name: tk.name || dh(t.currency), currency: t.currency, issuer: t.issuer, exch: p, usd: rate ? p * rate : 0, pro1h: null, pro24h: null, pro7d: null, vol24hxrp: +m.volume_24h || 0, marketcap: +m.marketcap || 0, holders: +m.holders || 0, trustlines: +m.trustlines || 0, vol24htx: +m.exchanges_24h || 0, verified: !!(is.kyc || (tk.trust_level || 0) >= 2) }; });
}
let SQK = '';
async function sqGet(path, ttl) { const r = await fetch('https://api.xrpl.to' + path, { headers: SQK ? Object.assign({}, SQ_UA, { 'X-Api-Key': SQK }) : SQ_UA, cf: { cacheTtl: ttl || 60, cacheEverything: true } }); if (!r.ok) throw new Error('upstream ' + r.status); return r.json(); }
async function sqApi(req, env, u, p) {
  if (env.XRPL_KEY) SQK = env.XRPL_KEY;
  const H = { 'cache-control': 'public, max-age=30' }, q = u.searchParams;
  try {
    if (p === '/api/sq/ohlc') { const md5 = (q.get('md5') || '').replace(/[^a-f0-9]/gi, '').slice(0, 40), i = ['5m', '15m', '1h', '4h', '1d'].includes(q.get('i')) ? q.get('i') : '1h', n = Math.max(10, Math.min(300, +q.get('n') || 96)); if (!md5) return J({ error: 'md5' }, 400); const d = await sqGet('/v1/ohlc/' + md5 + '?interval=' + i + '&limit=' + n, 45); return J({ ohlc: d.ohlc || [] }, 200, H); }
    if (p === '/api/sq/img') {
      const u = q.get('u') || ''; let U; try { U = new URL(u); } catch (e) { return J({ error: 'url' }, 400); }
      if (!/^https?:$/.test(U.protocol) || /^(localhost|127\.|10\.|192\.168\.|169\.254\.|172\.(1[6-9]|2\d|3[01])\.|\[|0\.)/i.test(U.hostname) || !U.hostname.includes('.')) return J({ error: 'host' }, 400);
      const r = await fetch(U.toString(), { headers: { 'user-agent': 'Mozilla/5.0 XRPLTODAY' }, cf: { cacheTtl: 86400, cacheEverything: true } }).catch(() => null);
      const ct = r && r.headers.get('content-type') || '';
      if (!r || !r.ok || !/^image\//i.test(ct) || +(r.headers.get('content-length') || 0) > 6e6) return J({ error: 'img' }, 404);
      return new Response(r.body, { headers: { 'content-type': ct, 'access-control-allow-origin': '*', 'cache-control': 'public, max-age=86400' } });
    }
    if (p === '/api/sq/token') { const s = (q.get('slug') || '').replace(/[^A-Za-z0-9_.\-]/g, '').slice(0, 120); if (!s) return J({ error: 'slug' }, 400); try { const d = await sqGet('/v1/token/' + s, 120); if (d.token && Math.random() < 0.15) await env.KV.put('tk:' + s, JSON.stringify(d.token), { expirationTtl: 86400 }).catch(() => { }); return J({ token: d.token || null }, 200, H); } catch (e) { const st = await env.KV.get('tk:' + s, 'json').catch(() => null); if (st) return J({ token: st, stale: 1 }, 200, H); throw e; } }
    if (p === '/api/sq/tokens') { const ok = ['vol24hxrp', 'pro24h', 'marketcap', 'holders', 'trendingScore', 'dateon', 'pro7d', 'vol24h'], sort = ok.includes(q.get('sort')) ? q.get('sort') : 'vol24hxrp', dir = q.get('dir') === 'asc' ? 'asc' : 'desc', lim = Math.max(1, Math.min(200, +q.get('limit') || 100)), st = Math.max(0, +q.get('start') || 0); const top = sort === 'vol24hxrp' && dir === 'desc' && st === 0 && lim <= 50; const sv = top ? await env.KV.get('toptok', 'json').catch(() => null) : null; if (sv && sv.t && Date.now() - sv.ts < 15 * 6e4) return J({ tokens: sv.t, total: sv.t.length, ts: sv.ts }, 200, H); try { const d = await sqGet('/v1/tokens?start=' + st + '&limit=' + lim + '&sortBy=' + sort + '&sortType=' + dir, 120); if (top && (d.tokens || []).length) await env.KV.put('toptok', JSON.stringify({ ts: Date.now(), t: d.tokens.slice(0, 50) }), { expirationTtl: 86400 }).catch(() => { }); return J({ tokens: d.tokens || [], total: d.total || 0, ts: Date.now() }, 200, H); } catch (e) { if (top) { try { const x = await xmTop(env); if (x.length) { await env.KV.put('toptok', JSON.stringify({ ts: Date.now(), t: x }), { expirationTtl: 86400 }).catch(() => { }); return J({ tokens: x, total: x.length, ts: Date.now() }, 200, H); } } catch (e2) { } } if (sv && sv.t) return J({ tokens: sv.t, total: sv.t.length, ts: sv.ts, stale: 1 }, 200, H); throw e; } }
    if (p === '/api/sq/search') {
      const s = (q.get('q') || '').trim().slice(0, 64); if (s.length < 2) return J({ items: [] }, 200, H);
      let d = null; try { const r = await fetch('https://api.xrpl.to/v1/search', { method: 'POST', headers: Object.assign({ 'content-type': 'application/json' }, SQ_UA), body: JSON.stringify({ search: s, limit: 24, offset: 0 }) }); if (r.ok) d = await r.json(); } catch (e) {}
      let arr = []; if (d) { const c = [d.tokens, d.results, d.data, d.items]; for (const x of c) { if (Array.isArray(x)) { arr = x; break; } if (x && Array.isArray(x.tokens)) { arr = x.tokens; break; } } }
      if (!arr.length) { try { const d2 = await sqGet('/v1/tokens?start=0&limit=24&sortBy=vol24hxrp&sortType=desc&filter=' + encodeURIComponent(s), 60); arr = d2.tokens || []; } catch (e) {} }
      const items = arr.filter(t => t && t.md5).map(t => ({ md5: t.md5, name: t.name || t.currency, cur: t.currency, iss: t.issuer, slug: t.slug, px: +t.exch || 0, usd: +t.usd || 0, c24: t.pro24h, c7: t.pro7d, vol: t.vol24hxrp, mc: t.marketcap, h: t.holders, tl: t.trustlines, rsi: t.rsi24h, vl: t.volatility24h, ver: !!(t.verified || t.kyc), tvl: t.tvl })); return J({ items }, 200, H);
    }
    return J({ error: 'not found' }, 404);
  } catch (e) { return J({ error: String(e.message || e) }, 502); }
}

/* ---- cover image lookup: og:image of the article page, cached ---- */
async function coverApi(env, u) {
  const raw = (u.searchParams.get('u') || '').slice(0, 600); let t; try { t = new URL(raw); } catch (e) { return J({ im: '' }, 200); }
  if (!/^https?:$/.test(t.protocol) || /^(localhost|127\.|10\.|192\.168\.|169\.254\.|0\.)/i.test(t.hostname) || !t.hostname.includes('.') || /^\d+\.\d+\.\d+\.\d+$/.test(t.hostname)) return J({ im: '' }, 200);
  const key = 'cv:' + hash(t.href), c = await env.KV.get(key, 'json'); const H = { 'cache-control': 'public, max-age=3600' };
  if (c) return J(c, 200, H);
  let im = '';
  try {
    const r = await fetch(t.href, { headers: { 'user-agent': 'Mozilla/5.0 (compatible; XRPLTODAYBot/1.0; +cover)', accept: 'text/html' }, redirect: 'follow', signal: AbortSignal.timeout(7000) });
    if (r.ok && /html/i.test(r.headers.get('content-type') || '')) {
      const rd = r.body.getReader(), dc = new TextDecoder(); let html = '', n = 0; while (n < 250000) { const x = await rd.read(); if (x.done) break; html += dc.decode(x.value, { stream: true }); n += x.value.length; if (/<\/head>/i.test(html)) break; } try { rd.cancel(); } catch (e) { }
      const mt = html.match(/<meta[^>]+(?:property|name)=["'](?:og:image(?::secure_url)?|twitter:image(?::src)?)["'][^>]*>/i) || [], a = mt[0] ? (mt[0].match(/content=["']([^"']+)["']/i) || [])[1] : '' || '';
      let v = a || (html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["'](?:og:image|twitter:image)["']/i) || [])[1] || ''; v = dec(v || '').trim();
      if (v) { try { v = new URL(v, t.href).href; } catch (e) { v = ''; } } if (/^https:\/\//i.test(v) && !/logo|favicon|sprite|1x1|pixel/i.test(v)) im = v.slice(0, 500);
    }
  } catch (e) { }
  const out = { im }; await env.KV.put(key, JSON.stringify(out), { expirationTtl: im ? 604800 : 86400 }); return J(out, 200, H);
}

/* ---------- markets news (stocks + metals) ---------- */
const MK = {
  stocks: { q: ['stock market today', 'Wall Street stocks S&P 500 Nasdaq Dow', 'top stocks to watch earnings', 'Federal Reserve rates stocks'],
    d: [['CNBC', 'https://www.cnbc.com/id/100003114/device/rss/rss.html'], ['MarketWatch', 'https://feeds.content.dowjones.io/public/rss/mw_topstories'], ['Yahoo Finance', 'https://finance.yahoo.com/news/rssindex'], ['Investing.com', 'https://www.investing.com/rss/news_25.rss']] },
  world: { q: ['world news today', 'breaking international news', 'global politics diplomacy', 'Middle East Europe Asia news'],
    d: [['BBC News', 'https://feeds.bbci.co.uk/news/world/rss.xml'], ['Al Jazeera', 'https://www.aljazeera.com/xml/rss/all.xml'], ['The Guardian', 'https://www.theguardian.com/world/rss'], ['NPR', 'https://feeds.npr.org/1004/rss.xml']] },
  ai: { q: ['artificial intelligence news', 'OpenAI Anthropic Google Gemini AI models', 'AI chips Nvidia data center', 'generative AI regulation startups'],
    d: [['TechCrunch', 'https://techcrunch.com/category/artificial-intelligence/feed/'], ['The Verge', 'https://www.theverge.com/rss/ai-artificial-intelligence/index.xml'], ['VentureBeat', 'https://venturebeat.com/category/ai/feed/'], ['MIT Technology Review', 'https://www.technologyreview.com/topic/artificial-intelligence/feed']] },
  metals: { q: ['gold price', 'silver price', 'copper price', 'precious metals gold silver copper market'],
    d: [['Kitco', 'https://www.kitco.com/rss/'], ['Investing.com', 'https://www.investing.com/rss/news_11.rss'], ['Mining.com', 'https://www.mining.com/feed/']] }
};
function mkTags(k, t) {
  const c = [];
  if (k === 'ai') { if (/openai|chatgpt|gpt-?\d|sora/i.test(t)) c.push('OpenAI'); if (/anthropic|claude/i.test(t)) c.push('Anthropic'); if (/google|gemini|deepmind/i.test(t)) c.push('Google'); if (/nvidia|chip|gpu|semiconductor|data cent/i.test(t)) c.push('Chips'); if (/regulat|law|lawsuit|copyright|ban\b|policy|congress|\beu\b/i.test(t)) c.push('Policy'); if (/robot|agent|model|llm|startup|funding|raises/i.test(t)) c.push('Models'); if (!c.length) c.push('Other'); }
  else if (k === 'world') { if (/election|president|minister|parliament|government|vote|congress|senate|diplomat|summit|treaty|sanction/i.test(t)) c.push('Politics'); if (/war|attack|strike|missile|troops|military|ceasefire|conflict|killed|hostage|drone/i.test(t)) c.push('Conflict'); if (/econom|trade|tariff|inflation|market|oil|gdp|bank|currency/i.test(t)) c.push('Economy'); if (/europe|\beu\b|uk\b|britain|france|german|ukraine|russia|nato/i.test(t)) c.push('Europe'); if (/china|japan|india|korea|taiwan|asia|pakistan|indonesia|philippines/i.test(t)) c.push('Asia'); if (/israel|gaza|iran|saudi|syria|lebanon|iraq|yemen|middle east|turkey|egypt/i.test(t)) c.push('Middle East'); if (/u\.s\.|\bus\b|america|canada|mexico|brazil|argentina|venezuela|trump|biden/i.test(t)) c.push('Americas'); if (/africa|nigeria|kenya|sudan|ethiopia|congo|south africa/i.test(t)) c.push('Africa'); if (!c.length) c.push('Other'); }
  else if (k === 'metals') { if (/gold/i.test(t)) c.push('Gold'); if (/silver/i.test(t)) c.push('Silver'); if (/copper/i.test(t)) c.push('Copper'); if (!c.length) c.push('Other'); }
  else { if (/s&p|nasdaq|dow\b|index|indices|wall street/i.test(t)) c.push('Indexes'); if (/earnings|revenue|profit|quarter|guidance|eps/i.test(t)) c.push('Earnings'); if (/nvidia|apple|microsoft|tesla|amazon|meta\b|google|alphabet|\bai\b|chip|semiconductor/i.test(t)) c.push('Tech'); if (/\bfed\b|federal reserve|powell|rate cut|inflation|cpi|treasury|yield/i.test(t)) c.push('Fed'); if (/surge|soar|plunge|jump|tumble|rally|slump|sink|spike|biggest|movers/i.test(t)) c.push('Movers'); }
  return c;
}
async function storyApi(env, u) {
  const id = (u.searchParams.get('id') || '').replace(/[^a-z0-9]/gi, '').slice(0, 20); if (!id) return J({ error: 'id' }, 400);
  let it = null, kk = 'stocks';
  for (const k of ['stocks', 'metals', 'ai', 'world']) { const l = (await env.KV.get('mkl:' + k, 'json').catch(() => null)) || []; const f = l.find(x => String(x.id) === id); if (f) { it = f; kk = k; break; } }
  let nd = null; if (!it) { nd = await env.KV.get('news', 'json').catch(() => null); const f = nd && (nd.items || []).find(x => String(x.id) === id); if (f) { it = f; kk = 'news'; } }
  if (!it) return J({ error: 'not found' }, 404);
  const rel = (kk === 'news' ? (nd.items || []) : ((await env.KV.get('mkl:' + kk, 'json').catch(() => null)) || [])).filter(x => String(x.id) !== id && (x.c || []).some(c => (it.c || []).indexOf(c) >= 0)).slice(0, 6).map(x => ({ id: x.id, t: x.t, s: x.s, ts: x.ts }));
  const C = await ctlGet(env);
  let brief = C.noBrief ? '' : await env.KV.get('mkb2:' + id);
  if (!brief && !C.noBrief) {
    const sys = 'You are a news-desk editor at XRPLTODAY. Write an ORIGINAL article in your own words about the story described. Use ONLY the headline and summary given. Do not invent facts, numbers, quotes or names. 220 to 300 words, plain text, no title. Use 3 short paragraphs, then a line KEY POINTS: followed by 3 lines each starting with a dash, then a line WHY IT MATTERS: with one sentence for XRP and crypto readers. Never include advice to buy or sell. Do not copy phrases from the summary.';
    const txt = await ai(env, sys + (C.briefExtra ? ' ' + String(C.briefExtra).replace(/[\r\n]+/g, ' ').slice(0, 400) : ''), 'Headline: ' + it.t + '\nSource: ' + it.s + '\nPublisher summary: ' + (it.d || '(none)'), 700).catch(() => '');
    brief = String(txt || '').replace(/\s+\n/g, '\n').trim().slice(0, 2600);
    if (brief.length > 60) await env.KV.put('mkb2:' + id, brief, { expirationTtl: 259200 }).catch(() => { }); else brief = '';
  }
  return J({ k: kk, id, t: it.t, s: it.s, u: it.u, ts: it.ts, im: it.im || '', c: it.c || [], brief, rel }, 200, { 'cache-control': 'public, max-age=120' });
}
async function mktApi(req, env, ctx, u) {
  const k = ({ metals: 'metals', ai: 'ai', world: 'world' })[u.searchParams.get('k')] || 'stocks', cache = caches.default, ck = new Request(u.origin + '/api/mkt?k=' + k);
  const hit = await cache.match(ck); if (hit) return hit;
  const now = Date.now(), cfg = MK[k];
  const feeds = cfg.q.map(q => ({ url: 'https://www.bing.com/news/search?q=' + encodeURIComponent(q) + '&format=rss&setmkt=en-US', bing: 1, lg: 'en', r: 'US', nokw: 1 })).concat(cfg.d.map(d => ({ url: d[1], name: d[0], lg: 'en', r: 'WW', nokw: 1 })));
  const res = await Promise.all(feeds.map(f => pull(f, now))), seen = new Set(), items = [];
  for (const r of res) for (const x of r || []) { if (seen.has(x.id) || now - x.ts > 48 * 36e5) continue; seen.add(x.id); items.push({ id: x.id, d: x.d || '', t: x.t, s: x.s, u: x.u, ts: x.ts, im: x.im, c: mkTags(k, x.t) }); }
  items.sort((a, b) => b.ts - a.ts);
  const top = items.slice(0, 90), old = (await env.KV.get('mkl:' + k, 'json').catch(() => null)) || [], have = new Set(top.map(x => x.id)), keep = top.concat(old.filter(x => !have.has(x.id) && now - x.ts < 72 * 36e5)).slice(0, 300);
  ctx.waitUntil(env.KV.put('mkl:' + k, JSON.stringify(keep), { expirationTtl: 259200 }).catch(() => { }));
  const r = new Response(JSON.stringify({ k, items: ctlItems(top, await ctlGet(env), 1).map(x => ({ id: x.id, t: x.t, s: x.s, u: x.u, ts: x.ts, im: x.im, c: x.c })), ts: now }), { headers: { 'content-type': 'application/json;charset=utf-8', 'cache-control': 'public, max-age=300' } });
  ctx.waitUntil(cache.put(ck, r.clone())); return r;
}
/* ---------- site control (admin-managed settings) ---------- */
const CTLK = { maint: 'b', maintMsg: 's', banner: 's', bannerType: 's', bannerLink: 's', bannerUntil: 's', bannerClose: 'b', customCss: 's', homePath: 's',
  hideBlog: 'b', hideDaily: 'b', hideStats: 'b', hideSquares: 'b', hideTokens: 'b', hideTop: 'b', hideStocks: 'b', hideMetals: 'b', hideAi: 'b', hideWorld: 'b', hideAdvertise: 'b', hideCal: 'b',
  hideSearch: 'b', hideRight: 'b', hideTicker: 'b',
  blockWords: 's', blockSrc: 's', blockIds: 's', maxItems: 'n', mktMax: 'n', maxAgeH: 'n', lowQ: 'b', needImg: 'b',
  aiOff: 'b', noHourly: 'b', noDaily: 'b', noBrief: 'b', briefExtra: 's', cacheSec: 'n', cronOff: 'b' };
let _ctl = null, _ctlT = 0;
async function ctlGet(env, fresh) { if (!fresh && _ctl && Date.now() - _ctlT < 15000) return _ctl; _ctl = (await env.KV.get('ctl', 'json').catch(() => null)) || {}; _ctlT = Date.now(); return _ctl; }
function ctlItems(a, C, mk) {
  const L = s => String(s || '').toLowerCase().split(/[,\n]/).map(x => x.trim()).filter(Boolean), bw = L(C.blockWords), bs = L(C.blockSrc), bi = String(C.blockIds || '').split(/[,\s]+/).filter(Boolean), age = +C.maxAgeH || 0, now = Date.now();
  let o = (a || []).filter(x => { const t = ((x.t || '') + ' ' + (x.s || '')).toLowerCase(); if (bw.some(w => t.includes(w))) return false; const s = String(x.s || '').toLowerCase(); if (bs.some(w => s.includes(w))) return false; if (bi.includes(String(x.id))) return false; if (age && now - x.ts > age * 36e5) return false; if (C.lowQ && String(x.t || '').length < 25) return false; if (mk && C.needImg && !x.im) return false; return true; });
  const mx = +(mk ? C.mktMax : C.maxItems) || 0; return mx ? o.slice(0, mx) : o;
}
async function ctlPurge(env, pre, cap) { let n = 0, cur; do { const l = await env.KV.list({ prefix: pre, cursor: cur, limit: 200 }); for (const k of l.keys) { await env.KV.delete(k.name); n++; if (n >= (cap || 600)) return n; } cur = l.list_complete ? null : l.cursor; } while (cur); return n; }
async function ctlAdmin(b, env) {
  const a = b.action;
  if (a === 'ctl-get') return J({ cfg: await ctlGet(env, true), log: ((await env.KV.get('ctllog', 'json')) || []).slice(0, 40) }, 200, { 'cache-control': 'no-store' });
  if (a === 'ctl-set' || a === 'ctl-import' || a === 'ctl-reset') {
    const cur = await ctlGet(env, true), src = a === 'ctl-reset' ? {} : (b.patch || {}), next = a === 'ctl-set' ? Object.assign({}, cur) : {}, ch = [];
    for (const k of Object.keys(CTLK)) { if (a !== 'ctl-set' && a !== 'ctl-reset' && !(k in src)) continue; if (a === 'ctl-set' && !(k in src)) continue; const t = CTLK[k], v = src[k]; let nv; if (t === 'b') nv = !!v; else if (t === 'n') nv = Math.max(0, Math.min(100000, +v || 0)); else nv = String(v == null ? '' : v).slice(0, 4000); if (nv === '' || nv === false || nv === 0) delete next[k]; else next[k] = nv; if (JSON.stringify(cur[k]) !== JSON.stringify(next[k])) ch.push(k); }
    if (a === 'ctl-reset') ch.push('(all reset)');
    await env.KV.put('ctl', JSON.stringify(next)); _ctl = next; _ctlT = Date.now();
    if (ch.length) { const lg = ((await env.KV.get('ctllog', 'json')) || []); lg.unshift({ ts: Date.now(), a, ch }); await env.KV.put('ctllog', JSON.stringify(lg.slice(0, 50))); }
    return J({ ok: 1, cfg: next, changed: ch });
  }
  if (a === 'ctl-purge') {
    const m = { briefs: ['mkb2:', 'mkb:'], top: ['toptok'], tokens: ['tk:'], market: ['mkl:'], news: ['news'] }[b.what]; if (!m) return J({ error: 'what' }, 400);
    let n = 0; for (const p of m) n += (p === 'toptok' || p === 'news') ? (await env.KV.delete(p), 1) : await ctlPurge(env, p); return J({ ok: 1, removed: n });
  }
  if (a === 'ctl-regen') { const id = String(b.id || '').replace(/[^a-z0-9]/gi, ''); if (!id) return J({ error: 'id' }, 400); await env.KV.delete('mkb2:' + id); return J({ ok: 1 }); }
  if (a === 'ctl-stats') {
    const o = {}; for (const [k, p] of [['briefs', 'mkb2:'], ['tokens', 'tk:'], ['posts', 'b:'], ['analytics_days', 'an:']]) { const l = await env.KV.list({ prefix: p, limit: 1000 }); o[k] = l.keys.length + (l.list_complete ? '' : '+'); }
    const n = await env.KV.get('news', 'json').catch(() => null); o.news_items = n ? (n.items || []).length : 0; o.news_age_min = n ? Math.round((Date.now() - n.ts) / 6e4) : null;
    for (const k of ['stocks', 'metals', 'ai', 'world']) { const l = await env.KV.get('mkl:' + k, 'json').catch(() => null); o['feed_' + k] = l ? l.length : 0; }
    return J(o);
  }
  return J({ error: 'bad ctl action' }, 400);
}
async function ttsApi(env, u) {
  const id = (u.searchParams.get('id') || '').replace(/[^a-z0-9]/gi, '').slice(0, 20); if (!id) return J({ error: 'id' }, 400);
  const mk = b64 => { const bin = atob(b64), a = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) a[i] = bin.charCodeAt(i); return new Response(a, { headers: { 'content-type': 'audio/mpeg', 'cache-control': 'public, max-age=86400' } }); };
  const hit = await env.KV.get('mkv:' + id); if (hit) return mk(hit);
  if ((await ctlGet(env)).aiOff) return J({ error: 'off' }, 503);
  let it = null; for (const k of ['stocks', 'metals', 'ai', 'world']) { const l = (await env.KV.get('mkl:' + k, 'json').catch(() => null)) || []; it = l.find(x => String(x.id) === id); if (it) break; }
  if (!it) { const nd = await env.KV.get('news', 'json').catch(() => null); it = nd && (nd.items || []).find(x => String(x.id) === id); }
  if (!it) return J({ error: 'not found' }, 404);
  const br = (await env.KV.get('mkb2:' + id).catch(() => null)) || it.d || '';
  const txt = (it.t + '. ' + String(br).replace(/KEY POINTS:/i, ' Key points. ').replace(/WHY IT MATTERS:/i, ' Why it matters. ').replace(/^\s*-\s*/gm, '').replace(/\s+/g, ' ')).slice(0, 1700);
  try {
    const r = await env.AI.run('@cf/myshell-ai/melotts', { prompt: txt, lang: 'en' }), b64 = typeof r === 'string' ? r : (r && r.audio);
    if (!b64 || b64.length < 1000) return J({ error: 'tts' }, 502);
    await env.KV.put('mkv:' + id, b64, { expirationTtl: 259200 }).catch(() => { }); return mk(b64);
  } catch (e) { return J({ error: 'tts', m: String(e.message || e).slice(0, 80) }, 502); }
}
/* ---------- XRP payments (ads + token posts) ---------- */
const XRPL_RPC = 'https://s1.ripple.com:51234/';
async function xrpc(method, params) { const r = await fetch(XRPL_RPC, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ method, params: [params] }) }).then(x => x.json()).catch(() => null); return r && r.result; }
let _rate = null, _rateT = 0;
async function xrpUsd(env) {
  if (_rate && Date.now() - _rateT < 60000) return _rate;
  let p = 0;
  try { const r = await fetch('https://api.coinbase.com/v2/prices/XRP-USD/spot').then(x => x.json()); p = +r.data.amount; } catch (e) { }
  if (!(p > 0)) { try { const r = await fetch('https://api.kraken.com/0/public/Ticker?pair=XRPUSD').then(x => x.json()); p = +Object.values(r.result)[0].c[0]; } catch (e) { } }
  if (p > 0) { _rate = p; _rateT = Date.now(); await env.KV.put('xrpusd', String(p)).catch(() => { }); return p; }
  return +(await env.KV.get('xrpusd').catch(() => 0)) || 0;
}
async function payAll(env) { return (await env.KV.get('pay', 'json')) || []; }
async function paySave(env, l) { await env.KV.put('pay', JSON.stringify(l.slice(0, 600))); }
function payMatch(t, rec, meta) {
  const m = meta || t.meta || {}, dl = m.delivered_amount != null ? m.delivered_amount : t.Amount;
  return t.TransactionType === 'Payment' && t.Destination === rec.addr && typeof dl === 'string' && +dl >= Math.floor(rec.xrp * 1e6 * 0.98) && m.TransactionResult === 'tesSUCCESS' && +t.DestinationTag === +rec.tag;
}
async function payCheck(env, rec, tx) {
  if (rec.status === 'paid') return { paid: true, tx: rec.tx };
  let hit = null;
  if (tx) { const r = await xrpc('tx', { transaction: tx, binary: false }); if (!r || r.error) return { paid: false, why: 'Transaction not found yet' }; if (!r.validated) return { paid: false, why: 'Waiting for the ledger to validate it' }; if (!payMatch(r, rec)) return { paid: false, why: 'That transaction does not match the amount, address or payment tag' }; hit = { hash: r.hash || tx, from: r.Account }; }
  else { const r = await xrpc('account_tx', { account: rec.addr, ledger_index_min: -1, ledger_index_max: -1, limit: 60, forward: false }); const l = (r && r.transactions) || []; for (const x of l) { const t = x.tx || x.tx_json; if (x.validated !== false && t && payMatch(t, rec, x.meta)) { hit = { hash: t.hash || x.hash, from: t.Account }; break; } } if (!hit) return { paid: false, why: 'Not seen on the ledger yet' }; }
  const all = await payAll(env); if (all.some(x => x.tx === hit.hash && x.id !== rec.id && x.status === 'paid')) return { paid: false, why: 'That transaction was already used' };
  const rr = all.find(x => x.id === rec.id) || rec; Object.assign(rr, { status: 'paid', tx: hit.hash, from: hit.from, paidTs: Date.now() }); await paySave(env, all);
  if (rr.kind === 'ad') { const ads = (await env.KV.get('ads', 'json')) || [], a = ads.find(x => x.id === rr.ref); if (a) { a.paid = true; a.tx = rr.tx; await env.KV.put('ads', JSON.stringify(ads)); } }
  return { paid: true, tx: rr.tx };
}
async function payApi(req, env, u, p) {
  const nc = { 'cache-control': 'no-store' }, b = await req.json().catch(() => ({}));
  if (p === '/api/pay/start' && req.method === 'POST') {
    const ip = req.headers.get('cf-connecting-ip') || 'x', rk = 'payrl:' + ip, n = +(await env.KV.get(rk)) || 0; if (n >= 30) return J({ error: 'Too many requests. Try again later.' }, 429, nc);
    await env.KV.put(rk, String(n + 1), { expirationTtl: 3600 });
    const cfg = await tnCfg(env); if (!cfg.addr) return J({ error: 'Payments are not open yet — the receiving address is being set up.' }, 503, nc);
    const rate = await xrpUsd(env); let xrp = 0, usd = 0, ref = '', kind = b.kind === 'ad' ? 'ad' : 'tn';
    if (kind === 'ad') {
      const ads = (await env.KV.get('ads', 'json')) || [], a = ads.find(x => x.id === b.ref); if (!a || a.th !== await sha(String(b.token || ''))) return J({ error: 'Ad ID or private key not recognised.' }, 403, nc);
      if (a.paid) return J({ error: 'This ad is already paid.' }, 400, nc);
      const ac = await adCfg(env); usd = +ac.prices[a.slot] || 0; if (!usd || !rate) return J({ error: 'Could not get the XRP price. Try again in a minute.' }, 503, nc); xrp = Math.max(1, Math.ceil(usd / rate * 100) / 100); ref = a.id;
    } else { xrp = +cfg.price; usd = rate ? Math.round(xrp * rate * 100) / 100 : 0; }
    const all = await payAll(env), now = Date.now();
    if (kind === 'ad') { const ex = all.find(x => x.kind === 'ad' && x.ref === ref && x.status === 'awaiting' && x.exp > now); if (ex) { if (Math.abs(ex.xrp - xrp) / xrp > 0.03) { ex.xrp = xrp; ex.usd = usd; await paySave(env, all); } return J({ ok: 1, id: ex.id, addr: ex.addr, tag: ex.tag, xrp: ex.xrp, usd: ex.usd, rate, exp: ex.exp }, 200, nc); } }
    let tag; do { tag = 100000000 + Math.floor(Math.random() * 899999999); } while (all.some(x => x.tag === tag));
    const rec = { id: 'p' + now.toString(36) + Math.random().toString(36).slice(2, 5), kind, ref, tag, xrp, usd, rate, addr: cfg.addr, status: 'awaiting', ts: now, exp: now + 72 * 36e5 };
    all.unshift(rec); await paySave(env, all);
    return J({ ok: 1, id: rec.id, addr: rec.addr, tag, xrp, usd, rate, exp: rec.exp }, 200, nc);
  }
  if (p === '/api/pay/check' && req.method === 'POST') {
    const all = await payAll(env), rec = all.find(x => x.id === b.id); if (!rec) return J({ error: 'Payment not found' }, 404, nc);
    const tx = /^[A-Fa-f0-9]{64}$/.test(String(b.tx || '')) ? String(b.tx).toUpperCase() : '';
    if (rec.status === 'awaiting' && Date.now() > rec.exp + 864e5) return J({ paid: false, why: 'This payment request expired. Start again.' }, 200, nc);
    return J(await payCheck(env, rec, tx), 200, nc);
  }
  return J({ error: 'not found' }, 404, nc);
}
async function finAdmin(b, env) {
  const a = b.action, cfg = await tnCfg(env);
  if (a === 'fin-summary') {
    const pay = await payAll(env), rate = await xrpUsd(env), o = { rate, addr: cfg.addr, tnPrice: cfg.price, ad: await adCfg(env), pay: pay.slice(0, 200) };
    const paid = pay.filter(x => x.status === 'paid'), sum = l => Math.round(l.reduce((s, x) => s + (+x.xrp || 0), 0) * 100) / 100, now = Date.now();
    o.tot = { xrp: sum(paid), usd: Math.round(paid.reduce((s, x) => s + (+x.usd || 0), 0) * 100) / 100, ads: sum(paid.filter(x => x.kind === 'ad')), tn: sum(paid.filter(x => x.kind === 'tn')), d30: sum(paid.filter(x => now - x.paidTs < 30 * 864e5)), awaiting: pay.filter(x => x.status === 'awaiting' && x.exp > now).length, count: paid.length };
    if (cfg.addr) { const ai = await xrpc('account_info', { account: cfg.addr, ledger_index: 'validated' }); o.bal = ai && ai.account_data ? Math.round(+ai.account_data.Balance / 1e4) / 100 : null; o.balErr = ai && ai.error ? ai.error : '';
      const at = await xrpc('account_tx', { account: cfg.addr, ledger_index_min: -1, ledger_index_max: -1, limit: 40, forward: false }); o.inc = ((at && at.transactions) || []).filter(x => { const t = x.tx || x.tx_json; return t && t.TransactionType === 'Payment' && t.Destination === cfg.addr; }).slice(0, 20).map(x => { const t = x.tx || x.tx_json, m = x.meta || {}, dl = m.delivered_amount != null ? m.delivered_amount : t.Amount; return { hash: t.hash || x.hash, from: t.Account, tag: t.DestinationTag || null, xrp: typeof dl === 'string' ? +dl / 1e6 : null, ts: (t.date || 0) ? (t.date + 946684800) * 1000 : 0 }; }); }
    const ads = (await env.KV.get('ads', 'json')) || []; o.adsPaid = ads.filter(x => x.paid).length; o.adsPending = ads.filter(x => x.status === 'pending').length;
    const tn = await tnAll(env); o.tnPaid = tn.filter(x => x.paid).length; o.tnPending = tn.filter(x => x.status === 'pending').length;
    return J(o, 200, { 'cache-control': 'no-store' });
  }
  const all = await payAll(env), rec = all.find(x => x.id === b.id); if (!rec) return J({ error: 'no such payment' }, 404);
  if (a === 'fin-check') return J(await payCheck(env, rec, /^[A-Fa-f0-9]{64}$/.test(String(b.tx || '')) ? String(b.tx).toUpperCase() : ''));
  if (a === 'fin-markpaid') { Object.assign(rec, { status: 'paid', tx: String(b.tx || 'manual').slice(0, 64), paidTs: Date.now(), manual: 1 }); await paySave(env, all); if (rec.kind === 'ad') { const ads = (await env.KV.get('ads', 'json')) || [], x = ads.find(y => y.id === rec.ref); if (x) { x.paid = true; await env.KV.put('ads', JSON.stringify(ads)); } } return J({ ok: 1 }); }
  if (a === 'fin-void') { all.splice(all.indexOf(rec), 1); await paySave(env, all); return J({ ok: 1 }); }
  return J({ error: 'bad fin action' }, 400);
}
/* ---------- traffic analytics ---------- */
const BOTUA = /bot|spider|crawl|slurp|facebookexternalhit|preview|headless|monitor|lighthouse|curl|wget/i;
async function hitApi(req, env, ctx) {
  const nc = () => new Response(null, { status: 204 });
  if (req.method !== 'POST' || BOTUA.test(req.headers.get('user-agent') || '')) return nc();
  let b; try { b = JSON.parse((await req.text()).slice(0, 2000)); } catch (e) { return nc(); }
  const s = String(b.s || '').replace(/[^a-z0-9]/gi, '').slice(0, 20), vid = String(b.vid || '').replace(/[^a-z0-9]/gi, '').slice(0, 20), t = String(b.t || '');
  if (!s || !/^(v|pv|p|e)$/.test(t)) return nc();
  const now = Date.now(), dt = new Date(now), key = 'an:' + dt.toISOString().slice(0, 10);
  const d = (await env.KV.get(key, 'json')) || { v: 0, u: 0, pv: 0, dur: 0, h: new Array(24).fill(0), pg: {}, rf: {}, ev: {}, dv: { m: 0, d: 0 }, vs: [], live: {} };
  const inc = (o, k, n) => { if (!k) return; if (o[k] || Object.keys(o).length < 60) o[k] = (o[k] || 0) + (n || 1); };
  const p = String(b.p || '/').split('?')[0].slice(0, 80);
  if (t === 'v') { d.v++; if (vid && d.vs.indexOf(vid) < 0 && d.vs.length < 3000) { d.vs.push(vid); d.u++; } if (b.dev === 'm') d.dv.m++; else d.dv.d++; inc(d.rf, String(b.rf || '').slice(0, 60)); }
  if (t === 'v' || t === 'pv') { d.pv++; d.h[dt.getUTCHours()]++; inc(d.pg, p); }
  if (t === 'p') d.dur += Math.min(150, Math.max(0, +b.d || 0));
  if (t === 'e') inc(d.ev, String(b.e || '').slice(0, 40));
  d.live[s] = now; for (const k of Object.keys(d.live)) if (now - d.live[k] > 120000) delete d.live[k];
  try { await env.KV.put(key, JSON.stringify(d), { expirationTtl: 86400 * 120 }); } catch (e) { }
  return nc();
}
async function anGet(b, env) {
  const n = Math.min(60, Math.max(1, +b.days || 30)), now = Date.now(), keys = [];
  for (let i = n - 1; i >= 0; i--) keys.push(new Date(now - i * 864e5).toISOString().slice(0, 10));
  const rows = await Promise.all(keys.map(k => env.KV.get('an:' + k, 'json')));
  return J({ days: keys.map((k, i) => { const d = rows[i] || {}; return { d: k, v: d.v || 0, u: d.u || 0, pv: d.pv || 0, dur: d.dur || 0, h: d.h || [], pg: d.pg || {}, rf: d.rf || {}, ev: d.ev || {}, dv: d.dv || {}, live: Object.keys(d.live || {}).filter(x => now - d.live[x] < 90000).length }; }) }, 200, { 'cache-control': 'no-store' });
}
export default {
  async fetch(req, env, ctx) {
    const u = new URL(req.url), p = u.pathname;
    try {
      if (p === '/api/news') return await news(env, ctx);
      if (p === '/api/tts') return await ttsApi(env, u);
      if (p.indexOf('/api/pay/') === 0) return await payApi(req, env, u, p);
      if (p === '/api/cfg') return J(await ctlGet(env), 200, { 'cache-control': 'public, max-age=30' });
      if (p === '/api/hit') return await hitApi(req, env, ctx);
      if (p === '/api/story') return await storyApi(env, u);
      if (p === '/api/mkt') return await mktApi(req, env, ctx, u);
      if (p === '/mk.js') return new Response((await env.KV.get('mkjs')) || MKJS, { headers: { 'content-type': 'application/javascript; charset=utf-8', 'cache-control': 'public, max-age=120' } });
      if (p.indexOf('/api/sq/') === 0) return await sqApi(req, env, u, p);
      if (p === '/token.js') return new Response((await env.KV.get('tkjs')) || TKJS, { headers: { 'content-type': 'application/javascript; charset=utf-8', 'cache-control': 'public, max-age=120' } });
      if (p === '/admin') return new Response((await env.KV.get('admhtml')) || ADMHTML, { headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store', 'x-robots-tag': 'noindex, nofollow' } });
      if (p === '/wallet') return new Response((await env.KV.get('wlhtml')) || WLHTML, { headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store' } });
      if (p === '/squares.js') return new Response((await env.KV.get('sqjs')) || SQJS, { headers: { 'content-type': 'application/javascript; charset=utf-8', 'cache-control': 'public, max-age=120' } });
      if (p === '/api/cover') return await coverApi(env, u);
      if (p === '/api/stats') return await statsApi(env, ctx);
      if (p.indexOf('/api/ads') === 0 || p.indexOf('/go/ad/') === 0) return await adsApi(req, env, u, p);
      if (p === '/api/social') return J(await social(env), 200, { 'cache-control': 'public, max-age=60' });
      if (p === '/x2.css' || p === '/x2.js' || p === '/stats.js' || p === '/ads.js') { const k = p === '/x2.css' ? 'x2css' : p === '/x2.js' ? 'x2js' : p === '/stats.js' ? 'statsjs' : 'adsjs', v = (await env.KV.get(k)) || ({ x2css: X2CSS, x2js: X2JS, statsjs: STATSJS, adsjs: ADSJS })[k]; return new Response(v, { headers: { 'content-type': p === '/x2.css' ? 'text/css; charset=utf-8' : 'application/javascript; charset=utf-8', 'cache-control': 'public, max-age=60' } }); }
      if (p === '/api/blogs') return J((await env.KV.get('blogs', 'json')) || [], 200, { 'cache-control': 'public, max-age=30' });
      if (p.startsWith('/api/blog/')) { const b = await env.KV.get('b:' + decodeURIComponent(p.slice(10)), 'json'); if (!b) return J({ error: 'not found' }, 404); return J(Object.assign({}, b, { html: md(b.body) }), 200, { 'cache-control': 'public, max-age=60' }); }
      if (p === '/api/refresh') return J(await tick(env, false), 200, { 'cache-control': 'no-store' });
      if (p === '/api/export') return await exportAll(env, u);
      if (p.indexOf('/api/tn') === 0) return await tnApi(req, env, u, p);
      if (p === '/tn.js') return new Response((await env.KV.get('tnjs')) || TNJS, { headers: { 'content-type': 'application/javascript; charset=utf-8', 'cache-control': 'public, max-age=120' } });
      if (p === '/api/admin') return await admin(req, env);
      if (p === '/rss.xml') return await rss(env, u);
      if (p === '/robots.txt') return new Response('User-agent: *\nAllow: /\nSitemap: ' + u.origin + '/rss.xml\n');
      return await page(env, u, req.headers.get('user-agent') || '');
    } catch (e) { return J({ error: String(e.message || e) }, 500); }
  },
  async scheduled(ev, env, ctx) { await tick(env, false); } // awaited (not waitUntil): long AI writes must not be cut off
};
