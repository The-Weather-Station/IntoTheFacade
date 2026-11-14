import test from 'node:test';
import assert from 'node:assert/strict';
import { deckViews, nextDeckView } from '../src/deck-order.ts';
import { places } from '../src/data.ts';

test('every deck cycles in both directions through each card exactly once', () => {
  for (const p of places) {
    const order=deckViews(p.id);
    for (const direction of [-1,1]) {
      let current='overview'; const visited=new Set([current]);
      for (let i=1;i<order.length;i++) { current=nextDeckView(p.id,current,direction); visited.add(current); }
      assert.equal(visited.size,order.length);
      assert.equal(nextDeckView(p.id,current,direction),'overview');
    }
  }
  assert.deepEqual(deckViews('rhode-island-warehouse'),['overview','alert','evidence','notes']);
  assert.equal(deckViews('stockyard-airsoft').length,3);
  assert.deepEqual(places.map(p=>p.id),['stockyard-airsoft','rhode-island-warehouse','eagle-industries']);
});
