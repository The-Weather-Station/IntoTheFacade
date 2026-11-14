export type HazardCertainty = 'Confirmed' | 'Likely' | 'Potential';
export type HazardKind = 'structural' | 'chemical' | 'vapor' | 'loading';
export interface SiteHazard {
  kind: HazardKind;
  label: string;
  certainty: HazardCertainty;
  detail: string;
  evidence: string[];
}

// Case-level assessments attached to the existing property reference point.
// These are not surveyed hazard positions or a live conditions report.
export const caseHazards: Record<string, SiteHazard[]> = {
  'stockyard-airsoft': [
    {kind:'structural',label:'Structural hazards',certainty:'Likely',detail:'Research assessment based on the county warehouse condition field “Poor”. A current engineering inspection is not on file.',evidence:['building-inventory']},
    {kind:'loading',label:'Loading / vehicles',certainty:'Potential',detail:'County imagery documents stored lumber, and the company lists lumber operations. Moving loads, vehicles and stacked material are pre-visit concerns; no onsite incident is established.',evidence:['building-photo-match','urbex-stockyard-operator']},
  ],
  'eagle-industries': [
    {kind:'chemical',label:'Chemical contamination',certainty:'Confirmed',detail:'EPA records document TCE and 1,2-DCA in soil and groundwater. Confirmed refers to recorded contamination, not a measurement of current personal exposure.',evidence:['urbex-eagle-exposure','eagle-cleanup-status']},
    {kind:'vapor',label:'Vapor intrusion',certainty:'Potential',detail:'EPA identifies potential vapor intrusion into homes or businesses. The reviewed records do not establish a current indoor-air concentration.',evidence:['urbex-eagle-exposure']},
  ],
  'rhode-island-warehouse': [
    {kind:'loading',label:'Loading / dock edges',certainty:'Potential',detail:'The broker advertises loading docks and a drive-in ramp. Falls at dock edges and vehicle movement are general loading-area concerns, not findings from a site safety inspection.',evidence:['urbex-warehouse-viewing']},
  ],
};
