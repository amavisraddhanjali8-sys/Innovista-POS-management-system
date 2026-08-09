import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, 
  Plus, 
  Edit3, 
  ArrowUpRight, 
  ArrowDownRight, 
  Layers, 
  TrendingUp, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  ShieldAlert, 
  Tag, 
  Zap,
  Filter,
  Building2,
  Users,
  Percent,
  Sliders,
  Calendar,
  Trash2,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  Award,
  Sparkles,
  ShieldCheck,
  Play,
  Pause,
  MapPin,
  Maximize2,
  Eye,
  DoorOpen,
  LayoutGrid,
  Grid,
  Shield,
  Square,
  Box,
  Wrench,
  FileText,
  ChevronRight,
  ArrowLeft,
  ShoppingCart,
  Minus,
  Package,
  Store,
  RotateCcw,
  RotateCw,
  RefreshCw,
  Receipt,
  Send,
  Check,
  Info,
  ArrowRight,
  Camera,
  Upload,
  List,
  QrCode,
  Power,
  PackageCheck
} from 'lucide-react';
import { ProductBarcodeLabelModal } from './BarcodeGenerator';
import { PackedWorkManagement } from './PackedWorkManagement';
import { DEFAULT_PACKED_WORKS } from '../data/defaultPackedWorks';
import { 
  Product, 
  CategoryType, 
  Branch, 
  BranchPriceOverride, 
  CustomerPriceOverride, 
  DiscountApprovalRequest,
  PriceHistory,
  QuotationItem,
  MaterialThickness,
  MaterialFinish,
  MaterialColour,
  GlassType,
  InstallationOption,
  PricingTier,
  CustomerType,
  PackedWorkPackage,
  CategoryConfig,
  SubCategoryItem
} from '../types';
import { fetchCategories } from '../services/api';
import { calculateProductTrendPrediction } from '../utils/trendPredictionEngine';
import { ProductPriceForecastModal } from './ProductPriceForecastModal';
import { BranchPriceSlidingCell } from './BranchPriceSlidingCell';
import { LocationPriceSlidingCell } from './LocationPriceSlidingCell';
import { ProductMasterFormModal, ProductFormData } from './ProductMasterFormModal';
import { ProductImageLightboxModal } from './ProductImageLightboxModal';
import { ProductViewPosModal } from './ProductViewPosModal';
import { resolveProductVariantPrice } from '../utils/priceVariantEngine';
import { Truck, Printer, FileCheck, CreditCard, User, Phone, Mail, FileSpreadsheet, X, Ban } from 'lucide-react';
import { SiteLocation, Vehicle, TransportRules, Quotation } from '../types';

export interface MainCategoryConfig {
  id: string;
  name: string;
  description: string;
  iconName: string;
  badgeColor: string;
  subCategories: string[];
}

export const INITIAL_MAIN_CATEGORIES: MainCategoryConfig[] = [
  {
    id: 'cat-doors',
    name: 'Doors',
    description: '100mm & 80mm heavy duty series, single sash, double sash, sliding, folding & louver doors.',
    iconName: 'DoorOpen',
    badgeColor: 'bg-blue-500/10 text-blue-600 border-blue-200',
    subCategories: ['100mm Series Doors', '80mm Series Doors', 'Single Sash Doors', 'Double Sash Doors', 'Sliding Doors', 'Folding & Bi-Fold Doors', 'Louver Doors']
  },
  {
    id: 'cat-windows',
    name: 'Windows',
    description: 'Casement, sliding, top-hung awning, fixed glass & weatherproof louver window systems.',
    iconName: 'LayoutGrid',
    badgeColor: 'bg-indigo-500/10 text-indigo-600 border-indigo-200',
    subCategories: ['Casement Windows', 'Sliding Windows', 'Top-Hung Awning Windows', 'Fixed Glass Windows', 'Louver Windows']
  },
  {
    id: 'cat-profiles',
    name: 'Aluminium Profiles',
    description: 'Powder coated white, anodized silver, bronze, dark grey & wood finish extrusion bars.',
    iconName: 'Layers',
    badgeColor: 'bg-amber-500/10 text-amber-600 border-amber-200',
    subCategories: ['Powder Coated Profiles', 'Anodized Silver Profiles', 'Bronze & Dark Grey Profiles', 'Wood Finish Grain Profiles', 'Curtain Wall Mullions']
  },
  {
    id: 'cat-ceiling',
    name: 'Ceiling Systems',
    description: 'Aluminium strip ceilings, tile grid, linear baffle & acoustic suspended ceilings.',
    iconName: 'Grid',
    badgeColor: 'bg-purple-500/10 text-purple-600 border-purple-200',
    subCategories: ['Aluminium Strip Ceilings', 'Tile Grid Ceilings', 'Linear Baffle Ceilings', 'Suspended Acoustic Panels']
  },
  {
    id: 'cat-glass',
    name: 'Glass & Glazing',
    description: 'Toughened safety glass, laminated, double glazed insulated units, tinted & frosted glass.',
    iconName: 'Shield',
    badgeColor: 'bg-emerald-500/10 text-emerald-600 border-emerald-200',
    subCategories: ['Toughened Safety Glass', 'Laminated Glass', 'Double Glazed Insulated Units', 'Tinted & Frosted Glass']
  },
  {
    id: 'cat-acp',
    name: 'ACP Sheets',
    description: 'Exterior PVDF fire-retardant cladding panels & interior polyester aluminium composite sheets.',
    iconName: 'Square',
    badgeColor: 'bg-rose-500/10 text-rose-600 border-rose-200',
    subCategories: ['Exterior PVDF Cladding Sheets', 'Interior Polyester ACP', 'Wood & Marble Effect ACP']
  },
  {
    id: 'cat-steel',
    name: 'Steel Sections',
    description: 'Galvanized hollow box sections, C-channels, equal angles, I-beams & subframe bars.',
    iconName: 'Box',
    badgeColor: 'bg-slate-500/10 text-slate-700 border-slate-200',
    subCategories: ['Square Hollow Box Bar', 'Rectangular Hollow Box Bar', 'C-Channels & Equal Angles']
  },
  {
    id: 'cat-hardware',
    name: 'Hardware & Accessories',
    description: 'Multi-point mortise locksets, stainless friction stays, heavy duty nylon rollers & sealants.',
    iconName: 'Wrench',
    badgeColor: 'bg-cyan-500/10 text-cyan-600 border-cyan-200',
    subCategories: ['Door Locks & Handles', 'Friction Stays & Hinges', 'Heavy Duty Rollers', 'Silicone Sealants & Adhesives']
  },
  {
    id: 'cat-interior',
    name: 'Interior Design',
    description: 'Turnkey living room suites, luxury aluminium body kitchen cabinetry & pantry fit-outs.',
    iconName: 'Sparkles',
    badgeColor: 'bg-pink-500/10 text-pink-600 border-pink-200',
    subCategories: ['Living Room Fit-outs', 'Luxury Kitchen & Pantry Suites', 'Office Partitioning']
  },
  {
    id: 'cat-civil',
    name: 'Civil Works',
    description: 'Clay brickwork masonry, Grade 30 structural reinforced concrete pours & plastering.',
    iconName: 'Building2',
    badgeColor: 'bg-orange-500/10 text-orange-600 border-orange-200',
    subCategories: ['Masonry & Brickwork', 'Structural Concrete Works', 'Plastering & Rendering']
  },
  {
    id: 'cat-labour',
    name: 'Labour & Installation',
    description: 'Shop-floor fabrication teams, certified site installers, carpenters & welders.',
    iconName: 'Users',
    badgeColor: 'bg-teal-500/10 text-teal-600 border-teal-200',
    subCategories: ['Fabrication Labour', 'On-Site Installation Teams', 'Specialist Welders & Riggers']
  },
  {
    id: 'cat-services',
    name: 'Services',
    description: 'CAD shop drawings, site surveying & structural engineering compliance reports.',
    iconName: 'FileText',
    badgeColor: 'bg-violet-500/10 text-violet-600 border-violet-200',
    subCategories: ['CAD & Shop Drawings', 'Site Surveying & Measurement', 'Engineering Compliance']
  }
];

interface MasterPriceManagementProps {
  products: Product[];
  branches: Branch[];
  branchPrices: BranchPriceOverride[];
  customerPrices: CustomerPriceOverride[];
  discountRequests: DiscountApprovalRequest[];
  priceHistory?: PriceHistory[];
  activeBranch: Branch;
  locations?: SiteLocation[];
  vehicles?: Vehicle[];
  rules?: TransportRules;
  quotations?: Quotation[];
  onCreateQuotation?: (quotation: Partial<Quotation>) => Promise<Quotation>;
  onCalculateTransport?: (weightKg: number, locationId: string, vehicleId?: string) => any;
  onUpdatePrice: (id: string, newPrice: number, reason: string, effectiveDate?: string) => Promise<void>;
  onUpdateProductData?: (id: string, productData: Partial<Product> & { reason?: string; effective_date?: string }) => Promise<void>;
  onProposePrice: (id: string, proposedPrice: number, reason: string) => Promise<void>;
  onApprovePrice: (id: string, approved: boolean) => Promise<void>;
  onAddProduct: (product: Partial<Product>) => Promise<void>;
  onDeleteProduct?: (id: string) => Promise<void>;
  onProceedToQuotation?: (item: QuotationItem) => void;
  onCreateBranchOverride: (override: Partial<BranchPriceOverride>) => Promise<void>;
  onDeleteBranchOverride: (id: string) => Promise<void>;
  onCreateCustomerOverride: (rule: Partial<CustomerPriceOverride>) => Promise<void>;
  onDeleteCustomerOverride: (id: string) => Promise<void>;
  onApproveDiscountRequest: (id: string, approved: boolean, notes?: string) => Promise<void>;
  onUpdateBranchMargin: (branchId: string, marginPct: number) => Promise<void>;
}

