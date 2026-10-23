(() => {
 const audio=document.querySelector('#vinyl-audio'),arm=document.querySelector('.tonearm'),svg=document.querySelector('.player-art'),button=document.querySelector('.play-toggle'),status=document.querySelector('.player-status');
 const volume=document.querySelector('.volume-control'),thumb=document.querySelector('#volume-thumb');
 audio.volume=.05;
 volume.addEventListener('input',()=>{audio.volume=Number(volume.value)/100;thumb.setAttribute('y',String(425-155*audio.volume));volume.setAttribute('aria-valuetext',volume.value+' percent');});
 let angle=-12,dragging=false,startPoint,moved=false,attempt=0,awaitingGesture=true;
 const setAngle=v=>{angle=v;arm.style.transform=`rotate(${v}deg)`;};
 function stop(){awaitingGesture=false;attempt++;audio.pause();}
 function park(){stop();setAngle(-12);status.textContent='Needle parked';}
 async function play(){const token=++attempt;setAngle(18);try{await audio.play();if(token!==attempt)audio.pause();else awaitingGesture=false;}catch(error){if(token===attempt){awaitingGesture=error.name==='NotAllowedError';status.textContent=awaitingGesture?'Click anywhere to enable sound':'Unable to play the song. Please refresh.';}}}
 audio.addEventListener('play',()=>{document.body.classList.add('is-playing');button.textContent='Pause Ⅱ';button.setAttribute('aria-label','Turn off the record player');button.setAttribute('aria-pressed','true');arm.setAttribute('aria-pressed','true');status.textContent='Now playing · on repeat';});
 audio.addEventListener('pause',()=>{document.body.classList.remove('is-playing');button.textContent='Play ↗';button.setAttribute('aria-label','Turn on the record player');button.setAttribute('aria-pressed','false');arm.setAttribute('aria-pressed','false');status.textContent='Paused';});
 audio.addEventListener('error',()=>{status.textContent='The song could not load. Please refresh.';});
 const toggle=()=>audio.paused?play():park();
 const floating=document.createElement('button');floating.type='button';floating.className='floating-music';floating.hidden=true;document.body.append(floating);
 function syncFloating(){const on=!audio.paused;floating.textContent=on?'♪ Music on':'♪ Music off';floating.setAttribute('aria-label',on?'Turn music off':'Turn music on');floating.setAttribute('aria-pressed',String(on));}
 floating.addEventListener('click',toggle);audio.addEventListener('play',syncFloating);audio.addEventListener('pause',syncFloating);syncFloating();
 const playerSection=document.querySelector('.music-room');
 function updateFloating(){floating.hidden=playerSection.getBoundingClientRect().bottom>0;}
 addEventListener('scroll',updateFloating,{passive:true});addEventListener('resize',updateFloating);updateFloating();
 button.addEventListener('click',()=>{clearTimeout(arrival);toggle();});
 arm.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();clearTimeout(arrival);toggle();}if(e.key==='ArrowRight'){e.preventDefault();park();}if(e.key==='ArrowLeft'){e.preventDefault();play();}});
 function point(e){const p=svg.createSVGPoint();p.x=e.clientX;p.y=e.clientY;return p.matrixTransform(svg.getScreenCTM().inverse());}
 arm.addEventListener('pointerdown',e=>{if(e.button!==0)return;clearTimeout(arrival);dragging=true;moved=false;startPoint=point(e);arm.classList.add('dragging');arm.setPointerCapture(e.pointerId);});
 arm.addEventListener('pointermove',e=>{if(!dragging)return;const p=point(e);if(Math.hypot(p.x-startPoint.x,p.y-startPoint.y)>5)moved=true;if(!moved)return;setAngle(Math.max(-18,Math.min(25,Math.atan2(p.y-100,p.x-553)*180/Math.PI-101)));if(angle<8){stop();status.textContent='Needle lifted';}});
 arm.addEventListener('pointerup',()=>{if(!dragging)return;dragging=false;arm.classList.remove('dragging');if(!moved){toggle();return;}if(angle>=8)play();else park();});
 arm.addEventListener('pointercancel',()=>{dragging=false;arm.classList.remove('dragging');park();});
 // Try immediately; retry inside a real user gesture if the browser blocks sound.
 const arrival=null;
 play();
 function unlock(event){
   if(!awaitingGesture||!audio.paused)return;
   if(event.target.closest('.tonearm,.power-button,.floating-music,.vinyl-back'))return;
   if(event.type==='keydown'&&['Shift','Control','Alt','Meta','Tab'].includes(event.key))return;
   play();
 }
 document.addEventListener('click',unlock);
 document.addEventListener('keydown',unlock);
 document.addEventListener('visibilitychange',()=>{if(!document.hidden&&awaitingGesture)play();});
 addEventListener('pageshow',e=>{if(e.persisted){audio.volume=.05;volume.value='5';volume.setAttribute('aria-valuetext','5 percent');thumb.setAttribute('y','417.25');play();}});
 addEventListener('pagehide',()=>{clearTimeout(arrival);stop();});
})();
