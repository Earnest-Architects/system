// Efek kertas 3D: halaman dilengkungkan di vertex shader (WebGL2 via three.js).
// Lengkung = silinder yang bergulir dari sudut kanan-atas ke tulang (kiri), seperti kertas sungguhan.
import {WebGLRenderer,Scene,PerspectiveCamera,Mesh,PlaneGeometry,ShaderMaterial,DoubleSide,CanvasTexture,LinearFilter} from 'three';

const U={uC:{value:0},uR:{value:40},uA:{value:0},uK:{value:0},uMap:{value:null}};
const PLANE_VS=`varying vec2 vP;void main(){vP=position.xy;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`;
const PAGE_VS=`
uniform float uC,uR,uA;varying vec2 vUv;varying vec3 vN;
const float PI=3.14159265;
void main(){
  vec2 dir=vec2(cos(uA),sin(uA));
  vec3 p=position;
  float u=dot(p.xy,dir),d=max(u-uC,0.);
  float th=min(d/uR,PI);                              // sudut gulungan
  float nu=d>0.?uC+uR*sin(th)-max(d-PI*uR,0.):u;        // posisi setelah digulung
  float z=uR*(1.-cos(th));
  p.xy+=dir*(nu-u);p.z=z;
  vec3 T=vec3(dir*cos(th),sin(th));                   // tangen permukaan
  vN=cross(T,vec3(-dir.y,dir.x,0.));
  vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.);
}`;
const PAGE_FS=`
uniform sampler2D uMap;varying vec2 vUv;varying vec3 vN;
void main(){
  bool fr=gl_FrontFacing;vec3 n=normalize(vN);if(!fr)n=-n;
  vec3 L=normalize(vec3(-.4,.5,.8));
  vec3 tex=texture2D(uMap,vUv).rgb;
  vec3 c=fr?tex:mix(vec3(.93,.93,.91),tex,.07);      // sisi belakang + tembus cetak tipis
  float sh=clamp(.55+.45*max(dot(n,L),0.)/L.z,0.,1.12);
  float hl=max(pow(max(dot(n,normalize(L+vec3(0.,0.,1.))),0.),60.)-.06,0.)*.3;
  gl_FragColor=vec4(c*sh+hl,1.);
}`;
const SHADOW_FS=`
uniform float uC,uR,uA,uK;varying vec2 vP;
void main(){
  float u=dot(vP,vec2(cos(uA),sin(uA)));
  float x=max(u-(uC+uR*.6),0.)/(uR*2.+14.);
  gl_FragColor=vec4(.02,.05,.04,u>uC?.5*uK*exp(-x*x):0.);
}`;

export function createPaper(stage){
  const cv=document.getElementById('gl');
  let r;
  try{r=new WebGLRenderer({canvas:cv,alpha:true,antialias:true,powerPreference:'high-performance'})}catch(e){return null}
  const scene=new Scene(),cam=new PerspectiveCamera(30,1,10,6000);
  const mat=(vs,fs,o)=>new ShaderMaterial({uniforms:U,vertexShader:vs,fragmentShader:fs,...o});
  const page=new Mesh(new PlaneGeometry(1,1),mat(PAGE_VS,PAGE_FS,{side:DoubleSide}));
  const shadow=new Mesh(new PlaneGeometry(1,1),mat(PLANE_VS,SHADOW_FS,{transparent:true,depthWrite:false}));
  scene.add(shadow,page);
  const tex=new WeakMap();let W=0,H=0,R0=40;const A0=.22;

  function resize(){
    const vw=innerWidth,vh=innerHeight,b=stage.getBoundingClientRect();W=b.width;H=b.height;R0=Math.min(W,H)*.1;
    r.setPixelRatio(Math.min(devicePixelRatio||1,2));r.setSize(vw,vh,false);
    cam.aspect=vw/vh;cam.position.z=vh/2/Math.tan(cam.fov*Math.PI/360);cam.updateProjectionMatrix();
    page.geometry.dispose();shadow.geometry.dispose();
    page.geometry=new PlaneGeometry(W,H,Math.ceil(W/6),24).translate(W/2,0,0);
    shadow.geometry=new PlaneGeometry(W,H).translate(W/2,0,0);
    page.position.set(b.left-vw/2,vh/2-b.top-H/2,0);shadow.position.set(page.position.x,page.position.y,-1.5);
  }
  resize();
  return{
    resize,
    setPage(canvas){let t=tex.get(canvas);if(!t){t=new CanvasTexture(canvas);t.minFilter=LinearFilter;t.generateMipmaps=false;t.anisotropy=4;tex.set(canvas,t)}U.uMap.value=t},
    drop(canvas){const t=tex.get(canvas);if(t){t.dispose();tex.delete(canvas)}},
    show(p){                                           // p: 0..1 progres membalik halaman
      const s=Math.sin(p*Math.PI),R=R0*(.45+.55*s);
      U.uA.value=A0*(1-p);U.uR.value=R;U.uK.value=s;
      const c0=W+H*.5*Math.sin(A0)+6;U.uC.value=c0*(1-p)-p*(R+6);
      cv.style.display='block';r.render(scene,cam);
    },
    hide(){cv.style.display='none'}
  };
}
