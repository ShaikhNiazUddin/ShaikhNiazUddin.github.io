(() => {
 const dialog=document.querySelector('.memory-lightbox'),large=dialog.querySelector('img');
 let raised=30;
 document.querySelectorAll('.memory-photo').forEach(card=>{
  let start=null,moved=false,dx=0,dy=0;
  card.addEventListener('pointerdown',e=>{if(e.button!==0)return;start={x:e.clientX,y:e.clientY,dx,dy};moved=false;card.style.zIndex=++raised;});
  card.addEventListener('pointermove',e=>{if(!start)return;const x=e.clientX-start.x,y=e.clientY-start.y;if(Math.hypot(x,y)>6&&!moved){moved=true;card.setPointerCapture(e.pointerId);card.classList.add('dragging');}if(moved){dx=Math.max(-innerWidth*.25,Math.min(innerWidth*.25,start.dx+x));dy=Math.max(-250,Math.min(250,start.dy+y));card.style.setProperty('--dx',dx+'px');card.style.setProperty('--dy',dy+'px');}});
  card.addEventListener('pointerup',()=>{start=null;card.classList.remove('dragging');});
  card.addEventListener('pointercancel',()=>{start=null;card.classList.remove('dragging');moved=true;});
  card.addEventListener('click',e=>{if(moved&&e.detail!==0){moved=false;return;}const img=card.querySelector('img');large.src=img.src;large.alt=img.alt;dialog.showModal();});
 });
 dialog.querySelector('button').addEventListener('click',()=>dialog.close());
 dialog.addEventListener('click',e=>{if(e.target===dialog)dialog.close();});
})();
