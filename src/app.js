(function(){
"use strict";
const CL = ClipperLib;
const SC = 1000; // clipper integer scale: 1 unit = 1 micron
const $ = id => document.getElementById(id);
const NS = "http://www.w3.org/2000/svg";

/* =====================================================================
   DESIGN RULES
   Derived from how commercial 3D-printed cutter + embosser sets work:
   - dough is rolled to 5 mm; imprint ridges sit (dough - depth) above the
     cutting edge so they press ~2 mm into the dough
   - the cutting blade is thin at the tip (clean cut) and thicker higher up
     (stiffness), with a flat rim on top to press on
   - detail ridges are uniform lines ~1-1.5 mm wide, at least 2 mm from the
     blade, and are held to the blade by crossbars at the very top, far
     above the dough (too-thick dough is what makes crossbars print)
   - outlines are smooth: no slots narrower than ~4 mm (dough sticks), no
     spikes or necks thinner than ~5 mm (the cookie snaps)
   - small solid dots are fine; large solid areas imprint badly, so they
     become outlines
   ===================================================================== */
const RULES={notch:1.5, neck:2.5, minLine:1.0, edge:2.0, minArea:1.5, bigFill:45, ringW:1.2, barW:2.4, barH:2.4, strapW:3.6, crowd:0.6};
const SIZES=[
  {k:"xs",label:"XS",mm:40,  h:10, lineW:1.0, style:"one"},
  {k:"mini",label:"Mini",mm:55, h:10, lineW:1.1, style:"one"},
  {k:"regular",label:"Regular",mm:80, h:11, lineW:1.3, style:"one"},
  {k:"large",label:"Large",mm:105, h:12, lineW:1.5, style:"one"}];
const DEFAULT_PRINT={style:"one", effect:"groove", h:11, dough:5, depth:2, tip:0.9, base:1.6, rimw:3.5, rimh:2, clear:0.5, plateT:3};

/* ---------------- state ---------------- */
let design = blankDesign();
let sizeKey = "regular";
let hist = [], future = [];
let tool = "select", penTarget = "line";
let sel = null;           // {kind:'outline'} | {kind:'line', i} | {kind:'blob', i}
let selNode = -1;
let view = {cx:0, cy:0, ppm:5};
let srcImage = null, srcURL = null, showImage = false, traceTidied=0;
let mode3d = false;
let cookieView = true;

function blankDesign(){
  return {id:null, name:"Untitled cookie", sizeKey:"regular", outline:[], lines:[], blobs:[], holes:[], sketch:[], lineW:1.3, frame:"figure", print:{...DEFAULT_PRINT}, img:null};
}
const sizeObj = () => SIZES.find(z=>z.k===sizeKey);
const sizeMM = () => { const z=sizeObj(); if(z) return z.mm; if(design.outline.length){const b=bbox([design.outline]); return Math.max(b.w,b.h);} return 80; };

/* ---------------- geometry helpers ---------------- */
function area(p){let a=0;for(let i=0,n=p.length;i<n;i++){const q=p[i],r=p[(i+1)%n];a+=q[0]*r[1]-r[0]*q[1];}return a/2;}
function bbox(polys){let x0=Infinity,y0=Infinity,x1=-Infinity,y1=-Infinity;for(const p of polys)for(const q of p){if(q[0]<x0)x0=q[0];if(q[0]>x1)x1=q[0];if(q[1]<y0)y0=q[1];if(q[1]>y1)y1=q[1];}if(x0===Infinity)return{x0:0,y0:0,x1:0,y1:0,w:0,h:0};return {x0,y0,x1,y1,w:x1-x0,h:y1-y0};}
function plen(p){let L=0;for(let i=1;i<p.length;i++)L+=Math.hypot(p[i][0]-p[i-1][0],p[i][1]-p[i-1][1]);return L;}
function toCl(p){return p.map(q=>({X:Math.round(q[0]*SC),Y:Math.round(q[1]*SC)}));}
function fromCl(p){return p.map(q=>[q.X/SC,q.Y/SC]);}
const EO = CL.PolyFillType.pftEvenOdd, NZ = CL.PolyFillType.pftNonZero;
function clip(type, subj, clp, sf=NZ, cf=NZ){
  const c=new CL.Clipper();
  const s=subj.filter(p=>p&&p.length>2), k=(clp||[]).filter(p=>p&&p.length>2);
  if(s.length) c.AddPaths(s.map(toCl), CL.PolyType.ptSubject, true);
  if(k.length) c.AddPaths(k.map(toCl), CL.PolyType.ptClip, true);
  const out=new CL.Paths(); c.Execute(type, out, sf, cf); return out.map(fromCl);
}
const union = (a, f=NZ) => clip(CL.ClipType.ctUnion, a, null, f, f);
const inter = (a, b, fa=NZ, fb=NZ) => clip(CL.ClipType.ctIntersection, a, b, fa, fb);
const diff = (a, b) => clip(CL.ClipType.ctDifference, a, b);
function offset(paths, d, arc=0.03){
  const ps=paths.filter(p=>p&&p.length>2); if(!ps.length) return [];
  const co=new CL.ClipperOffset(2, arc*SC);
  co.AddPaths(ps.map(toCl), CL.JoinType.jtRound, CL.EndType.etClosedPolygon);
  const out=new CL.Paths(); co.Execute(out, d*SC); return out.map(fromCl);
}
function strokeLines(lines, w, arc=0.03){ // lines: [{p,c}]
  const co=new CL.ClipperOffset(2, arc*SC); let n=0;
  for(const l of lines){ if(!l.p || l.p.length<2) continue;
    if(l.p.length===2 && Math.hypot(l.p[0][0]-l.p[1][0],l.p[0][1]-l.p[1][1])<1e-3){ co.AddPath(toCl([l.p[0],[l.p[0][0]+0.01,l.p[0][1]]]), CL.JoinType.jtRound, CL.EndType.etOpenRound); n++; continue; }
    co.AddPath(toCl(l.p), CL.JoinType.jtRound, (l.c&&l.p.length>2)?CL.EndType.etClosedLine:CL.EndType.etOpenRound); n++; }
  if(!n) return [];
  const out=new CL.Paths(); co.Execute(out, w/2*SC); return out.map(fromCl);
}
function clipOpen(lines, region){ // clip open polylines to closed region; returns [{p,c}]
  if(!lines.length||!region.length) return [];
  const c=new CL.Clipper();
  for(const l of lines){ const p=l.c? l.p.concat([l.p[0]]) : l.p; if(p.length>=2) c.AddPath(toCl(p), CL.PolyType.ptSubject, false); }
  c.AddPaths(region.filter(p=>p.length>2).map(toCl), CL.PolyType.ptClip, true);
  const pt=new CL.PolyTree(); c.Execute(CL.ClipType.ctIntersection, pt, NZ, NZ);
  return CL.Clipper.OpenPathsFromPolyTree(pt).map(fromCl).map(p=>{
    const closed=p.length>3 && Math.hypot(p[0][0]-p[p.length-1][0],p[0][1]-p[p.length-1][1])<1e-3;
    return closed?{p:p.slice(0,-1),c:true}:{p,c:false};
  });
}
const clean = (paths, f=EO) => union(paths, f);
function largest(paths){let best=null,ba=0;for(const p of paths){const a=Math.abs(area(p));if(a>ba){ba=a;best=p;}}return best;}
function exPolys(paths, f=NZ){
  const ps=paths.filter(p=>p&&p.length>2); if(!ps.length) return [];
  const c=new CL.Clipper(); c.AddPaths(ps.map(toCl), CL.PolyType.ptSubject, true);
  const pt=new CL.PolyTree(); c.Execute(CL.ClipType.ctUnion, pt, f, f);
  return CL.JS.PolyTreeToExPolygons(pt).map(e=>({outer:fromCl(e.outer), holes:e.holes.map(fromCl)}));
}
const flatEx=ex=>{const r=[];ex.forEach(e=>r.push(e.outer,...e.holes));return r;};
const exArea=e=>Math.abs(area(e.outer))-e.holes.reduce((a,h)=>a+Math.abs(area(h)),0);
const netArea=ps=>Math.abs(ps.reduce((a,p)=>a+area(p),0));
function dp(pts, eps){
  if(pts.length<3) return pts.slice();
  const keep=new Uint8Array(pts.length); keep[0]=keep[pts.length-1]=1;
  const st=[[0,pts.length-1]];
  while(st.length){
    const [a,b]=st.pop(); const A=pts[a],B=pts[b]; const dx=B[0]-A[0],dy=B[1]-A[1]; const L=Math.hypot(dx,dy);
    let md=-1,mi=-1;
    for(let i=a+1;i<b;i++){const d= L<1e-9? Math.hypot(pts[i][0]-A[0],pts[i][1]-A[1]) : Math.abs(dy*(pts[i][0]-A[0])-dx*(pts[i][1]-A[1]))/L; if(d>md){md=d;mi=i;}}
    if(md>eps){keep[mi]=1; st.push([a,mi],[mi,b]);}
  }
  return pts.filter((_,i)=>keep[i]);
}
function dpClosed(p, eps){
  if(p.length<5) return p.slice();
  let far=0,fd=-1; for(let i=1;i<p.length;i++){const d=(p[i][0]-p[0][0])**2+(p[i][1]-p[0][1])**2; if(d>fd){fd=d;far=i;}}
  const a=dp(p.slice(0,far+1),eps), b=dp(p.slice(far).concat([p[0]]),eps);
  const r=a.concat(b.slice(1,-1)); return r.length>=3?r:p.slice();
}
function smoothClosed(p, k, iters=2){
  if(k<=0||p.length<6) return p;
  let q=p;
  for(let it=0;it<iters;it++){const n=q.length, r=new Array(n);
    for(let i=0;i<n;i++){let sx=0,sy=0;for(let j=-k;j<=k;j++){const t=q[(i+j+n)%n];sx+=t[0];sy+=t[1];}r[i]=[sx/(2*k+1),sy/(2*k+1)];}
    q=r;}
  return q;
}
function smoothOpen(p, k, iters=2){
  if(k<=0||p.length<4) return p;
  let q=p;
  for(let it=0;it<iters;it++){const n=q.length, r=q.map(v=>v.slice());
    for(let i=1;i<n-1;i++){const kk=Math.min(k,i,n-1-i);let sx=0,sy=0;for(let j=-kk;j<=kk;j++){sx+=q[i+j][0];sy+=q[i+j][1];}r[i]=[sx/(2*kk+1),sy/(2*kk+1)];}
    q=r;}
  return q;
}
function chaikin(p, closed){const n=p.length,r=[];const m=closed?n:n-1;if(!closed)r.push(p[0]);for(let i=0;i<m;i++){const a=p[i],b=p[(i+1)%n];r.push([.75*a[0]+.25*b[0],.75*a[1]+.25*b[1]],[.25*a[0]+.75*b[0],.25*a[1]+.75*b[1]]);}if(!closed)r.push(p[n-1]);return r;}
function pointInPoly(pt,p){let c=false;for(let i=0,j=p.length-1;i<p.length;j=i++){const a=p[i],b=p[j];if(((a[1]>pt[1])!==(b[1]>pt[1]))&&(pt[0]<(b[0]-a[0])*(pt[1]-a[1])/(b[1]-a[1])+a[0]))c=!c;}return c;}
function segDist(px,py,ax,ay,bx,by){const dx=bx-ax,dy=by-ay;const L=dx*dx+dy*dy;let t=L?((px-ax)*dx+(py-ay)*dy)/L:0;t=Math.max(0,Math.min(1,t));const qx=ax+t*dx,qy=ay+t*dy;return [Math.hypot(px-qx,py-qy),qx,qy];}
const r2 = v => Math.round(v*100)/100;

/* =====================================================================
   IMAGE TRACING
   1. find the background (transparency, or the colour around the border)
   2. silhouette = everything not connected to the background, gaps closed
   3. detail lines: dark strokes (adaptive threshold) or colour edges
   4. thick blobs: small ones stay as dots, big ones become outlines
   5. thin strokes are skeletonised into centre lines, then re-drawn at one
      uniform, printable width (this is what makes imprints look clean)
   ===================================================================== */
function getTraceOpts(){
  return {bgTol:+$("bgTol").value, sens:+$("sens").value, src:$("detSrc").value, smooth:+$("smooth").value, spk:+$("spk").value, minLine:+$("detLevel").value, forceInk:forceInkTrace};
}
function integral(a,W,H){const I=new Float64Array((W+1)*(H+1));for(let y=0;y<H;y++){let s=0;for(let x=0;x<W;x++){s+=a[y*W+x];I[(y+1)*(W+1)+x+1]=I[y*(W+1)+x+1]+s;}}return I;}
function boxFilter(mask, W, H, r, mode){
  if(r<=0) return mask.slice();
  const I=integral(mask,W,H); const out=new Uint8Array(W*H);
  for(let y=0;y<H;y++){const y0=Math.max(0,y-r),y1=Math.min(H,y+r+1);
    for(let x=0;x<W;x++){const x0=Math.max(0,x-r),x1=Math.min(W,x+r+1);
      const s=I[y1*(W+1)+x1]-I[y0*(W+1)+x1]-I[y1*(W+1)+x0]+I[y0*(W+1)+x0];
      out[y*W+x]= mode==="dil" ? (s>0?1:0) : (s>=(x1-x0)*(y1-y0)-0.5?1:0);}}
  return out;
}
function floodExterior(passable, W, H){ // pixels reachable from the border through passable
  const ext=new Uint8Array(W*H); const st=[];
  const push=i=>{ if(!ext[i]&&passable[i]){ext[i]=1;st.push(i);} };
  for(let x=0;x<W;x++){push(x);push((H-1)*W+x);} for(let y=0;y<H;y++){push(y*W);push(y*W+W-1);}
  while(st.length){const i=st.pop(); const x=i%W;
    if(x>0)push(i-1); if(x<W-1)push(i+1); if(i>=W)push(i-W); if(i<W*(H-1))push(i+W);}
  return ext;
}
function components(mask, W, H, conn8){
  const lab=new Int32Array(W*H).fill(-1); const comps=[]; const st=[];
  for(let i=0;i<W*H;i++){ if(!mask[i]||lab[i]>=0) continue;
    const id=comps.length; const px=[]; lab[i]=id; st.push(i);
    while(st.length){const j=st.pop(); px.push(j); const x=j%W,y=(j/W)|0;
      for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){ if(!dx&&!dy) continue; if(!conn8&&dx&&dy) continue;
        const nx=x+dx,ny=y+dy; if(nx<0||ny<0||nx>=W||ny>=H) continue; const k=ny*W+nx; if(mask[k]&&lab[k]<0){lab[k]=id;st.push(k);} } }
    comps.push(px); }
  return {lab, comps};
}
function distTransform(mask, W, H){ // chamfer 3-4, result in px
  const INF=1e9, d=new Float32Array(W*H);
  for(let i=0;i<W*H;i++) d[i]=mask[i]?INF:0;
  for(let y=0;y<H;y++)for(let x=0;x<W;x++){const i=y*W+x; if(!d[i]) continue; let v=d[i];
    if(x>0)v=Math.min(v,d[i-1]+3); if(y>0){v=Math.min(v,d[i-W]+3); if(x>0)v=Math.min(v,d[i-W-1]+4); if(x<W-1)v=Math.min(v,d[i-W+1]+4);} d[i]=v;}
  for(let y=H-1;y>=0;y--)for(let x=W-1;x>=0;x--){const i=y*W+x; if(!d[i]) continue; let v=d[i];
    if(x<W-1)v=Math.min(v,d[i+1]+3); if(y<H-1){v=Math.min(v,d[i+W]+3); if(x<W-1)v=Math.min(v,d[i+W+1]+4); if(x>0)v=Math.min(v,d[i+W-1]+4);} d[i]=v;}
  for(let i=0;i<W*H;i++) d[i]/=3;
  return d;
}
function thin(mask, W, H){ // Zhang-Suen
  const m=mask.slice(); let list=[];
  for(let y=1;y<H-1;y++)for(let x=1;x<W-1;x++){const i=y*W+x; if(m[i]) list.push(i);}
  for(let y=0;y<H;y++){m[y*W]=0;m[y*W+W-1]=0;} for(let x=0;x<W;x++){m[x]=0;m[(H-1)*W+x]=0;}
  let changed=true, guard=0;
  while(changed && guard++<400){ changed=false;
    for(let pass=0;pass<2;pass++){ const del=[];
      for(const i of list){ if(!m[i]) continue;
        const p2=m[i-W],p3=m[i-W+1],p4=m[i+1],p5=m[i+W+1],p6=m[i+W],p7=m[i+W-1],p8=m[i-1],p9=m[i-W-1];
        const B=p2+p3+p4+p5+p6+p7+p8+p9; if(B<2||B>6) continue;
        const A=(!p2&&p3)+(!p3&&p4)+(!p4&&p5)+(!p5&&p6)+(!p6&&p7)+(!p7&&p8)+(!p8&&p9)+(!p9&&p2); if(A!==1) continue;
        if(pass===0){ if(p2&&p4&&p6) continue; if(p4&&p6&&p8) continue; } else { if(p2&&p4&&p8) continue; if(p2&&p6&&p8) continue; }
        del.push(i); }
      for(const i of del) m[i]=0; if(del.length) changed=true; }
    list=list.filter(i=>m[i]);
  }
  // remove staircase corners so every line is a clean one-pixel chain (Yokoi 8-connectivity)
  for(let pass=0;pass<2;pass++){
    for(let y=1;y<H-1;y++)for(let x=1;x<W-1;x++){ const i=y*W+x; if(!m[i]) continue;
      const E=m[i+1],NE=m[i-W+1],Nn=m[i-W],NW=m[i-W-1],Ww=m[i-1],SW=m[i+W-1],S=m[i+W],SE=m[i+W+1];
      if(!((Nn&&E)||(E&&S)||(S&&Ww)||(Ww&&Nn))) continue;
      const xb=[0,1-E,1-NE,1-Nn,1-NW,1-Ww,1-SW,1-S,1-SE,1-E,1-NE];
      let nc=0; for(const k of [1,3,5,7]) nc+=xb[k]-xb[k]*xb[k+1]*xb[k+2];
      const B=E+NE+Nn+NW+Ww+SW+S+SE;
      if(nc===1 && B>=2) m[i]=0; } }
  return m;
}
function skeletonPaths(sk, W, H){
  const N=[-W-1,-W,-W+1,-1,1,W-1,W,W+1];
  const deg=i=>{let c=0;for(const o of N) if(sk[i+o]) c++; return c;};
  const D=new Uint8Array(W*H); const pix=[];
  for(let i=0;i<W*H;i++) if(sk[i]){ D[i]=deg(i); pix.push(i); }
  const used=new Set(); const key=(a,b)=>a<b?a*W*H+b:b*W*H+a;
  const paths=[];
  const walk=(start,next)=>{
    const path=[start,next]; used.add(key(start,next)); let prev=start, cur=next;
    while(D[cur]===2){ let nx=-1;
      for(const o of [-W,-1,1,W,-W-1,-W+1,W-1,W+1]){ const j=cur+o; if(sk[j] && j!==prev && !used.has(key(cur,j))){ nx=j; break; } }
      if(nx<0) break; used.add(key(cur,nx)); path.push(nx); prev=cur; cur=nx; }
    return path;
  };
  for(const i of pix){ if(D[i]===2) continue; for(const o of N){ const j=i+o; if(sk[j] && !used.has(key(i,j))) paths.push({px:walk(i,j)}); } }
  for(const i of pix){ if(D[i]!==2) continue; for(const o of N){ const j=i+o; if(sk[j] && !used.has(key(i,j))){ const p=walk(i,j); paths.push({px:p, cyc:p[p.length-1]===i||true}); } } }
  return paths.map(o=>{const pts=o.px.map(i=>[i%W+0.5,((i/W)|0)+0.5]); const a=o.px[0], b=o.px[o.px.length-1];
    return {pts, ia:a, ib:b, endA:D[a], endB:D[b], cyc: D[a]===2 && pts.length>4};});
}
// Join skeleton pieces that continue straight through a junction, so strokes read as long,
// flowing lines instead of many short dashes meeting at knots.
function mergeThroughJunctions(paths, sk, W, H, deg){
  const N8=[-W-1,-W,-W+1,-1,1,W-1,W,W+1];
  const D=i=>{let c=0;for(const o of N8) if(sk[i+o]) c++; return c;};
  const cl=new Map(); let nc=0;
  const junc=i=>D(i)>=3;
  const clusterOf=i=>{ if(cl.has(i)) return cl.get(i); const id=nc++; const st=[i]; cl.set(i,id);
    while(st.length){ const j=st.pop(); for(const o of N8){ const k=j+o; if(sk[k] && !cl.has(k) && junc(k)){ cl.set(k,id); st.push(k);} } } return id; };
  // drop tiny connectors inside one junction knot
  paths=paths.filter(p=>!(p.endA>=3 && p.endB>=3 && p.pts.length<=5 && clusterOf(p.ia)===clusterOf(p.ib)));
  const ends=new Map(); // cluster -> [{pi, end}]
  paths.forEach((p,pi)=>{ if(p.cyc) return;
    if(p.endA>=3){ const c=clusterOf(p.ia); (ends.get(c)||ends.set(c,[]).get(c)).push({pi,end:0}); }
    if(p.endB>=3){ const c=clusterOf(p.ib); (ends.get(c)||ends.set(c,[]).get(c)).push({pi,end:1}); } });
  const dirOf=(p,end)=>{ const q=end===0?p.pts:p.pts.slice().reverse(); const k=Math.min(q.length-1, 8); const dx=q[k][0]-q[0][0], dy=q[k][1]-q[0][1]; const L=Math.hypot(dx,dy)||1; return [dx/L,dy/L]; };
  const link=new Map(); // "pi:end" -> {pi,end}
  for(const [c,list] of ends){ if(list.length<2) continue;
    const pairs=[];
    for(let i=0;i<list.length;i++)for(let j=i+1;j<list.length;j++){ if(list[i].pi===list[j].pi) continue;
      const a=dirOf(paths[list[i].pi],list[i].end), b=dirOf(paths[list[j].pi],list[j].end); pairs.push([a[0]*b[0]+a[1]*b[1], i, j]); }
    pairs.sort((x,y)=>x[0]-y[0]); const used=new Set();
    for(const [dot,i,j] of pairs){ if(dot>-0.72) break; if(used.has(i)||used.has(j)) continue; used.add(i); used.add(j);
      link.set(list[i].pi+":"+list[i].end, list[j]); link.set(list[j].pi+":"+list[j].end, list[i]); } }
  const done=new Set(); const out=[];
  const orient=(p,startEnd)=> startEnd===0? p.pts : p.pts.slice().reverse();
  const walk=(pi, startEnd)=>{ let pts=orient(paths[pi],startEnd).slice(); done.add(pi); let cur=pi, curEnd=1-startEnd; let closed=false;
    const endDeg0 = startEnd===0? paths[pi].endA : paths[pi].endB; let endDeg1;
    while(true){ const nx=link.get(cur+":"+curEnd); endDeg1 = curEnd===0? paths[cur].endA : paths[cur].endB;
      if(!nx) break; if(done.has(nx.pi)){ if(nx.pi===pi) closed=true; break; }
      const q=orient(paths[nx.pi], nx.end); pts=pts.concat(q.slice(1)); done.add(nx.pi); cur=nx.pi; curEnd=1-nx.end; }
    out.push({pts, cyc:closed, endA:endDeg0, endB:endDeg1}); };
  // start from ends that are not linked, then whatever is left (loops)
  paths.forEach((p,pi)=>{ if(done.has(pi)) return; if(p.cyc){ done.add(pi); out.push(p); return; }
    if(!link.has(pi+":0")) walk(pi,0); else if(!link.has(pi+":1")) walk(pi,1); });
  paths.forEach((p,pi)=>{ if(!done.has(pi)) walk(pi,0); });
  return out;
}
function traceLoops(mask, W, H){
  const VW=W+1; const out=new Map();
  const add=(a,b)=>{let l=out.get(a); if(!l){l=[];out.set(a,l);} l.push(b);};
  const at=(x,y)=>x>=0&&y>=0&&x<W&&y<H&&mask[y*W+x];
  for(let y=0;y<H;y++)for(let x=0;x<W;x++){ if(!mask[y*W+x]) continue;
    if(!at(x,y-1)) add(y*VW+x, y*VW+x+1);
    if(!at(x+1,y)) add(y*VW+x+1, (y+1)*VW+x+1);
    if(!at(x,y+1)) add((y+1)*VW+x+1, (y+1)*VW+x);
    if(!at(x-1,y)) add((y+1)*VW+x, y*VW+x); }
  const loops=[];
  for(const [start, lst] of out){
    while(lst.length){
      let prev=start, cur=lst.pop(); const loop=[start]; let guard=0;
      while(cur!==start && guard++<5e6){
        loop.push(cur); const l=out.get(cur); if(!l||!l.length) break;
        let k=0;
        if(l.length>1){ const dx=(cur%VW)-(prev%VW), dy=Math.floor(cur/VW)-Math.floor(prev/VW); let best=-9;
          for(let j=0;j<l.length;j++){const nx=(l[j]%VW)-(cur%VW), ny=Math.floor(l[j]/VW)-Math.floor(cur/VW);
            const crs=dx*ny-dy*nx; const sc=crs>0?2:(crs===0?1:0); if(sc>best){best=sc;k=j;}} }
        const nxt=l.splice(k,1)[0]; prev=cur; cur=nxt; }
      if(loop.length>=4) loops.push(loop.map(v=>[v%VW, Math.floor(v/VW)]));
    } }
  return loops;
}
function hwGuess(m,W,H){ const dt=distTransform(m,W,H); const r=[]; for(let i=0;i<W*H;i+=3) if(dt[i]>=1) r.push(dt[i]); return Math.min(8, median(r)||1); }
function median(a){ if(!a.length) return 0; const b=Float64Array.from(a).sort(); return b[b.length>>1]; }

function traceImage(img, o, lineW){
  const iw=img.naturalWidth||img.width, ih=img.naturalHeight||img.height;
    const sc = Math.max(iw,ih)<500 ? 500/Math.max(iw,ih) : Math.min(1, 900/Math.max(iw,ih)); // upscale tiny images
  const IW=Math.max(8,Math.round(iw*sc)), IH=Math.max(8,Math.round(ih*sc));
  const pad=6, W=IW+pad*2, H=IH+pad*2, N=W*H;
  const cv=document.createElement("canvas"); cv.width=W; cv.height=H;
  const g=cv.getContext("2d",{willReadFrequently:true}); g.imageSmoothingQuality="high"; g.drawImage(img,pad,pad,IW,IH);
  const raw=g.getImageData(0,0,W,H).data;
  // transparency?
  let transp=0; for(let y=pad;y<H-pad;y++)for(let x=pad;x<W-pad;x++){ if(raw[(y*W+x)*4+3]<128) transp++; }
  const useAlpha = transp > IW*IH*0.02;
  // border colour (median of the image's outer ring)
  const br=[],bgc=[],bb=[];
  for(let x=pad;x<W-pad;x+=1){ for(const y of [pad,pad+1,H-pad-1,H-pad-2]){ const i=(y*W+x)*4; br.push(raw[i]);bgc.push(raw[i+1]);bb.push(raw[i+2]); } }
  for(let y=pad;y<H-pad;y+=1){ for(const x of [pad,pad+1,W-pad-1,W-pad-2]){ const i=(y*W+x)*4; br.push(raw[i]);bgc.push(raw[i+1]);bb.push(raw[i+2]); } }
  const bg = useAlpha ? [255,255,255] : [median(br),median(bgc),median(bb)];
  // composite onto bg colour, blur 3x3
  const R=new Float32Array(N),G=new Float32Array(N),B=new Float32Array(N);
  for(let i=0;i<N;i++){ const a=raw[i*4+3]/255; R[i]=raw[i*4]*a+bg[0]*(1-a); G[i]=raw[i*4+1]*a+bg[1]*(1-a); B[i]=raw[i*4+2]*a+bg[2]*(1-a); }
  const blur=(A)=>{ const t=new Float32Array(N), u=new Float32Array(N);
    for(let y=0;y<H;y++)for(let x=0;x<W;x++){const i=y*W+x; t[i]=(A[x>0?i-1:i]+A[i]+A[x<W-1?i+1:i])/3;}
    for(let y=0;y<H;y++)for(let x=0;x<W;x++){const i=y*W+x; u[i]=(t[y>0?i-W:i]+t[i]+t[y<H-1?i+W:i])/3;} return u; };
  const Rb=blur(R),Gb=blur(G),Bb=blur(B);
  // ---- silhouette
  let fg=new Uint8Array(N);
  if(useAlpha){ for(let i=0;i<N;i++) fg[i]=raw[i*4+3]>=110?1:0; }
  else{
    // grow the background in from the border. Pixels close to the border colour are background; so are
    // pixels in smooth areas (no edge) that drift slowly away from it: paper tone, soft shadows, vignettes.
    // An edge (high gradient) always stops the growth.
    const far=o.bgTol*2.4, gT=22+o.bgTol*0.5;
    const grad=new Float32Array(N);
    for(let y=1;y<H-1;y++)for(let x=1;x<W-1;x++){const i=y*W+x; let mx=0;
      for(const A of [Rb,Gb,Bb]){ const gx=(A[i-W+1]+2*A[i+1]+A[i+W+1])-(A[i-W-1]+2*A[i-1]+A[i+W-1]); const gy=(A[i+W-1]+2*A[i+W]+A[i+W+1])-(A[i-W-1]+2*A[i-W]+A[i-W+1]);
        const m=Math.abs(gx)+Math.abs(gy); if(m>mx) mx=m; } grad[i]=mx; }
    const ext=new Uint8Array(N); const st=[];
    const dBg=i=>Math.max(Math.abs(Rb[i]-bg[0]),Math.abs(Gb[i]-bg[1]),Math.abs(Bb[i]-bg[2]));
    const ok=i=>{ const d=dBg(i); return d<o.bgTol*0.6 || (d<far && grad[i]<gT); };
    const seed=i=>{ if(!ext[i] && ok(i)){ ext[i]=1; st.push(i);} };
    for(let x=0;x<W;x++){seed(x);seed((H-1)*W+x);} for(let y=0;y<H;y++){seed(y*W);seed(y*W+W-1);}
    while(st.length){ const i=st.pop(); const x=i%W;
      for(const j of [x>0?i-1:-1, x<W-1?i+1:-1, i>=W?i-W:-1, i<N-W?i+W:-1]){ if(j<0||ext[j]) continue; if(ok(j)){ ext[j]=1; st.push(j);} } }
    for(let i=0;i<N;i++) fg[i]=ext[i]?0:1;
  }
  const gap=Math.max(2,Math.round(Math.max(W,H)*0.005));
  const shave=Math.max(2,Math.round(Math.max(W,H)*0.008)); // thinner than this cannot survive as dough anyway
  const closeFill=(m)=>{ const dil=boxFilter(m,W,H,gap,"dil"); const notDil=new Uint8Array(N); for(let i=0;i<N;i++) notDil[i]=dil[i]?0:1;
    const ext=floodExterior(notDil,W,H); const sl=new Uint8Array(N); for(let i=0;i<N;i++) sl[i]=ext[i]?0:1;
    return boxFilter(sl,W,H,gap,"ero"); };
  const biggest=(m)=>{ const c=components(m,W,H,false).comps; if(!c.length) return null; let b=0; c.forEach((x,i)=>{ if(x.length>c[b].length) b=i; }); return c[b]; };
  fg=closeFill(fg);
  let subjectMode=false;
  if(!useAlpha){
    // Is the "shape" really the whole picture: a frame, a box, a panel? Then look inside it for the painted subject.
    const big=biggest(fg);
    let boxy=false;
    if(big){ let x0=W,x1=0,y0=H,y1=0; for(const i of big){ const x=i%W, y=(i-x)/W; if(x<x0)x0=x; if(x>x1)x1=x; if(y<y0)y0=y; if(y>y1)y1=y; }
      const bw=x1-x0+1, bh=y1-y0+1; boxy = bw>=IW*0.9 && bh>=IH*0.9 && big.length>=bw*bh*0.8; }
    if(boxy){
      // the most common colour inside is the panel colour
      const hist=new Map(); for(let i=0;i<N;i+=2){ if(!fg[i]) continue; const key=((Rb[i]>>4)<<8)|((Gb[i]>>4)<<4)|(Bb[i]>>4); hist.set(key,(hist.get(key)||0)+1); }
      let bk=0,bn=-1; for(const [k2,n] of hist){ if(n>bn){bn=n;bk=k2;} }
      const pc=[((bk>>8)&15)*16+8, ((bk>>4)&15)*16+8, (bk&15)*16+8];
      const thr=Math.max(16,o.bgTol*0.55);
      const ink=new Uint8Array(N); for(let i=0;i<N;i++){ if(fg[i] && Math.max(Math.abs(Rb[i]-pc[0]),Math.abs(Gb[i]-pc[1]),Math.abs(Bb[i]-pc[2]))>thr) ink[i]=1; }
      const r=Math.max(3,Math.round(Math.max(W,H)*0.012));
      const coreC=biggest(boxFilter(ink,W,H,r,"ero"));
      if(coreC && coreC.length>=IW*IH*0.01){
        const core=new Uint8Array(N); for(const i of coreC) core[i]=1;
        const grown=boxFilter(core,W,H,r+1,"dil"); const subj=new Uint8Array(N); let n=0; for(let i=0;i<N;i++){ if(grown[i]&&ink[i]){subj[i]=1;n++;} }
        if(n>=IW*IH*0.04 && n<=big.length*0.8){ fg=closeFill(subj); subjectMode=true; bg[0]=pc[0]; bg[1]=pc[1]; bg[2]=pc[2]; }
      }
    }
  }
  // label lines, text and whiskers hanging off the shape would only become spikes
  if(!o.forceInk){ const op=boxFilter(boxFilter(fg,W,H,shave,"ero"),W,H,shave,"dil"); let n0=0,n1=0; for(let i=0;i<N;i++){ n0+=fg[i]; if(op[i]&&fg[i]) n1++; }
    if(n1>n0*0.5){ for(let i=0;i<N;i++) fg[i]=op[i]&&fg[i]?1:0; } }
  const {lab, comps}=components(fg,W,H,false);
  if(!comps.length) return null;
  let bi=0; comps.forEach((c,i)=>{ if(c.length>comps[bi].length) bi=i; });
  const sil=new Uint8Array(N); for(const i of comps[bi]) sil[i]=1;
  const dropped=comps.filter((c,i)=>i!==bi && c.length>comps[bi].length*0.03).length;
  if(comps[bi].length < 200) return null;
  if(comps[bi].length > (W-2*pad)*(H-2*pad)*0.985) return {error:"background"};
  // outline polygon (px)
  const silLoops=traceLoops(sil,W,H);
  const outerPx=largest(silLoops); if(!outerPx) return null;
  const outerS=dpClosed(smoothClosed(outerPx,Math.max(3,Math.round(Math.max(W,H)/220)),3),0.5);
  const pb=bbox([outerS]); const k=sizeMM()/Math.max(pb.w,pb.h); // mm per px
  const cx=pb.x0+pb.w/2, cy=pb.y0+pb.h/2;
  const T=p=>p.map(q=>[(q[0]-cx)*k,(q[1]-cy)*k]);
  const silMM=largest(clean([T(outerS)],NZ));
  const pxPerMM=1/k;
  // ---- detail mask
  let L=new Float32Array(N); for(let i=0;i<N;i++) L[i]=0.299*Rb[i]+0.587*Gb[i]+0.114*Bb[i];
  const bgL=0.299*bg[0]+0.587*bg[1]+0.114*bg[2];
  const silMean=(()=>{let s=0;for(const i of comps[bi]) s+=L[i]; return s/comps[bi].length;})();
  let nBlack=0,nLight=0; for(const i of comps[bi]){ if(L[i]<55) nBlack++; else if(L[i]>185) nLight++; }
  const nS=comps[bi].length;
  // light lines on a dark shape (logos, chalk drawings): the object is dark, has light detail, and no black ink
  const invert = (!useAlpha && bgL<110 && silMean<150) || (nLight>nS*0.003 && (silMean<90 || (silMean<128 && nBlack<nS*0.003)));
  if(invert){ for(let i=0;i<N;i++) L[i]=255-L[i]; } // light lines on a dark shape
  const inner=boxFilter(sil,W,H,Math.max(1,Math.round(0.6*pxPerMM)),"ero");
  const win=Math.max(8,Math.round(Math.max(W,H)*0.035));
  const I=integral(L,W,H);
  const sv=o.sens; const C=6+(1-sv)*34, absT=70+sv*100;
  const dark=new Uint8Array(N); let darkN=0, innerN=0;
  const deep=boxFilter(sil,W,H,Math.round(RULES.edge*pxPerMM+2),"ero");
  for(let y=0;y<H;y++){const y0=Math.max(0,y-win),y1=Math.min(H,y+win+1);
    for(let x=0;x<W;x++){const i=y*W+x; if(!inner[i]) continue;
      const x0=Math.max(0,x-win),x1=Math.min(W,x+win+1);
      const m=(I[y1*(W+1)+x1]-I[y0*(W+1)+x1]-I[y1*(W+1)+x0]+I[y0*(W+1)+x0])/((x1-x0)*(y1-y0));
      if(L[i]<m-C && L[i]<absT){ dark[i]=1; }
      if(deep[i] && L[i]<80) darkN++;
      if(deep[i]) innerN++; }}
  const edge=new Uint8Array(N);
  const eT=40+(1-sv)*160;
  for(let y=1;y<H-1;y++)for(let x=1;x<W-1;x++){const i=y*W+x; if(!inner[i]) continue; let mx=0;
    for(const A of [Rb,Gb,Bb]){ const gx=(A[i-W+1]+2*A[i+1]+A[i+W+1])-(A[i-W-1]+2*A[i-1]+A[i+W-1]); const gy=(A[i+W-1]+2*A[i+W]+A[i+W+1])-(A[i-W-1]+2*A[i-W]+A[i-W+1]);
      const m=Math.hypot(gx,gy); if(m>mx) mx=m; }
    if(mx>eT) edge[i]=1; }
  const cover=innerN? darkN/innerN : 0;
  let mode=o.src;
  // a painted picture (filled dark and light areas, not drawn lines): Otsu split of the shape into dark and light
  let regLab=null, inkMask=null, inkMode=false, realInk=false; const autoSrc=o.src==="auto";
  { const hist=new Float64Array(256); let n=0; for(const i of comps[bi]){ hist[Math.max(0,Math.min(255,L[i]|0))]++; n++; }
    let sum=0; for(let t=0;t<256;t++) sum+=t*hist[t];
    let wB=0,sB=0,best=-1,thr=128,m0=0,m1=0; for(let t=0;t<256;t++){ wB+=hist[t]; if(!wB) continue; const wF=n-wB; if(!wF) break; sB+=t*hist[t];
      const a=sB/wB, b2=(sum-sB)/wF, v=wB*wF*(a-b2)*(a-b2); if(v>best){best=v;thr=t;m0=a;m1=b2;} }
    const dk=new Uint8Array(N); let nd=0; for(const i of comps[bi]){ if(L[i]<=thr){dk[i]=1;nd++;} }
    const dtd=distTransform(dk,W,H); const fatT=Math.max(3,0.9*pxPerMM); let nf=0; const grownFat=new Uint8Array(N);
    for(const i of comps[bi]) if(dk[i]&&dtd[i]>=fatT){ grownFat[i]=1; }
    const gf=boxFilter(grownFat,W,H,Math.ceil(fatT),"dil"); for(const i of comps[bi]) if(dk[i]&&gf[i]) nf++;
    const darkFrac=nd/n, fatFrac=nd?nf/nd:0;
    if(o.debug){ o.debug.otsu={thr,m0,m1,darkFrac,fatFrac}; }
    // drawn black outlines are not paint: the dark areas of a painted picture have colour
    let ch=0,dl=0; for(const i of comps[bi]) if(dk[i]){ ch+=Math.max(Rb[i],Gb[i],Bb[i])-Math.min(Rb[i],Gb[i],Bb[i]); dl+=0.299*Rb[i]+0.587*Gb[i]+0.114*Bb[i]; }
    ch=nd?ch/nd:0; dl=nd?dl/nd:0;
    if(o.debug){ o.debug.otsu.ch=ch; o.debug.otsu.dl=dl; }
    const painted = (m1-m0)>28 && darkFrac>0.1 && darkFrac<0.9 && fatFrac>0.55 && ch>45 && dl>40;
    // a redrawn line drawing: every black line is copied exactly as drawn
    if(mode==="auto" && o.forceInk){ const ik=new Uint8Array(N); let ni=0;
      for(const i of comps[bi]){ const c=Math.max(Rb[i],Gb[i],Bb[i])-Math.min(Rb[i],Gb[i],Bb[i]); if(0.299*Rb[i]+0.587*Gb[i]+0.114*Bb[i]<110 && c<90){ ik[i]=1; ni++; } }
      if(ni>n*0.01){
        // thin lines are brought up to one even, bold weight (about 1.1 mm at the cookie size), the way a cutter needs them;
        // the drawing itself is not changed, only its line weight
        const dti=distTransform(ik,W,H), hw=[]; for(const i of comps[bi]) if(ik[i]) hw.push(dti[i]); hw.sort((p,q)=>p-q);
        const lineHalf=hw.length? hw[Math.floor(hw.length*0.9)] : 0, want=0.55*pxPerMM;
        if(lineHalf>0 && lineHalf<want){ const inv=new Uint8Array(N); for(let i=0;i<N;i++) inv[i]=ik[i]?0:1;
          const dd=distTransform(inv,W,H), r=want-lineHalf; for(const i of comps[bi]) if(!ik[i] && dd[i]<=r) ik[i]=1; }
        inkMask=ik; mode="ink"; realInk=true; } }
    // flat colours inside drawn black outlines: the black lines themselves are the details
    if(mode==="auto" && painted){ const ik=new Uint8Array(N); let ni=0;
      for(const i of comps[bi]){ const c=Math.max(Rb[i],Gb[i],Bb[i])-Math.min(Rb[i],Gb[i],Bb[i]); if(0.299*Rb[i]+0.587*Gb[i]+0.114*Bb[i]<62 && c<75){ ik[i]=1; ni++; } }
      const dti=distTransform(ik,W,H); let nfat=0; for(const i of comps[bi]) if(ik[i]&&dti[i]>=Math.max(4,1.3*pxPerMM)) nfat++;
      if(o.debug) o.debug.ink={frac:ni/n, fat:ni?nfat/ni:0};
      if(ni>n*0.03 && ni<n*0.45 && nfat<ni*0.08){ inkMask=ik; mode="ink"; realInk=true; } }
    // a shaded illustration: its parts are separated by dark creases (darker than the paint on both sides).
    // Those creases are the lines to keep; soft shading and highlights are not.
    if(mode==="auto" && painted && !inkMask && !invert){ const cr=new Uint8Array(N), grey=new Uint8Array(N); let nc=0;
      const dirs=[[1,0],[0,1],[1,1],[1,-1]], T=o.creaseT||13;
      for(const s0 of [Math.max(2,Math.round(0.5*pxPerMM)), Math.max(3,Math.round(0.9*pxPerMM))]){
        for(const i of comps[bi]){ if(cr[i]||grey[i]||!inner[i]) continue; const x=i%W, y=(i-x)/W; if(x<s0||y<s0||x>=W-s0||y>=H-s0) continue;
          const v=L[i]; let best=0;
          for(const [dx,dy] of dirs){ const j=(dy*W+dx)*s0; const r=Math.min(L[i+j],L[i-j])-v; if(r>best) best=r; }
          if(best<T){ // a thin light line drawn across the painting (label leader): remember it so creases can be joined under it
            let lt=0; for(const [dx,dy] of dirs){ const j=(dy*W+dx)*s0; const r=v-Math.max(L[i+j],L[i-j]); if(r>lt) lt=r; }
            if(lt>=T && Math.max(Rb[i],Gb[i],Bb[i])-Math.min(Rb[i],Gb[i],Bb[i])<34) grey[i]=1; continue; }
          const c=Math.max(Rb[i],Gb[i],Bb[i])-Math.min(Rb[i],Gb[i],Bb[i]);
          if(c<30){ grey[i]=1; continue; }          // grey or black: a label line or lettering, not part of the painting
          cr[i]=1; nc++; } }
      // where a label line crosses a crease it leaves a gap: bridge it
      { const rr=Math.max(2,Math.round(0.8*pxPerMM)); const near=boxFilter(boxFilter(cr,W,H,rr,"dil"),W,H,rr,"ero"); for(let i=0;i<N;i++) if(grey[i]&&near[i]&&!cr[i]) cr[i]=1; }
      if(o.debug) o.debug.crease={frac:nc/n};
      if(nc>n*0.02 && nc<n*0.3){ inkMask=cr; mode="ink"; } }
    if(mode==="regions" || (mode==="auto" && painted)){ mode="regions";
      // drop flecks of either colour, then keep the borders between dark and light
      const minR=Math.max(20, n*0.004);
      for(const px of components(dk,W,H,true).comps){ if(px.length<minR) for(const i of px) dk[i]=0; }
      const lt=new Uint8Array(N); for(const i of comps[bi]) if(!dk[i]) lt[i]=1;
      for(const px of components(lt,W,H,false).comps){ if(px.length<minR) for(const i of px) dk[i]=1; }
      regLab=dk; }
  }
  if(mode==="auto") mode = cover>0.004 ? "lines" : "edges";
  let D;
  if(mode==="regions"){
    const Bd=new Uint8Array(N);
    for(let y=1;y<H-1;y++)for(let x=1;x<W-1;x++){ const i=y*W+x; if(!inner[i]) continue;
      if((sil[i+1]&&regLab[i]!==regLab[i+1]) || (sil[i+W]&&regLab[i]!==regLab[i+W])) Bd[i]=1; }
    const rr=Math.max(1,Math.round(0.28*pxPerMM)); const dl=boxFilter(Bd,W,H,rr,"dil"); D=new Uint8Array(N); for(let i=0;i<N;i++) D[i]=dl[i]&&inner[i]?1:0;
  } else if(mode==="ink"){ D=new Uint8Array(N); for(let i=0;i<N;i++) D[i]=inkMask[i]&&inner[i]?1:0; mode="lines"; inkMode=true;
  } else if(mode==="lines"){ // drawn lines, plus colour shapes that have no line around them (dots, spots)
    D=dark.slice(); const near=boxFilter(dark,W,H,Math.max(3,Math.round(hwGuess(dark,W,H)*2+2)),"dil");
    for(let i=0;i<N;i++) if(edge[i] && !near[i]) D[i]=1;
  } else D = mode==="edges"? edge : new Uint8Array(N);
  // ---- clean specks
  const minPx=Math.max(6, (o.spk*pxPerMM)**2*0.5);
  { const c=components(D,W,H,true); const keep=new Uint8Array(N);
    for(const px of c.comps){ if(px.length>=minPx) for(const i of px) keep[i]=1; } D=keep; }
  // ---- compact blobs (eyes, seeds, dots) stay as filled dots
  const blobsMM=[];
  { const dt0=distTransform(D,W,H); const c=components(D,W,H,true);
    for(const px of c.comps){ let mx=0; for(const i of px) if(dt0[i]>mx) mx=dt0[i];
      const amm=px.length*k*k, ratio=mx/Math.sqrt(px.length/Math.PI);
      if(ratio>0.62 && amm<=RULES.bigFill && amm>=0.8){
        const m=new Uint8Array(N); for(const i of px) m[i]=1;
        const lp=traceLoops(m,W,H).map(l=>dpClosed(smoothClosed(l,2,2),0.4)); const big=largest(lp);
        if(big){ blobsMM.push(T(big)); for(const i of px) D[i]=0; } } } }
  // ---- split thick parts from thin strokes
  const dt=distTransform(D,W,H);
  const ridge=[];
  for(let y=1;y<H-1;y++)for(let x=1;x<W-1;x++){const i=y*W+x; const v=dt[i]; if(v<1) continue;
    if(v>=dt[i-1]&&v>=dt[i+1]&&v>=dt[i-W]&&v>=dt[i+W]) ridge.push(v);}
  const hw=Math.max(1, Math.min(median(ridge)||1, Math.max(W,H)/60));
  const coreT=inkMode? Math.max(4.5*hw, hw+6) : Math.max(2.2*hw, hw+2.5); // where inked lines run together they are still lines, not a filled area
  if(o.debug){o.debug.hw=hw; o.debug.coreT=coreT; o.debug.k=k;}
  const core=new Uint8Array(N); let anyCore=false; for(let i=0;i<N;i++){ if(dt[i]>=coreT){core[i]=1;anyCore=true;} }
  let thinMask=D;
  if(anyCore){
    const grown=boxFilter(core,W,H,Math.ceil(coreT),"dil"); const fat=new Uint8Array(N); thinMask=new Uint8Array(N);
    for(let i=0;i<N;i++){ if(!D[i]) continue; if(grown[i]) fat[i]=1; else thinMask[i]=1; }
    const fc=components(fat,W,H,true); const ringPx=Math.max(1,Math.round(RULES.ringW*pxPerMM));
    if(o.debug) o.debug.fat=fc.comps.map(c=>Math.round(c.length*k*k));
    for(const px of fc.comps){
      const amm=px.length*k*k;
      if(amm < 1.0) continue;
      if(amm <= RULES.bigFill){ // a dot: keep its shape
        const m=new Uint8Array(N); for(const i of px) m[i]=1;
        const lp=traceLoops(m,W,H).map(l=>dpClosed(smoothClosed(l,2,2),0.4)); const big=largest(lp); if(big) blobsMM.push(T(big));
      } else { // big fill: keep only its outline as a line
        const m=new Uint8Array(N); for(const i of px) m[i]=1; const er=boxFilter(m,W,H,ringPx,"ero");
        for(const i of px) if(!er[i]) thinMask[i]=1;
      }
    }
  }
  // ---- skeleton -> centre lines
  const sk=thin(thinMask,W,H);
  if(o.debug){o.debug.W=W;o.debug.H=H;o.debug.D=Array.from(thinMask);o.debug.sk=Array.from(sk);o.debug.dark=Array.from(dark);}
  let paths=skeletonPaths(sk,W,H);
  const spur=Math.max(3*hw, 1.2*pxPerMM);
  const isoMin=Math.max(4, o.spk*pxPerMM);
  paths=paths.filter(p=>{ const L=p.pts.length;
    if((p.endA===1&&p.endB>=3 || p.endB===1&&p.endA>=3) && L<spur) return false;   // spur
    if(p.endA===1 && p.endB===1 && L<isoMin) return false;                          // lone fleck
    return true; });
  paths=mergeThroughJunctions(paths, sk, W, H);
  const sw=Math.max(2, Math.min(6, Math.round(hw*1.2)+1));
  let lines=[];
  for(const p of paths){
    let pts=p.cyc? smoothClosed(p.pts,sw,3) : smoothOpen(p.pts,sw,3);
    pts=p.cyc? dpClosed(pts,0.35) : dp(pts,0.35);
    if(pts.length<2) continue;
    let mm=T(pts);
    if(mm.length>2){ mm = p.cyc? dpClosed(chaikin(chaikin(mm,true),true),0.025) : dp(chaikin(chaikin(mm,false),false),0.025); }
    lines.push({p:mm, c:!!p.cyc});
  }
  // stitch: drop lines too short to matter
  const minLen=Math.max(1.2, o.spk*0.6);
  // ---- outline: silhouette, rounded
  let outline=silMM;
  if(o.smooth>0){ outline=largest(offset(offset([outline],o.smooth,0.04),-o.smooth,0.04))||outline;
    const op=o.smooth*0.45; outline=largest(offset(offset([outline],-op,0.04),op,0.04))||outline; }
  outline=dpClosed(chaikin(chaikin(dpClosed(outline,0.08),true),true),0.03);
  // ---- keep details inside the safe zone (this also drops the drawn outer outline)
  const silCut=largest(offset(offset([silMM],RULES.notch,0.04),-RULES.notch,0.04))||silMM;
  const safe=offset([silCut], -(RULES.edge+lineW/2+0.3), 0.04);
  lines=connectLines(lines, silCut, lineW, o.minLine, hw*k+0.7);
  const blobs=inter(blobsMM.length?union(blobsMM):[], offset([silMM],-RULES.edge,0.04)).filter(p=>Math.abs(area(p))>=RULES.minArea).map(p=>dpClosed(p,0.04));
  if(o.debug){o.debug.blobsMM=blobsMM.length; o.debug.blobs=blobs.length;}
  const imgX={k:k*sc, tx:(pad-cx)*k, ty:(pad-cy)*k};
  // the picture's own ink, kept as it was drawn (for the drawing step)
  let ink=null, inkW=0;
  try{
    let pix=null;
    if(realInk){ pix=new Uint8Array(N); for(const i of comps[bi]) if(inkMask[i]) pix[i]=1; }
    else if(autoSrc && mode==="lines" && !inkMode && !invert && cover>0.004){ pix=new Uint8Array(N); for(const i of comps[bi]){ if(dark[i] || (!inner[i] && L[i]<110)) pix[i]=1; } }
    if(pix){ let np=0; for(let i=0;i<N;i++) np+=pix[i]; const frac=np/comps[bi].length;
      if(frac>0.02 && frac<0.6){
        const loops=traceLoops(pix,W,H).filter(l=>l.length>=8).map(l=>dpClosed(smoothClosed(l,3,3),0.25)).filter(l=>l.length>=3);
        ink=clean(loops.map(T),EO).filter(p=>Math.abs(area(p))>=0.25); inkW=Math.max(0.8, 2*hw*k); if(!ink.length) ink=null; } }
  }catch(err){ console.warn(err); ink=null; }
  return {outline, lines, blobs, imgX, ink, inkW, info:{mode, cover, useAlpha, bg, dropped, subject:subjectMode}};
}

/* =====================================================================
   CUTTER-READY GEOMETRY (applied to everything shown, saved and printed)
   ===================================================================== */
let readyKey="", readyVal=null;
function cutterReady(d){
  const key=JSON.stringify([d.outline,d.lines,d.blobs,d.lineW,d.print,d.frame,d.holes||[],d.art&&d.art.real?[d.art.v,d.art.ink.length,d.art.w]:0]);
  if(key===readyKey && readyVal) return readyVal;
  const fixes=[], warns=[]; let res={outline:[],details:[],bars:[],holes:[],fixes,warns};
  try{
    let O=largest(clean([d.outline],NZ));
    let extraLines=[];
    if(O && d.frame && d.frame!=="figure"){ extraLines=[{p:dpClosed(O,0.03),c:true}]; O=frameShape(O, d.frame); }
    if(O && Math.abs(area(O))>20){
      const a0=Math.abs(area(O));
      if(d.art && d.art.vector){
        // the cut runs along the middle of the drawn outline, so that line becomes the wall itself (no second ridge beside it)
        const O2v=dpClosed(largest(offset([O], -0.45, 0.03))||O, 0.02); let detv=[]; try{ detv=inter(d.art.ink, [O2v]); }catch(e){}
        detv=flatEx(exPolys(detv).filter(e=>exArea(e)>=0.4));
        const barsv = (d.print.style==="one" && detv.length) ? makeBars(O2v, detv, d.print) : [];
        res={outline:O2v, details:detv, bars:barsv, holes:[], fixes, warns}; readyKey=key; readyVal=res; return res;
      }
      // a drawing already designed for a cutter keeps its shape: only hairline slots and threads are cleaned up
      const designed=!!(d.art && d.art.real), notchR=designed? 0.5 : RULES.notch, neckR=designed? 0.9 : RULES.neck;
      let O1=largest(offset(offset([O],notchR,0.04),-notchR,0.04))||O;
      if(Math.abs(area(O1))-a0>1.5) fixes.push("filled narrow slots");
      let O2=largest(offset(offset([O1],-neckR,0.04),neckR,0.04));
      if(!O2 || Math.abs(area(O2))<0.5*Math.abs(area(O1))) O2=O1;
      else if(Math.abs(area(O1))-Math.abs(area(O2))>1.5) fixes.push("rounded thin parts");
      O2=dpClosed(O2,0.04);
      // a copied drawing gets a smooth, even cut edge (no small wobbles from the picture)
      if(d.art && d.art.real){ try{ let q=resample(O2.concat([O2[0]]), 0.35); q.pop(); q=smoothClosed(q, 3, 3); if(q.length>=8){ const s=Math.sqrt(Math.abs(area(O2))/Math.abs(area(q))); const c=bbox([q]), cx=c.x0+c.w/2, cy=c.y0+c.h/2; O2=dpClosed(q.map(p=>[cx+(p[0]-cx)*s, cy+(p[1]-cy)*s]),0.03); } }catch(err){ console.warn(err); } }
      const w=Math.max(RULES.minLine, d.lineW||1.2);
      if((d.lineW||0)<RULES.minLine) fixes.push("widened lines");
      // holes: cut right through. Each gets its own blade, held by the crossbars. Keep a 5 mm wall of cookie around them.
      let holes=[];
      if(d.holes && d.holes.length){
        const raw=union(d.holes.filter(p=>p.length>2).map(p=>area(p)<0?p.slice().reverse():p));
        let hs=inter(raw, offset([O2], -2*RULES.neck, 0.04));
        hs=offset(offset(hs,-RULES.notch,0.04),RULES.notch,0.04).filter(p=>Math.abs(area(p))>12);
        hs=union(hs).filter(p=>area(p)>0);
        if(Math.abs(netArea(raw)-netArea(hs))>1.5) fixes.push(hs.length?"moved a hole off the edge":"dropped a hole that was too small");
        holes=hs.map(p=>dpClosed(p,0.04));
      }
      let det=union(strokeLines(d.lines.concat(extraLines),w).concat(d.blobs||[]));
      // an uploaded drawing: press its own ink into the dough, as drawn. Its outer outline is the blade, so that band is left out,
      // and lines that ran into the outline are led on to the blade.
      if(d.art && d.art.real && d.art.ink.length && !extraLines.length){ try{
        // how thick the drawing's strokes really are: area / half the perimeter
        let per=0; for(const p of d.art.ink) per+=plen(p.concat([p[0]])); const sw=per>0? 2*netArea(d.art.ink)/per : d.art.w;
        // the drawn edge (before rounding thin tips) decides what is outline ink, so a rounded tip leaves no stray line behind
        const t=Math.max(d.art.w, sw)*1.2+0.3, core=inter(offset([O], -t, 0.04), offset([O2], -0.6, 0.04));
        let ink=inter(d.art.ink, core);
        ink=offset(offset(ink,-0.25,0.03),0.25,0.03);
        // the drawing's own ink is kept as drawn (not rebuilt from traced centre lines, which can miss pieces);
        // only small scraps the outline left near the edge go
        const dE=q=>{ let b=Infinity; for(let i=0;i<O2.length;i++){ const A=O2[i],B=O2[(i+1)%O2.length]; const r=segDist(q[0],q[1],A[0],A[1],B[0],B[1])[0]; if(r<b) b=r; } return b; };
        { const rimZone=diff([O2], offset([O2], -(t+1.2), 0.04));
          ink=flatEx(exPolys(ink).filter(e=>!(exArea(e) < 3*sw*sw && netArea(inter([e.outer], rimZone)) > 0.5*Math.abs(area(e.outer))))); }
        // every line that ran into the outline is joined to the blade, as on the drawing:
        // where the ink was trimmed off at the edge band, a short bridge of the same width carries it to the edge
        const reach=[]; { const near=t+0.35, bridges=[];
          for(const e of exPolys(ink)){ const R=e.outer, n=R.length; if(n<3) continue;
            const on=R.map(q=>dE(q)<near); if(on.every(Boolean)) continue;
            let k0=on.findIndex(v=>!v);   // start just after an off-vertex so groups do not wrap
            for(let k=1;k<=n;k++){ const a=(k0+k)%n; if(!on[a]) continue;
              const grp=[]; let b=a; while(on[b] && grp.length<n){ grp.push(R[b]); b=(b+1)%n; } k+= grp.length-1;
              const L=plen(grp); if(L<0.2 || L>3.2*sw) continue;            // a long run along the edge is a line beside it, not an end
              const m=[(grp[0][0]+grp[grp.length-1][0])/2, (grp[0][1]+grp[grp.length-1][1])/2];
              let best=[Infinity]; for(let i=0;i<O2.length;i++){ const A=O2[i],B=O2[(i+1)%O2.length]; const r=segDist(m[0],m[1],A[0],A[1],B[0],B[1]); if(r[0]<best[0]) best=r; }
              if(!(best[0]<t+0.6)) continue;
              const dx=best[1]-m[0], dy=best[2]-m[1], dd=Math.hypot(dx,dy)||1;
              const wdt=Math.min(sw*1.15, Math.max(RULES.minLine, Math.hypot(grp[0][0]-grp[grp.length-1][0], grp[0][1]-grp[grp.length-1][1])));
              bridges.push({p:[[m[0]-dx/dd*0.3, m[1]-dy/dd*0.3],[best[1]+dx/dd*0.6, best[2]+dy/dd*0.6]], c:false, w:wdt}); } }
          for(const bq of bridges) reach.push(...strokeLines([bq], bq.w)); }
        const thin=strokeLines(d.lines, RULES.minLine);             // nothing thinner than can be printed
        det=union(ink.concat(reach.length? union(reach) : [], inter(thin, offset(ink,0.2,0.04))));
        // knots and nubs where a line meets the edge or another line go: lines stay one even width
        { const r=Math.max(0.25, sw*0.4); det=offset(offset(det,-r,0.03),r,0.03); }
        // round shapes (eyes, rings) keep their whole ring, also where they sit on the cookie's edge
        { const rings=[]; for(const e of exPolys(d.art.ink)) for(const h of e.holes){ const hb=bbox([h]);
            if(Math.max(hb.w,hb.h)<=18 && Math.max(hb.w,hb.h)>=1.5 && roundness(h)>0.72){ const el=ellipseOf(h); rings.push(...diff(offset([el], Math.max(RULES.minLine, sw), 0.04), [el])); } }
          if(rings.length) det=union(det.concat(inter(rings, offset([O2], -0.2, 0.04)))); }
        // a ring drawn just inside another ring (a double outline) would bake into one blurred groove: keep the outer one
        { const rings=d.lines.filter(l=>l.c && l.p.length>=4 && plen(l.p.concat([l.p[0]]))<80), drop=[];
          for(const B of rings){
            const own=union(strokeLines([B], sw*1.8)), rest=diff(det, own); if(!rest.length) continue;
            // only a ring that sits inside another ring (other lines, or other lines and the edge, close all round it)
            const wall=exPolys(union(rest.concat(diff([O2], offset([O2], -0.6, 0.04))))); const c0=B.p[0];
            const enclosed=wall.some(e=>e.holes.some(h=>B.p.every(q=>pointInPoly(q,h)) && Math.abs(area(h)) < 4*Math.abs(area(B.p))));
            if(!enclosed) continue;
            const near=exPolys(offset(rest, sw*0.5 + 2*RULES.crowd + 0.9, 0.04));
            const pts=resample(B.p.concat([B.p[0]]), 0.5); let hit=0;
            for(const q of pts) if(near.some(e=>pointInPoly(q,e.outer) && !e.holes.some(h=>pointInPoly(q,h)))) hit++;
            if(hit > 0.6*pts.length) drop.push(B); }
          if(drop.length){ const others=d.lines.filter(l=>!drop.includes(l));
            let cut=union(strokeLines(drop, sw*1.7)); if(others.length) cut=diff(cut, union(strokeLines(others, sw*1.15)));
            det=diff(det, cut); det=offset(offset(det,-0.3,0.03),0.3,0.03);
            det=flatEx(exPolys(det).filter(e=>exArea(e)>=RULES.minArea));
            fixes.push("double ring made single"); } }
        // hairline gaps between lines are sealed; wider gaps stay as drawn (the check warns if they are too close),
        // so the cutter never presses a solid patch the drawing does not show
        det=offset(offset(det, 0.3, 0.04), -0.3, 0.04);
        det=offset(offset(det,-0.2,0.03),0.2,0.03); }catch(err){ console.warn(err); } }
      if(det.length && holes.length) det=diff(det, offset(holes, 1.2, 0.04));
      if(det.length){
        const fat=exPolys(offset(offset(det,-1.8,0.03),1.8,0.03)).filter(e=>exArea(e)>RULES.bigFill);
        if(fat.length){ const F=flatEx(fat);
          // a big solid stamp sticks and squashes the dough, so it becomes an outline filled with stripes: it still reads as an area
          const fb=bbox(F), sw=Math.max(1,w*0.9)*Math.SQRT2, pitch=(Math.max(1,w*0.9)+1.7)*Math.SQRT2, hh=fb.h+2, stripes=[];
          for(let c=fb.x0-hh-1; c<fb.x1+1; c+=pitch) stripes.push([[c,fb.y0-1],[c+sw,fb.y0-1],[c+sw+hh,fb.y1+1],[c+hh,fb.y1+1]]);
          det=union(diff(det,F).concat(diff(F, offset(F,-RULES.ringW,0.03))).concat(inter(stripes,F))); fixes.push("striped big areas"); }
        const before=netArea(det);
        // creases may run into the outline: there they join the blade (which also braces the cutter).
        // For the separate stamp, everything stays on the stamp plate.
        det=inter(det, d.print.style==="stamp"? offset([O2], -(d.print.clear+0.6), 0.04) : [O2]);
        // drop slivers left between a line and the edge
        det=offset(offset(det,-0.3,0.03),0.3,0.03);
        const ex=exPolys(det); const kept=ex.filter(e=>exArea(e)>=RULES.minArea);
        if(kept.length<ex.length) fixes.push("removed specks");
        det=flatEx(kept).map(p=>dpClosed(p,0.03)).filter(p=>p.length>=3);
        const closed=offset(offset(det,RULES.crowd,0.05),-RULES.crowd,0.05);
        if(!fat.length && netArea(closed)-netArea(det)>4) warns.push("some lines are very close together, so the dough between them may blur");
      }
      const holeRings = holes.length ? diff(holes, offset(holes, -d.print.base, 0.04)) : [];
      const bars = ((d.print.style==="one" && det.length) || holes.length) ? makeBars(O2, union(det.concat(holeRings)), d.print) : [];
      res={outline:O2, details:det, bars, holes, fixes, warns};
    }
  }catch(err){ console.warn(err); }
  readyKey=key; readyVal=res; return res;
}
// crossbars: connect every imprint ridge to the blade (they sit at the top, above the dough)
function makeBars(O, det, pr){
  const comps=exPolys(det); if(!comps.length) return [];
  // 1. wide straps across the short direction plus a spine along the long one: they stiffen the cutter,
  //    give a flat surface to push on, and catch most imprint lines
  const bb=bbox([O]); const tall=bb.h>=bb.w; const L=tall?bb.h:bb.w; const n=Math.max(1, Math.round(L/24));
  const sw=RULES.strapW, rects=[];
  for(let i=1;i<=n;i++){ const t=(tall?bb.y0:bb.x0)+L*i/(n+1);
    rects.push(tall? [[bb.x0-5,t-sw/2],[bb.x1+5,t-sw/2],[bb.x1+5,t+sw/2],[bb.x0-5,t+sw/2]] : [[t-sw/2,bb.y0-5],[t+sw/2,bb.y0-5],[t+sw/2,bb.y1+5],[t-sw/2,bb.y1+5]]); }
  const c0=tall? bb.x0+bb.w/2 : bb.y0+bb.h/2;
  rects.push(tall? [[c0-sw/2,bb.y0-5],[c0+sw/2,bb.y0-5],[c0+sw/2,bb.y1+5],[c0-sw/2,bb.y1+5]] : [[bb.x0-5,c0-sw/2],[bb.x1+5,c0-sw/2],[bb.x1+5,c0+sw/2],[bb.x0-5,c0+sw/2]]);
  const inside=offset([O], pr.base, 0.04);
  // keep only strap pieces that reach the blade (a piece floating inside would not help)
  let straps=exPolys(inter(rects, inside)).filter(e=>exArea(e)>4);
  const Oring=diff(inside,[O]);
  straps=straps.filter(e=>netArea(inter(flatEx([e]),Oring))>0.05);
  const strapPolys=flatEx(straps);
  // 2. any line the straps don't touch gets its own short bar to the nearest connected part
  const segs=[]; const addLoop=p=>{for(let i=0;i<p.length;i++){const a=p[i],b=p[(i+1)%p.length];segs.push([a[0],a[1],b[0],b[1]]);}};
  addLoop(O); strapPolys.forEach(addLoop);
  const sample=p=>{ const st=Math.max(1,Math.floor(p.length/120)); const r=[]; for(let i=0;i<p.length;i+=st) r.push(p[i]); return r; };
  const nearest=(pts)=>{ let best=[Infinity]; for(const p of pts){ for(const s of segs){ const r=segDist(p[0],p[1],s[0],s[1],s[2],s[3]); if(r[0]<best[0]) best=[r[0],p,[r[1],r[2]]]; } } return best; };
  let rem=comps.filter(c=>{ const hit=netArea(inter(flatEx([c]), strapPolys))>0.05; if(hit) addLoop(c.outer); return !hit; });
  const lines=[];
  while(rem.length){
    let bi=0, bb2=[Infinity];
    for(let i=0;i<rem.length;i++){ const r=nearest(sample(rem[i].outer)); if(r[0]<bb2[0]){bb2=r;bi=i;} }
    const c=rem.splice(bi,1)[0];
    if(bb2[0]<Infinity){ const p=bb2[1], q=bb2[2]; const Ln=Math.hypot(q[0]-p[0],q[1]-p[1])||1; const ux=(q[0]-p[0])/Ln, uy=(q[1]-p[1])/Ln;
      const a=[p[0]-ux*0.8,p[1]-uy*0.8], b=[q[0]+ux*0.9,q[1]+uy*0.9];
      lines.push({p:[a,b],c:false}); segs.push([a[0],a[1],b[0],b[1]]); }
    addLoop(c.outer);
  }
  return union(strapPolys.concat(inter(strokeLines(lines, RULES.barW), inside)));
}
// Exact import of vector drawings (used for the built-in starter designs): shapes are filled areas with an
// outline stroke, lines are strokes, dots are filled marks. Later items cover earlier ones, as in the drawing.
function clipOpenDiff(lines, region){
  if(!lines.length) return [];
  if(!region.length) return lines;
  const c=new CL.Clipper();
  for(const l of lines){ const p=l.c? l.p.concat([l.p[0]]) : l.p; if(p.length>=2) c.AddPath(toCl(p), CL.PolyType.ptSubject, false); }
  c.AddPaths(region.filter(p=>p.length>2).map(toCl), CL.PolyType.ptClip, true);
  const pt=new CL.PolyTree(); c.Execute(CL.ClipType.ctDifference, pt, NZ, NZ);
  return CL.Clipper.OpenPathsFromPolyTree(pt).map(fromCl).map(p=>{
    const closed=p.length>3 && Math.hypot(p[0][0]-p[p.length-1][0],p[0][1]-p[p.length-1][1])<1e-3;
    return closed?{p:p.slice(0,-1),c:true}:{p,c:false}; });
}
function fromVector(v, lineW){
  const pos=p=>area(p)<0?p.slice().reverse():p;
  v={...v, items:v.items.map(i=>(i.kind==="line"?i:{...i, pts:pos(i.pts)}))};
  const shapes=v.items.filter(i=>i.kind==="shape"||i.kind==="fill").map(i=>i.pts);
  const silPx=largest(union(offset(shapes, v.sw/2, 0.3)));
  const bb=bbox([silPx]); const k=sizeMM()/Math.max(bb.w,bb.h); const cx=bb.x0+bb.w/2, cy=bb.y0+bb.h/2;
  const T=p=>p.map(q=>[(q[0]-cx)*k,(q[1]-cy)*k]);
  // the cookie is the outer contour only: any pinholes where parts meet are filled
  const exs=exPolys(offset(shapes.map(T), v.sw/2*k, 0.02)); let sil=null, sa=0;
  for(const e of exs){ const a=Math.abs(area(e.outer)); if(a>sa){sa=a; sil=e.outer;} }
  // apply the cutter's slot rule first, so lines are placed against the outline that will really be cut
  sil=largest(offset(offset([sil],RULES.notch,0.03),-RULES.notch,0.03))||sil;
  let lines=[], blobs=[];
  v.items.forEach((it,idx)=>{
    const cover=union(v.items.slice(idx+1).filter(j=>j.kind==="shape"||j.kind==="fill").map(j=>T(j.pts)));
    if(it.kind==="fill") return;
    if(it.kind==="dot"){ blobs.push(...(cover.length?diff([T(it.pts)],cover):[T(it.pts)])); return; }
    const l={p:T(it.pts), c:it.kind==="shape"||it.closed};
    lines.push(...clipOpenDiff([l], cover));
  });
  lines=connectLines(lines, sil, lineW, 2.5).map(l=>({p:l.c?dpClosed(l.p,0.02):dp(l.p,0.02), c:l.c}));
  blobs=inter(union(blobs), offset([sil],-1.2,0.03)).filter(p=>Math.abs(area(p))>=RULES.minArea);
  return {outline:dpClosed(sil,0.02), lines, blobs};
}
// Keep a drawing's lines as drawn: drop only what duplicates the outline, and make every line that
// ends near the edge run into it, so the drawing reads as one connected picture (and the cutter's
// inner blades join the outer blade).
function connectLines(lines, sil, lineW, minLen=1.5, band=0.9, reach=3.2){
  const inside=offset([sil], -(lineW/2+band), 0.03);
  let ls=clipOpen(lines, inside);
  const segs=[]; for(let i=0;i<sil.length;i++){const a=sil[i],b=sil[(i+1)%sil.length]; segs.push([a[0],a[1],b[0],b[1]]);}
  const near=p=>{let best=[Infinity]; for(const s2 of segs){ const r=segDist(p[0],p[1],...s2); if(r[0]<best[0]) best=r; } return best;};
  // drop leftovers of a drawn outline: pieces that mostly hug the edge
  const hug=lineW/2+band+1.6;
  ls=ls.filter(l=>{ if(l.c) return true; let n=0; for(const q of l.p) if(near(q)[0]<hug) n++; return n < l.p.length*0.6; });
  const snapD=lineW/2+reach;
  ls=ls.map(l=>{ if(l.c) return l; let p=l.p.slice();
    for(const end of [0,1]){ const q= end? p[p.length-1] : p[0]; const r=near(q);
      if(r[0]<snapD){ const dx=r[1]-q[0], dy=r[2]-q[1], L=Math.hypot(dx,dy)||1; const t=[r[1]+dx/L*0.8, r[2]+dy/L*0.8];
        if(end) p.push(t); else p.unshift(t); } }
    return {p, c:false, e:[near(p[0])[0]<1.2, near(p[p.length-1])[0]<1.2]}; });
  // a short tick from a longer line straight to the edge is a leftover (a label line, a hatch mark), not a divider
  const dTo=(q,l)=>{ let b=Infinity; for(let i=0;i+1<l.p.length;i++){ const r=segDist(q[0],q[1],l.p[i][0],l.p[i][1],l.p[i+1][0],l.p[i+1][1])[0]; if(r<b) b=r; } return b; };
  ls=ls.filter(l=>{ if(l.c||!l.e||l.e[0]===l.e[1]||plen(l.p)>=4.5) return true;
    const free=l.e[0]? l.p[l.p.length-1] : l.p[0];
    return !ls.some(m=>m!==l && plen(m.p)>plen(l.p)*1.5 && dTo(free,m)<lineW+1); });
  ls=ls.map(l=>({p:l.p,c:!!l.c}));
  return ls.filter(l=>l.c ? plen(l.p.concat([l.p[0]]))>=Math.max(3,minLen) : plen(l.p)>=minLen);
}
// Frame: the cookie can be a simple shape with the whole drawing inside it; the figure's own outline
// then becomes an imprint line.
function frameShape(O, kind){
  const bb=bbox([O]); const cx=bb.x0+bb.w/2, cy=bb.y0+bb.h/2, pad=3.2;
  if(kind==="circle"){ let r=0; for(const q of O) r=Math.max(r,Math.hypot(q[0]-cx,q[1]-cy)); return circlePts(cx,cy,r+pad,120); }
  if(kind==="oval"){ const a=bb.w/2, b=bb.h/2; let s=0; for(const q of O) s=Math.max(s,Math.hypot((q[0]-cx)/a,(q[1]-cy)/b));
    const rx=a*s+pad, ry=b*s+pad, P=[]; for(let i=0;i<120;i++){const t=i/120*2*Math.PI; P.push([cx+rx*Math.cos(t), cy+ry*Math.sin(t)]);} return P; }
  if(kind==="plaque"){ const r=Math.min(bb.w,bb.h)*0.22; return largest(offset([[[bb.x0+r,bb.y0+r],[bb.x1-r,bb.y0+r],[bb.x1-r,bb.y1-r],[bb.x0+r,bb.y1-r]]], r+pad, 0.04)); }
  return O;
}
function circlePts(cx,cy,r,n=72){const p=[];for(let i=0;i<n;i++){const a=i/n*2*Math.PI;p.push([cx+r*Math.cos(a),cy+r*Math.sin(a)]);}return p;}
function readyDesign(d){ const r=cutterReady(d); return {...d, outline:r.outline, details:r.details, bars:r.bars, holes:r.holes||[]}; }
function fitSize(d, mm){
  if(!d.outline.length) return;
  const bb=bbox([d.outline]); const s=mm/Math.max(bb.w,bb.h); const cx=bb.x0+bb.w/2, cy=bb.y0+bb.h/2;
  const f=q=>[(q[0]-cx)*s,(q[1]-cy)*s];
  d.outline=d.outline.map(f); d.lines=d.lines.map(l=>({p:l.p.map(f),c:l.c})); d.blobs=d.blobs.map(p=>p.map(f)); if(d.sketch) d.sketch=d.sketch.map(l=>({...l,p:l.p.map(f)})); if(d.holes) d.holes=d.holes.map(p=>p.map(f));
  if(d.img){const x=d.img; x.tx=(x.tx-cx)*s; x.ty=(x.ty-cy)*s; x.k*=s;}
  if(d.art){ d.art.ink=d.art.ink.map(p=>p.map(f)); if(d.art.fills) d.art.fills=d.art.fills.map(x=>({c:x.c,p:x.p.map(p=>p.map(f))})); d.art.w*=s; d.art.resnap=true; d.art.v++; }
}
function fitReady(d, mm){
  fitSize(d, mm);
  const r=cutterReady(d); if(!r.outline.length) return;
  const b=bbox([r.outline]); const m=Math.max(b.w,b.h); if(m>0 && Math.abs(m-mm)>0.3) fitSize(d, mm*mm/m);
}
function applySizeDefaults(d, z){ if(!z) return; d.lineW=z.lineW; d.print.h=z.h; d.print.style=z.style; }

/* ---------------- history ---------------- */
function snap(){return JSON.stringify({o:design.outline,l:design.lines,b:design.blobs,w:design.lineW,img:design.img,s:design.sketch||[],h:design.holes||[],a:design.art?{ink:design.art.ink,w:design.art.w,real:design.art.real,fills:design.art.fills||null}:null});}
function pushHist(){hist.push(snap()); if(hist.length>120) hist.shift(); future=[]; updUndo();}
function restore(s){const v=JSON.parse(s); design.outline=v.o; design.lines=v.l; design.blobs=v.b; design.lineW=v.w; design.img=v.img; design.sketch=v.s||[]; design.holes=v.h||[]; design.art=v.a?{ink:v.a.ink,w:v.a.w,real:v.a.real,fills:v.a.fills||null,v:(artV++),resnap:true}:null; sel=null; selNode=-1; syncLineW(); render(); markDirty();}
function undo(){if(!hist.length)return; future.push(snap()); restore(hist.pop()); updUndo();}
function redo(){if(!future.length)return; hist.push(snap()); restore(future.pop()); updUndo();}
function updUndo(){$("undo").disabled=!hist.length; $("redo").disabled=!future.length;}

/* ---------------- editor rendering ---------------- */
const svg=$("svg");
function el(tag, attrs, parent){const e=document.createElementNS(NS,tag); for(const k in attrs) e.setAttribute(k, attrs[k]); if(parent) parent.appendChild(e); return e;}
function pathD(polys){let s="";for(const p of polys){if(!p||p.length<2)continue;s+="M"+p.map(q=>q[0].toFixed(2)+" "+q[1].toFixed(2)).join("L")+"Z";}return s;}
function lineD(l){ if(!l.p.length) return ""; return "M"+l.p.map(q=>q[0].toFixed(2)+" "+q[1].toFixed(2)).join("L")+(l.c?"Z":""); }
let layers={};
function setupSvg(){
  svg.innerHTML="";
  // shared defs live in their own always-rendered svg, so gallery thumbnails can use them too
  let host=document.getElementById("sharedDefs");
  if(!host){ host=document.createElementNS(NS,"svg"); host.id="sharedDefs"; host.setAttribute("width","0"); host.setAttribute("height","0"); host.style.cssText="position:absolute;width:0;height:0;overflow:hidden"; document.body.appendChild(host); }
  host.innerHTML="";
  const defs=el("defs",{},host);
  const pat=el("pattern",{id:"grid",width:10,height:10,patternUnits:"userSpaceOnUse"},defs);
  el("path",{d:"M10 0H0V10",fill:"none",stroke:"#e3d7c4","stroke-width":0.12},pat);
  defs.innerHTML+=`
  <radialGradient id="dough" cx=".42" cy=".36" r=".8"><stop offset="0" stop-color="#f8dfab"/><stop offset=".55" stop-color="#efc789"/><stop offset="1" stop-color="#d9a05d"/></radialGradient>
  <filter id="soft" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="1.4"/></filter>
  <filter id="edgeBlur" x="-10%" y="-10%" width="120%" height="120%"><feGaussianBlur stdDeviation="1.1"/></filter>
  <filter id="tex" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="1.6" numOctaves="2" seed="3"/><feColorMatrix values="0 0 0 0 0.45  0 0 0 0 0.27  0 0 0 0 0.1  0 0 0 1.2 -0.45"/><feComposite in2="SourceGraphic" operator="in"/></filter>
  <filter id="groove" x="-8%" y="-8%" width="116%" height="116%">
    <feGaussianBlur in="SourceAlpha" stdDeviation="1.5" result="wide"/>
    <feFlood flood-color="#8a4f1c" flood-opacity="0.30"/><feComposite in2="wide" operator="in" result="halo"/>
    <feGaussianBlur in="SourceAlpha" stdDeviation="0.16" result="b"/>
    <feOffset in="b" dx="0.3" dy="0.38" result="o1"/><feComposite in="SourceAlpha" in2="o1" operator="out" result="e1"/>
    <feFlood flood-color="#6a3c14" flood-opacity="0.9"/><feComposite in2="e1" operator="in" result="sh"/>
    <feOffset in="b" dx="-0.3" dy="-0.38" result="o2"/><feComposite in="SourceAlpha" in2="o2" operator="out" result="e2"/>
    <feFlood flood-color="#fff3d8" flood-opacity="0.5"/><feComposite in2="e2" operator="in" result="hi"/>
    <feMerge><feMergeNode in="halo"/><feMergeNode in="SourceGraphic"/><feMergeNode in="sh"/><feMergeNode in="hi"/></feMerge>
  </filter>
  <clipPath id="cookieClip"><path id="cookieClipPath" clip-rule="evenodd"/></clipPath>`;
  layers.grid=el("rect",{x:-1000,y:-1000,width:2000,height:2000,fill:"url(#grid)"},svg);
  layers.cookie=el("g",{"pointer-events":"none"},svg);
  layers.cShadow=el("path",{"fill-rule":"evenodd",fill:"#3b2410",opacity:.28,filter:"url(#soft)",transform:"translate(0.9 1.6)"},layers.cookie);
  layers.cBody=el("path",{"fill-rule":"evenodd",fill:"url(#dough)"},layers.cookie);
  layers.cTex=el("path",{"fill-rule":"evenodd",fill:"#000",filter:"url(#tex)",opacity:.38},layers.cookie);
  layers.cEdge=el("path",{fill:"none",stroke:"#b26c2e","stroke-width":3.2,opacity:.55,filter:"url(#edgeBlur)","clip-path":"url(#cookieClip)"},layers.cookie);
  layers.cGrooveG=el("g",{"clip-path":"url(#cookieClip)"},layers.cookie);
  layers.cGroove=el("path",{fill:"#b9793a",filter:"url(#groove)"},layers.cGrooveG);
  layers.tech=el("g",{},svg);
  layers.frame=el("g",{"pointer-events":"none"},layers.tech);
  layers.wall=el("path",{fill:"#111","fill-rule":"evenodd"},layers.tech);
  layers.outline=el("path",{"fill-rule":"evenodd",fill:"#ff8fbd",stroke:"none"},layers.tech);
  layers.regions=el("g",{"pointer-events":"none"},layers.tech);
  layers.details=el("path",{fill:"#111","fill-rule":"nonzero"},layers.tech);
  layers.art=el("path",{fill:"#111","fill-rule":"nonzero","pointer-events":"none"},layers.tech);
  layers.bars=el("path",{fill:"#111",opacity:0,"pointer-events":"none"},layers.tech);
  layers.img=el("image",{opacity:0.75,preserveAspectRatio:"none","pointer-events":"none"},layers.tech);
  layers.src=el("g",{"pointer-events":"none"},layers.tech);
  layers.hits=el("g",{},svg);
  layers.sel=el("path",{fill:"none",stroke:"#2f6fdb","stroke-width":1.6,"vector-effect":"non-scaling-stroke","pointer-events":"none"},svg);
  layers.nodes=el("g",{},svg);
  layers.pen=el("path",{fill:"none",stroke:"#2f6fdb","stroke-linecap":"round","stroke-linejoin":"round",opacity:.7,"pointer-events":"none"},svg);
}
function applyView(){
  const r=svg.getBoundingClientRect(); if(!r.width) return; const w=r.width/view.ppm, h=r.height/view.ppm;
  svg.setAttribute("viewBox",`${view.cx-w/2} ${view.cy-h/2} ${w} ${h}`);
  renderNodes();
}
function fitView(){
  const r=svg.getBoundingClientRect();
  const im=design.img; const polys=design.outline.length?[design.outline]:(im&&srcImage&&showImage? [[[im.tx,im.ty],[im.tx+im.w*im.k,im.ty+im.h*im.k]]] : [[[-40,-40],[40,40]]]);
  const bb=bbox(polys); view.cx=bb.x0+bb.w/2; view.cy=bb.y0+bb.h/2;
  view.ppm=Math.max(0.5, Math.min((r.width-Math.min(120,r.width*0.22))/Math.max(bb.w,20), (r.height-Math.min(150,r.height*0.36))/Math.max(bb.h,20)));
  applyView();
}
// The drawing made from an uploaded picture ("art"): its ink exactly as drawn, kept apart from the cutter that is derived from it.
// When lines are added, erased, moved or deleted, the ink follows.
let artV=1;
function artSync(){
  const a=design.art; if(!a) return null;
  if(SK().length){ design.art=null; return null; }
  const oKey=JSON.stringify(design.outline), cur=design.lines.map(l=>JSON.stringify([l.p,!!l.c])), curB=design.blobs.map(p=>JSON.stringify(p));
  if(a.resnap||!a.snap){ a.snap=cur; a.bSnap=curB; a.oSnap=oKey; a.resnap=false; return a; }
  if(a.oSnap!==oKey){ design.art=null; return null; }
  const had=new Set(a.snap), has=new Set(cur), hadB=new Set(a.bSnap), hasB=new Set(curB);
  const removed=a.snap.filter(k=>!has.has(k)).map(k=>{const v=JSON.parse(k); return {p:v[0],c:v[1]};});
  const added=cur.filter(k=>!had.has(k)).map(k=>{const v=JSON.parse(k); return {p:v[0],c:v[1]};});
  const remB=a.bSnap.filter(k=>!hasB.has(k)).map(k=>JSON.parse(k)), addB=curB.filter(k=>!hadB.has(k)).map(k=>JSON.parse(k));
  // a line that was only nudged (snapped onto a neighbour, smoothed) is not a change to the drawing
  { const far=(P,Q)=>{ let m=0; for(const q of P){ let b=Infinity; for(let k=0;k+1<Q.length;k++){ const r=segDist(q[0],q[1],Q[k][0],Q[k][1],Q[k+1][0],Q[k+1][1])[0]; if(r<b) b=r; } if(b>m) m=b; } return m; };
    const tol=Math.max(0.8, (a.w||1)*0.9);
    for(let i=removed.length-1;i>=0;i--){ const r=removed[i]; const j=added.findIndex(x=>far(r.p,x.p)<tol && far(x.p,r.p)<tol); if(j>=0){ removed.splice(i,1); added.splice(j,1); } } }
  if(removed.length||added.length||remB.length||addB.length){
    try{ let per=0; for(const p of a.ink) per+=plen(p.concat([p[0]])); const w=Math.max(a.w, per>0? 2*netArea(a.ink)/per : 0); let ink=a.ink;
      // ink that belonged to a removed line goes: every bit of ink near it is given to whichever line it is closest to
      // (a removed one, a line that stays, or the drawing's outer outline), so joins and the outline stay whole
      const W2=w*2.4+0.6;
      const rem=union(strokeLines(removed,W2).concat(remB.length?offset(remB,0.5,0.04):[]));
      let cut=[];
      if(rem.length){
        const keepL=design.lines.filter(l=>!added.some(x=>x.p===l.p)).concat(added);
        const segs=ls=>{ const o=[]; for(const l of ls){ const n=l.p.length; for(let k=0;k+1<n||(l.c&&k<n);k++){ const u=l.p[k], v=l.p[(k+1)%n]; o.push([u[0],u[1],v[0],v[1]]); } } return o; };
        const S_s=segs(keepL), S_o=[];
        // only the parts of the old lines that no line covers any more count as removed
        const S_r=[]; for(const g of segs(removed)){ const n=Math.max(1,Math.ceil(Math.hypot(g[2]-g[0],g[3]-g[1])/0.3));
          for(let k=0;k<n;k++){ const t0=k/n, t1=(k+1)/n, x=g[0]+(g[2]-g[0])*(t0+t1)/2, y=g[1]+(g[3]-g[1])*(t0+t1)/2; let b=Infinity; for(const h of S_s){ const r=segDist(x,y,h[0],h[1],h[2],h[3])[0]; if(r<b){ b=r; if(b<0.3) break; } }
            if(b>=0.3) S_r.push([g[0]+(g[2]-g[0])*t0, g[1]+(g[3]-g[1])*t0, g[0]+(g[2]-g[0])*t1, g[1]+(g[3]-g[1])*t1]); } } for(const O of exPolys(ink).map(e=>e.outer)) for(let k=0;k<O.length;k++){ const u=O[k], v=O[(k+1)%O.length]; S_o.push([u[0],u[1],v[0],v[1]]); }
        const remBlobs=remB.map(p=>p);
        const dmin=(S,x,y)=>{ let b=Infinity; for(const g of S){ const r=segDist(x,y,g[0],g[1],g[2],g[3])[0]; if(r<b) b=r; } return b; };
        const remR=S_r.length? union(strokeLines(S_r.map(g=>({p:[[g[0],g[1]],[g[2],g[3]]],c:false})), W2)) : [];
        const remAll=union(remR.concat(remB.length?offset(remB,0.5,0.04):[])); const zone=remAll.length? inter(ink, offset(remAll, w*0.8, 0.04)) : []; const bb=bbox(zone.length?zone:rem); const res=0.08, pad=0.2;
        const x0=bb.x0-pad, y0=bb.y0-pad, GW=Math.ceil((bb.w+2*pad)/res), GH=Math.ceil((bb.h+2*pad)/res);
        if(zone.length && GW*GH<2.5e6){
          const zex=exPolys(zone), mask=new Uint8Array(GW*GH);
          for(let gy=0;gy<GH;gy++) for(let gx=0;gx<GW;gx++){ const x=x0+(gx+0.5)*res, y=y0+(gy+0.5)*res;
            if(!zex.some(e=>pointInPoly([x,y],e.outer) && !e.holes.some(h=>pointInPoly([x,y],h)))) continue;
            let dr=dmin(S_r,x,y); if(remBlobs.length && remBlobs.some(p=>pointInPoly([x,y],p))) dr=0;
            const ds=dmin(S_s,x,y), dout=a.real? Math.abs(dmin(S_o,x,y)-w/2) : Infinity;
            const dk=Math.min(ds, dout); if(dk <= 0.5*w) continue;   // the body of a line that stays is never cut
            if(dr + 0.3*w < dk || (dr < ds && dout > w*0.9) || (dk > w*0.62+0.15 && dr < w*2.2)) mask[gy*GW+gx]=1; }
          cut=traceLoops(mask,GW,GH).filter(l=>l.length>=4).map(l=>l.map(q=>[x0+q[0]*res, y0+q[1]*res]));
          cut=union(cut);
        }
        if(cut.length){
          ink=diff(ink, offset(cut, 0.04, 0.03));
          // crumbs the cut left behind go too
          const nearCut=offset(cut, w*0.8, 0.05), keep=[];
          const nearCut2=offset(cut, w*3, 0.05);
          for(const e of exPolys(ink)){ if(exArea(e) < 8*w*w && netArea(inter([e.outer], nearCut2)) > 0.3*Math.abs(area(e.outer))) continue; keep.push(e); }
          ink=flatEx(keep);
          const zn=inter(ink, nearCut); if(zn.length){ const r=0.3*w; let z=offset(offset(zn,-r,0.03),r,0.03); z=offset(offset(z,0.25*w,0.03),-0.25*w,0.03); ink=union(diff(ink, nearCut).concat(inter(z, offset(zn,0.02,0.03)))); }
        }
      }
      // a piece left over from rubbing out part of a line is already drawn: only new lines add ink
      const fresh=added.filter(x=>!removed.some(r=>{ let ok=true; for(const q of x.p){ let b=Infinity; for(let k=0;k+1<r.p.length||(r.c&&k<r.p.length);k++){ const u=r.p[k], v=r.p[(k+1)%r.p.length]; const d2=segDist(q[0],q[1],u[0],u[1],v[0],v[1])[0]; if(d2<b) b=d2; } if(b>0.3){ ok=false; break; } } return ok; }));
      let add=a.noAdd? [] : strokeLines(fresh,w).concat(addB);   // tidying a fresh trace only ever takes ink away
      if(add.length){ add=inter(union(add), [design.outline]); ink=union(ink.concat(add)); } // nothing pokes out of the drawing
      a.ink=ink.filter(p=>Math.abs(area(p))>=0.2); a.v=(artV++);
    }catch(err){ console.warn(err); }
    a.snap=cur; a.bSnap=curB;
  }
  return a;
}
// The drawing keeps the picture's colours: each area between the lines is filled with the colour found there.
let regKey="", regVal=[], regPix=null, regPixSrc=null;
function regionFills(R, art){
  if(!design.img || !srcImage || !R.outline || !R.outline.length) return art&&art.fills ? art.fills.map(f=>({d:pathD(f.p), fill:f.c})) : [];
  const key=readyKey+"|"+srcURL.length+"|"+JSON.stringify(design.img)+"|"+(art?art.v+":"+art.ink.length:"-");
  if(key===regKey) return regVal;
  if(regPixSrc!==srcImage){ const iw=srcImage.naturalWidth, ih=srcImage.naturalHeight, sc=Math.min(1,420/Math.max(iw,ih));
    const cv=document.createElement("canvas"); cv.width=Math.max(1,Math.round(iw*sc)); cv.height=Math.max(1,Math.round(ih*sc));
    const g=cv.getContext("2d",{willReadFrequently:true}); g.fillStyle="#fff"; g.fillRect(0,0,cv.width,cv.height); g.drawImage(srcImage,0,0,cv.width,cv.height);
    regPix={d:g.getImageData(0,0,cv.width,cv.height).data, w:cv.width, h:cv.height, sc}; regPixSrc=srcImage; }
  const P=regPix, x=design.img, out=[];
  let regs=[];
  try{ let base=[R.outline], cutP=R.details||[];
    if(art){ cutP=art.ink; const outer=exPolys(art.ink).map(e=>e.outer); const b2=inter([design.outline], outer);
      base = netArea(b2) > 0.6*Math.abs(area(design.outline)) ? outer : [design.outline]; }
    regs=exPolys(diff(base, cutP)); }catch(e){ regs=[]; }
  const med=a=>{ a.sort((p,q)=>p-q); return a[a.length>>1]; };
  for(const e of regs){ const A=exArea(e); if(A<0.4) continue;
    const bb=bbox([e.outer]); const step=Math.max(0.25, Math.sqrt(A)/14); const rs=[],gs=[],bs=[];
    for(let yy=bb.y0+step/2; yy<bb.y1; yy+=step) for(let xx=bb.x0+step/2; xx<bb.x1; xx+=step){
      const q=[xx,yy]; if(!pointInPoly(q,e.outer) || e.holes.some(h=>pointInPoly(q,h))) continue;
      const ix=Math.round((xx-x.tx)/x.k*P.sc), iy=Math.round((yy-x.ty)/x.k*P.sc); if(ix<0||iy<0||ix>=P.w||iy>=P.h) continue;
      const i=(iy*P.w+ix)*4; const r=P.d[i], g2=P.d[i+1], b=P.d[i+2];
      if(0.299*r+0.587*g2+0.114*b<50) continue;      // drawn ink, not paint
      rs.push(r); gs.push(g2); bs.push(b); }
    if(rs.length<2) continue;
    out.push({d:pathD([e.outer].concat(e.holes)), fill:`rgb(${med(rs)},${med(gs)},${med(bs)})`, p:[e.outer].concat(e.holes)}); }
  if(art) art.fills=out.map(f=>({c:f.fill, p:f.p}));
  regKey=key; regVal=out; return out;
}
let startSeen=false;   // the start card stays until the person draws, uploads or taps Draw
let fastRender=false;
function render(){
  const o=design.outline;
  const R = fastRender ? {outline:o, details:union(strokeLines(design.lines,design.lineW).concat(design.blobs)), bars:[], fixes:null} : cutterReady(design);
  const ro=R.outline; const rh=(R.holes||[]);
  layers.outline.setAttribute("d", ro.length?pathD([ro].concat(rh)):"");
  layers.details.setAttribute("d", pathD(R.details));
  const art = cookieView ? null : (fastRender ? design.art : artSync());
  if(!fastRender){ layers.regions.innerHTML=""; if(!cookieView && !showImage){ for(const f of regionFills(R, art)) el("path",{d:f.d,fill:f.fill,"fill-rule":"evenodd",stroke:f.fill,"stroke-width":art?0.3:0.5,"stroke-linejoin":"round"},layers.regions); } }
  layers.art.setAttribute("d", art? pathD(art.ink) : "");
  if(art && !fastRender) layers.details.setAttribute("d","");
  layers.outline.setAttribute("fill", art? (showImage?"none":"#fff") : "#ff8fbd");
  const od=ro.length?pathD([ro].concat(rh)):"";
  layers.cShadow.setAttribute("d",od); layers.cBody.setAttribute("d",od); layers.cTex.setAttribute("d",od); layers.cEdge.setAttribute("d",od);
  document.getElementById("cookieClipPath").setAttribute("d",od);
  layers.cGroove.setAttribute("d", pathD(R.details));
  layers.cookie.style.display = cookieView ? "" : "none";
  layers.tech.style.display = cookieView ? "none" : "";
  layers.grid.style.display = cookieView ? "none" : "";
  layers.hits.style.display = cookieView ? "none" : "";
  layers.bars.setAttribute("d", pathD(R.bars||[]));
  try{ layers.wall.setAttribute("d", ro.length?pathD(offset([ro], design.print.base, 0.05).concat([ro.slice().reverse()]).concat(rh).concat(rh.length?offset(rh,-design.print.base,0.05):[])):""); }catch(e){ layers.wall.setAttribute("d",""); }
  if(art){ try{ layers.wall.setAttribute("d", art.real? pathD(diff([design.outline], offset([design.outline], -(art.vector?1.4:Math.max(0.6,art.w*0.9)), 0.04))) : ""); }catch(e){ layers.wall.setAttribute("d",""); } }
  // raw source (dashed) so people can see what the rules changed
  layers.src.innerHTML="";
  if(!fastRender && o.length && !art){
    el("path",{d:pathD([o]),fill:"none",stroke:"#111","stroke-width":1,"stroke-dasharray":"3 3","vector-effect":"non-scaling-stroke",opacity:.25},layers.src);
  }
  if(SK().length){
    el("path",{d:design.sketch.map(lineD).join(""),fill:"none",stroke:"#111","stroke-width":design.lineW,"stroke-linecap":"round","stroke-linejoin":"round",opacity:o.length?.16:.9},layers.src);
  }
  // hit targets
  layers.hits.innerHTML="";
  if(o.length) el("path",{d:pathD([o]),fill:"transparent",stroke:"transparent","stroke-width":10,"vector-effect":"non-scaling-stroke","data-kind":"outline"},layers.hits);
  design.blobs.forEach((p,i)=>el("path",{d:pathD([p]),fill:"transparent",stroke:"transparent","stroke-width":8,"vector-effect":"non-scaling-stroke","data-kind":"blob","data-i":i},layers.hits));
  (design.holes||[]).forEach((p,i)=>el("path",{d:pathD([p]),fill:"transparent",stroke:"transparent","stroke-width":8,"vector-effect":"non-scaling-stroke","data-kind":"hole","data-i":i},layers.hits));
  design.lines.forEach((l,i)=>el("path",{d:lineD(l),fill:"none",stroke:"transparent","stroke-width":Math.max(design.lineW,10/view.ppm),"stroke-linecap":"round","stroke-linejoin":"round","data-kind":"line","data-i":i,"pointer-events":"stroke"},layers.hits));
  if(design.img && srcURL && showImage){
    const x=design.img; layers.img.setAttribute("href",srcURL);
    layers.img.setAttribute("x",x.tx); layers.img.setAttribute("y",x.ty);
    layers.img.setAttribute("width",x.w*x.k); layers.img.setAttribute("height",x.h*x.k);
    layers.img.style.display=""; layers.img.setAttribute("opacity", design.art? .75 : .4); layers.outline.setAttribute("fill-opacity", design.art? .18 : .12);
  } else { layers.img.style.display="none"; layers.outline.setAttribute("fill-opacity",1); }
  { const tm=$("traceMore"); if(tm) tm.hidden=!srcImage; } $("imgToggle").hidden=!(design.img&&srcURL);
  $("empty").style.display = (o.length||design.lines.length||SK().length||startSeen)?"none":"";
  if(R.fixes){ renderCheck(R.fixes, R.warns, ro.length>0, R); renderCoach(R); }
  renderFrame(); renderNodes(); renderSelbar(); updDims();
}
function renderFrame(){
  layers.frame.innerHTML="";
  const z=sizeObj(); if(!z) return; if(!design.outline.length && tool!=="pen" && !SK().length) return;
  const bb=design.outline.length?bbox([design.outline]):{x0:-1,y0:-1,w:2,h:2}; const cx=bb.x0+bb.w/2, cy=bb.y0+bb.h/2, h=z.mm/2;
  el("rect",{x:cx-h,y:cy-h,width:z.mm,height:z.mm,rx:4,fill:"none",stroke:"#ff4f9a","stroke-width":1,"stroke-dasharray":"6 5","vector-effect":"non-scaling-stroke",opacity:.5},layers.frame);
  const t=el("text",{x:cx-h,y:cy-h-z.mm*0.015,fill:"#111","font-size":z.mm*0.035,"font-family":"Space Mono,monospace",opacity:.85},layers.frame); t.textContent=`${z.label} · ${z.mm/10} cm`;
}
let checkShut=false;
function renderCheck(fixes, warns, has, R){
  const c=$("check"); const k=coach(R||{outline:[]});
  if(!has && !SK().length){ c.style.display="none"; return; }
  c.style.display="";
  const head = has ? "✓ Works" : "Keep going";
  let line="";
  if(!has) line="Close the shape.";
  else { const w=k.tips.find(t=>t[0]!=="ok"); const fx=(sketchInfo.auto&&SK().length?[sketchInfo.auto]:[]).concat(fixes).slice(0,2);
    line = w ? w[1] : fx.length ? "Fixed: "+fx.join(", ")+"." : ""; }
  c.classList.toggle("shut", checkShut);
  if(checkShut){ c.innerHTML=`<button class="chip" aria-label="Show cutter check">${has?"✓":"…"}</button>`; c.firstChild.onclick=()=>{ checkShut=false; render(); }; return; }
  c.innerHTML=`<b>${head}</b><button class="x" aria-label="Hide this">×</button>`+(line?`<span${has&&k.tips.some(t=>t[0]==="warn")?' class="warn"':''}></span>`:"");
  if(line) c.lastChild.textContent=line;
  c.querySelector(".x").onclick=()=>{ checkShut=true; render(); };
  if(has && aiCanRemove()){ const b=document.createElement("button"); b.className="act"; b.textContent=`Remove ${aiResult.remove.length} extra line${aiResult.remove.length>1?"s":""}`; b.onclick=aiRemove; c.appendChild(b); }
}
function selObj(){ if(!sel) return null; if(sel.kind==="outline") return {p:design.outline,c:true}; if(sel.kind==="line") return design.lines[sel.i]; if(sel.kind==="blob") return {p:design.blobs[sel.i],c:true}; if(sel.kind==="hole") return design.holes[sel.i]?{p:design.holes[sel.i],c:true}:null; return null; }
function renderNodes(){
  layers.nodes.innerHTML="";
  if(cookieView){ layers.sel.setAttribute("d",""); return; }
  const o=selObj();
  if(!o||!o.p){layers.sel.setAttribute("d","");return;}
  layers.sel.setAttribute("d", sel.kind==="line"? lineD(o) : pathD([o.p]));
  const r=4.5/view.ppm;
  if(o.p.length>1500) return;
  o.p.forEach((q,i)=>el("circle",{cx:q[0],cy:q[1],r:i===selNode?r*1.5:r,fill:i===selNode?"#2f6fdb":"#fff",stroke:"#2f6fdb","stroke-width":1.4,"vector-effect":"non-scaling-stroke","data-node":i,style:"cursor:move"},layers.nodes));
}
function updDims(){
  if(!design.outline.length){$("dims").style.display="none";return;}
  $("dims").style.display="";
  const ro=cutterReady(design).outline; const bb=bbox([ro.length?ro:design.outline]);
  $("dims").textContent=`${bb.w.toFixed(0)} × ${bb.h.toFixed(0)} mm`;
  $("widthMm").value=Math.round(Math.max(bb.w,bb.h));
}
const hints={
  select:"Tap a line to move it, reshape it or delete it. Use the pen to add a line and the eraser to rub part of one out.",
  pen:"",
  erase:"Rub over any part of a line to remove just that part."
};
function renderSelbar(){
  const b=$("selbar"); b.innerHTML="";
  const mk=(t,f,title,cls)=>{const x=document.createElement("button");x.textContent=t;if(title)x.title=title;if(cls)x.className=cls;x.onclick=f;b.appendChild(x);return x;};
  if(tool==="pen"){
    b.classList.add("show");
    if(pendingLoop && SK().indexOf(pendingLoop)>=0){
      const lab=document.createElement("span"); lab.className="lbl"; lab.textContent="This shape is a"; b.appendChild(lab);
      const seg=document.createElement("div"); seg.className="seg"; seg.style.margin="0"; const cur=pendingLoop.kind||"line";
      [["line","Line"],["area","Pressed area"],["hole","Cut-out hole"]].forEach(([k,l])=>{const x=document.createElement("button");x.textContent=l;if(cur===k)x.classList.add("on");x.onclick=()=>setLoopKind(k);seg.appendChild(x);});
      b.appendChild(seg); return;
    }
    const lab=document.createElement("span"); lab.className="lbl"; lab.textContent= !SK().length&&design.outline.length ? "Draw lines inside the cookie." : design.outline.length ? (SK().some(l=>l.c&&!l.shape&&Math.abs(area(l.p))<0.7*Math.abs(area(design.outline))) ? "Tap a shape to change it." : "Keep drawing.") : SK().length ? "Close the shape." : (traceMode() ? "Trace over the picture." : "Draw here."); b.appendChild(lab);
    if(traceMode() && !SK().length) mk(redrawURL()? "Make the drawing for me" : "Make the lines for me", ()=>{ if(redrawURL()) redraw(); else autoTrace(); }, "Turn the picture into a drawing automatically");
    if(SK().length && !design.outline.length) mk("Wrap a cookie around it",wrapCookie,"Make a cookie shape around what you drew","primary");
    if(SK().length) mk("Clear drawing",()=>{ pushHist(); design.sketch=[]; design.outline=[]; design.lines=[]; design.blobs=[]; render(); markDirty(); },"","clr");
    return;
  }
  if(!sel){
    if(design.art && origImage && redrawnFrom===origURL && !cookieView && !mode3d){ b.classList.add("show");
      const lab=document.createElement("span"); lab.className="lbl"; lab.textContent=(design.art&&design.art.busy)? "Very detailed picture: try Draw it again, or a simpler picture." : (design.art&&design.art.thin)? "Some parts are very thin and may break: try Draw it again." : "Drawing made from your picture."; b.appendChild(lab);
      mk("Draw it again", ()=>{ if(origImage){ srcImage=origImage; srcURL=origURL; } redraw(); }, "Make a new drawing from your picture");
      mk("Trace it myself", traceOriginal, "Go back to your picture and trace it yourself"); return; }
    b.classList.remove("show");return;}
  b.classList.add("show");
  const lab=document.createElement("span"); lab.className="lbl"; lab.textContent= {outline:"Outline",line:"Line",blob:"Pressed area",hole:"Hole"}[sel.kind]; b.appendChild(lab);
  { const o=selObj(); const loop = o && sel.kind!=="outline" && (sel.kind!=="line" || isLoop(o));
    if(loop){ const seg=document.createElement("div"); seg.className="seg"; seg.style.margin="0";
      [["line","Line"],["blob","Pressed area"],["hole","Cut-out hole"]].forEach(([k,l])=>{const x=document.createElement("button");x.textContent=l;if(sel.kind===k)x.classList.add("on");x.onclick=()=>convertSel(k);seg.appendChild(x);});
      b.appendChild(seg); } }
  mk("Smooth",()=>modSel(o=>({p:o.c?dpClosed(smoothClosed(chaikin(o.p,true),1,1),0.04):dp(smoothOpen(chaikin(o.p,false),1,1),0.04),c:o.c})),"Round off corners");
  mk("Fewer points",()=>modSel(o=>({p:o.c?dpClosed(o.p,0.25):dp(o.p,0.25),c:o.c})),"Simplify");
  mk("−",()=>xformSel(0.95,0),"Shrink 5%"); mk("+",()=>xformSel(1.05,0),"Grow 5%");
  mk("⟲",()=>xformSel(1,-15),"Rotate left 15°"); mk("⟳",()=>xformSel(1,15),"Rotate right 15°");
  if(sel.kind==="outline") mk("Wrap around lines",outlineFromDetails,"Rebuild the outline around the stamp lines");
  if(sel.kind!=="outline") mk("Delete",deleteSel);
}
function isLoop(l){ if(!l||!l.p||l.p.length<4) return false; if(l.c) return true; const a=l.p[0], b=l.p[l.p.length-1]; return plen(l.p)>6 && Math.hypot(a[0]-b[0],a[1]-b[1])<2; }
function convertSel(k){
  const o=selObj(); if(!o || sel.kind===k) return; pushHist(); design.sketch=[];
  let p=o.p.slice(); if(!o.c && sel.kind==="line"){ p=p.slice(0,-1); }
  if(sel.kind==="line") design.lines.splice(sel.i,1); else if(sel.kind==="hole") design.holes.splice(sel.i,1); else design.blobs.splice(sel.i,1);
  if(k==="line"){ design.lines.push({p,c:true}); sel={kind:"line",i:design.lines.length-1}; }
  else if(k==="hole"){ H_().push(p); sel={kind:"hole",i:design.holes.length-1}; if(design.print.style!=="one"){ design.print.style="one"; loadPrint(); } }
  else { design.blobs.push(p); sel={kind:"blob",i:design.blobs.length-1}; }
  selNode=-1; render(); markDirty();
}
function H_(){ return design.holes||(design.holes=[]); }
function setSelObj(o){ if(sel.kind==="outline") design.outline=o.p; else if(sel.kind==="line") design.lines[sel.i]=o; else if(sel.kind==="hole") design.holes[sel.i]=o.p; else design.blobs[sel.i]=o.p; }
function modSel(f){const o=selObj(); if(!o)return; pushHist(); design.sketch=[]; const q=f(o); if(q.p.length<2)return; setSelObj(q); selNode=-1; render(); markDirty();}
function xformSel(s, deg){
  const o=selObj(); if(!o)return; pushHist(); design.sketch=[];
  const bb=bbox([o.p]), cx=bb.x0+bb.w/2, cy=bb.y0+bb.h/2, a=deg*Math.PI/180, c=Math.cos(a), si=Math.sin(a);
  const f=q=>{const x=(q[0]-cx)*s,y=(q[1]-cy)*s;return [cx+x*c-y*si, cy+x*si+y*c];};
  if(sel.kind==="outline"){
    design.outline=design.outline.map(f); design.lines=design.lines.map(l=>({p:l.p.map(f),c:l.c})); design.blobs=design.blobs.map(p=>p.map(f)); design.holes=(design.holes||[]).map(p=>p.map(f));
    if(design.img && deg===0){const x=design.img; x.tx=cx+(x.tx-cx)*s; x.ty=cy+(x.ty-cy)*s; x.k*=s;}
    if(deg!==0) design.img=null;
  } else setSelObj({p:o.p.map(f),c:o.c});
  render(); markDirty();
}
function deleteSel(){
  if(!sel) return;
  if(sel.kind==="outline"){ toast("The outline can't be deleted. Draw a new one with the pen."); return; }
  pushHist(); design.sketch=[]; if(sel.kind==="line") design.lines.splice(sel.i,1); else if(sel.kind==="hole") design.holes.splice(sel.i,1); else design.blobs.splice(sel.i,1);
  sel=null; selNode=-1; render(); markDirty();
}
function outlineFromDetails(){
  if(!design.lines.length && !design.blobs.length){toast("Draw some stamp lines first.");return;}
  pushHist();
  const det=union(strokeLines(design.lines,design.lineW).concat(design.blobs));
  const u=offset(det.concat(design.outline.length?[design.outline]:[]), RULES.edge+1.5, 0.05);
  const L=largest(union(u)); if(L){design.outline=dpClosed(L,0.06);} render(); markDirty();
}

/* ---------------- pointer interaction ---------------- */
function toMM(e){const pt=svg.createSVGPoint(); pt.x=e.clientX; pt.y=e.clientY; const r=pt.matrixTransform(svg.getScreenCTM().inverse()); return [r.x,r.y];}
let drag=null, spaceDown=false;
const touches=new Map();
function pinchState(){ const p=[...touches.values()]; const r=svg.getBoundingClientRect(); const mx=(p[0].x+p[1].x)/2-r.left, my=(p[0].y+p[1].y)/2-r.top; return {d:Math.hypot(p[0].x-p[1].x,p[0].y-p[1].y)||1, mx, my, w:r.width, h:r.height}; }
svg.addEventListener("pointerdown", e=>{
  if(e.pointerType==="touch"){ touches.set(e.pointerId,{x:e.clientX,y:e.clientY});
    if(touches.size===2){ // second finger: drop the stroke that the first finger started, then zoom and pan
      if(drag && drag.type==="pen") layers.pen.setAttribute("d","");
      if(drag && (drag.type==="erase"||drag.type==="node"||(drag.type==="move"&&drag.pushed))){ if(drag.type==="erase"&&!drag.n){hist.pop();updUndo();} }
      const st=pinchState(); drag={type:"pinch", d0:st.d, ppm0:view.ppm, ax:view.cx+(st.mx-st.w/2)/view.ppm, ay:view.cy+(st.my-st.h/2)/view.ppm}; return; }
    if(touches.size>2) return; }
  if(e.button===1 || (e.button===0 && spaceDown)){ drag={type:"pan",sx:e.clientX,sy:e.clientY,cx:view.cx,cy:view.cy}; svg.setPointerCapture(e.pointerId); return; }
  if(e.button!==0) return;
  const m=toMM(e); const t=e.target;
  if(cookieView){ drag={type:"pan",sx:e.clientX,sy:e.clientY,cx:view.cx,cy:view.cy,click:true}; svg.setPointerCapture(e.pointerId); return; }
  if(tool==="pen" && !startSeen){ startSeen=true; render(); }
  if(tool==="pen"){ drag={type:"pen",pts:[m],cur:m}; svg.setPointerCapture(e.pointerId); return; }
  if(tool==="erase"){ pushHist(); drag={type:"erase",n:0}; eraseAt(e); svg.setPointerCapture(e.pointerId); return; }
  if(t.dataset && t.dataset.node!==undefined){ selNode=+t.dataset.node; pushHist(); drag={type:"node",moved:false}; svg.setPointerCapture(e.pointerId); renderNodes(); return; }
  if(t.dataset && t.dataset.kind){
    const ns = t.dataset.kind==="outline"?{kind:"outline"}:{kind:t.dataset.kind,i:+t.dataset.i};
    const same = sel && sel.kind===ns.kind && sel.i===ns.i;
    sel=ns; if(!same) selNode=-1;
    drag={type:"move",start:m,last:m,pushed:false}; svg.setPointerCapture(e.pointerId); renderNodes(); renderSelbar(); return;
  }
  sel=null; selNode=-1; renderNodes(); renderSelbar();
  drag={type:"pan",sx:e.clientX,sy:e.clientY,cx:view.cx,cy:view.cy}; svg.setPointerCapture(e.pointerId);
});
svg.addEventListener("pointermove", e=>{
  if(e.pointerType==="touch" && touches.has(e.pointerId)) touches.set(e.pointerId,{x:e.clientX,y:e.clientY});
  if(!drag) return;
  if(drag.type==="pinch"){ if(touches.size<2) return; const st=pinchState(); const np=Math.max(0.3,Math.min(80,drag.ppm0*st.d/drag.d0)); view.ppm=np; view.cx=drag.ax-(st.mx-st.w/2)/np; view.cy=drag.ay-(st.my-st.h/2)/np; applyView(); return; }
  if(drag.type==="pan"){ view.cx=drag.cx-(e.clientX-drag.sx)/view.ppm; view.cy=drag.cy-(e.clientY-drag.sy)/view.ppm; applyView(); return; }
  const m=toMM(e);
  if(drag.type==="pen"){ const l=drag.pts[drag.pts.length-1]; drag.cur=m; const dd=Math.hypot(m[0]-l[0],m[1]-l[1]), lag=Math.max(0.8, 7/view.ppm); if(dd>lag){ const f=(dd-lag)/dd; drag.pts.push([l[0]+(m[0]-l[0])*f, l[1]+(m[1]-l[1])*f]);
      layers.pen.setAttribute("d","M"+drag.pts.map(q=>q[0]+" "+q[1]).join("L")); layers.pen.setAttribute("stroke-width", design.lineW);} return; }
  if(drag.type==="erase"){ eraseAt(e); return; }
  if(drag.type==="node"){ const o=selObj(); if(o){o.p[selNode]=m; drag.moved=true; design.sketch=[]; liveRender();} return; }
  if(drag.type==="move"){
    const dx=m[0]-drag.last[0], dy=m[1]-drag.last[1]; if(!drag.pushed && Math.hypot(m[0]-drag.start[0],m[1]-drag.start[1])*view.ppm<3) return;
    if(!drag.pushed){pushHist(); drag.pushed=true; design.sketch=[];}
    drag.last=m; const mv=q=>[q[0]+dx,q[1]+dy];
    if(sel.kind==="outline"){ design.outline=design.outline.map(mv); design.lines=design.lines.map(l=>({p:l.p.map(mv),c:l.c})); design.blobs=design.blobs.map(p=>p.map(mv)); design.holes=(design.holes||[]).map(p=>p.map(mv)); if(design.img){design.img.tx+=dx;design.img.ty+=dy;} }
    else if(sel.kind==="hole") design.holes[sel.i]=design.holes[sel.i].map(mv);
    else if(sel.kind==="line") design.lines[sel.i]={p:design.lines[sel.i].p.map(mv),c:design.lines[sel.i].c};
    else design.blobs[sel.i]=design.blobs[sel.i].map(mv);
    liveRender();
  }
});
let liveRaf=0; function liveRender(){ if(liveRaf) return; liveRaf=requestAnimationFrame(()=>{liveRaf=0; fastRender=true; render(); fastRender=false;}); }
function endDrag(e){
  if(e && e.pointerType==="touch") touches.delete(e.pointerId);
  if(drag && drag.type==="pinch"){ if(touches.size===0) drag=null; return; }
  if(!drag) return; const d=drag; drag=null;
  if(d.type==="pen"){ layers.pen.setAttribute("d",""); if(d.pts.length>1 && d.cur) d.pts.push(d.cur); finishPen(d.pts); }
  if(d.type==="pan" && d.click && Math.abs(view.cx-d.cx)+Math.abs(view.cy-d.cy)<0.5 && design.outline.length){ setView("edit"); if(innerWidth>860) toast("Edit view: click a shape to change it"); }
  if(d.type==="node"){ if(!d.moved){ hist.pop(); updUndo(); } else { render(); markDirty(); } }
  if(d.type==="move" && d.pushed){ render(); markDirty(); }
  if(d.type==="erase"){ if(!d.n){hist.pop(); updUndo();} else markDirty(); }
}
svg.addEventListener("pointerup", endDrag); svg.addEventListener("pointercancel", endDrag);
function eraseAt(e){
  if(SK().length){ const m=toMM(e), r=Math.max(1.6, 9/view.ppm); let ch=false; const out=[];
    for(const l of design.sketch){ const P=resample(l.c?l.p.concat([l.p[0]]):l.p, 0.6); let cur=[], hit=false;
      for(const q of P){ if(Math.hypot(q[0]-m[0],q[1]-m[1])<r){ hit=true; if(cur.length>1) out.push({p:dp(cur,0.05),c:false}); cur=[]; } else cur.push(q); }
      if(!hit){ out.push(l); continue; } ch=true; if(cur.length>1) out.push({p:dp(cur,0.05),c:false}); }
    if(ch){ design.sketch=out; drag.n++; sketchBuild(); sel=null; render(); } return; }
  // lines: rub out only the part under the eraser
  { const m=toMM(e), r=Math.max(1.2, 9/view.ppm); let ch=false; const out=[];
    for(const l of design.lines){ const P=resample(l.c?l.p.concat([l.p[0]]):l.p, 0.4);
      if(!P.some(q=>Math.hypot(q[0]-m[0],q[1]-m[1])<r)){ out.push(l); continue; }
      ch=true; let cur=[]; const pieces=[];
      for(const q of P){ if(Math.hypot(q[0]-m[0],q[1]-m[1])<r){ if(cur.length>1) pieces.push(cur); cur=[]; } else cur.push(q); }
      if(cur.length>1) pieces.push(cur);
      if(l.c && pieces.length>=2){ const a=pieces[0], z=pieces[pieces.length-1]; if(Math.hypot(a[0][0]-P[0][0],a[0][1]-P[0][1])<1e-6 && Math.hypot(z[z.length-1][0]-P[P.length-1][0],z[z.length-1][1]-P[P.length-1][1])<1e-6){ pieces[0]=z.concat(a.slice(1)); pieces.pop(); } }
      for(const pc of pieces) if(plen(pc)>=1.2) out.push({p:dp(pc,0.05),c:false}); }
    const nb=design.blobs.filter(p=>!(pointInPoly(m,p) || p.some(q=>Math.hypot(q[0]-m[0],q[1]-m[1])<r))); if(nb.length!==design.blobs.length) ch=true;
    if(ch){ design.lines=out; design.blobs=nb; drag.n++; sel=null; render(); } }
}
svg.addEventListener("dblclick", e=>{
  if(tool!=="select") return; const o=selObj(); if(!o) return; const m=toMM(e); const p=o.p;
  let bi=-1,bd=Infinity; const n=o.c?p.length:p.length-1;
  for(let i=0;i<n;i++){const a=p[i],b=p[(i+1)%p.length]; const r=segDist(m[0],m[1],a[0],a[1],b[0],b[1]); if(r[0]<bd){bd=r[0];bi=i;}}
  if(bd*view.ppm>14) return;
  pushHist(); design.sketch=[]; p.splice(bi+1,0,m); selNode=bi+1; render(); markDirty();
});
svg.addEventListener("wheel", e=>{
  e.preventDefault(); const m=toMM(e); const f=Math.exp(-e.deltaY*0.0015);
  const np=Math.max(0.3,Math.min(80,view.ppm*f)); const k=view.ppm/np;
  view.cx=m[0]+(view.cx-m[0])*k; view.cy=m[1]+(view.cy-m[1])*k; view.ppm=np; applyView();
},{passive:false});
function finishPen(pts){
  if(pts.length<1) return;
  const w=design.lineW;
  let line = pts.length<3 ? [pts[0],pts[0]] : smoothStroke(pts);
  const L=plen(line);
  const closed = line.length>4 && L>8 && Math.hypot(line[0][0]-line[line.length-1][0],line[0][1]-line[line.length-1][1]) < Math.max(5,w*3.5);
  if(closed){ line=dpClosed(smoothClosed(resample(line.slice(0,-1).concat([line[0]]),0.5).slice(0,-1),5,3),0.05); }
  if(SK().length && L<1){ // a tap on a closed shape brings back its line / pressed area / hole switch
    const m=pts[0], r=Math.max(2, 12/view.ppm); let hit=null, bd=r;
    for(const l of design.sketch){ if(!l.c||l.shape) continue; const P=l.p.concat([l.p[0]]); for(let k=1;k<P.length;k++){ const d=segDist(m[0],m[1],P[k-1][0],P[k-1][1],P[k][0],P[k][1])[0]; if(d<bd){bd=d;hit=l;} } }
    if(hit){ pendingLoop=hit; renderSelbar(); return; }
  }
  if(SK().length || !design.outline.length){
    const inside = closed && design.outline.length>2 && line.every(q=>pointInPoly(q,design.outline));
    pushHist(); design.sketch.push({p:line,c:closed}); pendingLoop = inside ? design.sketch[design.sketch.length-1] : null; sketchBuild(); render(); markDirty(); return;
  }
  // a traced or edited cookie: the pen adds stamp lines inside it
  if(L<1){ if(!pointInPoly(pts[0],design.outline)){ toast("Draw inside the cookie."); return; } pushHist(); design.blobs.push(circlePts(pts[0][0],pts[0][1],Math.max(0.9,w*0.8),20)); render(); markDirty(); return; }
  const got=connectLines([{p:resample(closed?line.concat([line[0]]):line,0.7),c:false}], design.outline, w, 1.5).map(l=>({p:dp(smoothOpen(resample(l.p,0.6),4,2),0.015),c:false}));
  if(!got.length){ toast("Draw inside the cookie. To start a new drawing, press New."); return; }
  pushHist(); design.lines.push(...got); render(); markDirty();
}
/* ---------------- just draw: the sketch is the source, the cookie is worked out from it ---------------- */
let pendingLoop=null;
function setLoopKind(k){ if(!pendingLoop || SK().indexOf(pendingLoop)<0) return; pushHist(); const i=design.sketch.indexOf(pendingLoop); const n={...pendingLoop}; if(k==='line') delete n.kind; else n.kind=k; design.sketch[i]=n; pendingLoop=n; if(k==='hole' && design.print.style!=='one'){ design.print.style='one'; loadPrint(); } sketchBuild(); render(); markDirty(); }
function smoothStroke(pts){
  const R=resample(pts,0.4); const L=plen(R); if(L<1.5) return [pts[0],pts[pts.length-1]];
  // nearly straight strokes become straight
  const a=R[0], b=R[R.length-1]; let dev=0; for(const q of R){ const d=segDist(q[0],q[1],a[0],a[1],b[0],b[1])[0]; if(d>dev) dev=d; }
  if(L>6 && dev<Math.max(0.5,L*0.025)) return [a,b];
  const k=Math.max(2,Math.min(7,Math.round(L/12)+2));
  return dp(smoothOpen(R,k,3),0.015);
}
function SK(){ return design.sketch||(design.sketch=[]); }
function resample(p, step){ if(p.length<2) return p.slice(); const out=[p[0]];
  for(let i=1;i<p.length;i++){ const a=p[i-1], b=p[i]; const d=Math.hypot(b[0]-a[0],b[1]-a[1]); const n=Math.max(1,Math.ceil(d/step)); for(let k=1;k<=n;k++) out.push([a[0]+(b[0]-a[0])*k/n, a[1]+(b[1]-a[1])*k/n]); }
  return out; }
let sketchInfo={closed:false, extra:0, auto:""};
function sketchSil(S, w, gap){
  const fat=union(strokeLines(S, w+2*gap));
  return exPolys(fat).map(e=>{ const sh=largest(offset([e.outer], -(gap+w/2), 0.04)); return sh && Math.abs(area(sh))>80 ? sh : null; }).filter(Boolean)
    .sort((a,b)=>Math.abs(area(b))-Math.abs(area(a)));
}
function snapLines(ls, w){ const d=w/2+5;
  return ls.map((l,i)=>{ if(l.c) return l; const p=l.p.slice();
    for(const end of [0,1]){ const q=end?p[p.length-1]:p[0]; let best=null, bd=d;
      ls.forEach((m,j)=>{ if(j===i) return; const P=m.c?m.p.concat([m.p[0]]):m.p; for(let k=1;k<P.length;k++){ const r=segDist(q[0],q[1],P[k-1][0],P[k-1][1],P[k][0],P[k][1]); if(r[0]<bd){bd=r[0];best=[r[1],r[2]];} } });
      if(best && bd>0.05){ if(end) p.push(best); else p.unshift(best); } }
    const a=p[0], b=p[p.length-1]; if(plen(p)>10 && Math.hypot(a[0]-b[0],a[1]-b[1])<d) return {p:p.slice(0,-1).concat(Math.hypot(a[0]-b[0],a[1]-b[1])<0.3?[]:[b]),c:true};
    return {p,c:false}; }); }
function sketchBuild(){
  const S=SK(); sketchInfo={closed:false, extra:0, auto:""};
  if(!S.length){ return; }
  const w=design.lineW;
  try{
    // 1. the drawing as it is, closing small gaps; 2. bigger gaps; 3. finish an outline that was left open
    let cands=[], auto="";
    for(const gap of [1.6,3.2,5.5]){ cands=sketchSil(S,w,gap); if(cands.length){ if(gap>1.6) auto="closed a gap"; break; } }
    if(!cands.length){
      let bi=-1, bl=0; S.forEach((l,i)=>{ const L=plen(l.p); if(!l.c && L>bl){bl=L;bi=i;} });
      if(bi>=0 && bl>25){ const l=S[bi], a=l.p[0], b=l.p[l.p.length-1];
        if(Math.hypot(a[0]-b[0],a[1]-b[1]) < bl*0.45){ const S2=S.map((x,i)=>i===bi?{p:x.p,c:true}:x); cands=sketchSil(S2,w,1.6); if(cands.length){ auto="finished the outline"; S[bi].c=true; } } }
    }
    if(!cands.length){ design.outline=[]; design.lines=S.map(l=>({p:l.p,c:l.c})); design.blobs=[]; design.holes=[]; return; }
    const sil=dpClosed(smoothClosed(resample(cands[0].concat([cands[0][0]]),0.5).slice(0,-1),6,2),0.04);
    sketchInfo={closed:true, extra:cands.slice(1).filter(c=>!pointInPoly(c[0],cands[0])).length, auto};
    const dots=[], strokes=[], areas=[], hls=[];
    for(const l of S){ const P=l.c?l.p.concat([l.p[0]]):l.p; if(l.shape) continue; const sm=q=>dpClosed(smoothClosed(resample(q.concat([q[0]]),0.5).slice(0,-1),4,2),0.03); if(l.c && l.kind==='hole'){ hls.push(sm(l.p)); continue; } if(l.c && l.kind==='area'){ areas.push(sm(l.p)); continue; } if(plen(P)<1.2) dots.push(l.p[0]); else strokes.push({p:resample(P,0.7),c:false}); }
    design.outline=sil;
    const safe=offset([sil], -(w/2+0.9), 0.04); const loops=[], open=[];
    for(const l of S){ if(l.shape||l.kind||!l.c) continue; if(l.p.every(q=>safe.some(p=>pointInPoly(q,p)))) loops.push({p:dpClosed(smoothClosed(resample(l.p.concat([l.p[0]]),0.5).slice(0,-1),4,2),0.02),c:true,src:l}); }
    const skip=new Set(loops.map(x=>x.src));
    const strokes2=[]; for(const l of S){ if(l.shape||skip.has(l)||(l.c&&l.kind)) continue; const P=l.c?l.p.concat([l.p[0]]):l.p; if(plen(P)>=1.2) strokes2.push({p:resample(P,0.7),c:false}); }
    design.lines=snapLines(connectLines(strokes2, sil, w, 2, 0.9, 5).concat(loops.map(x=>({p:x.p,c:true}))), w).map(l=>l.c?{p:dpClosed(l.p,0.015),c:true}:{p:dp(smoothOpen(resample(l.p,0.6),4,2),0.015),c:false});
    const inner=offset([sil], -(w/2+1.6), 0.04);
    design.blobs=dots.filter(q=>inner.some(p=>pointInPoly(q,p))).map(q=>circlePts(q[0],q[1],Math.max(0.9,w*0.8),20)).concat(inter(areas.map(p=>area(p)<0?p.slice().reverse():p), inner));
    design.holes=hls;
  }catch(err){ console.warn(err); }
}
function wrapCookie(){ // a cookie around whatever has been drawn
  const S=SK(); if(!S.length) return; pushHist();
  const u=largest(union(offset(union(strokeLines(S,design.lineW)), 5, 0.05))); if(!u) return;
  const o=largest(offset(offset([u],6,0.05),-6,0.05))||u;
  design.sketch.unshift({p:dpClosed(o,0.05),c:true,shape:true}); sketchBuild(); render(); fitView(); markDirty();
}
const SHAPES={
  circle:(R)=>circlePts(0,0,R,64),
  oval:(R)=>circlePts(0,0,R,64).map(q=>[q[0]*0.72,q[1]]),
  square:(R)=>{ const p=[]; for(let i=0;i<96;i++){ const a=i/96*2*Math.PI, c=Math.cos(a), si=Math.sin(a), e=0.28; p.push([R*0.94*Math.sign(c)*Math.pow(Math.abs(c),e*2), R*0.94*Math.sign(si)*Math.pow(Math.abs(si),e*2)]); } return p; },
  heart:(R)=>{ const p=[]; for(let i=0;i<96;i++){ const t=i/96*2*Math.PI; p.push([R*0.062*16*Math.pow(Math.sin(t),3), -R*0.062*(13*Math.cos(t)-5*Math.cos(2*t)-2*Math.cos(3*t)-Math.cos(4*t))-R*0.08]); } return p; },
  star:(R)=>{ const p=[]; for(let i=0;i<10;i++){ const a=-Math.PI/2+i*Math.PI/5, r=i%2?R*0.56:R; p.push([r*Math.cos(a), r*Math.sin(a)]); } return smoothClosed(chaikin(chaikin(p,true),true),1,1); }
};
function startShape(k){
  pushHist();
  if(!SK().length){ design.outline=[]; design.lines=[]; design.blobs=[]; design.img=null; srcImage=null; srcURL=null; origImage=null; origURL=null; redrawnFrom=null; redrawJob++; setBusy(false); $("srcThumb").hidden=true; $("traceNote").hidden=true; }
  const R=sizeMM()/2; let p=SHAPES[k](R); const n=RULES.neck+0.3, t=RULES.notch+0.3;
  p=largest(offset(offset([p],-n,0.04),n,0.04))||p; p=largest(offset(offset([p],t,0.04),-t,0.04))||p; p=dpClosed(p,0.04);
  design.sketch=design.sketch.filter(l=>!l.shape); design.sketch.unshift({p,c:true,shape:true,k});
  sketchBuild(); setView("edit"); setTool("pen"); render(); fitView(); markDirty();
}
/* ---------------- cookie coach: what the best cutters have in common ---------------- */
function coach(R){
  const tips=[]; const S=SK(); const has=R.outline && R.outline.length>0;
  if(!has){
    if(S.length) tips.push(["go","Close the shape."]);
    return {ok:false, tips, stats:""};
  }
  const lines=design.lines, n=lines.length, dots=(design.blobs||[]).length;
  const O=R.outline; const segs=[]; for(let i=0;i<O.length;i++){const a=O[i],b=O[(i+1)%O.length]; segs.push([a[0],a[1],b[0],b[1]]);}
  const dEdge=q=>{let d=Infinity; for(const s2 of segs){ const r=segDist(q[0],q[1],...s2)[0]; if(r<d) d=r; } return d;};
  const touch=design.lineW/2+2.6;
  const dOther=(q,i)=>{ let d=Infinity; lines.forEach((l,j)=>{ if(j===i) return; const P=l.c?l.p.concat([l.p[0]]):l.p; for(let k=1;k<P.length;k++){ const r=segDist(q[0],q[1],P[k-1][0],P[k-1][1],P[k][0],P[k][1])[0]; if(r<d) d=r; } }); return d; };
  let floating=0, tiny=0;
  lines.forEach((l,i)=>{ if(l.c) return; const L=plen(l.p); if(L<4){ tiny++; return; }
    const a=l.p[0], b=l.p[l.p.length-1]; const ca=dEdge(a)<touch||dOther(a,i)<touch, cb=dEdge(b)<touch||dOther(b,i)<touch; if(!ca&&!cb) floating++; });
  if(sketchInfo.extra>0 && S.length) tips.push(["warn","Only the biggest shape becomes the cookie."]);
  const artInk=design.art && design.art.ink && design.art.ink.length;
  if(n===0 && dots===0 && !artInk) tips.push(["go","Add a few bold lines inside."]);
  if(n>14) tips.push(["warn",`${n} lines is a lot. Aim for 6 to 12.`]);
  if(floating>=3) tips.push(["warn","Join loose lines to the edge."]);
  if(tiny>=3) tips.push(["warn","Tiny marks vanish in dough."]);
  if(R.warns && R.warns.length) tips.push(["warn","Lines too close. Space them out."]);
  const ok=!tips.some(t=>t[0]==="warn") && (n>0||dots>0);
  if(ok) tips.push(["ok","Looks good."]);
  return {ok, tips, stats:`${n} line${n===1?"":"s"}${dots?`, ${dots} dot${dots===1?"":"s"}`:""}`};
}
function renderCoach(R){
  const c=$("coach"); if(!c) return; const k=coach(R);
  $("coachH").hidden=!k.tips.length; if(!k.tips.length){ c.innerHTML=""; return; }
  c.innerHTML=(k.stats?`<div class="cstat">${k.stats}</div>`:"")+k.tips.map(t=>`<div class="ctip ${t[0]}">${t[1]}</div>`).join("");
}
window.addEventListener("keydown", e=>{
  const tag=(e.target.tagName||"").toLowerCase(); if(tag==="input"||tag==="textarea"||tag==="select") return;
  if(e.code==="Space"){spaceDown=true; e.preventDefault(); return;}
  const mod=e.ctrlKey||e.metaKey;
  if(mod && e.key.toLowerCase()==="z"){ e.preventDefault(); e.shiftKey?redo():undo(); return; }
  if(mod && e.key.toLowerCase()==="y"){ e.preventDefault(); redo(); return; }
  if(e.key==="Delete"||e.key==="Backspace"){
    e.preventDefault(); const o=selObj();
    if(o && selNode>=0){ const min=o.c?3:2; if(o.p.length<=min){ if(sel.kind!=="outline") deleteSel(); else toast("The outline needs at least 3 points."); return;} pushHist(); design.sketch=[]; o.p.splice(selNode,1); selNode=Math.min(selNode,o.p.length-1); render(); markDirty(); }
    else deleteSel();
    return;
  }
  if(e.key==="Escape"){ sel=null; selNode=-1; renderNodes(); renderSelbar(); }
  if(!mod){ if(e.key==="v")setTool("select"); if(e.key==="p")setTool("pen"); if(e.key==="e")setTool("erase"); }
});
window.addEventListener("keyup", e=>{ if(e.code==="Space") spaceDown=false; });
function setTool(t){ tool=t; if(t!=="select" && cookieView && typeof setView==="function") setView("edit"); document.querySelectorAll(".tool[data-tool]").forEach(b=>b.classList.toggle("on",b.dataset.tool===t));
  svg.style.cursor = t==="pen"?"crosshair": t==="erase"?"cell":"default"; $("hint").textContent=hints[t]; if(t!=="select"){sel=null;selNode=-1;renderNodes();} renderSelbar(); if(layers.frame){ const blank=!design.outline.length&&!SK().length; render(); if(blank&&t==="pen"){ const z=sizeMM(); const r=svg.getBoundingClientRect(); if(r.width){ view.cx=0; view.cy=0; view.ppm=Math.min(r.width,r.height)/(z*1.35); applyView(); } } } }
document.querySelectorAll(".tool[data-tool]").forEach(b=>b.onclick=()=>setTool(b.dataset.tool));
$("fitBtn").onclick=fitView;
$("busyCancel").onclick=traceOriginal;
$("imgToggle").onclick=()=>{showImage=!showImage; render();};
$("undo").onclick=undo; $("redo").onclick=redo;

/* ---------------- image upload & trace ---------------- */
const sliders=[["bgTol",v=>v],["sens",v=>Math.round(v*100)+"%"],["smooth",v=>(+v).toFixed(1)+" mm"],["spk",v=>(+v).toFixed(1)+" mm"],["lineW",v=>(+v).toFixed(2)+" mm"]];
function updOut(){ sliders.forEach(([id,f])=>$("o_"+id).textContent=f($(id).value)); }
let traceTimer=0, tracePushed=false;
function scheduleTrace(){ updOut(); clearTimeout(traceTimer); traceTimer=setTimeout(runTrace,140); }
["bgTol","sens","smooth","spk"].forEach(id=>$(id).addEventListener("input",scheduleTrace));
$("detSrc").addEventListener("change",scheduleTrace); $("detLevel").addEventListener("change",scheduleTrace);
$("lineW").addEventListener("input",()=>{ updOut(); design.lineW=+$("lineW").value; if(SK().length) sketchBuild(); liveRenderW(); });
$("lineW").addEventListener("change",()=>{ markDirty(); });
let lwRaf=0; function liveRenderW(){ if(lwRaf) return; lwRaf=requestAnimationFrame(()=>{lwRaf=0; render();}); }
function syncLineW(){ $("lineW").value=design.lineW; updOut(); syncFrame(); }
function syncFrame(){ document.querySelectorAll("#frameSeg button").forEach(b=>b.classList.toggle("on",b.dataset.v===(design.frame||"figure"))); }
document.querySelectorAll("#frameSeg button").forEach(b=>b.onclick=()=>{ pushHist(); design.frame=b.dataset.v; syncFrame(); if(sizeObj()) fitReady(design,sizeMM()); render(); fitView(); markDirty(); });
function runTrace(){
  if(!srcImage) return;
  let r; try{ r=traceImage(srcImage, getTraceOpts(), design.lineW); }catch(err){ console.error(err); toast("Couldn't trace that image."); return; }
  if(!r){ setTraceNote("I couldn't find a shape in that picture. Try raising Background tolerance.", true); return; }
  if(r.error==="background"){ setTraceNote("The whole picture looks like one shape, so I can't tell the object from the background. Try a picture with a plain background, or lower Background tolerance.", true); return; }
  if(!tracePushed){ pushHist(); tracePushed=true; }
  design.outline=r.outline; design.lines=r.lines; design.blobs=r.blobs; design.sketch=[]; design.holes=[]; design.sizeKey=sizeKey;
  design.img={k:r.imgX.k, tx:r.imgX.tx, ty:r.imgX.ty, w:srcImage.naturalWidth, h:srcImage.naturalHeight};
  design.art = r.ink ? {ink:r.ink, w:r.inkW, v:0, real:true, resnap:true} : null;
  if(sizeObj()) fitReady(design, sizeMM());
  if(design.art && design.art.real){ try{ design.art.ink=roundShapes(design.art.ink); }catch(err){ console.warn(err); } }
  artSync();
  if(!(design.art && design.art.real)){ const n0=design.lines.length; try{ design.lines=simplifyDrawing(design.lines, design.outline, design.lineW); }catch(err){ console.warn(err); } traceTidied=n0-design.lines.length; }   // a copied drawing keeps every line
  // the picture's own ink stays as drawn; only loose flecks that no line runs through go (spurs of the tidy-up are not cut out of it)
  if(design.art && design.art.real){ try{ const own=union(strokeLines(design.lines, design.art.w*1.6).concat(design.blobs.length?offset(design.blobs,0.5,0.04):[]));
      const ex=exPolys(design.art.ink); const keep=ex.filter(e=>exArea(e)>=RULES.minArea || netArea(inter([e.outer], own))>0.05);   // only true specks go; every drawn mark stays
      if(keep.length<ex.length) design.art.ink=flatEx(keep); }catch(err){ console.warn(err); } design.art.resnap=true; artSync(); }
  else if(design.art){ design.art.noAdd=true; artSync(); design.art.noAdd=false; }
  if(!design.art){ try{ const lw=design.lineW, O=design.outline;
      const ring=diff([O], offset([O], -1.25*lw, 0.04));
      design.art={ink:inter(union(strokeLines(design.lines,lw).concat(design.blobs, ring)), [O]), w:lw, v:0, real:false, resnap:true}; }catch(err){ console.warn(err); design.art=null; } }
  const i=r.info; const parts=[];
  parts.push(i.useAlpha?"Transparent background found.":"Background colour found.");
  if(i.subject) parts.push("Found the picture inside its frame.");
  parts.push(i.mode==="lines"?"Details came from the drawn lines.": i.mode==="regions"?"A painted picture, so details are the borders between dark and light areas.": i.mode==="edges"?"No drawn lines, so details came from colour edges.":"No stamp details.");
  if(i.dropped) parts.push(`${i.dropped} separate part${i.dropped>1?"s were":" was"} left out, since a cutter is one shape.`);
  setTraceNote(parts.join(" "));
  sel=null; selNode=-1; render(); markDirty();
}
// After a picture is traced: tidy it into a drawing that makes a good cookie. Every line should end on the edge or on
// another line; loose flecks and stubs go; long loose ends are led to the nearest line or edge; at most 12 lines stay.
function simplifyDrawing(lines, outline, w){
  if(!outline||outline.length<3) return lines;
  let ls=lines.map(l=>({p:l.p.slice(),c:!!l.c}));
  const edgeSegs=[]; for(let i=0;i<outline.length;i++){ const a=outline[i],b=outline[(i+1)%outline.length]; edgeSegs.push([a[0],a[1],b[0],b[1]]); }
  const nearEdge=q=>{ let b=[Infinity]; for(const s2 of edgeSegs){ const r=segDist(q[0],q[1],...s2); if(r[0]<b[0]) b=r; } return b; };
  const nearLine=(q,self,skipEnd)=>{ let b=[Infinity]; for(const m of ls){ const n=m.p.length, cl=m.c;
      for(let i=0;i+1<n || (cl&&i<n);i++){ const a=m.p[i], c=m.p[(i+1)%n];
        if(m===self){ const far=skipEnd===0? i>Math.min(n-2,6) : i<n-8; if(!far) continue; }
        const r=segDist(q[0],q[1],a[0],a[1],c[0],c[1]); if(r[0]<b[0]) b=r; } } return b; };
  const tie=w+0.9, reach=4.5;
  for(const l of ls){ if(l.c||l.p.length<4) continue; const a=l.p[0], b=l.p[l.p.length-1]; if(plen(l.p)>=4 && Math.hypot(a[0]-b[0],a[1]-b[1])<=2.6) l.c=true; } // a small ring left open
  const ends=l=>[0,1].map(e=>{ const q=e? l.p[l.p.length-1] : l.p[0]; const a=nearEdge(q), b=nearLine(q,l,e); return {q, d:Math.min(a[0],b[0]), to:a[0]<=b[0]?a:b}; });
  // one line broken in two, each half bent to the edge (a label line crossed it): make it one line again
  { let merged=true, guard=0; while(merged && guard++<20){ merged=false;
      outer: for(let i=0;i<ls.length;i++){ const A=ls[i]; if(A.c||plen(A.p)<6) continue;
        for(let j=i+1;j<ls.length;j++){ const B=ls[j]; if(B.c||plen(B.p)<6) continue;
          for(const ea of [0,1]) for(const eb of [0,1]){
            const trim=(l,e)=>{ let p=l.p.slice(); if(e===0) p.reverse(); while(p.length>3 && nearEdge(p[p.length-1])[0]<1.3) p.pop(); return p; }; // p ends at the joint
            const pa=trim(A,ea===0?0:1), pb=trim(B,eb===0?0:1); const qa=pa[pa.length-1], qb=pb[pb.length-1];
            if(pa.length===A.p.length && pb.length===B.p.length) continue;            // neither end was bent to the edge
            const gap=Math.hypot(qa[0]-qb[0],qa[1]-qb[1]); if(gap>5.5) continue;
            const ta=pa[Math.max(0,pa.length-4)], tb=pb[Math.max(0,pb.length-4)];
            const ux=qa[0]-ta[0], uy=qa[1]-ta[1], vx=tb[0]-qb[0], vy=tb[1]-qb[1]; const cu=(ux*vx+uy*vy)/((Math.hypot(ux,uy)||1)*(Math.hypot(vx,vy)||1));
            if(cu<0.45) continue;                                                      // they do not continue each other
            ls[i]={p:pa.concat(pb.slice().reverse()), c:false}; ls.splice(j,1); merged=true; break outer; } } } } }
  for(let pass=0;pass<3;pass++){
    // lead long loose ends home
    for(const l of ls){ if(l.c) continue; const L=plen(l.p); const en=ends(l);
      en.forEach((x,e)=>{ if(x.d>0.25 && x.d<=(L>=6?reach:tie)){ const dx=x.to[1]-x.q[0], dy=x.to[2]-x.q[1], dd=Math.hypot(dx,dy)||1; const t=[x.to[1]+dx/dd*0.7, x.to[2]+dy/dd*0.7]; if(e) l.p.push(t); else l.p.unshift(t); } });
      const a=l.p[0], b=l.p[l.p.length-1]; if(L>=10 && Math.hypot(a[0]-b[0],a[1]-b[1])<=reach*0.7 && ends(l).every(x=>x.d>tie)){ l.c=true; } }
    // drop what still hangs loose
    const before=ls.length;
    ls=ls.filter(l=>{ if(l.c) return true; const L=plen(l.p); const en=ends(l); const free=en.filter(x=>x.d>tie).length;
      if(free===2) return L>=14; if(free===1) return L>=7; return L>=2.5; });
    if(ls.length===before) break;
  }
  // tiny closed marks: keep the two biggest
  const marks=ls.filter(l=>l.c && plen(l.p)<9).sort((a,b)=>plen(b.p)-plen(a.p)); const dropM=new Set(marks.slice(2));
  ls=ls.filter(l=>!dropM.has(l));
  if(ls.length>12){ const keep=new Set(ls.slice().sort((a,b)=>plen(b.p)-plen(a.p)).slice(0,12)); ls=ls.filter(l=>keep.has(l)); }
  return ls;
}
// An uploaded picture sits behind the canvas so the person can trace over it with the pen.
function traceMode(){ return !!(srcImage && design.img && !design.art && !design.lines.length && !design.outline.length) || !!(srcImage && design.img && SK().length && !design.art); }
// Clean geometry for a copied drawing: round things become truly round (eyes, pupils, dots, rings),
// the way a designer would draw them for a cutter.
function ellipseOf(p, n=72){
  let cx=0, cy=0; for(const q of p){ cx+=q[0]; cy+=q[1]; } cx/=p.length; cy/=p.length;
  let sxx=0, syy=0, sxy=0; for(const q of p){ const x=q[0]-cx, y=q[1]-cy; sxx+=x*x; syy+=y*y; sxy+=x*y; } sxx/=p.length; syy/=p.length; sxy/=p.length;
  const tr=sxx+syy, det=sxx*syy-sxy*sxy, disc=Math.sqrt(Math.max(0,tr*tr/4-det)), l1=tr/2+disc, l2=Math.max(1e-6,tr/2-disc);
  const ang=0.5*Math.atan2(2*sxy, sxx-syy); let a=Math.sqrt(2*l1), b=Math.sqrt(2*l2);
  const A=Math.abs(area(p)), s=Math.sqrt(A/(Math.PI*a*b)); a*=s; b*=s;       // same area as the drawn shape
  const out=[]; for(let i=0;i<n;i++){ const th=2*Math.PI*i/n, x=a*Math.cos(th), y=b*Math.sin(th); out.push([cx+x*Math.cos(ang)-y*Math.sin(ang), cy+x*Math.sin(ang)+y*Math.cos(ang)]); }
  return area(out)*area(p)<0 ? out.reverse() : out;
}
function roundness(p){ const A=Math.abs(area(p)), P=plen(p.concat([p[0]])); return P>0? 4*Math.PI*A/(P*P) : 0; }
function roundShapes(ink, maxMM=18){
  const out=[];
  for(const e of exPolys(ink)){ const bb=bbox([e.outer]);
    const outer = (Math.max(bb.w,bb.h)<=maxMM && roundness(e.outer)>0.8) ? ellipseOf(e.outer) : e.outer;
    const holes = e.holes.map(h=>{ const hb=bbox([h]); return (Math.max(hb.w,hb.h)<=maxMM && roundness(h)>0.78) ? ellipseOf(h) : h; });
    out.push({outer, holes}); }
  try{ return flatEx(out); }catch(err){ return ink; }
}
// Parts of the cookie thinner than about 5 mm (a stem, a leaf stalk, a thin tail) would break off: make them thick enough to hold.
function thickenThinParts(O){
  const r=RULES.neck; const opened=offset(offset([O],-r,0.04),r,0.04);
  // only strips that stay thin along their length (a stem, a stalk), not pointed tips such as ears or toes
  let thin=diff([O], opened); thin=flatEx(exPolys(thin).filter(e=>{ const A=exArea(e); if(A<0.6) return false;
    const P=plen(e.outer.concat([e.outer[0]])), len=P/2, meanW=A/Math.max(len,1e-6); return meanW<1.8 && len>3; }));
  if(!thin.length) return O;
  let grown=union([O].concat(offset(thin, r*0.9, 0.04))); grown=offset(offset(grown,0.8,0.04),-0.8,0.04);
  const ex=exPolys(grown); if(!ex.length) return O; ex.sort((p,q)=>exArea(q)-exArea(p)); return ex[0].outer;
}
// ---------- Vector design: a clean line drawing becomes the cutter design with smooth curves and every join as drawn ----------
// ---- Centre-line ridges --------------------------------------------------------------
// Each drawn line is reduced to its centre line. The centre lines are cleaned up (stubs off thick
// corners removed, lines that sit too close merged, curves smoothed, near-round loops turned into
// true circles) and drawn again at one even width with round ends. All work is in pixels; ppm = pixels per mm.

function clThin(mask,W,H){ // Zhang-Suen thinning to 1-pixel centre lines
  const m=mask.slice(); let cand=[]; for(let i=0;i<W*H;i++) if(m[i]) cand.push(i);
  const del=[]; let changed=true;
  while(changed){ changed=false;
    for(let pass=0;pass<2;pass++){ del.length=0;
      for(const i of cand){ if(!m[i]) continue; const x=i%W, y=(i/W)|0; if(x<1||y<1||x>=W-1||y>=H-1){ m[i]=0; continue; }
        const p2=m[i-W],p3=m[i-W+1],p4=m[i+1],p5=m[i+W+1],p6=m[i+W],p7=m[i+W-1],p8=m[i-1],p9=m[i-W-1];
        const B=p2+p3+p4+p5+p6+p7+p8+p9; if(B<2||B>6) continue;
        const A=(!p2&&p3?1:0)+(!p3&&p4?1:0)+(!p4&&p5?1:0)+(!p5&&p6?1:0)+(!p6&&p7?1:0)+(!p7&&p8?1:0)+(!p8&&p9?1:0)+(!p9&&p2?1:0); if(A!==1) continue;
        if(pass===0){ if(p2&&p4&&p6) continue; if(p4&&p6&&p8) continue; } else { if(p2&&p4&&p8) continue; if(p2&&p6&&p8) continue; }
        del.push(i); }
      for(const i of del) m[i]=0; if(del.length) changed=true; }
    cand=cand.filter(i=>m[i]); }
  return m; }

// skeleton -> graph: nodes (line ends, junctions) and edges (pixel paths between them, or closed loops)
function clGraph(sk,W,H){
  const off=[-W,-W+1,1,W+1,W,W-1,-1,-W-1], four=[0,2,4,6], diag=[1,3,5,7];
  const node=new Int32Array(W*H).fill(-1), isN=new Uint8Array(W*H), seen=new Uint8Array(W*H);
  const ok=i=>i>=W&&i<W*(H-1)&&(i%W)>0&&(i%W)<W-1;
  for(let i=0;i<W*H;i++){ if(!sk[i]||!ok(i)) continue; let c=0,n=0; for(let k=0;k<8;k++){ const a=sk[i+off[k]], b=sk[i+off[(k+1)%8]]; if(!a&&b) c++; if(a) n++; } if(c!==2||n===0) isN[i]=1; }
  const nodes=[];
  for(let i=0;i<W*H;i++){ if(!isN[i]||node[i]>=0) continue; const id=nodes.length, st=[i], px=[]; node[i]=id;
    while(st.length){ const q=st.pop(); px.push(q); for(const o of off){ const r=q+o; if(ok(r)&&isN[r]&&node[r]<0){ node[r]=id; st.push(r); } } }
    let x=0,y=0; for(const q of px){ x+=q%W; y+=(q/W)|0; } nodes.push({x:x/px.length, y:y/px.length, px}); }
  const P=i=>[i%W,(i/W)|0], edges=[];
  for(let id=0;id<nodes.length;id++) for(const s of nodes[id].px) for(const o of off){ const q=s+o; if(!ok(q)||!sk[q]) continue;
    if(isN[q]){ const b=node[q]; if(b>id && !edges.some(e=>(e.a===id&&e.b===b&&e.p.length===2))) edges.push({a:id,b,p:[[nodes[id].x,nodes[id].y],[nodes[b].x,nodes[b].y]]}); continue; }
    if(seen[q]) continue;
    const path=[[nodes[id].x,nodes[id].y],P(q)]; seen[q]=1; let cur=q, end=-1;
    for(;;){ let nx=-1;
      for(const o of off){ const r=cur+o; if(ok(r)&&isN[r]&&(node[r]!==id||path.length>3)){ end=node[r]; break; } }
      if(end>=0) break;
      for(const k of four.concat(diag)){ const r=cur+off[k]; if(ok(r)&&sk[r]&&!isN[r]&&!seen[r]){ nx=r; break; } }
      if(nx<0) break; seen[nx]=1; path.push(P(nx)); cur=nx; }
    if(end<0){ end=nodes.length; nodes.push({x:cur%W, y:(cur/W)|0, px:[cur]}); } else path.push([nodes[end].x,nodes[end].y]);
    edges.push({a:id,b:end,p:path}); }
  for(let i=0;i<W*H;i++){ if(!sk[i]||isN[i]||seen[i]||!ok(i)) continue; // pure loops
    const path=[P(i)]; seen[i]=1; let cur=i;
    for(;;){ let nx=-1; for(const k of four.concat(diag)){ const r=cur+off[k]; if(ok(r)&&sk[r]&&!isN[r]&&!seen[r]){ nx=r; break; } } if(nx<0) break; seen[nx]=1; path.push(P(nx)); cur=nx; }
    if(path.length>=6) edges.push({a:-1,b:-1,p:path,closed:true}); }
  return {nodes,edges}; }

function clLen(p){ let L=0; for(let i=1;i<p.length;i++) L+=Math.hypot(p[i][0]-p[i-1][0],p[i][1]-p[i-1][1]); return L; }
function clDeg(G){ const d=new Int32Array(G.nodes.length); for(const e of G.edges){ if(e.closed) continue; d[e.a]++; d[e.b]++; } return d; }
// join the two edges at every node that has exactly two (a line that just passes through)
function clMerge(G,keepNode){
  for(let guard=0;guard<10000;guard++){ const d=clDeg(G); let n=-1; for(let i=0;i<d.length;i++) if(d[i]===2&&!(keepNode&&keepNode[i])){ n=i; break; } if(n<0) return;
    const es=G.edges.filter(e=>!e.closed&&(e.a===n||e.b===n));
    if(es.length===1){ const e=es[0]; e.closed=true; e.p=e.p.slice(0,-1); e.a=e.b=-1; continue; } // a loop through one node
    const [e1,e2]=es; const p1=e1.b===n?e1.p:e1.p.slice().reverse(), o1=e1.b===n?e1.a:e1.b, p2=e2.a===n?e2.p:e2.p.slice().reverse(), o2=e2.a===n?e2.b:e2.a;
    G.edges=G.edges.filter(e=>e!==e1&&e!==e2); G.edges.push({a:o1,b:o2,p:p1.concat(p2.slice(1))}); } }
// remove short stubs: a branch that ends freely, sticking off a junction (thick corners, blobs)
function clPrune(G,minLen,radiusAt){
  for(let it=0;it<4;it++){ const d=clDeg(G); let cut=false;
    G.edges=G.edges.filter(e=>{ if(e.closed) return true; const fa=d[e.a]===1, fb=d[e.b]===1; if(fa===fb) return true;
      const j=fa?G.nodes[e.b]:G.nodes[e.a]; const lim=Math.max(minLen, 1.6*radiusAt(j.x,j.y)); if(clLen(e.p)<lim){ cut=true; return false; } return true; });
    clMerge(G); if(!cut) break; } }

function clResample(P,step,closed){
  const pts=closed?P.concat([P[0]]):P; const out=[pts[0].slice()]; let acc=0;
  for(let i=1;i<pts.length;i++){ let ax=pts[i-1][0], ay=pts[i-1][1]; const bx=pts[i][0], by=pts[i][1]; let L=Math.hypot(bx-ax,by-ay);
    while(acc+L>=step && L>0){ const t=(step-acc)/L; ax+= (bx-ax)*t; ay+=(by-ay)*t; out.push([ax,ay]); L=Math.hypot(bx-ax,by-ay); acc=0; }
    acc+=L; }
  if(!closed){ const e=pts[pts.length-1], l=out[out.length-1]; if(Math.hypot(e[0]-l[0],e[1]-l[1])>step*0.4) out.push(e.slice()); else out[out.length-1]=e.slice(); }
  else if(out.length>2 && Math.hypot(out[0][0]-out[out.length-1][0],out[0][1]-out[out.length-1][1])<step*0.5) out.pop();
  return out; }
// smooth a line: real corners (turning more than ~60 degrees over 1 mm) and line ends stay put, everything else is
// evened out with a gaussian (sigma in mm). Near-round closed loops become true circles.
function clSmooth(P,ppm,closed,sigmaMM,maxMove){
  const step=0.25*ppm, sig=(sigmaMM||0.6)*ppm; let Q=clResample(P,step,closed); const n=Q.length;
  if(n<4) return {p:Q,c:closed};
  if(closed && n>=12){ let cx=0,cy=0; for(const q of Q){ cx+=q[0]; cy+=q[1]; } cx/=n; cy/=n; let R=0; for(const q of Q) R+=Math.hypot(q[0]-cx,q[1]-cy); R/=n; let dev=0; for(const q of Q) dev=Math.max(dev,Math.abs(Math.hypot(q[0]-cx,q[1]-cy)-R));
    if(dev<0.12*R && R<20*ppm){ const m=Math.max(48,Math.round(2*Math.PI*R/step)); const C=[]; for(let i=0;i<m;i++){ const a=2*Math.PI*i/m; C.push([cx+R*Math.cos(a),cy+R*Math.sin(a)]); } return {p:C,c:true,circle:{cx,cy,R}}; } }
  const k=Math.max(2,Math.round(1.0*ppm/step)), hw=Math.ceil(2.5*sig/step), idx=j=>closed?((j%n)+n)%n:j;
  const cs=new Float32Array(n).fill(-1);
  for(let i=0;i<n;i++){ const a=idx(i-k), b=idx(i+k); if(a<0||b<0||a>=n||b>=n) continue; const u=[Q[a][0]-Q[i][0],Q[a][1]-Q[i][1]], v=[Q[b][0]-Q[i][0],Q[b][1]-Q[i][1]];
    cs[i]=(u[0]*v[0]+u[1]*v[1])/((Math.hypot(u[0],u[1])*Math.hypot(v[0],v[1]))||1); }
  const pin=new Uint8Array(n); if(!closed){ pin[0]=pin[n-1]=1; }
  for(let i=0;i<n;i++){ if(cs[i]<=-0.5) continue; let mx=true; for(let j=-k;j<=k&&mx;j++){ const q=idx(i+j); if(j===0||q<0||q>=n) continue; if(cs[q]>cs[i]||(cs[q]===cs[i]&&q<i)) mx=false; } if(mx) pin[i]=1; }
  const w=[]; for(let j=0;j<=hw;j++) w.push(Math.exp(-((j*step)**2)/(2*sig*sig)));
  const R=new Array(n);
  for(let i=0;i<n;i++){ if(pin[i]){ R[i]=Q[i]; continue; } let sx=w[0]*Q[i][0], sy=w[0]*Q[i][1], sw=w[0];
    for(const dir of [-1,1]) for(let j=1;j<=hw;j++){ const q=idx(i+dir*j); if(q<0||q>=n) break; sx+=w[j]*Q[q][0]; sy+=w[j]*Q[q][1]; sw+=w[j]; if(pin[q]) break; }
    R[i]=[sx/sw,sy/sw]; }
  if(maxMove){ const lim=maxMove*ppm; for(let i=0;i<n;i++){ const dx=R[i][0]-Q[i][0], dy=R[i][1]-Q[i][1], m=Math.hypot(dx,dy); if(m>lim) R[i]=[Q[i][0]+dx*lim/m, Q[i][1]+dy*lim/m]; } }
  return {p:R,c:closed}; }

function clDist(mask,W,H){ const INF=1e9, d=new Float32Array(W*H); for(let i=0;i<W*H;i++) d[i]=mask[i]?INF:0; const b=1.4142;
  for(let y=0;y<H;y++) for(let x=0;x<W;x++){ const i=y*W+x; if(!d[i]) continue; let v=d[i]; if(x>0) v=Math.min(v,d[i-1]+1); if(y>0){ v=Math.min(v,d[i-W]+1); if(x>0) v=Math.min(v,d[i-W-1]+b); if(x<W-1) v=Math.min(v,d[i-W+1]+b); } d[i]=v; }
  for(let y=H-1;y>=0;y--) for(let x=W-1;x>=0;x--){ const i=y*W+x; if(!d[i]) continue; let v=d[i]; if(x<W-1) v=Math.min(v,d[i+1]+1); if(y<H-1){ v=Math.min(v,d[i+W]+1); if(x<W-1) v=Math.min(v,d[i+W+1]+b); if(x>0) v=Math.min(v,d[i+W-1]+b); } d[i]=v; }
  return d; }
function clComps(mask,W,H){ const lab=new Int32Array(W*H), comps=[];
  for(let s=0;s<W*H;s++){ if(!mask[s]||lab[s]) continue; const st=[s], px=[]; lab[s]=comps.length+1;
    while(st.length){ const i=st.pop(); px.push(i); const x=i%W; for(const j of [x>0?i-1:-1,x<W-1?i+1:-1,i-W,i+W,x>0?i-W-1:-1,x<W-1?i-W+1:-1,x>0?i+W-1:-1,x<W-1?i+W+1:-1]) if(j>=0&&j<W*H&&mask[j]&&!lab[j]){ lab[j]=comps.length+1; st.push(j); } }
    comps.push(px); }
  return comps; }
function clDisk(mask,W,H,P,r){ // stamp a round-ended polyline of radius r into mask
  const r2=r*r; const dot=(cx,cy)=>{ for(let y=Math.max(0,Math.floor(cy-r));y<=Math.min(H-1,Math.ceil(cy+r));y++) for(let x=Math.max(0,Math.floor(cx-r));x<=Math.min(W-1,Math.ceil(cx+r));x++) if((x-cx)**2+(y-cy)**2<=r2) mask[y*W+x]=1; };
  for(let i=0;i<P.length;i++){ dot(P[i][0],P[i][1]); if(i){ const a=P[i-1], b=P[i], L=Math.hypot(b[0]-a[0],b[1]-a[1]), n=Math.ceil(L/Math.max(0.5,r*0.5)); for(let k=1;k<n;k++) dot(a[0]+(b[0]-a[0])*k/n, a[1]+(b[1]-a[1])*k/n); } } }

// main: ink = drawn lines inside the cookie (outline included), dIn = distance from outside inside the cookie (px),
// dInk = half-width of the ink at each pixel (distance to non-ink). Returns {lines:[{p,c}], dots:[{cx,cy,r,ring}]} in px.
function clRidges(ink,W,H,ppm,dIn,dInk,opt){ dInk=dInk.slice();
  opt=opt||{}; const wall=(opt.wall||1.4)*ppm, merge=(opt.merge||0)*ppm;
  const dots=[];
  // 1. separate small round blobs (pupils, seeds) are dots, not lines
  const work=ink.slice();
  for(const c of clComps(ink,W,H)){ let x0=W,x1=0,y0=H,y1=0,cx=0,cy=0; for(const i of c){ const x=i%W,y=(i/W)|0; cx+=x; cy+=y; if(x<x0)x0=x; if(x>x1)x1=x; if(y<y0)y0=y; if(y>y1)y1=y; }
    cx/=c.length; cy/=c.length; const ar=Math.sqrt(c.length/Math.PI); if(Math.max(x1-x0,y1-y0)>7*ppm) continue;
    let rmax=0; for(const i of c) rmax=Math.max(rmax,Math.hypot(i%W-cx,((i/W)|0)-cy));
    if(!opt.noDots && rmax<=ar*1.5 && ar>=0.6*ppm){ dots.push({cx,cy,r:ar}); for(const i of c) work[i]=0; } }
  // 1b. pupils and other solid dots that touch a line (an eye's lid): thick, compact cores of the ink
  let sk0=clThin(work,W,H);
  if(!opt.noDots){ const hs=[]; for(let i=0;i<W*H;i++) if(sk0[i]) hs.push(dInk[i]); hs.sort((a,b)=>a-b);
    const hwLine=hs.length?hs[hs.length>>1]:0.5*ppm, t=Math.max(2.0*hwLine, 0.75*ppm);
    const core=new Uint8Array(W*H); for(let i=0;i<W*H;i++) core[i]=(work[i]&&dInk[i]>t)?1:0;
    for(const c of clComps(core,W,H)){ if(c.length<1) continue;   // a junction's core is a speck; a pupil's is a disc
      let cx=0,cy=0,x0=W,x1=0,y0=H,y1=0; for(const i of c){ const x=i%W,y=(i/W)|0; cx+=x; cy+=y; if(x<x0)x0=x; if(x>x1)x1=x; if(y<y0)y0=y; if(y>y1)y1=y; }
      cx/=c.length; cy/=c.length; if(Math.max(x1-x0,y1-y0)>3*ppm) continue;
      let rmax=0; for(const i of c) rmax=Math.max(rmax,Math.hypot(i%W-cx,((i/W)|0)-cy)); if(rmax>Math.sqrt(c.length/Math.PI)*1.35+1) continue;   // round only
      let dmax=0; for(const i of c) dmax=Math.max(dmax,dInk[i]); const r=Math.max(dmax,0.8*ppm);
      if(dIn[Math.round(cy)*W+Math.round(cx)] < r+1.6*ppm) continue;                                              // never on the wall
      dots.push({cx,cy,r,keep:true});
      } }
  // one dot per feature: a dot within 2.5 mm of a bigger one is the same eye or nostril
  { dots.sort((a,b)=>b.r-a.r); const keep=[]; for(const d of dots){ if(!keep.some(k=>Math.hypot(k.cx-d.cx,k.cy-d.cy)<2.5*ppm)) keep.push(d); } dots.length=0; dots.push(...keep); }
  // an eye drawn as one small separate shape (almond + pupil) is rebuilt as its almond outline plus the pupil dot,
  // because thinning a narrow almond with a big pupil inside collapses it into a stub
  if(!opt.noDots && dots.some(d=>d.keep)){ const lab=new Int32Array(W*H).fill(-1), cs=clComps(work,W,H); cs.forEach((c,k)=>{ for(const i of c) lab[i]=k; });
    const done=new Set();
    for(const d of dots){ if(!d.keep) continue; const k=lab[Math.round(d.cy)*W+Math.round(d.cx)]; if(k<0||done.has(k)) continue; const c=cs[k];
      let x0=W,x1=0,y0=H,y1=0; for(const i of c){ const x=i%W,y=(i/W)|0; if(x<x0)x0=x; if(x>x1)x1=x; if(y<y0)y0=y; if(y>y1)y1=y; }
      if(Math.max(x1-x0,y1-y0)>12*ppm) continue; done.add(k);
      const bw=x1-x0+3, bh=y1-y0+3, sub=new Uint8Array(bw*bh); for(const i of c){ sub[((i/W|0)-y0+1)*bw+(i%W-x0+1)]=1; }
      const out=new Uint8Array(bw*bh); { const st=[0]; out[0]=1; while(st.length){ const q=st.pop(), qx=q%bw, qy=(q/bw)|0; for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){ const nx=qx+dx, ny=qy+dy; if(nx<0||ny<0||nx>=bw||ny>=bh) continue; const r=ny*bw+nx; if(!out[r]&&!sub[r]){ out[r]=1; st.push(r); } } } }
      const fill=new Uint8Array(bw*bh); for(let i=0;i<bw*bh;i++) fill[i]=out[i]?0:1; const dd=clDist(fill,bw,bh), t=0.45*ppm;
      for(const i of c) work[i]=0;
      for(let i=0;i<bw*bh;i++) if(fill[i] && Math.abs(dd[i]-t)<=0.9) work[(((i/bw)|0)+y0-1)*W+(i%bw)+x0-1]=1; }
    dInk=clDist(work,W,H); }

  // 1c. narrow pockets and slits inside the drawing (lips, brows, lash roots: under ~2 mm across) close up, so they become one line
  { const bg=new Uint8Array(W*H); for(let i=0;i<W*H;i++) bg[i]=(!work[i]&&dIn[i]>0)?1:0;
    const dBg=(()=>{ const inv=new Uint8Array(W*H); for(let i=0;i<W*H;i++) inv[i]=bg[i]?1:0; return clDist(inv,W,H); })();
    const nearDot=i=>{ const x=i%W, y=(i/W)|0; for(const d of dots) if(Math.hypot(x-d.cx,y-d.cy)<=d.r+1.0*ppm) return true; return false; };
    for(const c of clComps(bg,W,H)){ let mx=0, wall=false, eye=false; for(const i of c){ if(dBg[i]>mx) mx=dBg[i]; if(dIn[i]<=1) wall=true; if(!eye&&nearDot(i)) eye=true; } if(!wall && !eye && mx<0.75*ppm) for(const i of c) work[i]=1; } }
  dInk=clDist(work,W,H);
  // 2. centre lines of everything else
  sk0=clThin(work,W,H);
  const radiusAt=(x,y)=>{ const i=Math.round(y)*W+Math.round(x); return dInk[i]||0; };
  let G=clGraph(sk0,W,H); clMerge(G); clPrune(G,1.0*ppm,radiusAt);
  // 3. the drawn outline belongs to the cutting wall: its centre line goes, lines that meet it keep their end at the wall
  const hws=[]; for(const e of G.edges) for(const p of e.p){ const i=Math.round(p[1])*W+Math.round(p[0]); if(dIn[i]<3*ppm) hws.push(dInk[i]); }
  hws.sort((a,b)=>a-b); const hwOut=hws.length?hws[hws.length>>1]:0.6*ppm, band=2*hwOut+0.35*ppm;
  const atWall=new Uint8Array(G.nodes.length);
  G.edges=G.edges.filter(e=>{ let k=0; for(const p of e.p){ if(dIn[Math.round(p[1])*W+Math.round(p[0])]<=band) k++; }
    if(k>=0.6*e.p.length){ if(!e.closed){ atWall[e.a]=1; atWall[e.b]=1; } return false; } return true; });
  // a line that forks just before the wall (two short branches both reaching it) keeps only the branch that goes straight on
  { const d=clDeg(G); const dir=(e,nid)=>{ const P=e.a===nid?e.p:e.p.slice().reverse(); const k=Math.min(P.length-1,8); return [P[k][0]-P[0][0],P[k][1]-P[0][1]]; };
    for(let nid=0;nid<G.nodes.length;nid++){ if(d[nid]<3) continue; const es=G.edges.filter(e=>!e.closed&&(e.a===nid||e.b===nid)); if(es.length<3) continue;
      const toWall=es.filter(e=>{ const o=e.a===nid?e.b:e.a; return atWall[o] && clLen(e.p)<3*ppm; }); if(toWall.length<2) continue;
      const main=es.filter(e=>!toWall.includes(e)).sort((a,b)=>clLen(b.p)-clLen(a.p))[0]; if(!main) continue;
      const m=dir(main,nid), ml=Math.hypot(m[0],m[1])||1; let best=null, bc=2;
      for(const e of toWall){ const v=dir(e,nid), c=(m[0]*v[0]+m[1]*v[1])/(ml*(Math.hypot(v[0],v[1])||1)); if(c<bc){ bc=c; best=e; } }   // most opposite to the incoming line = straight on
      G.edges=G.edges.filter(e=>!(toWall.includes(e)&&e!==best)); } }
  clMerge(G,atWall);
  // 4. (optional) lines closer than 2*merge (centre to centre) are merged into one; off by default, it invents knots in faces
  if(opt.merge){ const fat=new Uint8Array(W*H); for(const e of G.edges) clDisk(fat,W,H,e.closed?e.p.concat([e.p[0]]):e.p,merge);
    G=clGraph(clThin(fat,W,H),W,H); clMerge(G); clPrune(G,1.0*ppm,()=>merge); }
  // 5. leftovers: tiny pieces go, a small merged knot (an eye ring with its pupil) becomes a dot
  const d2=clDeg(G); const lines=[];
  for(const e of G.edges){ const L=clLen(e.p);
    if(!e.closed && d2[e.a]===1 && d2[e.b]===1 && L<2.5*ppm){ let cx=0,cy=0; for(const p of e.p){ cx+=p[0]; cy+=p[1]; } cx/=e.p.length; cy/=e.p.length;
      let near=0; for(const p of e.p){ const i=Math.round(p[1])*W+Math.round(p[0]); near=Math.max(near,ink[i]?1:0); }
      if(near && L>=1.0*ppm) lines.push(clSmooth(e.p,ppm,false,0.4));   // a short stroke stays a short stroke (a dot only if drawn as one)
      continue; }
    if(e.closed && L<3*ppm) continue;
    const sm=clSmooth(e.p,ppm,!!e.closed,0.6); if(!e.closed){ sm.wa=!opt.merge&&!!atWall[e.a]; sm.wb=!opt.merge&&!!atWall[e.b]; } lines.push(sm); }
  // 6. wall: stretches that run ALONG the wall within ~3.5 mm go onto it (no sliver of dough between); lines that head into the
  //    wall keep their own direction, and ends that met the drawn outline run straight on into it; closed shapes stay whole
  if(opt.outline){ const O=opt.outline, near=(x,y)=>{ let bd=1e18,bx=0,by=0; for(let i=0;i<O.length;i++){ const a=O[i], b=O[(i+1)%O.length]; const dx=b[0]-a[0], dy=b[1]-a[1], L2=dx*dx+dy*dy||1e-9; let t=((x-a[0])*dx+(y-a[1])*dy)/L2; t=t<0?0:t>1?1:t; const px=a[0]+dx*t, py=a[1]+dy*t, d=(px-x)**2+(py-y)**2; if(d<bd){ bd=d; bx=px; by=py; } } return [bx,by,Math.sqrt(bd)]; };
    const D=3.5*ppm, T=0.8*ppm;
    for(const l of lines){ if(l.c) continue; let moved=false, n=l.p.length;
      const keepA=new Uint8Array(n);   // points near an end that runs into the wall: not pulled sideways
      for(const [end,flag] of [[0,l.wa],[n-1,l.wb]]){ if(!flag) continue; const p=l.p[end], [,,d]=near(p[0],p[1]);
        let acc=0; for(let k=0;k<n;k++){ const i=end===0?k:n-1-k; if(k) acc+=Math.hypot(l.p[i][0]-l.p[end===0?i-1:i+1][0], l.p[i][1]-l.p[end===0?i-1:i+1][1]); if(acc>5*ppm) break; keepA[i]=1; }
        if(d<=T||d>2.2*ppm) continue;
        const q=l.p[end===0?Math.min(n-1,4):Math.max(0,n-5)]; let dx=p[0]-q[0], dy=p[1]-q[1]; const dl=Math.hypot(dx,dy)||1; dx/=dl; dy/=dl;
        const ext=[]; let x=p[0], y=p[1]; for(let k=0;k<12;k++){ x+=dx*0.25*ppm; y+=dy*0.25*ppm; ext.push([x,y]); if(near(x,y)[2]<=T) break; }
        if(near(x,y)[2]<=T*1.5){ l.ext=l.ext||[]; l.ext.push([end,ext]); } }
      const P=l.p, tgt=new Array(n).fill(null);
      for(let i=0;i<n;i++){ if(keepA[i]) continue; const p=P[i], [nx,ny,d]=near(p[0],p[1]); if(d>=D||d<1e-6) continue;
        const a=P[Math.max(0,i-3)], b=P[Math.min(n-1,i+3)], tx=b[0]-a[0], ty=b[1]-a[1], tl=Math.hypot(tx,ty)||1, ux=(p[0]-nx)/d, uy=(p[1]-ny)/d;
        if(Math.abs((tx*ux+ty*uy)/tl)>0.57) continue;   // heading into the wall, not along it
        tgt[i]=[nx+ux*T, ny+uy*T]; }
      // only stretches of at least 3 mm along the wall are pulled (short ones would only make bumps)
      for(let i=0;i<n;){ if(!tgt[i]){ i++; continue; } let j=i, L=0; while(j+1<n&&tgt[j+1]){ L+=Math.hypot(P[j+1][0]-P[j][0],P[j+1][1]-P[j][1]); j++; }
        // a stretch that really runs along the wall keeps a steady distance from it; an arc (an ovary, a petal) that curves away does not
        let dmin=1e9,dmax=0; for(let k=i;k<=j;k++){ const dd=near(P[k][0],P[k][1])[2]; if(dd<dmin) dmin=dd; if(dd>dmax) dmax=dd; }
        if(L<3*ppm || dmax-dmin>1.2*ppm) for(let k=i;k<=j;k++) tgt[k]=null; i=j+1; }
      l.p=P.map((p,i)=>{ if(tgt[i]){ moved=true; return tgt[i]; } return p; });
      for(const [end,ext] of (l.ext||[])){ if(end===0) l.p=ext.reverse().concat(l.p); else l.p=l.p.concat(ext); }
      delete l.ext;
      if(moved){ const sm=clSmooth(l.p,ppm,false,0.5); l.p=sm.p; } } }
  // line ends that stop just short of the wall or of another line (a gap under ~1.5 mm in the cutter) reach it
  if(opt.outline){ const O=opt.outline, T=0.8*ppm;
    const nearO=(x,y)=>{ let bd=1e18,bx=0,by=0; for(let i=0;i<O.length;i++){ const a=O[i], b=O[(i+1)%O.length]; const dx=b[0]-a[0], dy=b[1]-a[1], L2=dx*dx+dy*dy||1e-9; let t=((x-a[0])*dx+(y-a[1])*dy)/L2; t=t<0?0:t>1?1:t; const px=a[0]+dx*t, py=a[1]+dy*t, d=(px-x)**2+(py-y)**2; if(d<bd){ bd=d; bx=px; by=py; } } return [bx,by,Math.sqrt(bd)]; };
    const nearL=(x,y,self,endIdx)=>{ let bd=1e18,bx=0,by=0; for(const l of lines){ const P=l.p, n=P.length, m=l.c?n:n-1;
        for(let i=0;i<m;i++){ if(l===self && Math.abs(i-endIdx)<12) continue; const a=P[i], b=P[(i+1)%n]; const dx=b[0]-a[0], dy=b[1]-a[1], L2=dx*dx+dy*dy||1e-9; let t=((x-a[0])*dx+(y-a[1])*dy)/L2; t=t<0?0:t>1?1:t; const px=a[0]+dx*t, py=a[1]+dy*t, d=(px-x)**2+(py-y)**2; if(d<bd){ bd=d; bx=px; by=py; } } }
      return [bx,by,Math.sqrt(bd)]; };
    for(const l of lines){ if(l.c||l.p.length<3) continue;
      for(const end of [0,1]){ const n=l.p.length, i=end?n-1:0, p=l.p[i], q=l.p[end?Math.max(0,n-6):Math.min(n-1,5)];
        let dx=p[0]-q[0], dy=p[1]-q[1]; const dl=Math.hypot(dx,dy)||1; dx/=dl; dy/=dl;
        // the wall: within 3 mm and heading towards it -> run straight on into it
        const [wx,wy,wd]=nearO(p[0],p[1]);
        if(wd>T && wd<3.0*ppm && ((wx-p[0])*dx+(wy-p[1])*dy)/wd>0.5){ const ext=[]; let x=p[0], y=p[1];
          for(let k=0;k<16;k++){ x+=dx*0.25*ppm; y+=dy*0.25*ppm; ext.push([x,y]); if(nearO(x,y)[2]<=T) break; }
          if(nearO(x,y)[2]<=T*1.3){ if(end) l.p=l.p.concat(ext); else l.p=ext.reverse().concat(l.p); continue; } }
        // another line: centres 0.9-2.4 mm apart (a dough gap under 1.5 mm) -> join it
        const [lx,ly,ld]=nearL(p[0],p[1],l,i);
        if(ld>0.3*ppm && ld<2.4*ppm){ const seg=[]; const k=Math.max(1,Math.ceil(ld/(0.25*ppm))); for(let j=1;j<=k;j++) seg.push([p[0]+(lx-p[0])*j/k, p[1]+(ly-p[1])*j/k]); if(end) l.p=l.p.concat(seg); else l.p=seg.reverse().concat(l.p); } } } }
  // nubs: open lines shorter than 1 mm that hang off nothing
  for(let i=lines.length-1;i>=0;i--){ const l=lines[i]; if(!l.c && clLen(l.p)<1.0*ppm) lines.splice(i,1); }
  { dots.sort((a,b)=>b.r-a.r); const keep=[]; for(const d of dots){ if(!keep.some(k=>Math.hypot(k.cx-d.cx,k.cy-d.cy)<2.5*ppm)) keep.push(d); } dots.length=0; dots.push(...keep); }
  // dots: small ones solid (at least 2 mm across), big ones rings
  for(const d of dots){ if(d.r>2.25*ppm){ d.ring=true; } else d.r=Math.min(Math.max(d.r,d.keep?0.8*ppm:1.0*ppm),d.keep?1.0*ppm:2.0*ppm); }   // pupils at most 2 mm across
  return {lines,dots,hwOut}; }

