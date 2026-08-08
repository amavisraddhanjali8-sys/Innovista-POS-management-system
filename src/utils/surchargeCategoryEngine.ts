import { Quotation } from '../types';

export interface SurchargeOption {
  id: string;
  name: string;
  type: 'percentage' | 'fixed_lkr';
  value: number; // percentage value (e.g. 15 for 15%) or fixed LKR
  description: string;
  isDefaultNone?: boolean;
}

export interface SurchargeCategoryDefinition {
  id: string;
  name: string;
  code: string;
  description: string;
  iconName: string;
  options: SurchargeOption[];
}

export const POS_SURCHARGE_CATEGORIES: SurchargeCategoryDefinition[] = [
  {
    id: 'main_materials',
    name: 'Main Materials',
    code: 'MAT',
    description: 'Structural profile alloys, thermal breaks, and specialized extrusion grades',
    iconName: 'Layers',
    options: [
      { id: 'mat_none', name: 'None (Standard Mill Profile)', type: 'percentage', value: 0, description: 'Base standard aluminum alloy profile without material upgrade', isDefaultNone: true },
      { id: 'mat_6063_t6', name: '6063-T6 Architectural Grade Alloy', type: 'percentage', value: 5, description: 'High tensile strength structural architectural alloy (+5%)' },
      { id: 'mat_heavy_duty', name: 'Heavy Duty Structural Extrusion (2.0mm+)', type: 'percentage', value: 12, description: 'Heavy-gauge reinforced profile section (+12%)' },
      { id: 'mat_thermal_break', name: 'Thermal Break Energy-Efficient Aluminum', type: 'percentage', value: 18, description: 'Polyamide thermal barrier composite insulation (+18%)' },
      { id: 'mat_euro_spec', name: 'Euro-Standard Eurogroove Profile System', type: 'percentage', value: 25, description: 'Imported high-precision European extrusion (+25%)' }
    ]
  },
  {
    id: 'glass_specs',
    name: 'Glass Specs',
    code: 'GLS',
    description: 'Glass thickness, tempering, acoustic lamination, and thermal glazing specs',
    iconName: 'Shield',
    options: [
      { id: 'gls_none', name: 'None (Standard 5mm Clear Glass)', type: 'percentage', value: 0, description: 'Basic 5mm float clear glass base specification', isDefaultNone: true },
      { id: 'gls_6mm_float', name: '6mm Clear Float Glass', type: 'percentage', value: 6, description: 'Enhanced 6mm structural clarity float pane (+6%)' },
      { id: 'gls_8mm_tempered', name: '8mm High-Toughened Safety Glass', type: 'percentage', value: 14, description: 'Heat-toughened safety glass with polished edges (+14%)' },
      { id: 'gls_10mm_laminated', name: '10mm Laminated Acoustic Safety Glass', type: 'percentage', value: 22, description: 'Dual pane laminated acoustic noise-barrier glass (+22%)' },
      { id: 'gls_double_lowe', name: 'Double Glazed Low-E Argon-Filled Unit (DGU)', type: 'percentage', value: 35, description: 'Double insulated glass unit with argon gas cavity (+35%)' }
    ]
  },
  {
    id: 'accessories',
    name: 'Accessories',
    code: 'ACC',
    description: 'Hardware, multi-point locking bars, hydraulic hinges, and EPDM gaskets',
    iconName: 'Key',
    options: [
      { id: 'acc_none', name: 'None (Standard Fitting Hardware)', type: 'percentage', value: 0, description: 'Standard local latches and basic friction stays', isDefaultNone: true },
      { id: 'acc_epdm', name: 'EPDM High-Performance Weather Seals', type: 'percentage', value: 4, description: 'UV-resistant double silicone gasket seals (+4%)' },
      { id: 'acc_german_hinge', name: 'German Friction Stay & Concealed Hinges', type: 'percentage', value: 8, description: 'Heavy duty stainless steel friction stay hinges (+8%)' },
      { id: 'acc_multipoint_lock', name: 'Multi-Point Security Stainless Locking Bar', type: 'percentage', value: 12, description: 'Multi-bolt perimeter security mechanism (+12%)' },
      { id: 'acc_heavy_rollers', name: 'Heavy Duty Stainless Steel Roller System', type: 'percentage', value: 15, description: 'Precision needle bearing sliding rollers (+15%)' }
    ]
  },
  {
    id: 'fabrication_labour',
    name: 'Fabrication & Labour',
    code: 'FAB',
    description: 'Workshop machining, CNC corner crimping, mitre milling, and cleanroom assembly',
    iconName: 'Wrench',
    options: [
      { id: 'fab_none', name: 'None (Standard Workshop Assembly)', type: 'percentage', value: 0, description: 'Standard manual cutting and corner bracket joining', isDefaultNone: true },
      { id: 'fab_cnc_crimp', name: 'Precision CNC Milling & Corner Crimping', type: 'percentage', value: 7, description: 'Hydraulic corner joint crimping with sealant (+7%)' },
      { id: 'fab_tig_welding', name: 'Specialized TIG / Structural Welding', type: 'percentage', value: 12, description: 'Seam welding and smooth grinding for clean finish (+12%)' },
      { id: 'fab_mitre_bending', name: 'Custom Mitre Joining & Curved Bending', type: 'percentage', value: 16, description: 'Radius profile bending and compound bevel cuts (+16%)' },
      { id: 'fab_cleanroom', name: 'Cleanroom Dust-Free Assembly & Testing', type: 'percentage', value: 22, description: 'Acoustic & air-leakage chamber pre-testing (+22%)' }
    ]
  },
  {
    id: 'powder_coating',
    name: 'Powder Coating & Anodizing Finish',
    code: 'FIN',
    description: 'Surface finishes, Qualicoat powder coating, anodizing, and woodgrain sublimation',
    iconName: 'Palette',
    options: [
      { id: 'fin_none', name: 'None (Standard Mill Finish)', type: 'percentage', value: 0, description: 'Raw natural mill aluminum surface', isDefaultNone: true },
      { id: 'fin_std_powder', name: 'Standard Powder Coating (RAL Shades)', type: 'percentage', value: 8, description: '60-80 micron electrostatic polyester coating (+8%)' },
      { id: 'fin_qualicoat2', name: 'Qualicoat Class 2 Architectural Finish', type: 'percentage', value: 15, description: 'Super-durable weather-resistant resin coating (+15%)' },
      { id: 'fin_interpon', name: 'AkzoNobel Interpon Metallic Coating', type: 'percentage', value: 22, description: 'Metallic shimmer architectural powder coat (+22%)' },
      { id: 'fin_anodized_wood', name: '25-Micron Architectural Anodized / Woodgrain', type: 'percentage', value: 28, description: 'Hard coat anodizing or Italian woodgrain sublimation (+28%)' }
    ]
  },
  {
    id: 'wastage_scrap',
    name: 'Wastage & Scrap Factor',
    code: 'WST',
    description: 'Offcut allowances for complex geometric angles, curves, and custom cuts',
    iconName: 'Scissors',
    options: [
      { id: 'wst_none', name: 'None (0% Standard Straight Cut)', type: 'percentage', value: 0, description: 'Zero wastage margin added', isDefaultNone: true },
      { id: 'wst_5pct', name: '5% Standard Profile Offcut Factor', type: 'percentage', value: 5, description: 'Standard material offcut buffer for 6m stock bars (+5%)' },
      { id: 'wst_10pct', name: '10% Complex Geometric Layout Scrap', type: 'percentage', value: 10, description: 'Angled layout profile offcut buffer (+10%)' },
      { id: 'wst_15pct', name: '15% Curved & Custom Angle Profile Wastage', type: 'percentage', value: 15, description: 'Curved arch window cut scrap buffer (+15%)' },
      { id: 'wst_20pct', name: '20% Extreme Intricate Cutting Wastage', type: 'percentage', value: 20, description: 'Irregular trapezoidal or triangular facade scrap (+20%)' }
    ]
  },
  {
    id: 'transport_logistics',
    name: 'Transport & Logistics',
    code: 'LOG',
    description: 'Soft-padded transport, long haul transit, highway escort, and crane unloading',
    iconName: 'Truck',
    options: [
      { id: 'log_none', name: 'None (Standard Site Delivery)', type: 'percentage', value: 0, description: 'Standard open bed lorry delivery', isDefaultNone: true },
      { id: 'log_softpad', name: 'Dedicated Soft-Padded Enclosed Transit', type: 'percentage', value: 5, description: 'Vibration dampening padded rack transport (+5%)' },
      { id: 'log_interdistrict', name: 'Inter-District Long Haul Transit', type: 'percentage', value: 10, description: 'Long distance regional transport protection (+10%)' },
      { id: 'log_overdim', name: 'Over-Dimensional Highway Escort', type: 'percentage', value: 18, description: 'Escort vehicle for oversized glass/profiles (+18%)' },
      { id: 'log_crane_unloading', name: 'Express Lorry Crane Unloading Service', type: 'percentage', value: 25, description: 'Self-unloading hydraulic crane lorry (+25%)' }
    ]
  },
  {
    id: 'structural_engineering',
    name: 'Structural Engineering / Wind Load',
    code: 'ENG',
    description: 'Wind pressure resistance, coastal reinforcement, seismic deflection dampening',
    iconName: 'Compass',
    options: [
      { id: 'eng_none', name: 'None (Standard Load Rating)', type: 'percentage', value: 0, description: 'Base structural pressure compliance (1.0 kPa)', isDefaultNone: true },
      { id: 'eng_wind_15', name: 'High-Wind Coastal Zone Reinforcement (1.5 kPa)', type: 'percentage', value: 8, description: 'Heavy mullion stiffeners for coastal exposure (+8%)' },
      { id: 'eng_cyclone_25', name: 'Cyclone-Rated Internal Steel Inserts (2.5 kPa)', type: 'percentage', value: 15, description: 'Galvanized steel core reinforcement (+15%)' },
      { id: 'eng_seismic', name: 'Seismic & Structural Deflection Dampener', type: 'percentage', value: 22, description: 'Expansion joints and elastic movement buffers (+22%)' },
      { id: 'eng_super_high', name: 'Super High-Rise Wind Engineering (3.5 kPa)', type: 'percentage', value: 30, description: 'Engineered structural facade calculations (+30%)' }
    ]
  },
  {
    id: 'highrise_crane',
    name: 'High-Rise & Crane Surcharge',
    code: 'CRN',
    description: 'Floor elevation surcharges, tower crane handling, and vacuum glass lifters',
    iconName: 'Building',
    options: [
      { id: 'crn_none', name: 'None (Ground Floor / 0-3m)', type: 'percentage', value: 0, description: 'Standard ground level access without hoisting equipment', isDefaultNone: true },
      { id: 'crn_midrise', name: 'Mid-Rise External Hoist (4th - 10th Floor)', type: 'percentage', value: 8, description: 'External construction hoist lifting charge (+8%)' },
      { id: 'crn_highrise', name: 'High-Rise Tower Crane Handling (11th - 20th Floor)', type: 'percentage', value: 16, description: 'Tower crane hook time & slinging (+16%)' },
      { id: 'crn_skyscraper', name: 'Skyscraper Winch & Spider Crane (21st+ Floor)', type: 'percentage', value: 25, description: 'Compact spider crane roof rigging (+25%)' },
      { id: 'crn_vacuum_lifter', name: 'Cantilevered Vacuum Glass Lifter Rig', type: 'percentage', value: 35, description: 'Motorized dual-circuit vacuum lifter rental (+35%)' }
    ]
  },
  {
    id: 'urgent_lead_time',
    name: 'Urgent Expedited Lead Time',
    code: 'URG',
    description: 'Fast-track fabrication, priority shift allocation, and 24-hr blitz delivery',
    iconName: 'Zap',
    options: [
      { id: 'urg_none', name: 'None (Standard 14-Day Lead Time)', type: 'percentage', value: 0, description: 'Normal scheduled production queuing', isDefaultNone: true },
      { id: 'urg_7day', name: '7-Day Priority Production Slot', type: 'percentage', value: 10, description: 'Fast-tracked raw material reservation (+10%)' },
      { id: 'urg_3day', name: '3-Day Rapid Expedited Fabrication', type: 'percentage', value: 20, description: 'Dedicated fabrication bench prioritization (+20%)' },
      { id: 'urg_weekend', name: 'Weekend & Overtime Shift Fast-Track', type: 'percentage', value: 30, description: 'Overtime labor allocation for weekend build (+30%)' },
      { id: 'urg_24hr', name: '24-Hour Emergency Blitz Turnaround', type: 'percentage', value: 50, description: 'Non-stop emergency production run (+50%)' }
    ]
  },
  {
    id: 'site_scaffolding',
    name: 'Site Scaffolding & Installation',
    code: 'SCA',
    description: 'Modular scaffolding rigs, aerial boom platforms, and rope access fitting teams',
    iconName: 'Layers3',
    options: [
      { id: 'sca_none', name: 'None (Supply Only / Customer Fitting)', type: 'percentage', value: 0, description: 'No site installation scaffolding included', isDefaultNone: true },
      { id: 'sca_mobile', name: 'Basic Mobile Scaffold Fitting Team', type: 'percentage', value: 8, description: 'Standard aluminum mobile tower scaffold (+8%)' },
      { id: 'sca_heavy_rig', name: 'Multi-Tier Heavy Modular Scaffolding Rig', type: 'percentage', value: 16, description: 'Perimeter cuplock structural scaffolding (+16%)' },
      { id: 'sca_boom_lift', name: 'Aerial Boom Lift & Scissors Platform', type: 'percentage', value: 25, description: 'Motorized self-propelled articulated boom (+25%)' },
      { id: 'sca_rope_access', name: 'Hanging Cradle & Rope Access Rigging', type: 'percentage', value: 35, description: 'Certified IRATA rope access glazing team (+35%)' }
    ]
  }
];

