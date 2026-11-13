# Into The Facade: generated pixel-card direction

Approved reference: [Dungeons & Degenerate Gamblers](https://store.steampowered.com/app/2400510/Dungeons__Degenerate_Gamblers/). Austin's November 13, 2026 revision requires generated raster artwork rather than procedural SVG card illustrations. The reference establishes worn cream cards, coarse pixels, dark green felt, exaggerated borders and playful occult imagery. All published artwork is original; no game screenshots, logos, characters or card designs are distributed.

## Composition

- Dark moss felt holds a mystery/location deck, the real geographic map, and a tall worn-paper dossier.
- The large **MISSING ROAD!!** card leads the deck. Its eye, vanishing road, pumpkin and small theatrical blood marks provide atmosphere. Clicking it opens the actual map-comparison evidence.
- The location card and dossier show the red-brick warehouse, illustrated from the official county photograph. Its glass-block bay, upper window band, returning wing and lumber stacks connect it to the real building. The generated image is labeled and links directly to the original photograph.
- Generated card stock provides frayed, stepped, stained borders with a quiet center for live readable text. Titles, controls and research findings remain accessible HTML. SVG is retained for functional icons and real map geometry.
- The owner, matched building and dated lumber use lead the dossier. Remaining questions are available in a collapsed evidence section instead of repeated vacancy/unknown banners.

## Assets and palette

Five assets in `public/art/`: `missing-road-card.webp`, `brick-building-art.webp`, `worn-card-face.webp`, `table-felt.webp`, and `occult-card-back.webp`. Exact prompts and provenance: [ARTWORK.md](ARTWORK.md), [art-prompts.json](art-prompts.json).

Felt `#1c2c23`; ink `#271b27`; paper `#efdfc2`; moss `#657859`; rust/oxblood, muted gold and dusty plum accents. Artwork uses visible pixel clusters and dithering. CSS applies hard shadows, restrained rotation and pixelated image rendering. Pixelify Sans handles titles/controls, IBM Plex Sans handles reading, and IBM Plex Mono handles small labels. Long passages stay on quiet paper.

The styled geographic map retains real labels and attribution. OSM service roads are purple; the specifically private-tagged way is distinguished with dashes. These tags are source observations, not a legal-access verdict. Parcel boundaries remain separate. The 2D fallback uses ordinary OSM image tiles and SVG geometry without WebGL/canvas permissions.

## Responsive behavior

Desktop: discovery deck / map / selected dossier, with internal reading scroll. Tablet: map above deck and dossier. Phone: mystery/location deck first, then map, then dossier. Horizontal card scrolling must not widen the document. Preserve keyboard focus, tabs, image viewer navigation, reduced-motion settings, search, saved places, notes, export and map controls.

## Implementation

- `src/generated-theme.css`: current raster composition, surfaces and responsive overrides.
- `src/generated-art.ts`: image markup and accessible descriptions.
- `src/main.ts`: dossier, mystery-card interactions and styled map.
- `src/compat-map.ts`: image/SVG map for privacy browsers.
- `src/tabletop.css`: base layout and controls.
- `public/styles/board.json`: geographic map palette.

Generated art and original evidence must remain distinct in the data model, UI and exports. Do not imply present ruin, abandonment, permission, a removed road, or a cause of closure through illustration. Keep the mystery playful while letting the research answer it.
