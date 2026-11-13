# Public-record research pipeline

## Product correction · November 13, 2026

Into The Facade investigates overlooked properties for people interested in urban exploration. Historical significance alone is not a useful candidate criterion. The landmark demo deck has been replaced by one real investigation: the former Stockyard Airsoft address, 2801 SW 15th Street, Oklahoma City.

The product must keep **former business, legal entity, parcel, building, present occupancy, physical condition, and access** separate. A closed directory entry, expired LLC, missing permit, or deteriorated appearance cannot independently establish abandonment. Public findings are attributed claims, with dates and unresolved matches, rather than an unexplained confidence score.

## What runs today

- A manually reviewed dossier with eight evidence entries; source type, observation date, source date, collection method, and limitations travel with every claim.
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

1. Resolve the exact former venue building and parcel, reconcile 2701/2801 and jurisdiction, inspect the deed and subsequent instruments, and connect the entity to the venue with documentary evidence.
2. Search relevant occupancy/fire/code files and dated venue material to establish closure history and current-use evidence. Keep cause unknown until records support it.
3. Add two or three comparably researched former industrial/commercial venues, using the same evidence requirements. Reject active landmarks as filler.
4. Generalize the bounded county adapter and add a source-permission-aware review queue. Choose automation per source; do not assume every registry has a free API.

No competitor allegation is published. There is no verified source supporting a cause of closure in this dossier.
