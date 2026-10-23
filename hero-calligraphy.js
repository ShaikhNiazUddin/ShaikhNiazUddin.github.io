(() => {
  const hero=document.querySelector('.hero-landing');
  const stage=document.getElementById('hero-stage');
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const art=new Image();
  art.onload=()=>{
    // Use the supplied lettering as an exact mask; CSS supplies the site crimson.
    const canvas=document.createElement('canvas');
    canvas.width=art.naturalWidth;canvas.height=art.naturalHeight;
    const ctx=canvas.getContext('2d');
    if(!ctx)return;
    ctx.drawImage(art,0,0);
    const pixels=ctx.getImageData(0,0,canvas.width,canvas.height);
    for(let i=0;i<pixels.data.length;i+=4){
      const strength=Math.min(1,Math.max(0,(255-Math.max(pixels.data[i],pixels.data[i+1],pixels.data[i+2]))/100));
      pixels.data[i+3]=Math.round(pixels.data[i+3]*strength);
      pixels.data[i]=pixels.data[i+1]=pixels.data[i+2]=255;
    }
    ctx.putImageData(pixels,0,0);
    stage.style.setProperty('--calligraphy-mask',`url("${canvas.toDataURL()}")`);
    stage.classList.add('calligraphy-ready');
  };
  art.src='artworks/hero/calligraphy-source--png.webp';
  let frame,begin=performance.now(),opening=scrollY<40;
  function update(now){
    frame=null;
    if(document.documentElement.classList.contains('portfolio-loading'))return;
    const scroll=Math.min(1,Math.max(0,scrollY/Math.max(1,hero.offsetHeight*.72)));
    const elapsed=Math.min(1,(now-begin)/1250);
    const entrance=opening?Math.pow(1-elapsed,3):0;
    const fold=reduced.matches?0:Math.max(scroll,entrance);
    const h=stage.clientHeight;
    stage.style.setProperty('--hero-fold',fold.toFixed(4));
    stage.style.setProperty('--hero-left-x',(fold*h*.36).toFixed(2)+'px');
    stage.style.setProperty('--hero-right-x',(-fold*h*.34).toFixed(2)+'px');
    stage.style.setProperty('--hero-ring-scale',(1-fold*.7).toFixed(4));
    stage.style.setProperty('--hero-ring-turn',(scroll*210-entrance*95).toFixed(2)+'deg');
    if(opening&&elapsed<1&&!reduced.matches) frame=requestAnimationFrame(update);
    else {
      const finishedOpening=opening;
      opening=false;
      if(finishedOpening) dispatchEvent(new Event('resize'));
    }
  }
  function schedule(){if(!frame)frame=requestAnimationFrame(update);}
  addEventListener('portfolio-ready',()=>{begin=performance.now();opening=scrollY<40;schedule();});
  addEventListener('scroll',schedule,{passive:true});
  addEventListener('resize',schedule,{passive:true});
  reduced.addEventListener('change',schedule);
  schedule();
})();
