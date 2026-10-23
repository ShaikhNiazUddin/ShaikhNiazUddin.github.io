(() => {
 const hero=document.querySelector('.hero-landing'),about=document.querySelector('#about');
 if(!hero||!about)return;
 const reduced=matchMedia('(prefers-reduced-motion: reduce)'),root=document.documentElement;
 let frame=0,active=false,direction=0,quietUntil=0,oldBehavior='',touch=null;
 const aboutTop=()=>about.getBoundingClientRect().top+scrollY;
 function excluded(target){return target.closest('a,button,input,textarea,select,video,#org-panel,#menu,#project-modal')||document.querySelector('dialog[open],#menu-btn[aria-expanded="true"]')||reduced.matches;}
 function destination(down,y=scrollY){
  const edge=aboutTop();
  if(down&&y<edge-4)return edge;
  if(!down&&y>3&&y<=edge+8)return 0;
  return null;
 }
 function cancel(){
  cancelAnimationFrame(frame);frame=0;
  if(active)root.style.scrollBehavior=oldBehavior;
  active=false;delete root.dataset.landingTransition;
 }
 function glide(target,down){
  cancel();const start=scrollY;oldBehavior=root.style.scrollBehavior;
  root.style.scrollBehavior='auto';root.dataset.landingTransition='true';active=true;direction=down?1:-1;
  const began=performance.now(),duration=540;
  function step(now){
   const p=Math.min(1,(now-began)/duration),ease=p*p*(3-2*p);
   scrollTo({top:start+(target-start)*ease,behavior:'instant'});
   if(p<1)frame=requestAnimationFrame(step);
   else{cancel();quietUntil=performance.now()+180;}
  }
  frame=requestAnimationFrame(step);
 }
 addEventListener('wheel',event=>{
  if(event.ctrlKey||Math.abs(event.deltaY)<=Math.abs(event.deltaX)||excluded(event.target))return;
  const down=event.deltaY>0,sign=down?1:-1;
  if(active&&sign===direction){event.preventDefault();return;}
  if(!active&&performance.now()<quietUntil&&sign===direction){event.preventDefault();return;}
  if(active)cancel();
  const target=destination(down);
  if(target===null)return;
  event.preventDefault();glide(target,down);
 },{passive:false});
 addEventListener('touchstart',event=>{
  cancel();touch=event.touches.length===1&&!excluded(event.target)?{x:event.touches[0].clientX,y:event.touches[0].clientY,scroll:scrollY,target:null}:null;
 },{passive:true});
 addEventListener('touchmove',event=>{
  if(!touch||event.touches.length!==1)return;
  const dx=touch.x-event.touches[0].clientX,dy=touch.y-event.touches[0].clientY;
  if(Math.abs(dy)<12||Math.abs(dy)<=Math.abs(dx))return;
  const target=destination(dy>0,touch.scroll);
  if(target!==null){event.preventDefault();touch.target=target;touch.down=dy>0;}
 },{passive:false});
 addEventListener('touchend',()=>{if(touch?.target!==null&&touch?.target!==undefined)glide(touch.target,touch.down);touch=null;},{passive:true});
 addEventListener('touchcancel',()=>{touch=null;cancel();},{passive:true});
 addEventListener('pointerdown',cancel,{passive:true});
 addEventListener('keydown',cancel);
 addEventListener('pagehide',cancel);reduced.addEventListener('change',cancel);
})();
