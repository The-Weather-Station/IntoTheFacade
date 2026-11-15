# Stability and performance pass

Reviewed November 14, 2026 (America/Chicago). Baseline: `d0cdabd`.

## What changed

- The application renders its controls and cards before importing MapLibre. Its worker, styled map, touch camera controls, timeout, and 2D fallback remain intact. Renderer generations prevent a late import from reviving a renderer that the visitor already replaced.
- Card motion schedules work only for visible floating cards, active entrances, or unsettled poses. Offscreen cards and settled mobile reading cards stop requesting frames. Hidden tabs suspend the loop; visible cards resume when the page returns. Unchanged transforms are not rewritten, and compositor hints apply only while needed. Entrance, hover tilt, spring motion, and deal/shuffle durations are preserved.
- The intro arrow follows moving cards while visible, sleeps offscreen, and wakes on scrolling, resizing, font readiness, intersections, or search-result changes. Its draw-once behavior and dismissal after selecting a case are unchanged.
- Deal/shuffle animations clean up on page suspension. Transit copies retain the reader's scroll position after they enter the document. Keyboard and tab selection use the appropriate shuffle direction without scrolling the page merely to focus the selected tab.
- Music invalidates stale playback promises when the page is suspended, resumes after a back/forward-cache restoration, and respects an explicit pause. Initial audio remains lazy; repeated scroll/tap inputs do not toggle or duplicate playback.
- The 2D map reuses parcel and road geometry when only selection changes. Styled-map shield filters handle missing road-reference lengths without repeatedly logging type errors.
- Pixelify Sans, IBM Plex Sans, and IBM Plex Mono now load from this site's own font files. The exact supplied faces, weights, and Unicode ranges remain unchanged. Google Fonts CSS is no longer a runtime dependency. The main display face is preloaded. Licenses and source URLs are in `public/fonts/`.

## Build measurements

Vite production build output; decimal kilobytes. These measure the initial application bundle, not a claim about network load time or frames per second.

| Resource | Before | After |
| --- | ---: | ---: |
| Initial application JavaScript | 1,213.79 KB | 145.67 KB |
| Initial application JavaScript, gzip | 339.44 KB | 48.17 KB |
| MapLibre, separately loaded | Included above | 1,069.88 KB / 292.05 KB gzip |
| Initial CSS, gzip | 27.41 KB | 28.13 KB |

The initial JavaScript bundle is about 88% smaller (86% smaller compressed). The map engine still downloads for the 3D map; splitting it avoids making the whole interface wait for that module. The compatibility renderer remains a separate import. All original artwork, evidence photographs, music, alarms, and dealing sounds remain available.

## Verification

- `npm test`: 25 passing tests. Eight added tests exercise offscreen entrances, frame suspension/resumption, settled mobile cards, reduced motion, lazy audio, blocked-autoplay retry, stale playback promises, and page restoration. Existing provenance, original-image hashes, case ordering, and touch-camera tests also pass. GitHub Pages runs the complete suite before deployment.
- `npm run build`: TypeScript and production build pass. The separate MapLibre chunk still triggers Vite's size advisory; it is deliberately retained to preserve 3D functionality.
- Chromium browser checks at 320 × 740, 390 × 844, 768 × 1024, normal desktop size, and 1906 × 1000. No page-wide horizontal overflow was observed; the intentional mobile card rail remains horizontally scrollable.
- Verified fresh welcome/arrow and sound reminder, all three cases, transparent shuffling art, both cycle directions, keyboard tabs, rapid case replacement, image viewer/source links, dossier export, search with zero results and recovery, home/back navigation, 3D/2D switching, and forced map fallback.
- Mobile 3D default and orbit/keyboard controls were checked. Pointer/multitouch behavior is also covered by existing camera tests. Mobile cards retained their reading area (418 px at the tested 390 × 844 viewport; 349 px at 320 × 740). Observed deal handoff displacement was 0.000 px in development diagnostics.
- Native LibreWolf on this Windows PC: its WebGL restriction triggered the automatic 2D fallback without changing privacy settings. The map, case selection, hazard markers, fonts, artwork, and music worked.

## Limits and follow-up checks

- Responsive viewport testing is not physical-device testing. Safari/iOS, Android hardware, low-memory GPUs, and prolonged battery/thermal behavior were not directly measured. Repeat the case, audio-unlock, pinch/orbit, and background/restore checks on those devices before claiming device certification.
- Basemap tiles and map glyphs still depend on third-party services. OpenFreeMap returned a missing regional glyph-range warning during testing; MapLibre used its local text fallback and the map continued working. No names or map layers were removed to suppress that warning.
- Browsers can require a direct tap on Play even after a scroll attempt. The music control remains available, and unavailable/blocked audio cannot block the interface.
- Original evidence files are intentionally preserved byte for byte. This pass does not replace them with compressed derivatives or reduce artwork quality.

## Recheck after future changes

Run `npm test` and `npm run build`, then check a fresh visit, each case, both shuffle directions, a rapid case switch, evidence image/source access, mobile camera gestures, and returning from a hidden tab. In LibreWolf, check the map with its normal privacy settings. Keep an eye on the initial application chunk: importing MapLibre synchronously would undo the loading improvement.
