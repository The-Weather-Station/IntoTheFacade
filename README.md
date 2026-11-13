# Into The Facade

An initial Oklahoma City field atlas built with Vite, TypeScript, and MapLibre GL JS.

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

The custom domain is `intothefacade.com`. Namecheap DNS uses GitHub Pages' four documented apex A records and a `www` CNAME pointing to `the-weather-station.github.io`. After setting the custom domain, rebuild the site so scripts, CSS, the favicon, and map styles use root-relative paths. GitHub provisions the HTTPS certificate; enable **Enforce HTTPS** in Pages settings when available. DNS caches and certificate provisioning may take up to 24 hours.

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

- Three curated Oklahoma City locations with nine historical claims and original source links.
- Map/list/dossier selection, search, category filters, 2D/3D view, zoom, and fit-to-results.
- Saved places and field notes persisted in this browser's local storage.
- Markdown export of a dossier, its source links, unknowns, and saved note.
- Responsive phone, tablet, and desktop layouts; keyboard-operable main controls and tabs.
- A usable location index and dossier if the external map or WebGL cannot initialize.
- Shareable location fragments, such as `#gold-dome`.

## Data and representations

`src/data.ts` is the reviewed dataset. Each evidence claim references a source entry. Source publication dates are separate from the November 11, 2026 review date. A historical claim is not verification of current ownership, access, service, or condition.

The basemap uses a locally hosted, board-game-inspired adaptation of [OpenFreeMap's Liberty style](https://tiles.openfreemap.org/styles/liberty). Mint land, cream roads, ink outlines, blue water, and green parks restyle the original geographic features; no fictional streets, prices, ownership, or game rules are added. Place accent colors are decorative. OpenMapTiles/OpenStreetMap attribution is preserved, and live tiles and fonts require network access. Google Fonts supplies Barlow Condensed and IBM Plex fonts; system fallbacks remain available.

The three highlighted geometry shapes and heights are deliberately schematic. They are not Overture downloads, surveyed footprints, or reconstructed buildings. The architectural SVG illustrations are original schematic drawings, not photographs. Coordinates are approximate location references:

- Union Station: public geographic references around 35.45728, -97.51865 ([reference](https://www.anyplaceamerica.com/directory/ok/oklahoma-county-40109/locales/union-station-1099175/)).
- Santa Fe Depot: 35.465341, -97.512821 ([National Register registration map](https://npgallery.nps.gov/GetAsset/3c991bee-7759-419c-ab54-ed691ff97ba3)).
- Gold Dome: rounded to 35.49294, -97.53117 ([location reference](https://tripomatic.com/en/poi/gold-dome-poi:15648)).

Historical sources are listed per place in the app. Overture, USGS, and EPA are not queried live in this version. A bounded Overpass research query was attempted during development but did not return usable data; the app does not depend on it.

Saved records and notes are local browser conveniences. There is no login, database, cross-device sync, or offline application cache. They can be lost if browser data is cleared. Export makes a separate copy.

## Verify

```sh
node --test tests/data.test.ts
npm run build
```

The tests cover claim/source integrity, region bounds, combined filters, invalid location IDs, and unique illustration IDs. Browser verification covers selection, evidence, search, category filtering, saved places and note persistence, Markdown export, 2D/3D switching, phone layout, and the map-failure path.

For a development-only map-failure check, visit `/?test-map-failure`. This test hook is excluded from the production build. All dossiers should remain usable. Remove the query parameter to load the live map.

## Main files

- `src/data.ts`: place records, evidence, source dates and URLs, filter logic.
- `src/main.ts`: application interactions, map lifecycle, local persistence, export.
- `src/art.ts`: icons and schematic architectural illustrations.
- `src/style.css`: the industrial visual system and responsive layouts.
- `public/styles/board.json`: custom geographic map styling derived from OpenFreeMap Liberty.
- `src/map-board.css` and `src/map-palette.ts`: printed-board map controls, markers, and decorative place accents.

Next meaningful step: replace schematic geometry with reviewed real footprints for this small region, then add one bounded data adapter while preserving claim-level provenance.
