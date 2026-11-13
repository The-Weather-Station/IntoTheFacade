import { Map as LibreMap, Marker, AttributionControl, setWorkerUrl } from 'maplibre-gl';
import workerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url';
import 'maplibre-gl/dist/maplibre-gl.css';
import './style.css';
import './map-board.css';
import { places, getPlace, filterPlaces, reviewed, type Place } from './data';
import { icon, architecture } from './art';
import { mapInk, placeColor } from './map-palette';

setWorkerUrl(workerUrl);
const $ = <T extends HTMLElement = HTMLElement>(selector: string) => document.querySelector<T>(selector)!;
const escapeHtml = (value: string) => value.replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]!));
function readStorage<T>(key: string, fallback: T): T { try { return JSON.parse(localStorage.getItem(key) ?? 'null') ?? fallback; } catch { return fallback; } }
const rawSaved = readStorage<unknown>('itf:saved', []);
let saved: string[] = Array.isArray(rawSaved) ? rawSaved.filter((id): id is string => typeof id === 'string' && places.some(p => p.id === id)) : [];
let selected = getPlace(location.hash.slice(1));
let query = '', category = 'All', savedOnly = false, tab = 'overview', is3d = true;
let map: LibreMap | null = null, mapReady = false, toastTimer: ReturnType<typeof setTimeout>;
const markers = new globalThis.Map<string, Marker>();
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

