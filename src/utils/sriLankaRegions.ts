// Sri Lanka Complete Regional, District & Postal Divisions Hierarchy

export interface SriLankaRegion {
  id: string;
  name: string;
  postalCode?: string;
  district: string;
  province: string;
  type: 'Postal Division' | 'District Capital' | 'Major City' | 'Special Zone';
  defaultSurchargeLkr?: number;
}

export const SRI_LANKA_PROVINCES = [
  'Western Province',
  'Central Province',
  'Southern Province',
  'Northern Province',
  'Eastern Province',
  'North Western Province',
  'North Central Province',
  'Uva Province',
  'Sabaragamuwa Province',
  'Special & International'
] as const;

export type SriLankaProvince = typeof SRI_LANKA_PROVINCES[number];

export const SRI_LANKA_DISTRICTS: Record<string, string[]> = {
  'Western Province': ['Colombo', 'Gampaha', 'Kalutara'],
  'Central Province': ['Kandy', 'Matale', 'Nuwara Eliya'],
  'Southern Province': ['Galle', 'Matara', 'Hambantota'],
  'Northern Province': ['Jaffna', 'Kilinochchi', 'Mannar', 'Vavuniya', 'Mullaitivu'],
  'Eastern Province': ['Trincomalee', 'Batticaloa', 'Ampara'],
  'North Western Province': ['Kurunegala', 'Puttalam'],
  'North Central Province': ['Anuradhapura', 'Polonnaruwa'],
  'Uva Province': ['Badulla', 'Monaragala'],
  'Sabaragamuwa Province': ['Ratnapura', 'Kegalle'],
  'Special & International': ['Island-wide Logistics', 'Free Trade Zone (FTZ)', 'Export Overseas']
};

