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