// second pass, on the cutter as built: draw the ridges (0.9 mm) and the wall band, close every gap of dough narrower than
// ~1.5 mm (between two ridges, or a ridge and the wall), and take the centre lines again, so such a gap becomes one line
function clRefine(res,sil,W,H,ppm,dIn,opt){
  const M=new Uint8Array(W*H), B=(opt.wall||1.4)*ppm;
  for(let i=0;i<W*H;i++) if(sil[i]&&dIn[i]<=B) M[i]=1;
  for(const l of res.lines) clDisk(M,W,H,l.c?l.p.concat([l.p[0]]):l.p,0.45*ppm);
  for(const d of res.dots){ if(d.ring) clDisk(M,W,H,(()=>{ const C=[]; for(let k=0;k<=64;k++){ const a=2*Math.PI*k/64; C.push([d.cx+(d.r-0.45*ppm)*Math.cos(a), d.cy+(d.r-0.45*ppm)*Math.sin(a)]); } return C; })(),0.45*ppm); else clDisk(M,W,H,[[d.cx,d.cy]],d.r); }
  const cream=new Uint8Array(W*H); for(let i=0;i<W*H;i++) cream[i]=(sil[i]&&!M[i])?1:0;
  const dc=clDist(cream,W,H); let closed=0;
  const loops=res.lines.filter(l=>l.c&&clLen(l.p)>=3*ppm).map(l=>({p:l.p, a:Math.abs(l.p.reduce((s,q,i)=>{ const t=l.p[(i+1)%l.p.length]; return s+q[0]*t[1]-t[0]*q[1]; },0))/2}));
  const inside=(P,x,y)=>{ let c=false; for(let i=0,j=P.length-1;i<P.length;j=i++){ const a=P[i], b=P[j]; if(((a[1]>y)!==(b[1]>y)) && (x<(b[0]-a[0])*(y-a[1])/(b[1]-a[1])+a[0])) c=!c; } return c; };
  for(const c of clComps(cream,W,H)){ let mx=0, cx=0, cy=0, eye=false; for(const i of c){ if(dc[i]>mx) mx=dc[i]; const x=i%W, y=(i/W)|0; cx+=x; cy+=y; if(!eye) for(const d of res.dots) if(Math.hypot(x-d.cx,y-d.cy)<=d.r+1.0*ppm){ eye=true; break; } }
    if(mx>=0.75*ppm || eye) continue; cx/=c.length; cy/=c.length;
    if(loops.some(L=>inside(L.p,cx,cy) && c.length>=0.4*L.a)) continue;   // the inside of a closed eye or mouth stays open
    for(const i of c) M[i]=1; closed++; }
  if(!closed) return res;
  const ink=new Uint8Array(W*H); for(let i=0;i<W*H;i++) ink[i]=(M[i]&&sil[i])?1:0;
  const r2=clRidges(ink,W,H,ppm,dIn,clDist(ink,W,H),Object.assign({},opt,{noDots:true}));
  r2.dots=res.dots; r2.closedGaps=closed; return r2; }

