import type { Place } from './data';
import { caseHazards, type HazardKind } from './hazards';
import { placeColor } from './map-palette';

// Small ink pictograms extend the existing board-map token system.
const symbols: Record<HazardKind,string> = {
  structural:'<path d="M5 27V10l11-6 11 6v17H5Z M5 13h22 M16 5l-3 8 6 5-5 9 M8 17h3m10 0h3M8 22h3m10 0h3"/>',
  chemical:'<path d="M8 6h16v22H8Z M8 10h16M8 24h16M12 6V3h8v3"/><path d="M16 12c-2 3-4 5-4 7a4 4 0 0 0 8 0c0-2-2-4-4-7Z" fill="currentColor"/>',
  vapor:'<path d="M4 28V18h24v10M9 28v-6h4v6M19 28v-6h4v6M7 13c-6-5 5-6 0-11M16 13c-6-5 5-6 0-11M25 13c-6-5 5-6 0-11"/>',
  loading:'<path d="M3 23V13h12v10H3ZM8 13V6h9v17h11M22 23V9M22 18h7M4 18h10"/><circle cx="7" cy="26" r="3"/><circle cx="16" cy="26" r="3"/>',
  criminal:'<path d="M5 5h22v23H5ZM10 5v23M16 5v23M22 5v23M5 11h22M5 22h22"/>',
};
const shortLabels: Record<HazardKind,string> = {structural:'Structural',chemical:'Chemical',vapor:'Vapor',loading:'Loading',criminal:'CRIMINAL'};

export function createPlaceMarker(place: Place, select: (id:string)=>void, showEvidence:(id:string)=>void) {
  const root = document.createElement('div'); root.className='location-marker';
  root.dataset.place=place.id;
  const button=document.createElement('button'); button.type='button'; button.className='map-marker';
  button.style.setProperty('--place-color',placeColor(place.id));
  button.setAttribute('aria-label',`Select ${place.name}`);
  const number=document.createElement('span'); number.className='marker-square'; number.textContent=place.number;
  const name=document.createElement('span'); name.className='marker-name'; name.textContent=place.name;
  button.append(number,name); button.addEventListener('click',()=>select(place.id)); root.append(button);
  root.append(createHazardGroup(place,showEvidence)); return root;
}

export function createHazardGroup(place: Place, showEvidence:(id:string)=>void) {
  const hazards=document.createElement('div'); hazards.className='map-hazards'; hazards.hidden=true;
  hazards.setAttribute('role','group'); hazards.setAttribute('aria-label',`${place.name} hazard indicators`);
  for(const hazard of caseHazards[place.id] ?? []) {
    const status = hazard.timeframe ?? hazard.certainty;
    const token=document.createElement('button'); token.type='button'; token.className='hazard-token';
    token.dataset.certainty=hazard.certainty.toLowerCase(); token.dataset.hazard=hazard.kind;
    token.setAttribute('aria-label',`${status} ${hazard.label.toLowerCase()} at ${place.name}. View evidence.`);
    token.title=`${status}: ${hazard.label}. ${hazard.detail} View cited record.`;
    token.innerHTML=`<svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="square" stroke-linejoin="miter" aria-hidden="true">${symbols[hazard.kind]}</svg><strong>${shortLabels[hazard.kind]}</strong><span>${status}</span>`;
    token.addEventListener('pointerdown',event=>event.stopPropagation());
    token.addEventListener('click',event=>{event.stopPropagation();showEvidence(hazard.evidence[0]);});
    hazards.append(token);
  }
  const caption=document.createElement('small'); caption.className='map-hazard-caption'; caption.textContent='CASE HAZARDS · VIEW RECORDS';
  hazards.append(caption); return hazards;
}

export function setMarkerSelected(root: HTMLElement, selected: boolean) {
  root.classList.toggle('selected',selected);
  const button=root.querySelector<HTMLElement>('.map-marker')!;
  button.classList.toggle('selected',selected); button.setAttribute('aria-pressed',String(selected));
  root.querySelector<HTMLElement>('.map-hazards')!.hidden=!selected;
}
