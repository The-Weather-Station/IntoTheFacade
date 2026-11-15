type CardSound = 'deal' | 'return' | 'shuffle';

// Tiny one-shots mix with the soundtrack and alarm. No audio URL is assigned
// until a real card movement, so initial rendering never waits on these files.
export function createCardSounds() {
  const players = new Map<CardSound, HTMLAudioElement>();
  for (const kind of ['deal', 'return', 'shuffle'] as const) {
    const audio = document.createElement('audio');
    audio.id = `card-sfx-${kind}`;
    audio.preload = 'none'; audio.loop = false; audio.volume = .32;
    document.body.append(audio); players.set(kind, audio);
  }
  function stop() {
    for (const audio of players.values()) {
      audio.pause();
      if (audio.readyState > 0) audio.currentTime = 0;
    }
  }
  function play(kind: CardSound) {
    if (document.hidden) return;
    const audio = players.get(kind)!;
    audio.pause();
    if (!audio.getAttribute('src')) audio.src = `${import.meta.env.BASE_URL}audio/card-${kind}.mp3`;
    audio.currentTime = 0;
    // Call within the card's activation gesture. The deal clip itself includes
    // the animation's 180 ms lead-in, avoiding a delayed autoplay request.
    void audio.play().catch(() => { /* A blocked/missing effect cannot stop the cards. */ });
  }
  document.addEventListener('visibilitychange', () => { if (document.hidden) stop(); });
  window.addEventListener('pagehide', stop);
  return { play, stop };
}
