# Generated artwork · November 13, 2026

All five assets were made with the **built-in image generation tool**. No CLI fallback or procedural SVG substitute was used. The exact prompt set is preserved in [art-prompts.json](art-prompts.json).

## Deliverables

| Asset | Role | Web delivery |
| --- | --- | --- |
| missing-road-card | Worn “MISSING ROAD!!” card; occult road mystery, small theatrical blood marks | 512px wide, lossless WebP |
| brick-building-art | Pixel illustration of the actual red-brick warehouse | 1024px wide, lossless WebP |
| worn-card-face | Reusable worn cream stock with quiet center for HTML | 640px wide, lossless WebP |
| table-felt | Dark moss pixel-felt tabletop | 768px wide, lossless WebP |
| occult-card-back | Original eye/industrial-door/pumpkin card back | 256px wide, lossless WebP |

Web files are in `public/art/`. The unmodified full-resolution PNG outputs and exact local generation manifest are retained in the parent project at `output/art-direction/`. Nearest-neighbor resizing and lossless WebP encoding with Sharp create smaller delivery files; the original generated PNGs are unchanged. The web assets total approximately 2.3 MB. Rebuild the site when changing assets.

## References and boundaries

- [Dungeons & Degenerate Gamblers](https://store.steampowered.com/app/2400510/Dungeons__Degenerate_Gamblers/): visual reference for pixel treatment, worn cards and green felt. A publisher-supplied Steam screenshot was provided to the first three image calls. No game assets are shipped.
- [Oklahoma County Assessor photo, R261068040](https://docs.oklahomacounty.org/AssessorWP5/ShowImageDB.asp?Propertyid=43457): factual architectural reference for the brick-building image. The original dated March 18, 2025 is preserved separately in `public/evidence/stockyard-airsoft/assessor-building-2025.jpg`.
- Later tabletop/back prompts use the established written palette and art constraints.

The generated building image is an illustration, not a photo or current-condition finding. The road card's void, occult eye and blood marks are fictional decoration. Original evidence images retain their own source records, hashes, dates and attribution. They are never replaced by generated images.

## Reproduction

Use the saved prompt for each asset independently, retaining its reference role and transparency setting. Export to a new file, inspect the result, then prepare web derivatives. Keep the central card face quiet enough for live HTML. Preserve actual architecture and lumber stacks in the warehouse illustration. Do not add factual claims, ownership labels, invented abandonment, or copied game symbols.
