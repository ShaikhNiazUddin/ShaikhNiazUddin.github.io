(() => {
 const root=document.documentElement;
 const rail=document.createElement('div');rail.className='ruler-rail';
 const thumb=document.createElement('div');thumb.className='ruler-thumb';
 thumb.tabIndex=0;thumb.setAttribute('role','scrollbar');thumb.setAttribute('aria-label','Page scroll position');thumb.setAttribute('aria-orientation','vertical');thumb.setAttribute('aria-valuemin','0');thumb.setAttribute('aria-valuemax','100');
 rail.append(thumb);document.body.append(rail);root.classList.add('ruler-ready');
 let frame=0,drag=null;
 function update(){
  frame=0;const height=innerHeight,total=root.scrollHeight,max=Math.max(0,total-height);
  rail.hidden=!max||!!document.fullscreenElement||!!document.querySelector('dialog[open]')||root.style.overflow==='hidden';
  const size=Math.max(38,height*height/total),position=max?Math.max(0,Math.min(1,scrollY/max)):0;
  thumb.style.height=size+'px';thumb.style.transform=`translateY(${position*(height-size)}px)`;
  thumb.setAttribute('aria-valuenow',Math.round(position*100));
 }
 function schedule(){if(!frame)frame=requestAnimationFrame(update);}
 function move(y){
  const size=thumb.offsetHeight,range=innerHeight-size;
  scrollTo({top:Math.max(0,Math.min(1,y/range))*(root.scrollHeight-innerHeight),behavior:'instant'});
 }
 rail.addEventListener('pointerdown',e=>{
  if(e.button!==0)return;e.preventDefault();
  drag=e.target===thumb?e.clientY-thumb.getBoundingClientRect().top:thumb.offsetHeight/2;
  rail.setPointerCapture(e.pointerId);rail.classList.add('is-dragging');
  root.dataset.rulerDragging='true';move(e.clientY-drag);
 });
 rail.addEventListener('pointermove',e=>{if(drag!==null)move(e.clientY-drag);});
 function stop(){drag=null;rail.classList.remove('is-dragging');delete root.dataset.rulerDragging;}
 rail.addEventListener('pointerup',stop);rail.addEventListener('pointercancel',stop);rail.addEventListener('lostpointercapture',stop);
 thumb.addEventListener('keydown',e=>{
  const steps={ArrowDown:80,ArrowUp:-80,PageDown:innerHeight*.85,PageUp:-innerHeight*.85,Home:-root.scrollHeight,End:root.scrollHeight};
  if(!(e.key in steps))return;e.preventDefault();scrollBy({top:steps[e.key],behavior:'instant'});
 });
 addEventListener('scroll',schedule,{passive:true});addEventListener('resize',schedule);addEventListener('load',schedule);document.addEventListener('fullscreenchange',schedule);
 new ResizeObserver(schedule).observe(document.body);
 new MutationObserver(schedule).observe(root,{attributes:true,attributeFilter:['style']});
 document.addEventListener('toggle',schedule,true);update();
})();
