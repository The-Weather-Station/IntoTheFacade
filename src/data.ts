export type Category = 'Former business';
export type SourceKind = 'Official record' | 'Business website' | 'Directory lead' | 'Submitted screenshot';
export interface Evidence { id: string; title: string; detail: string; sources: number[] }
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
  parcelAccounts: string[]; locationNote: string;
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
  summary: 'A former airsoft venue at an industrial address near Stockyards City. Its closed-business listing starts the investigation; the building’s present use is still unresolved.',
  interest: 'Trace the former business to the land beneath it. Two parcels share this address, and the county lists a lumber business as occupant. Which building housed the field, and what is it used for today?',
  tags: ['Industrial site', 'Former airsoft venue', 'Parcel match pending'],
  parcelAccounts: ['R261068000', 'R261068040'],
  locationNote: 'The marker is the center of two address-matched parcels. County parcel boundaries are reference geometry, not a survey, building footprint, or entrance location.',
  findings: [
    { label: 'Former venue', value: 'Reported closed', state: 'lead', detail: 'MapQuest label in a submitted screenshot; closure date and cause unverified.', evidence: ['closure-lead'] },
    { label: 'Property owner', value: 'MID STATES PROPERTIES LLC', state: 'documented', detail: 'Listed by the assessor for both address-matched parcels. Deed review pending.', evidence: ['parcel-owner'] },
    { label: 'Current use', value: 'Occupancy clues need resolving', state: 'unresolved', detail: 'County lists Mid-States Wholesale Lumber; the former airsoft space has not been matched.', evidence: ['occupant', 'nearby-business'] },
    { label: 'Business entity', value: 'Name match: Expired', state: 'documented', detail: 'STOCKYARD AIRSOFT, LLC · filing 3512374032. Venue/operator link still needs documentation.', evidence: ['entity'] },
    { label: 'Building match', value: 'Two candidate parcels', state: 'unresolved', detail: 'Shared address; exact former venue footprint remains unverified.', evidence: ['parcel-owner', 'address-alias'] },
    { label: 'Abandonment / access', value: 'Not established', state: 'unresolved', detail: 'No verified vacancy, condition assessment, or public-access permission in this dossier.', evidence: [] },
  ],
  evidence: [
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
  ],
  unknowns: [
    'Current use, condition, vacancy, and access to the former airsoft space remain unverified.',
    'The exact building and parcel occupied by the airsoft venue have not been established.',
    'The assessor owner is a lead for deed verification; the recorded deed and subsequent instruments still need review.',
    'The reason and date of the venue’s closure are unknown. No closure order or inspection finding has been verified.',
    'The LLC name match needs a filing, lease, or other record connecting it to this venue.',
    'The assessor labels the accounts UNINCORPORATED, while city permit results exist at the address. Confirm jurisdiction and address aliases before a complete records search.',
  ],
  nextSteps: [
    { title: 'Match the former field', detail: 'Compare dated venue images or a lease with the two parcel maps and building records.', label: 'Open county map', url: parcelMapUrl },
    { title: 'Verify the property transfer', detail: 'Review book 12303, page 874, then check later deeds against the legal description.', label: 'Open deed reference', url: deedUrl },
    { title: 'Establish the closure history', detail: 'Check occupancy, fire, and code records using the business name and both street-number aliases.', label: 'Open city records', url: cityPortalUrl },
  ],
}];
export function filterPlaces(query: string, category: string, savedOnly: boolean, saved: string[]): Place[] {
  const term = query.toLocaleLowerCase().trim();
  return places.filter(p => (!savedOnly || saved.includes(p.id)) && (category === 'All' || p.category === category) && (!term || [p.name, p.address, p.category, ...p.tags, ...p.parcelAccounts, ...p.findings.map(f=>f.value)].join(' ').toLocaleLowerCase().includes(term)));
}
export function getPlace(id: string | null): Place { return places.find(p => p.id === id) ?? places[0]; }
