import { Map as LibreMap, Marker, AttributionControl, setWorkerUrl } from 'maplibre-gl';
import workerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url';
import 'maplibre-gl/dist/maplibre-gl.css';
import './tabletop.css';
import { places, getPlace, filterPlaces, reviewed, registryUrl, parcelMapUrl, cityPortalUrl, type Place, type Source } from './data';
import parcelSnapshot from './research/stockyard-parcels.json';
import additionalParcels from './research/additional-parcels.json';
import type { FeatureCollection } from 'geojson';
import { icon } from './art';
import { artUrl, buildingArt } from './generated-art';
import { caseStack, createCaseDeck } from './case-deck';
import { deckViews, nextDeckView } from './deck-order';
import { crimeAlert } from './crime-alert';
import roadSnapshot from './research/osm-road-corridor.json';
import './generated-theme.css';
import './card-motion.css';
import './map-hazards.css';
import './crime-alert.css';
import './mobile.css';
import { createCardMotion } from './card-motion';
import { createIntroGuide } from './intro-guide';
import { initBackgroundAudio } from './background-audio';
import { fieldProfiles } from './field-research';
import { explorerNotes } from './explorer-notes';
import { mapInk, placeColor } from './map-palette';
import { createPlaceMarker, createHazardGroup, setMarkerSelected } from './map-marker';
import type { CompatMap, MapBounds } from './compat-map';
import { imageGallery, imageAttachments, exportImageEvidence, initEvidenceViewer } from './evidence-images';

setWorkerUrl(workerUrl);
const $ = <T extends HTMLElement = HTMLElement>(selector: string) => document.querySelector<T>(selector)!;
const escapeHtml = (value: string) => value.replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]!));
function readStorage<T>(key: string, fallback: T): T { try { return JSON.parse(localStorage.getItem(key) ?? 'null') ?? fallback; } catch { return fallback; } }
let selected: Place | undefined = places.find(p => p.id === location.hash.slice(1));
const countyCenter: [number, number] = [-97.49, 35.46];
let query = '', category = 'All', tab = 'overview', is3d = true;
let map: LibreMap | null = null, mapReady = false, toastTimer: ReturnType<typeof setTimeout>;
let compatMap: CompatMap | null = null, mapGeneration = 0, mapTimeout: ReturnType<typeof setTimeout> | undefined;
let mapMode: 'styled' | '2d' = 'styled';
let roadPulseFrame = 0, roadPulseTimer: ReturnType<typeof setTimeout> | undefined, pendingRoadFocus = false;
const markers = new globalThis.Map<string, Marker>();
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
const latestReview = places.map(p=>p.reviewed ?? reviewed).sort().at(-1)!;
const dateLabel = (date: string) => new Date(`${date}T12:00:00Z`).toLocaleDateString('en-GB', {day:'2-digit',month:'short',year:'numeric',timeZone:'UTC'}).toUpperCase();
const reviewLabel = dateLabel(latestReview);
const parcelCollection = {type:'FeatureCollection',features:[...parcelSnapshot.features,...additionalParcels.features]} as unknown as FeatureCollection;
const claimCount = places.reduce((sum,p)=>sum+p.evidence.length,0);

