(() => {
 const layer=document.createElement('div');
 layer.className='passion-pattern';
 layer.setAttribute('aria-hidden','true');
 document.body.prepend(layer);
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 let position=scrollY,frame=0;
 function draw(){
  frame=0;
  position+=(scrollY-position)*.12;
  layer.style.backgroundPosition=`${-position*.035}px ${-position*.18}px`;
  if(Math.abs(scrollY-position)>.2)frame=requestAnimationFrame(draw);
 }
 function update(){if(!reduced.matches&&!document.hidden&&!frame)frame=requestAnimationFrame(draw);}
 addEventListener('scroll',update,{passive:true});
 document.addEventListener('visibilitychange',()=>{
  if(document.hidden){cancelAnimationFrame(frame);frame=0;}else update();
 });
 reduced.addEventListener('change',()=>{
  cancelAnimationFrame(frame);frame=0;
  if(reduced.matches)layer.style.backgroundPosition='0 0';else update();
 });
 update();
})();