function vectorDesign(img, sizeMM){
  // raster at ~720 px, black/white, padded
  const PAD=24, sc=Math.min(1, 720/Math.max(img.naturalWidth, img.naturalHeight));
  const w=Math.max(1,Math.round(img.naturalWidth*sc)), h=Math.max(1,Math.round(img.naturalHeight*sc)), W=w+2*PAD, H=h+2*PAD, N=W*H;
  const cv=document.createElement("canvas"); cv.width=w; cv.height=h; const g=cv.getContext("2d",{willReadFrequently:true});
  g.fillStyle="#fff"; g.fillRect(0,0,w,h); g.drawImage(img,0,0,w,h); const D=g.getImageData(0,0,w,h).data;
  const ink=new Uint8Array(N); let touchesEdge=false;
  for(let y=0;y<h;y++) for(let x=0;x<w;x++){ const i=(y*w+x)*4, v=(D[i]+D[i+1]+D[i+2])/3<128?1:0; ink[(y+PAD)*W+x+PAD]=v; if(v && (x===0||y===0||x===w-1||y===h-1)) touchesEdge=true; }
  const dist=m=>distTransform(m,W,H);
  const inv=m=>{ const o=new Uint8Array(N); for(let i=0;i<N;i++) o[i]=m[i]?0:1; return o; };
  const comps=m=>{ const lab=new Int32Array(N), out=[]; let n=0;
    for(let s=0;s<N;s++){ if(!m[s]||lab[s]) continue; n++; const st=[s], px=[]; lab[s]=n;
      while(st.length){ const i=st.pop(); px.push(i); const x=i%W; for(const j of [x>0?i-1:-1, x<W-1?i+1:-1, i-W, i+W]) if(j>=0&&j<N&&m[j]&&!lab[j]){ lab[j]=n; st.push(j); } } out.push(px); } return out; };
  const flood=free=>{ const out=new Uint8Array(N), st=[]; for(let x=0;x<W;x++) st.push(x,(H-1)*W+x); for(let y=0;y<H;y++) st.push(y*W, y*W+W-1);
    while(st.length){ const i=st.pop(); if(out[i]||!free[i]) continue; out[i]=1; const x=i%W; if(x>0) st.push(i-1); if(x<W-1) st.push(i+1); if(i>=W) st.push(i-W); if(i<N-W) st.push(i+W); } return out; };
  const close=(m,r)=>{ const d1=dist(inv(m)); const gr=new Uint8Array(N); for(let i=0;i<N;i++) gr[i]=(m[i]||d1[i]<=r)?1:0; const d2=dist(gr); const o=new Uint8Array(N); for(let i=0;i<N;i++) o[i]=(m[i]||(gr[i]&&d2[i]>r))?1:0; return o; };
  for(const c of comps(ink)) if(c.length<25) for(const i of c) ink[i]=0;
  let x0=W,x1=0,y0=H,y1=0; for(let i=0;i<N;i++) if(ink[i]){ const x=i%W,y=(i/W)|0; if(x<x0)x0=x; if(x>x1)x1=x; if(y<y0)y0=y; if(y>y1)y1=y; }
  if(x1<=x0) return null;
  let ppm=Math.max(x1-x0,y1-y0)/sizeMM;
  // the cookie: everything inside the outermost closed outline; small gaps (up to ~3.5 mm) are closed
  const silOf=r=>{ const s=close(ink,Math.round(r)), out=flood(inv(s)); const m=new Uint8Array(N); let a=0; for(let i=0;i<N;i++){ m[i]=out[i]?0:1; a+=m[i]; } return {m,a}; };
  const ref=silOf(ppm*4); let pick=null; for(const mm of [1,1.5,2,2.5,3,3.5]){ const s2=silOf(ppm*mm); if(s2.a>=0.9*ref.a){ pick=s2; break; } }
  let sil=(pick||ref).m; { const cs=comps(sil); cs.sort((a,b)=>b.length-a.length); sil=new Uint8Array(N); if(cs[0]) for(const i of cs[0]) sil[i]=1; }
  // notches (between fingers, petals): closing the outline's gaps also fills them. A small filled area that is really outside
  // (reachable from outside without closing) is a notch, not a leak: give it back
  { const raw=flood(inv(ink)); let A=0; for(let i=0;i<N;i++) A+=sil[i];
    const nm=new Uint8Array(N); for(let i=0;i<N;i++) nm[i]=(raw[i]&&sil[i])?1:0;
    for(const c of comps(nm)) if(c.length<0.03*A) for(const i of c) sil[i]=0; }
  // strokes poking out of the cookie (lash tips through the outline): parts narrower than ~2 mm that are mostly ink
  { const r=1.0*ppm, dI=dist(sil), core=new Uint8Array(N); for(let i=0;i<N;i++) core[i]=dI[i]>r?0:1; const dc=dist(core);
    const pro=new Uint8Array(N); for(let i=0;i<N;i++) pro[i]=(sil[i]&&dc[i]>r+0.5)?1:0;
    for(const c of comps(pro)){ let k=0; for(const i of c) if(ink[i]) k++; if(c.length>4 && k>=0.7*c.length) for(const i of c) sil[i]=0; }
    const cs=comps(sil); cs.sort((a,b)=>b.length-a.length); const keep=new Uint8Array(N); if(cs[0]) for(const i of cs[0]) keep[i]=1; sil=keep; }
  // the cookie itself decides the size (lines left outside an open outline don't count)
  x0=W; x1=0; y0=H; y1=0; for(let i=0;i<N;i++) if(sil[i]){ const x=i%W,y=(i/W)|0; if(x<x0)x0=x; if(x>x1)x1=x; if(y<y0)y0=y; if(y>y1)y1=y; }
  if(x1<=x0) return null; ppm=Math.max(x1-x0,y1-y0)/sizeMM;
  // much of the drawing outside the cookie means its outline is open: better to ask for a new drawing
  let outsideInk=0, totInk=0; for(let i=0;i<N;i++) if(ink[i]){ totInk++; if(!sil[i]) outsideInk++; }
  const openOutline = outsideInk > 0.03*totInk;
  // parts narrower than two cutting walls plus room for dough (~4.3 mm) can't be baked or cut cleanly
  let thinPart=false; { const r=2.15*ppm, dI=dist(sil), core=new Uint8Array(N); for(let i=0;i<N;i++) core[i]=dI[i]>r?0:1;
    const dc=dist(core), lost=new Uint8Array(N); for(let i=0;i<N;i++) lost[i]=(sil[i]&&dc[i]>r+1)?1:0;
    for(const c of comps(lost)) if(c.length>2*r*r){ thinPart=true; break; } }
  // very thin lines are thickened a little so their centre lines don't break up
  const di=dist(ink), hw=[]; for(let i=0;i<N;i++) if(ink[i]) hw.push(di[i]); hw.sort((a,b)=>a-b); const half=hw[Math.floor(hw.length*0.9)]||1, want=0.4*ppm;
  let fat=ink; if(half<want){ const dn=dist(inv(ink)); fat=new Uint8Array(N); for(let i=0;i<N;i++) fat[i]=(ink[i]||dn[i]<=want-half)?1:0; }
  const all=new Uint8Array(N); for(let i=0;i<N;i++) all[i]=(fat[i]&&sil[i])?1:0;
  // the outline: traced and smoothed (real corners kept)
  const tracePolys=(m, omit)=>{ const id={width:W,height:H,data:new Uint8ClampedArray(N*4)}; for(let i=0;i<N;i++){ const v=m[i]?0:255; id.data[i*4]=id.data[i*4+1]=id.data[i*4+2]=v; id.data[i*4+3]=255; }
    const td=ImageTracer.imagedataToTracedata(id,{ltres:0.5,qtres:0.5,pathomit:omit,rightangleenhance:false,colorsampling:0,numberofcolors:2,pal:[{r:0,g:0,b:0,a:255},{r:255,g:255,b:255,a:255}],blurradius:0,linefilter:true});
    const k=td.palette.findIndex(p=>p.r<128); const layer=td.layers[k<0?0:k]||[]; const polys=[];
    for(const path of layer){ const pts=[]; for(const s of path.segments){ if(s.type==="L"){ pts.push([s.x1,s.y1]); } else { for(let u=0;u<1;u+=0.2){ const a=(1-u)*(1-u), b=2*(1-u)*u, c=u*u; pts.push([a*s.x1+b*s.x2+c*s.x3, a*s.y1+b*s.y2+c*s.y3]); } } }
      if(pts.length>=3) polys.push(pts); } return polys; };
  const silPx=tracePolys(sil, 40).sort((a,b)=>b.length-a.length)[0]; if(!silPx) return null;
  const Opx=clSmooth(silPx, ppm, true, 1.2, 0.35).p;
  // inner lines: centre lines drawn again at one even width (see clRidges)
  const dS=dist(sil); let res=clRidges(all, W, H, ppm, dS, dist(all), {outline:Opx}); res=clRefine(res, sil, W, H, ppm, dS, {outline:Opx});
  const cx=(x0+x1)/2, cy=(y0+y1)/2, toMM=p=>p.map(q=>[(q[0]-cx)/ppm, (q[1]-cy)/ppm]);
  let outline=toMM(Opx); if(Math.abs(area(outline))<1) return null;
  // no needle-sharp outline points: convex tips get at least a 0.6 mm radius
  { const r=largest(offset(offset(offset(offset([outline],1.2,0.01),-1.2,0.01),-0.6,0.01),0.6,0.01)); if(r && Math.abs(area(r))>0.8*Math.abs(area(outline))) outline=r; }   // inside corners 1.2 mm, tips 0.6 mm
  // too many separate lines and dots for the cookie's size (a crowd, a busy scene): ask for a simpler drawing
  const tooBusy = 1000*(res.lines.length+res.dots.length)/Math.abs(area(outline)) > 28;
  const circ=(x,y,r)=>{ const C=[], m=Math.max(48,Math.round(r*20)); for(let i=0;i<m;i++){ const a=2*Math.PI*i/m; C.push([x+r*Math.cos(a), y+r*Math.sin(a)]); } return C; };
  let ridges=strokeLines(res.lines.map(l=>({p:toMM(l.p), c:l.c})), 0.9);
  for(const d of res.dots){ const [[x,y]]=toMM([[d.cx,d.cy]]), r=d.r/ppm; ridges=ridges.concat(d.ring ? strokeLines([{p:circ(x,y,r-0.45), c:true}], 0.9) : [circ(x,y,r)]); }
  const band=diff([outline], offset(offset(offset([outline], -1.4), -0.6, 0.01), 0.6, 0.01));   // cookie-side tips rounded too
  let inkMM=[]; try{ inkMM=inter(union(ridges.concat(band)), [outline]); }catch(e){ inkMM=[]; }
  try{ if(offset([outline], -1.4).filter(p=>Math.abs(area(p))>4 && area(p)*area(outline)>0).length>1) thinPart=true; }catch(e){}
  return {outline, ink:inkMM, touchesEdge, openOutline, thinPart, tooBusy, ppm};
}

