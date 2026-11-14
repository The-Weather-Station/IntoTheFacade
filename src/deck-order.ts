// One source of truth for visible tabs, ordered cycling and physical card counts.
export const deckViews = (placeId: string) => placeId === 'rhode-island-warehouse'
  ? ['overview', 'alert', 'evidence', 'notes']
  : ['overview', 'evidence', 'notes'];

export function nextDeckView(placeId: string, current: string, direction: number) {
  const views = deckViews(placeId);
  return views[(views.indexOf(current) + direction + views.length) % views.length];
}
