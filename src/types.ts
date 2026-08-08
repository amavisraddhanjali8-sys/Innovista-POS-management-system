export type CategoryType = 
  | 'Aluminium Fabrication'
  | 'Interior Design'
  | 'Civil Works'
  | 'Aluminium Profiles'
  | 'Glass'
  | 'ACP Sheets'
  | 'Steel Sections'
  | 'Hardware & Accessories'
  | 'Labour & Installation'
  | 'Equipment & Rental'
  | 'Services';

export type LengthUnit = 'mm' | 'cm' | 'm' | 'km' | 'inch' | 'ft' | 'yard';
export type AreaUnit = 'mm²' | 'cm²' | 'm²' | 'ft²' | 'yd²' | 'Acre' | 'Perch' | 'sq.ft';
export type VolumeUnit = 'mm³' | 'cm³' | 'm³' | 'ft³' | 'Liter' | 'mL';
export type WeightUnit = 'Gram' | 'kg' | 'Ton' | 'lb';
export type QuantityUnit = 'Nos' | 'PCS' | 'Set' | 'Pair' | 'Bundle' | 'Roll' | 'Box' | 'Packet' | 'Carton' | 'Unit' | 'Item' | 'Lot' | 'pc' | 'sheet' | 'bar';
export type TimeUnit = 'Hour' | 'Day' | 'Week' | 'Month' | 'Year' | 'hr';
export type LabourUnit = 'Per Worker' | 'Per Carpenter' | 'Per Mason' | 'Per Welder' | 'Per Technician' | 'Per Team' | 'Per Shift';
export type EquipmentUnit = 'Machine Hour' | 'Machine Day' | 'Equipment Rental Day';
export type TransportUnit = 'Per Trip' | 'Per Load' | 'Per km' | 'Per Delivery';
export type ServiceUnit = 'Per Visit' | 'Per Project' | 'Lump Sum' | 'Fixed Price' | 'Percentage' | 'Per Room';

export type ProductUnit = 
  | LengthUnit 
  | AreaUnit 
  | VolumeUnit 
  | WeightUnit 
  | QuantityUnit 
  | TimeUnit 
  | LabourUnit 
  | EquipmentUnit 
  | TransportUnit 
  | ServiceUnit;

export type PriceDisplayMethod = 
  | 'Standard' 
  | 'Price per Piece' 
  | 'Price per Meter' 
  | 'Price per Square Meter' 
  | 'Price per Cubic Meter' 
  | 'Price per Hour' 
  | 'Price per Weight';

export interface QuantityBreak {
  id: string;
  min_qty: number;
  max_qty: number; // e.g. 999999 for 51+
  unit_price: number;
  label?: string; // e.g., "Bulk 51+ Units"
}

export type PricingTier = 'Gold' | 'Silver' | 'Bronze' | 'Dealer' | 'Wholesale' | 'Retail' | 'VIP Customer' | 'Corporate' | 'Government' | 'Contractor';

export type CustomerType = 'Retail Customer' | 'Company' | 'Developer' | 'Architect' | 'Government' | 'Hotel' | 'Apartment Builder' | 'Interior Designer' | 'Dealer' | 'Distributor';

export type RegionZone = 
  | 'Colombo' 
  | 'Gampaha' 
  | 'Kalutara'
  | 'Kandy' 
  | 'Matale'
  | 'Nuwara Eliya'
  | 'Galle'
  | 'Matara'
  | 'Hambantota'
  | 'Jaffna'
  | 'Kilinochchi'
  | 'Mannar'
  | 'Vavuniya'
  | 'Trincomalee'
  | 'Batticaloa'
  | 'Ampara'
  | 'Kurunegala'
  | 'Puttalam'
  | 'Anuradhapura'
  | 'Polonnaruwa'
  | 'Badulla'
  | 'Monaragala'
  | 'Ratnapura'
  | 'Kegalle'
  | 'Southern Province' 
  | 'Island-wide' 
  | 'Export'
  | string;

