import { Product, PriceHistory, Branch, Vehicle, TransportRules, SiteLocation, MaterialSupplier, Quotation, BranchPriceOverride, CustomerPriceOverride, DiscountApprovalRequest, Customer, CompanySettings, SystemUser, CategoryConfig, LocationConfig, CustomerTypeConfig } from '../types';

export const INITIAL_PRODUCTS: Product[] = [];

export const INITIAL_PRICE_HISTORY: PriceHistory[] = [];

export const INITIAL_BRANCHES: Branch[] = [
  {
    id: 'b-ho',
    code: 'HO',
    name: 'Head Office Admin Center',
    location: 'Central Master Server - Colombo 03',
    region: 'Head Office',
    status: 'Online',
    last_sync: 'Instant Live',
    active_users: 1,
    manager_name: 'System Admin (Master)',
    margin_pct: 0
  },
  {
    id: 'b-cmb',
    code: 'CMB',
    name: 'Colombo Port & City Sales',
    location: '344 Baseline Road, Colombo 09',
    region: 'Western Province',
    status: 'Online',
    last_sync: 'Connected (Live Push)',
    active_users: 0,
    manager_name: 'Colombo Branch Manager',
    margin_pct: 5
  },
  {
    id: 'b-kdy',
    code: 'KDY',
    name: 'Kandy Hill Capital Branch',
    location: '120 William Gopallawa Mawatha, Kandy',
    region: 'Central Province',
    status: 'Online',
    last_sync: 'Connected (Live Push)',
    active_users: 0,
    manager_name: 'Kandy Branch Manager',
    margin_pct: 15
  },
  {
    id: 'b-gle',
    code: 'GLE',
    name: 'Galle Coastal Hub',
    location: '88 Matara Road, Galle',
    region: 'Southern Province',
    status: 'Online',
    last_sync: 'Connected (Live Push)',
    active_users: 0,
    manager_name: 'Galle Branch Manager',
    margin_pct: 10
  },
  {
    id: 'b-jaf',
    code: 'JAF',
    name: 'Jaffna Regional Branch',
    location: '45 Kandy Road, Jaffna',
    region: 'Northern Province',
    status: 'Online',
    last_sync: 'Connected (Live Push)',
    active_users: 0,
    manager_name: 'Jaffna Branch Manager',
    margin_pct: 12
  }
];

export const INITIAL_BRANCH_PRICES: BranchPriceOverride[] = [];

export const INITIAL_CUSTOMER_PRICES: CustomerPriceOverride[] = [];

export const INITIAL_DISCOUNT_REQUESTS: DiscountApprovalRequest[] = [];

export const INITIAL_VEHICLES: Vehicle[] = [
  {
    id: 'v-van',
    type: 'Small Commercial Van (1 Ton)',
    capacity_kg: 1000,
    max_length_m: 3.5,
    base_charge: 3500,
    per_km_rate: 120,
    icon: 'truck'
  },
  {
    id: 'v-lorry',
    type: 'Medium Flatbed Lorry (5 Ton)',
    capacity_kg: 5000,
    max_length_m: 6.5,
    base_charge: 7500,
    per_km_rate: 250,
    icon: 'truck-heavy'
  },
  {
    id: 'v-trailer',
    type: 'Heavy Logistics Trailer (15 Ton)',
    capacity_kg: 15000,
    max_length_m: 12.0,
    base_charge: 15000,
    per_km_rate: 500,
    icon: 'container'
  }
];

export const INITIAL_TRANSPORT_RULES: TransportRules = {
  fuel_price_per_l: 350,
  driver_allowance: 3500,
  night_delivery_surcharge_pct: 15,
  remote_area_surcharge_pct: 20,
  min_distance_km: 10,
  base_fuel_rate: 350
};

export const INITIAL_LOCATIONS: SiteLocation[] = [];

export const INITIAL_SUPPLIERS: MaterialSupplier[] = [];

export const INITIAL_QUOTATIONS: Quotation[] = [];

export const INITIAL_CUSTOMERS: Customer[] = [];

export const INITIAL_COMPANY_SETTINGS: CompanySettings = {
  company_name: 'INNOVISTA ALUMINIUM & GLASS POS SYSTEM',
  tagline: 'Enterprise Architectural Systems & Multi-Branch Network',
  logo_url: '/src/assets/images/pos_logo_banner_1786169189051.jpg',
  registration_no: 'PV-98234-SL',
  tax_vat_id: 'VAT-10029384-7000',
  phone: '+94 11 288 9000 / +94 77 345 6789',
  email: 'info@innovistapos.lk',
  address: 'No. 102 Innovista Tower, Nawala Road, Rajagiriya, Colombo',
  website: 'www.innovistapos.lk',
  bank_details: {
    bank_name: 'Commercial Bank of Ceylon PLC',
    account_number: '1000-849201-001',
    account_name: 'Innovista Aluminium & Glass Systems (Pvt) Ltd',
    branch_name: 'Nawala Corporate Branch',
    swift_code: 'CCEYLKCX'
  },
  currencies: [
    { code: 'LKR', symbol: 'Rs.', name: 'Sri Lankan Rupee', exchange_rate_to_lkr: 1.0, is_default: true },
    { code: 'USD', symbol: '$', name: 'US Dollar', exchange_rate_to_lkr: 308.50, is_default: false },
    { code: 'EUR', symbol: '€', name: 'Euro', exchange_rate_to_lkr: 335.20, is_default: false },
    { code: 'AED', symbol: 'AED', name: 'UAE Dirham', exchange_rate_to_lkr: 84.00, is_default: false }
  ],
  invoice_footer_terms: '1. All prices are valid for 14 days from date of issue.\n2. 50% advance payment required upon order confirmation.\n3. Goods once sold are non-refundable unless verified for manufacturing defect within 7 days.',
  ho_backup_key: 'HO-MASTER-EMERGENCY-2026-X89B',
  ho_backup_key_status: 'Active',
  ho_backup_key_updated_at: new Date().toISOString().split('T')[0],
  ho_backup_key_updated_by: 'Nishantha Perera (HO Super Admin)',
  ho_backup_key_notes: 'Master emergency recovery key for resetting user accounts when standard recovery is unavailable.'
};

