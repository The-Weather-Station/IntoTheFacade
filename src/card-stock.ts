import { artUrl } from './generated-art';

export const cardStockName = (caseId: string) => caseId === 'rhode-island-warehouse' ? 'crime-card-face' : 'worn-card-face';
// Retain the image objects as well as their decode promises for the lifetime of
// the page. CSS backgrounds and animation clones reuse the same cached URLs.
const stocks = new Map<string, { image: HTMLImageElement; ready: Promise<boolean> }>();

function prepare(name: string) {
  let stock = stocks.get(name);
  if (!stock) {
    const image = new Image();
    image.decoding = 'async'; image.fetchPriority = 'high';
    image.src = artUrl(name);
    stock = { image, ready: image.decode().then(() => true, () => false) };
    stocks.set(name, stock);
  }
  return stock.ready;
}

export function preloadCardStock() {
  void prepare('worn-card-face');
  void prepare('crime-card-face');
}

export function cardStockReady(caseId: string): Promise<boolean> {
  const ready = prepare(cardStockName(caseId));
  // Only the deal waits. A broken image must not lock the map or dossier.
  return new Promise(resolve => {
    const timeout = setTimeout(() => resolve(false), 6000);
    void ready.then(loaded => { clearTimeout(timeout); resolve(loaded); });
  });
}
