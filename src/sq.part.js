/* ---- XRPL Squares: token data proxy (xrpl.to) ---- */
const SQ_UA = { 'user-agent': 'XRPLTODAY/1.0 (+squares)', accept: 'application/json' };
async function sqGet(path, ttl) { const r = await fetch('https://api.xrpl.to' + path, { headers: SQ_UA, cf: { cacheTtl: ttl || 60, cacheEverything: true } }); if (!r.ok) throw new Error('upstream ' + r.status); return r.json(); }
async function sqApi(req, env, u, p) {
  const H = { 'cache-control': 'public, max-age=30' }, q = u.searchParams;
  try {
    if (p === '/api/sq/ohlc') { const md5 = (q.get('md5') || '').replace(/[^a-f0-9]/gi, '').slice(0, 40), i = ['5m', '15m', '1h', '4h', '1d'].includes(q.get('i')) ? q.get('i') : '1h', n = Math.max(10, Math.min(300, +q.get('n') || 96)); if (!md5) return J({ error: 'md5' }, 400); const d = await sqGet('/v1/ohlc/' + md5 + '?interval=' + i + '&limit=' + n, 45); return J({ ohlc: d.ohlc || [] }, 200, H); }
    if (p === '/api/sq/token') { const s = (q.get('slug') || '').replace(/[^A-Za-z0-9_.\-]/g, '').slice(0, 120); if (!s) return J({ error: 'slug' }, 400); const d = await sqGet('/v1/token/' + s, 60); return J({ token: d.token || null }, 200, H); }
    if (p === '/api/sq/tokens') { const ok = ['vol24hxrp', 'pro24h', 'marketcap', 'holders', 'trendingScore', 'dateon', 'pro7d', 'vol24h'], sort = ok.includes(q.get('sort')) ? q.get('sort') : 'vol24hxrp', dir = q.get('dir') === 'asc' ? 'asc' : 'desc', lim = Math.max(1, Math.min(200, +q.get('limit') || 100)), st = Math.max(0, +q.get('start') || 0); const d = await sqGet('/v1/tokens?start=' + st + '&limit=' + lim + '&sortBy=' + sort + '&sortType=' + dir, 60); return J({ tokens: d.tokens || [], total: d.total || 0 }, 200, H); }
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
