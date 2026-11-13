# Into The Facade

An initial Oklahoma City field atlas built with Vite, TypeScript, MapLibre GL JS, and a Leaflet 2D fallback.

The visual direction is a worn pixel-art card table inspired by Dungeons & Degenerate Gamblers. Five original generated raster assets supply the worn card faces, occult card back, felt, missing-road mystery card, and county-photo-based brick warehouse illustration. See [DESIGN.md](DESIGN.md) and [ARTWORK.md](ARTWORK.md). Generated artwork is separate from documentary evidence.

## Run

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

Open the preview server at `/IntoTheFacade/`. The map style, favicon, map worker, scripts, and CSS must load from the correct base path. External basemap services still need internet access. Saved places and field notes belong to the browser origin; moving to a new host does not transfer old browser storage. Export any notes you want to retain before switching hosts.

## Working features

- One real research case: the former Stockyard Airsoft address, replacing the three landmark examples.
- Fifteen evidence entries with source type, source date, review date, method, and explicit limitations.
- Five original evidence images: three submitted screenshots, a county building photograph and a county sketch. Direct publisher links appear in the gallery, attached evidence, viewer and export; saved image copies are labeled separately. Contributor uploads without a supplied source-page URL are identified explicitly.
- The missing-road card opens the OSM comparison, fits the road and pulses a gold halo for 5.4 seconds on either map renderer. Reduced-motion users get steady emphasis. On phones, selection brings the map into view. Filtering out the case and renderer changes cancel the pulse.
- Separate findings for former venue, property owner, entity status, current use, building match, abandonment, and access.
- Two real, address-matched county parcel polygons; no invented building blocks or heights.
- Map/list/dossier selection; name, address, owner and parcel search; category/saved filters; flat/tilt views.
- Browser-local saved places and field notes, with Markdown export of findings, provenance, unknowns, and next steps.
- Responsive layouts, keyboard-operable controls, shareable `#stockyard-airsoft` fragment, and usable dossiers when the map cannot connect.

## Data and representations

Read [DATA_PIPELINE.md](DATA_PIPELINE.md) for the source plan, matching rules, research log, unresolved dependencies, and next milestones.

`src/data.ts` is the manually reviewed dossier. `src/research/stockyard-parcels.json` is a dated county snapshot. The map pin represents the combined parcel area, not an entrance or surveyed building footprint. `src/research/osm-road-corridor.json` preserves three entire OSM ways and provenance, including WEOKIE parking circulation. Only way 1325580486 is tagged private; untagged ways do not establish public access.

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

Saved records and notes are local browser conveniences. There is no login, database, cross-device sync, or offline application cache. They can be lost if browser data is cleared. Export makes a separate copy.

## Verify

```sh
node --test tests/data.test.ts
npm run build
```

The tests cover claim/finding provenance, county account matching, polygon validity, explicit uncertainty, combined search/filters, retired fragments, generated asset integrity/size, original evidence-image hashes/dimensions/source links, and OSM way geometry/access-tag scope. Browser checks cover both map renderers, evidence navigation, the image viewer, road tracing, filters, and phone layout.

For a development-only styled-map failure check, visit `/?test-map-failure`. This test hook is excluded from the production build. The 2D map should automatically load, with both parcels and the dossier available. Remove the query parameter to load the styled map. Also check `/?map=2d`, switching both ways, zero-result searches, zoom/fit, marker selection, and phone layout. LibreWolf's actual WebGL-disabled configuration was reproduced and the fallback verified on November 13, 2026, without changing browser privacy settings.

## Main files

- `src/data.ts`: reviewed case, separate findings, evidence, source metadata, and filters.
- `src/research/stockyard-parcels.json`: reviewed county reference geometry and retrieval provenance.
- `src/research/osm-road-corridor.json`: three complete OSM service-road ways, tags, versions and attribution.
- `scripts/fetch-stockyard-parcels.mjs`: bounded county query that produces a review candidate.
- `DATA_PIPELINE.md`: source plan, matching rules, research log, and next milestones.
- `src/main.ts`: application interactions, map lifecycle, local persistence, export.
- `src/compat-map.ts`: image/SVG map for browsers that block WebGL.
- `src/evidence-images.ts`: evidence gallery, accessible full-resolution viewer, and export metadata.
- `public/evidence/stockyard-airsoft/`: three unmodified contributor screenshots plus the county photo and sketch.
- `public/art/`: five optimized generated WebP assets; no game assets are distributed.
- `src/generated-art.ts` and `src/generated-theme.css`: raster card artwork and current tabletop composition.
- `src/art.ts`: functional SVG icons; older procedural architectural art is no longer used.
- `src/tabletop.css`: underlying card-table layout and responsive behavior.
- `ARTWORK.md` and `art-prompts.json`: artwork provenance, exact prompts, reference roles and delivery settings.
- `COPY.md`: applied brand copy and alternative wording for the next revision.
- `public/styles/board.json`: custom geographic map styling derived from OpenFreeMap Liberty.
- `src/map-palette.ts`: shared decorative place accents for cards and map markers.
- `DESIGN.md`: the approved reference and implementation guide for future changes.

Next meaningful step: document which rooms/floor the former venue occupied, review the deed and subsequent instruments, and establish closure history through relevant records. Compare recorded plats and dated aerials to explain the service-road map discrepancy.
