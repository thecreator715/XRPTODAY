/* XRPLTODAY x2 — visual + feature layer (no deps) */
(function(){
var S=window.XD,A=window.XDapi||{};
function $(i){return document.getElementById(i)}
function el(t,c,h){var e=document.createElement(t);if(c)e.className=c;if(h!=null)e.innerHTML=h;return e}
function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
function lsg(k,d){try{var v=localStorage.getItem(k);return v==null?d:JSON.parse(v)}catch(e){return d}}
function lss(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}
var CFG=lsg('x2cfg',{});
var DEF={view:'grid',accent:'blue',dens:'cozy',fs:1,fx:true,notify:false,sound:false,watch:'',mutek:'',mutes:'',lang:'all',range:0,unread:false,alertAbove:0,alertBelow:0,ptr:true};
for(var k in DEF)if(CFG[k]===undefined)CFG[k]=DEF[k];
function save(){lss('x2cfg',CFG)}
var BM=lsg('x2bm',[]),READ=lsg('x2rd',{});
function bmHas(id){for(var i=0;i<BM.length;i++)if(BM[i].id===id)return true;return false}
function saveBM(){lss('x2bm',BM.slice(0,500))}
function saveRD(){var ks=Object.keys(READ);if(ks.length>2500){ks.sort(function(a,b){return READ[a]-READ[b]}).slice(0,500).forEach(function(k){delete READ[k]})}lss('x2rd',READ)}
var IC={star:'<path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z"/>',eye:'<path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',link:'<path d="M10 14a4 4 0 005.7 0l3-3a4 4 0 00-5.7-5.7l-1 1M14 10a4 4 0 00-5.7 0l-3 3a4 4 0 005.7 5.7l1-1"/>',share:'<circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="M8.6 10.5l6.8-4M8.6 13.5l6.8 4"/>',grid:'<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',list:'<path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/>'};
function ic(n){return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">'+IC[n]+'</svg>'}

/* toasts */
var tw=el('div');tw.id='toasts';document.body.appendChild(tw);
function toast(m,c,ms){var t=el('div','toast '+(c||''),m);tw.appendChild(t);setTimeout(function(){t.style.opacity=0;t.style.transition='opacity .4s';setTimeout(function(){t.remove()},400)},ms||3600)}
window.XDtoast=toast;

/* splash */
var sp=el('div');sp.id='splash';sp.innerHTML='<div class="sp"><div class="lg"><svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.6" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg></div><b>XRPL<i>TODAY</i></b><div class="bar"></div></div>';document.body.appendChild(sp);
setTimeout(function(){sp.classList.add('off');setTimeout(function(){sp.remove()},700)},900);

/* scroll progress + back to top */
var pg=el('div');pg.id='prog';document.body.appendChild(pg);
var tt=el('button',null,'<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><path d="M12 19V5M5 12l7-7 7 7"/></svg>');tt.id='totop';document.body.appendChild(tt);
var colL=$('colL');tt.onclick=function(){colL.scrollTo({top:0,behavior:'smooth'})};
colL.addEventListener('scroll',function(){var m=colL.scrollHeight-colL.clientHeight;pg.style.width=(m>0?colL.scrollTop/m*100:0)+'%';tt.classList.toggle('on',colL.scrollTop>600);var pb=document.querySelector('.pbar i');if(pb){var a=document.querySelector('.art');if(a){var r=a.getBoundingClientRect(),h=a.offsetHeight-colL.clientHeight;pb.style.width=Math.max(0,Math.min(100,-r.top/Math.max(1,h)*100+ (r.top>0?0:0)))+'%'}}},{passive:true});

/* accent + modes */
var ACC={blue:['#3d8bff','#1f5cff','#59c6ff'],cyan:['#22d3ee','#0891b2','#67e8f9'],violet:['#8b7bff','#5b43f0','#c4b5fd'],emerald:['#2ee6a8','#0f9f74','#86efac'],gold:['#ffc24d','#e59a14','#ffe08a'],rose:['#ff6b9d','#e11d63','#ffb3cf']};
function hexA(h,a){var n=parseInt(h.slice(1),16);return 'rgba('+(n>>16)+','+(n>>8&255)+','+(n&255)+','+a+')'}
function applyCfg(){var a=ACC[CFG.accent]||ACC.blue,r=document.documentElement.style;r.setProperty('--blue',a[0]);r.setProperty('--blue2',a[1]);r.setProperty('--cyan',a[2]);r.setProperty('--glow',hexA(a[0],.35));r.setProperty('--grad','linear-gradient(135deg,'+a[1]+' 0%,'+a[0]+' 48%,'+a[2]+' 100%)');r.setProperty('--grad-soft','linear-gradient(135deg,'+hexA(a[1],.22)+','+hexA(a[2],.10)+')');r.setProperty('--hover',hexA(a[0],.07));r.setProperty('--fs',CFG.fs);
document.body.classList.toggle('nofx',!CFG.fx);document.body.classList.toggle('compact',CFG.dens==='compact');document.body.classList.toggle('gv',CFG.view==='grid');
document.querySelectorAll('.vtog').forEach(function(v){v.querySelectorAll('button').forEach(function(b){b.classList.toggle('on',b.getAttribute('data-v')===CFG.view)})});
var g=$('grid');if(g)g.classList.toggle('lv',CFG.view==='list');document.querySelectorAll('.sg,.kp').forEach(function(x){x.classList.toggle('lv',CFG.view==='list')})}
function setView(v){CFG.view=v;save();applyCfg();if(A.render)A.render()}
function mkVT(){var d=el('div','vtog','<button data-v="grid" title="Grid view">'+ic('grid')+'</button><button data-v="list" title="List view">'+ic('list')+'</button>');d.onclick=function(e){var b=e.target.closest('button');if(b)setView(b.getAttribute('data-v'))};return d}
window.XDvt=mkVT;
applyCfg();

/* ---------- toolbar: view toggle, time range, language, pause ---------- */
var paused=false,pendingN=0,rawItems=[];
var tb=el('div','tbx');tb.innerHTML='<div class="seg2" id="rng2"><button class="chip2" data-r="1">1h</button><button class="chip2" data-r="6">6h</button><button class="chip2" data-r="24">24h</button><button class="chip2" data-r="0">All</button></div><div class="seg2" id="lng2"><button class="chip2" data-l="all">All languages</button><button class="chip2" data-l="en">English</button><button class="chip2" data-l="xx">Global</button></div><button class="chip2" id="unr">Unread only</button><button class="chip2" id="pz">Pause</button><span id="np"></span><span class="sp"></span>';
tb.appendChild(mkVT());
var st=document.querySelector('#vNews .stat');if(st)st.parentNode.insertBefore(tb,st);
function syncTb(){tb.querySelectorAll('[data-r]').forEach(function(b){b.classList.toggle('on',+b.getAttribute('data-r')===CFG.range)});tb.querySelectorAll('[data-l]').forEach(function(b){b.classList.toggle('on',b.getAttribute('data-l')===CFG.lang)});$('unr').classList.toggle('on',!!CFG.unread);$('pz').classList.toggle('on',paused);$('pz').textContent=paused?'Resume':'Pause';$('np').innerHTML=paused&&pendingN?'<span class="newpill">'+pendingN+' new</span>':''}
tb.onclick=function(e){var b=e.target.closest('button');if(!b)return;if(b.hasAttribute('data-r')){CFG.range=+b.getAttribute('data-r')}else if(b.hasAttribute('data-l')){CFG.lang=b.getAttribute('data-l')}else if(b.id==='unr'){CFG.unread=!CFG.unread}else if(b.id==='pz'){paused=!paused;if(!paused){pendingN=0}}else return;save();refilter();syncTb()};
syncTb();

/* filtering pipeline (hooks into main app) */
function words(s){return (s||'').toLowerCase().split(/[,\n]+/).map(function(x){return x.trim()}).filter(Boolean)}
function nonEn(t){var n=0;for(var i=0;i<t.length;i++)if(t.charCodeAt(i)>127)n++;return n/Math.max(1,t.length)>.12}
function filt(a){var mk=words(CFG.mutek),ms=words(CFG.mutes),now=Date.now();
  return a.filter(function(it){var t=it.t.toLowerCase(),s=(it.s||'').toLowerCase();
    if(ms.some(function(x){return s.indexOf(x)>=0}))return false;if(mk.some(function(x){return t.indexOf(x)>=0}))return false;
    if(CFG.range&&now-it.ts>CFG.range*36e5)return false;
    if(CFG.lang==='en'&&(it.g||nonEn(it.t)))return false;if(CFG.lang==='xx'&&!(it.g||nonEn(it.t)))return false;
    if(CFG.unread&&READ[it.id])return false;return true})}
var known=null;
window.XD_pre=function(items){rawItems=items;
  if(paused){var ids={};(S.items||[]).forEach(function(x){ids[x.id]=1});pendingN=items.filter(function(x){return !ids[x.id]}).length;syncTb();return S.items}
  return filt(items)};
function refilter(){S.items=filt(rawItems.length?rawItems:S.items);if(A.render)A.render()}

/* new-story alerts, price alerts */
var ctx=null;function ping(){try{ctx=ctx||new (window.AudioContext||window.webkitAudioContext)();var o=ctx.createOscillator(),g=ctx.createGain();o.type='sine';o.frequency.value=880;g.gain.value=.05;o.connect(g);g.connect(ctx.destination);o.start();g.gain.exponentialRampToValueAtTime(.0001,ctx.currentTime+.4);o.stop(ctx.currentTime+.4)}catch(e){}}
var lastPx=null,alerted={};
window.XD_load=function(d){var ids=known;known={};rawItems.forEach(function(x){known[x.id]=1});
  if(ids){var nw=rawItems.filter(function(x){return !ids[x.id]&&x.i>=75&&Date.now()-x.ts<36e5}).slice(0,2);nw.forEach(function(x){toast('<b>Hot story</b><br>'+esc(x.t.slice(0,110)),'hot',5200);if(CFG.sound)ping();if(CFG.notify&&window.Notification&&Notification.permission==='granted'){try{new Notification('XRPLTODAY',{body:x.t})}catch(e){}}})}
  var m=(S.mkt||[]).filter(function(x){return x.id==='ripple'})[0];if(m){if(lastPx!=null&&m.p!==lastPx)flashPx(m.p>lastPx);countPx(lastPx,m.p);lastPx=m.p;
    if(CFG.alertAbove&&m.p>=CFG.alertAbove&&!alerted.a){alerted.a=1;toast('<b>Price alert</b><br>XRP is at or above $'+CFG.alertAbove,'ok',9000);if(CFG.notify&&window.Notification&&Notification.permission==='granted')new Notification('XRP price alert',{body:'At or above $'+CFG.alertAbove})}
    if(CFG.alertBelow&&m.p<=CFG.alertBelow&&!alerted.b){alerted.b=1;toast('<b>Price alert</b><br>XRP is at or below $'+CFG.alertBelow,'ok',9000);if(CFG.notify&&window.Notification&&Notification.permission==='granted')new Notification('XRP price alert',{body:'At or below $'+CFG.alertBelow})}}
  drawStrip();drawInsights();drawTools()};
function flashPx(up){var p=document.querySelector('#cMkt .px');if(p){p.classList.remove('flash-u','flash-d');void p.offsetWidth;p.classList.add(up?'flash-u':'flash-d')}}
function countPx(a,b){var p=document.querySelector('#cMkt .px');if(!p||a==null||a===b)return;var t0=performance.now(),f=b<10?4:2;(function s(t){var k=Math.min(1,(t-t0)/700),v=a+(b-a)*k;p.textContent='$'+v.toFixed(f);if(k<1)requestAnimationFrame(s)})(t0)}

/* ---------- row decorations ---------- */
function ringSvg(v){var c=2*Math.PI*11,col=v>=70?'#ffd77a':v>=50?'var(--cyan)':'var(--blue)';return '<svg class="ring" viewBox="0 0 30 30"><circle cx="15" cy="15" r="11" fill="none" stroke="var(--line2)" stroke-width="3"/><circle cx="15" cy="15" r="11" fill="none" stroke="'+col+'" stroke-width="3" stroke-linecap="round" stroke-dasharray="'+(c*v/100).toFixed(1)+' '+c.toFixed(1)+'" transform="rotate(-90 15 15)"/><text x="15" y="18" text-anchor="middle">'+v+'</text></svg>'}
function findItem(id){var a=(rawItems||[]).concat(S.items||[],BM);for(var i=0;i<a.length;i++)if(a[i].id===id)return a[i];return null}
var watch=[];
window.XD_rf=function(){watch=words(CFG.watch);var rows=document.querySelectorAll('#feed .row[data-id]');
  rows.forEach(function(r){var id=r.getAttribute('data-id'),it=findItem(id);if(!it)return;
    r.classList.toggle('rd',!!READ[id]);
    var h=r.querySelector('.hl'),hit=false;if(watch.length&&h){var tl=it.t.toLowerCase();watch.forEach(function(w){if(tl.indexOf(w)>=0)hit=true});if(hit){var t=esc(it.t);watch.forEach(function(w){var re=new RegExp('('+w.replace(/[.*+?^$\{\}()|[\]\\]/g,'\\$&')+')','ig');t=t.replace(re,'<mark>$1</mark>')});h.innerHTML=t}}
    r.classList.toggle('wt',hit);
    if(!r.querySelector('.acts')){var a=el('span','acts','<button data-a="star" title="Save (s)">'+ic('star')+'</button><button data-a="eye" title="Quick view (e)">'+ic('eye')+'</button><button data-a="link" title="Copy link">'+ic('link')+'</button><button data-a="share" title="Share">'+ic('share')+'</button>');r.appendChild(a);}
    var sb=r.querySelector('[data-a=star]');if(sb)sb.classList.toggle('on',bmHas(id))});
  var sv=$('cnt');if(sv&&S.tab==='Saved')sv.textContent=BM.length+' saved'};
$('feed').addEventListener('click',function(e){var b=e.target.closest('.acts button');var r=e.target.closest('.row');if(!r)return;var id=r.getAttribute('data-id');
  if(b){e.preventDefault();e.stopPropagation();var a=b.getAttribute('data-a'),it=findItem(id);if(!it)return;
    if(a==='star')toggleBM(it);else if(a==='eye')openDrawer(it);else if(a==='link'){copy(it.u);toast('Link copied','ok')}else if(a==='share')openShare(it);return}
  READ[id]=Date.now();saveRD();r.classList.add('rd')},true);
$('feed').addEventListener('auxclick',function(e){var r=e.target.closest('.row');if(r){READ[r.getAttribute('data-id')]=Date.now();saveRD();r.classList.add('rd')}});
function copy(t){try{navigator.clipboard.writeText(t)}catch(e){var x=el('textarea');x.value=t;document.body.appendChild(x);x.select();document.execCommand('copy');x.remove()}}
function toggleBM(it){var i=-1;BM.forEach(function(b,j){if(b.id===it.id)i=j});if(i>=0){BM.splice(i,1);toast('Removed from Saved')}else{BM.unshift(it);toast('Saved — find it in the Saved tab','ok')}saveBM();if(S.tab==='Saved'&&A.render)A.render();else window.XD_rf()}
window.XD_saved=function(){return BM.slice().sort(function(a,b){return b.ts-a.ts})};
function markAll(){(S.items||[]).forEach(function(x){READ[x.id]=Date.now()});saveRD();window.XD_rf();toast('All visible stories marked as read','ok')}

/* spotlight + tilt */
document.addEventListener('mousemove',function(e){var t=e.target.closest&&e.target.closest('.card,.post,.row,.tile');if(!t||!CFG.fx)return;var r=t.getBoundingClientRect(),x=e.clientX-r.left,y=e.clientY-r.top;t.style.setProperty('--mx',x+'px');t.style.setProperty('--my',y+'px');},{passive:true});

/* ---------- aurora / network background ---------- */
(function(){var c=el('canvas');c.id='fx';document.body.insertBefore(c,document.body.firstChild);var g=c.getContext('2d'),W,H,P=[],t0=0;
function rs(){W=c.width=innerWidth;H=c.height=innerHeight;P=[];var n=Math.min(70,Math.floor(W*H/22000));for(var i=0;i<n;i++)P.push({x:Math.random()*W,y:Math.random()*H,vx:(Math.random()-.5)*.25,vy:(Math.random()-.5)*.25,r:Math.random()*1.6+.6})}
rs();addEventListener('resize',rs);
function f(t){requestAnimationFrame(f);if(document.hidden||!CFG.fx)return;g.clearRect(0,0,W,H);var a=ACC[CFG.accent]||ACC.blue,s=t/6000;
 [[.2,.1,a[1],.16],[.85,.25,a[2],.1],[.55,.95,a[0],.12]].forEach(function(b,i){var x=(b[0]+Math.sin(s+i*2)*.08)*W,y=(b[1]+Math.cos(s*.8+i)*.06)*H,r=Math.max(W,H)*.42,gr=g.createRadialGradient(x,y,0,x,y,r);gr.addColorStop(0,hexA(b[2],b[3]));gr.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=gr;g.fillRect(0,0,W,H)});
 g.fillStyle=hexA(a[2],.55);for(var i=0;i<P.length;i++){var p=P[i];p.x+=p.vx;p.y+=p.vy;if(p.x<0||p.x>W)p.vx*=-1;if(p.y<0||p.y>H)p.vy*=-1;g.beginPath();g.arc(p.x,p.y,p.r,0,6.3);g.fill();
  for(var j=i+1;j<P.length;j++){var q=P[j],dx=p.x-q.x,dy=p.y-q.y,d=dx*dx+dy*dy;if(d<14000){g.strokeStyle=hexA(a[0],.12*(1-d/14000));g.beginPath();g.moveTo(p.x,p.y);g.lineTo(q.x,q.y);g.stroke()}}}}
requestAnimationFrame(f)})();

/* lazy cover images (og:image of the article) */
var CVC={},cvQ=[],cvAct=0;
function cvPump(){while(cvAct<4&&cvQ.length){var j=cvQ.shift();cvAct++;j()}}
function cvHue(el){var r=el.closest?el.closest('.row'):null,h=r&&r.querySelector('.hl'),t=(h?h.textContent:'x2')+(r&&r.querySelector('.src')?r.querySelector('.src').textContent:''),n=0;for(var i=0;i<t.length;i++)n=(n*31+t.charCodeAt(i))%360;return n}
function cvFb(ph){ph.classList.remove('ph');ph.classList.add('fb');ph.removeAttribute('data-cv')}
function cvSet(ph,im){if(!ph.parentNode)return;if(!im){cvFb(ph);return}var g=new Image();g.className='cvr';g.loading='lazy';g.decoding='async';g.referrerPolicy='no-referrer';g.alt='';g.onerror=function(){if(g.parentNode){cvFb(ph);g.replaceWith(ph)}};g.src=im;ph.replaceWith(g)}
document.addEventListener('error',function(e){var t=e.target;if(t&&t.tagName==='IMG'&&t.classList&&t.classList.contains('cvr')&&t.parentNode&&!t.__fb){t.__fb=1;var d=document.createElement('div');d.className='cvr fb';d.style.setProperty('--h',cvHue(t));t.replaceWith(d)}},true);
var cvIO=window.IntersectionObserver?new IntersectionObserver(function(es){es.forEach(function(e){if(!e.isIntersecting)return;var ph=e.target;cvIO.unobserve(ph);var u=ph.getAttribute('data-cv');if(!u)return;if(CVC[u]!==undefined){cvSet(ph,CVC[u]);return}cvQ.push(function(){fetch('/api/cover?u='+encodeURIComponent(u)).then(function(r){return r.json()}).then(function(d){CVC[u]=d&&d.im||'';cvSet(ph,CVC[u])}).catch(function(){CVC[u]='';cvFb(ph)}).then(function(){cvAct--;cvPump()})});cvPump()})},{rootMargin:'500px 0px'}):null;
var _rf0=window.XD_rf;window.XD_rf=function(){if(_rf0)_rf0.apply(this,arguments);if(cvIO)document.querySelectorAll('#feed .cvr.ph:not([data-o])').forEach(function(p){p.setAttribute('data-o','1');p.style.setProperty('--h',cvHue(p));cvIO.observe(p)})};

/* ---------- stat strip (market pulse) ---------- */
function spk(v,w,h,c){if(!v||v.length<2)return '';var mn=Math.min.apply(null,v),mx=Math.max.apply(null,v),r=(mx-mn)||1,p=v.map(function(y,i){return (i/(v.length-1)*w).toFixed(1)+','+(h-2-((y-mn)/r)*(h-5)).toFixed(1)});return '<svg width="'+w+'" height="'+h+'" viewBox="0 0 '+w+' '+h+'"><polyline points="'+p.join(' ')+'" fill="none" stroke="'+c+'" stroke-width="1.8" stroke-linejoin="round"/></svg>'}
var strip=el('div','strip');var vn=$('vNews');vn.insertBefore(strip,vn.firstChild);
function mk(id){var m=S.mkt||[];for(var i=0;i<m.length;i++)if(m[i].id===id)return m[i];return null}
function pc(v){return v==null?'—':'<span class="'+(v>=0?'up':'down')+'">'+(v>=0?'+':'')+v.toFixed(2)+'%</span>'}
function sentiment(){var P=/surge|rally|approv|win|partner|launch|adopt|gain|bull|record|soar|jump|integrat|expan|upgrade|inflow|growth|breakout|rise|rebound|boost|settle|victory|green/i,N=/crash|plunge|lawsuit|sue|hack|ban|fall|drop|bear|sell-?off|fraud|dump|reject|delay|outflow|decline|slump|fear|probe|investigat|loss|warn|risk|exploit|scam/i,p=0,n=0,cut=Date.now()-864e5;rawItems.forEach(function(x){if(x.ts<cut||x.g)return;if(P.test(x.t))p++;if(N.test(x.t))n++});var t=p+n;return {p:p,n:n,score:t?Math.round(50+(p-n)/t*50):50}}
function drawStrip(){var x=mk('ripple'),b=mk('bitcoin'),r=mk('ripple-usd'),sn=sentiment(),hot=rawItems.filter(function(i){return i.i>=70&&Date.now()-i.ts<864e5}).length,l=S.xrpl;
 var up=x&&x.sp&&x.sp[x.sp.length-1]>=x.sp[0];
 strip.innerHTML='<div class="tile"><small>XRP / USD</small><b>'+(x?'$'+x.p.toFixed(x.p<10?4:2):'—')+'</b><em>'+(x?pc(x.c24):'')+' 24h</em>'+(x?spk(x.sp,90,34,up?'#35d6a0':'#ff5d73'):'')+'</div>'+
 '<div class="tile"><small>BITCOIN</small><b>'+(b?'$'+Math.round(b.p).toLocaleString():'—')+'</b><em>'+(b?pc(b.c24):'')+' 24h</em>'+(b?spk(b.sp,90,34,'#59c6ff'):'')+'</div>'+
 '<div class="tile"><small>NEWS SENTIMENT 24H</small><b>'+sn.score+'<span style="font-size:12px;color:var(--muted)"> / 100</span></b><em>'+sn.p+' bullish · '+sn.n+' bearish headlines</em></div>'+
 '<div class="tile"><small>LEDGER</small><b>'+(l?'#'+Number(l.seq).toLocaleString():'—')+'</b><em>'+hot+' high-impact stories today</em></div>'}

/* ---------- insights card (gauge, trends, sources, donut, heatmap) ---------- */
var ins=el('div','card');ins.id='cIns';var cR=$('colR');cR.insertBefore(ins,$('cLedger').nextSibling);
var insTab=lsg('x2ins','s');
function gauge(v){var R=70,cx=90,cy=84,a=Math.PI*(1-v/100),x=cx+R*Math.cos(a),y=cy-R*Math.sin(a),col=v>=60?'#35d6a0':v<=40?'#ff5d73':'#59c6ff';return '<svg class="gauge" width="180" height="108" viewBox="0 0 180 108"><defs><linearGradient id="gg" x1="0" x2="1"><stop offset="0" stop-color="#ff5d73"/><stop offset=".5" stop-color="#59c6ff"/><stop offset="1" stop-color="#35d6a0"/></linearGradient></defs><path d="M20 84A70 70 0 0 1 160 84" fill="none" stroke="var(--line2)" stroke-width="11" stroke-linecap="round"/><path d="M20 84A70 70 0 0 1 '+x.toFixed(1)+' '+y.toFixed(1)+'" fill="none" stroke="url(#gg)" stroke-width="11" stroke-linecap="round"/><circle cx="'+x.toFixed(1)+'" cy="'+y.toFixed(1)+'" r="7" fill="'+col+'" stroke="#fff" stroke-width="2"/><text x="90" y="80" text-anchor="middle" style="font:700 26px JetBrains Mono,monospace;fill:var(--text)">'+v+'</text><text x="90" y="100" text-anchor="middle" style="font:600 10px Inter;fill:var(--muted);letter-spacing:1.4px">'+(v>=60?'BULLISH':v<=40?'BEARISH':'NEUTRAL')+'</text></svg>'}
var STOP='the a an of to in on for and or with as at by from is are was be after over new says say will its it this that has have into than about amid vs how why what who xrp ripple crypto price news could may more their us one all out up not but can year today week market'.split(' ');
function trends(){var c={};rawItems.filter(function(x){return Date.now()-x.ts<864e5&&!x.g}).forEach(function(x){x.t.toLowerCase().replace(/[^a-z0-9$ ]/g,' ').split(/\s+/).forEach(function(w){if(w.length>3&&STOP.indexOf(w)<0)c[w]=(c[w]||0)+1})});return Object.keys(c).map(function(k){return [k,c[k]]}).filter(function(x){return x[1]>1}).sort(function(a,b){return b[1]-a[1]}).slice(0,22)}
function donut(parts,sz){var tot=parts.reduce(function(s,p){return s+p[1]},0)||1,R=sz/2-8,C=2*Math.PI*R,o=0,cols=['#3d8bff','#59c6ff','#8b7bff','#35d6a0','#ffd77a','#ff6b9d','#9fb0cc'],s='<svg width="'+sz+'" height="'+sz+'" viewBox="0 0 '+sz+' '+sz+'">';parts.forEach(function(p,i){var l=p[1]/tot*C;s+='<circle cx="'+sz/2+'" cy="'+sz/2+'" r="'+R+'" fill="none" stroke="'+cols[i%7]+'" stroke-width="14" stroke-dasharray="'+Math.max(0,l-2).toFixed(1)+' '+C.toFixed(1)+'" stroke-dashoffset="'+(-o).toFixed(1)+'" transform="rotate(-90 '+sz/2+' '+sz/2+')"/>';o+=l});return s+'<text x="'+sz/2+'" y="'+(sz/2+5)+'" text-anchor="middle" style="font:700 18px JetBrains Mono,monospace;fill:var(--text)">'+tot+'</text></svg>'}
function drawInsights(){if(!rawItems.length)return;var sn=sentiment(),body='';
 if(insTab==='s'){var d=rawItems.filter(function(x){return Date.now()-x.ts<6*36e5});var heat=d.length?Math.round(d.reduce(function(s,x){return s+x.i},0)/d.length):0;body=gauge(sn.score)+'<div class="mini" style="margin-top:8px"><span>News heat (6h avg importance)</span><b class="mono">'+heat+'</b></div><div class="mini"><span>Bullish / bearish headlines</span><b class="mono">'+sn.p+' / '+sn.n+'</b></div>'}
 else if(insTab==='t'){body='<div class="kw">'+trends().map(function(k){return '<span data-kw="'+esc(k[0])+'" style="font-size:'+(11+Math.min(7,k[1]))+'px">'+esc(k[0])+' <sup>'+k[1]+'</sup></span>'}).join('')+'</div>'}
 else if(insTab==='o'){var c={},mx=1;rawItems.filter(function(x){return Date.now()-x.ts<864e5}).forEach(function(x){c[x.s]=(c[x.s]||0)+1});var a=Object.keys(c).map(function(k){return [k,c[k]]}).sort(function(a,b){return b[1]-a[1]}).slice(0,8);mx=a.length?a[0][1]:1;body='<div class="bars">'+a.map(function(x){return '<div><span>'+esc(x[0])+'</span><span><i style="width:'+(x[1]/mx*100)+'%"></i></span><b>'+x[1]+'</b></div>'}).join('')+'</div>'}
 else if(insTab==='d'){var tc={};rawItems.forEach(function(x){(x.c||[]).slice(0,1).forEach(function(t){tc[t]=(tc[t]||0)+1})});var p=Object.keys(tc).map(function(k){return [k,tc[k]]}).sort(function(a,b){return b[1]-a[1]}).slice(0,7);var cols=['#3d8bff','#59c6ff','#8b7bff','#35d6a0','#ffd77a','#ff6b9d','#9fb0cc'];body='<div style="display:flex;justify-content:center">'+donut(p,150)+'</div><div class="legend">'+p.map(function(x,i){return '<span><i style="background:'+cols[i%7]+'"></i>'+esc(x[0])+' · '+x[1]+'</span>'}).join('')+'</div>'}
 else{var hr=new Array(24).fill(0),now=Date.now();rawItems.forEach(function(x){var h=Math.floor((now-x.ts)/36e5);if(h<24)hr[23-h]++});var mx=Math.max.apply(null,hr)||1;body='<div class="heat">'+hr.map(function(v,i){return '<i title="'+v+' stories" style="height:'+Math.max(6,v/mx*100)+'%;opacity:'+(.35+v/mx*.65)+'"></i>'}).join('')+'</div><div class="heatl"><span>24h ago</span><span>stories per hour</span><span>now</span></div>'}
 ins.innerHTML='<h3>Pulse<a href="/stats" data-nav="/stats">Full analytics →</a></h3><div class="seg2"><button class="chip2'+(insTab==='s'?' on':'')+'" data-t="s">Sentiment</button><button class="chip2'+(insTab==='t'?' on':'')+'" data-t="t">Trends</button><button class="chip2'+(insTab==='o'?' on':'')+'" data-t="o">Sources</button><button class="chip2'+(insTab==='d'?' on':'')+'" data-t="d">Topics</button><button class="chip2'+(insTab==='a'?' on':'')+'" data-t="a">Activity</button></div>'+body}
ins.onclick=function(e){var b=e.target.closest('[data-t]');if(b){insTab=b.getAttribute('data-t');lss('x2ins',insTab);drawInsights();return}var k=e.target.closest('[data-kw]');if(k){var q=$('q');q.value=k.getAttribute('data-kw');q.oninput&&q.oninput.call(q)}};

/* ---------- tools card: converter, alert, escrow countdown ---------- */
var tools=el('div','card tool');tools.id='cTools';cR.insertBefore(tools,ins.nextSibling);
var tooled=false;
function drawTools(){if(tooled)return;tooled=true;tools.innerHTML='<h3>Tools</h3><svg class="ekg" viewBox="0 0 260 34" preserveAspectRatio="none"><path d="M0 18h60l8-12 8 24 8-18 6 6h170" fill="none" stroke="var(--cyan)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg><label>XRP ⇄ USD CONVERTER</label><div class="two"><input id="cvx" type="number" min="0" step="any" placeholder="XRP"><input id="cvu" type="number" min="0" step="any" placeholder="USD"></div><label>PRICE ALERT (USD)</label><div class="two"><input id="pa" type="number" step="any" placeholder="Above"><input id="pb" type="number" step="any" placeholder="Below"></div><label>NEXT ESCROW RELEASE</label><div class="cd2" id="escd"></div>';
 var px=function(){var m=mk('ripple');return m?m.p:0};
 $('cvx').oninput=function(){var v=+this.value;$('cvu').value=v?(v*px()).toFixed(2):''};$('cvu').oninput=function(){var v=+this.value,p=px();$('cvx').value=v&&p?(v/p).toFixed(2):''};
 $('pa').value=CFG.alertAbove||'';$('pb').value=CFG.alertBelow||'';$('pa').onchange=function(){CFG.alertAbove=+this.value||0;alerted.a=0;save();toast('Alert set','ok')};$('pb').onchange=function(){CFG.alertBelow=+this.value||0;alerted.b=0;save();toast('Alert set','ok')};
 setInterval(escd,1000);escd()}
function escd(){var e=$('escd');if(!e)return;var n=new Date(),t=Date.UTC(n.getUTCFullYear(),n.getUTCMonth()+1,1)-n.getTime(),d=Math.floor(t/864e5),h=Math.floor(t%864e5/36e5),m=Math.floor(t%36e5/6e4),s=Math.floor(t%6e4/1e3);e.innerHTML='<div><b>'+d+'</b><small>DAYS</small></div><div><b>'+h+'</b><small>HRS</small></div><div><b>'+m+'</b><small>MIN</small></div><div><b>'+s+'</b><small>SEC</small></div>'}

/* price chart modal */
function modal(cls,html){var o=el('div','ov on');o.innerHTML='<div class="md '+(cls||'')+'">'+html+'</div>';o.onclick=function(e){if(e.target===o)o.remove()};document.body.appendChild(o);return o}
function closeAll(){document.querySelectorAll('.ov').forEach(function(o){o.remove()});var d=$('drw');if(d)d.classList.remove('on');tvOff()}
$('cMkt').style.cursor='pointer';$('cMkt').addEventListener('click',function(e){if(e.target.closest('a'))return;var x=mk('ripple');if(!x||!x.sp)return;var o=modal('','<button class="x" onclick="this.closest(\'.ov\').remove()">✕</button><h2>XRP — 7 day price</h2><div class="sub">4-hour candles · hover for details</div><svg id="pm" class="ch" viewBox="0 0 660 260"></svg>');
  var v=x.sp,mn=Math.min.apply(null,v),mx=Math.max.apply(null,v),W=660,H=260,pad=44,sx=function(i){return pad+i/(v.length-1)*(W-pad-12)},sy=function(y){return H-24-(y-mn)/((mx-mn)||1)*(H-44)},pts=v.map(function(y,i){return sx(i).toFixed(1)+','+sy(y).toFixed(1)}),up=v[v.length-1]>=v[0],c=up?'#35d6a0':'#ff5d73';
  var s='<defs><linearGradient id="pmg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="'+c+'" stop-opacity=".35"/><stop offset="1" stop-color="'+c+'" stop-opacity="0"/></linearGradient></defs>';for(var i=0;i<5;i++){var yy=mn+(mx-mn)*i/4;s+='<line x1="'+pad+'" x2="'+(W-12)+'" y1="'+sy(yy)+'" y2="'+sy(yy)+'" stroke="var(--line)"/><text x="4" y="'+(sy(yy)+3)+'">$'+yy.toFixed(3)+'</text>'}
  s+='<polygon points="'+pad+','+(H-24)+' '+pts.join(' ')+' '+(W-12)+','+(H-24)+'" fill="url(#pmg)"/><polyline points="'+pts.join(' ')+'" fill="none" stroke="'+c+'" stroke-width="2.2"/><line id="pmx" y1="10" y2="'+(H-24)+'" stroke="var(--cyan)" stroke-dasharray="3 3" style="display:none"/><circle id="pmc" r="5" fill="'+c+'" stroke="#fff" stroke-width="2" style="display:none"/>';$('pm').innerHTML=s;
  var tp=tip();$('pm').onmousemove=function(e){var r=this.getBoundingClientRect(),i=Math.round(((e.clientX-r.left)/r.width*W-pad)/(W-pad-12)*(v.length-1));i=Math.max(0,Math.min(v.length-1,i));$('pmx').setAttribute('x1',sx(i));$('pmx').setAttribute('x2',sx(i));$('pmx').style.display='';var cc=$('pmc');cc.setAttribute('cx',sx(i));cc.setAttribute('cy',sy(v[i]));cc.style.display='';var ago=(v.length-1-i)*4;tp.show(e,'$'+v[i].toFixed(4)+'<br><span style="color:var(--dim)">'+(ago?ago+'h ago':'latest')+'</span>')};$('pm').onmouseleave=function(){tp.hide()}});
function tip(){var t=$('xtip');if(!t){t=el('div','tip');t.id='xtip';document.body.appendChild(t)}return {show:function(e,h){t.innerHTML=h;t.style.display='block';t.style.left=Math.min(innerWidth-170,e.clientX+14)+'px';t.style.top=(e.clientY+14)+'px'},hide:function(){t.style.display='none'}}}
window.XDtip=tip;

/* ---------- quick-view drawer + share ---------- */
var drw=el('div','drawer');drw.id='drw';document.body.appendChild(drw);
function rel(it){var w=function(s){return s.toLowerCase().replace(/[^a-z0-9 ]/g,' ').split(/\s+/).filter(function(x){return x.length>3&&STOP.indexOf(x)<0})},a=w(it.t),sc=[];rawItems.forEach(function(o){if(o.id===it.id)return;var b=w(o.t),n=0;a.forEach(function(x){if(b.indexOf(x)>=0)n++});if(n>=2)sc.push([n,o])});return sc.sort(function(a,b){return b[0]-a[0]}).slice(0,4).map(function(x){return x[1]})}
function openDrawer(it){READ[it.id]=Date.now();saveRD();var r=rel(it),ago=Math.round((Date.now()-it.ts)/6e4);
 drw.innerHTML='<button class="btn2" id="dc" style="float:right">Close ✕</button><div class="tags">'+(it.c||[]).map(function(c){return '<span class="tg">'+esc(c)+'</span>'}).join('')+(it.g?'<span class="tg g">'+esc(it.r)+'</span>':'')+'</div><h2>'+esc(it.t)+'</h2><div class="sub" style="color:var(--muted);font-size:13px">'+esc(it.s)+' · '+(ago<60?ago+' min':Math.round(ago/60)+' h')+' ago'+(it.n>1?' · reported by '+it.n+' sources':'')+'</div>'+((it.ss||[]).length>1?'<div style="font-size:12.5px;color:var(--muted)">Also covered by: '+it.ss.slice(1,6).map(esc).join(', ')+'</div>':'')+'<div class="btns"><a class="btn2 pri" href="'+esc(it.u)+'" target="_blank" rel="noopener noreferrer">Read full story ↗</a><button class="btn2" data-d="star">'+(bmHas(it.id)?'★ Saved':'☆ Save')+'</button><button class="btn2" data-d="copy">Copy link</button><button class="btn2" data-d="head">Copy headline</button></div><div class="btns" id="shr"></div>'+(r.length?'<h4 style="font-size:10.5px;letter-spacing:1.5px;color:var(--dim);margin:18px 0 4px">RELATED STORIES</h4><div class="rel">'+r.map(function(o){return '<a data-o="'+esc(o.id)+'">'+esc(o.t)+'<br><small style="color:var(--dim)">'+esc(o.s)+'</small></a>'}).join('')+'</div>':'');
 shareBtns($('shr'),it);drw.classList.add('on');drw.onclick=function(e){var b=e.target.closest('[data-d],[data-o],#dc');if(!b)return;if(b.id==='dc'){drw.classList.remove('on');return}var d=b.getAttribute('data-d');if(d==='star'){toggleBM(it);b.textContent=bmHas(it.id)?'★ Saved':'☆ Save'}else if(d==='copy'){copy(it.u);toast('Link copied','ok')}else if(d==='head'){copy(it.t+' — '+it.u);toast('Copied','ok')}else{var o=findItem(b.getAttribute('data-o'));if(o)openDrawer(o)}};window.XD_rf()}
function shareBtns(box,it){var u=encodeURIComponent(it.u||location.href),t=encodeURIComponent(it.t||document.title);box.innerHTML='<a class="btn2" target="_blank" rel="noopener" href="https://twitter.com/intent/tweet?text='+encodeURIComponent((it.t||document.title)+'\n\n'+(it.u||location.href)+'\n\nView at XRPLTODAY.com #XRPL #XRP #XRPTODAY')+'">𝕏</a><a class="btn2" target="_blank" rel="noopener" href="https://t.me/share/url?url='+u+'&text='+t+'">Telegram</a><a class="btn2" target="_blank" rel="noopener" href="https://wa.me/?text='+t+'%20'+u+'">WhatsApp</a><a class="btn2" target="_blank" rel="noopener" href="https://www.reddit.com/submit?url='+u+'&title='+t+'">Reddit</a>'+(navigator.share?'<button class="btn2" id="ns">Share…</button>':'');var n=box.querySelector('#ns');if(n)n.onclick=function(){navigator.share({title:it.t,url:it.u}).catch(function(){})}}
function openShare(it){var o=modal('','<button class="x" onclick="this.closest(\'.ov\').remove()">✕</button><h2>Share</h2><div class="sub">'+esc(it.t)+'</div><div class="btns" id="shb"></div>');shareBtns(o.querySelector('#shb'),it)}

/* ---------- briefing, TV wall, zen ---------- */
function briefing(){var a=rawItems.filter(function(x){return Date.now()-x.ts<12*36e5}).sort(function(a,b){return b.i-a.i||b.ts-a.ts}).slice(0,10);var txt=a.map(function(x,i){return (i+1)+'. '+x.t+' ('+x.s+')'}).join('\n');var o=modal('brief','<button class="x" onclick="this.closest(\'.ov\').remove()">✕</button><h2>Briefing — top 10 right now</h2><div class="sub">Highest-impact stories from the last 12 hours</div><ol>'+a.map(function(x){return '<li><a href="'+esc(x.u)+'" target="_blank" rel="noopener">'+esc(x.t)+'</a><small>'+esc(x.s)+'</small></li>'}).join('')+'</ol><div class="btns"><button class="btn2 pri" id="bc">Copy as text</button></div>');o.querySelector('#bc').onclick=function(){copy('XRPLTODAY briefing\n\n'+txt);toast('Briefing copied','ok')}}
var tv=el('div');tv.id='tv';document.body.appendChild(tv);var tvT=null,tvI=0;
function tvOn(){var a=rawItems.filter(function(x){return Date.now()-x.ts<24*36e5&&!x.g}).sort(function(a,b){return b.i-a.i}).slice(0,12);if(!a.length)return;tv.classList.add('on');try{document.documentElement.requestFullscreen&&document.documentElement.requestFullscreen()}catch(e){}
 function d(){var it=a[tvI++%a.length],x=mk('ripple');window.__tvit={t:it.t,s:it.s,u:it.u,im:it.im,x:x};tv.innerHTML='<button class="x" onclick="document.exitFullscreen&&document.fullscreenElement&&document.exitFullscreen();document.getElementById(\'tv\').classList.remove(\'on\')">✕</button><div class="th"><b>XRPL<span style="color:var(--cyan)">TODAY</span> · LIVE</b><span class="mono">'+new Date().toISOString().slice(11,19)+' UTC</span></div><div class="big"><small>'+esc(it.s.toUpperCase())+'</small><h1>'+esc(it.t)+'</h1><a class="tvpill" href="'+esc(it.u)+'" target="_blank" rel="noopener noreferrer">Go to the post <span>↗</span></a><button class="tvpill" id="tvx" style="margin-left:14px;border:0;cursor:pointer">Post screen to X <span>𝕏</span></button></div><div class="tk2"><span>XRP <b>'+(x?'$'+x.p.toFixed(4):'—')+'</b></span><span>24H <b>'+(x?(x.c24>=0?'+':'')+x.c24.toFixed(2)+'%':'—')+'</b></span><span>Story <b>'+((tvI-1)%a.length+1)+'/'+a.length+'</b></span></div>'}
 d();clearInterval(tvT);tvT=setInterval(function(){if(!tv.classList.contains('on'))return clearInterval(tvT);if(tv.matches(':hover'))return;d()},9000)}
function tvOff(){tv.classList.remove('on');clearInterval(tvT);try{document.fullscreenElement&&document.exitFullscreen()}catch(e){}}
function zen(){document.body.classList.toggle('zen');toast(document.body.classList.contains('zen')?'Focus mode on — press F to exit':'Focus mode off')}

/* ---------- settings + features + shortcuts modals ---------- */
function tg(k,l,s){return '<div class="r"><div>'+l+(s?'<small>'+s+'</small>':'')+'</div><button class="tg2'+(CFG[k]?' on':'')+'" data-k="'+k+'"></button></div>'}
function settings(){var o=modal('set','<button class="x" onclick="this.closest(\'.ov\').remove()">✕</button><h2>Settings</h2><div class="sub">Saved in this browser only</div><h4>APPEARANCE</h4><div class="r"><div>Accent color</div><div class="sw">'+Object.keys(ACC).map(function(k){return '<button data-ac="'+k+'" class="'+(CFG.accent===k?'on':'')+'" style="background:'+ACC[k][0]+';color:'+ACC[k][0]+'"></button>'}).join('')+'</div></div><div class="r"><div>Default view</div><div id="svt"></div></div><div class="r"><div>Compact density<small>Tighter rows, hides the stat strip</small></div><button class="tg2'+(CFG.dens==='compact'?' on':'')+'" data-k="dens"></button></div><div class="r"><div>Text size</div><input type="range" min=".9" max="1.25" step=".05" value="'+CFG.fs+'" id="fsr" style="width:140px"></div>'+tg('fx','Visual effects','Animated background, glow and 3D tilt')+'<h4>ALERTS</h4>'+tg('notify','Desktop notifications','For high-impact stories and price alerts')+tg('sound','Sound ping','On new high-impact stories')+'<h4>FILTERS</h4><div class="r" style="display:block"><div>Watch keywords (highlighted)<small>Comma separated, e.g. etf, sec, rlusd</small></div><input type="text" id="sw" value="'+esc(CFG.watch)+'"></div><div class="r" style="display:block"><div>Mute keywords</div><input type="text" id="sk" value="'+esc(CFG.mutek)+'"></div><div class="r" style="display:block"><div>Mute sources</div><input type="text" id="ss" value="'+esc(CFG.mutes)+'"></div><h4>DATA</h4><div class="btns"><button class="btn2" id="e1">Export saved (JSON)</button><button class="btn2" id="e2">Export saved (CSV)</button><button class="btn2" id="e3">Export settings</button><button class="btn2" id="e4">Import settings</button><button class="btn2" id="e5">Clear read history</button></div>');
 var vt=mkVT();o.querySelector('#svt').appendChild(vt);applyCfg();
 o.onclick=function(e){if(e.target===o){o.remove();return}var b=e.target.closest('[data-k],[data-ac]');if(!b)return;if(b.hasAttribute('data-ac')){CFG.accent=b.getAttribute('data-ac');o.querySelectorAll('[data-ac]').forEach(function(x){x.classList.toggle('on',x===b)})}else{var k=b.getAttribute('data-k');if(k==='dens')CFG.dens=CFG.dens==='compact'?'cozy':'compact';else{CFG[k]=!CFG[k];if(k==='notify'&&CFG.notify&&window.Notification)Notification.requestPermission()}b.classList.toggle('on')}save();applyCfg()};
 o.querySelector('#fsr').oninput=function(){CFG.fs=+this.value;save();applyCfg()};
 ['sw:watch','sk:mutek','ss:mutes'].forEach(function(p){var q=p.split(':');o.querySelector('#'+q[0]).onchange=function(){CFG[q[1]]=this.value;save();refilter()}});
 o.querySelector('#e1').onclick=function(){dl('xrpldaily-saved.json',JSON.stringify(BM,null,2),'application/json')};
 o.querySelector('#e2').onclick=function(){dl('xrpldaily-saved.csv','title,source,url,time,importance\n'+BM.map(function(x){return [x.t,x.s,x.u,new Date(x.ts).toISOString(),x.i].map(function(v){return '"'+String(v).replace(/"/g,'""')+'"'}).join(',')}).join('\n'),'text/csv')};
 o.querySelector('#e3').onclick=function(){dl('xrpldaily-settings.json',JSON.stringify({cfg:CFG,saved:BM}),'application/json')};
 o.querySelector('#e4').onclick=function(){var f=el('input');f.type='file';f.accept='.json';f.onchange=function(){var r=new FileReader();r.onload=function(){try{var j=JSON.parse(r.result);if(j.cfg){CFG=Object.assign({},DEF,j.cfg);save()}if(j.saved){BM=j.saved;saveBM()}applyCfg();refilter();toast('Settings imported','ok')}catch(e){toast('Invalid file')}};r.readAsText(f.files[0])};f.click()};
 o.querySelector('#e5').onclick=function(){READ={};saveRD();window.XD_rf();toast('Read history cleared','ok')}}
function dl(n,t,m){var a=el('a');a.href=URL.createObjectURL(new Blob([t],{type:m}));a.download=n;a.click()}
var FEAT={'Visuals':['Animated aurora + particle-network background','Cursor spotlight glow','3D tilt on blog cards','Animated gradient borders','Live market-pulse strip with sparklines','Count-up price animation with flash','Interactive 7-day price chart','Sentiment gauge','Trending keyword cloud','Topic donut chart','24-hour activity heatmap','News-heat meter','Ledger heartbeat','Splash intro','Scroll progress bar','Smooth view transitions'],'Views':['Grid view (default) and List view everywhere','Importance rings on grid cards','Full Ledger Analytics page','Focus mode','TV wall mode','Compact density','Accent color themes (6)','Text size control'],'Story tools':['Save stories + Saved tab','Read / unread tracking','Mark all read','Unread-only filter','Quick-view drawer','Related stories','Copy link / headline','Share to X, Telegram, WhatsApp, Reddit','Time-range chips','Language filter','Mute sources','Mute keywords','Watch-keyword highlights','Pause feed with new counter'],'Power tools':['Command palette (Ctrl/Cmd+K)','Keyboard navigation (j / k)','Shortcut cheat-sheet','Back-to-top','Settings panel','Toast notifications','Desktop notifications','Sound ping','Price alerts','XRP ⇄ USD converter','Live escrow countdown','Top-10 briefing','Export saved (JSON / CSV)','Export / import settings'],'Blog':['Table of contents','Reading-progress bar','Post text size','Post share bar']};
function features(){var n=0,h='';Object.keys(FEAT).forEach(function(k){n+=FEAT[k].length;h+='<h5>'+k.toUpperCase()+'</h5>'+FEAT[k].map(function(f){return '✓ '+esc(f)+'<br>'}).join('')});modal('','<button class="x" onclick="this.closest(\'.ov\').remove()">✕</button><h2>What’s new — '+n+' upgrades</h2><div class="sub">Everything added in this release</div><div class="fl">'+h+'</div>')}
var SC=[['/','Search'],['j / k','Next / previous story'],['o','Open story'],['e','Quick view'],['s','Save story'],['r','Mark read'],['m','Mark all read'],['v','Toggle grid / list'],['t','Toggle theme'],['f','Focus mode'],['w','TV wall'],['b','Briefing'],['g n / g b / g d / g a','Go news / blog / daily / analytics'],['Ctrl+K','Command palette'],[',','Settings'],['?','This help'],['Esc','Close']];
function help(){modal('','<button class="x" onclick="this.closest(\'.ov\').remove()">✕</button><h2>Keyboard shortcuts</h2><div class="sub">Press ? any time</div><div class="kg">'+SC.map(function(s){return '<div><span>'+s[1]+'</span><span class="kbd">'+s[0]+'</span></div>'}).join('')+'</div>')}

/* command palette */
var CMDS=[['🔎','Search stories…','/',function(){$('q').focus()}],['📰','Go to News Terminal','g n',function(){A.go('/')}],['✍️','Go to XRPLTODAY Blog','g b',function(){A.go('/blog')}],['🌱','Go to BONSAI × LUMA Daily','g d',function(){A.go('/daily')}],['▦','Go to XRPL Squares','g q',function(){A.go('/squares')}],['📊','Go to Ledger Analytics','g a',function(){A.go('/stats')}],['▦','Switch to grid view','v',function(){setView('grid')}],['☰','Switch to list view','v',function(){setView('list')}],['🌓','Toggle theme','t',function(){$('theme').click()}],['🎯','Focus mode','f',zen],['📺','TV wall mode','w',tvOn],['🗞','Top-10 briefing','b',briefing],['⚙️','Settings',',',settings],['✨','What’s new',null,features],['⌨️','Keyboard shortcuts','?',help],['✅','Mark all read','m',markAll],['⭐','Show saved stories',null,function(){S.tab='Saved';A.go('/');A.tabs();A.render()}],['⏸','Pause / resume feed',null,function(){$('pz').click()}]];
['All','XRP','XRPL','RLUSD','Ripple','Regulation','ETF','Markets','Global'].forEach(function(t){CMDS.push(['#','Filter: '+t,null,function(){S.tab=t;A.go('/');A.tabs();A.render()}])});
function palette(){var o=modal('cp','<input id="cpi" placeholder="Type a command or search stories…" autocomplete="off"><ul id="cpl"></ul>');o.querySelector('.md').style.padding=0;o.querySelector('.md').classList.add('cp');var inp=o.querySelector('#cpi'),ul=o.querySelector('#cpl'),sel=0,list=[];
 function draw(){var q=inp.value.toLowerCase().trim();list=CMDS.filter(function(c){return !q||c[1].toLowerCase().indexOf(q)>=0}).slice(0,9).map(function(c){return {i:c[0],t:c[1],k:c[2],f:c[3]}});if(q.length>1)rawItems.filter(function(x){return x.t.toLowerCase().indexOf(q)>=0}).slice(0,6).forEach(function(x){list.push({i:'📄',t:x.t.slice(0,90),k:x.s,f:function(){openDrawer(x)}})});sel=Math.min(sel,Math.max(0,list.length-1));ul.innerHTML=list.map(function(c,i){return '<li data-i="'+i+'" class="'+(i===sel?'on':'')+'"><i>'+c.i+'</i>'+esc(c.t)+(c.k?'<small>'+esc(c.k)+'</small>':'')+'</li>'}).join('')}
 function run(i){var c=list[i];if(c){o.remove();c.f()}}
 inp.oninput=function(){sel=0;draw()};inp.onkeydown=function(e){if(e.key==='ArrowDown'){sel=Math.min(list.length-1,sel+1);draw();e.preventDefault()}else if(e.key==='ArrowUp'){sel=Math.max(0,sel-1);draw();e.preventDefault()}else if(e.key==='Enter')run(sel);else if(e.key==='Escape')o.remove()};ul.onclick=function(e){var li=e.target.closest('li');if(li)run(+li.getAttribute('data-i'))};draw();inp.focus()}

/* keyboard */
var selI=-1,gk=0;
function rows(){return Array.prototype.slice.call(document.querySelectorAll('#feed .row'))}
function move(d){var r=rows();if(!r.length)return;if(selI>=0&&r[selI])r[selI].classList.remove('sel');selI=Math.max(0,Math.min(r.length-1,selI+d));r[selI].classList.add('sel');r[selI].scrollIntoView({block:'center',behavior:'smooth'})}
function cur(){var r=rows();return r[selI]?findItem(r[selI].getAttribute('data-id')):null}
document.addEventListener('keydown',function(e){var tgt=e.target,typing=/INPUT|TEXTAREA|SELECT/.test(tgt.tagName);
 if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='k'){e.preventDefault();palette();return}
 if(e.key==='Escape'){closeAll();if(typing)tgt.blur();return}
 if(typing||e.ctrlKey||e.metaKey||e.altKey)return;var k=e.key;
 if(gk&&Date.now()-gk<1200){gk=0;if(k==='n')A.go('/');else if(k==='b')A.go('/blog');else if(k==='d')A.go('/daily');else if(k==='a')A.go('/stats');else if(k==='q')A.go('/squares');return}
 if(k==='g'){gk=Date.now();return}
 if(k==='/'){e.preventDefault();$('q').focus()}else if(k==='?')help();else if(k===',')settings();else if(k==='t')$('theme').click();else if(k==='f')zen();else if(k==='w')tvOn();else if(k==='b')briefing();else if(k==='v')setView(CFG.view==='grid'?'list':'grid');else if(k==='m')markAll();
 else if(k==='j')move(1);else if(k==='k')move(-1);else if(k==='o'||k==='Enter'){var it=cur();if(it){READ[it.id]=Date.now();saveRD();window.open(it.u,'_blank','noopener');window.XD_rf()}}else if(k==='s'){var i2=cur();if(i2)toggleBM(i2)}else if(k==='e'){var i3=cur();if(i3)openDrawer(i3)}else if(k==='r'){var i4=cur();if(i4){READ[i4.id]=Date.now();saveRD();window.XD_rf()}}});

/* header buttons */
var top=document.querySelector('.top');var th=$('theme');
function hb(t,h,f){var b=el('button','ib',h);b.title=t;b.onclick=f;top.insertBefore(b,th);return b}
hb('Command palette (Ctrl+K)','<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/></svg>',palette);
hb('Briefing','<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 4h14v16H5zM9 9h6M9 13h6M9 17h3"/></svg>',briefing);
hb('Focus mode','<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/></svg>',zen);
hb('TV wall','<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="12" rx="2"/><path d="M8 20h8M12 16v4"/></svg>',tvOn);
hb('What’s new','<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 3l2.4 5.6 5.6.8-4 4 1 5.8-5-2.8-5 2.8 1-5.8-4-4 5.6-.8z"/></svg>',features);
hb('Settings (,)','<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M5 19l2-2M17 7l2-2"/></svg>',settings);
var hs=el('button','nav',ic('star').replace('<svg','<svg width="18" height="18"')+'Saved stories');hs.onclick=function(){S.tab='Saved';A.go('/');A.tabs();A.render()};var sd=document.querySelector('[data-tab="Regulation"]');if(sd)sd.parentNode.insertBefore(hs,sd);
var ns=el('div','nav',ic('grid').replace('<svg','<svg width="18" height="18"')+'View');ns.style.cursor='default';ns.appendChild(el('span')).style.marginLeft='auto';ns.lastChild.appendChild(mkVT());var gl=document.querySelector('.grow');if(gl)gl.parentNode.insertBefore(ns,gl);
applyCfg();

/* view hook: transitions, blog view toggle, post extras */
var vb=document.querySelector('#vBlog .ftabs');if(vb){var bt=mkVT();bt.style.marginLeft='auto';vb.style.display='flex';vb.style.alignItems='center';vb.appendChild(bt);applyCfg()}
window.XD_show=function(v){var id={news:'vNews',blog:'vBlog',post:'vPost',stats:'vStats',squares:'vSquares',token:'vToken',tokens:'vTokens'}[v],e=$(id);if(e&&CFG.fx){e.classList.remove('vt');void e.offsetWidth;e.classList.add('vt')}
 document.querySelectorAll('.nav[data-go=stats]').forEach(function(n){n.classList.toggle('on',v==='stats')});applyCfg();
 if(v==='stats'&&!window.XDS){var s=el('script');s.src='/stats.js';document.body.appendChild(s)}
 if(v==='squares'&&!window.XDQ){var s3=el('script');s3.src='/squares.js';document.body.appendChild(s3)}
 if(v==='ads'&&!window.XDA){var s2=el('script');s2.src='/ads.js';document.body.appendChild(s2)}
 document.querySelectorAll('.nav[data-go=squares]').forEach(function(n){n.classList.toggle('on',v==='squares')});document.querySelectorAll('.nav[data-go=ads]').forEach(function(n){n.classList.toggle('on',v==='ads')})};
var pv0={'/squares':'squares','/stats':'stats','/advertise':'ads'}[location.pathname];if(pv0)window.XD_show(pv0);
window.XD_token=function(slug){if(window.XD_token.__ok)return window.XD_token(slug);var s=el('script');s.src='/token.js';s.onload=function(){window.XD_token(slug)};document.body.appendChild(s)};
window.XD_tn=function(slug){if(window.XD_tn.__ok)return window.XD_tn(slug);var s=el('script');s.src='/tn.js';s.onload=function(){window.XD_tn(slug)};document.body.appendChild(s)};
if(location.pathname==='/tokens'||location.pathname.indexOf('/tokens/')===0){window.XD_show('tokens');window.XD_tn(location.pathname.length>8?decodeURIComponent(location.pathname.slice(8)):'')}
if(location.pathname.indexOf('/token/')===0)window.XD_token(decodeURIComponent(location.pathname.slice(7)));
var mo=new MutationObserver(function(){var a=document.querySelector('#vPost .art');if(!a||a.getAttribute('data-x'))return;a.setAttribute('data-x','1');var hs=a.querySelectorAll('h2');var bd=a.querySelector('.body,.md,.pb')||a;
 var pbr=el('div','pbar','<i></i>');a.insertBefore(pbr,a.firstChild);
 var tools=el('div','postbar','<button class="btn2" data-p="a-">A−</button><button class="btn2" data-p="a+">A+</button><button class="btn2" data-p="cp">Copy link</button><span id="psh" style="display:flex;gap:8px;flex-wrap:wrap"></span>');var h1=a.querySelector('h2');if(h1)h1.parentNode.insertBefore(tools,h1.nextSibling);
 shareBtns(tools.querySelector('#psh'),{u:location.href,t:(h1&&h1.textContent)||document.title});
 var sz=lsg('x2ps',1);a.style.fontSize=sz+'em';tools.onclick=function(e){var b=e.target.closest('[data-p]');if(!b)return;var p=b.getAttribute('data-p');if(p==='a-')sz=Math.max(.85,sz-.08);else if(p==='a+')sz=Math.min(1.4,sz+.08);else{copy(location.href);toast('Link copied','ok')}a.style.fontSize=sz+'em';lss('x2ps',sz)};
 var heads=Array.prototype.slice.call(a.querySelectorAll('h3,h4')).filter(function(x){return x.closest('.art')===a});if(heads.length>=3){var toc=el('div','toc','<b>IN THIS ARTICLE</b>'+heads.map(function(x,i){x.id='sec'+i;return '<a data-s="sec'+i+'">'+esc(x.textContent)+'</a>'}).join(''));tools.parentNode.insertBefore(toc,tools.nextSibling);toc.onclick=function(e){var l=e.target.closest('[data-s]');if(l)$(l.getAttribute('data-s')).scrollIntoView({behavior:'smooth',block:'start'})}}});
mo.observe($('vPost'),{childList:true,subtree:true});

/* ---------- sponsor boxes (left nav) ---------- */
var AD={slots:{},prices:{1:99,2:79,3:59}};window.XDad=function(){return AD};
function drawSpons(){var h='';for(var i=1;i<=3;i++){var a=AD.slots[i];
  if(a)h+='<a class="spb" href="/go/ad/'+esc(a.id)+'" target="_blank" rel="sponsored noopener" style="--g1:'+esc(a.grad[0])+';--g2:'+esc(a.grad[1])+'"><span class="tag">SPONSORED</span><b>'+esc(a.title)+'</b><small>'+esc(a.desc)+'</small><i>Visit site ↗</i></a>';
  else h+='<a class="spb empty" href="/advertise" data-nav="/advertise"><span class="tag">AD SLOT '+i+'</span><b>Your ad here</b><small>Reach XRP &amp; XRPL readers worldwide — from $'+esc(AD.prices[i])+' / '+(AD.days||30)+' days</small><i>Advertise →</i></a>'}
 $('spons').innerHTML=h+'<a class="spl" href="/advertise" data-nav="/advertise">Advertise with XRPLTODAY</a>'}
function loadAds(){fetch('/api/ads',{cache:'no-store'}).then(function(r){return r.json()}).then(function(d){AD=d;AD.slots=d.slots||{};drawSpons()}).catch(function(){drawSpons()})}
drawSpons();loadAds();setInterval(function(){document.visibilityState==='visible'&&loadAds()},900000);

/* ---------- social pulse card (#XRPL / #XRP / #RLUSD) ---------- */
var soc=el('div','card');soc.id='cSoc';cR.insertBefore(soc,$('cCal'));
function drawSoc(d){var it=(d&&d.items)||[];soc.innerHTML='<h3>Social Pulse<small style="font-size:11px;color:var(--dim);font-weight:500">#XRPL #XRP #RLUSD</small></h3>'+(it.length?it.slice(0,6).map(function(p){var m=Math.max(1,Math.round((Date.now()-p.ts)/6e4)),t=m<60?m+'m':m<1440?Math.round(m/60)+'h':Math.round(m/1440)+'d';return '<a class="sp" href="'+esc(p.u)+'" target="_blank" rel="noopener noreferrer"><div><span class="sb '+p.s+'">'+(p.s==='x'?'𝕏':'Mastodon')+'</span> <b>'+esc(p.a)+'</b> <small>'+t+'</small></div><p>'+esc(p.t.length>170?p.t.slice(0,168)+'…':p.t)+'</p><small>♥ '+p.l+' · ↻ '+p.r+'</small></a>'}).join('')+(d.x?'':'<div class="mini"><span>Posts from X appear once an X API key is connected</span></div>'):'<div style="color:var(--muted)">No recent posts found.</div>')}
function loadSoc(){fetch('/api/social').then(function(r){return r.json()}).then(drawSoc).catch(function(){})}
loadSoc();setInterval(function(){document.visibilityState==='visible'&&loadSoc()},600000);

window.XD_cfgApply=applyCfg;
/* ---------- upgraded market + ledger card graphics ---------- */
function enhMkt(){var x=mk('ripple'),c=$('cMkt');if(!x||!x.sp||!c)return;var old=c.querySelector('svg');if(!old)return;var v=x.sp,W=340,H=120,mn=Math.min.apply(null,v),mxv=Math.max.apply(null,v),r=(mxv-mn)||1,up=v[v.length-1]>=v[0],col=up?'#35d6a0':'#ff5d73',sx=function(i){return 4+i/(v.length-1)*(W-8)},sy=function(y){return H-10-((y-mn)/r)*(H-26)},p=v.map(function(y,i){return sx(i).toFixed(1)+','+sy(y).toFixed(1)}),hi=v.indexOf(mxv),lo=v.indexOf(mn),s='<defs><linearGradient id="mg1" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="'+col+'" stop-opacity=".42"/><stop offset="1" stop-color="'+col+'" stop-opacity="0"/></linearGradient><filter id="mgf"><feGaussianBlur stdDeviation="3.5"/></filter></defs>';
  for(var i=1;i<4;i++)s+='<line x1="0" x2="'+W+'" y1="'+(H*i/4)+'" y2="'+(H*i/4)+'" stroke="var(--line)" stroke-dasharray="2 5"/>';
  s+='<polygon points="4,'+H+' '+p.join(' ')+' '+(W-4)+','+H+'" fill="url(#mg1)"/><polyline points="'+p.join(' ')+'" fill="none" stroke="'+col+'" stroke-width="6" opacity=".35" filter="url(#mgf)"/><polyline points="'+p.join(' ')+'" fill="none" stroke="'+col+'" stroke-width="2.2" stroke-linejoin="round" stroke-linecap="round"/>';
  s+='<circle cx="'+sx(hi)+'" cy="'+sy(mxv)+'" r="3" fill="#fff"/><text x="'+Math.min(W-40,sx(hi)+5)+'" y="'+(sy(mxv)-5)+'" style="font:600 9px JetBrains Mono,monospace;fill:var(--muted)">$'+mxv.toFixed(3)+'</text><circle cx="'+sx(lo)+'" cy="'+sy(mn)+'" r="3" fill="#fff"/><text x="'+Math.min(W-40,sx(lo)+5)+'" y="'+(sy(mn)+12)+'" style="font:600 9px JetBrains Mono,monospace;fill:var(--muted)">$'+mn.toFixed(3)+'</text>';
  var lx=sx(v.length-1),ly=sy(v[v.length-1]);s+='<circle cx="'+lx+'" cy="'+ly+'" r="9" fill="'+col+'" opacity=".25"><animate attributeName="r" values="4;12;4" dur="2s" repeatCount="indefinite"/><animate attributeName="opacity" values=".5;0;.5" dur="2s" repeatCount="indefinite"/></circle><circle cx="'+lx+'" cy="'+ly+'" r="4" fill="'+col+'" stroke="#fff" stroke-width="1.6"/>';
  var n=document.createElementNS('http://www.w3.org/2000/svg','svg');n.setAttribute('viewBox','0 0 '+W+' '+H);n.setAttribute('width','100%');n.setAttribute('height',H);n.setAttribute('preserveAspectRatio','none');n.innerHTML=s;old.parentNode.replaceChild(n,old)}
var _xl=window.XD_load;window.XD_load=function(d){_xl(d);try{enhMkt();var l=document.querySelector('#cLedger h3');if(l&&!document.querySelector('#cLedger .ekg')){l.insertAdjacentHTML('afterend','<svg class="ekg" viewBox="0 0 260 34" preserveAspectRatio="none"><path d="M0 18h60l8-12 8 24 8-18 6 6h170" fill="none" stroke="var(--cyan)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>')}}catch(e){}};
})();

/* v5: blog share bar */
(function(){function share(a){var h=a.querySelector('h2'),t=h?h.textContent:'XRPLTODAY',u=location.href.split('#')[0],tx=encodeURIComponent(t+' — via XRPLTODAY'),uu=encodeURIComponent(u);
 var d=document.createElement('div');d.className='shr';d.innerHTML='<span class="mu">Share</span><a class="btn2 pri" target="_blank" rel="noopener" href="https://twitter.com/intent/tweet?text='+encodeURIComponent(t+'\n\n'+u+'\n\nView at XRPLTODAY.com #XRPL #XRP #XRPTODAY')+'">Post to X ↗</a><a class="btn2" target="_blank" rel="noopener" href="https://t.me/share/url?url='+uu+'&text='+tx+'">Telegram</a><a class="btn2" target="_blank" rel="noopener" href="https://www.reddit.com/submit?url='+uu+'&title='+tx+'">Reddit</a><button class="btn2" data-cp="1">Copy link</button><button class="btn2" data-sh="1">Share…</button>';
 d.onclick=function(e){var b=e.target.closest('button');if(!b)return;if(b.getAttribute('data-cp')){try{navigator.clipboard.writeText(u).then(function(){window.XDtoast&&window.XDtoast('Link copied')})}catch(x){}}else if(navigator.share)navigator.share({title:t,url:u}).catch(function(){});else{try{navigator.clipboard.writeText(u);window.XDtoast&&window.XDtoast('Link copied')}catch(x){}}};
 var am=a.querySelector('.am');if(am)am.parentNode.insertBefore(d,am.nextSibling);var bt=el('div','shr');bt.innerHTML=d.innerHTML;bt.onclick=d.onclick;var dc=a.querySelector('.disc');if(dc)dc.parentNode.insertBefore(bt,dc)}
 var m2=new MutationObserver(function(){var a=document.querySelector('#vPost .art');if(!a||a.getAttribute('data-sh')||!a.querySelector('h2'))return;a.setAttribute('data-sh','1');share(a)});
 var vp=document.getElementById('vPost');if(vp)m2.observe(vp,{childList:true,subtree:true})})();
/* v5f: one-line filter bar */
(function(){function mv(){var tb=document.querySelector('.tbx'),sg=document.getElementById('sort'),imp=document.querySelector('.imp');if(!tb||!sg||sg.parentNode===tb)return;tb.insertBefore(sg,tb.firstChild);if(imp)imp.style.display='none'}mv();var n=0,iv=setInterval(function(){mv();if(++n>30)clearInterval(iv)},300)})();
/* v5i: XRPL Token News in the main feed */
(function(){
 function toItems(ps){return ps.map(function(p){return {id:'tn:'+p.slug,u:location.origin+'/tokens/'+p.slug,t:p.title,s:'XRPL Token News · '+p.token,ts:p.ts,i:55,c:['Tokens','Sponsored'],n:1,g:0,r:'',im:''}})}
 var orig=window.XD_pre;
 window.XD_pre=function(items,d){var a=orig?orig(items,d):items,tn=window.__tnItems||[];if(!tn.length||a!==items&&a===S.items)return a;var ids={};a.forEach(function(x){ids[x.id]=1});return a.concat(tn.filter(function(x){return !ids[x.id]})).sort(function(x,y){return y.ts-x.ts})};
 fetch('/api/tn').then(function(r){return r.json()}).then(function(d){window.__tnItems=toItems(d.posts||[]);if(S.items&&S.items.length){var base=S.items.filter(function(x){return String(x.id).indexOf('tn:')!==0});S.items=window.XD_pre(base);if(A.render)A.render()}}).catch(function(){});
 document.addEventListener('click',function(e){var a=e.target.closest&&e.target.closest('a.row');if(!a||e.metaKey||e.ctrlKey||e.target.closest('.acts'))return;var h=a.getAttribute('href')||'';if(h.indexOf(location.origin+'/tokens/')===0){e.preventDefault();e.stopPropagation();A.go(h.slice(location.origin.length));return}var id=a.getAttribute('data-id'),hm=h.match(/\/story\/([a-z0-9]+)$/i);if(hm)id=hm[1];if(id&&/^[a-z0-9]+$/i.test(id)){e.preventDefault();e.stopPropagation();var ap=window.XDapi||A;if(ap&&ap.go)ap.go('/story/'+id);else{history.pushState(null,'','/story/'+id);dispatchEvent(new PopStateEvent('popstate'))}}},true);
 document.addEventListener('pointerdown',function(e){var a=e.target.closest&&e.target.closest('#feed a.row[data-id]');if(!a)return;var id=a.getAttribute('data-id');if(/^[a-z0-9]+$/i.test(id)&&!window.__pf[id]){window.__pf[id]=1;fetch('/api/story?id='+id).catch(function(){})}},true);window.__pf=window.__pf||{}})();

/* v8 traffic beacon: visits, time on site, activity */
(function(){try{if(navigator.doNotTrack==='1'||/^\/admin/.test(location.pathname))return;
var R=function(){return Math.random().toString(36).slice(2,10)},vid=localStorage.getItem('xvid');if(!vid){vid=R()+R();localStorage.setItem('xvid',vid)}
var sid=sessionStorage.getItem('xsid'),first=!sid;if(!sid){sid=R()+R();sessionStorage.setItem('xsid',sid)}
function send(o){o.s=sid;o.vid=vid;var j=JSON.stringify(o);try{if(navigator.sendBeacon)navigator.sendBeacon('/api/hit',new Blob([j],{type:'text/plain'}));else fetch('/api/hit',{method:'POST',body:j,keepalive:true})}catch(e){}}
var rf='';try{rf=document.referrer?new URL(document.referrer).host:''}catch(e){}if(rf===location.host)rf='';
send({t:first?'v':'pv',p:location.pathname,rf:rf,dev:innerWidth<760?'m':'d'});
var ps=history.pushState;history.pushState=function(){var r=ps.apply(this,arguments);setTimeout(function(){send({t:'pv',p:location.pathname})},60);return r};
window.addEventListener('popstate',function(){setTimeout(function(){send({t:'pv',p:location.pathname})},60)});
setInterval(function(){if(document.visibilityState==='visible')send({t:'p',d:120})},120000);
document.addEventListener('click',function(e){var a=e.target.closest&&e.target.closest('a,button');if(!a)return;var h=a.getAttribute('href')||'',tx=(a.textContent||'').toLowerCase();
 if(/^https?:/.test(h)&&h.indexOf(location.host)<0){try{send({t:'e',e:'out:'+new URL(h).host.replace(/^www\./,'')})}catch(x){}}
 if(/post to x|telegram|reddit|share|copy link|copy/.test(tx)&&tx.length<30)send({t:'e',e:'share'});
 if(a.getAttribute('data-nav')&&/^\/token\//.test(a.getAttribute('data-nav')))send({t:'e',e:'token-open'})},true)
}catch(e){}})();

/* v14 — share to X with the post image / TV-screen PNG */
(function(){
function toast(m){if(window.XDtoast)window.XDtoast(m)}
function wrap(c,t,x,y,w,lh,max){var ws=String(t).split(/\s+/),l='',n=0,i;for(i=0;i<ws.length;i++){var tt=l?l+' '+ws[i]:ws[i];if(c.measureText(tt).width>w&&l){c.fillText(l,x,y+n*lh);n++;l=ws[i];if(n>=max-1){var r=ws.slice(i).join(' ');while(c.measureText(r+'…').width>w&&r.length>1)r=r.slice(0,-1);c.fillText(r+(i<ws.length-1||r!==ws.slice(i).join(' ')?'…':''),x,y+n*lh);return}}else l=tt}c.fillText(l,x,y+n*lh)}
function loadImg(u){return new Promise(function(ok){if(!u)return ok(null);var im=new Image();im.crossOrigin='anonymous';im.onload=function(){ok(im)};im.onerror=function(){ok(null)};im.src='/api/sq/img?u='+encodeURIComponent(u)})}
window.XDpng=function(it){
 return loadImg(it.im).then(function(im){
  var W=1200,H=675,cv=document.createElement('canvas');cv.width=W;cv.height=H;var c=cv.getContext('2d');
  var g=c.createLinearGradient(0,0,W,H);g.addColorStop(0,'#060a13');g.addColorStop(1,'#0e1c38');c.fillStyle=g;c.fillRect(0,0,W,H);
  var top=96,imgH=0;
  if(im){imgH=300;var s=Math.max(W/im.width,imgH/im.height),w=im.width*s,h=im.height*s;c.save();c.beginPath();c.rect(0,top,W,imgH);c.clip();c.drawImage(im,(W-w)/2,top+(imgH-h)/2,w,h);var o=c.createLinearGradient(0,top,0,top+imgH);o.addColorStop(0,'rgba(6,10,19,.15)');o.addColorStop(1,'rgba(6,10,19,.95)');c.fillStyle=o;c.fillRect(0,top,W,imgH);c.restore()}
  c.fillStyle='#fff';c.font='800 30px system-ui,Segoe UI,Arial';c.textBaseline='alphabetic';c.fillText('XRPL',48,62);var w1=c.measureText('XRPL').width;c.fillStyle='#59c6ff';c.fillText('TODAY',48+w1,62);var w2=c.measureText('TODAY').width;c.fillStyle='#fff';c.font='700 22px system-ui,Arial';c.fillText(' · LIVE',48+w1+w2,62);
  c.fillStyle='#8fa0bd';c.font='22px ui-monospace,Menlo,monospace';c.textAlign='right';c.fillText(new Date().toISOString().slice(11,19)+' UTC',W-48,62);c.textAlign='left';
  var y=top+imgH+(im?46:90);
  c.fillStyle='#59c6ff';c.font='600 22px system-ui,Arial';c.fillText(String(it.s||'XRPL').toUpperCase(),48,y);
  c.fillStyle='#fff';c.font='800 '+(im?46:60)+'px system-ui,Segoe UI,Arial';wrap(c,it.t||'',48,y+(im?58:76),W-96,im?54:70,im?3:5);
  c.fillStyle='rgba(255,255,255,.06)';c.fillRect(0,H-72,W,72);
  c.fillStyle='#c8d3e8';c.font='24px system-ui,Arial';var x=it.x;c.fillText('XRP '+(x?'$'+x.p.toFixed(4):'—')+'    24H '+(x?(x.c24>=0?'+':'')+x.c24.toFixed(2)+'%':'—'),48,H-27);
  c.textAlign='right';c.fillStyle='#59c6ff';c.font='700 24px system-ui,Arial';c.fillText('XRPLTODAY.com',W-48,H-27);
  return new Promise(function(ok){cv.toBlob(function(b){ok(b)},'image/png')})})};
window.XDshareX=function(it,xurl){
 var w=window.open(xurl,'_blank','noopener');var p=window.XDpng(it);
 try{if(window.ClipboardItem&&navigator.clipboard&&navigator.clipboard.write){navigator.clipboard.write([new ClipboardItem({'image/png':p})]).then(function(){toast('Image copied — paste it (Ctrl/Cmd+V) into your X post')},function(){p.then(dl)});return}}catch(e){}
 p.then(dl);
 function dl(b){if(!b)return;var a=document.createElement('a');a.href=URL.createObjectURL(b);a.download='xrpltoday-post.png';document.body.appendChild(a);a.click();a.remove();toast('Image saved — attach it to your X post')}};
function firstImg(){var i=document.querySelector('#vPost .art img,#vPost img,.mkart img.mkhero,.mkart .mkhero img,.mkart img,#vMkt .mkhero img');return i?(i.getAttribute('src')||''):''}
document.addEventListener('click',function(e){
 var a=e.target.closest&&e.target.closest('a[href^="https://twitter.com/intent/tweet"],#tvx');if(!a)return;
 var it,url;
 if(a.id==='tvx'){it=window.__tvit;if(!it)return;e.preventDefault();var tx=it.t+'\n\n'+(it.u||location.origin)+'\n\nView at XRPLTODAY.com #XRPL #XRP #XRPTODAY';window.XDshareX(it,'https://twitter.com/intent/tweet?text='+encodeURIComponent(tx));return}
 if(a.closest('#vToken'))return;
 url=a.getAttribute('href');var q=new URL(url).searchParams.get('text')||'';
 var im=firstImg();if(!im)return;
 e.preventDefault();window.XDshareX({t:q.split('\n\n')[0],s:(document.title||'XRPLTODAY').split('—')[0],im:im},url)},true);
})();

/* v18 multi search */
(function(){
var q=document.getElementById('q');if(!q||q.__ms)return;q.__ms=1;
var box=document.createElement('div');box.id='msx';box.hidden=true;q.parentNode.appendChild(box);
q.parentNode.style.position='relative';
var tm=0,seq=0,cache={};
function esc(s){return String(s==null?'':s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
function hex2(h){var s='';try{for(var i=0;i<h.length;i+=2){var c=parseInt(h.substr(i,2),16);if(c)s+=String.fromCharCode(c)}}catch(e){}return /^[\x20-\x7e]{2,}$/.test(s)?s:''}
function px(v){v=+v;if(!v)return'—';return '$'+(v>=1?v.toFixed(v>=100?2:4):v.toPrecision(3))}
function pc(v){v=+v;if(!isFinite(v)||!v&&v!==0)return'';return '<i class="'+(v>=0?'up':'dn')+'">'+(v>=0?'▲ ':'▼ ')+Math.abs(v).toFixed(2)+'%</i>'}
function local(t){var l=[];try{var d=JSON.parse(localStorage.getItem('x2top')||'null');if(d&&d.r)l=d.r}catch(e){}
 if(window.__toptok)l=window.__toptok;var s=t.toLowerCase();return l.filter(function(x){return((x.name||'')+' '+(x.currency||'')+' '+(x.issuer||'')+' '+(x.slug||'')).toLowerCase().indexOf(s)>=0}).slice(0,8)}
function draw(t,r,load){
 var kind=/^r[1-9A-HJ-NP-Za-km-z]{24,34}$/.test(t)?'acct':/^[0-9A-Fa-f]{40}$/.test(t)?'hex':'';
 var h='';
 if(kind==='acct'){h+='<a class="ms" target="_blank" rel="noopener" href="https://xrpscan.com/account/'+esc(t)+'"><b>Account</b><span>'+esc(t.slice(0,8))+'…'+esc(t.slice(-6))+'</span><em>XRPScan ↗</em></a><a class="ms" target="_blank" rel="noopener" href="https://xrpl.to/address/'+esc(t)+'"><b>Wallet</b><span>View on xrpl.to</span><em>↗</em></a>'}
 if(kind==='hex'){var n=hex2(t);h+='<div class="ms mh"><b>Currency hex</b><span>'+(n?esc(n):'no ASCII name')+'</span></div>'}
 if(r&&r.length)h+='<div class="msh">Tokens</div>'+r.map(function(x){var nm=x.name||x.currency||'?',hx=/^[0-9A-F]{40}$/.test(x.currency||'')?hex2(x.currency):'';
  return '<a class="ms" data-slug="'+esc(x.slug)+'" href="/token/'+encodeURIComponent(x.slug)+'"><b>'+esc(nm)+(x.verified?' ✓':'')+'</b><span>'+esc(hx&&hx!==nm?hx+' · ':'')+esc((x.issuer||'').slice(0,6))+'…'+esc((x.issuer||'').slice(-4))+'</span><em>'+px(x.usd)+' '+pc(x.pro24h)+'</em></a>'}).join('');
 else if(!load&&!kind)h+='<div class="ms mh"><span>No tokens found. Try a name, currency code, 40-char hex, or issuer address.</span></div>';
 if(load)h+='<div class="ms mh"><span>Searching…</span></div>';
 h+='<div class="msf">Token data by <a href="https://xrpl.to" target="_blank" rel="noopener">xrpl.to</a> · accounts by <a href="https://xrpscan.com" target="_blank" rel="noopener">XRPScan</a></div>';
 box.innerHTML=h;box.hidden=false}
function run(t){var my=++seq;
 var lc=local(t);draw(t,lc,1);
 if(cache[t]){draw(t,cache[t]);return}
 fetch('https://api.xrpl.to/v1/search',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({search:t,limit:8})})
 .then(function(r){if(!r.ok)throw new Error(r.status);return r.json()})
 .then(function(d){if(my!==seq)return;var r=(d.tokens||[]).slice(0,8);cache[t]=r;draw(t,r)})
 .catch(function(){if(my!==seq)return;draw(t,lc)})}
q.addEventListener('input',function(){var t=this.value.trim();clearTimeout(tm);if(t.length<2){box.hidden=true;return}tm=setTimeout(function(){run(t)},300)});
q.addEventListener('focus',function(){if(box.innerHTML&&q.value.trim().length>=2)box.hidden=false});
document.addEventListener('click',function(e){if(!box.contains(e.target)&&e.target!==q)box.hidden=true});
q.addEventListener('keydown',function(e){if(e.key==='Escape')box.hidden=true});
box.addEventListener('click',function(e){var a=e.target.closest('a[data-slug]');if(!a)return;e.preventDefault();box.hidden=true;(window.XDapi&&window.XDapi.go)?window.XDapi.go('/token/'+encodeURIComponent(a.getAttribute('data-slug'))):(history.pushState(null,'',a.getAttribute('href')),dispatchEvent(new PopStateEvent('popstate')))});
})();
