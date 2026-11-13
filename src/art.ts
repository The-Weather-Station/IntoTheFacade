export const icons: Record<string, string> = {
  search: '<circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/>',
  arrow: '<path d="M5 12h14m-5-5 5 5-5 5"/>',
  external: '<path d="M14 4h6v6m0-6L10 14M10 5H5v14h14v-5"/>',
  pin: '<path d="M19 10c0 5-7 11-7 11S5 15 5 10a7 7 0 1 1 14 0Z"/><circle cx="12" cy="10" r="2.3"/>',
  bookmark: '<path d="M6 3h12v18l-6-4-6 4Z"/>',
  layers: '<path d="m12 3 10 6-10 6L2 9Zm-9 11 9 5 9-5M3 18l9 5 9-5"/>',
  crosshair: '<circle cx="12" cy="12" r="7"/><path d="M12 1v5m0 12v5M1 12h5m12 0h5"/>',
  chevron: '<path d="m7 10 5 5 5-5"/>',
  close: '<path d="m6 6 12 12M6 18 18 6"/>',
  plus: '<path d="M12 5v14M5 12h14"/>', minus: '<path d="M5 12h14"/>',
  check: '<path d="m5 12 4 4L19 6"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v6m0-10v1"/>',
  download: '<path d="M12 3v12m-5-5 5 5 5-5M4 16v5h16v-5"/>',
  book: '<path d="M4 3h12l4 4v14H4ZM16 3v5h4M8 12h8m-8 4h6"/>',
  compass: '<circle cx="12" cy="12" r="9"/><path d="m16 8-2.5 5.5L8 16l2.5-5.5Z"/>',
  globe: '<circle cx="12" cy="12" r="9"/><ellipse cx="12" cy="12" rx="4" ry="9"/><path d="M3 12h18"/>',
  list: '<path d="M8 6h13M8 12h13M8 18h13M3 6h.1M3 12h.1M3 18h.1"/>',
  logo: '<path d="M3 21V6l9-4v19M12 21V10l9-4v15M6 9l3-1M6 14l3-1M6 19l3-1m9-8v3m0 3v3"/>'
};
export function icon(name: string, cls = '') { return `<svg class="icon ${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icons[name] ?? icons.info}</svg>`; }

let illustrationSequence = 0;
export function architecture(id: string): string {
  const uid = `${id}-${++illustrationSequence}`;
  const windows = (count: number, x: number, y: number, step: number, width = 13, height = 27) => Array.from({length: count}, (_,i)=>`<rect x="${x+i*step}" y="${y}" width="${width}" height="${height}" fill="#141c1a" stroke="#7e8b7f" stroke-width=".65"/><path d="M${x+i*step} ${y+height/2}h${width}" stroke="#7e8b7f" stroke-width=".45"/>`).join('');
  let building = '';
  if (id === 'union-station') {
    building = `<path d="M32 139 60 113h252l33 26" fill="#354239" stroke="#8b9180"/><path d="M42 139h291v62H42z" fill="#3f4940" stroke="#a2a08a"/><path d="M38 139h299v8H38zM46 187h283v6H46z" fill="#6b7160"/><path d="M147 201v-78l39-24 39 24v78" fill="#575d4d" stroke="#b4ad8b"/><path d="M141 124l45-29 45 29" fill="none" stroke="#b3aa84" stroke-width="3"/><path d="M171 201v-43a15 15 0 0 1 30 0v43" fill="#18201c" stroke="#b4ad8b"/><path d="M186 144v57m-15-37h30" stroke="#8f967f"/><circle cx="186" cy="123" r="8" fill="#1d2721" stroke="#acaa8c"/><path d="M186 117v6l4 2" fill="none" stroke="#c1b995"/>${windows(4,54,154,22,13,30)}${windows(4,235,154,22,13,30)}<path d="M33 204h311M155 204h62m-69 5h76" stroke="#969a80"/><path d="M70 113v-16h8v16m216 0V97h8v16" fill="#535e4e" stroke="#959a83"/>`;
  } else if (id === 'santa-fe-depot') {
    building = `<path d="M36 146h290v56H36z" fill="#4b5043" stroke="#b0a88b"/><path d="M75 145v-28h218v28" fill="#60614e" stroke="#b0a88b"/><path d="M143 202V94h72v108" fill="#77735a" stroke="#c7bb92"/><path d="M150 94V84h58v10M157 84v-7h44v7" fill="#6c6a53" stroke="#beb18b"/><path d="M156 100v97m10-97v97m25-97v97m10-97v97" stroke="#aaa280" stroke-width="3"/>${windows(3,43,159,29,17,32)}${windows(3,230,159,29,17,32)}<rect x="172" y="149" width="14" height="53" fill="#19221e"/><text x="179" y="134" fill="#e0d2ac" text-anchor="middle" font-size="8" font-family="sans-serif" letter-spacing="1">SANTA FE</text><path d="M29 205h307m-304-53h303" stroke="#93947b"/>`;
  } else {
    building = `<path d="M40 177h297v28H40z" fill="#535646" stroke="#a7aa8a"/>${windows(14,48,182,20,14,19)}<path d="M47 177a137 86 0 0 1 274 0Z" fill="#726c46" stroke="#c5ae6d" stroke-width="1.3"/><path d="m47 177 45-40 45 40 47-40 46 40 45-40 46 40M69 137h230M105 113h158m-194 24 36-24 32 24 47-24 46 24 33-24 36 24M137 177l-32-64m125 64 33-64m-79 24V91M92 137l42-39 50 15 50-15 41 39" fill="none" stroke="#c2ad70" stroke-width=".85"/><path d="M26 208h325" stroke="#98977a"/>`;
  }
  return `<svg viewBox="0 0 380 240" class="building-art" role="img" aria-label="Illustrative architectural study; not a photograph"><defs><pattern id="grid-${uid}" width="20" height="20" patternUnits="userSpaceOnUse"><path d="M20 0H0V20" fill="none" stroke="#718573" stroke-opacity=".12" stroke-width=".5"/></pattern><linearGradient id="sky-${uid}" x2="0" y2="1"><stop stop-color="#1b2925"/><stop offset="1" stop-color="#334036"/></linearGradient></defs><rect width="380" height="240" fill="url(#sky-${uid})"/><rect width="380" height="240" fill="url(#grid-${uid})"/><circle cx="295" cy="58" r="40" fill="#9a9b70" opacity=".07"/><path d="M0 211h380M20 0v240M360 0v240" stroke="#92a18d" stroke-opacity=".16"/>${building}<path d="M20 220h50m-50-3v6m50-6v6" stroke="#9b9c80" stroke-width=".7"/><text x="80" y="223" font-family="monospace" font-size="6" letter-spacing="1.3" fill="#a0a48c">SCHEMATIC / NOT TO SCALE</text><path d="M345 20v16m-8-8h16" stroke="#9da18b" stroke-width=".7"/></svg>`;
}