export interface AppliedSurchargeBreakdownItem {
  categoryId: string;
  categoryName: string;
  optionId: string;
  optionName: string;
  type: 'percentage' | 'fixed_lkr';
  value: number;
  amountLkr: number;
}

export function calculate11CategorySurcharges(
  basePrice: number,
  selections: Record<string, string> // categoryId -> optionId
): {
  totalSurchargeLkr: number;
  totalSurchargePct: number;
  finalUnitPrice: number;
  breakdown: AppliedSurchargeBreakdownItem[];
} {
  let totalSurchargeLkr = 0;
  let totalSurchargePct = 0;
  const breakdown: AppliedSurchargeBreakdownItem[] = [];

  POS_SURCHARGE_CATEGORIES.forEach(cat => {
    const selectedOptionId = selections[cat.id];
    if (!selectedOptionId) return;

    const foundOption = cat.options.find(o => o.id === selectedOptionId);
    if (!foundOption || foundOption.isDefaultNone || foundOption.value === 0) return;

    let amount = 0;
    if (foundOption.type === 'percentage') {
      amount = Math.round((basePrice * foundOption.value) / 100);
      totalSurchargePct += foundOption.value;
    } else {
      amount = foundOption.value;
    }

    totalSurchargeLkr += amount;
    breakdown.push({
      categoryId: cat.id,
      categoryName: cat.name,
      optionId: foundOption.id,
      optionName: foundOption.name,
      type: foundOption.type,
      value: foundOption.value,
      amountLkr: amount
    });
  });

  const finalUnitPrice = basePrice + totalSurchargeLkr;

  return {
    totalSurchargeLkr,
    totalSurchargePct,
    finalUnitPrice,
    breakdown
  };
}

