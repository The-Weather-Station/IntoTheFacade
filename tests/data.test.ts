import test from 'node:test';
import assert from 'node:assert/strict';
import { places, filterPlaces, getPlace } from '../src/data.ts';
import { architecture } from '../src/art.ts';

test('each published claim has a real source reference and each place has explicit unknowns', () => {
  assert.equal(new Set(places.map(p => p.id)).size, places.length);
  for (const place of places) {
    assert.ok(place.unknowns.length > 0);
    assert.ok(place.coordinates[0] > -97.56 && place.coordinates[0] < -97.48);
    assert.ok(place.coordinates[1] > 35.43 && place.coordinates[1] < 35.52);
    for (const claim of place.evidence) {
      assert.ok(place.sources[claim.source], `${place.id}: broken claim source`);
      assert.equal(new URL(place.sources[claim.source].url).protocol, 'https:');
      assert.ok(place.sources[claim.source].date);
    }
  }
});
test('search combines with category and saved filters', () => {
  assert.deepEqual(filterPlaces('  GOLD  ', 'Architecture', true, ['gold-dome']).map(p=>p.id), ['gold-dome']);
  assert.equal(filterPlaces('gold', 'Rail heritage', false, []).length, 0);
  assert.equal(filterPlaces('', 'All', true, []).length, 0);
  assert.equal(filterPlaces('not-a-real-place', 'All', false, []).length, 0);
  assert.equal(filterPlaces('depot', 'All', false, []).length, 2);
});
test('unknown shared-location IDs use a known fallback', () => {
  assert.equal(getPlace('santa-fe-depot').id, 'santa-fe-depot');
  assert.equal(getPlace('invalid').id, 'union-station');
});
test('repeated architectural illustrations have unique SVG reference IDs', () => {
  const html = architecture('union-station') + architecture('union-station');
  const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(match=>match[1]);
  assert.equal(new Set(ids).size, ids.length);
});