export type ProjectType = 'Residential' | 'Commercial' | 'Industrial' | 'Hospital' | 'School' | 'Warehouse' | 'Hotel' | 'Factory' | 'Apartment';

export type MaterialGrade = 'Standard' | 'Premium' | 'Luxury' | 'Imported' | 'Local' | 'Custom';

export type MaterialThickness = '0.8mm' | '1.0mm' | '1.2mm' | '1.5mm' | '2.0mm' | '3.0mm' | 'Custom';

export type MaterialFinish = 'Powder Coated' | 'Anodized' | 'Natural' | 'Wood Finish' | 'PVDF' | 'Brushed' | 'Mirror Finish' | 'Matt Finish';

export type MaterialColour = 'White' | 'Black' | 'Grey' | 'Bronze' | 'Champagne' | 'Wood' | 'Custom RAL';

export type GlassType = '5 mm' | '6 mm' | '8 mm' | '10 mm' | '12 mm' | 'Tempered' | 'Laminated' | 'Tinted' | 'Double Glazed';

export type InstallationOption = 'Supply Only' | 'Installation Only' | 'Supply + Install' | 'Fabrication Only' | 'Delivery Only';

export type DiscountMethod = 
  | 'Percentage Discount' 
  | 'Fixed Discount' 
  | 'Quantity Discount' 
  | 'Seasonal Discount' 
  | 'Promotion' 
  | 'Dealer Discount' 
  | 'Special Customer Discount' 
  | 'Negotiated Discount' 
  | 'Clearance Discount';

export type ProductStatus = 'Active' | 'Inactive' | 'Deactive' | 'Pending Approval' | 'Archived';

export interface MainMaterialSpec {
  id: string;
  materialType: 'Aluminium' | 'Steel' | 'Wood' | 'UPVC' | 'Composite' | 'Custom Material';
  profileName: string;
  sizeDimensions: string;
  color: string;
  lengthMeters: number;
  thicknessMm: number;
  supplierBrands: string[];
  additionalSpecs: string;
  surchargeLkr: number;
}

export interface GlassSpec {
  id: string;
  glassType: string;
  thicknessMm: string;
  brand: string;
  supplier: string;
  standards: string[];
  surchargeLkr: number;
}

export interface HardwareAccessorySpec {
  id: string;
  name: string;
  hardwareType: 'Lock Mechanism' | 'Handle System' | 'Roller & Sliding' | 'Hinge' | 'Gasket & Seal' | 'Fasteners & Anchors' | 'Other Hardware';
  brandSpecs: string;
  qty: number;
  warrantyPeriod: string;
  installationStandards: string;
  maintenanceInstructions: string;
  surchargeLkr: number;
}

export interface CustomMaterialSpec {
  id: string;
  name: string;
  materialType: string;
  brand: string;
  qty: number;
  unit: string;
  details: string;
  surchargeLkr: number;
}

export interface TechnicalDetailItem {
  id: string;
  category: 'Functional Features' | 'Performance Features' | 'Safety Features' | 'Structural Capacity' | 'Thermal & Acoustic Rating';
  point: string;
  surchargeLkr: number;
}

export interface FabricationMethodSpec {
  id: string;
  methodName: string;
  details: string;
  standards: string;
  surchargeLkr: number;
}

export interface SurfaceFinishSpec {
  id: string;
  finishType: string;
  durabilityDetails: string;
  maintenanceTechniques: string;
  surchargeLkr: number;
}

export interface InstallationScopeItem {
  id: string;
  scopeType: 'Installation Scope' | 'Exclusion / Out of Scope';
  description: string;
  surchargeLkr?: number;
}

export interface ProductFAQ {
  id: string;
  question: string;
  answer: string;
  surchargeLkr?: number;
}