function subjectBox(im){
  const iw=im.naturalWidth, ih=im.naturalHeight, sc=Math.min(1,320/Math.max(iw,ih)), W=Math.max(1,Math.round(iw*sc)), H=Math.max(1,Math.round(ih*sc));
  try{ const cv=document.createElement("canvas"); cv.width=W; cv.height=H; const g=cv.getContext("2d",{willReadFrequently:true}); g.drawImage(im,0,0,W,H);
    const d=g.getImageData(0,0,W,H).data; const at=(x,y)=>{const i=(y*W+x)*4; return [d[i],d[i+1],d[i+2],d[i+3]];};
    const cs=[at(0,0),at(W-1,0),at(0,H-1),at(W-1,H-1)]; const med=c=>cs.map(q=>q[c]).sort((a,b)=>a-b)[1]; const bg=[med(0),med(1),med(2),med(3)];
    let x0=W,y0=H,x1=-1,y1=-1;
    for(let y=0;y<H;y++) for(let x=0;x<W;x++){ const q=at(x,y); const on = bg[3]<128 ? q[3]>40 : (q[3]>40 && Math.abs(q[0]-bg[0])+Math.abs(q[1]-bg[1])+Math.abs(q[2]-bg[2])>60);
      if(on){ if(x<x0)x0=x; if(x>x1)x1=x; if(y<y0)y0=y; if(y>y1)y1=y; } }
    if(x1>x0 && y1>y0 && (x1-x0)*(y1-y0)>0.01*W*H) return {x:x0/sc, y:y0/sc, w:(x1-x0+1)/sc, h:(y1-y0+1)/sc};
  }catch(e){}
  return {x:0,y:0,w:iw,h:ih};
}
function startTrace(name){
  pushHist(); const keepPrint={...design.print}, lw=design.lineW, nm=name||design.name;
  design=blankDesign(); design.print=keepPrint; design.lineW=lw; design.sizeKey=sizeKey; if(nm){ design.name=nm; }
  // the subject (not the empty background around it) is sized to the chosen cookie size
  const iw=srcImage.naturalWidth, ih=srcImage.naturalHeight, S=(sizeObj()?sizeObj().mm:80), sb=subjectBox(srcImage);
  const k=S/Math.max(sb.w,sb.h);
  design.img={k, tx:-(sb.x+sb.w/2)*k, ty:-(sb.y+sb.h/2)*k, w:iw, h:ih};
  showImage=true; startSeen=true; if(cookieView||mode3d) setView("edit"); setTool("pen"); render(); fitView(); markDirty();
}
function autoTrace(){
  pushHist(); design.sketch=[]; design.holes=[]; showImage=false; runTrace(); setTool("select"); fitView(); markDirty();
}
// ---------- Redraw: an image model turns the upload into a cookie-friendly drawing, which is then traced ----------
let origImage=null, origURL=null, redrawnFrom=null, redrawJob=0, forceInkTrace=false, redrawTries=0;
function redrawStyle(){ const c=window.CUT_IT||{}; return c.REDRAW_STYLE==="color"? "color" : "lineart"; }
function redrawURL(){ const c=window.CUT_IT||{}; return (c.REDRAW_URL||"").replace(/\/+$/,""); }
function pictureForUpload(im){   // at most 1024 px, PNG (keeps transparency) or JPEG for photos
  const iw=im.naturalWidth, ih=im.naturalHeight, sc=Math.min(1,1024/Math.max(iw,ih));
  const cv=document.createElement("canvas"); cv.width=Math.max(1,Math.round(iw*sc)); cv.height=Math.max(1,Math.round(ih*sc));
  const g=cv.getContext("2d"); g.fillStyle="#f7f1e3"; g.fillRect(0,0,cv.width,cv.height); g.drawImage(im,0,0,cv.width,cv.height);
  const png=cv.toDataURL("image/png"); return png.length<3e6? png : cv.toDataURL("image/jpeg",0.9);
}
function setBusy(on){ $("busy").hidden=!on; }
async function redraw(){
  const base=redrawURL(); if(!base || !origImage) return;
  const job=++redrawJob, from=origURL; setBusy(true);
  const ctl=new AbortController(); const timer=setTimeout(()=>ctl.abort(), 100000);
  try{
    const res=await fetch(base+"/redraw",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({image:pictureForUpload(origImage), style:redrawStyle()}),signal:ctl.signal});
    const out=await res.json().catch(()=>({}));
    if(job!==redrawJob) return;
    if(!res.ok || !out.image || !/^data:image\/(png|jpeg|webp);base64,/.test(out.image)) throw new Error(out.error||("status "+res.status));
    const im=new Image();
    await new Promise((ok,bad)=>{ im.onload=ok; im.onerror=()=>bad(new Error("bad picture")); im.src=out.image; });
    if(job!==redrawJob || origURL!==from) return;
    pushHist(); srcImage=im; srcURL=out.image; redrawnFrom=from;
    design.sketch=[]; design.holes=[]; showImage=false;
    let vd=null; if(redrawStyle()==="lineart"){ try{ vd=vectorDesign(im, sizeMM()); }catch(err){ console.warn(err); vd=null; } }
    if(vd && (vd.touchesEdge || vd.openOutline || vd.thinPart || vd.tooBusy) && redrawTries<1){ redrawTries++; setBusy(false); return redraw(); }   // drawing ran off the picture: ask for a new one once
    if(vd && vd.outline && vd.ink.length){
      design.outline=vd.outline; design.lines=[]; design.blobs=[]; design.holes=[]; design.sketch=[];
      design.img={k:1/vd.ppm*0+1, tx:0, ty:0, w:im.naturalWidth, h:im.naturalHeight}; design.img=null;
      design.art={ink:vd.ink, w:0.9, v:(artV++), real:true, vector:true, resnap:true, busy:!!vd.tooBusy, thin:!!vd.thinPart};
      tracePushed=true; artSync(); render();
    } else { forceInkTrace=(redrawStyle()==="lineart"); try{ runTrace(); } finally { forceInkTrace=false; } }
    redrawTries=0; setTool("select"); fitView(); markDirty(); renderSelbar();
  }catch(err){
    if(job!==redrawJob) return;
    console.warn("redraw",err);
    toast(err.name==="AbortError"? "That took too long. Trace over the picture instead." : "Couldn't make the drawing. Trace over the picture instead.");
  }finally{ clearTimeout(timer); if(job===redrawJob) setBusy(false); }
}
function traceOriginal(){
  redrawJob++; setBusy(false); if(!origImage) return;
  srcImage=origImage; srcURL=origURL; redrawnFrom=null; startTrace(design.name);
}
function setTraceNote(t, bad){ if(bad && matchMedia("(max-width:860px)").matches) toast(t); const n=$("traceNote"); n.textContent=t; n.className="note"+(bad?" bad":""); n.hidden=false; }
function loadURL(url, name){
  const im=new Image();
  im.onload=()=>{
    srcImage=im; srcURL=url; $("srcThumb").src=srcURL; $("srcThumb").hidden=false;
    if(name){ design.name=name; $("name").value=name; }
    tracePushed=false; origImage=im; origURL=url; startTrace(name); showTab("image");
    if(redrawURL()) redraw();
  };
  im.onerror=()=>toast("Couldn't read that image.");
  im.src=url;
}
function loadFile(f){
  if(!f || !/^image\//.test(f.type)){ toast("That doesn't look like an image."); return; }
  const rd=new FileReader();
  rd.onload=()=>loadURL(rd.result, f.name.replace(/\.[^.]+$/,"").replace(/[_-]+/g," ").slice(0,40));
  rd.readAsDataURL(f);
}
$("drop").onclick=()=>$("file").click(); $("emptyUpload").onclick=()=>$("file").click();
$("file").onchange=e=>{ loadFile(e.target.files[0]); e.target.value=""; };
const stage=$("stage");
stage.addEventListener("dragover",e=>{e.preventDefault(); stage.classList.add("drag");});
stage.addEventListener("dragleave",e=>{ if(e.target===stage||!stage.contains(e.relatedTarget)) stage.classList.remove("drag");});
stage.addEventListener("drop",e=>{e.preventDefault(); stage.classList.remove("drag"); loadFile(e.dataTransfer.files[0]);});
$("drop").addEventListener("dragover",e=>e.preventDefault());
$("drop").addEventListener("drop",e=>{e.preventDefault(); loadFile(e.dataTransfer.files[0]);});
window.addEventListener("paste",e=>{ const it=[...((e.clipboardData||{}).items||[])].find(i=>i.type.startsWith("image/")); if(it) loadFile(it.getAsFile()); });
function renderExamples(){
  const w=$("examples"); if(!w || typeof EXAMPLES==="undefined") return; w.innerHTML="";
  for(const ex of EXAMPLES){ const b=document.createElement("button"); b.className="exbtn"; b.title=ex.label;
    const im=document.createElement("img"); im.src=ex.url; im.alt=ex.label; b.appendChild(im);
    const t=document.createElement("span"); t.textContent=ex.label; b.appendChild(t);
    b.onclick=()=>loadURL(ex.url, ex.name); w.appendChild(b); }
}

/* ---------------- size presets ---------------- */
function renderSizes(){
  const w=$("sizes"); w.innerHTML="";
  SIZES.forEach(z=>{const b=document.createElement("button"); b.innerHTML=`${z.label} <small>${z.mm/10} cm</small>`; if(z.k===sizeKey) b.classList.add("on");
    b.onclick=()=>{ sizeKey=z.k; design.sizeKey=z.k; pushHist(); applySizeDefaults(design,z); syncLineW(); loadPrint(); if(design.outline.length) fitReady(design, z.mm); renderSizes(); render(); fitView(); markDirty(); };
    w.appendChild(b);});
}

/* ---------------- tabs, settings ---------------- */
function showTab(t){ document.querySelectorAll(".tabs button").forEach(b=>b.classList.toggle("on",b.dataset.tab===t)); document.querySelectorAll(".tabpane").forEach(p=>p.classList.toggle("on",p.id==="tab-"+t)); }
document.querySelectorAll(".tabs button").forEach(b=>b.onclick=()=>showTab(b.dataset.tab));
const pfields=["h","dough","depth","tip","base","rimw","clear","plateT"];
function loadPrint(){
  pfields.forEach(k=>{ if($("p_"+k)) $("p_"+k).value=design.print[k]; });
  document.querySelectorAll("#styleSeg button").forEach(b=>b.classList.toggle("on",b.dataset.v===design.print.style));
  document.querySelectorAll("#effectSeg button").forEach(b=>b.classList.toggle("on",b.dataset.v===design.print.effect));
  $("stampOpts").style.display = design.print.style==="stamp" ? "" : "none";
  $("styleNote").textContent = design.print.style==="one"
    ? `One piece cuts and imprints in a single press. The lines sit ${(design.print.dough-design.print.depth).toFixed(1)} mm above the cutting edge, so with ${design.print.dough} mm dough they press ${design.print.depth} mm deep. Crossbars at the top hold the lines in place.`
    : "The cutter cuts the shape, then you press the stamp into the cookie. Good for small sizes and for fondant.";
}
pfields.forEach(k=>{ const e=$("p_"+k); if(!e) return; e.addEventListener("change",()=>{const v=parseFloat(e.value); if(isFinite(v)) design.print[k]=v; loadPrint(); render(); markDirty();}); });
document.querySelectorAll("#styleSeg button").forEach(b=>b.onclick=()=>{ if(b.dataset.v==="stamp" && (design.holes||[]).length){ toast("A cookie with a hole needs the one-piece cutter."); return; } design.print.style=b.dataset.v; loadPrint(); render(); markDirty(); });
document.querySelectorAll("#effectSeg button").forEach(b=>b.onclick=()=>{ design.print.effect=b.dataset.v; loadPrint(); markDirty(); });
$("widthMm").addEventListener("change",()=>{
  const v=parseFloat($("widthMm").value); if(!design.outline.length||!isFinite(v)||v<20) return;
  pushHist(); fitReady(design, v); sizeKey="custom"; design.sizeKey="custom"; renderSizes(); render(); fitView(); markDirty();
});
$("name").addEventListener("input",()=>{design.name=$("name").value;});
$("newBtn").onclick=()=>{ startSeen=false; pushHist(); const keepPrint={...design.print}, lw=design.lineW; design=blankDesign(); design.print=keepPrint; design.lineW=lw; design.sizeKey=sizeKey; srcImage=null; srcURL=null; origImage=null; origURL=null; redrawnFrom=null; redrawJob++; setBusy(false); $("srcThumb").hidden=true; $("traceNote").hidden=true; $("name").value=design.name; sel=null; render(); fitView(); markDirty(); renderGallery(); setView("edit"); setTool("pen"); };

/* =====================================================================
   3D (Manifold: watertight, printable meshes)
   ===================================================================== */
let MF=null; const mfReady=(async()=>{
  try{ const bin=Uint8Array.from(atob(window.MANIFOLD_WASM_B64),c=>c.charCodeAt(0)); const m=await ManifoldModule({wasmBinary:bin}); m.setup(); MF=m; }
  catch(e){ console.error("manifold failed",e); }
})();
function buildSolids(d0, mirror){
  if(!MF) return null;
  const d=readyDesign(d0); const pr=d.print; if(!d.outline.length) return null;
  const sx=mirror?-1:1, sy=-1; const T=ps=>ps.map(p=>p.map(q=>[q[0]*sx,q[1]*sy]));
  const live=[]; const keep=x=>{live.push(x);return x;};
  const ext=(polys,h,z0=0)=>{ polys=polys.filter(p=>p.length>2); if(!polys.length||h<=0) return null; const cs=keep(new MF.CrossSection(T(polys),"NonZero")); let m=keep(cs.extrude(h)); if(z0) m=keep(m.translate([0,0,z0])); return m; };
  const O=d.outline;
  const H=pr.h, taper=Math.min(5, Math.max(0,H-pr.rimh-2));
  const parts=[];
  parts.push(ext(diff(offset([O],pr.tip,0.02),[O]), H));
  parts.push(ext(diff(offset([O],pr.base,0.02),[O]), H-taper));
  if(pr.rimw>0) parts.push(ext(diff(offset([O],pr.base+pr.rimw,0.02),[O]), pr.rimh));
  const out={};
  const one = pr.style==="one" || d.holes.length>0;
  if(d.holes.length){
    parts.push(ext(diff(d.holes, offset(d.holes,-pr.tip,0.02)), H));
    parts.push(ext(diff(d.holes, offset(d.holes,-pr.base,0.02)), H-taper));
  }
  if(one && d.details.length){
    const ridges=inter(offset(d.details,0.25,0.02), offset([O],pr.tip*0.6,0.02));
    parts.push(ext(ridges, Math.max(pr.rimh+1, H-(pr.dough-pr.depth))));
  }
  if(one && d.bars.length) parts.push(ext(d.bars, RULES.barH));
  out.cutter=MF.Manifold.union(parts.filter(Boolean));
  if(!one && d.details.length){
    const plate=offset([O], -pr.clear, 0.02);
    if(pr.effect==="raised"){
      const base=ext(plate, pr.plateT+pr.depth); const pock=ext(d.details, pr.depth+0.5, pr.plateT);
      out.stamp=base.subtract(pock);
    } else {
      out.stamp=MF.Manifold.union([ext(plate,pr.plateT), ext(d.details,pr.depth,pr.plateT)].filter(Boolean));
    }
  }
  // remove zero-length edges left by the booleans so the exported mesh stays watertight in float32
  for(const k of ["cutter","stamp"]){ if(out[k]){ const t=out[k].simplify(window.__simp||0.001); out[k].delete(); out[k]=t; } }
  for(const x of live){ try{x.delete();}catch(e){} }
  return out;
}
function meshTris(man){
  // weld vertices that coincide (to 0.1 micron) and drop the zero-area triangles that leaves behind,
  // so the float32 STL stays watertight
  const m=man.getMesh(); const P=m.vertProperties, Tv=m.triVerts, np=m.numProp;
  const map=new Int32Array(P.length/np), key=new Map(), pos=[];
  for(let v=0; v<map.length; v++){ const W=window.__weld||1e4; const x=Math.round(P[v*np]*W), y=Math.round(P[v*np+1]*W), z=Math.round(P[v*np+2]*W); const k=x+","+y+","+z;
    let id=key.get(k); if(id===undefined){ id=pos.length/3; key.set(k,id); pos.push(x/W,y/W,z/W); } map[v]=id; }
  const out=[];
  for(let t=0;t<Tv.length;t+=3){ const a=map[Tv[t]], b=map[Tv[t+1]], c=map[Tv[t+2]]; if(a===b||b===c||a===c) continue;
    out.push(pos[a*3],pos[a*3+1],pos[a*3+2],pos[b*3],pos[b*3+1],pos[b*3+2],pos[c*3],pos[c*3+1],pos[c*3+2]); }
  return new Float32Array(out);
}
function stl(tris, name){
  const nT=tris.length/9; const buf=new ArrayBuffer(84+nT*50), dv=new DataView(buf);
  const hdr=("Cookie Cutter Studio - "+name).slice(0,79); for(let i=0;i<hdr.length;i++) dv.setUint8(i, hdr.charCodeAt(i)&127);
  dv.setUint32(80, nT, true); let o=84;
  for(let t=0;t<nT;t++){ const b=t*9;
    const ux=tris[b+3]-tris[b],uy=tris[b+4]-tris[b+1],uz=tris[b+5]-tris[b+2],vx=tris[b+6]-tris[b],vy=tris[b+7]-tris[b+1],vz=tris[b+8]-tris[b+2];
    let nx=uy*vz-uz*vy, ny=uz*vx-ux*vz, nz=ux*vy-uy*vx; const L=Math.hypot(nx,ny,nz)||1;
    dv.setFloat32(o,nx/L,true);dv.setFloat32(o+4,ny/L,true);dv.setFloat32(o+8,nz/L,true); o+=12;
    for(let k=0;k<9;k++){dv.setFloat32(o,tris[b+k],true);o+=4;}
    dv.setUint16(o,0,true); o+=2; }
  return new Uint8Array(buf);
}
function designSVG(d0){
  const d=readyDesign(d0); const bb=bbox([d.outline]); const m=5;
  return `<?xml version="1.0" encoding="UTF-8"?>\n<svg xmlns="http://www.w3.org/2000/svg" width="${(bb.w+2*m).toFixed(1)}mm" height="${(bb.h+2*m).toFixed(1)}mm" viewBox="${(bb.x0-m).toFixed(2)} ${(bb.y0-m).toFixed(2)} ${(bb.w+2*m).toFixed(2)} ${(bb.h+2*m).toFixed(2)}">\n<path id="cutter" d="${pathD([d.outline])}" fill="none" stroke="#000" stroke-width="0.3"/>\n<path id="imprint" d="${pathD(d.details)}" fill="#000"/>\n</svg>\n`;
}

/* ---------------- zip (store only) ---------------- */
const CRC=(()=>{const t=new Uint32Array(256);for(let n=0;n<256;n++){let c=n;for(let k=0;k<8;k++)c=c&1?0xEDB88320^(c>>>1):c>>>1;t[n]=c>>>0;}return t;})();
function crc32(u8){let c=0xFFFFFFFF;for(let i=0;i<u8.length;i++)c=CRC[(c^u8[i])&255]^(c>>>8);return (c^0xFFFFFFFF)>>>0;}
function zip(files){
  const enc=new TextEncoder(); const parts=[], central=[]; let off=0;
  for(const f of files){
    const data=typeof f.data==="string"?enc.encode(f.data):f.data; const nm=enc.encode(f.name); const crc=crc32(data);
    const h=new DataView(new ArrayBuffer(30));
    h.setUint32(0,0x04034b50,true);h.setUint16(4,20,true);h.setUint16(6,0x0800,true);h.setUint16(8,0,true);h.setUint32(10,0x00210000,true);
    h.setUint32(14,crc,true);h.setUint32(18,data.length,true);h.setUint32(22,data.length,true);h.setUint16(26,nm.length,true);h.setUint16(28,0,true);
    parts.push(new Uint8Array(h.buffer),nm,data);
    const c=new DataView(new ArrayBuffer(46));
    c.setUint32(0,0x02014b50,true);c.setUint16(4,20,true);c.setUint16(6,20,true);c.setUint16(8,0x0800,true);c.setUint16(10,0,true);c.setUint32(12,0x00210000,true);
    c.setUint32(16,crc,true);c.setUint32(20,data.length,true);c.setUint32(24,data.length,true);c.setUint16(28,nm.length,true);c.setUint32(42,off,true);
    central.push(new Uint8Array(c.buffer),nm);
    off+=30+nm.length+data.length;
  }
  const csize=central.reduce((a,b)=>a+b.length,0);
  const e=new DataView(new ArrayBuffer(22)); e.setUint32(0,0x06054b50,true); e.setUint16(8,files.length,true); e.setUint16(10,files.length,true); e.setUint32(12,csize,true); e.setUint32(16,off,true);
  return new Blob([...parts,...central,new Uint8Array(e.buffer)],{type:"application/zip"});
}
const safeName = s => (s||"cookie").trim().replace(/[^\w\- ]+/g,"").replace(/\s+/g,"-").toLowerCase().slice(0,40) || "cookie";
function filesFor(d, prefix=""){
  const s=buildSolids(d,true); if(!s||!s.cutter) return [];
  const n=safeName(d.name); const out=[{name:prefix+n+"-cutter.stl", data:stl(meshTris(s.cutter),d.name+" cutter")}];
  if(s.stamp) out.push({name:prefix+n+"-stamp.stl", data:stl(meshTris(s.stamp),d.name+" stamp")});
  out.push({name:prefix+n+".svg", data:designSVG(d)});
  try{s.cutter.delete(); s.stamp&&s.stamp.delete();}catch(e){}
  return out;
}
function readme(){ return `Cookie Cutter Studio export

HOW TO PRINT
- *-cutter.stl: print it as it comes, with the wide rim flat on the bed.
- *-stamp.stl (cutter + stamp style only): print with the flat back on the bed and the lines facing up.
- PLA or PETG, 0.4 mm nozzle, 0.2 mm layers, 3 walls, no supports needed.
- The files are mirrored on purpose: flip the parts over to use them and the cookie comes out the right way round.

HOW TO BAKE
- Roll the dough to 5 mm. The imprint lines are set up for that thickness:
  thinner dough gives faint lines, and thicker dough picks up marks from the crossbars.
- Dust the cutter with flour between cuts. Chill the cut cookies before baking.
- Use a recipe without baking powder or other raising agents so the lines stay sharp.

FOOD SAFETY
3D prints have small gaps between layers. Use a food-safe filament, keep dough contact short, and wash by hand in cool water.
`; }
let downloads=null;
async function saveBlob(blob, filename){
  if(downloads){
    try{ await downloads.save({filename, data:blob}); toast("Downloaded "+filename); return; }
    catch(err){ if(err && err.code==="declined") return; if(err && err.code==="rate_limited"){toast("Another download is waiting for your OK.");return;} console.warn(err); }
  }
  try{ const a=document.createElement("a"); a.href=URL.createObjectURL(blob); a.download=filename; document.body.appendChild(a); a.click(); setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove();},2000); }
  catch(e){ toast("Downloads aren't available here."); }
}
async function trySave(blob, filename){ // "ok" | "declined" | "fail"
  if(downloads){
    try{ await downloads.save({filename, data:blob}); toast("Downloaded "+filename); return "ok"; }
    catch(err){ if(err && err.code==="declined") return "declined"; if(err && err.code==="rate_limited"){toast("Another download is waiting for your OK.");return "declined";} console.warn(err); return "fail"; }
  }
  try{ const a=document.createElement("a"); a.href=URL.createObjectURL(blob); a.download=filename; document.body.appendChild(a); a.click(); setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove();},2000); return "ok"; }
  catch(e){ return "fail"; }
}
const pick=a=>a[Math.floor(Math.random()*a.length)];
/* ---------------- Claude: looks at the drawing, names it, and says what would make a better cookie ---------------- */
let sample=null, sampleImg=false, aiGranted=false, aiBusy=false, aiResult=null;
function designPNG(numbered){
  const R=cutterReady(design); const O=R.outline; if(!O.length) return Promise.resolve(null);
  const bb=bbox([O]); const S=720, m=40, k=(S-2*m)/Math.max(bb.w,bb.h);
  const cv=document.createElement("canvas"); cv.width=S; cv.height=S; const g=cv.getContext("2d");
  const X=q=>[m+(q[0]-bb.x0)*k+((S-2*m)-bb.w*k)/2, m+(q[1]-bb.y0)*k+((S-2*m)-bb.h*k)/2];
  const trace=(p,close)=>{ p.forEach((q,i)=>{ const t=X(q); if(i) g.lineTo(t[0],t[1]); else g.moveTo(t[0],t[1]); }); if(close) g.closePath(); };
  g.fillStyle="#fff"; g.fillRect(0,0,S,S);
  g.beginPath(); trace(O,true); (R.holes||[]).forEach(h=>trace(h,true)); g.fillStyle="#f1d8a8"; g.fill("evenodd"); g.lineWidth=5; g.strokeStyle="#6b3e1e"; g.stroke();
  g.fillStyle="#3b2410"; (design.blobs||[]).forEach(p=>{ g.beginPath(); trace(p,true); g.fill(); });
  g.lineCap="round"; g.lineJoin="round"; g.strokeStyle="#3b2410"; g.lineWidth=Math.max(3,design.lineW*k);
  design.lines.forEach(l=>{ g.beginPath(); trace(l.p,l.c); g.stroke(); });
  if(numbered){ g.font="bold 20px sans-serif"; g.textAlign="center"; g.textBaseline="middle";
    design.lines.forEach((l,i)=>{ const q=X(l.p[Math.floor(l.p.length/2)]); g.fillStyle="#fff"; g.beginPath(); g.arc(q[0],q[1],13,0,7); g.fill(); g.fillStyle="#d0006f"; g.fillText(String(i+1),q[0],q[1]+1); }); }
  return new Promise(res=>cv.toBlob(res,"image/png"));
}
const AI_MSG={rate_limited:"Cookie Monster AI is busy or you have reached a usage limit. It will try again later.", session_expired:"Cookie Monster AI needs you to sign in again.", refused:"Cookie Monster AI passed on this one.", image_rejected:"Cookie Monster AI couldn't read the drawing."};
function aiFail(e){ const c=e&&e.code; if(c==="rate_limited") aiPauseUntil=Date.now()+5*60000; if(["not_granted","sampling_disabled","not_declared","capability_disabled","capability_removed"].includes(c)){ $("aiBox").hidden=true; sample=null; return ""; } if(c==="cancelled") return ""; return AI_MSG[c]||"Cookie Monster AI couldn't answer just now."; }
let aiTimer=0, aiLastKey="", aiLastCall=0, aiPauseUntil=0;
function aiKey(){ const o=design.outline; if(!o.length) return ""; const b=bbox([o]); return [Math.round(b.w),Math.round(b.h),design.lines.length,Math.round(design.lines.reduce((a,l)=>a+plen(l.p),0)/3),(design.blobs||[]).length,(design.holes||[]).length].join("/"); }
function aiOn(){ const c=$("aiOn"); return !!(sample && c && c.checked); }
// Claude looks by itself once the person has stopped drawing for a moment. One call at a time, never
// twice for the same drawing, and at most one every 20 seconds.
function scheduleAI(ms){ if(!aiOn()) return; clearTimeout(aiTimer); aiTimer=setTimeout(maybeAI, ms||3500); }
function maybeAI(){
  if(!aiOn()) return; const now=Date.now();
  if(drag || aiBusy){ scheduleAI(1500); return; }
  if(now<aiPauseUntil) return;
  const key=aiKey(); if(!key || key===aiLastKey) return;
  if(now-aiLastCall<20000){ scheduleAI(20000-(now-aiLastCall)+200); return; }
  aiLastKey=key; aiLastCall=now; aiCheck();
}
async function aiCheck(){
  if(!sample||aiBusy) return; const R=cutterReady(design);
  if(!R.outline.length) return;
  aiBusy=true; aiResult=null; const out=$("aiOut"); out.innerHTML='<div class="ctip">Cookie Monster AI is looking at your cookie…</div>';
  const bb=bbox([R.outline]); const info=design.lines.map((l,i)=>({id:i+1, mm:Math.round(plen(l.p)), loop:!!l.c}));
  const hasSrc=!!(sampleImg && srcImage && design.img);
  const prompt=`Someone is designing a cookie cutter to 3D print. ${sampleImg?"The image shows their design: the tan shape is the cookie, white areas inside it are holes cut through, dark lines and dark filled areas get pressed into the dough. Each line carries a pink number."+(hasSrc?" The second image is the picture they uploaded, which the design was traced from. Traced lines that do not follow a real feature of that picture (leftovers of text, label lines, shading, noise) are clutter.":""):"You cannot see the design, only these facts about it."}
The cookie is ${Math.round(bb.w)} x ${Math.round(bb.h)} mm. Holes: ${(R.holes||[]).length}. Pressed areas or dots: ${(design.blobs||[]).length}. Lines (id, length in mm, whether it is a closed loop): ${JSON.stringify(info)}
What makes the best cutters: the cookie outline is smooth and chunky with nothing thinner than 5 mm; the inside is divided into a few big rounded areas; about 6 to 12 bold lines; lines end on the edge or on another line; one or two tiny marks at most; repeated lines only for one texture such as hair.
Reply with only a JSON object:
{"subject": what the drawing shows in 1 to 3 words, or "abstract shape" if unclear,
 "name": a short fun name for this cookie, 1 to 3 words, title case,
 "remove": ids of lines that are clutter and can go without losing what the drawing is (an empty array if none; never more than half the lines; never lines needed to recognise the subject),
 "tips": up to 3 specific suggestions that refer to parts of THIS drawing and that the person would change by hand, each under 9 words, plain everyday words, no jargon}
Example: {"subject":"cat face","name":"Sleepy Cat","remove":[7,9],"tips":["Make the ears wider at the base."]}`;
  try{
    const opts={modelTier:"default"}; if(sampleImg){ const png=await designPNG(true); if(png){ opts.images=[png]; if(hasSrc){ const sp=await srcPNG(); if(sp) opts.images.push(sp); } } }
    const r=await sample.json(prompt, opts); aiGranted=true;
    const n=design.lines.length; const rem=[...new Set((Array.isArray(r&&r.remove)?r.remove:[]).map(Number).filter(x=>Number.isInteger(x)&&x>=1&&x<=n))].slice(0,Math.floor(n/2));
    const tips=(Array.isArray(r&&r.tips)?r.tips:[]).map(String).filter(Boolean).slice(0,3);
    aiResult={subject:String(r&&r.subject||"").slice(0,40), name:String(r&&r.name||"").replace(/[<>]/g,"").slice(0,40), remove:rem, tips, key:JSON.stringify(design.lines.length)};
    const cur=($("name").value||"").trim(); if(aiResult.name && (!cur || /^untitled/i.test(cur) || design.autoNamed)){ $("name").value=aiResult.name; design.name=aiResult.name; design.autoNamed=true; }
    renderAI(); render();
  }catch(e){ const msg=aiFail(e); out.innerHTML= msg?`<div class="ctip warn"></div>`:""; if(msg) out.firstChild.textContent=msg; }
  finally{ aiBusy=false; }
}
function srcPNG(){ try{ const S=720, w=srcImage.naturalWidth, h=srcImage.naturalHeight, k=Math.min(1,S/Math.max(w,h)); const cv=document.createElement("canvas"); cv.width=Math.max(1,Math.round(w*k)); cv.height=Math.max(1,Math.round(h*k)); const g=cv.getContext("2d"); g.fillStyle="#fff"; g.fillRect(0,0,cv.width,cv.height); g.drawImage(srcImage,0,0,cv.width,cv.height); return new Promise(res=>cv.toBlob(res,"image/png")); }catch(e){ return Promise.resolve(null); } }
function aiCanRemove(){ const a=aiResult; return !!(a && a.remove.length && a.key===JSON.stringify(design.lines.length)); }
function aiRemove(){ const a=aiResult; if(!a||!a.remove.length) return; if(!aiCanRemove()){ toast("The drawing changed. Cookie Monster AI will look again."); return; }
  pushHist(); design.sketch=[]; const kill=new Set(a.remove.map(x=>x-1)); design.lines=design.lines.filter((l,i)=>!kill.has(i)); a.remove=[]; sel=null; render(); markDirty(); aiLastKey=aiKey(); renderAI(); toast("Removed. Undo brings them back."); }
