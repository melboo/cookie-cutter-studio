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

const vm=require('vm'); const ClipperLib=require(require('path').join(__dirname,'../vendor/clipper.js')); const CL=ClipperLib, SC=1000;
eval(fs.readFileSync(require('path').join(__dirname,'centerline.js'),'utf8'));
function toCl(p){return p.map(q=>({X:Math.round(q[0]*SC),Y:Math.round(q[1]*SC)}));}
function fromCl(p){return p.map(q=>[q.X/SC,q.Y/SC]);}
const NZ=CL.PolyFillType.pftNonZero;
function clip(type,subj,clp){ const c=new CL.Clipper(); const s=subj.filter(p=>p&&p.length>2), k=(clp||[]).filter(p=>p&&p.length>2);
  if(s.length) c.AddPaths(s.map(toCl),CL.PolyType.ptSubject,true); if(k.length) c.AddPaths(k.map(toCl),CL.PolyType.ptClip,true); const out=new CL.Paths(); c.Execute(type,out,NZ,NZ); return out.map(fromCl); }
const union=a=>clip(CL.ClipType.ctUnion,a,null), diff=(a,b)=>clip(CL.ClipType.ctDifference,a,b), inter=(a,b)=>clip(CL.ClipType.ctIntersection,a,b);
function offset(paths,d,arc=0.03){ const co=new CL.ClipperOffset(2,arc*SC); co.AddPaths(paths.filter(p=>p.length>2).map(toCl),CL.JoinType.jtRound,CL.EndType.etClosedPolygon); const out=new CL.Paths(); co.Execute(out,d*SC); return out.map(fromCl); }
function strokeLines(lines,w,arc=0.03){ const co=new CL.ClipperOffset(2,arc*SC); let n=0;
  for(const l of lines){ if(!l.p||l.p.length<2) continue; co.AddPath(toCl(l.p),CL.JoinType.jtRound,(l.c&&l.p.length>2)?CL.EndType.etClosedLine:CL.EndType.etOpenRound); n++; }
  if(!n) return []; const out=new CL.Paths(); co.Execute(out,w/2*SC); return out.map(fromCl); }
const circ=(cx,cy,r)=>{ const C=[]; const m=Math.max(48,Math.round(r*20)); for(let i=0;i<m;i++){ const a=2*Math.PI*i/m; C.push([cx+r*Math.cos(a),cy+r*Math.sin(a)]); } return C; };
const pd=ps=>ps.map(P=>'M'+P.map(p=>p[0].toFixed(3)+' '+p[1].toFixed(3)).join('L')+'Z').join('');

