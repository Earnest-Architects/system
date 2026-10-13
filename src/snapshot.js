// Mengubah DOM halaman (.front) menjadi canvas agar bisa dipakai sebagai tekstur WebGL.
import html2canvas from 'html2canvas';
const cache=new Map(),pend=new Map(),MAX=8;let onDrop=()=>{};
export const setDropHandler=f=>onDrop=f;
export const has=k=>cache.has(k);
export const get=k=>cache.get(k);
export const clear=()=>{cache.forEach(onDrop);cache.clear()};

export function snap(sheets,k){
  if(cache.has(k))return Promise.resolve(cache.get(k));
  if(pend.has(k))return pend.get(k);
  const p=html2canvas(sheets[k].querySelector('.front'),{
    scale:Math.min(devicePixelRatio||1,2),backgroundColor:null,logging:false,
    onclone:(d,c)=>{
      for(let n=c;n&&n!==d.body;n=n.parentElement){n.style.transform='none';n.style.visibility='visible';n.style.opacity='1'}
      c.style.boxShadow='none';
      c.querySelectorAll('figure img').forEach(im=>{          // object-fit:contain -> background-size:contain
        if(d.defaultView.getComputedStyle(im).objectFit!=='contain')return;
        const b=d.createElement('div');b.style.cssText=`width:100%;height:100%;background:url("${im.src}") center/contain no-repeat`;im.replaceWith(b)});
    }
  }).then(cv=>{
    cache.set(k,cv);
    while(cache.size>MAX){const o=cache.keys().next().value;onDrop(cache.get(o));cache.delete(o)}
    return cv;
  }).catch(()=>null).finally(()=>pend.delete(k));
  pend.set(k,p);return p;
}
