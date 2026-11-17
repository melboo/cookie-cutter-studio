// Prototype: Gemini line art -> clean vector cutter design (smooth curves, sharp corners kept, no reshaping)
const SRC=process.env.SRC||'/tmp/vt', OUT=process.env.OUT||'/tmp/vtn'; const fs=require('fs'), {PNG}=require('pngjs'), IT=require('imagetracerjs');
const PAD=24;
function load(f){ const p=PNG.sync.read(fs.readFileSync(f)); const w=p.width,h=p.height, W=w+2*PAD, H=h+2*PAD, ink=new Uint8Array(W*H), edge=new Uint8Array(W*H);
  for(let y=0;y<h;y++) for(let x=0;x<w;x++){ const i=(y*w+x)*4; ink[(y+PAD)*W+x+PAD]=(p.data[i]+p.data[i+1]+p.data[i+2])/3<128?1:0; }
  // where the drawing runs off the picture, close it along the picture's edge
  for(let x=0;x<w;x++) for(const y of [0,h-1]) if(ink[(y+PAD)*W+x+PAD]) edge[(y+PAD)*W+x+PAD]=1;
  for(let y=0;y<h;y++) for(const x of [0,w-1]) if(ink[(y+PAD)*W+x+PAD]) edge[(y+PAD)*W+x+PAD]=1;
  return {W,H,ink,edge}; }
function dist(mask,W,H){ // exact-ish chamfer distance to nearest 0
  const INF=1e9,d=new Float32Array(W*H); for(let i=0;i<W*H;i++) d[i]=mask[i]?INF:0;
  const a=1,b=1.4142;
  for(let y=0;y<H;y++)for(let x=0;x<W;x++){const i=y*W+x; if(!d[i])continue; let v=d[i];
    if(x>0)v=Math.min(v,d[i-1]+a); if(y>0){v=Math.min(v,d[i-W]+a); if(x>0)v=Math.min(v,d[i-W-1]+b); if(x<W-1)v=Math.min(v,d[i-W+1]+b);} d[i]=v;}
  for(let y=H-1;y>=0;y--)for(let x=W-1;x>=0;x--){const i=y*W+x; if(!d[i])continue; let v=d[i];
    if(x<W-1)v=Math.min(v,d[i+1]+a); if(y<H-1){v=Math.min(v,d[i+W]+a); if(x<W-1)v=Math.min(v,d[i+W+1]+b); if(x>0)v=Math.min(v,d[i+W-1]+b);} d[i]=v;}
  return d; }
function flood(free,W,H){ // outside region reachable from the border
  const out=new Uint8Array(W*H), st=[]; for(let x=0;x<W;x++){st.push(x,(H-1)*W+x);} for(let y=0;y<H;y++){st.push(y*W,y*W+W-1);}
  while(st.length){const i=st.pop(); if(out[i]||!free[i])continue; out[i]=1; const x=i%W; if(x>0)st.push(i-1); if(x<W-1)st.push(i+1); if(i>=W)st.push(i-W); if(i<W*(H-1))st.push(i+W);} return out; }