export const INITIAL_USERS: SystemUser[] = [
  {
    id: 'user-001',
    employee_id: 'EMP-1001',
    name: 'Nishantha Perera',
    email: 'admin@innovistapos.lk',
    role: 'Super Admin',
    branch_id: 'b-ho',
    branch_name: 'Head Office Admin Center',
    status: 'Active',
    phone: '+94 77 111 2222',
    created_at: new Date().toISOString().split('T')[0],
    last_login: 'Never',
    mustChangePassword: false,
    mfaEnabled: true,
    mfaType: 'authenticator',
    mfaSecret: 'JBSWY3DPEHPK3PXP',
    mfaBackupCodes: ['A9HF-4K28', 'B92M-HD76', 'QJ82-KP19', 'M7K9-LX83', 'P3W2-VJ91', 'T4R8-BY65']
  }
];

export const INITIAL_CATEGORIES: CategoryConfig[] = [
  {
    id: 'cat-1',
    name: 'Aluminium Profiles',
    description: 'Extruded architectural aluminium profiles & framing systems',
    status: 'Active',
    subcategories: [
      { id: 'sub-cat-1-1', name: 'Sliding Door Profiles', status: 'Active' },
      { id: 'sub-cat-1-2', name: 'Casement Window Profiles', status: 'Active' },
      { id: 'sub-cat-1-3', name: 'Curtain Wall Mulleins', status: 'Active' },
      { id: 'sub-cat-1-4', name: 'Partition Channels', status: 'Active' },
      { id: 'sub-cat-1-5', name: 'Louvers', status: 'Active' }
    ]
  },
  {
    id: 'cat-2',
    name: 'Architectural Glass',
    description: 'High performance float, tempered, laminated, and double glazed panels',
    status: 'Active',
    subcategories: [
      { id: 'sub-cat-2-1', name: 'Clear Float Glass', status: 'Active' },
      { id: 'sub-cat-2-2', name: 'Tinted Solar Glass', status: 'Active' },
      { id: 'sub-cat-2-3', name: 'Tempered Glass', status: 'Active' },
      { id: 'sub-cat-2-4', name: 'Laminated Glass', status: 'Active' },
      { id: 'sub-cat-2-5', name: 'Double Glazed Units (DGU)', status: 'Active' }
    ]
  },
  {
    id: 'cat-3',
    name: 'Hardware & Accessories',
    description: 'Locks, rollers, hinges, weatherstrips, silicones and installation fittings',
    status: 'Active',
    subcategories: [
      { id: 'sub-cat-3-1', name: 'Multi-point Locks', status: 'Active' },
      { id: 'sub-cat-3-2', name: 'Heavy Rollers', status: 'Active' },
      { id: 'sub-cat-3-3', name: 'Friction Hinges', status: 'Active' },
      { id: 'sub-cat-3-4', name: 'Structural Silicone', status: 'Active' },
      { id: 'sub-cat-3-5', name: 'EPDM Gaskets', status: 'Active' }
    ]
  },
  {
    id: 'cat-4',
    name: 'Composite & Cladding',
    description: 'Aluminium Composite Panels (ACP) & exterior facade materials',
    status: 'Active',
    subcategories: [
      { id: 'sub-cat-4-1', name: 'PVDF Exterior ACP', status: 'Active' },
      { id: 'sub-cat-4-2', name: 'PE Interior ACP', status: 'Active' },
      { id: 'sub-cat-4-3', name: 'Perforated Mesh', status: 'Active' }
    ]
  }
];

export const INITIAL_CUSTOMER_TYPES: CustomerTypeConfig[] = [
  { id: 'ct-1', name: 'Company', default_discount_pct: 5, description: 'Corporate Clients & Registered Businesses' },
  { id: 'ct-2', name: 'Distributor', default_discount_pct: 8, description: 'Wholesale Fabricators & Authorized Distributors' },
  { id: 'ct-3', name: 'Developer', default_discount_pct: 6, description: 'Real Estate Developers & Large Scale Contractors' },
  { id: 'ct-4', name: 'Retail Customer', default_discount_pct: 0, description: 'Individual Walk-in Retail Buyers' },
  { id: 'ct-5', name: 'Architect', default_discount_pct: 5, description: 'Architectural Consultants & Interior Designers' }
];

export const INITIAL_LOCATION_CONFIGS: LocationConfig[] = [
  { id: 'loc-1', name: 'Colombo Municipal Zone', district: 'Colombo', region: 'Western Province', status: 'Active' },
  { id: 'loc-2', name: 'Gampaha Industrial Belt', district: 'Gampaha', region: 'Western Province', status: 'Active' },
  { id: 'loc-3', name: 'Kandy Urban Metro', district: 'Kandy', region: 'Central Province', status: 'Active' },
  { id: 'loc-4', name: 'Galle Coastal Corridor', district: 'Galle', region: 'Southern Province', status: 'Active' },
  { id: 'loc-5', name: 'Kurunegala Junction', district: 'Kurunegala', region: 'North Western', status: 'Active' },
  { id: 'loc-6', name: 'Jaffna Northern Hub', district: 'Jaffna', region: 'Northern Province', status: 'Active' }
];
