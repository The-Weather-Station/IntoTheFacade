import { Map as LibreMap, Marker, AttributionControl, setWorkerUrl } from 'maplibre-gl';
import workerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url';
import 'maplibre-gl/dist/maplibre-gl.css';
import './tabletop.css';
import { places, getPlace, filterPlaces, reviewed, registryUrl, parcelMapUrl, cityPortalUrl, type Place, type Source } from './data';
import parcelSnapshot from './research/stockyard-parcels.json';
import type { FeatureCollection } from 'geojson';
import { icon } from './art';
import { artUrl, buildingArt, mysteryCard } from './generated-art';
import roadSnapshot from './research/osm-road-corridor.json';
import './generated-theme.css';
import { mapInk, placeColor } from './map-palette';
import type { CompatMap, MapBounds } from './compat-map';
import { imageGallery, imageAttachments, exportImageEvidence, initEvidenceViewer } from './evidence-images';

setWorkerUrl(workerUrl);
const $ = <T extends HTMLElement = HTMLElement>(selector: string) => document.querySelector<T>(selector)!;
const escapeHtml = (value: string) => value.replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]!));
function readStorage<T>(key: string, fallback: T): T { try { return JSON.parse(localStorage.getItem(key) ?? 'null') ?? fallback; } catch { return fallback; } }
const rawSaved = readStorage<unknown>('itf:saved', []);
let saved: string[] = Array.isArray(rawSaved) ? rawSaved.filter((id): id is string => typeof id === 'string' && places.some(p => p.id === id)) : [];
let selected = getPlace(location.hash.slice(1));
let query = '', category = 'All', savedOnly = false, tab = 'overview', is3d = true;
let map: LibreMap | null = null, mapReady = false, toastTimer: ReturnType<typeof setTimeout>;
let compatMap: CompatMap | null = null, mapGeneration = 0, mapTimeout: ReturnType<typeof setTimeout> | undefined;
let mapMode: 'styled' | '2d' = 'styled';
let roadPulseFrame = 0, roadPulseTimer: ReturnType<typeof setTimeout> | undefined, pendingRoadFocus = false;
const markers = new globalThis.Map<string, Marker>();
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
const reviewLabel = new Date(`${reviewed}T12:00:00Z`).toLocaleDateString('en-GB', {day:'2-digit',month:'short',year:'numeric',timeZone:'UTC'}).toUpperCase();
const claimCount = places.reduce((sum,p)=>sum+p.evidence.length,0);

$('#app').innerHTML = `
  <a class="skip-link" href="#places">Skip to places</a>
  <header class="masthead">
    <a class="brand" href="#${places[0].id}" aria-label="Into The Facade home"><span class="brand-mark"><img src="${artUrl('occult-card-back')}" alt="" width="48" height="72"></span><span>INTO THE FACADE<span class="brand-sub">PROPERTY RECORDS. BAD OMENS.</span></span></a>
    <nav class="main-nav" aria-label="Main navigation"><button class="nav-button active" id="explore-nav" aria-pressed="true">${icon('compass')} Explore</button><button class="nav-button" id="saved-nav" aria-pressed="false">${icon('bookmark')} Saved <span id="saved-count">${saved.length}</span></button></nav>
    <div class="header-right"><span class="edition"><span class="live-dot"></span> RESEARCH EDITION 003</span><button class="text-button" id="about-button">About this project ${icon('external')}</button></div>
  </header>
  <section class="intro" aria-label="Introduction"><div><p class="eyebrow">STOCKYARD AIRSOFT / CASE 01</p><h1>Check the <em>damn map.</em></h1></div><p class="intro-copy">Google leaves it blank.<br>OSM marks a service road.</p><div class="table-charms" aria-hidden="true"><img class="raster-charm" src="${artUrl('occult-card-back')}" alt=""><img class="raster-charm" src="${artUrl('occult-card-back')}" alt=""><img class="raster-charm" src="${artUrl('missing-road-card')}" alt=""></div><button class="region-button" id="region-button">${icon('pin')}<span><small>THE STOCKYARDS / OKC</small><strong>Oklahoma City, OK</strong></span>${icon('chevron')}</button></section>
  <main class="workspace">
    <aside class="discovery" aria-labelledby="discovery-title">
      <div class="panel-heading"><div><p class="eyebrow">CASE FILES</p><h2 id="discovery-title">Open cases.</h2></div><span class="count-box" aria-label="${places.length} research cases">${String(places.length).padStart(2,'0')}</span></div>
      <div class="search-wrap">${icon('search')}<input id="search" type="search" placeholder="Search the files…" aria-label="Search places" autocomplete="off"/><kbd>/</kbd></div>
      <div class="filters" role="group" aria-label="Filter by category"><button class="filter active" data-category="All" aria-pressed="true">All places</button>${[...new Set(places.map(p=>p.category))].map(c=>`<button class="filter" data-category="${c}" aria-pressed="false">${c}</button>`).join('')}</div>
      <div class="results-meta"><span id="results-count" role="status"></span><span>REVIEWED LEADS</span></div>
      <div id="places" class="places" tabindex="-1"></div>
      <div class="index-footer"><span class="mini-cross">${icon('eye')}</span><div><strong>FILE 01 / STOCKYARDS</strong><p>${places.length} case · ${claimCount} evidence entries.<br>Two parcels. One former venue.</p></div></div>
    </aside>
    <section class="map-section" aria-label="Interactive location map" tabindex="-1">
      <div id="map" aria-label="Oklahoma City exploration map"></div>
      <div class="map-top"><div class="map-tag"><span class="live-dot"></span> OKLAHOMA CITY <span class="divider">/</span> <span id="map-region-count">${places.length} CASE</span></div><button id="view-toggle" class="map-button view-toggle" aria-pressed="true">${icon('layers')}<span>Tilt view</span></button></div>
      <div class="map-mode"><button id="map-switch" class="map-button" type="button">Use 2D map</button><span id="map-note" role="status"></span></div>
      <div class="map-coordinate" id="map-coordinate">AREA REFERENCE · LOADING</div>
      <div class="map-controls" role="group" aria-label="Map controls"><button class="map-button" id="zoom-in" aria-label="Zoom in">${icon('plus')}</button><button class="map-button" id="zoom-out" aria-label="Zoom out">${icon('minus')}</button><span></span><button class="map-button" id="fit-map" aria-label="Show all matching places">${icon('crosshair')}</button></div>
      <div class="map-key"><span class="key-square"></span> PARCELS <span class="key-road"></span> OSM SERVICE ROADS</div>
      <div class="map-caption">DASHED ROAD: OSM PRIVATE TAG · OTHER SEGMENTS UNSPECIFIED</div>
      <div id="map-status" class="map-status" role="status">${icon('globe')}<strong>Loading the map</strong><span>Loading geographic context…</span></div>
      <button class="mobile-index" id="mobile-index">${icon('list')} Browse places</button>
    </section>
    <aside id="dossier" class="dossier" aria-label="Selected place dossier"></aside>
  </main>
  <footer class="app-footer"><span>INTO THE FACADE <i>/</i> OKC RESEARCH EDITION</span><button id="sources-button">${icon('book')} Sources & methodology</button><span>RECORDS REVIEWED <b>${reviewLabel}</b></span></footer>
  <div id="toast" class="toast" role="status" aria-live="polite"></div>
  <dialog id="info-dialog" aria-labelledby="dialog-title"><div class="dialog-top"><span class="eyebrow">INTO THE FACADE / FIELD GUIDE</span><button id="close-dialog" class="icon-button" aria-label="Close dialog">${icon('close')}</button></div><div id="dialog-content"></div></dialog>
`;

