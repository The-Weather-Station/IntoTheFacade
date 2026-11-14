// No src, fetch, decoding or audio network request until a visitor interacts.
// HTML media streams independently of the app/map; no rendering awaits play().
export function initBackgroundAudio() {
  const audio = document.createElement('audio');
  audio.id = 'site-soundtrack'; audio.preload = 'none'; audio.loop = true;
  const panel = document.querySelector<HTMLElement>('#soundtrack-control')!;
  const toggle = panel.querySelector<HTMLButtonElement>('button')!;
  const volume = panel.querySelector<HTMLInputElement>('input')!;
  const status = panel.querySelector<HTMLElement>('[role=status]')!;
  let enabled = true, started = false, starting = false, scrollAttempted = false, playAttempt = 0;
  const startup = new AbortController();
  try {
    enabled = localStorage.getItem('itf:music-enabled') !== 'false';
    const level = Number(localStorage.getItem('itf:music-volume') ?? '.16');
    audio.volume = Number.isFinite(level) ? Math.max(0, Math.min(1, level)) : .16;
  } catch { audio.volume = .16; }
  volume.value = String(Math.round(audio.volume * 100));
  document.body.append(audio);
  function remember() {
    try { localStorage.setItem('itf:music-enabled', String(enabled)); localStorage.setItem('itf:music-volume',String(audio.volume)); } catch { /* Session controls still work. */ }
  }
  function paint() {
    const playing = !audio.paused;
    toggle.setAttribute('aria-pressed', String(playing));
    toggle.setAttribute('aria-label', playing || starting ? 'Pause background music' : 'Play background music');
    toggle.innerHTML = `<span aria-hidden="true">${playing || starting ? 'Ⅱ' : '▶'}</span><span class="music-label">DARK DOOM JAZZ</span>`;
    panel.dataset.playing = String(playing);
  }
  function play() {
    if (document.hidden || starting || !audio.paused) return;
    const attempt = ++playAttempt;
    starting = true;
    if (!audio.getAttribute('src')) audio.src = import.meta.env.BASE_URL + 'audio/dark-doom-jazz.mp3';
    status.textContent = 'Loading music'; paint();
    void audio.play().then(() => {
      if (attempt !== playAttempt) return;
      starting = false; started = true; startup.abort();
      if (!enabled || document.hidden) audio.pause();
      status.textContent = audio.paused ? 'Music paused' : 'Music playing'; paint();
    }).catch(error => {
      if (attempt !== playAttempt) return;
      starting = false;
      status.textContent = error.name === 'NotAllowedError' ? 'Tap or click to start music' : error.name === 'AbortError' ? 'Music paused' : 'Music unavailable; press play to retry';
      paint();
    });
  }
  toggle.addEventListener('click', () => {
    if (!audio.paused || starting) { enabled = false; ++playAttempt; starting = false; startup.abort(); audio.pause(); status.textContent = 'Music paused'; paint(); }
    else { enabled = true; play(); }
    remember();
  });
  volume.addEventListener('input', () => { audio.volume = Number(volume.value)/100; remember(); });
  const options = {passive:true, capture:true, signal:startup.signal};
  function startFromInput(event: Event) {
    if (!started && enabled && !(event.target instanceof Element && event.target.closest('#soundtrack-control'))) play();
  }
  function startFromScroll(event: Event) {
    if (scrollAttempted || document.hidden) return;
    scrollAttempted = true;
    startFromInput(event);
  }
  // Wheel/touch movement is user scroll intent, unlike programmatic scroll events.
  // A denied scroll attempt must leave the next activation gesture available.
  document.addEventListener('wheel', startFromScroll, options);
  document.addEventListener('touchmove', startFromScroll, options);
  document.addEventListener('pointerdown', event => { if (event.pointerType === 'mouse') startFromInput(event); }, options);
  document.addEventListener('pointerup', event => { if (event.pointerType !== 'mouse') startFromInput(event); }, options);
  document.addEventListener('touchend', startFromInput, options);
  document.addEventListener('click', startFromInput, options);
  document.addEventListener('keydown', event => {
    if (['Enter',' ','ArrowUp','ArrowDown','ArrowLeft','ArrowRight','PageUp','PageDown','Home','End'].includes(event.key)) startFromInput(event);
  }, options);
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) { audio.pause(); status.textContent = 'Music paused while tab is hidden'; paint(); }
    else if (started && enabled) play();
  });
  window.addEventListener('pagehide', () => audio.pause());
  audio.addEventListener('waiting', () => { status.textContent = 'Buffering music'; });
  audio.addEventListener('playing', () => { status.textContent = 'Music playing'; paint(); });
  audio.addEventListener('error', () => { starting = false; status.textContent = 'Music unavailable; the site remains usable'; paint(); });
  paint();
}
