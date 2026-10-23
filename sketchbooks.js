(() => {
 const shelf=document.querySelector('.floating-books'),dialog=document.querySelector('.sketchbook-dialog');
 if(!shelf||!dialog)return;
 const spread=dialog.querySelector('.book-spread'),image=dialog.querySelector('.spread-image'),leaf=dialog.querySelector('.turning-leaf img'),count=dialog.querySelector('.reader-count'),previous=dialog.querySelector('.reader-prev'),next=dialog.querySelector('.reader-next');
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 let book,index=0,busy=false,opener,timer,oldOverflow,queued=0,session=0;
 const decoded=new Map();
 function preload(page){
  if(!page)return Promise.resolve();
  if(decoded.has(page.src))return decoded.get(page.src);
  const img=new Image();img.src=page.src;
  const ready=img.decode().catch(()=>{});decoded.set(page.src,ready);
  if(decoded.size>10)decoded.delete(decoded.keys().next().value);
  return ready;
 }
 function render(){
  const page=book.pages[index];image.src=page.src;image.alt=`${book.title}, spread ${index+1}`;
  const ratio=page.width/page.height,available=dialog.querySelector('.reader-stage').clientHeight-44;
  spread.style.setProperty('--spread-ratio',ratio);spread.style.width=Math.min(innerWidth*.86,1050,available*ratio)+'px';
  count.textContent=`${index+1} / ${book.pages.length}`;previous.disabled=index===0;next.disabled=index===book.pages.length-1;
  [-2,-1,1,2,3].forEach(offset=>preload(book.pages[index+offset]));
 }
 async function turn(direction){
  if(busy){queued=direction;return;}
  if(index+direction<0||index+direction>=book.pages.length)return;
  if(reduced.matches){index+=direction;render();return;}
  busy=true;const currentSession=session;
  await preload(book.pages[index+direction]);
  if(currentSession!==session||!dialog.open)return;
  leaf.src=image.src;spread.classList.add(direction>0?'turn-next':'turn-prev');
  // Reveal the decoded next spread under the turning leaf immediately.
  index+=direction;render();
  timer=setTimeout(()=>{spread.classList.remove('turn-next','turn-prev');busy=false;const pending=queued;queued=0;if(pending)turn(pending);},360);
 }
 sketchbookData.forEach(item=>{
  const button=document.createElement('button');button.className='floating-book';button.type='button';button.setAttribute('aria-label','Open '+item.title);
  const cover=document.createElement('img');cover.src=item.cover;cover.alt=item.title+' cover';cover.loading='lazy';const label=document.createElement('span');label.textContent=item.title;button.append(cover,label);shelf.append(button);
  button.addEventListener('pointerenter',()=>item.pages.slice(0,3).forEach(preload));
  button.addEventListener('focus',()=>item.pages.slice(0,3).forEach(preload));
  button.addEventListener('click',()=>{session++;queued=0;book=item;index=0;opener=button;item.pages.slice(0,5).forEach(preload);dialog.querySelector('#reader-title').textContent=item.title;oldOverflow=document.documentElement.style.overflow;document.documentElement.style.overflow='hidden';dialog.showModal();requestAnimationFrame(()=>{
    render();
    if(!reduced.matches){
      busy=true;const coverFlip=document.createElement('div');coverFlip.className='opening-cover';const coverImage=document.createElement('img');coverImage.src=item.cover;coverImage.alt='';coverFlip.append(coverImage);spread.append(coverFlip);
      timer=setTimeout(()=>{coverFlip.remove();busy=false;const pending=queued;queued=0;if(pending)turn(pending);},550);
    }
   });});
 });
 previous.addEventListener('click',()=>turn(-1));next.addEventListener('click',()=>turn(1));
 dialog.querySelector('.reader-close').addEventListener('click',()=>dialog.close());
 dialog.addEventListener('close',()=>{session++;queued=0;clearTimeout(timer);spread.querySelector('.opening-cover')?.remove();busy=false;spread.classList.remove('turn-next','turn-prev');document.documentElement.style.overflow=oldOverflow;opener?.focus({preventScroll:true});});
 dialog.addEventListener('keydown',e=>{if(e.key==='ArrowRight'){e.preventDefault();turn(1);}if(e.key==='ArrowLeft'){e.preventDefault();turn(-1);}});
 let startX=null,swiped=false;
 spread.addEventListener('pointerdown',e=>{startX=e.clientX;swiped=false;});
 spread.addEventListener('pointerup',e=>{if(startX!==null&&Math.abs(e.clientX-startX)>40){swiped=true;turn(e.clientX<startX?1:-1);}startX=null;});
 spread.addEventListener('pointercancel',()=>{startX=null;});
 spread.addEventListener('click',e=>{if(swiped){swiped=false;return;}const rect=spread.getBoundingClientRect();turn(e.clientX<rect.left+rect.width/2?-1:1);});
 addEventListener('resize',()=>{if(dialog.open)render();});
})();
