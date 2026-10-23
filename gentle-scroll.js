(() => {
 const personal=!!document.querySelector('.home-intro');
 const sections=[...document.querySelectorAll(personal?'.home-intro,#memories,#sketchbooks,.film-page,#the-end':'.hero-landing,section[id],footer[id]')];
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 let timer=0,frame=0,touching=false,animating=false,previousBehavior='';
 function blocked(){return document.documentElement.dataset.landingTransition||document.querySelector('dialog[open],#org-panel:not([hidden]),#project-modal:not(.hidden)')||document.fullscreenElement||document.querySelector('#menu-btn[aria-expanded="true"]');}
 function cancel(){
  clearTimeout(timer);cancelAnimationFrame(frame);frame=0;
  if(animating)document.documentElement.style.scrollBehavior=previousBehavior;
  animating=false;
 }
 function settle(){
  if(touching||reduced.matches||blocked()||document.documentElement.dataset.rulerDragging)return;
  const y=scrollY,max=Math.max(0,document.documentElement.scrollHeight-innerHeight);
  const candidates=sections.flatMap(section=>{
   const top=section.getBoundingClientRect().top+y;
   return [top,top+section.offsetHeight-innerHeight].map(v=>Math.max(0,Math.min(max,v)));
  });
  const target=candidates.reduce((best,v)=>Math.abs(v-y)<Math.abs(best-y)?v:best,y+innerHeight*2);
  const distance=target-y;
  if(Math.abs(distance)<2||Math.abs(distance)>Math.min(72,innerHeight*.1))return;
  previousBehavior=document.documentElement.style.scrollBehavior;
  document.documentElement.style.scrollBehavior='auto';animating=true;
  const start=performance.now(),duration=220+Math.abs(distance)*1.6;
  function step(now){
   if(blocked()||reduced.matches){cancel();return;}
   const p=Math.min(1,(now-start)/duration),ease=1-Math.pow(1-p,3);
   scrollTo({top:y+distance*ease,behavior:'instant'});
   if(p<1)frame=requestAnimationFrame(step);else cancel();
  }
  frame=requestAnimationFrame(step);
 }
 addEventListener('scroll',()=>{
  if(animating)return;
  clearTimeout(timer);if(!touching)timer=setTimeout(settle,220);
 },{passive:true});
 addEventListener('wheel',cancel,{passive:true});
 addEventListener('pointerdown',cancel,{passive:true});
 addEventListener('keydown',cancel);
 addEventListener('touchstart',()=>{touching=true;cancel();},{passive:true});
 addEventListener('touchend',()=>{touching=false;clearTimeout(timer);timer=setTimeout(settle,280);},{passive:true});
 addEventListener('touchcancel',()=>{touching=false;cancel();},{passive:true});
 addEventListener('pagehide',cancel);
 reduced.addEventListener('change',cancel);
})();
