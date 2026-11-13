// Decorative place accents only: these colors do not encode access, ownership,
// historical status, or a game property value.
export const mapInk = '#302535';
export const placeColors: Record<string, string> = {
  'union-station': '#be594b',
  'santa-fe-depot': '#648f91',
  'gold-dome': '#d8b653',
};

export function placeColor(id: string) { return placeColors[id] ?? '#e99746'; }
