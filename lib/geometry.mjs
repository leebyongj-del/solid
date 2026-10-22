export const add=(a,b)=>a.map((v,i)=>v+b[i]);
export const sub=(a,b)=>a.map((v,i)=>v-b[i]);
export const mul=(a,s)=>a.map(v=>v*s);
export const dot=(a,b)=>a.reduce((s,v,i)=>s+v*b[i],0);
export const cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
export const norm=a=>mul(a,1/(Math.hypot(...a)||1));
export const center=p=>mul(p.reduce(add,[0,0,0]),1/p.length);
export const normal=p=>norm(cross(sub(p[1],p[0]),sub(p[2],p[0])));
export function rotate(p,a,b,theta){let v=sub(p,a),k=norm(sub(b,a)),c=Math.cos(theta),s=Math.sin(theta);return add(a,add(add(mul(v,c),mul(cross(k,v),s)),mul(k,dot(k,v)*(1-c))));}
export const shapes=[
{id:'cube',name:'정육면체',kind:'다면체',hint:'합동인 정사각형 6개로 둘러싸여 있어요.'},
{id:'cuboid',name:'직육면체',kind:'다면체',hint:'마주 보는 면이 평행하고 합동인 직사각형이에요.'},
{id:'icosa',name:'정이십면체',kind:'다면체',hint:'정삼각형 20개로 둘러싸인 정다면체예요.'},
{id:'dodeca',name:'정십이면체',kind:'다면체',hint:'정오각형 12개로 둘러싸인 정다면체예요.'},
{id:'bipyramid',name:'쌍각뿔',kind:'다면체',hint:'두 각뿔의 밑면을 맞붙인 입체예요.'},
{id:'doubleFrustum',name:'두 원뿔대를 붙인 입체',kind:'회전체',hint:'가운데가 넓고 위아래가 좁은 두 원뿔대를 합쳤어요.'},
{id:'hourglass',name:'모래시계 모양 회전체',kind:'회전체',hint:'가운데가 좁아지는 단면을 회전시켜요.'},
{id:'ellipsoid',name:'타원체',kind:'회전체',hint:'타원을 장축 또는 단축 둘레로 회전시킨 입체를 관찰해요.'},
{id:'capsule',name:'캡슐 모양 회전체',kind:'회전체',hint:'원기둥의 양 끝에 반구를 붙인 모양이에요.'},
{id:'stepped',name:'계단 모양 회전체',kind:'회전체',hint:'반지름이 다른 원기둥들을 같은 축 위에 겹친 모양이에요.'},
{id:'vase',name:'꽃병 모양 회전체',kind:'회전체',hint:'높이에 따라 반지름이 달라지는 단면을 관찰해요.'},
{id:'prism',name:'각기둥',kind:'다면체',icon:'⬡',hint:'두 밑면이 서로 평행하고 합동인 다각형이에요.'},
{id:'pyramid',name:'각뿔',kind:'다면체',icon:'△',hint:'밑면은 다각형, 옆면은 한 꼭짓점에서 만나는 삼각형이에요.'},
{id:'frustum',name:'각뿔대',kind:'다면체',icon:'⏢',hint:'각뿔을 밑면과 평행한 평면으로 잘라 얻는 입체예요.'},
{id:'oblique',name:'기울어진 각기둥',kind:'다면체',icon:'▱',hint:'기울어져도 두 밑면은 평행하고 합동이에요.'},
{id:'concave',name:'오목한 별기둥',kind:'다면체',icon:'☆',hint:'밑면이 오목한 다각형이어도 다면체가 될까요?'},
{id:'tetra',name:'정사면체',kind:'다면체',icon:'△',hint:'정삼각형 4개로 둘러싸인 정다면체예요.'},
{id:'octa',name:'정팔면체',kind:'다면체',icon:'◇',hint:'정삼각형 8개로 둘러싸인 정다면체예요.'},
{id:'cylinder',name:'원기둥',kind:'회전체',icon:'▤',hint:'직사각형을 한 변을 포함하는 직선 둘레로 한 바퀴 회전시켜요.'},
{id:'cone',name:'원뿔',kind:'회전체',icon:'△',hint:'직각삼각형을 직각을 낀 한 변 둘레로 회전시켜요.'},
{id:'truncated',name:'원뿔대',kind:'회전체',icon:'⏢',hint:'회전축 쪽 두 각이 직각인 사다리꼴을 회전시켜요.'},
{id:'sphere',name:'구',kind:'회전체',icon:'○',hint:'반원을 지름 둘레로 한 바퀴 회전시켜요.'},
{id:'double',name:'두 원뿔이 붙은 입체',kind:'회전체',icon:'◇',hint:'마름모를 한 대각선을 포함하는 직선 둘레로 회전시켜요.'},
{id:'torus',name:'고리 모양 회전체',kind:'회전체',icon:'◎',hint:'원을 그 원과 같은 평면 위의, 원과 만나지 않는 직선 둘레로 회전시켜요.'},
{id:'compound',name:'원기둥 + 원뿔',kind:'회전체',icon:'♧',hint:'단면을 회전시켜 보면 결합한 입체도 회전체인지 확인할 수 있어요.'}
];
// Group coplanar hull vertices into true polygon faces (not triangulated face counts).
function hull(vertices){const faces=new Map(),eps=1e-6;for(let a=0;a<vertices.length;a++)for(let b=a+1;b<vertices.length;b++)for(let c=b+1;c<vertices.length;c++){const n=normal([vertices[a],vertices[b],vertices[c]]);if(Math.hypot(...n)<.5)continue;const ds=vertices.map(p=>dot(n,sub(p,vertices[a])));if(ds.some(d=>d>eps)&&ds.some(d=>d<-eps))continue;const ids=ds.map((d,i)=>Math.abs(d)<eps?i:-1).filter(i=>i>=0),key=ids.join(',');if(faces.has(key))continue;const mid=center(ids.map(i=>vertices[i])),u=norm(sub(vertices[ids[0]],mid)),v=cross(n,u);ids.sort((a,b)=>Math.atan2(dot(sub(vertices[a],mid),v),dot(sub(vertices[a],mid),u))-Math.atan2(dot(sub(vertices[b],mid),v),dot(sub(vertices[b],mid),u)));faces.set(key,ids);}return [...faces.values()];}
export function shapePresets(){return shapes.flatMap(s=>['prism','pyramid','frustum','oblique','concave','bipyramid'].includes(s.id)?Array.from({length:10},(_,i)=>({key:s.id+'-'+(i+3),name:s.id==='concave'?`${i+3}꼭짓점 별기둥`:s.id==='bipyramid'?`${i+3}각 쌍각뿔`:`${i+3}각${s.id==='prism'?'기둥':s.id==='pyramid'?'뿔':s.id==='frustum'?'뿔대':'기둥 (기울어진 모양)'}`,kind:s.kind,model:{id:s.id,n:i+3,h:2.2,r:1,top:.55}})):[{key:s.id,name:s.name,kind:s.kind,model:{id:s.id,n:6,h:2.2,r:1,top:.55}}]);}
function orient(vertices,faces){return faces.map(f=>{let p=f.map(i=>vertices[i]);return dot(normal(p),center(p))<0?[...f].reverse():f;});}
export function mesh(id,n=6,h=2.2,r=1,top=.55){
let v=[],f=[],smooth=false,canNet=true;
if(['cube','cuboid'].includes(id)){const x=r,y=id==='cube'?r:h/2,z=id==='cube'?r:r*.65;v=[[-x,-y,-z],[x,-y,-z],[x,-y,z],[-x,-y,z],[-x,y,-z],[x,y,-z],[x,y,z],[-x,y,z]];f=[[0,1,2,3],[4,5,6,7],[0,1,5,4],[1,2,6,5],[2,3,7,6],[3,0,4,7]];}
else if(['icosa','dodeca'].includes(id)){const g=(1+Math.sqrt(5))/2;for(const a of [-1,1])for(const b of [-1,1]){if(id==='icosa')v.push([0,a,b*g],[a,b*g,0],[b*g,0,a]);else v.push([0,a/g,b*g],[a/g,b*g,0],[b*g,0,a/g]);}if(id==='dodeca')for(const x of [-1,1])for(const y of [-1,1])for(const z of [-1,1])v.push([x,y,z]);v=v.map(p=>mul(p,r/Math.sqrt(id==='icosa'?1+g*g:3)));f=hull(v);canNet=false;}
else if(id==='bipyramid'){for(let i=0;i<n;i++)v.push([r*Math.cos(i*2*Math.PI/n),0,r*Math.sin(i*2*Math.PI/n)]);v.push([0,-h/2,0],[0,h/2,0]);for(let i=0;i<n;i++)f.push([i,(i+1)%n,n],[i,n+1,(i+1)%n]);canNet=false;}
else if(['prism','pyramid','frustum','oblique','concave'].includes(id)){
 const N=id==='concave'?n*2:n;const off=id==='oblique'?.65:0;
 for(let j=0;j<2;j++)for(let i=0;i<N;i++){let a=2*Math.PI*i/N,rr=(id==='concave'&&i%2?.48:1)*r*(j&&id==='frustum'?top:1);v.push([rr*Math.cos(a)+(j?off:0),j?h/2:-h/2,rr*Math.sin(a)]);}
 if(id==='pyramid'){v=v.slice(0,N);v.push([0,h/2,0]);f.push(Array.from({length:N},(_,i)=>N-1-i));for(let i=0;i<N;i++)f.push([i,(i+1)%N,N]);}
 else {f.push(Array.from({length:N},(_,i)=>N-1-i));f.push(Array.from({length:N},(_,i)=>i+N));for(let i=0;i<N;i++)f.push([i,(i+1)%N,(i+1)%N+N,i+N]);}
 if(id==='concave')canNet=false;
}else if(id==='tetra'){v=[[1,1,1],[-1,-1,1],[-1,1,-1],[1,-1,-1]].map(p=>mul(p,r*.85));f=[[0,1,2],[0,3,1],[0,2,3],[1,3,2]];}
else if(id==='octa'){v=[[r,0,0],[-r,0,0],[0,r,0],[0,-r,0],[0,0,r],[0,0,-r]];f=[[2,0,4],[2,4,1],[2,1,5],[2,5,0],[3,4,0],[3,1,4],[3,5,1],[3,0,5]];canNet=false;}
else {
 smooth=true;canNet=false; const N=48;let profile=[];
 if(id==='doubleFrustum')profile=[[r*top,-h/2],[r,0],[r*top,h/2]];
 if(id==='hourglass')profile=[[r,-h/2],[r*top,0],[r,h/2]];
 if(id==='ellipsoid')profile=Array.from({length:25},(_,i)=>{const a=-Math.PI/2+Math.PI*i/24;return [r*Math.cos(a),h/2*Math.sin(a)];});
 if(id==='capsule'){const rr=Math.min(r,h/3),half=h/2-rr;profile=[...Array.from({length:13},(_,i)=>{const a=-Math.PI/2+i*Math.PI/24;return [rr*Math.cos(a),-half+rr*Math.sin(a)];}),...Array.from({length:13},(_,i)=>{const a=i*Math.PI/24;return [rr*Math.cos(a),half+rr*Math.sin(a)];})];}
 if(id==='stepped')profile=[[r,-h/2],[r,-h/6],[r*.7,-h/6],[r*.7,h/6],[r*.4,h/6],[r*.4,h/2]];
 if(id==='vase')profile=[[r*.6,-h/2],[r,-h*.25],[r*.85,0],[r*.4,h*.3],[r*.55,h/2]];
 if(id==='cylinder')profile=[[r,-h/2],[r,h/2]];
 if(id==='cone')profile=[[r,-h/2],[0,h/2]];
 if(id==='truncated')profile=[[r,-h/2],[r*top,h/2]];
 if(id==='double')profile=[[0,-h/2],[r,0],[0,h/2]];
 if(id==='compound')profile=[[r,-h/2],[r,h*.15],[0,h/2]];
 if(id==='sphere')profile=Array.from({length:25},(_,i)=>{let a=-Math.PI/2+Math.PI*i/24;return [r*Math.cos(a),r*Math.sin(a)];});
 if(id==='torus')profile=Array.from({length:25},(_,i)=>{let a=2*Math.PI*i/24;return [r*(.72+.29*Math.cos(a)),r*.29*Math.sin(a)];});
 for(const [rr,y] of profile)for(let i=0;i<N;i++){const a=-Math.PI+2*Math.PI*i/N;v.push([rr*Math.sin(a),y,rr*Math.cos(a)]);}
 for(let j=0;j<profile.length-1;j++)for(let i=0;i<N;i++)f.push([j*N+i,j*N+(i+1)%N,(j+1)*N+(i+1)%N,(j+1)*N+i]);
 if(['cylinder','cone','truncated','compound','doubleFrustum','hourglass','stepped','vase'].includes(id)){f.unshift(Array.from({length:N},(_,i)=>N-1-i));if(['cylinder','truncated','doubleFrustum','hourglass','stepped','vase'].includes(id))f.push(Array.from({length:N},(_,i)=>(profile.length-1)*N+i));}
 return {vertices:v,faces:f.map((a,i)=>({indices:a,points:a.map(k=>v[k]),i})),smooth,canNet:['cylinder','cone','truncated'].includes(id),profile,id,n,h,r,top};
}
f=orient(v,f);return {vertices:v,faces:f.map((a,i)=>({indices:a,points:a.map(k=>v[k]),i})),smooth,canNet};
}
// Faces stay connected along hinge edges throughout the unfolding animation.
export function unfold(m,t){if(m.smooth&&m.canNet&&t)return curvedNet(m,t);if(!t||!m.canNet)return m.faces.map(f=>f.points);let out=[],seen=new Set([0]),q=[0];out[0]=m.faces[0].points;const transforms=[[]];
while(q.length){let pi=q.shift(),p=m.faces[pi];for(let ci=0;ci<m.faces.length;ci++){if(seen.has(ci))continue;let c=m.faces[ci],shared=c.indices.filter(i=>p.indices.includes(i));if(shared.length!==2)continue;let path=transforms[pi];const apply=point=>path.reduce((p,rot)=>rotate(p,...rot),point);let a=apply(m.vertices[shared[0]]),b=apply(m.vertices[shared[1]]),cp=c.points.map(apply),pn=normal(out[pi]),cn=normal(cp),axis=norm(sub(b,a));let angle=Math.atan2(dot(axis,cross(cn,pn)),dot(cn,pn));const step=[a,b,angle*t];out[ci]=cp.map(point=>rotate(point,...step));transforms[ci]=[...path,step];seen.add(ci);q.push(ci);}}
return out.map((p,i)=>p||m.faces[i].points);}
export function counts(m){const edges=new Set();for(const f of m.faces)f.indices.forEach((v,i)=>edges.add([v,f.indices[(i+1)%f.indices.length]].sort((a,b)=>a-b).join('-')));return {faces:m.faces.length,edges:edges.size,vertices:m.vertices.length};}