export interface WarrantyTermSpec {
  id: string;
  warrantyType: 'Structural Frame Guarantee' | 'Surface Powder Coating' | 'Glass Clarity & Seal' | 'Hardware & Accessories' | 'Water Leakage Guarantee' | 'Custom Warranty';
  timePeriod: string;
  applicableMaterials: string;
  surchargeLkr: number;
}

export interface DefectLiabilityFramework {
  id: string;
  periodMonths: number;
  terms: string;
  retentionSurchargePct: number;
  surchargeLkr?: number;
}

export interface CustomSurchargeItem {
  id: string;
  name: string;
  surchargeLkr: number;
  description?: string;
}

export interface CustomSurchargeCategory {
  id: string;
  categoryName: string;
  categoryType?: 'surcharge' | 'tier' | 'multi-factor';
  items: CustomSurchargeItem[];
}

export interface BaseProductConfiguration {
  default_thickness?: string;
  default_finish?: string;
  default_colour?: string;
  default_glass?: string;
  default_installation?: string;
  default_region?: string;
  default_tier?: string;
  default_customer_type?: string;
  default_discount_pct?: number;
  cost_ceiling_price?: number;
  target_margin_pct?: number;
}

export interface Product {
  id: string;
  product_code: string;
  product_name: string;
  category: CategoryType;
  sub_category?: string;
  supplier?: string;
  variant_name?: string;
  category_icon?: string;
  unit: ProductUnit;
  price_display_method?: PriceDisplayMethod;
  current_price: number;
  base_price?: number;
  cost_price?: number; // Head Office Cost Price
  cost_ceiling_price?: number; // Upper limit cost ceiling threshold
  min_selling_price?: number; // Minimum Selling Price (Margin Control)
  base_config?: BaseProductConfiguration; // Base Default Product Configuration Mapping
  old_price?: number;
  unit_weight_kg: number;
  status: ProductStatus;
  effective_date: string;
  last_updated: string;
  updated_by: string;
  description?: string;
  image_url?: string;
  proposed_price?: number;
  proposed_by?: string;
  proposed_reason?: string;

  // Price Variant Engine structures
  quantity_breaks?: QuantityBreak[];
  tier_prices?: Record<string, number>;
  customer_type_prices?: Record<string, number>;
  region_prices?: Record<string, number>;
  project_type_prices?: Record<string, number>;
  grade_prices?: Record<string, number>;
  thickness_prices?: Record<string, number>;
  finish_prices?: Record<string, number>;
  colour_prices?: Record<string, number>;
  glass_prices?: Record<string, number>;
  brand_prices?: Record<string, number>;
  installation_prices?: Record<string, number>;
  floor_level_prices?: Record<string, number>;
  facility_type_prices?: Record<string, number>;

  // Defaults/available options for selectors
  available_thicknesses?: MaterialThickness[];
  available_finishes?: MaterialFinish[];
  available_colours?: MaterialColour[];
  available_glass_types?: GlassType[];
  available_brands?: string[];
  available_installation_options?: InstallationOption[];
  available_floor_levels?: string[];
  available_facility_types?: string[];
  profile_series?: string;
  lock_type?: string;
  handle_type?: string;
  roller_type?: string;
  warranty?: string;
  packed_work_id?: string;
  packed_work_name?: string;

  // Enhanced Engineering Specs & Multi-Material Structures
  main_materials?: MainMaterialSpec[];
  glass_specs?: GlassSpec[];
  hardware_accessories?: HardwareAccessorySpec[];
  custom_materials?: CustomMaterialSpec[];
  technical_details?: TechnicalDetailItem[];
  fabrication_methods?: FabricationMethodSpec[];
  surface_finishes_specs?: SurfaceFinishSpec[];
  installation_scopes?: InstallationScopeItem[];
  product_faqs?: ProductFAQ[];
  warranty_terms_specs?: WarrantyTermSpec[];
  dlp_frameworks?: DefectLiabilityFramework[];
  custom_option_surcharges?: CustomSurchargeCategory[];
}

