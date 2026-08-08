import React, { useState, useEffect, useMemo } from 'react';
import {
  Package,
  Tag,
  DollarSign,
  Layers,
  Settings,
  Sliders,
  FileText,
  CheckCircle2,
  X,
  Plus,
  Trash2,
  Percent,
  Calendar,
  ShieldAlert,
  ChevronRight,
  ChevronLeft,
  Search,
  MapPin,
  Building2,
  UserCheck,
  Award,
  Filter,
  Upload,
  Image as ImageIcon,
  Maximize2
} from 'lucide-react';
import {
  ALL_SRI_LANKA_REGIONS,
  SRI_LANKA_PROVINCES,
  getRegionsByProvince,
  searchSriLankaRegions
} from '../utils/sriLankaRegions';

import {
  Product,
  CategoryType,
  ProductUnit,
  PriceDisplayMethod,
  ProductStatus,
  QuantityBreak,
  MaterialThickness,
  MaterialFinish,
  MaterialColour,
  GlassType,
  InstallationOption,
  PricingTier,
  CustomerType,
  RegionZone,
  ProjectType,
  MaterialGrade,
  MainMaterialSpec,
  GlassSpec,
  HardwareAccessorySpec,
  CustomMaterialSpec,
  TechnicalDetailItem,
  FabricationMethodSpec,
  SurfaceFinishSpec,
  InstallationScopeItem,
  ProductFAQ,
  WarrantyTermSpec,
  DefectLiabilityFramework,
  CustomSurchargeCategory,
  CustomSurchargeItem,
  BaseProductConfiguration,
  PriceHistory
} from '../types';
import { ProductAuditLogViewer } from './ProductAuditLogViewer';

export interface ProductFormData {
  id?: string;
  product_code: string;
  product_name: string;
  category: CategoryType;
  sub_category?: string;
  status: ProductStatus;
  unit: ProductUnit;
  price_display_method: PriceDisplayMethod;
  unit_weight_kg: number;
  base_price: number;
  cost_price: number;
  cost_ceiling_price: number;
  min_selling_price: number;
  base_config: BaseProductConfiguration;
  description: string;
  image_url?: string;

  // Specs
  profile_series: string;
  lock_type: string;
  handle_type: string;
  roller_type: string;
  warranty: string;

  // Enhanced Specifications Matrices & Technical Details
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

  // Multi-Factor Variant Engine Surcharges (LKR)
  thickness_prices: Record<string, number>;
  finish_prices: Record<string, number>;
  colour_prices: Record<string, number>;
  glass_prices: Record<string, number>;
  installation_prices: Record<string, number>;
  floor_level_prices: Record<string, number>;
  facility_type_prices: Record<string, number>;
  tier_prices: Record<string, number>;
  customer_type_prices: Record<string, number>;
  region_prices: Record<string, number>;
  project_type_prices: Record<string, number>;
  grade_prices: Record<string, number>;
  brand_prices: Record<string, number>;

  // Quantity Breaks
  quantity_breaks: QuantityBreak[];

  // Audit log details (for edit)
  reason?: string;
  effective_date?: string;
}

import { MainCategoryConfig } from './MasterPriceManagement';

interface ProductMasterFormModalProps {
  isOpen: boolean;
  mode: 'add' | 'edit';
  product: Product | null;
  categories: CategoryType[];
  mainCategories?: MainCategoryConfig[];
  onClose: () => void;
  onSubmit: (data: ProductFormData) => Promise<void>;
  isSubmitting: boolean;
  priceHistory?: PriceHistory[];
}

const THICKNESS_OPTIONS: MaterialThickness[] = ['0.8mm', '1.0mm', '1.2mm', '1.5mm', '2.0mm', '3.0mm', 'Custom'];
const FINISH_OPTIONS: MaterialFinish[] = ['Powder Coated', 'Anodized', 'Natural', 'Wood Finish', 'PVDF', 'Brushed', 'Mirror Finish', 'Matt Finish'];
const COLOUR_OPTIONS: MaterialColour[] = ['White', 'Black', 'Grey', 'Bronze', 'Champagne', 'Wood', 'Custom RAL'];
const GLASS_OPTIONS: GlassType[] = ['5 mm', '6 mm', '8 mm', '10 mm', '12 mm', 'Tempered', 'Laminated', 'Tinted', 'Double Glazed'];
const INSTALLATION_OPTIONS: InstallationOption[] = ['Supply Only', 'Installation Only', 'Supply + Install', 'Fabrication Only', 'Delivery Only'];
const FLOOR_LEVEL_OPTIONS: string[] = ['Ground Floor (0-3m)', '1st - 3rd Floor (Low Rise)', '4th - 10th Floor (Mid Rise)', '11th - 20th Floor (High Rise)', '21st+ Floor (Tower Crane / Hoist)'];
const FACILITY_TYPE_OPTIONS: string[] = ['Standard Construction Site', 'Commercial Mall / Retail Store', 'Industrial Factory / Heavy Plant', 'Hospital Clean Room / Medical Zone', 'Hotel / Resort / Luxury Tower', 'High Security / Airport Zone'];
const TIER_OPTIONS: PricingTier[] = ['Retail', 'Wholesale', 'Dealer', 'Gold', 'Silver', 'Bronze', 'Contractor', 'Corporate', 'Government', 'VIP Customer'];
const CUSTOMER_TYPE_OPTIONS: CustomerType[] = ['Retail Customer', 'Company', 'Developer', 'Architect', 'Government', 'Hotel', 'Apartment Builder', 'Interior Designer', 'Dealer', 'Distributor'];
const REGION_OPTIONS: string[] = ALL_SRI_LANKA_REGIONS.map(r => r.name);
const PROJECT_TYPE_OPTIONS: ProjectType[] = ['Residential', 'Commercial', 'Industrial', 'Hospital', 'School', 'Warehouse', 'Hotel', 'Factory', 'Apartment'];
const GRADE_OPTIONS: MaterialGrade[] = ['Standard', 'Premium', 'Luxury', 'Imported', 'Local', 'Custom'];
const BRAND_OPTIONS: string[] = ['Alumex', 'Lanka Aluminium', 'Swisstek', 'St. Anthony', 'Imported Euro', 'Generic Local'];

const ALL_UNITS: { value: ProductUnit; label: string }[] = [
  { value: 'bar', label: 'Bar (6m Length)' },
  { value: 'sq.ft', label: 'Square Feet (Sq. Ft)' },
  { value: 'sheet', label: 'Full Sheet (ACP/Panel)' },
  { value: 'kg', label: 'Kilogram (kg)' },
  { value: 'pc', label: 'Piece (pc)' },
  { value: 'm', label: 'Meter (m)' },
  { value: 'm²', label: 'Square Meter (m²)' },
  { value: 'Set', label: 'Complete Set' },
  { value: 'Box', label: 'Box / Pack' },
  { value: 'Hour', label: 'Hour (Service/Labour)' },
  { value: 'Day', label: 'Day (Rental/Labour)' },
  { value: 'Per Worker', label: 'Worker / Person (Per Worker)' },
  { value: 'Per Trip', label: 'Transport Trip (Per Trip)' },
  { value: 'Per Visit', label: 'Site Inspection Visit (Per Visit)' },
  { value: 'Lump Sum', label: 'Lump Sum Contract' }
];

const DISPLAY_METHODS: { value: PriceDisplayMethod; label: string }[] = [
  { value: 'Standard', label: 'Standard Base Price' },
  { value: 'Price per Piece', label: 'Price per Piece' },
  { value: 'Price per Meter', label: 'Price per Linear Meter' },
  { value: 'Price per Square Meter', label: 'Price per Square Meter' },
  { value: 'Price per Cubic Meter', label: 'Price per Cubic Meter' },
  { value: 'Price per Hour', label: 'Price per Service Hour' }
];

