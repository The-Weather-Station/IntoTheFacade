// Decorative place accents only: these colors do not encode access, ownership,
// historical status, or a game property value.
export const mapInk = '#302535';
export const placeColors: Record<string, string> = {
  'stockyard-airsoft': '#d28a59',
};

export function placeColor(id: string) { return placeColors[id] ?? '#e99746'; }