export interface PackedWorkVariantItem {
  id: string;
  product_id: string;
  product_code: string;
  product_name: string;
  category: CategoryType | string;
  unit: ProductUnit | string;
  quantity: number;
  unit_price: number;
  thickness_applied?: MaterialThickness | string;
  finish_applied?: MaterialFinish | string;
  glass_type_applied?: GlassType | string;
  colour_applied?: MaterialColour | string;
  hardware_spec?: string;
  unit_weight_kg?: number;
  notes?: string;
}

export interface PackedWorkPackage {
  id: string;
  package_code: string;
  package_name: string;
  description: string;
  category: CategoryType;
  items: PackedWorkVariantItem[];
  bundle_discount_pct: number;
  total_list_price: number;
  total_package_price: number;
  status: 'Active' | 'Draft' | 'Archived';
  created_at: string;
  updated_by: string;
  image_url?: string;
  installation_complexity?: 'Low' | 'Medium' | 'High' | 'Expert';
}

export interface BranchPriceOverride {
  id: string;
  branch_id: string;
  branch_code?: string;
  branch_name?: string;
  product_id: string;
  product_code?: string;
  special_price: number;
  effective_from: string; // e.g., "2026-08-01"
  effective_to?: string;
  created_by: string;
  status: 'Active' | 'Scheduled' | 'Expired';
  notes?: string;
}

export interface CustomerPriceOverride {
  id: string;
  customer_name: string;
  product_id: string;
  product_code?: string;
  product_name?: string;
  special_price: number;
  discount_pct?: number;
  contract_mode?: 'fixed_price' | 'discount_pct';
  quantity_tiers?: QuantityBreak[];
  effective_from: string;
  effective_to?: string;
  created_by: string;
  notes?: string;
}

export interface DiscountApprovalRequest {
  id: string;
  quotation_id?: string;
  quotation_number: string;
  branch_id: string;
  branch_name: string;
  requested_by: string;
  customer_name: string;
  original_amount: number;
  requested_discount_pct: number;
  discounted_amount: number;
  reason: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  reviewed_by?: string;
  review_date?: string;
  created_at: string;
  notes?: string;
}

export type PricePriorityTier = 'CUSTOMER_SPECIAL' | 'BRANCH_OVERRIDE' | 'BRANCH_MARGIN' | 'COMPANY_BASE';

export interface PricePriorityResolution {
  final_price: number;
  tier: PricePriorityTier;
  tier_label: string;
  badge_color: string;
  product_code: string;
  product_name: string;
  base_price: number;
  cost_price: number;
  min_selling_price: number;
  branch_override_price?: number;
  customer_special_price?: number;
  branch_margin_price?: number;
  branch_margin_pct?: number;
  effective_date?: string;
}

export interface PriceHistory {
  id: string;
  product_id: string;
  product_code: string;
  product_name: string;
  old_price: number;
  new_price: number;
  changed_by: string;
  changed_date: string;
  reason: string;
  branch_affected: string;
  region_affected?: string;
  update_type?: 'PRICE_CHANGE' | 'STATUS_CHANGE' | 'REGIONAL_OVERRIDE' | 'MASTER_DATA' | 'CUSTOMER_RATE';
  status?: string;
  old_status?: string;
  new_status?: string;
  details?: Record<string, any>;
}

export interface TrendDataPoint {
  date: string; // YYYY-MM-DD
  formattedDate: string; // e.g. "Aug 05"
  price: number;
  isForecast: boolean;
  lowerBound?: number;
  upperBound?: number;
  label?: string;
  changeFromCurrent?: number;
}

