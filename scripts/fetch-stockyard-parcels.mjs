// Bounded, unauthenticated public-record query. Produces a review candidate only.
import { mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
const layer = 'https://services8.arcgis.com/euhkr1dAJeQBIjV0/arcgis/rest/services/TaxParcelsPublics_view/FeatureServer/0';
const accounts = ['R261068000', 'R261068040'];
const params = new URLSearchParams({ where: `accountno IN ('${accounts.join("','")}')`, outFields: 'accountno,name1,location,acres,pin,propertyid', returnGeometry: 'true', outSR: '4326', f: 'geojson' });
const url = `${layer}/query?${params}`;
const response = await fetch(url, { signal: AbortSignal.timeout(30000) });
if (!response.ok) throw new Error(`County query failed: HTTP ${response.status}`);
const data = await response.json();
if (data.error || data.type !== 'FeatureCollection' || data.features?.length !== accounts.length) throw new Error('Unexpected county response; nothing published.');
const features = accounts.map(account => {
  const f = data.features.find(f=>f.properties.accountno===account);
  if (!f || f.geometry?.type !== 'Polygon' || !f.properties.location.startsWith('2801 SW 15TH ST')) throw new Error(`Unexpected parcel match: ${account}`);
  for (const ring of f.geometry.coordinates) {
    if (ring.length < 4 || JSON.stringify(ring[0]) !== JSON.stringify(ring.at(-1))) throw new Error('Invalid polygon ring');
    for (const [x,y] of ring) if (!Number.isFinite(x) || !Number.isFinite(y) || x < -97.57 || x > -97.55 || y < 35.44 || y > 35.46) throw new Error('Parcel outside expected research area');
  }
  return { type: 'Feature', properties: { placeId: 'stockyard-airsoft', account: f.properties.accountno, owner: f.properties.name1, address: f.properties.location, acres: f.properties.acres, pin: f.properties.pin, assessorUrl: `https://docs.oklahomacounty.org/AssessorWP5/AN-R.asp?PropertyID=${f.properties.propertyid}` }, geometry: f.geometry };
});
const candidate = { type: 'FeatureCollection', provenance: { publisher: 'Oklahoma County Assessor', layer, queryUrl: url, retrievedAt: new Date().toISOString(), coordinateSystem: 'EPSG:4326', interpretation: 'Address-matched tax parcels; exact venue/building match unresolved. Reference geometry, not a legal survey.', reuseNote: 'Public Query/Extract service. Item metadata supplies no explicit open-data license; review terms before bulk reuse.' }, features };
const directory = new URL('../research-candidates/', import.meta.url);
await mkdir(directory, { recursive: true });
await writeFile(new URL('stockyard-parcels.json', directory), `${JSON.stringify(candidate,null,2)}\n`);
console.log(`Fetched ${features.length} parcels to ${fileURLToPath(directory)}stockyard-parcels.json. Review before promoting to src/research/.`);