export const ALL_SRI_LANKA_REGIONS: SriLankaRegion[] = [
  // --- WESTERN PROVINCE ---
  // Colombo Postal Divisions
  { id: 'cmb-01', name: 'Colombo 01 (Fort)', postalCode: '00100', district: 'Colombo', province: 'Western Province', type: 'Postal Division', defaultSurchargeLkr: 0 },
  { id: 'cmb-02', name: 'Colombo 02 (Slave Island)', postalCode: '00200', district: 'Colombo', province: 'Western Province', type: 'Postal Division', defaultSurchargeLkr: 0 },
  { id: 'cmb-03', name: 'Colombo 03 (Kollupitiya)', postalCode: '00300', district: 'Colombo', province: 'Western Province', type: 'Postal Division', defaultSurchargeLkr: 0 },
  { id: 'cmb-04', name: 'Colombo 04 (Bambalapitiya)', postalCode: '00400', district: 'Colombo', province: 'Western Province', type: 'Postal Division', defaultSurchargeLkr: 0 },
  { id: 'cmb-05', name: 'Colombo 05 (Havelock / Kirulapone)', postalCode: '00500', district: 'Colombo', province: 'Western Province', type: 'Postal Division', defaultSurchargeLkr: 0 },
  { id: 'cmb-06', name: 'Colombo 06 (Wellawatte)', postalCode: '00600', district: 'Colombo', province: 'Western Province', type: 'Postal Division', defaultSurchargeLkr: 0 },
  { id: 'cmb-07', name: 'Colombo 07 (Cinnamon Gardens)', postalCode: '00700', district: 'Colombo', province: 'Western Province', type: 'Postal Division', defaultSurchargeLkr: 0 },
  { id: 'cmb-08', name: 'Colombo 08 (Borella)', postalCode: '00800', district: 'Colombo', province: 'Western Province', type: 'Postal Division', defaultSurchargeLkr: 0 },
  { id: 'cmb-09', name: 'Colombo 09 (Dematagoda)', postalCode: '00900', district: 'Colombo', province: 'Western Province', type: 'Postal Division', defaultSurchargeLkr: 0 },
  { id: 'cmb-10', name: 'Colombo 10 (Panchikawatte / Maradana)', postalCode: '01000', district: 'Colombo', province: 'Western Province', type: 'Postal Division', defaultSurchargeLkr: 0 },
  { id: 'cmb-11', name: 'Colombo 11 (Pettah)', postalCode: '01100', district: 'Colombo', province: 'Western Province', type: 'Postal Division', defaultSurchargeLkr: 0 },
  { id: 'cmb-12', name: 'Colombo 12 (Hultsdorf)', postalCode: '01200', district: 'Colombo', province: 'Western Province', type: 'Postal Division', defaultSurchargeLkr: 0 },
  { id: 'cmb-13', name: 'Colombo 13 (Kotahena)', postalCode: '01300', district: 'Colombo', province: 'Western Province', type: 'Postal Division', defaultSurchargeLkr: 0 },
  { id: 'cmb-14', name: 'Colombo 14 (Grandpass)', postalCode: '01400', district: 'Colombo', province: 'Western Province', type: 'Postal Division', defaultSurchargeLkr: 0 },
  { id: 'cmb-15', name: 'Colombo 15 (Modara)', postalCode: '01500', district: 'Colombo', province: 'Western Province', type: 'Postal Division', defaultSurchargeLkr: 0 },

  // Greater Colombo & Suburbs
  { id: 'cmb-sub-deh', name: 'Dehiwala-Mount Lavinia', postalCode: '10350', district: 'Colombo', province: 'Western Province', type: 'Major City', defaultSurchargeLkr: 150 },
  { id: 'cmb-sub-nug', name: 'Nugegoda', postalCode: '10250', district: 'Colombo', province: 'Western Province', type: 'Major City', defaultSurchargeLkr: 150 },
  { id: 'cmb-sub-kot', name: 'Sri Jayawardenepura Kotte', postalCode: '10100', district: 'Colombo', province: 'Western Province', type: 'Major City', defaultSurchargeLkr: 150 },
  { id: 'cmb-sub-mah', name: 'Maharagama', postalCode: '10280', district: 'Colombo', province: 'Western Province', type: 'Major City', defaultSurchargeLkr: 200 },
  { id: 'cmb-sub-mor', name: 'Moratuwa', postalCode: '10400', district: 'Colombo', province: 'Western Province', type: 'Major City', defaultSurchargeLkr: 200 },
  { id: 'cmb-sub-hom', name: 'Homagama', postalCode: '10200', district: 'Colombo', province: 'Western Province', type: 'Postal Division', defaultSurchargeLkr: 300 },
  { id: 'cmb-sub-kes', name: 'Kesbewa / Piliyandala', postalCode: '10300', district: 'Colombo', province: 'Western Province', type: 'Postal Division', defaultSurchargeLkr: 250 },
  { id: 'cmb-sub-avi', name: 'Avissawella', postalCode: '10700', district: 'Colombo', province: 'Western Province', type: 'District Capital', defaultSurchargeLkr: 400 },

  // Gampaha District
  { id: 'gmp-city', name: 'Gampaha Town', postalCode: '11000', district: 'Gampaha', province: 'Western Province', type: 'District Capital', defaultSurchargeLkr: 300 },
  { id: 'gmp-neg', name: 'Negombo City', postalCode: '11500', district: 'Gampaha', province: 'Western Province', type: 'Major City', defaultSurchargeLkr: 350 },
  { id: 'gmp-jae', name: 'Ja-Ela', postalCode: '11350', district: 'Gampaha', province: 'Western Province', type: 'Postal Division', defaultSurchargeLkr: 300 },
  { id: 'gmp-wat', name: 'Wattala', postalCode: '11300', district: 'Gampaha', province: 'Western Province', type: 'Postal Division', defaultSurchargeLkr: 200 },
  { id: 'gmp-kel', name: 'Kelaniya', postalCode: '11600', district: 'Gampaha', province: 'Western Province', type: 'Postal Division', defaultSurchargeLkr: 200 },
  { id: 'gmp-biy', name: 'Biyagama FTZ', postalCode: '11670', district: 'Gampaha', province: 'Western Province', type: 'Special Zone', defaultSurchargeLkr: 250 },
  { id: 'gmp-min', name: 'Minuwangoda', postalCode: '11100', district: 'Gampaha', province: 'Western Province', type: 'Postal Division', defaultSurchargeLkr: 400 },

  // Kalutara District
  { id: 'kal-city', name: 'Kalutara City', postalCode: '12000', district: 'Kalutara', province: 'Western Province', type: 'District Capital', defaultSurchargeLkr: 400 },
  { id: 'kal-pan', name: 'Panadura', postalCode: '12500', district: 'Kalutara', province: 'Western Province', type: 'Major City', defaultSurchargeLkr: 300 },
  { id: 'kal-hor', name: 'Horana', postalCode: '12400', district: 'Kalutara', province: 'Western Province', type: 'Postal Division', defaultSurchargeLkr: 350 },
  { id: 'kal-mat', name: 'Matugama', postalCode: '12100', district: 'Kalutara', province: 'Western Province', type: 'Postal Division', defaultSurchargeLkr: 450 },

  // --- CENTRAL PROVINCE ---
  { id: 'kdy-city', name: 'Kandy Metro City', postalCode: '20000', district: 'Kandy', province: 'Central Province', type: 'District Capital', defaultSurchargeLkr: 600 },
  { id: 'kdy-per', name: 'Peradeniya', postalCode: '20400', district: 'Kandy', province: 'Central Province', type: 'Postal Division', defaultSurchargeLkr: 600 },
  { id: 'kdy-kat', name: 'Katugastota', postalCode: '20000', district: 'Kandy', province: 'Central Province', type: 'Postal Division', defaultSurchargeLkr: 600 },
  { id: 'kdy-gam', name: 'Gampola', postalCode: '20500', district: 'Kandy', province: 'Central Province', type: 'Postal Division', defaultSurchargeLkr: 700 },
  { id: 'mtl-city', name: 'Matale Town', postalCode: '21000', district: 'Matale', province: 'Central Province', type: 'District Capital', defaultSurchargeLkr: 750 },
  { id: 'mtl-dam', name: 'Dambulla', postalCode: '21100', district: 'Matale', province: 'Central Province', type: 'Major City', defaultSurchargeLkr: 800 },
  { id: 'nue-city', name: 'Nuwara Eliya Hill City', postalCode: '22200', district: 'Nuwara Eliya', province: 'Central Province', type: 'District Capital', defaultSurchargeLkr: 1000 },
  { id: 'nue-hat', name: 'Hatton', postalCode: '22000', district: 'Nuwara Eliya', province: 'Central Province', type: 'Postal Division', defaultSurchargeLkr: 950 },

  // --- SOUTHERN PROVINCE ---
  { id: 'gle-city', name: 'Galle Fort & City', postalCode: '80000', district: 'Galle', province: 'Southern Province', type: 'District Capital', defaultSurchargeLkr: 650 },
  { id: 'gle-hik', name: 'Hikkaduwa Coastal', postalCode: '80240', district: 'Galle', province: 'Southern Province', type: 'Major City', defaultSurchargeLkr: 700 },
  { id: 'gle-amb', name: 'Ambalangoda', postalCode: '80300', district: 'Galle', province: 'Southern Province', type: 'Postal Division', defaultSurchargeLkr: 600 },
  { id: 'mat-city', name: 'Matara Fort & City', postalCode: '81000', district: 'Matara', province: 'Southern Province', type: 'District Capital', defaultSurchargeLkr: 800 },
  { id: 'mat-wel', name: 'Weligama Bay', postalCode: '81700', district: 'Matara', province: 'Southern Province', type: 'Major City', defaultSurchargeLkr: 750 },
  { id: 'hbt-city', name: 'Hambantota Port & Town', postalCode: '82000', district: 'Hambantota', province: 'Southern Province', type: 'District Capital', defaultSurchargeLkr: 1100 },
  { id: 'hbt-tan', name: 'Tangalle Coastal', postalCode: '82200', district: 'Hambantota', province: 'Southern Province', type: 'Major City', defaultSurchargeLkr: 950 },

  // --- NORTHERN PROVINCE ---
  { id: 'jaf-city', name: 'Jaffna Metro', postalCode: '40000', district: 'Jaffna', province: 'Northern Province', type: 'District Capital', defaultSurchargeLkr: 1400 },
  { id: 'jaf-ptp', name: 'Point Pedro', postalCode: '40000', district: 'Jaffna', province: 'Northern Province', type: 'Postal Division', defaultSurchargeLkr: 1500 },
  { id: 'kil-city', name: 'Kilinochchi Town', postalCode: '42000', district: 'Kilinochchi', province: 'Northern Province', type: 'District Capital', defaultSurchargeLkr: 1300 },
  { id: 'mnr-city', name: 'Mannar Island', postalCode: '41000', district: 'Mannar', province: 'Northern Province', type: 'District Capital', defaultSurchargeLkr: 1350 },
  { id: 'vav-city', name: 'Vavuniya Town', postalCode: '43000', district: 'Vavuniya', province: 'Northern Province', type: 'District Capital', defaultSurchargeLkr: 1100 },

  // --- EASTERN PROVINCE ---
  { id: 'trn-city', name: 'Trincomalee Bay & Town', postalCode: '31000', district: 'Trincomalee', province: 'Eastern Province', type: 'District Capital', defaultSurchargeLkr: 1200 },
  { id: 'btc-city', name: 'Batticaloa City', postalCode: '30000', district: 'Batticaloa', province: 'Eastern Province', type: 'District Capital', defaultSurchargeLkr: 1250 },
  { id: 'amp-city', name: 'Ampara Town', postalCode: '32000', district: 'Ampara', province: 'Eastern Province', type: 'District Capital', defaultSurchargeLkr: 1200 },
  { id: 'amp-kal', name: 'Kalmunai Coastal', postalCode: '32300', district: 'Ampara', province: 'Eastern Province', type: 'Major City', defaultSurchargeLkr: 1250 },

  // --- NORTH WESTERN PROVINCE ---
  { id: 'kng-city', name: 'Kurunegala City', postalCode: '60000', district: 'Kurunegala', province: 'North Western Province', type: 'District Capital', defaultSurchargeLkr: 500 },
  { id: 'kng-kul', name: 'Kuliyapitiya', postalCode: '60200', district: 'Kurunegala', province: 'North Western Province', type: 'Postal Division', defaultSurchargeLkr: 550 },
  { id: 'put-city', name: 'Puttalam Town', postalCode: '61000', district: 'Puttalam', province: 'North Western Province', type: 'District Capital', defaultSurchargeLkr: 800 },
  { id: 'put-chl', name: 'Chilaw Coastal', postalCode: '61000', district: 'Puttalam', province: 'North Western Province', type: 'Major City', defaultSurchargeLkr: 650 },

  // --- NORTH CENTRAL PROVINCE ---
  { id: 'anp-city', name: 'Anuradhapura Heritage City', postalCode: '50000', district: 'Anuradhapura', province: 'North Central Province', type: 'District Capital', defaultSurchargeLkr: 900 },
  { id: 'pol-city', name: 'Polonnaruwa Kaduruwela', postalCode: '51000', district: 'Polonnaruwa', province: 'North Central Province', type: 'District Capital', defaultSurchargeLkr: 950 },

  // --- UVA PROVINCE ---
  { id: 'bad-city', name: 'Badulla Town', postalCode: '90000', district: 'Badulla', province: 'Uva Province', type: 'District Capital', defaultSurchargeLkr: 1000 },
  { id: 'bad-ban', name: 'Bandarawela Resort', postalCode: '90100', district: 'Badulla', province: 'Uva Province', type: 'Major City', defaultSurchargeLkr: 1050 },
  { id: 'mng-city', name: 'Monaragala Town', postalCode: '91000', district: 'Monaragala', province: 'Uva Province', type: 'District Capital', defaultSurchargeLkr: 1150 },

  // --- SABARAGAMUWA PROVINCE ---
  { id: 'rat-city', name: 'Ratnapura City', postalCode: '70000', district: 'Ratnapura', province: 'Sabaragamuwa Province', type: 'District Capital', defaultSurchargeLkr: 600 },
  { id: 'keg-city', name: 'Kegalle Town', postalCode: '71000', district: 'Kegalle', province: 'Sabaragamuwa Province', type: 'District Capital', defaultSurchargeLkr: 450 },

  // --- SPECIAL & EXPORT ---
  { id: 'spec-island', name: 'Island-wide Standard Freight', postalCode: 'LK-ALL', district: 'Island-wide', province: 'Special & International', type: 'Special Zone', defaultSurchargeLkr: 1000 },
  { id: 'spec-export', name: 'Export Overseas (FOB Colombo)', postalCode: 'EXP-COL', district: 'Export Overseas', province: 'Special & International', type: 'Special Zone', defaultSurchargeLkr: 5000 }
];

export const getRegionsByProvince = (provinceName: string) => {
  if (!provinceName || provinceName === 'ALL') return ALL_SRI_LANKA_REGIONS;
  return ALL_SRI_LANKA_REGIONS.filter(r => r.province === provinceName);
};

export const getRegionsByDistrict = (districtName: string) => {
  if (!districtName || districtName === 'ALL') return ALL_SRI_LANKA_REGIONS;
  return ALL_SRI_LANKA_REGIONS.filter(r => r.district === districtName);
};

export const searchSriLankaRegions = (query: string) => {
  if (!query) return ALL_SRI_LANKA_REGIONS;
  const q = query.toLowerCase().trim();
  return ALL_SRI_LANKA_REGIONS.filter(
    r =>
      r.name.toLowerCase().includes(q) ||
      r.district.toLowerCase().includes(q) ||
      r.province.toLowerCase().includes(q) ||
      (r.postalCode && r.postalCode.toLowerCase().includes(q))
  );
};