export interface ProductTrendPrediction {
  productId: string;
  productCode: string;
  productName: string;
  category: CategoryType;
  unit: ProductUnit;
  currentPrice: number;
  projectedPrice30d: number;
  priceChangeAmount30d: number;
  priceChangePct30d: number;
  trendDirection: 'UP' | 'DOWN' | 'STABLE';
  confidencePct: number;
  volatility: 'LOW' | 'MEDIUM' | 'HIGH';
  marketDrivers: string[];
  recommendation: string;
  historicalPoints: TrendDataPoint[];
  forecastPoints: TrendDataPoint[];
  allPoints: TrendDataPoint[];
}

export interface Branch {
  id: string;
  code: string;
  name: string;
  location: string;
  region?: string;
  status: 'Online' | 'Syncing' | 'Offline';
  last_sync: string;
  active_users: number;
  manager_name: string;
  margin_pct?: number; // Branch level margin percentage override
}

export interface Vehicle {
  id: string;
  type: string;
  capacity_kg: number;
  max_length_m: number;
  base_charge: number;
  per_km_rate: number;
  icon?: string;
}

export interface TransportRules {
  fuel_price_per_l: number;
  driver_allowance: number;
  night_delivery_surcharge_pct: number;
  remote_area_surcharge_pct: number;
  min_distance_km: number;
  base_fuel_rate: number;
}

export interface MaterialSupplier {
  id: string;
  supplier_name: string;
  material_category: 'Aluminium Profiles' | 'Glass Sheets' | 'Hardware & Accessories' | 'Screws & Fasteners' | 'Heavy Equipment & Crane Hire' | 'ACP & Composite Boards' | 'General Materials';
  location_name: string;
  district?: string;
  contact_phone?: string;
  default_vehicle_type?: string;
  base_pickup_fee: number;
  per_km_rate: number;
  estimated_prep_time_hours?: number;
}

export interface SupplyRouteLeg {
  id: string;
  supplier_id: string;
  supplier_name: string;
  material_category: string;
  origin_location: string;
  vehicle_type: string;
  cargo_weight_kg: number;
  max_length_m: number;
  distance_km: number;
  leg_cost: number;
  notes?: string;
}

export interface SiteLocation {
  id: string;
  name: string;
  district: string;
  distance_km: number;
  est_travel_time_min: number;
  is_remote: boolean;
}

export interface TransportCalculationInput {
  location_id: string;
  custom_distance_km?: number;
  total_weight_kg: number;
  max_item_length_m: number;
  vehicle_type_override?: string;
  is_night_delivery: boolean;
  is_remote_area: boolean;
  include_driver_allowance: boolean;
}

export interface TransportCalculationResult {
  vehicle_used: Vehicle;
  vehicle_type?: string;
  total_weight_kg?: number;
  distance_km: number;
  base_charge: number;
  distance_cost: number;
  fuel_adjustment: number;
  driver_allowance: number;
  night_surcharge: number;
  remote_surcharge: number;
  total_transport_cost: number;
  travel_time_min: number;
  breakdown_lines: Array<{ label: string; amount: number }>;
}

export interface QuotationItem {
  id: string;
  product_id: string;
  product_code: string;
  product_name: string;
  unit: ProductUnit;
  price_display_method?: PriceDisplayMethod;
  unit_price: number;
  base_rate?: number;
  margin_pct_applied?: number;
  quantity: number;
  length_m?: number;
  weight_kg: number;
  total_price: number;
  price_source?: PricePriorityTier | 'QUANTITY_BREAK' | 'MANUAL_OVERRIDE';
  price_source_label?: string;

  // Price Variant Specifications
  quantity_break_applied?: string;
  tier_applied?: PricingTier;
  customer_type_applied?: CustomerType;
  region_applied?: RegionZone;
  project_type_applied?: ProjectType;
  grade_applied?: MaterialGrade | string;
  thickness_applied?: MaterialThickness | string;
  finish_applied?: MaterialFinish | string;
  colour_applied?: MaterialColour | string;
  glass_type_applied?: GlassType | string;
  brand_applied?: string;
  installation_option_applied?: InstallationOption;
  floor_level_applied?: string;
  facility_type_applied?: string;
  custom_options_applied?: Record<string, { categoryName: string; optionName: string; surchargeLkr: number }>;
  spec_surcharges_applied?: Record<string, { categoryName: string; optionName: string; surchargeLkr: number }>;
  surcharge_selections_11cat?: Record<string, string>;
  surcharge_breakdown_11cat?: Array<{ categoryId: string; categoryName: string; optionName: string; type: 'percentage' | 'fixed_lkr'; value: number; amountLkr: number }>;

