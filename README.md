# Into The Facade

The November 14 alert update adds a fourth, separately illustrated card to the Rhode Island warehouse deck. `src/deck-order.ts` drives tab order, directional cycling, stack counts and deal/return counts. The other cases retain three info cards. Display order is Stockyard, Rhode Island, Eagle; stable case numbers and URLs remain unchanged. Siren effects run automatically and honor reduced-motion preferences. Selecting this case activates a red felt theme, a pulsing ALERT!!!! banner and a slow red viewport glow; switching cases or returning home immediately restores the normal theme. Bloodstained paper extends beyond the reading surface on both the front card and its underlays.

The expanded shipping case distinguishes the April 8, 2025 charges and affidavit, the April 16 announcement, and Deping Sun's February 4, 2026 sentencing entry in the July 2026 parole docket. OSCN could not be retrieved for a complete current disposition check. The record does not substantiate citizenship or political affiliations. Artwork provenance and prompts are in `ARTWORK.md` and `alert-art-prompts.json`.

An urban-exploration OSINT atlas for Oklahoma industrial properties, built with Vite, TypeScript, MapLibre GL JS, and a Leaflet 2D fallback.

The visual direction is a worn pixel-art card table inspired by Dungeons & Degenerate Gamblers. Nine original generated raster assets supply the worn card faces, occult card back, felt, missing-road mystery card, and county-photo-based brick warehouse illustration. See [DESIGN.md](DESIGN.md) and [ARTWORK.md](ARTWORK.md). Generated artwork is separate from documentary evidence.

## Run

The November 14 stability/performance pass and its measured results are documented in [PERFORMANCE.md](PERFORMANCE.md). Run `npm test` for the full regression suite. Theme fonts are self-hosted with licenses and provenance in `public/fonts/`.

Use Node.js 24 (the version used for this demo), then:

```sh
npm ci
npm run dev
```

The dev server prints its local URL. For production:

```sh
npm run build
npm run preview
```