export const MasterPriceManagement: React.FC<MasterPriceManagementProps> = ({
  products,
  branches,
  branchPrices,
  customerPrices,
  discountRequests,
  priceHistory = [],
  activeBranch,
  locations = [],
  vehicles = [],
  rules,
  quotations = [],
  onCreateQuotation,
  onCalculateTransport,
  onUpdatePrice,
  onUpdateProductData,
  onProposePrice,
  onApprovePrice,
  onAddProduct,
  onDeleteProduct,
  onProceedToQuotation,
  onCreateBranchOverride,
  onDeleteBranchOverride,
  onCreateCustomerOverride,
  onDeleteCustomerOverride,
  onApproveDiscountRequest,
  onUpdateBranchMargin
}) => {
  // Navigation State
  const [activeSubTab, setActiveSubTab] = useState<'catalog' | 'table-matrix' | 'branch-overrides' | 'customer-rules' | 'margins' | 'approvals' | 'trend-predictions' | 'packed-works'>('catalog');
  
  // Packed Works Data State
  const [packedWorkPackages, setPackedWorkPackages] = useState<PackedWorkPackage[]>(DEFAULT_PACKED_WORKS);
  
  // 3-Page Level State for Master Price Catalog
  const [catalogLevel, setCatalogLevel] = useState<'landing' | 'subcategory' | 'variant'>('landing');
  const [selectedMainCat, setSelectedMainCat] = useState<MainCategoryConfig | null>(null);
  const [selectedSubCatName, setSelectedSubCatName] = useState<string | null>(null);

  // Dynamic Main & Sub Categories State
  const [mainCategories, setMainCategories] = useState<MainCategoryConfig[]>(INITIAL_MAIN_CATEGORIES);
  const categoriesList = useMemo(() => mainCategories.filter(c => (c.status || 'Active') === 'Active').map(c => c.name as CategoryType), [mainCategories]);

  // Load master categories from API/Settings and sync changes
  const loadMasterCategories = async () => {
    try {
      const fetched = await fetchCategories();
      if (fetched && fetched.length > 0) {
        const mapped: MainCategoryConfig[] = fetched.map((c) => {
          const normSubs: SubCategoryItem[] = (c.subcategories || []).map((s) =>
            typeof s === 'string' ? { id: s, name: s, status: 'Active' as const } : s
          );
          const activeSubs = normSubs.filter((s) => s.status !== 'Deactive').map((s) => s.name);
          const existing = INITIAL_MAIN_CATEGORIES.find(
            (ic) => ic.name.toLowerCase() === c.name.toLowerCase() || ic.id === c.id
          );
          return {
            id: c.id,
            name: c.name,
            description: c.description || existing?.description || 'Master product category',
            iconName: existing?.iconName || 'Layers',
            badgeColor: existing?.badgeColor || 'bg-slate-500/10 text-slate-600 border-slate-200',
            subCategories: activeSubs,
            status: c.status || 'Active'
          };
        });
        setMainCategories(mapped);
      }
    } catch (e) {
      console.warn('Could not fetch categories from API:', e);
    }
  };

  useEffect(() => {
    loadMasterCategories();
    const handleCategoriesChanged = () => {
      loadMasterCategories();
    };
    window.addEventListener('innovista_categories_changed', handleCategoriesChanged);
    return () => window.removeEventListener('innovista_categories_changed', handleCategoriesChanged);
  }, []);

  // Synchronize selected main category if updated in Settings
  useEffect(() => {
    if (selectedMainCat) {
      const updated = mainCategories.find(c => c.id === selectedMainCat.id || c.name.toLowerCase() === selectedMainCat.name.toLowerCase());
      if (updated) {
        setSelectedMainCat(updated);
      } else {
        setCatalogLevel('landing');
        setSelectedMainCat(null);
      }
    }
  }, [mainCategories]);

  // Search & Advanced Filtering
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('ALL');
  const [selectedSubCategoryFilter, setSelectedSubCategoryFilter] = useState<string>('ALL');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('ALL');
  const [minPriceFilter, setMinPriceFilter] = useState<string>('');
  const [maxPriceFilter, setMaxPriceFilter] = useState<string>('');
  const [selectedCustomerTier, setSelectedCustomerTier] = useState<CustomerType>('Retail Customer');
  const [productLayoutMode, setProductLayoutMode] = useState<'GRID' | 'LIST'>('GRID');

  // Sync search filter from global search bar
  useEffect(() => {
    const handleFilterProduct = (e: any) => {
      if (e.detail?.query) {
        setSearchTerm(e.detail.query);
        // Switch to variant/list view if catalog level is landing
        setCatalogLevel('variant');
      }
    };
    window.addEventListener('innovista_search_filter_product', handleFilterProduct);
    return () => window.removeEventListener('innovista_search_filter_product', handleFilterProduct);
  }, []);

  // Quick Status Toggle Handler
  const handleToggleProductStatus = async (product: Product, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const isCurrentlyActive = product.status === 'Active';
    const nextStatus = isCurrentlyActive ? 'Inactive' : 'Active';
    if (onUpdateProductData) {
      try {
        await onUpdateProductData(product.id, {
          status: nextStatus as any,
          reason: `Product status changed to ${nextStatus}`
        });
        setAddedToast(`Product ${product.product_code} marked as ${nextStatus}`);
        setTimeout(() => setAddedToast(null), 3000);
      } catch (err) {
        console.error('Failed to update product status', err);
      }
    }
  };

  // Modals state
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [lightboxProduct, setLightboxProduct] = useState<Product | null>(null);
  const [viewPosProduct, setViewPosProduct] = useState<Product | null>(null);
  const [barcodeProduct, setBarcodeProduct] = useState<Product | null>(null);
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);
  const [forecastModalProduct, setForecastModalProduct] = useState<Product | null>(null);
  const [addedToast, setAddedToast] = useState<string | null>(null);

  // Bulk Price Update State
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [showBulkUpdateModal, setShowBulkUpdateModal] = useState(false);
  const [bulkField, setBulkField] = useState<'base_price' | 'cost_price' | 'min_selling_price'>('base_price');
  const [bulkAdjustmentType, setBulkAdjustmentType] = useState<'PERCENTAGE' | 'FIXED'>('PERCENTAGE');
  const [bulkDirection, setBulkDirection] = useState<'INCREASE' | 'DECREASE'>('INCREASE');
  const [bulkValue, setBulkValue] = useState<string>('5.0');
  const [bulkEffectiveDate, setBulkEffectiveDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [bulkReason, setBulkReason] = useState<string>('Q3 Raw Material Index Revision (+5.0%)');
  const [isApplyingBulk, setIsApplyingBulk] = useState(false);

  const toggleSelectProduct = (id: string) => {
    setSelectedProductIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleSelectAllProducts = (listToSelect: Product[]) => {
    const allIds = listToSelect.map(p => p.id);
    const isAllSel = allIds.length > 0 && allIds.every(id => selectedProductIds.includes(id));
    if (isAllSel) {
      setSelectedProductIds(prev => prev.filter(id => !allIds.includes(id)));
    } else {
      setSelectedProductIds(prev => Array.from(new Set([...prev, ...allIds])));
    }
  };

  const calculateDelta = (currentVal: number, val: number, type: 'PERCENTAGE' | 'FIXED', dir: 'INCREASE' | 'DECREASE'): number => {
    if (isNaN(val) || val <= 0) return 0;
    let rawDelta = 0;
    if (type === 'PERCENTAGE') {
      rawDelta = currentVal * (val / 100);
    } else {
      rawDelta = val;
    }
    return dir === 'INCREASE' ? Math.round(rawDelta) : -Math.round(rawDelta);
  };

  const handleExecuteBulkUpdate = async () => {
    const valNum = parseFloat(bulkValue);
    if (isNaN(valNum) || valNum <= 0) return;
    setIsApplyingBulk(true);

    try {
      const selectedProds = products.filter(p => selectedProductIds.includes(p.id));
      for (const p of selectedProds) {
        const rawVal = p[bulkField];
        const currentVal = (rawVal !== undefined && rawVal !== null && !isNaN(Number(rawVal)))
          ? Number(rawVal) 
          : (p.base_price || p.current_price || 0);
          
        const delta = calculateDelta(currentVal, valNum, bulkAdjustmentType, bulkDirection);
        const nextVal = Math.max(0, currentVal + delta);

        if (bulkField === 'base_price') {
          await onUpdatePrice(p.id, nextVal, bulkReason, bulkEffectiveDate);
        } else if (onUpdateProductData) {
          await onUpdateProductData(p.id, {
            [bulkField]: nextVal,
            reason: bulkReason,
            effective_date: bulkEffectiveDate
          });
        }
      }

      setAddedToast(`Successfully applied bulk price adjustment across ${selectedProductIds.length} SKUs!`);
      setTimeout(() => setAddedToast(null), 4000);
      setSelectedProductIds([]);
      setShowBulkUpdateModal(false);
    } catch (err) {
      console.error('Bulk update error:', err);
    } finally {
      setIsApplyingBulk(false);
    }
  };

  const handleQuickAddToQuote = (p: Product) => {
    const itemPrice = p.current_price || p.base_price || 0;
    const item: QuotationItem = {
      id: `qi-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      product_id: p.id,
      product_code: p.product_code,
      product_name: p.product_name,
      unit: p.unit,
      unit_price: itemPrice,
      quantity: 1,
      weight_kg: p.unit_weight_kg || 1,
      total_price: itemPrice,
      price_source_label: 'Master Catalog Base'
    };

    if (onProceedToQuotation) {
      onProceedToQuotation(item);
    }
    setAddedToast(`Added "${p.product_code} - ${p.product_name}" to Quotation Draft!`);
    setTimeout(() => setAddedToast(null), 3500);
  };

  // Modal forms for Adding Category & Sub-Category
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatDesc, setNewCatDesc] = useState('');
  const [newCatIcon, setNewCatIcon] = useState('DoorOpen');

  const [showAddSubCatModal, setShowAddSubCatModal] = useState(false);
  const [newSubCatName, setNewSubCatName] = useState('');

  // Add Product Variant Modal
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [newProdCode, setNewProdCode] = useState('');
  const [newProdName, setNewProdName] = useState('');
  const [newProdCategory, setNewProdCategory] = useState<CategoryType>('Aluminium Fabrication');
  const [newProdSubCategory, setNewProdSubCategory] = useState<string>('');
  const [newProdUnit, setNewProdUnit] = useState<any>('m²');
  const [newProdPrice, setNewProdPrice] = useState('');
  const [newProdCostPrice, setNewProdCostPrice] = useState('');
  const [newProdMinPrice, setNewProdMinPrice] = useState('');
  const [newProdWeight, setNewProdWeight] = useState('');
  const [newProdDesc, setNewProdDesc] = useState('');

  // Branch & Customer Rule Modals
  const [showOverrideModal, setShowOverrideModal] = useState(false);
  const [overrideProductId, setOverrideProductId] = useState<string>('');
  const [overrideBranchId, setOverrideBranchId] = useState<string>('b-kdy');
  const [overridePrice, setOverridePrice] = useState<string>('');
  const [overrideEffectiveFrom, setOverrideEffectiveFrom] = useState<string>(new Date().toISOString().split('T')[0]);
  const [overrideNotes, setOverrideNotes] = useState<string>('');

  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [custCustomerName, setCustCustomerName] = useState<string>('');
  const [custProductId, setCustProductId] = useState<string>('');
  const [custSpecialPrice, setCustSpecialPrice] = useState<string>('');
  const [custEffectiveFrom, setCustEffectiveFrom] = useState<string>(new Date().toISOString().split('T')[0]);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const isHO = activeBranch.code === 'HO';

  // Helper function to resolve subcategory for any product
  const getSubCategoryForProduct = (p: Product): string => {
    if (p.sub_category) return p.sub_category;
    const name = p.product_name.toLowerCase();
    const cat = p.category;

    if (cat === 'Aluminium Fabrication' || cat === ('Doors' as any)) {
      if (name.includes('100mm')) return '100mm Series Doors';
      if (name.includes('80mm')) return '80mm Series Doors';
      if (name.includes('single')) return 'Single Sash Doors';
      if (name.includes('double')) return 'Double Sash Doors';
      if (name.includes('sliding')) return 'Sliding Doors';
      if (name.includes('casement')) return 'Casement Windows';
      if (name.includes('window')) return 'Sliding Windows';
      return 'Single Sash Doors';
    }
    if (cat === 'Aluminium Profiles') {
      if (name.includes('powder')) return 'Powder Coated Profiles';
      if (name.includes('anodized')) return 'Anodized Silver Profiles';
      if (name.includes('bronze')) return 'Bronze & Dark Grey Profiles';
      if (name.includes('wood')) return 'Wood Finish Grain Profiles';
      return 'Powder Coated Profiles';
    }
    if (cat === 'Glass') {
      if (name.includes('toughened') || name.includes('tempered')) return 'Toughened Safety Glass';
      if (name.includes('laminated')) return 'Laminated Glass';
      return 'Toughened Safety Glass';
    }
    if (cat === 'ACP Sheets') return 'Exterior PVDF Cladding Sheets';
    if (cat === 'Steel Sections') return 'Square Hollow Box Bar';
    if (cat === 'Hardware & Accessories') return 'Door Locks & Handles';
    if (cat === 'Interior Design') return 'Living Room Fit-outs';
    if (cat === 'Civil Works') return 'Masonry & Brickwork';
    if (cat === 'Labour & Installation') return 'Fabrication Labour';
    return 'General Sub-Category';
  };

  // Helper to map icon string to icon component
  const renderCategoryIcon = (iconName: string, className = "w-6 h-6") => {
    switch (iconName) {
      case 'DoorOpen': return <DoorOpen className={className} />;
      case 'LayoutGrid': return <LayoutGrid className={className} />;
      case 'Layers': return <Layers className={className} />;
      case 'Grid': return <Grid className={className} />;
      case 'Shield': return <Shield className={className} />;
      case 'Square': return <Square className={className} />;
      case 'Box': return <Box className={className} />;
      case 'Wrench': return <Wrench className={className} />;
      case 'Sparkles': return <Sparkles className={className} />;
      case 'Building2': return <Building2 className={className} />;
      case 'Users': return <Users className={className} />;
      case 'FileText': return <FileText className={className} />;
      default: return <Store className={className} />;
    }
  };

  const CATEGORY_DEFAULT_IMAGES: Record<string, string> = {
    'Doors': '',
    'Windows': '',
    'Aluminium Profiles': '',
    'Aluminium Fabrication': '',
    'Glass': '',
    'ACP Sheets': '',
    'Steel Sections': '',
    'Hardware & Accessories': '',
    'Interior Design': '',
    'Civil Works': '',
    'Labour & Installation': '',
    'Services': ''
  };

  const getProductImageUrl = (p: Product): string => {
    if (p.image_url) return p.image_url;
    const cat = p.category || 'Aluminium Profiles';
    return CATEGORY_DEFAULT_IMAGES[cat] || CATEGORY_DEFAULT_IMAGES['Aluminium Profiles'];
  };

  const handleUpdateProductImage = async (productId: string, newImageUrl: string) => {
    if (onUpdateProductData) {
      await onUpdateProductData(productId, { image_url: newImageUrl, reason: 'Updated product photo' });
    }
    if (lightboxProduct && lightboxProduct.id === productId) {
      setLightboxProduct(prev => prev ? { ...prev, image_url: newImageUrl } : null);
    }
  };

  // Helper to match product to main category
  const isProductInMainCategory = (p: Product, cat: MainCategoryConfig): boolean => {
    const cName = cat.name.toLowerCase();
    const pCat = p.category.toLowerCase();
    const pName = p.product_name.toLowerCase();

    if (cName === 'doors') {
      return pCat === 'doors' || pCat === 'aluminium fabrication' && (pName.includes('door') || pName.includes('sash') || pName.includes('100mm') || pName.includes('sliding'));
    }
    if (cName === 'windows') {
      return pCat === 'windows' || pCat === 'aluminium fabrication' && (pName.includes('window') || pName.includes('casement') || pName.includes('louver'));
    }
    if (cName === 'ceiling systems' || cName === 'ceiling') {
      return pCat.includes('ceiling') || pName.includes('ceiling');
    }
    if (cName === 'aluminium profiles') return pCat.includes('profile');
    if (cName === 'glass & glazing') return pCat.includes('glass');
    if (cName === 'acp sheets') return pCat.includes('acp');
    if (cName === 'steel sections') return pCat.includes('steel');
    if (cName === 'hardware & accessories') return pCat.includes('hardware');
    if (cName === 'interior design') return pCat.includes('interior');
    if (cName === 'civil works') return pCat.includes('civil');
    if (cName === 'labour & installation') return pCat.includes('labour');
    if (cName === 'services') return pCat.includes('service');

    return pCat === cName;
  };

  // Filtered products for selected Subcategory / Variant Page with real-time category & price filtering
  const variantProducts = useMemo(() => {
    return products.filter((p) => {
      const q = searchTerm.toLowerCase();
      const matchesSearch = 
        p.product_code.toLowerCase().includes(q) ||
        p.product_name.toLowerCase().includes(q) ||
        (p.description && p.description.toLowerCase().includes(q));

      if (!matchesSearch) return false;

      // Category filter
      if (selectedCategoryFilter !== 'ALL') {
        const catObj = mainCategories.find(c => c.name === selectedCategoryFilter);
        if (catObj) {
          if (!isProductInMainCategory(p, catObj)) return false;
        } else if (p.category !== selectedCategoryFilter) {
          return false;
        }
      }

      // Sub-category filter
      if (selectedSubCategoryFilter !== 'ALL') {
        const sub = getSubCategoryForProduct(p);
        if (sub.toLowerCase() !== selectedSubCategoryFilter.toLowerCase()) return false;
      }

      // Status filter
      if (selectedStatusFilter !== 'ALL') {
        if (selectedStatusFilter === 'Active' && p.status !== 'Active') return false;
        if (selectedStatusFilter === 'Inactive' && p.status !== 'Inactive' && (p.status as string) !== 'Deactive') return false;
        if (selectedStatusFilter === 'Pending' && p.status !== 'Pending Approval') return false;
      }

      // Price range filter
      const pPrice = p.current_price || p.base_price || 0;
      if (minPriceFilter !== '' && !isNaN(Number(minPriceFilter))) {
        if (pPrice < Number(minPriceFilter)) return false;
      }
      if (maxPriceFilter !== '' && !isNaN(Number(maxPriceFilter))) {
        if (pPrice > Number(maxPriceFilter)) return false;
      }

      if (catalogLevel === 'landing') return true;

      if (selectedMainCat) {
        const inMain = isProductInMainCategory(p, selectedMainCat);
        if (!inMain) return false;
      }

      if (catalogLevel === 'variant' && selectedSubCatName) {
        const sub = getSubCategoryForProduct(p);
        return sub.toLowerCase() === selectedSubCatName.toLowerCase();
      }

      return true;
    });
  }, [
    products, 
    searchTerm, 
    selectedCategoryFilter, 
    selectedSubCategoryFilter, 
    selectedStatusFilter,
    minPriceFilter, 
    maxPriceFilter, 
    catalogLevel, 
    selectedMainCat, 
    selectedSubCatName,
    mainCategories
  ]);

  const activeSubCategoryVariants = useMemo(() => {
    if (catalogLevel !== 'variant' || !selectedSubCatName) return [];
    return variantProducts;
  }, [catalogLevel, selectedSubCatName, variantProducts]);

  // Export Master Product Catalog & Prices to CSV Report
  const handleExportProductsCSV = () => {
    const itemsToExport = variantProducts.length > 0 ? variantProducts : products;
    if (!itemsToExport || itemsToExport.length === 0) {
      alert('No product pricing items available to export.');
      return;
    }

    const headers = [
      'Product ID',
      'Item Code',
      'Product Name',
      'Category',
      'Sub Category',
      'Base Price (LKR)',
      'Pricing Unit',
      'Min Order Qty',
      'Status',
      'Thickness (mm)',
      'Finish',
      'Glass Type',
      'Stock Qty',
      'Weight (kg/m)'
    ];

    const csvRows = [
      headers.join(','),
      ...itemsToExport.map(p => {
        const subCat = getSubCategoryForProduct(p) || p.sub_category || '';
        const row = [
          `"${(p.id || '').replace(/"/g, '""')}"`,
          `"${(p.product_code || '').replace(/"/g, '""')}"`,
          `"${(p.product_name || '').replace(/"/g, '""')}"`,
          `"${(p.category || '').replace(/"/g, '""')}"`,
          `"${subCat.replace(/"/g, '""')}"`,
          p.base_price || p.current_price || 0,
          `"${(p.pricing_unit || 'm2').replace(/"/g, '""')}"`,
          p.min_order_quantity || 1,
          `"${(p.status || 'Active').replace(/"/g, '""')}"`,
          `"${(p.thickness || '').replace(/"/g, '""')}"`,
          `"${(p.finish || '').replace(/"/g, '""')}"`,
          `"${(p.glass_type || '').replace(/"/g, '""')}"`,
          p.stock_quantity || 0,
          p.unit_weight_kg || 0
        ];
        return row.join(',');
      })
    ];

    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Master_Products_Price_Catalog_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Handle New Category Creation
  const handleCreateCategorySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;

    const newCatObj: MainCategoryConfig = {
      id: `cat-${Date.now()}`,
      name: newCatName.trim(),
      description: newCatDesc.trim() || 'Custom master product category',
      iconName: newCatIcon,
      badgeColor: 'bg-blue-500/10 text-blue-600 border-blue-200',
      subCategories: ['General Sub-Category']
    };

    setMainCategories((prev) => [...prev, newCatObj]);
    setNewCatName('');
    setNewCatDesc('');
    setShowAddCategoryModal(false);
  };

  // Handle New Sub-Category Creation
  const handleCreateSubCategorySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubCatName.trim() || !selectedMainCat) return;

    setMainCategories((prev) => 
      prev.map((c) => {
        if (c.id === selectedMainCat.id) {
          return {
            ...c,
            subCategories: Array.from(new Set([...c.subCategories, newSubCatName.trim()]))
          };
        }
        return c;
      })
    );

    setSelectedMainCat((prev) => prev ? {
      ...prev,
      subCategories: Array.from(new Set([...prev.subCategories, newSubCatName.trim()]))
    } : null);

    setNewSubCatName('');
    setShowAddSubCatModal(false);
  };

  // Handle Add Product Variant Submission
  const handleCreateProductVariantSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProdCode.trim() || !newProdName.trim() || !newProdPrice) return;

    setIsSubmitting(true);
    try {
      const priceVal = parseFloat(newProdPrice) || 0;
      const costVal = parseFloat(newProdCostPrice) || Math.round(priceVal * 0.8);
      const minVal = parseFloat(newProdMinPrice) || Math.round(priceVal * 0.9);

      const newProd: Partial<Product> = {
        product_code: newProdCode.trim().toUpperCase(),
        product_name: newProdName.trim(),
        category: (selectedMainCat?.name as any) || newProdCategory,
        sub_category: selectedSubCatName || newProdSubCategory || 'General Sub-Category',
        unit: newProdUnit,
        current_price: priceVal,
        base_price: priceVal,
        cost_price: costVal,
        min_selling_price: minVal,
        unit_weight_kg: parseFloat(newProdWeight) || 5.0,
        status: 'Active',
        effective_date: new Date().toISOString().split('T')[0],
        description: newProdDesc.trim() || `${selectedSubCatName || 'Custom'} Master Product Variant`
      };

      await onAddProduct(newProd);

      setNewProdCode('');
      setNewProdName('');
      setNewProdPrice('');
      setNewProdCostPrice('');
      setNewProdMinPrice('');
      setNewProdWeight('');
      setNewProdDesc('');
      setShowAddProductModal(false);
    } catch (e) {
      console.error('Add product variant error:', e);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* TOP HEADER & NAVIGATION MODES BAR */}
      {/* --- TOP BANNER CARD - LIGHT THEME STYLE --- */}
      <div className="bg-white text-[#0F203C] p-3.5 sm:p-4 rounded-lg shadow-xs border border-slate-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 relative overflow-hidden">
        <div className="space-y-0.5 relative z-10">
          <div className="flex flex-wrap items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-[#E87F24] text-white flex items-center justify-center shadow-xs">
              <Store className="w-4 h-4" />
            </div>
            <h2 className="text-sm font-bold tracking-tight text-[#0F203C] uppercase">
              Master Price Catalog & Pricing Engine
            </h2>
            <span className="bg-[#FEFDDF] text-[#0F203C] border border-[#FFC81E] text-[10px] px-2 py-0.5 rounded font-bold uppercase">
              Node: {activeBranch.name}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 font-medium">
            3-Tier Interactive Category Navigation | Dynamic Variant Pricing | Multi-Branch Override Matrix
          </p>
        </div>

        {/* View Mode Sub-Tab Switches */}
        <div className="flex flex-wrap items-center gap-1.5 relative z-10">
          <button
            onClick={() => { setActiveSubTab('catalog'); setCatalogLevel('landing'); }}
            className={`px-3 py-1.5 rounded-md text-xs font-bold transition flex items-center space-x-1.5 ${
              activeSubTab === 'catalog'
                ? 'bg-[#E87F24] text-white shadow-xs'
                : 'bg-slate-100 hover:bg-slate-200 text-[#0F203C] border border-slate-200'
            }`}
          >
            <LayoutGrid className={`w-3.5 h-3.5 ${activeSubTab === 'catalog' ? 'text-white' : 'text-[#73A5CA]'}`} />
            <span>3-Tier Catalog</span>
          </button>

          <button
            onClick={() => setActiveSubTab('table-matrix')}
            className={`px-3 py-1.5 rounded-md text-xs font-bold transition flex items-center space-x-1.5 ${
              activeSubTab === 'table-matrix'
                ? 'bg-orange-500 text-white shadow-xs'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
            }`}
          >
            <Sliders className={`w-3.5 h-3.5 ${activeSubTab === 'table-matrix' ? 'text-white' : 'text-slate-500'}`} />
            <span>Price Matrix Table</span>
          </button>

          <button
            onClick={() => setActiveSubTab('branch-overrides')}
            className={`px-3 py-1.5 rounded-md text-xs font-bold transition flex items-center space-x-1.5 ${
              activeSubTab === 'branch-overrides'
                ? 'bg-orange-500 text-white shadow-xs'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
            }`}
          >
            <MapPin className={`w-3.5 h-3.5 ${activeSubTab === 'branch-overrides' ? 'text-white' : 'text-slate-500'}`} />
            <span>Branch Overrides ({branchPrices.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('packed-works')}
            className={`px-3 py-1.5 rounded-md text-xs font-bold transition flex items-center space-x-1.5 ${
              activeSubTab === 'packed-works'
                ? 'bg-purple-700 text-white shadow-xs'
                : 'bg-purple-50 hover:bg-purple-100 text-purple-900 border border-purple-200'
            }`}
          >
            <PackageCheck className={`w-3.5 h-3.5 ${activeSubTab === 'packed-works' ? 'text-white' : 'text-purple-600'}`} />
            <span>Packed Works & Bundles</span>
            <span className="bg-purple-200 text-purple-950 text-[10px] px-1.5 py-0.2 rounded-full font-black">
              {packedWorkPackages.length}
            </span>
          </button>

          {isHO && (
            <button
              onClick={() => setActiveSubTab('approvals')}
              className={`px-3 py-1.5 rounded-md text-xs font-bold transition flex items-center space-x-1.5 relative ${
                activeSubTab === 'approvals'
                  ? 'bg-orange-500 text-white shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
              }`}
            >
              <ShieldAlert className={`w-3.5 h-3.5 ${activeSubTab === 'approvals' ? 'text-white' : 'text-rose-500'}`} />
              <span>Approvals</span>
              {discountRequests.filter(d => d.status === 'Pending').length > 0 && (
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping absolute top-1 right-1" />
              )}
            </button>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODE 1: 3-PAGE MASTER PRICE CATALOG SYSTEM */}
      {/* ========================================================================= */}
      {activeSubTab === 'catalog' && (
        <div className="w-full space-y-4">
          
          {/* BREADCRUMB NAVIGATION & LEVEL CONTROL BAR */}
          <div className="bg-white border border-slate-200 rounded-lg p-3 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center space-x-2 text-xs font-bold text-slate-700 flex-wrap">
              
              {/* Level 1 Breadcrumb */}
              <button
                onClick={() => {
                  setCatalogLevel('landing');
                  setSelectedMainCat(null);
                  setSelectedSubCatName(null);
                }}
                className={`px-2.5 py-1 rounded-md transition flex items-center space-x-1 ${
                  catalogLevel === 'landing'
                    ? 'bg-orange-500 text-white font-extrabold shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <Store className="w-3.5 h-3.5" />
                <span>All Main Categories</span>
              </button>

              {/* Level 2 Breadcrumb */}
              {selectedMainCat && (
                <>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                  <button
                    onClick={() => {
                      setCatalogLevel('subcategory');
                      setSelectedSubCatName(null);
                    }}
                    className={`px-2.5 py-1 rounded-md transition flex items-center space-x-1 ${
                      catalogLevel === 'subcategory'
                        ? 'bg-orange-500 text-white font-extrabold shadow-xs'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {renderCategoryIcon(selectedMainCat.iconName, "w-3.5 h-3.5")}
                    <span>{selectedMainCat.name}</span>
                  </button>
                </>
              )}

              {/* Level 3 Breadcrumb */}
              {selectedSubCatName && (
                <>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                  <span className="bg-slate-900 text-white px-2.5 py-1 rounded-md font-extrabold shadow-xs">
                    {selectedSubCatName}
                  </span>
                </>
              )}
            </div>

            {/* Action Buttons depending on catalog level */}
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={handleExportProductsCSV}
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-md text-xs font-bold transition inline-flex items-center space-x-1 shadow-xs cursor-pointer"
                title="Export Product Price List to CSV Spreadsheet"
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span>Export to CSV</span>
              </button>

              {catalogLevel === 'landing' && isHO && (
                <button
                  onClick={() => setShowAddCategoryModal(true)}
                  className="bg-orange-500 hover:bg-orange-600 text-white px-3 py-1.5 rounded-md text-xs font-bold transition inline-flex items-center space-x-1 shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Main Category</span>
                </button>
              )}

              {catalogLevel === 'subcategory' && isHO && (
                <button
                  onClick={() => setShowAddSubCatModal(true)}
                  className="bg-orange-500 hover:bg-orange-600 text-white px-3 py-1.5 rounded-md text-xs font-bold transition inline-flex items-center space-x-1 shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Sub-Category</span>
                </button>
              )}

              {catalogLevel === 'variant' && isHO && (
                <button
                  onClick={() => {
                    setNewProdSubCategory(selectedSubCatName || '');
                    setShowAddProductModal(true);
                  }}
                  className="bg-orange-500 hover:bg-orange-600 text-white px-3 py-1.5 rounded-md text-xs font-bold transition inline-flex items-center space-x-1 shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Variant Product</span>
                </button>
              )}
            </div>
          </div>

          {/* SEARCH & ADVANCED FILTER BAR */}
          <div className="bg-white border border-slate-200 rounded-lg p-3 shadow-xs space-y-3">
            <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
              {/* Search Bar */}
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Real-time search catalog by product code, description, name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-md text-xs text-slate-800 focus:outline-none focus:border-orange-500 focus:bg-white focus:ring-1 focus:ring-orange-500 transition"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Controls right */}
              <div className="flex items-center space-x-2 text-xs shrink-0">
                <span className="font-bold text-slate-600 hidden sm:inline">Pricing Tier:</span>
                <select
                  value={selectedCustomerTier}
                  onChange={(e) => setSelectedCustomerTier(e.target.value as CustomerType)}
                  className="bg-slate-50 border border-slate-200 rounded-md px-2.5 py-1.5 text-xs font-bold text-slate-800 focus:outline-none focus:border-orange-500"
                >
                  <option value="Retail Customer">Retail Customer</option>
                  <option value="Contractor">Contractor / Builder</option>
                  <option value="Dealer">Dealer / Wholesale</option>
                  <option value="Developer">Property Developer</option>
                  <option value="Architect">Architect / Designer</option>
                </select>

                {/* View Mode Toggle (Grid vs List) */}
                <div className="flex items-center border border-slate-200 rounded-md overflow-hidden p-0.5 bg-slate-100">
                  <button
                    type="button"
                    onClick={() => setProductLayoutMode('GRID')}
                    className={`p-1 rounded text-xs font-bold transition flex items-center space-x-1 ${
                      productLayoutMode === 'GRID' 
                        ? 'bg-white text-orange-600 shadow-2xs' 
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                    title="Grid View"
                  >
                    <Grid className="w-3.5 h-3.5" />
                    <span className="hidden md:inline text-[11px]">Grid</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setProductLayoutMode('LIST')}
                    className={`p-1 rounded text-xs font-bold transition flex items-center space-x-1 ${
                      productLayoutMode === 'LIST' 
                        ? 'bg-white text-orange-600 shadow-2xs' 
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                    title="List View"
                  >
                    <List className="w-3.5 h-3.5" />
                    <span className="hidden md:inline text-[11px]">List</span>
                  </button>
                </div>

                {/* Quick Export Button */}
                <button
                  type="button"
                  onClick={handleExportProductsCSV}
                  className="bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 px-2.5 py-1.5 rounded-md text-xs font-bold transition flex items-center space-x-1 shrink-0 cursor-pointer"
                  title="Quick Export Product Catalog CSV"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="hidden sm:inline">CSV Export</span>
                </button>
              </div>
            </div>

            {/* ADVANCED FILTERING CONTROLS (Category, Sub-Category, Status, Price Range) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5 pt-2.5 border-t border-slate-100 text-xs">
              {/* Category Select */}
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                  Filter Category
                </label>
                <select
                  value={selectedCategoryFilter}
                  onChange={(e) => {
                    setSelectedCategoryFilter(e.target.value);
                    setSelectedSubCategoryFilter('ALL');
                  }}
                  className="w-full bg-slate-50 border border-slate-200 rounded-md px-2.5 py-1.5 text-xs font-semibold text-slate-800 focus:outline-none focus:border-orange-500"
                >
                  <option value="ALL">All Categories ({mainCategories.length})</option>
                  {mainCategories.map((c) => (
                    <option key={c.id} value={c.name}>{c.name}</option>
                  ))}
                </select>
              </div>

              {/* Sub-Category Select */}
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                  Filter Sub-Category
                </label>
                <select
                  value={selectedSubCategoryFilter}
                  onChange={(e) => setSelectedSubCategoryFilter(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-md px-2.5 py-1.5 text-xs font-semibold text-slate-800 focus:outline-none focus:border-orange-500"
                >
                  <option value="ALL">All Sub-Categories</option>
                  {Array.from(new Set(
                    (selectedCategoryFilter !== 'ALL'
                      ? mainCategories.find(c => c.name === selectedCategoryFilter)?.subCategories || []
                      : mainCategories.flatMap(c => c.subCategories)
                    )
                  )).map((sub, i) => (
                    <option key={i} value={sub}>{sub}</option>
                  ))}
                </select>
              </div>

              {/* Status Select */}
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                  Product Status
                </label>
                <select
                  value={selectedStatusFilter}
                  onChange={(e) => setSelectedStatusFilter(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-md px-2.5 py-1.5 text-xs font-semibold text-slate-800 focus:outline-none focus:border-orange-500"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="Active">🟢 Active Only</option>
                  <option value="Inactive">🔴 Inactive / Deactive</option>
                  <option value="Pending">🟡 Pending Approval</option>
                </select>
              </div>

              {/* Price Range Filter */}
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                  Price Range (LKR)
                </label>
                <div className="flex items-center space-x-1">
                  <input
                    type="number"
                    placeholder="Min Rs."
                    value={minPriceFilter}
                    onChange={(e) => setMinPriceFilter(e.target.value)}
                    className="w-1/2 bg-slate-50 border border-slate-200 rounded-md px-2 py-1.5 text-xs font-mono font-bold text-slate-800 focus:outline-none focus:border-orange-500"
                  />
                  <span className="text-slate-400 font-bold">-</span>
                  <input
                    type="number"
                    placeholder="Max Rs."
                    value={maxPriceFilter}
                    onChange={(e) => setMaxPriceFilter(e.target.value)}
                    className="w-1/2 bg-slate-50 border border-slate-200 rounded-md px-2 py-1.5 text-xs font-mono font-bold text-slate-800 focus:outline-none focus:border-orange-500"
                  />
                </div>
              </div>

              {/* Filter Reset & Results Summary */}
              <div className="flex items-end justify-between gap-2">
                <div className="text-[11px] font-bold text-slate-600 pb-1.5">
                  Matches: <span className="text-orange-600 font-extrabold font-mono text-xs">{variantProducts.length}</span> / {products.length} Items
                </div>

                {(searchTerm || selectedCategoryFilter !== 'ALL' || selectedSubCategoryFilter !== 'ALL' || selectedStatusFilter !== 'ALL' || minPriceFilter || maxPriceFilter) && (
                  <button
                    onClick={() => {
                      setSearchTerm('');
                      setSelectedCategoryFilter('ALL');
                      setSelectedSubCategoryFilter('ALL');
                      setSelectedStatusFilter('ALL');
                      setMinPriceFilter('');
                      setMaxPriceFilter('');
                    }}
                    className="bg-orange-50 hover:bg-orange-100 text-orange-700 border border-orange-200 px-2.5 py-1.5 rounded-md text-xs font-bold transition flex items-center space-x-1 shrink-0 mb-0.5"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>Clear Filters</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* PAGE LEVEL 1: LANDING PAGE - MAIN CATEGORIES GRID */}
          {catalogLevel === 'landing' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center space-x-1.5">
                  <Store className="w-4 h-4 text-orange-500" />
                  <span>Main Catalog Categories ({mainCategories.length})</span>
                </h3>
                <span className="text-[11px] text-slate-500 font-medium">
                  Click a category to view sub-categories
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2.5">
                {mainCategories.map((cat) => {
                  const matchingProds = products.filter((p) => isProductInMainCategory(p, cat));
                  const subCount = cat.subCategories.length;
                  const varCount = matchingProds.length;

                  return (
                    <div
                      key={cat.id}
                      onClick={() => {
                        setSelectedMainCat(cat);
                        setCatalogLevel('subcategory');
                      }}
                      className="bg-white border border-slate-200 hover:border-orange-500 rounded-lg p-4 shadow-xs hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between space-y-3 relative overflow-hidden"
                    >
                      <div className="space-y-2.5">
                        <div className="flex items-center justify-between">
                          <div className="w-10 h-10 rounded-md bg-orange-50 text-orange-600 border border-orange-200 flex items-center justify-center group-hover:scale-105 transition-transform">
                            {renderCategoryIcon(cat.iconName, "w-5 h-5")}
                          </div>
                          <span className="text-[10px] uppercase font-mono font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200">
                            {subCount} Sub-Cats
                          </span>
                        </div>

                        <div>
                          <h4 className="text-sm font-bold text-slate-900 group-hover:text-orange-600 transition">
                            {cat.name}
                          </h4>
                          <p className="text-xs text-slate-500 mt-0.5 line-clamp-2 leading-tight">
                            {cat.description}
                          </p>
                        </div>
                      </div>

                      <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-700">
                          {varCount} Variants
                        </span>
                        <span className="text-orange-600 font-extrabold group-hover:translate-x-1 transition flex items-center space-x-1">
                          <span>Browse</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* PAGE LEVEL 2: SUB-CATEGORY PAGE */}
          {catalogLevel === 'subcategory' && selectedMainCat && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setCatalogLevel('landing')}
                    className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md transition"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      {selectedMainCat.name} Sub-Categories
                    </h3>
                    <p className="text-xs text-slate-500">
                      Select a sub-category to view specific product variants & prices
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2.5">
                {selectedMainCat.subCategories.map((subName, idx) => {
                  const subProds = products.filter(
                    (p) => isProductInMainCategory(p, selectedMainCat) && getSubCategoryForProduct(p).toLowerCase() === subName.toLowerCase()
                  );
                  const varCount = subProds.length;

                  return (
                    <div
                      key={idx}
                      onClick={() => {
                        setSelectedSubCatName(subName);
                        setCatalogLevel('variant');
                      }}
                      className="bg-white border border-slate-200 hover:border-orange-500 rounded-lg p-4 shadow-xs hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between space-y-3"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="bg-orange-50 text-orange-600 border border-orange-200 text-[10px] font-bold px-2 py-0.5 rounded uppercase">
                            Sub-Category #{idx + 1}
                          </span>
                          <span className="text-[11px] font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                            {varCount} Variants
                          </span>
                        </div>

                        <h4 className="text-sm font-bold text-slate-900 group-hover:text-orange-600 transition">
                          {subName}
                        </h4>

                        <p className="text-xs text-slate-500 line-clamp-2">
                          Engineered specifications for {subName} with full custom thickness & finish surcharge support.
                        </p>
                      </div>

                      <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs">
                        <span className="text-slate-500 font-medium">Instant POS Pricing</span>
                        <span className="text-orange-600 font-bold group-hover:translate-x-1 transition flex items-center space-x-1">
                          <span>View Variants</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* PAGE LEVEL 3: VARIANT PAGE - POS ITEM CARDS */}
          {catalogLevel === 'variant' && selectedSubCatName && (
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-white border border-slate-200 rounded-lg p-2.5">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setCatalogLevel('subcategory')}
                    className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md transition"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      {selectedSubCatName} Variants ({activeSubCategoryVariants.length})
                    </h3>
                    <p className="text-xs text-slate-500">
                      Select items below to run bulk price adjustments or click any card for details
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleSelectAllProducts(activeSubCategoryVariants)}
                    className="px-2.5 py-1.5 bg-[#FEFDDF] hover:bg-[#FFC81E]/30 text-[#0F203C] border border-[#FFC81E]/60 rounded-md font-bold text-xs transition flex items-center space-x-1"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#E87F24]" />
                    <span>
                      {activeSubCategoryVariants.length > 0 && activeSubCategoryVariants.every(p => selectedProductIds.includes(p.id)) 
                        ? 'Deselect All' 
                        : 'Select All Variants'}
                    </span>
                  </button>

                  {selectedProductIds.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setShowBulkUpdateModal(true)}
                      className="bg-[#E87F24] hover:bg-[#D26E1A] text-white px-3 py-1.5 rounded-md text-xs font-black transition shadow-2xs flex items-center space-x-1.5"
                    >
                      <Zap className="w-3.5 h-3.5 text-[#FFC81E]" />
                      <span>Bulk Adjust ({selectedProductIds.length})</span>
                    </button>
                  )}

                  {isHO && (
                    <button
                      onClick={() => setShowAddProductModal(true)}
                      className="bg-orange-500 hover:bg-orange-600 text-white px-3 py-1.5 rounded-md text-xs font-bold transition inline-flex items-center space-x-1 shadow-xs"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>+ Add Variant</span>
                    </button>
                  )}
                </div>
              </div>

              {activeSubCategoryVariants.length === 0 ? (
                <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center space-y-3 shadow-xs">
                  <div className="w-12 h-12 rounded-full bg-orange-50 text-orange-500 border border-orange-200 mx-auto flex items-center justify-center">
                    <Package className="w-6 h-6" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-800">No Variant Products Registered Yet</h4>
                  <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                    There are currently 0 variant products registered under <strong className="text-slate-800">"{selectedSubCatName}"</strong>. Click below to add the first variant product with master pricing and technical specifications.
                  </p>
                  {isHO && (
                    <button
                      onClick={() => {
                        setNewProdSubCategory(selectedSubCatName || '');
                        setShowAddProductModal(true);
                      }}
                      className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-xl text-xs font-bold transition inline-flex items-center space-x-1.5 shadow-xs"
                    >
                      <Plus className="w-4 h-4" />
                      <span>+ Add First Variant Product</span>
                    </button>
                  )}
                </div>
              ) : productLayoutMode === 'GRID' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2.5">
                  {activeSubCategoryVariants.map((p) => {
                    const basePrice = p.base_price || p.current_price || 0;
                    const tierCalc = resolveProductVariantPrice(p, { customer_type: selectedCustomerTier, quantity: 1 });
                    const isSelected = selectedProductIds.includes(p.id);

                    return (
                      <div
                        key={p.id}
                        className={`bg-white border rounded-lg overflow-hidden shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between relative group ${
                          isSelected ? 'border-[#E87F24] ring-2 ring-[#E87F24]/30 bg-[#FEFDDF]/10' : 'border-slate-200 hover:border-orange-500'
                        }`}
                      >
                        {/* 1. PRODUCT HEADER CONTAINER WITH BADGES */}
                        <div className="relative h-16 w-full bg-slate-900 overflow-hidden group/img">
                          {/* Top Badges with Checkbox Multi-Selector */}
                          <div className="absolute top-1.5 left-1.5 right-1.5 flex items-center justify-between pointer-events-auto">
                            <div
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleSelectProduct(p.id);
                              }}
                              className={`flex items-center space-x-1.5 backdrop-blur-md px-2 py-0.5 rounded shadow-xs border transition-all cursor-pointer select-none ${
                                isSelected
                                  ? 'bg-[#E87F24] border-white text-white ring-2 ring-[#FFC81E]'
                                  : 'bg-slate-900/90 border-white/20 hover:border-[#FFC81E] text-white'
                              }`}
                              title="Click to select/deselect SKU for bulk operations"
                            >
                              <input
                                type="checkbox"
                                checked={isSelected}
                                readOnly
                                className="w-3.5 h-3.5 rounded text-[#E87F24] accent-[#E87F24] focus:ring-[#E87F24] cursor-pointer pointer-events-none"
                              />
                              <span className="text-[10px] font-mono font-black">
                                {p.product_code}
                              </span>
                            </div>

                             <button
                              type="button"
                              onClick={(e) => handleToggleProductStatus(p, e)}
                              className={`text-[8px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider backdrop-blur-md shadow-xs border transition cursor-pointer flex items-center space-x-1 ${
                                p.status === 'Active'
                                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-400/40'
                                  : p.status === 'Inactive' || (p.status as string) === 'Deactive'
                                  ? 'bg-rose-600 hover:bg-rose-700 text-white border-rose-400/40'
                                  : 'bg-amber-600 hover:bg-amber-700 text-white border-amber-400/40'
                              }`}
                              title="Click to toggle Product Status (Active / Inactive)"
                            >
                              <span className={`w-1.5 h-1.5 rounded-full ${p.status === 'Active' ? 'bg-emerald-300 animate-pulse' : 'bg-rose-300'}`} />
                              <span>{p.status || 'Active'}</span>
                            </button>
                          </div>

                          {/* Deactivated Visual Overlay Banner */}
                          {(p.status === 'Inactive' || (p.status as string) === 'Deactive') && (
                            <div className="absolute inset-0 bg-slate-950/50 backdrop-blur-[1px] flex items-center justify-center pointer-events-none z-10">
                              <span className="bg-rose-600 text-white font-black text-[9px] uppercase tracking-widest px-2.5 py-0.5 rounded-full shadow-md border border-white/30 flex items-center space-x-1">
                                <Power className="w-3 h-3 text-white" />
                                <span>INACTIVE</span>
                              </span>
                            </div>
                          )}

                          {/* Sub-category / Series pill */}
                          <div className="absolute bottom-1.5 left-1.5 pointer-events-auto">
                            <span className="bg-slate-900/80 backdrop-blur-md text-slate-200 text-[8px] font-bold px-1.5 py-0.2 rounded border border-white/20">
                              {p.profile_series || p.sub_category || p.category}
                            </span>
                          </div>

                          {/* Hover Actions Overlay on Image */}
                          <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-[2px] opacity-0 group-hover/img:opacity-100 transition-opacity duration-200 flex items-center justify-center space-x-1.5 pointer-events-auto">
                            <button
                              onClick={(e) => { e.stopPropagation(); setLightboxProduct(p); }}
                              className="p-1.5 bg-white text-slate-900 rounded shadow transition hover:scale-105"
                              title="Enlarge High-Res Spec & Photos"
                            >
                              <Maximize2 className="w-3 h-3 text-orange-600" />
                            </button>

                            <label
                              onClick={(e) => e.stopPropagation()}
                              className="p-1.5 bg-orange-500 hover:bg-orange-600 text-white rounded shadow transition hover:scale-105 cursor-pointer"
                              title="Upload / Change Photo"
                            >
                              <Camera className="w-3 h-3" />
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    const reader = new FileReader();
                                    reader.onloadend = () => {
                                      if (typeof reader.result === 'string') {
                                        handleUpdateProductImage(p.id, reader.result);
                                      }
                                    };
                                    reader.readAsDataURL(file);
                                  }
                                }}
                              />
                            </label>
                          </div>
                        </div>

                        {/* 2. CARD CONTENT BODY */}
                        <div className="p-2.5 space-y-2 grow flex flex-col justify-between">
                          <div className="space-y-1">
                            <h4
                              onClick={() => setEditingProduct(p)}
                              className="text-xs font-bold text-slate-900 hover:text-orange-600 transition-colors line-clamp-1 cursor-pointer"
                            >
                              {p.product_name}
                            </h4>

                            <p className="text-[10px] text-slate-500 line-clamp-1 leading-tight">
                              {p.description || `High durability ${p.category} profile.`}
                            </p>

                            {/* Tech Spec Chips */}
                            <div className="flex flex-wrap gap-1 pt-0.5 text-[9px] font-semibold text-slate-600">
                              <span className="bg-slate-100 text-slate-700 px-1 py-0.2 rounded border border-slate-200 flex items-center space-x-0.5">
                                <Tag className="w-2.5 h-2.5 text-slate-400" />
                                <span>Unit: <strong>{p.unit}</strong></span>
                              </span>
                              <span className="bg-slate-100 text-slate-700 px-1 py-0.2 rounded border border-slate-200 flex items-center space-x-0.5">
                                <Layers className="w-2.5 h-2.5 text-slate-400" />
                                <span><strong>{p.unit_weight_kg || 0} kg</strong></span>
                              </span>
                              {p.warranty && (
                                <span className="bg-amber-50 text-amber-800 px-1 py-0.2 rounded border border-amber-200 line-clamp-1">
                                  🛡️ {p.warranty}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Price Range Display (Floor Price – Ceiling Price) */}
                          <div className="bg-[#FEFDDF]/90 p-2.5 rounded-xl border border-[#FFC81E]/60 flex items-center justify-between text-xs shadow-2xs">
                            <div>
                              <span className="text-[8px] font-extrabold text-[#D26E1A] uppercase tracking-wider block">
                                Price Range (Floor – Ceiling)
                              </span>
                              <div className="font-mono font-black text-xs text-[#0F203C] flex items-center space-x-1 mt-0.5">
                                <span className="text-[#E87F24]">
                                  Rs. {(p.min_selling_price || Math.round(basePrice * 0.9)).toLocaleString()}
                                </span>
                                <span className="text-slate-400 font-normal text-[10px]">–</span>
                                <span className="text-[#0F203C]">
                                  Rs. {basePrice.toLocaleString()}
                                </span>
                              </div>
                            </div>
                            <div className="text-right">
                              <span className="text-[9px] font-bold text-slate-500 bg-white px-1.5 py-0.5 rounded-md border border-slate-200 shadow-2xs block">
                                per {p.unit}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* 3. VIBRANT HIGH-CONTRAST ACTION BAR - DREAMS POS ORANGE & DARK BLUE STYLE */}
                        <div
                          className="p-1.5 bg-slate-900 border-t border-slate-800 flex items-center gap-1"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {/* 1. PRIMARY ADD TO QUOTE BUTTON IN ORANGE */}
                          <button
                            onClick={() => handleQuickAddToQuote(p)}
                            className="flex-1 bg-orange-500 hover:bg-orange-600 text-white font-extrabold text-[11px] py-1 px-1.5 rounded transition-all flex items-center justify-center space-x-1 shadow-2xs group/quote"
                            title="Add Item to Quotation Draft"
                          >
                            <ShoppingCart className="w-3 h-3 text-white group-hover/quote:scale-110 transition-transform" />
                            <span>Add to Quote</span>
                          </button>

                          {/* 2. POS SPEC CALCULATOR BUTTON */}
                          <button
                            onClick={() => setViewPosProduct(p)}
                            className="w-7 h-7 rounded bg-slate-800 hover:bg-slate-700 text-orange-400 border border-slate-700 flex items-center justify-center transition group/btn relative"
                            title="POS Quick Spec & Pricing Calculator"
                          >
                            <Zap className="w-3 h-3" />
                            <span className="absolute -top-7 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] font-bold px-2 py-0.5 rounded opacity-0 group-hover/btn:opacity-100 transition pointer-events-none whitespace-nowrap shadow-md z-30">
                              POS Calc
                            </span>
                          </button>

                          {/* BARCODE LABEL BUTTON */}
                          <button
                            onClick={() => setBarcodeProduct(p)}
                            className="w-7 h-7 rounded bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-slate-700 flex items-center justify-center transition group/btn relative"
                            title="Print Product Barcode Label"
                          >
                            <QrCode className="w-3 h-3" />
                            <span className="absolute -top-7 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] font-bold px-2 py-0.5 rounded opacity-0 group-hover/btn:opacity-100 transition pointer-events-none whitespace-nowrap shadow-md z-30">
                              Barcode Label
                            </span>
                          </button>

                          {/* 3. ENLARGE LIGHTBOX & SPEC SHEET BUTTON */}
                          <button
                            onClick={() => setLightboxProduct(p)}
                            className="w-7 h-7 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center justify-center transition group/btn relative"
                            title="Enlarge Spec Lightbox & Photo View"
                          >
                            <Maximize2 className="w-3 h-3" />
                            <span className="absolute -top-7 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] font-bold px-2 py-0.5 rounded opacity-0 group-hover/btn:opacity-100 transition pointer-events-none whitespace-nowrap shadow-md z-30">
                              Enlarge Spec
                            </span>
                          </button>

                          {/* 4. SETTINGS & CONFIGURATION BUTTON */}
                          <button
                            onClick={() => setEditingProduct(p)}
                            className="w-7 h-7 rounded bg-orange-600 hover:bg-orange-700 text-white border border-orange-500 flex items-center justify-center transition group/btn relative"
                            title="Settings & All Edits"
                          >
                            <Sliders className="w-3 h-3" />
                            <span className="absolute -top-7 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] font-bold px-2 py-0.5 rounded opacity-0 group-hover/btn:opacity-100 transition pointer-events-none whitespace-nowrap shadow-md z-30">
                              Settings
                            </span>
                          </button>

                          {/* 5. ACTIVATE / DEACTIVATE TOGGLE BUTTON */}
                          <button
                            onClick={(e) => handleToggleProductStatus(p, e)}
                            className={`w-7 h-7 rounded flex items-center justify-center transition group/btn relative cursor-pointer border ${
                              p.status === 'Active'
                                ? 'bg-slate-800 hover:bg-rose-600 text-slate-300 hover:text-white border-slate-700'
                                : 'bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-500'
                            }`}
                            title={p.status === 'Active' ? 'Deactivate Product' : 'Activate Product'}
                          >
                            <Power className="w-3 h-3" />
                            <span className="absolute -top-7 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] font-bold px-2 py-0.5 rounded opacity-0 group-hover/btn:opacity-100 transition pointer-events-none whitespace-nowrap shadow-md z-30">
                              {p.status === 'Active' ? 'Deactivate' : 'Activate'}
                            </span>
                          </button>

                          {/* 5. DELETE VARIANT BUTTON (HO Admin Only) */}
                          {isHO && (
                            <button
                              onClick={() => setDeletingProduct(p)}
                              className="w-7 h-7 rounded bg-rose-600 hover:bg-rose-700 text-white border border-rose-500 flex items-center justify-center transition group/btn relative"
                              title="Delete Product Variant"
                            >
                              <Trash2 className="w-3 h-3" />
                              <span className="absolute -top-7 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] font-bold px-2 py-0.5 rounded opacity-0 group-hover/btn:opacity-100 transition pointer-events-none whitespace-nowrap shadow-md z-30">
                                Delete
                              </span>
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-xs">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-900 text-white font-bold uppercase tracking-wider text-[10px]">
                        <tr>
                          <th className="p-2.5 w-8">
                            <input
                              type="checkbox"
                              checked={activeSubCategoryVariants.length > 0 && activeSubCategoryVariants.every(p => selectedProductIds.includes(p.id))}
                              onChange={() => handleSelectAllProducts(activeSubCategoryVariants)}
                              className="w-3.5 h-3.5 rounded text-[#E87F24] accent-[#E87F24] cursor-pointer"
                            />
                          </th>
                          <th className="p-2.5">Product / Image</th>
                          <th className="p-2.5">Category & Series</th>
                          <th className="p-2.5">Unit & Weight</th>
                          <th className="p-2.5">Master Base Rate</th>
                          <th className="p-2.5">{selectedCustomerTier} Rate</th>
                          <th className="p-2.5 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-medium">
                        {activeSubCategoryVariants.map((p) => {
                          const basePrice = p.base_price || p.current_price || 0;
                          const tierCalc = resolveProductVariantPrice(p, { customer_type: selectedCustomerTier, quantity: 1 });
                          const isSelected = selectedProductIds.includes(p.id);

                          return (
                            <tr key={p.id} className={`transition ${isSelected ? 'bg-[#FEFDDF]/40' : 'hover:bg-orange-50/50'}`}>
                              <td className="p-2.5">
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={() => toggleSelectProduct(p.id)}
                                  className="w-3.5 h-3.5 rounded text-[#E87F24] accent-[#E87F24] cursor-pointer"
                                />
                              </td>
                              <td className="p-2.5">
                                <div className="flex items-center space-x-2.5">
                                  <div className="w-8 h-8 rounded bg-slate-100 border border-slate-200 text-slate-700 flex items-center justify-center font-bold text-[10px] shrink-0 font-mono">
                                    {p.product_code.substring(0, 3)}
                                  </div>
                                  <div>
                                    <div className="font-bold text-slate-900 flex items-center space-x-1.5">
                                      <span className="font-mono text-[10px] text-orange-600 bg-orange-50 border border-orange-200 px-1 py-0.2 rounded">
                                        {p.product_code}
                                      </span>
                                      <span className="truncate max-w-[200px]">{p.product_name}</span>
                                    </div>
                                    <p className="text-[10px] text-slate-500 truncate max-w-[220px]">
                                      {p.description || `High quality ${p.category} variant`}
                                    </p>
                                  </div>
                                </div>
                              </td>
                              <td className="p-2.5">
                                <span className="text-[10px] font-bold text-slate-700 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded">
                                  {p.profile_series || p.sub_category || p.category}
                                </span>
                              </td>
                              <td className="p-2.5">
                                <span className="text-slate-700 font-mono text-[11px] block">{p.unit}</span>
                                <span className="text-slate-400 text-[10px]">{p.unit_weight_kg || 0} kg</span>
                              </td>
                              <td className="p-2.5 font-mono font-bold text-slate-900">
                                Rs. {basePrice.toLocaleString()}
                              </td>
                              <td className="p-2.5 font-mono font-bold text-orange-600">
                                Rs. {tierCalc.final_unit_price.toLocaleString()}
                              </td>
                              <td className="p-2.5 text-right">
                                <div className="flex items-center justify-end space-x-1">
                                  <button
                                    type="button"
                                    onClick={() => handleQuickAddToQuote(p)}
                                    className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-2 py-1 rounded text-[11px] flex items-center space-x-1 transition shadow-2xs"
                                  >
                                    <ShoppingCart className="w-3 h-3" />
                                    <span>Add to Quote</span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setViewPosProduct(p)}
                                    className="p-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded transition"
                                    title="Specs & POS Calc"
                                  >
                                    <Eye className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setLightboxProduct(p)}
                                    className="p-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded transition"
                                    title="Enlarge Spec Lightbox"
                                  >
                                    <Maximize2 className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setEditingProduct(p)}
                                    className="p-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded transition"
                                    title="Settings"
                                  >
                                    <Sliders className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

        </div>
      )}

      {/* ========================================================================= */}
      {/* MODE 2: 4-TIER PRIORITY TABLE MATRIX (Existing Full Management View) */}
      {/* ========================================================================= */}
      {activeSubTab === 'table-matrix' && (
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-base font-extrabold text-slate-900">
                Master Product Price Matrix Table ({products.length} SKUs)
              </h3>
              <p className="text-xs text-slate-500">
                Full central database view for Head Office base price maintenance, floor rates & bulk updates
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => handleSelectAllProducts(products)}
                className="px-3 py-1.5 bg-[#FEFDDF] hover:bg-[#FFC81E]/30 text-[#0F203C] border border-[#FFC81E]/60 rounded-xl font-bold text-xs transition flex items-center space-x-1.5"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-[#E87F24]" />
                <span>
                  {products.length > 0 && products.every(p => selectedProductIds.includes(p.id))
                    ? 'Deselect All'
                    : 'Select All Products'}
                </span>
              </button>

              {selectedProductIds.length > 0 && (
                <button
                  type="button"
                  onClick={() => setShowBulkUpdateModal(true)}
                  className="bg-[#E87F24] hover:bg-[#D26E1A] text-white px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition shadow-md flex items-center space-x-1.5"
                >
                  <Zap className="w-3.5 h-3.5 text-[#FFC81E]" />
                  <span>Bulk Adjust Prices ({selectedProductIds.length})</span>
                </button>
              )}

              {isHO && (
                <button
                  onClick={() => setShowAddProductModal(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-3.5 py-2 rounded-xl text-xs font-bold transition inline-flex items-center space-x-1.5 shadow-md shadow-blue-600/20"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Master Product</span>
                </button>
              )}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-bold uppercase text-[10px]">
                  <th className="py-3 px-3 w-8">
                    <input
                      type="checkbox"
                      checked={products.length > 0 && products.every(p => selectedProductIds.includes(p.id))}
                      onChange={() => handleSelectAllProducts(products)}
                      className="w-3.5 h-3.5 rounded text-[#E87F24] accent-[#E87F24] cursor-pointer"
                    />
                  </th>
                  <th className="py-3 px-4">Product Code & Name</th>
                  <th className="py-3 px-4">Category / Sub-Category</th>
                  <th className="py-3 px-4 text-right">Base Price</th>
                  <th className="py-3 px-4 text-right">HO Cost</th>
                  <th className="py-3 px-4 text-right">Min Floor</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {products.map((p) => {
                  const isSelected = selectedProductIds.includes(p.id);
                  return (
                    <tr key={p.id} className={`transition ${isSelected ? 'bg-[#FEFDDF]/50' : 'hover:bg-slate-50/80'}`}>
                      <td className="py-3 px-3">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelectProduct(p.id)}
                          className="w-3.5 h-3.5 rounded text-[#E87F24] accent-[#E87F24] cursor-pointer"
                        />
                      </td>
                      <td className="py-3 px-4">
                        <strong className="font-mono text-blue-600 font-bold">{p.product_code}</strong>
                        <div className="text-slate-900 font-bold">{p.product_name}</div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[11px] font-bold">
                          {p.category}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">
                        Rs. {(p.base_price || p.current_price).toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-slate-600">
                        Rs. {(p.cost_price || 0).toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-amber-700">
                        Rs. {(p.min_selling_price || 0).toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button
                          type="button"
                          onClick={(e) => handleToggleProductStatus(p, e)}
                          className={`inline-flex items-center space-x-1 border text-[10px] font-bold px-2.5 py-1 rounded-full uppercase transition cursor-pointer shadow-2xs ${
                            p.status === 'Active'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-300'
                              : p.status === 'Inactive' || (p.status as string) === 'Deactive'
                              ? 'bg-rose-50 text-rose-700 border-rose-300 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-300'
                              : 'bg-amber-50 text-amber-700 border-amber-300 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-300'
                          }`}
                          title="Click to toggle Product Status (Activate / Deactivate)"
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${p.status === 'Active' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                          <span>{p.status || 'Active'}</span>
                        </button>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end space-x-1.5">
                          <button
                            type="button"
                            onClick={(e) => handleToggleProductStatus(p, e)}
                            className={`px-2 py-1 rounded text-xs font-bold transition flex items-center space-x-1 cursor-pointer border ${
                              p.status === 'Active'
                                ? 'bg-rose-50 hover:bg-rose-100 text-rose-700 border-rose-200'
                                : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200'
                            }`}
                            title={p.status === 'Active' ? 'Deactivate Product' : 'Activate Product'}
                          >
                            <Power className="w-3 h-3" />
                            <span>{p.status === 'Active' ? 'Deactivate' : 'Activate'}</span>
                          </button>
                          <button
                            onClick={() => setViewPosProduct(p)}
                            className="bg-blue-50 hover:bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-bold cursor-pointer"
                          >
                            View
                          </button>
                          {isHO && (
                            <button
                              onClick={() => setEditingProduct(p)}
                              className="bg-amber-50 hover:bg-amber-100 text-amber-800 px-2 py-1 rounded text-xs font-bold cursor-pointer"
                            >
                              Edit
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODE 3: BRANCH PRICE OVERRIDES MATRIX */}
      {/* ========================================================================= */}
      {activeSubTab === 'branch-overrides' && (
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-base font-extrabold text-slate-900">Branch Price Override Rules</h3>
              <p className="text-xs text-slate-500">Active location-specific price adjustments overriding Company Base Rate</p>
            </div>
            {isHO && (
              <button
                onClick={() => setShowOverrideModal(true)}
                className="bg-blue-600 text-white px-3 py-1.5 rounded-xl text-xs font-bold inline-flex items-center space-x-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Create Branch Rule</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {branchPrices.map((bo) => (
              <div key={bo.id} className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2 text-xs">
                <div className="flex items-center justify-between font-bold">
                  <span className="text-blue-600 font-mono">{bo.branch_name || bo.branch_id}</span>
                  <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded text-[10px]">{bo.status}</span>
                </div>
                <div>Code: <strong>{bo.product_code || bo.product_id}</strong></div>
                <div>Special Branch Price: <strong className="text-slate-900 text-sm">Rs. {bo.special_price.toLocaleString()}</strong></div>
                <div className="text-slate-400 text-[11px]">Effective: {bo.effective_from}</div>
                {isHO && (
                  <button
                    onClick={() => onDeleteBranchOverride(bo.id)}
                    className="text-rose-600 hover:underline text-[11px] font-bold block pt-1"
                  >
                    Delete Override Rule
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODE 4: PACKED WORKS & MULTI-VARIANT ASSEMBLY BUNDLES */}
      {/* ========================================================================= */}
      {activeSubTab === 'packed-works' && (
        <PackedWorkManagement
          packages={packedWorkPackages}
          products={products}
          onSavePackage={(pkg) => {
            setPackedWorkPackages(prev => {
              const idx = prev.findIndex(p => p.id === pkg.id);
              if (idx !== -1) {
                const updated = [...prev];
                updated[idx] = pkg;
                return updated;
              } else {
                return [pkg, ...prev];
              }
            });
          }}
          onDeletePackage={(id) => {
            setPackedWorkPackages(prev => prev.filter(p => p.id !== id));
          }}
          onProceedToQuotation={onProceedToQuotation}
          initialSelectedProductIds={selectedProductIds}
          onClearInitialSelections={() => setSelectedProductIds([])}
        />
      )}

      {/* ========================================================================= */}
      {/* MODAL: ADD NEW MAIN CATEGORY */}
      {/* ========================================================================= */}
      {showAddCategoryModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <form onSubmit={handleCreateCategorySubmit} className="bg-white border border-slate-200 rounded-lg max-w-md w-full p-5 space-y-4 shadow-xl">
            <h3 className="text-sm font-semibold text-slate-900 flex items-center space-x-2 border-b border-slate-100 pb-2.5">
              <Plus className="w-4 h-4 text-orange-500" />
              <span>Create New Main Category</span>
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Category Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Partition Systems, Handrails"
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-md p-2 font-semibold text-slate-900 focus:outline-none focus:border-orange-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Category Description</label>
                <textarea
                  rows={2}
                  placeholder="Brief description of products in this category..."
                  value={newCatDesc}
                  onChange={(e) => setNewCatDesc(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-md p-2 text-slate-900 focus:outline-none focus:border-orange-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Icon Style</label>
                <select
                  value={newCatIcon}
                  onChange={(e) => setNewCatIcon(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-md p-2 font-semibold text-slate-900 focus:outline-none focus:border-orange-500 focus:bg-white"
                >
                  <option value="DoorOpen">Door Open Icon</option>
                  <option value="LayoutGrid">Layout Grid Icon</option>
                  <option value="Layers">Layers Stack Icon</option>
                  <option value="Grid">Grid Tile Icon</option>
                  <option value="Shield">Shield Glass Icon</option>
                  <option value="Wrench">Hardware Wrench Icon</option>
                  <option value="Sparkles">Sparkles Interior Icon</option>
                  <option value="Building2">Building Civil Icon</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-2 pt-2.5 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowAddCategoryModal(false)}
                className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-3.5 py-1.5 bg-orange-500 hover:bg-orange-600 text-white rounded-md text-xs font-semibold shadow-xs"
              >
                Create Category
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: ADD NEW SUB-CATEGORY */}
      {/* ========================================================================= */}
      {showAddSubCatModal && selectedMainCat && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <form onSubmit={handleCreateSubCategorySubmit} className="bg-white border border-slate-200 rounded-lg max-w-md w-full p-5 space-y-4 shadow-xl">
            <h3 className="text-sm font-semibold text-slate-900 flex items-center space-x-2 border-b border-slate-100 pb-2.5">
              <Plus className="w-4 h-4 text-orange-500" />
              <span>Add Sub-Category to {selectedMainCat.name}</span>
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Sub-Category Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., 100mm Doors, Single Sash, Bi-fold"
                  value={newSubCatName}
                  onChange={(e) => setNewSubCatName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-md p-2 font-semibold text-slate-900 focus:outline-none focus:border-orange-500 focus:bg-white"
                />
              </div>
            </div>

            <div className="flex items-center justify-end space-x-2 pt-2.5 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowAddSubCatModal(false)}
                className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-3.5 py-1.5 bg-orange-500 hover:bg-orange-600 text-white rounded-md text-xs font-semibold shadow-xs"
              >
                Add Sub-Category
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: ADD NEW MASTER VARIANT PRODUCT */}
      {/* ========================================================================= */}
      {showAddProductModal && (
        <ProductMasterFormModal
          product={{ category: selectedMainCat?.name || newProdCategory || 'Aluminium Profiles', sub_category: selectedSubCatName || newProdSubCategory || '' } as any}
          mode="add"
          categories={categoriesList}
          mainCategories={mainCategories}
          isSubmitting={isSubmitting}
          isOpen={showAddProductModal}
          onClose={() => setShowAddProductModal(false)}
          onSubmit={async (formData) => {
            setIsSubmitting(true);
            try {
              if (onAddProduct) {
                const newProd: Product = {
                  id: `p-${Date.now()}`,
                  product_code: formData.product_code,
                  product_name: formData.product_name,
                  category: formData.category,
                  sub_category: formData.sub_category || selectedSubCatName || newProdSubCategory || '',
                  status: formData.status,
                  unit: formData.unit,
                  price_display_method: formData.price_display_method,
                  unit_weight_kg: formData.unit_weight_kg,
                  base_price: formData.base_price,
                  current_price: formData.base_price,
                  cost_price: formData.cost_price,
                  min_selling_price: formData.min_selling_price,
                  description: formData.description,
                  profile_series: formData.profile_series,
                  lock_type: formData.lock_type,
                  handle_type: formData.handle_type,
                  roller_type: formData.roller_type,
                  warranty: formData.warranty,
                  custom_option_surcharges: formData.custom_option_surcharges,
                  thickness_prices: formData.thickness_prices,
                  finish_prices: formData.finish_prices,
                  colour_prices: formData.colour_prices,
                  glass_prices: formData.glass_prices,
                  installation_prices: formData.installation_prices,
                  floor_level_prices: formData.floor_level_prices,
                  facility_type_prices: formData.facility_type_prices,
                  tier_prices: formData.tier_prices,
                  customer_type_prices: formData.customer_type_prices,
                  region_prices: formData.region_prices,
                  project_type_prices: formData.project_type_prices,
                  grade_prices: formData.grade_prices,
                  brand_prices: formData.brand_prices,
                  quantity_breaks: formData.quantity_breaks,
                  main_materials: formData.main_materials,
                  glass_specs: formData.glass_specs,
                  hardware_accessories: formData.hardware_accessories,
                  custom_materials: formData.custom_materials,
                  technical_details: formData.technical_details,
                  fabrication_methods: formData.fabrication_methods,
                  surface_finishes_specs: formData.surface_finishes_specs,
                  installation_scopes: formData.installation_scopes,
                  product_faqs: formData.product_faqs,
                  warranty_terms_specs: formData.warranty_terms_specs,
                  dlp_frameworks: formData.dlp_frameworks,
                  effective_date: formData.effective_date || new Date().toISOString().split('T')[0],
                  last_updated: new Date().toISOString(),
                  updated_by: activeBranch?.manager_name || 'HO Pricing Manager'
                };
                await onAddProduct(newProd);
              }
              setShowAddProductModal(false);
            } catch (e) {
              console.error('Add variant product error:', e);
              alert('Failed to save variant product: ' + (e instanceof Error ? e.message : 'Unknown error'));
            } finally {
              setIsSubmitting(false);
            }
          }}
        />
      )}

      {/* --- EDIT MASTER FORM MODAL --- */}
      {editingProduct && (
        <ProductMasterFormModal
          product={editingProduct}
          mode="edit"
          categories={categoriesList}
          mainCategories={mainCategories}
          isSubmitting={isSubmitting}
          isOpen={!!editingProduct}
          priceHistory={priceHistory}
          onClose={() => setEditingProduct(null)}
          onSubmit={async (formData) => {
            setIsSubmitting(true);
            try {
              const updatePayload: Partial<Product> & { reason?: string; effectiveDate?: string } = {
                product_code: formData.product_code,
                product_name: formData.product_name,
                category: formData.category,
                sub_category: formData.sub_category || editingProduct.sub_category || '',
                status: formData.status,
                unit: formData.unit,
                price_display_method: formData.price_display_method,
                unit_weight_kg: formData.unit_weight_kg,
                base_price: formData.base_price,
                current_price: formData.base_price,
                cost_price: formData.cost_price,
                min_selling_price: formData.min_selling_price,
                description: formData.description,
                profile_series: formData.profile_series,
                lock_type: formData.lock_type,
                handle_type: formData.handle_type,
                roller_type: formData.roller_type,
                warranty: formData.warranty,
                custom_option_surcharges: formData.custom_option_surcharges,
                thickness_prices: formData.thickness_prices,
                finish_prices: formData.finish_prices,
                colour_prices: formData.colour_prices,
                glass_prices: formData.glass_prices,
                installation_prices: formData.installation_prices,
                floor_level_prices: formData.floor_level_prices,
                facility_type_prices: formData.facility_type_prices,
                tier_prices: formData.tier_prices,
                customer_type_prices: formData.customer_type_prices,
                region_prices: formData.region_prices,
                project_type_prices: formData.project_type_prices,
                grade_prices: formData.grade_prices,
                brand_prices: formData.brand_prices,
                quantity_breaks: formData.quantity_breaks,
                main_materials: formData.main_materials,
                glass_specs: formData.glass_specs,
                hardware_accessories: formData.hardware_accessories,
                custom_materials: formData.custom_materials,
                technical_details: formData.technical_details,
                fabrication_methods: formData.fabrication_methods,
                surface_finishes_specs: formData.surface_finishes_specs,
                installation_scopes: formData.installation_scopes,
                product_faqs: formData.product_faqs,
                warranty_terms_specs: formData.warranty_terms_specs,
                dlp_frameworks: formData.dlp_frameworks,
                reason: formData.reason || 'Master Spec & Pricing Formula Update',
                effective_date: formData.effective_date
              };

              if (onUpdateProductData) {
                await onUpdateProductData(editingProduct.id, updatePayload);
              } else if (onUpdatePrice) {
                await onUpdatePrice(editingProduct.id, formData.base_price, formData.reason || 'Master Spec Update');
              }
              setEditingProduct(null);
            } catch (e) {
              console.error('Update master product error:', e);
              alert('Failed to update product: ' + (e instanceof Error ? e.message : 'Unknown error'));
            } finally {
              setIsSubmitting(false);
            }
          }}
        />
      )}

      {/* --- VIEW ALL DATA & POS QUICK QUOTE MODAL --- */}
      <ProductViewPosModal
        product={viewPosProduct}
        isOpen={!!viewPosProduct}
        priceHistory={priceHistory}
        onClose={() => setViewPosProduct(null)}
        onProceedToQuotation={(item) => {
          if (onProceedToQuotation) {
            onProceedToQuotation(item);
          }
        }}
        onEditProduct={(prod) => {
          setViewPosProduct(null);
          setEditingProduct(prod);
        }}
        onDeleteProduct={(prodId) => {
          const targetP = products.find(p => p.id === prodId);
          setViewPosProduct(null);
          if (targetP) {
            setDeletingProduct(targetP);
          }
        }}
        onUpdateProductData={onUpdateProductData}
        isHO={isHO}
      />

      {/* --- CONFIRM DELETE PRODUCT MODAL --- */}
      {deletingProduct && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center space-x-3 text-rose-600 border-b border-slate-100 pb-3">
              <AlertTriangle className="w-6 h-6" />
              <h3 className="text-base font-extrabold text-slate-900">Delete Master Product</h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Are you sure you want to permanently delete master product <strong className="text-slate-900 font-mono">{deletingProduct.product_code} ({deletingProduct.product_name})</strong>? This will remove it from the central master price catalog and all branch override lists.
            </p>
            <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-100">
              <button
                onClick={() => setDeletingProduct(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  if (onDeleteProduct && deletingProduct) {
                    setIsSubmitting(true);
                    try {
                      await onDeleteProduct(deletingProduct.id);
                      setDeletingProduct(null);
                    } catch (e) {
                      console.error('Delete product error:', e);
                    } finally {
                      setIsSubmitting(false);
                    }
                  }
                }}
                disabled={isSubmitting}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-extrabold transition shadow-md shadow-rose-600/20"
              >
                {isSubmitting ? 'Deleting...' : 'Delete Master Product'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- 30-DAY TREND FORECAST MODAL --- */}
      {forecastModalProduct && (
        <ProductPriceForecastModal
          product={forecastModalProduct}
          priceHistory={priceHistory}
          isOpen={!!forecastModalProduct}
          onClose={() => setForecastModalProduct(null)}
          onProposePrice={onProposePrice}
        />
      )}

      {/* --- HIGH-RES SPEC & IMAGE LIGHTBOX MODAL --- */}
      <ProductImageLightboxModal
        product={lightboxProduct}
        isOpen={!!lightboxProduct}
        onClose={() => setLightboxProduct(null)}
        onUpdateImage={handleUpdateProductImage}
        onOpenEditMaster={(p) => setEditingProduct(p)}
      />

      {/* --- BARCODE STICKER LABEL MODAL --- */}
      {barcodeProduct && (
        <ProductBarcodeLabelModal
          product={barcodeProduct}
          branchName={activeBranch.name}
          onClose={() => setBarcodeProduct(null)}
        />
      )}

      {/* --- FLOATING BULK SELECTION ACTION BAR --- */}
      {selectedProductIds.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-[#0F203C] text-white px-5 py-3 rounded-2xl shadow-2xl border border-orange-500/50 z-40 flex flex-wrap items-center justify-center gap-3 animate-in slide-in-from-bottom-5 duration-300">
          <div className="flex items-center space-x-2">
            <span className="w-6 h-6 rounded-full bg-[#E87F24] text-white text-xs font-black flex items-center justify-center shadow-2xs">
              {selectedProductIds.length}
            </span>
            <span className="text-xs font-extrabold text-white">SKUs Selected</span>
          </div>

          <div className="h-4 w-px bg-slate-700 hidden sm:block" />

          {/* ACTION 1: ADD ALL SELECTED SKUS SIMULTANEOUSLY TO POS CART */}
          <button
            type="button"
            onClick={() => {
              const selectedProds = products.filter(p => selectedProductIds.includes(p.id));
              if (selectedProds.length === 0) return;

              const quotationItemsToAdd: QuotationItem[] = selectedProds.map(p => ({
                id: `qi-sel-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
                product_id: p.id,
                product_code: p.product_code,
                product_name: p.product_name,
                unit: p.unit,
                unit_price: p.current_price || p.base_price || 0,
                quantity: 1,
                weight_kg: p.unit_weight_kg || 1,
                total_price: (p.current_price || p.base_price || 0),
                price_source_label: 'Catalog Multi-Selection'
              }));

              window.dispatchEvent(new CustomEvent('innovista_add_multiple_items_to_cart', {
                detail: { items: quotationItemsToAdd }
              }));

              setAddedToast(`🚀 Dispatched ${selectedProds.length} SKUs simultaneously to POS Cart!`);
              setTimeout(() => setAddedToast(null), 3500);
              setSelectedProductIds([]);
            }}
            className="bg-orange-500 hover:bg-orange-600 text-white text-xs font-black px-3.5 py-2 rounded-xl transition shadow-md flex items-center space-x-1.5 cursor-pointer"
          >
            <ShoppingCart className="w-4 h-4" />
            <span>Add Selected ({selectedProductIds.length}) to POS Cart</span>
          </button>

          {/* ACTION 2: DESIGN PACKED WORK FROM SELECTION */}
          <button
            type="button"
            onClick={() => {
              setActiveSubTab('packed-works');
            }}
            className="bg-purple-600 hover:bg-purple-700 text-white text-xs font-black px-3.5 py-2 rounded-xl transition shadow-md flex items-center space-x-1.5 cursor-pointer"
          >
            <PackageCheck className="w-4 h-4 text-purple-200" />
            <span>Design Packed Work ({selectedProductIds.length})</span>
          </button>

          {/* ACTION 3: BULK PRICE ADJUSTMENT */}
          <button
            type="button"
            onClick={() => setShowBulkUpdateModal(true)}
            className="bg-slate-800 hover:bg-slate-700 text-white text-xs font-black px-3 py-2 rounded-xl transition shadow-md flex items-center space-x-1.5 cursor-pointer border border-slate-700"
          >
            <Zap className="w-3.5 h-3.5 text-[#FFC81E]" />
            <span>Bulk Price</span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedProductIds([])}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
            title="Clear Selection"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* --- BULK PRICE ADJUSTMENT MODAL --- */}
      {showBulkUpdateModal && (() => {
        const valNum = parseFloat(bulkValue) || 0;
        return (
          <div className="fixed inset-0 bg-[#0F203C]/75 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white border border-slate-200 rounded-2xl max-w-2xl w-full p-6 space-y-5 shadow-2xl animate-in zoom-in-95 duration-200 my-8 text-[#0F203C]">
              
              {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-[#FEFDDF] text-[#E87F24] border border-[#FFC81E]/50 flex items-center justify-center font-bold shrink-0">
                  <Zap className="w-5 h-5 text-[#E87F24]" />
                </div>
                <div>
                  <h3 className="text-base font-black text-[#0F203C] flex items-center space-x-2">
                    <span>Bulk Price Adjustment Engine</span>
                    <span className="bg-[#E87F24] text-white text-[10px] font-black px-2 py-0.5 rounded-full">
                      {selectedProductIds.length} Items Selected
                    </span>
                  </h3>
                  <p className="text-xs text-slate-500">
                    Apply percentage or fixed rate price changes across multiple SKUs in a single audit-logged transaction.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowBulkUpdateModal(false)}
                className="text-slate-400 hover:text-[#0F203C] p-1.5 rounded-lg hover:bg-slate-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form Options */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-semibold">
              
              {/* Target Parameter */}
              <div>
                <label className="text-xs font-bold text-[#0F203C] block mb-1">Target Price Parameter</label>
                <select
                  value={bulkField}
                  onChange={(e) => setBulkField(e.target.value as any)}
                  className="w-full bg-[#FEFDDF]/50 border border-[#FFC81E]/60 rounded-xl p-2.5 font-bold text-[#0F203C] focus:outline-none focus:border-[#E87F24]"
                >
                  <option value="base_price">Master Base Rate (Selling Price)</option>
                  <option value="cost_price">Head Office Cost Price</option>
                  <option value="min_selling_price">Minimum Floor Selling Price</option>
                </select>
              </div>

              {/* Adjustment Mode */}
              <div>
                <label className="text-xs font-bold text-[#0F203C] block mb-1">Adjustment Type</label>
                <div className="grid grid-cols-2 gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200">
                  <button
                    type="button"
                    onClick={() => setBulkAdjustmentType('PERCENTAGE')}
                    className={`py-1.5 rounded-lg font-extrabold text-xs transition flex items-center justify-center space-x-1 ${
                      bulkAdjustmentType === 'PERCENTAGE'
                        ? 'bg-[#0F203C] text-white shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Percent className="w-3.5 h-3.5 text-[#FFC81E]" />
                    <span>Percentage (%)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setBulkAdjustmentType('FIXED')}
                    className={`py-1.5 rounded-lg font-extrabold text-xs transition flex items-center justify-center space-x-1 ${
                      bulkAdjustmentType === 'FIXED'
                        ? 'bg-[#0F203C] text-white shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <span>Fixed LKR (Rs.)</span>
                  </button>
                </div>
              </div>

              {/* Direction */}
              <div>
                <label className="text-xs font-bold text-[#0F203C] block mb-1">Adjustment Direction</label>
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    type="button"
                    onClick={() => setBulkDirection('INCREASE')}
                    className={`py-2 px-3 rounded-xl border text-xs font-extrabold transition flex items-center justify-center space-x-1.5 ${
                      bulkDirection === 'INCREASE'
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-500 shadow-2xs'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <ArrowUpRight className="w-4 h-4 text-emerald-600" />
                    <span>Price Increase (+)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setBulkDirection('DECREASE')}
                    className={`py-2 px-3 rounded-xl border text-xs font-extrabold transition flex items-center justify-center space-x-1.5 ${
                      bulkDirection === 'DECREASE'
                        ? 'bg-rose-50 text-rose-800 border-rose-500 shadow-2xs'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <ArrowDownRight className="w-4 h-4 text-rose-600" />
                    <span>Price Decrease (-)</span>
                  </button>
                </div>
              </div>

              {/* Adjustment Amount / Rate Input */}
              <div>
                <label className="text-xs font-bold text-[#0F203C] block mb-1">
                  {bulkAdjustmentType === 'PERCENTAGE' ? 'Percentage Rate (%)' : 'Fixed Rate Amount (LKR)'}
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step={bulkAdjustmentType === 'PERCENTAGE' ? '0.1' : '10'}
                    min="0.1"
                    required
                    placeholder={bulkAdjustmentType === 'PERCENTAGE' ? 'e.g. 5.0 for +5%' : 'e.g. 500'}
                    value={bulkValue}
                    onChange={(e) => setBulkValue(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 pl-3 pr-10 font-mono font-bold text-sm text-[#0F203C] focus:outline-none focus:border-[#E87F24] focus:bg-white"
                  />
                  <span className="absolute right-3 top-2.5 font-bold text-xs text-slate-400">
                    {bulkAdjustmentType === 'PERCENTAGE' ? '%' : 'LKR'}
                  </span>
                </div>
              </div>

              {/* Effective Date */}
              <div>
                <label className="text-xs font-bold text-[#0F203C] block mb-1">Effective Date</label>
                <input
                  type="date"
                  required
                  value={bulkEffectiveDate}
                  onChange={(e) => setBulkEffectiveDate(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold text-xs text-[#0F203C] focus:outline-none focus:border-[#E87F24]"
                />
              </div>

              {/* Revision Reason */}
              <div>
                <label className="text-xs font-bold text-[#0F203C] block mb-1">Audit Trail Reason / Revision Note</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Q3 Aluminium Extrusion Index Revision (+5.0%)"
                  value={bulkReason}
                  onChange={(e) => setBulkReason(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-semibold text-xs text-[#0F203C] focus:outline-none focus:border-[#E87F24]"
                />
              </div>
            </div>

            {/* Quick Presets */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Quick Preset Revision Reasons
              </span>
              <div className="flex flex-wrap gap-1.5">
                {[
                  'Q3 Raw Material Index Surge (+5.0%)',
                  'Annual Inflation Rate Adjustment (+3.5%)',
                  'Vendor Foreign Currency Exchange Surge (+8.0%)',
                  'Promotional Sales Campaign Discount (-5.0%)'
                ].map(preset => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setBulkReason(preset)}
                    className="text-[10px] bg-[#FEFDDF] hover:bg-[#FFC81E]/40 text-[#0F203C] border border-[#FFC81E]/60 px-2.5 py-1 rounded-lg font-bold transition"
                  >
                    {preset}
                  </button>
                ))}
              </div>
            </div>

            {/* Real-Time Impact Calculation Preview */}
            <div className="border border-slate-200 rounded-xl overflow-hidden bg-slate-50">
              <div className="bg-[#0F203C] text-white px-3.5 py-2 text-xs font-bold flex items-center justify-between">
                <div className="flex items-center space-x-1.5">
                  <Eye className="w-3.5 h-3.5 text-[#FFC81E]" />
                  <span>Financial Impact Preview ({products.filter(p => selectedProductIds.includes(p.id)).length} SKUs)</span>
                </div>
                <span className="text-[11px] font-mono text-[#FFC81E]">
                  {bulkDirection === 'INCREASE' ? '+' : '-'}{valNum}{bulkAdjustmentType === 'PERCENTAGE' ? '%' : ' LKR'}
                </span>
              </div>

              <div className="max-h-44 overflow-y-auto divide-y divide-slate-200/60 text-xs">
                {products.filter(p => selectedProductIds.includes(p.id)).slice(0, 8).map(p => {
                  const rawVal = p[bulkField];
                  const current = (rawVal !== undefined && rawVal !== null && !isNaN(Number(rawVal)))
                    ? Number(rawVal) 
                    : (p.base_price || p.current_price || 0);
                  const delta = calculateDelta(current, valNum, bulkAdjustmentType, bulkDirection);
                  const nextVal = Math.max(0, current + delta);

                  return (
                    <div key={p.id} className="p-2.5 flex items-center justify-between hover:bg-white transition">
                      <div>
                        <div className="font-bold text-[#0F203C] font-mono text-[11px]">{p.product_code}</div>
                        <div className="text-[10px] text-slate-500 line-clamp-1">{p.product_name}</div>
                      </div>
                      <div className="text-right font-mono">
                        <div className="text-[10px] text-slate-400 line-through">
                          Rs. {current.toLocaleString()}
                        </div>
                        <div className={`font-bold ${delta >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                          Rs. {nextVal.toLocaleString()}
                        </div>
                      </div>
                    </div>
                  );
                })}
                {selectedProductIds.length > 8 && (
                  <div className="p-2 text-center text-[10px] text-slate-500 font-bold bg-white">
                    + {selectedProductIds.length - 8} more products queued for price revision.
                  </div>
                )}
              </div>

              {/* Total Aggregate Financial Metrics */}
              {(() => {
                const selectedProds = products.filter(p => selectedProductIds.includes(p.id));
                const currentSum = selectedProds.reduce((acc, p) => {
                  const rawVal = p[bulkField];
                  const cur = (rawVal !== undefined && rawVal !== null && !isNaN(Number(rawVal)))
                    ? Number(rawVal) 
                    : (p.base_price || p.current_price || 0);
                  return acc + cur;
                }, 0);
                const impactSum = selectedProds.reduce((acc, p) => {
                  const rawVal = p[bulkField];
                  const cur = (rawVal !== undefined && rawVal !== null && !isNaN(Number(rawVal)))
                    ? Number(rawVal) 
                    : (p.base_price || p.current_price || 0);
                  return acc + calculateDelta(cur, valNum, bulkAdjustmentType, bulkDirection);
                }, 0);
                const newSum = currentSum + impactSum;

                return (
                  <div className="bg-[#FEFDDF] p-3 border-t border-[#FFC81E]/40 grid grid-cols-3 gap-2 text-center text-xs">
                    <div>
                      <span className="text-[9px] uppercase font-bold text-slate-500 block">Current Portfolio Value</span>
                      <strong className="font-mono font-black text-[#0F203C]">Rs. {currentSum.toLocaleString()}</strong>
                    </div>
                    <div>
                      <span className="text-[9px] uppercase font-bold text-slate-500 block">Net Adjustment Impact</span>
                      <strong className={`font-mono font-black ${impactSum >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                        {impactSum >= 0 ? '+' : ''}Rs. {impactSum.toLocaleString()}
                      </strong>
                    </div>
                    <div>
                      <span className="text-[9px] uppercase font-bold text-slate-500 block">New Adjusted Value</span>
                      <strong className="font-mono font-black text-[#E87F24]">Rs. {newSum.toLocaleString()}</strong>
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* Action Footer */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowBulkUpdateModal(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={isApplyingBulk || valNum <= 0}
                onClick={handleExecuteBulkUpdate}
                className="px-5 py-2.5 bg-[#E87F24] hover:bg-[#D26E1A] text-white font-extrabold rounded-xl text-xs transition shadow-md flex items-center space-x-2 disabled:opacity-50 cursor-pointer"
              >
                {isApplyingBulk ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-[#FFC81E]" />
                    <span>Applying Updates across {selectedProductIds.length} SKUs...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 text-[#FFC81E]" />
                    <span>Execute Bulk Price Adjustment ({selectedProductIds.length} SKUs)</span>
                  </>
                )}
              </button>
            </div>

          </div>
        </div>
      );
    })()}

      {/* --- FLOATING ADD TO QUOTE TOAST NOTIFICATION --- */}
      {addedToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white border border-emerald-500/40 px-5 py-3.5 rounded-2xl shadow-2xl flex items-center space-x-3.5 animate-in slide-in-from-bottom-5 duration-300">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <h5 className="text-xs font-bold text-emerald-300">Quotation Cart Updated</h5>
            <p className="text-xs text-slate-200 font-medium">{addedToast}</p>
          </div>
          <button
            onClick={() => setAddedToast(null)}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};
