import type { EvidenceImage, Place } from './data';

const escape = (text: string) => text.replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]!));
export const evidenceImageUrl = (image: EvidenceImage) => `${import.meta.env.BASE_URL}${image.src}`;

export function imageGallery(images: EvidenceImage[]) {
  if (!images.length) return '';
  return `<section class="evidence-gallery" aria-labelledby="gallery-title"><div class="gallery-heading"><h3 id="gallery-title">Submitted images</h3><span>${images.length} ORIGINALS</span></div><p>Open an image to inspect the annotations and source labels.</p><div class="evidence-thumbnails">${images.map((image, index) => `<button class="evidence-thumbnail" data-image="${escape(image.id)}" aria-label="View image: ${escape(image.title)}"><img src="${evidenceImageUrl(image)}" alt="" width="${image.width}" height="${image.height}" loading="lazy" decoding="async"><span><small>IMAGE ${String(index + 1).padStart(2, '0')}</small><strong>${escape(image.title)}</strong><span>Expand image ↗</span></span></button>`).join('')}</div></section>`;
}

export function imageAttachments(place: Place, ids: string[] = []) {
  return ids.map(id => {
    const image = place.images.find(item => item.id === id);
    return image ? `<button class="evidence-image-link" data-image="${escape(id)}">View image: ${escape(image.title)} ↗</button>` : '';
  }).join('');
}

export function exportImageEvidence(images: EvidenceImage[]) {
  return images.length ? ['','## Submitted images', ...images.map(image => `### ${image.title}\n![${image.alt}](${new URL(evidenceImageUrl(image), location.href).href})\n${image.caption}\nSubmitted: ${image.submitted}\nOriginal file: ${image.originalFilename}\n${image.attribution}\nSHA-256: ${image.sha256}`)] : [];
}

export function initEvidenceViewer(getPlace: () => Place) {
  const dialog = document.createElement('dialog');
  dialog.id = 'evidence-dialog'; dialog.className = 'image-viewer';
  dialog.setAttribute('aria-labelledby', 'image-title');
  dialog.innerHTML = `<div class="image-viewer-heading"><div><p class="eyebrow">SUBMITTED EVIDENCE</p><h2 id="image-title"></h2></div><button type="button" class="image-close" aria-label="Close image viewer">Close ×</button></div>
    <div class="image-toolbar" role="group" aria-label="Image controls"><button type="button" id="image-previous" aria-label="Previous image">← Previous</button><span id="image-counter" role="status"></span><button type="button" id="image-next" aria-label="Next image">Next →</button><button type="button" id="image-zoom" aria-pressed="false">Actual size</button><a id="image-original" target="_blank" rel="noopener noreferrer">Open original ↗</a><a id="image-download" download>Download PNG ↓</a></div>
    <div class="image-stage" tabindex="0" aria-label="Evidence image; scroll to inspect when at actual size"><img id="evidence-full-image" alt=""><p id="image-error" role="status" hidden>The image could not load. Try opening the original image.</p></div>
    <div class="image-description"><p id="image-caption"></p><p id="image-source"></p><p id="image-attribution"></p></div>`;
  document.body.append(dialog);
  const find = <T extends HTMLElement>(selector: string) => dialog.querySelector<T>(selector)!;
  const imageElement = find<HTMLImageElement>('#evidence-full-image');
  const stage = find<HTMLDivElement>('.image-stage');
  const zoomButton = find<HTMLButtonElement>('#image-zoom');
  let place: Place, index = 0, actualSize = false;

  function setZoom(actual: boolean) {
    actualSize = actual;
    dialog.dataset.zoom = actual ? 'actual' : 'fit';
    zoomButton.textContent = actual ? 'Fit image' : 'Actual size';
    zoomButton.setAttribute('aria-pressed', String(actual));
    stage.scrollTop = 0; stage.scrollLeft = 0;
  }
  function showImage(next: number) {
    index = Math.max(0, Math.min(next, place.images.length - 1));
    const image = place.images[index], source = place.sources[image.source];
    find('#image-title').textContent = image.title;
    find('#image-caption').textContent = image.caption;
    find('#image-counter').textContent = `${index + 1} / ${place.images.length}`;
    find('#image-source').textContent = `${source.publisher} · ${source.date} · Reviewed ${source.reviewed}`;
    find('#image-attribution').textContent = image.attribution;
    find<HTMLButtonElement>('#image-previous').disabled = index === 0;
    find<HTMLButtonElement>('#image-next').disabled = index === place.images.length - 1;
    find<HTMLAnchorElement>('#image-original').href = evidenceImageUrl(image);
    const download = find<HTMLAnchorElement>('#image-download');
    download.href = evidenceImageUrl(image); download.download = image.originalFilename;
    find('#image-error').hidden = true;
    imageElement.hidden = false; imageElement.alt = image.alt;
    imageElement.width = image.width; imageElement.height = image.height;
    imageElement.style.setProperty('--image-width', `${image.width}px`);
    imageElement.src = evidenceImageUrl(image);
    setZoom(false);
  }
  imageElement.addEventListener('error', () => { imageElement.hidden = true; find('#image-error').hidden = false; });
  document.querySelector('#dossier')!.addEventListener('click', event => {
    const trigger = (event.target as HTMLElement).closest<HTMLButtonElement>('[data-image]');
    if (!trigger) return;
    place = getPlace();
    const selected = place.images.findIndex(image => image.id === trigger.dataset.image);
    if (selected < 0) return;
    showImage(selected); dialog.showModal(); find<HTMLButtonElement>('.image-close').focus();
  });
  find('.image-close').addEventListener('click', () => dialog.close());
  find('#image-previous').addEventListener('click', () => showImage(index - 1));
  find('#image-next').addEventListener('click', () => showImage(index + 1));
  zoomButton.addEventListener('click', () => setZoom(!actualSize));
  dialog.addEventListener('keydown', event => {
    if (event.target === stage && actualSize) return;
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault(); showImage(index + (event.key === 'ArrowRight' ? 1 : -1));
    }
  });
  dialog.addEventListener('click', event => {
    if (event.target !== dialog) return;
    const rect = dialog.getBoundingClientRect();
    if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close();
  });
}