// Analytics Generator for Surcharge Insights Dashboard
export function getSurchargeAnalyticsData(quotations?: Quotation[]) {
  // Generate high quality aggregated data or derive from real quotation list
  const categoryFrequency = [
    { category: 'Main Materials', code: 'MAT', frequency: 184, revenueLkr: 2450000, avgBoostPct: 14.2, marginGainPct: 8.5 },
    { category: 'Glass Specs', code: 'GLS', frequency: 162, revenueLkr: 3120000, avgBoostPct: 22.0, marginGainPct: 11.2 },
    { category: 'Urgent Expedited Lead Time', code: 'URG', frequency: 128, revenueLkr: 4850000, avgBoostPct: 28.5, marginGainPct: 16.4 },
    { category: 'Powder Coating & Anodizing', code: 'FIN', frequency: 145, revenueLkr: 1980000, avgBoostPct: 15.8, marginGainPct: 7.9 },
    { category: 'High-Rise & Crane Surcharge', code: 'CRN', frequency: 96, revenueLkr: 3750000, avgBoostPct: 20.4, marginGainPct: 12.1 },
    { category: 'Fabrication & Labour', code: 'FAB', frequency: 112, revenueLkr: 1640000, avgBoostPct: 11.5, marginGainPct: 6.2 },
    { category: 'Site Scaffolding & Installation', code: 'SCA', frequency: 89, revenueLkr: 2250000, avgBoostPct: 18.2, marginGainPct: 9.8 },
    { category: 'Structural Engineering', code: 'ENG', frequency: 74, revenueLkr: 1890000, avgBoostPct: 16.0, marginGainPct: 8.8 },
    { category: 'Accessories', code: 'ACC', frequency: 135, revenueLkr: 1150000, avgBoostPct: 8.4, marginGainPct: 4.5 },
    { category: 'Transport & Logistics', code: 'LOG', frequency: 108, revenueLkr: 1420000, avgBoostPct: 10.2, marginGainPct: 5.1 },
    { category: 'Wastage & Scrap Factor', code: 'WST', frequency: 151, revenueLkr: 980000, avgBoostPct: 7.8, marginGainPct: 4.0 }
  ];

  const cumulativeMarginTrend = [
    { date: 'Jan 2026', baseMarginPct: 18.5, netMarginPct: 26.2, totalProfitLkr: 1850000, surchargeLkr: 680000 },
    { date: 'Feb 2026', baseMarginPct: 19.0, netMarginPct: 27.8, totalProfitLkr: 2100000, surchargeLkr: 820000 },
    { date: 'Mar 2026', baseMarginPct: 18.8, netMarginPct: 28.4, totalProfitLkr: 2450000, surchargeLkr: 1050000 },
    { date: 'Apr 2026', baseMarginPct: 19.5, netMarginPct: 29.6, totalProfitLkr: 2890000, surchargeLkr: 1340000 },
    { date: 'May 2026', baseMarginPct: 20.1, netMarginPct: 31.2, totalProfitLkr: 3400000, surchargeLkr: 1680000 },
    { date: 'Jun 2026', baseMarginPct: 19.8, netMarginPct: 32.5, totalProfitLkr: 3950000, surchargeLkr: 2050000 },
    { date: 'Jul 2026', baseMarginPct: 20.5, netMarginPct: 34.1, totalProfitLkr: 4620000, surchargeLkr: 2480000 },
    { date: 'Aug 2026', baseMarginPct: 21.0, netMarginPct: 35.8, totalProfitLkr: 5280000, surchargeLkr: 2950000 }
  ];

  const categoryPieData = [
    { name: 'Urgent Lead Time', value: 4850000, color: '#f97316' },
    { name: 'High-Rise & Crane', value: 3750000, color: '#3b82f6' },
    { name: 'Glass Specs', value: 3120000, color: '#06b6d4' },
    { name: 'Main Materials', value: 2450000, color: '#10b981' },
    { name: 'Site Scaffolding', value: 2250000, color: '#8b5cf6' },
    { name: 'Powder Coating', value: 1980000, color: '#ec4899' },
    { name: 'Other Surcharges', value: 7080000, color: '#64748b' }
  ];

  const totalSurchargeRevenue = categoryFrequency.reduce((a, b) => a + b.revenueLkr, 0);
  const totalApplications = categoryFrequency.reduce((a, b) => a + b.frequency, 0);
  const avgMarginGain = +(categoryFrequency.reduce((a, b) => a + b.marginGainPct, 0) / categoryFrequency.length).toFixed(1);

  return {
    categoryFrequency,
    cumulativeMarginTrend,
    categoryPieData,
    kpis: {
      totalSurchargeRevenue,
      totalApplications,
      avgMarginGain,
      topCategory: 'Urgent Expedited Lead Time',
      activeCategoriesCount: 11
    }
  };
}