function renderAI(){
  const out=$("aiOut"); out.innerHTML=""; const a=aiResult; if(!a) return;
  const add=(cls,txt)=>{ const d=document.createElement("div"); d.className="ctip "+cls; d.textContent=txt; out.appendChild(d); return d; };
  if(a.subject) add("ok", "Cookie Monster AI sees: "+a.subject+(a.name?". Named it “"+a.name+"”.":""));
  a.tips.forEach(t=>add("",t));
  if(a.remove.length){ const b=document.createElement("button"); b.className="primary"; b.style.marginTop="6px"; b.textContent=`Remove ${a.remove.length} cluttering line${a.remove.length>1?"s":""}`;
    b.onclick=aiRemove;
    out.appendChild(b); }
  if(!a.tips.length && !a.remove.length) add("ok","Nothing to fix. This is a good cookie.");
  if(innerWidth<=860 && !a.shown){ a.shown=true; toast("Cookie Monster AI: "+(a.tips[0]||(a.subject?"I see "+a.subject+". Looks good.":"Looks good."))); }
}
async function aiName(){ // only once the person has already let Claude help in this visit
  if(!sample||!aiGranted) return null;
  try{ const opts={modelTier:"quick"}; if(sampleImg){ const png=await designPNG(false); if(png) opts.images=[png]; }
    const r=await sample.json('The image shows a cookie design: the tan shape is the cookie, dark lines are pressed in. Reply with only JSON {"name": a short fun name for this cookie, 1 to 3 words, title case}. Example: {"name":"Sleepy Cat"}', opts);
    const n=String(r&&r.name||"").replace(/[<>]/g,"").trim().slice(0,40); return n||null;
  }catch(e){ aiFail(e); return null; }
}
function autoName(){
  const cur=($("name").value||"").trim();
  if(cur && !/^untitled/i.test(cur)) return cur;
  const R=cutterReady(design); const O=R.outline; let noun="Cookie";
  const preset=(design.sketch||[]).find(l=>l.shape&&l.k);
  if(O.length){
    const bb=bbox([O]); const A=Math.abs(area(O)); const P=plen(O.concat([O[0]])); const round=4*Math.PI*A/(P*P); const asp=bb.h/bb.w;
    if((R.holes||[]).length) noun=pick(["Donut","Ring","Bagel","Loop"]);
    else if(preset) noun={heart:pick(["Heart","Sweetheart"]),star:pick(["Star","Sparkle"]),circle:pick(["Moon","Button","Coin"]),oval:pick(["Egg","Pebble"]),square:pick(["Tile","Toast","Window"])}[preset.k]||"Cookie";
    else if(round>0.86 && asp>0.8 && asp<1.25) noun=pick(["Moon","Button","Pebble","Bun"]);
    else if(round<0.42) noun=pick(["Critter","Splat","Sprout","Monster"]);
    else if(asp>1.45) noun=pick(["Tower","Bottle","Totem","Carrot"]);
    else if(asp<0.69) noun=pick(["Cloud","Fish","Boat","Slipper"]);
    else noun=pick(["Blob","Potato","Creature","Nugget"]);
  }
  const n=design.lines.length+(design.blobs||[]).length;
  const adj = n===0 ? pick(["Plain","Smooth","Quiet"]) : n>12 ? pick(["Fancy","Busy","Wild"]) : pick(["Wobbly","Brave","Cheeky","Sleepy","Mighty","Lucky","Happy"]);
  const name=adj+" "+noun; $("name").value=name; design.name=name; return name;
}
$("dlBtn").onclick=async()=>{
  if(!design.outline.length){toast("Draw or upload something first.");return;}
  await mfReady; { const cur=($("name").value||"").trim(); if(!cur||/^untitled/i.test(cur)){ const n=await aiName(); if(n){ $("name").value=n; design.name=n; } } } design.name=autoName();
  const files=filesFor(design).filter(f=>/\.stl$/.test(f.name)); if(!files.length){toast("The outline is broken. Try redrawing it.");return;}
  for(const f of files){
    const r=await trySave(new Blob([f.data],{type:"model/stl"}), files.length===1 ? safeName(design.name)+".stl" : f.name);
    if(r==="declined") return;
    if(r==="fail"){ // some viewers only allow archives: hand over the same .stl files in a zip
      const z=await trySave(zip(files), safeName(design.name)+".zip");
      if(z==="ok") toast("This viewer only allows a zip. Your .stl is inside."); else if(z==="fail") toast("Downloads aren't available here.");
      return;
    }
  }
};