function curvedNet(m,t){const {id,r,h,top}=m,N=48;const cap=f=>f.indices.length===N;return m.faces.map(f=>{
if(id==='cylinder'){if(cap(f)){const y=f.points[0][1],sign=y>0?1:-1;return f.points.map(p=>rotate(add(p,[0,0,-r]),[0,y,0],[1,y,0],sign*t*Math.PI/2));}return f.indices.map(i=>{let alpha=i%N;if(alpha===0&&f.indices.some(j=>j%N===N-1))alpha=N;let theta=alpha*2*Math.PI/N-Math.PI,k=1-t;return [k<1e-5?r*theta:r*Math.sin(theta*k)/k,m.vertices[i][1],k<1e-5?0:r*(Math.cos(theta*k)-1)/k];});}
const ratio=id==='truncated'?top:0,a0=Math.atan(r*(1-ratio)/h),L=r/Math.sin(a0),apex=-h/2+L*Math.cos(a0),a=a0+(Math.PI/2-a0)*t;
if(cap(f)){const upper=f.points[0][1]>0,s=upper?L*ratio:L,rr=upper?r*ratio:r,hinge=[0,apex-s*Math.cos(a),s*Math.sin(a)];return f.points.map(p=>{const local=[p[0],0,p[2]-rr];return add(hinge,rotate(local,[0,0,0],[1,0,0],upper?0:-t*Math.PI));});}
return f.indices.map(i=>{let alpha=i%N;if(alpha===0&&f.indices.some(j=>j%N===N-1))alpha=N;const theta=alpha*2*Math.PI/N-Math.PI,y=m.vertices[i][1],s=(apex-y)/Math.cos(a0),beta=theta*Math.sin(a0)/Math.sin(a);return [s*Math.sin(a)*Math.sin(beta),apex-s*Math.cos(a),s*Math.sin(a)*Math.cos(beta)];});
});}