function run(name){
  const {W,H,ink,edge}=load(`${SRC}/${name}.png`);
  for(const c of components(ink,W,H)) if(c.length<25) for(const i of c) ink[i]=0;
  let x0=W,x1=0,y0=H,y1=0; for(let i=0;i<W*H;i++) if(ink[i]){const x=i%W,y=(i/W)|0; if(x<x0)x0=x; if(x>x1)x1=x; if(y<y0)y0=y; if(y>y1)y1=y;}
  const ppm=Math.max(x1-x0,y1-y0)/80; const notes=[];
  let touchesEdge=false; for(let k=0;k<W*H;k++) if(edge[k]){ touchesEdge=true; break; } if(touchesEdge) notes.push('runs off the picture');
  const silOf=r=>{ const sealed=close(ink,W,H,Math.round(r)); const white=new Uint8Array(W*H); for(let i=0;i<W*H;i++) white[i]=sealed[i]?0:1;
    const outside=flood(white,W,H); const m=new Uint8Array(W*H); let a=0; for(let i=0;i<W*H;i++){ m[i]=outside[i]?0:1; a+=m[i]; } return {m,a}; };
  const ref=silOf(ppm*4); let pick=null; for(const mm of [1,1.5,2,2.5,3,3.5]){ const s=silOf(ppm*mm); if(s.a>=0.9*ref.a){ pick=s; break; } } if(!pick){ pick=ref; notes.push('outline not closed'); }
  let sil=pick.m; { const cs=components(sil,W,H); cs.sort((a,b)=>b.length-a.length); sil=new Uint8Array(W*H); if(cs[0]) for(const i of cs[0]) sil[i]=1; }
  { const r=0.8*ppm, dI=dist(sil,W,H), core=new Uint8Array(W*H); for(let i=0;i<W*H;i++) core[i]=dI[i]>r?0:1; const dc=dist(core,W,H);
    for(let i=0;i<W*H;i++) if(sil[i]&&dc[i]>r+0.5) sil[i]=0;
    const cs=components(sil,W,H); cs.sort((a,b)=>b.length-a.length); const keep=new Uint8Array(W*H); if(cs[0]) for(const i of cs[0]) keep[i]=1; sil=keep; }
  let outside=0,tot=0; for(let i=0;i<W*H;i++) if(ink[i]){ tot++; if(!sil[i]) outside++; } if(outside>0.03*tot) notes.push('open outline '+(100*outside/tot).toFixed(0)+'%');
  // thin parts: narrower than two wall bands plus room for dough
  { const r=2.15*ppm, dI=dist(sil,W,H), core=new Uint8Array(W*H); for(let i=0;i<W*H;i++) core[i]=dI[i]>r?0:1; const dc=dist(core,W,H);
    const lost=new Uint8Array(W*H); for(let i=0;i<W*H;i++) lost[i]=(sil[i]&&dc[i]>r+1)?1:0; let worst=0; for(const c of components(lost,W,H)) worst=Math.max(worst,c.length);
    if(worst>2*r*r) notes.push('thin part ('+(worst/ppm/ppm).toFixed(0)+' mm2)'); }
  // lines a bit thicker if very thin, so the centre line is unbroken
  const di=dist(ink,W,H); const hw=[]; for(let i=0;i<W*H;i++) if(ink[i]) hw.push(di[i]); hw.sort((a,b)=>a-b); const half=hw[Math.floor(hw.length*0.9)]||1;
  let fat=ink; const want=0.4*ppm; if(half<want){ const inv=new Uint8Array(W*H); for(let i=0;i<W*H;i++) inv[i]=ink[i]?0:1; const dn=dist(inv,W,H); fat=new Uint8Array(W*H); for(let i=0;i<W*H;i++) fat[i]=(ink[i]||dn[i]<=want-half)?1:0; }
  const all=new Uint8Array(W*H); for(let i=0;i<W*H;i++) all[i]=(fat[i]&&sil[i])?1:0;
  const silP=tracePolys(sil,W,H,40).sort((a,b)=>b.length-a.length)[0]; const O=clSmooth(silP,ppm,true,1.2).p;
  const res=clRidges(all,W,H,ppm,dist(sil,W,H),dist(all,W,H),{outline:O});
  const mm=P=>P.map(p=>[p[0]/ppm,p[1]/ppm]); const Omm=mm(O);
  { let L=0; for(const l of res.lines) L+=clLen(l.p)/ppm; const A=Math.abs(Omm.reduce((a,p,i)=>{ const q=Omm[(i+1)%Omm.length]; return a+p[0]*q[1]-q[0]*p[1]; },0))/2; const dens=L/A; notes.push('density '+dens.toFixed(3)+' mm/mm2'+(dens>0.30?' -> BUSY':'')); }
  let ridges=strokeLines(res.lines.map(l=>({p:mm(l.p),c:l.c})),0.9);
  for(const d of res.dots){ const cx=d.cx/ppm, cy=d.cy/ppm, r=d.r/ppm; ridges=ridges.concat(d.ring? strokeLines([{p:circ(cx,cy,r-0.45),c:true}],0.9) : [circ(cx,cy,r)]); }
  const band=diff([Omm],offset([Omm],-1.4));
  const plastic=inter(union(ridges.concat(band)),[Omm]);
  let bx0=1e9,by0=1e9,bx1=-1e9,by1=-1e9; for(const p of Omm){ bx0=Math.min(bx0,p[0]); by0=Math.min(by0,p[1]); bx1=Math.max(bx1,p[0]); by1=Math.max(by1,p[1]); }
  const pad=2, vb=`${(bx0-pad).toFixed(2)} ${(by0-pad).toFixed(2)} ${(bx1-bx0+2*pad).toFixed(2)} ${(by1-by0+2*pad).toFixed(2)}`;
  console.error(name+': '+res.lines.length+' lines, '+res.dots.length+' dots'+(notes.length?' | '+notes.join(', '):''));
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb}" width="420" height="420"><path d="${pd([Omm])}" fill="#f4ecdc"/><path d="${pd(plastic)}" fill="#3c281e" fill-rule="nonzero"/></svg>`;
}
const names=process.argv.slice(2); for(const n of names){ const t=Date.now(); const sv=run(n); fs.writeFileSync(`${OUT}/${n}_cutter.svg`,sv); console.error('  '+(Date.now()-t)+' ms'); } console.log('ok');
