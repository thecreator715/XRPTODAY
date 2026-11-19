(function(){
var $=function(i){return document.getElementById(i)};
function esc(s){return String(s==null?'':s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
function ago(t){var m=Math.max(1,Math.round((Date.now()-t)/6e4));return m<60?m+'m':m<1440?Math.round(m/60)+'h':Math.round(m/1440)+'d'}
function hue(s){var n=0;for(var i=0;i<s.length;i++)n=(n*31+s.charCodeAt(i))%360;return n}
var CVC={},Q=[],ACT=0;
function pump(){while(ACT<4&&Q.length){var j=Q.shift();ACT++;j()}}
function setCover(ph,im){if(!ph.parentNode)return;if(!im){ph.classList.remove('ph');ph.classList.add('fb');return}var g=new Image();g.className='cvr';g.loading='lazy';g.decoding='async';g.referrerPolicy='no-referrer';g.alt='';g.onerror=function(){if(g.parentNode){ph.classList.remove('ph');ph.classList.add('fb');g.replaceWith(ph)}};g.src=im;ph.replaceWith(g)}
var IO=window.IntersectionObserver?new IntersectionObserver(function(es){es.forEach(function(e){if(!e.isIntersecting)return;var ph=e.target;IO.unobserve(ph);var u=ph.getAttribute('data-cv');if(!u)return;if(CVC[u]!==undefined){setCover(ph,CVC[u]);return}Q.push(function(){fetch('/api/cover?u='+encodeURIComponent(u)).then(function(r){return r.json()}).then(function(d){CVC[u]=d&&d.im||'';setCover(ph,CVC[u])}).catch(function(){CVC[u]='';setCover(ph,'')}).then(function(){ACT--;pump()})});pump()})},{rootMargin:'500px 0px'}):null;
var ST={k:'stocks',f:'All',items:[]},META={stocks:{t:'Top Stock <i>News</i>',s:'Wall Street, earnings, indexes and the stocks moving markets — pulled live from top financial publishers, with links to every story.',ch:['All','Indexes','Earnings','Tech','Fed','Movers']},metals:{t:'<i>METALS</i>',s:'Gold, silver and copper prices, central-bank buying and industrial demand — pulled live from top publishers, with links to every story.',ch:['All','Gold','Silver','Copper','Other']}};
function render(){var m=META[ST.k],its=ST.items.filter(function(x){return ST.f==='All'||(x.c||[]).indexOf(ST.f)>=0}),h='';
 its.forEach(function(it){var tg=(it.c||[]).slice(0,2).map(function(c){return '<span class="tg">'+esc(c)+'</span>'}).join('');
  h+='<a class="row" href="'+esc(it.u)+'" target="_blank" rel="noopener noreferrer"><div class="meta"><span class="age mono">'+ago(it.ts)+'</span><span class="src">'+esc(it.s)+'</span>'+tg+'</div><div class="hl">'+esc(it.t)+'</div>'+(it.im?'<img class="cvr" loading="lazy" decoding="async" referrerpolicy="no-referrer" alt="" src="'+esc(it.im)+'">':'<div class="cvr ph" data-cv="'+esc(it.u)+'" style="--h:'+hue(it.t+it.s)+'"></div>')+'</a>'});
 if(!its.length)h='<div class="empty">'+(ST.loading?'Loading…':'No stories right now.')+'</div>';
 $('vMkt').innerHTML='<div class="bhead"><h2>'+m.t+'</h2><p>'+m.s+'</p></div><div class="mkf">'+m.ch.map(function(c){return '<button class="chip'+(c===ST.f?' on':'')+'" data-f="'+c+'">'+c+'</button>'}).join('')+'<span class="mkn">'+its.length+' stories</span></div><div class="feed" id="mkfeed">'+h+'</div>';
 $('vMkt').onclick=function(e){var b=e.target.closest('[data-f]');if(b){ST.f=b.getAttribute('data-f');render()}};
 if(IO)document.querySelectorAll('#mkfeed .cvr.ph').forEach(function(p){IO.observe(p)})}
window.XD_mk=function(k){ST.k=k==='metals'?'metals':'stocks';ST.f='All';ST.items=[];ST.loading=1;render();
 fetch('/api/mkt?k='+ST.k).then(function(r){return r.json()}).then(function(d){ST.items=d.items||[];ST.loading=0;render()}).catch(function(){ST.loading=0;render()})};
})();
