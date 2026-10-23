(() => {
 const videos=[...document.querySelectorAll('.film-page video')];
 const music=document.querySelector('#vinyl-audio');
 function hasVideoSound(){return videos.some(video=>!video.paused&&!video.ended&&!video.muted&&video.volume>0);}
 function pauseMusicForVideo(){if(hasVideoSound())music?.pause();}
 music?.addEventListener('play',pauseMusicForVideo);
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 const visibleVideos=new Set();
 const observer=new IntersectionObserver(entries=>entries.forEach(({target,isIntersecting,intersectionRatio})=>{
  if(isIntersecting&&intersectionRatio>=.65&&!document.querySelector('dialog[open]')){
   visibleVideos.add(target);
   if(!reduced.matches)target.play().catch(()=>{});
  }else {
   visibleVideos.delete(target);
   if(document.fullscreenElement!==target&&!target.webkitDisplayingFullscreen)target.pause();
  }
 }),{threshold:[0,.65]});
 videos.forEach(video=>{
  video.muted=false;
  video.removeAttribute('muted');
  video.addEventListener('pointerenter',()=>document.documentElement.classList.add('video-pointer'));
  video.addEventListener('pointerleave',()=>document.documentElement.classList.remove('video-pointer'));
  const fit=()=>{
   if(!video.videoWidth||!video.videoHeight)return;
   video.closest('.film-frame').style.width=`min(100%, 1100px, calc(54svh * ${video.videoWidth/video.videoHeight} + 44px))`;
  };
  video.addEventListener('loadedmetadata',fit);
  fit();
  observer.observe(video);
  video.addEventListener('play',()=>{
   videos.forEach(other=>{if(other!==video)other.pause();});
   pauseMusicForVideo();
  });
  video.addEventListener('volumechange',pauseMusicForVideo);
 });
 document.addEventListener('fullscreenchange',()=>document.documentElement.classList.toggle('video-fullscreen',!!document.fullscreenElement?.matches('video')));
 // Retry audible playback on a user gesture if browser autoplay policy blocked it.
 document.addEventListener('pointerdown',event=>{
  if(event.target.closest('video,button,a,input,dialog'))return;
  const video=[...visibleVideos][0];
  if(video?.paused&&!reduced.matches)video.play().catch(()=>{});
 });
 document.addEventListener('visibilitychange',()=>{if(document.hidden)videos.forEach(video=>video.pause());});
 document.querySelector('.end-page a').addEventListener('click',e=>{e.preventDefault();document.querySelector('#home').scrollIntoView({behavior:reduced.matches?'instant':'smooth'});});
})();
