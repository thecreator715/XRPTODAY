// Patch set v3: stronger writing prompts, length enforcement with one retry, specific titles
const must = (s, a, b) => { if (s.indexOf(a) < 0) throw new Error('missing: ' + a); return s.replace(a, () => b); };
export function patchSrc2(src) {
  src = must(src, String.raw`Length: about ' + target + ' words (' + pages + ' page' + (pages > 1 ? 's' : '') + ').\n\nFacts you may use:`,
    String.raw`Length: write AT LEAST ' + target + ' words (' + pages + ' page' + (pages > 1 ? 's' : '') + ') as ' + (pages * 2 + 1) + ' developed sections of 120+ words each; never stop early.\n\nFacts you may use:`);
  src = must(src, 'TITLE: <fresh, specific, under 80 characters, no clickbait>', 'TITLE: <specific title under 80 characters that names a concrete product or feature from the facts and what it does; never a generic title like "Update">');
  src = must(src, String.raw`const txt = await ai(env, SYS_D, user, Math.min(3400, Math.round(target * 1.7) + 250)), p = txt && parsePost(txt), wc = p ? p.body.split(/\s+/).length : 0;`,
    String.raw`let txt, p, wc = 0;
  for (let a = 0; a < 2; a++) {
    txt = await ai(env, SYS_D, user + (a ? '\n\nIMPORTANT: the previous draft was too short. Write the FULL length requested and develop every section.' : ''), Math.min(3800, Math.round(target * 2) + 300));
    p = txt && parsePost(txt); wc = p ? p.body.split(/\s+/).length : 0; if (wc >= target * .75) break;
  }`);
  src = must(src, 'wc < target * .45', 'wc < target * .7');
  src = must(src, 'Write a 450-600 word hourly brief.', 'Write a 450-600 word hourly brief (never fewer than 400 words: four developed sections of about 100 words each).');
  src = must(src, 'TITLE: <specific, factual title under 80 characters>', 'TITLE: <specific, factual title under 80 characters that names the lead story; never generic like "XRP Update">');
  src = must(src, 'p.body.length < 350', 'p.body.split(/\\s+/).length < 300');
  return src;
}
