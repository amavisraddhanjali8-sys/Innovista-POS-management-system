import React, { useState, useMemo, useEffect } from 'react';
import { 
  X, 
  Package, 
  Tag, 
  CheckCircle2, 
  Info, 
  ShoppingCart, 
  ShieldCheck, 
  Shield,
  Clock,
  Layers, 
  Sliders, 
  ArrowRight, 
  Calculator,
  Plus,
  Minus,
  Building2,
  DollarSign,
  Printer,
  Edit3,
  Trash2,
  Power,
  FileText
} from 'lucide-react';
import { 
  Product, 
  QuotationItem, 
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
  DiscountMethod,
  PriceHistory
} from '../types';
import { ProductAuditLogViewer } from './ProductAuditLogViewer';
import { LocationPriceSlidingCell } from './LocationPriceSlidingCell';
import { ALL_SRI_LANKA_REGIONS } from '../utils/sriLankaRegions';
import { PrintableProductSpecModal } from './PrintableProductSpecModal';
import { PrintableWarrantyModal } from './PrintableWarrantyModal';
import { 
  resolveProductVariantPrice, 
  THICKNESS_OPTIONS, 
  FINISH_OPTIONS, 
  COLOUR_OPTIONS, 
  GLASS_TYPES, 
  INSTALLATION_OPTIONS, 
  FLOOR_LEVEL_OPTIONS,
  FACILITY_TYPE_OPTIONS,
  PRICING_TIERS, 
  CUSTOMER_TYPES, 
  REGION_ZONES, 
  PROJECT_TYPES, 
  MATERIAL_GRADES,
  BRAND_OPTIONS 
} from '../utils/priceVariantEngine';
import { POS_SURCHARGE_CATEGORIES, calculate11CategorySurcharges } from '../utils/surchargeCategoryEngine';

interface ProductViewPosModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onProceedToQuotation?: (item: QuotationItem) => void;
  onEditProduct?: (product: Product) => void;
  onDeleteProduct?: (productId: string) => void;
  onUpdateProductData?: (id: string, productData: Partial<Product> & { reason?: string; effectiveDate?: string }) => Promise<void>;
  isHO?: boolean;
  priceHistory?: PriceHistory[];
}

