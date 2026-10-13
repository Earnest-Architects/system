const {P,S,URL_}=window.DECK,I=f=>"images/"+f,N=S.length;
export const count=N;
export function buildDeck(stage,tk,go){
const fig=a=>`<figure><img src="${I(a[0])}" alt="${a[0]}" decoding="async">${a[1]===""?"":`<figcaption>${a[0]}</figcaption>`}</figure>`;
const pad=n=>"A-"+String(n).padStart(2,"0");
S.forEach((s,i)=>{
 const hd=`<header><span><b>Kajanchi邸</b>　360° Virtual Tour</span><span>${s.date}</span></header>`;
 const ft=`<footer><span class="snd">差出人：リナルディ</span><span class="pj"><em>プロジェクト</em><strong>Integrated Architecture Presentation Platform</strong></span><span class="no"><em>シート</em><strong>${pad(i+1)} / ${pad(N)}</strong></span></footer>`;
 let t="";
 if(s.cover){t=`<h1>${P}</h1><dl><dt>差出人</dt><dd>リナルディ</dd><dt>宛先</dt><dd>リナルディ、山口厳、赤田貴昭</dd><dt>作成日時</dt><dd>2026/9/17（木） 10:37</dd><dt>最終更新</dt><dd>2026/9/25（金） 15:15</dd></dl><p class="url">検証用プロジェクト：<a href="${URL_}" target="_blank" rel="noopener">${URL_}</a></p>`}
 else{
  t=(s.tag?`<span class="tag">${s.tag}</span>`:"")+`<h2>${s.title}</h2>`+s.p.map(x=>`<p>${x}</p>`).join("");
  if(s.pw)t+=`<div class="pw">パスワード <code>${s.pw}</code></div>`;
  if(s.p2)t+=s.p2.map(x=>`<p>${x}</p>`).join("");
  if(s.chips)t+=`<div class="chips">${s.chips.map(c=>`<span>${c}</span>`).join("")}</div>`;
  if(s.flow)t+=`<ol class="flow">${s.flow.map(c=>`<li>${c}</li>`).join("")}</ol>`;
  if(s.leg)t+=`<ul class="leg">${s.leg.map(l=>`<li><i>${l[0]}</i><span>${l[1]}</span></li>`).join("")}</ul>`;
  if(s.end)t+=`<p><a href="${URL_}" target="_blank" rel="noopener">${URL_}</a></p>`;
 }
 const el=document.createElement("section");
 el.className="sheet"+(s.cover?" cover":"");el.style.zIndex=N-i;
 el.innerHTML=`<div class="face front"><div class="fr">${hd}<main><div class="txt">${t}</div><div class="imgs ${s.g}">${s.imgs.map(fig).join("")}</div></main>${ft}</div></div>`;
 stage.appendChild(el);
 const b=document.createElement("button");b.className="tick";b.setAttribute("aria-label","シート "+pad(i+1));b.onclick=()=>go(i);tk.appendChild(b);
});

return [...stage.children]}