  profile_series?: string;
  lock_type?: string;
  handle_type?: string;
  roller_type?: string;
  warranty?: string;
  packed_work_id?: string;
  packed_work_name?: string;

  discount_method_applied?: DiscountMethod;
  discount_value?: number; // % or fixed amount
  discount_value_applied?: number;
  discount_amount?: number;
  breakdown_notes?: string[];
}

export type QuotationType = 'TEMPORARY_BRANCH_DRAFT' | 'VALIDATED_OFFICIAL';

export interface Quotation {
  id: string;
  quotation_number: string;
  quotation_type?: QuotationType;
  barcode?: string;
  qr_code_data?: string;
  customer_name: string;
  customer_phone: string;
  site_address: string;
  site_location_name: string;
  branch_id: string;
  branch_name: string;
  date: string;
  valid_until: string;
  status: 'Temporary Branch Draft' | 'Pending HO Validation' | 'Validated Official' | 'Draft' | 'Pending Approval' | 'Approved' | 'Sent' | 'Rejected' | 'Verified Quote';
  items: QuotationItem[];
  transport_details?: TransportCalculationResult;
  material_subtotal?: number;
  fabrication_cost?: number;
  installation_cost?: number;
  subtotal?: number;
  subtotal_price?: number;
  transport_cost: number;
  gross_total?: number;
  discount_pct?: number;
  discount_amount: number;
  tax_pct?: number;
  tax_amount: number;
  net_total: number;
  notes?: string;
  created_by?: string;
  customer_email?: string;
  customer_address?: string;
  customer_type?: string;
  expiry_date?: string;
  delivery_location?: string;
  distance_km?: number;
  vehicle_type?: string;
  vehicle_id?: string;
  total_weight_kg?: number;
  branch_code?: string;
  created_at?: string;
  external_software_ref?: string;
  validated_at?: string;
  validated_by?: string;
  validation_notes?: string;
}

export interface RealTimeEvent {
  id: string;
  timestamp: string;
  type: 'PRICE_UPDATE' | 'PRICE_PROPOSAL' | 'SYNC_STATUS' | 'NEW_QUOTATION' | 'TRANSPORT_RULE_CHANGE' | 'BATCH_MARGIN_PUSH';
  title: string;
  message: string;
  product_code?: string;
  old_price?: number;
  new_price?: number;
  branch_name?: string;
}

export interface UserRole {
  id: string;
  name: string;
  role: 'HO_ADMIN' | 'BRANCH_MANAGER' | 'SALES_REP' | 'ESTIMATOR';
  branch_id: string;
  branch_name: string;
}

export interface BankDetails {
  bank_name: string;
  account_number: string;
  account_name: string;
  branch_name: string;
  swift_code?: string;
}

export interface CurrencySetting {
  code: string;
  symbol: string;
  name: string;
  exchange_rate_to_lkr: number;
  is_default: boolean;
}

export interface SurchargePreset {
  id: string;
  name: string;
  code: string;
  description: string;
  category: string;
  surcharge_type: 'Fixed LKR' | 'Percentage Base' | 'Multi-Factor Multiplier';
  base_value: number;
  applied_factors?: {
    thickness_factor?: number;
    floor_level_factor?: number;
    facility_type_factor?: number;
    urgent_handling_lkr?: number;
  };
  applicable_categories?: string[];
  created_at?: string;
  status: 'Active' | 'Inactive';
}