export const ProductViewPosModal: React.FC<ProductViewPosModalProps> = ({
  product,
  isOpen,
  onClose,
  onProceedToQuotation,
  onEditProduct,
  onDeleteProduct,
  onUpdateProductData,
  isHO = true,
  priceHistory = []
}) => {
  if (!isOpen || !product) return null;

  const [activeTab, setActiveTab] = useState<'view' | 'pos' | 'audit'>('pos');
  const [showPrintSpecModal, setShowPrintSpecModal] = useState<boolean>(false);
  const [showPrintWarrantyModal, setShowPrintWarrantyModal] = useState<boolean>(false);

  // POS State Selectors
  const [selectedThickness, setSelectedThickness] = useState<MaterialThickness | undefined>(
    product.available_thicknesses?.[0] || '1.2mm'
  );
  const [selectedFinish, setSelectedFinish] = useState<MaterialFinish | undefined>(
    product.available_finishes?.[0] || 'Powder Coated'
  );
  const [selectedColour, setSelectedColour] = useState<MaterialColour | undefined>(
    product.available_colours?.[0] || 'White'
  );
  const [selectedGlass, setSelectedGlass] = useState<GlassType | undefined>(
    product.available_glass_types?.[0] || 'Clear 5mm'
  );
  const [selectedInstallation, setSelectedInstallation] = useState<InstallationOption | undefined>(
    product.available_installation_options?.[0] || 'Supply Only'
  );
  const [selectedTier, setSelectedTier] = useState<PricingTier | undefined>('Retail');
  const [selectedCustomerType, setSelectedCustomerType] = useState<CustomerType | undefined>('Retail Customer');
  const [selectedRegion, setSelectedRegion] = useState<RegionZone | undefined>('Colombo Zone 1');
  const [selectedGrade, setSelectedGrade] = useState<MaterialGrade | undefined>('Grade 6063-T5');
  const [selectedBrand, setSelectedBrand] = useState<string | undefined>(
    product.available_brands?.[0] || undefined
  );
  const [selectedFloorLevel, setSelectedFloorLevel] = useState<string | undefined>(
    product.available_floor_levels?.[0] || undefined
  );
  const [selectedFacilityType, setSelectedFacilityType] = useState<string | undefined>(
    product.available_facility_types?.[0] || undefined
  );
  const [selectedCustomOptions, setSelectedCustomOptions] = useState<Record<string, string>>({});
  const [quantity, setQuantity] = useState<number>(1);

  // 11 Detailed Engineering Specification Categories State
  const [selectedSpecMainMaterialId, setSelectedSpecMainMaterialId] = useState<string>('');
  const [selectedSpecGlassId, setSelectedSpecGlassId] = useState<string>('');
  const [selectedSpecHardwareId, setSelectedSpecHardwareId] = useState<string>('');
  const [selectedSpecCustomMaterialId, setSelectedSpecCustomMaterialId] = useState<string>('');
  const [selectedSpecTechnicalPointId, setSelectedSpecTechnicalPointId] = useState<string>('');
  const [selectedSpecMethodStandardId, setSelectedSpecMethodStandardId] = useState<string>('');
  const [selectedSpecSurfaceFinishId, setSelectedSpecSurfaceFinishId] = useState<string>('');
  const [selectedSpecScopeId, setSelectedSpecScopeId] = useState<string>('');
  const [selectedSpecFaqId, setSelectedSpecFaqId] = useState<string>('');
  const [selectedSpecWarrantyId, setSelectedSpecWarrantyId] = useState<string>('');
  const [selectedSpecDlpId, setSelectedSpecDlpId] = useState<string>('');

  // 11 Spec Lists derived from Product
  const mainMaterialsList = useMemo(() => product.main_materials || [], [product]);
  const glassSpecsList = useMemo(() => product.glass_specs || [], [product]);
  const hardwareAccessoriesList = useMemo(() => product.hardware_accessories || [], [product]);
  const customMaterialsList = useMemo(() => product.custom_materials || [], [product]);
  const technicalPointsList = useMemo(() => product.technical_details || (product as any).technical_points || [], [product]);
  const methodsStandardsList = useMemo(() => product.fabrication_methods || (product as any).methods_standards || [], [product]);
  const surfaceFinishesList = useMemo(() => product.surface_finishes_specs || (product as any).surface_finishes || [], [product]);
  const scopesExclusionsList = useMemo(() => product.installation_scopes || (product as any).scopes_exclusions || [], [product]);
  const faqsList = useMemo(() => product.product_faqs || (product as any).faqs || [], [product]);
  const warrantyTypesList = useMemo(() => product.warranty_terms_specs || (product as any).warranty_terms || [], [product]);
  const dlpFrameworksList = useMemo(() => product.dlp_frameworks || [], [product]);

  // 11-Category Multi-Factor Price Calculation Surcharges State
  const [posSurchargeSelections, setPosSurchargeSelections] = useState<Record<string, string>>({});

  useEffect(() => {
    setSelectedSpecMainMaterialId('');
    setSelectedSpecGlassId('');
    setSelectedSpecHardwareId('');
    setSelectedSpecCustomMaterialId('');
    setSelectedSpecTechnicalPointId('');
    setSelectedSpecMethodStandardId('');
    setSelectedSpecSurfaceFinishId('');
    setSelectedSpecScopeId('');
    setSelectedSpecFaqId('');
    setSelectedSpecWarrantyId('');
    setSelectedSpecDlpId('');
    setPosSurchargeSelections({});
  }, [product?.id]);

  // Customer Tier Preset Discounts Configuration
  const CUSTOMER_TIER_PRESETS = [
    { id: 'retail', name: 'Retail Customer', tier: 'Retail' as PricingTier, discountPct: 0, label: 'Retail (0%)', badge: 'Standard' },
    { id: 'silver', name: 'Silver / Frequent Buyer', tier: 'Silver' as PricingTier, discountPct: 3, label: 'Silver (3%)', badge: 'Tier 1' },
    { id: 'contractor', name: 'Contractor / Fabricator', tier: 'Contractor' as PricingTier, discountPct: 5, label: 'Contractor (5%)', badge: 'Tier 2' },
    { id: 'wholesale', name: 'Wholesale / Dealer', tier: 'Wholesale' as PricingTier, discountPct: 8, label: 'Wholesale (8%)', badge: 'Tier 3' },
    { id: 'distributor', name: 'VIP Distributor', tier: 'Distributor' as PricingTier, discountPct: 12, label: 'VIP Dist. (12%)', badge: 'VIP' },
    { id: 'corporate', name: 'Corporate Project', tier: 'Project' as PricingTier, discountPct: 15, label: 'Corporate (15%)', badge: 'Major' },
    { id: 'partner', name: 'Master Partner', tier: 'Partner' as PricingTier, discountPct: 20, label: 'Partner (20%)', badge: 'Max' },
  ];

  const [selectedCustomerPreset, setSelectedCustomerPreset] = useState<string>('retail');

  // Discounts & Additional Costs State
  const [selectedDiscountMethod, setSelectedDiscountMethod] = useState<DiscountMethod | ''>('');
  const [discountValueInput, setDiscountValueInput] = useState<number>(0);
  const [additionalCostsInput, setAdditionalCostsInput] = useState<number>(0);
  const [additionalCostsReason, setAdditionalCostsReason] = useState<string>('Custom Cutting & Fabrication');

  // Handler to select Customer Tier Preset and auto-apply discount
  const handleSelectCustomerPreset = (presetId: string) => {
    setSelectedCustomerPreset(presetId);
    const preset = CUSTOMER_TIER_PRESETS.find(p => p.id === presetId);
    if (preset) {
      if (preset.discountPct > 0) {
        setSelectedDiscountMethod('Percentage Discount');
        setDiscountValueInput(preset.discountPct);
      } else {
        setSelectedDiscountMethod('');
        setDiscountValueInput(0);
      }
      setSelectedTier(preset.tier);
    }
  };

  const basePrice = product.base_price || product.current_price;
  const costPrice = product.cost_price || Math.round(basePrice * 0.8);
  const minSellingPrice = product.min_selling_price || Math.round(basePrice * 0.9);

  // 1. Matched Region Base Rate
  const matchedRegionBaseRate = useMemo(() => {
    if (selectedRegion && product.region_prices && product.region_prices[selectedRegion] !== undefined) {
      const regVal = product.region_prices[selectedRegion];
      if (regVal > 5000) {
        return regVal;
      }
      return basePrice + regVal;
    }
    return basePrice;
  }, [product, basePrice, selectedRegion]);

  const regionDelta = matchedRegionBaseRate - basePrice;

  // 2. Compute POS pricing dynamically via variant engine
  const posCalculation = useMemo(() => {
    return resolveProductVariantPrice(product, {
      quantity,
      thickness: selectedThickness,
      finish: selectedFinish,
      colour: selectedColour,
      glass_type: selectedGlass,
      installation_option: selectedInstallation,
      tier: selectedTier,
      customer_type: selectedCustomerType,
      region: selectedRegion,
      grade: selectedGrade,
      brand: selectedBrand,
      floor_level: selectedFloorLevel,
      facility_type: selectedFacilityType,
      discount_method: selectedDiscountMethod || undefined,
      discount_value: discountValueInput || undefined,
      custom_selections: selectedCustomOptions
    });
  }, [
    product,
    quantity,
    selectedThickness,
    selectedFinish,
    selectedColour,
    selectedGlass,
    selectedInstallation,
    selectedTier,
    selectedCustomerType,
    selectedRegion,
    selectedGrade,
    selectedBrand,
    selectedFloorLevel,
    selectedFacilityType,
    selectedDiscountMethod,
    discountValueInput,
    selectedCustomOptions
  ]);

  // 3. Itemized Surcharges List
  const surchargesList = useMemo(() => {
    const list: Array<{ name: string; value: number }> = [];
    if (selectedThickness && product.thickness_prices?.[selectedThickness]) {
      list.push({ name: `Thickness [${selectedThickness}]`, value: product.thickness_prices[selectedThickness] });
    }
    if (selectedFinish && product.finish_prices?.[selectedFinish]) {
      list.push({ name: `Finish [${selectedFinish}]`, value: product.finish_prices[selectedFinish] });
    }
    if (selectedColour && product.colour_prices?.[selectedColour]) {
      list.push({ name: `Colour [${selectedColour}]`, value: product.colour_prices[selectedColour] });
    }
    if (selectedGlass && product.glass_prices?.[selectedGlass]) {
      list.push({ name: `Glass [${selectedGlass}]`, value: product.glass_prices[selectedGlass] });
    }
    if (selectedInstallation && product.installation_prices?.[selectedInstallation]) {
      list.push({ name: `Installation [${selectedInstallation}]`, value: product.installation_prices[selectedInstallation] });
    }
    if (selectedFloorLevel && product.floor_level_prices?.[selectedFloorLevel]) {
      list.push({ name: `Floor Level [${selectedFloorLevel}]`, value: product.floor_level_prices[selectedFloorLevel] });
    }
    if (selectedFacilityType && product.facility_type_prices?.[selectedFacilityType]) {
      list.push({ name: `Facility Type [${selectedFacilityType}]`, value: product.facility_type_prices[selectedFacilityType] });
    }
    if (selectedTier && product.tier_prices?.[selectedTier]) {
      list.push({ name: `Tier [${selectedTier}]`, value: product.tier_prices[selectedTier] });
    }
    if (selectedCustomerType && product.customer_type_prices?.[selectedCustomerType]) {
      list.push({ name: `Customer Type [${selectedCustomerType}]`, value: product.customer_type_prices[selectedCustomerType] });
    }
    if (selectedGrade && product.grade_prices?.[selectedGrade]) {
      list.push({ name: `Grade [${selectedGrade}]`, value: product.grade_prices[selectedGrade] });
    }
    if (selectedBrand && product.brand_prices?.[selectedBrand]) {
      list.push({ name: `Brand [${selectedBrand}]`, value: product.brand_prices[selectedBrand] });
    }

    // Dynamic Custom Categories Evaluation
    if (product.custom_option_surcharges && Array.isArray(product.custom_option_surcharges)) {
      product.custom_option_surcharges.forEach(cat => {
        const selName = selectedCustomOptions[cat.id] || selectedCustomOptions[cat.categoryName];
        if (selName) {
          const item = cat.items?.find(i => i.name === selName);
          if (item && item.surchargeLkr) {
            list.push({ name: `${cat.categoryName} [${item.name}]`, value: item.surchargeLkr });
          }
        }
      });
    }

    // 11 Selected Specification Surcharges (Selected Item Math Calculation)
    if (selectedSpecMainMaterialId) {
      const item = mainMaterialsList.find(m => m.id === selectedSpecMainMaterialId);
      if (item && item.surchargeLkr) {
        list.push({ name: `Main Material: ${item.profileName || item.materialType}`, value: item.surchargeLkr });
      }
    }
    if (selectedSpecGlassId) {
      const item = glassSpecsList.find(g => g.id === selectedSpecGlassId);
      if (item && item.surchargeLkr) {
        list.push({ name: `Glass Spec: ${item.glassType}`, value: item.surchargeLkr });
      }
    }
    if (selectedSpecHardwareId) {
      const item = hardwareAccessoriesList.find(h => h.id === selectedSpecHardwareId);
      if (item && item.surchargeLkr) {
        list.push({ name: `Hardware: ${item.name}`, value: item.surchargeLkr });
      }
    }
    if (selectedSpecCustomMaterialId) {
      const item = customMaterialsList.find(cm => cm.id === selectedSpecCustomMaterialId);
      if (item && item.surchargeLkr) {
        list.push({ name: `Custom Mat: ${item.name}`, value: item.surchargeLkr });
      }
    }
    if (selectedSpecTechnicalPointId) {
      const item = technicalPointsList.find(tp => tp.id === selectedSpecTechnicalPointId);
      if (item && item.surchargeLkr) {
        list.push({ name: `Tech Point: ${item.point.slice(0, 30)}`, value: item.surchargeLkr });
      }
    }
    if (selectedSpecMethodStandardId) {
      const item = methodsStandardsList.find(ms => ms.id === selectedSpecMethodStandardId);
      if (item && item.surchargeLkr) {
        list.push({ name: `Method/Std: ${item.methodName}`, value: item.surchargeLkr });
      }
    }
    if (selectedSpecSurfaceFinishId) {
      const item = surfaceFinishesList.find(sf => sf.id === selectedSpecSurfaceFinishId);
      if (item && item.surchargeLkr) {
        list.push({ name: `Surface Finish: ${item.finishType}`, value: item.surchargeLkr });
      }
    }
    if (selectedSpecScopeId) {
      const item = scopesExclusionsList.find(sc => sc.id === selectedSpecScopeId);
      if (item && (item.surchargeLkr || 0) > 0) {
        list.push({ name: `Scope: ${item.scopeType}`, value: item.surchargeLkr || 0 });
      }
    }
    if (selectedSpecFaqId) {
      const item = faqsList.find(f => f.id === selectedSpecFaqId);
      if (item && (item.surchargeLkr || 0) > 0) {
        list.push({ name: `FAQ Service: ${item.question.slice(0, 30)}`, value: item.surchargeLkr || 0 });
      }
    }
    if (selectedSpecWarrantyId) {
      const item = warrantyTypesList.find(w => w.id === selectedSpecWarrantyId);
      if (item && item.surchargeLkr) {
        list.push({ name: `Warranty: ${item.warrantyType}`, value: item.surchargeLkr });
      }
    }
    if (selectedSpecDlpId) {
      const item = dlpFrameworksList.find(d => d.id === selectedSpecDlpId);
      if (item) {
        const val = item.surchargeLkr || Math.round(matchedRegionBaseRate * ((item.retentionSurchargePct || 0) / 100));
        if (val > 0) {
          list.push({ name: `DLP Framework: ${item.periodMonths} Mo (${item.retentionSurchargePct || 0}%)`, value: val });
        }
      }
    }

    // 11-Category Multi-Factor Price Calculation Engine Surcharges
    const multiFactorResult = calculate11CategorySurcharges(matchedRegionBaseRate, posSurchargeSelections);
    multiFactorResult.breakdown.forEach(b => {
      list.push({
        name: `[${b.categoryId.toUpperCase()}] ${b.categoryName}: ${b.optionName}`,
        value: b.amountLkr
      });
    });

    return list;
  }, [
    product,
    selectedThickness,
    selectedFinish,
    selectedColour,
    selectedGlass,
    selectedInstallation,
    selectedTier,
    selectedCustomerType,
    selectedGrade,
    selectedBrand,
    selectedCustomOptions,
    selectedSpecMainMaterialId,
    selectedSpecGlassId,
    selectedSpecHardwareId,
    selectedSpecCustomMaterialId,
    selectedSpecTechnicalPointId,
    selectedSpecMethodStandardId,
    selectedSpecSurfaceFinishId,
    selectedSpecScopeId,
    selectedSpecFaqId,
    selectedSpecWarrantyId,
    selectedSpecDlpId,
    posSurchargeSelections,
    mainMaterialsList,
    glassSpecsList,
    hardwareAccessoriesList,
    customMaterialsList,
    technicalPointsList,
    methodsStandardsList,
    surfaceFinishesList,
    scopesExclusionsList,
    faqsList,
    warrantyTypesList,
    dlpFrameworksList,
    matchedRegionBaseRate
  ]);

  const totalSurchargesPerUnit = surchargesList.reduce((acc, item) => acc + item.value, 0);

  // 4. Enhanced Discount Calculation
  const discountDetails = useMemo(() => {
    const grossPerUnit = matchedRegionBaseRate + totalSurchargesPerUnit;
    let perUnitDiscount = 0;

    if (selectedDiscountMethod && discountValueInput > 0) {
      if (
        selectedDiscountMethod.includes('Percentage') ||
        selectedDiscountMethod.includes('Dealer') ||
        selectedDiscountMethod.includes('Promotion') ||
        selectedDiscountMethod.includes('Seasonal') ||
        selectedDiscountMethod.includes('Special Customer') ||
        selectedDiscountMethod.includes('Clearance')
      ) {
        perUnitDiscount = Math.round((grossPerUnit * discountValueInput) / 100);
      } else {
        perUnitDiscount = Math.round(discountValueInput / Math.max(1, quantity));
      }
    }

    const totalLineDiscount = perUnitDiscount * Math.max(1, quantity);

    return {
      method: selectedDiscountMethod || 'None',
      value: discountValueInput,
      perUnitDiscount,
      totalLineDiscount
    };
  }, [matchedRegionBaseRate, totalSurchargesPerUnit, selectedDiscountMethod, discountValueInput, quantity]);

  const perUnitAdditionalCosts = Math.round((additionalCostsInput || 0) / Math.max(1, quantity));

  // 5. Overall Best Price Calculation
  const bestPriceEngine = useMemo(() => {
    const grossUnitBeforeBreak = matchedRegionBaseRate + totalSurchargesPerUnit;
    let qtyBreakSavings = 0;

    if (posCalculation.matched_quantity_break) {
      qtyBreakSavings = Math.max(0, grossUnitBeforeBreak - posCalculation.matched_quantity_break.unit_price);
    }

    const netUnitPrice = Math.max(
      0,
      grossUnitBeforeBreak - qtyBreakSavings - discountDetails.perUnitDiscount + perUnitAdditionalCosts
    );

    const netLineTotal = Math.round(netUnitPrice * Math.max(1, quantity));

    return {
      matchedRegionBaseRate,
      surchargesTotal: totalSurchargesPerUnit,
      qtyBreakSavings,
      discountAmt: discountDetails.perUnitDiscount,
      additionalCosts: perUnitAdditionalCosts,
      finalUnitPrice: netUnitPrice,
      totalLinePrice: netLineTotal
    };
  }, [
    matchedRegionBaseRate,
    totalSurchargesPerUnit,
    posCalculation,
    discountDetails,
    perUnitAdditionalCosts,
    quantity
  ]);

  const handleProceed = () => {
    const specSurchargesMap: Record<string, { categoryName: string; optionName: string; surchargeLkr: number }> = {};

    if (selectedSpecMainMaterialId) {
      const item = mainMaterialsList.find(m => m.id === selectedSpecMainMaterialId);
      if (item) {
        specSurchargesMap['main_material'] = {
          categoryName: '1. Main Material',
          optionName: item.profileName || item.materialType,
          surchargeLkr: item.surchargeLkr || 0
        };
      }
    }
    if (selectedSpecGlassId) {
      const item = glassSpecsList.find(g => g.id === selectedSpecGlassId);
      if (item) {
        specSurchargesMap['glass_spec'] = {
          categoryName: '2. Glass Spec',
          optionName: item.glassType,
          surchargeLkr: item.surchargeLkr || 0
        };
      }
    }
    if (selectedSpecHardwareId) {
      const item = hardwareAccessoriesList.find(h => h.id === selectedSpecHardwareId);
      if (item) {
        specSurchargesMap['hardware'] = {
          categoryName: '3. Accessories & Hardware',
          optionName: item.name,
          surchargeLkr: item.surchargeLkr || 0
        };
      }
    }
    if (selectedSpecCustomMaterialId) {
      const item = customMaterialsList.find(cm => cm.id === selectedSpecCustomMaterialId);
      if (item) {
        specSurchargesMap['custom_material'] = {
          categoryName: '4. Custom Material',
          optionName: item.name,
          surchargeLkr: item.surchargeLkr || 0
        };
      }
    }
    if (selectedSpecTechnicalPointId) {
      const item = technicalPointsList.find(tp => tp.id === selectedSpecTechnicalPointId);
      if (item) {
        specSurchargesMap['technical_point'] = {
          categoryName: '5. Technical Point',
          optionName: item.point,
          surchargeLkr: item.surchargeLkr || 0
        };
      }
    }
    if (selectedSpecMethodStandardId) {
      const item = methodsStandardsList.find(ms => ms.id === selectedSpecMethodStandardId);
      if (item) {
        specSurchargesMap['method_standard'] = {
          categoryName: '6. Method & Standard',
          optionName: item.methodName,
          surchargeLkr: item.surchargeLkr || 0
        };
      }
    }
    if (selectedSpecSurfaceFinishId) {
      const item = surfaceFinishesList.find(sf => sf.id === selectedSpecSurfaceFinishId);
      if (item) {
        specSurchargesMap['surface_finish'] = {
          categoryName: '7. Surface Finish',
          optionName: item.finishType,
          surchargeLkr: item.surchargeLkr || 0
        };
      }
    }
    if (selectedSpecScopeId) {
      const item = scopesExclusionsList.find(sc => sc.id === selectedSpecScopeId);
      if (item) {
        specSurchargesMap['scope'] = {
          categoryName: '8. Scope / Exclusion',
          optionName: `${item.scopeType}: ${item.description}`,
          surchargeLkr: item.surchargeLkr || 0
        };
      }
    }
    if (selectedSpecFaqId) {
      const item = faqsList.find(f => f.id === selectedSpecFaqId);
      if (item) {
        specSurchargesMap['faq'] = {
          categoryName: '9. FAQ Service',
          optionName: item.question,
          surchargeLkr: item.surchargeLkr || 0
        };
      }
    }
    if (selectedSpecWarrantyId) {
      const item = warrantyTypesList.find(w => w.id === selectedSpecWarrantyId);
      if (item) {
        specSurchargesMap['warranty'] = {
          categoryName: '10. Warranty Type',
          optionName: `${item.warrantyType} (${item.timePeriod})`,
          surchargeLkr: item.surchargeLkr || 0
        };
      }
    }
    if (selectedSpecDlpId) {
      const item = dlpFrameworksList.find(d => d.id === selectedSpecDlpId);
      if (item) {
        const val = item.surchargeLkr || Math.round(matchedRegionBaseRate * ((item.retentionSurchargePct || 0) / 100));
        specSurchargesMap['dlp'] = {
          categoryName: '11. DLP Framework',
          optionName: `${item.periodMonths} Months (${item.retentionSurchargePct}% Retention)`,
          surchargeLkr: val
        };
      }
    }

    const item: QuotationItem = {
      id: `qitem-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      product_id: product.id,
      product_code: product.product_code,
      product_name: product.product_name,
      unit: product.unit,
      price_display_method: product.price_display_method || 'Standard',
      unit_price: bestPriceEngine.finalUnitPrice,
      quantity,
      weight_kg: (product.unit_weight_kg || 1) * quantity,
      total_price: bestPriceEngine.totalLinePrice,
      price_source: posCalculation.matched_quantity_break ? 'QUANTITY_BREAK' : 'COMPANY_BASE',
      price_source_label: posCalculation.break_label || `POS Matched (${selectedRegion || 'Region'})`,
      thickness_applied: selectedThickness,
      finish_applied: selectedFinish,
      colour_applied: selectedColour,
      glass_type_applied: selectedGlass,
      installation_option_applied: selectedInstallation,
      tier_applied: selectedTier,
      customer_type_applied: selectedCustomerType,
      region_applied: selectedRegion,
      grade_applied: selectedGrade,
      brand_applied: selectedBrand,
      floor_level_applied: selectedFloorLevel,
      facility_type_applied: selectedFacilityType,
      custom_options_applied: Object.keys(selectedCustomOptions).length > 0 ? Object.entries(selectedCustomOptions).reduce((acc, [catId, name]) => {
        const cat = product.custom_option_surcharges?.find(c => c.id === catId || c.categoryName === catId);
        const item = cat?.items?.find(i => i.name === name);
        if (cat && item) {
          acc[catId] = { categoryName: cat.categoryName, optionName: item.name, surchargeLkr: item.surchargeLkr };
        }
        return acc;
      }, {} as Record<string, { categoryName: string; optionName: string; surchargeLkr: number }>) : undefined,
      spec_surcharges_applied: Object.keys(specSurchargesMap).length > 0 ? specSurchargesMap : undefined
    };

    if (onProceedToQuotation) {
      onProceedToQuotation(item);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-white flex flex-col h-screen w-screen overflow-hidden">
      <div className="bg-white w-full h-full flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="bg-slate-900 text-white px-4 py-3 flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-md bg-orange-500/20 border border-orange-500/30 flex items-center justify-center text-orange-400 font-mono font-semibold text-xs shrink-0">
              {product.product_code}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-sm font-semibold text-white">{product.product_name}</h3>
                <span className="bg-slate-800 text-slate-300 border border-slate-700 text-[10px] px-2 py-0.2 rounded-md font-semibold">
                  {product.category}
                </span>
                <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] px-2 py-0.2 rounded-md font-semibold uppercase">
                  {product.status || 'Active'}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Master Rate: <strong className="text-white">Rs. {basePrice.toLocaleString()}</strong> per {product.unit} | Unit Wt: {product.unit_weight_kg || 0} kg
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* WARRANTY PDF BUTTON */}
            <button
              type="button"
              onClick={() => setShowPrintWarrantyModal(true)}
              className="bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-bold text-xs px-2.5 py-1.5 rounded-lg transition-all flex items-center space-x-1.5 shadow-2xs cursor-pointer border border-emerald-400/40"
              title="Generate Official Warranty PDF Certificate for Client"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-200" />
              <span>Warranty</span>
            </button>

            {/* PRINT SPECS BUTTON */}
            <button
              type="button"
              onClick={() => setShowPrintSpecModal(true)}
              className="bg-amber-400 hover:bg-amber-300 active:bg-amber-500 text-slate-950 font-bold text-xs px-2.5 py-1.5 rounded-lg transition-all flex items-center space-x-1.5 shadow-2xs cursor-pointer border border-amber-300"
              title="Print Complete Product Specifications and Price Schedule"
            >
              <Printer className="w-3.5 h-3.5 text-slate-950" />
              <span>Specs</span>
            </button>

            {/* ADMIN ACTIONS (EDIT, ADD, DELETE) */}
            {isHO && (
              <div className="flex items-center space-x-1.5 border-l border-slate-700/80 pl-2">
                <button
                  type="button"
                  onClick={() => {
                    if (onEditProduct) onEditProduct(product);
                  }}
                  className="bg-slate-800 hover:bg-slate-700 active:bg-slate-600 text-slate-200 hover:text-white px-2.5 py-1.5 rounded-lg text-xs font-semibold transition flex items-center space-x-1 border border-slate-700 cursor-pointer"
                  title="Edit Master Product Details"
                >
                  <Edit3 className="w-3.5 h-3.5 text-amber-400" />
                  <span>Edit</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (onEditProduct) onEditProduct(product);
                  }}
                  className="bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white px-2.5 py-1.5 rounded-lg text-xs font-semibold transition flex items-center space-x-1 cursor-pointer border border-blue-500/50"
                  title="Add New Specs or Options Data"
                >
                  <Plus className="w-3.5 h-3.5 text-white" />
                  <span>Add</span>
                </button>

                {onDeleteProduct && (
                  <button
                    type="button"
                    onClick={() => {
                      if (onDeleteProduct) onDeleteProduct(product.id);
                    }}
                    className="bg-rose-950/80 hover:bg-rose-800 text-rose-200 border border-rose-800/80 p-1.5 rounded-lg text-xs font-semibold transition flex items-center justify-center cursor-pointer"
                    title="Delete Product SKU (Admin Only)"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            )}

            {/* View vs POS Tab Switches */}
            <div className="bg-slate-950 p-1 rounded-xl flex items-center space-x-1 border border-slate-800 ml-1">
              <button
                type="button"
                onClick={() => setActiveTab('pos')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer ${
                  activeTab === 'pos'
                    ? 'bg-orange-500 text-white shadow-sm border border-orange-400/50'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
                title="POS Quick Quote Mode"
              >
                <Calculator className="w-3.5 h-3.5 text-amber-200" />
                <span>Quote</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('view')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer ${
                  activeTab === 'view'
                    ? 'bg-orange-500 text-white shadow-sm border border-orange-400/50'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
                title="All Master Data & Options View (Admin Only)"
              >
                <Info className="w-3.5 h-3.5" />
                <span>Master</span>
                {!isHO && <Shield className="w-3 h-3 text-amber-400 ml-0.5" />}
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('audit')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer ${
                  activeTab === 'audit'
                    ? 'bg-orange-500 text-white shadow-sm border border-orange-400/50'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
                title="Product Audit Log & Specification Ledger"
              >
                <Clock className="w-3.5 h-3.5" />
                <span>Audit Trail</span>
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded-md transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-50 space-y-6">

          {/* MODE 1: POS QUICK QUOTATION SYSTEM */}
          {activeTab === 'pos' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Left Column: POS Variant Configuration */}
              <div className="lg:col-span-7 bg-white border border-slate-200 rounded-md p-5 shadow-2xs space-y-5">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <h4 className="text-xs font-semibold text-slate-900 flex items-center space-x-2 uppercase tracking-wider">
                      <Sliders className="w-4 h-4 text-orange-500" />
                      <span>POS Specification & Multi-Factor Engine</span>
                    </h4>
                    <p className="text-[11px] text-slate-500 font-medium">Configure parameters to compute live multi-factor quotation rate</p>
                  </div>
                  <span className="bg-slate-100 text-slate-700 px-2.5 py-1 rounded-sm text-[11px] font-semibold uppercase">
                    {product.unit}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  
                  {/* Thickness */}
                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-700">Thickness Grade</label>
                    <select
                      value={selectedThickness || ''}
                      onChange={(e) => setSelectedThickness(e.target.value as MaterialThickness)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {THICKNESS_OPTIONS.map((t) => (
                        <option key={t} value={t}>
                          {t} {product.thickness_prices?.[t] ? `(+Rs. ${product.thickness_prices[t]})` : ''}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Surface Finish */}
                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-700">Surface Finish</label>
                    <select
                      value={selectedFinish || ''}
                      onChange={(e) => setSelectedFinish(e.target.value as MaterialFinish)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {FINISH_OPTIONS.map((f) => (
                        <option key={f} value={f}>
                          {f} {product.finish_prices?.[f] ? `(+Rs. ${product.finish_prices[f]})` : ''}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Anodizing Colour */}
                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-700">Anodizing Colour</label>
                    <select
                      value={selectedColour || ''}
                      onChange={(e) => setSelectedColour(e.target.value as MaterialColour)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {COLOUR_OPTIONS.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>

                  {/* Glass Type */}
                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-700">Glass Specification</label>
                    <select
                      value={selectedGlass || ''}
                      onChange={(e) => setSelectedGlass(e.target.value as GlassType)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {GLASS_TYPES.map((g) => (
                        <option key={g} value={g}>
                          {g} {product.glass_prices?.[g] ? `(+Rs. ${product.glass_prices[g]})` : ''}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Installation Option */}
                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-700">Installation Mode</label>
                    <select
                      value={selectedInstallation || ''}
                      onChange={(e) => setSelectedInstallation(e.target.value as InstallationOption)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {INSTALLATION_OPTIONS.map((inst) => (
                        <option key={inst} value={inst}>
                          {inst} {product.installation_prices?.[inst] ? `(+Rs. ${product.installation_prices[inst]})` : ''}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Building Floor Level */}
                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-700">Building Floor Level / Height</label>
                    <select
                      value={selectedFloorLevel || ''}
                      onChange={(e) => setSelectedFloorLevel(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">-- Standard Floor (0-3m) --</option>
                      {FLOOR_LEVEL_OPTIONS.map((fl) => (
                        <option key={fl} value={fl}>
                          {fl} {product.floor_level_prices?.[fl] ? `(+Rs. ${product.floor_level_prices[fl]})` : ''}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Facility / Site Type */}
                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-700">Facility / Site Environment</label>
                    <select
                      value={selectedFacilityType || ''}
                      onChange={(e) => setSelectedFacilityType(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">-- Standard Site --</option>
                      {FACILITY_TYPE_OPTIONS.map((ft) => (
                        <option key={ft} value={ft}>
                          {ft} {product.facility_type_prices?.[ft] ? `(+Rs. ${product.facility_type_prices[ft]})` : ''}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Render Custom Dynamic Surcharge Category Selectors */}
                  {product.custom_option_surcharges && product.custom_option_surcharges.map((cat) => (
                    <div key={cat.id} className="space-y-1.5 bg-purple-50/50 p-2 rounded-xl border border-purple-200">
                      <label className="font-bold text-purple-950 flex items-center justify-between text-xs">
                        <span>{cat.categoryName}</span>
                        <span className="text-[9px] uppercase font-bold text-purple-700 bg-purple-100 px-1.5 py-0.5 rounded">
                          Custom Surcharge
                        </span>
                      </label>
                      <select
                        value={selectedCustomOptions[cat.id] || ''}
                        onChange={(e) => setSelectedCustomOptions(prev => ({ ...prev, [cat.id]: e.target.value }))}
                        className="w-full bg-white border border-purple-200 rounded-lg px-2.5 py-1.5 font-bold text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-purple-500"
                      >
                        <option value="">-- Standard / None --</option>
                        {cat.items?.map((item) => (
                          <option key={item.id} value={item.name}>
                            {item.name} {item.surchargeLkr ? `(+Rs. ${item.surchargeLkr})` : ''}
                          </option>
                        ))}
                      </select>
                    </div>
                  ))}

                  {/* Customer Tier */}
                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-700">Pricing Tier</label>
                    <select
                      value={selectedTier || ''}
                      onChange={(e) => setSelectedTier(e.target.value as PricingTier)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {PRICING_TIERS.map((tier) => (
                        <option key={tier} value={tier}>
                          {tier} {product.tier_prices?.[tier] ? `(+Rs. ${product.tier_prices[tier]})` : ''}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Delivery Region Zone */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="font-bold text-slate-700">Geographic Region Zone</label>
                      {product.region_prices?.[selectedRegion || ''] !== undefined && (
                        <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 rounded border border-emerald-200">
                          Matched Region Rate
                        </span>
                      )}
                    </div>
                    <select
                      value={selectedRegion || ''}
                      onChange={(e) => setSelectedRegion(e.target.value as RegionZone)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {REGION_ZONES.map((rz) => (
                        <option key={rz} value={rz}>
                          {rz} {product.region_prices?.[rz] !== undefined ? `(Rs. ${matchedRegionBaseRate.toLocaleString()})` : ''}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Quantity Counter */}
                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-700">Quantity ({product.unit}s)</label>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="w-9 h-9 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl flex items-center justify-center font-bold transition"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <input
                        type="number"
                        min="1"
                        value={quantity}
                        onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                        className="w-20 text-center bg-slate-50 border border-slate-200 rounded-xl py-1.5 font-extrabold text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <button
                        onClick={() => setQuantity(quantity + 1)}
                        className="w-9 h-9 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl flex items-center justify-center font-bold transition"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                </div>

                {/* 11 SPECIFICATION CATEGORIES & SURCHARGE CALCULATOR ENGINE */}
                <div className="border-t border-slate-200 pt-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Layers className="w-4 h-4 text-orange-600" />
                      <span className="text-xs font-black text-slate-900 uppercase tracking-wider">
                        Engineering Specification Categories & Surcharges (11 Modules)
                      </span>
                    </div>
                    <span className="text-[10px] font-bold text-orange-700 bg-orange-50 px-2.5 py-0.5 rounded-full border border-orange-200">
                      Itemized Surcharge Engine
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 font-medium">
                    Select specific options from the 11 spec categories below. Surcharges compute mathematically into unit rate upon selection. Keep set to "None" for base calculation.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 text-xs">

                    {/* 1. Main Materials */}
                    <div className="space-y-1 bg-slate-50/90 p-2.5 rounded-xl border border-slate-200">
                      <div className="flex items-center justify-between">
                        <label className="font-bold text-slate-800">1. Main Materials ({mainMaterialsList.length})</label>
                        {selectedSpecMainMaterialId && <span className="text-[9px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">Active</span>}
                      </div>
                      <select
                        value={selectedSpecMainMaterialId}
                        onChange={(e) => setSelectedSpecMainMaterialId(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500"
                      >
                        <option value="">-- None / Standard (0) --</option>
                        {mainMaterialsList.map(item => (
                          <option key={item.id} value={item.id}>
                            {item.profileName || item.materialType} ({item.sizeDimensions || 'Std'}) {item.surchargeLkr ? `(+Rs. ${item.surchargeLkr.toLocaleString()})` : ''}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* 2. Glass Specs */}
                    <div className="space-y-1 bg-slate-50/90 p-2.5 rounded-xl border border-slate-200">
                      <div className="flex items-center justify-between">
                        <label className="font-bold text-slate-800">2. Glass Specs ({glassSpecsList.length})</label>
                        {selectedSpecGlassId && <span className="text-[9px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">Active</span>}
                      </div>
                      <select
                        value={selectedSpecGlassId}
                        onChange={(e) => setSelectedSpecGlassId(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500"
                      >
                        <option value="">-- None / Standard (0) --</option>
                        {glassSpecsList.map(item => (
                          <option key={item.id} value={item.id}>
                            {item.glassType} ({item.thicknessMm || 'Std'}) {item.surchargeLkr ? `(+Rs. ${item.surchargeLkr.toLocaleString()})` : ''}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* 3. Accessories & Hardware */}
                    <div className="space-y-1 bg-slate-50/90 p-2.5 rounded-xl border border-slate-200">
                      <div className="flex items-center justify-between">
                        <label className="font-bold text-slate-800">3. Accessories & Hardware ({hardwareAccessoriesList.length})</label>
                        {selectedSpecHardwareId && <span className="text-[9px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">Active</span>}
                      </div>
                      <select
                        value={selectedSpecHardwareId}
                        onChange={(e) => setSelectedSpecHardwareId(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500"
                      >
                        <option value="">-- None / Standard (0) --</option>
                        {hardwareAccessoriesList.map(item => (
                          <option key={item.id} value={item.id}>
                            {item.name} ({item.hardwareType || 'Accessory'}) {item.surchargeLkr ? `(+Rs. ${item.surchargeLkr.toLocaleString()})` : ''}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* 4. Custom Materials */}
                    <div className="space-y-1 bg-slate-50/90 p-2.5 rounded-xl border border-slate-200">
                      <div className="flex items-center justify-between">
                        <label className="font-bold text-slate-800">4. Custom Materials ({customMaterialsList.length})</label>
                        {selectedSpecCustomMaterialId && <span className="text-[9px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">Active</span>}
                      </div>
                      <select
                        value={selectedSpecCustomMaterialId}
                        onChange={(e) => setSelectedSpecCustomMaterialId(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500"
                      >
                        <option value="">-- None / Standard (0) --</option>
                        {customMaterialsList.map(item => (
                          <option key={item.id} value={item.id}>
                            {item.name} ({item.materialType || 'Custom'}) {item.surchargeLkr ? `(+Rs. ${item.surchargeLkr.toLocaleString()})` : ''}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* 5. Technical Points */}
                    <div className="space-y-1 bg-slate-50/90 p-2.5 rounded-xl border border-slate-200">
                      <div className="flex items-center justify-between">
                        <label className="font-bold text-slate-800">5. Technical Points ({technicalPointsList.length})</label>
                        {selectedSpecTechnicalPointId && <span className="text-[9px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">Active</span>}
                      </div>
                      <select
                        value={selectedSpecTechnicalPointId}
                        onChange={(e) => setSelectedSpecTechnicalPointId(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500"
                      >
                        <option value="">-- None / Standard (0) --</option>
                        {technicalPointsList.map(item => (
                          <option key={item.id} value={item.id}>
                            {item.point} {item.surchargeLkr ? `(+Rs. ${item.surchargeLkr.toLocaleString()})` : ''}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* 6. Methods & Standards */}
                    <div className="space-y-1 bg-slate-50/90 p-2.5 rounded-xl border border-slate-200">
                      <div className="flex items-center justify-between">
                        <label className="font-bold text-slate-800">6. Methods & Standards ({methodsStandardsList.length})</label>
                        {selectedSpecMethodStandardId && <span className="text-[9px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">Active</span>}
                      </div>
                      <select
                        value={selectedSpecMethodStandardId}
                        onChange={(e) => setSelectedSpecMethodStandardId(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500"
                      >
                        <option value="">-- None / Standard (0) --</option>
                        {methodsStandardsList.map(item => (
                          <option key={item.id} value={item.id}>
                            {item.methodName} {item.surchargeLkr ? `(+Rs. ${item.surchargeLkr.toLocaleString()})` : ''}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* 7. Surface Finishes */}
                    <div className="space-y-1 bg-slate-50/90 p-2.5 rounded-xl border border-slate-200">
                      <div className="flex items-center justify-between">
                        <label className="font-bold text-slate-800">7. Surface Finishes ({surfaceFinishesList.length})</label>
                        {selectedSpecSurfaceFinishId && <span className="text-[9px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">Active</span>}
                      </div>
                      <select
                        value={selectedSpecSurfaceFinishId}
                        onChange={(e) => setSelectedSpecSurfaceFinishId(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500"
                      >
                        <option value="">-- None / Standard (0) --</option>
                        {surfaceFinishesList.map(item => (
                          <option key={item.id} value={item.id}>
                            {item.finishType} {item.surchargeLkr ? `(+Rs. ${item.surchargeLkr.toLocaleString()})` : ''}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* 8. Scopes & Exclusions */}
                    <div className="space-y-1 bg-slate-50/90 p-2.5 rounded-xl border border-slate-200">
                      <div className="flex items-center justify-between">
                        <label className="font-bold text-slate-800">8. Scopes & Exclusions ({scopesExclusionsList.length})</label>
                        {selectedSpecScopeId && <span className="text-[9px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">Active</span>}
                      </div>
                      <select
                        value={selectedSpecScopeId}
                        onChange={(e) => setSelectedSpecScopeId(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500"
                      >
                        <option value="">-- None / Standard (0) --</option>
                        {scopesExclusionsList.map(item => (
                          <option key={item.id} value={item.id}>
                            {item.scopeType}: {item.description.slice(0, 30)}... {item.surchargeLkr ? `(+Rs. ${item.surchargeLkr.toLocaleString()})` : ''}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* 9. FAQs */}
                    <div className="space-y-1 bg-slate-50/90 p-2.5 rounded-xl border border-slate-200">
                      <div className="flex items-center justify-between">
                        <label className="font-bold text-slate-800">9. FAQs ({faqsList.length})</label>
                        {selectedSpecFaqId && <span className="text-[9px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">Active</span>}
                      </div>
                      <select
                        value={selectedSpecFaqId}
                        onChange={(e) => setSelectedSpecFaqId(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500"
                      >
                        <option value="">-- None / Standard (0) --</option>
                        {faqsList.map(item => (
                          <option key={item.id} value={item.id}>
                            Q: {item.question.slice(0, 30)}... {item.surchargeLkr ? `(+Rs. ${item.surchargeLkr.toLocaleString()})` : ''}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* 10. Warranty Types */}
                    <div className="space-y-1 bg-slate-50/90 p-2.5 rounded-xl border border-slate-200">
                      <div className="flex items-center justify-between">
                        <label className="font-bold text-slate-800">10. Warranty Types ({warrantyTypesList.length})</label>
                        {selectedSpecWarrantyId && <span className="text-[9px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">Active</span>}
                      </div>
                      <select
                        value={selectedSpecWarrantyId}
                        onChange={(e) => setSelectedSpecWarrantyId(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500"
                      >
                        <option value="">-- None / Standard (0) --</option>
                        {warrantyTypesList.map(item => (
                          <option key={item.id} value={item.id}>
                            {item.warrantyType} ({item.timePeriod}) {item.surchargeLkr ? `(+Rs. ${item.surchargeLkr.toLocaleString()})` : ''}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* 11. DLP Frameworks */}
                    <div className="space-y-1 bg-slate-50/90 p-2.5 rounded-xl border border-slate-200 col-span-1 sm:col-span-2">
                      <div className="flex items-center justify-between">
                        <label className="font-bold text-slate-800">11. DLP Frameworks ({dlpFrameworksList.length})</label>
                        {selectedSpecDlpId && <span className="text-[9px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">Active</span>}
                      </div>
                      <select
                        value={selectedSpecDlpId}
                        onChange={(e) => setSelectedSpecDlpId(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500"
                      >
                        <option value="">-- None / Standard (0) --</option>
                        {dlpFrameworksList.map(item => {
                          const calcVal = item.surchargeLkr || Math.round(matchedRegionBaseRate * ((item.retentionSurchargePct || 0) / 100));
                          return (
                            <option key={item.id} value={item.id}>
                              {item.periodMonths} Months DLP ({item.retentionSurchargePct}% Retention) {calcVal > 0 ? `(+Rs. ${calcVal.toLocaleString()})` : ''}
                            </option>
                          );
                        })}
                      </select>
                    </div>

                  </div>
                </div>

                {/* 11-CATEGORY MULTI-FACTOR PRICE CALCULATION SURCHARGES ENGINE */}
                <div className="bg-amber-50/50 border border-amber-200 rounded-2xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Sliders className="w-4 h-4 text-amber-600" />
                      <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                        Multi-Factor Price Engine (11 POS Surcharge Categories)
                      </span>
                    </div>
                    <span className="bg-amber-100 text-amber-800 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border border-amber-300">
                      11 SPECS ENGINE
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 text-xs">
                    {POS_SURCHARGE_CATEGORIES.map((cat) => {
                      const selectedOptId = posSurchargeSelections[cat.id] || '';
                      return (
                        <div key={cat.id} className="bg-white p-2.5 rounded-xl border border-amber-200/80 shadow-2xs space-y-1">
                          <div className="flex items-center justify-between text-[11px] font-bold text-slate-800">
                            <span>{cat.name}</span>
                            <span className="text-[9px] font-mono font-bold text-slate-400">{cat.code}</span>
                          </div>
                          <select
                            value={selectedOptId}
                            onChange={(e) => setPosSurchargeSelections(prev => ({ ...prev, [cat.id]: e.target.value }))}
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 text-xs font-bold text-slate-800 focus:bg-white focus:border-amber-500 focus:outline-none"
                          >
                            {cat.options.map((opt) => {
                              let label = opt.name;
                              if (!opt.isDefaultNone && opt.value > 0) {
                                if (opt.type === 'percentage') {
                                  const approxLkr = Math.round((matchedRegionBaseRate * opt.value) / 100);
                                  label += ` (+${opt.value}% / ~Rs. ${approxLkr.toLocaleString()})`;
                                } else {
                                  label += ` (+Rs. ${opt.value.toLocaleString()})`;
                                }
                              }
                              return (
                                <option key={opt.id} value={opt.id}>
                                  {label}
                                </option>
                              );
                            })}
                          </select>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* CUSTOMER TIER PRESET DISCOUNTS & PRICE CALCULATOR BLOCK */}
                <div className="border-t border-slate-100 pt-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center space-x-1.5">
                      <Tag className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Customer Tier Preset Discounts & Pricing</span>
                    </span>
                    <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                      Auto-Calculated Rates
                    </span>
                  </div>

                  {/* Preset Customer Tier Pills */}
                  <div>
                    <label className="text-[11px] font-semibold text-slate-600 block mb-1.5">
                      Select Customer Tier Preset (Auto-Applies Discount & Tier Price)
                    </label>
                    <div className="flex flex-wrap gap-1.5">
                      {CUSTOMER_TIER_PRESETS.map((preset) => {
                        const isSelected = selectedCustomerPreset === preset.id;
                        return (
                          <button
                            key={preset.id}
                            type="button"
                            onClick={() => handleSelectCustomerPreset(preset.id)}
                            className={`px-2.5 py-1.5 rounded-lg text-xs font-bold border transition flex items-center space-x-1 cursor-pointer ${
                              isSelected
                                ? 'bg-orange-500 text-white border-orange-600 shadow-xs'
                                : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                            }`}
                          >
                            <span>{preset.label}</span>
                            <span
                              className={`text-[9px] px-1 py-0.2 rounded font-mono ${
                                isSelected ? 'bg-orange-600 text-white' : 'bg-slate-200 text-slate-600'
                              }`}
                            >
                              {preset.badge}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Manual Discount Method & Custom Overrides */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
                    <div>
                      <label className="text-[11px] font-semibold text-slate-600 block mb-1">Discount Method / Rule</label>
                      <select
                        value={selectedDiscountMethod}
                        onChange={(e) => setSelectedDiscountMethod(e.target.value as DiscountMethod | '')}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-medium"
                      >
                        <option value="">No Special Discount (Base Rate)</option>
                        <option value="Percentage Discount">Percentage Discount (%)</option>
                        <option value="Fixed Discount">Fixed Amount Discount (Rs.)</option>
                        <option value="Dealer Discount">Dealer Discount (%)</option>
                        <option value="Promotion">Promotion / Campaign (%)</option>
                        <option value="Special Customer Discount">Special Customer Contract (%)</option>
                        <option value="Negotiated Discount">Negotiated Manual Discount (Rs.)</option>
                        <option value="Clearance Discount">Clearance Discount (%)</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold text-slate-600 block mb-1">Discount Rate / Amount</label>
                      <div className="relative">
                        <input
                          type="number"
                          min="0"
                          placeholder="e.g. 5, 10 or 1500"
                          value={discountValueInput || ''}
                          onChange={(e) => setDiscountValueInput(parseFloat(e.target.value) || 0)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-mono font-bold pr-12 text-slate-900"
                        />
                        <span className="absolute right-2.5 top-2 text-[10px] font-mono font-bold text-slate-400">
                          {selectedDiscountMethod.includes('Percentage') || selectedDiscountMethod.includes('Dealer') || selectedDiscountMethod.includes('Promotion') || selectedDiscountMethod.includes('Clearance') || selectedDiscountMethod.includes('Special') ? '%' : 'LKR'}
                        </span>
                      </div>
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold text-slate-600 block mb-1">Additional Cost Reason</label>
                      <input
                        type="text"
                        value={additionalCostsReason}
                        onChange={(e) => setAdditionalCostsReason(e.target.value)}
                        placeholder="e.g. Edge Polishing & Mitre Cut"
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-800"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold text-slate-600 block mb-1">Additional Processing Fee (LKR)</label>
                      <input
                        type="number"
                        min="0"
                        placeholder="0"
                        value={additionalCostsInput || ''}
                        onChange={(e) => setAdditionalCostsInput(parseFloat(e.target.value) || 0)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-mono font-bold text-slate-900"
                      />
                    </div>
                  </div>

                  {/* Live Discount Impact Banner */}
                  {discountDetails.perUnitDiscount > 0 && (
                    <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-2.5 flex items-center justify-between text-xs text-emerald-900 animate-fade-in">
                      <div className="flex items-center space-x-1.5 font-semibold">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>Discount Applied:</span>
                        <span className="font-bold text-emerald-800">{discountDetails.method} ({discountDetails.value}%)</span>
                      </div>
                      <div className="font-mono font-bold text-emerald-800 bg-emerald-100/80 px-2 py-0.5 rounded border border-emerald-300">
                        Savings: Rs. {discountDetails.perUnitDiscount.toLocaleString()}/unit (Total: Rs. {discountDetails.totalLineDiscount.toLocaleString()})
                      </div>
                    </div>
                  )}
                </div>

                {/* Surcharges & Notes breakdown */}
                {posCalculation.breakdown_notes.length > 0 && (
                  <div className="bg-blue-50/70 border border-blue-200/80 rounded-xl p-3.5 space-y-1.5 text-xs text-blue-900">
                    <div className="font-extrabold flex items-center space-x-1.5 text-blue-800">
                      <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                      <span>Live Variant Engine Surcharges Applied:</span>
                    </div>
                    <ul className="list-disc list-inside space-y-0.5 text-[11px] font-medium text-slate-700">
                      {posCalculation.breakdown_notes.map((note, idx) => (
                        <li key={idx}>{note}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Right Column: POS Checkout & Detailed Price Breakdown Card (Light List View with Box Detail Rows) */}
              <div className="lg:col-span-5 bg-white rounded-2xl p-5 shadow-sm border border-slate-200 flex flex-col justify-between space-y-5">
                <div>
                  {/* Panel Header */}
                  <div className="flex items-center justify-between border-b border-slate-200/80 pb-3">
                    <div>
                      <span className="inline-block bg-amber-100/80 text-amber-900 border border-amber-300/60 px-2 py-0.5 rounded-md font-mono font-bold text-[10px] uppercase tracking-wider mb-1">
                        POS Quick Price Calculation
                      </span>
                      <h4 className="text-base font-black text-slate-900 tracking-tight">{product.product_code} — {product.product_name}</h4>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-[10px] text-slate-500 uppercase font-extrabold block">Qty</span>
                      <span className="text-sm font-black text-slate-900 bg-slate-100 border border-slate-200 px-2.5 py-0.5 rounded-lg inline-block">
                        {quantity} {product.unit}s
                      </span>
                    </div>
                  </div>

                  {/* ITEMIZATION BREAKDOWN LIST VIEW WITH BOX DETAIL ROWS */}
                  <div className="mt-4 space-y-2 text-xs">
                    
                    {/* Box Row 1: Matched Region Base Price */}
                    <div className="bg-slate-50/80 hover:bg-slate-50 border border-slate-200/90 rounded-xl p-3 flex items-center justify-between transition-all shadow-2xs">
                      <div>
                        <span className="text-[10px] text-slate-500 font-extrabold uppercase tracking-wider block">Matched Region Base Price</span>
                        <span className="font-bold text-slate-800 text-xs">{selectedRegion || 'Colombo Zone 1'}</span>
                      </div>
                      <span className="font-mono font-black text-slate-900 text-sm bg-white px-2.5 py-1 rounded-md border border-slate-200/80 shadow-2xs">
                        Rs. {matchedRegionBaseRate.toLocaleString()}
                      </span>
                    </div>

                    {/* Box Row 2: All Spec Surcharges Details */}
                    <div className="bg-slate-50/80 border border-slate-200/90 rounded-xl p-3 space-y-2 shadow-2xs">
                      <div className="flex items-center justify-between border-b border-slate-200/80 pb-1.5">
                        <span className="text-[10px] text-slate-600 font-extrabold uppercase tracking-wider">Spec Surcharges Details</span>
                        <span className="font-mono font-bold text-amber-800 bg-amber-50 border border-amber-200/80 px-2 py-0.5 rounded-md text-[11px]">
                          +Rs. {totalSurchargesPerUnit.toLocaleString()}/unit
                        </span>
                      </div>
                      {surchargesList.length === 0 ? (
                        <p className="text-[10px] text-slate-400 italic">No spec surcharges added (Standard Base)</p>
                      ) : (
                        <div className="space-y-1.5 divide-y divide-slate-200/50">
                          {surchargesList.map((s, i) => (
                            <div key={i} className="pt-1 flex items-center justify-between text-[11px]">
                              <span className="font-semibold text-slate-700">{s.name}:</span>
                              <span className="font-mono font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200/60">+Rs. {s.value.toLocaleString()}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Box Row 3: Best Price Engine Guarantee */}
                    {posCalculation.matched_quantity_break && (
                      <div className="bg-emerald-50/90 border border-emerald-200 rounded-xl p-3 text-emerald-900 space-y-1 shadow-2xs">
                        <div className="flex items-center justify-between font-extrabold">
                          <span className="flex items-center space-x-1.5 text-emerald-800">
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            <span className="text-xs">Best Price Guarantee Applied</span>
                          </span>
                          <span className="font-mono font-bold text-emerald-800 bg-emerald-100/80 px-2 py-0.5 rounded border border-emerald-300/60 text-xs">
                            -Rs. {bestPriceEngine.qtyBreakSavings.toLocaleString()}/unit
                          </span>
                        </div>
                        <p className="text-[10px] text-emerald-700 font-medium">
                          {posCalculation.break_label} (Unit Rate: Rs. {posCalculation.matched_quantity_break.unit_price.toLocaleString()})
                        </p>
                      </div>
                    )}

                    {/* Box Row 4: Customer Tier Preset Discount Details */}
                    {discountDetails.perUnitDiscount > 0 ? (
                      <div className="bg-emerald-50/90 border border-emerald-200 rounded-xl p-3 space-y-1 text-emerald-900 shadow-2xs">
                        <div className="flex items-center justify-between font-bold text-xs">
                          <span className="flex items-center space-x-1.5 text-emerald-800">
                            <Tag className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            <span>Customer Tier Discount ({discountDetails.method}):</span>
                          </span>
                          <span className="font-mono font-bold text-emerald-800 bg-emerald-100/90 px-2 py-0.5 rounded border border-emerald-300">
                            -Rs. {discountDetails.perUnitDiscount.toLocaleString()}/unit
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-[10px] text-emerald-700 font-medium font-mono pt-0.5">
                          <span>Applied Tier: {CUSTOMER_TIER_PRESETS.find(p => p.id === selectedCustomerPreset)?.name || selectedTier || 'Preset'}</span>
                          <span>Line Savings: -Rs. {discountDetails.totalLineDiscount.toLocaleString()}</span>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-slate-50/80 border border-slate-200/90 rounded-xl p-2.5 flex items-center justify-between text-xs text-slate-500">
                        <span className="text-[10px] font-semibold">Customer Tier Discount:</span>
                        <span className="font-mono text-[11px] font-bold text-slate-400">Rs. 0 (Standard Retail)</span>
                      </div>
                    )}

                    {/* Box Row 5: Additional Costs Details */}
                    {additionalCostsInput > 0 && (
                      <div className="bg-slate-50/80 border border-slate-200/90 rounded-xl p-3 flex items-center justify-between text-xs text-slate-800 shadow-2xs">
                        <span className="font-semibold text-slate-700">Additional Fee ({additionalCostsReason || 'Processing'}):</span>
                        <span className="font-mono font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200/80">
                          +Rs. {perUnitAdditionalCosts.toLocaleString()}/unit
                        </span>
                      </div>
                    )}

                    {/* Box Row 6: Calculated Unit Price & Weight */}
                    <div className="bg-white border-2 border-slate-200 rounded-xl p-3 flex items-center justify-between shadow-2xs">
                      <div>
                        <span className="text-[10px] text-slate-500 font-extrabold uppercase tracking-wider block">Calculated Unit Price Rate</span>
                        <span className="text-[10px] text-slate-500 font-medium">Est Total Weight: {((product.unit_weight_kg || 1) * quantity).toFixed(1)} kg</span>
                      </div>
                      <span className="font-mono font-black text-slate-900 text-base">
                        Rs. {bestPriceEngine.finalUnitPrice.toLocaleString()}
                      </span>
                    </div>

                    {/* Box Row 7: TOTAL LINE QUOTATION PRICE CARD */}
                    <div className="bg-slate-900 text-white rounded-xl p-4 flex items-center justify-between shadow-md border border-slate-800">
                      <div>
                        <span className="text-[10px] text-slate-400 block font-bold uppercase tracking-wider">
                          Total Line Quotation Price
                        </span>
                        <span className="text-[10px] text-amber-400/90 font-mono">All Surcharges & Customer Tier Discounts Applied</span>
                      </div>
                      <div className="text-2xl font-black text-amber-400 tracking-tight font-mono">
                        Rs. {bestPriceEngine.totalLinePrice.toLocaleString()}
                      </div>
                    </div>

                  </div>
                </div>

                {/* ADD TO QUOTATION BUTTON */}
                <div className="space-y-2 pt-2">
                  <button
                    onClick={handleProceed}
                    className="w-full bg-orange-500 hover:bg-orange-600 active:scale-[0.99] text-white font-extrabold text-xs py-3.5 px-4 rounded-xl shadow-md transition flex items-center justify-center space-x-2 border border-orange-400/40 group cursor-pointer"
                  >
                    <ShoppingCart className="w-4 h-4 text-orange-100 group-hover:scale-110 transition" />
                    <span>Add to Quotation</span>
                    <ArrowRight className="w-4 h-4 text-orange-100 group-hover:translate-x-1 transition" />
                  </button>
                  <p className="text-[10px] text-slate-500 text-center font-medium">
                    Instantly loads configured variant into Order & Billing Panel
                  </p>
                </div>

              </div>

            </div>
          )}

          {/* MODE 2: FULL MASTER DATA VIEW (RESTRICTED TO ADMIN / HO) */}
          {activeTab === 'view' && !isHO && (
            <div className="bg-slate-900 border border-slate-800 text-white rounded-2xl p-8 my-6 text-center space-y-5 max-w-2xl mx-auto shadow-2xl">
              <div className="w-16 h-16 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center mx-auto shadow-lg">
                <ShieldCheck className="w-8 h-8 text-amber-400" />
              </div>
              <div className="space-y-2">
                <span className="bg-amber-500/20 text-amber-300 text-[10px] uppercase tracking-widest px-3 py-1 rounded-full font-mono font-bold border border-amber-500/30">
                  ADMINISTRATIVE SECURITY LOCK
                </span>
                <h3 className="text-lg font-bold text-white tracking-tight">
                  Master Specification Data & Surcharge Engine Restricted
                </h3>
                <p className="text-xs text-slate-300 max-w-md mx-auto leading-relaxed">
                  Central Master Product specifications, head office cost pricing, margin floor rules, and multi-factor surcharge libraries are restricted properties accessible only by <strong>Head Office / Master Administrators</strong> (<span className="font-mono text-amber-300">isHO</span>). Non-admin users cannot view or modify administrative master data.
                </p>
              </div>
              <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 text-left space-y-2 text-xs">
                <div className="flex items-center justify-between text-slate-400">
                  <span>Current Operating Node:</span>
                  <strong className="text-slate-200 font-mono">Branch Sales Representative</strong>
                </div>
                <div className="flex items-center justify-between text-slate-400">
                  <span>Authorized Permissions:</span>
                  <span className="text-emerald-400 font-bold">POS Quick Quotation Generator</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab('pos')}
                className="bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white font-bold text-xs px-6 py-2.5 rounded-xl transition shadow-md cursor-pointer inline-flex items-center space-x-2"
              >
                <Calculator className="w-4 h-4 text-amber-200" />
                <span>Return to POS Quick Quotation View</span>
              </button>
            </div>
          )}

          {/* MODE 2: FULL MASTER DATA VIEW (7 ENLARGED SPECIFICATION SECTIONS - ADMIN ONLY) */}
          {activeTab === 'view' && isHO && (
            <div className="space-y-6 pb-6">
              
              {/* SECTION 1: IDENTITY & CATEGORY */}
              <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-2xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h4 className="text-xs font-semibold uppercase text-slate-900 tracking-wider flex items-center space-x-2">
                    <span className="w-5 h-5 rounded-full bg-orange-500 text-white font-mono font-bold text-[10px] flex items-center justify-center">1</span>
                    <Package className="w-4 h-4 text-orange-500" />
                    <span>Identity, Category & Visual Asset</span>
                  </h4>
                  <div className="flex items-center space-x-2">
                    {isHO && onEditProduct && (
                      <button
                        type="button"
                        onClick={() => onEditProduct(product)}
                        className="bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 text-[10px] font-extrabold px-2 py-0.5 rounded transition flex items-center space-x-1 cursor-pointer"
                        title="Edit Product Data & Specs"
                      >
                        <Edit3 className="w-3 h-3 text-amber-700" />
                        <span>Edit Section</span>
                      </button>
                    )}
                    <span className={`text-[10px] px-2 py-0.5 rounded-sm font-semibold uppercase border ${
                      product.status === 'Active'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-rose-50 text-rose-700 border-rose-200'
                    }`}>
                      Status: {product.status || 'Active'}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 text-xs">
                  {/* Thumbnail / Image Preview */}
                  <div className="md:col-span-4 bg-slate-100 border border-slate-200 rounded-xl p-2.5 flex flex-col items-center justify-between text-center space-y-2 h-full min-h-[190px] overflow-hidden">
                    <div className="w-full flex-1 flex flex-col items-center justify-center bg-white rounded-lg p-4 border border-slate-200/80 shadow-2xs">
                      <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#E87F24] to-[#0F203C] flex items-center justify-center text-white font-mono font-black text-xl shadow-xs mb-2">
                        {product.product_code.substring(0, 3)}
                      </div>
                      <span className="text-[10px] font-mono text-slate-500 font-bold">{product.product_code}</span>
                    </div>
                    <div className="flex items-center justify-between w-full px-1 text-[10px] font-bold text-slate-500 uppercase">
                      <span>Product Visual Asset</span>
                      {isHO && onEditProduct && (
                        <button 
                          type="button"
                          onClick={() => onEditProduct(product)}
                          className="text-[#E87F24] hover:underline font-extrabold cursor-pointer"
                        >
                          Edit Image
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Metadata Fields */}
                  <div className="md:col-span-8 grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <div className="bg-slate-50 border border-slate-200 rounded-md p-2.5">
                      <span className="text-[10px] font-medium text-slate-500 uppercase block">Product Code</span>
                      <strong className="text-sm font-mono font-semibold text-orange-600">{product.product_code}</strong>
                    </div>

                    <div className="bg-slate-50 border border-slate-200 rounded-md p-2.5">
                      <span className="text-[10px] font-medium text-slate-500 uppercase block">Product Name</span>
                      <strong className="text-xs font-semibold text-slate-900">{product.product_name}</strong>
                    </div>

                    <div className="bg-slate-50 border border-slate-200 rounded-md p-2.5">
                      <span className="text-[10px] font-medium text-slate-500 uppercase block">Category Name</span>
                      <strong className="text-xs font-semibold text-slate-800">{product.category}</strong>
                    </div>

                    <div className="bg-slate-50 border border-slate-200 rounded-md p-2.5">
                      <span className="text-[10px] font-medium text-slate-500 uppercase block">Sub-Category</span>
                      <strong className="text-xs font-semibold text-slate-800">{product.sub_category || 'Main General Line'}</strong>
                    </div>

                    <div className="bg-slate-50 border border-slate-200 rounded-md p-2.5">
                      <span className="text-[10px] font-medium text-slate-500 uppercase block">Industry Sector</span>
                      <strong className="text-xs font-semibold text-slate-800">{product.main_category_name || product.category || 'Aluminium & Glass'}</strong>
                    </div>

                    <div className="bg-slate-50 border border-slate-200 rounded-md p-2.5">
                      <span className="text-[10px] font-medium text-slate-500 uppercase block">SKU / Barcode ID</span>
                      <strong className="text-xs font-mono font-semibold text-slate-800">{product.id.substring(0, 12)}</strong>
                    </div>

                    {product.description && (
                      <div className="col-span-2 sm:col-span-3 bg-slate-50 border border-slate-200 rounded-md p-2.5">
                        <span className="text-[10px] font-medium text-slate-500 uppercase block mb-0.5">Description & Application Scope</span>
                        <p className="text-xs text-slate-700">{product.description}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* SECTION 2: UNITS & DISPLAY */}
              <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-2xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h4 className="text-xs font-semibold uppercase text-slate-900 tracking-wider flex items-center space-x-2">
                    <span className="w-5 h-5 rounded-full bg-orange-500 text-white font-mono font-bold text-[10px] flex items-center justify-center">2</span>
                    <Sliders className="w-4 h-4 text-orange-500" />
                    <span>Unit Measurement & Quotation Display Format</span>
                  </h4>
                  <span className="text-xs font-mono text-slate-500">Unit Type Rules</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="bg-slate-50 border border-slate-200 rounded-md p-3">
                    <span className="text-[10px] font-medium text-slate-500 uppercase block">Base Measurement Unit</span>
                    <strong className="text-sm font-semibold text-slate-900 uppercase">{product.unit}</strong>
                    <span className="text-[10px] text-slate-500 block mt-0.5">Standard billing metric</span>
                  </div>

                  <div className="bg-slate-50 border border-slate-200 rounded-md p-3">
                    <span className="text-[10px] font-medium text-slate-500 uppercase block">Price Display Method</span>
                    <strong className="text-sm font-semibold text-orange-600">{product.price_display_method || 'Standard'}</strong>
                    <span className="text-[10px] text-slate-500 block mt-0.5">Formatted display in quotation PDF</span>
                  </div>

                  <div className="bg-slate-50 border border-slate-200 rounded-md p-3">
                    <span className="text-[10px] font-medium text-slate-500 uppercase block">Formatted Sample Rate</span>
                    <strong className="text-sm font-semibold text-emerald-700 font-mono">1 {product.unit} @ Rs. {basePrice.toLocaleString()}</strong>
                    <span className="text-[10px] text-slate-500 block mt-0.5">Example invoice line output</span>
                  </div>
                </div>
              </div>

              {/* SECTION 3: RATES & MARGINS */}
              <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-2xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h4 className="text-xs font-semibold uppercase text-slate-900 tracking-wider flex items-center space-x-2">
                    <span className="w-5 h-5 rounded-full bg-orange-500 text-white font-mono font-bold text-[10px] flex items-center justify-center">3</span>
                    <Tag className="w-4 h-4 text-orange-500" />
                    <span>Base Rates, Head Office Costs & Margin Floors</span>
                  </h4>
                  <span className="text-xs font-mono text-slate-500">Currency: LKR (Rs.)</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div className="bg-slate-50 border border-slate-200 rounded-md p-3">
                    <span className="text-[10px] font-medium text-slate-500 uppercase block">Company Base Rate</span>
                    <strong className="text-base font-semibold font-mono text-slate-900">Rs. {basePrice.toLocaleString()}</strong>
                  </div>

                  <div className="bg-slate-50 border border-slate-200 rounded-md p-3">
                    <span className="text-[10px] font-medium text-slate-500 uppercase block">HO Cost Price</span>
                    <strong className="text-base font-semibold font-mono text-slate-700">Rs. {costPrice.toLocaleString()}</strong>
                  </div>

                  <div className="bg-slate-50 border border-slate-200 rounded-md p-3">
                    <span className="text-[10px] font-medium text-amber-700 uppercase block">Min Selling Floor</span>
                    <strong className="text-base font-semibold font-mono text-amber-800">Rs. {minSellingPrice.toLocaleString()}</strong>
                  </div>

                  <div className="bg-slate-50 border border-slate-200 rounded-md p-3">
                    <span className="text-[10px] font-medium text-emerald-700 uppercase block">Calculated Margin %</span>
                    <strong className="text-base font-semibold font-mono text-emerald-800">
                      {basePrice > costPrice ? `${(((basePrice - costPrice) / basePrice) * 100).toFixed(1)}%` : '0.0%'}
                    </strong>
                  </div>
                </div>
              </div>

              {/* SECTION 4: SPECS & HARDWARE */}
              <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-2xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h4 className="text-xs font-semibold uppercase text-slate-900 tracking-wider flex items-center space-x-2">
                    <span className="w-5 h-5 rounded-full bg-orange-500 text-white font-mono font-bold text-[10px] flex items-center justify-center">4</span>
                    <Layers className="w-4 h-4 text-orange-500" />
                    <span>Technical Specs, Hardware & Material Attributes</span>
                  </h4>
                  <span className="text-xs font-mono text-slate-500">Fabrication Hardware</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div className="bg-slate-50 border border-slate-200 rounded-md p-2.5">
                    <span className="text-[10px] font-medium text-slate-500 block">Profile Series</span>
                    <strong className="text-slate-900 font-semibold">{product.profile_series || 'Standard Series'}</strong>
                  </div>

                  <div className="bg-slate-50 border border-slate-200 rounded-md p-2.5">
                    <span className="text-[10px] font-medium text-slate-500 block">Glass Specification</span>
                    <strong className="text-slate-900 font-semibold">{product.glass_type || '5mm Clear Float'}</strong>
                  </div>

                  <div className="bg-slate-50 border border-slate-200 rounded-md p-2.5">
                    <span className="text-[10px] font-medium text-slate-500 block">Locking Mechanism</span>
                    <strong className="text-slate-900 font-semibold">{product.lock_type || 'Standard Mortise Lock'}</strong>
                  </div>

                  <div className="bg-slate-50 border border-slate-200 rounded-md p-2.5">
                    <span className="text-[10px] font-medium text-slate-500 block">Handle Type</span>
                    <strong className="text-slate-900 font-semibold">{product.handle_type || 'Flush Pull Handle'}</strong>
                  </div>

                  <div className="bg-slate-50 border border-slate-200 rounded-md p-2.5">
                    <span className="text-[10px] font-medium text-slate-500 block">Roller Mechanism</span>
                    <strong className="text-slate-900 font-semibold">{product.roller_type || 'Heavy Duty Nylon Bearing'}</strong>
                  </div>

                  <div className="bg-slate-50 border border-slate-200 rounded-md p-2.5">
                    <span className="text-[10px] font-medium text-slate-500 block">Unit Weight</span>
                    <strong className="text-slate-900 font-semibold">{product.unit_weight_kg || 0} kg / {product.unit}</strong>
                  </div>

                  <div className="bg-slate-50 border border-slate-200 rounded-md p-2.5 col-span-2">
                    <span className="text-[10px] font-medium text-slate-500 block">Warranty Coverage</span>
                    <strong className="text-amber-800 font-semibold flex items-center space-x-1 mt-0.5">
                      <Shield className="w-3.5 h-3.5 text-amber-600" />
                      <span>{product.warranty || '5 Years Surface Finish & Structural Warranty'}</span>
                    </strong>
                  </div>
                </div>
              </div>

              {/* SECTION 5: OPTION SURCHARGES */}
              <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-2xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h4 className="text-xs font-semibold uppercase text-slate-900 tracking-wider flex items-center space-x-2">
                    <span className="w-5 h-5 rounded-full bg-orange-500 text-white font-mono font-bold text-[10px] flex items-center justify-center">5</span>
                    <Sliders className="w-4 h-4 text-orange-500" />
                    <span>Configured Specs Library Surcharge Matrices (Physical Attributes)</span>
                  </h4>
                  <span className="text-xs font-mono text-slate-500">Multi-Factor Add-ons</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 text-xs">
                  {/* Thickness Surcharges */}
                  <div className="border border-slate-200 rounded-md p-3 space-y-2 bg-slate-50/50">
                    <span className="font-semibold text-slate-900 block border-b border-slate-200 pb-1">Thickness Options (mm):</span>
                    <div className="space-y-1">
                      {THICKNESS_OPTIONS.map((t) => {
                        const val = product.thickness_prices?.[t] || 0;
                        return (
                          <div key={t} className="flex items-center justify-between text-[11px]">
                            <span className="text-slate-600">{t}</span>
                            <span className={`font-mono font-semibold ${val > 0 ? 'text-orange-600' : 'text-slate-400'}`}>
                              {val > 0 ? `+Rs. ${val}` : 'Base'}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Finish Surcharges */}
                  <div className="border border-slate-200 rounded-md p-3 space-y-2 bg-slate-50/50">
                    <span className="font-semibold text-slate-900 block border-b border-slate-200 pb-1">Finish Coatings:</span>
                    <div className="space-y-1">
                      {FINISH_OPTIONS.map((f) => {
                        const val = product.finish_prices?.[f] || 0;
                        return (
                          <div key={f} className="flex items-center justify-between text-[11px]">
                            <span className="text-slate-600">{f}</span>
                            <span className={`font-mono font-semibold ${val > 0 ? 'text-orange-600' : 'text-slate-400'}`}>
                              {val > 0 ? `+Rs. ${val}` : 'Base'}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Colour Surcharges */}
                  <div className="border border-slate-200 rounded-md p-3 space-y-2 bg-slate-50/50">
                    <span className="font-semibold text-slate-900 block border-b border-slate-200 pb-1">Colour Palette Surcharges:</span>
                    <div className="space-y-1">
                      {COLOUR_OPTIONS.map((c) => {
                        const val = product.colour_prices?.[c] || 0;
                        return (
                          <div key={c} className="flex items-center justify-between text-[11px]">
                            <span className="text-slate-600">{c}</span>
                            <span className={`font-mono font-semibold ${val > 0 ? 'text-orange-600' : 'text-slate-400'}`}>
                              {val > 0 ? `+Rs. ${val}` : 'Base'}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Glass Surcharges */}
                  <div className="border border-slate-200 rounded-md p-3 space-y-2 bg-slate-50/50">
                    <span className="font-semibold text-slate-900 block border-b border-slate-200 pb-1">Glass Specs:</span>
                    <div className="space-y-1">
                      {GLASS_TYPES.map((g) => {
                        const val = product.glass_prices?.[g] || 0;
                        return (
                          <div key={g} className="flex items-center justify-between text-[11px]">
                            <span className="text-slate-600">{g}</span>
                            <span className={`font-mono font-semibold ${val > 0 ? 'text-orange-600' : 'text-slate-400'}`}>
                              {val > 0 ? `+Rs. ${val}` : 'Base'}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Installation Surcharges */}
                  <div className="border border-slate-200 rounded-md p-3 space-y-2 bg-slate-50/50">
                    <span className="font-semibold text-slate-900 block border-b border-slate-200 pb-1">Installation Mode:</span>
                    <div className="space-y-1">
                      {INSTALLATION_OPTIONS.map((inst) => {
                        const val = product.installation_prices?.[inst] || 0;
                        return (
                          <div key={inst} className="flex items-center justify-between text-[11px]">
                            <span className="text-slate-600">{inst}</span>
                            <span className={`font-mono font-semibold ${val > 0 ? 'text-orange-600' : 'text-slate-400'}`}>
                              {val > 0 ? `+Rs. ${val}` : 'Base'}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Floor Level Surcharges */}
                  <div className="border border-slate-200 rounded-md p-3 space-y-2 bg-slate-50/50">
                    <span className="font-semibold text-slate-900 block border-b border-slate-200 pb-1">Building Floor Levels:</span>
                    <div className="space-y-1">
                      {FLOOR_LEVEL_OPTIONS.map((fl) => {
                        const val = product.floor_level_prices?.[fl] || 0;
                        return (
                          <div key={fl} className="flex items-center justify-between text-[11px]">
                            <span className="text-slate-600 truncate max-w-[120px]" title={fl}>{fl}</span>
                            <span className={`font-mono font-semibold ${val > 0 ? 'text-orange-600' : 'text-slate-400'}`}>
                              {val > 0 ? `+Rs. ${val}` : 'Base'}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Site Facility Type Surcharges */}
                  <div className="border border-slate-200 rounded-md p-3 space-y-2 bg-slate-50/50">
                    <span className="font-semibold text-slate-900 block border-b border-slate-200 pb-1">Site Facility / Complex Type:</span>
                    <div className="space-y-1">
                      {FACILITY_TYPE_OPTIONS.map((fac) => {
                        const val = product.facility_type_prices?.[fac] || 0;
                        return (
                          <div key={fac} className="flex items-center justify-between text-[11px]">
                            <span className="text-slate-600 truncate max-w-[120px]" title={fac}>{fac}</span>
                            <span className={`font-mono font-semibold ${val > 0 ? 'text-orange-600' : 'text-slate-400'}`}>
                              {val > 0 ? `+Rs. ${val}` : 'Base'}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION 6: TIERS & MULTI-FACTOR */}
              <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-2xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h4 className="text-xs font-semibold uppercase text-slate-900 tracking-wider flex items-center space-x-2">
                    <span className="w-5 h-5 rounded-full bg-orange-500 text-white font-mono font-bold text-[10px] flex items-center justify-center">6</span>
                    <Tag className="w-4 h-4 text-orange-500" />
                    <span>Customer Tiers, Industry, Brands, Grades & Sector Rules</span>
                  </h4>
                  <span className="text-xs font-mono text-slate-500">Commercial Matrix</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
                  {/* Customer Tiers */}
                  <div className="border border-slate-200 rounded-md p-3 space-y-2 bg-slate-50/50">
                    <span className="font-semibold text-slate-900 block border-b border-slate-200 pb-1">Customer Pricing Tiers:</span>
                    <div className="grid grid-cols-2 gap-1.5">
                      {PRICING_TIERS.map((tier) => {
                        const val = product.tier_prices?.[tier] || 0;
                        return (
                          <div key={tier} className="flex items-center justify-between text-[11px] p-1 bg-white rounded border border-slate-200">
                            <span className="text-slate-700 font-medium">{tier}</span>
                            <span className={`font-mono font-semibold ${val !== 0 ? 'text-orange-600' : 'text-slate-400'}`}>
                              {val > 0 ? `+Rs. ${val}` : val < 0 ? `-Rs. ${Math.abs(val)}` : 'Base'}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Customer Industry Types */}
                  <div className="border border-slate-200 rounded-md p-3 space-y-2 bg-slate-50/50">
                    <span className="font-semibold text-slate-900 block border-b border-slate-200 pb-1">Customer Category / Industry Surcharges:</span>
                    <div className="space-y-1">
                      {CUSTOMER_TYPES.map((custType) => {
                        const val = product.customer_type_prices?.[custType] || 0;
                        return (
                          <div key={custType} className="flex items-center justify-between text-[11px]">
                            <span className="text-slate-600">{custType}</span>
                            <span className={`font-mono font-semibold ${val !== 0 ? 'text-orange-600' : 'text-slate-400'}`}>
                              {val > 0 ? `+Rs. ${val}` : val < 0 ? `-Rs. ${Math.abs(val)}` : 'Base'}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Material Grade & Alloys */}
                  <div className="border border-slate-200 rounded-md p-3 space-y-2 bg-slate-50/50">
                    <span className="font-semibold text-slate-900 block border-b border-slate-200 pb-1">Material Alloy & Grade Adjustments:</span>
                    <div className="space-y-1">
                      {MATERIAL_GRADES.map((grd) => {
                        const val = product.grade_prices?.[grd] || 0;
                        return (
                          <div key={grd} className="flex items-center justify-between text-[11px]">
                            <span className="text-slate-600">{grd}</span>
                            <span className={`font-mono font-semibold ${val !== 0 ? 'text-orange-600' : 'text-slate-400'}`}>
                              {val > 0 ? `+Rs. ${val}` : val < 0 ? `-Rs. ${Math.abs(val)}` : 'Base'}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Manufacturer Brands */}
                  <div className="border border-slate-200 rounded-md p-3 space-y-2 bg-slate-50/50">
                    <span className="font-semibold text-slate-900 block border-b border-slate-200 pb-1">Brand & Manufacturer Premium:</span>
                    <div className="space-y-1 max-h-[160px] overflow-y-auto">
                      {BRAND_OPTIONS.map((brd) => {
                        const val = product.brand_prices?.[brd] || 0;
                        return (
                          <div key={brd} className="flex items-center justify-between text-[11px] pr-1">
                            <span className="text-slate-600">{brd}</span>
                            <span className={`font-mono font-semibold ${val !== 0 ? 'text-orange-600' : 'text-slate-400'}`}>
                              {val > 0 ? `+Rs. ${val}` : val < 0 ? `-Rs. ${Math.abs(val)}` : 'Base'}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Project Sector Surcharges */}
                  <div className="border border-slate-200 rounded-md p-3 space-y-2 bg-slate-50/50">
                    <span className="font-semibold text-slate-900 block border-b border-slate-200 pb-1">Project Sector Rates:</span>
                    <div className="space-y-1 max-h-[160px] overflow-y-auto">
                      {PROJECT_TYPES.map((prj) => {
                        const val = product.project_type_prices?.[prj] || 0;
                        return (
                          <div key={prj} className="flex items-center justify-between text-[11px] pr-1">
                            <span className="text-slate-600">{prj}</span>
                            <span className={`font-mono font-semibold ${val !== 0 ? 'text-orange-600' : 'text-slate-400'}`}>
                              {val > 0 ? `+Rs. ${val}` : val < 0 ? `-Rs. ${Math.abs(val)}` : 'Base'}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Quantity Breaks */}
                  <div className="border border-slate-200 rounded-md p-3 space-y-2 bg-slate-50/50">
                    <span className="font-semibold text-slate-900 block border-b border-slate-200 pb-1">Quantity Break Volume Tiers:</span>
                    {product.quantity_breaks && product.quantity_breaks.length > 0 ? (
                      <div className="space-y-1.5">
                        {product.quantity_breaks.map((qb, i) => (
                          <div key={i} className="flex items-center justify-between text-[11px] bg-white p-1.5 rounded border border-slate-200">
                            <span className="font-medium text-slate-800">{qb.min_qty} - {qb.max_qty > 9999 ? 'Unlimited' : qb.max_qty} {product.unit}</span>
                            <span className="text-emerald-700 font-mono font-semibold">Rs. {qb.unit_price.toLocaleString()} / unit</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-[11px] text-slate-400 py-2">No quantity breaks defined. Standard base rate applies across all order volumes.</p>
                    )}
                  </div>
                </div>
              </div>

              {/* SECTION 6.5: SRI LANKA REGIONAL LOGISTICS & LOCATION DATA LOG */}
              {isHO && Object.keys(product.region_prices || {}).length > 0 && (
                <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-2xs space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                    <div className="flex items-center space-x-2">
                      <span className="w-5 h-5 rounded-full bg-orange-500 text-white font-mono font-bold text-[10px] flex items-center justify-center">6B</span>
                      <div>
                        <h4 className="text-xs font-semibold uppercase text-slate-900 tracking-wider flex items-center space-x-1.5">
                          <span>Sri Lanka Location-Based Regional Pricing Data Log</span>
                        </h4>
                        <p className="text-[11px] text-slate-500">Divisions, Postal Zones & Regional Logistics Surcharges Matrix</p>
                      </div>
                    </div>

                    {/* Interactive Upward Sliding Ticker Preview */}
                    <LocationPriceSlidingCell
                      regionPrices={product.region_prices}
                      basePriceVal={basePrice}
                      productName={product.product_name}
                    />
                  </div>

                  {/* Complete Data Log List */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                      <span>Configured Regional Surcharge Log ({Object.keys(product.region_prices || {}).length} Custom Overrides)</span>
                      <span className="text-[10px] font-mono text-slate-400">Standard Base: Rs. {basePrice.toLocaleString()}</span>
                    </div>

                    <div className="border border-slate-200 rounded-md overflow-hidden bg-slate-50/50">
                      <div className="max-h-[220px] overflow-y-auto divide-y divide-slate-100 text-xs">
                        {Object.entries(product.region_prices || {}).map(([rName, rawSurcharge]) => {
                          const rSurcharge = Number(rawSurcharge) || 0;
                          const matchedRegion = ALL_SRI_LANKA_REGIONS.find(r => r.name === rName || r.district === rName || r.province === rName);
                          const totalRegPrice = basePrice + rSurcharge;
                          return (
                            <div key={rName} className="p-2.5 bg-white flex items-center justify-between hover:bg-orange-50/20 transition">
                              <div className="flex items-center space-x-2">
                                <div className="w-2 h-2 rounded-full bg-orange-500 shrink-0"></div>
                                <div>
                                  <div className="font-semibold text-slate-900 flex items-center space-x-1.5">
                                    <span>{rName}</span>
                                    {matchedRegion?.postalCode && (
                                      <span className="text-[9px] bg-slate-100 text-slate-600 px-1 rounded font-mono">
                                        {matchedRegion.postalCode}
                                      </span>
                                    )}
                                  </div>
                                  <div className="text-[10px] text-slate-500">
                                    {matchedRegion ? `${matchedRegion.district} • ${matchedRegion.province}` : 'Sri Lanka Regional Zone'}
                                  </div>
                                </div>
                              </div>

                              <div className="text-right">
                                <div className="font-mono font-bold text-orange-600">Rs. {totalRegPrice.toLocaleString()}</div>
                                <div className="text-[9px] text-slate-500">
                                  {rSurcharge > 0 ? `+Rs. ${rSurcharge.toLocaleString()} surcharge` : 'Base Price'}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* SECTION 7: REVISION AUDIT */}
              <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-2xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h4 className="text-xs font-semibold uppercase text-slate-900 tracking-wider flex items-center space-x-2">
                    <span className="w-5 h-5 rounded-full bg-orange-500 text-white font-mono font-bold text-[10px] flex items-center justify-center">7</span>
                    <Clock className="w-4 h-4 text-orange-500" />
                    <span>Revision Audit Log & Branch Sync Status</span>
                  </h4>
                  <span className="text-xs font-mono text-slate-500">HO Master Control</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="bg-slate-50 border border-slate-200 rounded-md p-2.5">
                    <span className="text-[10px] font-medium text-slate-500 block">Last Master Revision Date</span>
                    <strong className="text-xs font-mono font-semibold text-slate-900">{product.last_updated || '2026-08-01'}</strong>
                  </div>

                  <div className="bg-slate-50 border border-slate-200 rounded-md p-2.5">
                    <span className="text-[10px] font-medium text-slate-500 block">Modified By User</span>
                    <strong className="text-xs font-semibold text-slate-900">{product.updated_by || 'HO Master Pricing Admin'}</strong>
                  </div>

                  <div className="bg-slate-50 border border-slate-200 rounded-md p-2.5">
                    <span className="text-[10px] font-medium text-slate-500 block">Branch Network Sync Status</span>
                    <strong className="text-xs font-semibold text-emerald-700 flex items-center space-x-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                      <span>Synced Across 5 Branch Nodes</span>
                    </strong>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* TAB 3: COMPLETE PRODUCT AUDIT TRAIL */}
          {activeTab === 'audit' && (
            <div className="p-4 bg-slate-100">
              <ProductAuditLogViewer
                product={product}
                priceHistory={priceHistory}
              />
            </div>
          )}

        </div>

      </div>

      {/* PRINTABLE SPECIFICATION & PRICES SHEET MODAL */}
      {showPrintSpecModal && (
        <PrintableProductSpecModal
          product={product}
          onClose={() => setShowPrintSpecModal(false)}
        />
      )}

      {/* PRINTABLE WARRANTY CERTIFICATE MODAL */}
      {showPrintWarrantyModal && (
        <PrintableWarrantyModal
          product={product}
          onClose={() => setShowPrintWarrantyModal(false)}
        />
      )}
    </div>
  );
};
