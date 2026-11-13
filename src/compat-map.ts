import * as L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { FeatureCollection } from 'geojson';
import type { Place } from './data';
import { mapInk, placeColor } from './map-palette';

export type MapBounds = [[number, number], [number, number]];
const latLng = (point: readonly number[]): L.LatLngTuple => [point[1], point[0]];

// Ordinary image tiles and SVG geometry: no WebGL or canvas permission needed.
export function createCompatMap(options: {
  container: HTMLElement;
  center: [number, number];
  places: Place[];
  parcels: FeatureCollection;
  reducedMotion: boolean;
  select: (id: string) => void;
  onTileStatus: (unavailable: boolean) => void;
}) {
  const map = L.map(options.container, {
    zoomControl: false, preferCanvas: false, renderer: L.svg(),
    zoomAnimation: !options.reducedMotion, fadeAnimation: !options.reducedMotion,
    markerZoomAnimation: !options.reducedMotion, maxZoom: 19,
  }).setView(latLng(options.center), 15);
  map.attributionControl.setPrefix(false);
  map.attributionControl.addAttribution('<a href="https://assessor.oklahomacounty.org/" target="_blank" rel="noopener noreferrer">Parcels: Oklahoma County Assessor</a>');
  // Public OSM service for this small demo. Keep native browser caching and
  // referrers; no offline prefetch, retina duplication, or cache-busting URLs.
  const tiles = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 19, updateWhenIdle: true, keepBuffer: 1, detectRetina: false,
  });
  let tileTimer: ReturnType<typeof setTimeout> | undefined;
  const checkTiles = () => {
    const images = [...(tiles.getContainer()?.querySelectorAll('img') ?? [])];
    options.onTileStatus(!images.length || images.some(image => !image.complete || !image.naturalWidth));
  };
  tiles.on('loading', () => { clearTimeout(tileTimer); tileTimer = setTimeout(checkTiles, 12000); });
  tiles.on('load', () => { clearTimeout(tileTimer); checkTiles(); });
  tiles.on('tileerror', () => options.onTileStatus(true));
  tiles.addTo(map);
  const parcels = L.geoJSON(undefined, {
    style: { color: mapInk, weight: 2.5, dashArray: '8 5', fillColor: '#d28a59', fillOpacity: 0.18 },
    interactive: false,
  }).addTo(map);
  const markers = new Map<string, { marker: L.Marker; button: HTMLButtonElement }>();
  options.places.forEach(place => {
    const button = document.createElement('button');
    button.type = 'button'; button.className = 'map-marker';
    button.style.setProperty('--place-color', placeColor(place.id));
    button.setAttribute('aria-label', `Select ${place.name}`);
    const number = document.createElement('span'); number.className = 'marker-square'; number.textContent = place.number;
    const name = document.createElement('span'); name.className = 'marker-name'; name.textContent = place.name;
    button.append(number, name);
    L.DomEvent.disableClickPropagation(button);
    button.addEventListener('click', () => options.select(place.id));
    const marker = L.marker(latLng(place.coordinates), {
      icon: L.divIcon({ className: 'compat-marker', html: button, iconSize: [33, 44], iconAnchor: [16, 44] }),
      keyboard: false, // The native button provides a single keyboard focus stop.
    });
    markers.set(place.id, { marker, button });
  });
  const resize = new ResizeObserver(() => map.invalidateSize({ animate: false, pan: false }));
  resize.observe(options.container);
  return {
    update(visible: Place[], selectedId: string) {
      const ids = new Set(visible.map(place => place.id));
      const collection: FeatureCollection = { ...options.parcels, features: options.parcels.features.filter(feature => ids.has(feature.properties?.placeId)) };
      parcels.clearLayers().addData(collection);
      markers.forEach(({ marker, button }, id) => {
        if (ids.has(id)) { if (!map.hasLayer(marker)) marker.addTo(map); }
        else marker.remove();
        button.classList.toggle('selected', id === selectedId);
        button.setAttribute('aria-pressed', String(id === selectedId));
      });
    },
    focus(point: [number, number], zoom: number) { map.setView(latLng(point), zoom, { animate: !options.reducedMotion }); },
    fit(bounds: MapBounds) { map.fitBounds([latLng(bounds[0]), latLng(bounds[1])], { paddingTopLeft: [50, 130], paddingBottomRight: [60, 100], maxZoom: 16, animate: !options.reducedMotion }); },
    zoom(delta: number) { map.setZoom(map.getZoom() + delta, { animate: !options.reducedMotion }); },
    remove() { clearTimeout(tileTimer); resize.disconnect(); tiles.off(); map.remove(); },
  };
}

export type CompatMap = ReturnType<typeof createCompatMap>;