/* ---------------- 3D preview ---------------- */
let three=null;
function init3d(){
  if(three || typeof THREE==="undefined") return;
  const host=$("three");
  const renderer=new THREE.WebGLRenderer({antialias:true,alpha:true}); renderer.setPixelRatio(Math.min(2,devicePixelRatio));
  host.appendChild(renderer.domElement);
  const scene=new THREE.Scene();
  const cam=new THREE.PerspectiveCamera(35,1,1,5000); cam.up.set(0,0,1);
  scene.add(new THREE.HemisphereLight(0xfffaf0,0x8a7660,0.8));
  const dl=new THREE.DirectionalLight(0xffffff,0.7); dl.position.set(-80,-120,220); scene.add(dl);
  const ctl=new THREE.OrbitControls(cam, renderer.domElement); ctl.enableDamping=true;
  const group=new THREE.Group(); scene.add(group);
  three={renderer,scene,cam,ctl,group};
  const loop=()=>{ if(mode3d){ctl.update(); renderer.render(scene,cam);} requestAnimationFrame(loop); }; loop();
  new ResizeObserver(size3d).observe(host);
}
function size3d(){ if(!three) return; const r=$("three").getBoundingClientRect(); if(!r.width) return; three.renderer.setSize(r.width,r.height); three.cam.aspect=r.width/r.height; three.cam.updateProjectionMatrix(); }
function geomFrom(man){ const tris=meshTris(man); const g=new THREE.BufferGeometry(); g.setAttribute("position",new THREE.BufferAttribute(tris,3)); g.computeVertexNormals(); return g; }
async function update3d(){
  init3d(); if(!three) return; await mfReady;
  const g=three.group; while(g.children.length){const c=g.children.pop(); c.geometry.dispose();}
  if(!design.outline.length) return;
  const s=buildSolids(design,false); if(!s) return;
  const bb=bbox([cutterReady(design).outline]); const gapX=bb.w+18;
  const mat1=new THREE.MeshStandardMaterial({color:0xff4f9a,roughness:.55,flatShading:true});
  const mat2=new THREE.MeshStandardMaterial({color:0xe6ff00,roughness:.6,flatShading:true});
  g.add(new THREE.Mesh(geomFrom(s.cutter),mat1));
  if(s.stamp){ const b=new THREE.Mesh(geomFrom(s.stamp),mat2); b.position.x=gapX; g.add(b); }
  g.position.set(s.stamp?-gapX/2:0, 0, 0);
  try{s.cutter.delete(); s.stamp&&s.stamp.delete();}catch(e){}
  const R=Math.max(bb.w*(s.stamp?2.2:1.15), bb.h);
  const r3=$("three").getBoundingClientRect(); const asp=r3.width/Math.max(1,r3.height); const kz=asp<1?Math.min(2.4,1.08/asp):1;
  three.cam.position.set(0,-R*1.5*kz,R*1.3*kz); three.ctl.target.set(0,0,design.print.h/3); three.ctl.update();
  size3d();
}
function setView(v){
  if(v==="3d" && !design.outline.length){ toast("Make a shape first."); return; }
  mode3d = v==="3d"; cookieView = v==="cookie";
  stage.classList.toggle("show3d", mode3d); stage.classList.toggle("cookie", cookieView);
  $("vCookie").classList.toggle("on", v==="cookie"); $("v2d").classList.toggle("on", v==="edit"); $("v3d").classList.toggle("on", v==="3d");
  if(mode3d) update3d(); else { render(); applyView(); }
}
const isPhone=()=>matchMedia("(max-width:860px)").matches;
$("vCookie").onclick=()=>{ setView("cookie"); if(isPhone()) fitView(); }; $("v2d").onclick=()=>{ setView("edit"); if(isPhone()){ if(tool==="select") setTool("pen"); fitView(); } }; $("v3d").onclick=()=>setView("3d");
// on a phone the view switch sits in the top bar; on desktop it floats over the canvas
function placeToggle(){ const tg=$("viewtoggle"); if(isPhone()){ if(tg.parentNode!==$("dlBtn").parentNode) $("dlBtn").parentNode.insertBefore(tg,$("dlBtn")); if(layers.pen && tool==="select") setTool("pen"); } else if(tg.parentNode!==stage){ stage.insertBefore(tg,$("empty")); } }
matchMedia("(max-width:860px)").addEventListener("change",placeToggle); placeToggle();
$("clearBtn").onclick=()=>{ if(!design.outline.length && !SK().length && !design.lines.length) return; $("newBtn").click(); toast("Cleared. Undo brings it back."); };
let dirty3d=0;
function markDirty(){ updUndo(); if(typeof scheduleAI==="function") scheduleAI(); if(mode3d){ clearTimeout(dirty3d); dirty3d=setTimeout(update3d,250);} }

