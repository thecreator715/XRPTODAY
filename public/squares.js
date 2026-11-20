/* XRPLTODAY — XRPL Squares: multi-token chart screener (5 rows x up to 10 columns, 8-50 squares) */
(function(){
window.XDQ=1;
var root=document.getElementById('vSquares');
function $(i){return document.getElementById(i)}
function el(t,c,h){var e=document.createElement(t);if(c)e.className=c;if(h!=null)e.innerHTML=h;return e}
function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
function lsg(k,d){try{var v=localStorage.getItem(k);return v==null?d:JSON.parse(v)}catch(e){return d}}
function lss(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}
function sh(a){return a?a.slice(0,5)+'…'+a.slice(-4):'—'}
function num(v){if(v==null||isNaN(v))return '—';var a=Math.abs(v);if(a>=1e12)return (v/1e12).toFixed(2)+'T';if(a>=1e9)return (v/1e9).toFixed(2)+'B';if(a>=1e6)return (v/1e6).toFixed(2)+'M';if(a>=1e3)return (v/1e3).toFixed(1)+'K';return v.toFixed(a<10?2:0)}
function px(v){if(v==null||isNaN(v)||v===0)return '—';var a=Math.abs(v);if(a>=1000)return v.toLocaleString('en-US',{maximumFractionDigits:2});if(a>=1)return v.toFixed(4);if(a>=0.01)return v.toFixed(5);if(a>=1e-6)return v.toFixed(8);return v.toExponential(2)}
function pc(v,d){if(v==null||isNaN(v))return '<span class="mu">—</span>';return '<span class="'+(v>=0?'up':'down')+'">'+(v>=0?'+':'')+v.toFixed(d==null?2:d)+'%</span>'}
function hue(s){var h=0;for(var i=0;i<s.length;i++)h=(h*31+s.charCodeAt(i))%360;return h}
function toast(m,c){if(window.XDtoast)window.XDtoast(m,c)}

var DEF={n:50,cells:[],tf:'1h',type:'area',norm:false,usd:false,sma:false,vol:true,sync:false,auto:true,mode:'chart'};
var Q=lsg('x2sq',null)||{};for(var k in DEF)if(Q[k]===undefined)Q[k]=DEF[k];if(Q.syncv!==2){Q.sync=false;Q.syncv=2}
Q.cells=(Q.cells||[]).slice(0,50);
function save(){lss('x2sq',Q)}
var DATA={},target=-1,timer=null,inited=false,screen={rows:[],sort:'vol24hxrp',dir:'desc',busy:false,f:{vol:0,mc:0,h:0,iss:''}};
var TF={'15m':{i:'15m',n:96,l:'24h'},'1h':{i:'1h',n:96,l:'4d'},'4h':{i:'4h',n:90,l:'15d'},'1d':{i:'1d',n:90,l:'90d'}};

var XT='https://api.xrpl.to';
function okj(r){if(!r.ok)throw new Error(r.status);return r.json()}
function direct(p){var u=new URL(p,location.origin),q=u.searchParams,x=u.pathname;
 if(x==='/api/sq/ohlc')return fetch(XT+'/v1/ohlc/'+q.get('md5')+'?interval='+q.get('i')+'&limit='+q.get('n')).then(okj).then(function(d){return {ohlc:d.ohlc||[]}});
 if(x==='/api/sq/token')return fetch(XT+'/v1/token/'+q.get('slug')).then(okj).then(function(d){return {token:d.token||null}});
 if(x==='/api/sq/tokens')return fetch(XT+'/v1/tokens?start=0&limit='+(q.get('limit')||100)+'&sortBy='+q.get('sort')+'&sortType='+q.get('dir')).then(okj).then(function(d){return {tokens:d.tokens||[],total:d.total||0}});
 if(x==='/api/sq/search')return fetch(XT+'/v1/search',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({search:q.get('q'),limit:24,offset:0})}).then(okj).then(function(d){var arr=[],c=[d.tokens,d.results,d.data,d.items];for(var i=0;i<c.length;i++){var v=c[i];if(Array.isArray(v)){arr=v;break}if(v&&Array.isArray(v.tokens)){arr=v.tokens;break}}return {items:arr.filter(function(t){return t&&t.md5}).map(tokOf)}});
 return Promise.reject(new Error('x'))}
function api(p){return direct(p).catch(function(e){if(e&&/^4\d\d$/.test(e.message))throw e;return fetch(p).then(function(r){return r.json()}).then(function(d){if(d&&d.error)throw new Error(d.error);return d})})}
function tokOf(t){return {md5:t.md5,name:t.name||t.currency,cur:t.currency,iss:t.issuer,slug:t.slug,px:+t.exch||0,usd:+t.usd||0,c24:t.pro24h,c7:t.pro7d,c1h:t.pro1h,vol:t.vol24hxrp,mc:t.marketcap,h:t.holders,tl:t.trustlines,rsi:t.rsi24h,vl:t.volatility24h,ver:!!(t.verified||t.kyc),tvl:t.tvl,tr:t.trendingScore,tx:t.vol24htx,hi:t.maxMin24h&&t.maxMin24h[0],lo:t.maxMin24h&&t.maxMin24h[1]}}

/* ---------- chart drawing ---------- */
function sma(c,n){var o=[],s=0;for(var i=0;i<c.length;i++){s+=c[i];if(i>=n)s-=c[i-n];o.push(i>=n-1?s/n:null)}return o}
function draw(cand,o){o=o||{};var W=o.w||320,H=o.h||130,k=o.k||1,n=cand.length;if(n<2)return '<div class="nod">No chart data</div>';
 var cl=cand.map(function(c){return c[4]*k}),hi=cand.map(function(c){return c[2]*k}),lo=cand.map(function(c){return c[3]*k});
 var base=cl[0]||1,tr=function(v){return Q.norm?(v/base-1)*100:v};
 var C=cl.map(tr),Hh=hi.map(tr),Ll=lo.map(tr);
 var mn=Math.min.apply(null,o.type==='candle'?Ll:C),mx=Math.max.apply(null,o.type==='candle'?Hh:C),r=(mx-mn)||Math.abs(mx)*.01||1;mn-=r*.06;mx+=r*.06;r=mx-mn;
 var vh=Q.vol&&!o.nov?H*.22:0,top=4,bot=H-vh-2,sx=function(i){return 2+i/(n-1)*(W-4)},sy=function(v){return top+(1-(v-mn)/r)*(bot-top)};
 var up=C[n-1]>=C[0],col=up?'#35d6a0':'#ff5d73',id='sq'+(o.id||0),s='<svg viewBox="0 0 '+W+' '+H+'" preserveAspectRatio="none" class="ch"><defs><linearGradient id="'+id+'" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="'+col+'" stop-opacity=".42"/><stop offset="1" stop-color="'+col+'" stop-opacity="0"/></linearGradient></defs>';
 for(var g=1;g<4;g++)s+='<line x1="0" x2="'+W+'" y1="'+(bot*g/4).toFixed(1)+'" y2="'+(bot*g/4).toFixed(1)+'" stroke="var(--line)" stroke-dasharray="2 5" vector-effect="non-scaling-stroke"/>';
 if(Q.norm&&mn<0&&mx>0)s+='<line x1="0" x2="'+W+'" y1="'+sy(0).toFixed(1)+'" y2="'+sy(0).toFixed(1)+'" stroke="var(--line2)" vector-effect="non-scaling-stroke"/>';
 if(vh){var vv=cand.map(function(c){return c[5]||0}),vm=Math.max.apply(null,vv)||1,bw=Math.max(1,(W-4)/n*.7);cand.forEach(function(c,i){var h=(vv[i]/vm)*(vh-2),u=c[4]>=c[1];s+='<rect x="'+(sx(i)-bw/2).toFixed(1)+'" y="'+(H-h).toFixed(1)+'" width="'+bw.toFixed(1)+'" height="'+Math.max(0,h).toFixed(1)+'" fill="'+(u?'#35d6a0':'#ff5d73')+'" opacity=".35"/>'})}
 if(o.type==='candle'){var bw2=Math.max(1,(W-4)/n*.62);cand.forEach(function(c,i){var u=c[4]>=c[1],cc=u?'#35d6a0':'#ff5d73',x=sx(i),y1=sy(tr(c[1]*k)),y2=sy(tr(c[4]*k)),yh=sy(Hh[i]),yl=sy(Ll[i]);s+='<line x1="'+x.toFixed(1)+'" x2="'+x.toFixed(1)+'" y1="'+yh.toFixed(1)+'" y2="'+yl.toFixed(1)+'" stroke="'+cc+'" vector-effect="non-scaling-stroke"/><rect x="'+(x-bw2/2).toFixed(1)+'" y="'+Math.min(y1,y2).toFixed(1)+'" width="'+bw2.toFixed(1)+'" height="'+Math.max(1,Math.abs(y1-y2)).toFixed(1)+'" fill="'+cc+'"/>'})}
 else{var pts=C.map(function(v,i){return sx(i).toFixed(1)+','+sy(v).toFixed(1)}).join(' ');
  if(o.type==='area')s+='<polygon points="2,'+bot+' '+pts+' '+(W-2)+','+bot+'" fill="url(#'+id+')"/>';
  s+='<polyline points="'+pts+'" fill="none" stroke="'+col+'" stroke-width="'+(o.big?2.2:1.7)+'" stroke-linejoin="round" vector-effect="non-scaling-stroke"/>'}
 if(Q.sma){var m=sma(C,Math.max(5,Math.round(n/8))),pp=[];m.forEach(function(v,i){if(v!=null)pp.push(sx(i).toFixed(1)+','+sy(v).toFixed(1))});if(pp.length>1)s+='<polyline points="'+pp.join(' ')+'" fill="none" stroke="#ffd77a" stroke-width="1.3" stroke-dasharray="4 3" vector-effect="non-scaling-stroke"/>'}
 return s+'</svg>'}

/* ---------- data loading ---------- */
var CC=lsg('x2sqc',{}),ccT=null;function ccSave(){clearTimeout(ccT);ccT=setTimeout(function(){var ks=Object.keys(CC);if(ks.length>140){ks.sort(function(a,b){return CC[a].t-CC[b].t}).slice(0,ks.length-140).forEach(function(k){delete CC[k]})}lss('x2sqc',CC)},1500)}
var queue=[],active=0;
function pump(){while(active<2&&queue.length){var j=queue.shift();active++;j()}}
function load(md5,force){var key=md5+'|'+Q.tf;if(DATA[key]&&!force&&Date.now()-DATA[key].t<45000)return;DATA[key]=DATA[key]||{t:0,c:null};if(!DATA[key].c&&CC[key]){DATA[key].c=CC[key].c;setTimeout(function(){paintCell(md5)},0)}DATA[key].t=Date.now();var tf=TF[Q.tf];
 queue.push(function(){var att=0;(function go(){api('/api/sq/ohlc?md5='+md5+'&i='+tf.i+'&n='+tf.n).then(function(d){DATA[key].c=(d.ohlc||[]).filter(function(c){return c&&c.length>=5});DATA[key].e=0;CC[key]={t:Date.now(),c:DATA[key].c};ccSave();fin()}).catch(function(){if(++att<8)setTimeout(go,Math.min(9000,1500*att));else{DATA[key].c=DATA[key].c||[];DATA[key].e=1;fin()}})})();function fin(){active--;paintCell(md5);pump();stats()}});pump()}
function loadAll(force){Q.cells.forEach(function(t,i){if(t&&i<Q.n)load(t.md5,force)})}
function refreshMeta(){var i=0;Q.cells.forEach(function(t){if(!t||!t.slug)return;setTimeout(function(){api('/api/sq/token?slug='+encodeURIComponent(t.slug)).then(function(d){if(d&&d.token){var n=tokOf(d.token);for(var k in n)if(n[k]!=null)t[k]=n[k];paintCell(t.md5);stats()}}).catch(function(){})},i++*180)});save()}

/* ---------- layout ---------- */
function dims(){var n=Q.n,rows=5,cols=Math.max(1,Math.min(10,Math.ceil(n/rows)));return {rows:rows,cols:cols}}
function cellHtml(t,i){
 if(!t)return '<div class="sqc empty" data-i="'+i+'"><button class="add" data-a="add" title="Add token">+</button><small>Add token</small></div>';
 var d=DATA[t.md5+'|'+Q.tf],c=d&&d.c,k=Q.usd&&t.px?t.usd/t.px:1,h=hue(t.md5||t.name),
 chg=c&&c.length>1?(c[c.length-1][4]/c[0][4]-1)*100:null,heat=Q.mode==='heat';
 var body=heat?'<div class="hm2"><b class="'+((t.c24||0)>=0?'up':'down')+'">'+((t.c24||0)>=0?'+':'')+(t.c24==null?'—':(+t.c24).toFixed(2))+'%</b><small>24h</small></div>':
  '<div class="cv" data-i="'+i+'">'+(c?draw(c,{type:Q.type,k:k,id:i}):'<div class="nod">'+(d&&d.e?'No data':'Loading…')+'</div>')+'<i class="xl"></i><span class="tp"></span></div>';
 var p=Q.usd?t.usd:t.px;
 return '<div class="sqc" draggable="true" data-i="'+i+'" style="--h:'+h+';'+(heat?'--hc:'+heatCol(t.c24)+';':'')+'"><div class="hd"><span class="bg">'+esc((t.name||'?').slice(0,2).toUpperCase())+'</span><div class="nm"><b title="'+esc(t.name)+'">'+esc(t.name)+(t.ver?' <em>✓</em>':'')+'</b><small title="'+esc(t.iss)+'">'+esc(sh(t.iss))+'</small></div><div class="pr"><b class="mono">'+(Q.usd?'$':'')+px(p)+'</b>'+pc(t.c24)+'</div></div>'+body+'<div class="ft"><span>Vol <b>'+num(t.vol)+'</b></span><span>MC <b>'+num(t.mc)+'</b></span><span>Hold <b>'+num(t.h)+'</b></span><span class="'+(chg==null?'':chg>=0?'up':'down')+'">'+TF[Q.tf].l+' '+(chg==null?'—':(chg>=0?'+':'')+chg.toFixed(1)+'%')+'</span></div><div class="ac"><button data-a="exp" title="Expand">⤢</button><button data-a="swap" title="Replace token">⇄</button><button data-a="rm" title="Remove">✕</button></div></div>'}
function heatCol(v){v=+v||0;var a=Math.min(1,Math.abs(v)/12);return v>=0?'rgba(53,214,160,'+(.12+a*.55).toFixed(2)+')':'rgba(255,93,115,'+(.12+a*.55).toFixed(2)+')'}
function renderGrid(){var g=$('sqg');if(!g)return;var D=dims();g.style.gridTemplateColumns='repeat('+D.cols+',minmax(0,1fr))';g.style.setProperty('--cols',D.cols);g.className='sqg c'+D.cols+(Q.mode==='heat'?' heat':'');var h='';for(var i=0;i<Q.n;i++)h+=cellHtml(Q.cells[i],i);g.innerHTML=h;$('sqn').textContent=Q.n;$('sqr').value=Q.n;stats()}
function paintCell(md5){var g=$('sqg');if(!g)return;Q.cells.forEach(function(t,i){if(t&&t.md5===md5&&i<Q.n){var c=g.children[i];if(c){var tmp=el('div');tmp.innerHTML=cellHtml(t,i);c.replaceWith(tmp.firstChild)}}})}

/* ---------- summary strip ---------- */
function stats(){var s=$('sqs');if(!s)return;var a=Q.cells.slice(0,Q.n).filter(Boolean);if(!a.length){s.innerHTML='<div class="tile"><small>SQUARES</small><b>0 / '+Q.n+'</b><em>Search or open the screener to add tokens</em></div>';return}
 var up=a.filter(function(t){return (t.c24||0)>0}).length,dn=a.filter(function(t){return (t.c24||0)<0}).length,avg=a.reduce(function(x,t){return x+(+t.c24||0)},0)/a.length,vol=a.reduce(function(x,t){return x+(+t.vol||0)},0),srt=a.slice().sort(function(x,y){return (y.c24||0)-(x.c24||0)}),b=srt[0],w=srt[srt.length-1];
 s.innerHTML='<div class="tile"><small>SQUARES</small><b>'+a.length+' / '+Q.n+'</b><em>'+up+' up · '+dn+' down</em></div><div class="tile"><small>AVG 24H</small><b>'+pc(avg)+'</b><em>across your tokens</em></div><div class="tile"><small>COMBINED VOLUME</small><b>'+num(vol)+' XRP</b><em>24h</em></div><div class="tile"><small>BEST / WORST</small><b style="font-size:15px">'+esc(b.name)+' '+pc(b.c24,1)+'</b><em>'+esc(w.name)+' '+pc(w.c24,1)+'</em></div>'}

/* ---------- add / remove ---------- */
function addToken(t,at){if(!t||!t.md5)return;if(Q.cells.some(function(c,i){return c&&c.md5===t.md5&&i<Q.n})&&at==null){toast(t.name+' is already on the grid');return}
 var i=at!=null&&at>=0?at:(function(){for(var j=0;j<Q.n;j++)if(!Q.cells[j])return j;return -1})();
 if(i<0){if(Q.n<50){Q.n++;i=Q.n-1}else{toast('All 50 squares are full — replace one with ⇄','hot');return}}
 Q.cells[i]=t;target=-1;save();renderGrid();load(t.md5,true);toast('Added '+t.name,'ok')}
function rm(i){Q.cells[i]=null;save();renderGrid()}
function fill(list){var a=list.filter(function(t){return t&&t.md5}).slice(0,Q.n);Q.cells=[];for(var i=0;i<Q.n;i++)Q.cells[i]=a[i]||null;save();renderGrid();loadAll(true);refreshMetaSoon()}
var rmt=null;function refreshMetaSoon(){clearTimeout(rmt);rmt=setTimeout(refreshMeta,20000)}

/* ---------- search ---------- */
var sTimer=null,sRes=[];
function search(q){clearTimeout(sTimer);var box=$('sqd');if(!q||q.length<2){box.classList.remove('on');return}
 sTimer=setTimeout(function(){box.innerHTML='<div class="ld">Searching the XRP Ledger…</div>';box.classList.add('on');api('/api/sq/search?q='+encodeURIComponent(q)).then(function(d){sRes=d.items||[];box.innerHTML=sRes.length?sRes.slice(0,14).map(function(t,i){return '<div class="sr" data-i="'+i+'"><span class="bg" style="--h:'+hue(t.md5||t.name)+'">'+esc((t.name||'?').slice(0,2).toUpperCase())+'</span><div><b>'+esc(t.name)+(t.cur&&t.cur!==t.name?' <small>'+esc(t.cur.length>12?t.cur.slice(0,8)+'…':t.cur)+'</small>':'')+'</b><small title="'+esc(t.iss)+'">Issuer '+esc(sh(t.iss))+'</small></div><div class="r"><b class="mono">'+px(t.px)+' XRP</b>'+pc(t.c24)+'</div></div>'}).join(''):'<div class="ld">No tokens found. Try a name, currency code or issuer address.</div>'}).catch(function(){box.innerHTML='<div class="ld">Search is unavailable right now.</div>'})},260)}

/* ---------- screener ---------- */
function loadScreen(sort,dir){screen.sort=sort||screen.sort;screen.dir=dir||screen.dir;var b=$('sqt');b.innerHTML='<div class="ld">Loading tokens…</div>';
 api('/api/sq/tokens?sort='+screen.sort+'&dir='+screen.dir+'&limit=200').then(function(d){screen.rows=(d.tokens||[]).map(tokOf);drawScreen()}).catch(function(){b.innerHTML='<div class="ld">Token list unavailable right now.</div>'})}
function drawScreen(){var f=screen.f,b=$('sqt'),iss=f.iss.toLowerCase(),r=screen.rows.filter(function(t){return (t.vol||0)>=f.vol&&(t.mc||0)>=f.mc&&(t.h||0)>=f.h&&(!iss||(t.iss||'').toLowerCase().indexOf(iss)>=0||(t.name||'').toLowerCase().indexOf(iss)>=0)});screen.view=r;
 var cols=[['name','Token'],['exch','Price (XRP)'],['pro24h','24h'],['pro7d','7d'],['vol24hxrp','Volume'],['marketcap','Mkt cap'],['holders','Holders']];
 var h='<table class="tbl"><thead><tr>'+cols.map(function(c){return '<th data-s="'+c[0]+'">'+c[1]+(screen.sort===c[0]?(screen.dir==='desc'?' ▾':' ▴'):'')+'</th>'}).join('')+'<th></th></tr></thead><tbody>';
 r.slice(0,150).forEach(function(t,i){var on=Q.cells.some(function(c){return c&&c.md5===t.md5});h+='<tr><td><b>'+esc(t.name)+(t.ver?' <em>✓</em>':'')+'</b><br><small title="'+esc(t.iss)+'">'+esc(sh(t.iss))+'</small></td><td class="mono">'+px(t.px)+'</td><td>'+pc(t.c24)+'</td><td>'+pc(t.c7)+'</td><td class="mono">'+num(t.vol)+'</td><td class="mono">'+num(t.mc)+'</td><td class="mono">'+num(t.h)+'</td><td><button class="btn2'+(on?'':' pri')+'" data-add="'+i+'">'+(on?'Added':'+ Add')+'</button></td></tr>'});
 b.innerHTML=h+'</tbody></table>'+(r.length?'':'<div class="ld">No tokens match these filters.</div>');$('sqcnt').textContent=r.length+' tokens'}

/* ---------- expanded chart modal ---------- */
function expand(i){var t=Q.cells[i];if(!t)return;var o=el('div','ov on'),tfk=Q.tf;
 o.innerHTML='<div class="md sqm"><button class="x" id="mx">✕</button><h2>'+esc(t.name)+' <small class="mu">'+esc(t.iss)+'</small></h2><div class="sub">'+(Q.usd?'USD':'XRP')+' · '+(t.cur?esc(t.cur):'')+'</div><div class="seg2" id="mtf">'+Object.keys(TF).map(function(k){return '<button class="chip2'+(k===tfk?' on':'')+'" data-k="'+k+'">'+k+' · '+TF[k].l+'</button>'}).join('')+'</div><div id="mch" class="mch"></div><div class="kv2">'+[['Price',px(Q.usd?t.usd:t.px)],['24h',pc(t.c24)],['7d',pc(t.c7)],['Volume 24h',num(t.vol)+' XRP'],['Market cap',num(t.mc)+' XRP'],['Holders',num(t.h)],['Trustlines',num(t.tl)],['RSI 24h',t.rsi!=null?(+t.rsi).toFixed(1):'—'],['Volatility',t.vl!=null?(+t.vl).toFixed(2)+'%':'—'],['24h high',px(t.hi)],['24h low',px(t.lo)],['AMM TVL',num(t.tvl)]].map(function(p){return '<div><small>'+p[0]+'</small><b class="mono">'+p[1]+'</b></div>'}).join('')+'</div><div class="btns"><a class="btn2 pri" target="_blank" rel="noopener" href="https://xrpl.to/token/'+encodeURIComponent(t.slug||'')+'">Open on xrpl.to ↗</a><a class="btn2" target="_blank" rel="noopener" href="https://xrpscan.com/account/'+encodeURIComponent(t.iss||'')+'">Issuer on XRPScan ↗</a></div></div>';
 document.body.appendChild(o);o.onclick=function(e){if(e.target===o||e.target.id==='mx')o.remove()};
 function paint(k){var tf=TF[k];$('mch').innerHTML='<div class="nod">Loading…</div>';api('/api/sq/ohlc?md5='+t.md5+'&i='+tf.i+'&n='+tf.n).then(function(d){var c=(d.ohlc||[]).filter(function(x){return x&&x.length>=5});$('mch').innerHTML=draw(c,{w:760,h:300,type:Q.type,k:Q.usd&&t.px?t.usd/t.px:1,id:'m',big:1})}).catch(function(){$('mch').innerHTML='<div class="nod">No data</div>'})}
 paint(tfk);o.querySelector('#mtf').onclick=function(e){var b=e.target.closest('[data-k]');if(!b)return;o.querySelectorAll('#mtf .chip2').forEach(function(x){x.classList.toggle('on',x===b)});paint(b.getAttribute('data-k'))}}

/* ---------- layouts / presets / share ---------- */
function ids(){return Q.cells.slice(0,Q.n).filter(Boolean)}
function presets(){var P=[['🔥 Top volume','vol24hxrp','desc'],['🚀 Top gainers 24h','pro24h','desc'],['📉 Top losers 24h','pro24h','asc'],['👑 Top market cap','marketcap','desc'],['👥 Most holders','holders','desc'],['⚡ Trending','trendingScore','desc'],['🆕 New listings','dateon','desc']];
 var o=el('div','ov on');o.innerHTML='<div class="md"><button class="x" id="px">✕</button><h2>Presets</h2><div class="sub">Fill all '+Q.n+' squares in one click</div><div class="pl">'+P.map(function(p,i){return '<button class="btn2" data-p="'+i+'">'+p[0]+'</button>'}).join('')+'</div><h4 style="font-size:10.5px;letter-spacing:1.5px;color:var(--dim);margin:16px 0 6px">SAVED LAYOUTS</h4><div id="lys"></div><div class="btns"><input id="lyn" placeholder="Name this layout" style="flex:1"><button class="btn2 pri" id="lys2">Save current</button></div></div>';document.body.appendChild(o);
 function lys(){var L=lsg('x2sql',[]);$('lys').innerHTML=L.length?L.map(function(l,i){return '<div class="ly"><b>'+esc(l.name)+'</b><small>'+l.cells.filter(Boolean).length+' tokens</small><button class="btn2" data-l="'+i+'">Load</button><button class="btn2" data-d="'+i+'">Delete</button></div>'}).join(''):'<div class="mu" style="font-size:12.5px">No saved layouts yet.</div>'}lys();
 o.onclick=function(e){if(e.target===o||e.target.id==='px'){o.remove();return}var b=e.target.closest('button');if(!b)return;
  if(b.hasAttribute('data-p')){var p=P[+b.getAttribute('data-p')];b.textContent='Loading…';api('/api/sq/tokens?sort='+p[1]+'&dir='+p[2]+'&limit=100').then(function(d){var a=(d.tokens||[]).map(tokOf).filter(function(t){return (t.vol||0)>0||p[1]==='dateon'});fill(a);o.remove();toast(p[0]+' loaded','ok')}).catch(function(){b.textContent=p[0];toast('Could not load preset')})}
  else if(b.id==='lys2'){var L=lsg('x2sql',[]),nm=$('lyn').value.trim()||('Layout '+(L.length+1));L.push({name:nm,n:Q.n,cells:Q.cells.slice(0,Q.n)});lss('x2sql',L);lys();toast('Layout saved','ok')}
  else if(b.hasAttribute('data-l')){var l=lsg('x2sql',[])[+b.getAttribute('data-l')];if(l){Q.n=Math.max(8,Math.min(50,l.n||50));Q.cells=l.cells||[];save();renderGrid();loadAll(true);o.remove()}}
  else if(b.hasAttribute('data-d')){var L2=lsg('x2sql',[]);L2.splice(+b.getAttribute('data-d'),1);lss('x2sql',L2);lys()}}}
function shareLink(){var a=ids();if(!a.length){toast('Add some tokens first');return}var u=location.origin+'/squares#t='+a.map(function(t){return t.slug||''}).join(',');try{navigator.clipboard.writeText(u)}catch(e){}toast('Share link copied — it reopens this exact grid','ok');history.replaceState(null,'','/squares#t='+a.map(function(t){return t.slug||''}).join(','))}
function exportCsv(){var a=ids();if(!a.length)return;var h='name,currency,issuer,price_xrp,price_usd,change_24h,change_7d,volume_24h_xrp,marketcap_xrp,holders\n'+a.map(function(t){return [t.name,t.cur,t.iss,t.px,t.usd,t.c24,t.c7,t.vol,t.mc,t.h].map(function(v){return '"'+String(v==null?'':v).replace(/"/g,'""')+'"'}).join(',')}).join('\n');var l=el('a');l.href=URL.createObjectURL(new Blob([h],{type:'text/csv'}));l.download='xrpl-squares.csv';l.click()}
function loadFromHash(){var m=location.hash.match(/t=([^&]+)/);if(!m)return;var slugs=decodeURIComponent(m[1]).split(',').filter(Boolean).slice(0,50);if(!slugs.length)return;Q.n=Math.max(8,Math.min(50,Math.max(Q.n,slugs.length)));Q.cells=[];renderGrid();var i=0;slugs.forEach(function(s,j){api('/api/sq/token?slug='+encodeURIComponent(s)).then(function(d){if(d&&d.token){Q.cells[j]=tokOf(d.token);save();renderGrid();load(Q.cells[j].md5,true)}}).catch(function(){})})}

/* ---------- build page ---------- */
function build(){inited=true;root.innerHTML='<div class="sqh"><div><h1>XRPL <span class="gt">Squares</span></h1><p>A live multi-token chart screener for the XRP Ledger. Pick any issued token — search by name, currency code or issuer — and watch up to 50 charts at once.</p></div><div class="sqsr"><input id="sqq" placeholder="Search XRPL tokens, issuers or r-addresses…" autocomplete="off"><div id="sqd" class="sqd"></div></div></div>'+
 '<div class="sqtb"><div class="seg2" id="sqtf">'+Object.keys(TF).map(function(k){return '<button class="chip2" data-k="'+k+'">'+k+'</button>'}).join('')+'</div><div class="seg2" id="sqty"><button class="chip2" data-y="line">Line</button><button class="chip2" data-y="area">Area</button><button class="chip2" data-y="candle">Candles</button></div><div class="seg2" id="sqmo"><button class="chip2" data-m="chart">Charts</button><button class="chip2" data-m="heat">Heatmap</button></div><label class="sqr2">Squares <b id="sqn">50</b><input type="range" id="sqr" min="8" max="50" step="1"></label><button class="chip2" data-t="norm" title="Compare all charts as % change from the start">% Compare</button><button class="chip2" data-t="usd">USD</button><button class="chip2" data-t="sma">SMA</button><button class="chip2" data-t="vol">Volume</button><button class="chip2" data-t="sync">Sync cursor</button><button class="chip2" data-t="auto">Auto-refresh</button><span class="sp"></span><button class="btn2 pri" id="sqsc">Screener</button><button class="btn2" id="sqpr">Presets &amp; layouts</button><button class="btn2" id="sqsh">Share</button><button class="btn2" id="sqex">Export CSV</button><button class="btn2" id="sqfl">Fill empty</button><button class="btn2" id="sqcl">Clear</button></div>'+
 '<div class="strip" id="sqs"></div><div id="sqg" class="sqg"></div><div class="sqft">Token data by <a href="https://xrpl.to" target="_blank" rel="noopener">xrpl.to</a> · Prices in XRP unless USD is selected · Not financial advice. Drag squares to reorder.</div>'+
 '<div class="drawer sqdr" id="sqdr"><button class="btn2" id="sqdx" style="float:right">Close ✕</button><h2>Token screener <small id="sqcnt" class="mu"></small></h2><div class="sqf"><input id="f1" type="number" placeholder="Min volume (XRP)"><input id="f2" type="number" placeholder="Min market cap"><input id="f3" type="number" placeholder="Min holders"><input id="f4" placeholder="Issuer or name contains…"></div><div class="seg2" id="sqso" style="margin:8px 0"><button class="chip2" data-s="vol24hxrp">Volume</button><button class="chip2" data-s="pro24h">24h change</button><button class="chip2" data-s="marketcap">Market cap</button><button class="chip2" data-s="holders">Holders</button><button class="chip2" data-s="trendingScore">Trending</button><button class="chip2" data-s="dateon">Newest</button></div><div class="btns"><button class="btn2 pri" id="sqfa">Fill grid with these</button></div><div id="sqt" class="sqt"></div></div>';
 sync();wire();renderGrid()}
function sync(){var r=root;r.querySelectorAll('#sqtf [data-k]').forEach(function(b){b.classList.toggle('on',b.getAttribute('data-k')===Q.tf)});r.querySelectorAll('#sqty [data-y]').forEach(function(b){b.classList.toggle('on',b.getAttribute('data-y')===Q.type)});r.querySelectorAll('#sqmo [data-m]').forEach(function(b){b.classList.toggle('on',b.getAttribute('data-m')===Q.mode)});r.querySelectorAll('[data-t]').forEach(function(b){b.classList.toggle('on',!!Q[b.getAttribute('data-t')])});r.querySelectorAll('#sqso [data-s]').forEach(function(b){b.classList.toggle('on',b.getAttribute('data-s')===screen.sort)})}
function wire(){
 $('sqtf').onclick=function(e){var b=e.target.closest('[data-k]');if(!b)return;Q.tf=b.getAttribute('data-k');save();sync();renderGrid();loadAll(true)};
 $('sqty').onclick=function(e){var b=e.target.closest('[data-y]');if(!b)return;Q.type=b.getAttribute('data-y');save();sync();renderGrid()};
 $('sqmo').onclick=function(e){var b=e.target.closest('[data-m]');if(!b)return;Q.mode=b.getAttribute('data-m');save();sync();renderGrid()};
 root.querySelector('.sqtb').addEventListener('click',function(e){var b=e.target.closest('[data-t]');if(!b)return;var k=b.getAttribute('data-t');Q[k]=!Q[k];save();sync();renderGrid();if(k==='auto')schedule()});
 $('sqr').oninput=function(){Q.n=+this.value;while(Q.cells.length<Q.n)Q.cells.push(null);save();renderGrid();loadAll()};
 var q=$('sqq');q.oninput=function(){search(this.value.trim())};q.onfocus=function(){if(this.value.trim().length>1)$('sqd').classList.add('on')};
 document.addEventListener('click',function(e){if(!e.target.closest('.sqsr'))$('sqd')&&$('sqd').classList.remove('on')});
 $('sqd').onclick=function(e){var r=e.target.closest('.sr');if(!r)return;addToken(sRes[+r.getAttribute('data-i')],target);$('sqd').classList.remove('on');q.value=''};
 $('sqsc').onclick=function(){$('sqdr').classList.add('on');if(!screen.rows.length)loadScreen()};$('sqdx').onclick=function(){$('sqdr').classList.remove('on')};
 $('sqso').onclick=function(e){var b=e.target.closest('[data-s]');if(!b)return;var s=b.getAttribute('data-s');loadScreen(s,screen.sort===s&&screen.dir==='desc'?'asc':'desc');sync()};
 $('sqt').onclick=function(e){var h=e.target.closest('th[data-s]');if(h){var s=h.getAttribute('data-s');if(s==='name'||s==='exch')return;loadScreen(s,screen.sort===s&&screen.dir==='desc'?'asc':'desc');sync();return}var b=e.target.closest('[data-add]');if(b){addToken(screen.view[+b.getAttribute('data-add')]);b.textContent='Added';b.classList.remove('pri')}};
 ['f1:vol','f2:mc','f3:h','f4:iss'].forEach(function(p){var a=p.split(':');$(a[0]).oninput=function(){screen.f[a[1]]=a[1]==='iss'?this.value.trim():(+this.value||0);drawScreen()}});
 $('sqfa').onclick=function(){fill(screen.view||screen.rows);$('sqdr').classList.remove('on');toast('Grid filled from screener','ok')};
 $('sqpr').onclick=presets;$('sqsh').onclick=shareLink;$('sqex').onclick=exportCsv;
 $('sqfl').onclick=function(){var have={};Q.cells.forEach(function(t){if(t)have[t.md5]=1});api('/api/sq/tokens?sort=vol24hxrp&dir=desc&limit=100').then(function(d){var a=(d.tokens||[]).map(tokOf).filter(function(t){return !have[t.md5]&&t.vol>0}),j=0;for(var i=0;i<Q.n;i++)if(!Q.cells[i]&&a[j])Q.cells[i]=a[j++];save();renderGrid();loadAll(true)})};
 $('sqcl').onclick=function(){Q.cells=[];save();renderGrid()};
 var g=$('sqg');
 g.onclick=function(e){var b=e.target.closest('[data-a]'),c=e.target.closest('.sqc');if(!c)return;var i=+c.getAttribute('data-i');if(!b){if(Q.cells[i]&&Q.cells[i].slug){window.__tkfrom=1;history.pushState(null,'','/token/'+encodeURIComponent(Q.cells[i].slug));window.onpopstate&&window.onpopstate();return}if(!Q.cells[i]&&e.target.closest('.empty')){target=i;$('sqq').focus();toast('Search for a token to place in square '+(i+1))}return}var a=b.getAttribute('data-a');if(a==='add'){target=i;$('sqq').focus();$('sqq').scrollIntoView({block:'center',behavior:'smooth'})}else if(a==='rm')rm(i);else if(a==='exp')expand(i);else if(a==='swap'){target=i;$('sqq').focus();$('sqq').scrollIntoView({block:'center',behavior:'smooth'});toast('Search for the replacement token')}};
 g.onmousemove=function(e){if(!Q.sync)return;var cv=e.target.closest('.cv');if(!cv){g.classList.remove('xh');return}var r=cv.getBoundingClientRect(),f=Math.max(0,Math.min(1,(e.clientX-r.left)/r.width));g.classList.add('xh');g.style.setProperty('--xf',(f*100).toFixed(1)+'%');g.querySelectorAll('.cv').forEach(function(v){var k=v.parentNode.getAttribute('data-i'),t=Q.cells[+k],d=t&&DATA[t.md5+'|'+Q.tf],c=d&&d.c;if(!c||c.length<2)return;var idx=Math.round(f*(c.length-1)),p=c[idx],kk=Q.usd&&t.px?t.usd/t.px:1,tp=v.querySelector('.tp'),xl=v.querySelector('.xl');xl.style.left=(f*100)+'%';tp.textContent=px(p[4]*kk)+' · '+new Date(p[0]).toISOString().slice(5,16).replace('T',' ');tp.style.left=f>.6?'auto':(f*100)+'%';tp.style.right=f>.6?(100-f*100)+'%':'auto'})};
 g.onmouseleave=function(){g.classList.remove('xh')};
 var dragI=-1;g.addEventListener('dragstart',function(e){var c=e.target.closest('.sqc');if(c){dragI=+c.getAttribute('data-i');c.classList.add('dg');try{e.dataTransfer.effectAllowed='move';e.dataTransfer.setData('text/plain',''+dragI)}catch(x){}}});
 g.addEventListener('dragover',function(e){if(dragI>=0)e.preventDefault()});
 g.addEventListener('drop',function(e){var c=e.target.closest('.sqc');if(!c||dragI<0)return;e.preventDefault();var j=+c.getAttribute('data-i'),t=Q.cells[dragI];Q.cells[dragI]=Q.cells[j]||null;Q.cells[j]=t;dragI=-1;save();renderGrid()});
 g.addEventListener('dragend',function(){dragI=-1;g.querySelectorAll('.dg').forEach(function(x){x.classList.remove('dg')})})}
function schedule(){clearInterval(timer);if(Q.auto)timer=setInterval(function(){if(document.hidden||location.pathname!=='/squares')return;loadAll(true)},60000)}

window.XD_squares=function(){if(!inited){build();if(location.hash.indexOf('t=')>=0)loadFromHash();else if(!ids().length){api('/api/sq/tokens?sort=vol24hxrp&dir=desc&limit=100').then(function(d){var a=(d.tokens||[]).map(tokOf).filter(function(t){return t.vol>0});fill(a)}).catch(function(){})}else{loadAll();refreshMetaSoon()}}else{loadAll()}schedule()};
if(location.pathname==='/squares')window.XD_squares();
})();
