# Generated artwork · November 13–14, 2026

## November 14 alert deck additions

Two further assets were generated and edited with the **built-in image generation tool**. Full prompt history is in [alert-art-prompts.json](alert-art-prompts.json). Full-resolution PNGs are retained in the parent project's `output/art-direction/`; same-size WebP derivatives preserve alpha transparency.

- `public/art/organized-alert-card.webp`: additional ALERT!!! ALERT!!! card, a fictional gas-masked communist commissar and two red emergency beacons. The final revision removes the footer label from the image and adds prominent photorealistic blood smears and drips over the pixel illustration. The on-screen beacons have rotating light beams and a slow pulse, with a pause button and reduced-motion support.
- `public/art/crime-card-face.webp`: blank card stock with heavy realistic bloodstains, used only for the Rhode Island warehouse's four info cards and their transit copies. Text panels preserve legibility. Other case art and original evidence photographs are unchanged.

The villain depicts no defendant. Reviewed records document an alleged trafficking operation and an Organized Crime Task Force investigation, but do not establish citizenship, Communist Party membership, Chinese-state involvement, or a named Chinese criminal-group connection. Political symbols and blood are decorative fiction, not evidence or an allegation of violence. The existing ORGANIZED CRIME!!! couch cover is unchanged.

All nine assets were made with the **built-in image generation tool**. No CLI fallback or procedural SVG substitute was used. Exact prompts are preserved in [art-prompts.json](art-prompts.json), [midterm-art-prompts.json](midterm-art-prompts.json) and [attention-card-prompts.json](attention-card-prompts.json).

## Deliverables

| Asset | Role | Web delivery |
| --- | --- | --- |
| missing-road-card | Worn “MISSING ROAD!!” card; occult road mystery, small theatrical blood marks | 512px wide, lossless WebP |
| brick-building-art | Pixel illustration of the actual red-brick warehouse | 1024px wide, lossless WebP |
| worn-card-face | Reusable worn cream stock with quiet center for HTML | 640px wide, lossless WebP |
| table-felt | Dark moss pixel-felt tabletop | 768px wide, lossless WebP |
| occult-card-back | Original eye/industrial-door/pumpkin card back | 256px wide, lossless WebP |
| eagle-building-art | County-photo-based former repair shop illustration | Landscape WebP |
| warehouse-building-art | County-photo-based loading-dock illustration | Landscape WebP |
| illegal-dumping-card | Eagle Industries attention cover with theatrical spills | 1024 × 1536, transparent WebP |
| organized-crime-card | Historical shipping-case cover, marijuana spilling from a cut couch | 1024 × 1536, transparent WebP |

Web files are in `public/art/`. Unmodified full-resolution PNG outputs are retained in the parent project at `output/art-direction/`. Sharp prepared the initial derivatives; Pillow encoded later WebP files while preserving transparency. Original generated PNGs are unchanged. The nine web assets total approximately 4.22 MB. Rebuild the site when changing assets.

## References and boundaries

- [Dungeons & Degenerate Gamblers](https://store.steampowered.com/app/2400510/Dungeons__Degenerate_Gamblers/): visual reference for pixel treatment, worn cards and green felt. A publisher-supplied Steam screenshot was provided to the first three image calls. No game assets are shipped.
- [Oklahoma County Assessor photo, R261068040](https://docs.oklahomacounty.org/AssessorWP5/ShowImageDB.asp?Propertyid=43457): factual architectural reference for the brick-building image. The original dated March 18, 2025 is preserved separately in `public/evidence/stockyard-airsoft/assessor-building-2025.jpg`.
- Later tabletop/back prompts use the established written palette and art constraints.

The generated building image is an illustration, not a photo or current-condition finding. The road card's void, occult eye and blood marks are fictional decoration. Original evidence images retain their own source records, hashes, dates and attribution. They are never replaced by generated images.

The attention covers dramatize the dated disposal and shipping records. Green spills, barrel symbols and couch contents are theatrical imagery, not current-site observations, radiological evidence, or accusations against current owners/tenants. The page labels cover art separately from original evidence.

## Reproduction

Use the saved prompt for each asset independently, retaining its reference role and transparency setting. Export to a new file, inspect the result, then prepare web derivatives. Keep the central card face quiet enough for live HTML. Preserve actual architecture and lumber stacks in the warehouse illustration. Do not add factual claims, ownership labels, invented abandonment, or copied game symbols.
