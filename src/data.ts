export type Category = 'Former business';
export type SourceKind = 'Official record' | 'Business website' | 'Directory lead' | 'Submitted screenshot';
export interface Evidence { id: string; title: string; detail: string; sources: number[]; images?: string[] }
export interface EvidenceImage {
  id: string; src: string; title: string; alt: string; caption: string;
  originalFilename: string; width: number; height: number; sha256: string;
  source: number; submitted: string; attribution: string;
}
export interface Source {
  title: string; publisher: string; date: string; reviewed: string; url?: string;
  kind: SourceKind; method: string;
}
export interface Finding {
  label: string; value: string; detail: string; evidence: string[];
  state: 'documented' | 'lead' | 'unresolved';
}
export interface ResearchStep { title: string; detail: string; url: string; label: string }
export interface Place {
  id: string; number: string; name: string; subtitle: string; category: Category;
  year: string; coordinates: [number, number]; address: string; summary: string;
  interest: string; tags: string[]; evidence: Evidence[]; sources: Source[];
  unknowns: string[]; findings: Finding[]; nextSteps: ResearchStep[];
  parcelAccounts: string[]; locationNote: string; images: EvidenceImage[];
}
export const reviewed = '2026-11-13';
export const registryUrl = 'https://business.sos.ok.gov/corp/corpInquiryFind.aspx';
export const parcelMapUrl = 'https://experience.arcgis.com/experience/10a159706dc74c38a555d813f369cde7/';
export const cityPortalUrl = 'https://aca-prod.accela.com/OKC/Default.aspx';
export const deedUrl = 'https://getrecords.oklahomacounty.org/web/web/integration/search?field_BookPageID_DOT_Volume=12303&field_BookPageID_DOT_Page=874';