/* ---------------- gallery encoding ---------------- */
const encPoly=p=>p.map(q=>r2(q[0])+","+r2(q[1])).join(" ");
const decPoly=s=>String(s||"").trim().split(/\s+/).filter(Boolean).map(t=>t.split(",").map(Number)).filter(q=>q.length===2&&q.every(isFinite));
function encode(d){return {name:(d.name||"Untitled").slice(0,60), author:($("author").value||"").slice(0,40), outline:encPoly(d.outline),
  lines:d.lines.map(l=>(l.c?"c ":"")+encPoly(l.p)), blobs:d.blobs.map(encPoly), holes:(d.holes||[]).map(encPoly), lineW:d.lineW, frame:d.frame||"figure", print:{...d.print}, size:d.sizeKey||sizeKey, updatedAt:Date.now(),
  art: d.art && d.art.ink && d.art.ink.length<=400 ? {w:r2(d.art.w), real:!!d.art.real, ink:d.art.ink.map(encPoly), fills:(d.art.fills||[]).slice(0,60).map(f=>({c:f.c, p:f.p.map(encPoly)}))} : null};}
function decode(id, o){
  const d=blankDesign(); d.id=id; d.name=String(o.name||"Untitled"); d.author=String(o.author||"");
  try{
    d.outline=decPoly(o.outline);
    d.lines=(Array.isArray(o.lines)?o.lines:[]).map(s=>{s=String(s); const c=s.startsWith("c "); return {p:decPoly(c?s.slice(2):s), c};}).filter(l=>l.p.length>=1);
    d.blobs=(Array.isArray(o.blobs)?o.blobs:Array.isArray(o.details)?o.details:[]).map(decPoly).filter(p=>p.length>=3);
    d.holes=(Array.isArray(o.holes)?o.holes:[]).map(decPoly).filter(p=>p.length>=3);
  }catch(e){}
  try{ if(o.art && Array.isArray(o.art.ink) && typeof o.art.w==="number"){ const ink=o.art.ink.map(decPoly).filter(p=>p.length>=3);
      const fills=(Array.isArray(o.art.fills)?o.art.fills:[]).map(f=>({c:/^rgb\(\d{1,3},\d{1,3},\d{1,3}\)$/.test(String(f.c))?String(f.c):"#fff", p:(Array.isArray(f.p)?f.p:[]).map(decPoly).filter(p=>p.length>=3)})).filter(f=>f.p.length);
      if(ink.length) d.art={ink, w:o.art.w, real:!!o.art.real, fills, v:(artV++), resnap:true}; } }catch(e){}
  if(typeof o.lineW==="number" && o.lineW>0.3 && o.lineW<5) d.lineW=o.lineW;
  if(["figure","circle","oval","plaque"].includes(o.frame)) d.frame=o.frame;
  if(o.print && typeof o.print==="object") for(const k in DEFAULT_PRINT){ if(typeof o.print[k]===typeof DEFAULT_PRINT[k]) d.print[k]=o.print[k]; }
  if(!["one","stamp"].includes(d.print.style)) d.print.style="one";
  d.updatedAt=+o.updatedAt||0; d.sizeKey=SIZES.some(z=>z.k===o.size)?o.size:"custom"; return d;
}
function thumb(d0){
  const s=document.createElementNS(NS,"svg");
  const d=readyDesign(d0); if(!d.outline.length) return s;
  const bb=bbox([d.outline]); const m=Math.max(bb.w,bb.h)*0.1; const S=Math.max(bb.w,bb.h)+2*m;
  s.setAttribute("viewBox",`${bb.x0+bb.w/2-S/2} ${bb.y0+bb.h/2-S/2} ${S} ${S}`);
  el("path",{d:pathD([d.outline]),fill:"#3b2410",opacity:.22,transform:`translate(${S*0.01} ${S*0.018})`},s);
  el("path",{d:pathD([d.outline]),fill:"url(#dough)"},s);
  el("path",{d:pathD(d.details),fill:"#b9793a",filter:"url(#groove)"},s);
  return s;
}