function trace(mask,W,H,opts){ // vectorise a mask with ImageTracer: returns svg path d strings of the "on" colour
  const data=new Uint8ClampedArray(W*H*4); for(let i=0;i<W*H;i++){const v=mask[i]?0:255; data[i*4]=data[i*4+1]=data[i*4+2]=v; data[i*4+3]=255;}
  const svg=IT.imagedataToSVG({width:W,height:H,data},Object.assign({ltres:0.5,qtres:0.5,pathomit:12,rightangleenhance:false,colorsampling:0,numberofcolors:2,pal:[{r:0,g:0,b:0,a:255},{r:255,g:255,b:255,a:255}],strokewidth:0,linefilter:true,roundcoords:2,viewbox:true,blurradius:0},opts||{}));
  const ds=[]; const re=/<path[^>]*fill="rgb\(0,0,0\)"[^>]*d="([^"]+)"/g, re2=/<path[^>]*d="([^"]+)"[^>]*fill="rgb\(0,0,0\)"/g; let m;
  while((m=re.exec(svg)))ds.push(m[1]); if(!ds.length) while((m=re2.exec(svg)))ds.push(m[1]); return ds; }
function tracePolys(mask,W,H,omit){ const data=new Uint8ClampedArray(W*H*4); for(let i=0;i<W*H;i++){const v=mask[i]?0:255; data[i*4]=data[i*4+1]=data[i*4+2]=v; data[i*4+3]=255;}
  const td=IT.imagedataToTracedata({width:W,height:H,data},{ltres:0.5,qtres:0.5,pathomit:omit,rightangleenhance:false,colorsampling:0,numberofcolors:2,pal:[{r:0,g:0,b:0,a:255},{r:255,g:255,b:255,a:255}],blurradius:0,linefilter:true});
  const k=td.palette.findIndex(p=>p.r<128); const layer=td.layers[k<0?0:k]||[]; const polys=[];
  for(const path of layer){ const pts=[]; for(const s of path.segments){ if(s.type==="L") pts.push([s.x1,s.y1]); else for(let u=0;u<1;u+=0.2){ const a=(1-u)*(1-u),b=2*(1-u)*u,c=u*u; pts.push([a*s.x1+b*s.x2+c*s.x3, a*s.y1+b*s.y2+c*s.y3]); } } if(pts.length>=3) polys.push(pts); }
  return polys; }
// remove pixel stair-steps, keep real corners nearly sharp: simplify (0.7 px), split long edges, then 3 rounds of corner cutting
function smoothPoly(pts,ppm){ const dp=(P,e)=>{ if(P.length<3) return P; const keep=new Uint8Array(P.length); keep[0]=keep[P.length-1]=1; const st=[[0,P.length-1]];
    while(st.length){ const [a,b]=st.pop(); let m=-1,md=e; const [ax,ay]=P[a],[bx,by]=P[b], L=Math.hypot(bx-ax,by-ay)||1e-9;
      for(let i=a+1;i<b;i++){ const d=Math.abs((bx-ax)*(ay-P[i][1])-(ax-P[i][0])*(by-ay))/L; if(d>md){md=d;m=i;} } if(m>0){ keep[m]=1; st.push([a,m],[m,b]); } }
    return P.filter((_,i)=>keep[i]); };
  // closed: split at the point farthest from the first so dp has two anchors
  let far=0,fd=0; for(let i=1;i<pts.length;i++){ const d=Math.hypot(pts[i][0]-pts[0][0],pts[i][1]-pts[0][1]); if(d>fd){fd=d;far=i;} }
  const A=dp(pts.slice(0,far+1),1.0), B=dp(pts.slice(far).concat([pts[0]]),1.0); let P=A.slice(0,-1).concat(B.slice(0,-1));
  if(P.length<3) return pts;
  // corner cutting on the simplified outline; vertices that turn more than ~55 degrees are real corners and stay sharp
  let sharp=P.map((p,i)=>{ const a=P[(i-1+P.length)%P.length], c=P[(i+1)%P.length]; const u=[p[0]-a[0],p[1]-a[1]], v=[c[0]-p[0],c[1]-p[1]];
    const cos=(u[0]*v[0]+u[1]*v[1])/((Math.hypot(...u)*Math.hypot(...v))||1); return cos<0.57; });
  for(let it=0;it<4;it++){ const R=[], S=[]; for(let i=0;i<P.length;i++){ const a=P[i], b=P[(i+1)%P.length];
      if(sharp[i]){ R.push(a); S.push(true); } else { R.push([0.75*a[0]+0.25*b[0],0.75*a[1]+0.25*b[1]]); S.push(false); }
      if(!sharp[(i+1)%P.length]){ R.push([0.25*a[0]+0.75*b[0],0.25*a[1]+0.75*b[1]]); S.push(false); } }
    P=R; sharp=S; }
  return P; }
function polyD(P){ return 'M'+P.map(p=>p[0].toFixed(2)+' '+p[1].toFixed(2)).join('L')+'Z'; }
function close(mask,W,H,r){ // morphological closing by radius r (px)
  const inv=new Uint8Array(W*H); for(let i=0;i<W*H;i++) inv[i]=mask[i]?0:1; const d1=dist(inv,W,H);
  const grown=new Uint8Array(W*H); for(let i=0;i<W*H;i++) grown[i]=(mask[i]||d1[i]<=r)?1:0;
  const d2=dist(grown,W,H); const out=new Uint8Array(W*H); for(let i=0;i<W*H;i++) out[i]=(grown[i]&&d2[i]>r)?1:0; for(let i=0;i<W*H;i++) if(mask[i]) out[i]=1; return out; }
function components(mask,W,H){ const lab=new Int32Array(W*H), comps=[]; let n=0;
  for(let s=0;s<W*H;s++){ if(!mask[s]||lab[s]) continue; n++; const st=[s], px=[]; lab[s]=n;
    while(st.length){ const i=st.pop(); px.push(i); const x=i%W; for(const j of [x>0?i-1:-1,x<W-1?i+1:-1,i-W,i+W]) if(j>=0&&j<W*H&&mask[j]&&!lab[j]){lab[j]=n;st.push(j);} } comps.push(px); }
  return comps; }
function run(name){
  const {W,H,ink,edge}=load(`${SRC}/${name}.png`);
  // drop specks first
  for(const c of components(ink,W,H)) if(c.length<25) for(const i of c) ink[i]=0;
  // rough scale from the ink extent
  let x0=W,x1=0,y0=H,y1=0; for(let i=0;i<W*H;i++) if(ink[i]){const x=i%W,y=(i/W)|0; if(x<x0)x0=x; if(x>x1)x1=x; if(y<y0)y0=y; if(y>y1)y1=y;}
  let ppm=Math.max(x1-x0,y1-y0)/80;
  // silhouette: the outermost closed outline. Small gaps in it (up to ~2 mm) are closed first, so it cannot leak.
  // lines cut off at the picture's edge are closed along that edge (for finding the cookie only)
  const ink2=ink.slice(); { const lab=components(edge,W,H); for(const c of lab) if(c.length>=2){ let a=c[0],b=c[0]; for(const i of c){ if(i<a)a=i; if(i>b)b=i; } } }
  let touchesEdge=false; for(let k=0;k<W*H;k++) if(edge[k]){ touchesEdge=true; break; }
  if(touchesEdge) console.error(name+': drawing runs off the picture -> needs a redraw');
  const silOf=r=>{ const sealed=close(ink2,W,H,Math.round(r)); const white=new Uint8Array(W*H); for(let i=0;i<W*H;i++) white[i]=sealed[i]?0:1;
    const outside=flood(white,W,H); const m=new Uint8Array(W*H); let a=0; for(let i=0;i<W*H;i++){ m[i]=outside[i]?0:1; a+=m[i]; } return {m,a}; };
  // smallest gap-closing (1 to 3.5 mm) whose cookie covers at least 90% of what the outermost lines enclose
  const ref=silOf(ppm*4); let pick=null;
  for(const mm of [1,1.5,2,2.5,3,3.5]){ const s=silOf(ppm*mm); if(s.a>=0.9*ref.a){ pick=s; break; } }
  if(!pick){ pick=ref; console.error(name+': outline not closed, cookie may be wrong'); }
  let sil=pick.m;
  // keep only the biggest piece (one cookie)
  { const cs=components(sil,W,H); cs.sort((a,b)=>b.length-a.length); sil=new Uint8Array(W*H); if(cs[0]) for(const i of cs[0]) sil[i]=1; }
  // line weight: thin lines are brought up to ~1.1 mm, evenly
  const di=dist(ink,W,H); const hw=[]; for(let i=0;i<W*H;i++) if(ink[i]) hw.push(di[i]); hw.sort((a,b)=>a-b); const half=hw[Math.floor(hw.length*0.9)]||1;
  const want=0.55*ppm; let fat=ink; if(half<want){ const inv=new Uint8Array(W*H); for(let i=0;i<W*H;i++) inv[i]=ink[i]?0:1; const dn=dist(inv,W,H); fat=new Uint8Array(W*H); for(let i=0;i<W*H;i++) fat[i]=(ink[i]||dn[i]<=want-half)?1:0; }
  // ALL ink inside the cookie, outline stroke included, as ONE shape: every join stays exactly as drawn
  let all=new Uint8Array(W*H); for(let i=0;i<W*H;i++) all[i]=(fat[i]&&sil[i])?1:0;
  // one even ridge width (~0.9 mm): thick lines are thinned evenly from both sides (joins keep their shape)
  { const ht=0.45*ppm; const d=dist(all,W,H); const hw2=[]; for(let i=0;i<W*H;i++) if(all[i]) hw2.push(d[i]); hw2.sort((a,b)=>a-b);
    const h=hw2[Math.floor(hw2.length*0.85)]||ht; const e=h-ht;
    if(e>0.5){ for(let i=0;i<W*H;i++) all[i]=(all[i]&&d[i]>e)?1:0; }
    // solid round dots (pupils, seeds) become true-circle rings with an opening of at least 2.5 mm; other thick spots are left as drawn
    const d2=dist(all,W,H); const core=new Uint8Array(W*H);
    // only separate dots: an ink piece that is small and touches nothing else
    for(const comp of components(all,W,H)){ let x0=W,x1=0,y0=H,y1=0; for(const i of comp){const x=i%W,y=(i/W)|0; if(x<x0)x0=x; if(x>x1)x1=x; if(y<y0)y0=y; if(y>y1)y1=y;}
      if(Math.max(x1-x0,y1-y0)<=12*ppm) for(const i of comp) if(d2[i]>ht*2.2) core[i]=1; }
    for(const c of components(core,W,H)){
      let cx=0,cy=0; for(const i of c){cx+=i%W; cy+=(i/W)|0;} cx/=c.length; cy/=c.length;
      let rmax=0; for(const i of c){ rmax=Math.max(rmax, Math.hypot(i%W-cx,((i/W)|0)-cy)); }
      const areaR=Math.sqrt(c.length/Math.PI); if(rmax>areaR*1.6) continue;      // elongated (brow on an eye, thick join): leave it
      // the whole dot: ink pixels around this core
      const dotR=rmax+ht*2.2;
      // nearest other ink from the dot's centre
      let near=1e9; const look=Math.ceil(dotR+6*ppm); for(let y=Math.max(0,Math.floor(cy-look));y<=Math.min(H-1,cy+look);y++) for(let x=Math.max(0,Math.floor(cx-look));x<=Math.min(W-1,cx+look);x++){ const q=Math.hypot(x-cx,y-cy); if(q>dotR+1 && all[y*W+x] && q<near) near=q; }
      let R=Math.min(Math.max(dotR, 2.25*ppm), near-2.5*ppm), r=R-ht*2;
      if(r<1.25*ppm){ R=ppm*1.0; r=-1; }   // no room for a ring: a small solid dot (~2 mm) instead
      for(let y=Math.floor(cy-R-2);y<=cy+R+2;y++) for(let x=Math.floor(cx-R-2);x<=cx+R+2;x++){ if(x<0||y<0||x>=W||y>=H) continue; const i=y*W+x; const q=Math.hypot(x-cx,y-cy);
        if(q<=dotR+1) all[i]=0; } 
      for(let y=Math.floor(cy-R-2);y<=cy+R+2;y++) for(let x=Math.floor(cx-R-2);x<=cx+R+2;x++){ if(x<0||y<0||x>=W||y>=H) continue; const q=Math.hypot(x-cx,y-cy); if(q>=r && q<=R && sil[y*W+x]) all[y*W+x]=1; } } }
  // the cut edge: bridge pixels that closed a gap in the outline belong to the cutting line too
  { const tt=Math.max(half,want)*2; const wh=new Uint8Array(W*H); for(let i=0;i<W*H;i++) wh[i]=fat[i]?0:1; const outRaw=flood(wh,W,H);
    const leak=new Uint8Array(W*H); let nl=0; for(let i=0;i<W*H;i++) if(outRaw[i]&&sil[i]){ leak[i]=1; nl++; }
    if(nl){ const inv=new Uint8Array(W*H); for(let i=0;i<W*H;i++) inv[i]=leak[i]?0:1; const dl=dist(inv,W,H), dOut=dist(sil,W,H);
      for(let i=0;i<W*H;i++) if(sil[i] && dOut[i]<=tt && dl[i]<=tt*1.5) all[i]=1; } }
  for(const c of components(all,W,H)) if(c.length<(ppm*1.5)**2) for(const i of c) all[i]=0;   // fragments under ~1.5 mm go
  { const holes=new Uint8Array(W*H); for(let i=0;i<W*H;i++) holes[i]=(sil[i]&&!all[i])?1:0; for(const c of components(holes,W,H)) if(c.length<Math.PI*(0.6*ppm)**2) for(const i of c) all[i]=1; }
  let sx0=W,sx1=0,sy0=H,sy1=0; for(let i=0;i<W*H;i++) if(sil[i]){const x=i%W,y=(i/W)|0; if(x<sx0)sx0=x; if(x>sx1)sx1=x; if(y<sy0)sy0=y; if(y>sy1)sy1=y;}
  const silPs=tracePolys(sil,W,H,40).sort((a,b)=>b.length-a.length); const silP=smoothPoly(silPs[0],ppm);
  { // the cutting wall: an even 1.4 mm band along the outline. Near the wall, only lines that run in from the inside are kept
    // (they join the band); bulges of the drawn outline (thick corners, lash tips) give way to the even band.
    const dO=dist(sil,W,H), B=1.4*ppm, T=2.8*ppm, zone=[]; for(let i=0;i<W*H;i++) if(sil[i]&&dO[i]<=T&&all[i]) zone.push(i);
    zone.sort((a,b)=>dO[b]-dO[a]); const keep=new Uint8Array(W*H); for(let i=0;i<W*H;i++) if(all[i]&&dO[i]>T) keep[i]=1;
    for(const i of zone){ const x=i%W; for(const j of [i-1,i+1,i-W,i+W,i-W-1,i-W+1,i+W-1,i+W+1]){ if(j<0||j>=W*H||Math.abs(j%W-x)>1) continue; if(keep[j]&&dO[j]>dO[i]){ keep[i]=1; break; } } }
    for(let i=0;i<W*H;i++) all[i]=(keep[i]||(sil[i]&&dO[i]<=B))?1:0; }   // the cutting wall: an even 1.4 mm band along the outline, lines join it
  const inkPs=tracePolys(all,W,H,8).map(p=>smoothPoly(p,ppm));
  let outside=0,tot=0; for(let i=0;i<W*H;i++) if(ink[i]){ tot++; if(!sil[i]) outside++; }
  if(outside>0.03*tot) console.error(name+': '+(100*outside/tot).toFixed(0)+'% of the drawing is outside the cookie (open outline) -> needs a redraw');
  const silD=[polyD(silP)], inkD=inkPs.map(polyD);
  const pad=14+PAD*0, vb=`${sx0-pad} ${sy0-pad} ${sx1-sx0+2*pad} ${sy1-sy0+2*pad}`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb}" width="420" height="420"><path d="${silD.join(' ')}" fill="#f4ecdc"/><path d="${inkD.join(' ')}" fill="#3c281e" fill-rule="evenodd"/></svg>`;
}
const names=process.argv.slice(2); let html='<html><body style="margin:0;display:grid;grid-template-columns:repeat(4,420px);gap:6px;background:#fff">';
for(const n of names){ const sv=run(n); fs.writeFileSync(`${OUT}/${n}_cutter.svg`,sv); html+=`<img src="${SRC}/${n}.png" style="width:420px;height:420px;object-fit:contain;border:1px solid #ddd">`+sv.replace("<svg","<svg style=\"border:1px solid #ddd\""); }
fs.writeFileSync('/tmp/vtn/out.html',html+'</body></html>'); console.log('ok');