Build output is `dist/`. The demo is published by GitHub Pages. The [original project URL](https://the-weather-station.github.io/IntoTheFacade/) now redirects to the configured custom domain, `intothefacade.com`. The initial Pages deployment, production map rendering, dossier selection, and evidence tabs were verified on November 12, 2026 (America/Chicago), with no browser console errors. The original demo was deployed owner-private on Sites; `.openai/hosting.json` records that identity and is not used by GitHub Pages.

## GitHub Pages

The custom domain is `intothefacade.com`. Namecheap DNS uses GitHub Pages' four documented apex A records and a `www` CNAME pointing to `the-weather-station.github.io`. HTTPS is enabled and was verified on November 13, 2026. After changing the custom domain, rebuild so scripts, CSS, the favicon, and map styles use the configured base path.

Build attempts have distinct artifact names, and the deploy job uses the name returned by its build job. This prevents duplicate-artifact errors when rerunning a build.

The application lives at the root of [The-Weather-Station/IntoTheFacade](https://github.com/The-Weather-Station/IntoTheFacade). The local project keeps it in `web/`; upload that directory's contents, not the parent folder. The workflow assumes `package.json`, `src/`, and `.github/` are at the repository root.

Pushes to `main` automatically test, build, and publish the app through `.github/workflows/pages.yml`. The following setup is already complete for this repository:

1. Make the application repository available to the connected GitHub integration. Free GitHub Pages hosting uses a public repository.
2. In the repository, choose **Settings > Pages > Build and deployment > Source: GitHub Actions**.
3. Push the application to `main`, or run **Deploy to GitHub Pages** from the Actions tab after enabling Pages.
4. The workflow installs locked dependencies, runs the data checks and TypeScript build, then deploys `dist/`. Read the deployed URL from the completed deployment.

The build reads GitHub's configured site base path, so a project URL such as `/IntoTheFacade/` works without hard-coding the owner or repository name. It also supports the root path used by a user site or a configured custom domain. After changing a Pages custom-domain setting, rerun the workflow to rebuild against the new path.

To check a project-path production build locally:

```sh
npm run build -- --base /IntoTheFacade/
npm run preview -- --base /IntoTheFacade/
```

Open the preview server at `/IntoTheFacade/`. The map style, favicon, map worker, scripts, and CSS must load from the correct base path. External basemap services still need internet access. Old Saved and personal-note browser data stays on its original host; those features are currently disabled.

## Working features

- Three sourced cases: Stockyard Airsoft, former Eagle Industries, and the Rhode Island Avenue warehouse / Suite 109 case history.
- Thirty-seven evidence entries with source type, source date, review date, method, and explicit limitations.
- Seven original evidence images: three submitted screenshots, three county building photographs and a county sketch. Direct publisher links appear in the gallery, attached evidence, viewer and export; saved image copies are labeled separately. Contributor uploads without a supplied source-page URL are identified explicitly.
- The missing-road case cover opens the Stockyard Overview, fits the road and pulses a gold halo for 5.4 seconds on either map renderer. Reduced-motion users get steady emphasis. On phones, selection brings the map into view. Filtering out the case and renderer changes cancel the pulse.
- Separate findings for former venue, property owner, entity status, current use, building match, abandonment, and access.
- Four real, address-matched county parcel polygons; no invented building blocks or heights.
- Map/list/dossier selection; name, address, owner and parcel search; category filters; flat/tilt views.
- Read-only prior-explorer accounts, separate from verified findings. The personal note editor and Saved collections are disabled and tracked in ROADMAP.md; existing browser data is preserved. Markdown export includes records, urbex readouts and attributed explorer accounts.
- Responsive layouts, keyboard-operable controls, shareable case fragments, and usable dossiers when the map cannot connect.
- The home URL opens with no selected case and an urban-exploration introduction. On every fresh homepage load, the guide draws from its origin to the Missing Road cover once, then its dashes flow toward that cover. Choosing a case dismisses it for the current page visit only; old browser dismissal flags are ignored. Valid case fragments still open the requested dossier directly.
- The active case centers vertically in its own scrolling index and gains a gold highlight. The right hand’s side controls and exposed corners cycle Overview → Evidence → Field notes, with reverse cycling on the left. Tabs remain direct navigation.
- The active attention cover has no remaining card backs while its three cards are dealt. An outgoing case regains its backs after the returning cards arrive. During transit, the real covers stay above the moving cards; no duplicate cover is frozen over the scrolling index.
- Only the selected map marker shows hazard tokens. Board-style tiles distinguish Confirmed, Likely and Potential, with words as well as color and a direct jump to the supporting case evidence. Both styled and 2D maps use the same token component. These are property-level record assessments, not precise hazard coordinates or a live inspection. Confirmed chemical contamination refers to EPA records; vapor intrusion remains Potential, and the Stockyard structural flag is a Likely assessment from the county’s Poor condition field.
- Three illustrated case stacks deal Overview, Evidence and Field notes across the table; switching cases shrinks the previous hand behind its cover. Short-lived inert transit copies keep one interactive dossier and avoid duplicate IDs. Subpixel spring motion and pointer-driven artwork tilt keep the cards alive without dragging. Changing dossier tabs slides the outgoing card fully clear of the fanned hand before lowering its layer and returning it behind the new front card. Interrupted transitions clean up their inert copies. Each whole card tilts as one surface, including its text and images, with no hover scaling. Keyboard focus flattens it for reading. Reduced-motion preferences disable automatic movement.

## Data and representations

Read [DATA_PIPELINE.md](DATA_PIPELINE.md) for the source plan, matching rules, research log, unresolved dependencies, and next milestones.

`src/data.ts` and `src/additional-places.ts` contain the manually reviewed dossiers. Original Stockyard sources retain their November 13 review date; the new cases were reviewed November 14. `src/research/stockyard-parcels.json` is a dated county snapshot. The map pin represents the combined parcel area, not an entrance or surveyed building footprint. `src/research/osm-road-corridor.json` preserves three entire OSM ways and provenance, including WEOKIE parking circulation. Only way 1325580486 is tagged private; untagged ways do not establish public access.

The county lists MID STATES PROPERTIES LLC as owner and MID-STATES WHOLESALE LUMBER as occupant. The red-brick building is visually matched to account R261068040 by the county photograph and sketch. Its inventory lists a 1963 two-story warehouse, 193,038 square feet; the March 18, 2025 photo documents lumber storage at the building. These established findings lead the dossier. The old airsoft tenancy, closure cause and current room-by-room use remain separate research questions. The reported road is present in OSM but absent from the submitted Google view and queried city street-centerline coverage. That difference does not prove physical removal or explain Google's mapping decision.

Fetch a review candidate without changing the published data:

```sh
node scripts/fetch-stockyard-parcels.mjs
```

The candidate is written to ignored `research-candidates/`. Review it against original records before promoting it into `src/research/`. Do not publish changed ownership or occupancy conclusions automatically.

The styled basemap uses a local board-inspired adaptation of [OpenFreeMap's Liberty style](https://tiles.openfreemap.org/styles/liberty). OpenStreetMap/OpenMapTiles attribution is preserved. County parcel attribution is added. Tiles and fonts require network access; the reviewed dossier and parcel snapshot are bundled with the app. Google Fonts supplies Pixelify Sans and IBM Plex, with system fallbacks.

### LibreWolf and browsers without WebGL

LibreWolf disables WebGL by default to reduce fingerprinting. The app automatically switches to a 2D Leaflet map when WebGL initialization fails, the graphics context is lost, or styled-map startup exceeds 16 seconds. This uses ordinary image tiles and SVG parcel overlays, with no canvas or WebGL permission. Pan, zoom, parcel filtering, markers, and dossier selection remain available; tilt is disabled in 2D mode.

The **Use 2D map / Try styled map** control switches renderers. Only explicit choices are saved in `itf:map-renderer`; an automatic fallback does not permanently save a failed renderer. `?map=2d` opens the fallback directly. Generation checks and cleanup prevent late imports or callbacks from restoring a discarded map.

The 2D basemap uses `https://tile.openstreetmap.org/{z}/{x}/{y}.png` and keeps visible OSM and county attribution. It follows the [OSM tile usage policy](https://operations.osmfoundation.org/policies/tiles/): native browser caching/referrers, no bulk downloads, no offline prefetch, no cache-busting. This best-effort public tile service is suitable for the small demo; choose a suitable tile provider before substantial traffic growth. Configure a replacement in `src/compat-map.ts`. If street tiles fail, the bundled parcel outlines remain interactive and a notice explains the missing imagery. The 2D street colors come from OSM; the surrounding card table, markers, and parcel styling remain custom.

Google Maps and MapQuest are proprietary public-facing services, not open datasets. ChamberofCommerce.org is an explanatory guide, not the state filing registry. No live registry, Google, Overture, USGS, or EPA ingestion is running. Source-specific reuse rights need review before expanding automated collection.

Saved collections and the personal note editor are disabled. Existing browser keys are left untouched. The current Field Notes card contains submitted explorer accounts, with source status attached; it is not a live submission form. There is no login, database, cross-device sync or offline application cache.

## Verify

```sh
node --test tests/data.test.ts
npm run build
```

The tests cover claim/finding provenance, county account matching, polygon validity, explicit uncertainty, combined search/filters, retired fragments, generated asset integrity/size, original evidence-image hashes/dimensions/source links, and OSM way geometry/access-tag scope. Browser checks cover both map renderers, evidence navigation, the image viewer, road tracing, filters, and phone layout.

For a development-only styled-map failure check, visit `/?test-map-failure`. This test hook is excluded from the production build. The 2D map should automatically load, with all four parcels and the dossiers available. Remove the query parameter to load the styled map. Also check `/?map=2d`, switching both ways, zero-result searches, zoom/fit, marker selection, and phone layout. LibreWolf's actual WebGL-disabled configuration was reproduced and the fallback verified on November 13, 2026, without changing browser privacy settings.

## Main files

- `src/data.ts` and `src/additional-places.ts`: three reviewed cases, findings, evidence, source metadata, and filters.
- `src/research/additional-parcels.json`: Eagle and warehouse county parcel snapshots.
- `MIDTERM_CASES.md`: the three-case demo script and research boundaries.
- `src/research/stockyard-parcels.json`: reviewed county reference geometry and retrieval provenance.
- `src/research/osm-road-corridor.json`: three complete OSM service-road ways, tags, versions and attribution.
- `scripts/fetch-stockyard-parcels.mjs`: bounded county query that produces a review candidate.
- `DATA_PIPELINE.md`: source plan, matching rules, research log, and next milestones.
- `src/main.ts`: application interactions, map lifecycle, local persistence, export.
- `src/compat-map.ts`: image/SVG map for browsers that block WebGL.
- `src/evidence-images.ts`: evidence gallery, accessible full-resolution viewer, and export metadata.
- `public/evidence/stockyard-airsoft/`: three unmodified contributor screenshots plus the county photo and sketch.
- `public/art/`: nine optimized generated WebP assets; no game assets are distributed.
- `src/generated-art.ts` and `src/generated-theme.css`: raster card artwork and current tabletop composition.
- `src/intro-guide.ts`: introductory pointer to the first case cover, reset on each page visit.
- The right-hand card tracks the full deck and nearby space around its side selectors, so moving off the front face does not abruptly flatten it. This proximity tracking adds no click-blocking overlay.
- `src/case-deck.ts`: case covers, cancelable return/deal transitions and card switching.
- `src/card-motion.ts` and `src/card-motion.css`: damped subpixel float, artwork perspective and the taller reading layout.
- `src/art.ts`: functional SVG icons; older procedural architectural art is no longer used.
- `src/tabletop.css`: underlying card-table layout and responsive behavior.
- `ARTWORK.md` and `art-prompts.json`: artwork provenance, exact prompts, reference roles and delivery settings.
- `COPY.md`: applied brand copy and alternative wording for the next revision.
- `public/styles/board.json`: custom geographic map styling derived from OpenFreeMap Liberty.
- `src/map-palette.ts`: shared decorative place accents for cards and map markers.
- `DESIGN.md`: the approved reference and implementation guide for future changes.

Next meaningful step: document which rooms/floor the former venue occupied, review the deed and subsequent instruments, and establish closure history through relevant records. Compare recorded plats and dated aerials to explain the service-road map discrepancy.


## Urbex readouts and soundtrack (November 14 update)

`src/field-research.ts` adds eight sourced entries without rewriting the original evidence. Each Overview now leads with a field readout: recorded activity, separately documented security features, approach/permission context, hazards and a public contact channel. The scale is a dated record classification, not live security or foot-traffic monitoring. Unreported guards, cameras, animals or hazards are never treated as absent. Public streets and map reference lines are distinct from permission to enter a parcel.

`src/explorer-notes.ts` contains the Stockyard submission attributed to **Anonymous explorer**. Its exact first-person wording is preserved, with the competitor/closure/motive claims clearly labeled unverified. No submissions are invented for the other sites. Future Saved collections and editable notes are in [ROADMAP.md](ROADMAP.md).

`src/background-audio.ts` attaches an audio element with `preload="none"` and no source URL. The first scroll attempt, tap, click, navigation key or Play attaches the same-origin MP3 and requests playback. Scroll intent is detected from wheel/touch movement, not programmatic scrolling. Scroll makes at most one startup attempt; if autoplay is blocked, a later tap/click retries. Successful playback removes the startup listeners, and repeated scrolling never toggles or restarts the track. Manual pause and saved audio preferences are respected. Nothing in page rendering or map initialization awaits audio. Controls allow pause and volume changes; a hidden tab pauses the recording and a visible tab resumes only if the visitor has not paused it. A playback failure leaves the application usable. Playback permission remains subject to the browser. The full supplied 93m33s recording is compressed for background playback; the user's original is untouched. No audio is imported into the JavaScript bundle.

For guide QA, open the homepage, select a case, then reopen the homepage: the arrow must draw again even in a browser that dismissed it previously. Test the side buttons/corners, wraparound, active-index centering, first-gesture audio, no media source before interaction, and hidden-tab pause. Mobile keeps the compact three-cover row and the active highlight.

The source recording is stored in `media/dark-doom-jazz/` as bounded binary pieces to support connector upload limits. `scripts/assemble-audio.mjs` verifies SHA-256 hashes and reconstructs one 44,906,444-byte MP3 before both dev and production builds. The source pieces are outside `public/` and never requested by the player. The full duration is 5,613.216 seconds; the delivered MP3 is 64 kbit/s stereo at 32 kHz.


## Mobile layout refresh

Phone onboarding uses a short intro plus a separate Start with MISSING ROAD!! button immediately above the horizontal case rail. The guide measures that actual button and the visible first card, draws once per page visit, and is removed when a case opens. The case rail centers the selected deck horizontally.

At phone/tablet widths, large hazard tokens are removed from the map and rendered as compact, sourced controls beneath it. Tapping one opens and scrolls to the supporting record. The shared hazard-group renderer preserves the same classifications and citations in both map renderers and the mobile strip. Phone map controls share one top row, surplus overlays are hidden, and previous/next card controls stay visible.

QA: first visit and drawing arrow; direct first-case open; active rail centering; 320px and 390px phone widths; 768px tablet layout; both styled and 2D maps; hazard-to-evidence navigation; alert-theme activation, tab changes, case switching and return home.


## Alarm effect and exposed card stock

`src/case-alarm.ts` plays the supplied ALARM.mp3 as an independent, non-looping sound when entering the Rhode Island case. It never changes the soundtrack. Same-case clicks, card changes and scrolling do not retrigger it; leaving the case or hiding the page stops only this effect. A browser-blocked direct-link attempt waits for a click/tap or activation key. The MP3 is attached lazily with preload=none and no awaited media work in rendering. The deployed file is `public/audio/organized-crime-alarm.mp3`, 122,309 bytes, 5.093875 seconds; original SHA-256: 55ff4c277bf0f0256476c60e7b74cb39e8f317fad23123a238baee1f905f6bfd.

`src/card-readability.css` removes filled reading/title/footer/image-container panels so the underlying card art remains visible. Deep plum text uses a narrow cream halo; large titles receive a cream stroke to remain legible over bloodstains. Real evidence-image pixels are unchanged. Scrollbars use a bright gold thumb over a dark plum track, with a thicker native/custom width.

Case arrivals animate the actual front and fanned cards to their existing CSS poses. There is no final clone replacement or angle correction; the floating spring resumes from rest. The development-only handoff diagnostic measured 0.000px on desktop and mobile case switches. Returning cards still travel behind the original case cover.

Mobile and tablet maps have Pan map / Rotate / tilt controls beneath the map. Rotate / tilt enables a one-finger drag for bearing and pitch while preserving native two-finger zoom, rotation and pitch. Pitch stays within the renderer's supported range (and a 70-degree ceiling). A second pointer yields to native multi-touch until all fingers lift. Pan, flat view and renderer changes release captured pointers and restore panning. The control is hidden in the 2D fallback. Arrow keys offer equivalent camera movement in orbit mode.

QA: production build and 17 tests; simultaneous music/alarm playback, no repeat on tab/same-case selection, effect stop on case exit; desktop and 390px mobile card contrast and gold scrollbars; actual camera drag and keyboard rotation/pitch at mobile width; switching styled/2D renderers. Pointer lifecycle, pinch handoff and angle limits are covered by map-camera tests. No physical phone multi-touch session was available.

The couch attention card now uses `public/art/organized-crime-card-blood.webp`, edited with the built-in image generation tool. It adds a theatrical blood pool behind the couch; the earlier artwork is retained. The edit prompt and source are recorded in `couch-blood-art-prompt.json`. Decorative imagery remains separate from evidence photographs and factual claims.

A large welcome notice appears once per page load: “Turn your sound on! Fun sounds and music!” Its explicit play action enables the soundtrack, and it disappears only after playback begins or the visitor dismisses it. Closing the notice does not itself trigger music. Returning home does not reopen it; reloading does. Audio remains lazy and independent of map/app loading.
