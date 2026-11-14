# Into The Facade roadmap

Updated November 14, 2026. This is the current implementation roadmap. The parent-folder roadmap preserves the original November 11 planning analysis. Future sections describe proposed work, not available features or promised delivery dates.

## Working now

Urban exploration supported by open-source intelligence: a public, account-free prototype at https://intothefacade.com/ with three researched industrial properties in Oklahoma County. The cases are Stockyard Airsoft, the Rhode Island Avenue warehouse, and former Eagle Industries. A closed business is a lead, not an access grant or a vacancy verdict.

- Three illustrated case stacks, sequential card navigation, smooth dealing and tilt, a centered active deck, search and category filters.
- Overview / Recon Summary, Evidence and read-only explorer Field notes; an additional Alert card for the documented warehouse case. Dossier export includes sources.
- 41 evidence entries with source links and review dates; seven original evidence images with viewer, attribution and publisher links where supplied. Generated card art is separate from original evidence.
- Geographic context, real county parcel boundaries, and a source-tagged OpenStreetMap service-road discrepancy. The styled map tilts and rotates; a 2D renderer provides a fallback. This is not a surveyed 3D reconstruction.
- Sourced ownership, permission contacts, documented hazards, and dated activity/security evidence. No invented guards, dogs, patrol patterns or unrestricted access claims.
- Mobile case browsing, a separate hazard strip, and explicit Pan map / Rotate / tilt controls. Intro guidance appears on a fresh visit.
- Lazy background music, pause/volume controls, a welcome sound notice and an independent case alarm. Audio does not block the app or map.
- Manually reviewed records and local GeoJSON snapshots. A bounded county-parcel fetcher stages candidate data for review; no general discovery engine, scheduled refresh or runtime AI is active.

## Next

### 1. Strengthen the evidence and update workflow

Extend the bounded parcel workflow to the other cases. Stage new records without replacing the published dataset. Preserve publisher URLs, source dates, review dates, record IDs and claim-level limits. Add a review queue for changed ownership, occupancy, source failures and conflicting records.

Acceptance: a reviewed update can be published and traced to its source; a failed fetch leaves the last good dataset available. Recheck current visitor arrangements and permission contacts before expanding field guidance. Do not turn missing information into a favorable access or safety rating.

### 2. Test the core Urbex research task

Observe 3-5 intended users opening a case, locating its source and identifying a hazard or access limitation. Refine mobile touch behavior, keyboard navigation, readable text over art and motion preferences. Expand toward 10-20 reviewed places in the same region only after the evidence workflow is repeatable.

Acceptance: users can explain what a source supports and what it does not; record task completion, misleading interpretations and review time per location.

### 3. Saved places and collections - currently disabled

Restore Saved only after clear add/remove controls, keyboard feedback and collections organized around researched sites and permission status are ready. Support export/import, explain browser-only persistence and revalidate saved records when source dates or property use change.

Existing `itf:saved` browser data is untouched for a possible migration. Account synchronization is a separate later feature, requiring authentication and storage.

### 4. Personal notes and explorer submissions - currently disabled

The current Field notes card is read-only. Stockyard contains an account attributed to **Anonymous explorer**, separated from documentary findings; the other sites have no fabricated accounts. The old textarea and Save note action are disabled, and existing `itf:note:*` data is untouched.

Add dated observations, evidence attachments, attribution/privacy choices, corrections and review before publication. Personal drafts and public submissions need distinct controls and storage rules.

Acceptance: a submission can be reviewed, corrected and attributed without presenting recollection as a verified fact.

## Later

### Tokenized AI location discovery

Proposed model: metered AI token/credit usage for candidate discovery and evidence synthesis. Show an estimated research cost before a run, cap usage and retain citations, source dates and retrieval failures. Candidate matches enter human review before publication; AI output alone cannot establish abandonment, access or safety.

Gate: measure candidate usefulness, false positives and cost per reviewed location on the existing cases before offering paid searches. Credit pricing and packaging remain business decisions, not implemented promises.

### Paid accounts

Explore a paid tier for cross-device collections, richer research tools and AI discovery credits. Define useful free and paid boundaries, authentication, account recovery, secure billing, usage limits and cancellation before launch. Validate willingness to pay and ongoing data/review costs before setting prices.

Gate: a tested account and billing flow, clear entitlements and a sustainable service cost. The midterm remains public with no login or payment requirement.

### Merch store

Develop a separate shop for original Into The Facade artwork and merchandise. Begin with a small product range, supplier quotes, fulfillment and returns, a checkout provider, and confirmation of commercial rights for every product design.

Gate: validate product demand and unit costs before purchasing inventory or enabling checkout. No store or payment flow exists in the current prototype.

### Drone surveillance support

Support authorized, site-focused drone reconnaissance: plan an approved survey, attach dated/geotagged aerial photographs or video, and compare observations with parcel and building records. Record the operator, permission scope, capture time and visibility limits. Avoid identifying or tracking individuals.

Gate: establish a pilot workflow, site permissions, applicable flight/airspace checks and a media-review process. This is a planned evidence-capture tool, not live drone control or autonomous surveillance.

### Other retained extensions

- A second region and additional source adapters, with deduplication, source-specific reuse permissions and review dates.
- Saved dossiers that reopen offline, followed by map caching only where provider terms permit it; make offline limits and record freshness visible.
- A separate Survival lens and mode switch only after relevant terrain/hazard evidence and user needs are established.
- Richer building geometry and 3D presentation, distinguishing measured geometry from illustrative art.
- Owner/occupant corrections, periodic source rechecks and tools to manage growing review work.
- Dedicated media hosting if traffic grows; additional tracks and an audio settings panel if users need them.

## Release order

First improve evidence quality and repeatable updates; then validate the research experience and restore saved research/submissions. AI discovery, paid accounts, merchandise and drone support follow their validation gates. Dates and prices are intentionally uncommitted.
