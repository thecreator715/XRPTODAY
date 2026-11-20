/* XRPLTODAY token page — loaded on demand for /token/:slug */
(function(){
if(window.XD_token&&window.XD_token.__v2)return;
var TF={'15m':{n:96,l:'24h'},'1h':{n:120,l:'5d'},'4h':{n:120,l:'20d'},'1d':{n:120,l:'120d'}};
var ST={tf:'1h',type:'candle',usd:true,sma:true,vol:true,slug:null,t:null,c:null,iv:null,pm:null};
var WL=[];try{WL=JSON.parse(localStorage.getItem('x2wl')||'[]')}catch(e){}
function $(i){return document.getElementById(i)}
function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
function num(v){if(v==null||isNaN(v))return '—';var a=Math.abs(v);if(a>=1e12)return (v/1e12).toFixed(2)+'T';if(a>=1e9)return (v/1e9).toFixed(2)+'B';if(a>=1e6)return (v/1e6).toFixed(2)+'M';if(a>=1e3)return (v/1e3).toFixed(1)+'K';return v.toFixed(a<10?2:0)}
function px(v){if(v==null||isNaN(v)||v===0)return '—';var a=Math.abs(v);if(a>=1000)return v.toLocaleString('en-US',{maximumFractionDigits:2});if(a>=1)return v.toFixed(4);if(a>=0.01)return v.toFixed(5);if(a>=1e-6)return v.toFixed(8);return v.toExponential(2)}
function pc(v){if(v==null||isNaN(v))return '<span class="mu">—</span>';return '<span class="'+(v>=0?'up':'down')+'">'+(v>=0?'+':'')+(+v).toFixed(2)+'%</span>'}
function toast(m){if(window.XDtoast)window.XDtoast(m);}
function direct(p){return fetch('https://api.xrpl.to'+p).then(function(r){if(!r.ok)throw new Error(String(r.status));return r.json()})}
function lsg(k){try{return JSON.parse(localStorage.getItem(k))}catch(e){return null}}
function lss(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}
function wait(ms){return new Promise(function(r){setTimeout(r,ms)})}
function tryTimes(fn,n){return fn().catch(function(e){if(n<=0)throw e;return wait(900).then(function(){return tryTimes(fn,n-1)})})}
function fromCell(c){return {md5:c.md5,name:c.name,currency:c.cur,issuer:c.iss,slug:c.slug,exch:c.px,usd:c.usd,pro24h:c.c24,pro7d:c.c7,pro1h:c.c1h,vol24hxrp:c.vol,marketcap:c.mc,holders:c.h,trustlines:c.tl,rsi24h:c.rsi,volatility24h:c.vl}}
function getTok(slug){
 var p='/v1/token/'+encodeURIComponent(slug);
 return tryTimes(function(){return direct(p).then(function(d){if(!d||!d.token)throw new Error('404');return d.token})},1)
 .catch(function(){return fetch('/api/sq/token?slug='+encodeURIComponent(slug)).then(function(r){return r.json()}).then(function(d){if(!d||!d.token)throw new Error('none');return d.token})})
 .then(function(t){ST.stale=0;lss('x2tk:'+slug,{t:t,ts:Date.now()});return t},function(){
  var c=lsg('x2tk:'+slug);if(c&&c.t){ST.stale=c.ts;return c.t}
  var q=lsg('x2sq'),cells=(q&&q.cells)||[];for(var i=0;i<cells.length;i++)if(cells[i]&&cells[i].slug===slug&&cells[i].md5){ST.stale=Date.now();return fromCell(cells[i])}
  return null})}
function getOhlc(md5,tf){var c=TF[tf],k='x2oh:'+md5+':'+tf;
 return tryTimes(function(){return direct('/v1/ohlc/'+md5+'?interval='+tf+'&limit='+c.n)},1).catch(function(){return fetch('/api/sq/ohlc?md5='+md5+'&i='+tf+'&n='+c.n).then(function(r){return r.json()}).then(function(d){if(!d||!d.ohlc)throw new Error('x');return d})})
 .then(function(d){var o=(d&&d.ohlc||[]).map(function(a){return a.map(Number)}).filter(function(a){return a.length>=5&&a[0]});if(o.length)lss(k,{o:o,ts:Date.now()});return o},function(){var s=lsg(k);return s&&s.o?s.o:[]})}
function sma(c,n){var o=[],s=0;for(var i=0;i<c.length;i++){s+=c[i][4];if(i>=n)s-=c[i-n][4];o.push(i>=n-1?s/n:null)}return o}
function rsi(c,n){n=n||14;if(c.length<n+1)return null;var g=0,l=0;for(var i=1;i<=n;i++){var d=c[i][4]-c[i-1][4];if(d>=0)g+=d;else l-=d}g/=n;l/=n;for(i=n+1;i<c.length;i++){d=c[i][4]-c[i-1][4];g=(g*(n-1)+Math.max(d,0))/n;l=(l*(n-1)+Math.max(-d,0))/n}return l===0?100:100-100/(1+g/l)}
function shareUrl(){return location.origin+'/token/'+encodeURIComponent(ST.slug)}
function tweetUrl(){var t=ST.t,txt=(t?'$'+(t.name||t.currency)+' on the XRP Ledger — '+px(+t.usd)+' USD ('+((t.pro24h>=0?'+':'')+(+t.pro24h||0).toFixed(2))+'% 24h). Live chart & analytics on XRPLTODAY':'XRPL token on XRPLTODAY');return 'https://twitter.com/intent/tweet?text='+encodeURIComponent(txt+'\n\n'+shareUrl()+'\n\nView at XRPLTODAY.com #XRPL #XRP #XRPLTODAY')}
function wlHas(){return WL.indexOf(ST.slug)>=0}
function wlSave(){try{localStorage.setItem('x2wl',JSON.stringify(WL))}catch(e){}}


function K(){return ST.usd&&ST.t&&+ST.t.exch?(+ST.t.usd/+ST.t.exch):1}
function hue(s){var h=0;for(var i=0;i<s.length;i++)h=(h*31+s.charCodeAt(i))%360;return h}
/* chart: fixed 1000x400 coordinate space stretched by CSS, labels are HTML overlays => layout never moves */
function plot(c){
 var n=c.length;if(n<2)return null;
 var k=K(),VW=1000,PH=ST.vol?316:392,i,hi=-1e99,lo=1e99,vm=0,m20=ST.sma?sma(c,20):null,m50=ST.sma?sma(c,50):null;
 for(i=0;i<n;i++){hi=Math.max(hi,c[i][2]*k);lo=Math.min(lo,c[i][3]*k);vm=Math.max(vm,c[i][5]||0)}
 var sp=(hi-lo)||hi*.01||1;hi+=sp*.06;lo-=sp*.06;sp=hi-lo;
 var X=function(j){return VW*(j+.5)/n},Y=function(v){return 6+(PH-6)*(1-(v*k-lo)/sp)};
 var up='#35d6a0',dn='#ff5d73',col=c[n-1][4]>=c[0][4]?up:dn,cw=Math.max(1.2,VW/n*.62),g='',ax='',tm='',d='';
 for(i=0;i<=4;i++){var yy=6+(PH-6)*i/4;g+='<line x1="0" x2="1000" y1="'+yy+'" y2="'+yy+'" stroke="rgba(140,160,200,.13)" stroke-dasharray="3 5"/>';ax+='<span style="top:'+(yy/4).toFixed(2)+'%">'+px(hi-sp*i/4)+'</span>'}
 if(ST.type==='candle'){for(i=0;i<n;i++){var o=c[i][1],cl=c[i][4],u=cl>=o,cc=u?up:dn,x=X(i);g+='<line x1="'+x+'" x2="'+x+'" y1="'+Y(c[i][2]/1)+'" y2="'+Y(c[i][3])+'" stroke="'+cc+'" stroke-width="1.2"/><rect x="'+(x-cw/2)+'" y="'+Math.min(Y(o),Y(cl))+'" width="'+cw+'" height="'+Math.max(1.2,Math.abs(Y(o)-Y(cl)))+'" fill="'+cc+'"/>'}}
 else{for(i=0;i<n;i++)d+=(i?'L':'M')+X(i).toFixed(1)+' '+Y(c[i][4]).toFixed(1);if(ST.type==='area')g+='<path d="'+d+'L'+X(n-1)+' '+PH+'L'+X(0)+' '+PH+'Z" fill="url(#tga)"/>';g+='<path d="'+d+'" fill="none" stroke="'+col+'" stroke-width="2"/>'}
 function ln(a,cl){var s='',st=0;for(var j=0;j<n;j++){if(a[j]==null)continue;s+=(st++?'L':'M')+X(j).toFixed(1)+' '+Y(a[j]).toFixed(1)}return s?'<path d="'+s+'" fill="none" stroke="'+cl+'" stroke-width="1.4" opacity=".9"/>':''}
 if(m20)g+=ln(m20,'#59c6ff')+ln(m50,'#ffc850');
 if(ST.vol){for(i=0;i<n;i++){var h2=(c[i][5]||0)/(vm||1)*62;g+='<rect x="'+(X(i)-cw/2)+'" y="'+(398-h2)+'" width="'+cw+'" height="'+h2+'" fill="'+(c[i][4]>=c[i][1]?up:dn)+'" opacity=".32"/>'}}
 var st2=Math.max(1,Math.floor(n/6));for(i=0;i<n;i+=st2){var dt=new Date(c[i][0]);tm+='<span style="left:'+(X(i)/10).toFixed(2)+'%">'+(ST.tf==='1d'?(dt.getUTCMonth()+1)+'/'+dt.getUTCDate():dt.toISOString().slice(5,10)+' '+dt.toISOString().slice(11,16))+'</span>'}
 var ly=Y(c[n-1][4]),tag='<span class="tag" style="top:'+(ly/4).toFixed(2)+'%;background:'+col+'">'+px(c[n-1][4]*k)+'</span>';
 g+='<line x1="0" x2="1000" y1="'+ly+'" y2="'+ly+'" stroke="'+col+'" stroke-dasharray="2 3" opacity=".7"/>';
 return {svg:'<svg viewBox="0 0 1000 400" preserveAspectRatio="none"><defs><linearGradient id="tga" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="'+col+'" stop-opacity=".35"/><stop offset="1" stop-color="'+col+'" stop-opacity="0"/></linearGradient></defs>'+g+'</svg>',ax:ax+tag,tm:tm,n:n,c:c,k:k}
}
function stats(c){
 var t=ST.t,k=K(),r={};
 if(c&&c.length>1){var hi=-1e99,lo=1e99,vs=0,i;for(i=0;i<c.length;i++){hi=Math.max(hi,c[i][2]);lo=Math.min(lo,c[i][3]);vs+=c[i][5]||0}
  r.hi=hi*k;r.lo=lo*k;r.ret=(c[c.length-1][4]/c[0][4]-1)*100;r.rsi=rsi(c);r.avgv=vs/c.length;r.pos=hi>lo?(c[c.length-1][4]-lo)/(hi-lo)*100:50;
  var rets=[];for(i=1;i<c.length;i++)rets.push(Math.log(c[i][4]/c[i-1][4]));var mu=rets.reduce(function(a,b){return a+b},0)/rets.length;r.sd=Math.sqrt(rets.reduce(function(a,b){return a+(b-mu)*(b-mu)},0)/rets.length)*100;
  var dd=0,pk=c[0][4];for(i=0;i<c.length;i++){pk=Math.max(pk,c[i][4]);dd=Math.min(dd,c[i][4]/pk-1)}r.dd=dd*100}
 return r}
function sig(r){if(r.rsi==null)return ['—','mu'];return r.rsi>=70?['Overbought','down']:r.rsi<=30?['Oversold','up']:r.rsi>=55?['Bullish momentum','up']:r.rsi<=45?['Bearish momentum','down']:['Neutral','mu']}
function RT(){var t=ST.t;return t&&+t.exch?(+t.usd/+t.exch):0}
function U(x){var r=RT();x=+x;if(!r||!x||isNaN(x))return '';return '≈ $'+num(x*r)}
function UP(x){var r=RT();x=+x;if(!r||!x||isNaN(x))return '';return '≈ $'+px(x*r)}
function tile(l,v,s){return '<div class="tile"><small>'+l+'</small><b>'+v+'</b><em>'+(s||'&nbsp;')+'</em></div>'}
function kvh(a){return a.map(function(p){return '<div><small>'+p[0]+'</small><b class="mono">'+p[1]+'</b></div>'}).join('')}
/* ---- skeleton: built once per token ---- */
function curN(c){if(/^[0-9A-Fa-f]{40}$/.test(c)){var o='';for(var i=0;i<40;i+=2){var n=parseInt(c.substr(i,2),16);if(n)o+=String.fromCharCode(n)}return /^[\x20-\x7e]{2,}$/.test(o)?o:c.slice(0,6)+'…'}return c}
function lay(){var v=$('vToken'),hd=v&&v.querySelector('.tkhd');if(!hd)return;var pr=$('tkpr'),bt=hd.querySelector('.tkbt')||v.querySelector('.tkpb .tkbt'),pb=v.querySelector('.tkpb'),m=innerWidth<760;if(!pr||!bt)return;if(m){if(!pb){pb=document.createElement('div');pb.className='tkpb';hd.parentNode.insertBefore(pb,$('tkkp'))}pb.appendChild(pr);pb.appendChild(bt)}else if(pb){hd.appendChild(pr);hd.appendChild(bt);pb.remove()}}
function build(){
 var t=ST.t,v=$('vToken');if(!v)return;
 v.innerHTML='<div class="tkp2"><div class="tkhd"><a class="back" href="/squares" data-back="1">← Back</a><div class="tkav" style="background:hsl('+hue(t.md5||t.name||'x')+',70%,45%)">'+esc((t.name||t.currency||'?').slice(0,2).toUpperCase())+'</div><div class="tkid"><h2>'+esc(t.name||t.currency)+'<span class="ver" id="tkver"></span></h2><div class="mu mono tkcur">'+esc(curN(t.currency||''))+' · <button class="cp" data-c="'+esc(t.issuer||'')+'" title="Copy issuer">'+esc((t.issuer||'').slice(0,8))+'…'+esc((t.issuer||'').slice(-6))+' ⧉</button></div></div><span class="sp"></span><div class="tkpr" id="tkpr"><b class="mono" id="tkpx"></b><small id="tkpu"></small><div id="tkpc"></div></div><div class="tkbt"><a class="btn2 pri" id="tkx" target="_blank" rel="noopener">Post to X ↗</a><button class="btn2" id="tkcopy">Copy link</button><button class="btn2" id="tkshare">Share…</button><button class="btn2" id="tkwl"></button><button class="btn2" id="tksq">+ Squares</button></div></div>'+
 '<div class="kp" id="tkkp"></div>'+
 '<div class="tkmain"><div class="tkcard tkchart"><div class="tkct"><div class="seg2" id="tktf">'+Object.keys(TF).map(function(k){return '<button class="chip2" data-tf="'+k+'">'+k+'</button>'}).join('')+'</div><div class="seg2" id="tkty">'+['candle','line','area'].map(function(k){return '<button class="chip2" data-ty="'+k+'">'+k+'</button>'}).join('')+'</div><div class="seg2" id="tkop"><button class="chip2" data-o="usd">USD</button><button class="chip2" data-o="xrp">XRP</button><button class="chip2" data-o="sma">SMA</button><button class="chip2" data-o="vol">Vol</button></div><span class="sp"></span><span class="tkleg"><i style="background:#59c6ff"></i>SMA20 <i style="background:#ffc850"></i>SMA50 · xrpl.to</span></div><div class="tkch" id="tkch"><div class="tkpl" id="tkpl"><div class="empty">Loading chart…</div></div><div class="tkax" id="tkax"></div><div class="tktm" id="tktm"></div><div class="tkcx" id="tkcx"></div><div class="tkt" id="tkt"></div></div></div>'+
 '<div class="tkside"><div class="tkcard" id="tkswc"><h3>Swap · AMM pool</h3><iframe id="tkswf" title="Swap" style="width:100%;height:560px;border:0;background:transparent" src="/wallet?embed=1&to='+encodeURIComponent((t.issuer||'')+':'+(t.currency||''))+'&name='+encodeURIComponent(t.name||'')+'"></iframe></div><div class="tkcard"><h3>Market data</h3><div class="kv2" id="tkmd"></div></div><div class="tkcard"><h3>Analytics</h3><div class="kv2" id="tkan"></div><div id="tkpos"></div></div><div class="tkcard"><h3>Links</h3><div class="btns"><a class="btn2" target="_blank" rel="noopener" href="https://xrpl.to/token/'+encodeURIComponent(t.slug||ST.slug)+'">xrpl.to ↗</a><a class="btn2" target="_blank" rel="noopener" href="https://xrpscan.com/account/'+encodeURIComponent(t.issuer||'')+'">XRPScan ↗</a><a class="btn2" target="_blank" rel="noopener" href="https://livenet.xrpl.org/accounts/'+encodeURIComponent(t.issuer||'')+'">Explorer ↗</a></div><p class="disc">Market data by <a href="https://xrpl.to" target="_blank" rel="noopener">xrpl.to</a>. Not financial advice. Illiquid tokens can be volatile and easily manipulated.</p></div></div></div></div>';
 bind();lay();paintAll();if(!window.__tkrs){window.__tkrs=1;addEventListener('resize',function(){if(document.getElementById('tkpr'))lay()})}}
function paintHead(){var t=ST.t,sym=ST.usd?'USD':'XRP',p=ST.usd?+t.usd:+t.exch;$('tkpx').textContent=px(p);$('tkpu').textContent=' '+sym;if(!$('tkpx2')){var q=document.createElement('div');q.id='tkpx2';q.className='mu mono';$('tkpr').insertBefore(q,$('tkpc'))}$('tkpx2').textContent=ST.usd?'':UP(p);$('tkpc').innerHTML=pc(t.pro24h)+' <small class="mu">24h</small>';$('tkver').textContent=(t.verified||t.kyc)?' ✓ verified':'';if(ST.stale&&!$('tkold')){var o=document.createElement('div');o.id='tkold';o.className='disc';o.textContent='Showing the last saved data — refresh the page for live numbers.';$('tkpr').parentNode.parentNode.insertBefore(o,$('tkkp'))}$('tkx').setAttribute('href',tweetUrl());$('tkwl').textContent=wlHas()?'★ Watching':'☆ Watch'}
function paintKp(){var t=ST.t,sym=ST.usd?'USD':'XRP',p=ST.usd?+t.usd:+t.exch;$('tkkp').innerHTML=tile('PRICE ('+sym+')',px(p),ST.usd?'1h '+pc(t.pro1h):UP(p)+' · 1h '+pc(t.pro1h))+tile('24H CHANGE',pc(t.pro24h),t.maxMin24h?'hi '+px(t.maxMin24h[0]*K())+' · lo '+px(t.maxMin24h[1]*K()):'')+tile('7D CHANGE',pc(t.pro7d),'trend score '+(t.trendingScore!=null?num(+t.trendingScore):'—'))+tile('MARKET CAP',num(t.marketcap),'XRP · '+U(t.marketcap))+tile('VOLUME 24H',num(t.vol24hxrp),U(t.vol24hxrp)+(t.marketcap?' · vol/mcap '+((t.vol24hxrp/t.marketcap)*100).toFixed(2)+'%':''))+tile('HOLDERS',num(t.holders),num(t.trustlines)+' trustlines')+tile('AMM TVL',num(t.tvl),'XRP · '+U(t.tvl)+' · '+num(t.vol24htx)+' trades')}
function paintSide(){var t=ST.t,r=stats(ST.c||[]),sg=sig(r);
 $('tkmd').innerHTML=kvh([['Volume 24h',num(t.vol24hxrp)+' XRP<em class="usdn">'+U(t.vol24hxrp)+'</em>'],['Trades 24h',num(t.vol24htx)],['Market cap',num(t.marketcap)+' XRP<em class="usdn">'+U(t.marketcap)+'</em>'],['AMM TVL',num(t.tvl)+' XRP<em class="usdn">'+U(t.tvl)+'</em>'],['Holders',num(t.holders)],['Trustlines',num(t.trustlines)],['RSI (24h)',t.rsi24h!=null?(+t.rsi24h).toFixed(1):'—'],['Volatility 24h',t.volatility24h!=null?(+t.volatility24h).toFixed(2)+'%':'—'],['24h high',t.maxMin24h?px(t.maxMin24h[0]*K())+(ST.usd?'':'<em class="usdn">'+UP(t.maxMin24h[0])+'</em>'):'—'],['24h low',t.maxMin24h?px(t.maxMin24h[1]*K())+(ST.usd?'':'<em class="usdn">'+UP(t.maxMin24h[1])+'</em>'):'—']]);
 $('tkan').innerHTML=kvh([['Return ('+TF[ST.tf].l+')',r.ret!=null?pc(r.ret):'—'],['Period high',r.hi!=null?px(r.hi)+(ST.usd?'':'<em class="usdn">'+UP(r.hi)+'</em>'):'—'],['Period low',r.lo!=null?px(r.lo)+(ST.usd?'':'<em class="usdn">'+UP(r.lo)+'</em>'):'—'],['RSI-14',r.rsi!=null?r.rsi.toFixed(1):'—'],['Max drawdown',r.dd!=null?r.dd.toFixed(1)+'%':'—'],['Volatility/bar',r.sd!=null?r.sd.toFixed(2)+'%':'—'],['Avg vol/bar',r.avgv!=null?num(r.avgv)+'<em class="usdn">'+U(r.avgv)+'</em>':'—'],['Momentum','<span class="'+sg[1]+'">'+sg[0]+'</span>']]);
 $('tkpos').innerHTML=r.pos!=null?'<div class="rngb"><small class="mu">Position in period range</small><div class="rb"><i style="left:'+Math.max(0,Math.min(100,r.pos)).toFixed(0)+'%"></i></div><div class="rl"><span>Low</span><span>High</span></div></div>':''}
function paintChart(){var c=ST.c,pl=$('tkpl');if(!pl)return;
 if(c===null){pl.innerHTML='<div class="empty">Loading chart…</div>';$('tkax').innerHTML='';$('tktm').innerHTML='';ST.pm=null;return}
 var p=plot(c);if(!p){pl.innerHTML='<div class="empty">No chart data for this timeframe.</div>';$('tkax').innerHTML='';$('tktm').innerHTML='';ST.pm=null;return}
 pl.innerHTML=p.svg;$('tkax').innerHTML=p.ax;$('tktm').innerHTML=p.tm;ST.pm=p}
function syncCtl(){var v=$('vToken');v.querySelectorAll('[data-tf]').forEach(function(b){b.classList.toggle('on',b.getAttribute('data-tf')===ST.tf)});v.querySelectorAll('[data-ty]').forEach(function(b){b.classList.toggle('on',b.getAttribute('data-ty')===ST.type)});v.querySelectorAll('[data-o]').forEach(function(b){var o=b.getAttribute('data-o');b.classList.toggle('on',o==='usd'?ST.usd:o==='xrp'?!ST.usd:!!ST[o])})}
function paintAll(){syncCtl();paintHead();paintKp();paintSide();paintChart()}
function copy(s){try{navigator.clipboard.writeText(s).then(function(){toast('Copied')},function(){toast('Copy failed')})}catch(e){toast('Copy failed')}}
function bind(){
 var v=$('vToken'),ch=$('tkch'),tt=$('tkt'),cx=$('tkcx');
 v.onclick=function(e){var b=e.target.closest('button,a');if(!b)return;
  if(b.getAttribute('data-back')){e.preventDefault();if(window.__tkfrom)history.back();else{history.pushState(null,'','/squares');window.onpopstate&&window.onpopstate()}return}
  if(b.getAttribute('data-c')){copy(b.getAttribute('data-c'));return}
  var k=b.getAttribute('data-tf');if(k){ST.tf=k;ST.c=null;syncCtl();paintChart();paintSide();loadC();return}
  k=b.getAttribute('data-ty');if(k){ST.type=k;syncCtl();paintChart();return}
  k=b.getAttribute('data-o');if(k){if(k==='usd')ST.usd=true;else if(k==='xrp')ST.usd=false;else ST[k]=!ST[k];syncCtl();paintHead();paintKp();paintSide();paintChart();return}
  if(b.id==='tkcopy')copy(shareUrl());
  if(b.id==='tkshare'){if(navigator.share)navigator.share({title:(ST.t.name||'')+' on XRPLTODAY',url:shareUrl()}).catch(function(){});else copy(shareUrl())}
  if(b.id==='tkwl'){var i=WL.indexOf(ST.slug);if(i>=0)WL.splice(i,1);else WL.push(ST.slug);wlSave();paintHead()}
  if(b.id==='tksq'){try{var q=JSON.parse(localStorage.getItem('x2sq')||'{}'),cells=q.cells||[];if(cells.some(function(x){return x&&x.md5===ST.t.md5})){toast('Already in your Squares');return}var tk=ST.t,o={md5:tk.md5,name:tk.name||tk.currency,cur:tk.currency,iss:tk.issuer,slug:tk.slug,px:+tk.exch||0,usd:+tk.usd||0,c24:tk.pro24h,c7:tk.pro7d,vol:tk.vol24hxrp,mc:tk.marketcap,h:tk.holders};var j=cells.findIndex(function(x){return !x});if(j<0)cells.push(o);else cells[j]=o;q.cells=cells;localStorage.setItem('x2sq',JSON.stringify(q));toast('Added to XRPL Squares')}catch(er){toast('Could not add')}}};
 var mv=function(ev){var pm=ST.pm;if(!pm)return;var pl=$('tkpl'),r=pl.getBoundingClientRect(),X=(ev.touches?ev.touches[0].clientX:ev.clientX),f=Math.max(0,Math.min(1,(X-r.left)/r.width)),i=Math.max(0,Math.min(pm.n-1,Math.floor(f*pm.n))),p=pm.c[i],k=pm.k,fx=(i+.5)/pm.n;cx.style.left='calc((100% - 64px) * '+fx.toFixed(4)+')';cx.style.display='block';tt.style.display='block';tt.innerHTML='<b>'+new Date(p[0]).toISOString().slice(0,16).replace('T',' ')+'</b><span>O '+px(p[1]*k)+'</span><span>H '+px(p[2]*k)+'</span><span>L '+px(p[3]*k)+'</span><span>C '+px(p[4]*k)+'</span><span>Vol '+num(p[5])+'</span>'};
 ch.onmousemove=mv;ch.ontouchmove=mv;ch.ontouchstart=mv;ch.onmouseleave=function(){tt.style.display='none';cx.style.display='none'}}
function loadC(){var md5=ST.t&&ST.t.md5,tf=ST.tf,slug=ST.slug;if(!md5)return;getOhlc(md5,tf).then(function(c){if(slug!==ST.slug||tf!==ST.tf)return;ST.c=c;paintChart();paintSide()}).catch(function(){if(slug===ST.slug&&tf===ST.tf){ST.c=[];paintChart();paintSide()}})}
function open(slug){
 var v=$('vToken');if(!v)return;ST.slug=slug;ST.t=null;ST.c=null;ST.pm=null;ST.stale=0;
 v.innerHTML='<div class="tkp2 tkld"><a class="back" href="/squares" data-back="1">← Back</a><div class="empty">Loading token…</div></div>';
 v.onclick=function(e){var b=e.target.closest('[data-back]');if(b){e.preventDefault();if(window.__tkfrom)history.back();else{history.pushState(null,'','/squares');window.onpopstate&&window.onpopstate()}}};
 getTok(slug).then(function(t){if(slug!==ST.slug)return;if(!t){v.innerHTML='<div class="tkp2 tkld"><a class="back" href="/squares" data-back="1">← Back</a><div class="empty">We could not load this token right now — the data provider is busy.<br><button class="btn2 pri" onclick="location.reload()" style="margin-top:12px">Try again</button></div></div>';return}
  ST.t=t;document.title=(t.name||t.currency)+' price & chart — XRPLTODAY';build();loadC()}).catch(function(){v.innerHTML='<div class="tkp2 tkld"><a class="back" href="/squares" data-back="1">← Back</a><div class="empty">Could not load this token right now.<br><button class="btn2 pri" onclick="location.reload()" style="margin-top:12px">Try again</button></div></div>'});
 clearInterval(ST.iv)}
window.XD_token=open;window.XD_token.__v2=1;
})();

window.addEventListener('message',function(e){if(e.data&&e.data.xdswap){var f=document.getElementById('tkswf');if(f)f.style.height=Math.max(380,e.data.xdswap+6)+'px'}});
