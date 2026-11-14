// No src, fetch, decoding or audio network request until a visitor interacts.
// HTML media streams independently of the app/map; no rendering awaits play().
export function initBackgroundAudio() {
  const audio = document.createElement('audio');
  audio.id = 'site-soundtrack'; audio.preload = 'none'; audio.loop = true;
  const panel = document.querySelector<HTMLElement>('#soundtrack-control')!;
  const toggle = panel.querySelector<HTMLButtonElement>('button')!;
  const volume = panel.querySelector<HTMLInputElement>('input')!;
  const status = panel.querySelector<HTMLElement>('[role=status]')!;
  let enabled = true, started = false, starting = false;
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
    if (document.hidden || starting) return;
    started = true; starting = true;
    if (!audio.getAttribute('src')) audio.src = import.meta.env.BASE_URL + 'audio/dark-doom-jazz.mp3';
    status.textContent = 'Loading music'; paint();
    void audio.play().then(() => {
      starting = false;
      if (!enabled || document.hidden) audio.pause();
      status.textContent = audio.paused ? 'Music paused' : 'Music playing'; paint();
    }).catch(error => {
      starting = false;
      status.textContent = error.name === 'NotAllowedError' ? 'Press play to start music' : error.name === 'AbortError' ? 'Music paused' : 'Music unavailable; press play to retry';
      paint();
    });
  }
  toggle.addEventListener('click', () => {
    if (!audio.paused || starting) { enabled = false; starting = false; audio.pause(); status.textContent = 'Music paused'; paint(); }
    else { enabled = true; play(); }
    remember();
  });
  volume.addEventListener('input', () => { audio.volume = Number(volume.value)/100; remember(); });
  document.addEventListener('pointerdown', event => {
    if (!started && enabled && !(event.target as HTMLElement).closest('#soundtrack-control')) play();
  }, {passive:true});
  document.addEventListener('keydown', event => {
    if (!started && enabled && ['Enter',' '].includes(event.key) && !(event.target as HTMLElement).closest('#soundtrack-control')) play();
  });
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
