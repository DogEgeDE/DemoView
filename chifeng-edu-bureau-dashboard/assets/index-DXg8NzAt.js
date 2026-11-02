import{r as u,B as z,a as P,u as D,j as e,A as V,c as X,_ as q,E as U,b as Z,S as K,D as J,C as I,L as Q,H as L,d as ee,e as $,P as ae,O as B,f as se,R as te}from"./three-BJUldb8I.js";import{g as R}from"./animation-SFc2wnMY.js";import{E as ne}from"./charts-gMUCDWO4.js";(function(){const s=document.createElement("link").relList;if(s&&s.supports&&s.supports("modulepreload"))return;for(const r of document.querySelectorAll('link[rel="modulepreload"]'))t(r);new MutationObserver(r=>{for(const l of r)if(l.type==="childList")for(const i of l.addedNodes)i.tagName==="LINK"&&i.rel==="modulepreload"&&t(i)}).observe(document,{childList:!0,subtree:!0});function n(r){const l={};return r.integrity&&(l.integrity=r.integrity),r.referrerPolicy&&(l.referrerPolicy=r.referrerPolicy),r.crossOrigin==="use-credentials"?l.credentials="include":r.crossOrigin==="anonymous"?l.credentials="omit":l.credentials="same-origin",l}function t(r){if(r.ep)return;r.ep=!0;const l=n(r);fetch(r.href,l)}})();const v={CAMERA:{POSITION:[0,160,210],TARGET:[0,0,0],FOV:45,NEAR:.1,FAR:1e4},FOG:{COLOR:2755698,NEAR:380,FAR:2200},AMBIENT_LIGHT:{COLOR:12887285,INTENSITY:.55},POINT_LIGHT:{COLOR:16777215,INTENSITY:1.35,POSITION:[0,500,0]},DIRECTIONAL_LIGHT:{COLOR:16777215,INTENSITY:1.35}},f={COUNT:5e3,SIZE:2,COLOR:16777215,SPREAD:2e3,SPEED:.1,OPACITY:.28},re=()=>{const a=u.useRef(null);return u.useEffect(()=>{if(!a.current)return;const s=new z,n=new Float32Array(f.COUNT*3),t=new Float32Array(f.COUNT*3);for(let r=0;r<f.COUNT*3;r+=3)n[r]=(Math.random()-.5)*f.SPREAD,n[r+1]=(Math.random()-.5)*f.SPREAD,n[r+2]=(Math.random()-.5)*f.SPREAD,t[r]=(Math.random()-.5)*f.SPEED,t[r+1]=(Math.random()-.5)*f.SPEED,t[r+2]=(Math.random()-.5)*f.SPEED;return s.setAttribute("position",new P(n,3)),s.setAttribute("velocity",new P(t,3)),a.current.geometry=s,()=>{s.dispose()}},[]),D(s=>{if(!a.current)return;const n=a.current.geometry.attributes.position.array,t=a.current.geometry.attributes.velocity.array;for(let r=0;r<n.length;r+=3){n[r]+=t[r],n[r+1]+=t[r+1],n[r+2]+=t[r+2];const l=f.SPREAD/2;Math.abs(n[r])>l&&(n[r]=(Math.random()-.5)*f.SPREAD),Math.abs(n[r+1])>l&&(n[r+1]=(Math.random()-.5)*f.SPREAD),Math.abs(n[r+2])>l&&(n[r+2]=(Math.random()-.5)*f.SPREAD)}a.current.geometry.attributes.position.needsUpdate=!0,a.current.rotation.y=s.clock.elapsedTime*.02}),e.jsx("points",{ref:a,children:e.jsx("pointsMaterial",{size:f.SIZE,color:f.COLOR,transparent:!0,opacity:f.OPACITY,blending:V,depthWrite:!1,sizeAttenuation:!0})})},A=X((a,s)=>({data:null,loading:!1,error:null,selectedModule:null,hoveredMarker:null,cameraPosition:[0,300,500],cameraTarget:[0,0,0],isAnimating:!1,animationProgress:0,fetchData:async()=>{a({loading:!0,error:null});try{const{mockData:n}=await q(async()=>{const{mockData:t}=await import("./mockData-CIpMgK8V.js");return{mockData:t}},[]);a({data:n,loading:!1})}catch{a({error:"数据加载失败",loading:!1})}},setData:n=>a({data:n}),setLoading:n=>a({loading:n}),setError:n=>a({error:n}),updateData:(n,t)=>{const{data:r}=s();r&&a({data:{...r,[n]:t}})},setSelectedModule:n=>a({selectedModule:n}),setHoveredMarker:n=>a({hoveredMarker:n}),setCameraPosition:n=>a({cameraPosition:n}),setCameraTarget:n=>a({cameraTarget:n}),resetCamera:()=>a({cameraPosition:[0,300,500],cameraTarget:[0,0,0]}),setIsAnimating:n=>a({isAnimating:n}),setAnimationProgress:n=>a({animationProgress:n})})),le=`
  varying vec3 vNormal;
  varying vec3 vPosition;
  varying float vElevation;
  
  uniform float uTime;
  uniform float uWaveAmplitude;
  uniform float uWaveFrequency;
  
  void main() {
    vNormal = normalize(normalMatrix * normal);
    vPosition = position;
    
    // 添加波浪效果
    vec3 pos = position;
    float wave = sin(position.x * uWaveFrequency + uTime) * 
                 cos(position.y * uWaveFrequency + uTime) * 
                 uWaveAmplitude;
    pos.z += wave;
    vElevation = wave;
    
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`,ie=`
  varying vec3 vNormal;
  varying vec3 vPosition;
  varying float vElevation;
  
  uniform vec3 uColor;
  uniform vec3 uGlowColor;
  uniform float uTime;
  uniform float uGlowIntensity;
  
  void main() {
    // 边缘发光效果（Fresnel）
    vec3 viewDirection = normalize(cameraPosition - vPosition);
    float fresnel = pow(1.0 - abs(dot(viewDirection, vNormal)), 3.0);
    
    // 脉冲效果
    float pulse = sin(uTime * 2.0) * 0.5 + 0.5;
    
    // 基础颜色
    vec3 color = uColor;
    
    // 边缘发光
    vec3 glow = uGlowColor * fresnel * uGlowIntensity * (0.5 + pulse * 0.5);
    
    // 根据高度添加颜色变化
    color += vec3(0.18, 0.08, 0.32) * vElevation * 8.0;
    
    // 最终颜色
    vec3 finalColor = color + glow;
    
    gl_FragColor = vec4(finalColor, 0.88);
  }
`,S={lng:105.246612,lat:29.362041},G=720,oe=G*Math.cos(S.lat*Math.PI/180);function W(a,s){const n=(a-S.lng)*G,t=-(s-S.lat)*oe;return[n,t]}function ce(a,s=2){if(a.length<=80)return a;const n=[];for(let t=0;t<a.length-1;t+=s)n.push(a[t]);return n.push(a[0]),n}function T(a){const s=new ee;return ce(a).forEach(([n,t],r)=>{const[l,i]=W(n,t);r===0?s.moveTo(l,-i):s.lineTo(l,-i)}),s.closePath(),s}const _=()=>{const a=u.useRef(null),{hoveredMarker:s}=A(),[n,t]=u.useState(null);u.useEffect(()=>{fetch("/DemoView/longchang-date-dashboard/geo/longchang.json").then(d=>d.json()).then(d=>t(d.features[0])).catch(d=>console.error("地图数据加载失败",d))},[]);const r=u.useMemo(()=>n?n.geometry.coordinates.map(d=>{const[m,...j]=d,b=T(m);return j.forEach(c=>b.holes.push(T(c))),new U(b,{depth:16,bevelEnabled:!0,bevelThickness:1,bevelSize:.6,bevelSegments:2})}):[],[n]),l=u.useMemo(()=>r.map(d=>new Z(d,22)),[r]),i=u.useMemo(()=>new K({vertexShader:le,fragmentShader:ie,uniforms:{uTime:{value:0},uColor:{value:new I(4988309)},uGlowColor:{value:new I(16312319)},uGlowIntensity:{value:1.85},uWaveAmplitude:{value:.18},uWaveFrequency:{value:.04}},transparent:!0,side:J}),[]),o=u.useMemo(()=>new Q({color:16777215,transparent:!0,opacity:.85}),[]);if(D(d=>{const m=d.clock.elapsedTime;i.uniforms.uTime.value=m,i.uniforms.uGlowIntensity.value=s?2.4:1.85,a.current&&(a.current.position.y=Math.sin(m*.4)*1.2)}),u.useEffect(()=>()=>{r.forEach(d=>d.dispose()),l.forEach(d=>d.dispose()),i.dispose(),o.dispose()},[r,l,i,o]),!n||r.length===0)return null;const[h,x]=W(n.properties.center[0],n.properties.center[1]);return e.jsxs("group",{ref:a,children:[r.map((d,m)=>e.jsx("mesh",{geometry:d,material:i,rotation:[-Math.PI/2,0,0],castShadow:!0,receiveShadow:!0},`map-${m}`)),l.map((d,m)=>e.jsx("lineSegments",{geometry:d,material:o,rotation:[-Math.PI/2,0,0],position:[0,.35,0]},`edge-${m}`)),e.jsxs("mesh",{rotation:[-Math.PI/2,0,0],position:[0,-8,0],children:[e.jsx("circleGeometry",{args:[210,64]}),e.jsx("meshBasicMaterial",{color:"#0A0220",transparent:!0,opacity:.42})]}),e.jsx(L,{position:[h,22,x],center:!0,distanceFactor:220,zIndexRange:[20,0],children:e.jsx("div",{className:"map-city-label",children:"隆昌市"})})]})},de=a=>{const s=[];for(let r=0;r<a;r++){let l=0,i=!1,o=0,h=0,x=0;for(;!i&&l<50;){const d=r/a*Math.PI*2,m=(Math.random()-.5)*.5,j=d+m,b=90*(.65+Math.random()*.35);o=Math.cos(j)*b,h=Math.sin(j)*b,x=20+Math.random()*5,i=s.every(([c,,p])=>{const g=o-c,y=h-p;return Math.sqrt(g*g+y*y)>=40}),l++}s.push([o,x,h])}return s},ue=({position:a,marker:s,isActive:n})=>{const t=u.useRef(null);u.useEffect(()=>{t.current&&(n?R.to(t.current.scale,{x:1.5,y:1.5,z:1.5,duration:.5}):R.to(t.current.scale,{x:1,y:1,z:1,duration:.5}))},[n]),D(l=>{t.current&&(t.current.position.y=a[1]+Math.sin(l.clock.elapsedTime*2)*.5)});const r=s.type==="school"?"#00FFFF":s.type==="institution"?"#FF6B00":"#00FF88";return e.jsxs("group",{position:a,children:[e.jsxs("mesh",{ref:t,children:[e.jsx("sphereGeometry",{args:[1.2,16,16]}),e.jsx("meshStandardMaterial",{color:r,emissive:r,emissiveIntensity:n?1.5:.8,transparent:!0,opacity:n?1:.7})]}),e.jsxs("mesh",{position:[0,-a[1]/2,0],children:[e.jsx("cylinderGeometry",{args:[.15,.3,a[1],8]}),e.jsx("meshBasicMaterial",{color:r,transparent:!0,opacity:n?.5:.2})]}),n&&e.jsx(L,{position:[0,4,0],center:!0,distanceFactor:150,zIndexRange:[100,0],sprite:!0,occlude:!1,children:e.jsxs("div",{className:"school-marker-card",children:[e.jsxs("div",{className:"card-header",children:[e.jsx("div",{className:"card-type",style:{background:s.type==="school"?"linear-gradient(135deg, #00FFFF 0%, #0088FF 100%)":s.type==="institution"?"linear-gradient(135deg, #FF6B00 0%, #FF9500 100%)":"linear-gradient(135deg, #00FF88 0%, #00DDAA 100%)"},children:s.type==="school"?"学校":s.type==="institution"?"机构":"基地"}),e.jsx("div",{className:"card-title",children:s.name})]}),e.jsxs("div",{className:"card-body",children:[s.data.activities!==void 0&&e.jsxs("div",{className:"card-stat",children:[e.jsx("span",{className:"stat-label",children:"活动次数"}),e.jsx("span",{className:"stat-value",children:s.data.activities})]}),s.data.students!==void 0&&e.jsxs("div",{className:"card-stat",children:[e.jsx("span",{className:"stat-label",children:"参与人数"}),e.jsx("span",{className:"stat-value",children:s.data.students})]}),s.data.works!==void 0&&e.jsxs("div",{className:"card-stat",children:[e.jsx("span",{className:"stat-label",children:"作品数"}),e.jsx("span",{className:"stat-value",children:s.data.works})]})]})]})})]})},he=({markers:a})=>{const[s,n]=u.useState(0),t=6;u.useEffect(()=>{const i=setInterval(()=>{n(o=>(o+1)%Math.ceil(a.length/t))},5e3);return()=>clearInterval(i)},[a.length]);const r=u.useMemo(()=>{const i=s*t;return a.slice(i,i+t)},[s,a]),l=u.useMemo(()=>de(r.length),[r.length,s]);return e.jsx("group",{children:r.map((i,o)=>e.jsx(ue,{position:l[o],marker:i,isActive:!0},`${i.id}-${s}`))})},pe=()=>{const{data:a}=A();return e.jsx("div",{className:"map-scene",children:e.jsxs($,{shadows:!0,gl:{antialias:!0,alpha:!0,powerPreference:"high-performance"},onCreated:({scene:s,gl:n})=>{s.background=null,n.setClearColor(0,0)},children:[e.jsx(ae,{makeDefault:!0,position:v.CAMERA.POSITION,fov:v.CAMERA.FOV,near:v.CAMERA.NEAR,far:v.CAMERA.FAR}),e.jsx(B,{enableDamping:!0,dampingFactor:.05,minDistance:90,maxDistance:420,maxPolarAngle:Math.PI/2.2,target:v.CAMERA.TARGET,autoRotate:!0,autoRotateSpeed:.25}),e.jsx("ambientLight",{color:v.AMBIENT_LIGHT.COLOR,intensity:v.AMBIENT_LIGHT.INTENSITY}),e.jsx("pointLight",{color:v.POINT_LIGHT.COLOR,intensity:v.POINT_LIGHT.INTENSITY,position:v.POINT_LIGHT.POSITION,castShadow:!0}),e.jsx("directionalLight",{color:v.DIRECTIONAL_LIGHT.COLOR,intensity:v.DIRECTIONAL_LIGHT.INTENSITY,position:[100,100,50],castShadow:!0}),e.jsx("fog",{attach:"fog",args:[v.FOG.COLOR,v.FOG.NEAR,v.FOG.FAR]}),e.jsxs(u.Suspense,{fallback:null,children:[e.jsx(re,{}),e.jsx(_,{}),a?.mapMarkers&&e.jsx(he,{markers:a.mapMarkers})]})]})})},H=({value:a,label:s,duration:n=2,className:t=""})=>{const[r,l]=u.useState(0),[i,o]=u.useState(!1);u.useEffect(()=>{if(a===r)return;o(!0);const x=r,d=a,m=Date.now(),j=n*1e3,b=()=>{const p=Date.now()-m,g=Math.min(p/j,1),y=1-Math.pow(1-g,3),C=Math.floor(x+(d-x)*y);l(C),g<1?requestAnimationFrame(b):o(!1)};requestAnimationFrame(b)},[a,n]);const h=r.toLocaleString("zh-CN").split("");return e.jsxs("div",{className:`relative flex flex-col items-center justify-center gap-2 ${t}`,children:[e.jsx("div",{className:"relative flex items-center justify-center gap-1 perspective-1000",children:h.map((x,d)=>e.jsx("div",{className:`flip-digit ${i?"animating":""}`,style:{animationDelay:`${d*.05}s`},children:x===","?e.jsx("span",{className:"flip-comma",children:x}):e.jsx("div",{className:"flip-card",children:e.jsx("div",{className:"flip-card-inner",children:e.jsx("div",{className:"flip-card-front",children:e.jsx("span",{className:"font-bold text-white",children:x})})})})},`${d}-${x}`))}),e.jsx("div",{className:"flip-label",children:s})]})},me=({value:a,size:s=150,stroke:n=12,color:t="#F3D6FF",label:r})=>{const l=Math.max(3,n/2),i=Math.max(8,(s-n)/2-l),o=2*Math.PI*i,h=o*(1-Math.min(a,100)/100);return e.jsxs("div",{className:"ring-gauge",style:{width:s,height:s},children:[e.jsxs("svg",{width:s,height:s,viewBox:`0 0 ${s} ${s}`,overflow:"visible",children:[e.jsx("circle",{cx:s/2,cy:s/2,r:i,fill:"none",stroke:"rgba(8, 2, 28, 0.45)",strokeWidth:n}),e.jsx("circle",{className:"ring-progress",cx:s/2,cy:s/2,r:i,fill:"none",stroke:t,strokeWidth:n,strokeLinecap:"round",strokeDasharray:o,strokeDashoffset:h,transform:`rotate(-90 ${s/2} ${s/2})`})]}),e.jsxs("div",{className:"ring-center",children:[e.jsxs("div",{className:"ring-value",children:[a,"%"]}),r&&e.jsx("div",{className:"ring-label",children:r})]})]})},E=5,xe=5e3,ge=({data:a,unit:s=""})=>{const[n,t]=u.useState(0),r=Math.ceil(a.length/E);u.useEffect(()=>{if(r<=1)return;const o=setInterval(()=>{t(h=>(h+1)%r)},xe);return()=>clearInterval(o)},[r]);const l=a.slice(n*E,(n+1)*E),i=Math.max(...l.map(o=>o.value));return e.jsxs("div",{className:"hbar-container",children:[e.jsx("div",{className:"hbar-chart",children:l.map((o,h)=>e.jsxs("div",{className:"hbar-row",style:{animationDelay:`${h*.08}s`},children:[e.jsx("div",{className:"hbar-label",children:o.label}),e.jsx("div",{className:"hbar-track",children:e.jsx("div",{className:"hbar-fill",style:{width:`${o.value/i*100}%`,animationDelay:`${.2+h*.08}s`}})}),e.jsxs("div",{className:"hbar-value",children:[o.value,s,o.extra&&e.jsx("span",{className:"hbar-extra",children:o.extra})]})]},`${n}-${o.label}`))}),r>1&&e.jsx("div",{className:"page-dots",children:Array.from({length:r},(o,h)=>e.jsx("div",{className:`dot ${h===n?"active":""}`},h))})]})},fe=({data:a,unit:s=""})=>{const n=Math.max(...a.map(t=>t.value));return e.jsx("div",{className:"hbar-chart-static",children:a.map((t,r)=>e.jsxs("div",{className:"hbar-row",style:{animationDelay:`${r*.08}s`},children:[e.jsx("div",{className:"hbar-label",children:t.label}),e.jsxs("div",{className:"hbar-body",children:[e.jsxs("div",{className:"hbar-meta",children:[e.jsxs("span",{className:"hbar-value",children:[t.value,s,"个活动"]}),t.extra&&e.jsx("span",{className:"hbar-extra",children:t.extra})]}),e.jsx("div",{className:"hbar-track",children:e.jsx("div",{className:"hbar-fill",style:{width:`${t.value/n*100}%`,animationDelay:`${.2+r*.08}s`}})})]})]},t.label))})},Y=({data:a,centerLabel:s,centerValue:n,size:t=72})=>{const r=Math.max(8,Math.round(t*.1)),l=Math.max(3,r/2),i=Math.max(10,(t-r)/2-l),o=2*Math.PI*i,h=t/2;let x=0;return e.jsxs("div",{className:"donut-wrap",children:[e.jsxs("div",{className:"donut-svg",style:{width:t,height:t},children:[e.jsxs("svg",{width:t,height:t,viewBox:`0 0 ${t} ${t}`,overflow:"visible",children:[e.jsx("circle",{cx:h,cy:h,r:i,fill:"none",stroke:"rgba(8, 2, 28, 0.45)",strokeWidth:r}),a.map(d=>{const m=d.percentage/100*o,j=x;return x+=m,e.jsx("circle",{cx:h,cy:h,r:i,fill:"none",stroke:d.color,strokeWidth:r,strokeDasharray:`${m} ${o-m}`,strokeDashoffset:-j,transform:`rotate(-90 ${h} ${h})`,className:"donut-arc"},d.label)})]}),e.jsxs("div",{className:"donut-center",children:[e.jsx("div",{className:"donut-value",children:n}),e.jsx("div",{className:"donut-label",children:s})]})]}),e.jsx("div",{className:"donut-legend",children:a.map(d=>e.jsxs("div",{className:"legend-item",children:[e.jsx("span",{className:"legend-dot",style:{background:d.color}}),e.jsxs("div",{className:"legend-text",children:[e.jsx("span",{children:d.label}),e.jsxs("strong",{children:[d.percentage.toFixed(1),"%"]})]})]},d.label))})]})},ve=({data:a,unit:s=""})=>{const n=u.useRef(null),t=a.slice(0,10);u.useEffect(()=>{const l=n.current;if(!l||t.length===0)return;const i=l.firstElementChild;if(!i)return;const x=(i.offsetHeight+12)*t.length;let d,m=0;const j=.3,b=()=>{m+=j,m>=x&&(m=0),l.style.transform=`translateY(-${m}px)`,d=requestAnimationFrame(b)},c=setTimeout(()=>{d=requestAnimationFrame(b)},500);return()=>{clearTimeout(c),cancelAnimationFrame(d)}},[t.length]);const r=[...t,...t];return e.jsx("div",{className:"ranking-scroll-container",children:e.jsx("div",{ref:n,className:"ranking-scroll-content",children:r.map((l,i)=>e.jsxs("div",{className:"ranking-item",style:{animationDelay:`${i%t.length*.08}s`},children:[e.jsx("div",{className:`rank-badge rank-${l.rank<=3?l.rank:"other"}`,children:l.rank}),e.jsx("div",{className:"rank-name",children:l.name}),e.jsxs("div",{className:"rank-value",children:[l.value,e.jsx("span",{className:"rank-unit",children:s})]})]},`${l.rank}-${i}`))})})},je=({data:a})=>{const s=a.reduce((t,r)=>t+r.excellent,0),n=a.reduce((t,r)=>t+r.good,0);return e.jsxs("div",{className:"eval-panel",children:[e.jsxs("div",{className:"eval-ring-wrap",children:[e.jsxs("svg",{width:"80",height:"80",viewBox:"0 0 80 80",children:[e.jsx("circle",{cx:"40",cy:"40",r:"28",fill:"none",stroke:"rgba(8, 2, 28, 0.45)",strokeWidth:"8"}),e.jsx("circle",{cx:"40",cy:"40",r:"28",fill:"none",stroke:"url(#eval-gradient)",strokeWidth:"8",strokeDasharray:"176",strokeDashoffset:"0",transform:"rotate(-90 40 40)",strokeLinecap:"round"}),e.jsx("defs",{children:e.jsxs("linearGradient",{id:"eval-gradient",x1:"0%",y1:"0%",x2:"100%",y2:"0%",children:[e.jsx("stop",{offset:"0%",stopColor:"#A63CD4"}),e.jsx("stop",{offset:"50%",stopColor:"#F3D6FF"}),e.jsx("stop",{offset:"100%",stopColor:"#FFE08A"})]})})]}),e.jsx("div",{className:"eval-ring-center",children:e.jsxs("div",{className:"eval-ring-label",children:["评价",e.jsx("br",{}),"总量"]})})]}),e.jsxs("div",{className:"eval-bars-wrap",children:[e.jsxs("div",{className:"eval-legend-top",children:[e.jsxs("span",{children:["评价维度：优秀 ",e.jsx("em",{children:s}),"次"]}),e.jsxs("span",{children:["评价维度：良好 ",e.jsx("em",{children:n}),"次"]})]}),a.map((t,r)=>{const l=t.good+t.excellent,i=t.excellent/l*100,o=t.good/l*100;return e.jsxs("div",{className:"eval-bar-item",style:{animationDelay:`${r*.1}s`},children:[e.jsx("div",{className:"eval-bar-name",children:t.name}),e.jsxs("div",{className:"eval-bar-stack",children:[e.jsx("div",{className:"eval-bar-seg eval-excellent",style:{width:`${i}%`,background:t.color1,animationDelay:`${.3+r*.1}s`},children:e.jsxs("span",{className:"eval-bar-label",children:["优秀：",t.excellent,"次"]})}),e.jsx("div",{className:"eval-bar-seg eval-good",style:{width:`${o}%`,background:t.color2,animationDelay:`${.4+r*.1}s`},children:e.jsxs("span",{className:"eval-bar-label",children:["良好：",t.good,"次"]})})]})]},t.name)})]})]})},N=({value:a,label:s,color:n="#F3D6FF"})=>{const t=typeof a=="number"?a.toLocaleString("zh-CN"):a;return e.jsxs("div",{className:"metric-card",children:[e.jsx("div",{className:"metric-value",style:{color:n},children:t}),e.jsx("div",{className:"metric-label",children:s})]})},be=280,Ne=40,ye=96,ke=12,F=8,O=5,Fe=[{tag:"统计口径",title:"统计范围与刷新",content:"统计范围为隆昌市综合实践教育平台全量数据，默认累计至当前时刻。看板进入页面时加载一次数据，不再定时自动刷新；时间戳取核心指标接口返回时间。"},{tag:"学生入驻",title:"已入驻 / 已绑定 / 绑定率",content:"已入驻：平台学生档案状态为「已入驻」的去重学生数。已绑定：家长端小程序完成学生绑定的去重学生数。绑定率 = 已绑定 ÷ 已入驻 × 100%，四舍五入取整。未绑定不单独展示。"},{tag:"核心指标",title:"作品数",content:"学生提交且审核通过的实践作品累计份数。同一学生多次提交按份累计，草稿/驳回不计入。"},{tag:"核心指标",title:"机构数 / 基地数 / 学校数",content:"统计平台入驻状态为「已入驻」且未注销的主体，按类型去重计数。机构、基地、学校互斥分类，不重复计入。"},{tag:"核心指标",title:"学生数",content:"平台注册学生去重总数，含已入驻及历史在籍学生；与「已入驻」口径不同，学生数可大于已入驻。"},{tag:"核心指标",title:"活动数 / 实践教育人次",content:"活动数：已发布且未取消的综合实践活动去重个数。实践教育人次：活动报名成功并完成签到的人次累计，同一学生参加多次按人次累计。"},{tag:"核心指标",title:"教师评价数 / 机构评价数",content:"教师评价数：教师对学生实践表现提交的有效评价条数。机构评价数：实践机构对学生提交的有效评价条数。均不含草稿与已撤回。"},{tag:"地图",title:"3D 地图标记",content:"每次展示 6 个学校/机构/基地，每 5 秒自动轮播切换。标记点在地图中心周围随机散布（不按真实经纬度），确保间距避免重叠。光柱颜色：学校青色、机构橙色、基地绿色。卡片悬浮展示机构名称、类型、活动次数、参与人数和作品数。"},{tag:"排行榜",title:"各校参与活动排行",content:"按学校关联的已发布活动个数降序。取前 10 名循环滚动。活动数与学校主体一对多关联，取消活动不计入。"},{tag:"学段分析",title:"各学段实践教育作品",content:"按作品提交时学生所在学段归类，学段为一至六年级、初一至初三、高一至高三。单位：份。分页每页 5 条轮播。"},{tag:"活动类型",title:"活动数量与参与人数",content:"白色数值为该类型已发布活动个数；金色数值为该类型活动签到人次合计。类型取活动主分类，多标签时按主类型归入，未分类计入「其他」。"},{tag:"公益分析",title:"公益 / 非公益占比",content:"判定规则：活动费用为 0 元视为公益活动，费用大于 0 元视为非公益活动。公益占比 = 0 元活动数 ÷ 总活动数；非公益占比 = 1 − 公益占比。中心值为公益 + 非公益活动总数，应与核心指标活动数一致。取消活动不计入。"},{tag:"评价分析",title:"优秀 / 良好与占比",content:"仅统计等级为「优秀」「良好」的有效评价。教师评价、评价活动、机构评价分维度计数。条形宽度按该维度内优秀与良好次数占比分配。评价总量圆环为三维度合计。"}];function M(a){return a?Ne:be}function w(a,s,n){const t=M(n),r=window.innerWidth-t-F,l=window.innerHeight-80;return{x:Math.min(Math.max(F,a),Math.max(F,r)),y:Math.min(Math.max(F,s),Math.max(F,l))}}function we(a){return w(window.innerWidth-M(a)-ke,ye,a)}const Me=()=>{const[a,s]=u.useState(!1),[n,t]=u.useState(!1),[r,l]=u.useState(()=>we(!1)),i=u.useRef(a),o=u.useRef(r),h=u.useRef({active:!1,startX:0,startY:0,origX:0,origY:0,moved:!1});i.current=a,o.current=r;const x=Math.max(160,window.innerHeight-r.y-16),d=u.useCallback(c=>{if(c.button!==0)return;const p=c.currentTarget.querySelector(".rule-panel-body");if(p&&!i.current){const g=p.offsetWidth-p.clientWidth;if(g>0){const y=p.getBoundingClientRect();if(c.clientX>=y.right-g&&c.clientX<=y.right&&c.clientY>=y.top&&c.clientY<=y.bottom)return}}h.current={active:!0,startX:c.clientX,startY:c.clientY,origX:o.current.x,origY:o.current.y,moved:!1}},[]),m=u.useCallback(c=>{const p=h.current;if(!p.active)return;const g=c.clientX-p.startX,y=c.clientY-p.startY;!p.moved&&g*g+y*y<O*O||(p.moved||(p.moved=!0,c.currentTarget.setPointerCapture(c.pointerId),t(!0)),l(w(p.origX+g,p.origY+y,i.current)))},[]),j=u.useCallback(()=>{s(c=>{const p=!c;return l(g=>w(g.x+M(c)-M(p),g.y,p)),p})},[]),b=u.useCallback(c=>{const p=h.current;if(!p.active||(p.active=!1,t(!1),c.currentTarget.hasPointerCapture(c.pointerId)&&c.currentTarget.releasePointerCapture(c.pointerId),p.moved))return;const g=c.target;(i.current||g?.closest(".rule-panel-header"))&&j()},[j]);return u.useEffect(()=>{const c=()=>{l(p=>w(p.x,p.y,i.current))};return window.addEventListener("resize",c),()=>window.removeEventListener("resize",c)},[]),e.jsxs("aside",{className:`rule-panel${a?" collapsed":""}${n?" dragging":""}`,id:"rule-panel",style:{left:r.x,top:r.y,height:x},onPointerDown:d,onPointerMove:m,onPointerUp:b,onPointerCancel:b,children:[e.jsxs("button",{type:"button",className:"rule-panel-header","aria-expanded":!a,tabIndex:0,onKeyDown:c=>{(c.key==="Enter"||c.key===" ")&&(c.preventDefault(),j())},children:[e.jsx("span",{className:"rule-panel-icon",children:"📋"}),e.jsx("span",{className:"rule-panel-title",children:"指标统计与取数规则"}),e.jsx("span",{className:"rule-panel-toggle",children:a?"‹":"›"})]}),e.jsx("div",{className:"rule-panel-body",children:Fe.map(c=>e.jsxs("article",{className:"rule-item",children:[e.jsx("span",{className:"rule-tag",children:c.tag}),e.jsx("h3",{className:"rule-title",children:c.title}),e.jsx("p",{className:"rule-content",children:c.content})]},`${c.tag}-${c.title}`))})]})};function Ee(a){const s=new Date(a),n=["星期日","星期一","星期二","星期三","星期四","星期五","星期六"][s.getDay()],t=r=>String(r).padStart(2,"0");return`${s.getFullYear()}-${t(s.getMonth()+1)}-${t(s.getDate())} ${n} ${t(s.getHours())}:${t(s.getMinutes())}:${t(s.getSeconds())}`}function Se(){const{data:a,fetchData:s,loading:n,error:t}=A();u.useEffect(()=>{s()},[s]);const r=[{name:"教师评价",good:6,excellent:165,color1:"#D7A6FF",color2:"#A63CD4"},{name:"评价活动",good:2,excellent:3,color1:"#FFE08A",color2:"#F59E0B"},{name:"机构评价",good:2,excellent:2,color1:"#FFB199",color2:"#F3D6FF"}];if(n||!a)return e.jsx("div",{className:"screen",children:e.jsx("div",{className:"boot-text",children:t||"数据加载中..."})});const l=a.publicBenefit.publicRatio>1?a.publicBenefit.publicRatio:a.publicBenefit.publicRatio*100,i=a.publicBenefit.nonPublicRatio>1?a.publicBenefit.nonPublicRatio:a.publicBenefit.nonPublicRatio*100;return e.jsxs("div",{className:"screen",children:[e.jsx("div",{className:"screen-grid"}),e.jsxs("header",{className:"top-bar",children:[e.jsx("div",{className:"top-deco left"}),e.jsxs("div",{className:"title-wrap",children:[e.jsx("h1",{children:"综合实践教育数据看板"}),e.jsx("p",{children:"四川省内江市隆昌市"})]}),e.jsx("div",{className:"top-deco right"}),e.jsx("div",{className:"top-time",children:Ee(a.coreMetrics.timestamp)})]}),e.jsxs("main",{className:"board",children:[e.jsxs("aside",{className:"col left",children:[e.jsxs("section",{className:"panel panel-flex-23",children:[e.jsx("div",{className:"panel-title",children:"平台入驻学生情况"}),e.jsxs("div",{className:"student-block",children:[e.jsx(me,{value:a.studentStatus.bindingRate,label:"绑定率",size:88,stroke:8}),e.jsxs("div",{className:"student-nums",children:[e.jsxs("div",{children:[e.jsx("strong",{children:a.studentStatus.bound.toLocaleString()}),e.jsx("span",{children:"已绑定"})]}),e.jsxs("div",{children:[e.jsx("strong",{children:a.studentStatus.enrolled.toLocaleString()}),e.jsx("span",{children:"已入驻"})]})]})]})]}),e.jsxs("section",{className:"panel panel-flex-42",children:[e.jsx("div",{className:"panel-title",children:"活动类型分析"}),e.jsx(fe,{data:a.activityTypes.map(o=>({label:o.type,value:o.activityCount,extra:`${o.participantCount.toLocaleString()}人`}))})]}),e.jsxs("section",{className:"panel panel-flex-25",children:[e.jsx("div",{className:"panel-title",children:"公益与非公益活动分析"}),e.jsx(Y,{data:[{label:"公益活动",value:a.publicBenefit.publicCount,percentage:l,color:"#9AF3D4"},{label:"非公益活动",value:a.publicBenefit.nonPublicCount,percentage:i,color:"#D7A6FF"}],centerLabel:"总活动数",centerValue:a.publicBenefit.publicCount+a.publicBenefit.nonPublicCount,size:96})]})]}),e.jsxs("section",{className:"col center",children:[e.jsxs("div",{className:"hero-metrics",children:[e.jsx("div",{className:"hero-works",children:e.jsx(H,{value:a.coreMetrics.works,label:"作品数"})}),e.jsxs("div",{className:"metric-grid",children:[e.jsx(N,{value:a.coreMetrics.institutions,label:"机构数"}),e.jsx(N,{value:a.coreMetrics.bases,label:"基地数",color:"#9AF3D4"}),e.jsx(N,{value:a.coreMetrics.schools,label:"学校数",color:"#D7A6FF"}),e.jsx(N,{value:a.coreMetrics.students,label:"学生数",color:"#FFE08A"}),e.jsx(N,{value:a.coreMetrics.activities,label:"活动数"}),e.jsx(N,{value:a.coreMetrics.participations,label:"实践教育人次",color:"#FFB199"}),e.jsx(N,{value:a.coreMetrics.teacherEvaluations,label:"教师评价数",color:"#F3D6FF"}),e.jsx(N,{value:a.coreMetrics.institutionEvaluations,label:"机构评价数",color:"#FFE08A"})]})]}),e.jsxs("div",{className:"map-wrap",children:[e.jsx(pe,{}),e.jsx("div",{className:"map-caption",children:"隆昌市综合实践教育分布"})]})]}),e.jsxs("aside",{className:"col right",children:[e.jsxs("section",{className:"panel panel-flex-32",children:[e.jsx("div",{className:"panel-title",children:"各校参与活动排行"}),e.jsx(ve,{data:a.schoolRanking.map(o=>({rank:o.rank,name:o.schoolName,value:o.activityCount})),title:"",unit:"个"})]}),e.jsxs("section",{className:"panel panel-flex-32",children:[e.jsx("div",{className:"panel-title",children:"各个学段实践教育作品分析"}),e.jsx(ge,{data:a.gradeWorks.map(o=>({label:o.grade,value:o.count})),unit:"份"})]}),e.jsxs("section",{className:"panel panel-flex-32",children:[e.jsx("div",{className:"panel-title",children:"实践教育评价分析"}),e.jsx(je,{data:r,total:180})]})]})]}),e.jsx(Me,{})]})}const De=({data:a,title:s})=>{const n=u.useMemo(()=>({title:s?{text:s,left:"center",top:10,textStyle:{color:"#ffffff",fontSize:14,fontWeight:"normal"}}:void 0,tooltip:{trigger:"item",backgroundColor:"rgba(0, 20, 40, 0.9)",borderColor:"#00aaff",borderWidth:1,textStyle:{color:"#ffffff"},formatter:"{b}: {c} ({d}%)"},legend:{orient:"vertical",right:10,top:"center",textStyle:{color:"#ffffff",fontSize:12},itemWidth:12,itemHeight:12},series:[{type:"pie",radius:["40%","70%"],center:["35%","50%"],avoidLabelOverlap:!0,itemStyle:{borderRadius:6,borderColor:"rgba(0, 0, 0, 0.5)",borderWidth:2},label:{show:!0,position:"outside",color:"#ffffff",fontSize:11,formatter:`{b}
{d}%`},emphasis:{scale:!0,scaleSize:10,itemStyle:{shadowBlur:20,shadowOffsetX:0,shadowColor:"rgba(0, 170, 255, 0.5)"}},data:a.map(t=>({name:t.name,value:t.value,itemStyle:{color:t.color}}))}]}),[a,s]);return e.jsx(ne,{option:n,style:{height:"100%",width:"100%"},opts:{renderer:"svg"}})},Ae=({data:a})=>e.jsxs("div",{className:"simple-ranking",children:[a.map(s=>e.jsxs("div",{className:"ranking-row",children:[e.jsx("div",{className:`ranking-badge ${s.rank<=3?"top-three":""}`,children:s.rank}),e.jsx("div",{className:"ranking-name",children:s.name}),e.jsx("div",{className:"ranking-value",children:s.value})]},s.rank)),e.jsx("style",{children:`
        .simple-ranking {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .ranking-row {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 8px 12px;
          background: rgba(0, 170, 255, 0.08);
          border-radius: 6px;
          border: 1px solid rgba(0, 170, 255, 0.15);
          transition: all 0.3s ease;
        }
        .ranking-row:hover {
          background: rgba(0, 170, 255, 0.15);
          border-color: rgba(0, 170, 255, 0.3);
        }
        .ranking-badge {
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.1);
          color: rgba(255, 255, 255, 0.7);
          font-size: 12px;
          font-weight: 700;
          flex-shrink: 0;
        }
        .ranking-badge.top-three {
          background: linear-gradient(135deg, #ffd700, #ffed4e);
          color: #000;
          box-shadow: 0 0 10px rgba(255, 215, 0, 0.5);
        }
        .ranking-name {
          flex: 1;
          font-size: 13px;
          color: rgba(255, 255, 255, 0.9);
        }
        .ranking-value {
          font-family: 'Orbitron', monospace;
          font-size: 14px;
          font-weight: 700;
          color: #00ffff;
        }
      `})]}),k=({label:a,value:s,max:n=100,color:t="#00aaff",percentage:r})=>{const l=n>0?s/n*100:0,i=r||`${l.toFixed(2)}%`;return e.jsxs("div",{className:"progress-bar-item",children:[e.jsxs("div",{className:"progress-label",children:[e.jsx("span",{children:a}),e.jsx("span",{className:"progress-value",children:i})]}),e.jsx("div",{className:"progress-track",children:e.jsx("div",{className:"progress-fill",style:{width:`${l}%`,background:`linear-gradient(90deg, ${t}, ${t}dd)`}})}),e.jsx("style",{children:`
        .progress-bar-item {
          margin-bottom: 12px;
        }
        .progress-label {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 6px;
          font-size: 12px;
          color: rgba(255, 255, 255, 0.85);
        }
        .progress-value {
          font-family: 'Orbitron', monospace;
          font-weight: 700;
          color: #00ffff;
        }
        .progress-track {
          height: 8px;
          background: rgba(0, 170, 255, 0.1);
          border-radius: 4px;
          overflow: hidden;
          position: relative;
        }
        .progress-fill {
          height: 100%;
          border-radius: 4px;
          transition: width 1s ease-out;
          box-shadow: 0 0 10px currentColor;
        }
      `})]})},Ce=({genderData:a})=>{const s=a?.male||37.9,n=a?.female||62.1;return e.jsxs("div",{className:"human-figure-container",children:[e.jsx("svg",{width:"100%",height:"220",viewBox:"0 0 200 220",fill:"none",xmlns:"http://www.w3.org/2000/svg",children:e.jsxs("g",{transform:"translate(100, 20)",children:[e.jsx("circle",{cx:"0",cy:"0",r:"20",fill:"rgba(0, 170, 255, 0.3)",stroke:"#00aaff",strokeWidth:"2"}),e.jsx("rect",{x:"-15",y:"20",width:"30",height:"60",rx:"8",fill:"rgba(0, 170, 255, 0.2)",stroke:"#00aaff",strokeWidth:"2"}),e.jsx("line",{x1:"-15",y1:"30",x2:"-35",y2:"60",stroke:"#00aaff",strokeWidth:"6",strokeLinecap:"round"}),e.jsx("line",{x1:"15",y1:"30",x2:"35",y2:"60",stroke:"#00aaff",strokeWidth:"6",strokeLinecap:"round"}),e.jsx("line",{x1:"-8",y1:"80",x2:"-15",y2:"140",stroke:"#00aaff",strokeWidth:"6",strokeLinecap:"round"}),e.jsx("line",{x1:"8",y1:"80",x2:"15",y2:"140",stroke:"#00aaff",strokeWidth:"6",strokeLinecap:"round"})]})}),e.jsxs("div",{className:"gender-stats",children:[e.jsxs("div",{className:"gender-item male",children:[e.jsx("div",{className:"gender-icon",children:"♂"}),e.jsx("div",{className:"gender-label",children:"男性"}),e.jsxs("div",{className:"gender-value",children:[s,"%"]})]}),e.jsxs("div",{className:"gender-item female",children:[e.jsx("div",{className:"gender-icon",children:"♀"}),e.jsx("div",{className:"gender-label",children:"女性"}),e.jsxs("div",{className:"gender-value",children:[n,"%"]})]})]}),e.jsx("style",{children:`
        .human-figure-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 15px;
        }
        .gender-stats {
          display: flex;
          gap: 30px;
        }
        .gender-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
        }
        .gender-icon {
          font-size: 28px;
          font-weight: 700;
        }
        .gender-item.male .gender-icon {
          color: #4fc3f7;
        }
        .gender-item.female .gender-icon {
          color: #f48fb1;
        }
        .gender-label {
          font-size: 12px;
          color: rgba(255, 255, 255, 0.7);
        }
        .gender-value {
          font-family: 'Orbitron', monospace;
          font-size: 16px;
          font-weight: 700;
          color: #00ffff;
        }
      `})]})};function Pe(a){const s=a.getFullYear(),n=String(a.getMonth()+1).padStart(2,"0");return`${s}-${n}`}const Ie=()=>{const a=new Date,s=[{name:"本地",value:1679,color:"#00aaff"},{name:"成都",value:5535,color:"#ff6600"}],n=[{label:"住宿",value:46429,percentage:"30%",color:"#ffd700"},{label:"研学",value:36,percentage:"21%",color:"#ff6600"},{label:"农副",value:81921,percentage:"20%",color:"#00aaff"}];return e.jsxs("div",{className:"screen",children:[e.jsx("div",{className:"screen-grid"}),e.jsxs("header",{className:"top-bar",children:[e.jsx("div",{className:"top-deco left"}),e.jsx("div",{className:"title-wrap",children:e.jsx("h1",{children:"隆昌基地大数据综合看板"})}),e.jsx("div",{className:"top-deco right"}),e.jsx("div",{className:"top-time",children:Pe(a)})]}),e.jsxs("main",{className:"board cockpit-board",children:[e.jsxs("aside",{className:"col left",children:[e.jsxs("section",{className:"panel panel-flex-40",children:[e.jsx("div",{className:"panel-title",children:"客源分析"}),e.jsx("div",{style:{height:"180px",marginTop:"10px"},children:e.jsx(De,{data:s})}),e.jsxs("div",{className:"customer-stats",children:[e.jsxs("div",{className:"stat-row",children:[e.jsx("span",{className:"stat-label",children:"自驾游"}),e.jsxs("span",{className:"stat-value",children:[s[0].value," 人"]})]}),e.jsxs("div",{className:"stat-row",children:[e.jsx("span",{className:"stat-label",children:"组团"}),e.jsxs("span",{className:"stat-value",children:[s[1].value," 人"]})]})]})]}),e.jsxs("section",{className:"panel panel-flex-50",children:[e.jsx("div",{className:"panel-title",children:"客源地TOP"}),e.jsx(Ae,{data:[{rank:1,name:"市中区",value:"87.7%"},{rank:2,name:"东兴区",value:"15.4%"},{rank:3,name:"隆昌县",value:"1.02%"},{rank:4,name:"威远县",value:"0.97%"},{rank:5,name:"隆昌市",value:"0.97%"}]})]})]}),e.jsxs("section",{className:"col center",children:[e.jsxs("div",{className:"hero-section",children:[e.jsx("div",{className:"hero-label",children:"年度基地消费（元）"}),e.jsx(H,{value:45e6,label:""})]}),e.jsxs("div",{className:"cockpit-metrics",children:[e.jsx(N,{value:6,label:"基地总数"}),e.jsx(N,{value:100,label:"课程总数",color:"#9AF3D4"}),e.jsx(N,{value:6930,label:"实时客流量",color:"#D7A6FF"}),e.jsx(N,{value:1676030,label:"年度累计客流量",color:"#FFE08A"}),e.jsx(N,{value:69684190,label:"年度客消耗量",color:"#FFB199"}),e.jsx(N,{value:"0.15%",label:"门店",color:"#F3D6FF"})]}),e.jsx("div",{className:"map-wrap-cockpit",children:e.jsxs($,{camera:{position:[0,50,80],fov:50},children:[e.jsx("ambientLight",{intensity:.5}),e.jsx("pointLight",{position:[50,50,50],intensity:1}),e.jsx(_,{}),e.jsx(B,{enableZoom:!0,enablePan:!0,maxPolarAngle:Math.PI/2,minDistance:50,maxDistance:150})]})})]}),e.jsxs("aside",{className:"col right",children:[e.jsxs("section",{className:"panel panel-flex-25",children:[e.jsx("div",{className:"panel-title",children:"排地榜单"}),e.jsxs("div",{className:"ranking-grid",children:[e.jsxs("div",{className:"ranking-item",children:[e.jsx("span",{className:"ranking-badge",children:"1"}),e.jsx("span",{className:"ranking-name",children:"基地1"})]}),e.jsxs("div",{className:"ranking-item",children:[e.jsx("span",{className:"ranking-badge",children:"2"}),e.jsx("span",{className:"ranking-name",children:"基地2"})]}),e.jsxs("div",{className:"ranking-item",children:[e.jsx("span",{className:"ranking-badge",children:"3"}),e.jsx("span",{className:"ranking-name",children:"基地3"})]}),e.jsxs("div",{className:"ranking-item",children:[e.jsx("span",{className:"ranking-badge",children:"4"}),e.jsx("span",{className:"ranking-name",children:"基地4"})]}),e.jsxs("div",{className:"ranking-item",children:[e.jsx("span",{className:"ranking-badge",children:"5"}),e.jsx("span",{className:"ranking-name",children:"基地5"})]})]})]}),e.jsxs("section",{className:"panel panel-flex-30",children:[e.jsx("div",{className:"panel-title",children:"消费详情"}),e.jsx("div",{style:{height:"160px",marginTop:"10px"},children:e.jsx(Y,{data:n.map(t=>({label:t.label,value:t.value,percentage:parseInt(t.percentage),color:t.color})),size:80})})]}),e.jsxs("section",{className:"panel panel-flex-40",children:[e.jsx("div",{className:"panel-title",children:"客户画像"}),e.jsxs("div",{className:"sub-section",children:[e.jsx("div",{className:"sub-title",children:"访题时间"}),e.jsx(k,{label:"00-17次",value:10,color:"#00aaff",percentage:"10.0%"}),e.jsx(k,{label:"次",value:10,color:"#9AF3D4",percentage:"10.0%"}),e.jsx(k,{label:"3次",value:10,color:"#D7A6FF",percentage:"10.0%"}),e.jsx(k,{label:"4次",value:10,color:"#FFE08A",percentage:"10.0%"}),e.jsx(k,{label:"5次",value:10,color:"#FFB199",percentage:"10.0%"})]}),e.jsxs("div",{className:"sub-section",children:[e.jsx("div",{className:"sub-title",children:"年龄分布"}),e.jsx(k,{label:"幼儿园",value:10,color:"#00aaff",percentage:"10.0%"}),e.jsx(k,{label:"小学",value:10,color:"#9AF3D4",percentage:"10.0%"}),e.jsx(k,{label:"初中",value:10,color:"#D7A6FF",percentage:"10.0%"}),e.jsx(k,{label:"高中",value:10,color:"#FFE08A",percentage:"10.0%"}),e.jsx(k,{label:"职校",value:10,color:"#FFB199",percentage:"10.0%"})]}),e.jsx("div",{className:"sub-section",children:e.jsx(Ce,{genderData:{male:37.9,female:62.1}})})]})]})]}),e.jsx("style",{children:`
        .cockpit-board {
          padding: 80px 20px 20px;
        }
        .hero-section {
          text-align: center;
          padding: 20px 0;
        }
        .hero-label {
          font-size: 18px;
          color: rgba(255, 255, 255, 0.9);
          margin-bottom: 10px;
          letter-spacing: 2px;
        }
        .cockpit-metrics {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 15px;
          margin: 20px 0;
        }
        .map-wrap-cockpit {
          height: 400px;
          background: rgba(0, 20, 40, 0.3);
          border-radius: 12px;
          border: 1px solid rgba(0, 170, 255, 0.2);
          overflow: hidden;
        }
        .customer-stats {
          margin-top: 15px;
          padding: 10px;
          background: rgba(0, 170, 255, 0.05);
          border-radius: 8px;
        }
        .stat-row {
          display: flex;
          justify-content: space-between;
          padding: 6px 0;
          font-size: 13px;
        }
        .stat-label {
          color: rgba(255, 255, 255, 0.7);
        }
        .stat-value {
          font-family: 'Orbitron', monospace;
          font-weight: 700;
          color: #00ffff;
        }
        .ranking-grid {
          display: flex;
          flex-direction: column;
          gap: 8px;
          padding: 5px 0;
        }
        .ranking-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 8px 12px;
          background: rgba(0, 170, 255, 0.08);
          border-radius: 6px;
        }
        .sub-section {
          margin-top: 15px;
        }
        .sub-title {
          font-size: 13px;
          color: rgba(255, 255, 255, 0.8);
          margin-bottom: 10px;
          padding-left: 10px;
          border-left: 3px solid #00aaff;
        }
      `})]})};function Re(){const[a,s]=u.useState("dashboard");return e.jsxs(e.Fragment,{children:[e.jsxs("div",{style:{position:"fixed",top:"20px",right:"20px",zIndex:9999,display:"flex",gap:"10px",background:"rgba(0, 20, 40, 0.9)",padding:"10px",borderRadius:"8px",border:"1px solid rgba(0, 170, 255, 0.3)",backdropFilter:"blur(10px)"},children:[e.jsx("button",{onClick:()=>s("dashboard"),style:{padding:"8px 16px",background:a==="dashboard"?"linear-gradient(135deg, #00aaff, #0088cc)":"rgba(0, 170, 255, 0.2)",color:"#fff",border:a==="dashboard"?"1px solid #00aaff":"1px solid rgba(0, 170, 255, 0.4)",borderRadius:"6px",cursor:"pointer",fontSize:"13px",fontWeight:600,transition:"all 0.3s ease",fontFamily:"PingFang SC, Microsoft YaHei, sans-serif"},children:"综合实践教育数据看板"}),e.jsx("button",{onClick:()=>s("cockpit"),style:{padding:"8px 16px",background:a==="cockpit"?"linear-gradient(135deg, #00aaff, #0088cc)":"rgba(0, 170, 255, 0.2)",color:"#fff",border:a==="cockpit"?"1px solid #00aaff":"1px solid rgba(0, 170, 255, 0.4)",borderRadius:"6px",cursor:"pointer",fontSize:"13px",fontWeight:600,transition:"all 0.3s ease",fontFamily:"PingFang SC, Microsoft YaHei, sans-serif"},children:"数据驾驶舱"})]}),a==="dashboard"?e.jsx(Se,{}):e.jsx(Ie,{})]})}se.createRoot(document.getElementById("root")).render(e.jsx(te.StrictMode,{children:e.jsx(Re,{})}));
