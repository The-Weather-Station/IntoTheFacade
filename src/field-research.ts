import type { Place, Source, Evidence } from './data';

export interface FieldProfile {
  verdict: string;
  activity: { level: number; label: string; detail: string; evidence: string[] };
  security: { level: number | null; label: string; detail: string; evidence: string[] };
  sections: { title: string; text: string; evidence: string[] }[];
  contact: { label: string; url: string; detail: string };
}
const reviewed = '2026-11-14';
const lawUrl = 'https://www.oscn.net/applications/oscn/deliverdocument.asp?box1=21++++++++&box2=OS&box3=1835';
const source = (title: string, publisher: string, url: string, date: string, method: string, kind: Source['kind'] = 'Official record'): Source => ({title,publisher,url,date,method,kind,reviewed});
const accessLaw = source('21 O.S. §1835 · entry onto private property','Oklahoma State Courts Network',lawUrl,'Current 2026 text; amendment history includes November 1, 2023','Read current statutory text. It covers specified entry without permission or after prohibition, with exceptions. General legal context, not a determination of rights at a particular property.');
const streetSource = source('Roads in OKC · public and private streets','City of Oklahoma City','https://www.okc.gov/Infrastructure-Development/Public-Works/Resident-and-Community-Resources/Roads-in-OKC','Undated city guidance; reviewed November 14, 2026','Read the city explanation that private streets may lack gates or markings and its direction to the street database. This does not classify an entire site corridor.');

