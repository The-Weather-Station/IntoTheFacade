import { artUrl } from './generated-art';
import type { Place, Source } from './data';

export const alertEvidenceIds = ['warehouse-defendants', 'warehouse-network', 'warehouse-seizure', 'warehouse-disposition', 'warehouse-affiliation'];

export function crimeAlert(p: Place, sourceMarkup: (source: Source) => string) {
  return `<section class="crime-alert" aria-label="ALERT!!! ALERT!!! — shipping case records">
    <p class="alert-scroll-cue">SCROLL DOWN</p>
    <div class="alert-art">
      <img src="${artUrl('organized-alert-card')}" alt="ALERT!!! ALERT!!! — fictional gas-masked communist villain with red sirens and realistic theatrical bloodstains; no defendant is depicted" width="1024" height="1536" decoding="async">
      <span class="siren-glow left" aria-hidden="true"></span><span class="siren-glow right" aria-hidden="true"></span>
    </div>
    ${alertEvidenceIds.map(id=>{
      const e=p.evidence.find(entry=>entry.id===id)!;
      return `<section class="alert-record"><h4>${e.title}</h4><p>${e.detail}</p>${e.sources.map(i=>sourceMarkup(p.sources[i])).join('')}</section>`;
    }).join('')}
    <p class="alert-context">Charges are allegations unless resolved by a conviction. The July 2026 state record supplies a sentencing update for Deping Sun only; complete current dispositions were not independently retrieved from OSCN. <a href="https://www.oscn.net/dockets/GetCaseInformation.aspx?db=oklahoma&amp;number=CF-2025-1618&amp;cmid=4423191" target="_blank" rel="noopener noreferrer">Open the court docket ↗</a></p>
    <p class="alert-context">For site recon: this history does not establish current criminal activity or abandonment. Later broker material advertises Suite 109 for lease. The villain, sirens and blood are decorative artwork, separate from the records and evidence photos.</p>
  </section>`;
}
