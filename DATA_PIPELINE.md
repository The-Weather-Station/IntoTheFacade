# Public-record research pipeline

## Product correction · November 13, 2026

Into The Facade investigates overlooked properties for people interested in urban exploration. Historical significance alone is not a useful candidate criterion. The landmark demo deck has been replaced by one real investigation: the former Stockyard Airsoft address, 2801 SW 15th Street, Oklahoma City.

The product must keep **former business, legal entity, parcel, building, present occupancy, physical condition, and access** separate. A closed directory entry, expired LLC, missing permit, or deteriorated appearance cannot independently establish abandonment. Public findings are attributed claims, with dates and unresolved matches, rather than an unexplained confidence score.

## What runs today

- A manually reviewed dossier with fifteen evidence entries; source type, observation date, source date, collection method, and limitations travel with every claim.
- Five evidence images: three contributor-supplied Google Maps / Street View screenshots and the county building photograph and sketch. Each original is viewable at full resolution with source metadata, retrieval/submission date, filename, dimensions, attribution and SHA-256 integrity record.
- A reviewed snapshot of three complete OSM service-road ways, with their tags, versions and edit dates, overlaid on both map renderers. The missing-road card opens this comparison.
- Two real county parcel polygons, retrieved from the service linked by the official assessor's parcel map. The pin is their combined bounding-box center. It is not the former field's verified location or an entrance.
- A bounded Node fetcher for those two accounts. It saves a candidate snapshot outside the published dataset. It does not overwrite reviewed claims or publish changes automatically.
- A static GitHub Pages application with browser-local notes and Markdown export. No paid backend, registry scraper, scheduled scan, or general discovery engine is running.

## Sources and the questions they answer

