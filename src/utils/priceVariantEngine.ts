import { 
  Product, 
  ProductUnit, 
  PriceDisplayMethod, 
  QuantityBreak, 
  PricingTier, 
  CustomerType, 
  RegionZone, 
  ProjectType, 
  MaterialGrade, 
  MaterialThickness, 
  MaterialFinish, 
  MaterialColour, 
  GlassType, 
  InstallationOption, 
  DiscountMethod 
} from '../types';

export const UNIT_CATEGORIES: Array<{ category: string; units: ProductUnit[] }> = [
  {
    category: 'Length',
    units: ['mm', 'cm', 'm', 'km', 'inch', 'ft', 'yard']
  },
  {
    category: 'Area',
    units: ['mm²', 'cm²', 'm²', 'ft²', 'yd²', 'Acre', 'Perch']
  },
  {
    category: 'Volume',
    units: ['mm³', 'cm³', 'm³', 'ft³', 'Liter', 'mL']
  },
  {
    category: 'Weight',
    units: ['Gram', 'kg', 'Ton', 'lb']
  },
  {
    category: 'Quantity',
    units: ['Nos', 'PCS', 'Set', 'Pair', 'Bundle', 'Roll', 'Box', 'Packet', 'Carton', 'Unit', 'Item', 'Lot', 'pc', 'sheet', 'bar']
  },
  {
    category: 'Time',
    units: ['Hour', 'Day', 'Week', 'Month', 'Year', 'hr']
  },
  {
    category: 'Labour',
    units: ['Per Worker', 'Per Carpenter', 'Per Mason', 'Per Welder', 'Per Technician', 'Per Team', 'Per Shift']
  },
  {
    category: 'Equipment',
    units: ['Machine Hour', 'Machine Day', 'Equipment Rental Day']
  },
  {
    category: 'Transportation',
    units: ['Per Trip', 'Per Load', 'Per km', 'Per Delivery']
  },
  {
    category: 'Service',
    units: ['Per Visit', 'Per Project', 'Lump Sum', 'Fixed Price', 'Percentage']
  }
];

export const ALL_UNITS: ProductUnit[] = UNIT_CATEGORIES.flatMap(c => c.units);

export const PRICE_DISPLAY_METHODS: PriceDisplayMethod[] = [
  'Standard',
  'Price per Piece',
  'Price per Meter',
  'Price per Square Meter',
  'Price per Cubic Meter',
  'Price per Hour',
  'Price per Weight'
];

export const PRICING_TIERS: PricingTier[] = [
  'Gold',
  'Silver',
  'Bronze',
  'Dealer',
  'Wholesale',
  'Retail',
  'VIP Customer',
  'Corporate',
  'Government',
  'Contractor'
];

export const CUSTOMER_TYPES: CustomerType[] = [
  'Retail Customer',
  'Company',
  'Developer',
  'Architect',
  'Government',
  'Hotel',
  'Apartment Builder',
  'Interior Designer',
  'Dealer',
  'Distributor'
];

export const REGION_ZONES: RegionZone[] = [
  'Colombo',
  'Gampaha',
  'Kalutara',
  'Kandy',
  'Matale',
  'Nuwara Eliya',
  'Galle',
  'Matara',
  'Hambantota',
  'Jaffna',
  'Kilinochchi',
  'Mannar',
  'Vavuniya',
  'Trincomalee',
  'Batticaloa',
  'Ampara',
  'Kurunegala',
  'Puttalam',
  'Anuradhapura',
  'Polonnaruwa',
  'Badulla',
  'Monaragala',
  'Ratnapura',
  'Kegalle',
  'Southern Province',
  'Island-wide',
  'Export'
];

export const PROJECT_TYPES: ProjectType[] = [
  'Residential',
  'Commercial',
  'Industrial',
  'Hospital',
  'School',
  'Warehouse',
  'Hotel',
  'Factory',
  'Apartment'
];

export const MATERIAL_GRADES: MaterialGrade[] = [
  'Standard',
  'Premium',
  'Luxury',
  'Imported',
  'Local',
  'Custom'
];

export const BRAND_OPTIONS: string[] = [
  'Alumex',
  'Swisstek',
  'Lanka Aluminium',
  'St. Anthony',
  'Imported Euro',
  'Asahi',
  'Saint-Gobain',
  'Dorma',
  'Hafele',
  'Generic Local'
];

export const THICKNESS_OPTIONS: MaterialThickness[] = [
  '0.8mm',
  '1.0mm',
  '1.2mm',
  '1.5mm',
  '2.0mm',
  '3.0mm',
  'Custom'
];

export const FINISH_OPTIONS: MaterialFinish[] = [
  'Powder Coated',
  'Anodized',
  'Natural',
  'Wood Finish',
  'PVDF',
  'Brushed',
  'Mirror Finish',
  'Matt Finish'
];

export const COLOUR_OPTIONS: MaterialColour[] = [
  'White',
  'Black',
  'Grey',
  'Bronze',
  'Champagne',
  'Wood',
  'Custom RAL'
];

