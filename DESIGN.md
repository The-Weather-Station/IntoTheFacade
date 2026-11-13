# Into The Facade: tabletop visual direction

Chosen by Austin on November 13, 2026. The primary visual reference is
[Dungeons & Degenerate Gamblers](https://store.steampowered.com/app/2400510/Dungeons__Degenerate_Gamblers/).
This supersedes the earlier industrial atlas treatment. The reference establishes
the grimy pixel-art tabletop, tactile cream cards, mixed card families, strong
outlines, and playful strangeness. The site uses original graphics and content.

## Composition

- A dark plum and brown tabletop holds the existing geographic board, a location
  deck, and the selected dossier card.
- Locations are cream cards with decorative colored headers, integer-grid pixel
  landmark illustrations, corner numbers, dates, and short sourced-fact counts.
- Evidence uses paper cards with publisher links and source dates. Notes use a
  ruled paper surface. The site remains a research tool; no invented gameplay,
  prices, ownership, access status, or historic claims are introduced.
- Small original eye, moon, and pumpkin cards carry the Halloween influence.
  Landmark drawings remain explicitly illustrative and not to scale. Their night
  palette does not represent present conditions.

## Visual vocabulary

Table `#241c29`; ink `#302535`; paper `#f1e4cd`; moss `#657859`;
rust `#be594b`; teal `#648f91`; gold `#d8b653`; purple `#67546d`.
Use 2–3px outlines, stepped/inset highlights, offset hard shadows, modest card
rotation, and short lift interactions. Keep paragraphs on quiet paper surfaces.
Use Pixelify Sans for titles and controls, IBM Plex Sans for reading, and IBM Plex
Mono for small catalog labels. Do not apply a pixel font to long passages.

The board retains real geographic names, mint/sage land, cream roads, colored
features, and attribution. Its palette is muted to sit naturally on the table.
Location colors are decorative and carry no access, risk, or ownership meaning.

## Responsive behavior and interaction

Desktop: location deck / board / selected card. Tablet: board above deck and
dossier. Phone: board, horizontally scrollable location cards, full dossier.
Keep search, category filters, saved places, evidence links, notes, export,
location deep links, and map controls operational. Preserve keyboard focus,
tab navigation, and reduced-motion preferences. Historical data lives separately
in `src/data.ts` and is not changed by the art direction.

## Implementation

- `src/tabletop.css`: complete visual system and responsive layouts.
- `src/art.ts`: original icons and schematic pixel landmark drawings.
- `src/main.ts`: card markup and application interactions.
- `src/map-palette.ts`: shared decorative location colors.
- `public/styles/board.json`: geographic board palette.

Do not reintroduce the older dark-green dashboard styling. Future art should
extend this card vocabulary with original imagery. The visual reference is not
a request to reuse the game's assets, logo, characters, or gameplay text.