const additions: Record<string, {sources: Source[]; evidence: Evidence[]}> = {
  'stockyard-airsoft': {
    sources: [
      source('Mid-States OKC · branch and product offering','Snavely Forest Products','https://snavelyforestproducts.com/branch-locations/oklahoma-city-oklahoma/','Page template displays October 28, 2026; read November 14, 2026','Read the company listing for 2701 SW 15th and advertised lumber/building products. The page timestamp is not an onsite inspection or proof of every room’s use.','Business website'),
      source('Mid-States OKC · public contact channel','Snavely Forest Products','https://snavelyforestproducts.com/contact-us/','Live contact page; branch-entry update date unspecified','Read the address, public branch telephone and inquiry form. This identifies a channel for requesting permission, not a grant of entry.','Business website'),
      streetSource, accessLaw,
    ],
    evidence: [
      {id:'urbex-stockyard-operator',title:'An operating-business lead and a permission contact',detail:'Snavely currently advertises its Mid-States Oklahoma City branch at 2701 SW 15th St, with lumber and building-product offerings and public telephone 800-234-0171. The dedicated branch page displays an October 28, 2026 CMS timestamp. This strengthens the business-use context; it does not establish how every room of the former airsoft building is used. The contact form is a way to request an authorized visit.',sources:[0,1]},
      {id:'urbex-street-status',title:'An ungated road can still be private',detail:'OKC Public Works explains that some private streets are not clearly marked or gated and directs readers to its street database. This matters to the missing-road lead: a mapped line, absent gate or blank Google corridor cannot establish public passage. The existing OSM geometry remains a map comparison, not a visitor route.',sources:[2]},
      {id:'urbex-stockyard-permission',title:'Permission is a separate record to obtain',detail:'Oklahoma’s current §1835 includes specified entry onto another’s land without owner or lawful-occupant permission, as well as entry after prohibition, with exceptions. A closed venue or missing sign is not a blanket access grant. No recreational entry permission has been documented for these parcels.',sources:[3]},
    ],
  },
  'eagle-industries': {
    sources: [
      source('Eagle Industries · cleanup activities and site setting','U.S. Environmental Protection Agency','https://cumulis.epa.gov/supercpad/SiteProfiles/index.cfm?fuseaction=second.cleanup&id=0607068','Live agency summary checked November 14, 2026; site-setting description undated','Read perimeter fencing, separately fenced residence, contaminants and potential vapor-intrusion discussion. This is not a current gate inspection or an indoor-air measurement.'),
      source('Eagle Industries · health and environment','U.S. Environmental Protection Agency','https://cumulis.epa.gov/supercpad/SiteProfiles/index.cfm?fuseaction=second.Healthenv&id=0607068','Status table checked November 14, 2026','Read TCE/1,2-DCA soil and groundwater evidence and Insufficient Data entries for human-exposure and groundwater-migration control. Do not turn an incomplete control conclusion into a specific exposure estimate.'),
      source('Eagle Industries · field sampling plan','U.S. EPA public document repository','https://semspub.epa.gov/work/06/100018503.pdf','December 13, 2019; section 4.1.1','Read owner-agreement access and owner-coordinated security for authorized investigation personnel. Historical project arrangements do not authorize public entry.'),
      source('Eagle Industries · DEQ public project contact','Oklahoma Department of Environmental Quality','https://oklahoma.gov/deq/divisions/land-protection/cleanup-redevelopment/superfund/eagle-industries-superfund-site.html','Page last modified September 21, 2026; checked November 14, 2026','Read the public site-project contact and site address. Agency information is a route to clarify conditions, not recreational access permission.'), accessLaw,
    ],
    evidence: [
      {id:'urbex-eagle-controls',title:'Fencing and controlled investigation access are documented',detail:'EPA describes a fenced facility and a separately fenced residence. The December 2019 sampling plan describes site access under an owner agreement and owner-coordinated security for the investigation. These records establish physical controls and authorized project access, not current guard staffing or public entry.',sources:[0,2]},
      {id:'urbex-eagle-exposure',title:'Chemical concerns extend beyond the closed shop label',detail:'EPA identifies TCE and 1,2-DCA in soil and groundwater and discusses potential vapor intrusion into homes or businesses. Its current table says Insufficient Data for human-exposure control and groundwater-migration control. This is not environmental clearance; it also does not establish a present indoor-air concentration or an exposure at the street frontage.',sources:[0,1]},
      {id:'urbex-eagle-contact',title:'A current agency contact for site conditions',detail:'DEQ’s public page lists its site project manager and 405-702-5173 for Eagle Industries at 10901 SE 29th St. Ask about current cleanup conditions and restrictions before arranging any owner-authorized visit. Agency oversight and the sampling plan do not themselves grant recreational entry.',sources:[3,4]},
    ],
  },
  'rhode-island-warehouse': {
    sources: [
      source('Suite 109 · fencing, lighting and broker contact','Capital Commercial OKC','https://images1.loopnet.com/d2/Yui-wLwYB4Qdbm6h7uezYDB8i73t6luPiURq0Hkp2wY/FlyerSuite%20109301%20N%20RHODE%20ISLAND%2020250605.pdf','June 5, 2025 broker flyer','Read the advertised chain-link security fencing, exterior LED security lighting and broker contact. Marketing is dated evidence, not a present security inspection.','Business website'),
      source('301 N Rhode Island · commercial offering','Showcase · broker listing','https://www.showcase.com/301-n-rhode-island-ave-oklahoma-city-ok-73117/32694434/','Listing checked November 14, 2026; availability may change','Read advertised space, loading docks/drive-in ramp and public broker contact. A maintained listing does not prove occupancy or certify conditions.','Business website'), accessLaw,
      source('Loading docks · pedestrian and edge hazards','Occupational Safety and Health Administration','https://www.osha.gov/etools/powered-industrial-trucks/workplace/loading-docks','Undated occupational guidance; reviewed November 14, 2026','Used only as general loading-area hazard context; not evidence that an accident or unsafe condition exists at this address.'),
    ],
    evidence: [
      {id:'urbex-warehouse-controls',title:'The broker advertises security fencing and lighting',detail:'The June 5, 2025 Suite 109 flyer advertises chain-link security fencing and exterior LED security lighting. These are documented marketing claims about physical controls. Present configuration, camera coverage, guards and animals were not verified; the historical criminal case supplies no evidence that current tenants are involved.',sources:[0]},
      {id:'urbex-warehouse-viewing',title:'A broker channel for an authorized viewing',detail:'The dated flyer and current listing identify Capital Commercial OKC broker Mike Kerran, public telephone 405-642-4455, as a viewing/inquiry contact. The listing describes loading docks and a drive-in ramp. OSHA identifies dock-edge falls and vehicle-related risks as general loading-area hazards; that guidance is context rather than a site inspection. Ask the broker to confirm visitor arrangements and permission.',sources:[0,1,2,3]},
    ],
  },
};