export const GLASS_TYPES: GlassType[] = [
  '5 mm',
  '6 mm',
  '8 mm',
  '10 mm',
  '12 mm',
  'Tempered',
  'Laminated',
  'Tinted',
  'Double Glazed'
];

export const INSTALLATION_OPTIONS: InstallationOption[] = [
  'Supply Only',
  'Installation Only',
  'Supply + Install',
  'Fabrication Only',
  'Delivery Only'
];

export const FLOOR_LEVEL_OPTIONS: string[] = [
  'Ground Floor (0-3m)',
  '1st - 3rd Floor (Low Rise)',
  '4th - 10th Floor (Mid Rise)',
  '11th - 20th Floor (High Rise)',
  '21st+ Floor (Tower Crane / Hoist)'
];

export const FACILITY_TYPE_OPTIONS: string[] = [
  'Standard Construction Site',
  'Commercial Mall / Retail Store',
  'Industrial Factory / Heavy Plant',
  'Hospital Clean Room / Medical Zone',
  'Hotel / Resort / Luxury Tower',
  'High Security / Airport Zone'
];

export const DISCOUNT_METHODS: DiscountMethod[] = [
  'Percentage Discount',
  'Fixed Discount',
  'Quantity Discount',
  'Seasonal Discount',
  'Promotion',
  'Dealer Discount',
  'Special Customer Discount',
  'Negotiated Discount',
  'Clearance Discount'
];

export interface ResolveVariantParams {
  quantity: number;
  tier?: PricingTier;
  customer_type?: CustomerType;
  region?: RegionZone;
  project_type?: ProjectType;
  grade?: MaterialGrade;
  thickness?: MaterialThickness;
  finish?: MaterialFinish;
  colour?: MaterialColour;
  glass_type?: GlassType;
  brand?: string;
  installation_option?: InstallationOption;
  floor_level?: string;
  facility_type?: string;
  discount_method?: DiscountMethod;
  discount_value?: number;
  custom_selections?: Record<string, string>;
}

export interface ResolvedVariantResult {
  base_rate: number;
  final_unit_price: number;
  matched_quantity_break?: QuantityBreak;
  break_label?: string;
  total_price: number;
  discount_amount: number;
  breakdown_notes: string[];
}