| Source | Use in the pipeline | What it does not establish |
| --- | --- | --- |
| [Oklahoma County Assessor](https://docs.oklahomacounty.org/AssessorWP5/DefaultSearch.asp) and [parcel map](https://experience.arcgis.com/experience/10a159706dc74c38a555d813f369cde7/) | Candidate parcel IDs, listed owner, occupant label, physical inventory, reference boundaries | Definitive title, current occupancy of every building, access, or a surveyed boundary |
| [County Clerk records](https://getrecords.oklahomacounty.org/web/) | Recorded deeds and related instruments, matched using legal description and recording reference | Who operates a business inside a building or whether entry is permitted |
| [Oklahoma Secretary of State search](https://business.sos.ok.gov/corp/corpInquiryFind.aspx) | LLC/corporation/trade-name identity, filing number, registry status; detailed filings when available | Building ownership, closure cause, or vacancy; a registered agent is not automatically the owner |
| [OKC Citizen Access](https://aca-prod.accela.com/OKC/Default.aspx) | Address-based permits, licenses, planning/fire records, subject to module coverage and record availability | A comprehensive enforcement history from one module; a closed record is not a closed venue |
| [OKC Code Enforcement](https://www.okc.gov/Government/Departments/Development-Services/Code-Enforcement) | Identify the responsible department and the kinds of records needed | Evidence of a violation at this particular location |
| Business websites, dated venue material, directories | Former names, addresses, dates, aliases, and current-use clues | Automatically authoritative ownership or current condition |
| OpenStreetMap / OpenFreeMap | Geographic context with attribution | Legal parcels, ownership, or abandonment |
| Overture / USGS / EPA, later | Potential building geometry and environmental/geographic context, when relevant to a specific question | Vacancy, access, or closure cause by themselves |

The user's ChamberofCommerce.org link is an explanatory third-party guide. The state registry is the authoritative filing source. “Open-source research” here means researching accessible sources; Google Maps and MapQuest are proprietary services, not openly licensed datasets. Use approved APIs or manual links subject to their terms. Do not bulk scrape or mirror their content. Track licensing per source before building commercial ingestion.

## Repeatable first adapter

Run from the repository root:

```sh
node scripts/fetch-stockyard-parcels.mjs
```

This uses the assessor's public `TaxParcelsPublics_view/FeatureServer/0` Query service. Only R261068000 and R261068040 are queried, in EPSG:4326, with a small field allowlist. The script checks account membership, address, geometry type, ring closure, geographic bounds, HTTP failures, and ArcGIS error responses. It writes `research-candidates/stockyard-parcels.json` (ignored by Git).

Review the candidate against the assessor pages. If the accounts, address, and geometry still support the dossier, copy it to `src/research/stockyard-parcels.json`, update affected claims and review dates, run the data tests/build, and inspect the map before committing. Review owner changes rather than copying them directly into conclusions. Keep the previous snapshot in Git history. Failed retrieval leaves the last published snapshot untouched.

The public ArcGIS item advertises Query/Extract but does not supply an explicit license in its item metadata. This narrow attributed demonstration is not evidence of unrestricted bulk/commercial redistribution rights. Establish terms, refresh limits, and attribution before expanding ingestion.

## Evidence and matching rules

1. Record the submitted name/address as a lead, with its source and observation date.
2. Normalize addresses while retaining the exact original. Search street-number aliases separately; preserve jurisdiction conflicts.
3. Match to one or more parcels. Keep the join ambiguous until geometry, a lease, a dated venue image, or other suitable documentation identifies the building.
4. Resolve business names and trade names independently of the property owner. Store filing IDs and match rationale. Do not equate an agent with an owner.
5. Inspect deeds, occupancy documents, permits, and relevant fire/code records. Track the query, dates, module, and incomplete coverage.
6. Compare current-use evidence. Label conflict, age, and uncertainty explicitly. “No result” means no match in that search; it is not proof of no event.
7. Publish specific claims, their sources, and the next verification steps. Avoid reproducing unrelated personal addresses or contact details.

For scaling, use stable source IDs, claim IDs, parcel IDs, entity IDs, record IDs, observation timestamps, source publication/event dates, review status, matching rationale, and access/reuse terms. Separate raw candidate records from reviewed publication data. Change detection should produce a review queue, with retries/backoff and cached snapshots, rather than a live unreviewed verdict.

## First-case research log · November 13, 2026

- User-supplied MapQuest screenshot: Stockyard Airsoft marked permanently closed at 2801 SW 15th. The live MapQuest page was not independently retrieved. The screenshot is not republished.
- Manta: unclaimed Stockyard Airsoft listing at the same address, with opening date unspecified.
- Assessor: live pages [R261068000](https://docs.oklahomacounty.org/AssessorWP5/AN-R.asp?PropertyID=43455) and [R261068040](https://docs.oklahomacounty.org/AssessorWP5/AN-R.asp?PropertyID=43457) identify MID STATES PROPERTIES LLC and an occupant label of MID-STATES WHOLESALE LUMBER. Accounts use the same street address and list a July 12, 2013 multi-parcel transfer at book 12303/page 874. This is the assessor's transaction index; the deed itself was not read.
- County Clerk deed reference reached a CAPTCHA and disclaimer requiring indemnification acceptance. No CAPTCHA or acceptance was performed. Deed/current-title review remains pending.
- SOS search for “Stockyard Airsoft”: result STOCKYARD AIRSOFT, LLC, 3512374032, domestic LLC, Expired. Detail navigation requested a personal name/email. No contact data was submitted and no full filing retrieved. The name match has not been independently joined to this venue by a lease or filing.
- Snavely's own contact page lists Mid-States Wholesale Lumber at 2701 SW 15th, also the assessor billing address. This does not locate the former field within the complex.
- The old city URL access.okc.gov failed certificate validation; followed the current link from the official city's Building & Trade Permits page to aca-prod.accela.com/OKC. No security warning was bypassed.
- City Permits search: street-number range 2801–2801, direction SW, street name 15, type ST, dates January 1, 1983–November 13, 2026. Returned IMPA-2015-02345 (July 22, 2015; Impact Fee; Closed) and PLMR-2015-02397 (April 8, 2015; Plumbing - Residential; different ZIP). Opened the impact-fee record: its description identifies a county address of 2701 SW 15th. A record's Closed status does not establish a shutdown. The plumbing result is an unreviewed address match and is not published as a site finding.
- Permit search is not a comprehensive search of fire, code enforcement, occupancy, all alternate addresses, or county jurisdiction records. No closure cause or order was verified.

## Next milestones

1. Document the former venue's rooms/floor within the visually matched brick building, reconcile 2701/2801 and jurisdiction, inspect the deed and subsequent instruments, and connect the entity to the venue with documentary evidence.
2. Search relevant occupancy/fire/code files and dated venue material to establish closure history and current-use evidence. Keep cause unknown until records support it.
3. Add two or three comparably researched former industrial/commercial venues, using the same evidence requirements. Reject active landmarks as filler.
4. Generalize the bounded county adapter and add a source-permission-aware review queue. Choose automation per source; do not assume every registry has a free API.

## Contributor image update · November 13, 2026 · initial assessment

This initial assessment records what the screenshots alone established. The subsequent county-photo and OSM comparison below strengthens the building and road findings.

The contributor provided `EvidenceOne.png`, `Evidence2.png`, and `Screenshot 2026-11-13 114030.png` and explicitly requested public viewing on the website. These three originals are copied byte-for-byte to `public/evidence/stockyard-airsoft/`, displayed without cropping, and linked to their own claims and sources. This is a bounded, manually submitted evidence set, not a Google imagery ingestion pipeline. Google attribution remains visible in the originals and in captions; the files are not represented as openly licensed map data.

- **Building identification:** The contributor, who recalls playing at the venue, circles the large western building north/northeast of WEOKIE and west of the Google pin. The annotation also surrounds smaller structures. This narrows the research target; it does not independently georeference the building or resolve its county account. The map pin remains the existing parcel-area reference.
- **Reported missing road:** A red outline marks a north–south corridor from SW 15th beside WEOKIE, toward the western building. The contributor reports a road missing from the displayed Google map. Public/private classification, current condition, mapping completeness/scale, and any closure or removal remain unresolved. No route or public-access permission is inferred.
- **Street View context:** The original screenshot's place panel says 2701 while its panorama card says 2801 SW 15th St and October 2026. October is the imagery label, not the screenshot date. The screenshot was supplied November 13. The panorama has not been confirmed as a view of the circled building.

The viewer supports fit/actual-size inspection, keyboard navigation, original-image links, PNG downloads, and mobile scrolling. Dossier exports include image URLs, captions, attribution, and integrity hashes. The original MapQuest screenshot remains a text-only source from the earlier review.

No competitor allegation is published. There is no verified source supporting a cause of closure in this dossier.

## Building and road comparison · November 13, 2026

The official [county photograph](https://docs.oklahomacounty.org/AssessorWP5/ShowImageDB.asp?Propertyid=43457), visibly stamped **March 18, 2025**, provides a substantially clearer view of the brick building. The glass-block bay, upper window band, masonry facade and returning wing match the submitted Street View view. The [county sketch](https://docs.oklahomacounty.org/AssessorWP5/ShowSketchdb.asp?Propertyid=43457) supports the stepped western-building shape. This is a visual match to **R261068040 / PropertyID 43457**, not a surveyed building polygon or proof of the exact rooms occupied by the former airsoft field.

The [building inventory](https://docs.oklahomacounty.org/AssessorWP5/BLDG_Detail.asp?PropertyID=43457&BuildingSequence=1) lists **1963, two stories, 193,038 square feet, masonry/face brick, storage warehouse**, with the name **MID-STATES WHOLESALE LUMBER**. The account owner is **MID STATES PROPERTIES LLC**. Those names are preserved separately; their corporate relationship is not inferred. Wrapped lumber at the brick facade in the dated photograph documents lumber storage at this building. The assessor condition field says “Poor”; this is an attributed inventory field, not a structural inspection or safety verdict.

The county photograph and sketch are retained unchanged as JPG evidence. Generated pixel artwork is stored separately under `public/art/` and is never used to substantiate a claim. The dossier now leads with the matched building, listed owner and dated lumber use. Questions about old airsoft rooms, closure history, current room-by-room use and access are grouped in a collapsed section.

### Road geometry and reproducible query

Source: [bounded OSM XML snapshot](https://api.openstreetmap.org/api/0.6/map?bbox=-97.564,35.449,-97.559,35.453), retrieved November 13, 2026. Original node order is preserved in `src/research/osm-road-corridor.json`, EPSG:4326, with attribution to OpenStreetMap contributors and the ODbL link.

| Whole OSM way | Tags and source date | Interpretation |
| --- | --- | --- |
| [701894190](https://www.openstreetmap.org/way/701894190) | highway=service; v2, July 6, 2019; no access tag | SW 15th approach **and WEOKIE parking circulation**; geometry is not trimmed into an invented route |
| [779562948](https://www.openstreetmap.org/way/779562948) | highway=service; v2, August 27, 2025; no access tag | Northbound continuation |
| [1325580486](https://www.openstreetmap.org/way/1325580486) | highway=service, **access=private**; v1, October 19, 2024 | Warehouse service way along its west/north edge; private tag applies to this way only |

The service network is mapped in OSM although omitted in the contributor's Google view. Untagged ways do not prove public access. The map highlights complete source features, including the parking loop, and distinguishes the private-tagged way with dashes.

The [City of Oklahoma City Street Centerlines item](https://www.arcgis.com/home/item.html?id=0e041a931ede4d38a9d23c5301708662) exposes layer 5 at `https://utility.arcgis.com/usrsvcs/servers/0e041a931ede4d38a9d23c5301708662/rest/services/OpenData/Transportation_Streets/FeatureServer/5`. The reviewed query used envelope `-97.566,35.449,-97.558,35.455`, geometryType `esriGeometryEnvelope`, inSR/outSR `4326`, spatialRel `esriSpatialRelIntersects`, where `1=1`, outFields `*`, returnGeometry `true`, f `json`. It returned nearby SW 15th, Miller, May and Exchange segments, but not the internal northbound service corridor.

That is a bounded dataset-coverage observation. It does not explain Google's omission or establish a removed street, legal right-of-way, closure, or current physical conditions. Next research: recorded plats, dated aerials, source edit history and documentary former-tenant records.