export function addFieldResearch(places: Place[]) {
  for (const p of places) {
    const extra = additions[p.id], offset = p.sources.length;
    p.sources.push(...extra.sources);
    p.evidence.push(...extra.evidence.map(e=>({...e,sources:e.sources.map(i=>i+offset)})));
    p.reviewed = reviewed;
  }
}
export const fieldProfiles: Record<string,FieldProfile> = {
  'stockyard-airsoft': {
    verdict:'Former airsoft venue. Working lumber-property evidence.',
    activity:{level:4,label:'Operating use documented',detail:'A current company branch listing and the dated county photo support lumber-business activity. The old venue’s interior use remains a separate question.',evidence:['urbex-stockyard-operator','occupant']},
    security:{level:null,label:'No security survey in this file',detail:'An OSM private-access tag is documented. It does not describe guards, cameras or animals, and an absent report is not evidence of absent security.',evidence:['osm-road']},
    sections:[
      {title:'Approach & permission',text:'SW 15th, May and Exchange provide street context. The highlighted internal service corridor includes a private-tagged segment and bank parking circulation. No public pedestrian route or visitor parking inside the property has been verified. Request an authorized visit through Mid-States.',evidence:['city-road-coverage','osm-road','urbex-street-status','urbex-stockyard-permission']},
      {title:'Hazards to resolve',text:'The county inventory labels the warehouse condition “Poor”; this is not an engineering inspection. Stored lumber and an industrial setting warrant confirming loading activity and visitor arrangements with the operator. No reviewed source establishes current structural failure, chemical contamination or guard dogs at this building.',evidence:['building-inventory','building-photo-match','urbex-stockyard-operator']},
    ],contact:{label:'Ask Mid-States about permission',url:'https://snavelyforestproducts.com/contact-us/',detail:'Public branch contact: 800-234-0171. A contact listing is not an access grant.'},
  },
  'eagle-industries': {
    verdict:'Unoccupied shop record. Unfinished environmental cleanup.',
    activity:{level:1,label:'Vacant shop / mixed parcel',detail:'The county labels the commercial building unoccupied. A separate residence is recorded on the parcel, and cleanup work remains unresolved.',evidence:['eagle-unoccupied','eagle-cleanup-status']},
    security:{level:1,label:'Physical controls documented',detail:'EPA describes perimeter fencing and a separately fenced residence. No current guard, patrol, camera or animal survey is available.',evidence:['urbex-eagle-controls']},
    sections:[
      {title:'Approach & permission',text:'The reference address is 10901 SE 29th St. The map pin is site context, not an entry point. The investigation plan describes owner-agreed access for project personnel; it does not authorize visitors. Ask DEQ about conditions, then obtain property-controller permission for any entry.',evidence:['urbex-eagle-controls','urbex-eagle-contact']},
      {title:'Environmental hazards',text:'TCE and 1,2-DCA are documented in soil and groundwater; EPA also identifies potential vapor intrusion. The site has not been given environmental clearance in these records. A safe route, current indoor-air condition and present structural condition cannot be inferred from the vacancy label.',evidence:['urbex-eagle-exposure','eagle-cleanup-status']},
    ],contact:{label:'Ask DEQ about current conditions',url:'https://oklahoma.gov/deq/divisions/land-protection/cleanup-redevelopment/superfund/eagle-industries-superfund-site.html',detail:'Public project contact: 405-702-5173. DEQ information does not replace owner permission.'},
  },
  'rhode-island-warehouse': {
    verdict:'A marketed industrial property, not an established abandoned site.',
    activity:{level:3,label:'Maintained commercial offering',detail:'Broker material advertises renovated space, and listings were available when reviewed. Occupancy and visitor arrangements require confirmation.',evidence:['warehouse-leasing','warehouse-availability']},
    security:{level:1,label:'Fencing & lighting advertised',detail:'The 2025 broker flyer advertises security fencing and exterior lighting. Current staffing, cameras and animals are not established.',evidence:['urbex-warehouse-controls']},
    sections:[
      {title:'Approach & permission',text:'N Rhode Island Avenue is the street reference. The county image documents loading-dock frontage, not a verified Suite 109 entrance or public parking. Arrange any interior viewing through the listing broker; the historical case does not make the premises open to visitors.',evidence:['warehouse-photo','urbex-warehouse-viewing']},
      {title:'Loading-area context',text:'Loading docks and a drive-in ramp are advertised. Vehicle movement, raised dock edges and changes in level are matters to confirm during an authorized viewing. No reviewed source establishes current chemical contamination, structural failure or dogs at this property.',evidence:['urbex-warehouse-viewing']},
    ],contact:{label:'Request an authorized broker viewing',url:'https://www.showcase.com/301-n-rhode-island-ave-oklahoma-city-ok-73117/32694434/',detail:'Capital Commercial OKC: 405-642-4455. Confirm availability and visitor arrangements.'},
  },
};
