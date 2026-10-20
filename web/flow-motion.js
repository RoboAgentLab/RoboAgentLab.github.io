// Fixed connectors with constant-distance particles; no diagram topology changes.
(() => {
  const ns='http://www.w3.org/2000/svg',flows=[],groups=new Map();
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const control=document.getElementById('diagram-motion-toggle');
  let paused=false,frame=0,last=0,elapsed=0;
  function svgElement(tag,attrs){const e=document.createElementNS(ns,tag);Object.entries(attrs).forEach(([k,v])=>e.setAttribute(k,v));return e;}
  function addArrow(host,direction,group,order=0,target=null,offset=0){
    const svg=svgElement('svg',{viewBox:'0 0 30 24',class:'flow-arrow','aria-hidden':'true'});
    const paths=direction==='both'?['M2 7H27','M28 17H3']:direction==='up'?['M15 22V2']:direction==='down'?['M15 2V22']:['M2 12H28'];
    const heads=direction==='both'?['M22 3l5 4-5 4','M8 13l-5 4 5 4']:direction==='up'?['M10 7l5-5 5 5']:direction==='down'?['M10 17l5 5 5-5']:['M23 7l5 5-5 5'];
    paths.forEach((d,i)=>{const path=svgElement('path',{d,class:'flow-track'}),head=svgElement('path',{d:heads[i],class:'flow-track'}),dot=svgElement('circle',{r:2.5,class:'flow-dot'});svg.append(path,head,dot);flows.push({path,dot,group,order,target,offset:offset+i*1300});});
    host.replaceChildren(svg);
    if(!groups.has(group))groups.set(group,false);
  }
  document.querySelectorAll('[data-flow-sequence]').forEach((route,i)=>{
    route.querySelectorAll('.dr-connector').forEach(host=>{const order=Number(host.dataset.flowOrder);addArrow(host,'right',route,order,route.querySelector(`[data-flow-node="${order+1}"]`),i*4200);});
  });
  const arch=document.getElementById('architecture-map');
  if(arch){
    arch.querySelectorAll('.arch-side-arrow,.arch-wire b,.arch-loop>b').forEach((host,i)=>{const symbol=host.textContent.trim();addArrow(host,symbol==='↔'?'both':symbol==='↑'?'up':symbol==='↓'?'down':'right',arch,0,null,i*570);});
    const loop=arch.querySelector('.arch-loop-return');
    if(loop){const path=svgElement('path',{d:'M380 2v14H40V2',fill:'none',stroke:'none'}),dot=svgElement('circle',{r:2.5,class:'flow-dot',stroke:'none'});loop.append(path,dot);flows.push({path,dot,group:arch,order:0,target:null,offset:1800});}
  }
  const taxonomy=document.getElementById('taxonomy');
  document.querySelectorAll('.tx-bridge b').forEach((host,i)=>addArrow(host,host.classList.contains('tx-up')?'up':'down',taxonomy||host.parentElement,0,null,i*1100));
  const observer=new IntersectionObserver(entries=>{entries.forEach(e=>groups.set(e.target,e.isIntersecting));restart();},{threshold:0});
  groups.forEach((_,group)=>observer.observe(group));
  function allowed(){return !paused&&!reduced.matches&&!document.hidden&&!document.querySelector('dialog[open]')&&[...groups.values()].some(Boolean);}
  function tick(now){
    frame=0;if(!allowed()){last=0;return;}
    if(last)elapsed+=Math.min(now-last,100);last=now;
    flows.forEach(flow=>{
      if(!groups.get(flow.group)){flow.dot.style.opacity=0;return;}
      const sequence=flow.group.hasAttribute('data-flow-sequence');
      const phase=(elapsed+flow.offset)%(sequence?8400:3600);
      const local=sequence?phase-flow.order*2500:phase;
      const active=local>=0&&local<1800;
      flow.dot.style.opacity=active?'0.95':'0';
      if(active){const p=flow.path.getPointAtLength(flow.path.getTotalLength()*local/1800);flow.dot.setAttribute('cx',p.x);flow.dot.setAttribute('cy',p.y);}
      flow.target?.classList.toggle('flow-lit',local>=1600&&local<2400);
    });
    frame=requestAnimationFrame(tick);
  }
  function restart(){
    if(!allowed()){cancelAnimationFrame(frame);frame=0;last=0;return;}
    if(!frame)frame=requestAnimationFrame(tick);
  }
  function updateControl(){if(!control)return;control.disabled=reduced.matches;control.setAttribute('aria-pressed',String(paused));control.textContent=reduced.matches?'Reduced motion enabled':paused?'Play diagram animation':'Pause diagram animation';}
  control?.addEventListener('click',()=>{paused=!paused;updateControl();restart();});
  reduced.addEventListener('change',()=>{updateControl();restart();});
  document.addEventListener('visibilitychange',restart);
  const dialogs=new MutationObserver(restart);document.querySelectorAll('dialog').forEach(d=>dialogs.observe(d,{attributes:true,attributeFilter:['open']}));
  updateControl();restart();
})();
