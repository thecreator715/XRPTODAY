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