$('#app').innerHTML = `
  <a class="skip-link" href="#places">Skip to places</a>
  <header class="masthead">
    <a class="brand" href="#union-station" aria-label="Into The Facade home"><span class="brand-mark">${icon('logo')}</span><span>INTO THE FACADE<span class="brand-sub">AN ATLAS FOR THE CURIOUS</span></span></a>
    <nav class="main-nav" aria-label="Main navigation"><button class="nav-button active" id="explore-nav" aria-pressed="true">${icon('compass')} Explore</button><button class="nav-button" id="saved-nav" aria-pressed="false">${icon('bookmark')} Saved <span id="saved-count">${saved.length}</span></button></nav>
    <div class="header-right"><span class="edition"><span class="live-dot"></span> FIELD EDITION 001</span><button class="text-button" id="about-button">About this atlas ${icon('external')}</button></div>
  </header>
  <section class="intro" aria-label="Introduction"><div><p class="eyebrow">BEYOND THE FAMILIAR</p><h1>Every place has a <em>past.</em></h1></div><p class="intro-copy">Follow the structures. Trace the evidence.<br>Find the stories hiding in plain sight.</p><button class="region-button" id="region-button">${icon('pin')}<span><small>EXPLORING</small><strong>Oklahoma City, OK</strong></span>${icon('chevron')}</button></section>
  <main class="workspace">
    <aside class="discovery" aria-labelledby="discovery-title">
      <div class="panel-heading"><div><p class="eyebrow">THE FIELD INDEX</p><h2 id="discovery-title">Places to investigate</h2></div><span class="count-box">03</span></div>
      <div class="search-wrap">${icon('search')}<input id="search" type="search" placeholder="Search this collection…" aria-label="Search places" autocomplete="off"/><kbd>/</kbd></div>
      <div class="filters" role="group" aria-label="Filter by category"><button class="filter active" data-category="All" aria-pressed="true">All places</button><button class="filter" data-category="Rail heritage" aria-pressed="false">Rail heritage</button><button class="filter" data-category="Architecture" aria-pressed="false">Architecture</button></div>
      <div class="results-meta"><span id="results-count" role="status"></span><span>CURATED COLLECTION</span></div>
      <div id="places" class="places" tabindex="-1"></div>
      <div class="index-footer"><span class="mini-cross">+</span><div><strong>History, with a paper trail.</strong><p>Each dossier connects a place to the records behind its story.</p></div></div>
    </aside>
    <section class="map-section" aria-label="Interactive location map">
      <div id="map" aria-label="Oklahoma City exploration map"></div>
      <div class="map-top"><div class="map-tag"><span class="live-dot"></span> OKLAHOMA CITY <span class="divider">/</span> <span id="map-region-count">03 SITES</span></div><button id="view-toggle" class="map-button view-toggle" aria-pressed="true">${icon('layers')}<span>3D view</span></button></div>
      <div class="map-coordinate" id="map-coordinate">35.4577° N &nbsp; 97.5186° W</div>
      <div class="map-controls" role="group" aria-label="Map controls"><button class="map-button" id="zoom-in" aria-label="Zoom in">${icon('plus')}</button><button class="map-button" id="zoom-out" aria-label="Zoom out">${icon('minus')}</button><span></span><button class="map-button" id="fit-map" aria-label="Show all matching places">${icon('crosshair')}</button></div>
      <div class="map-key"><span class="key-square"></span> CURATED PLACE <span class="key-dot"></span> SELECTED</div>
      <div class="map-caption">SCHEMATIC GEOMETRY · APPROXIMATE LOCATIONS</div>
      <div id="map-status" class="map-status" role="status">${icon('globe')}<strong>Opening the atlas</strong><span>Loading geographic context…</span></div>
      <button class="mobile-index" id="mobile-index">${icon('list')} Browse places</button>
    </section>
    <aside id="dossier" class="dossier" aria-label="Selected place dossier"></aside>
  </main>
  <footer class="app-footer"><span>INTO THE FACADE <i>/</i> OKC RESEARCH EDITION</span><button id="sources-button">${icon('book')} Sources & methodology</button><span>RECORDS REVIEWED <b>11 NOV 2026</b></span></footer>
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
  $('#results-count').textContent = `${String(visible.length).padStart(2,'0')} ${visible.length === 1 ? 'PLACE' : 'PLACES'}${savedOnly ? ' SAVED' : ' FOUND'}`;
  $('#map-region-count').textContent = `${String(visible.length).padStart(2,'0')} SITES`;
  $('#saved-count').textContent = String(saved.length);
  $('#places').innerHTML = visible.length ? visible.map(p => `
    <article class="place-card ${p.id === selected.id ? 'selected' : ''}">
      <button class="place-select" data-select="${p.id}" aria-pressed="${p.id === selected.id}" aria-label="Open ${p.name} dossier"><div class="card-art">${architecture(p.id)}<span class="card-number">${p.number}</span><span class="card-year">EST. ${p.year}</span></div><div class="card-copy"><span class="card-category">${p.category}</span><h3>${p.name}${icon('arrow')}</h3><p>${p.subtitle}</p><div class="card-meta"><span>${icon('check')} ${p.evidence.length} sourced facts</span><span>${p.id === selected.id ? 'SELECTED' : 'VIEW DOSSIER'}</span></div></div></button>
      <button class="card-save ${saved.includes(p.id) ? 'is-saved' : ''}" data-save="${p.id}" aria-pressed="${saved.includes(p.id)}" aria-label="${saved.includes(p.id) ? 'Unsave' : 'Save'} ${p.name}">${icon('bookmark')}</button>
    </article>`).join('') : `<div class="empty-state">${icon(savedOnly ? 'bookmark' : 'search')}<h3>${savedOnly ? 'Your next discovery awaits.' : 'No places found.'}</h3><p>${savedOnly ? 'Save a place to keep its dossier close at hand.' : 'Try a different name or category in this three-place collection.'}</p><button class="secondary-button" id="reset-filters">Explore all places ${icon('arrow')}</button></div>`;
  document.querySelectorAll<HTMLButtonElement>('[data-select]').forEach(button => button.addEventListener('click', () => selectPlace(button.dataset.select!, true)));
  document.querySelectorAll<HTMLButtonElement>('[data-save]').forEach(button => button.addEventListener('click', () => toggleSave(button.dataset.save!)));
  $('#reset-filters')?.addEventListener('click', resetFilters);
  markers.forEach((marker, id) => {
    marker.getElement().style.display = visible.some(p => p.id === id) ? '' : 'none';
    marker.getElement().classList.toggle('selected', id === selected.id);
    marker.getElement().setAttribute('aria-pressed', String(id === selected.id));
  });
  if (mapReady && map) {
    const ids = visible.map(p=>p.id);
    const filter = ['in', ['get','id'], ['literal',ids]] as any;
    map.setFilter('place-footprints', filter); map.setFilter('place-extrusions', filter); map.setFilter('place-outlines', filter);
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
  if(fly && mapReady && map) map.flyTo({center:selected.coordinates,zoom:15.5,pitch:is3d?52:0,bearing:is3d?-16:0,duration:reducedMotion?0:950,essential:false});
  if(fly && window.innerWidth < 850) $('#dossier').scrollIntoView({behavior:reducedMotion?'instant':'smooth',block:'start'});
}
function updateMapSelection() {
  $('#map-coordinate').textContent = `${selected.coordinates[1].toFixed(4)}° N   ${Math.abs(selected.coordinates[0]).toFixed(4)}° W`;
  if(mapReady && map) {
    map.setPaintProperty('place-outlines','line-width',['case',['==',['get','id'],selected.id],3,1.5]);
    map.setPaintProperty('place-footprints','fill-opacity',['case',['==',['get','id'],selected.id],1,0.8]);
  }
}
function renderDossier() {
  const p = selected, isSaved = saved.includes(p.id);
  $('#dossier').innerHTML = `
    <div class="dossier-top"><span class="eyebrow">LOCATION DOSSIER <span>/ ${p.number}</span></span><button id="dossier-save" class="icon-button ${isSaved?'is-saved':''}" aria-label="${isSaved?'Unsave':'Save'} ${p.name}" aria-pressed="${isSaved}">${icon('bookmark')}</button></div>
    <div class="dossier-hero">${architecture(p.id)}<span class="hero-label">ARCHITECTURAL STUDY · ILLUSTRATIVE</span><span class="hero-corner">${p.number}</span></div>
    <div class="dossier-title"><p class="eyebrow rust">${p.category} <span>•</span> ${p.year}</p><h2>${p.name}</h2><p>${icon('pin')} ${p.address}</p></div>
    <div class="dossier-tabs" role="tablist" aria-label="Dossier sections"><button role="tab" id="tab-overview" data-tab="overview" aria-controls="dossier-content" aria-selected="${tab==='overview'}" tabindex="${tab==='overview'?0:-1}" class="${tab==='overview'?'active':''}">Overview</button><button role="tab" id="tab-evidence" data-tab="evidence" aria-controls="dossier-content" aria-selected="${tab==='evidence'}" tabindex="${tab==='evidence'?0:-1}" class="${tab==='evidence'?'active':''}">Evidence <span>${p.evidence.length}</span></button><button role="tab" id="tab-notes" data-tab="notes" aria-controls="dossier-content" aria-selected="${tab==='notes'}" tabindex="${tab==='notes'?0:-1}" class="${tab==='notes'?'active':''}">Field notes</button></div>
    <div id="dossier-content" class="dossier-content" role="tabpanel" aria-labelledby="tab-${tab}" tabindex="0"></div>
    <div class="dossier-bottom"><span><span class="live-dot"></span> REVIEWED 11 NOV 2026</span><button id="export-dossier" class="text-button" aria-label="Download ${p.name} dossier">${icon('download')} Export</button></div>`;
  const content = $('#dossier-content');
  if(tab === 'overview') content.innerHTML = `
    <p class="dossier-summary">${p.summary}</p><div class="interest"><span class="eyebrow">WHY LOOK CLOSER</span><p>${p.interest}</p></div>
    <div class="tags">${p.tags.map(t=>`<span>${t}</span>`).join('')}</div>
    <div class="fact-preview"><span class="section-label">FROM THE RECORD</span><p>${icon('check')} ${p.evidence[0].detail}</p><button class="text-button accent" id="view-evidence">Trace the evidence ${icon('arrow')}</button></div>
    <div class="unknown-block">${icon('info')}<div><strong>Access not verified</strong><p>${p.unknowns[0]}</p></div></div>
    <button id="focus-place" class="primary-button">${icon('crosshair')} Focus on map ${icon('arrow')}</button>`;
  else if(tab === 'evidence') content.innerHTML = `<p class="evidence-intro">Historical claims, connected to their sources. Review dates describe our research, not current site conditions.</p>${p.evidence.map((e,i)=>`<article class="evidence-item"><span class="evidence-number">0${i+1}</span><div><span class="evidence-badge">${icon('check')} SOURCED</span><h3>${e.title}</h3><p>${e.detail}</p><a href="${p.sources[e.source].url}" target="_blank" rel="noopener noreferrer">${p.sources[e.source].publisher} ${icon('external')}</a><small>SOURCE: ${p.sources[e.source].date}</small></div></article>`).join('')}<div class="unknown-block">${icon('info')}<div><strong>Still unknown</strong>${p.unknowns.map(u=>`<p>${u}</p>`).join('')}<p>Coordinates are approximate; geometry and illustrations are schematic.</p></div></div>`;
  else {
    const storedNote = readStorage<unknown>(`itf:note:${p.id}`,'');
    const note = typeof storedNote === 'string' ? storedNote : '';
    content.innerHTML = `<label class="section-label" for="field-note">YOUR OBSERVATIONS</label><p class="evidence-intro">Keep questions, details to investigate, or observations for this place.</p><textarea id="field-note" maxlength="5000" placeholder="What caught your attention? What would you like to find out?">${escapeHtml(note)}</textarea><div class="note-meta"><span id="note-count">${note.length} / 5000</span><span>Stored on this browser</span></div><button id="save-note" class="primary-button">${icon('check')} Save field note</button><p class="local-note">Your notes stay on this device. Export the dossier to keep a separate copy.</p>`;
    $('#field-note').addEventListener('input',()=> {$('#note-count').textContent=`${$<HTMLTextAreaElement>('#field-note').value.length} / 5000`;});
    $('#save-note').addEventListener('click',()=> {if(storeValue(`itf:note:${p.id}`,$<HTMLTextAreaElement>('#field-note').value)) toast('Field note saved on this browser.');});
  }
  $('#dossier-save').addEventListener('click',()=>toggleSave(p.id));
  $('#focus-place')?.addEventListener('click',()=> {if(mapReady && map) {map.flyTo({center:p.coordinates,zoom:16,pitch:is3d?52:0,duration:reducedMotion?0:900}); if(innerWidth<850) $('.map-section').scrollIntoView({behavior:reducedMotion?'instant':'smooth'});} else toast('Map unavailable. The dossier and its sources are still accessible.');});
  $('#view-evidence')?.addEventListener('click',()=> {tab='evidence';renderDossier();$('#tab-evidence').focus();});
  document.querySelectorAll<HTMLButtonElement>('[data-tab]').forEach(button=>{
    button.addEventListener('click',()=>{tab=button.dataset.tab!;renderDossier();$(`#tab-${tab}`).focus();});
    button.addEventListener('keydown',event=>{if(event.key==='ArrowLeft'||event.key==='ArrowRight'){event.preventDefault();const tabs=['overview','evidence','notes'];tab=tabs[(tabs.indexOf(tab)+(event.key==='ArrowRight'?1:2))%3];renderDossier();$(`#tab-${tab}`).focus();}});
  });
  $('#export-dossier').addEventListener('click',()=>exportDossier(p));
}
function exportDossier(p: Place) {
  const note = readStorage<unknown>(`itf:note:${p.id}`,'');
  const text = [`# ${p.name}`,`Into The Facade · research edition · reviewed ${reviewed}`,'',p.summary,'',`Approximate coordinates: ${p.coordinates[1]}, ${p.coordinates[0]}`,'Geometry and illustrations are schematic; dimensions are not measured.','','## Evidence',...p.evidence.map(e=>`- ${e.detail}\n  Source: ${p.sources[e.source].publisher} (${p.sources[e.source].date})\n  ${p.sources[e.source].url}`),'','## Unknowns',...p.unknowns.map(u=>`- ${u}`),'','## Field notes',typeof note === 'string' ? note : ''].join('\n');
  const url=URL.createObjectURL(new Blob([text],{type:'text/markdown;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download=`into-the-facade-${p.id}.md`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);toast('Dossier exported with sources and saved notes.');
}
function resetFilters() {query='';category='All';savedOnly=false;$<HTMLInputElement>('#search').value='';updateFilters();renderList();fitMap();}
function updateFilters() {
  document.querySelectorAll<HTMLButtonElement>('[data-category]').forEach(b=>{b.classList.toggle('active',b.dataset.category===category);b.setAttribute('aria-pressed',String(b.dataset.category===category));});
  $('#explore-nav').classList.toggle('active',!savedOnly);$('#saved-nav').classList.toggle('active',savedOnly);
  $('#explore-nav').setAttribute('aria-pressed',String(!savedOnly));$('#saved-nav').setAttribute('aria-pressed',String(savedOnly));
  $('#discovery-title').textContent = savedOnly?'Your saved places':'Places to investigate';
}
function fitMap() { const shown=visiblePlaces(); if(!mapReady||!map||!shown.length)return;const lngs=shown.map(p=>p.coordinates[0]),lats=shown.map(p=>p.coordinates[1]);map.fitBounds([[Math.min(...lngs),Math.min(...lats)],[Math.max(...lngs),Math.max(...lats)]],{padding:{top:100,bottom:100,left:70,right:85},maxZoom:15.2,pitch:is3d?42:0,bearing:is3d?-12:0,duration:reducedMotion?0:850}); }
function footprints() {
  return {type:'FeatureCollection' as const,features:places.map(p=>{
    const [x,y]=p.coordinates,[w,h]=p.footprint;
    const ring = p.id==='gold-dome' ? Array.from({length:25},(_,i)=>[x+Math.cos(i/24*Math.PI*2)*w/2,y+Math.sin(i/24*Math.PI*2)*h/2]) : [[x-w/2,y-h/2],[x+w/2,y-h/2],[x+w/2,y+h/2],[x-w/2,y+h/2],[x-w/2,y-h/2]];
    return {type:'Feature' as const,properties:{id:p.id,height:p.height,color:placeColor(p.id)},geometry:{type:'Polygon' as const,coordinates:[ring]}};
  })};
}
function mapFailure() {
  if(mapReady)return;
  $('#map-status').innerHTML=`${icon('globe')}<strong>The map couldn’t connect.</strong><span>You can still explore every dossier in the field index.</span><button class="secondary-button" id="retry-map">Try again ${icon('arrow')}</button>`;$('#map-status').classList.remove('hidden');$('#retry-map').addEventListener('click',initMap);
}
function initMap() {
  mapReady=false;markers.forEach(m=>m.remove());markers.clear();map?.remove();map=null;
  $('#map-status').innerHTML=`${icon('globe')}<strong>Opening the atlas</strong><span>Loading geographic context…</span>`;$('#map-status').classList.remove('hidden');
  try {
    if (import.meta.env.DEV && new URLSearchParams(location.search).has('test-map-failure')) { mapFailure(); return; }
    map=new LibreMap({container:'map',style:`${import.meta.env.BASE_URL}styles/board.json`,center:[-97.520,35.475],zoom:12.9,pitch:is3d?42:0,bearing:is3d?-12:0,attributionControl:false,canvasContextAttributes:{antialias:true},renderWorldCopies:false});
    map.addControl(new AttributionControl({compact:true}),'bottom-right');
    const instance=map;
    const timeout=setTimeout(()=>{if(map===instance)mapFailure();},16000);
    map.on('load',()=>{
      if(map!==instance)return;clearTimeout(timeout);mapReady=true;
      map.addSource('curated-places',{type:'geojson',data:footprints()});
      map.addLayer({id:'place-footprints',type:'fill',source:'curated-places',paint:{'fill-color':['get','color'],'fill-opacity':0.8}});
      map.addLayer({id:'place-outlines',type:'line',source:'curated-places',paint:{'line-color':mapInk,'line-width':1.5}});
      map.addLayer({id:'place-extrusions',type:'fill-extrusion',source:'curated-places',layout:{visibility:is3d?'visible':'none'},paint:{'fill-extrusion-color':['get','color'],'fill-extrusion-height':['get','height'],'fill-extrusion-opacity':1,'fill-extrusion-vertical-gradient':false}});
      places.forEach(p=>{const el=document.createElement('button');el.className=`map-marker ${p.id===selected.id?'selected':''}`;el.style.setProperty('--place-color',placeColor(p.id));el.setAttribute('aria-label',`Select ${p.name}`);el.setAttribute('aria-pressed',String(p.id===selected.id));el.innerHTML=`<span class="marker-square">${p.number}</span><span class="marker-name">${p.name}</span>`;el.addEventListener('click',()=>selectPlace(p.id,true));markers.set(p.id,new Marker({element:el,anchor:'bottom-left',offset:[-16,-8]}).setLngLat(p.coordinates).addTo(map!));});
      $('#map-status').classList.add('hidden');renderList();updateMapSelection();fitMap();
    });
    map.on('error',()=>{if(!mapReady && map?.isStyleLoaded())mapFailure();});
  } catch { mapFailure(); }
}
function showDialog(kind: 'about'|'sources'|'region') {
  const content = $('#dialog-content');
  if(kind==='region') content.innerHTML=`<h2 id="dialog-title">Start with a place.</h2><p>This first field edition covers three landmarks in Oklahoma City. Choose a site in the index to open its research dossier.</p><button class="region-choice" id="choose-region">${icon('pin')}<span><strong>Oklahoma City, Oklahoma</strong><small>3 places · rail heritage & architecture</small></span>${icon('check')}</button><p class="dialog-footnote">More regions belong to the next chapter. This edition uses a curated collection rather than a live discovery scan.</p>`;
  else if(kind==='about') content.innerHTML=`<h2 id="dialog-title">Look beyond the facade.</h2><p>Into The Facade is an atlas for investigating the overlooked structures and layered histories around us.</p><p>Explore a place, follow its original sources, and keep your own field notes. This initial Oklahoma City edition demonstrates that complete research loop.</p><div class="dialog-callout"><strong>Three places. Nine sourced facts. Room for questions.</strong><p>Historic significance does not establish current access or condition. Each dossier keeps those unknowns visible.</p></div><p class="dialog-footnote">The architectural studies and 3D blocks are illustrative. Saved places and notes are stored only in this browser. The live basemap requires an internet connection.</p>`;
  else content.innerHTML=`<h2 id="dialog-title">Follow the paper trail.</h2><p>This edition combines manually reviewed historical sources with a live geographic basemap. Claims are attributed individually in each dossier.</p><div class="method-list"><div><span>01</span><p><strong>Historical evidence</strong>Scissortail Park, the City of Oklahoma City, the Oklahoma Historical Society archive, and the National Park Service.</p></div><div><span>02</span><p><strong>Geographic context</strong>OpenFreeMap’s basemap uses OpenStreetMap and other attributed map data. Selected point coordinates are approximate and manually curated.</p></div><div><span>03</span><p><strong>Honest representations</strong>Highlighted building footprints, heights, and architectural illustrations are schematic. They are not surveyed or reconstructed models.</p></div></div><p class="dialog-footnote">Records reviewed November 11, 2026. The demo does not query Overture, USGS, or EPA live. Its historical source dates are shown separately from the review date.</p><div class="dialog-links"><a href="https://openfreemap.org/" target="_blank" rel="noopener noreferrer">OpenFreeMap ${icon('external')}</a><a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">Map attribution ${icon('external')}</a></div>`;
  $<HTMLDialogElement>('#info-dialog').showModal();$('#choose-region')?.addEventListener('click',()=>{$<HTMLDialogElement>('#info-dialog').close();resetFilters();});
}
$('#search').addEventListener('input',()=>{query=$<HTMLInputElement>('#search').value;renderList();});
document.querySelectorAll<HTMLButtonElement>('[data-category]').forEach(b=>b.addEventListener('click',()=>{category=b.dataset.category!;updateFilters();renderList();fitMap();}));
$('#explore-nav').addEventListener('click',()=>{savedOnly=false;updateFilters();renderList();fitMap();});
$('#saved-nav').addEventListener('click',()=>{savedOnly=true;updateFilters();renderList();fitMap();});
$('#view-toggle').addEventListener('click',()=>{is3d=!is3d;$('#view-toggle').setAttribute('aria-pressed',String(is3d));$('#view-toggle').innerHTML=`${icon('layers')}<span>${is3d?'3D view':'2D view'}</span>`;if(mapReady&&map){map.setLayoutProperty('place-extrusions','visibility',is3d?'visible':'none');map.easeTo({pitch:is3d?52:0,bearing:is3d?-12:0,duration:reducedMotion?0:600});}});
$('#zoom-in').addEventListener('click',()=>map?.zoomIn({duration:reducedMotion?0:250}));$('#zoom-out').addEventListener('click',()=>map?.zoomOut({duration:reducedMotion?0:250}));$('#fit-map').addEventListener('click',fitMap);
$('#about-button').addEventListener('click',()=>showDialog('about'));$('#sources-button').addEventListener('click',()=>showDialog('sources'));$('#region-button').addEventListener('click',()=>showDialog('region'));
$('#close-dialog').addEventListener('click',()=> $<HTMLDialogElement>('#info-dialog').close());$('#info-dialog').addEventListener('click',event=>{if(event.target===$('#info-dialog')){const rect=$('#info-dialog').getBoundingClientRect();if(event.clientX<rect.left||event.clientX>rect.right||event.clientY<rect.top||event.clientY>rect.bottom)$<HTMLDialogElement>('#info-dialog').close();}});
$('#mobile-index').addEventListener('click',()=>$('.discovery').scrollIntoView({behavior:reducedMotion?'instant':'smooth'}));
window.addEventListener('hashchange',()=>{const id=location.hash.slice(1);if(places.some(p=>p.id===id))selectPlace(id,false);});
window.addEventListener('keydown',e=>{if(e.key==='/' && !['INPUT','TEXTAREA'].includes((e.target as HTMLElement).tagName) && !$<HTMLDialogElement>('#info-dialog').open){e.preventDefault();$('#search').focus();}});
renderList();renderDossier();initMap();