export const places: Place[] = [{
  id: 'stockyard-airsoft', number: '01', name: 'Stockyard Airsoft',
  subtitle: 'A former field. An unfinished paper trail.', category: 'Former business', year: 'OPEN CASE',
  // Combined county parcel bounds center; not a verified building or entrance pin.
  coordinates: [-97.56117721784465, 35.4512621621602],
  address: '2801 SW 15th St · Oklahoma City, OK 73108',
  summary: 'A former airsoft venue near Stockyards City. A contributor who played there identifies the western building in an annotated map. Its parcel match and present use still need verification.',
  interest: 'Follow the contributor’s building identification: reconcile the 2701/2801 labels, match the western building to county records, and check the road they report missing from the map.',
  tags: ['Industrial site', 'Former airsoft venue', 'Parcel match pending'],
  parcelAccounts: ['R261068000', 'R261068040'],
  locationNote: 'The marker remains the center of two address-matched parcels. The contributor identifies the western building in an attached screenshot; the annotation has not been georeferenced to a verified building footprint or parcel. County boundaries are reference geometry, not a survey or entrance location.',
  findings: [
    { label: 'Former venue', value: 'Reported closed', state: 'lead', detail: 'MapQuest label in a submitted screenshot; closure date and cause unverified.', evidence: ['closure-lead'] },
    { label: 'Property owner', value: 'MID STATES PROPERTIES LLC', state: 'documented', detail: 'Listed by the assessor for both address-matched parcels. Deed review pending.', evidence: ['parcel-owner'] },
    { label: 'Current use', value: 'Occupancy clues need resolving', state: 'unresolved', detail: 'County lists Mid-States Wholesale Lumber; the former airsoft space has not been matched.', evidence: ['occupant', 'nearby-business'] },
    { label: 'Business entity', value: 'Name match: Expired', state: 'documented', detail: 'STOCKYARD AIRSOFT, LLC · filing 3512374032. Venue/operator link still needs documentation.', evidence: ['entity'] },
    { label: 'Building match', value: 'Contributor identifies western building', state: 'lead', detail: 'The red circle marks the building of interest west of the Google pin. Match to county building and parcel records is pending.', evidence: ['building-identification', 'parcel-owner', 'address-alias'] },
    { label: 'Mapping discrepancy', value: 'Road reported missing from map', state: 'lead', detail: 'The contributor marks a corridor north from SW 15th St, beside WEOKIE. Road classification, current condition, and why it is absent from this map view are unresolved.', evidence: ['road-omission'] },
    { label: 'Abandonment / access', value: 'Not established', state: 'unresolved', detail: 'No verified vacancy, condition assessment, or public-access permission in this dossier.', evidence: [] },
  ],
  evidence: [
    { id: 'building-identification', title: 'The contributor identifies the western building', detail: 'A contributor who recalls playing at Stockyard Airsoft circles the large western building, north/northeast of WEOKIE Federal Credit Union and west of the Google location pin. The circle also encloses nearby smaller structures. This records the contributor’s identification; it is not an independently verified building-to-parcel match.', sources: [7], images: ['building-annotation'] },
    { id: 'road-omission', title: 'A road is reported missing from the displayed map', detail: 'The contributor marks a north–south corridor from SW 15th St along the east side of WEOKIE, toward the western building, and reports that a road is missing from Google Maps. The screenshot records an apparent mapping discrepancy. It does not establish whether the corridor is a public street, a private drive, closed, removed, or simply omitted at this map scale.', sources: [8], images: ['road-annotation'] },
    { id: 'street-view-context', title: 'Street View adds context and conflicting address labels', detail: 'The unannotated screenshot displays 2701 SW 15th St in the place panel while the Street View card says 2801 SW 15th St and October 2026. It shows a paved approach and a red-brick industrial building. The image does not by itself establish that the building in the panorama is the circled western building, or settle the address mismatch.', sources: [9], images: ['street-view-context'] },
    { id: 'closure-lead', title: 'A closed-business lead', detail: 'A submitted MapQuest screenshot labels Stockyard Airsoft “Permanently closed” at 2801 SW 15th St. The underlying listing was not independently retrieved; the label does not establish building vacancy.', sources: [0] },
    { id: 'address', title: 'A second directory matches the address', detail: 'Manta lists Stockyard Airsoft at 2801 SW 15th Street, Oklahoma City, OK 73108. The page is unclaimed and gives no opening date. It corroborates the business/address association, not present operations.', sources: [1] },
    { id: 'parcel-owner', title: 'One address, two county accounts', detail: 'Assessor accounts R261068000 (10.6306 acres) and R261068040 (12.1284 acres) both use 2801 SW 15th St and list MID STATES PROPERTIES LLC as owner. The former venue has not been matched to an individual building.', sources: [2, 3] },
    { id: 'occupant', title: 'The county names a different occupant', detail: 'Both assessor pages name MID-STATES WHOLESALE LUMBER in the building/occupant field. This is an occupancy clue with an unknown update date, not confirmation of how every building is used today.', sources: [2, 3] },
    { id: 'deed-index', title: 'A 2013 transfer appears in the assessor index', detail: 'Both accounts show a July 12, 2013 multi-parcel transfer from STOCKYARDS CITY COMMERCIAL PARK LLC to MID STATES PROPERTIES LLC, book 12303, page 874. The underlying deed and any later instruments have not been reviewed.', sources: [2, 3] },
    { id: 'entity', title: 'An LLC name match in the state registry', detail: 'The Secretary of State search returns STOCKYARD AIRSOFT, LLC, filing 3512374032, as a domestic limited liability company with status “Expired.” This is a name match; it does not establish the closure date, cause, landlord, or current building condition.', sources: [4] },
    { id: 'nearby-business', title: 'A business website provides another use clue', detail: 'Snavely Forest Products lists its Mid-States Wholesale Lumber location at 2701 SW 15th St. That is also the billing address on the two assessor accounts. It does not identify the former airsoft space.', sources: [5, 2, 3] },
    { id: 'address-alias', title: 'A city record flags an address discrepancy', detail: 'OKC impact-fee record IMPA-2015-02345 uses 2801 SW 15th St and describes the county address as 2701 SW 15th. Its “Closed” status describes the impact-fee record, not a business shutdown. No closure order is established by this record.', sources: [6] },
  ],
  sources: [
    { title: 'Stockyard Airsoft listing screenshot', publisher: 'MapQuest · submitted image', kind: 'Submitted screenshot', date: 'Screenshot supplied November 13, 2026; listing update unknown', reviewed, method: 'Reviewed the user-supplied image. No verified listing permalink; image is not republished.' },
    { title: 'Stockyard Airsoft business listing', publisher: 'Manta', kind: 'Directory lead', date: 'Listing update date not provided', reviewed, url: 'https://www.manta.com/c/m18169t/stockyard-airsoft', method: 'Read the public, unclaimed directory listing.' },
    { title: 'Real account R261068000', publisher: 'Oklahoma County Assessor', kind: 'Official record', date: 'Account page generated November 13, 2026; field update dates unspecified', reviewed, url: 'https://docs.oklahomacounty.org/AssessorWP5/AN-R.asp?PropertyID=43455', method: 'Read the live account page and its assessor-maintained transaction index.' },
    { title: 'Real account R261068040', publisher: 'Oklahoma County Assessor', kind: 'Official record', date: 'Account page generated November 13, 2026; field update dates unspecified', reviewed, url: 'https://docs.oklahomacounty.org/AssessorWP5/AN-R.asp?PropertyID=43457', method: 'Read the live account page and its assessor-maintained transaction index.' },
    { title: 'Entity search · STOCKYARD AIRSOFT · filing 3512374032', publisher: 'Oklahoma Secretary of State', kind: 'Official record', date: 'Search observed November 13, 2026; status-change date not retrieved', reviewed, url: registryUrl, method: 'Searched “Stockyard Airsoft”; read the matching result row. Detail page requested contact information, so detailed filings were not retrieved.' },
    { title: 'Oklahoma City branch contact listing', publisher: 'Snavely Forest Products', kind: 'Business website', date: 'Contact page; individual branch update date unspecified', reviewed, url: 'https://snavelyforestproducts.com/contact-us/', method: 'Read the business’s own public location listing.' },
    { title: 'IMPA-2015-02345 · Impact Fee', publisher: 'City of Oklahoma City', kind: 'Official record', date: 'Record date July 22, 2015; reviewed November 13, 2026', reviewed, url: 'https://aca-prod.accela.com/OKC/Cap/CapDetail.aspx?Module=Permits&TabName=Permits&capID1=15IMP&capID2=00000&capID3=02345&agencyCode=OKC&IsToShowInspection=', method: 'Searched Permits for 2801 SW 15 ST, January 1, 1983–November 13, 2026; opened this result. This was not a comprehensive fire/code-enforcement search.' },
    { title: 'EvidenceOne.png · building annotation', publisher: 'Google Maps / Street View · contributor annotations', kind: 'Submitted screenshot', date: 'Submitted November 13, 2026; Street View card labels imagery October 2026', reviewed, method: 'Reviewed the supplied screenshot and the contributor’s building identification. The original red annotation, Google attribution, and differing address labels are preserved. No live panorama permalink or independent footprint match was supplied.' },
    { title: 'Evidence2.png · road annotation', publisher: 'Google Maps · contributor annotations', kind: 'Submitted screenshot', date: 'Screenshot November 13, 2026; map feature update date unknown', reviewed, method: 'Reviewed the supplied annotated map. The red corridor and handwritten question are the contributor’s observations, not Google or city findings. No public-road inventory, plat, or current ground verification has been checked.' },
    { title: 'Street View context screenshot', publisher: 'Google Maps / Street View · submitted image', kind: 'Submitted screenshot', date: 'Screenshot November 13, 2026; Street View card labels imagery October 2026', reviewed, method: 'Read visible labels and imagery in the original screenshot. Screenshot date and imagery date are separate. The 2701/2801 labels and image attribution are preserved; the panorama’s building identity is not independently established.' },
  ],
  images: [
    { id: 'building-annotation', src: 'evidence/stockyard-airsoft/building-annotation.png', title: 'Building identified by contributor', alt: 'Annotated Google Maps screenshot with a red circle around the western building and smaller structures, north/northeast of WEOKIE Federal Credit Union. The Google pin sits east of the circle.', caption: 'The contributor identifies the large western building as the place of interest. The red circle is their annotation; the official parcel and building match remain pending.', originalFilename: 'EvidenceOne.png', width: 1897, height: 875, sha256: '312521b6a54545ee52e776ffae46cdc3046815d608cbbebdae9d2d3fd5006eb8', source: 7, submitted: reviewed, attribution: 'Map and Street View imagery © Google. Red annotations supplied by the contributor. Original screenshot preserved.' },
    { id: 'road-annotation', src: 'evidence/stockyard-airsoft/road-annotation.png', title: 'Reported missing road', alt: 'Annotated Google Maps screenshot with a red outline running north from SW 15th St beside WEOKIE and an arrow reading “why is the road missing?”', caption: 'The contributor reports a road missing from this map view. The marked corridor is an observation to investigate, not a verified street boundary or access route.', originalFilename: 'Evidence2.png', width: 1911, height: 927, sha256: 'cbe460c105b16870812610b04f699140990bd72d673d70ffa4d8e62f5662adf1', source: 8, submitted: reviewed, attribution: 'Map imagery © Google. Red annotations supplied by the contributor. Original screenshot preserved.' },
    { id: 'street-view-context', src: 'evidence/stockyard-airsoft/street-view-context.png', title: 'Street View and address context', alt: 'Google Street View screenshot showing an industrial building and paved approach, with 2701 SW 15th St in the place panel and 2801 SW 15th St on the panorama card dated October 2026.', caption: 'The place panel says 2701; the Street View card says 2801 and October 2026. Which building the panorama shows still needs to be matched to the circled target.', originalFilename: 'Screenshot 2026-11-13 114030.png', width: 1906, height: 918, sha256: '41e3355fc146f463d19ca91653a521536e84a5adccb2027b16dddbdd90b95340', source: 9, submitted: reviewed, attribution: 'Map and Street View imagery © Google. Original, unannotated screenshot supplied by the contributor.' },
  ],
  unknowns: [
    'Current use, condition, vacancy, and access to the former airsoft space remain unverified.',
    'The contributor identifies the western building, but the exact building footprint and parcel occupied by the airsoft venue have not been independently established.',
    'The marked road corridor’s status, public/private classification, current condition, and reason for omission from the displayed Google map remain unknown.',
    'The screenshots show conflicting 2701/2801 labels. The Street View panorama has not been matched conclusively to the circled building.',
    'The assessor owner is a lead for deed verification; the recorded deed and subsequent instruments still need review.',
    'The reason and date of the venue’s closure are unknown. No closure order or inspection finding has been verified.',
    'The LLC name match needs a filing, lease, or other record connecting it to this venue.',
    'The assessor labels the accounts UNINCORPORATED, while city permit results exist at the address. Confirm jurisdiction and address aliases before a complete records search.',
  ],
  nextSteps: [
    { title: 'Match the identified western building', detail: 'Compare the contributor’s circled building with county building records, dated venue images, and a lease; reconcile the 2701/2801 labels.', label: 'Open county map', url: parcelMapUrl },
    { title: 'Check the marked road corridor', detail: 'Compare dated aerial imagery, recorded plats, and city street/right-of-way records to identify the corridor and explain the mapping discrepancy.', label: 'Open city records', url: cityPortalUrl },
    { title: 'Verify the property transfer', detail: 'Review book 12303, page 874, then check later deeds against the legal description.', label: 'Open deed reference', url: deedUrl },
    { title: 'Establish the closure history', detail: 'Check occupancy, fire, and code records using the business name and both street-number aliases.', label: 'Open city records', url: cityPortalUrl },
  ],
}];
export function filterPlaces(query: string, category: string, savedOnly: boolean, saved: string[]): Place[] {
  const term = query.toLocaleLowerCase().trim();
  return places.filter(p => (!savedOnly || saved.includes(p.id)) && (category === 'All' || p.category === category) && (!term || [p.name, p.address, p.category, ...p.tags, ...p.parcelAccounts, ...p.findings.map(f=>f.value)].join(' ').toLocaleLowerCase().includes(term)));
}
export function getPlace(id: string | null): Place { return places.find(p => p.id === id) ?? places[0]; }