export function resolveProductVariantPrice(
  product: Product,
  params: ResolveVariantParams
): ResolvedVariantResult {
  const qty = Math.max(1, params.quantity || 1);
  let baseRate = product.current_price;
  let matchedBreak: QuantityBreak | undefined = undefined;
  let breakLabel = undefined;
  const notes: string[] = [];

  // 1. Quantity Break Resolution
  if (product.quantity_breaks && product.quantity_breaks.length > 0) {
    const sortedBreaks = [...product.quantity_breaks].sort((a, b) => a.min_qty - b.min_qty);
    const found = sortedBreaks.find(b => qty >= b.min_qty && qty <= b.max_qty);
    if (found) {
      matchedBreak = found;
      baseRate = found.unit_price;
      breakLabel = found.label || `${found.min_qty}-${found.max_qty > 99999 ? 'Unlimited' : found.max_qty} Units Tier`;
      notes.push(`Quantity break tier applied: ${breakLabel} (Rs. ${found.unit_price.toLocaleString()}/unit)`);
    }
  }

  let rate = baseRate;

  // 2. Thickness Adjustment
  if (params.thickness && product.thickness_prices && product.thickness_prices[params.thickness] !== undefined) {
    const add = product.thickness_prices[params.thickness];
    rate += add;
    if (add !== 0) notes.push(`Thickness [${params.thickness}]: ${add > 0 ? '+' : ''}Rs. ${add}`);
  }

  // 3. Finish Adjustment
  if (params.finish && product.finish_prices && product.finish_prices[params.finish] !== undefined) {
    const add = product.finish_prices[params.finish];
    rate += add;
    if (add !== 0) notes.push(`Finish [${params.finish}]: ${add > 0 ? '+' : ''}Rs. ${add}`);
  }

  // 3.5 Colour Adjustment
  if (params.colour && product.colour_prices && product.colour_prices[params.colour] !== undefined) {
    const add = product.colour_prices[params.colour];
    rate += add;
    if (add !== 0) notes.push(`Colour [${params.colour}]: ${add > 0 ? '+' : ''}Rs. ${add}`);
  }

  // 4. Glass Type Adjustment
  if (params.glass_type && product.glass_prices && product.glass_prices[params.glass_type] !== undefined) {
    const add = product.glass_prices[params.glass_type];
    rate += add;
    if (add !== 0) notes.push(`Glass [${params.glass_type}]: ${add > 0 ? '+' : ''}Rs. ${add}`);
  }

  // 5. Brand Adjustment
  if (params.brand && product.brand_prices && product.brand_prices[params.brand] !== undefined) {
    const add = product.brand_prices[params.brand];
    rate += add;
    if (add !== 0) notes.push(`Brand [${params.brand}]: ${add > 0 ? '+' : ''}Rs. ${add}`);
  }

  // 6. Installation Option Adjustment
  if (params.installation_option && product.installation_prices && product.installation_prices[params.installation_option] !== undefined) {
    const add = product.installation_prices[params.installation_option];
    rate += add;
    if (add !== 0) notes.push(`Installation Mode [${params.installation_option}]: ${add > 0 ? '+' : ''}Rs. ${add}`);
  }

  // 7. Pricing Tier Adjustment
  if (params.tier && product.tier_prices && product.tier_prices[params.tier] !== undefined) {
    const add = product.tier_prices[params.tier];
    rate += add;
    if (add !== 0) notes.push(`Tier [${params.tier}]: ${add > 0 ? '+' : ''}Rs. ${add}`);
  }

  // 8. Customer Type Adjustment
  if (params.customer_type && product.customer_type_prices && product.customer_type_prices[params.customer_type] !== undefined) {
    const add = product.customer_type_prices[params.customer_type];
    rate += add;
    if (add !== 0) notes.push(`Customer Type [${params.customer_type}]: ${add > 0 ? '+' : ''}Rs. ${add}`);
  }

  // 9. Region Adjustment
  if (params.region && product.region_prices && product.region_prices[params.region] !== undefined) {
    const add = product.region_prices[params.region];
    rate += add;
    if (add !== 0) notes.push(`Region Zone [${params.region}]: ${add > 0 ? '+' : ''}Rs. ${add}`);
  }

  // 10. Project Type Adjustment
  if (params.project_type && product.project_type_prices && product.project_type_prices[params.project_type] !== undefined) {
    const add = product.project_type_prices[params.project_type];
    rate += add;
    if (add !== 0) notes.push(`Project Type [${params.project_type}]: ${add > 0 ? '+' : ''}Rs. ${add}`);
  }

  // 11. Material Grade Adjustment
  if (params.grade && product.grade_prices && product.grade_prices[params.grade] !== undefined) {
    const add = product.grade_prices[params.grade];
    rate += add;
    if (add !== 0) notes.push(`Grade [${params.grade}]: ${add > 0 ? '+' : ''}Rs. ${add}`);
  }

  // 12. Floor Level Adjustment
  if (params.floor_level && product.floor_level_prices && product.floor_level_prices[params.floor_level] !== undefined) {
    const add = product.floor_level_prices[params.floor_level];
    rate += add;
    if (add !== 0) notes.push(`Building Floor Level [${params.floor_level}]: ${add > 0 ? '+' : ''}Rs. ${add}`);
  }

  // 13. Facility Type Adjustment
  if (params.facility_type && product.facility_type_prices && product.facility_type_prices[params.facility_type] !== undefined) {
    const add = product.facility_type_prices[params.facility_type];
    rate += add;
    if (add !== 0) notes.push(`Facility Type [${params.facility_type}]: ${add > 0 ? '+' : ''}Rs. ${add}`);
  }

  // 12. Custom Dynamic Option Surcharges Categories Evaluation
  if (product.custom_option_surcharges && Array.isArray(product.custom_option_surcharges)) {
    product.custom_option_surcharges.forEach(cat => {
      if (params.custom_selections) {
        const selectedItemName = params.custom_selections[cat.id] || params.custom_selections[cat.categoryName];
        if (selectedItemName) {
          const foundItem = cat.items?.find(i => i.name.toLowerCase() === selectedItemName.toLowerCase());
          if (foundItem && foundItem.surchargeLkr) {
            rate += foundItem.surchargeLkr;
            notes.push(`${cat.categoryName} [${foundItem.name}]: +Rs. ${foundItem.surchargeLkr}`);
          }
        }
      }
    });
  }

  // Calculate gross line price before line-item discount
  const grossLineTotal = rate * qty;
  let discountAmt = 0;

  if (params.discount_method && params.discount_value && params.discount_value > 0) {
    const val = params.discount_value;
    switch (params.discount_method) {
      case 'Percentage Discount':
      case 'Seasonal Discount':
      case 'Promotion':
      case 'Dealer Discount':
      case 'Special Customer Discount':
      case 'Clearance Discount':
        discountAmt = Math.round((grossLineTotal * val) / 100);
        notes.push(`${params.discount_method} (${val}%): -Rs. ${discountAmt.toLocaleString()}`);
        break;
      case 'Fixed Discount':
      case 'Negotiated Discount':
        discountAmt = Math.min(grossLineTotal, val);
        notes.push(`${params.discount_method}: -Rs. ${discountAmt.toLocaleString()}`);
        break;
      case 'Quantity Discount':
        discountAmt = Math.round((grossLineTotal * Math.min(25, val)) / 100);
        notes.push(`Quantity Discount (${val}%): -Rs. ${discountAmt.toLocaleString()}`);
        break;
    }
  }

  const netLineTotal = Math.max(0, grossLineTotal - discountAmt);
  const finalUnitPrice = qty > 0 ? Math.round(netLineTotal / qty) : rate;

  return {
    base_rate: baseRate,
    final_unit_price: finalUnitPrice,
    matched_quantity_break: matchedBreak,
    break_label: breakLabel,
    total_price: netLineTotal,
    discount_amount: discountAmt,
    breakdown_notes: notes
  };
}
