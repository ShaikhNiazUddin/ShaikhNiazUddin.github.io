(() => {
  const root=document.documentElement;
  const loader=document.querySelector('.portfolio-loader');
  if(!loader)return;
  const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  let finished=false, timers=[], disabled=[];
  function finish(immediate=false){
    if(finished)return;
    finished=true;timers.forEach(clearTimeout);
    loader.classList.add('loader-exit');
    const reveal=()=>{
      loader.remove();root.classList.remove('portfolio-loading');
      disabled.forEach(el=>{el.inert=false;});
      dispatchEvent(new Event('portfolio-ready'));
    };
    if(immediate||reduced)reveal();else setTimeout(reveal,750);
  }
  if(!root.classList.contains('portfolio-loading')||reduced){finish(true);return;}
  [...document.body.children].forEach(el=>{
    if(el!==loader&&!el.inert&&!el.matches('script,style,.cursor-dot,.cursor-ring')){el.inert=true;disabled.push(el);}
  });
  loader.querySelector('button').addEventListener('click',()=>finish());
  loader.addEventListener('keydown',event=>{if(event.key==='Escape')finish();});
  const finalImage=loader.querySelector('[data-loader-final]');
  const images=[...loader.querySelectorAll('img:not([data-loader-final])')];
  // Shuffle each artwork once, keeping the Bangladesh design for the finale.
  for(let i=images.length-1;i>0;i--){
    const j=Math.floor(Math.random()*(i+1));
    [images[i],images[j]]=[images[j],images[i]];
  }
  if(finalImage)images.push(finalImage);
  images.forEach(image=>{image.loading='eager';});
  const delay=(fn,ms)=>timers.push(setTimeout(fn,ms));
  const fonts=document.fonts?document.fonts.ready:Promise.resolve();
  Promise.race([fonts,new Promise(resolve=>setTimeout(resolve,600))]).then(()=>{
    if(finished)return;
    delay(()=>loader.classList.add('loader-open'),400);
    images.forEach((image,index)=>{
      delay(()=>{
        images.forEach(item=>item.classList.remove('active'));
        loader.classList.toggle('loader-large',index%2===0);
        image.classList.add('active');
      },400+index*380);
    });
    delay(()=>finish(),400+images.length*380+250);
  });
  // The page remains usable even if a font or artwork cannot load.
  delay(()=>finish(true),5500);
})();
