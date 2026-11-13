// Decorative place accents only: these colors do not encode access, ownership,
// historical status, or a game property value.
export const mapInk = '#283e38';
export const placeColors: Record<string, string> = {
  'union-station': '#e44435',
  'santa-fe-depot': '#39b8df',
  'gold-dome': '#f2cb3e',
};

export function placeColor(id: string) { return placeColors[id] ?? '#e99746'; }