/* ---------------- gallery (shared via db, local fallback) ---------------- */
let db=null, galItems=[], usingLocal=false;
function localLoad(){ try{ return JSON.parse(localStorage.getItem("ccs-gallery2")||"{}"); }catch(e){ return {}; } }
function localSave(m){ try{ localStorage.setItem("ccs-gallery2",JSON.stringify(m)); }catch(e){} }
function setLocalItems(){ const m=localLoad(); galItems=Object.entries(m).map(([id,o])=>decode(id,o)).sort((a,b)=>b.updatedAt-a.updatedAt); renderGallery(); }
function card(d, opts){
  const c=document.createElement("div"); c.className="gcard"+(design.id&&design.id===d.id?" cur":"");
  c.appendChild(thumb(d));
  const t=document.createElement("div"); t.className="t"; t.textContent=d.name; c.appendChild(t);
  if(opts.author!==false){ const a=document.createElement("div"); a.className="a"; a.textContent=d.author?"by "+d.author:" "; c.appendChild(a); }
  if(opts.actions){
    const acts=document.createElement("div"); acts.className="acts";
    const bD=document.createElement("button"); bD.textContent="STL"; bD.title="Download STL files"; bD.onclick=async ev=>{ev.stopPropagation(); await mfReady; const f=filesFor(d); f.push({name:"README.txt",data:readme()}); saveBlob(zip(f), safeName(d.name)+".zip");};
    const bX=document.createElement("button"); bX.textContent="Delete"; bX.title="Delete";
    bX.onclick=async ev=>{ev.stopPropagation(); if(bX.dataset.arm!=="1"){bX.dataset.arm="1"; bX.textContent="Sure?"; setTimeout(()=>{bX.dataset.arm="";bX.textContent="Delete";},3000); return;} await deleteDesign(d.id);};
    acts.append(bD,bX); c.appendChild(acts);
  }
  c.onclick=()=>opts.open(d);
  return c;
}
function renderGallery(){
  const g=$("gallery"); g.innerHTML="";
  if(!galItems.length){ const p=document.createElement("div"); p.className="note"; p.style.gridColumn="1/-1"; p.textContent="Nothing saved yet. Make a cookie and press Save to gallery."; g.appendChild(p); }
  for(const d of galItems) g.appendChild(card(d,{actions:true, open:openDesign}));
}
function openDesign(d){
  pushHist();
  design=JSON.parse(JSON.stringify(d)); design.img=null; srcImage=null; srcURL=null; origImage=null; origURL=null; redrawnFrom=null; redrawJob++; setBusy(false); $("srcThumb").hidden=true; $("traceNote").hidden=true;
  $("name").value=design.name; sizeKey=design.sizeKey||"custom"; renderSizes(); syncLineW(); loadPrint(); sel=null; selNode=-1; render(); fitView(); markDirty(); renderGallery();
}
async function saveDesign(){
  if(!design.outline.length){toast("Make a shape first.");return;}
  design.name=autoName();
  const body=encode(design);
  if(JSON.stringify(body).length>250000){ toast("This design has too many points. Use Fewer points first."); return; }
  $("saveBtn").disabled=true;
  try{
    if(db && !usingLocal){
      if(design.id && !String(design.id).startsWith("starter")){ await db.collection("designs").doc(design.id).set(body); }
      else { const ref=await db.collection("designs").add(body); design.id=ref.id; }
    } else {
      const m=localLoad(); if(!design.id||String(design.id).startsWith("starter")) design.id="l"+Date.now().toString(36); m[design.id]=body; localSave(m); setLocalItems();
    }
    toast(usingLocal||!db?"Saved in this browser":"Saved to the shared gallery");
    renderGallery();
  }catch(err){
    console.warn(err);
    if(err && err.code==="invalid_argument") toast("You can view the gallery but not add to it. Ask the owner for Contributor access.");
    else if(err && err.code==="quota_exceeded") toast("The gallery is full. Delete a few old designs.");
    else toast("Couldn't save. Try again.");
  }finally{ $("saveBtn").disabled=false; }
}
async function deleteDesign(id){
  try{
    if(db && !usingLocal) await db.collection("designs").doc(id).delete();
    else { const m=localLoad(); delete m[id]; localSave(m); setLocalItems(); }
    if(design.id===id) design.id=null; toast("Deleted");
  }catch(e){ toast("Couldn't delete that one."); }
}
$("saveBtn").onclick=saveDesign;
$("dlAll").onclick=async()=>{
  if(!galItems.length){toast("The gallery is empty.");return;}
  await mfReady; const files=[]; const used=new Set();
  for(const d of galItems){ let n=safeName(d.name), k=n, i=2; while(used.has(k)) k=n+"-"+(i++); used.add(k);
    try{ files.push(...filesFor(d, k+"/")); }catch(e){ console.warn(e); } }
  files.push({name:"README.txt",data:readme()});
  saveBlob(zip(files), "cookie-cutters-all.zip");
};
try{ $("author").value=localStorage.getItem("ccs-author")||""; }catch(e){}
$("author").addEventListener("change",()=>{ try{localStorage.setItem("ccs-author",$("author").value);}catch(e){} });
async function initCaps(){
  if(!window.claude || typeof window.claude.use!=="function"){ usingLocal=true; $("galStatus").textContent="Saved in this browser only."; setLocalItems(); return; }
  claude.use("downloads").then(d=>{downloads=d;}).catch(()=>{});
  claude.use("sample").then(async f=>{ if(!f) return; sample=f; const lim=await f.limits().catch(()=>null); sampleImg=!!(lim&&lim.images); $("aiBox").hidden=false; scheduleAI(); }).catch(()=>{});
  let timer=setTimeout(()=>{ $("galStatus").textContent="Can't reach the shared gallery yet…"; },10000);
  try{ db=await claude.use("db"); }catch(e){ db=null; }
  if(!db){ clearTimeout(timer); usingLocal=true; $("galStatus").textContent="The shared gallery isn't available here, so designs are saved in this browser only."; setLocalItems(); return; }
  db.collection("designs").orderBy("updatedAt","desc").limit(300).onSnapshot(s=>{
    clearTimeout(timer);
    galItems=s.docs.map(x=>decode(x.id,x.data()||{}));
    $("galStatus").textContent = galItems.length? `${galItems.length} design${galItems.length>1?"s":""} from the group. Updates live.` : "Everyone with this link shares one gallery.";
    renderGallery();
  }, err=>{ clearTimeout(timer); $("galStatus").textContent="The shared gallery stopped updating. Reload to reconnect."; });
}

/* ---------------- starter designs (original, pre-traced) ---------------- */
function renderStarters(){
  const g1=$("starters"), g2=$("starters2"); g1.innerHTML=""; g2.innerHTML="";
  if(typeof STARTERS==="undefined") return;
  STARTERS.forEach((o,i)=>{
    const d=decode("starter"+i, o); const g=o.group==="theme"?g1:g2;
    g.appendChild(card(d,{author:false, open:(dd)=>{
      pushHist(); const pr={...design.print}; design=JSON.parse(JSON.stringify(dd)); design.id=null; design.print=pr;
      if(!sizeObj()){sizeKey="regular";} design.sizeKey=sizeKey; applySizeDefaults(design,sizeObj()); fitReady(design,sizeMM());
      $("name").value=design.name; sel=null; srcImage=null; srcURL=null; origImage=null; origURL=null; redrawnFrom=null; redrawJob++; setBusy(false); $("srcThumb").hidden=true; $("traceNote").hidden=true;
      renderSizes(); syncLineW(); loadPrint(); render(); fitView(); markDirty(); renderGallery(); }}));
  });
}

/* ---------------- toast & boot ---------------- */
let tt=0; function toast(m){const t=$("toast"); t.textContent=m; t.classList.add("show"); clearTimeout(tt); tt=setTimeout(()=>t.classList.remove("show"),2800);}
setupSvg(); updOut(); syncLineW(); loadPrint(); renderSizes(); setTool("select"); render(); updUndo(); renderStarters(); renderExamples();
requestAnimationFrame(()=>{ setTool("pen"); });
new ResizeObserver(()=>{ if(!mode3d) applyView(); }).observe(svg);
initCaps();
$("aiOn").onchange=()=>{ if($("aiOn").checked) scheduleAI(300); else { clearTimeout(aiTimer); $("aiOut").innerHTML=""; } };
document.querySelectorAll("#shapes button").forEach(b=>b.onclick=()=>startShape(b.dataset.s));
$("emptyDraw").onclick=()=>{ startSeen=true; setTool("pen"); render(); };
$("upBtn").onclick=()=>$("file").click();
window.__ccs={simplifyDrawing, designPNG, aiCheck, finishPen, sketchBuild, coach, startShape, setView, fromVector, decode, get design(){return design;}, set design(v){design=v;}, traceImage, buildSolids, filesFor, zip, loadURL, setTool, update3d, cutterReady, mfReady, encode, fitReady, sizeMM, render, fitView, getTraceOpts};
})();
