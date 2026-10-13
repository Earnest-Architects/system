import {buildDeck,count as N} from './slides.js';
import {createPaper} from './paper.js';
import {snap,has,get,clear,setDropHandler} from './snapshot.js';

const $=id=>document.getElementById(id);
const lb=$('lb'),stage=$('stage'),tk=$('ticks');
const rm=matchMedia('(prefers-reduced-motion:reduce)').matches;
const cl=n=>Math.max(0,Math.min(N-1,n));
const paper=rm?null:createPaper(stage);          // null -> fallback: fade biasa
if(paper)setDropHandler(c=>paper.drop(c));

const sh=buildDeck(stage,tk,n=>go(n)),tc=[...tk.children];
let pos=0,tgt=0,raf=0,gen=0,cur=-1;

/* ---------- render: satu sheet berputar (WebGL), sisanya tumpukan DOM ---------- */
function render(){
  const f=Math.floor(pos+1e-9),p=Math.max(0,pos-f);let turning=false;
  sh.forEach((el,i)=>{
    let tf='none',vis=1,op=1,live=false;
    if(i<f)vis=0;
    else if(i===f){
      if(!p)live=true;
      else if(paper&&has(f)){turning=true;vis=0}
      else{op=1-p;snap(sh,f)}                      // tekstur belum siap -> fade, lalu siapkan
    }else{
      const d=i-pos,o=Math.min(d,2.2);if(d>=3)vis=0;
      tf=`translate(${o*6}px,${o*5}px)`;op=Math.max(0,Math.min(1,3-d));
    }
    const s=el.style;s.transform=tf;s.visibility=vis?'visible':'hidden';s.opacity=op;
    s.pointerEvents=live?'auto':'none';el.inert=!live;
  });
  if(turning){
    try{if(cur!==f){paper.setPage(get(f));cur=f}paper.show(p)}
    catch(e){console.warn('WebGL gagal, pakai fade',e);paper.hide();clear();turning=false}
  }
  if(!turning)paper&&paper.hide();
  const c=Math.round(pos);tc.forEach((b,i)=>b.setAttribute('aria-current',i===c));
}

/* ---------- prefetch tekstur halaman di sekitar posisi aktif ---------- */
const idle=window.requestIdleCallback||(f=>setTimeout(f,60));
function prefetch(){
  if(!paper)return;const c=Math.round(pos);
  idle(async()=>{for(const k of [c,c-1,c+1,c-2]){if(k>=0&&k<N-1)await snap(sh,k)}});
}
function settle(){
  history.replaceState(null,'','#'+(Math.round(pos)+1));
  const t=sh[Math.round(pos)].querySelector('.txt');if(t)t.scrollTop=0;prefetch();
}

/* ---------- animasi ---------- */
function anim(to){
  cancelAnimationFrame(raf);const from=pos;
  if(rm||from===to){pos=to;render();settle();return}
  const n=Math.abs(to-from),dur=Math.min(1500,720+110*(Math.ceil(n)-1)),t0=performance.now();
  const e=k=>k<.5?4*k*k*k:1-Math.pow(-2*k+2,3)/2;
  (function step(now){
    const k=Math.min(1,(now-t0)/dur);pos=from+(to-from)*e(k);render();
    if(k<1)raf=requestAnimationFrame(step);else{pos=to;render();settle()}
  })(t0);
}
async function go(n){
  tgt=cl(n);const g=++gen;
  if(paper&&tgt!==pos){                             // pastikan tekstur sheet pertama siap sebelum mulai
    const k=tgt>pos?Math.floor(pos+1e-9):Math.ceil(pos-1e-9)-1;
    if(k>=0&&k<N-1&&!has(k))await snap(sh,k);
    if(g!==gen)return;
  }
  anim(tgt);
}

/* ---------- input ---------- */
$('pv').onclick=()=>go(tgt-1);$('nx').onclick=()=>go(tgt+1);
addEventListener('keydown',e=>{
  if(e.key==='Escape')lb.classList.remove('on');
  if(e.target.closest&&e.target.closest('button,a,input,textarea'))return;   // cegah navigasi ganda saat fokus di tombol
  if(['ArrowRight','PageDown',' '].includes(e.key)){e.preventDefault();go(tgt+1)}
  if(['ArrowLeft','PageUp'].includes(e.key)){e.preventDefault();go(tgt-1)}
  if(e.key==='Home')go(0);if(e.key==='End')go(N-1);
});
let wl=0;
addEventListener('wheel',e=>{
  if(lb.classList.contains('on'))return;
  const t=e.target.closest('.txt,main');
  if(t&&t.scrollHeight>t.clientHeight+2){
    const top=t.scrollTop<=0&&e.deltaY<0,bot=t.scrollTop+t.clientHeight>=t.scrollHeight-2&&e.deltaY>0;
    if(!top&&!bot)return;
  }
  const d=Math.abs(e.deltaX)>Math.abs(e.deltaY)?e.deltaX:e.deltaY,n=Date.now();
  if(n-wl<650||Math.abs(d)<8)return;wl=n;go(tgt+(d>0?1:-1));
},{passive:true});

let dr=null,sw=0;
stage.addEventListener('pointerdown',e=>{
  if(e.button||lb.classList.contains('on')||e.target.closest('a'))return;
  if(e.pointerType==='mouse'&&e.target.closest('.txt'))return;
  cancelAnimationFrame(raf);gen++;dr={x:e.clientX,y:e.clientY,p0:pos,on:0,id:e.pointerId,v:[]};
});
stage.addEventListener('pointermove',e=>{
  if(!dr||e.pointerId!==dr.id)return;const dx=e.clientX-dr.x,dy=e.clientY-dr.y;
  if(!dr.on){if(Math.abs(dx)>10&&Math.abs(dx)>Math.abs(dy)*1.3){dr.on=1;stage.setPointerCapture(e.pointerId);stage.classList.add('drag')}else return}
  pos=cl(dr.p0-dx/(stage.clientWidth*.8));dr.v.push([performance.now(),e.clientX]);if(dr.v.length>5)dr.v.shift();render();
});
function end(){
  if(!dr)return;const d=dr;dr=null;stage.classList.remove('drag');
  if(!d.on){if(pos!==tgt)anim(tgt);return}
  sw=Date.now();
  const a=d.v[0],z=d.v[d.v.length-1],vx=a&&z&&z[0]>a[0]?(z[1]-a[1])/(z[0]-a[0]):0,b=Math.round(d.p0);
  const q=pos-vx/(stage.clientWidth*.8)*220-b;go(b+(q>.22?1:q<-.22?-1:0));
}
stage.addEventListener('pointerup',end);stage.addEventListener('pointercancel',end);

/* ---------- lightbox ---------- */
stage.addEventListener('click',e=>{
  if(Date.now()-sw<120)return;const f=e.target.closest('figure');if(!f)return;
  lb.querySelector('img').src=f.querySelector('img').src;lb.classList.add('on');lb.focus();
});
lb.onclick=()=>lb.classList.remove('on');

/* ---------- resize: ukuran berubah -> tekstur & geometri dibuat ulang ---------- */
let rt=0;
addEventListener('resize',()=>{clearTimeout(rt);rt=setTimeout(()=>{if(paper){clear();cur=-1;paper.resize()}render();prefetch()},150)});

tgt=pos=cl((parseInt(location.hash.slice(1))||1)-1);render();settle();
