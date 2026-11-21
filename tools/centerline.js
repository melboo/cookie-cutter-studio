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
  // near-elliptical closed loops (a bell's rim, a cherry, a grape) become true ellipses: least-squares fit on the principal axes
  if(closed && n>=16){ let cx=0,cy=0; for(const q of Q){ cx+=q[0]; cy+=q[1]; } cx/=n; cy/=n; let sxx=0,syy=0,sxy=0; for(const q of Q){ const dx=q[0]-cx, dy=q[1]-cy; sxx+=dx*dx; syy+=dy*dy; sxy+=dx*dy; }
    const th=0.5*Math.atan2(2*sxy,sxx-syy), c=Math.cos(th), sn=Math.sin(th); let a11=0,a12=0,a22=0,b1=0,b2=0; const UV=Q.map(q=>{ const dx=q[0]-cx, dy=q[1]-cy; return [dx*c+dy*sn, -dx*sn+dy*c]; });
    for(const [u,v] of UV){ const U=u*u, V=v*v; a11+=U*U; a12+=U*V; a22+=V*V; b1+=U; b2+=V; } const det=a11*a22-a12*a12;
    if(Math.abs(det)>1e-12){ const A=(b1*a22-b2*a12)/det, B=(a11*b2-a12*b1)/det;
      if(A>0&&B>0){ const ra=1/Math.sqrt(A), rb=1/Math.sqrt(B); let dev=0; for(const [u,v] of UV){ const r=Math.sqrt(u*u*A+v*v*B); dev=Math.max(dev,Math.abs(r-1)); }
        if(dev<0.07 && Math.max(ra,rb)<25*ppm){ const m=Math.max(48,Math.round(2*Math.PI*Math.max(ra,rb)/step)), E=[]; for(let i=0;i<m;i++){ const t=2*Math.PI*i/m, u=ra*Math.cos(t), v=rb*Math.sin(t); E.push([cx+u*c-v*sn, cy+u*sn+v*c]); } return {p:E,c:true,circle:{cx,cy,R:(ra+rb)/2}}; } } } }
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
    const D=2.8*ppm, T=0.8*ppm;
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
        if(wd>T && wd<3.2*ppm){ const k=Math.max(1,Math.ceil((wd-T)/(0.25*ppm))), seg=[]; for(let j=1;j<=k;j++){ const t=j/k*(wd-T)/wd; seg.push([p[0]+(wx-p[0])*t, p[1]+(wy-p[1])*t]); } if(end) l.p=l.p.concat(seg); else l.p=seg.reverse().concat(l.p); continue; }
        // another line: centres 0.9-1.8 mm apart (a dough gap under ~0.9 mm) and heading towards it -> join it
        const [lx,ly,ld]=nearL(p[0],p[1],l,i);
        if(ld>0.3*ppm && ld<1.8*ppm && ((lx-p[0])*dx+(ly-p[1])*dy)/ld>0.3){ const seg=[]; const k=Math.max(1,Math.ceil(ld/(0.25*ppm))); for(let j=1;j<=k;j++) seg.push([p[0]+(lx-p[0])*j/k, p[1]+(ly-p[1])*j/k]); if(end) l.p=l.p.concat(seg); else l.p=seg.reverse().concat(l.p); } } } }
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
