/* ---------- XRPL token news submissions (paid, admin-approved) ---------- */
async function tnCfg(env) { return Object.assign({ addr: '', price: 50 }, (await env.KV.get('tncfg', 'json')) || {}); }
async function tnAll(env) { return (await env.KV.get('tn', 'json')) || []; }
function tnPub(s) { return { id: s.id, slug: s.slug, title: s.title, token: s.token, tslug: s.tslug || '', link: s.link || '', ts: s.apr || s.ts, ex: String(s.body).replace(/\s+/g, ' ').slice(0, 180) }; }
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
    const s = { title: S(b.title, 120), token: S(b.token, 40), tslug: S(b.tslug, 120).replace(/[^A-Za-z0-9_.\-]/g, ''), link: S(b.link, 300), email: S(b.email, 120), tx: S(b.tx, 64).toLowerCase(), body: S(b.body, 6000), name: S(b.name, 80) };
    if (s.title.length < 8) return J({ error: 'Title must be at least 8 characters.' }, 400, nc);
    if (!s.token) return J({ error: 'Token name is required.' }, 400, nc);
    if (s.body.length < 150) return J({ error: 'Please write at least 150 characters of news.' }, 400, nc);
    if (s.link && !/^https:\/\/[^\s]+$/i.test(s.link)) return J({ error: 'Link must start with https://' }, 400, nc);
    if (!/^[a-f0-9]{64}$/.test(s.tx)) return J({ error: 'Enter the 64-character transaction hash of your payment.' }, 400, nc);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s.email)) return J({ error: 'A valid contact email is required.' }, 400, nc);
    const all = await tnAll(env); if (all.some(x => x.tx === s.tx)) return J({ error: 'That transaction has already been used.' }, 400, nc);
    const v = await tnVerify(s.tx, await tnCfg(env)), id = 't' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5);
    const rec = Object.assign(s, { id, ts: Date.now(), status: 'pending', paid: v.paid, why: v.why, from: v.from || '' });
    all.unshift(rec); await env.KV.put('tn', JSON.stringify(all.slice(0, 400))); await env.KV.put(rk, String(n + 1), { expirationTtl: 3600 });
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
