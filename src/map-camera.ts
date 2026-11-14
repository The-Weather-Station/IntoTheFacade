import type { Map as LibreMap } from 'maplibre-gl';

// Pan remains the default. Orbit gives touch users an explicit one-finger
// camera gesture without taking away native two-finger zoom/rotate/pitch.
export function createMapCamera(map: LibreMap, controls: HTMLElement) {
  const canvas = map.getCanvas();
  const pan = controls.querySelector<HTMLButtonElement>('[data-camera="pan"]')!;
  const orbit = controls.querySelector<HTMLButtonElement>('[data-camera="orbit"]')!;
  const hint = controls.querySelector<HTMLElement>('.camera-hint')!;
  const readout = controls.querySelector<HTMLElement>('.camera-readout')!;
  const events = new AbortController();
  const pointers = new Map<number, { x: number; y: number }>();
  let orbiting = false, panWasEnabled = map.dragPan.isEnabled(), multiTouch = false;
  const options = { signal: events.signal };

  function clearPointers() {
    const ids = [...pointers.keys()];
    pointers.clear(); multiTouch = false;
    for (const id of ids) if (canvas.hasPointerCapture(id)) canvas.releasePointerCapture(id);
  }
  function setOrbit(enabled: boolean) {
    clearPointers();
    if (enabled && !orbiting) panWasEnabled = map.dragPan.isEnabled();
    orbiting = enabled;
    if (enabled) map.dragPan.disable();
    else if (panWasEnabled) map.dragPan.enable();
    pan.setAttribute('aria-pressed', String(!enabled));
    orbit.setAttribute('aria-pressed', String(enabled));
    canvas.classList.toggle('camera-orbit', enabled);
    hint.textContent = enabled ? 'Drag to rotate & tilt. Pinch to zoom.' : 'Drag to move. Two fingers: twist to rotate, slide to tilt.';
  }
  function updateReadout() {
    readout.textContent = `Tilt ${Math.round(map.getPitch())}° · Bearing ${Math.round((map.getBearing() + 360) % 360)}°`;
  }
  pan.addEventListener('click', () => setOrbit(false), options);
  orbit.addEventListener('click', () => setOrbit(true), options);
  canvas.addEventListener('pointerdown', event => {
    if (!orbiting || (event.pointerType === 'mouse' && event.button !== 0)) return;
    map.stop();
    pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
    if (pointers.size > 1) multiTouch = true;
    canvas.setPointerCapture(event.pointerId);
    // Avoid compatibility mouse panning, while native touch gestures still run.
    event.preventDefault();
  }, options);
  canvas.addEventListener('pointermove', event => {
    const previous = pointers.get(event.pointerId);
    if (!orbiting || !previous) return;
    pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
    // Once a pinch begins, wait for all fingers to lift before orbiting again.
    if (multiTouch || pointers.size !== 1) return;
    map.jumpTo({
      bearing: map.getBearing() + (event.clientX - previous.x) * .4,
      pitch: Math.max(map.getMinPitch(), Math.min(Math.min(70, map.getMaxPitch()), map.getPitch() - (event.clientY - previous.y) * .3)),
    });
  }, options);
  const release = (event: PointerEvent) => {
    pointers.delete(event.pointerId);
    if (canvas.hasPointerCapture(event.pointerId)) canvas.releasePointerCapture(event.pointerId);
    if (!pointers.size) multiTouch = false;
  };
  for (const event of ['pointerup', 'pointercancel', 'lostpointercapture'] as const) canvas.addEventListener(event, release, options);
  // The canvas is focusable already. Orbit also has a keyboard equivalent.
  canvas.addEventListener('keydown', event => {
    if (!orbiting || event.shiftKey || event.ctrlKey || event.altKey || event.metaKey) return;
    const delta = {ArrowLeft:[-10,0],ArrowRight:[10,0],ArrowUp:[0,5],ArrowDown:[0,-5]}[event.key];
    if (!delta) return;
    event.preventDefault(); event.stopPropagation(); map.stop();
    map.jumpTo({bearing:map.getBearing()+delta[0],pitch:Math.max(map.getMinPitch(),Math.min(70,map.getMaxPitch(),map.getPitch()+delta[1]))});
  }, { ...options, capture:true });
  map.on('rotate', updateReadout); map.on('pitch', updateReadout);
  controls.hidden = false; setOrbit(false); updateReadout();
  return {
    reset: () => setOrbit(false),
    destroy() {
      setOrbit(false); events.abort(); controls.hidden = true;
      map.off('rotate', updateReadout); map.off('pitch', updateReadout);
    },
  };
}