$('#app').innerHTML = `
  <a class="skip-link" href="#places">Skip to places</a>
  <header class="masthead">
    <a class="brand" href="#" aria-label="Into The Facade home"><span class="brand-mark"><img src="${artUrl('occult-card-back')}" alt="" width="48" height="72"></span><span>INTO THE FACADE<span class="brand-sub">Every building has baggage.</span></span></a>
    <nav class="main-nav" aria-label="Main navigation"><button class="nav-button active" id="explore-nav" aria-pressed="true">${icon('compass')} Explore</button></nav>
    <div id="soundtrack-control" class="soundtrack"><button type="button" aria-label="Play background music" aria-pressed="false">&#9654; <span class="music-label">DARK DOOM JAZZ</span></button><label><span class="sr-only">Music volume</span><input type="range" min="0" max="100" value="16" aria-label="Music volume"></label><span class="sr-only" role="status" aria-live="polite">Music starts after your first interaction</span></div>
    <div class="header-right"><span class="edition"><span class="live-dot"></span> RESEARCH EDITION 005</span><button class="text-button" id="about-button">About this project ${icon('external')}</button></div>
  </header>
  <div class="case-alert-banner" aria-hidden="true"><strong>ALERT!!!!</strong><span>SUITE 109 / CASE FILE</span><strong>ALERT!!!!</strong></div>
  <section class="intro" aria-label="Introduction"><div><p class="eyebrow">URBAN EXPLORATION / OPEN-SOURCE INTELLIGENCE</p><h1>Dead business. <em>Live paperwork</em></h1></div><p class="intro-copy">Know the site before you go.<br>Access? Hazards? Signs of life?</p><button class="region-button" id="region-button">${icon('pin')}<span><small>OKC + MIDWEST CITY</small><strong>Oklahoma County</strong></span>${icon('chevron')}</button></section>
  <main class="workspace">
    <aside class="discovery" aria-labelledby="discovery-title">
      <div class="panel-heading"><div><p class="eyebrow">URBEX CASE FILES</p><h2 id="discovery-title">Location Recon</h2></div><span class="count-box" aria-label="${places.length} research cases">${String(places.length).padStart(2,'0')}</span></div>
      <div class="search-wrap">${icon('search')}<input id="search" type="search" placeholder="Search the files…" aria-label="Search places" autocomplete="off"/><kbd>/</kbd></div>
      <div class="filters" role="group" aria-label="Filter by category"><button class="filter active" data-category="All" aria-pressed="true">All places</button>${[...new Set(places.map(p=>p.category))].map(c=>`<button class="filter" data-category="${c}" aria-pressed="false">${c}</button>`).join('')}</div>
      <div class="results-meta"><span id="results-count" role="status"></span><span>REVIEWED LEADS</span></div>
      <div class="deck-controls"><span>Pick a case. Deal the stack.</span></div>
      <div class="mobile-intro-guide"><button id="mobile-intro-start" type="button">Start with MISSING ROAD!!</button></div>
      <div id="places" class="places" tabindex="-1"></div><p class="deck-art-note">Cover art dramatizes the case. Original images are in Evidence.</p>
      <div class="index-footer"><span class="mini-cross">${icon('eye')}</span><div><strong>THE COUNTY FILES</strong><p>${places.length} cases · ${claimCount} evidence entries.<br>Every claim has a paper trail.</p></div></div>
    </aside>
    <section class="map-section" aria-label="Interactive location map" tabindex="-1">
      <div id="map" aria-label="Oklahoma City exploration map"></div>
      <div class="map-top"><div class="map-tag"><span class="live-dot"></span> OKLAHOMA COUNTY <span class="divider">/</span> <span id="map-region-count">${places.length} CASES</span></div><button id="view-toggle" class="map-button view-toggle" aria-pressed="true">${icon('layers')}<span>Tilt view</span></button></div>
      <div class="map-mode"><button id="map-switch" class="map-button" type="button">Use 2D map</button><span id="map-note" role="status"></span></div>
      <div class="map-coordinate" id="map-coordinate">AREA REFERENCE · LOADING</div>
      <div class="map-controls" role="group" aria-label="Map controls"><button class="map-button" id="zoom-in" aria-label="Zoom in">${icon('plus')}</button><button class="map-button" id="zoom-out" aria-label="Zoom out">${icon('minus')}</button><span></span><button class="map-button" id="fit-map" aria-label="Show all matching places">${icon('crosshair')}</button></div>
      <div class="map-key"><span class="key-square"></span> PARCELS <span class="key-road"></span> OSM SERVICE ROADS</div>
      <div class="map-caption">DASHED ROAD: OSM PRIVATE TAG · OTHER SEGMENTS UNSPECIFIED</div>
      <div id="map-status" class="map-status" role="status">${icon('globe')}<strong>Loading the map</strong><span>Loading geographic context…</span></div>
      <button class="mobile-index" id="mobile-index">${icon('list')} Browse places</button>
    </section>
    <section id="mobile-site-hazards" class="mobile-site-hazards" aria-label="Selected site hazards" hidden></section>
    <div class="dossier-dock"><button class="deck-cycle deck-cycle-prev" type="button" data-cycle="-1" aria-label="Previous card in deck"><span aria-hidden="true">&#8249;</span></button><button class="deck-cycle deck-cycle-next" type="button" data-cycle="1" aria-label="Next card in deck"><span aria-hidden="true">&#8250;</span></button><div id="dossier-hand" class="dossier-hand"></div><div class="detail-underlay"></div><div class="detail-underlay two"></div><div class="detail-underlay three" hidden></div><aside id="dossier" class="dossier" aria-label="Selected place dossier"></aside></div>
  </main>
  <footer class="app-footer"><span>INTO THE FACADE <i>/</i> OKC RESEARCH EDITION</span><button id="sources-button">${icon('book')} Sources & methodology</button><span>RECORDS REVIEWED <b>${reviewLabel}</b></span></footer>
  <div id="toast" class="toast" role="status" aria-live="polite"></div>
  <dialog id="info-dialog" aria-labelledby="dialog-title"><div class="dialog-top"><span class="eyebrow">INTO THE FACADE / FIELD GUIDE</span><button id="close-dialog" class="icon-button" aria-label="Close dialog">${icon('close')}</button></div><div id="dialog-content"></div></dialog>
`;
const cardMotion = createCardMotion();
const caseDeck = createCaseDeck($('#dossier'), $('.dossier-dock'), cardMotion);
const introGuide = createIntroGuide();
initBackgroundAudio();


let turnDirection = -1;
function cycleDeck(direction: number) {
  if (!selected) return;
  turnDirection = direction;
  tab = nextDeckView(selected.id, tab, direction);
  renderDossier();
}
$('.dossier-dock').addEventListener('click',event=>{
  const target=event.target as HTMLElement;
  const cycle=target.closest<HTMLElement>('[data-cycle]');
  if(cycle) { cycleDeck(Number(cycle.dataset.cycle)); return; }
  if(!selected || target.closest('a,button,input,textarea,summary,.dossier-content') || window.getSelection()?.toString())return;
  const rect=$('#dossier').getBoundingClientRect();
  cycleDeck(event.clientX < rect.left + rect.width/2 ? -1 : 1);
});
function centerActiveDeck(animate = true) {
  requestAnimationFrame(()=>{
    const frame=$('#places'), card=frame.querySelector<HTMLElement>('.case-stack.selected');
    if(!card)return;
    if(innerWidth<=580) { frame.scrollTo({left:frame.scrollLeft+card.getBoundingClientRect().left-frame.getBoundingClientRect().left-(frame.clientWidth-card.offsetWidth)/2,behavior:animate&&!reducedMotion?'smooth':'instant'}); return; }
    frame.scrollTo({top:frame.scrollTop+card.getBoundingClientRect().top-frame.getBoundingClientRect().top-(frame.clientHeight-card.offsetHeight)/2,behavior:animate&&!reducedMotion?'smooth':'instant'});
  });
}
let deckSpacingFrame=0;
new ResizeObserver(()=>{
  cancelAnimationFrame(deckSpacingFrame);
  deckSpacingFrame=requestAnimationFrame(()=>{
    const frame=$('#places'), first=frame.querySelector<HTMLElement>('.case-stack'), last=frame.querySelector<HTMLElement>('.case-stack:last-child');
    frame.style.paddingTop=innerWidth>580&&first?Math.max(16,(frame.clientHeight-first.offsetHeight)/2)+'px':'';
    frame.style.paddingBottom=innerWidth>580&&last?Math.max(16,(frame.clientHeight-last.offsetHeight)/2)+'px':'';
    centerActiveDeck(false);
  });
// Padding changes must not retrigger the observer's content-box measurement.
}).observe($('#places'),{box:'border-box'});

