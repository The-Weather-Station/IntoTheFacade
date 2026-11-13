export const icons: Record<string, string> = {
  eye: '<path d="M2 10h3V7h4V5h6v2h4v3h3v4h-3v3h-4v2H9v-2H5v-3H2z"/><path d="M9 9h6v6H9z" fill="currentColor"/>',
  moon: '<path d="M10 2h6v3h4v4h2v7h-3v4h-5v2H8v-3H4v-4H2V9h3v7h4v3h6v-3h3v-6h-3V6h-5z" fill="currentColor" stroke="none"/>',
  pumpkin: '<path d="M11 2h4v4h4v3h3v10h-3v3H5v-3H2V9h3V6h6z"/><path d="M5 10h4v4H5zm10 0h4v4h-4zm-8 7h3v2h4v-2h3v3H7z" fill="currentColor" stroke="none"/>',
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
export function icon(name: string, cls = '') { return `<svg class="icon ${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="square" stroke-linejoin="miter" aria-hidden="true">${icons[name] ?? icons.info}</svg>`; }

// Original, schematic landmark drawings on an integer pixel grid.
// The night palette is decorative; it does not describe current site conditions.
export function architecture(id: string): string {
  const dome = id === 'gold-dome';
  const depot = id === 'santa-fe-depot';
  const ink = '#302535', cream = '#f1e4cd';
  const sky = dome ? '#4c3659' : depot ? '#314e50' : '#663b43';
  const accent = dome ? '#d8b653' : depot ? '#7fae9c' : '#da8c69';
  const windows = (n: number, x: number, y: number, step: number, h = 10) =>
    Array.from({length:n},(_,i) => `<path d="M${x+i*step} ${y}h5v${h}h-5z" fill="${ink}"/><path d="M${x+i*step+1} ${y+1}h2v${h-3}h-2z" fill="${accent}"/>`).join('');
  const skyline = '<path d="M0 69h9V57h8v8h10V46h4v-5h4v5h5v20h10v-9h10v16h15v-9h9V54h10v11h14V53h6v-7h5v7h5v18h14V57h10v10h14V50h9v-6h4v6h8v20h9v26H0z" fill="#211e2c" opacity=".55"/>';
  let building: string;
  if (dome) {
    building = `<path d="M21 71h150v17H21z" fill="${ink}"/><path d="M24 72h144v14H24z" fill="#a49e7e"/>${windows(17,27,76,8,8)}<path d="M25 70v-9h5v-8h9v-8h12v-6h15v-5h17v-3h26v3h17v5h15v6h12v8h9v8h5v9z" fill="${ink}"/><path d="M29 68v-7h5v-7h8v-7h12v-5h14v-5h17v-3h22v3h17v5h14v5h12v7h8v7h5v7z" fill="#c4a556"/><path d="M35 54h122M54 43h84M29 68l25-25 22 25 20-34 20 34 22-25 25 25M42 54l26-17 28 17 28-17 26 17M96 34v34" fill="none" stroke="#725441" stroke-width="2"/>`;
  } else if (depot) {
    building = `<path d="M20 61h152v27H20z" fill="${ink}"/><path d="M23 64h146v21H23z" fill="#b9b494"/><path d="M39 52h114v12H39z" fill="${ink}"/><path d="M42 55h108v9H42z" fill="#9d9b7d"/><path d="M78 36h36v52H78zM82 30h28v6H82zM87 26h18v4H87z" fill="${ink}"/><path d="M81 38h30v47H81zM85 32h22v4H85z" fill="#d5c79c"/><path d="M85 40v43m6-43v43m11-43v43m5-43v43" stroke="#9e8d68" stroke-width="2"/>${windows(6,26,68,8,14)}${windows(6,121,68,8,14)}<path d="M93 65h6v22h-6z" fill="${ink}"/><path d="M86 56h20v5H86z" fill="${ink}"/><path d="M89 57h2v3h-2zm5 0h2v3h-2zm5 0h3v3h-3z" fill="${cream}"/>`;
  } else {
    building = `<path d="M19 60h154v28H19z" fill="${ink}"/><path d="M22 63h148v22H22z" fill="#be9776"/><path d="M15 61v-4h6v-4h7v-4h136v4h7v4h6v4z" fill="${ink}"/><path d="M25 56h142v3H25z" fill="#8d654f"/><path d="M75 86V53h6v-5h7v-5h8v-4h4v4h8v5h7v5h5v33z" fill="${ink}"/><path d="M78 84V55h6v-4h6v-5h8v-3h1v3h7v5h6v4h5v29z" fill="#d3af88"/>${windows(6,26,68,8,14)}${windows(6,125,68,8,14)}<path d="M89 87V70h3v-3h10v3h3v17z" fill="${ink}"/><path d="M95 70h2v17h-2z" fill="#d7b690"/><path d="M92 54h10v9H92z" fill="${ink}"/><path d="M96 55v5h4" fill="none" stroke="${cream}"/><path d="M37 48V38h5v10m107 0V38h5v10" stroke="${ink}" stroke-width="3"/>`;
  }
  return `<svg viewBox="0 0 192 106" class="building-art" role="img" aria-label="Pixel illustration of ${dome?'Gold Dome':depot?'Santa Fe Depot':'Union Station'}; schematic, not a photograph" shape-rendering="crispEdges"><rect width="192" height="106" fill="${sky}"/><path d="M142 15h15v3h5v5h3v13h-3v5h-5v3h-15v-3h-5v-5h-3V23h3v-5h5z" fill="${accent}"/><path d="M148 15h9v3h5v5h3v13h-3v5h-5v3h-6v-4h5v-6h3V23h-4v-5h-7z" fill="${cream}" opacity=".3"/><path d="M21 19h2v2h-2zm34 8h2v2h-2zm65-15h2v2h-2zm60 36h2v2h-2zM73 13h2v6h-2zm-2 2h6v2h-6z" fill="${cream}" opacity=".65"/>${skyline}<path d="M0 86h192v20H0z" fill="${ink}"/>${building}<path d="M14 88h165v3H14z" fill="${accent}"/><path d="M0 95h192M25 100h43m71-1h22" stroke="${accent}" opacity=".3"/><path d="M5 65h3v23H5zm-3 7h9v2H2zm181-7h3v23h-3zm-3 7h9v2h-9z" fill="${ink}"/><path d="M3 65h7v3H3zm178 0h7v3h-7z" fill="${accent}"/></svg>`;
}
