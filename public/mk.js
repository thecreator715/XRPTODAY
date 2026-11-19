(function(){
var $=function(i){return document.getElementById(i)};
function esc(s){return String(s==null?'':s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
function ago(t){var m=Math.max(1,Math.round((Date.now()-t)/6e4));return m<60?m+'m':m<1440?Math.round(m/60)+'h':Math.round(m/1440)+'d'}
function hue(s){var n=0;for(var i=0;i<s.length;i++)n=(n*31+s.charCodeAt(i))%360;return n}
function hid(u){var n=0;for(var i=0;i<u.length;i++)n=(n*31+u.charCodeAt(i))>>>0;return n.toString(36)}
function ls(k,d){try{return JSON.parse(localStorage.getItem(k))||d}catch(e){return d}}
function ss(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}
var CVC={},Q=[],ACT=0;
function pump(){while(ACT<4&&Q.length){var j=Q.shift();ACT++;j()}}
function setCover(ph,im){if(!ph.parentNode)return;if(!im){ph.classList.remove('ph');ph.classList.add('fb');return}var g=new Image();g.className='cvr';g.loading='lazy';g.decoding='async';g.referrerPolicy='no-referrer';g.alt='';g.onerror=function(){if(g.parentNode){ph.classList.remove('ph');ph.classList.add('fb');g.replaceWith(ph)}};g.src=im;ph.replaceWith(g)}
var IO=window.IntersectionObserver?new IntersectionObserver(function(es){es.forEach(function(e){if(!e.isIntersecting)return;var ph=e.target;IO.unobserve(ph);var u=ph.getAttribute('data-cv');if(!u)return;if(CVC[u]!==undefined){setCover(ph,CVC[u]);return}Q.push(function(){fetch('/api/cover?u='+encodeURIComponent(u)).then(function(r){return r.json()}).then(function(d){CVC[u]=d&&d.im||'';setCover(ph,CVC[u])}).catch(function(){CVC[u]='';setCover(ph,'')}).then(function(){ACT--;pump()})});pump()})},{rootMargin:'500px 0px'}):null;
var META={stocks:{t:'Top Stock <i>News</i>',s:'Wall Street, earnings, indexes and the stocks moving markets — pulled live from top financial publishers, with links to every story.',ph:'Search stocks, earnings, Fed, Nvidia, S&P 500…',ch:['All','Indexes','Earnings','Tech','Fed','Movers','Saved'],tag:'#Stocks'},metals:{t:'<i>METALS</i>',s:'Gold, silver and copper prices, central-bank buying and industrial demand — pulled live from top publishers, with links to every story.',ph:'Search gold, silver, copper, mining, ETFs…',ch:['All','Gold','Silver','Copper','Other','Saved'],tag:'#Gold #Silver #Copper'}};
var ST={k:'stocks',f:'All',q:'',sort:'latest',rng:0,items:[],ts:0,paused:false,saved:ls('x2mksv',{}),seen:ls('x2mkseen',{}),pend:0,iv:null};
function score(x){var s=(x.c||[]).length*10+(x.im?5:0)+(/breaking|record|surge|plunge|soar|crash|fed|cut|hike/i.test(x.t)?15:0);s-=Math.min(40,(Date.now()-x.ts)/36e5);return s}
function vis(){var q=ST.q.toLowerCase(),now=Date.now(),a=ST.items.filter(function(x){if(ST.f==='Saved')return ST.saved[hid(x.u)];if(ST.f!=='All'&&(x.c||[]).indexOf(ST.f)<0)return false;if(ST.rng&&now-x.ts>ST.rng*36e5)return false;if(q&&(x.t+' '+x.s).toLowerCase().indexOf(q)<0)return false;return true});
 if(ST.sort==='top')a=a.slice().sort(function(x,y){return score(y)-score(x)});return a}
function ic(p){return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" width="15" height="15">'+p+'</svg>'}
function rows(){var a=vis(),h='',now=Date.now();
 a.forEach(function(it){var id=hid(it.u),tg=(it.c||[]).slice(0,2).map(function(c){return '<span class="tg">'+esc(c)+'</span>'}).join(''),nw=!ST.seen[id]&&now-it.ts<18e5?' new':'';
  h+='<a data-id="'+id+'" class="row'+nw+'" href="/story/'+esc(it.id)+'" data-nav="/story/'+esc(it.id)+'"><div class="meta"><span class="age mono">'+ago(it.ts)+'</span><span class="src">'+esc(it.s)+'</span>'+tg+'</div><div class="hl">'+esc(it.t)+'</div>'+(it.im?'<img class="cvr" loading="lazy" decoding="async" referrerpolicy="no-referrer" alt="" src="'+esc(it.im)+'">':'<div class="cvr ph" data-cv="'+esc(it.u)+'" style="--h:'+hue(it.t+it.s)+'"></div>')+'<span class="acts"><button data-a="star" class="'+(ST.saved[id]?'on':'')+'" title="Save">'+ic('<path d="M12 3l2.6 5.6 6.1.7-4.5 4.2 1.2 6L12 16.5 6.6 19.5l1.2-6L3.3 9.3l6.1-.7z"/>')+'</button><button data-a="link" title="Copy link">'+ic('<path d="M10 14a4 4 0 005.7 0l3-3a4 4 0 00-5.7-5.7l-1 1M14 10a4 4 0 00-5.7 0l-3 3a4 4 0 005.7 5.7l1-1"/>')+'</button><button data-a="open" title="Open original">'+ic('<path d="M7 17L17 7M8 7h9v9"/>')+'</button><button data-a="x" title="Post to X">'+ic('<path d="M5 4l14 16M19 4L5 20"/>')+'</button></span></a>'});
 if(!a.length)h='<div class="empty">'+(ST.loading?'Loading…':ST.f==='Saved'?'No saved stories yet — tap the star on any story.':'No stories match these filters yet.<br><small>Try another tab or clear the search.</small>')+'</div>';
 return {h:h,n:a.length}}
function paintFeed(){var r=rows();$('mkfeed').innerHTML=r.h;$('mkcnt').textContent=r.n+' stories';if(IO)document.querySelectorAll('#mkfeed .cvr.ph').forEach(function(p){IO.observe(p)});stat()}
function stat(){if(!$('mkst'))return;var s=Math.round((Date.now()-ST.ts)/1000);$('mkst').innerHTML='<b>LIVE</b> · '+(ST.ts?'updated '+(s<90?s+'s':Math.round(s/60)+'m')+' ago · ':'')+ST.items.length+' stories'+(ST.paused&&ST.pend?' · <span class="np">'+ST.pend+' new waiting</span>':'')}
function shell(){var m=META[ST.k];
 $('vMkt').innerHTML='<div class="bhead"><h2>'+m.t+'</h2><p>'+m.s+'</p></div>'+
 '<div class="search"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/></svg><input id="mkq" placeholder="'+esc(m.ph)+'" autocomplete="off" value="'+esc(ST.q)+'"></div>'+
 '<div class="tabs" id="mktabs">'+m.ch.map(function(c){return '<button class="'+(c===ST.f?'on':'')+'" data-f="'+c+'">'+c+'</button>'}).join('')+'</div>'+
 '<div class="tbx" id="mktb"><div class="seg" id="mksort"><button class="'+(ST.sort==='latest'?'on':'')+'" data-s="latest">Latest</button><button class="'+(ST.sort==='top'?'on':'')+'" data-s="top">Top</button></div><div class="seg2" id="mkrng">'+[[1,'1h'],[6,'6h'],[24,'24h'],[0,'All']].map(function(r){return '<button class="chip2'+(ST.rng===r[0]?' on':'')+'" data-r="'+r[0]+'">'+r[1]+'</button>'}).join('')+'</div><button class="chip2" id="mkpz" data-act="pz">'+(ST.paused?'Resume':'Pause')+'</button><button class="chip2" data-act="rf">Refresh</button><span class="sp"></span><div class="vtog" id="mkvt"><button data-v="grid" title="Grid view">'+ic('<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>')+'</button><button data-v="list" title="List view">'+ic('<path d="M4 6h16M4 12h16M4 18h16"/>')+'</button></div></div>'+
 '<div class="stat"><span id="mkst">Connecting…</span><span id="mkcnt"></span></div><div class="feed" id="mkfeed"></div>';
 syncVt();paintFeed();bind()}
function syncVt(){var g=document.body.classList.contains('gv');document.querySelectorAll('#mkvt button').forEach(function(b){b.classList.toggle('on',b.getAttribute('data-v')===(g?'grid':'list'))})}
function bind(){var v=$('vMkt');
 $('mkq').oninput=function(){ST.q=this.value;paintFeed()};
 v.onclick=function(e){var t=e.target,b;
  if((b=t.closest('#mktabs [data-f]'))){ST.f=b.getAttribute('data-f');document.querySelectorAll('#mktabs button').forEach(function(x){x.classList.toggle('on',x===b)});paintFeed();return}
  if((b=t.closest('#mksort [data-s]'))){ST.sort=b.getAttribute('data-s');document.querySelectorAll('#mksort button').forEach(function(x){x.classList.toggle('on',x===b)});paintFeed();return}
  if((b=t.closest('#mkrng [data-r]'))){ST.rng=+b.getAttribute('data-r');document.querySelectorAll('#mkrng button').forEach(function(x){x.classList.toggle('on',x===b)});paintFeed();return}
  if((b=t.closest('[data-act]'))){var a=b.getAttribute('data-act');if(a==='pz'){ST.paused=!ST.paused;b.textContent=ST.paused?'Resume':'Pause';if(!ST.paused&&ST.pend){ST.pend=0;load(true)}stat()}else load(true);return}
  if((b=t.closest('#mkvt [data-v]'))){var o=document.querySelector('.vtog:not(#mkvt) button[data-v="'+b.getAttribute('data-v')+'"]');if(o)o.click();else document.body.classList.toggle('gv',b.getAttribute('data-v')==='grid');setTimeout(syncVt,30);return}
  if((b=t.closest('.acts button'))){e.preventDefault();e.stopPropagation();var r=b.closest('.row'),id=r.getAttribute('data-id'),it=ST.items.filter(function(x){return hid(x.u)===id})[0],a2=b.getAttribute('data-a');if(!it)return;
   if(a2==='star'){if(ST.saved[id])delete ST.saved[id];else ST.saved[id]=1;ss('x2mksv',ST.saved);b.classList.toggle('on',!!ST.saved[id]);if(ST.f==='Saved')paintFeed()}
   else if(a2==='link'){try{navigator.clipboard.writeText(it.u)}catch(x){}b.classList.add('on');setTimeout(function(){b.classList.remove('on')},900)}
   else if(a2==='open'){window.open(it.u,'_blank','noopener')}
   else if(a2==='x'){window.open('https://twitter.com/intent/tweet?text='+encodeURIComponent(it.t+'\n\n'+location.origin+'/story/'+it.id+'\n\nView at XRPLTODAY.com '+META[ST.k].tag+' #XRPTODAY'),'_blank','noopener')}
   return}
  var row=t.closest('a.row');if(row){var rid=row.getAttribute('data-id');ST.seen[rid]=1;ss('x2mkseen',ST.seen);row.classList.remove('new')}}}
function load(manual){ST.loading=!ST.items.length;if(ST.loading&&$('mkfeed'))paintFeed();
 fetch('/api/mkt?k='+ST.k,{cache:'no-store'}).then(function(r){return r.json()}).then(function(d){var n=d.items||[];if(ST.paused&&!manual&&ST.items.length){var old={};ST.items.forEach(function(x){old[x.u]=1});ST.pend=n.filter(function(x){return !old[x.u]}).length;stat();return}ST.items=n;ST.ts=Date.now();ST.loading=0;if($('mkfeed'))paintFeed()}).catch(function(){ST.loading=0;if($('mkfeed'))paintFeed()})}

function story(id){var v=$('vMkt');v.innerHTML='<div class="art mkart"><div class="empty">Loading…</div></div>';try{speechSynthesis.cancel()}catch(e){}
 var pit=null;try{pit=(window.XD.items||[]).find(function(x){return String(x.id)===id})}catch(e){}
 if(pit)v.innerHTML='<div class="art mkart"><a class="back" href="/" data-nav="/">← XRPL News</a>'+(pit.im?'<img class="mkhero" referrerpolicy="no-referrer" alt="" src="'+esc(pit.im)+'" onerror="this.remove()">':'')+'<h2>'+esc(pit.t)+'</h2><div class="am"><span>'+esc(pit.s)+'</span></div><div class="mkcta"><a class="btn2 pri" href="'+esc(pit.u)+'" target="_blank" rel="noopener noreferrer">Read the full story at '+esc(pit.s)+' ↗</a></div><div class="body mkbrief"><p class="mu">Writing the summary…</p></div></div>';
 fetch('/api/story?id='+encodeURIComponent(id)).then(function(r){return r.json()}).then(function(d){
  var bk=d.k==='news'?'/':'/'+d.k;
  if(d.error){v.innerHTML='<div class="art mkart"><a class="back" href="/" data-nav="/">← Back to news</a><div class="empty">This story is no longer available.</div></div>';return}
  var lab=d.k==='metals'?'METALS':d.k==='stocks'?'Top Stock News':'XRPL News',su=location.origin+'/story/'+d.id,tags=d.k==='metals'?'#Gold #Silver #Copper':d.k==='stocks'?'#Stocks':'#XRP #XRPL',
  share='https://twitter.com/intent/tweet?text='+encodeURIComponent(d.t+'\n\n'+su+'\n\nView at XRPLTODAY.com '+tags+' #XRPTODAY');
  document.title=d.t+' — XRPLTODAY';
  var b=String(d.brief||''),why='',kp=[],m=b.match(/WHY IT MATTERS:\s*([\s\S]*)$/i);if(m){why=m[1].trim();b=b.slice(0,m.index)}
  m=b.match(/KEY POINTS:\s*([\s\S]*)$/i);if(m){kp=m[1].split(/\n+/).map(function(x){return x.replace(/^[-•*\s]+/,'').trim()}).filter(Boolean).slice(0,5);b=b.slice(0,m.index)}
  var paras=b.split(/\n+/).map(function(x){return x.trim()}).filter(Boolean),words=(b+' '+kp.join(' ')+' '+why).split(/\s+/).length,mins=Math.max(1,Math.round(words/200));
  var cta=function(top){return '<div class="mkcta"><a class="btn2 pri" href="'+esc(d.u)+'" target="_blank" rel="noopener noreferrer">Read the full story at '+esc(d.s)+' ↗</a>'+(top?'<button class="btn2" id="mklis">🔊 Listen</button>':'<a class="btn2" href="'+share+'" target="_blank" rel="noopener">Post to X</a><button class="btn2" id="mkimg">Share as image</button><button class="btn2" id="mkcp">Copy link</button>')+'</div>'};
  v.innerHTML='<div class="art mkart"><a class="back" href="'+bk+'" data-nav="'+bk+'">← '+lab+'</a>'+(d.im?'<img class="mkhero" referrerpolicy="no-referrer" alt="" src="'+esc(d.im)+'" onerror="this.remove()">':'<div class="mkhero fb" id="mkh" style="--h:'+hue(d.t+d.s)+'"></div>')+'<h2>'+esc(d.t)+'</h2><div class="am"><span>'+esc(d.s)+'</span><span>'+new Date(d.ts).toUTCString().slice(0,22)+' UTC</span><span>'+mins+' min read</span>'+(d.c||[]).map(function(c){return '<span class="tg">'+esc(c)+'</span>'}).join('')+'</div>'+cta(1)+
  (paras.length?'<div class="body mkbrief">'+paras.map(function(p){return '<p>'+esc(p)+'</p>'}).join('')+'</div>':'<div class="body"><p class="mu">A summary is not available for this story yet. Open the original for the full article.</p></div>')+
  (kp.length?'<div class="mkkp"><h3>Key points</h3><ul>'+kp.map(function(x){return '<li>'+esc(x)+'</li>'}).join('')+'</ul></div>':'')+(why?'<div class="mkwhy"><h3>Why it matters</h3><p>'+esc(why)+'</p></div>':'')+
  '<p class="disc">Written by XRPLTODAY from the publisher’s headline and snippet, in our own words. Read the original for the full reporting. Not financial advice.</p>'+cta(0)+
  (d.rel&&d.rel.length?'<h3 class="mkrt">Related stories</h3><div class="mkrel">'+d.rel.map(function(r){return '<a href="/story/'+r.id+'" data-nav="/story/'+r.id+'"><small>'+esc(r.s)+' · '+ago(r.ts)+'</small>'+esc(r.t)+'</a>'}).join('')+'</div>':'')+'</div>';
  $('mkcp').onclick=function(){try{navigator.clipboard.writeText(su)}catch(x){}this.textContent='Copied ✓'};
  $('mkimg').onclick=function(){var hi=document.querySelector('.mkart img.mkhero');var p=window.XDpng?window.XDpng({t:d.t,s:d.s,im:hi?hi.getAttribute('src'):d.im}):null;if(!p)return;try{if(window.ClipboardItem){navigator.clipboard.write([new ClipboardItem({'image/png':p})]).then(function(){window.XDtoast&&window.XDtoast('Image copied — paste it into X')});return}}catch(e){}p.then(function(bl){var a=document.createElement('a');a.href=URL.createObjectURL(bl);a.download='xrpltoday-story.png';a.click()})};
  $('mklis').onclick=function(){try{if(speechSynthesis.speaking){speechSynthesis.cancel();this.textContent='🔊 Listen';return}var u=new SpeechSynthesisUtterance(d.t+'. '+paras.join(' ')+' '+kp.join('. ')+' '+why);u.rate=1;var bt=this;u.onend=function(){bt.textContent='🔊 Listen'};speechSynthesis.speak(u);this.textContent='■ Stop'}catch(e){}};
  if(!d.im)fetch('/api/cover?u='+encodeURIComponent(d.u)).then(function(r){return r.json()}).then(function(c){var h=$('mkh');if(h&&c&&c.im){var g=new Image();g.className='mkhero';g.referrerPolicy='no-referrer';g.onload=function(){h.replaceWith(g)};g.src=c.im}}).catch(function(){})
 }).catch(function(){v.innerHTML='<div class="art mkart"><a class="back" href="/" data-nav="/">← Back</a><div class="empty">Could not load this story.</div></div>'})}

function tnum(v){if(v==null||isNaN(v))return '—';var a=Math.abs(v);if(a>=1e12)return (v/1e12).toFixed(2)+'T';if(a>=1e9)return (v/1e9).toFixed(2)+'B';if(a>=1e6)return (v/1e6).toFixed(2)+'M';if(a>=1e3)return (v/1e3).toFixed(1)+'K';return v.toFixed(a<10?2:0)}
function tpx(v){v=+v;if(!v||isNaN(v))return '—';var a=Math.abs(v);if(a>=1000)return '$'+v.toLocaleString('en-US',{maximumFractionDigits:2});if(a>=1)return '$'+v.toFixed(4);if(a>=0.01)return '$'+v.toFixed(5);if(a>=1e-6)return '$'+v.toFixed(8);return '$'+v.toExponential(2)}
function tpc(v){if(v==null||isNaN(v))return '<span class="mu">—</span>';v=+v;return '<span class="'+(v>=0?'up':'down')+'">'+(v>=0?'▲ ':'▼ ')+Math.abs(v).toFixed(2)+'%</span>'}
var TOP={rows:[],sort:'vol24hxrp',dir:-1,q:'',ts:0,stale:0,busy:0};
function topLoad(force){
 if(TOP.busy)return;TOP.busy=1;
 var P='/v1/tokens?start=0&limit=50&sortBy=vol24hxrp&sortType=desc';
 fetch('https://api.xrpl.to'+P).then(function(r){if(!r.ok)throw new Error(r.status);return r.json()})
 .catch(function(){return new Promise(function(ok){setTimeout(ok,700)}).then(function(){return fetch('/api/sq/tokens?sort=vol24hxrp&dir=desc&limit=50').then(function(r){return r.json()})})})
 .then(function(d){if(!d||!d.tokens||!d.tokens.length)throw new Error('none');TOP.rows=d.tokens.slice(0,50);TOP.ts=Date.now();TOP.stale=d.stale?1:0;try{localStorage.setItem('x2top',JSON.stringify({r:TOP.rows,ts:TOP.ts}))}catch(e){}},function(){var c=null;try{c=JSON.parse(localStorage.getItem('x2top'))}catch(e){}if(c&&c.r){TOP.rows=c.r;TOP.ts=c.ts;TOP.stale=1}})
 .then(function(){TOP.busy=0;topDraw()});
}
function topDraw(){
 var v=$('vMkt');if(!v||location.pathname!=='/top')return;
 var rows=TOP.rows.slice(),q=TOP.q.toLowerCase(),k=TOP.sort;
 rows.sort(function(a,b){return TOP.dir*((+a[k]||0)-(+b[k]||0))});
 if(q)rows=rows.filter(function(t){return ((t.name||'')+' '+(t.currency||'')+' '+(t.issuer||'')).toLowerCase().indexOf(q)>=0});
 var th=function(key,l,cls){return '<th class="'+(cls||'')+(k===key?' on':'')+'" data-s="'+key+'">'+l+(k===key?(TOP.dir<0?' ↓':' ↑'):'')+'</th>'};
 var tb=rows.map(function(t,i){var nm=t.name||t.currency||'?',sl=t.slug||'';
  return '<tr data-slug="'+esc(sl)+'"><td class="rk">'+(i+1)+'</td><td class="tn"><div class="tnw"><span class="av" style="background:hsl('+hue(t.md5||nm)+',65%,42%)">'+esc(nm.slice(0,2).toUpperCase())+'</span><span class="nm"><b>'+esc(nm)+(t.verified?' <i class="vf">✓</i>':'')+'</b><small>'+esc(t.currency||'')+' · '+esc((t.issuer||'').slice(0,6))+'…'+esc((t.issuer||'').slice(-4))+'</small></span></div></td><td class="r">'+tpx(t.usd)+'</td><td class="r">'+tpc(t.pro1h)+'</td><td class="r">'+tpc(t.pro24h)+'</td><td class="r">'+tpc(t.pro7d)+'</td><td class="r">'+tnum(t.vol24hxrp)+'</td><td class="r h2">'+tnum(t.marketcap)+'</td><td class="r h2">'+tnum(t.holders)+'</td><td class="r h2">'+tnum(t.vol24htx)+'</td></tr>'}).join('');
 var tot=TOP.rows.reduce(function(a,t){return a+(+t.vol24hxrp||0)},0),up=TOP.rows.filter(function(t){return +t.pro24h>0}).length;
 v.innerHTML='<div class="art toppg"><div class="tophd"><div><h2>Top 50 XRPL tokens</h2><div class="mu">Ranked by 24h trading volume · tap a token for its live page</div></div><div class="topbt"><input id="topq" type="search" placeholder="Search tokens…" value="'+esc(TOP.q)+'"><button class="btn2" id="toprf">Refresh</button></div></div>'+
 '<div class="kp topkp"><div class="tile"><small>24H VOLUME (TOP 50)</small><b>'+tnum(tot)+'</b><em>XRP</em></div><div class="tile"><small>TOKENS UP 24H</small><b>'+up+' / '+TOP.rows.length+'</b><em>of the top 50</em></div><div class="tile"><small>TOP TOKEN</small><b>'+esc(TOP.rows[0]?(TOP.rows[0].name||TOP.rows[0].currency):'—')+'</b><em>by 24h volume</em></div><div class="tile"><small>UPDATED</small><b>'+(TOP.ts?new Date(TOP.ts).toISOString().slice(11,16)+' UTC':'—')+'</b><em>'+(TOP.stale?'saved data':'live')+'</em></div></div>'+
 (TOP.rows.length?'<div class="topw"><table class="toptb"><thead><tr><th class="rk">#</th><th class="tn">Token</th>'+th('usd','Price','r')+th('pro1h','1h','r')+th('pro24h','24h','r')+th('pro7d','7d','r')+th('vol24hxrp','Volume 24h','r')+th('marketcap','Mkt cap','r h2')+th('holders','Holders','r h2')+th('vol24htx','Trades','r h2')+'</tr></thead><tbody>'+tb+'</tbody></table></div>':'<div class="empty">We could not load the token list right now — the data provider is busy.<br><button class="btn2 pri" onclick="location.reload()" style="margin-top:12px">Try again</button></div>')+
 '<p class="disc">Data from xrpl.to · volume and market cap in XRP · not financial advice. Low-liquidity tokens can be volatile and easily manipulated.</p></div>';
 var w=v.querySelector('.toptb');if(w)w.onclick=function(e){var h=e.target.closest('th[data-s]');if(h){var s=h.getAttribute('data-s');if(TOP.sort===s)TOP.dir*=-1;else{TOP.sort=s;TOP.dir=-1}topDraw();return}var r=e.target.closest('tr[data-slug]');if(r&&r.getAttribute('data-slug')){window.__tkfrom=1;history.pushState(null,'','/token/'+encodeURIComponent(r.getAttribute('data-slug')));window.dispatchEvent(new PopStateEvent('popstate'))}};
 var qi=$('topq');if(qi)qi.oninput=function(){TOP.q=this.value;var p=this.selectionStart;topDraw();var n=$('topq');n.focus();try{n.setSelectionRange(p,p)}catch(e){}};
 var rf=$('toprf');if(rf)rf.onclick=function(){if(Date.now()-TOP.ts<60000){this.textContent='Updated just now';return}topLoad(1)};
}
function topPage(){document.title='Top 50 XRPL tokens by volume — XRPLTODAY';var v=$('vMkt');if(!TOP.rows.length)v.innerHTML='<div class="art toppg"><div class="empty">Loading top tokens…</div></div>';else topDraw();if(!TOP.rows.length||Date.now()-TOP.ts>300000)topLoad()}
window.XD_mk=function(k){if(k==='top')return topPage();if(String(k).indexOf('story:')===0)return story(k.slice(6));var nk=k==='metals'?'metals':'stocks';if(ST.k!==nk){ST.items=[];ST.f='All';ST.q=''}ST.k=nk;ST.f='All';ST.loading=1;ST.pend=0;ST.paused=false;shell();load();clearInterval(ST.iv);ST.iv=setInterval(function(){if(!$('mkfeed')||document.getElementById('vMkt').classList.contains('hide'))return;if(document.visibilityState==='visible')load();else stat()},300000);
};
})();