function toast(message: string) {
  clearTimeout(toastTimer); $('#toast').textContent = message; $('#toast').classList.add('visible');
  toastTimer = setTimeout(() => $('#toast').classList.remove('visible'), 3200);
}
function storeValue(key: string, value: unknown): boolean {
  try { localStorage.setItem(key, JSON.stringify(value)); return true; } catch { toast('Browser storage is unavailable. Changes stay in this session.'); return false; }
}
function visiblePlaces() { return filterPlaces(query, category, savedOnly, saved); }
function renderList() {
  const visible = visiblePlaces();
  if(!visible.some(p=>p.id==='stockyard-airsoft')) { pendingRoadFocus=false; stopRoadPulse(); }
  $('#results-count').textContent = `${String(visible.length).padStart(2,'0')} ${visible.length === 1 ? 'PLACE' : 'PLACES'}${savedOnly ? ' SAVED' : ' FOUND'}`;
  $('#map-region-count').textContent = `${String(visible.length).padStart(2,'0')} ${visible.length === 1 ? 'CASE' : 'CASES'}`;
  $('#saved-count').textContent = String(saved.length);
  $('#places').innerHTML = visible.length ? (visible.some(p=>p.id==='stockyard-airsoft') ? mysteryCard() : '') + visible.map(p => `
    <article class="place-card ${p.id === selected.id ? 'selected' : ''}" data-place="${p.id}" style="--card-color:${placeColor(p.id)}">
      <button class="place-select" data-select="${p.id}" aria-pressed="${p.id === selected.id}" aria-label="Open ${p.name} dossier"><div class="card-heading"><span class="card-number">${p.number}</span><span class="card-category">${p.category}</span></div><div class="card-art">${buildingArt()}<span class="card-year">${p.year}</span></div><div class="card-copy"><h3>${p.name}${icon('arrow')}</h3><p>${p.subtitle}</p><div class="card-meta"><span>${icon('check')} ${p.evidence.length} evidence entries</span><span>${p.id === selected.id ? 'ON THE TABLE' : 'OPEN DOSSIER'}</span></div></div></button>
      <button class="card-save ${saved.includes(p.id) ? 'is-saved' : ''}" data-save="${p.id}" aria-pressed="${saved.includes(p.id)}" aria-label="${saved.includes(p.id) ? 'Unsave' : 'Save'} ${p.name}">${icon('bookmark')}</button>
    </article>`).join('') : `<div class="empty-state">${icon(savedOnly ? 'bookmark' : 'search')}<h3>${savedOnly ? 'Nothing filed.' : 'No places found.'}</h3><p>${savedOnly ? 'Saved case files appear here.' : 'Try the business name, address, owner, or parcel account.'}</p><button class="secondary-button" id="reset-filters">Explore all places ${icon('arrow')}</button></div>`;
  document.querySelectorAll<HTMLButtonElement>('[data-select]').forEach(button => button.addEventListener('click', () => selectPlace(button.dataset.select!, true)));
  document.querySelectorAll<HTMLButtonElement>('[data-save]').forEach(button => button.addEventListener('click', () => toggleSave(button.dataset.save!)));
  $('#reset-filters')?.addEventListener('click', resetFilters);
  $('[data-investigate-road]')?.addEventListener('click',()=>{showEvidence('osm-road',false);traceRoad();});
  markers.forEach((marker, id) => {
    marker.getElement().style.display = visible.some(p => p.id === id) ? '' : 'none';
    marker.getElement().classList.toggle('selected', id === selected.id);
    marker.getElement().setAttribute('aria-pressed', String(id === selected.id));
  });
  compatMap?.update(visible, selected.id);
  if (mapReady && map) {
    const ids = visible.map(p=>p.id);
    const filter = ['in', ['get','placeId'], ['literal',ids]] as any;
    map.setFilter('candidate-parcels', filter); map.setFilter('parcel-outlines', filter); map.setFilter('osm-service-roads',filter); map.setFilter('osm-private-road',filter); map.setFilter('osm-road-highlight',filter);
  }
}
function toggleSave(id: string) {
  const adding = !saved.includes(id); saved = adding ? [...saved,id] : saved.filter(x=>x!==id);
  const persisted = storeValue('itf:saved',saved); renderList(); renderDossier();
  if(persisted) toast(adding ? 'Place saved to your collection.' : 'Place removed from your collection.');
}
function selectPlace(id: string, fly = false) {
  selected = getPlace(id); tab = 'overview';
  if(location.hash !== `#${selected.id}`) history.pushState(null,'',`#${selected.id}`);
  renderList(); renderDossier(); updateMapSelection();
  if(fly) focusMap(selected, 15.5);
  if(fly && window.innerWidth < 850) $('#dossier').scrollIntoView({behavior:reducedMotion?'instant':'smooth',block:'start'});
}
function updateMapSelection() {
  $('#map-coordinate').textContent = `AREA CENTER · ${selected.coordinates[1].toFixed(4)}° N ${Math.abs(selected.coordinates[0]).toFixed(4)}° W`;
}
function sourceMarkup(source: Source) {
  return `<div class="source-reference">${source.url ? `<a href="${escapeHtml(source.url)}" target="_blank" rel="noopener noreferrer">${source.title} ${icon('external')}</a>` : `<strong>${source.title}</strong>`}<small>${source.publisher} · ${source.kind}<br>${source.date}<br>REVIEWED ${source.reviewed}</small><details><summary>How this was checked</summary><p>${source.method}</p></details></div>`;
}
function renderDossier() {
  const p = selected, isSaved = saved.includes(p.id);
  $('#dossier').style.setProperty('--card-color', placeColor(p.id));
  $('#dossier').dataset.place = p.id;
  $('#dossier').dataset.tabView = tab;
  $('#dossier').innerHTML = `
    <div class="dossier-top"><span class="eyebrow">LOCATION DOSSIER <span>/ ${p.number}</span></span><button id="dossier-save" class="icon-button ${isSaved?'is-saved':''}" aria-label="${isSaved?'Unsave':'Save'} ${p.name}" aria-pressed="${isSaved}">${icon('bookmark')}</button></div>
    <div class="dossier-hero">${buildingArt()}<span class="hero-label">GENERATED ART · COUNTY PHOTO REFERENCE</span><button class="hero-source" data-image="county-building-photo">View source photo ↗</button></div>
    <div class="dossier-title"><p class="eyebrow rust">${p.category} <span>•</span> ${p.year}</p><h2>${p.name}</h2><p>${icon('pin')} ${p.address}</p></div>
    <div class="dossier-tabs" role="tablist" aria-label="Dossier sections"><button role="tab" id="tab-overview" data-tab="overview" aria-controls="dossier-content" aria-selected="${tab==='overview'}" tabindex="${tab==='overview'?0:-1}" class="${tab==='overview'?'active':''}">Overview</button><button role="tab" id="tab-evidence" data-tab="evidence" aria-controls="dossier-content" aria-selected="${tab==='evidence'}" tabindex="${tab==='evidence'?0:-1}" class="${tab==='evidence'?'active':''}">Evidence <span>${p.evidence.length}</span></button><button role="tab" id="tab-notes" data-tab="notes" aria-controls="dossier-content" aria-selected="${tab==='notes'}" tabindex="${tab==='notes'?0:-1}" class="${tab==='notes'?'active':''}">Field notes</button></div>
    <div id="dossier-content" class="dossier-content" role="tabpanel" aria-labelledby="tab-${tab}" tabindex="0"></div>
    <div class="dossier-bottom"><span><span class="live-dot"></span> REVIEWED ${reviewLabel}</span><button id="export-dossier" class="text-button" aria-label="Download ${p.name} dossier">${icon('download')} Export</button></div>`;
  const content = $('#dossier-content');
  if(tab === 'overview') content.innerHTML = `
    <div class="case-status"><span class="live-dot"></span> BUILDING & OWNER IDENTIFIED <strong>Lumber storage documented</strong></div>
    <p class="dossier-summary">${p.summary}</p>
    <button id="view-submitted-images" class="image-callout">${icon('eye')} View ${p.images.length} evidence images ${icon('arrow')}</button>
    <section class="road-brief"><p class="eyebrow">THE MISSING ROAD</p><h3>Maps disagree.</h3><p>The submitted Google view leaves this corridor blank. OSM maps three service-road segments; one is tagged private.</p><div><button id="trace-road">Trace the road ${icon('crosshair')}</button><button data-evidence="osm-road">Compare the records ${icon('arrow')}</button></div></section>
    <div class="findings">${p.findings.filter(f=>['Property owner','Building match','Documented use'].includes(f.label)).map(f=>`<article class="finding finding-${f.state}"><span class="section-label">${f.label}</span><h3>${f.value}</h3><p>${f.detail}</p>${f.evidence.length ? `<button class="finding-evidence" data-evidence="${f.evidence[0]}">View evidence ${icon('arrow')}</button>` : ''}</article>`).join('')}</div>
    <div class="interest"><span class="eyebrow">THE QUESTION</span><p>${p.interest}</p></div>
    <button id="focus-place" class="primary-button">${icon('crosshair')} Show candidate parcels ${icon('arrow')}</button>`;
  else if(tab === 'evidence') content.innerHTML = `${imageGallery(p)}<p class="evidence-intro">Records, maps and submitted images. Source links and dates are attached below.</p>${p.evidence.map((e,i)=>`<article class="evidence-item" id="evidence-${e.id}" tabindex="-1"><span class="evidence-number">${String(i+1).padStart(2,'0')}</span><div><span class="evidence-badge">${icon(e.sources.some(n=>p.sources[n].kind==='Official record')?'book':'info')} ${p.sources[e.sources[0]].kind}</span><h3>${e.title}</h3><p>${e.detail}</p>${imageAttachments(p,e.images)}${e.sources.map(n=>sourceMarkup(p.sources[n])).join('')}</div></article>`).join('')}
    <details class="remaining-questions"><summary>Unresolved items</summary><div>${p.unknowns.map(u=>`<p>${u}</p>`).join('')}<p>${p.locationNote}</p></div></details>
    <section class="next-steps"><span class="section-label">NEXT RECORDS TO CHECK</span>${p.nextSteps.map(s=>`<article><h3>${s.title}</h3><p>${s.detail}</p><a href="${escapeHtml(s.url)}" target="_blank" rel="noopener noreferrer">${s.label} ${icon('external')}</a></article>`).join('')}</section>`;
  else {
    const storedNote = readStorage<unknown>(`itf:note:${p.id}`,'');
    const note = typeof storedNote === 'string' ? storedNote : '';
    content.innerHTML = `<label class="section-label" for="field-note">YOUR OBSERVATIONS</label><p class="evidence-intro">Keep questions, details to investigate, or observations for this place.</p><textarea id="field-note" maxlength="5000" placeholder="Dates, names, inconsistencies. Record them here.">${escapeHtml(note)}</textarea><div class="note-meta"><span id="note-count">${note.length} / 5000</span><span>Stored on this browser</span></div><button id="save-note" class="primary-button">${icon('check')} Save field note</button><p class="local-note">Your notes stay on this device. Export the dossier to keep a separate copy.</p>`;
    $('#field-note').addEventListener('input',()=> {$('#note-count').textContent=`${$<HTMLTextAreaElement>('#field-note').value.length} / 5000`;});
    $('#save-note').addEventListener('click',()=> {if(storeValue(`itf:note:${p.id}`,$<HTMLTextAreaElement>('#field-note').value)) toast('Field note saved on this browser.');});
  }
  $('#dossier-save').addEventListener('click',()=>toggleSave(p.id));
  $('#trace-road')?.addEventListener('click',traceRoad);
  $('#view-submitted-images')?.addEventListener('click',()=>{tab='evidence';renderDossier();$('#tab-evidence').focus();});
  $('#focus-place')?.addEventListener('click',()=> {if(mapReady) {focusMap(p,16); if(innerWidth<850) $('.map-section').scrollIntoView({behavior:reducedMotion?'instant':'smooth'});} else toast('Map unavailable. The dossier and its sources are still accessible.');});
  document.querySelectorAll<HTMLButtonElement>('[data-evidence]').forEach(button=>button.addEventListener('click',()=>showEvidence(button.dataset.evidence!)));
  document.querySelectorAll<HTMLButtonElement>('[data-tab]').forEach(button=>{
    button.addEventListener('click',()=>{tab=button.dataset.tab!;renderDossier();$(`#tab-${tab}`).focus();});
    button.addEventListener('keydown',event=>{if(event.key==='ArrowLeft'||event.key==='ArrowRight'){event.preventDefault();const tabs=['overview','evidence','notes'];tab=tabs[(tabs.indexOf(tab)+(event.key==='ArrowRight'?1:2))%3];renderDossier();$(`#tab-${tab}`).focus();}});
  });
  $('#export-dossier').addEventListener('click',()=>exportDossier(p));
}
function showEvidence(id: string, reveal = true) {
  tab='evidence'; renderDossier();
  const target=$('#evidence-'+id), panel=$('#dossier-content');
  if(reveal)target.focus({preventScroll:true});
  if(panel.scrollHeight>panel.clientHeight) panel.scrollTop+=target.getBoundingClientRect().top-panel.getBoundingClientRect().top-12;
  else if(reveal)target.scrollIntoView({block:'start',behavior:reducedMotion?'instant':'smooth'});
}
function paintRoadPulse(strength: number) {
  compatMap?.highlightRoad(strength);
  if(mapReady && map?.getLayer('osm-road-highlight')) {
    map.setPaintProperty('osm-road-highlight','line-opacity',.85 * strength);
    map.setPaintProperty('osm-road-highlight','line-width',10 + 10 * strength);
  }
}
function stopRoadPulse() {
  cancelAnimationFrame(roadPulseFrame); clearTimeout(roadPulseTimer); roadPulseFrame=0;
  paintRoadPulse(0); delete $('#map').dataset.roadHighlight;
}
function pulseRoad() {
  stopRoadPulse();
  $('#map').dataset.roadHighlight=reducedMotion?'steady':'pulsing';
  // A narrow, slow halo keeps the road and its access markings readable.
  // Reduced-motion users get the same emphasis without flashing.
  if(reducedMotion) { paintRoadPulse(1); roadPulseTimer=setTimeout(stopRoadPulse,5400); return; }
  const started=performance.now();
  const frame=(now: number)=>{
    const elapsed=now-started;
    if(elapsed>=5400) { stopRoadPulse(); return; }
    paintRoadPulse(.2 + .8 * (1 + Math.cos(elapsed / 1350 * Math.PI * 2)) / 2);
    roadPulseFrame=requestAnimationFrame(frame);
  };
  frame(started);
}
function traceRoad() {
  if(innerWidth<951)$('.map-section').scrollIntoView({behavior:reducedMotion?'instant':'smooth',block:'center'});
  $('.map-section').focus({preventScroll:true});
  if(!mapReady){pendingRoadFocus=true;toast('Road selected. Waiting for the map.');return;}
  pendingRoadFocus=false;
  if(!visiblePlaces().some(p=>p.id===selected.id))resetFilters();
  const points=roadSnapshot.features.flatMap(f=>f.geometry.coordinates);
  const xs=points.map(p=>p[0]),ys=points.map(p=>p[1]);
  const bounds: MapBounds=[[Math.min(...xs),Math.min(...ys)],[Math.max(...xs),Math.max(...ys)]];
  if(compatMap)compatMap.fit(bounds);
  else {
    is3d=false;
    $('#view-toggle').setAttribute('aria-pressed','false');
    $('#view-toggle').innerHTML=icon('layers')+'<span>Flat view</span>';
    map?.fitBounds(bounds,{padding:80,maxZoom:16,pitch:0,bearing:0,duration:reducedMotion?0:700});
  }
  pulseRoad();
  toast('Service road highlighted. Dashed section: OSM private tag.');
}
function exportDossier(p: Place) {
  const note = readStorage<unknown>(`itf:note:${p.id}`,'');
  const text = [`# ${p.name}`,`Into The Facade · research in progress · reviewed ${reviewed}`,'',p.address,p.summary,'','## Findings',...p.findings.map(f=>`- ${f.label}: ${f.value}\n  ${f.detail}`),'','## Geographic context',p.locationNote,`Area center: ${p.coordinates[1]}, ${p.coordinates[0]}`,`Parcel accounts: ${p.parcelAccounts.join(', ')}`,`County geometry retrieved: ${parcelSnapshot.provenance.retrievedAt}`,parcelSnapshot.provenance.queryUrl,'','## Road map comparison',roadSnapshot.provenance.interpretation,roadSnapshot.provenance.sourceUrl,'','## Evidence',...p.evidence.map(e=>`### ${e.title}\n${e.detail}\n${e.sources.map(n=>{const s=p.sources[n];return `Source: ${s.title} · ${s.publisher} · ${s.kind}\nDate: ${s.date}\nReviewed: ${s.reviewed}\n${s.url ?? 'Submitted screenshot; no verified source-page permalink. See submitted images below when available.'}\nMethod: ${s.method}`;}).join('\n\n')}`),...exportImageEvidence(p),'','## Unknowns',...p.unknowns.map(u=>`- ${u}`),'','## Next records',...p.nextSteps.map(s=>`- ${s.title}: ${s.detail}\n  ${s.url}`),'','## Field notes',typeof note === 'string' ? note : ''].join('\n');
  const url=URL.createObjectURL(new Blob([text],{type:'text/markdown;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download=`into-the-facade-${p.id}.md`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);toast('Dossier exported with sources and saved notes.');
}
function resetFilters() {query='';category='All';savedOnly=false;$<HTMLInputElement>('#search').value='';updateFilters();renderList();fitMap();}
function updateFilters() {
  document.querySelectorAll<HTMLButtonElement>('[data-category]').forEach(b=>{b.classList.toggle('active',b.dataset.category===category);b.setAttribute('aria-pressed',String(b.dataset.category===category));});
  $('#explore-nav').classList.toggle('active',!savedOnly);$('#saved-nav').classList.toggle('active',savedOnly);
  $('#explore-nav').setAttribute('aria-pressed',String(!savedOnly));$('#saved-nav').setAttribute('aria-pressed',String(savedOnly));
  $('#discovery-title').textContent = savedOnly?'Saved files.':'Open cases.';
}
function focusMap(place: Place, zoom: number) {
  if (!mapReady) return;
  if (compatMap) compatMap.focus(place.coordinates, zoom);
  else map?.flyTo({center:place.coordinates,zoom,pitch:is3d?52:0,bearing:is3d?-16:0,duration:reducedMotion?0:900,essential:false});
}
function fitMap() {
  const shown=visiblePlaces(); if(!mapReady||!shown.length)return;
  const ids=new Set(shown.map(p=>p.id));
  const points=parcelSnapshot.features.filter(f=>ids.has(f.properties.placeId)).flatMap(f=>f.geometry.coordinates.flat());
  const coordinates=points.length?points:shown.map(p=>p.coordinates);
  const lngs=coordinates.map(p=>p[0]),lats=coordinates.map(p=>p[1]);
  const bounds: MapBounds = [[Math.min(...lngs),Math.min(...lats)],[Math.max(...lngs),Math.max(...lats)]];
  if (compatMap) compatMap.fit(bounds);
  else map?.fitBounds(bounds,{padding:{top:100,bottom:100,left:50,right:60},maxZoom:16,pitch:is3d?35:0,bearing:0,duration:reducedMotion?0:850});
}
function resetMap(mode: 'styled' | '2d') {
  // Invalidate callbacks before removing the old renderer. A slow import/load
  // must never attach to the container after the user switches modes.
  stopRoadPulse();
  const generation = ++mapGeneration;
  mapReady=false; mapMode=mode; clearTimeout(mapTimeout);
  const oldMap=map; map=null;
  markers.forEach(marker=>marker.remove()); markers.clear();
  try { oldMap?.remove(); } catch { /* A failed WebGL constructor may leave partial DOM. */ }
  compatMap?.remove(); compatMap=null;
  $('#map').replaceChildren();
  $('#map').classList.remove('maplibregl-map','leaflet-container','leaflet-touch','leaflet-retina','leaflet-fade-anim','leaflet-grab','leaflet-touch-drag','leaflet-touch-zoom');
  delete $('#map').dataset.renderer;
  $('#map-switch').textContent=mode==='2d'?'Try styled map':'Use 2D map';
  const tilt=$<HTMLButtonElement>('#view-toggle'); tilt.disabled=mode==='2d';
  tilt.setAttribute('aria-pressed',String(mode==='styled'&&is3d));
  tilt.title=mode==='2d'?'The 2D map supports panning and zooming. Tilt requires the styled map.':'Toggle map tilt';
  tilt.innerHTML=icon('layers')+'<span>'+(mode==='styled'&&is3d?'Tilt view':'Flat view')+'</span>';
  $('#map-note').textContent='';
  $('#map-status').innerHTML=icon('globe')+'<strong>Loading the map</strong><span>Loading geographic context…</span>';
  $('#map-status').classList.remove('hidden');
  return generation;
}
function mapFailure() {
  $('#map-status').innerHTML=icon('globe')+'<strong>The map is unavailable.</strong><span>The map files could not load. Dossiers and sources are still available.</span><button class="secondary-button" id="retry-map">Retry 2D map</button>';
  $('#map-status').classList.remove('hidden');
  $('#retry-map').addEventListener('click',()=>void initCompatMap());
}
async function initCompatMap() {
  const generation=resetMap('2d');
  try {
    const { createCompatMap } = await import('./compat-map');
    if(generation!==mapGeneration)return;
    compatMap=createCompatMap({
      container:$('#map'),center:selected.coordinates,places,parcels:parcelSnapshot as unknown as FeatureCollection,roads:roadSnapshot as unknown as FeatureCollection,reducedMotion,
      select:id=>selectPlace(id,true),
      onTileStatus:unavailable=>{
        if(generation!==mapGeneration)return;
        $('#map-note').textContent=unavailable?'Some street tiles could not load. Parcel outlines remain available.':'2D map active';
      },
    });
    mapReady=true; $('#map').dataset.renderer='2d';
    $('#map-status').classList.add('hidden'); $('#map-note').textContent='2D map active';
    renderList(); updateMapSelection(); fitMap();
    if(pendingRoadFocus)traceRoad();
  } catch {
    if(generation===mapGeneration)mapFailure();
  }
}
function initMap() {
  const generation=resetMap('styled');
  const fallback=()=>{if(generation===mapGeneration)void initCompatMap();};
  try {
    if(import.meta.env.DEV && new URLSearchParams(location.search).has('test-map-failure')) { fallback(); return; }
    const instance=new LibreMap({container:'map',style:import.meta.env.BASE_URL+'styles/board.json',center:selected.coordinates,zoom:14.7,pitch:is3d?42:0,bearing:is3d?-12:0,attributionControl:false,canvasContextAttributes:{antialias:true},renderWorldCopies:false});
    map=instance;
    instance.addControl(new AttributionControl({compact:true,customAttribution:'<a href="https://assessor.oklahomacounty.org/" target="_blank" rel="noopener noreferrer">Parcel reference: Oklahoma County Assessor</a>'}),'bottom-right');
    mapTimeout=setTimeout(fallback,16000);
    instance.on('webglcontextlost',fallback);
    instance.on('load',()=>{
      if(generation!==mapGeneration)return;
      try {
        clearTimeout(mapTimeout);
        instance.addSource('county-parcels',{type:'geojson',data:parcelSnapshot as unknown as FeatureCollection});
        instance.addLayer({id:'candidate-parcels',type:'fill',source:'county-parcels',paint:{'fill-color':'#d28a59','fill-opacity':0.18}});
        instance.addLayer({id:'parcel-outlines',type:'line',source:'county-parcels',paint:{'line-color':mapInk,'line-width':2.5,'line-dasharray':[3,2]}});
        instance.addSource('osm-roads',{type:'geojson',data:roadSnapshot as unknown as FeatureCollection});
        instance.addLayer({id:'osm-road-highlight',type:'line',source:'osm-roads',layout:{'line-cap':'round','line-join':'round'},paint:{'line-color':'#ffe079','line-width':10,'line-opacity':0,'line-opacity-transition':{duration:0},'line-width-transition':{duration:0}}});
        instance.addLayer({id:'osm-service-roads',type:'line',source:'osm-roads',paint:{'line-color':'#7954a1','line-width':5,'line-opacity':.9}});
        instance.addLayer({id:'osm-private-road',type:'line',source:'osm-roads',paint:{'line-color':['case',['==',['get','access'],'private'],'#e9c6d7','#00000000'],'line-width':2,'line-dasharray':[3,2]}});
        places.forEach(p=>{const el=document.createElement('button');el.className='map-marker';el.style.setProperty('--place-color',placeColor(p.id));el.setAttribute('aria-label','Select '+p.name);el.innerHTML='<span class="marker-square">'+p.number+'</span><span class="marker-name">'+p.name+'</span>';el.addEventListener('click',()=>selectPlace(p.id,true));markers.set(p.id,new Marker({element:el,anchor:'bottom-left',offset:[-16,-8]}).setLngLat(p.coordinates).addTo(instance));});
        mapReady=true; $('#map').dataset.renderer='styled';
        $('#map-status').classList.add('hidden'); renderList(); updateMapSelection(); fitMap();
        if(pendingRoadFocus)traceRoad();
      } catch { fallback(); }
    });
    instance.on('error',()=>{if(generation===mapGeneration&&!mapReady&&instance.isStyleLoaded())fallback();});
  } catch { fallback(); }
}
function showDialog(kind: 'about'|'sources'|'region') {
  const content = $('#dialog-content');
  if(kind==='region') content.innerHTML=`<h2 id="dialog-title">STOCKYARDS / FILE 01</h2><p>This edition starts with the former Stockyard Airsoft address near Stockyards City. It is a research candidate, with abandonment and current access unverified.</p><button class="region-choice" id="choose-region">${icon('pin')}<span><strong>Oklahoma City, Oklahoma</strong><small>${places.length} case · ${claimCount} evidence entries</small></span>${icon('check')}</button><p class="dialog-footnote">The deck contains reviewed leads. It is not a live scan of abandoned properties.</p>`;
  else if(kind==='about') content.innerHTML=`<h2 id="dialog-title">Into The Facade</h2><p>Into The Facade helps investigate overlooked buildings through public records. Start with a former business, identify the possible parcels, and trace the evidence for ownership and current use.</p><div class="dialog-callout"><strong>Closed business ≠ empty building.</strong><p>It does not establish an abandoned building. Ownership, occupancy, condition, and access are separate findings, each with its own evidence.</p></div><p class="dialog-footnote">This first case combines manually reviewed records with a dated county parcel-data snapshot. Illustrations are decorative. Saved places and notes remain in your browser.</p>`;
  else content.innerHTML=`<h2 id="dialog-title">Sources & methods</h2><p>Public-record research, with a source and date for each claim. This is a reviewed snapshot, not continuous monitoring.</p><div class="method-list">
    <div><span>01</span><p><strong>Start with a lead</strong>Former business listings and submitted observations provide names and addresses. Directory closure labels are kept as leads.</p></div>
    <div><span>02</span><p><strong>Match the property</strong>County assessor accounts and parcel boundaries identify possible matches. Shared addresses stay unresolved until the building is matched.</p></div>
    <div><span>03</span><p><strong>Separate the records</strong>Deeds concern property; state filings concern entities and trade names; city files concern permits and inspections. An LLC status or a closed permit is not a vacancy finding.</p></div>
    <div><span>04</span><p><strong>Keep the gaps visible</strong>Compare dated occupancy clues, identify conflicts, and record the next verification step. Missing records do not prove that nothing happened.</p></div></div>
    <div class="dialog-links"><a href="${parcelMapUrl}" target="_blank" rel="noopener noreferrer">County parcel map ${icon('external')}</a><a href="${registryUrl}" target="_blank" rel="noopener noreferrer">Official entity / trade-name search ${icon('external')}</a><a href="${cityPortalUrl}" target="_blank" rel="noopener noreferrer">City records portal ${icon('external')}</a></div>
    <p class="dialog-footnote">Reviewed ${reviewLabel}. County geometry retrieved ${parcelSnapshot.provenance.retrievedAt.slice(0,10)}. Google Maps and MapQuest are public-facing proprietary services, not open datasets. ChamberofCommerce.org is a third-party guide; the Secretary of State is the registry. Automated reuse requires source-specific permission or licensing checks.</p>
    <p class="dialog-footnote">The styled basemap uses OpenFreeMap / OpenStreetMap; the 2D map uses OpenStreetMap image tiles. Both include attribution. Parcel overlays are county reference boundaries, not building outlines or a legal survey. The marker represents the candidate area. The highlighted service-road network is a reviewed OpenStreetMap snapshot, including a parking loop. A private tag belongs to one segment only. Generated card artwork is decorative; original source photographs are in Evidence. No live Overture, USGS, EPA, Google, or business-registry ingestion is running.</p>`;
  $<HTMLDialogElement>('#info-dialog').showModal();$('#choose-region')?.addEventListener('click',()=>{$<HTMLDialogElement>('#info-dialog').close();resetFilters();});
}
$('#search').addEventListener('input',()=>{query=$<HTMLInputElement>('#search').value;renderList();});
document.querySelectorAll<HTMLButtonElement>('[data-category]').forEach(b=>b.addEventListener('click',()=>{category=b.dataset.category!;updateFilters();renderList();fitMap();}));
$('#explore-nav').addEventListener('click',()=>{savedOnly=false;updateFilters();renderList();fitMap();});
$('#saved-nav').addEventListener('click',()=>{savedOnly=true;updateFilters();renderList();fitMap();});
$('#view-toggle').addEventListener('click',()=>{if(!mapReady||!map)return;is3d=!is3d;$('#view-toggle').setAttribute('aria-pressed',String(is3d));$('#view-toggle').innerHTML=`${icon('layers')}<span>${is3d?'Tilt view':'Flat view'}</span>`;if(mapReady&&map){map.easeTo({pitch:is3d?52:0,bearing:is3d?-12:0,duration:reducedMotion?0:600});}});
$('#zoom-in').addEventListener('click',()=>{if(compatMap)compatMap.zoom(1);else map?.zoomIn({duration:reducedMotion?0:250});});
$('#zoom-out').addEventListener('click',()=>{if(compatMap)compatMap.zoom(-1);else map?.zoomOut({duration:reducedMotion?0:250});});
$('#fit-map').addEventListener('click',fitMap);
$('#map-switch').addEventListener('click',()=>{
  const use2d=mapMode!=='2d'; storeValue('itf:map-renderer',use2d?'2d':'styled');
  const url=new URL(location.href); url.searchParams.delete('map'); history.replaceState(null,'',url);
  if(use2d)void initCompatMap();else initMap();
});
$('#about-button').addEventListener('click',()=>showDialog('about'));$('#sources-button').addEventListener('click',()=>showDialog('sources'));$('#region-button').addEventListener('click',()=>showDialog('region'));
$('#close-dialog').addEventListener('click',()=> $<HTMLDialogElement>('#info-dialog').close());$('#info-dialog').addEventListener('click',event=>{if(event.target===$('#info-dialog')){const rect=$('#info-dialog').getBoundingClientRect();if(event.clientX<rect.left||event.clientX>rect.right||event.clientY<rect.top||event.clientY>rect.bottom)$<HTMLDialogElement>('#info-dialog').close();}});
$('#mobile-index').addEventListener('click',()=>$('.discovery').scrollIntoView({behavior:reducedMotion?'instant':'smooth'}));
window.addEventListener('hashchange',()=>{const id=location.hash.slice(1);if(places.some(p=>p.id===id))selectPlace(id,false);});
window.addEventListener('keydown',e=>{if(e.key==='/' && !['INPUT','TEXTAREA'].includes((e.target as HTMLElement).tagName) && !$<HTMLDialogElement>('#info-dialog').open && !$<HTMLDialogElement>('#evidence-dialog').open){e.preventDefault();$('#search').focus();}});
initEvidenceViewer(()=>selected);
renderList();renderDossier();updateMapSelection();
if(new URLSearchParams(location.search).get('map')==='2d'||readStorage<string>('itf:map-renderer','styled')==='2d')void initCompatMap();
else initMap();
