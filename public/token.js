/* XRPLTODAY token page — loaded on demand for /token/:slug */
(function(){
if(window.XD_token&&window.XD_token.__ok)return;
var TF={'15m':{n:96,l:'24h'},'1h':{n:120,l:'5d'},'4h':{n:120,l:'20d'},'1d':{n:120,l:'120d'}};
var ST={tf:'1h',type:'candle',usd:true,sma:true,vol:true,slug:null,t:null,c:null,tm:0};
var WL=[];try{WL=JSON.parse(localStorage.getItem('x2wl')||'[]')}catch(e){}
function $(i){return document.getElementById(i)}
function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
function num(v){if(v==null||isNaN(v))return '—';var a=Math.abs(v);if(a>=1e12)return (v/1e12).toFixed(2)+'T';if(a>=1e9)return (v/1e9).toFixed(2)+'B';if(a>=1e6)return (v/1e6).toFixed(2)+'M';if(a>=1e3)return (v/1e3).toFixed(1)+'K';return v.toFixed(a<10?2:0)}
function px(v){if(v==null||isNaN(v)||v===0)return '—';var a=Math.abs(v);if(a>=1000)return v.toLocaleString('en-US',{maximumFractionDigits:2});if(a>=1)return v.toFixed(4);if(a>=0.01)return v.toFixed(5);if(a>=1e-6)return v.toFixed(8);return v.toExponential(2)}
function pc(v){if(v==null||isNaN(v))return '<span class="mu">—</span>';return '<span class="'+(v>=0?'up':'down')+'">'+(v>=0?'+':'')+(+v).toFixed(2)+'%</span>'}
function toast(m){if(window.XDtoast)window.XDtoast(m);}
function direct(p){return fetch('https://api.xrpl.to'+p).then(function(r){if(!r.ok)throw new Error(String(r.status));return r.json()})}
function getTok(slug){return direct('/v1/token/'+encodeURIComponent(slug)).catch(function(){return fetch('/api/sq/token?slug='+encodeURIComponent(slug)).then(function(r){return r.json()})}).then(function(d){return d&&d.token})}
function getOhlc(md5,tf){var c=TF[tf];return direct('/v1/ohlc/'+md5+'?interval='+tf+'&limit='+c.n).catch(function(){return fetch('/api/sq/ohlc?md5='+md5+'&i='+tf+'&n='+c.n).then(function(r){return r.json()})}).then(function(d){return (d&&d.ohlc||[]).map(function(a){return a.map(Number)}).filter(function(a){return a.length>=5&&a[0]})})}
function sma(c,n){var o=[],s=0;for(var i=0;i<c.length;i++){s+=c[i][4];if(i>=n)s-=c[i-n][4];o.push(i>=n-1?s/n:null)}return o}
function rsi(c,n){n=n||14;if(c.length<n+1)return null;var g=0,l=0;for(var i=1;i<=n;i++){var d=c[i][4]-c[i-1][4];if(d>=0)g+=d;else l-=d}g/=n;l/=n;for(i=n+1;i<c.length;i++){d=c[i][4]-c[i-1][4];g=(g*(n-1)+Math.max(d,0))/n;l=(l*(n-1)+Math.max(-d,0))/n}return l===0?100:100-100/(1+g/l)}
function shareUrl(){return location.origin+'/token/'+encodeURIComponent(ST.slug)}
function tweetUrl(){var t=ST.t,txt=(t?'$'+(t.name||t.currency)+' on the XRP Ledger — '+px(+t.usd)+' USD ('+((t.pro24h>=0?'+':'')+(+t.pro24h||0).toFixed(2))+'% 24h). Live chart & analytics on XRPLTODAY':'XRPL token on XRPLTODAY');return 'https://twitter.com/intent/tweet?text='+encodeURIComponent(txt+'\n\n'+shareUrl()+'\n\nView at XRPTODAY.com #XRPL #XRP #XRPTODAY')}
function wlHas(){return WL.indexOf(ST.slug)>=0}
function wlSave(){try{localStorage.setItem('x2wl',JSON.stringify(WL))}catch(e){}}

function chartSvg(c,W,H){
 var n=c.length;if(n<2)return '<div class="empty">No chart data for this timeframe.</div>';
 var k=ST.usd&&ST.t&&+ST.t.exch?(+ST.t.usd/+ST.t.exch):1,pad=6,vh=ST.vol?64:0,ph=H-vh-22,hi=-1e99,lo=1e99,vm=0,i;
 var m20=ST.sma?sma(c,20):null,m50=ST.sma?sma(c,50):null;
 for(i=0;i<n;i++){hi=Math.max(hi,c[i][2]*k);lo=Math.min(lo,c[i][3]*k);vm=Math.max(vm,c[i][5]||0)}
 var sp=(hi-lo)||hi*0.01||1;hi+=sp*.06;lo-=sp*.06;sp=hi-lo;
 var X=function(j){return pad+(W-pad*2-58)*(j+.5)/n},Y=function(v){return 8+ph*(1-(v*k-lo)/sp)};
 var g='',cw=Math.max(1.5,(W-pad*2-58)/n*0.62),up='#35d6a0',dn='#ff5d73';
 for(i=0;i<=4;i++){var yy=8+ph*i/4,vv=hi-sp*i/4;g+='<line x1="0" x2="'+(W-56)+'" y1="'+yy+'" y2="'+yy+'" stroke="rgba(140,160,200,.12)" stroke-dasharray="3 5"/><text x="'+(W-52)+'" y="'+(yy+4)+'" fill="#8fa0bd" font-size="10.5" font-family="ui-monospace,monospace">'+px(vv)+'</text>'}
 var lastUp=c[n-1][4]>=c[0][4],col=lastUp?up:dn,d='',a='';
 if(ST.type==='candle'){for(i=0;i<n;i++){var o=c[i][1],cl=c[i][4],h=c[i][2],l=c[i][3],u=cl>=o,cc=u?up:dn,x=X(i);g+='<line x1="'+x+'" x2="'+x+'" y1="'+Y(h)+'" y2="'+Y(l)+'" stroke="'+cc+'" stroke-width="1.2"/><rect x="'+(x-cw/2)+'" y="'+Math.min(Y(o),Y(cl))+'" width="'+cw+'" height="'+Math.max(1.2,Math.abs(Y(o)-Y(cl)))+'" fill="'+cc+'" rx=".8"/>'}}
 else{for(i=0;i<n;i++)d+=(i?'L':'M')+X(i).toFixed(1)+' '+Y(c[i][4]).toFixed(1);if(ST.type==='area')a='<path d="'+d+'L'+X(n-1)+' '+(8+ph)+'L'+X(0)+' '+(8+ph)+'Z" fill="url(#tga)"/>';g+=a+'<path d="'+d+'" fill="none" stroke="'+col+'" stroke-width="2" stroke-linejoin="round"/>'}
 function ln(arr,cl){var s='',st=0;for(var j=0;j<n;j++){if(arr[j]==null)continue;s+=(st++?'L':'M')+X(j).toFixed(1)+' '+Y(arr[j]).toFixed(1)}return s?'<path d="'+s+'" fill="none" stroke="'+cl+'" stroke-width="1.4" opacity=".9"/>':''}
 if(m20)g+=ln(m20,'#59c6ff')+ln(m50,'#ffc850');
 if(ST.vol){for(i=0;i<n;i++){var vv2=(c[i][5]||0)/(vm||1)*(vh-6),u2=c[i][4]>=c[i][1];g+='<rect x="'+(X(i)-cw/2)+'" y="'+(H-22-vv2)+'" width="'+cw+'" height="'+vv2+'" fill="'+(u2?up:dn)+'" opacity=".35"/>'}}
 var tl='',st2=Math.max(1,Math.floor(n/5));for(i=0;i<n;i+=st2){var dt=new Date(c[i][0]);tl+='<text x="'+X(i)+'" y="'+(H-6)+'" fill="#8fa0bd" font-size="10" text-anchor="middle">'+(ST.tf==='1d'?(dt.getUTCMonth()+1)+'/'+dt.getUTCDate():dt.toISOString().slice(5,10)+' '+dt.toISOString().slice(11,16))+'</text>'}
 var lp=c[n-1][4]*k;g+='<line x1="0" x2="'+(W-56)+'" y1="'+Y(c[n-1][4])+'" y2="'+Y(c[n-1][4])+'" stroke="'+col+'" stroke-dasharray="2 3" opacity=".7"/><rect x="'+(W-57)+'" y="'+(Y(c[n-1][4])-9)+'" width="57" height="18" rx="4" fill="'+col+'"/><text x="'+(W-54)+'" y="'+(Y(c[n-1][4])+4)+'" fill="#06090f" font-size="10.5" font-weight="700" font-family="ui-monospace,monospace">'+px(lp)+'</text>';
 return '<svg id="tkc" viewBox="0 0 '+W+' '+H+'" width="100%" style="display:block;touch-action:pan-y"><defs><linearGradient id="tga" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="'+col+'" stop-opacity=".35"/><stop offset="1" stop-color="'+col+'" stop-opacity="0"/></linearGradient></defs>'+g+tl+'<line id="tkx" y1="8" y2="'+(8+ph)+'" stroke="#59c6ff" stroke-width="1" opacity="0"/></svg><div id="tkt" class="tkt"></div>'
}
function stats(c){
 var t=ST.t,k=ST.usd&&+t.exch?(+t.usd/+t.exch):1,r={};
 if(c&&c.length>1){var hi=-1e99,lo=1e99,vs=0,i;for(i=0;i<c.length;i++){hi=Math.max(hi,c[i][2]);lo=Math.min(lo,c[i][3]);vs+=c[i][5]||0}
  r.hi=hi*k;r.lo=lo*k;r.ret=(c[c.length-1][4]/c[0][4]-1)*100;r.rsi=rsi(c);r.avgv=vs/c.length;r.pos=hi>lo?(c[c.length-1][4]-lo)/(hi-lo)*100:50;
  var rets=[];for(i=1;i<c.length;i++)rets.push(Math.log(c[i][4]/c[i-1][4]));var mu=rets.reduce(function(a,b){return a+b},0)/rets.length;r.sd=Math.sqrt(rets.reduce(function(a,b){return a+(b-mu)*(b-mu)},0)/rets.length)*100;
  var dd=0,pk=c[0][4];for(i=0;i<c.length;i++){pk=Math.max(pk,c[i][4]);dd=Math.min(dd,c[i][4]/pk-1)}r.dd=dd*100}
 return r}
function sig(r){if(r.rsi==null)return ['—','mu'];return r.rsi>=70?['Overbought','down']:r.rsi<=30?['Oversold','up']:r.rsi>=55?['Bullish momentum','up']:r.rsi<=45?['Bearish momentum','down']:['Neutral','mu']}
function render(){
 var t=ST.t,c=ST.c,r=stats(c||[]),K=ST.usd&&+t.exch?(+t.usd/+t.exch):1,v=$('vToken');if(!v)return;
 var sg=sig(r),ver=t.verified||t.kyc,sym=ST.usd?'USD':'XRP',price=ST.usd?+t.usd:+t.exch;
 var kv=[['Price ('+sym+')',px(price)],['1h',pc(t.pro1h)],['24h',pc(t.pro24h)],['7d',pc(t.pro7d)],['Market cap',num(t.marketcap)+' XRP'],['Volume 24h',num(t.vol24hxrp)+' XRP'],['Trades 24h',num(t.vol24htx)],['Holders',num(t.holders)],['Trustlines',num(t.trustlines)],['AMM TVL',num(t.tvl)+' XRP'],['RSI (24h)',t.rsi24h!=null?(+t.rsi24h).toFixed(1):'—'],['Volatility 24h',t.volatility24h!=null?(+t.volatility24h).toFixed(2)+'%':'—'],['24h high',t.maxMin24h?px(t.maxMin24h[0]*K):'—'],['24h low',t.maxMin24h?px(t.maxMin24h[1]*K):'—'],['Trending score',t.trendingScore!=null?num(+t.trendingScore):'—'],['Vol / mcap',t.marketcap?((t.vol24hxrp/t.marketcap)*100).toFixed(2)+'%':'—']];
 var an=[['Period return ('+TF[ST.tf].l+')',r.ret!=null?pc(r.ret):'—'],['Period high',r.hi!=null?px(r.hi):'—'],['Period low',r.lo!=null?px(r.lo):'—'],['RSI-14 (chart)',r.rsi!=null?r.rsi.toFixed(1):'—'],['Max drawdown',r.dd!=null?r.dd.toFixed(1)+'%':'—'],['Volatility / bar',r.sd!=null?r.sd.toFixed(2)+'%':'—'],['Avg volume / bar',r.avgv!=null?num(r.avgv):'—'],['Momentum','<span class="'+sg[1]+'">'+sg[0]+'</span>']];
 v.innerHTML='<div class="tk"><div class="tkh"><a class="back" href="/squares" data-back="1">← Back</a><div class="tkt1"><div class="tkav" style="background:hsl('+(function(s){var h=0;for(var i=0;i<s.length;i++)h=(h*31+s.charCodeAt(i))%360;return h})(t.md5||t.name)+',70%,45%)">'+esc((t.name||t.currency||'?').slice(0,2).toUpperCase())+'</div><div><h2>'+esc(t.name||t.currency)+(ver?' <span class="ver">✓ verified</span>':'')+'</h2><div class="mu mono">'+esc(t.currency||'')+' · <button class="cp" data-c="'+esc(t.issuer||'')+'" title="Copy issuer">'+esc((t.issuer||'').slice(0,8))+'…'+esc((t.issuer||'').slice(-6))+' ⧉</button></div></div></div>'+
 '<div class="tkp"><b class="mono">'+px(price)+'</b> <small>'+sym+'</small><div>'+pc(t.pro24h)+' <small class="mu">24h</small></div></div></div>'+
 '<div class="tkb"><a class="btn2 pri" target="_blank" rel="noopener" href="'+tweetUrl()+'">Post to X ↗</a><button class="btn2" id="tkcopy">Copy link</button><button class="btn2" id="tkshare">Share…</button><button class="btn2" id="tkwl">'+(wlHas()?'★ Watching':'☆ Watch')+'</button><button class="btn2" id="tksq">+ Add to Squares</button></div>'+
 '<div class="tkcard"><div class="tkct"><div class="seg2" id="tktf">'+Object.keys(TF).map(function(k){return '<button class="chip2'+(k===ST.tf?' on':'')+'" data-tf="'+k+'">'+k+'</button>'}).join('')+'</div><div class="seg2" id="tkty">'+['candle','line','area'].map(function(k){return '<button class="chip2'+(k===ST.type?' on':'')+'" data-ty="'+k+'">'+k+'</button>'}).join('')+'</div><div class="seg2" id="tkop"><button class="chip2'+(ST.usd?' on':'')+'" data-o="usd">USD</button><button class="chip2'+(!ST.usd?' on':'')+'" data-o="xrp">XRP</button><button class="chip2'+(ST.sma?' on':'')+'" data-o="sma">SMA</button><button class="chip2'+(ST.vol?' on':'')+'" data-o="vol">Vol</button></div></div><div class="tkch" id="tkch">'+(c?chartSvg(c,ST.W||900,ST.H||400):'<div class="empty">Loading chart…</div>')+'</div><div class="tkleg"><i style="background:#59c6ff"></i>SMA 20 <i style="background:#ffc850"></i>SMA 50 <span class="mu">Data: xrpl.to</span></div></div>'+
 '<div class="tkg"><div class="tkcard"><h3>Market data</h3><div class="kv2">'+kv.map(function(p){return '<div><small>'+p[0]+'</small><b class="mono">'+p[1]+'</b></div>'}).join('')+'</div></div><div class="tkcard"><h3>Analytics</h3><div class="kv2">'+an.map(function(p){return '<div><small>'+p[0]+'</small><b class="mono">'+p[1]+'</b></div>'}).join('')+'</div>'+(r.pos!=null?'<div class="rngb"><small class="mu">Position in period range</small><div class="rb"><i style="left:'+Math.max(0,Math.min(100,r.pos)).toFixed(0)+'%"></i></div><div class="rl"><span>Low</span><span>High</span></div></div>':'')+'</div></div>'+
 '<div class="tkcard"><h3>Links</h3><div class="btns"><a class="btn2" target="_blank" rel="noopener" href="https://xrpl.to/token/'+encodeURIComponent(t.slug||ST.slug)+'">xrpl.to ↗</a><a class="btn2" target="_blank" rel="noopener" href="https://xrpscan.com/account/'+encodeURIComponent(t.issuer||'')+'">Issuer on XRPScan ↗</a><a class="btn2" target="_blank" rel="noopener" href="https://livenet.xrpl.org/accounts/'+encodeURIComponent(t.issuer||'')+'">XRPL Explorer ↗</a></div><p class="disc">Market data from xrpl.to. Not financial advice. Prices of illiquid tokens can be volatile and easily manipulated.</p></div></div>';
 var chh=$('tkch');if(chh&&c&&c.length>1&&!ST._r){var cw=Math.round(chh.clientWidth),ch2=Math.round(chh.clientHeight);if(cw>300&&ch2>200&&(Math.abs(cw-(ST.W||900))>4||Math.abs(ch2-(ST.H||400))>4)){ST.W=cw;ST.H=ch2;ST._r=1;render();ST._r=0;return}}
 bind()}
function bind(){
 var v=$('vToken'),cv=$('tkc'),tt=$('tkt');
 v.onclick=function(e){var b=e.target.closest('button,a');if(!b)return;
  if(b.getAttribute('data-back')){e.preventDefault();if(window.__tkfrom)history.back();else{history.pushState(null,'','/squares');window.onpopstate&&window.onpopstate()}return}
  if(b.getAttribute('data-c')){copy(b.getAttribute('data-c'));return}
  var k=b.getAttribute('data-tf');if(k){ST.tf=k;ST.c=null;render();loadC();return}
  k=b.getAttribute('data-ty');if(k){ST.type=k;render();return}
  k=b.getAttribute('data-o');if(k){if(k==='usd')ST.usd=true;else if(k==='xrp')ST.usd=false;else ST[k]=!ST[k];render();return}
  if(b.id==='tkcopy')copy(shareUrl());
  if(b.id==='tkshare'){if(navigator.share)navigator.share({title:(ST.t.name||'')+' on XRPLTODAY',url:shareUrl()}).catch(function(){});else copy(shareUrl())}
  if(b.id==='tkwl'){var i=WL.indexOf(ST.slug);if(i>=0)WL.splice(i,1);else WL.push(ST.slug);wlSave();render()}
  if(b.id==='tksq'){try{var q=JSON.parse(localStorage.getItem('x2sq')||'{}'),cells=q.cells||[];if(cells.some(function(x){return x&&x.md5===ST.t.md5})){toast('Already in your Squares');return}var tk=ST.t,o={md5:tk.md5,name:tk.name||tk.currency,cur:tk.currency,iss:tk.issuer,slug:tk.slug,px:+tk.exch||0,usd:+tk.usd||0,c24:tk.pro24h,c7:tk.pro7d,vol:tk.vol24hxrp,mc:tk.marketcap,h:tk.holders};var j=cells.findIndex(function(x){return !x});if(j<0)cells.push(o);else cells[j]=o;q.cells=cells;localStorage.setItem('x2sq',JSON.stringify(q));toast('Added to XRPL Squares')}catch(er){toast('Could not add')}}};
 if(cv){var c=ST.c,n=c.length,W=ST.W||900;var mv=function(ev){var r=cv.getBoundingClientRect(),cx=(ev.touches?ev.touches[0].clientX:ev.clientX),f=(cx-r.left)/r.width*W,i=Math.max(0,Math.min(n-1,Math.round((f-6-.5*(W-70)/n)/((W-70)/n)))),p=c[i],K=ST.usd&&+ST.t.exch?(+ST.t.usd/+ST.t.exch):1,x=6+(W-70)*(i+.5)/n,xl=$('tkx');xl.setAttribute('x1',x);xl.setAttribute('x2',x);xl.setAttribute('opacity','.8');tt.style.display='block';tt.innerHTML='<b>'+new Date(p[0]).toISOString().slice(0,16).replace('T',' ')+'</b><span>O '+px(p[1]*K)+'</span><span>H '+px(p[2]*K)+'</span><span>L '+px(p[3]*K)+'</span><span>C '+px(p[4]*K)+'</span><span>Vol '+num(p[5])+'</span>'};cv.onmousemove=mv;cv.ontouchmove=mv;cv.ontouchstart=mv;cv.onmouseleave=function(){tt.style.display='none';$('tkx').setAttribute('opacity','0')}}
}
function copy(s){try{navigator.clipboard.writeText(s).then(function(){toast('Copied')},function(){toast('Copy failed')})}catch(e){toast('Copy failed')}}
function loadC(){var md5=ST.t&&ST.t.md5,tf=ST.tf,slug=ST.slug;if(!md5)return;getOhlc(md5,tf).then(function(c){if(slug!==ST.slug||tf!==ST.tf)return;ST.c=c;render()}).catch(function(){if(slug===ST.slug){ST.c=[];render()}})}
function open(slug){
 var v=$('vToken');if(!v)return;ST.slug=slug;ST.t=null;ST.c=null;
 v.innerHTML='<div class="tk"><a class="back" href="/squares" data-back="1">← Back</a><div class="empty">Loading token…</div></div>';
 v.onclick=function(e){var b=e.target.closest('[data-back]');if(b){e.preventDefault();if(window.__tkfrom)history.back();else{history.pushState(null,'','/squares');window.onpopstate&&window.onpopstate()}}};
 getTok(slug).then(function(t){if(slug!==ST.slug)return;if(!t){v.innerHTML='<div class="tk"><a class="back" href="/squares" data-back="1">← Back</a><div class="empty">Token not found.</div></div>';return}
  ST.t=t;document.title=(t.name||t.currency)+' price & chart — XRPLTODAY';render();loadC()}).catch(function(){v.innerHTML='<div class="tk"><a class="back" href="/squares" data-back="1">← Back</a><div class="empty">Could not load this token right now.</div></div>'});
 clearInterval(ST.iv);ST.iv=setInterval(function(){if(location.pathname.indexOf('/token/')!==0){clearInterval(ST.iv);return}getTok(slug).then(function(t){if(t&&slug===ST.slug){ST.t=t;render()}}).catch(function(){});loadC()},30000)}
window.XD_token=open;window.XD_token.__ok=1;
})();