function toast(message: string) {
  clearTimeout(toastTimer); $('#toast').textContent = message; $('#toast').classList.add('visible');
  toastTimer = setTimeout(() => $('#toast').classList.remove('visible'), 3200);
}
function storeValue(key: string, value: unknown): boolean {
  try { localStorage.setItem(key, JSON.stringify(value)); return true; } catch { toast('Browser storage is unavailable. Changes stay in this session.'); return false; }
}
function visiblePlaces() { return filterPlaces(query, category, false, []); }
function renderDeck(markup: string) {
  const deck=$('#places'), template=document.createElement('template');
  template.innerHTML=markup;
  const existing=new globalThis.Map([...deck.querySelectorAll<HTMLElement>(':scope > [data-card-key]')].map(card=>[card.dataset.cardKey!,card]));
  deck.querySelector(':scope > .empty-state')?.remove();
  let cursor=deck.firstElementChild;
  [...template.content.children].forEach((fresh,index)=>{
    const incoming=fresh as HTMLElement, key=incoming.dataset.cardKey;
    const card=(key&&existing.get(key))||incoming;
    if(key) {
      existing.delete(key);
      card.classList.toggle('selected',incoming.classList.contains('selected'));
      // Keep the actual card and focused buttons alive across map/search/save
      // updates. Only selection/bookmark state changes on an existing card.
      if(card!==incoming) {
        incoming.querySelectorAll<HTMLButtonElement>('[data-select]').forEach(button=>{
          const live=card.querySelector<HTMLButtonElement>('[data-select]')!;
          live.className=button.className;
          for(const name of ['aria-pressed','aria-label'])live.setAttribute(name,button.getAttribute(name)!);
        });
        const meta=card.querySelector('.stack-state');
        if(meta)meta.textContent=incoming.querySelector('.stack-state')!.textContent;
      }
    }
    if(card===cursor)cursor=cursor.nextElementSibling;
    else deck.insertBefore(card,cursor);
    if(key)cardMotion.mount(card,'left',index);
  });
  existing.forEach(card=>cardMotion.leave(card));
}
function renderList() {
  const visible = visiblePlaces();
  if(!visible.some(p=>p.id==='stockyard-airsoft')) { pendingRoadFocus=false; stopRoadPulse(); }
  $('#results-count').textContent = `${String(visible.length).padStart(2,'0')} ${visible.length === 1 ? 'PLACE' : 'PLACES'} FOUND`;
  $('#map-region-count').textContent = `${String(visible.length).padStart(2,'0')} ${visible.length === 1 ? 'CASE' : 'CASES'}`;
  const deckMarkup = visible.length ? visible.map(p=>caseStack(p,p.id===selected?.id)).join('') : `<div class="empty-state">${icon('search')}<h3>No sites found.</h3><p>Try the business name, address, owner, or parcel account.</p><button class="secondary-button" id="reset-filters">Browse all sites ${icon('arrow')}</button></div>`;
  renderDeck(deckMarkup);
  markers.forEach((marker, id) => {
    marker.getElement().style.display = visible.some(p => p.id === id) ? '' : 'none';
    setMarkerSelected(marker.getElement(),id === selected?.id);
  });
  compatMap?.update(visible, selected?.id ?? '');
  if (mapReady && map) {
    const ids = visible.map(p=>p.id);
    const filter = ['in', ['get','placeId'], ['literal',ids]] as any;
    map.setFilter('candidate-parcels', filter); map.setFilter('parcel-outlines', filter); map.setFilter('osm-service-roads',filter); map.setFilter('osm-private-road',filter); map.setFilter('osm-road-highlight',filter);
  }
}
function selectPlace(id: string, fly = false) {
  introGuide.dismiss();
  stopRoadPulse(); pendingRoadFocus=false;
  const oldId = selected?.id, next = getPlace(id);
  const transition = caseDeck.switchCase(oldId, next.id, () => {
    selected = next; tab = 'overview';
    if(location.hash !== `#${selected?.id}`) history.pushState(null,'',`#${selected?.id}`);
    renderList(); renderDossier(); updateMapSelection(); centerActiveDeck();
  });
  if(fly) focusMap(next, 15.5);
  if(innerWidth < 850) void transition.then(()=> {
    if(selected?.id===next.id) $('.dossier-dock').scrollIntoView({behavior:reducedMotion?'instant':'smooth',block:'start'});
  });
}

