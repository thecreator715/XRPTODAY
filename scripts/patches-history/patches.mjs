// Patch set v2: Bing News (Google blocks Workers), Kraken prices, direct rippled ledger info, Workers AI response shape
const NEW_GL = String.raw`const GL = [['US', 'en-US', 'en'], ['GB', 'en-GB', 'en'], ['IN', 'en-IN', 'en'], ['AU', 'en-AU', 'en'], ['CA', 'en-CA', 'en'], ['ZA', 'en-ZA', 'en'],
  ['JP', 'ja-JP', 'ja'], ['KR', 'ko-KR', 'ko'], ['DE', 'de-DE', 'de'], ['FR', 'fr-FR', 'fr'], ['MX', 'es-MX', 'es'], ['ES', 'es-ES', 'es'], ['BR', 'pt-BR', 'pt'], ['TR', 'tr-TR', 'tr'], ['IT', 'it-IT', 'it'],
  ['ID', 'id-ID', 'id'], ['VN', 'vi-VN', 'vi'], ['TH', 'th-TH', 'th'], ['RU', 'ru-RU', 'ru'], ['NL', 'nl-NL', 'nl'], ['CN', 'zh-CN', 'zh']];
const DIRECT = [['CoinDesk', 'https://www.coindesk.com/arc/outboundfeeds/rss/'], ['Cointelegraph', 'https://cointelegraph.com/rss'], ['Decrypt', 'https://decrypt.co/feed'], ['CryptoSlate', 'https://cryptoslate.com/feed/'],
  ['U.Today', 'https://u.today/rss'], ['BeInCrypto', 'https://beincrypto.com/feed/'], ['Cryptonews', 'https://cryptonews.com/news/feed/'], ['CryptoPotato', 'https://cryptopotato.com/feed/'], ['Bitcoinist', 'https://bitcoinist.com/feed/'],
  ['Crypto.news', 'https://crypto.news/feed/'], ['The Crypto Basic', 'https://thecryptobasic.com/feed/'], ['ZyCrypto', 'https://zycrypto.com/feed/'], ['Finbold', 'https://finbold.com/feed/'],
  ['BeInCrypto RU', 'https://ru.beincrypto.com/feed/', 'RU', 'ru'], ['BeInCrypto ES', 'https://es.beincrypto.com/feed/', 'ES', 'es']];
const KWE = /xrp|rlusd|garlinghouse|ripple (labs|ceo|cto|lawsuit|case|stablecoin|payments|net|usd)|ripplenet/i;
`;
const NEW_FEEDLIST = String.raw`function feedList() {
  const b = (q, mk, r, lg) => ({ url: 'https://www.bing.com/news/search?q=' + encodeURIComponent(q) + '&format=rss&setmkt=' + mk, r, lg, bing: 1 });
  const qEn = 'XRP OR XRPL OR RLUSD OR "XRP Ledger" OR "Ripple Labs"', qLo = 'XRP OR RLUSD OR Ripple';
  const l = GL.map(x => b(x[2] === 'en' ? qEn : qLo, x[1], x[0], x[2]));
  l.push(b('RLUSD stablecoin', 'en-US', 'US', 'en'));
  for (const d of DIRECT) l.push({ url: d[1], r: d[2] || 'WW', lg: d[3] || 'en', name: d[0] });
  return l;
}
`;
const NEW_PARSE = String.raw`function parseRss(xml, f, now) {
  const out = [], re = /<item[\s>]([\s\S]*?)<\/item>/gi, kw = f.lg === 'en' ? KWE : KW; let m;
  while ((m = re.exec(xml))) {
    const b = m[1]; let t = dec(tag(b, 'title')).replace(/<[^>]+>/g, '').trim(), u = dec(tag(b, 'link')) || (b.match(/<link[^>]*href="([^"]+)"/) || [])[1];
    const ts = Date.parse(tag(b, 'pubDate') || tag(b, 'dc:date') || ''); if (!t || !u || isNaN(ts) || ts > now + 6e5 || now - ts > TTL) continue;
    const s = f.name || dec(tag(b, 'News:Source')) || 'News';
    if (f.bing) { const mm = u.match(/[?&]url=([^&]+)/); if (mm) { try { u = decodeURIComponent(mm[1]); } catch (e) { } } }
    if (!kw.test(t + ' ' + dec(tag(b, 'description')).replace(/<[^>]+>/g, '').slice(0, 400))) continue;
    out.push({ id: hash(t.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, '')), t, s, u, ts, r: f.r, g: f.lg !== 'en' ? 1 : 0 });
  }
  return out;
}
`;
const NEW_MARKET = String.raw`async function market() {
  const K = async u => { const r = await fetch(u, { headers: UA, signal: AbortSignal.timeout(8000) }); const j = await r.json(); if (j.error && j.error.length) throw new Error('kraken'); return j.result; };
  try {
    const [t, o, rl] = await Promise.all([K('https://api.kraken.com/0/public/Ticker?pair=XRPUSD,XBTUSD'), K('https://api.kraken.com/0/public/OHLC?pair=XRPUSD&interval=240'), K('https://api.kraken.com/0/public/Ticker?pair=RLUSDUSD').catch(() => null)]);
    const mk = (id, x, sp) => { const p = +x.c[0], op = +x.o; return { id, p, c1: null, c24: op ? (p - op) / op * 100 : null, c7: sp && sp.length > 1 ? (p - sp[0]) / sp[0] * 100 : null, mc: null, v: +x.v[1] * +x.p[1], sp: sp || [] }; };
    const key = n => Object.keys(t).find(k => k.indexOf(n) >= 0), ox = o[Object.keys(o).find(k => k !== 'last')], sp = ox.slice(-42).map(c => +(+c[4]).toFixed(5));
    const out = [mk('ripple', t[key('XRP')], sp), mk('bitcoin', t[key('XBT')], null)];
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
`;
function rep(s, a, b, r) { const i = s.indexOf(a), j = s.indexOf(b, i + a.length); if (i < 0 || j < 0) throw new Error('marker missing: ' + a); return s.slice(0, i) + r + s.slice(j); }
function must(s, a, b) { if (s.indexOf(a) < 0) throw new Error('missing: ' + a); return s.replace(a, () => b); }
export function patchSrc(src) {
  src = rep(src, 'const GL = [', 'const KW = ', NEW_GL);
  src = rep(src, 'function feedList() {', 'function parseRss(', NEW_FEEDLIST);
  src = rep(src, 'function parseRss(', 'async function pull(', NEW_PARSE);
  src = rep(src, 'async function market() {', 'async function refresh(', NEW_MARKET);
  src = must(src, "const t = r && (r.response || (r.result && r.result.response));", "const t = r && (r.response || (r.choices && r.choices[0] && r.choices[0].message && r.choices[0].message.content) || (r.result && r.result.response));");
  src = must(src, "['@cf/meta/llama-3.3-70b-instruct-fp8-fast', '@cf/meta/llama-3.1-8b-instruct']", "['@cf/meta/llama-3.3-70b-instruct-fp8-fast', '@cf/meta/llama-3.3-70b-instruct-fp8-fast']");
  return src;
}
export function patchHtml(h) {
  h = must(h, '22 regions', '21 regions');
  h = must(h, "money(r.p,4)+' · '+big(r.mc)+", "money(r.p,4)+(r.mc?' · '+big(r.mc):'')+");
  h = must(h, "<div><small>MARKET CAP</small><b class=\"mono\">'+big(x.mc)+'</b></div>", "<div><small>7D RANGE</small><b class=\"mono\">'+(x.sp&&x.sp.length?money(Math.min.apply(null,x.sp),3)+' – '+money(Math.max.apply(null,x.sp),3):'—')+'</b></div>");
  return h;
}
