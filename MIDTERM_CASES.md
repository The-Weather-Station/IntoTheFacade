# Midterm demonstration: three Oklahoma County properties

Reviewed addition: November 14, 2026. This is a curated static prototype, not a live abandonment detector or a current crime-risk rating.

1. **Stockyard Airsoft** — A former venue linked to an identified brick warehouse. County records document lumber storage; the submitted Google map and OSM disagree about a service road. Open the Missing Road card to compare records and highlight the road.
2. **Eagle Industries** — The county lists the former aircraft-equipment repair building as unoccupied. DEQ documents TCE disposal, and EPA records an offsite well response that continued into 2026. The commercial building and separate residence on the parcel are distinguished. The parcel is not a contamination boundary.
3. **Rhode Island Avenue warehouse / Suite 109** — A 2025 marijuana-shipping case is tied to one suite in a multi-tenant complex. A later state record supplies a partial sentencing update. Broker leasing evidence follows the arrests; this is a documented case history, not a claim of present abandonment or wrongdoing by current owners and tenants.

All cases include a summary first in Overview, dated source-linked evidence, original county imagery with direct publisher URLs, a reference parcel, generated artwork kept outside evidence, notes and Markdown export. No federal-owned building was selected. Selection is based on documented property history and hazards, not ethnicity or nationality.

## Demo sequence

- Open https://intothefacade.com/ and choose a property card or map marker. Search for Eagle or Rhode to bring a case card to the top.
- Read the Overview summary, then open the county photo and its publisher source. Switch to Evidence for the dated record and method.
- Select Missing Road from any case. The dossier switches to Stockyard and the road gets a temporary highlight. Switch to the 2D map to test the WebGL-independent renderer.
- Drag either a left card or the right dossier onto the map using its grip or illustration. Text keeps its native size. Use Reset cards to return them; keyboard grips support arrow keys, Shift+arrow and Home.

## Research limits that matter

The Eagle summary does not claim full-site cleanup is complete. DEQ and EPA differ on the extent of the 2006 soil removal; both versions are preserved in Evidence. The warehouse address match is not a surveyed Suite 109 outline. Its county and broker dimensions differ, and the full case disposition was not retrieved for every defendant. Historic closure, marketing, environmental conditions and entry permission are separate questions.

## Artwork

Two additional bitmap illustrations were created with the built-in image generation tool using each county photograph as the subject reference and the established brick-building illustration as the style reference. They are stored in `public/art/eagle-building-art.webp` and `public/art/warehouse-building-art.webp`. Original photos remain unaltered in `public/evidence/`; source URLs, visible capture dates and SHA-256 hashes are recorded in the dossiers. Exact generation prompts are in `midterm-art-prompts.json`.