export const ProductMasterFormModal: React.FC<ProductMasterFormModalProps> = ({
  isOpen,
  mode,
  product,
  categories,
  mainCategories,
  onClose,
  onSubmit,
  isSubmitting,
  priceHistory = []
}) => {
  const [activeTab, setActiveTab] = useState<'general' | 'units' | 'pricing' | 'specs' | 'variants' | 'tiers' | 'audit'>('general');
  const [specsSubTab, setSpecsSubTab] = useState<'main_materials' | 'glass_specs' | 'hardware' | 'custom_materials' | 'technical' | 'methods' | 'finishes' | 'scopes' | 'faqs' | 'warranties' | 'dlp'>('main_materials');
  const [searchTerm, setSearchTerm] = useState('');
  const [slProvinceFilter, setSlProvinceFilter] = useState<string>('ALL');
  const [slRegionQuery, setSlRegionQuery] = useState<string>('');

  // State for adding custom key-value option surcharges
  const [newOptionCategory, setNewOptionCategory] = useState<string>('thickness_prices');
  const [newOptionKey, setNewOptionKey] = useState('');
  const [newOptionValue, setNewOptionValue] = useState<string>('0');

  // Custom Category State
  const [newCatNameInput, setNewCatNameInput] = useState('');
  const [newCatTypeInput, setNewCatTypeInput] = useState<'surcharge' | 'tier' | 'multi-factor'>('surcharge');
  const [showNewCatInput, setShowNewCatInput] = useState(false);
  const [newItemInputs, setNewItemInputs] = useState<Record<string, { name: string; price: string }>>({});
  const [inlineQuickAddInputs, setInlineQuickAddInputs] = useState<Record<string, { name: string; price: string }>>({});

  // Form State
  const [formData, setFormData] = useState<ProductFormData>({
    product_code: '',
    product_name: '',
    category: 'Aluminium Profiles',
    sub_category: '',
    status: 'Active',
    unit: 'bar',
    price_display_method: 'Standard',
    unit_weight_kg: 0,
    base_price: 0,
    cost_price: 0,
    min_selling_price: 0,
    description: '',
    image_url: '',
    profile_series: '',
    lock_type: '',
    handle_type: '',
    roller_type: '',
    warranty: '',
    main_materials: [],
    glass_specs: [],
    hardware_accessories: [],
    custom_materials: [],
    technical_details: [],
    fabrication_methods: [],
    surface_finishes_specs: [],
    installation_scopes: [],
    product_faqs: [],
    warranty_terms_specs: [],
    dlp_frameworks: [],
    custom_option_surcharges: [],
    thickness_prices: {},
    finish_prices: {},
    colour_prices: {},
    glass_prices: {},
    installation_prices: {},
    tier_prices: {},
    customer_type_prices: {},
    region_prices: {},
    project_type_prices: {},
    grade_prices: {},
    brand_prices: {},
    quantity_breaks: [],
    reason: '',
    effective_date: new Date().toISOString().split('T')[0]
  });

  const availableSubCategories = useMemo(() => {
    if (!mainCategories || !formData?.category) return [];
    const foundCat = mainCategories.find(c => c.name.toLowerCase() === formData.category.toLowerCase());
    return foundCat?.subCategories || [];
  }, [mainCategories, formData?.category]);

  // Initialize form state when modal opens or product changes
  useEffect(() => {
    if (product && mode === 'edit') {
      const baseVal = product.base_price || product.current_price || 0;
      setFormData({
        id: product.id,
        product_code: product.product_code || '',
        product_name: product.product_name || '',
        category: product.category || 'Aluminium Profiles',
        sub_category: product.sub_category || '',
        status: product.status || 'Active',
        unit: product.unit || 'bar',
        price_display_method: product.price_display_method || 'Standard',
        unit_weight_kg: product.unit_weight_kg || 0,
        base_price: baseVal,
        cost_price: product.cost_price || Math.round(baseVal * 0.8),
        min_selling_price: product.min_selling_price || Math.round(baseVal * 0.9),
        description: product.description || '',
        image_url: product.image_url || '',
        profile_series: product.profile_series || '',
        lock_type: product.lock_type || '',
        handle_type: product.handle_type || '',
        roller_type: product.roller_type || '',
        warranty: product.warranty || '',
        main_materials: product.main_materials || [],
        glass_specs: product.glass_specs || [],
        hardware_accessories: product.hardware_accessories || [],
        custom_materials: product.custom_materials || [],
        technical_details: product.technical_details || [],
        fabrication_methods: product.fabrication_methods || [],
        surface_finishes_specs: product.surface_finishes_specs || [],
        installation_scopes: product.installation_scopes || [],
        product_faqs: product.product_faqs || [],
        warranty_terms_specs: product.warranty_terms_specs || [],
        dlp_frameworks: product.dlp_frameworks || [],
        custom_option_surcharges: product.custom_option_surcharges || [],
        thickness_prices: product.thickness_prices || {},
        finish_prices: product.finish_prices || {},
        colour_prices: product.colour_prices || {},
        glass_prices: product.glass_prices || {},
        installation_prices: product.installation_prices || {},
        floor_level_prices: product.floor_level_prices || {},
        facility_type_prices: product.facility_type_prices || {},
        tier_prices: product.tier_prices || {},
        customer_type_prices: product.customer_type_prices || {},
        region_prices: product.region_prices || {},
        project_type_prices: product.project_type_prices || {},
        grade_prices: product.grade_prices || {},
        brand_prices: product.brand_prices || {},
        quantity_breaks: product.quantity_breaks || [],
        reason: '',
        effective_date: new Date().toISOString().split('T')[0]
      });
    } else if (mode === 'add') {
      setFormData({
        product_code: `AL${Math.floor(Math.random() * 9000 + 1000)}`,
        product_name: '',
        category: 'Aluminium Profiles',
        sub_category: '',
        status: 'Active',
        unit: 'bar',
        price_display_method: 'Standard',
        unit_weight_kg: 4.5,
        base_price: 12500,
        cost_price: 10000,
        min_selling_price: 11250,
        description: '',
        profile_series: '100 Series Heavy Duty',
        lock_type: 'Multi-Point Mortise Lock',
        handle_type: 'Architectural Lever Handle',
        roller_type: 'Heavy Duty Nylon Roller',
        warranty: '10 Years Structural',
        main_materials: [],
        glass_specs: [],
        hardware_accessories: [],
        custom_materials: [],
        technical_details: [],
        fabrication_methods: [],
        surface_finishes_specs: [],
        installation_scopes: [],
        product_faqs: [],
        warranty_terms_specs: [],
        dlp_frameworks: [],
        custom_option_surcharges: [
          {
            id: 'cat-default-1',
            categoryName: 'Anodizing Micron Grade',
            categoryType: 'surcharge',
            items: [
              { id: 'item-1', name: '15 Micron Anodized Coating', surchargeLkr: 800 },
              { id: 'item-2', name: '25 Micron Heavy Duty Anodized', surchargeLkr: 1600 }
            ]
          },
          {
            id: 'cat-default-2',
            categoryName: 'Hardware Lock Mechanism Surcharge',
            categoryType: 'surcharge',
            items: [
              { id: 'item-3', name: 'Single Point Latch Lock', surchargeLkr: 0 },
              { id: 'item-4', name: 'Multi-Point German Mortise Lock', surchargeLkr: 3500 }
            ]
          }
        ],
        thickness_prices: { '1.2mm': 0, '1.5mm': 1500, '2.0mm': 3000 },
        finish_prices: { 'Powder Coated': 0, 'Anodized': 1200, 'Wood Finish': 2800 },
        colour_prices: { 'White': 0, 'Black': 0, 'Bronze': 500, 'Champagne': 800 },
        glass_prices: { '5 mm': 0, '6 mm': 450, 'Tempered': 1800 },
        installation_prices: { 'Supply Only': 0, 'Supply + Install': 2500 },
        floor_level_prices: { 'Ground Floor (0-3m)': 0, '1st - 3rd Floor (Low Rise)': 500, '4th - 10th Floor (Mid Rise)': 1200, '11th - 20th Floor (High Rise)': 2500, '21st+ Floor (Tower Crane / Hoist)': 4500 },
        facility_type_prices: { 'Standard Construction Site': 0, 'Commercial Mall / Retail Store': 800, 'Industrial Factory / Heavy Plant': 1500, 'Hospital Clean Room / Medical Zone': 2200, 'Hotel / Resort / Luxury Tower': 1800, 'High Security / Airport Zone': 3000 },
        tier_prices: { 'Retail': 12500, 'Wholesale': 11800, 'Dealer': 11200, 'Gold': 11000 },
        customer_type_prices: { 'Developer': 11500, 'Architect': 11800, 'Government': 11000 },
        region_prices: { 'Colombo': 0, 'Southern Province': 500, 'Island-wide': 1000 },
        project_type_prices: { 'Residential': 0, 'Commercial': 200, 'Industrial': 400 },
        grade_prices: { 'Standard': 0, 'Premium': 1500, 'Luxury': 3500 },
        brand_prices: { 'Alumex': 0, 'Swisstek': 300, 'Imported Euro': 2500 },
        quantity_breaks: [
          { id: 'qb-1', min_qty: 1, max_qty: 10, unit_price: 12500, label: 'Standard 1-10 Units' },
          { id: 'qb-2', min_qty: 11, max_qty: 50, unit_price: 11800, label: 'Bulk 11-50 Units' },
          { id: 'qb-3', min_qty: 51, max_qty: 500, unit_price: 11200, label: 'Wholesale 51+ Units' }
        ],
        reason: '',
        effective_date: new Date().toISOString().split('T')[0]
      });
    }
  }, [product, mode, isOpen]);

  if (!isOpen) return null;

  // Helpers to update dictionary values
  const handleLoadDefaultSpecsTemplate = () => {
    setFormData(prev => ({
      ...prev,
      main_materials: [
        {
          id: `mm-${Date.now()}-1`,
          materialType: 'Aluminium',
          profileName: prev.profile_series || '100 Series Heavy Duty Architectural Profile',
          sizeDimensions: '100mm x 45mm x 1.6mm',
          color: 'Anodized Bronze / Powder Coated White',
          lengthMeters: 6.0,
          thicknessMm: 1.6,
          supplierBrands: ['Alumex', 'Swisstek', 'St. Anthony'],
          additionalSpecs: '6063-T6 Temper Grade Architectural Extrusion',
          surchargeLkr: 0
        },
        {
          id: `mm-${Date.now()}-2`,
          materialType: 'Steel',
          profileName: 'Galvanized Structural Sub-Frame Reinforcement',
          sizeDimensions: '50mm x 50mm x 2.0mm',
          color: 'Zinc Galvanized Primer',
          lengthMeters: 6.0,
          thicknessMm: 2.0,
          supplierBrands: ['Lanka Steel', 'Imported Euro Steel'],
          additionalSpecs: 'Anti-corrosive structural frame support',
          surchargeLkr: 850
        }
      ],
      glass_specs: [
        {
          id: `gl-${Date.now()}-1`,
          glassType: 'Toughened Clear Glass',
          thicknessMm: '6mm',
          brand: 'Saint-Gobain',
          supplier: 'Glazetech Lanka',
          standards: ['SLS 1324', 'BS 6206', 'EN 12150'],
          surchargeLkr: 0
        },
        {
          id: `gl-${Date.now()}-2`,
          glassType: 'Double Glazed Insulated Unit (IGU)',
          thicknessMm: '6mm + 12A + 6mm',
          brand: 'Asahi Float Glass',
          supplier: 'St. Anthony Glazing',
          standards: ['SLS 1324', 'ASTM C1048'],
          surchargeLkr: 2200
        }
      ],
      hardware_accessories: [
        {
          id: `hw-${Date.now()}-1`,
          name: 'Multi-Point Mortise Locking System',
          hardwareType: 'Lock Mechanism',
          brandSpecs: 'Kin Long SS304 Multi-Point Lock',
          qty: 1,
          warrantyPeriod: '5 Years Replacement Guarantee',
          installationStandards: 'Tighten with torque wrench to 4.5 Nm, align keep plates',
          maintenanceInstructions: 'Apply silicone lubricant to locking cams bi-annually',
          surchargeLkr: 0
        },
        {
          id: `hw-${Date.now()}-2`,
          name: 'Heavy Duty Stainless Friction Stay Hinges',
          hardwareType: 'Hinge',
          brandSpecs: 'Securistyle SS316 Heavy Duty',
          qty: 2,
          warrantyPeriod: '10 Years Smooth Operation Guarantee',
          installationStandards: 'Mount with SS316 self-tapping screws',
          maintenanceInstructions: 'Keep tracks free of dirt and grit',
          surchargeLkr: 1200
        }
      ],
      custom_materials: [
        {
          id: `cm-${Date.now()}-1`,
          name: 'Structural Weatherproof Silicone Sealant',
          materialType: 'Sealant',
          brand: 'Dow Corning 795 / Sikasil',
          qty: 2,
          unit: 'Cartridge (310ml)',
          details: 'High-modulus neutral cure structural sealant for expansion joints',
          surchargeLkr: 450
        }
      ],
      technical_details: [
        {
          id: `td-${Date.now()}-1`,
          category: 'Functional Features',
          point: 'Smooth sliding and multi-stage locking mechanism with child-safety restraint.',
          surchargeLkr: 0
        },
        {
          id: `td-${Date.now()}-2`,
          category: 'Performance Features',
          point: 'Wind pressure resistance up to 2.5 kPa (Tested to ASTM E330 / SLS Standard).',
          surchargeLkr: 0
        },
        {
          id: `td-${Date.now()}-3`,
          category: 'Safety Features',
          point: 'Grade A Safety Glass shatter-proof impact resistance (EN 12600 Class 1B1).',
          surchargeLkr: 0
        }
      ],
      fabrication_methods: [
        {
          id: `fm-${Date.now()}-1`,
          methodName: 'Precision CNC Mitre Cutting & Mechanical Corner Cleating',
          details: 'Double-head CNC saw cutting at exact 45° angle with pneumatic corner crimping.',
          standards: 'ISO 9001 Fabrication Quality Control',
          surchargeLkr: 0
        }
      ],
      surface_finishes_specs: [
        {
          id: `sf-${Date.now()}-1`,
          finishType: 'Qualicoat Class 2 Powder Coating (80 Micron)',
          durabilityDetails: '15 Years Coastal Salt-Spray & UV Degradation Resistance Guarantee',
          maintenanceTechniques: 'Clean with neutral detergent water using soft microfiber cloth every 6 months.',
          surchargeLkr: 0
        }
      ],
      installation_scopes: [
        {
          id: `is-${Date.now()}-1`,
          scopeType: 'Installation Scope',
          description: 'Includes delivery to site, hoisting up to 3rd floor, structural fixing, and silicone perimeter sealing.'
        },
        {
          id: `is-${Date.now()}-2`,
          scopeType: 'Exclusion / Out of Scope',
          description: 'Masonry wall plastering, civil opening modifications, and main scaffolding above 3 floors excluded.'
        }
      ],
      product_faqs: [
        {
          id: `faq-${Date.now()}-1`,
          question: 'What is the maximum recommended panel height for this profile series?',
          answer: 'The maximum height is 2700mm with standard heavy-duty rollers, or 3200mm with tandem rollers.'
        },
        {
          id: `faq-${Date.now()}-2`,
          question: 'Is this system suitable for high-rise coastal apartments?',
          answer: 'Yes, when specified with Qualicoat Class 2 finish and SS316 hardware, it withstands coastal wind and salt spray.'
        }
      ],
      warranty_terms_specs: [
        {
          id: `wt-${Date.now()}-1`,
          warrantyType: 'Structural Frame Guarantee',
          timePeriod: '10 Years',
          applicableMaterials: 'Aluminium Profiles & Stainless Sub-Frames',
          surchargeLkr: 0
        },
        {
          id: `wt-${Date.now()}-2`,
          warrantyType: 'Surface Powder Coating',
          timePeriod: '10 Years',
          applicableMaterials: 'Qualicoat Powder Coated Finishes',
          surchargeLkr: 0
        }
      ],
      dlp_frameworks: [
        {
          id: `dlp-${Date.now()}-1`,
          periodMonths: 12,
          terms: 'Standard 12-Month Defect Liability Period with bi-monthly scheduled maintenance inspections.',
          retentionSurchargePct: 5.0
        }
      ]
    }));
  };

  const updateDictValue = (dictName: keyof ProductFormData, key: string, value: number) => {
    setFormData(prev => ({
      ...prev,
      [dictName]: {
        ...(prev[dictName] as Record<string, number>),
        [key]: value
      }
    }));
  };

  const removeDictKey = (dictName: keyof ProductFormData, key: string) => {
    setFormData(prev => {
      const copy = { ...(prev[dictName] as Record<string, number>) };
      delete copy[key];
      return { ...prev, [dictName]: copy };
    });
  };

  const handleAddCustomOption = () => {
    if (!newOptionKey.trim()) return;
    if (newOptionCategory.startsWith('cat-')) {
      // It's a custom category
      handleAddCustomItemToCat(newOptionCategory);
    } else {
      updateDictValue(newOptionCategory as keyof ProductFormData, newOptionKey.trim(), parseFloat(newOptionValue) || 0);
    }
    setNewOptionKey('');
    setNewOptionValue('0');
  };

  // Custom Surcharge & Tier Categories Handlers
  const handleCreateCustomCategory = (categoryName?: string, categoryType?: 'surcharge' | 'tier' | 'multi-factor') => {
    const name = (categoryName || newCatNameInput).trim();
    if (!name) return;
    const newCat: CustomSurchargeCategory = {
      id: `cat-${Date.now()}`,
      categoryName: name,
      categoryType: categoryType || newCatTypeInput,
      items: []
    };
    setFormData(prev => ({
      ...prev,
      custom_option_surcharges: [...(prev.custom_option_surcharges || []), newCat]
    }));
    setNewCatNameInput('');
    setShowNewCatInput(false);
  };

  const handleRemoveCustomCategory = (catId: string) => {
    setFormData(prev => ({
      ...prev,
      custom_option_surcharges: (prev.custom_option_surcharges || []).filter(c => c.id !== catId)
    }));
  };

  const handleAddCustomItemToCat = (catId: string) => {
    const itemInput = newItemInputs[catId] || (newOptionCategory === catId ? { name: newOptionKey, price: newOptionValue } : null);
    if (!itemInput || !itemInput.name.trim()) return;
    
    setFormData(prev => {
      const list = [...(prev.custom_option_surcharges || [])];
      const catIdx = list.findIndex(c => c.id === catId);
      if (catIdx !== -1) {
        const newItem: CustomSurchargeItem = {
          id: `item-${Date.now()}`,
          name: itemInput.name.trim(),
          surchargeLkr: parseFloat(itemInput.price) || 0
        };
        list[catIdx] = {
          ...list[catIdx],
          items: [...list[catIdx].items, newItem]
        };
      }
      return { ...prev, custom_option_surcharges: list };
    });

    setNewItemInputs(prev => ({
      ...prev,
      [catId]: { name: '', price: '0' }
    }));
  };

  const handleRemoveCustomItemFromCat = (catId: string, itemId: string) => {
    setFormData(prev => {
      const list = [...(prev.custom_option_surcharges || [])];
      const catIdx = list.findIndex(c => c.id === catId);
      if (catIdx !== -1) {
        list[catIdx] = {
          ...list[catIdx],
          items: list[catIdx].items.filter(i => i.id !== itemId)
        };
      }
      return { ...prev, custom_option_surcharges: list };
    });
  };

  const handleUpdateCustomItemInCat = (catId: string, itemId: string, field: 'name' | 'surchargeLkr', val: any) => {
    setFormData(prev => {
      const list = [...(prev.custom_option_surcharges || [])];
      const catIdx = list.findIndex(c => c.id === catId);
      if (catIdx !== -1) {
        const items = [...list[catIdx].items];
        const itemIdx = items.findIndex(i => i.id === itemId);
        if (itemIdx !== -1) {
          items[itemIdx] = { ...items[itemIdx], [field]: val };
          list[catIdx] = { ...list[catIdx], items };
        }
      }
      return { ...prev, custom_option_surcharges: list };
    });
  };

  const getCombinedOptions = (presetOptions: string[], dict: Record<string, number> = {}): string[] => {
    const dictKeys = Object.keys(dict || {});
    const merged = Array.from(new Set([...presetOptions, ...dictKeys]));
    if (!searchTerm.trim()) return merged;
    const term = searchTerm.toLowerCase();
    return merged.filter(opt => opt.toLowerCase().includes(term));
  };

  // Quantity Breaks handlers
  const handleAddQuantityBreak = () => {
    setFormData(prev => ({
      ...prev,
      quantity_breaks: [
        ...prev.quantity_breaks,
        {
          id: `qb-${Date.now()}`,
          min_qty: (prev.quantity_breaks[prev.quantity_breaks.length - 1]?.max_qty || 0) + 1,
          max_qty: (prev.quantity_breaks[prev.quantity_breaks.length - 1]?.max_qty || 0) + 50,
          unit_price: Math.round(prev.base_price * 0.9),
          label: 'Custom Tier Break'
        }
      ]
    }));
  };

  const handleUpdateQuantityBreak = (index: number, field: keyof QuantityBreak, val: any) => {
    setFormData(prev => {
      const list = [...prev.quantity_breaks];
      list[index] = { ...list[index], [field]: val };
      return { ...prev, quantity_breaks: list };
    });
  };

  const handleRemoveQuantityBreak = (index: number) => {
    setFormData(prev => ({
      ...prev,
      quantity_breaks: prev.quantity_breaks.filter((_, i) => i !== index)
    }));
  };

  const handleSubmitForm = (e?: React.FormEvent | React.MouseEvent) => {
    if (e && typeof e.preventDefault === 'function') {
      e.preventDefault();
    }
    const code = formData.product_code?.trim();
    const name = formData.product_name?.trim();
    const price = Number(formData.base_price);

    if (!code || !name) {
      alert('Please fill in required fields: Product Code and Product Name.');
      return;
    }
    if (isNaN(price) || price < 0) {
      alert('Base Price must be a valid non-negative number.');
      return;
    }
    onSubmit(formData);
  };

  // Live KPI Calculations
  const costVal = formData.cost_price || 1;
  const markupPct = (((formData.base_price - formData.cost_price) / costVal) * 100).toFixed(1);
  const minMarginPct = (((formData.min_selling_price - formData.cost_price) / costVal) * 100).toFixed(1);

  // Filter helper for options matching search
  const filterOptions = <T extends string>(options: T[]): T[] => {
    if (!searchTerm.trim()) return options;
    const term = searchTerm.toLowerCase();
    return options.filter(opt => opt.toLowerCase().includes(term));
  };

  const tabs = [
    { id: 'general', label: '1. Identity & Category', icon: Package },
    { id: 'units', label: '2. Units & Display', icon: Layers },
    { id: 'pricing', label: '3. Rates & Margins', icon: DollarSign },
    { id: 'specs', label: '4. Specs & Hardware', icon: Settings },
    { id: 'variants', label: '5. Option Surcharges', icon: Sliders },
    { id: 'tiers', label: '6. Tiers & Multi-Factor', icon: Tag },
    ...(mode === 'edit' ? [{ id: 'audit', label: '7. Revision Audit', icon: FileText }] : [])
  ];

  return (
    <div className="fixed inset-0 z-50 bg-white flex flex-col h-screen w-screen overflow-hidden">
      <div className="bg-white w-full h-full flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="bg-slate-900 text-white px-4 py-3 flex items-center justify-between border-b border-slate-800 shrink-0">
          <div>
            <div className="flex items-center space-x-2">
              <span className="bg-orange-500/20 text-orange-400 text-[10px] font-semibold px-2 py-0.5 rounded border border-orange-500/30 uppercase tracking-wider flex items-center">
                <Building2 className="w-3 h-3 mr-1 text-orange-400" /> Head Office Master ERP Catalog
              </span>
              <span className="text-xs text-slate-400 font-mono font-semibold">
                {mode === 'add' ? 'NEW MASTER ITEM' : `EDIT MASTER: ${formData.product_code}`}
              </span>
            </div>
            <h3 className="text-sm font-semibold text-white mt-0.5 uppercase tracking-tight">
              {mode === 'add' ? 'Add Item to Master Price Catalog' : `Edit Master Product Data — ${formData.product_name || formData.product_code}`}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-md bg-slate-800 hover:bg-slate-700 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Global Search Bar & Tab Navigation */}
        <div className="bg-slate-100 border-b border-slate-200 px-3 pt-2.5 pb-1.5 space-y-2 shrink-0">
          {/* Search Bar across all pricing categories & options */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search pricing categories & options (e.g., 'Anodized', 'Wholesale', 'Colombo', '1.5mm', 'Tempered')..."
              className="w-full bg-white border border-slate-300 rounded-md pl-8 pr-7 py-1 text-xs font-semibold text-slate-800 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition shadow-xs"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="absolute right-2 top-1.5 text-slate-400 hover:text-slate-600 p-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Tab Header Bar */}
          <div className="flex items-center space-x-1 overflow-x-auto scrollbar-none pt-0.5">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded-t-md text-xs font-semibold transition whitespace-nowrap border-t border-x ${
                    isActive
                      ? 'bg-white text-orange-600 border-slate-200 shadow-xs -mb-px'
                      : 'bg-slate-100 text-slate-600 hover:text-slate-900 border-transparent hover:bg-slate-200/70'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-orange-500' : 'text-slate-400'}`} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Form Body Container */}
        <form onSubmit={handleSubmitForm} className="p-6 overflow-y-auto flex-1 space-y-6">
          {/* TAB 1: IDENTITY & CATEGORY */}
          {activeTab === 'general' && (
            <div className="space-y-3">
              <div className="bg-orange-50/60 border border-orange-200 p-3 rounded-md flex items-start space-x-2.5 text-xs text-slate-800">
                <Package className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-xs text-slate-900">Master Identification & Metadata</h4>
                  <p className="text-slate-600 text-[11px] mt-0.5">
                    Define primary identification code, commercial title, categorization grouping, and lifecycle status for central database publishing.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Product Code *</label>
                  <input
                    type="text"
                    required
                    value={formData.product_code}
                    onChange={(e) => setFormData(prev => ({ ...prev, product_code: e.target.value.toUpperCase() }))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-md px-3 py-1.5 font-mono font-semibold text-slate-900 text-xs focus:outline-none focus:border-orange-500 focus:bg-white transition"
                    placeholder="e.g. AL004"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">Unique SKUs across all 5 branches</span>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Product Commercial Title *</label>
                  <input
                    type="text"
                    required
                    value={formData.product_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, product_name: e.target.value }))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-md px-3 py-1.5 font-semibold text-slate-900 text-xs focus:outline-none focus:border-orange-500 focus:bg-white transition"
                    placeholder="e.g. Heavy Duty Louver Profile 6m (Anodized White)"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Product Category *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value as CategoryType }))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-md px-3 py-1.5 font-semibold text-slate-900 text-xs focus:outline-none focus:border-orange-500 focus:bg-white transition"
                  >
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Sub-Category</label>
                  <input
                    type="text"
                    list="product-subcategory-options"
                    placeholder={availableSubCategories.length > 0 ? "Select or type sub-category..." : "e.g. Casement Windows, Sliding Doors"}
                    value={formData.sub_category || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, sub_category: e.target.value }))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-md px-3 py-1.5 font-semibold text-slate-900 text-xs focus:outline-none focus:border-orange-500 focus:bg-white transition"
                  />
                  <datalist id="product-subcategory-options">
                    {availableSubCategories.map((sub) => (
                      <option key={sub} value={sub} />
                    ))}
                  </datalist>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Master Product Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as ProductStatus }))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-md px-3 py-1.5 font-semibold text-slate-900 text-xs focus:outline-none focus:border-orange-500 focus:bg-white transition"
                  >
                    <option value="Active">🟢 Active (Visible to all branches)</option>
                    <option value="Inactive">🔴 Inactive / Deactive (Disabled)</option>
                    <option value="Pending Approval">🟡 Pending Approval (Head Office Review)</option>
                    <option value="Archived">⚪ Archived (Discontinued item)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Technical & Usage Description</label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-md p-2 text-xs text-slate-900 focus:outline-none focus:border-orange-500 focus:bg-white transition"
                  placeholder="Detailed specifications, alloy grade (6063-T6), coating thickness (25 microns), usage instructions for architects and estimation engineers..."
                />
              </div>
            </div>
          )}

          {/* TAB 2: UNITS & DISPLAY */}
          {activeTab === 'units' && (
            <div className="space-y-4">
              <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl flex items-start space-x-3 text-xs text-slate-700">
                <Layers className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-sm text-slate-900">Units of Measurement & Display Methods</h4>
                  <p className="text-slate-500 mt-0.5">
                    Configure base inventory measurement units, pricing display format in quotation PDFs, and unit weight used by the automatic Transport Calculation Engine.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-extrabold text-slate-700 mb-1">Primary Unit of Measure *</label>
                  <select
                    value={formData.unit}
                    onChange={(e) => setFormData(prev => ({ ...prev, unit: e.target.value as ProductUnit }))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 font-bold text-slate-900 text-xs focus:outline-none focus:border-blue-500 focus:bg-white transition"
                  >
                    {ALL_UNITS.map((u) => (
                      <option key={u.value} value={u.value}>{u.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-slate-700 mb-1">Quotation Price Display Method</label>
                  <select
                    value={formData.price_display_method}
                    onChange={(e) => setFormData(prev => ({ ...prev, price_display_method: e.target.value as PriceDisplayMethod }))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 font-bold text-slate-900 text-xs focus:outline-none focus:border-blue-500 focus:bg-white transition"
                  >
                    {DISPLAY_METHODS.map((dm) => (
                      <option key={dm.value} value={dm.value}>{dm.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="block text-xs font-extrabold text-amber-900">Unit Weight (Kilograms - kg)</label>
                    <p className="text-[11px] text-amber-700 font-medium">Used directly by Transport Cost Engine to select appropriate lorry size & vehicle capacity.</p>
                  </div>
                  <div className="w-36">
                    <input
                      type="number"
                      step="0.01"
                      value={formData.unit_weight_kg}
                      onChange={(e) => setFormData(prev => ({ ...prev, unit_weight_kg: parseFloat(e.target.value) || 0 }))}
                      className="w-full bg-white border border-amber-300 rounded-xl px-3 py-2 text-right font-black font-mono text-slate-900 text-sm focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: RATES & MARGINS */}
          {activeTab === 'pricing' && (
            <div className="space-y-4">
              <div className="bg-emerald-50/80 border border-emerald-200/80 p-4 rounded-2xl flex items-start space-x-3 text-xs text-emerald-950">
                <DollarSign className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-sm text-emerald-950">Head Office Base Rates & Margin Protections</h4>
                  <p className="text-emerald-800/90 mt-0.5">
                    Define the central company base price, head office procurement cost price, and absolute minimum selling price floor to protect profit margins.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white border-2 border-blue-500/80 p-4 rounded-2xl shadow-sm space-y-1">
                  <span className="text-[10px] font-extrabold text-blue-600 uppercase tracking-wider block">Company Base Price (LKR) *</span>
                  <input
                    type="number"
                    required
                    step="0.01"
                    value={formData.base_price}
                    onChange={(e) => setFormData(prev => ({ ...prev, base_price: parseFloat(e.target.value) || 0 }))}
                    className="w-full bg-blue-50/50 border border-blue-200 rounded-xl px-3 py-2 text-slate-900 font-black text-lg focus:outline-none focus:border-blue-600"
                  />
                  <span className="text-[10px] text-slate-500 font-medium block">Default selling rate across branches</span>
                </div>

                <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm space-y-1">
                  <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block">HO Cost Price (LKR)</span>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.cost_price}
                    onChange={(e) => setFormData(prev => ({ ...prev, cost_price: parseFloat(e.target.value) || 0 }))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-bold text-base focus:outline-none focus:border-blue-500"
                  />
                  <span className="text-[10px] text-slate-400 font-medium block">Internal procurement/import cost</span>
                </div>

                <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm space-y-1">
                  <span className="text-[10px] font-extrabold text-amber-600 uppercase tracking-wider block">Min Selling Price Floor (LKR)</span>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.min_selling_price}
                    onChange={(e) => setFormData(prev => ({ ...prev, min_selling_price: parseFloat(e.target.value) || 0 }))}
                    className="w-full bg-amber-50/50 border border-amber-200 rounded-xl px-3 py-2 text-slate-900 font-bold text-base focus:outline-none focus:border-amber-500"
                  />
                  <span className="text-[10px] text-amber-700 font-medium block">Absolute lowest price allowed without HO sign-off</span>
                </div>
              </div>

              {/* KPI Analytics */}
              <div className="grid grid-cols-2 gap-4 bg-slate-900 text-white p-4 rounded-2xl border border-slate-800">
                <div className="flex items-center space-x-3">
                  <div className="bg-emerald-500/20 p-2.5 rounded-xl border border-emerald-500/30 text-emerald-400">
                    <Percent className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Base Price Markup on Cost</span>
                    <div className="text-lg font-black text-emerald-400 font-mono">+{markupPct}%</div>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="bg-amber-500/20 p-2.5 rounded-xl border border-amber-500/30 text-amber-400">
                    <ShieldAlert className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Minimum Margin Protected Floor</span>
                    <div className="text-lg font-black text-amber-400 font-mono">+{minMarginPct}%</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: SPECS & HARDWARE */}
          {activeTab === 'specs' && (
            <div className="space-y-5">
              <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-700">
                <div className="flex items-start space-x-3">
                  <Settings className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-sm text-slate-900">Engineering & Multi-Material Specifications Studio</h4>
                    <p className="text-slate-500 mt-0.5">
                      Configure multiple main materials, glass specs, hardware, custom components, pointwise technical features, warranties & surcharges.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleLoadDefaultSpecsTemplate}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-3.5 py-2 rounded-xl transition flex items-center space-x-1.5 shrink-0 self-start sm:self-auto shadow-xs text-xs"
                >
                  <Plus className="w-3.5 h-3.5 text-blue-200" />
                  <span>Load Default Engineering Specs</span>
                </button>
              </div>

              {/* Legacy Core Specs Fields Summary */}
              <div className="bg-white border border-slate-200 p-3.5 rounded-2xl grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
                <div>
                  <label className="block text-[10px] font-extrabold uppercase text-slate-500 mb-0.5">Profile Series</label>
                  <input
                    type="text"
                    value={formData.profile_series}
                    onChange={(e) => setFormData(prev => ({ ...prev, profile_series: e.target.value }))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-900 font-semibold focus:outline-none focus:border-blue-500"
                    placeholder="e.g. 100 Series Heavy Duty"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-extrabold uppercase text-slate-500 mb-0.5">Lock Type</label>
                  <input
                    type="text"
                    value={formData.lock_type}
                    onChange={(e) => setFormData(prev => ({ ...prev, lock_type: e.target.value }))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-900 font-semibold focus:outline-none focus:border-blue-500"
                    placeholder="e.g. Multi-Point Mortise"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-extrabold uppercase text-slate-500 mb-0.5">Handle System</label>
                  <input
                    type="text"
                    value={formData.handle_type}
                    onChange={(e) => setFormData(prev => ({ ...prev, handle_type: e.target.value }))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-900 font-semibold focus:outline-none focus:border-blue-500"
                    placeholder="e.g. Architectural Lever"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-extrabold uppercase text-slate-500 mb-0.5">Roller System</label>
                  <input
                    type="text"
                    value={formData.roller_type}
                    onChange={(e) => setFormData(prev => ({ ...prev, roller_type: e.target.value }))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-900 font-semibold focus:outline-none focus:border-blue-500"
                    placeholder="e.g. Nylon Ball Bearing"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-extrabold uppercase text-slate-500 mb-0.5">Warranty Terms</label>
                  <input
                    type="text"
                    value={formData.warranty}
                    onChange={(e) => setFormData(prev => ({ ...prev, warranty: e.target.value }))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-900 font-semibold focus:outline-none focus:border-blue-500"
                    placeholder="e.g. 10 Years Structural"
                  />
                </div>
              </div>

              {/* Specification Categories Sub-Tab Switcher */}
              <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 border-b border-slate-200 text-xs no-scrollbar">
                {[
                  { id: 'main_materials', label: `1. Main Materials (${formData.main_materials?.length || 0})` },
                  { id: 'glass_specs', label: `2. Glass Specs (${formData.glass_specs?.length || 0})` },
                  { id: 'hardware', label: `3. Accessories & Hardware (${formData.hardware_accessories?.length || 0})` },
                  { id: 'custom_materials', label: `4. Custom Materials (${formData.custom_materials?.length || 0})` },
                  { id: 'technical', label: `5. Technical Points (${formData.technical_details?.length || 0})` },
                  { id: 'methods', label: `6. Methods & Standards (${formData.fabrication_methods?.length || 0})` },
                  { id: 'finishes', label: `7. Surface Finishes (${formData.surface_finishes_specs?.length || 0})` },
                  { id: 'scopes', label: `8. Scopes & Exclusions (${formData.installation_scopes?.length || 0})` },
                  { id: 'faqs', label: `9. FAQs (${formData.product_faqs?.length || 0})` },
                  { id: 'warranties', label: `10. Warranty Types (${formData.warranty_terms_specs?.length || 0})` },
                  { id: 'dlp', label: `11. DLP Frameworks (${formData.dlp_frameworks?.length || 0})` }
                ].map(tab => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setSpecsSubTab(tab.id as any)}
                    className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition ${
                      specsSubTab === tab.id
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* SUB-SECTION 1: MAIN MATERIALS */}
              {specsSubTab === 'main_materials' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h5 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                      Main Materials Matrix (Aluminium, Steel, Wood, UPVC, Composite, etc.)
                    </h5>
                    <button
                      type="button"
                      onClick={() => {
                        const newMat: MainMaterialSpec = {
                          id: `mm-${Date.now()}`,
                          materialType: 'Aluminium',
                          profileName: 'New Architectural Profile',
                          sizeDimensions: '100mm x 45mm x 1.5mm',
                          color: 'Anodized Bronze',
                          lengthMeters: 6.0,
                          thicknessMm: 1.5,
                          supplierBrands: ['Alumex', 'Swisstek'],
                          additionalSpecs: 'Custom extrusions',
                          surchargeLkr: 0
                        };
                        setFormData(prev => ({ ...prev, main_materials: [...(prev.main_materials || []), newMat] }));
                      }}
                      className="bg-blue-50 text-blue-700 hover:bg-blue-100 font-bold px-3 py-1.5 rounded-lg text-xs flex items-center space-x-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Material</span>
                    </button>
                  </div>

                  {(formData.main_materials || []).length === 0 ? (
                    <div className="p-6 text-center bg-slate-50 border border-dashed border-slate-300 rounded-2xl text-slate-500 text-xs">
                      No main materials added yet. Click <strong>Add Material</strong> or load default engineering specs.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {formData.main_materials?.map((mat, idx) => (
                        <div key={mat.id} className="bg-white border border-slate-200 p-4 rounded-2xl shadow-xs space-y-3">
                          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                            <div className="flex items-center space-x-2">
                              <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-mono font-bold text-[10px]">
                                {mat.materialType}
                              </span>
                              <span className="font-bold text-xs text-slate-900">{mat.profileName || 'Profile Item'}</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                setFormData(prev => ({
                                  ...prev,
                                  main_materials: prev.main_materials?.filter((_, i) => i !== idx)
                                }));
                              }}
                              className="text-slate-400 hover:text-red-600 p-1 transition"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>

                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                            <div>
                              <label className="block text-[10px] text-slate-500 font-bold">Material Type</label>
                              <select
                                value={mat.materialType}
                                onChange={(e) => {
                                  const val = e.target.value as any;
                                  setFormData(prev => {
                                    const copy = [...(prev.main_materials || [])];
                                    copy[idx].materialType = val;
                                    return { ...prev, main_materials: copy };
                                  });
                                }}
                                className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1 font-semibold"
                              >
                                <option value="Aluminium">Aluminium</option>
                                <option value="Steel">Steel</option>
                                <option value="Wood">Wood</option>
                                <option value="UPVC">UPVC</option>
                                <option value="Composite">Composite</option>
                                <option value="Custom Material">Custom Material</option>
                              </select>
                            </div>

                            <div>
                              <label className="block text-[10px] text-slate-500 font-bold">Profile Name / Series</label>
                              <input
                                type="text"
                                value={mat.profileName}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setFormData(prev => {
                                    const copy = [...(prev.main_materials || [])];
                                    copy[idx].profileName = val;
                                    return { ...prev, main_materials: copy };
                                  });
                                }}
                                className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1"
                              />
                            </div>

                            <div>
                              <label className="block text-[10px] text-slate-500 font-bold">Dimensions / Size</label>
                              <input
                                type="text"
                                value={mat.sizeDimensions}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setFormData(prev => {
                                    const copy = [...(prev.main_materials || [])];
                                    copy[idx].sizeDimensions = val;
                                    return { ...prev, main_materials: copy };
                                  });
                                }}
                                className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1"
                              />
                            </div>

                            <div>
                              <label className="block text-[10px] text-slate-500 font-bold">Color / Coating</label>
                              <input
                                type="text"
                                value={mat.color}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setFormData(prev => {
                                    const copy = [...(prev.main_materials || [])];
                                    copy[idx].color = val;
                                    return { ...prev, main_materials: copy };
                                  });
                                }}
                                className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1"
                              />
                            </div>

                            <div>
                              <label className="block text-[10px] text-slate-500 font-bold">Length (Meters)</label>
                              <input
                                type="number"
                                step="0.1"
                                value={mat.lengthMeters}
                                onChange={(e) => {
                                  const val = parseFloat(e.target.value) || 0;
                                  setFormData(prev => {
                                    const copy = [...(prev.main_materials || [])];
                                    copy[idx].lengthMeters = val;
                                    return { ...prev, main_materials: copy };
                                  });
                                }}
                                className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1 font-mono"
                              />
                            </div>

                            <div>
                              <label className="block text-[10px] text-slate-500 font-bold">Thickness (mm)</label>
                              <input
                                type="number"
                                step="0.1"
                                value={mat.thicknessMm}
                                onChange={(e) => {
                                  const val = parseFloat(e.target.value) || 0;
                                  setFormData(prev => {
                                    const copy = [...(prev.main_materials || [])];
                                    copy[idx].thicknessMm = val;
                                    return { ...prev, main_materials: copy };
                                  });
                                }}
                                className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1 font-mono"
                              />
                            </div>

                            <div>
                              <label className="block text-[10px] text-slate-500 font-bold">Supplier Brands (comma separated)</label>
                              <input
                                type="text"
                                value={mat.supplierBrands?.join(', ') || ''}
                                onChange={(e) => {
                                  const val = e.target.value.split(',').map(s => s.trim()).filter(Boolean);
                                  setFormData(prev => {
                                    const copy = [...(prev.main_materials || [])];
                                    copy[idx].supplierBrands = val;
                                    return { ...prev, main_materials: copy };
                                  });
                                }}
                                className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1"
                                placeholder="Alumex, Swisstek"
                              />
                            </div>

                            <div>
                              <label className="block text-[10px] text-slate-500 font-bold">Option Surcharge (+Rs.)</label>
                              <input
                                type="number"
                                value={mat.surchargeLkr}
                                onChange={(e) => {
                                  const val = parseFloat(e.target.value) || 0;
                                  setFormData(prev => {
                                    const copy = [...(prev.main_materials || [])];
                                    copy[idx].surchargeLkr = val;
                                    return { ...prev, main_materials: copy };
                                  });
                                }}
                                className="w-full bg-amber-50 border border-amber-200 font-bold text-amber-900 rounded px-2 py-1 font-mono"
                                placeholder="0"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* SUB-SECTION 2: GLASS SPECS */}
              {specsSubTab === 'glass_specs' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h5 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                      Glass Specifications Matrix (Toughened, Laminated, Double Glazed)
                    </h5>
                    <button
                      type="button"
                      onClick={() => {
                        const newGl: GlassSpec = {
                          id: `gl-${Date.now()}`,
                          glassType: 'Toughened Clear Glass',
                          thicknessMm: '8mm',
                          brand: 'Saint-Gobain',
                          supplier: 'Glazetech',
                          standards: ['SLS 1324', 'EN 12150'],
                          surchargeLkr: 500
                        };
                        setFormData(prev => ({ ...prev, glass_specs: [...(prev.glass_specs || []), newGl] }));
                      }}
                      className="bg-blue-50 text-blue-700 hover:bg-blue-100 font-bold px-3 py-1.5 rounded-lg text-xs flex items-center space-x-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Glass Spec</span>
                    </button>
                  </div>

                  {(formData.glass_specs || []).length === 0 ? (
                    <div className="p-6 text-center bg-slate-50 border border-dashed border-slate-300 rounded-2xl text-slate-500 text-xs">
                      No glass specifications added yet.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {formData.glass_specs?.map((gl, idx) => (
                        <div key={gl.id} className="bg-white border border-slate-200 p-4 rounded-2xl shadow-xs space-y-3">
                          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                            <span className="font-bold text-xs text-slate-900">{gl.glassType} ({gl.thicknessMm})</span>
                            <button
                              type="button"
                              onClick={() => {
                                setFormData(prev => ({
                                  ...prev,
                                  glass_specs: prev.glass_specs?.filter((_, i) => i !== idx)
                                }));
                              }}
                              className="text-slate-400 hover:text-red-600 p-1 transition"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>

                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                            <div>
                              <label className="block text-[10px] text-slate-500 font-bold">Glass Type</label>
                              <input
                                type="text"
                                value={gl.glassType}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setFormData(prev => {
                                    const copy = [...(prev.glass_specs || [])];
                                    copy[idx].glassType = val;
                                    return { ...prev, glass_specs: copy };
                                  });
                                }}
                                className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1 font-semibold"
                                placeholder="Toughened, Laminated, IGU"
                              />
                            </div>

                            <div>
                              <label className="block text-[10px] text-slate-500 font-bold">Thickness</label>
                              <input
                                type="text"
                                value={gl.thicknessMm}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setFormData(prev => {
                                    const copy = [...(prev.glass_specs || [])];
                                    copy[idx].thicknessMm = val;
                                    return { ...prev, glass_specs: copy };
                                  });
                                }}
                                className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1 font-mono"
                                placeholder="6mm, 6+12A+6"
                              />
                            </div>

                            <div>
                              <label className="block text-[10px] text-slate-500 font-bold">Brand / Manufacturer</label>
                              <input
                                type="text"
                                value={gl.brand}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setFormData(prev => {
                                    const copy = [...(prev.glass_specs || [])];
                                    copy[idx].brand = val;
                                    return { ...prev, glass_specs: copy };
                                  });
                                }}
                                className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1"
                              />
                            </div>

                            <div>
                              <label className="block text-[10px] text-slate-500 font-bold">Supplier</label>
                              <input
                                type="text"
                                value={gl.supplier}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setFormData(prev => {
                                    const copy = [...(prev.glass_specs || [])];
                                    copy[idx].supplier = val;
                                    return { ...prev, glass_specs: copy };
                                  });
                                }}
                                className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1"
                              />
                            </div>

                            <div>
                              <label className="block text-[10px] text-slate-500 font-bold">Standards (comma separated)</label>
                              <input
                                type="text"
                                value={gl.standards?.join(', ') || ''}
                                onChange={(e) => {
                                  const val = e.target.value.split(',').map(s => s.trim()).filter(Boolean);
                                  setFormData(prev => {
                                    const copy = [...(prev.glass_specs || [])];
                                    copy[idx].standards = val;
                                    return { ...prev, glass_specs: copy };
                                  });
                                }}
                                className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1"
                                placeholder="SLS 1324, BS 6206"
                              />
                            </div>

                            <div>
                              <label className="block text-[10px] text-slate-500 font-bold">Glass Surcharge (+Rs.)</label>
                              <input
                                type="number"
                                value={gl.surchargeLkr}
                                onChange={(e) => {
                                  const val = parseFloat(e.target.value) || 0;
                                  setFormData(prev => {
                                    const copy = [...(prev.glass_specs || [])];
                                    copy[idx].surchargeLkr = val;
                                    return { ...prev, glass_specs: copy };
                                  });
                                }}
                                className="w-full bg-amber-50 border border-amber-200 font-bold text-amber-900 rounded px-2 py-1 font-mono"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* SUB-SECTION 3: ACCESSORIES & HARDWARE */}
              {specsSubTab === 'hardware' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h5 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                      Accessories & Hardware Details (Locks, Handles, Rollers, Hinges, Standards)
                    </h5>
                    <button
                      type="button"
                      onClick={() => {
                        const newHw: HardwareAccessorySpec = {
                          id: `hw-${Date.now()}`,
                          name: 'Heavy Duty Lock / Handle System',
                          hardwareType: 'Lock Mechanism',
                          brandSpecs: 'Kin Long SS304',
                          qty: 1,
                          warrantyPeriod: '5 Years',
                          installationStandards: 'Torque fix 4.5 Nm',
                          maintenanceInstructions: 'Apply silicone spray bi-annually',
                          surchargeLkr: 0
                        };
                        setFormData(prev => ({ ...prev, hardware_accessories: [...(prev.hardware_accessories || []), newHw] }));
                      }}
                      className="bg-blue-50 text-blue-700 hover:bg-blue-100 font-bold px-3 py-1.5 rounded-lg text-xs flex items-center space-x-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Hardware Item</span>
                    </button>
                  </div>

                  {(formData.hardware_accessories || []).length === 0 ? (
                    <div className="p-6 text-center bg-slate-50 border border-dashed border-slate-300 rounded-2xl text-slate-500 text-xs">
                      No hardware or accessories specified yet.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {formData.hardware_accessories?.map((hw, idx) => (
                        <div key={hw.id} className="bg-white border border-slate-200 p-4 rounded-2xl shadow-xs space-y-3">
                          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                            <span className="font-bold text-xs text-slate-900">{hw.name} ({hw.hardwareType})</span>
                            <button
                              type="button"
                              onClick={() => {
                                setFormData(prev => ({
                                  ...prev,
                                  hardware_accessories: prev.hardware_accessories?.filter((_, i) => i !== idx)
                                }));
                              }}
                              className="text-slate-400 hover:text-red-600 p-1 transition"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>

                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                            <div>
                              <label className="block text-[10px] text-slate-500 font-bold">Hardware Name</label>
                              <input
                                type="text"
                                value={hw.name}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setFormData(prev => {
                                    const copy = [...(prev.hardware_accessories || [])];
                                    copy[idx].name = val;
                                    return { ...prev, hardware_accessories: copy };
                                  });
                                }}
                                className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1 font-semibold"
                              />
                            </div>

                            <div>
                              <label className="block text-[10px] text-slate-500 font-bold">Category</label>
                              <select
                                value={hw.hardwareType}
                                onChange={(e) => {
                                  const val = e.target.value as any;
                                  setFormData(prev => {
                                    const copy = [...(prev.hardware_accessories || [])];
                                    copy[idx].hardwareType = val;
                                    return { ...prev, hardware_accessories: copy };
                                  });
                                }}
                                className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1 font-semibold"
                              >
                                <option value="Lock Mechanism">Lock Mechanism</option>
                                <option value="Handle System">Handle System</option>
                                <option value="Roller & Sliding">Roller & Sliding</option>
                                <option value="Hinge">Hinge</option>
                                <option value="Gasket & Seal">Gasket & Seal</option>
                                <option value="Fasteners & Anchors">Fasteners & Anchors</option>
                                <option value="Other Hardware">Other Hardware</option>
                              </select>
                            </div>

                            <div>
                              <label className="block text-[10px] text-slate-500 font-bold">Brand & Spec Code</label>
                              <input
                                type="text"
                                value={hw.brandSpecs}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setFormData(prev => {
                                    const copy = [...(prev.hardware_accessories || [])];
                                    copy[idx].brandSpecs = val;
                                    return { ...prev, hardware_accessories: copy };
                                  });
                                }}
                                className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1"
                              />
                            </div>

                            <div>
                              <label className="block text-[10px] text-slate-500 font-bold">Quantity / Unit</label>
                              <input
                                type="number"
                                value={hw.qty}
                                onChange={(e) => {
                                  const val = parseInt(e.target.value) || 1;
                                  setFormData(prev => {
                                    const copy = [...(prev.hardware_accessories || [])];
                                    copy[idx].qty = val;
                                    return { ...prev, hardware_accessories: copy };
                                  });
                                }}
                                className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1 font-mono"
                              />
                            </div>

                            <div>
                              <label className="block text-[10px] text-slate-500 font-bold">Warranty Guarantee</label>
                              <input
                                type="text"
                                value={hw.warrantyPeriod}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setFormData(prev => {
                                    const copy = [...(prev.hardware_accessories || [])];
                                    copy[idx].warrantyPeriod = val;
                                    return { ...prev, hardware_accessories: copy };
                                  });
                                }}
                                className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1"
                                placeholder="5 Years"
                              />
                            </div>

                            <div>
                              <label className="block text-[10px] text-slate-500 font-bold">Installation Standard</label>
                              <input
                                type="text"
                                value={hw.installationStandards}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setFormData(prev => {
                                    const copy = [...(prev.hardware_accessories || [])];
                                    copy[idx].installationStandards = val;
                                    return { ...prev, hardware_accessories: copy };
                                  });
                                }}
                                className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1"
                                placeholder="Torque / Mounting spec"
                              />
                            </div>

                            <div>
                              <label className="block text-[10px] text-slate-500 font-bold">Maintenance Instructions</label>
                              <input
                                type="text"
                                value={hw.maintenanceInstructions}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setFormData(prev => {
                                    const copy = [...(prev.hardware_accessories || [])];
                                    copy[idx].maintenanceInstructions = val;
                                    return { ...prev, hardware_accessories: copy };
                                  });
                                }}
                                className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1"
                                placeholder="Cleaning & Lubrication"
                              />
                            </div>

                            <div>
                              <label className="block text-[10px] text-slate-500 font-bold">Surcharge (+Rs.)</label>
                              <input
                                type="number"
                                value={hw.surchargeLkr}
                                onChange={(e) => {
                                  const val = parseFloat(e.target.value) || 0;
                                  setFormData(prev => {
                                    const copy = [...(prev.hardware_accessories || [])];
                                    copy[idx].surchargeLkr = val;
                                    return { ...prev, hardware_accessories: copy };
                                  });
                                }}
                                className="w-full bg-amber-50 border border-amber-200 font-bold text-amber-900 rounded px-2 py-1 font-mono"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* SUB-SECTION 4: CUSTOM MATERIALS */}
              {specsSubTab === 'custom_materials' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h5 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                      Custom Materials & Auxiliary Components (Sealants, Anchors, Fasteners, Gaskets)
                    </h5>
                    <button
                      type="button"
                      onClick={() => {
                        const newCm: CustomMaterialSpec = {
                          id: `cm-${Date.now()}`,
                          name: 'Custom Sealant / Fastener',
                          materialType: 'Sealant',
                          brand: 'Dow Corning',
                          qty: 1,
                          unit: 'Pcs / Cartridge',
                          details: 'Auxiliary sealant material',
                          surchargeLkr: 350
                        };
                        setFormData(prev => ({ ...prev, custom_materials: [...(prev.custom_materials || []), newCm] }));
                      }}
                      className="bg-blue-50 text-blue-700 hover:bg-blue-100 font-bold px-3 py-1.5 rounded-lg text-xs flex items-center space-x-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Custom Material</span>
                    </button>
                  </div>

                  {(formData.custom_materials || []).length === 0 ? (
                    <div className="p-6 text-center bg-slate-50 border border-dashed border-slate-300 rounded-2xl text-slate-500 text-xs">
                      No custom auxiliary materials configured.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {formData.custom_materials?.map((cm, idx) => (
                        <div key={cm.id} className="bg-white border border-slate-200 p-4 rounded-2xl shadow-xs space-y-3">
                          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                            <span className="font-bold text-xs text-slate-900">{cm.name}</span>
                            <button
                              type="button"
                              onClick={() => {
                                setFormData(prev => ({
                                  ...prev,
                                  custom_materials: prev.custom_materials?.filter((_, i) => i !== idx)
                                }));
                              }}
                              className="text-slate-400 hover:text-red-600 p-1 transition"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>

                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                            <div>
                              <label className="block text-[10px] text-slate-500 font-bold">Material Name</label>
                              <input
                                type="text"
                                value={cm.name}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setFormData(prev => {
                                    const copy = [...(prev.custom_materials || [])];
                                    copy[idx].name = val;
                                    return { ...prev, custom_materials: copy };
                                  });
                                }}
                                className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1 font-semibold"
                              />
                            </div>

                            <div>
                              <label className="block text-[10px] text-slate-500 font-bold">Material Type / Category</label>
                              <input
                                type="text"
                                value={cm.materialType}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setFormData(prev => {
                                    const copy = [...(prev.custom_materials || [])];
                                    copy[idx].materialType = val;
                                    return { ...prev, custom_materials: copy };
                                  });
                                }}
                                className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1"
                              />
                            </div>

                            <div>
                              <label className="block text-[10px] text-slate-500 font-bold">Brand</label>
                              <input
                                type="text"
                                value={cm.brand}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setFormData(prev => {
                                    const copy = [...(prev.custom_materials || [])];
                                    copy[idx].brand = val;
                                    return { ...prev, custom_materials: copy };
                                  });
                                }}
                                className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1"
                              />
                            </div>

                            <div>
                              <label className="block text-[10px] text-slate-500 font-bold">Quantity & Unit</label>
                              <div className="flex space-x-1">
                                <input
                                  type="number"
                                  value={cm.qty}
                                  onChange={(e) => {
                                    const val = parseFloat(e.target.value) || 1;
                                    setFormData(prev => {
                                      const copy = [...(prev.custom_materials || [])];
                                      copy[idx].qty = val;
                                      return { ...prev, custom_materials: copy };
                                    });
                                  }}
                                  className="w-16 bg-slate-50 border border-slate-200 rounded px-2 py-1 font-mono"
                                />
                                <input
                                  type="text"
                                  value={cm.unit}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    setFormData(prev => {
                                      const copy = [...(prev.custom_materials || [])];
                                      copy[idx].unit = val;
                                      return { ...prev, custom_materials: copy };
                                    });
                                  }}
                                  className="flex-1 bg-slate-50 border border-slate-200 rounded px-2 py-1"
                                  placeholder="Tube / Pack"
                                />
                              </div>
                            </div>

                            <div className="sm:col-span-3">
                              <label className="block text-[10px] text-slate-500 font-bold">Application Details</label>
                              <input
                                type="text"
                                value={cm.details}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setFormData(prev => {
                                    const copy = [...(prev.custom_materials || [])];
                                    copy[idx].details = val;
                                    return { ...prev, custom_materials: copy };
                                  });
                                }}
                                className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1"
                              />
                            </div>

                            <div>
                              <label className="block text-[10px] text-slate-500 font-bold">Surcharge (+Rs.)</label>
                              <input
                                type="number"
                                value={cm.surchargeLkr}
                                onChange={(e) => {
                                  const val = parseFloat(e.target.value) || 0;
                                  setFormData(prev => {
                                    const copy = [...(prev.custom_materials || [])];
                                    copy[idx].surchargeLkr = val;
                                    return { ...prev, custom_materials: copy };
                                  });
                                }}
                                className="w-full bg-amber-50 border border-amber-200 font-bold text-amber-900 rounded px-2 py-1 font-mono"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* SUB-SECTION 5: POINTWISE TECHNICAL DETAILS */}
              {specsSubTab === 'technical' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h5 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                      Pointwise Technical Features (Functional, Performance, Safety, Thermal Ratings)
                    </h5>
                    <button
                      type="button"
                      onClick={() => {
                        const newTd: TechnicalDetailItem = {
                          id: `td-${Date.now()}`,
                          category: 'Functional Features',
                          point: 'New technical feature point specification...',
                          surchargeLkr: 0
                        };
                        setFormData(prev => ({ ...prev, technical_details: [...(prev.technical_details || []), newTd] }));
                      }}
                      className="bg-blue-50 text-blue-700 hover:bg-blue-100 font-bold px-3 py-1.5 rounded-lg text-xs flex items-center space-x-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Technical Feature</span>
                    </button>
                  </div>

                  {(formData.technical_details || []).length === 0 ? (
                    <div className="p-6 text-center bg-slate-50 border border-dashed border-slate-300 rounded-2xl text-slate-500 text-xs">
                      No pointwise technical details added yet.
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {formData.technical_details?.map((td, idx) => (
                        <div key={td.id} className="bg-white border border-slate-200 p-3 rounded-2xl shadow-xs flex items-center space-x-2 text-xs">
                          <select
                            value={td.category}
                            onChange={(e) => {
                              const val = e.target.value as any;
                              setFormData(prev => {
                                const copy = [...(prev.technical_details || [])];
                                copy[idx].category = val;
                                return { ...prev, technical_details: copy };
                              });
                            }}
                            className="bg-slate-100 font-bold text-slate-800 border border-slate-200 rounded-lg px-2 py-1 text-xs shrink-0"
                          >
                            <option value="Functional Features">Functional Features</option>
                            <option value="Performance Features">Performance Features</option>
                            <option value="Safety Features">Safety Features</option>
                            <option value="Structural Capacity">Structural Capacity</option>
                            <option value="Thermal & Acoustic Rating">Thermal & Acoustic Rating</option>
                          </select>

                          <input
                            type="text"
                            value={td.point}
                            onChange={(e) => {
                              const val = e.target.value;
                              setFormData(prev => {
                                const copy = [...(prev.technical_details || [])];
                                copy[idx].point = val;
                                return { ...prev, technical_details: copy };
                              });
                            }}
                            className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1 text-slate-900"
                            placeholder="Enter bullet point description..."
                          />

                          <div className="flex items-center space-x-1 shrink-0">
                            <span className="text-[10px] text-slate-400 font-bold">LKR:</span>
                            <input
                              type="number"
                              value={td.surchargeLkr}
                              onChange={(e) => {
                                const val = parseFloat(e.target.value) || 0;
                                setFormData(prev => {
                                  const copy = [...(prev.technical_details || [])];
                                  copy[idx].surchargeLkr = val;
                                  return { ...prev, technical_details: copy };
                                });
                              }}
                              className="w-20 bg-amber-50 border border-amber-200 font-bold text-amber-900 rounded-lg px-2 py-1 font-mono text-xs"
                              placeholder="+0"
                            />
                          </div>

                          <button
                            type="button"
                            onClick={() => {
                              setFormData(prev => ({
                                ...prev,
                                technical_details: prev.technical_details?.filter((_, i) => i !== idx)
                              }));
                            }}
                            className="text-slate-400 hover:text-red-600 p-1"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* SUB-SECTION 6: METHODS & STANDARDS */}
              {specsSubTab === 'methods' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h5 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                      Fabrication, Supply & Installation Methods & Standards
                    </h5>
                    <button
                      type="button"
                      onClick={() => {
                        const newFm: FabricationMethodSpec = {
                          id: `fm-${Date.now()}`,
                          methodName: 'Precision CNC Assembly',
                          details: 'Mitre cutting and crimped corner cleating',
                          standards: 'ISO 9001',
                          surchargeLkr: 0
                        };
                        setFormData(prev => ({ ...prev, fabrication_methods: [...(prev.fabrication_methods || []), newFm] }));
                      }}
                      className="bg-blue-50 text-blue-700 hover:bg-blue-100 font-bold px-3 py-1.5 rounded-lg text-xs flex items-center space-x-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Method</span>
                    </button>
                  </div>

                  {(formData.fabrication_methods || []).length === 0 ? (
                    <div className="p-6 text-center bg-slate-50 border border-dashed border-slate-300 rounded-2xl text-slate-500 text-xs">
                      No fabrication or supply methods configured.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {formData.fabrication_methods?.map((fm, idx) => (
                        <div key={fm.id} className="bg-white border border-slate-200 p-4 rounded-2xl shadow-xs space-y-2 text-xs">
                          <div className="flex items-center justify-between">
                            <input
                              type="text"
                              value={fm.methodName}
                              onChange={(e) => {
                                const val = e.target.value;
                                setFormData(prev => {
                                  const copy = [...(prev.fabrication_methods || [])];
                                  copy[idx].methodName = val;
                                  return { ...prev, fabrication_methods: copy };
                                });
                              }}
                              className="font-bold text-slate-900 bg-slate-50 border border-slate-200 rounded px-2.5 py-1 w-2/3"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                setFormData(prev => ({
                                  ...prev,
                                  fabrication_methods: prev.fabrication_methods?.filter((_, i) => i !== idx)
                                }));
                              }}
                              className="text-slate-400 hover:text-red-600 p-1"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>

                          <textarea
                            value={fm.details}
                            onChange={(e) => {
                              const val = e.target.value;
                              setFormData(prev => {
                                const copy = [...(prev.fabrication_methods || [])];
                                copy[idx].details = val;
                                return { ...prev, fabrication_methods: copy };
                              });
                            }}
                            className="w-full bg-slate-50 border border-slate-200 rounded px-2.5 py-1.5 text-xs"
                            placeholder="Detailed method statement..."
                          />

                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="block text-[10px] text-slate-500 font-bold">Standard / Code</label>
                              <input
                                type="text"
                                value={fm.standards}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setFormData(prev => {
                                    const copy = [...(prev.fabrication_methods || [])];
                                    copy[idx].standards = val;
                                    return { ...prev, fabrication_methods: copy };
                                  });
                                }}
                                className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] text-slate-500 font-bold">Method Surcharge (+Rs.)</label>
                              <input
                                type="number"
                                value={fm.surchargeLkr}
                                onChange={(e) => {
                                  const val = parseFloat(e.target.value) || 0;
                                  setFormData(prev => {
                                    const copy = [...(prev.fabrication_methods || [])];
                                    copy[idx].surchargeLkr = val;
                                    return { ...prev, fabrication_methods: copy };
                                  });
                                }}
                                className="w-full bg-amber-50 border border-amber-200 font-bold text-amber-900 rounded px-2 py-1 font-mono"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* SUB-SECTION 7: SURFACE FINISHES */}
              {specsSubTab === 'finishes' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h5 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                      Surface Finishes, Durability & Maintenance Techniques
                    </h5>
                    <button
                      type="button"
                      onClick={() => {
                        const newSf: SurfaceFinishSpec = {
                          id: `sf-${Date.now()}`,
                          finishType: 'Qualicoat Powder Coating',
                          durabilityDetails: '10 Years UV & Salt Resistance',
                          maintenanceTechniques: 'Soft microfiber detergent wash bi-annually',
                          surchargeLkr: 0
                        };
                        setFormData(prev => ({ ...prev, surface_finishes_specs: [...(prev.surface_finishes_specs || []), newSf] }));
                      }}
                      className="bg-blue-50 text-blue-700 hover:bg-blue-100 font-bold px-3 py-1.5 rounded-lg text-xs flex items-center space-x-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Finish Spec</span>
                    </button>
                  </div>

                  {(formData.surface_finishes_specs || []).length === 0 ? (
                    <div className="p-6 text-center bg-slate-50 border border-dashed border-slate-300 rounded-2xl text-slate-500 text-xs">
                      No surface finishes specified yet.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {formData.surface_finishes_specs?.map((sf, idx) => (
                        <div key={sf.id} className="bg-white border border-slate-200 p-4 rounded-2xl shadow-xs space-y-2 text-xs">
                          <div className="flex items-center justify-between">
                            <input
                              type="text"
                              value={sf.finishType}
                              onChange={(e) => {
                                const val = e.target.value;
                                setFormData(prev => {
                                  const copy = [...(prev.surface_finishes_specs || [])];
                                  copy[idx].finishType = val;
                                  return { ...prev, surface_finishes_specs: copy };
                                });
                              }}
                              className="font-bold text-slate-900 bg-slate-50 border border-slate-200 rounded px-2.5 py-1 w-2/3"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                setFormData(prev => ({
                                  ...prev,
                                  surface_finishes_specs: prev.surface_finishes_specs?.filter((_, i) => i !== idx)
                                }));
                              }}
                              className="text-slate-400 hover:text-red-600 p-1"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            <div>
                              <label className="block text-[10px] text-slate-500 font-bold">Durability Details</label>
                              <input
                                type="text"
                                value={sf.durabilityDetails}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setFormData(prev => {
                                    const copy = [...(prev.surface_finishes_specs || [])];
                                    copy[idx].durabilityDetails = val;
                                    return { ...prev, surface_finishes_specs: copy };
                                  });
                                }}
                                className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] text-slate-500 font-bold">Maintenance Techniques</label>
                              <input
                                type="text"
                                value={sf.maintenanceTechniques}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setFormData(prev => {
                                    const copy = [...(prev.surface_finishes_specs || [])];
                                    copy[idx].maintenanceTechniques = val;
                                    return { ...prev, surface_finishes_specs: copy };
                                  });
                                }}
                                className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* SUB-SECTION 8: SCOPES & EXCLUSIONS */}
              {specsSubTab === 'scopes' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h5 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                      Installation Scopes & Work Exclusions
                    </h5>
                    <button
                      type="button"
                      onClick={() => {
                        const newIs: InstallationScopeItem = {
                          id: `is-${Date.now()}`,
                          scopeType: 'Installation Scope',
                          description: 'Standard installation & perimeter silicone sealing included.'
                        };
                        setFormData(prev => ({ ...prev, installation_scopes: [...(prev.installation_scopes || []), newIs] }));
                      }}
                      className="bg-blue-50 text-blue-700 hover:bg-blue-100 font-bold px-3 py-1.5 rounded-lg text-xs flex items-center space-x-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Scope Item</span>
                    </button>
                  </div>

                  {(formData.installation_scopes || []).length === 0 ? (
                    <div className="p-6 text-center bg-slate-50 border border-dashed border-slate-300 rounded-2xl text-slate-500 text-xs">
                      No scope terms defined.
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {formData.installation_scopes?.map((is, idx) => (
                        <div key={is.id} className="bg-white border border-slate-200 p-3 rounded-2xl shadow-xs flex items-center space-x-2 text-xs">
                          <select
                            value={is.scopeType}
                            onChange={(e) => {
                              const val = e.target.value as any;
                              setFormData(prev => {
                                const copy = [...(prev.installation_scopes || [])];
                                copy[idx].scopeType = val;
                                return { ...prev, installation_scopes: copy };
                              });
                            }}
                            className={`font-bold border rounded-lg px-2 py-1 text-xs shrink-0 ${
                              is.scopeType === 'Installation Scope'
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                : 'bg-red-50 text-red-800 border-red-200'
                            }`}
                          >
                            <option value="Installation Scope">Installation Scope</option>
                            <option value="Exclusion / Out of Scope">Exclusion / Out of Scope</option>
                          </select>

                          <input
                            type="text"
                            value={is.description}
                            onChange={(e) => {
                              const val = e.target.value;
                              setFormData(prev => {
                                const copy = [...(prev.installation_scopes || [])];
                                copy[idx].description = val;
                                return { ...prev, installation_scopes: copy };
                              });
                            }}
                            className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1 text-slate-900"
                            placeholder="Description..."
                          />

                          <button
                            type="button"
                            onClick={() => {
                              setFormData(prev => ({
                                ...prev,
                                installation_scopes: prev.installation_scopes?.filter((_, i) => i !== idx)
                              }));
                            }}
                            className="text-slate-400 hover:text-red-600 p-1"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* SUB-SECTION 9: FAQS */}
              {specsSubTab === 'faqs' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h5 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                      Product Frequently Asked Questions (FAQs)
                    </h5>
                    <button
                      type="button"
                      onClick={() => {
                        const newFaq: ProductFAQ = {
                          id: `faq-${Date.now()}`,
                          question: 'Frequently Asked Question?',
                          answer: 'Answer detail...'
                        };
                        setFormData(prev => ({ ...prev, product_faqs: [...(prev.product_faqs || []), newFaq] }));
                      }}
                      className="bg-blue-50 text-blue-700 hover:bg-blue-100 font-bold px-3 py-1.5 rounded-lg text-xs flex items-center space-x-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add FAQ</span>
                    </button>
                  </div>

                  {(formData.product_faqs || []).length === 0 ? (
                    <div className="p-6 text-center bg-slate-50 border border-dashed border-slate-300 rounded-2xl text-slate-500 text-xs">
                      No FAQs configured.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {formData.product_faqs?.map((faq, idx) => (
                        <div key={faq.id} className="bg-white border border-slate-200 p-3.5 rounded-2xl shadow-xs space-y-2 text-xs">
                          <div className="flex items-center justify-between">
                            <input
                              type="text"
                              value={faq.question}
                              onChange={(e) => {
                                const val = e.target.value;
                                setFormData(prev => {
                                  const copy = [...(prev.product_faqs || [])];
                                  copy[idx].question = val;
                                  return { ...prev, product_faqs: copy };
                                });
                              }}
                              className="font-bold text-slate-900 bg-slate-50 border border-slate-200 rounded px-2.5 py-1 w-full mr-2"
                              placeholder="Question..."
                            />
                            <button
                              type="button"
                              onClick={() => {
                                setFormData(prev => ({
                                  ...prev,
                                  product_faqs: prev.product_faqs?.filter((_, i) => i !== idx)
                                }));
                              }}
                              className="text-slate-400 hover:text-red-600 p-1"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>

                          <textarea
                            value={faq.answer}
                            onChange={(e) => {
                              const val = e.target.value;
                              setFormData(prev => {
                                const copy = [...(prev.product_faqs || [])];
                                copy[idx].answer = val;
                                return { ...prev, product_faqs: copy };
                              });
                            }}
                            className="w-full bg-slate-50 border border-slate-200 rounded px-2.5 py-1.5 text-xs"
                            placeholder="Answer text..."
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* SUB-SECTION 10: WARRANTIES */}
              {specsSubTab === 'warranties' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h5 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                      Multiple Warranty Types & Time Periods
                    </h5>
                    <button
                      type="button"
                      onClick={() => {
                        const newWt: WarrantyTermSpec = {
                          id: `wt-${Date.now()}`,
                          warrantyType: 'Structural Frame Guarantee',
                          timePeriod: '10 Years',
                          applicableMaterials: 'Aluminium profiles',
                          surchargeLkr: 0
                        };
                        setFormData(prev => ({ ...prev, warranty_terms_specs: [...(prev.warranty_terms_specs || []), newWt] }));
                      }}
                      className="bg-blue-50 text-blue-700 hover:bg-blue-100 font-bold px-3 py-1.5 rounded-lg text-xs flex items-center space-x-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Warranty Term</span>
                    </button>
                  </div>

                  {(formData.warranty_terms_specs || []).length === 0 ? (
                    <div className="p-6 text-center bg-slate-50 border border-dashed border-slate-300 rounded-2xl text-slate-500 text-xs">
                      No warranty terms configured.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {formData.warranty_terms_specs?.map((wt, idx) => (
                        <div key={wt.id} className="bg-white border border-slate-200 p-4 rounded-2xl shadow-xs space-y-3 text-xs">
                          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                            <span className="font-bold text-xs text-slate-900">{wt.warrantyType} ({wt.timePeriod})</span>
                            <button
                              type="button"
                              onClick={() => {
                                setFormData(prev => ({
                                  ...prev,
                                  warranty_terms_specs: prev.warranty_terms_specs?.filter((_, i) => i !== idx)
                                }));
                              }}
                              className="text-slate-400 hover:text-red-600 p-1 transition"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>

                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                            <div>
                              <label className="block text-[10px] text-slate-500 font-bold">Warranty Category</label>
                              <select
                                value={wt.warrantyType}
                                onChange={(e) => {
                                  const val = e.target.value as any;
                                  setFormData(prev => {
                                    const copy = [...(prev.warranty_terms_specs || [])];
                                    copy[idx].warrantyType = val;
                                    return { ...prev, warranty_terms_specs: copy };
                                  });
                                }}
                                className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1 font-semibold"
                              >
                                <option value="Structural Frame Guarantee">Structural Frame Guarantee</option>
                                <option value="Surface Powder Coating">Surface Powder Coating</option>
                                <option value="Glass Clarity & Seal">Glass Clarity & Seal</option>
                                <option value="Hardware & Accessories">Hardware & Accessories</option>
                                <option value="Water Leakage Guarantee">Water Leakage Guarantee</option>
                                <option value="Custom Warranty">Custom Warranty</option>
                              </select>
                            </div>

                            <div>
                              <label className="block text-[10px] text-slate-500 font-bold">Time Period</label>
                              <input
                                type="text"
                                value={wt.timePeriod}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setFormData(prev => {
                                    const copy = [...(prev.warranty_terms_specs || [])];
                                    copy[idx].timePeriod = val;
                                    return { ...prev, warranty_terms_specs: copy };
                                  });
                                }}
                                className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1 font-semibold"
                                placeholder="e.g. 10 Years"
                              />
                            </div>

                            <div>
                              <label className="block text-[10px] text-slate-500 font-bold">Applicable Materials</label>
                              <input
                                type="text"
                                value={wt.applicableMaterials}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setFormData(prev => {
                                    const copy = [...(prev.warranty_terms_specs || [])];
                                    copy[idx].applicableMaterials = val;
                                    return { ...prev, warranty_terms_specs: copy };
                                  });
                                }}
                                className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1"
                              />
                            </div>

                            <div>
                              <label className="block text-[10px] text-slate-500 font-bold">Surcharge (+Rs.)</label>
                              <input
                                type="number"
                                value={wt.surchargeLkr}
                                onChange={(e) => {
                                  const val = parseFloat(e.target.value) || 0;
                                  setFormData(prev => {
                                    const copy = [...(prev.warranty_terms_specs || [])];
                                    copy[idx].surchargeLkr = val;
                                    return { ...prev, warranty_terms_specs: copy };
                                  });
                                }}
                                className="w-full bg-amber-50 border border-amber-200 font-bold text-amber-900 rounded px-2 py-1 font-mono"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* SUB-SECTION 11: DLP FRAMEWORKS */}
              {specsSubTab === 'dlp' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h5 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                      Defect Liability Period (DLP) Frameworks & Retention Rules
                    </h5>
                    <button
                      type="button"
                      onClick={() => {
                        const newDlp: DefectLiabilityFramework = {
                          id: `dlp-${Date.now()}`,
                          periodMonths: 12,
                          terms: 'Standard 12-Month Defect Liability Period',
                          retentionSurchargePct: 5.0
                        };
                        setFormData(prev => ({ ...prev, dlp_frameworks: [...(prev.dlp_frameworks || []), newDlp] }));
                      }}
                      className="bg-blue-50 text-blue-700 hover:bg-blue-100 font-bold px-3 py-1.5 rounded-lg text-xs flex items-center space-x-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add DLP Framework</span>
                    </button>
                  </div>

                  {(formData.dlp_frameworks || []).length === 0 ? (
                    <div className="p-6 text-center bg-slate-50 border border-dashed border-slate-300 rounded-2xl text-slate-500 text-xs">
                      No DLP frameworks defined.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {formData.dlp_frameworks?.map((dlp, idx) => (
                        <div key={dlp.id} className="bg-white border border-slate-200 p-4 rounded-2xl shadow-xs space-y-3 text-xs">
                          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                            <span className="font-bold text-xs text-slate-900">{dlp.periodMonths} Months DLP Framework</span>
                            <button
                              type="button"
                              onClick={() => {
                                setFormData(prev => ({
                                  ...prev,
                                  dlp_frameworks: prev.dlp_frameworks?.filter((_, i) => i !== idx)
                                }));
                              }}
                              className="text-slate-400 hover:text-red-600 p-1 transition"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>

                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                            <div>
                              <label className="block text-[10px] text-slate-500 font-bold">DLP Duration (Months)</label>
                              <input
                                type="number"
                                value={dlp.periodMonths}
                                onChange={(e) => {
                                  const val = parseInt(e.target.value) || 12;
                                  setFormData(prev => {
                                    const copy = [...(prev.dlp_frameworks || [])];
                                    copy[idx].periodMonths = val;
                                    return { ...prev, dlp_frameworks: copy };
                                  });
                                }}
                                className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1 font-mono font-bold"
                              />
                            </div>

                            <div>
                              <label className="block text-[10px] text-slate-500 font-bold">Retention / Warranty Surcharge (%)</label>
                              <input
                                type="number"
                                step="0.5"
                                value={dlp.retentionSurchargePct}
                                onChange={(e) => {
                                  const val = parseFloat(e.target.value) || 0;
                                  setFormData(prev => {
                                    const copy = [...(prev.dlp_frameworks || [])];
                                    copy[idx].retentionSurchargePct = val;
                                    return { ...prev, dlp_frameworks: copy };
                                  });
                                }}
                                className="w-full bg-amber-50 border border-amber-200 font-bold text-amber-900 rounded px-2 py-1 font-mono"
                              />
                            </div>

                            <div className="sm:col-span-3">
                              <label className="block text-[10px] text-slate-500 font-bold">Terms & Conditions Statement</label>
                              <input
                                type="text"
                                value={dlp.terms}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setFormData(prev => {
                                    const copy = [...(prev.dlp_frameworks || [])];
                                    copy[idx].terms = val;
                                    return { ...prev, dlp_frameworks: copy };
                                  });
                                }}
                                className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* TAB 5: MULTI-FACTOR OPTION SURCHARGES */}
          {activeTab === 'variants' && (
            <div className="space-y-5">
              <div className="bg-purple-50/80 border border-purple-200/80 p-4 rounded-2xl flex items-start justify-between text-xs text-purple-950">
                <div className="flex items-start space-x-3">
                  <Sliders className="w-5 h-5 text-purple-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-sm text-purple-950">Searchable Multi-Factor Option Surcharges</h4>
                    <p className="text-purple-800/90 mt-0.5">
                      Configure optional extra cost surcharges (LKR) per thickness, surface finish, anodizing colour, glass specification, installation option, and custom user-created surcharge categories.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setShowNewCatInput(true)}
                  className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition flex items-center space-x-1 shrink-0 shadow-2xs"
                >
                  <Plus className="w-4 h-4" />
                  <span>Category</span>
                </button>
              </div>

              {/* Quick Add Custom Surcharge Tool */}
              <div className="bg-slate-900 text-white p-3.5 rounded-2xl border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-purple-300 flex items-center">
                    <Plus className="w-3.5 h-3.5 mr-1 text-purple-400" /> Add Custom Surcharge Option
                  </span>
                  <span className="text-[10px] text-slate-400">Instantly appends new custom key & LKR surcharge rate</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 text-xs">
                  <select
                    value={newOptionCategory}
                    onChange={(e) => setNewOptionCategory(e.target.value)}
                    className="bg-slate-800 border border-slate-700 text-white rounded-xl px-3 py-1.5 font-bold"
                  >
                    <optgroup label="Standard Surcharge Dictionaries">
                      <option value="thickness_prices">Thickness Surcharges</option>
                      <option value="finish_prices">Finish Surcharges</option>
                      <option value="colour_prices">Colour Surcharges</option>
                      <option value="glass_prices">Glass Surcharges</option>
                      <option value="installation_prices">Installation Surcharges</option>
                      <option value="floor_level_prices">Floor Level Surcharges</option>
                      <option value="facility_type_prices">Facility Type Surcharges</option>
                      <option value="grade_prices">Grade Surcharges</option>
                      <option value="brand_prices">Brand Surcharges</option>
                    </optgroup>
                    {formData.custom_option_surcharges && formData.custom_option_surcharges.length > 0 && (
                      <optgroup label="Custom Surcharge Categories">
                        {formData.custom_option_surcharges.map(c => (
                          <option key={c.id} value={c.id}>{c.categoryName}</option>
                        ))}
                      </optgroup>
                    )}
                  </select>

                  <input
                    type="text"
                    value={newOptionKey}
                    onChange={(e) => setNewOptionKey(e.target.value)}
                    placeholder="Custom Option Name (e.g., 2.5mm / 25 Micron)"
                    className="bg-slate-800 border border-slate-700 text-white rounded-xl px-3 py-1.5"
                  />

                  <input
                    type="number"
                    value={newOptionValue}
                    onChange={(e) => setNewOptionValue(e.target.value)}
                    placeholder="LKR Surcharge (+Rs.)"
                    className="bg-slate-800 border border-slate-700 text-white rounded-xl px-3 py-1.5 font-mono"
                  />

                  <button
                    type="button"
                    onClick={handleAddCustomOption}
                    className="bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl px-3 py-1.5 transition flex items-center justify-center space-x-1"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add</span>
                  </button>
                </div>
              </div>

              {/* Dynamic Custom Surcharge & Tier Categories (Unlimited User-Created Types) */}
              <div className="border-2 border-purple-200/90 rounded-2xl p-4 space-y-4 bg-gradient-to-br from-purple-50/40 via-white to-slate-50 shadow-2xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-purple-100 pb-3">
                  <div>
                    <h5 className="text-xs font-extrabold text-purple-950 flex items-center space-x-1.5">
                      <Plus className="w-4 h-4 text-purple-600" />
                      <span>Custom Dynamic Surcharge Categories (Unlimited Types)</span>
                    </h5>
                    <p className="text-[11px] text-purple-800/80 font-medium">Create your own custom surcharge types (e.g., Anodizing Microns, Hardware Locks, Gasket Seals, Freight)</p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowNewCatInput(true)}
                    className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition flex items-center space-x-1 shadow-2xs shrink-0"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Create Category</span>
                  </button>
                </div>

                {/* Inline Category Creator Form */}
                {showNewCatInput && (
                  <div className="bg-white border-2 border-purple-300 p-3.5 rounded-xl space-y-2 shadow-sm">
                    <div className="text-xs font-bold text-purple-950 flex items-center justify-between">
                      <span>Define New Custom Surcharge Category</span>
                      <button type="button" onClick={() => setShowNewCatInput(false)} className="text-slate-400 hover:text-slate-600">✕</button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                      <input
                        type="text"
                        placeholder="Category Name (e.g. Lock Hardware Grade)"
                        value={newCatNameInput}
                        onChange={(e) => setNewCatNameInput(e.target.value)}
                        className="bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 font-bold"
                      />
                      <select
                        value={newCatTypeInput}
                        onChange={(e) => setNewCatTypeInput(e.target.value as any)}
                        className="bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 font-medium"
                      >
                        <option value="surcharge">Surcharge Category (+Rs.)</option>
                        <option value="tier">Customer / Pricing Tier</option>
                        <option value="multi-factor">Multi-Factor Option</option>
                      </select>
                      <button
                        type="button"
                        onClick={() => handleCreateCustomCategory()}
                        className="bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg px-3 py-1.5 transition"
                      >
                        Save Category
                      </button>
                    </div>
                  </div>
                )}

                {/* List of Custom Categories */}
                {(!formData.custom_option_surcharges || formData.custom_option_surcharges.length === 0) ? (
                  <div className="text-center py-6 border border-dashed border-purple-200 rounded-xl bg-purple-50/20 text-xs text-purple-700">
                    No custom surcharge categories created yet. Click <span className="font-bold text-purple-900">"Create Category"</span> to add your own surcharge types.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {formData.custom_option_surcharges.map((cat) => (
                      <div key={cat.id} className="bg-white border border-purple-200 rounded-xl p-3.5 space-y-3 shadow-2xs">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <span className="text-xs font-extrabold text-slate-900">{cat.categoryName}</span>
                            <span className="text-[10px] font-bold bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full uppercase">
                              {cat.categoryType || 'surcharge'}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveCustomCategory(cat.id)}
                            className="text-slate-400 hover:text-rose-600 text-xs font-bold transition flex items-center space-x-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Delete</span>
                          </button>
                        </div>

                        {/* Items grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 text-xs">
                          {cat.items.map((item) => (
                            <div key={item.id} className="bg-purple-50/50 border border-purple-150 p-2 rounded-lg flex items-center justify-between space-x-2">
                              <input
                                type="text"
                                value={item.name}
                                onChange={(e) => handleUpdateCustomItemInCat(cat.id, item.id, 'name', e.target.value)}
                                className="bg-transparent font-bold text-slate-800 w-full focus:outline-none focus:bg-white focus:px-1 rounded"
                              />
                              <div className="flex items-center space-x-1 shrink-0">
                                <span className="text-[10px] text-purple-700 font-bold">+Rs.</span>
                                <input
                                  type="number"
                                  value={item.surchargeLkr}
                                  onChange={(e) => handleUpdateCustomItemInCat(cat.id, item.id, 'surchargeLkr', parseFloat(e.target.value) || 0)}
                                  className="w-20 bg-white border border-purple-200 rounded px-1.5 py-0.5 text-right font-mono font-bold text-xs"
                                />
                                <button
                                  type="button"
                                  onClick={() => handleRemoveCustomItemFromCat(cat.id, item.id)}
                                  className="text-slate-400 hover:text-rose-600 font-bold px-1"
                                >
                                  ✕
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Inline Form to add item to this category */}
                        <div className="flex items-center space-x-2 pt-2 border-t border-slate-100 text-xs">
                          <input
                            type="text"
                            placeholder={`+ Add option to ${cat.categoryName}`}
                            value={newItemInputs[cat.id]?.name || ''}
                            onChange={(e) => setNewItemInputs(prev => ({ ...prev, [cat.id]: { name: e.target.value, price: prev[cat.id]?.price || '0' } }))}
                            className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs focus:bg-white focus:outline-none"
                          />
                          <input
                            type="number"
                            placeholder="+Rs."
                            value={newItemInputs[cat.id]?.price || '0'}
                            onChange={(e) => setNewItemInputs(prev => ({ ...prev, [cat.id]: { name: prev[cat.id]?.name || '', price: e.target.value } }))}
                            className="w-24 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-xs font-mono font-bold focus:bg-white focus:outline-none"
                          />
                          <button
                            type="button"
                            onClick={() => handleAddCustomItemToCat(cat.id)}
                            className="bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs px-3 py-1 rounded-lg transition shrink-0"
                          >
                            + Add Item
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Thickness Surcharges */}
              <div className="border border-slate-200 rounded-2xl p-4 space-y-3 bg-white">
                <h5 className="text-xs font-extrabold text-slate-900 flex items-center justify-between">
                  <span>Material Thickness Surcharges (LKR)</span>
                  <span className="text-[10px] text-slate-400 font-normal">Added on top of Base Rate</span>
                </h5>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {getCombinedOptions(THICKNESS_OPTIONS, formData.thickness_prices).map((th) => {
                    const val = formData.thickness_prices[th] ?? '';
                    const isCustomKey = !THICKNESS_OPTIONS.includes(th as any);
                    return (
                      <div key={th} className={`p-2.5 rounded-xl flex items-center justify-between space-x-2 border ${isCustomKey ? 'bg-purple-50/50 border-purple-200' : 'bg-slate-50 border-slate-200'}`}>
                        <div className="flex items-center space-x-1 shrink-0 truncate">
                          <span className="text-xs font-bold text-slate-700">{th}</span>
                          {isCustomKey && <span className="text-[9px] bg-purple-200 text-purple-900 px-1 rounded font-semibold">Custom</span>}
                        </div>
                        <div className="flex items-center space-x-1">
                          <input
                            type="number"
                            placeholder="+0"
                            value={val}
                            onChange={(e) => updateDictValue('thickness_prices', th, parseFloat(e.target.value) || 0)}
                            className="w-20 bg-white border border-slate-200 rounded-lg px-2 py-1 text-right font-mono font-bold text-xs focus:outline-none focus:border-purple-500"
                          />
                          {isCustomKey && (
                            <button
                              type="button"
                              onClick={() => removeDictKey('thickness_prices', th)}
                              className="text-slate-400 hover:text-rose-600 font-bold px-0.5"
                            >
                              ✕
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
                {/* Inline Add Thickness */}
                <div className="pt-2.5 border-t border-slate-100 flex items-center space-x-2 text-xs">
                  <input
                    type="text"
                    placeholder="+ Add Custom Thickness (e.g., 2.8mm, 4.0mm)"
                    value={inlineQuickAddInputs.thickness_prices?.name || ''}
                    onChange={(e) => setInlineQuickAddInputs(prev => ({ ...prev, thickness_prices: { name: e.target.value, price: prev.thickness_prices?.price || '' } }))}
                    className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs focus:bg-white focus:outline-none focus:border-purple-500 font-medium"
                  />
                  <input
                    type="number"
                    placeholder="+Rs."
                    value={inlineQuickAddInputs.thickness_prices?.price || ''}
                    onChange={(e) => setInlineQuickAddInputs(prev => ({ ...prev, thickness_prices: { name: prev.thickness_prices?.name || '', price: e.target.value } }))}
                    className="w-20 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 text-xs font-mono font-bold focus:bg-white focus:outline-none focus:border-purple-500 text-right"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const inp = inlineQuickAddInputs.thickness_prices;
                      if (inp && inp.name.trim()) {
                        updateDictValue('thickness_prices', inp.name.trim(), parseFloat(inp.price) || 0);
                        setInlineQuickAddInputs(prev => ({ ...prev, thickness_prices: { name: '', price: '' } }));
                      }
                    }}
                    className="bg-purple-600 hover:bg-purple-700 active:bg-purple-800 text-white font-bold text-xs px-3 py-1.5 rounded-lg transition shrink-0 flex items-center space-x-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add</span>
                  </button>
                </div>
              </div>

              {/* Finish Surcharges */}
              <div className="border border-slate-200 rounded-2xl p-4 space-y-3 bg-white">
                <h5 className="text-xs font-extrabold text-slate-900 flex items-center justify-between">
                  <span>Surface Finish Surcharges (LKR)</span>
                  <span className="text-[10px] text-slate-400 font-normal">Powder coat, Anodized, Wood Grain</span>
                </h5>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {getCombinedOptions(FINISH_OPTIONS, formData.finish_prices).map((f) => {
                    const val = formData.finish_prices[f] ?? '';
                    const isCustomKey = !FINISH_OPTIONS.includes(f as any);
                    return (
                      <div key={f} className={`p-2.5 rounded-xl flex items-center justify-between space-x-2 border ${isCustomKey ? 'bg-purple-50/50 border-purple-200' : 'bg-slate-50 border-slate-200'}`}>
                        <div className="flex items-center space-x-1 shrink-0 truncate">
                          <span className="text-xs font-bold text-slate-700 truncate">{f}</span>
                          {isCustomKey && <span className="text-[9px] bg-purple-200 text-purple-900 px-1 rounded font-semibold">Custom</span>}
                        </div>
                        <div className="flex items-center space-x-1">
                          <input
                            type="number"
                            placeholder="+0"
                            value={val}
                            onChange={(e) => updateDictValue('finish_prices', f, parseFloat(e.target.value) || 0)}
                            className="w-20 bg-white border border-slate-200 rounded-lg px-2 py-1 text-right font-mono font-bold text-xs focus:outline-none focus:border-purple-500"
                          />
                          {isCustomKey && (
                            <button
                              type="button"
                              onClick={() => removeDictKey('finish_prices', f)}
                              className="text-slate-400 hover:text-rose-600 font-bold px-0.5"
                            >
                              ✕
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
                {/* Inline Add Finish */}
                <div className="pt-2.5 border-t border-slate-100 flex items-center space-x-2 text-xs">
                  <input
                    type="text"
                    placeholder="+ Add Custom Finish (e.g., Anodized Gold 25Mic, Sandblasted Matte)"
                    value={inlineQuickAddInputs.finish_prices?.name || ''}
                    onChange={(e) => setInlineQuickAddInputs(prev => ({ ...prev, finish_prices: { name: e.target.value, price: prev.finish_prices?.price || '' } }))}
                    className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs focus:bg-white focus:outline-none focus:border-purple-500 font-medium"
                  />
                  <input
                    type="number"
                    placeholder="+Rs."
                    value={inlineQuickAddInputs.finish_prices?.price || ''}
                    onChange={(e) => setInlineQuickAddInputs(prev => ({ ...prev, finish_prices: { name: prev.finish_prices?.name || '', price: e.target.value } }))}
                    className="w-20 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 text-xs font-mono font-bold focus:bg-white focus:outline-none focus:border-purple-500 text-right"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const inp = inlineQuickAddInputs.finish_prices;
                      if (inp && inp.name.trim()) {
                        updateDictValue('finish_prices', inp.name.trim(), parseFloat(inp.price) || 0);
                        setInlineQuickAddInputs(prev => ({ ...prev, finish_prices: { name: '', price: '' } }));
                      }
                    }}
                    className="bg-purple-600 hover:bg-purple-700 active:bg-purple-800 text-white font-bold text-xs px-3 py-1.5 rounded-lg transition shrink-0 flex items-center space-x-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add</span>
                  </button>
                </div>
              </div>

              {/* Colour Surcharges */}
              <div className="border border-slate-200 rounded-2xl p-4 space-y-3 bg-white">
                <h5 className="text-xs font-extrabold text-slate-900">Colour Surcharges (LKR)</h5>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {getCombinedOptions(COLOUR_OPTIONS, formData.colour_prices).map((c) => {
                    const val = formData.colour_prices[c] ?? '';
                    const isCustomKey = !COLOUR_OPTIONS.includes(c as any);
                    return (
                      <div key={c} className={`p-2.5 rounded-xl flex items-center justify-between space-x-2 border ${isCustomKey ? 'bg-purple-50/50 border-purple-200' : 'bg-slate-50 border-slate-200'}`}>
                        <div className="flex items-center space-x-1 shrink-0 truncate">
                          <span className="text-xs font-bold text-slate-700">{c}</span>
                          {isCustomKey && <span className="text-[9px] bg-purple-200 text-purple-900 px-1 rounded font-semibold">Custom</span>}
                        </div>
                        <div className="flex items-center space-x-1">
                          <input
                            type="number"
                            placeholder="+0"
                            value={val}
                            onChange={(e) => updateDictValue('colour_prices', c, parseFloat(e.target.value) || 0)}
                            className="w-20 bg-white border border-slate-200 rounded-lg px-2 py-1 text-right font-mono font-bold text-xs focus:outline-none focus:border-purple-500"
                          />
                          {isCustomKey && (
                            <button
                              type="button"
                              onClick={() => removeDictKey('colour_prices', c)}
                              className="text-slate-400 hover:text-rose-600 font-bold px-0.5"
                            >
                              ✕
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
                {/* Inline Add Colour */}
                <div className="pt-2.5 border-t border-slate-100 flex items-center space-x-2 text-xs">
                  <input
                    type="text"
                    placeholder="+ Add Custom Colour (e.g., Matte Black RAL 9005, Anodized Champagne)"
                    value={inlineQuickAddInputs.colour_prices?.name || ''}
                    onChange={(e) => setInlineQuickAddInputs(prev => ({ ...prev, colour_prices: { name: e.target.value, price: prev.colour_prices?.price || '' } }))}
                    className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs focus:bg-white focus:outline-none focus:border-purple-500 font-medium"
                  />
                  <input
                    type="number"
                    placeholder="+Rs."
                    value={inlineQuickAddInputs.colour_prices?.price || ''}
                    onChange={(e) => setInlineQuickAddInputs(prev => ({ ...prev, colour_prices: { name: prev.colour_prices?.name || '', price: e.target.value } }))}
                    className="w-20 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 text-xs font-mono font-bold focus:bg-white focus:outline-none focus:border-purple-500 text-right"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const inp = inlineQuickAddInputs.colour_prices;
                      if (inp && inp.name.trim()) {
                        updateDictValue('colour_prices', inp.name.trim(), parseFloat(inp.price) || 0);
                        setInlineQuickAddInputs(prev => ({ ...prev, colour_prices: { name: '', price: '' } }));
                      }
                    }}
                    className="bg-purple-600 hover:bg-purple-700 active:bg-purple-800 text-white font-bold text-xs px-3 py-1.5 rounded-lg transition shrink-0 flex items-center space-x-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add</span>
                  </button>
                </div>
              </div>

              {/* Glass Surcharges */}
              <div className="border border-slate-200 rounded-2xl p-4 space-y-3 bg-white">
                <h5 className="text-xs font-extrabold text-slate-900">Glass Specification Surcharges (LKR)</h5>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {getCombinedOptions(GLASS_OPTIONS, formData.glass_prices).map((g) => {
                    const val = formData.glass_prices[g] ?? '';
                    const isCustomKey = !GLASS_OPTIONS.includes(g as any);
                    return (
                      <div key={g} className={`p-2.5 rounded-xl flex items-center justify-between space-x-2 border ${isCustomKey ? 'bg-purple-50/50 border-purple-200' : 'bg-slate-50 border-slate-200'}`}>
                        <div className="flex items-center space-x-1 shrink-0 truncate">
                          <span className="text-xs font-bold text-slate-700 truncate">{g}</span>
                          {isCustomKey && <span className="text-[9px] bg-purple-200 text-purple-900 px-1 rounded font-semibold">Custom</span>}
                        </div>
                        <div className="flex items-center space-x-1">
                          <input
                            type="number"
                            placeholder="+0"
                            value={val}
                            onChange={(e) => updateDictValue('glass_prices', g, parseFloat(e.target.value) || 0)}
                            className="w-20 bg-white border border-slate-200 rounded-lg px-2 py-1 text-right font-mono font-bold text-xs focus:outline-none focus:border-purple-500"
                          />
                          {isCustomKey && (
                            <button
                              type="button"
                              onClick={() => removeDictKey('glass_prices', g)}
                              className="text-slate-400 hover:text-rose-600 font-bold px-0.5"
                            >
                              ✕
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
                {/* Inline Add Glass */}
                <div className="pt-2.5 border-t border-slate-100 flex items-center space-x-2 text-xs">
                  <input
                    type="text"
                    placeholder="+ Add Custom Glass Spec (e.g., 12mm Toughened Clear, Low-E Double Glazed)"
                    value={inlineQuickAddInputs.glass_prices?.name || ''}
                    onChange={(e) => setInlineQuickAddInputs(prev => ({ ...prev, glass_prices: { name: e.target.value, price: prev.glass_prices?.price || '' } }))}
                    className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs focus:bg-white focus:outline-none focus:border-purple-500 font-medium"
                  />
                  <input
                    type="number"
                    placeholder="+Rs."
                    value={inlineQuickAddInputs.glass_prices?.price || ''}
                    onChange={(e) => setInlineQuickAddInputs(prev => ({ ...prev, glass_prices: { name: prev.glass_prices?.name || '', price: e.target.value } }))}
                    className="w-20 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 text-xs font-mono font-bold focus:bg-white focus:outline-none focus:border-purple-500 text-right"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const inp = inlineQuickAddInputs.glass_prices;
                      if (inp && inp.name.trim()) {
                        updateDictValue('glass_prices', inp.name.trim(), parseFloat(inp.price) || 0);
                        setInlineQuickAddInputs(prev => ({ ...prev, glass_prices: { name: '', price: '' } }));
                      }
                    }}
                    className="bg-purple-600 hover:bg-purple-700 active:bg-purple-800 text-white font-bold text-xs px-3 py-1.5 rounded-lg transition shrink-0 flex items-center space-x-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add</span>
                  </button>
                </div>
              </div>

              {/* Installation Option Surcharges */}
              <div className="border border-slate-200 rounded-2xl p-4 space-y-3 bg-white">
                <h5 className="text-xs font-extrabold text-slate-900">Installation & Labour Service Surcharges (LKR)</h5>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {getCombinedOptions(INSTALLATION_OPTIONS, formData.installation_prices).map((inst) => {
                    const val = formData.installation_prices[inst] ?? '';
                    const isCustomKey = !INSTALLATION_OPTIONS.includes(inst as any);
                    return (
                      <div key={inst} className={`p-2.5 rounded-xl flex items-center justify-between space-x-2 border ${isCustomKey ? 'bg-purple-50/50 border-purple-200' : 'bg-slate-50 border-slate-200'}`}>
                        <div className="flex items-center space-x-1 shrink-0 truncate">
                          <span className="text-xs font-bold text-slate-700">{inst}</span>
                          {isCustomKey && <span className="text-[9px] bg-purple-200 text-purple-900 px-1 rounded font-semibold">Custom</span>}
                        </div>
                        <div className="flex items-center space-x-1">
                          <input
                            type="number"
                            placeholder="+0"
                            value={val}
                            onChange={(e) => updateDictValue('installation_prices', inst, parseFloat(e.target.value) || 0)}
                            className="w-24 bg-white border border-slate-200 rounded-lg px-2 py-1 text-right font-mono font-bold text-xs focus:outline-none focus:border-purple-500"
                          />
                          {isCustomKey && (
                            <button
                              type="button"
                              onClick={() => removeDictKey('installation_prices', inst)}
                              className="text-slate-400 hover:text-rose-600 font-bold px-0.5"
                            >
                              ✕
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
                {/* Inline Add Installation */}
                <div className="pt-2.5 border-t border-slate-100 flex items-center space-x-2 text-xs">
                  <input
                    type="text"
                    placeholder="+ Add Custom Installation Type (e.g., Night Shift Installation, Scaffolding Assembly)"
                    value={inlineQuickAddInputs.installation_prices?.name || ''}
                    onChange={(e) => setInlineQuickAddInputs(prev => ({ ...prev, installation_prices: { name: e.target.value, price: prev.installation_prices?.price || '' } }))}
                    className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs focus:bg-white focus:outline-none focus:border-purple-500 font-medium"
                  />
                  <input
                    type="number"
                    placeholder="+Rs."
                    value={inlineQuickAddInputs.installation_prices?.price || ''}
                    onChange={(e) => setInlineQuickAddInputs(prev => ({ ...prev, installation_prices: { name: prev.installation_prices?.name || '', price: e.target.value } }))}
                    className="w-20 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 text-xs font-mono font-bold focus:bg-white focus:outline-none focus:border-purple-500 text-right"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const inp = inlineQuickAddInputs.installation_prices;
                      if (inp && inp.name.trim()) {
                        updateDictValue('installation_prices', inp.name.trim(), parseFloat(inp.price) || 0);
                        setInlineQuickAddInputs(prev => ({ ...prev, installation_prices: { name: '', price: '' } }));
                      }
                    }}
                    className="bg-purple-600 hover:bg-purple-700 active:bg-purple-800 text-white font-bold text-xs px-3 py-1.5 rounded-lg transition shrink-0 flex items-center space-x-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add</span>
                  </button>
                </div>
              </div>

              {/* Building Floor Level Surcharges */}
              <div className="border border-slate-200 rounded-2xl p-4 space-y-3 bg-white">
                <h5 className="text-xs font-extrabold text-slate-900 flex items-center justify-between">
                  <span>Building Floor Level & Vertical Transport Surcharges (LKR)</span>
                  <span className="text-[10px] text-slate-400 font-normal">Height, Hoist & Crane Handling Fee</span>
                </h5>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {getCombinedOptions(FLOOR_LEVEL_OPTIONS, formData.floor_level_prices).map((fl) => {
                    const val = formData.floor_level_prices[fl] ?? '';
                    const isCustomKey = !FLOOR_LEVEL_OPTIONS.includes(fl as any);
                    return (
                      <div key={fl} className={`p-2.5 rounded-xl flex items-center justify-between space-x-2 border ${isCustomKey ? 'bg-purple-50/50 border-purple-200' : 'bg-slate-50 border-slate-200'}`}>
                        <div className="flex items-center space-x-1 shrink-0 truncate">
                          <span className="text-xs font-bold text-slate-700">{fl}</span>
                          {isCustomKey && <span className="text-[9px] bg-purple-200 text-purple-900 px-1 rounded font-semibold">Custom</span>}
                        </div>
                        <div className="flex items-center space-x-1">
                          <input
                            type="number"
                            placeholder="+0"
                            value={val}
                            onChange={(e) => updateDictValue('floor_level_prices', fl, parseFloat(e.target.value) || 0)}
                            className="w-24 bg-white border border-slate-200 rounded-lg px-2 py-1 text-right font-mono font-bold text-xs focus:outline-none focus:border-purple-500"
                          />
                          {isCustomKey && (
                            <button
                              type="button"
                              onClick={() => removeDictKey('floor_level_prices', fl)}
                              className="text-slate-400 hover:text-rose-600 font-bold px-0.5"
                            >
                              ✕
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
                {/* Inline Add Floor Level */}
                <div className="pt-2.5 border-t border-slate-100 flex items-center space-x-2 text-xs">
                  <input
                    type="text"
                    placeholder="+ Add Custom Floor Level (e.g., Penthouse 30th+ Floor, Basement Level -2)"
                    value={inlineQuickAddInputs.floor_level_prices?.name || ''}
                    onChange={(e) => setInlineQuickAddInputs(prev => ({ ...prev, floor_level_prices: { name: e.target.value, price: prev.floor_level_prices?.price || '' } }))}
                    className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs focus:bg-white focus:outline-none focus:border-purple-500 font-medium"
                  />
                  <input
                    type="number"
                    placeholder="+Rs."
                    value={inlineQuickAddInputs.floor_level_prices?.price || ''}
                    onChange={(e) => setInlineQuickAddInputs(prev => ({ ...prev, floor_level_prices: { name: prev.floor_level_prices?.name || '', price: e.target.value } }))}
                    className="w-20 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 text-xs font-mono font-bold focus:bg-white focus:outline-none focus:border-purple-500 text-right"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const inp = inlineQuickAddInputs.floor_level_prices;
                      if (inp && inp.name.trim()) {
                        updateDictValue('floor_level_prices', inp.name.trim(), parseFloat(inp.price) || 0);
                        setInlineQuickAddInputs(prev => ({ ...prev, floor_level_prices: { name: '', price: '' } }));
                      }
                    }}
                    className="bg-purple-600 hover:bg-purple-700 active:bg-purple-800 text-white font-bold text-xs px-3 py-1.5 rounded-lg transition shrink-0 flex items-center space-x-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add</span>
                  </button>
                </div>
              </div>

              {/* Facility & Site Type Surcharges */}
              <div className="border border-slate-200 rounded-2xl p-4 space-y-3 bg-white">
                <h5 className="text-xs font-extrabold text-slate-900 flex items-center justify-between">
                  <span>Facility & Site Environment Surcharges (LKR)</span>
                  <span className="text-[10px] text-slate-400 font-normal">High Security, Malls, Hospitals, Factories</span>
                </h5>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {getCombinedOptions(FACILITY_TYPE_OPTIONS, formData.facility_type_prices).map((ft) => {
                    const val = formData.facility_type_prices[ft] ?? '';
                    const isCustomKey = !FACILITY_TYPE_OPTIONS.includes(ft as any);
                    return (
                      <div key={ft} className={`p-2.5 rounded-xl flex items-center justify-between space-x-2 border ${isCustomKey ? 'bg-purple-50/50 border-purple-200' : 'bg-slate-50 border-slate-200'}`}>
                        <div className="flex items-center space-x-1 shrink-0 truncate">
                          <span className="text-xs font-bold text-slate-700">{ft}</span>
                          {isCustomKey && <span className="text-[9px] bg-purple-200 text-purple-900 px-1 rounded font-semibold">Custom</span>}
                        </div>
                        <div className="flex items-center space-x-1">
                          <input
                            type="number"
                            placeholder="+0"
                            value={val}
                            onChange={(e) => updateDictValue('facility_type_prices', ft, parseFloat(e.target.value) || 0)}
                            className="w-24 bg-white border border-slate-200 rounded-lg px-2 py-1 text-right font-mono font-bold text-xs focus:outline-none focus:border-purple-500"
                          />
                          {isCustomKey && (
                            <button
                              type="button"
                              onClick={() => removeDictKey('facility_type_prices', ft)}
                              className="text-slate-400 hover:text-rose-600 font-bold px-0.5"
                            >
                              ✕
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
                {/* Inline Add Facility */}
                <div className="pt-2.5 border-t border-slate-100 flex items-center space-x-2 text-xs">
                  <input
                    type="text"
                    placeholder="+ Add Custom Facility Type (e.g., Airport Hangar, High Security Embassy Zone)"
                    value={inlineQuickAddInputs.facility_type_prices?.name || ''}
                    onChange={(e) => setInlineQuickAddInputs(prev => ({ ...prev, facility_type_prices: { name: e.target.value, price: prev.facility_type_prices?.price || '' } }))}
                    className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs focus:bg-white focus:outline-none focus:border-purple-500 font-medium"
                  />
                  <input
                    type="number"
                    placeholder="+Rs."
                    value={inlineQuickAddInputs.facility_type_prices?.price || ''}
                    onChange={(e) => setInlineQuickAddInputs(prev => ({ ...prev, facility_type_prices: { name: prev.facility_type_prices?.name || '', price: e.target.value } }))}
                    className="w-20 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 text-xs font-mono font-bold focus:bg-white focus:outline-none focus:border-purple-500 text-right"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const inp = inlineQuickAddInputs.facility_type_prices;
                      if (inp && inp.name.trim()) {
                        updateDictValue('facility_type_prices', inp.name.trim(), parseFloat(inp.price) || 0);
                        setInlineQuickAddInputs(prev => ({ ...prev, facility_type_prices: { name: '', price: '' } }));
                      }
                    }}
                    className="bg-purple-600 hover:bg-purple-700 active:bg-purple-800 text-white font-bold text-xs px-3 py-1.5 rounded-lg transition shrink-0 flex items-center space-x-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: TIERS & MULTI-FACTOR CATEGORIES */}
          {activeTab === 'tiers' && (
            <div className="space-y-5">
              <div className="bg-amber-50/80 border border-amber-200/80 p-4 rounded-2xl flex items-start space-x-3 text-xs text-amber-950">
                <Tag className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-sm text-amber-950">Multi-Factor Customer, Region, Project & Brand Rates</h4>
                  <p className="text-amber-800/90 mt-0.5">
                    Search and configure specialized price tiers across customer categories, delivery regions, project types, material grades, and manufacturer brands.
                  </p>
                </div>
              </div>

              {/* Customer Tiers Grid */}
              <div className="border border-slate-200 rounded-2xl p-4 space-y-3 bg-white">
                <h5 className="text-xs font-extrabold text-slate-900 flex items-center space-x-1">
                  <Award className="w-4 h-4 text-amber-600" />
                  <span>Customer Category Pricing Tiers (LKR)</span>
                </h5>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {getCombinedOptions(TIER_OPTIONS, formData.tier_prices).map((tier) => {
                    const val = formData.tier_prices[tier] ?? '';
                    const isCustomKey = !TIER_OPTIONS.includes(tier as any);
                    return (
                      <div key={tier} className={`p-2.5 rounded-xl space-y-1 border ${isCustomKey ? 'bg-amber-50/50 border-amber-200' : 'bg-slate-50 border-slate-200'}`}>
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-bold text-slate-600 truncate">{tier} Rate</span>
                          {isCustomKey && (
                            <button
                              type="button"
                              onClick={() => removeDictKey('tier_prices', tier)}
                              className="text-slate-400 hover:text-rose-600 text-[10px] font-bold px-1"
                            >
                              ✕
                            </button>
                          )}
                        </div>
                        <input
                          type="number"
                          placeholder={`Rs. ${formData.base_price}`}
                          value={val}
                          onChange={(e) => updateDictValue('tier_prices', tier, parseFloat(e.target.value) || 0)}
                          className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-slate-900 font-mono font-bold text-xs focus:outline-none focus:border-amber-500"
                        />
                      </div>
                    );
                  })}
                </div>
                {/* Inline Add Customer Tier */}
                <div className="pt-2.5 border-t border-slate-100 flex items-center space-x-2 text-xs">
                  <input
                    type="text"
                    placeholder="+ Add Custom Customer Tier (e.g., Platinum VIP, Institutional Buyer)"
                    value={inlineQuickAddInputs.tier_prices?.name || ''}
                    onChange={(e) => setInlineQuickAddInputs(prev => ({ ...prev, tier_prices: { name: e.target.value, price: prev.tier_prices?.price || '' } }))}
                    className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs focus:bg-white focus:outline-none focus:border-amber-500 font-medium"
                  />
                  <input
                    type="number"
                    placeholder="+Rs."
                    value={inlineQuickAddInputs.tier_prices?.price || ''}
                    onChange={(e) => setInlineQuickAddInputs(prev => ({ ...prev, tier_prices: { name: prev.tier_prices?.name || '', price: e.target.value } }))}
                    className="w-20 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 text-xs font-mono font-bold focus:bg-white focus:outline-none focus:border-amber-500 text-right"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const inp = inlineQuickAddInputs.tier_prices;
                      if (inp && inp.name.trim()) {
                        updateDictValue('tier_prices', inp.name.trim(), parseFloat(inp.price) || 0);
                        setInlineQuickAddInputs(prev => ({ ...prev, tier_prices: { name: '', price: '' } }));
                      }
                    }}
                    className="bg-amber-600 hover:bg-amber-700 active:bg-amber-800 text-white font-bold text-xs px-3 py-1.5 rounded-lg transition shrink-0 flex items-center space-x-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add</span>
                  </button>
                </div>
              </div>

              {/* Customer Type Rates */}
              <div className="border border-slate-200 rounded-2xl p-4 space-y-3 bg-white">
                <h5 className="text-xs font-extrabold text-slate-900 flex items-center space-x-1">
                  <UserCheck className="w-4 h-4 text-blue-600" />
                  <span>Customer Industry Segment Rates (LKR)</span>
                </h5>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {getCombinedOptions(CUSTOMER_TYPE_OPTIONS, formData.customer_type_prices).map((ct) => {
                    const val = formData.customer_type_prices[ct] ?? '';
                    const isCustomKey = !CUSTOMER_TYPE_OPTIONS.includes(ct as any);
                    return (
                      <div key={ct} className={`p-2.5 rounded-xl space-y-1 border ${isCustomKey ? 'bg-blue-50/50 border-blue-200' : 'bg-slate-50 border-slate-200'}`}>
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-bold text-slate-600 truncate">{ct}</span>
                          {isCustomKey && (
                            <button
                              type="button"
                              onClick={() => removeDictKey('customer_type_prices', ct)}
                              className="text-slate-400 hover:text-rose-600 text-[10px] font-bold px-1"
                            >
                              ✕
                            </button>
                          )}
                        </div>
                        <input
                          type="number"
                          placeholder={`Rs. ${formData.base_price}`}
                          value={val}
                          onChange={(e) => updateDictValue('customer_type_prices', ct, parseFloat(e.target.value) || 0)}
                          className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-slate-900 font-mono font-bold text-xs focus:outline-none focus:border-blue-500"
                        />
                      </div>
                    );
                  })}
                </div>
                {/* Inline Add Customer Industry */}
                <div className="pt-2.5 border-t border-slate-100 flex items-center space-x-2 text-xs">
                  <input
                    type="text"
                    placeholder="+ Add Custom Industry Category (e.g., Hotel Chain, Marine & Naval, Solar Developer)"
                    value={inlineQuickAddInputs.customer_type_prices?.name || ''}
                    onChange={(e) => setInlineQuickAddInputs(prev => ({ ...prev, customer_type_prices: { name: e.target.value, price: prev.customer_type_prices?.price || '' } }))}
                    className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs focus:bg-white focus:outline-none focus:border-blue-500 font-medium"
                  />
                  <input
                    type="number"
                    placeholder="+Rs."
                    value={inlineQuickAddInputs.customer_type_prices?.price || ''}
                    onChange={(e) => setInlineQuickAddInputs(prev => ({ ...prev, customer_type_prices: { name: prev.customer_type_prices?.name || '', price: e.target.value } }))}
                    className="w-20 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 text-xs font-mono font-bold focus:bg-white focus:outline-none focus:border-blue-500 text-right"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const inp = inlineQuickAddInputs.customer_type_prices;
                      if (inp && inp.name.trim()) {
                        updateDictValue('customer_type_prices', inp.name.trim(), parseFloat(inp.price) || 0);
                        setInlineQuickAddInputs(prev => ({ ...prev, customer_type_prices: { name: '', price: '' } }));
                      }
                    }}
                    className="bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-xs px-3 py-1.5 rounded-lg transition shrink-0 flex items-center space-x-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add</span>
                  </button>
                </div>
              </div>

              {/* Geographic Region Rates & Sri Lanka Divisions */}
              <div className="border border-slate-200 rounded-2xl p-4 space-y-4 bg-white shadow-2xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div>
                    <h5 className="text-xs font-extrabold text-slate-900 flex items-center space-x-1.5">
                      <MapPin className="w-4 h-4 text-orange-500" />
                      <span>Sri Lanka Island-Wide Divisions & Postal Region Pricing Engine</span>
                    </h5>
                    <p className="text-[11px] text-slate-500 font-medium">Configure individual regional surcharges or freight rates for every division/district in Sri Lanka</p>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={() => {
                        const autoDict: Record<string, number> = {};
                        ALL_SRI_LANKA_REGIONS.forEach(r => {
                          autoDict[r.name] = r.defaultSurchargeLkr || 0;
                        });
                        setFormData(prev => ({
                          ...prev,
                          region_prices: { ...prev.region_prices, ...autoDict }
                        }));
                      }}
                      className="px-2.5 py-1 bg-orange-50 hover:bg-orange-100 border border-orange-200 text-orange-700 rounded-md text-[11px] font-semibold transition flex items-center space-x-1"
                    >
                      <CheckCircle2 className="w-3 h-3 text-orange-500" />
                      <span>Auto-Fill Default Freight Rates</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setFormData(prev => ({
                          ...prev,
                          region_prices: {}
                        }));
                      }}
                      className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-md text-[11px] font-medium transition"
                    >
                      Clear All
                    </button>
                  </div>
                </div>

                {/* Search & Province Filters */}
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <div className="relative flex-1">
                      <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
                      <input
                        type="text"
                        placeholder="Search Sri Lanka postal code, city, district or region name..."
                        value={slRegionQuery}
                        onChange={(e) => setSlRegionQuery(e.target.value)}
                        className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-orange-500"
                      />
                    </div>
                    <span className="text-[11px] font-medium text-slate-500">
                      {Object.keys(formData.region_prices).length} Regions Active
                    </span>
                  </div>

                  {/* Province filter pills */}
                  <div className="flex flex-wrap gap-1 pt-1">
                    <button
                      type="button"
                      onClick={() => setSlProvinceFilter('ALL')}
                      className={`px-2 py-0.5 rounded-sm text-[10px] font-semibold transition ${slProvinceFilter === 'ALL' ? 'bg-orange-500 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                    >
                      All Sri Lanka
                    </button>
                    {SRI_LANKA_PROVINCES.map((prov) => (
                      <button
                        key={prov}
                        type="button"
                        onClick={() => setSlProvinceFilter(prov)}
                        className={`px-2 py-0.5 rounded-sm text-[10px] font-semibold transition ${slProvinceFilter === prov ? 'bg-orange-500 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                      >
                        {prov.replace(' Province', '')}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Grid of Regions */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 max-h-[300px] overflow-y-auto p-1">
                  {ALL_SRI_LANKA_REGIONS
                    .filter(r => {
                      const matchesProvince = slProvinceFilter === 'ALL' || r.province === slProvinceFilter;
                      const matchesQuery = !slRegionQuery || 
                        r.name.toLowerCase().includes(slRegionQuery.toLowerCase()) || 
                        r.district.toLowerCase().includes(slRegionQuery.toLowerCase()) ||
                        (r.postalCode && r.postalCode.includes(slRegionQuery));
                      return matchesProvince && matchesQuery;
                    })
                    .map((reg) => {
                      const val = formData.region_prices[reg.name] ?? '';
                      const hasVal = val !== '' && val !== 0;
                      return (
                        <div 
                          key={reg.id} 
                          className={`p-2 rounded-lg border transition ${hasVal ? 'bg-orange-50/40 border-orange-300' : 'bg-slate-50 border-slate-200'}`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-[11px] font-semibold text-slate-800 truncate">{reg.name}</span>
                            {reg.postalCode && (
                              <span className="text-[9px] font-mono bg-slate-200 text-slate-700 px-1 rounded">
                                {reg.postalCode}
                              </span>
                            )}
                          </div>
                          <div className="text-[9px] text-slate-500 mb-1.5">{reg.district} • {reg.province.replace(' Province', '')}</div>
                          
                          <div className="flex items-center space-x-1.5">
                            <span className="text-[10px] text-slate-400 font-semibold">+Rs.</span>
                            <input
                              type="number"
                              placeholder={reg.defaultSurchargeLkr ? `${reg.defaultSurchargeLkr}` : '0'}
                              value={val}
                              onChange={(e) => updateDictValue('region_prices', reg.name, parseFloat(e.target.value) || 0)}
                              className="w-full bg-white border border-slate-200 rounded px-2 py-1 text-slate-900 font-mono font-bold text-xs focus:outline-none focus:border-orange-500"
                            />
                          </div>
                        </div>
                      );
                    })}
                </div>

                {/* Inline Add Custom Sri Lanka / Overseas Postal Region */}
                <div className="pt-2.5 border-t border-slate-100 flex items-center space-x-2 text-xs">
                  <input
                    type="text"
                    placeholder="+ Add Custom Region / Postal Zone (e.g., Hambantota Port Zone, Colombo Port City)"
                    value={inlineQuickAddInputs.region_prices?.name || ''}
                    onChange={(e) => setInlineQuickAddInputs(prev => ({ ...prev, region_prices: { name: e.target.value, price: prev.region_prices?.price || '' } }))}
                    className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs focus:bg-white focus:outline-none focus:border-orange-500 font-medium"
                  />
                  <input
                    type="number"
                    placeholder="+Rs."
                    value={inlineQuickAddInputs.region_prices?.price || ''}
                    onChange={(e) => setInlineQuickAddInputs(prev => ({ ...prev, region_prices: { name: prev.region_prices?.name || '', price: e.target.value } }))}
                    className="w-20 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 text-xs font-mono font-bold focus:bg-white focus:outline-none focus:border-orange-500 text-right"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const inp = inlineQuickAddInputs.region_prices;
                      if (inp && inp.name.trim()) {
                        updateDictValue('region_prices', inp.name.trim(), parseFloat(inp.price) || 0);
                        setInlineQuickAddInputs(prev => ({ ...prev, region_prices: { name: '', price: '' } }));
                      }
                    }}
                    className="bg-orange-600 hover:bg-orange-700 active:bg-orange-800 text-white font-bold text-xs px-3 py-1.5 rounded-lg transition shrink-0 flex items-center space-x-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Region</span>
                  </button>
                </div>

                {/* Configured Regions Log Summary */}
                {Object.keys(formData.region_prices).length > 0 && (
                  <div className="border-t border-slate-100 pt-3 space-y-1.5">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                      Configured Regional Rates Log ({Object.keys(formData.region_prices).length} items):
                    </span>
                    <div className="flex flex-wrap gap-1.5 max-h-[80px] overflow-y-auto">
                      {Object.entries(formData.region_prices).map(([rName, rVal]) => (
                        <span key={rName} className="inline-flex items-center space-x-1 text-[10px] bg-slate-100 border border-slate-200 text-slate-800 px-2 py-0.5 rounded-md font-mono">
                          <span className="font-semibold text-slate-900">{rName}:</span>
                          <span className="text-orange-600 font-bold">+Rs. {rVal}</span>
                          <button
                            type="button"
                            onClick={() => {
                              const newDict = { ...formData.region_prices };
                              delete newDict[rName];
                              setFormData(prev => ({ ...prev, region_prices: newDict }));
                            }}
                            className="text-slate-400 hover:text-rose-600 font-bold ml-1"
                          >
                            ✕
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Project Type Rates */}
              <div className="border border-slate-200 rounded-2xl p-4 space-y-3 bg-white">
                <h5 className="text-xs font-extrabold text-slate-900 flex items-center space-x-1">
                  <Building2 className="w-4 h-4 text-indigo-600" />
                  <span>Project Sector Pricing Adjustments (LKR)</span>
                </h5>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {getCombinedOptions(PROJECT_TYPE_OPTIONS, formData.project_type_prices).map((pt) => {
                    const val = formData.project_type_prices[pt] ?? '';
                    const isCustomKey = !PROJECT_TYPE_OPTIONS.includes(pt as any);
                    return (
                      <div key={pt} className={`p-2.5 rounded-xl space-y-1 border ${isCustomKey ? 'bg-indigo-50/50 border-indigo-200' : 'bg-slate-50 border-slate-200'}`}>
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-bold text-slate-600 truncate">{pt}</span>
                          {isCustomKey && (
                            <button
                              type="button"
                              onClick={() => removeDictKey('project_type_prices', pt)}
                              className="text-slate-400 hover:text-rose-600 text-[10px] font-bold px-1"
                            >
                              ✕
                            </button>
                          )}
                        </div>
                        <input
                          type="number"
                          placeholder="+0"
                          value={val}
                          onChange={(e) => updateDictValue('project_type_prices', pt, parseFloat(e.target.value) || 0)}
                          className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-slate-900 font-mono font-bold text-xs focus:outline-none focus:border-indigo-500"
                        />
                      </div>
                    );
                  })}
                </div>
                {/* Inline Add Project Sector */}
                <div className="pt-2.5 border-t border-slate-100 flex items-center space-x-2 text-xs">
                  <input
                    type="text"
                    placeholder="+ Add Custom Project Sector (e.g., Infrastructure / Bridge, Religious Complex)"
                    value={inlineQuickAddInputs.project_type_prices?.name || ''}
                    onChange={(e) => setInlineQuickAddInputs(prev => ({ ...prev, project_type_prices: { name: e.target.value, price: prev.project_type_prices?.price || '' } }))}
                    className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs focus:bg-white focus:outline-none focus:border-indigo-500 font-medium"
                  />
                  <input
                    type="number"
                    placeholder="+Rs."
                    value={inlineQuickAddInputs.project_type_prices?.price || ''}
                    onChange={(e) => setInlineQuickAddInputs(prev => ({ ...prev, project_type_prices: { name: prev.project_type_prices?.name || '', price: e.target.value } }))}
                    className="w-20 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 text-xs font-mono font-bold focus:bg-white focus:outline-none focus:border-indigo-500 text-right"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const inp = inlineQuickAddInputs.project_type_prices;
                      if (inp && inp.name.trim()) {
                        updateDictValue('project_type_prices', inp.name.trim(), parseFloat(inp.price) || 0);
                        setInlineQuickAddInputs(prev => ({ ...prev, project_type_prices: { name: '', price: '' } }));
                      }
                    }}
                    className="bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-bold text-xs px-3 py-1.5 rounded-lg transition shrink-0 flex items-center space-x-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add</span>
                  </button>
                </div>
              </div>

              {/* Material Grade & Manufacturer Brand Surcharges */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Material Grade */}
                <div className="border border-slate-200 rounded-2xl p-4 space-y-3 bg-white">
                  <h5 className="text-xs font-extrabold text-slate-900">Material Grade Surcharges</h5>
                  <div className="space-y-2">
                    {getCombinedOptions(GRADE_OPTIONS, formData.grade_prices).map((grd) => {
                      const val = formData.grade_prices[grd] ?? '';
                      const isCustomKey = !GRADE_OPTIONS.includes(grd as any);
                      return (
                        <div key={grd} className={`p-2 rounded-xl flex items-center justify-between border ${isCustomKey ? 'bg-purple-50/50 border-purple-200' : 'bg-slate-50 border-slate-200'}`}>
                          <div className="flex items-center space-x-1">
                            <span className="text-xs font-bold text-slate-700">{grd}</span>
                            {isCustomKey && <span className="text-[9px] bg-purple-200 text-purple-900 px-1 rounded font-semibold">Custom</span>}
                          </div>
                          <div className="flex items-center space-x-1">
                            <input
                              type="number"
                              placeholder="+0"
                              value={val}
                              onChange={(e) => updateDictValue('grade_prices', grd, parseFloat(e.target.value) || 0)}
                              className="w-24 bg-white border border-slate-200 rounded-lg px-2 py-1 text-right font-mono font-bold text-xs"
                            />
                            {isCustomKey && (
                              <button
                                type="button"
                                onClick={() => removeDictKey('grade_prices', grd)}
                                className="text-slate-400 hover:text-rose-600 text-[10px] font-bold px-1"
                              >
                                ✕
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  {/* Inline Add Grade */}
                  <div className="pt-2.5 border-t border-slate-100 flex items-center space-x-2 text-xs">
                    <input
                      type="text"
                      placeholder="+ Add Custom Grade (e.g., Marine Grade 5052)"
                      value={inlineQuickAddInputs.grade_prices?.name || ''}
                      onChange={(e) => setInlineQuickAddInputs(prev => ({ ...prev, grade_prices: { name: e.target.value, price: prev.grade_prices?.price || '' } }))}
                      className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs focus:bg-white focus:outline-none focus:border-purple-500 font-medium"
                    />
                    <input
                      type="number"
                      placeholder="+Rs."
                      value={inlineQuickAddInputs.grade_prices?.price || ''}
                      onChange={(e) => setInlineQuickAddInputs(prev => ({ ...prev, grade_prices: { name: prev.grade_prices?.name || '', price: e.target.value } }))}
                      className="w-20 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 text-xs font-mono font-bold focus:bg-white focus:outline-none focus:border-purple-500 text-right"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const inp = inlineQuickAddInputs.grade_prices;
                        if (inp && inp.name.trim()) {
                          updateDictValue('grade_prices', inp.name.trim(), parseFloat(inp.price) || 0);
                          setInlineQuickAddInputs(prev => ({ ...prev, grade_prices: { name: '', price: '' } }));
                        }
                      }}
                      className="bg-purple-600 hover:bg-purple-700 active:bg-purple-800 text-white font-bold text-xs px-3 py-1.5 rounded-lg transition shrink-0 flex items-center space-x-1 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add</span>
                    </button>
                  </div>
                </div>

                {/* Brand Manufacturer */}
                <div className="border border-slate-200 rounded-2xl p-4 space-y-3 bg-white">
                  <h5 className="text-xs font-extrabold text-slate-900">Brand Manufacturer Surcharges</h5>
                  <div className="space-y-2">
                    {getCombinedOptions(BRAND_OPTIONS, formData.brand_prices).map((brd) => {
                      const val = formData.brand_prices[brd] ?? '';
                      const isCustomKey = !BRAND_OPTIONS.includes(brd as any);
                      return (
                        <div key={brd} className={`p-2 rounded-xl flex items-center justify-between border ${isCustomKey ? 'bg-purple-50/50 border-purple-200' : 'bg-slate-50 border-slate-200'}`}>
                          <div className="flex items-center space-x-1">
                            <span className="text-xs font-bold text-slate-700">{brd}</span>
                            {isCustomKey && <span className="text-[9px] bg-purple-200 text-purple-900 px-1 rounded font-semibold">Custom</span>}
                          </div>
                          <div className="flex items-center space-x-1">
                            <input
                              type="number"
                              placeholder="+0"
                              value={val}
                              onChange={(e) => updateDictValue('brand_prices', brd, parseFloat(e.target.value) || 0)}
                              className="w-24 bg-white border border-slate-200 rounded-lg px-2 py-1 text-right font-mono font-bold text-xs"
                            />
                            {isCustomKey && (
                              <button
                                type="button"
                                onClick={() => removeDictKey('brand_prices', brd)}
                                className="text-slate-400 hover:text-rose-600 text-[10px] font-bold px-1"
                              >
                                ✕
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  {/* Inline Add Brand */}
                  <div className="pt-2.5 border-t border-slate-100 flex items-center space-x-2 text-xs">
                    <input
                      type="text"
                      placeholder="+ Add Custom Brand (e.g., Kinlong, Reynaers Euro)"
                      value={inlineQuickAddInputs.brand_prices?.name || ''}
                      onChange={(e) => setInlineQuickAddInputs(prev => ({ ...prev, brand_prices: { name: e.target.value, price: prev.brand_prices?.price || '' } }))}
                      className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs focus:bg-white focus:outline-none focus:border-purple-500 font-medium"
                    />
                    <input
                      type="number"
                      placeholder="+Rs."
                      value={inlineQuickAddInputs.brand_prices?.price || ''}
                      onChange={(e) => setInlineQuickAddInputs(prev => ({ ...prev, brand_prices: { name: prev.brand_prices?.name || '', price: e.target.value } }))}
                      className="w-20 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 text-xs font-mono font-bold focus:bg-white focus:outline-none focus:border-purple-500 text-right"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const inp = inlineQuickAddInputs.brand_prices;
                        if (inp && inp.name.trim()) {
                          updateDictValue('brand_prices', inp.name.trim(), parseFloat(inp.price) || 0);
                          setInlineQuickAddInputs(prev => ({ ...prev, brand_prices: { name: '', price: '' } }));
                        }
                      }}
                      className="bg-purple-600 hover:bg-purple-700 active:bg-purple-800 text-white font-bold text-xs px-3 py-1.5 rounded-lg transition shrink-0 flex items-center space-x-1 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Quantity Volume Breaks Table */}
              <div className="border border-slate-200 rounded-2xl p-4 space-y-3 bg-white">
                <div className="flex items-center justify-between">
                  <div>
                    <h5 className="text-xs font-extrabold text-slate-900">Quantity Volume Breaks</h5>
                    <p className="text-[11px] text-slate-500">Tiered bulk discounts triggered automatically by quotation quantity.</p>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddQuantityBreak}
                    className="bg-amber-600 hover:bg-amber-700 text-white px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center space-x-1 shadow-sm"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Break Row</span>
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-100 border-b border-slate-200 text-[10px] font-extrabold text-slate-600 uppercase">
                        <th className="py-2 px-3">Min Qty</th>
                        <th className="py-2 px-3">Max Qty</th>
                        <th className="py-2 px-3">Special Unit Rate (LKR)</th>
                        <th className="py-2 px-3">Label / Tier Description</th>
                        <th className="py-2 px-3 text-right">Remove</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {formData.quantity_breaks.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="text-center py-6 text-slate-400 font-medium italic">
                            No quantity breaks defined. Click "Add Break Row" above.
                          </td>
                        </tr>
                      ) : (
                        formData.quantity_breaks.map((qb, idx) => (
                          <tr key={qb.id || idx} className="hover:bg-slate-50">
                            <td className="py-2 px-3">
                              <input
                                type="number"
                                value={qb.min_qty}
                                onChange={(e) => handleUpdateQuantityBreak(idx, 'min_qty', parseInt(e.target.value) || 1)}
                                className="w-20 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 font-mono font-bold text-xs"
                              />
                            </td>
                            <td className="py-2 px-3">
                              <input
                                type="number"
                                value={qb.max_qty}
                                onChange={(e) => handleUpdateQuantityBreak(idx, 'max_qty', parseInt(e.target.value) || 100)}
                                className="w-20 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 font-mono font-bold text-xs"
                              />
                            </td>
                            <td className="py-2 px-3">
                              <input
                                type="number"
                                value={qb.unit_price}
                                onChange={(e) => handleUpdateQuantityBreak(idx, 'unit_price', parseFloat(e.target.value) || 0)}
                                className="w-28 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 font-mono font-extrabold text-slate-900 text-xs"
                              />
                            </td>
                            <td className="py-2 px-3">
                              <input
                                type="text"
                                value={qb.label || ''}
                                onChange={(e) => handleUpdateQuantityBreak(idx, 'label', e.target.value)}
                                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs"
                                placeholder="e.g. Bulk 51+ units"
                              />
                            </td>
                            <td className="py-2 px-3 text-right">
                              <button
                                type="button"
                                onClick={() => handleRemoveQuantityBreak(idx)}
                                className="text-rose-600 hover:text-rose-800 p-1 hover:bg-rose-50 rounded-lg transition"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 7: REVISION AUDIT (FOR EDIT MODE) */}
          {activeTab === 'audit' && mode === 'edit' && product && (
            <ProductAuditLogViewer
              product={product}
              formData={formData}
              priceHistory={priceHistory}
              isFormMode={true}
              onReasonChange={(reason) => setFormData(prev => ({ ...prev, reason }))}
              onEffectiveDateChange={(date) => setFormData(prev => ({ ...prev, effective_date: date }))}
            />
          )}
        </form>

        {/* Modal Footer Controls */}
        <div className="bg-slate-50 border-t border-slate-200 px-4 py-3 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 rounded-md text-xs font-semibold transition shadow-2xs"
            >
              Cancel
            </button>
          </div>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={() => {
                const idx = tabs.findIndex(t => t.id === activeTab);
                if (idx > 0) setActiveTab(tabs[idx - 1].id as any);
              }}
              disabled={tabs.findIndex(t => t.id === activeTab) === 0}
              className="px-2.5 py-1.5 bg-white border border-slate-200 hover:bg-slate-100 disabled:opacity-40 text-slate-700 rounded-md text-xs font-semibold transition flex items-center space-x-1"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Previous Tab</span>
            </button>

            <button
              type="button"
              onClick={() => {
                const idx = tabs.findIndex(t => t.id === activeTab);
                if (idx < tabs.length - 1) setActiveTab(tabs[idx + 1].id as any);
              }}
              disabled={tabs.findIndex(t => t.id === activeTab) === tabs.length - 1}
              className="px-2.5 py-1.5 bg-white border border-slate-200 hover:bg-slate-100 disabled:opacity-40 text-slate-700 rounded-md text-xs font-semibold transition flex items-center space-x-1"
            >
              <span>Next Tab</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onClick={handleSubmitForm}
              disabled={isSubmitting}
              className="px-4 py-1.5 bg-orange-500 hover:bg-orange-600 text-white rounded-md text-xs font-semibold transition shadow-xs flex items-center space-x-1.5"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{isSubmitting ? 'Publishing Changes...' : (mode === 'add' ? 'Save Master Item' : 'Publish Master Product Data')}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