function updateMapSelection() {
  if (!selected) { $('#map-coordinate').textContent = 'OKLAHOMA COUNTY / CHOOSE A CASE'; return; }
  $('#map-coordinate').textContent = `AREA CENTER · ${(selected?.coordinates ?? countyCenter)[1].toFixed(4)}° N ${Math.abs((selected?.coordinates ?? countyCenter)[0]).toFixed(4)}° W`;
}
function sourceMarkup(source: Source) {
  return `<div class="source-reference">${source.url ? `<a href="${escapeHtml(source.url)}" target="_blank" rel="noopener noreferrer">${source.title} ${icon('external')}</a>` : `<strong>${source.title}</strong>`}<small>${source.publisher} · ${source.kind}<br>${source.date}<br>REVIEWED ${source.reviewed}</small><details><summary>How this was checked</summary><p>${source.method}</p></details></div>`;
}
function renderWelcome() {
  const front = $('#dossier');
  document.body.classList.add('case-welcome');
  $('#mobile-site-hazards').hidden=true; $('#mobile-site-hazards').replaceChildren();
  $('.dossier-dock').classList.add('is-welcome');
  delete front.dataset.place; delete front.dataset.tabView;
  front.style.removeProperty('--card-face');
  $('.dossier-dock').classList.remove('crime-deck');
  document.body.classList.remove('case-alert-active');
  front.setAttribute('aria-label', 'About Into The Facade');
  $('#dossier-hand').replaceChildren();
  document.querySelectorAll('.detail-underlay').forEach(card=>card.replaceChildren());
  front.innerHTML = `<div class="welcome-copy"><p class="eyebrow">URBAN EXPLORATION / BEFORE THE FENCE</p>
    <span class="welcome-stamp" aria-hidden="true">OPEN<br>THE FILE.</span>
    <h2>Scout the site. Read the records.</h2><p class="welcome-mobile-copy">Access, hazards and signs of life. Open a case to read the records.</p>
    <p>Urban exploration starts before you reach the fence. Trace ownership, compare possible approaches, and check hazards and signs of current use through public records.</p>
    <p><strong>Overview</strong> lays out the case. <strong>Evidence</strong> links the documents and photos. <strong>Field notes</strong> holds prior explorers’ accounts.</p>
    <div class="welcome-start"><p class="eyebrow">FIRST FILE / STOCKYARD AIRSOFT</p><button id="intro-start" type="button">Start with MISSING ROAD!! <span aria-hidden="true">&#8601;</span></button><p>A road appears on one map and disappears from another. Open the card to compare the records.</p></div>
  </div>`;
  const startCase=()=>{resetFilters();selectPlace('stockyard-airsoft');traceRoad();};
  $('#intro-start').addEventListener('click',startCase);
  $('#mobile-intro-start').onclick=startCase;
  cardMotion.revealDossier(front); introGuide.show();
}
function fieldBrief(p: Place) {
  const profile = fieldProfiles[p.id];
  const refs = (ids: string[]) => ids.map(id=>`<button class="finding-evidence" data-evidence="${id}">Read record ${icon('arrow')}</button>`).join('');
  const meter = (count: number, level: number | null) => `<div class="record-spectrum" aria-hidden="true">${Array.from({length:count},(_,i)=>`<span class="${i===level?'current':''}"></span>`).join('')}</div>`;
  return `<section class="urbex-brief"><p class="eyebrow">URBEX READOUT / RECORDS CHECKED ${reviewLabel}</p><h3>${profile.verdict}</h3>
    <div class="activity-readout"><p class="section-label">RECORDED ACTIVITY</p><strong>${profile.activity.label}</strong>${meter(5,profile.activity.level)}<div class="spectrum-labels"><span>Vacancy record</span><span>Operating use</span></div><p>${profile.activity.detail}</p>${refs(profile.activity.evidence)}</div>
    <details class="field-detail"><summary>Visibility & security evidence</summary><strong>${profile.security.label}</strong>${meter(3,profile.security.level)}<div class="spectrum-labels"><span>Controls unverified</span><span>Staffed controls</span></div><p>${profile.security.detail}</p><small>Dated records, not a live security assessment.</small>${refs(profile.security.evidence)}</details>
    ${profile.sections.map(section=>`<details class="field-detail" open><summary>${section.title}</summary><p>${section.text}</p>${refs(section.evidence)}</details>`).join('')}
    <a class="permission-contact" href="${profile.contact.url}" target="_blank" rel="noopener noreferrer">${profile.contact.label} ↗</a><p class="contact-context">${profile.contact.detail}</p></section>`;
}

