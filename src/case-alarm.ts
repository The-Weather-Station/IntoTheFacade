const alarmCase = 'rhode-island-warehouse';

// A separate one-shot media element mixes with the soundtrack. No music state,
// volume or playback is changed, and selection never awaits loading or play().
export function initCaseAlarm(initialCase?: string) {
  const audio = document.createElement('audio');
  audio.id = 'case-alarm'; audio.preload = 'none'; audio.loop = false; audio.volume = .5;
  document.body.append(audio);
  let activeCase: string | undefined;
  let pending = false, starting = false, revision = 0;
  let retry: AbortController | undefined;

  function clearRetry() { retry?.abort(); retry = undefined; }
  function stop() {
    revision++; pending = starting = false; clearRetry(); audio.pause();
    if (audio.readyState > 0) audio.currentTime = 0;
  }
  function retryOnInteraction() {
    if (retry) return;
    retry = new AbortController();
    const options = { capture:true, passive:true, signal:retry.signal };
    const retryPlay = (event: Event) => {
      const target = event.target instanceof Element ? event.target : null;
      const destination = target?.closest<HTMLElement>('[data-select],.location-marker');
      const next = destination?.dataset.select ?? destination?.dataset.place;
      if ((next && next !== alarmCase) || target?.closest('.brand')) return;
      play();
    };
    document.addEventListener('click',retryPlay,options);
    document.addEventListener('pointerup',event=>{ if(event.pointerType!=='mouse') retryPlay(event); },options);
    document.addEventListener('keydown',event=>{ if(event.key==='Enter'||event.key===' ') retryPlay(event); },options);
  }
  function play() {
    if (!pending || starting || activeCase !== alarmCase || document.hidden) return;
    const attempt = revision; starting = true;
    if (!audio.getAttribute('src')) audio.src = import.meta.env.BASE_URL + 'audio/organized-crime-alarm.mp3';
    audio.currentTime = 0;
    void audio.play().then(()=>{
      if (attempt !== revision) return;
      starting = false; pending = false; clearRetry();
    }).catch((error: DOMException)=>{
      if (attempt !== revision) return;
      starting = false;
      // A direct link may open before the browser grants audio permission.
      // Defer this one sound to a real interaction; never loop startup attempts.
      if (error.name === 'NotAllowedError') retryOnInteraction();
      else { pending = false; clearRetry(); }
    });
  }
  function select(id?: string) {
    if (id === activeCase) return;
    stop(); activeCase = id;
    if (id === alarmCase) { pending = true; play(); }
  }
  audio.addEventListener('error',stop);
  document.addEventListener('visibilitychange',()=>{ if(document.hidden) stop(); });
  window.addEventListener('pagehide',stop);
  select(initialCase);
  return { select };
}
