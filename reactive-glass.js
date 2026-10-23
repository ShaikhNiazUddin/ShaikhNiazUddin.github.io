(() => {
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 const layer=document.createElement('div');
 layer.className='cursor-glass-light';
 layer.setAttribute('aria-hidden','true');
 document.body.append(layer);
 const grain=document.querySelector('#film-grain');
 let x=innerWidth/2,y=innerHeight/2,tx=x,ty=y,frame=0;
 function paint(){
  frame=0;
  x+=(tx-x)*.12;y+=(ty-y)*.12;
  layer.style.setProperty('--glass-x',`${x}px`);
  layer.style.setProperty('--glass-y',`${y}px`);
  if(grain)grain.style.transform=`translate(${(x/innerWidth-.5)*12}px,${(y/innerHeight-.5)*12}px)`;
  if(Math.abs(tx-x)+Math.abs(ty-y)>.2)frame=requestAnimationFrame(paint);
 }
 function reset(){
  layer.classList.remove('is-active');
  cancelAnimationFrame(frame);frame=0;
  if(grain)grain.style.transform='';
 }
 addEventListener('pointermove',e=>{
  if(reduced.matches||e.pointerType==='touch')return;
  tx=e.clientX;ty=e.clientY;
  layer.classList.add('is-active');
  if(!frame)frame=requestAnimationFrame(paint);
 },{passive:true});
 document.documentElement.addEventListener('pointerleave',reset);
 document.addEventListener('visibilitychange',()=>{if(document.hidden)reset();});
 reduced.addEventListener('change',reset);
})();