function renderDossier() {
  if (!selected) { renderWelcome(); return; }
  document.body.classList.remove('case-welcome');
  $('.dossier-dock').classList.remove('is-welcome');
  $('#dossier').setAttribute('aria-label', 'Selected place dossier');
  const p = selected;
  const mobileHazards=$('#mobile-site-hazards');
  mobileHazards.innerHTML='<p class="eyebrow">SITE HAZARDS <span>Tap a record</span></p>';
  const hazardGroup=createHazardGroup(p,showEvidence); hazardGroup.hidden=false; mobileHazards.append(hazardGroup); mobileHazards.hidden=false;
  const views = deckViews(p.id);
  const cardFace = `url("${artUrl(p.id==='rhode-island-warehouse' ? 'crime-card-face' : 'worn-card-face')}")`;
  $('.dossier-dock').classList.toggle('crime-deck',p.id==='rhode-island-warehouse');
  document.body.classList.toggle('case-alert-active',p.id==='rhode-island-warehouse');
  const previousId = $('#dossier').dataset.place, previousTab = $('#dossier').dataset.tabView ?? '';
  const previousFace = caseDeck.capture();
  const sheets = [
    {id:'overview',title:'Overview',body:`<h4>Recon Summary</h4><p>${p.summary}</p><strong>${p.statusTitle ?? 'Lumber storage documented'}</strong>`},
    {id:'evidence',title:'Evidence',body:`<p>${p.evidence.length} records · ${p.images.length} original images</p>${p.evidence.slice(0,3).map(e=>`<section><h4>${e.title}</h4><p>${e.detail}</p></section>`).join('')}`},
    {id:'notes',title:'Field notes',body:`<p>${explorerNotes[p.id]?.length ? 'Anonymous explorer · first-person account' : 'No explorer accounts submitted for this site yet.'}</p><small>EXPLORER ACCOUNTS / READ ONLY</small>`},
    {id:'alert',title:'ALERT!!! ALERT!!!',body:`<img class="underlay-alert-art" src="${artUrl('organized-alert-card')}" alt=""><p>Suite 109 · the shipping case</p>`},
  ].filter(sheet=>views.includes(sheet.id)&&sheet.id!==tab).sort((a,b)=>views.indexOf(b.id)-views.indexOf(a.id));
  document.querySelectorAll<HTMLElement>('.detail-underlay').forEach((card,i)=>{
    const sheet = sheets[i];
    card.hidden = !sheet;
    if (!sheet) { card.replaceChildren(); return; }
    card.style.setProperty('--card-face',cardFace);
    card.classList.toggle('crime-card-stock',p.id==='rhode-island-warehouse');
    card.innerHTML = `<div class="underlay-select" data-sheet="${sheet.id}" aria-hidden="true"><small>CASE ${p.number} / ${p.name}</small><h3>${sheet.title}</h3>${sheet.body}</div>`;
  });
  $('#dossier').style.setProperty('--card-color', placeColor(p.id));
  $('#dossier').style.setProperty('--card-face',cardFace);
  $('#dossier').dataset.place = p.id;
  $('#dossier').dataset.tabView = tab;
  const labels: Record<string,string> = {overview:'Overview',alert:'Alert!!!',evidence:`Evidence <span>${p.evidence.length}</span>`,notes:'Field notes'};
  $('#dossier-hand').innerHTML = `<div class="dossier-tabs" role="tablist" aria-label="Dossier sections">${views.map(view=>`<button role="tab" id="tab-${view}" data-tab="${view}" aria-controls="dossier-content" aria-selected="${tab===view}" tabindex="${tab===view?0:-1}" class="${tab===view?'active':''}">${labels[view]}</button>`).join('')}</div>`;
  $('#dossier').innerHTML = `
    <div class="dossier-top"><span class="eyebrow">LOCATION DOSSIER <span>/ ${p.number}</span></span></div>
    <div class="dossier-hero">${buildingArt(p.artName,p.name)}<span class="hero-label">GENERATED ART · COUNTY PHOTO REFERENCE</span><button class="hero-source" data-image="${p.heroImageId ?? 'county-building-photo'}">View source photo ↗</button></div>
    <div class="dossier-title"><p class="eyebrow rust">${p.category} <span>•</span> ${p.year}</p><h2>${p.name}</h2><p>${icon('pin')} ${p.address}</p></div>
    ${p.id==='stockyard-airsoft' ? `<button type="button" class="hazard-tag" data-evidence="building-inventory" aria-label="Structural hazards: Likely. View county condition evidence." title="Research inference from the county condition rating; not an engineering finding."><strong>STRUCTURAL HAZARDS</strong><span>Likely</span><small>County condition: Poor · View record ↗</small></button>` : ''}
    <div id="dossier-content" class="dossier-content" role="tabpanel" aria-labelledby="tab-${tab}" tabindex="0"></div>
    <div class="dossier-bottom"><span><span class="live-dot"></span> REVIEWED ${dateLabel(p.reviewed ?? reviewed)}</span><button id="export-dossier" class="text-button" aria-label="Download ${p.name} dossier">${icon('download')} Export</button></div>`;
  const content = $('#dossier-content');
  if(tab === 'overview') content.innerHTML = `
    <section class="case-summary" aria-label="Recon Summary"><p class="eyebrow">Recon Summary</p><p class="dossier-summary">${p.summary}</p><div class="summary-sources">${(p.summarySources ?? []).map(i=>`<a href="${escapeHtml(p.sources[i].url!)}" target="_blank" rel="noopener noreferrer">${p.sources[i].publisher} ↗</a>`).join('')}</div></section>
    ${fieldBrief(p)}
    <div class="case-status" data-tone="${p.statusTone ?? 'record'}"><span class="live-dot"></span> ${p.statusLabel ?? 'BUILDING & OWNER IDENTIFIED'} <strong>${p.statusTitle ?? 'Lumber storage documented'}</strong></div>
    <button id="view-submitted-images" class="image-callout">${icon('eye')} View ${p.images.length} evidence ${p.images.length===1?'image':'images'} ${icon('arrow')}</button>
    ${p.id==='stockyard-airsoft' ? `<section class="road-brief"><p class="eyebrow">THE MISSING ROAD</p><h3>Maps disagree.</h3><p>The submitted Google view leaves this corridor blank. OSM maps three service-road segments; one is tagged private.</p><div><button id="trace-road">Trace the road ${icon('crosshair')}</button><button data-evidence="osm-road">Compare the records ${icon('arrow')}</button></div></section>` : ''}
    <div class="findings">${p.findings.filter(f=>p.id!=='stockyard-airsoft'||['Property owner','Building match','Documented use'].includes(f.label)).map(f=>`<article class="finding finding-${f.state}"><span class="section-label">${f.label}</span><h3>${f.value}</h3><p>${f.detail}</p>${f.evidence.length ? `<button class="finding-evidence" data-evidence="${f.evidence[0]}">View evidence ${icon('arrow')}</button>` : ''}</article>`).join('')}</div>
    <div class="interest"><span class="eyebrow">THE QUESTION</span><p>${p.interest}</p></div>
    <button id="focus-place" class="primary-button">${icon('crosshair')} Show property on map ${icon('arrow')}</button>`;
  else if(tab === 'alert') content.innerHTML = crimeAlert(p,sourceMarkup);
  else if(tab === 'evidence') content.innerHTML = `${imageGallery(p)}<p class="evidence-intro">Records, maps and submitted images. Source links and dates are attached below.</p>${p.evidence.map((e,i)=>`<article class="evidence-item" id="evidence-${e.id}" tabindex="-1"><span class="evidence-number">${String(i+1).padStart(2,'0')}</span><div><span class="evidence-badge">${icon(e.sources.some(n=>p.sources[n].kind==='Official record')?'book':'info')} ${p.sources[e.sources[0]].kind}</span><h3>${e.title}</h3><p>${e.detail}</p>${imageAttachments(p,e.images)}${e.sources.map(n=>sourceMarkup(p.sources[n])).join('')}</div></article>`).join('')}
    <details class="remaining-questions"><summary>Unresolved items</summary><div>${p.unknowns.map(u=>`<p>${u}</p>`).join('')}<p>${p.locationNote}</p></div></details>
    <section class="next-steps"><span class="section-label">NEXT RECORDS TO CHECK</span>${p.nextSteps.map(s=>`<article><h3>${s.title}</h3><p>${s.detail}</p><a href="${escapeHtml(s.url)}" target="_blank" rel="noopener noreferrer">${s.label} ${icon('external')}</a></article>`).join('')}</section>`;
  else content.innerHTML = `<p class="eyebrow">EXPLORER ACCOUNTS</p>${(explorerNotes[p.id] ?? []).length ? explorerNotes[p.id].map(note=>`<article class="explorer-account"><h3>${note.author}</h3><p class="explorer-meta">Submitted ${dateLabel(note.submitted)}<br>Visit: ${escapeHtml(note.observed)}</p><blockquote>${escapeHtml(note.text)}</blockquote><p class="account-context">${escapeHtml(note.context)}</p><p class="explorer-meta">Submitted account · wording preserved</p></article>`).join('') : '<div class="no-explorer-notes"><h3>No explorer accounts on file.</h3><p>This site has public records, but no prior explorer has submitted a field account here yet.</p></div>'}<p class="local-note">Explorer accounts are separate from the sourced findings. Note submissions and a personal notebook are planned for a future update.</p>`;
  $('#trace-road')?.addEventListener('click',traceRoad);
  $('#view-submitted-images')?.addEventListener('click',()=>{tab='evidence';renderDossier();$('#tab-evidence').focus();});
  $('#focus-place')?.addEventListener('click',()=> {if(mapReady) {focusMap(p,16); if(innerWidth<850) $('.map-section').scrollIntoView({behavior:reducedMotion?'instant':'smooth'});} else toast('Map unavailable. The dossier and its sources are still accessible.');});
  document.querySelectorAll<HTMLButtonElement>('[data-evidence]').forEach(button=>button.addEventListener('click',()=>showEvidence(button.dataset.evidence!)));
  document.querySelectorAll<HTMLButtonElement>('[data-tab]').forEach(button=>{
    button.addEventListener('click',()=>{tab=button.dataset.tab!;renderDossier();$(`#tab-${tab}`).focus();});
    button.addEventListener('keydown',event=>{if(event.key==='ArrowLeft'||event.key==='ArrowRight'){event.preventDefault();tab=nextDeckView(p.id,tab,event.key==='ArrowRight'?1:-1);renderDossier();$(`#tab-${tab}`).focus();}});
  });
  $('#export-dossier').addEventListener('click',()=>exportDossier(p));
  cardMotion.revealDossier($('#dossier'));
  if(previousId===p.id)caseDeck.turn(previousFace,previousTab,tab,turnDirection);
}
function showEvidence(id: string, reveal = true) {
  tab='evidence'; renderDossier();
  const target=$('#evidence-'+id), panel=$('#dossier-content');
  if(reveal)target.focus({preventScroll:true});
  if(panel.scrollHeight>panel.clientHeight) panel.scrollTop+=target.getBoundingClientRect().top-panel.getBoundingClientRect().top-12;
  else if(reveal)target.scrollIntoView({block:'start',behavior:reducedMotion?'instant':'smooth'});
  if(reveal && innerWidth<=950) $('.dossier-dock').scrollIntoView({block:'start',behavior:reducedMotion?'instant':'smooth'});
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
  if(!visiblePlaces().some(p=>p.id===selected?.id))resetFilters();
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
  const notes = explorerNotes[p.id] ?? [];
  const profile = fieldProfiles[p.id];
  const text = [`# ${p.name}`,`Into The Facade · research in progress · reviewed ${p.reviewed ?? reviewed}`,'',p.address,p.summary,'','## Findings',...p.findings.map(f=>`- ${f.label}: ${f.value}\n  ${f.detail}`),'','## Geographic context',p.locationNote,`Area center: ${p.coordinates[1]}, ${p.coordinates[0]}`,`Parcel accounts: ${p.parcelAccounts.join(', ')}`,...(p.id==='stockyard-airsoft' ? [`County geometry retrieved: ${parcelSnapshot.provenance.retrievedAt}`,parcelSnapshot.provenance.queryUrl,'','## Road map comparison',roadSnapshot.provenance.interpretation,roadSnapshot.provenance.sourceUrl] : [`County geometry retrieved: ${additionalParcels.provenance.retrievedAt}`,additionalParcels.provenance.queryUrl]),'','## Evidence',...p.evidence.map(e=>`### ${e.title}\n${e.detail}\n${e.sources.map(n=>{const s=p.sources[n];return `Source: ${s.title} · ${s.publisher} · ${s.kind}\nDate: ${s.date}\nReviewed: ${s.reviewed}\n${s.url ?? 'Submitted screenshot; no verified source-page permalink. See submitted images below when available.'}\nMethod: ${s.method}`;}).join('\n\n')}`),...exportImageEvidence(p),'','## Unknowns',...p.unknowns.map(u=>`- ${u}`),'','## Next records',...p.nextSteps.map(s=>`- ${s.title}: ${s.detail}\n  ${s.url}`),'','## Urbex readout',profile.verdict,`Recorded activity: ${profile.activity.label}. ${profile.activity.detail}`,`Security evidence: ${profile.security.label}. ${profile.security.detail}`,...profile.sections.map(section=>`### ${section.title}\n${section.text}\nEvidence IDs: ${section.evidence.join(', ')}`),`${profile.contact.label}: ${profile.contact.url}`,'','## Explorer accounts',...notes.map(note=>`### ${note.author}\nSubmitted ${note.submitted}; visit ${note.observed}\n${note.context}\n\n${note.text}`)].join('\n');
  const url=URL.createObjectURL(new Blob([text],{type:'text/markdown;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download=`into-the-facade-${p.id}.md`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);toast('Dossier exported with sources, urbex findings and explorer accounts.');
}
function resetFilters() {query='';category='All';$<HTMLInputElement>('#search').value='';updateFilters();renderList();fitMap();}
function updateFilters() {
  document.querySelectorAll<HTMLButtonElement>('[data-category]').forEach(b=>{b.classList.toggle('active',b.dataset.category===category);b.setAttribute('aria-pressed',String(b.dataset.category===category));});
  $('#discovery-title').textContent = 'Location Recon';
}
function focusMap(place: Place, zoom: number) {
  if (!mapReady) return;
  if (compatMap) compatMap.focus(place.coordinates, zoom);
  else map?.flyTo({center:place.coordinates,zoom,pitch:is3d?52:0,bearing:is3d?-16:0,duration:reducedMotion?0:900,essential:false});
}
function fitMap() {
  const shown=visiblePlaces(); if(!mapReady||!shown.length)return;
  const ids=new Set(shown.map(p=>p.id));
  const points=parcelCollection.features.filter(f=>ids.has(f.properties?.placeId)).flatMap(f=>f.geometry.type==='Polygon'?f.geometry.coordinates.flat():[]);
  const coordinates=[...points,...shown.map(p=>p.coordinates)];
  const lngs=coordinates.map(p=>p[0]),lats=coordinates.map(p=>p[1]);
  const bounds: MapBounds = [[Math.min(...lngs),Math.min(...lats)],[Math.max(...lngs),Math.max(...lats)]];
  if (compatMap) compatMap.fit(bounds);
  else map?.fitBounds(bounds,{padding:{top:100,bottom:100,left:115,right:115},maxZoom:16,pitch:is3d?35:0,bearing:0,duration:reducedMotion?0:850});
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
      container:$('#map'),center:(selected?.coordinates ?? countyCenter),places,parcels:parcelCollection,roads:roadSnapshot as unknown as FeatureCollection,reducedMotion,
      select:id=>selectPlace(id,true), showEvidence:id=>showEvidence(id),
      onTileStatus:unavailable=>{
        if(generation!==mapGeneration)return;
        $('#map-note').textContent=unavailable?'Some street tiles could not load. Parcel outlines remain available.':'2D map active';
      },
    });
    mapReady=true; $('#map').dataset.renderer='2d';
    $('#map-status').classList.add('hidden'); $('#map-note').textContent='2D map active';
    renderList(); updateMapSelection(); if(selected)focusMap(selected,15.5);else fitMap();
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
    const instance=new LibreMap({container:'map',style:import.meta.env.BASE_URL+'styles/board.json',center:(selected?.coordinates ?? countyCenter),zoom:14.7,pitch:is3d?42:0,bearing:is3d?-12:0,attributionControl:false,canvasContextAttributes:{antialias:true},renderWorldCopies:false});
    map=instance;
    instance.addControl(new AttributionControl({compact:true,customAttribution:'<a href="https://assessor.oklahomacounty.org/" target="_blank" rel="noopener noreferrer">Parcel reference: Oklahoma County Assessor</a>'}),'bottom-right');
    mapTimeout=setTimeout(fallback,16000);
    instance.on('webglcontextlost',fallback);
    instance.on('load',()=>{
      if(generation!==mapGeneration)return;
      try {
        clearTimeout(mapTimeout);
        instance.addSource('county-parcels',{type:'geojson',data:parcelCollection});
        instance.addLayer({id:'candidate-parcels',type:'fill',source:'county-parcels',paint:{'fill-color':'#d28a59','fill-opacity':0.18}});
        instance.addLayer({id:'parcel-outlines',type:'line',source:'county-parcels',paint:{'line-color':mapInk,'line-width':2.5,'line-dasharray':[3,2]}});
        instance.addSource('osm-roads',{type:'geojson',data:roadSnapshot as unknown as FeatureCollection});
        instance.addLayer({id:'osm-road-highlight',type:'line',source:'osm-roads',layout:{'line-cap':'round','line-join':'round'},paint:{'line-color':'#ffe079','line-width':10,'line-opacity':0,'line-opacity-transition':{duration:0},'line-width-transition':{duration:0}}});
        instance.addLayer({id:'osm-service-roads',type:'line',source:'osm-roads',paint:{'line-color':'#7954a1','line-width':5,'line-opacity':.9}});
        instance.addLayer({id:'osm-private-road',type:'line',source:'osm-roads',paint:{'line-color':['case',['==',['get','access'],'private'],'#e9c6d7','#00000000'],'line-width':2,'line-dasharray':[3,2]}});
        places.forEach(p=>{const el=createPlaceMarker(p,id=>selectPlace(id,true),id=>showEvidence(id));markers.set(p.id,new Marker({element:el,anchor:'bottom-left',offset:[-16,-8]}).setLngLat(p.coordinates).addTo(instance));});
        mapReady=true; $('#map').dataset.renderer='styled';
        $('#map-status').classList.add('hidden'); renderList(); updateMapSelection(); if(selected)focusMap(selected,15.5);else fitMap();
        if(pendingRoadFocus)traceRoad();
      } catch { fallback(); }
    });
    instance.on('error',()=>{if(generation===mapGeneration&&!mapReady&&instance.isStyleLoaded())fallback();});
  } catch { fallback(); }
}
function showDialog(kind: 'about'|'sources'|'region') {
  const content = $('#dialog-content');
  if(kind==='region') content.innerHTML=`<h2 id="dialog-title">OKLAHOMA COUNTY / THREE FILES</h2><p>Stockyard Airsoft, former Eagle Industries, and the Rhode Island Avenue warehouse. Three properties investigated through county records, environmental reports and court documents.</p><button class="region-choice" id="choose-region">${icon('pin')}<span><strong>Oklahoma City + Midwest City</strong><small>${places.length} cases · ${claimCount} evidence entries</small></span>${icon('check')}</button><p class="dialog-footnote">The deck contains reviewed leads. It is not a live scan of abandoned properties.</p>`;
  else if(kind==='about') content.innerHTML=`<h2 id="dialog-title">Into The Facade</h2><p>Into The Facade is an open-source intelligence atlas for urban exploration. Research overlooked industrial sites before a visit: who controls the property, what the maps show, which hazards are documented, and whether the site is still in use.</p><div class="dialog-callout"><strong>Closed business ≠ empty building.</strong><p>It does not establish an abandoned building. Ownership, occupancy, condition, and access are separate findings, each with its own evidence.</p></div><p class="dialog-footnote">These three cases combine reviewed county records, environmental reports, court filings and dated parcel snapshots. Case history concerns the cited activity and date, not an accusation against a current owner or neighboring tenant. Illustrations are decorative. Explorer accounts are labeled separately from verified findings. Saved collections and a personal note editor are planned for a future update.</p>`;
  else content.innerHTML=`<h2 id="dialog-title">Sources & methods</h2><p>Public-record research, with a source and date for each claim. This is a reviewed snapshot, not continuous monitoring.</p><div class="method-list">
    <div><span>01</span><p><strong>Start with a lead</strong>Former business listings and submitted observations provide names and addresses. Directory closure labels are kept as leads.</p></div>
    <div><span>02</span><p><strong>Match the property</strong>County assessor accounts and parcel boundaries identify possible matches. Shared addresses stay unresolved until the building is matched.</p></div>
    <div><span>03</span><p><strong>Separate the records</strong>Deeds concern property; state filings concern entities and trade names; city files concern permits and inspections. An LLC status or a closed permit is not a vacancy finding.</p></div>
    <div><span>04</span><p><strong>Keep the gaps visible</strong>Compare dated occupancy clues, identify conflicts, and record the next verification step. Missing records do not prove that nothing happened.</p></div></div>
    <div class="dialog-links"><a href="${parcelMapUrl}" target="_blank" rel="noopener noreferrer">County parcel map ${icon('external')}</a><a href="${registryUrl}" target="_blank" rel="noopener noreferrer">Official entity / trade-name search ${icon('external')}</a><a href="${cityPortalUrl}" target="_blank" rel="noopener noreferrer">City records portal ${icon('external')}</a></div>
    <p class="dialog-footnote">Latest addition reviewed ${reviewLabel}. Each source keeps its own review date; county snapshots were retrieved November 13–14, 2026. Google Maps and MapQuest are public-facing proprietary services, not open datasets. ChamberofCommerce.org is a third-party guide; the Secretary of State is the registry. Automated reuse requires source-specific permission or licensing checks.</p>
    <p class="dialog-footnote">The styled basemap uses OpenFreeMap / OpenStreetMap; the 2D map uses OpenStreetMap image tiles. Both include attribution. Parcel overlays are county reference boundaries, not building outlines or a legal survey. The marker represents the candidate area. The highlighted service-road network is a reviewed OpenStreetMap snapshot, including a parking loop. A private tag belongs to one segment only. Generated card artwork is decorative; original source photographs are in Evidence. No live Overture, USGS, EPA, Google, or business-registry ingestion is running.</p>`;
  $<HTMLDialogElement>('#info-dialog').showModal();$('#choose-region')?.addEventListener('click',()=>{$<HTMLDialogElement>('#info-dialog').close();resetFilters();});
}
$('#places').addEventListener('click',event=>{
  const button=(event.target as HTMLElement).closest<HTMLButtonElement>('button');
  if(!button||button.closest('.is-leaving'))return;
  if(button.dataset.select){selectPlace(button.dataset.select,button.dataset.select!=='stockyard-airsoft');if(button.dataset.select==='stockyard-airsoft')traceRoad();}
  else if(button.hasAttribute('data-investigate-road')){selectPlace('stockyard-airsoft');showEvidence('osm-road',false);traceRoad();}
  else if(button.id==='reset-filters')resetFilters();
});
$('#search').addEventListener('input',()=>{query=$<HTMLInputElement>('#search').value;renderList();});
document.querySelectorAll<HTMLButtonElement>('[data-category]').forEach(b=>b.addEventListener('click',()=>{category=b.dataset.category!;updateFilters();renderList();fitMap();}));
$('#explore-nav').addEventListener('click',()=>{updateFilters();renderList();fitMap();});
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
window.addEventListener('hashchange',()=>{
  const id=location.hash.slice(1);
  if(places.some(p=>p.id===id))selectPlace(id,false);
  else if (!id) { caseDeck.cancel(); selected=undefined; pendingRoadFocus=false; stopRoadPulse(); renderList(); renderDossier(); updateMapSelection(); fitMap(); }
});
window.addEventListener('keydown',e=>{if(e.key==='/' && !['INPUT','TEXTAREA'].includes((e.target as HTMLElement).tagName) && !$<HTMLDialogElement>('#info-dialog').open && !$<HTMLDialogElement>('#evidence-dialog').open){e.preventDefault();$('#search').focus();}});
initEvidenceViewer(()=>selected);
renderList();renderDossier();updateMapSelection();centerActiveDeck(false);
if(new URLSearchParams(location.search).get('map')==='2d'||readStorage<string>('itf:map-renderer','styled')==='2d')void initCompatMap();
else initMap();
