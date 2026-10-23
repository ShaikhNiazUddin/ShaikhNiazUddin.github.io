(() => {
 const pages=['.home-intro','#memories','#sketchbooks','#film-1','#film-2','#film-3','#film-4','#the-end'].map(s=>document.querySelector(s)).filter(Boolean);
 if(pages.length<2)return;
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 let frame=0,active=false,direction=0,quietUntil=0,lastWheel=0,accumulated=0,oldBehavior='';
 const top=page=>page.getBoundingClientRect().top+scrollY;
 const clamp=y=>Math.max(0,Math.min(y,document.documentElement.scrollHeight-innerHeight));
 function cancel(){cancelAnimationFrame(frame);frame=0;if(active)document.documentElement.style.scrollBehavior=oldBehavior;active=false;quietUntil=0;accumulated=0;}
 function destination(down){
  const y=scrollY,tops=pages.map(top),slop=3;
  let i=0;for(let j=1;j<tops.length;j++)if(y>=tops[j]-slop)i=j;
  const start=tops[i],last=Math.max(start,start+pages[i].offsetHeight-innerHeight);
  // Browse the whole photo collage freely; snap only when leaving it.
  if(pages[i]===document.querySelector('#memories')){
   if(down&&y>=last-3&&i<pages.length-1)return ()=>top(pages[i+1]);
   if(!down&&y<=start+3&&i>0)return ()=>Math.max(top(pages[i-1]),top(pages[i-1])+pages[i-1].offsetHeight-innerHeight);
   return null;
  }
  // Long sections retain all their content, with one viewport per gesture.
  if(down){
   if(y<last-3)return ()=>Math.min(top(pages[i])+pages[i].offsetHeight-innerHeight,y+innerHeight);
   if(i<pages.length-1)return ()=>top(pages[i+1]);
  }else{
   if(y>start+3)return ()=>Math.max(top(pages[i]),y-innerHeight);
   if(i>0)return ()=>Math.max(top(pages[i-1]),top(pages[i-1])+pages[i-1].offsetHeight-innerHeight);
  }
  return null;
 }
 function glide(resolve,down){
  const start=scrollY,target=clamp(resolve());
  if(Math.abs(target-start)<2)return;
  active=true;direction=down?1:-1;oldBehavior=document.documentElement.style.scrollBehavior;document.documentElement.style.scrollBehavior='auto';
  const began=performance.now(),duration=Math.min(1150,Math.max(700,650+Math.abs(target-start)*.3));
  function step(now){
   if(document.querySelector('dialog[open]')||reduced.matches){cancel();return;}
   const p=Math.min(1,(now-began)/duration),ease=p*p*p*(p*(p*6-15)+10);
   scrollTo({top:start+(clamp(resolve())-start)*ease,behavior:'instant'});
   if(p<1)frame=requestAnimationFrame(step);
   else{frame=0;active=false;document.documentElement.style.scrollBehavior=oldBehavior;quietUntil=performance.now()+160;}
  }
  frame=requestAnimationFrame(step);
 }
 function excluded(target){return target.closest('input,textarea,select,video,.tonearm,.memory-photo.dragging,[contenteditable=true]')||document.querySelector('dialog[open]');}
 addEventListener('wheel',e=>{
  if(reduced.matches||e.ctrlKey||Math.abs(e.deltaY)<=Math.abs(e.deltaX)||excluded(e.target))return;
  const now=performance.now(),delta=e.deltaY*(e.deltaMode===1?16:e.deltaMode===2?innerHeight:1),down=delta>0;
  if(active){if((down?1:-1)!==direction){cancel();}else{e.preventDefault();return;}}
  if(now<quietUntil&&(down?1:-1)===direction){e.preventDefault();return;}
  const resolve=destination(down);
  if(!resolve){accumulated=0;return;}
  e.preventDefault();
  if(now-lastWheel>180||Math.sign(accumulated)!==Math.sign(delta))accumulated=0;
  lastWheel=now;accumulated+=delta;
  if(Math.abs(accumulated)>=12){accumulated=0;glide(resolve,down);}
 },{passive:false});
 addEventListener('keydown',e=>{
  if(reduced.matches||excluded(e.target)||e.target.closest('button,a'))return;
  if(!['PageDown','PageUp','ArrowDown','ArrowUp',' '].includes(e.key))return;
  const down=e.key==='PageDown'||e.key==='ArrowDown'||(e.key===' '&&!e.shiftKey);
  if(active){e.preventDefault();if((down?1:-1)===direction)return;cancel();}
  const resolve=destination(down);if(resolve){e.preventDefault();glide(resolve,down);}
 });
 addEventListener('pointerdown',()=>{if(active)cancel();},{passive:true});
 let touchY=null,touchScroll=0;
 addEventListener('touchstart',e=>{cancel();touchY=excluded(e.target)?null:e.touches[0].clientY;touchScroll=scrollY;},{passive:true});
 addEventListener('touchend',e=>{
  if(touchY===null||excluded(e.target))return;
  const delta=touchY-e.changedTouches[0].clientY;touchY=null;
  if(Math.abs(delta)<45)return;
  const down=delta>0,resolve=destination(down);
  if(resolve&&!reduced.matches){
   // Settle a native swipe at the adjacent screen rather than skipping content.
   const current=scrollY;
   scrollTo({top:touchScroll,behavior:'instant'});
   const target=destination(down);scrollTo({top:current,behavior:'instant'});
   if(target)glide(target,down);
  }
 },{passive:true});
 addEventListener('pagehide',cancel);addEventListener('pageshow',()=>{quietUntil=0;});
 reduced.addEventListener('change',cancel);
})();
