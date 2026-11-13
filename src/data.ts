export type Category = 'Rail heritage' | 'Architecture';
export interface Evidence { title: string; detail: string; source: number }
export interface Source { title: string; publisher: string; date: string; url: string }
export interface Place {
  id: string; number: string; name: string; subtitle: string; category: Category;
  year: string; coordinates: [number, number]; address: string; summary: string;
  interest: string; tags: string[]; evidence: Evidence[]; sources: Source[];
  unknowns: string[]; footprint: [number, number]; height: number;
}
export const reviewed = '2026-11-11';
export const places: Place[] = [
  {
    id: 'union-station', number: '01', name: 'Union Station', subtitle: 'A city built around the railway.',
    category: 'Rail heritage', year: '1931', coordinates: [-97.51865, 35.45728],
    address: '300 SW 7th Street · Scissortail Park',
    summary: 'A former railway depot at the edge of Scissortail Park. Its long silhouette offers a starting point for investigating the city’s rail history.',
    interest: 'Follow the transition from a working rail terminal to a landmark within a changing urban landscape.',
    tags: ['Railway depot', 'Historic fabric', 'Urban change'],
    evidence: [
      { title: 'Opened in 1931', detail: 'Scissortail Park dates the depot’s opening to July 15, 1931.', source: 0 },
      { title: 'Passenger-era history', detail: 'The park’s historical account records railway service from 1931 through 1967.', source: 0 },
      { title: 'National Register recognition', detail: 'The same account reports a National Register listing in 1979.', source: 0 }
    ],
    sources: [{title: 'Union Station celebrates anniversary', publisher: 'Scissortail Park', date: 'July 15, 2020', url: 'https://www.scissortailpark.org/union-station-celebrates-anniversary/'}],
    unknowns: ['Current interior access and opening hours have not been checked.', 'The historical account does not establish present building condition.'],
    footprint: [0.00085, 0.00023], height: 14
  },
  {
    id: 'santa-fe-depot', number: '02', name: 'Santa Fe Depot', subtitle: 'Art Deco along the railway.',
    category: 'Rail heritage', year: '1934', coordinates: [-97.512821, 35.465341],
    address: '100 S E.K. Gaylord Boulevard · Downtown',
    summary: 'A railway landmark shaped by the Art Deco era. A documented restoration makes this an interesting study in architectural continuity.',
    interest: 'Look for the relationship between geometric ornament, original materials, and a restored transport building.',
    tags: ['Art Deco', 'Railway depot', 'Restoration'],
    evidence: [
      { title: 'Built for the Santa Fe Railway', detail: 'The City of Oklahoma City dates construction to 1934 for the Atchison, Topeka and Santa Fe Railway.', source: 0 },
      { title: 'Art Deco character', detail: 'The city describes geometric decoration, period chandeliers, and aluminum architectural elements.', source: 0 },
      { title: 'Restoration documented in 2017', detail: 'The city’s December 2017 announcement describes restoration of exterior stone, terrazzo floors, and ornamental grilles.', source: 0 }
    ],
    sources: [{title: 'Ribbon cut on restored Santa Fe Station', publisher: 'City of Oklahoma City', date: 'December 8, 2017', url: 'https://www.okc.gov/News-articles/Ribbon-cut-on-restored-Santa-Fe-Station%3B-Public-invited-to-Saturday-open-house'}],
    unknowns: ['Current service schedules and visitor hours are not included in this research edition.', 'A restoration report is not a current condition survey.'],
    footprint: [0.00025, 0.0007], height: 13
  },
  {
    id: 'gold-dome', number: '03', name: 'The Gold Dome', subtitle: 'An optimistic future, cast in gold.',
    category: 'Architecture', year: '1958', coordinates: [-97.53117, 35.49294],
    address: 'NW 23rd Street & N Classen Boulevard',
    summary: 'A geodesic former bank building with a gold-toned shell. Its unusual form opens a different chapter in Oklahoma City’s architectural history.',
    interest: 'Explore how an experimental roof structure became a recognizable piece of the city’s mid-century identity.',
    tags: ['Geodesic dome', 'Mid-century', 'Former bank'],
    evidence: [
      { title: 'Constructed in 1958', detail: 'Preservation Oklahoma’s July 2013 publication dates the former Citizens State Bank to 1958.', source: 0 },
      { title: 'Geodesic structure', detail: 'The preservation account describes a dome patterned after Buckminster Fuller’s design.', source: 0 },
      { title: 'Gold-anodized exterior', detail: 'The National Park Service discusses Citizens State Bank as an example of a gold-anodized geodesic dome.', source: 1 }
    ],
    sources: [
      {title: 'Preservation Oklahoma News · page 11', publisher: 'Oklahoma Historical Society archive', date: 'July 2013', url: 'https://gateway.okhistory.org/ark:/67531/metadc2546244/m1/11/'},
      {title: 'Mid-Century Commercial Modernism', publisher: 'National Park Service', date: 'Publication date not supplied in this record', url: 'https://www.nps.gov/articles/000/mid-century-commercial-modernism-design-and-materials.htm'}
    ],
    unknowns: ['Current use, operating hours, and interior access have not been verified.', 'Historic descriptions do not establish present ownership or condition.'],
    footprint: [0.0006, 0.0005], height: 16
  }
];
export function filterPlaces(query: string, category: string, savedOnly: boolean, saved: string[]): Place[] {
  const term = query.toLocaleLowerCase().trim();
  return places.filter(p => (!savedOnly || saved.includes(p.id)) && (category === 'All' || p.category === category) && (!term || [p.name, p.address, p.category, ...p.tags].join(' ').toLocaleLowerCase().includes(term)));
}
export function getPlace(id: string | null): Place { return places.find(p => p.id === id) ?? places[0]; }