export interface CompanySettings {
  company_name: string;
  tagline: string;
  logo_url: string;
  registration_no: string;
  tax_vat_id: string;
  phone: string;
  email: string;
  address: string;
  website: string;
  bank_details: BankDetails;
  currencies: CurrencySetting[];
  invoice_footer_terms: string;
  idle_session_timeout_minutes?: number;
  // Head Office Emergency Master Backup Recovery Key
  ho_backup_key?: string;
  ho_backup_key_status?: 'Active' | 'Deactivated';
  ho_backup_key_updated_at?: string;
  ho_backup_key_updated_by?: string;
  ho_backup_key_notes?: string;
}

export interface SystemUser {
  id: string;
  employee_id?: string;
  name: string;
  email: string;
  role: 'Super Admin' | 'HO Admin' | 'Branch Manager' | 'Sales Executive';
  branch_id: string;
  branch_name: string;
  status: 'Active' | 'Pending Approval' | 'Deactivated';
  phone?: string;
  created_at?: string;
  last_login?: string;
  mustChangePassword?: boolean;
  passwordChangedAt?: string;
  mfaEnabled?: boolean;
  mfaSecret?: string;
  mfaType?: 'authenticator' | 'email' | 'none';
  mfaBackupCodes?: string[];
  failedLoginAttempts?: number;
  lockedUntil?: string;
  passwordHash?: string;
  password?: string;
  authAuditLogs?: { id: string; timestamp: string; action: string; ipAddress: string; device: string }[];
}

export interface SubCategoryItem {
  id: string;
  name: string;
  status: 'Active' | 'Deactive';
  description?: string;
}

export interface CategoryConfig {
  id: string;
  name: string;
  description: string;
  status?: 'Active' | 'Deactive';
  subcategories: (string | SubCategoryItem)[];
}

export interface LocationConfig {
  id: string;
  name: string;
  district: string;
  region: string;
  status: 'Active' | 'Inactive';
}

export interface CustomerTypeConfig {
  id: string;
  name: string;
  default_discount_pct: number;
  description: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  district_region?: string;
  customer_type: CustomerType;
  tax_id?: string;
  discount_tier_pct?: number;
  created_at?: string;
}

export interface KeyboardShortcutConfig {
  id: string;
  label: string;
  description: string;
  key: string;
  ctrlKey?: boolean;
  altKey?: boolean;
  shiftKey?: boolean;
  enabled: boolean;
  category: 'Actions' | 'Navigation' | 'Panel & Tools';
}

export interface ShortcutSettingsMap {
  [actionId: string]: KeyboardShortcutConfig;
}

export interface BranchSpecificSettings {
  branch_id: string;
  branch_code: string;
  branch_name: string;
  
  // Custom Branding & Contact Overrides
  custom_phone?: string;
  custom_email?: string;
  custom_address?: string;
  custom_manager_title?: string;
  
  // Custom Financial & Bank Account Overrides
  custom_bank_name?: string;
  custom_account_no?: string;
  custom_branch_name?: string;
  custom_currency?: string;
  
  // Operational Policies & Authorization Rules
  max_executive_discount_pct: number;
  require_ho_discount_approval_above_pct: number;
  allow_manual_price_override: boolean;
  allow_branch_transport_override: boolean;
  auto_print_invoice_on_save: boolean;
  regional_transport_surcharge_pct: number;
  default_surcharge_preset_id?: string;
  
  // Push Version & Audit Info
  last_pushed_at?: string;
  last_pushed_by?: string;
  push_version?: number;
  push_notes?: string;
}

export interface BranchPushDirective {
  id: string;
  timestamp: string;
  pushed_by: string;
  target_branch_id: string;
  target_branch_code: string;
  target_branch_name: string;
  directive_title: string;
  version_number: number;
  changes_summary: string[];
  settings_snapshot: Partial<BranchSpecificSettings>;
  status: 'Pushed & Active' | 'Acknowledged by Branch';
}


