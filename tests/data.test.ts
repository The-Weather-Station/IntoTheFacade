import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { places, filterPlaces, getPlace, reviewed } from '../src/data.ts';
const parcels = JSON.parse(readFileSync(new URL('../src/research/stockyard-parcels.json', import.meta.url), 'utf8'));
const roads = JSON.parse(readFileSync(new URL('../src/research/osm-road-corridor.json', import.meta.url), 'utf8'));

test('published claims and findings retain valid, dated provenance', () => {
  assert.equal(new Set(places.map(p=>p.id)).size,places.length);
  for (const p of places) {
    assert.ok(p.unknowns.length);
    const ids=new Set(p.evidence.map(e=>e.id));
    assert.equal(ids.size,p.evidence.length);
    for (const e of p.evidence) {
      assert.ok(e.sources.length);
      for (const index of e.sources) {
        const source=p.sources[index];
        assert.ok(source, `${p.id}: broken source reference`);
        assert.ok(source.date && source.method);
        assert.equal(source.reviewed,reviewed);
        if(source.url) assert.equal(new URL(source.url).protocol,'https:');
        else assert.equal(source.kind,'Submitted screenshot');
      }
    }
    for (const finding of p.findings) {
      for (const id of finding.evidence) assert.ok(ids.has(id));
      if(finding.state==='documented') assert.ok(finding.evidence.length);
    }
  }
});
test('address matching preserves both county parcels and real closed polygons', () => {
  assert.equal(parcels.provenance.coordinateSystem,'EPSG:4326');
  assert.ok(!Number.isNaN(Date.parse(parcels.provenance.retrievedAt)));
  for(const p of places) {
    const matches=parcels.features.filter(f=>f.properties.placeId===p.id);
    assert.deepEqual(matches.map(f=>f.properties.account).sort(),[...p.parcelAccounts].sort());
    assert.equal(matches.length,2);
    for(const f of matches) {
      assert.equal(f.geometry.type,'Polygon');
      assert.ok(f.properties.owner);
      assert.equal(new URL(f.properties.assessorUrl).hostname,'docs.oklahomacounty.org');
      for(const ring of f.geometry.coordinates) {
        assert.ok(ring.length>=4);
        assert.deepEqual(ring[0],ring.at(-1));
        for(const [x,y] of ring) { assert.ok(x>-97.57&&x<-97.55);assert.ok(y>35.44&&y<35.46); }
      }
    }
  }
});
test('closed business and expired entity do not become a vacancy or access verdict', () => {
  const p=getPlace('stockyard-airsoft');
  const access=p.findings.find(f=>f.label==='Abandonment / access')!;
  assert.equal(access.state,'unresolved');
  assert.equal(access.value,'Not established');
  assert.equal(p.findings.find(f=>f.label==='Former venue')!.state,'lead');
  assert.ok(p.unknowns.some(s=>s.includes('Stockyard Airsoft') && s.includes('rooms')));
});
test('search combines former name, owner, parcel, category, and saved filters', () => {
  const id='stockyard-airsoft';
  assert.deepEqual(filterPlaces('  STOCKYARD  ','Former business',true,[id]).map(p=>p.id),[id]);
  assert.equal(filterPlaces('MID STATES','All',false,[]).length,1);
  assert.equal(filterPlaces('R261068040','All',false,[]).length,1);
  assert.equal(filterPlaces('stockyard','Architecture',false,[]).length,0);
  assert.equal(filterPlaces('','All',true,[]).length,0);
  assert.equal(filterPlaces('no-matching-place','All',false,[]).length,0);
});
test('retired landmark fragments resolve to the research case', () => {
  assert.equal(getPlace('gold-dome').id,'stockyard-airsoft');
  assert.equal(getPlace('invalid').id,'stockyard-airsoft');
});
test('generated art ships as separate bitmap assets, outside the evidence collection', () => {
  for (const name of ['missing-road-card','brick-building-art','worn-card-face','table-felt','occult-card-back']) {
    const bytes=readFileSync(new URL(`../public/art/${name}.webp`,import.meta.url));
    assert.equal(bytes.subarray(0,4).toString(),'RIFF');
    assert.equal(bytes.subarray(8,12).toString(),'WEBP');
    assert.ok(bytes.length<750000);
  }
  assert.ok(places.every(place=>place.images.every(image=>image.src.startsWith('evidence/'))));
});

test('submitted images retain their original bytes and valid source/claim links', () => {
  for (const place of places) {
    const images = new Map(place.images.map(image => [image.id, image]));
    assert.equal(images.size, place.images.length);
    for (const image of place.images) {
      assert.match(image.src, /^evidence\/[a-z0-9/-]+\.(png|jpg)$/);
      const bytes = readFileSync(new URL(`../public/${image.src}`, import.meta.url));
      if(image.src.endsWith('.png')) {
        assert.equal(bytes.subarray(0, 8).toString('hex'), '89504e470d0a1a0a');
        assert.equal(bytes.readUInt32BE(16), image.width);
        assert.equal(bytes.readUInt32BE(20), image.height);
      } else {
        assert.equal(bytes.subarray(0,2).toString('hex'),'ffd8');
        assert.ok(image.width>0 && image.height>0);
      }
      assert.equal(createHash('sha256').update(bytes).digest('hex'), image.sha256);
      assert.ok(['Submitted screenshot','Official record'].includes(place.sources[image.source].kind));
      assert.ok(image.alt && image.caption && image.attribution && image.originalFilename);
      assert.ok(!Number.isNaN(Date.parse(image.submitted)));
      assert.ok(place.evidence.some(claim => claim.images?.includes(image.id)));
    }
    for (const claim of place.evidence) for (const id of claim.images ?? []) {
      assert.ok(images.has(id), `Missing image ${id}`);
      assert.ok(claim.sources.includes(images.get(id)!.source), `Image/source mismatch for ${id}`);
    }
  }
});

test('new records strengthen the building match without inventing tenancy or access', () => {
  const place = getPlace('stockyard-airsoft');
  assert.equal(place.findings.find(f => f.label === 'Building match')!.state, 'documented');
  assert.equal(place.findings.find(f => f.label === 'Documented use')!.state, 'documented');
  assert.ok(place.evidence.find(e=>e.id==='building-photo-match')!.images!.includes('county-building-photo'));
  assert.ok(place.evidence.find(e => e.id === 'street-view-context')!.detail.includes('2701'));
  assert.ok(place.evidence.find(e => e.id === 'street-view-context')!.detail.includes('2801'));
  assert.ok(place.locationNote.includes('surveyed building footprint has not been added'));
  assert.ok(place.unknowns.some(text => text.includes('untagged ways do not imply public access')));
});

test('road overlay preserves original OSM ways and limits the private tag to its source segment', () => {
  assert.equal(roads.provenance.coordinateSystem,'EPSG:4326');
  assert.deepEqual(roads.features.map(f=>f.properties.wayId).sort(),['1325580486','701894190','779562948']);
  assert.deepEqual(roads.features.filter(f=>f.properties.access==='private').map(f=>f.properties.wayId),['1325580486']);
  for(const feature of roads.features) {
    assert.equal(feature.geometry.type,'LineString');
    assert.equal(feature.properties.placeId,'stockyard-airsoft');
    assert.equal(feature.properties.highway,'service');
    assert.ok(!Number.isNaN(Date.parse(feature.properties.editedAt)));
    assert.ok(feature.geometry.coordinates.length>=2);
    for(const [x,y] of feature.geometry.coordinates){assert.ok(x>-97.57&&x<-97.55);assert.ok(y>35.44&&y<35.46);}
  }
});
