import React, { useState, useEffect, useRef } from 'react';
import { getSavedShortcutSettings, formatShortcutDisplay } from '../utils/shortcutDefaults';
import { 
  ShoppingCart, 
  X, 
  Plus, 
  Trash2, 
  ChevronRight, 
  ChevronLeft, 
  User, 
  UserPlus, 
  Truck, 
  Calculator, 
  Percent, 
  Tag, 
  Check, 
  Printer, 
  Save, 
  RotateCcw, 
  Search, 
  FileText, 
  MapPin, 
  ShieldCheck, 
  Building2, 
  Layers, 
  HelpCircle,
  Eye,
  CheckCircle2,
  Download,
  Maximize2,
  Minimize2,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
  Settings2,
  PackageCheck,
  Package
} from 'lucide-react';
import { DEFAULT_PACKED_WORKS } from '../data/defaultPackedWorks';
import { generateAndDownloadQuotationPDF } from '../utils/pdfExportEngine';
import { PrintableQuotationModal } from './PrintableQuotationModal';
import { Surcharge11CategoryModal } from './Surcharge11CategoryModal';
import { calculate11CategorySurcharges } from '../utils/surchargeCategoryEngine';

import { 
  Product, 
  QuotationItem, 
  Quotation, 
  SiteLocation, 
  Vehicle, 
  Branch, 
  Customer, 
  CustomerType, 
  PricingTier, 
  ProductUnit, 
  MaterialThickness, 
  MaterialFinish, 
  GlassType,
  SystemUser
} from '../types';
import { fetchCustomers, addCustomer } from '../services/api';

interface RightBillingOrderPanelProps {
  products: Product[];
  quotations: Quotation[];
  locations: SiteLocation[];
  vehicles: Vehicle[];
  activeBranch: Branch;
  pendingCartItem: QuotationItem | null;
  onClearPendingCartItem: () => void;
  onCreateQuotation: (quotation: Partial<Quotation>) => Promise<Quotation>;
  onOpenProductSpecs?: (product: Product) => void;
  isOpen: boolean;
  onToggleOpen: () => void;
  currentUser?: SystemUser | null;
}

export const RightBillingOrderPanel: React.FC<RightBillingOrderPanelProps> = ({
  products,
  quotations,
  locations,
  vehicles,
  activeBranch,
  pendingCartItem,
  onClearPendingCartItem,
  onCreateQuotation,
  onOpenProductSpecs,
  isOpen,
  onToggleOpen,
  currentUser
}) => {
  // --- Order Identity State ---
  const [orderNumber, setOrderNumber] = useState<string>('');
  const [projectId, setProjectId] = useState<string>('');
  const [projectName, setProjectName] = useState<string>('Standard Glazing Project');

  // --- Customer Database State ---
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const [isCreatingCustomer, setIsCreatingCustomer] = useState<boolean>(false);
  
  // New Customer Form
  const [newCustName, setNewCustName] = useState<string>('');
  const [newCustPhone, setNewCustPhone] = useState<string>('');
  const [newCustEmail, setNewCustEmail] = useState<string>('');
  const [newCustAddress, setNewCustAddress] = useState<string>('');
  const [newCustDistrict, setNewCustDistrict] = useState<string>('Colombo');
  const [newCustType, setNewCustType] = useState<CustomerType>('Company');
  const [newCustTaxId, setNewCustTaxId] = useState<string>('');

  // --- Cart Line Items State ---
  const [cartItems, setCartItems] = useState<QuotationItem[]>([]);
  const [quickSearch, setQuickSearch] = useState<string>('');
  const [showSearchDropdown, setShowSearchDropdown] = useState<boolean>(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Keyboard shortcut event listeners for fast POS operation
  useEffect(() => {
    const handleFocusSearch = () => {
      setTimeout(() => {
        if (searchInputRef.current) {
          searchInputRef.current.focus();
          searchInputRef.current.select();
        }
      }, 60);
    };

    const handleNewQuotation = () => {
      handleResetOrder();
      setTimeout(() => {
        if (searchInputRef.current) {
          searchInputRef.current.focus();
        }
      }, 60);
    };

    const handleAddMultipleItems = (e: any) => {
      const incomingItems: QuotationItem[] = e.detail?.items || [];
      if (incomingItems.length > 0) {
        setCartItems(prev => {
          let updated = [...prev];
          for (const newItem of incomingItems) {
            const existingIdx = updated.findIndex(item => 
              item.product_id === newItem.product_id && 
              item.thickness_applied === newItem.thickness_applied && 
              item.finish_applied === newItem.finish_applied && 
              item.packed_work_id === newItem.packed_work_id
            );
            if (existingIdx !== -1) {
              const curr = updated[existingIdx];
              const newQty = curr.quantity + (newItem.quantity || 1);
              updated[existingIdx] = {
                ...curr,
                quantity: newQty,
                total_price: curr.unit_price * newQty
              };
            } else {
              updated.push(newItem);
            }
          }
          return updated;
        });

        const pkgName = e.detail?.packageInfo?.name || 'Packed Work Bundle';
        setOrderSavedToast(`🚀 Added ${incomingItems.length} product variants from "${pkgName}" simultaneously to POS Cart!`);
        setTimeout(() => setOrderSavedToast(null), 4000);
      }
    };

    window.addEventListener('innovista_focus_scanner_search', handleFocusSearch);
    window.addEventListener('innovista_new_quotation', handleNewQuotation);
    window.addEventListener('innovista_add_multiple_items_to_cart', handleAddMultipleItems);

    return () => {
      window.removeEventListener('innovista_focus_scanner_search', handleFocusSearch);
      window.removeEventListener('innovista_new_quotation', handleNewQuotation);
      window.removeEventListener('innovista_add_multiple_items_to_cart', handleAddMultipleItems);
    };
  }, []);

  // --- Transport & Pre-designed Frames ---
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>('v-lorry');
  const [deliveryDistanceKm, setDeliveryDistanceKm] = useState<number>(25);
  const [deliveryLocation, setDeliveryLocation] = useState<string>('Colombo');
  const [isDriverAllowance, setIsDriverAllowance] = useState<boolean>(true);

  // --- Other Service Charges ---
  const [fabricationCharge, setFabricationCharge] = useState<number>(0);
  const [installationCharge, setInstallationCharge] = useState<number>(0);
  const [hardwareFittingCharge, setHardwareFittingCharge] = useState<number>(0);

  // --- Discounts Engine (Automatic & Manual) ---
  const [discountMode, setDiscountMode] = useState<'PERCENT' | 'LKR'>('PERCENT');
  const [manualDiscountVal, setManualDiscountVal] = useState<number>(0);
  const [isDiscountOverridden, setIsDiscountOverridden] = useState<boolean>(false);
  const [autoDiscountReason, setAutoDiscountReason] = useState<string>('');

  // --- Tax & Payment Terms ---
  const [applyVat, setApplyVat] = useState<boolean>(false); // 18% VAT
  const [notes, setNotes] = useState<string>('');

  // --- Submitting / UI State ---
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [orderSavedToast, setOrderSavedToast] = useState<string | null>(null);
  const [savedOrderResult, setSavedOrderResult] = useState<Quotation | null>(null);
  const [printableModalQuote, setPrintableModalQuote] = useState<Quotation | null>(null);

  // --- Full Screen & Multi-Factor Adjustment State ---
  const [isFullScreen, setIsFullScreen] = useState<boolean>(false);
  const [expandedFactorItemId, setExpandedFactorItemId] = useState<string | null>(null);
  const [showBatchFactorModal, setShowBatchFactorModal] = useState<boolean>(false);
  
  // 11-Category Surcharge Engine Modal State
  const [is11CatModalOpen, setIs11CatModalOpen] = useState<boolean>(false);
  const [surchargeModalItem, setSurchargeModalItem] = useState<QuotationItem | null>(null);

  const handleApply11CatSurcharges = (selections: Record<string, string>, breakdown: any[], finalUnitPrice: number) => {
    if (surchargeModalItem) {
      setCartItems(prev => prev.map(item => {
        if (item.id === surchargeModalItem.id) {
          return {
            ...item,
            unit_price: finalUnitPrice,
            total_price: finalUnitPrice * item.quantity,
            surcharge_selections_11cat: selections,
            surcharge_breakdown_11cat: breakdown,
            price_source_label: breakdown.length > 0 ? `11-Cat Surcharges (+${breakdown.length})` : item.price_source_label
          };
        }
        return item;
      }));
    } else {
      // Batch apply across all cart items
      setCartItems(prev => prev.map(item => {
        const master = products.find(p => p.id === item.product_id || p.product_code === item.product_code);
        const basePrice = master ? (master.base_price || master.current_price) : item.unit_price;
        const calcResult = calculate11CategorySurcharges(basePrice, selections);
        return {
          ...item,
          unit_price: calcResult.finalUnitPrice,
          total_price: calcResult.finalUnitPrice * item.quantity,
          surcharge_selections_11cat: selections,
          surcharge_breakdown_11cat: calcResult.breakdown,
          price_source_label: calcResult.breakdown.length > 0 ? `Batch 11-Cat Surcharges` : item.price_source_label
        };
      }));
    }
  };
  
  // Batch Multi-Factor Inputs
  const [batchThickness, setBatchThickness] = useState<string>('');
  const [batchFinish, setBatchFinish] = useState<string>('');
  const [batchGlass, setBatchGlass] = useState<string>('');
  const [batchMarginPct, setBatchMarginPct] = useState<number>(0);

  // Multi-Factor Spec Calculation Engine for Individual Line Items
  const handleApplyItemFactors = (
    itemId: string, 
    factors: {
      thickness?: MaterialThickness;
      finish?: MaterialFinish;
      glass?: GlassType;
      colour?: string;
      marginPct?: number;
    }
  ) => {
    setCartItems(prev => prev.map(item => {
      if (item.id === itemId) {
        const master = products.find(p => p.id === item.product_id || p.product_code === item.product_code);
        const baseRate = item.base_rate ?? (master ? (master.base_price || master.current_price || 0) : item.unit_price);
        
        const thickness = factors.thickness !== undefined ? factors.thickness : (item.thickness_applied as MaterialThickness);
        const finish = factors.finish !== undefined ? factors.finish : (item.finish_applied as MaterialFinish);
        const glass = factors.glass !== undefined ? factors.glass : (item.glass_type_applied as GlassType);
        const colour = factors.colour !== undefined ? factors.colour : item.colour_applied;
        const marginPct = factors.marginPct !== undefined ? factors.marginPct : (item.margin_pct_applied ?? 0);
        
        // Surcharges
        let thickFee = 0;
        if (master?.thickness_prices && thickness && master.thickness_prices[thickness] !== undefined) {
          thickFee = master.thickness_prices[thickness];
        } else if (thickness === '0.8mm') thickFee = -200;
        else if (thickness === '1.2mm') thickFee = 450;
        else if (thickness === '1.5mm') thickFee = 850;
        else if (thickness === '2.0mm') thickFee = 1400;
        else if (thickness === '3.0mm') thickFee = 2200;

        let finishFee = 0;
        if (master?.finish_prices && finish && master.finish_prices[finish] !== undefined) {
          finishFee = master.finish_prices[finish];
        } else if ((finish as string) === 'Anodized') finishFee = 350;
        else if ((finish as string) === 'Powder Coated') finishFee = 600;
        else if ((finish as string) === 'Wood Grain' || (finish as string) === 'Wood Finish') finishFee = 1200;
        else if ((finish as string) === 'PVDF') finishFee = 1500;
        else if ((finish as string) === 'Brushed') finishFee = 800;

        let glassFee = 0;
        if (master?.glass_prices && glass && master.glass_prices[glass] !== undefined) {
          glassFee = master.glass_prices[glass];
        } else if (glass?.includes('Tinted')) glassFee = 250;
        else if (glass?.includes('Toughened') || glass?.includes('Tempered')) glassFee = 800;
        else if (glass?.includes('Laminated')) glassFee = 1100;
        else if (glass?.includes('Double')) glassFee = 1800;

        // 11-Cat & custom options / spec surcharges
        const cat11SurchargesTotal = item.surcharge_breakdown_11cat?.reduce((acc, b) => acc + (b.amountLkr || 0), 0) || 0;
        const customOptsSurchargesTotal = Object.values(item.custom_options_applied || {}).reduce((acc: number, o: any) => acc + (o?.surchargeLkr || 0), 0);
        const specSurchargesTotal = Object.values(item.spec_surcharges_applied || {}).reduce((acc: number, o: any) => acc + (o?.surchargeLkr || 0), 0);

        const subtotalRate = baseRate + thickFee + finishFee + glassFee + cat11SurchargesTotal + customOptsSurchargesTotal + specSurchargesTotal;
        const finalRate = Math.max(0, Math.round(subtotalRate * (1 + marginPct / 100)));

        const labelParts: string[] = [];
        if (thickness && thickness !== '1.0mm') labelParts.push(`Thick: ${thickness}`);
        if (finish && (finish as string) !== 'Mill Finish' && (finish as string) !== 'Natural') labelParts.push(`Finish: ${finish}`);
        if (glass && (glass as string) !== 'None' && (glass as string) !== '5mm Clear Float') labelParts.push(`Glass: ${glass}`);
        if (marginPct !== 0) labelParts.push(`${marginPct > 0 ? '+' : ''}${marginPct}% Margin`);

        return {
          ...item,
          base_rate: baseRate,
          unit_price: finalRate,
          quantity: item.quantity,
          total_price: finalRate * item.quantity,
          thickness_applied: thickness,
          finish_applied: finish,
          glass_type_applied: glass,
          colour_applied: colour,
          margin_pct_applied: marginPct,
          price_source_label: labelParts.length > 0 ? `Multi-Factor: ${labelParts.join(' • ')}` : 'Master Catalog Base'
        };
      }
      return item;
    }));
  };

  // Batch Multi-Factor Application across ALL items in cart
  const handleApplyBatchFactors = () => {
    if (cartItems.length === 0) return;
    setCartItems(prev => prev.map(item => {
      const master = products.find(p => p.id === item.product_id || p.product_code === item.product_code);
      const baseRate = item.base_rate ?? (master ? (master.base_price || master.current_price || 0) : item.unit_price);

      const thickness = (batchThickness as MaterialThickness) || (item.thickness_applied as MaterialThickness);
      const finish = (batchFinish as MaterialFinish) || (item.finish_applied as MaterialFinish);
      const glass = (batchGlass as GlassType) || (item.glass_type_applied as GlassType);
      const marginPct = batchMarginPct !== undefined ? batchMarginPct : (item.margin_pct_applied ?? 0);

      let thickFee = 0;
      if (master?.thickness_prices && thickness && master.thickness_prices[thickness] !== undefined) {
        thickFee = master.thickness_prices[thickness];
      } else if (thickness === '0.8mm') thickFee = -200;
      else if (thickness === '1.2mm') thickFee = 450;
      else if (thickness === '1.5mm') thickFee = 850;
      else if (thickness === '2.0mm') thickFee = 1400;
      else if (thickness === '3.0mm') thickFee = 2200;

      let finishFee = 0;
      if (master?.finish_prices && finish && master.finish_prices[finish] !== undefined) {
        finishFee = master.finish_prices[finish];
      } else if ((finish as string) === 'Anodized') finishFee = 350;
      else if ((finish as string) === 'Powder Coated') finishFee = 600;
      else if ((finish as string) === 'Wood Grain' || (finish as string) === 'Wood Finish') finishFee = 1200;
      else if ((finish as string) === 'PVDF') finishFee = 1500;
      else if ((finish as string) === 'Brushed') finishFee = 800;

      let glassFee = 0;
      if (master?.glass_prices && glass && master.glass_prices[glass] !== undefined) {
        glassFee = master.glass_prices[glass];
      } else if (glass?.includes('Tinted')) glassFee = 250;
      else if (glass?.includes('Toughened') || glass?.includes('Tempered')) glassFee = 800;
      else if (glass?.includes('Laminated')) glassFee = 1100;
      else if (glass?.includes('Double')) glassFee = 1800;

      const cat11SurchargesTotal = item.surcharge_breakdown_11cat?.reduce((acc, b) => acc + (b.amountLkr || 0), 0) || 0;
      const customOptsSurchargesTotal = Object.values(item.custom_options_applied || {}).reduce((acc: number, o: any) => acc + (o?.surchargeLkr || 0), 0);
      const specSurchargesTotal = Object.values(item.spec_surcharges_applied || {}).reduce((acc: number, o: any) => acc + (o?.surchargeLkr || 0), 0);

      const subtotalRate = baseRate + thickFee + finishFee + glassFee + cat11SurchargesTotal + customOptsSurchargesTotal + specSurchargesTotal;
      const finalRate = Math.max(0, Math.round(subtotalRate * (1 + marginPct / 100)));

      const labelParts: string[] = [];
      if (thickness && thickness !== '1.0mm') labelParts.push(`Thick: ${thickness}`);
      if (finish && (finish as string) !== 'Mill Finish' && (finish as string) !== 'Natural') labelParts.push(`Finish: ${finish}`);
      if (glass && (glass as string) !== 'None' && (glass as string) !== '5mm Clear Float') labelParts.push(`Glass: ${glass}`);
      if (marginPct !== 0) labelParts.push(`${marginPct > 0 ? '+' : ''}${marginPct}% Margin`);

      return {
        ...item,
        base_rate: baseRate,
        unit_price: finalRate,
        total_price: finalRate * item.quantity,
        thickness_applied: thickness,
        finish_applied: finish,
        glass_type_applied: glass,
        margin_pct_applied: marginPct,
        price_source_label: labelParts.length > 0 ? `Batch Multi-Factor (${labelParts.join(' • ')})` : 'Master Catalog Base'
      };
    }));
    setShowBatchFactorModal(false);
  };

  // Initialize unique Order & Project numbers
  const initializeNewOrderNumber = () => {
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const ordNum = `ORD-${new Date().getFullYear()}-${randomSuffix}`;
    const prjNum = `PRJ-${new Date().getFullYear()}-${randomSuffix}`;
    setOrderNumber(ordNum);
    setProjectId(prjNum);
  };

  useEffect(() => {
    initializeNewOrderNumber();
    fetchCustomers().then(data => {
      setCustomers(data);
      if (data.length > 0) {
        setSelectedCustomerId(data[0].id);
      }
    }).catch(err => console.error('Failed to load customers:', err));
  }, []);

  // Handle incoming item pushed from catalog "Add to Quote"
  useEffect(() => {
    if (pendingCartItem) {
      setCartItems(prev => {
        const existingIdx = prev.findIndex(item => item.product_id === pendingCartItem.product_id);
        if (existingIdx !== -1) {
          const updated = [...prev];
          const curr = updated[existingIdx];
          const newQty = curr.quantity + (pendingCartItem.quantity || 1);
          updated[existingIdx] = {
            ...curr,
            quantity: newQty,
            total_price: curr.unit_price * newQty
          };
          return updated;
        } else {
          return [...prev, pendingCartItem];
        }
      });
      onClearPendingCartItem();
    }
  }, [pendingCartItem]);

  // Selected customer object
  const activeCustomer = customers.find(c => c.id === selectedCustomerId) || null;

  // Auto-Discount Calculation Effect
  useEffect(() => {
    if (isDiscountOverridden) return; // If manually overridden, don't overwrite user's custom entry

    let autoPct = 0;
    let reason = '';

    // Rule 1: Customer Type Tier
    if (activeCustomer) {
      if (activeCustomer.customer_type === 'Distributor') {
        autoPct = 8;
        reason = 'Distributor Partner 8% Tier';
      } else if (activeCustomer.customer_type === 'Developer') {
        autoPct = 6;
        reason = 'Developer Contract 6% Tier';
      } else if (activeCustomer.customer_type === 'Company') {
        autoPct = 5;
        reason = 'Corporate Client 5% Tier';
      } else if (activeCustomer.discount_tier_pct && activeCustomer.discount_tier_pct > 0) {
        autoPct = activeCustomer.discount_tier_pct;
        reason = `Customer Contract (${autoPct}%)`;
      }
    }

    // Rule 2: Bulk Volume Tier (>50 total items)
    const totalQty = cartItems.reduce((acc, item) => acc + item.quantity, 0);
    if (totalQty >= 50 && autoPct < 10) {
      autoPct = 10;
      reason = 'Bulk Volume Tier (50+ Items 10% Off)';
    }

    setDiscountMode('PERCENT');
    setManualDiscountVal(autoPct);
    setAutoDiscountReason(reason);
  }, [selectedCustomerId, cartItems, isDiscountOverridden]);

  // Handle Customer Creation
  const handleSaveNewCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustName.trim() || !newCustPhone.trim()) {
      alert('Please provide customer name and phone number.');
      return;
    }
    try {
      const created = await addCustomer({
        name: newCustName,
        phone: newCustPhone,
        email: newCustEmail,
        address: newCustAddress,
        district_region: newCustDistrict,
        customer_type: newCustType,
        tax_id: newCustTaxId
      });
      setCustomers(prev => [created, ...prev]);
      setSelectedCustomerId(created.id);
      setIsCreatingCustomer(false);
      // Reset form
      setNewCustName('');
      setNewCustPhone('');
      setNewCustEmail('');
      setNewCustAddress('');
    } catch (err) {
      console.error('Error saving customer:', err);
      alert('Failed to save customer');
    }
  };

  // Add Item From Panel Quick Search
  const handleQuickAddItem = (p: Product) => {
    const basePrice = p.base_price || p.current_price || 0;
    const newItem: QuotationItem = {
      id: `qi-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      product_id: p.id,
      product_code: p.product_code,
      product_name: p.product_name,
      unit: p.unit || 'bar',
      base_rate: basePrice,
      unit_price: basePrice,
      quantity: 1,
      weight_kg: p.unit_weight_kg || 1,
      total_price: basePrice,
      price_source_label: 'Master Catalog Base',
      thickness_applied: '1.0mm',
      finish_applied: 'Mill Finish',
      glass_type_applied: 'None',
      margin_pct_applied: 0
    };

    setCartItems(prev => [...prev, newItem]);
    setQuickSearch('');
    setShowSearchDropdown(false);
  };

  // Item Modification Handlers
  const handleUpdateItem = (itemId: string, updates: Partial<QuotationItem>) => {
    setCartItems(prev => prev.map(item => {
      if (item.id === itemId) {
        const updated = { ...item, ...updates };
        // Recalculate line total price
        const qty = updated.quantity || 1;
        const rate = updated.unit_price || 0;
        updated.total_price = Math.round(rate * qty);
        return updated;
      }
      return item;
    }));
  };

  const handleRemoveItem = (itemId: string) => {
    setCartItems(prev => prev.filter(item => item.id !== itemId));
  };

  // Transport Calculation
  const chosenVehicle = vehicles.find(v => v.id === selectedVehicleId) || vehicles[0] || {
    id: 'v-lorry',
    type: 'Medium Flatbed Lorry (5 Ton)',
    base_charge: 12000,
    per_km_rate: 140
  };

  const calculatedTransportCost = Math.round(
    (chosenVehicle.base_charge || 0) + 
    (deliveryDistanceKm * (chosenVehicle.per_km_rate || 0)) +
    (isDriverAllowance ? 3500 : 0)
  );

  // Financial Totals Calculation
  const materialSubtotal = cartItems.reduce((acc, item) => acc + item.total_price, 0);
  const totalOtherCosts = fabricationCharge + installationCharge + hardwareFittingCharge;
  const grossTotal = materialSubtotal + calculatedTransportCost + totalOtherCosts;

  // Discount Amount
  const discountAmount = discountMode === 'PERCENT' 
    ? Math.round(grossTotal * (manualDiscountVal / 100))
    : manualDiscountVal;

  const afterDiscountAmount = Math.max(0, grossTotal - discountAmount);
  const taxAmount = applyVat ? Math.round(afterDiscountAmount * 0.18) : 0;
  const netGrandTotal = Math.round(afterDiscountAmount + taxAmount);

  // Reset / Cancel Order
  const handleResetOrder = () => {
    setCartItems([]);
    setFabricationCharge(0);
    setInstallationCharge(0);
    setHardwareFittingCharge(0);
    setIsDiscountOverridden(false);
    setManualDiscountVal(0);
    initializeNewOrderNumber();
  };

  // Submit & Save Order
  const handleSaveOrder = async () => {
    if (cartItems.length === 0) {
      alert('Please add at least one product or service to the order before saving.');
      return;
    }
    if (!activeCustomer) {
      alert('Please select or create a customer for this order.');
      return;
    }

    setIsSubmitting(true);
    try {
      const newQuotationPayload: Partial<Quotation> = {
        quotation_number: `${orderNumber} (${projectId})`,
        customer_name: activeCustomer.name,
        customer_phone: activeCustomer.phone,
        customer_email: activeCustomer.email,
        customer_address: activeCustomer.address,
        site_address: activeCustomer.address || 'Site Delivery',
        site_location_name: deliveryLocation,
        branch_id: activeBranch.id,
        branch_name: activeBranch.name,
        items: cartItems,
        transport_cost: calculatedTransportCost,
        fabrication_cost: fabricationCharge,
        installation_cost: installationCharge + hardwareFittingCharge,
        material_subtotal: materialSubtotal,
        gross_total: grossTotal,
        discount_pct: discountMode === 'PERCENT' ? manualDiscountVal : 0,
        discount_amount: discountAmount,
        tax_pct: applyVat ? 18 : 0,
        tax_amount: taxAmount,
        net_total: netGrandTotal,
        notes: `Project Ref: ${projectName}. ${notes}`,
        created_by: currentUser ? `${currentUser.name}${currentUser.employee_id ? ` (${currentUser.employee_id})` : ''}` : (activeBranch.manager_name || 'HO Master Sales Rep')
      };

      const savedQuote = await onCreateQuotation(newQuotationPayload);
      setSavedOrderResult(savedQuote);
      setOrderSavedToast(`Order & Quote ${savedQuote.quotation_number} successfully saved!`);
      
      // Auto clear toast after 4 sec
      setTimeout(() => setOrderSavedToast(null), 4500);
    } catch (err) {
      console.error('Save order error:', err);
      alert('Failed to save order. Please check connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter products for quick add search box
  const filteredSearchProducts = products.filter(p => 
    quickSearch.trim() && (
      p.product_code.toLowerCase().includes(quickSearch.toLowerCase()) ||
      p.product_name.toLowerCase().includes(quickSearch.toLowerCase()) ||
      p.category.toLowerCase().includes(quickSearch.toLowerCase())
    )
  ).slice(0, 6);

  return (
    <>
      {/* Floating Toggle Button on screen edge when panel is closed */}
      {!isOpen && (
        <button
          onClick={onToggleOpen}
          className="fixed right-0 top-20 z-40 bg-[#0F203C] border-l-2 border-[#E87F24] text-white px-2.5 py-2 rounded-l-md shadow-md hover:bg-[#1A2E4E] transition flex items-center space-x-1.5 group"
          title="Open Order & Billing Panel"
        >
          <ShoppingCart className="w-4 h-4 text-[#FFC81E] animate-pulse" />
          <span className="text-xs font-bold hidden group-hover:inline">
            Billing ({cartItems.length})
          </span>
          {cartItems.length > 0 && (
            <span className="w-4 h-4 bg-[#E87F24] text-white rounded-full text-[10px] font-bold flex items-center justify-center">
              {cartItems.length}
            </span>
          )}
        </button>
      )}

      {/* Backdrop for mobile screen overlay */}
      {isOpen && (
        <div 
          onClick={onToggleOpen}
          className="sm:hidden fixed inset-0 bg-[#0F203C]/40 backdrop-blur-xs z-40 transition-opacity"
        />
      )}

      {/* Main Order & Billing Panel Container (Light Dreams POS Style) */}
      <div 
        className={`fixed top-0 right-0 h-full bg-white border-l border-slate-200 text-[#0F203C] shadow-2xl z-50 flex flex-col transform transition-all duration-300 ease-in-out ${
          isFullScreen 
            ? 'inset-0 w-full h-full rounded-none' 
            : 'w-full sm:w-[380px] md:w-[420px] lg:w-[440px]'
        } ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* PANEL HEADER (Navy Blue Accent) */}
        <div className="bg-[#0F203C] text-white p-3 px-3.5 flex items-center justify-between shrink-0 shadow-xs">
          <div className="flex items-center space-x-2.5">
            <div className="p-1.5 bg-[#E87F24] rounded-md text-white shadow-xs">
              <ShoppingCart className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="font-bold text-xs uppercase tracking-wide text-white">
                  {isFullScreen ? 'FULL-SCREEN POS ORDER & BILLING PORTAL' : 'Order & Billing Portal'}
                </h2>
                <span className="px-1.5 py-0.2 bg-[#FEFDDF] text-[#0F203C] border border-[#FFC81E] rounded text-[10px] font-mono font-bold">
                  {cartItems.length} Items
                </span>
              </div>
              <p className="text-[10px] text-slate-300 font-mono">
                Ref: <span className="text-[#FFC81E] font-bold">{orderNumber}</span> • Prj: <span className="text-slate-200 font-bold">{projectId}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-1.5">
            {/* 11-Category Surcharge Engine Quick Trigger Button */}
            {cartItems.length > 0 && (
              <button
                onClick={() => {
                  setSurchargeModalItem(null);
                  setIs11CatModalOpen(true);
                }}
                className="bg-amber-400 hover:bg-amber-500 text-slate-950 px-2 py-1 rounded text-[10px] font-extrabold flex items-center space-x-1 transition shadow-xs"
                title="Open 11-Category Mathematical Surcharge Engine"
              >
                <Calculator className="w-3 h-3 text-slate-950" />
                <span className="hidden sm:inline">11-Cat Engine</span>
              </button>
            )}

            {/* Batch Multi-Factor Quick Trigger Button */}
            {cartItems.length > 0 && (
              <button
                onClick={() => setShowBatchFactorModal(true)}
                className="bg-orange-500 hover:bg-orange-600 text-white px-2 py-1 rounded text-[10px] font-bold flex items-center space-x-1 transition shadow-xs"
                title="Apply multi-factor price adjustments to all order items"
              >
                <SlidersHorizontal className="w-3 h-3" />
                <span className="hidden sm:inline">Batch Multi-Factor</span>
              </button>
            )}

            {/* Full Screen Mode Toggle Button */}
            <button
              onClick={() => setIsFullScreen(!isFullScreen)}
              className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded transition flex items-center space-x-1"
              title={isFullScreen ? "Switch to Sidebar View" : "Expand to Full Screen View"}
            >
              {isFullScreen ? (
                <>
                  <Minimize2 className="w-4 h-4 text-orange-400" />
                  <span className="text-[10px] font-bold text-slate-200 hidden md:inline">Sidebar</span>
                </>
              ) : (
                <>
                  <Maximize2 className="w-4 h-4 text-orange-400" />
                  <span className="text-[10px] font-bold text-slate-200 hidden md:inline">Full Screen</span>
                </>
              )}
            </button>

            <button
              onClick={handleResetOrder}
              className="flex items-center space-x-1 px-1.5 py-1 text-slate-300 hover:text-white hover:bg-slate-800 rounded transition text-[11px]"
              title="Start Fresh Quotation Draft (Ctrl + N)"
            >
              <RotateCcw className="w-3.5 h-3.5 text-orange-400" />
              <kbd className="text-[9px] font-mono font-bold bg-slate-800 text-slate-300 border border-slate-700 px-1 py-0.2 rounded">
                Ctrl+N
              </kbd>
            </button>
            <button
              onClick={onToggleOpen}
              className="p-1 text-slate-300 hover:text-white hover:bg-slate-800 rounded transition"
              title="Close Panel (Alt + B)"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* TOAST SUCCESS NOTIFICATION */}
        {orderSavedToast && (
          <div className="bg-emerald-600 text-white p-2 px-3 text-xs font-semibold flex items-center justify-between shadow-xs">
            <div className="flex items-center space-x-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-emerald-200" />
              <span className="text-[11px]">{orderSavedToast}</span>
            </div>
            <button onClick={() => setOrderSavedToast(null)} className="text-emerald-200 hover:text-white">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* SCROLLABLE BODY PANELS */}
        <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-slate-50 text-slate-900">

          {/* PROJECT NAME FIELD */}
          <div className="bg-white border border-slate-200 rounded-md p-2.5 space-y-1 shadow-2xs">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
              Project / Site Reference Name
            </label>
            <input
              type="text"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              placeholder="e.g. Nawala Commercial Glazing"
              className="w-full pos-input text-xs"
            />
          </div>

          {/* CUSTOMER SELECTION CARD */}
          <div className="bg-white border border-slate-200 rounded-md p-2.5 space-y-2 shadow-2xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
              <div className="flex items-center space-x-1.5">
                <User className="w-3.5 h-3.5 text-orange-500" />
                <span className="text-xs font-bold text-slate-900">Customer Account</span>
              </div>
              <button
                type="button"
                onClick={() => setIsCreatingCustomer(!isCreatingCustomer)}
                className="text-[11px] font-semibold text-orange-600 hover:text-orange-800 flex items-center space-x-0.5"
              >
                {isCreatingCustomer ? <X className="w-3 h-3" /> : <UserPlus className="w-3 h-3" />}
                <span>{isCreatingCustomer ? 'Cancel' : '+ New Customer'}</span>
              </button>
            </div>

            {/* Customer Dropdown */}
            {!isCreatingCustomer ? (
              <div className="space-y-1.5">
                <select
                  value={selectedCustomerId}
                  onChange={(e) => setSelectedCustomerId(e.target.value)}
                  className="w-full pos-input font-medium text-xs"
                >
                  {customers.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.customer_type}) — {c.phone}
                    </option>
                  ))}
                </select>

                {activeCustomer && (
                  <div className="bg-slate-50 border border-slate-200 rounded p-2 text-[11px] space-y-0.5">
                    <div className="flex items-center justify-between text-slate-900 font-bold">
                      <span className="truncate">{activeCustomer.name}</span>
                      <span className="px-1.5 py-0.2 bg-slate-200 text-slate-800 rounded text-[9px] font-semibold">
                        {activeCustomer.customer_type}
                      </span>
                    </div>
                    <div className="text-slate-500 flex items-center justify-between text-[10px]">
                      <span>📞 {activeCustomer.phone}</span>
                      <span>📍 {activeCustomer.district_region || 'Colombo'}</span>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* Inline Customer Creation Form */
              <form onSubmit={handleSaveNewCustomer} className="bg-slate-50 border border-slate-200 rounded p-2 space-y-2">
                <span className="text-[10px] font-bold text-slate-700 uppercase block">Add Customer</span>
                
                <input
                  type="text"
                  required
                  placeholder="Customer / Business Name *"
                  value={newCustName}
                  onChange={(e) => setNewCustName(e.target.value)}
                  className="w-full pos-input"
                />

                <div className="grid grid-cols-2 gap-1.5">
                  <input
                    type="text"
                    required
                    placeholder="Phone *"
                    value={newCustPhone}
                    onChange={(e) => setNewCustPhone(e.target.value)}
                    className="w-full pos-input"
                  />
                  <select
                    value={newCustType}
                    onChange={(e) => setNewCustType(e.target.value as CustomerType)}
                    className="w-full pos-input"
                  >
                    <option value="Company">Company</option>
                    <option value="Distributor">Distributor</option>
                    <option value="Developer">Developer</option>
                    <option value="Retail Customer">Retail</option>
                  </select>
                </div>

                <button
                  type="submit"
                  className="w-full btn-pos-orange py-1 text-[11px]"
                >
                  Save & Select Customer
                </button>
              </form>
            )}
          </div>

          {/* QUICK SEARCH TO ADD ITEMS */}
          <div className="relative">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              <input
                ref={searchInputRef}
                id="billing-quick-search-input"
                type="text"
                placeholder="Quick search catalog to add items..."
                value={quickSearch}
                onChange={(e) => {
                  setQuickSearch(e.target.value);
                  setShowSearchDropdown(true);
                }}
                className="w-full pos-input pl-8 pr-14"
              />
              <kbd 
                className="absolute right-2.5 top-2 text-[9px] font-mono font-bold bg-slate-100 text-slate-500 border border-slate-200 px-1 py-0.5 rounded shadow-2xs pointer-events-none"
                title="Press Ctrl + S to focus search anywhere"
              >
                Ctrl+S
              </kbd>
            </div>

            {/* Auto-suggest dropdown */}
            {showSearchDropdown && filteredSearchProducts.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-md shadow-lg z-20 max-h-48 overflow-y-auto divide-y divide-slate-100">
                {filteredSearchProducts.map(p => (
                  <button
                    key={p.id}
                    onClick={() => handleQuickAddItem(p)}
                    className="w-full p-2 text-left hover:bg-orange-50 flex items-center justify-between transition text-xs"
                  >
                    <div>
                      <div className="font-bold text-slate-900 flex items-center space-x-1">
                        <span className="text-orange-600 font-mono text-[10px]">[{p.product_code}]</span>
                        <span className="text-xs">{p.product_name}</span>
                      </div>
                      <span className="text-[10px] text-slate-500">{p.category} • {p.unit}</span>
                    </div>
                    <span className="font-mono font-bold text-slate-900 text-[11px]">
                      Rs. {(p.current_price || p.base_price || 0).toLocaleString()}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* CART LINE ITEMS LIST */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 uppercase">
                Order Items ({cartItems.length})
              </span>
              {cartItems.length > 0 && (
                <span className="text-[11px] text-slate-600 font-mono">
                  Subtotal: <strong className="text-slate-900">Rs. {materialSubtotal.toLocaleString()}</strong>
                </span>
              )}
            </div>

            {cartItems.length === 0 ? (
              <div className="bg-white border border-dashed border-slate-300 rounded-md p-5 text-center space-y-1">
                <ShoppingCart className="w-6 h-6 text-slate-300 mx-auto" />
                <p className="text-xs font-bold text-slate-600">No items added to quote</p>
                <p className="text-[10px] text-slate-400">
                  Select <strong className="text-orange-600">'Add to Quote'</strong> on any catalog product.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {cartItems.map((item) => {
                  const masterProd = products.find(p => p.id === item.product_id || p.product_code === item.product_code);

                  return (
                    <div 
                      key={item.id}
                      className="bg-white border border-slate-200 hover:border-slate-300 rounded-md p-2 space-y-1.5 shadow-2xs transition"
                    >
                      {/* Item Header */}
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center space-x-1.5">
                            <span className="px-1 py-0.2 bg-slate-100 text-slate-700 font-mono font-bold text-[9px] rounded border border-slate-200">
                              {item.product_code}
                            </span>
                            <span className="text-xs font-bold text-slate-900 truncate max-w-[180px]">
                              {item.product_name}
                            </span>
                          </div>
                          {item.packed_work_name && (
                            <div className="mt-0.5">
                              <span className="inline-flex items-center space-x-1 px-1.5 py-0.2 bg-purple-100 text-purple-900 border border-purple-200 text-[9px] font-extrabold rounded">
                                <PackageCheck className="w-2.5 h-2.5 text-purple-700" />
                                <span>Packed Work: {item.packed_work_name}</span>
                              </span>
                            </div>
                          )}
                          {item.price_source_label && !item.packed_work_name && (
                            <span className="text-[9px] text-orange-600 block mt-0.5 font-medium">
                              Tier: {item.price_source_label}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center space-x-1">
                          {masterProd && onOpenProductSpecs && (
                            <button
                              type="button"
                              onClick={() => onOpenProductSpecs(masterProd)}
                              className="p-1 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded transition"
                              title="Specs"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(item.id)}
                            className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition"
                            title="Remove"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Line Item Form Inputs */}
                      <div className="grid grid-cols-3 gap-1.5 text-xs">
                        {/* Unit Type */}
                        <div>
                          <label className="text-[9px] text-slate-500 font-semibold block mb-0.5">Unit</label>
                          <select
                            value={item.unit}
                            onChange={(e) => handleUpdateItem(item.id, { unit: e.target.value as ProductUnit })}
                            className="w-full pos-input py-0.5 px-1 text-[10px]"
                          >
                            <option value="bar">bar</option>
                            <option value="m²">m²</option>
                            <option value="meter">meter</option>
                            <option value="kg">kg</option>
                            <option value="nos">nos</option>
                          </select>
                        </div>

                        {/* Quantity Stepper */}
                        <div>
                          <label className="text-[9px] text-slate-500 font-semibold block mb-0.5">Qty</label>
                          <div className="flex items-center border border-slate-300 rounded overflow-hidden bg-white">
                            <button
                              type="button"
                              onClick={() => handleUpdateItem(item.id, { quantity: Math.max(1, item.quantity - 1) })}
                              className="px-1.5 py-0.5 text-slate-600 hover:bg-slate-100 font-bold text-xs"
                            >
                              -
                            </button>
                            <input
                              type="number"
                              min="1"
                              value={item.quantity}
                              onChange={(e) => handleUpdateItem(item.id, { quantity: Math.max(1, parseInt(e.target.value) || 1) })}
                              className="w-full text-center text-xs font-bold text-slate-900 focus:outline-none"
                            />
                            <button
                              type="button"
                              onClick={() => handleUpdateItem(item.id, { quantity: item.quantity + 1 })}
                              className="px-1.5 py-0.5 text-slate-600 hover:bg-slate-100 font-bold text-xs"
                            >
                              +
                            </button>
                          </div>
                        </div>

                        {/* Unit Price Rate */}
                        <div>
                          <label className="text-[9px] text-slate-500 font-semibold block mb-0.5">Rate (LKR)</label>
                          <input
                            type="number"
                            value={item.unit_price}
                            onChange={(e) => handleUpdateItem(item.id, { unit_price: parseFloat(e.target.value) || 0 })}
                            className="w-full pos-input py-0.5 px-1 font-mono text-[11px] font-bold text-slate-900"
                          />
                        </div>
                      </div>

                      {/* Line Total Calculation */}
                      <div className="flex items-center justify-between border-t border-slate-100 pt-1 text-xs">
                        <span className="text-slate-500 text-[10px]">{item.quantity} × Rs.{item.unit_price.toLocaleString()}</span>
                        <span className="font-mono font-bold text-slate-900 text-xs">
                          Rs. {item.total_price.toLocaleString()}
                        </span>
                      </div>

                      {/* 11-Category Surcharge Breakdown Badges */}
                      {item.surcharge_breakdown_11cat && item.surcharge_breakdown_11cat.length > 0 && (
                        <div className="flex flex-wrap gap-1 pt-1">
                          {item.surcharge_breakdown_11cat.map(b => (
                            <span key={b.categoryId} className="inline-flex items-center text-[9px] font-medium bg-orange-100 text-orange-900 px-1.5 py-0.5 rounded border border-orange-200">
                              <span className="font-bold mr-1">{b.categoryName}:</span> {b.optionName} (+Rs. {b.amountLkr.toLocaleString()})
                            </span>
                          ))}
                        </div>
                      )}

                      {/* 11-Category Surcharge Calculation Modal Trigger */}
                      <button
                        type="button"
                        onClick={() => {
                          setSurchargeModalItem(item);
                          setIs11CatModalOpen(true);
                        }}
                        className="w-full mt-1 bg-[#0F203C] hover:bg-slate-800 text-white text-[10px] font-bold py-1 px-2 rounded flex items-center justify-between transition shadow-2xs"
                      >
                        <div className="flex items-center space-x-1">
                          <Calculator className="w-3.5 h-3.5 text-amber-400" />
                          <span>11-Category Surcharge Engine</span>
                        </div>
                        <span className="text-[9px] font-mono text-amber-300 font-bold">
                          {item.surcharge_breakdown_11cat?.length || 0} Active
                        </span>
                      </button>

                      {/* Selected Engineering Specs & Custom Options Badges */}
                      {((item.spec_surcharges_applied && Object.keys(item.spec_surcharges_applied).length > 0) ||
                        (item.custom_options_applied && Object.keys(item.custom_options_applied).length > 0)) && (
                        <div className="flex flex-wrap gap-1 pt-1">
                          {item.spec_surcharges_applied && Object.entries(item.spec_surcharges_applied).map(([key, s]) => {
                            const spec = s as { categoryName: string; optionName: string; surchargeLkr: number };
                            return (
                              <span key={key} className="inline-flex items-center text-[9px] font-medium bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded border border-slate-200">
                                <span className="font-bold mr-1 text-slate-900">{spec.categoryName}:</span> {spec.optionName} {spec.surchargeLkr > 0 ? `(+Rs. ${spec.surchargeLkr.toLocaleString()})` : ''}
                              </span>
                            );
                          })}
                          {item.custom_options_applied && Object.entries(item.custom_options_applied).map(([catId, o]) => {
                            const opt = o as { categoryName: string; optionName: string; surchargeLkr: number };
                            return (
                              <span key={catId} className="inline-flex items-center text-[9px] font-medium bg-orange-50 text-orange-800 px-1.5 py-0.5 rounded border border-orange-200">
                                <span className="font-bold mr-1">{opt.categoryName}:</span> {opt.optionName} (+Rs. {opt.surchargeLkr.toLocaleString()})
                              </span>
                            );
                          })}
                        </div>
                      )}

                      {/* Multi-Factor Spec & Price Adjuster Toggle & Drawer */}
                      <div className="pt-1 border-t border-slate-100">
                        <button
                          type="button"
                          onClick={() => setExpandedFactorItemId(expandedFactorItemId === item.id ? null : item.id)}
                          className="w-full flex items-center justify-between text-[10px] font-bold text-orange-600 hover:text-orange-700 bg-orange-50/70 hover:bg-orange-50 px-2 py-1 rounded transition cursor-pointer"
                        >
                          <div className="flex items-center space-x-1">
                            <SlidersHorizontal className="w-3 h-3 text-orange-500" />
                            <span>Multi-Factor Specs & Price Adjuster</span>
                          </div>
                          {expandedFactorItemId === item.id ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                        </button>

                        {expandedFactorItemId === item.id && (
                          <div className="mt-1.5 p-2.5 bg-slate-100/90 border border-slate-300 rounded-md space-y-2 text-[10px] animate-fade-in shadow-2xs">
                            <div className="grid grid-cols-2 gap-2">
                              {/* Thickness Factor */}
                              <div>
                                <label className="block text-[9px] font-bold text-slate-700 mb-0.5">Thickness Spec</label>
                                <select
                                  value={item.thickness_applied || '1.0mm'}
                                  onChange={(e) => handleApplyItemFactors(item.id, { thickness: e.target.value as MaterialThickness })}
                                  className="w-full pos-input text-[10px] py-1 bg-white font-semibold"
                                >
                                  <option value="1.0mm">1.0mm Standard (+Rs.0)</option>
                                  <option value="1.2mm">1.2mm Medium (+Rs.450)</option>
                                  <option value="1.5mm">1.5mm Heavy (+Rs.850)</option>
                                  <option value="2.0mm">2.0mm Commercial (+Rs.1,400)</option>
                                  <option value="3.0mm">3.0mm Heavy Duty (+Rs.2,200)</option>
                                </select>
                              </div>

                              {/* Finish Factor */}
                              <div>
                                <label className="block text-[9px] font-bold text-slate-700 mb-0.5">Finish / Coating</label>
                                <select
                                  value={item.finish_applied || 'Mill Finish'}
                                  onChange={(e) => handleApplyItemFactors(item.id, { finish: e.target.value as MaterialFinish })}
                                  className="w-full pos-input text-[10px] py-1 bg-white font-semibold"
                                >
                                  <option value="Mill Finish">Mill Finish (+Rs.0)</option>
                                  <option value="Anodized">Anodized (+Rs.350)</option>
                                  <option value="Powder Coated">Powder Coated (+Rs.600)</option>
                                  <option value="Wood Grain">Wood Grain (+Rs.1,200)</option>
                                  <option value="PVDF">PVDF Coating (+Rs.1,500)</option>
                                  <option value="Brushed">Brushed Finish (+Rs.800)</option>
                                </select>
                              </div>

                              {/* Glass Type Factor */}
                              <div>
                                <label className="block text-[9px] font-bold text-slate-700 mb-0.5">Glass Specification</label>
                                <select
                                  value={item.glass_type_applied || 'None'}
                                  onChange={(e) => handleApplyItemFactors(item.id, { glass: e.target.value as GlassType })}
                                  className="w-full pos-input text-[10px] py-1 bg-white font-semibold"
                                >
                                  <option value="None">None (+Rs.0)</option>
                                  <option value="5mm Clear Float">5mm Clear Float (+Rs.0)</option>
                                  <option value="6mm Tinted">6mm Tinted (+Rs.250)</option>
                                  <option value="8mm Toughened">8mm Toughened (+Rs.800)</option>
                                  <option value="10mm Laminated">10mm Laminated (+Rs.1,100)</option>
                                  <option value="Double Glazed">Double Glazed (+Rs.1,800)</option>
                                </select>
                              </div>

                              {/* Margin Adjustment % */}
                              <div>
                                <label className="block text-[9px] font-bold text-slate-700 mb-0.5">Margin Markup %</label>
                                <select
                                  value={item.margin_pct_applied !== undefined ? item.margin_pct_applied : 0}
                                  onChange={(e) => handleApplyItemFactors(item.id, { marginPct: parseFloat(e.target.value) || 0 })}
                                  className="w-full pos-input text-[10px] py-1 bg-white font-bold text-slate-900 border-orange-300 focus:border-orange-500"
                                >
                                  <option value="0">0% (Base Rate)</option>
                                  <option value="5">+5% Wind Load / Region</option>
                                  <option value="10">+10% Premium Spec</option>
                                  <option value="15">+15% Expedited Custom</option>
                                  <option value="-5">-5% Wholesale Discount</option>
                                  <option value="-10">-10% Contractor Discount</option>
                                </select>
                              </div>
                            </div>

                            <div className="text-[9px] font-mono text-slate-800 bg-orange-100/90 p-1.5 rounded border border-orange-200 flex items-center justify-between">
                              <span className="truncate font-semibold text-orange-900">
                                {item.price_source_label || 'Multi-Factor Applied'}
                              </span>
                              <span className="font-bold text-orange-800 ml-1 shrink-0">
                                Rate: Rs. {item.unit_price.toLocaleString()}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* TRANSPORT & LOGISTICS MODEL */}
          <div className="bg-white border border-slate-200 rounded-md p-2.5 space-y-2 shadow-2xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-1.5">
                <Truck className="w-3.5 h-3.5 text-orange-500" />
                <span className="text-xs font-bold text-slate-900">Delivery & Transport Fee</span>
              </div>
              <span className="font-mono font-bold text-xs text-orange-600">
                Rs. {calculatedTransportCost.toLocaleString()}
              </span>
            </div>

            <div className="space-y-1.5 text-xs">
              <select
                value={selectedVehicleId}
                onChange={(e) => setSelectedVehicleId(e.target.value)}
                className="w-full pos-input text-[11px]"
              >
                {vehicles.map(v => (
                  <option key={v.id} value={v.id}>
                    {v.type} — Base: Rs.{v.base_charge.toLocaleString()}
                  </option>
                ))}
              </select>

              <div className="grid grid-cols-2 gap-1.5">
                <div>
                  <label className="text-[9px] text-slate-500 font-semibold block mb-0.5">Distance (KM)</label>
                  <input
                    type="number"
                    min="1"
                    value={deliveryDistanceKm}
                    onChange={(e) => setDeliveryDistanceKm(Math.max(1, parseFloat(e.target.value) || 0))}
                    className="w-full pos-input font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="text-[9px] text-slate-500 font-semibold block mb-0.5">District</label>
                  <select
                    value={deliveryLocation}
                    onChange={(e) => setDeliveryLocation(e.target.value)}
                    className="w-full pos-input"
                  >
                    {locations.map(l => (
                      <option key={l.id} value={l.name}>{l.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* OTHER SERVICES & FITTING CHARGES */}
          <div className="bg-white border border-slate-200 rounded-md p-2.5 space-y-2 shadow-2xs">
            <span className="text-xs font-bold text-slate-900 block">Fabrication & Fitting Services</span>

            <div className="grid grid-cols-3 gap-1.5 text-xs">
              <div>
                <label className="text-[9px] text-slate-500 font-semibold block mb-0.5">Fabrication</label>
                <input
                  type="number"
                  value={fabricationCharge}
                  onChange={(e) => setFabricationCharge(parseFloat(e.target.value) || 0)}
                  className="w-full pos-input font-mono"
                />
              </div>

              <div>
                <label className="text-[9px] text-slate-500 font-semibold block mb-0.5">Installation</label>
                <input
                  type="number"
                  value={installationCharge}
                  onChange={(e) => setInstallationCharge(parseFloat(e.target.value) || 0)}
                  className="w-full pos-input font-mono"
                />
              </div>

              <div>
                <label className="text-[9px] text-slate-500 font-semibold block mb-0.5">Hardware Fee</label>
                <input
                  type="number"
                  value={hardwareFittingCharge}
                  onChange={(e) => setHardwareFittingCharge(parseFloat(e.target.value) || 0)}
                  className="w-full pos-input font-mono"
                />
              </div>
            </div>
          </div>

          {/* DISCOUNTS SECTION */}
          <div className="bg-white border border-slate-200 rounded-md p-2.5 space-y-2 shadow-2xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-1.5">
                <Tag className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-xs font-bold text-slate-900">Special Discount</span>
              </div>
              <span className="font-mono font-bold text-xs text-emerald-600">
                -Rs. {discountAmount.toLocaleString()}
              </span>
            </div>

            {autoDiscountReason && !isDiscountOverridden && (
              <div className="bg-emerald-50 border border-emerald-200 rounded p-1.5 text-[10px] text-emerald-800 font-semibold flex items-center space-x-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                <span>Auto: {autoDiscountReason}</span>
              </div>
            )}

            <div className="flex items-center space-x-1.5 text-xs">
              <input
                type="number"
                min="0"
                step="0.1"
                value={manualDiscountVal}
                onChange={(e) => {
                  setManualDiscountVal(parseFloat(e.target.value) || 0);
                  setIsDiscountOverridden(true);
                }}
                placeholder="Val"
                className="w-full pos-input font-mono font-bold"
              />
              <button
                type="button"
                onClick={() => {
                  setDiscountMode(discountMode === 'PERCENT' ? 'LKR' : 'PERCENT');
                  setIsDiscountOverridden(true);
                }}
                className="bg-slate-100 border border-slate-300 text-slate-800 px-2 py-1 rounded text-[10px] font-bold"
              >
                {discountMode === 'PERCENT' ? '%' : 'LKR'}
              </button>
            </div>
          </div>

          {/* VAT TOGGLE */}
          <div className="bg-white border border-slate-200 rounded-md p-2.5 flex items-center justify-between shadow-2xs text-xs">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="vatCheckbox"
                checked={applyVat}
                onChange={(e) => setApplyVat(e.target.checked)}
                className="w-3.5 h-3.5 accent-orange-500 rounded cursor-pointer"
              />
              <label htmlFor="vatCheckbox" className="font-bold text-slate-700 cursor-pointer">
                Apply VAT Tax (18%)
              </label>
            </div>
            <span className="font-mono text-xs text-slate-600">
              Rs. {taxAmount.toLocaleString()}
            </span>
          </div>

        </div>

        {/* FINANCIAL SUMMARY & FOOTER ACTION BUTTONS */}
        <div className="bg-white border-t border-slate-200 p-3 space-y-2.5 shrink-0 shadow-lg">
          <div className="space-y-1 text-xs">
            <div className="flex items-center justify-between text-slate-600 text-[11px]">
              <span>Materials Subtotal:</span>
              <span className="font-mono font-semibold">Rs. {materialSubtotal.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between text-slate-600 text-[11px]">
              <span>Transport & Delivery:</span>
              <span className="font-mono font-semibold">Rs. {calculatedTransportCost.toLocaleString()}</span>
            </div>
            {discountAmount > 0 && (
              <div className="flex items-center justify-between text-emerald-600 text-[11px] font-semibold">
                <span>Special Discount:</span>
                <span className="font-mono">-Rs. {discountAmount.toLocaleString()}</span>
              </div>
            )}
            {applyVat && (
              <div className="flex items-center justify-between text-slate-600 text-[11px]">
                <span>VAT Tax (18%):</span>
                <span className="font-mono">Rs. {taxAmount.toLocaleString()}</span>
              </div>
            )}

            <div className="flex items-center justify-between text-slate-900 font-bold text-sm border-t border-slate-200 pt-1.5">
              <span>GRAND TOTAL:</span>
              <span className="font-mono text-orange-600 text-base">
                Rs. {netGrandTotal.toLocaleString()}
              </span>
            </div>
          </div>

          {/* ACTION BUTTONS (Confirm & Save, Download PDF, Print) */}
          <div className="grid grid-cols-3 gap-1.5 pt-0.5">
            <button
              type="button"
              onClick={handleSaveOrder}
              disabled={isSubmitting || cartItems.length === 0}
              className="btn-pos-orange py-2 text-xs flex items-center justify-center space-x-1 disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isSubmitting ? 'Saving...' : 'Save Order'}</span>
            </button>

            <button
              type="button"
              disabled={cartItems.length === 0 && !savedOrderResult}
              onClick={() => {
                if (savedOrderResult) {
                  generateAndDownloadQuotationPDF(savedOrderResult, undefined, activeBranch);
                } else if (cartItems.length > 0) {
                  const selCust = customers.find(c => c.id === selectedCustomerId);
                  const tempQuote: Quotation = {
                    id: `draft-${Date.now()}`,
                    quotation_number: orderNumber || `INV-DRAFT-${Math.floor(1000 + Math.random() * 9000)}`,
                    customer_name: selCust ? selCust.name : (newCustName || 'Valued Client'),
                    customer_phone: selCust ? selCust.phone : (newCustPhone || ''),
                    customer_email: selCust ? selCust.email : (newCustEmail || ''),
                    site_address: selCust ? selCust.address : (newCustAddress || deliveryLocation),
                    site_location_name: deliveryLocation,
                    branch_id: activeBranch.id,
                    branch_name: activeBranch.name,
                    branch_code: activeBranch.code,
                    date: new Date().toISOString().split('T')[0],
                    valid_until: '30 Days',
                    status: 'Temporary Branch Draft',
                    items: cartItems,
                    subtotal_price: materialSubtotal,
                    transport_cost: calculatedTransportCost,
                    discount_amount: discountAmount,
                    tax_amount: taxAmount,
                    net_total: netGrandTotal,
                    total_weight_kg: cartItems.reduce((acc, it) => acc + (it.weight_kg * it.quantity), 0),
                    created_by: activeBranch.manager_name
                  };
                  generateAndDownloadQuotationPDF(tempQuote, undefined, activeBranch);
                }
              }}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 text-xs rounded flex items-center justify-center space-x-1 shadow-2xs disabled:opacity-50 transition"
              title="Download Professional Quotation PDF"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download PDF</span>
            </button>

            <button
              type="button"
              disabled={cartItems.length === 0 && !savedOrderResult}
              onClick={() => {
                if (savedOrderResult) {
                  setPrintableModalQuote(savedOrderResult);
                } else if (cartItems.length > 0) {
                  const selCust = customers.find(c => c.id === selectedCustomerId);
                  const tempQuote: Quotation = {
                    id: `draft-${Date.now()}`,
                    quotation_number: orderNumber || `INV-DRAFT-${Math.floor(1000 + Math.random() * 9000)}`,
                    customer_name: selCust ? selCust.name : (newCustName || 'Valued Client'),
                    customer_phone: selCust ? selCust.phone : (newCustPhone || ''),
                    customer_email: selCust ? selCust.email : (newCustEmail || ''),
                    site_address: selCust ? selCust.address : (newCustAddress || deliveryLocation),
                    site_location_name: deliveryLocation,
                    branch_id: activeBranch.id,
                    branch_name: activeBranch.name,
                    branch_code: activeBranch.code,
                    date: new Date().toISOString().split('T')[0],
                    valid_until: '30 Days',
                    status: 'Temporary Branch Draft',
                    items: cartItems,
                    subtotal_price: materialSubtotal,
                    transport_cost: calculatedTransportCost,
                    discount_amount: discountAmount,
                    tax_amount: taxAmount,
                    net_total: netGrandTotal,
                    total_weight_kg: cartItems.reduce((acc, it) => acc + (it.weight_kg * it.quantity), 0),
                    created_by: activeBranch.manager_name
                  };
                  setPrintableModalQuote(tempQuote);
                }
              }}
              className="btn-pos-darkblue py-2 text-xs flex items-center justify-center space-x-1 disabled:opacity-50 cursor-pointer"
              title="Trigger printer-friendly version of quotation using CSS media queries"
            >
              <Printer className="w-3.5 h-3.5 text-[#FFC81E]" />
              <span>Print</span>
            </button>
          </div>
        </div>
      </div>

      {printableModalQuote && (
        <PrintableQuotationModal
          quotation={printableModalQuote}
          activeBranch={activeBranch}
          onClose={() => setPrintableModalQuote(null)}
        />
      )}

      {/* Batch Multi-Factor Adjustment Modal */}
      {showBatchFactorModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-3">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-md w-full overflow-hidden text-xs">
            <div className="bg-slate-900 text-white p-3.5 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="p-1.5 bg-orange-500 rounded-md">
                  <SlidersHorizontal className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm">Batch Multi-Factor Price Adjuster</h3>
                  <p className="text-[10px] text-slate-300">Apply multi-factor spec adjustments across all {cartItems.length} items</p>
                </div>
              </div>
              <button onClick={() => setShowBatchFactorModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 space-y-3.5 bg-slate-50">
              <div className="space-y-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Thickness Specification (All Items)</label>
                  <select
                    value={batchThickness}
                    onChange={(e) => setBatchThickness(e.target.value)}
                    className="w-full pos-input py-1.5 text-xs"
                  >
                    <option value="">Keep Existing / Unchanged</option>
                    <option value="1.0mm">1.0mm Standard (+Rs.0)</option>
                    <option value="1.2mm">1.2mm Medium (+Rs.450/bar)</option>
                    <option value="1.5mm">1.5mm Heavy (+Rs.850/bar)</option>
                    <option value="2.0mm">2.0mm Commercial (+Rs.1,400/bar)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Finish Specification (All Items)</label>
                  <select
                    value={batchFinish}
                    onChange={(e) => setBatchFinish(e.target.value)}
                    className="w-full pos-input py-1.5 text-xs"
                  >
                    <option value="">Keep Existing / Unchanged</option>
                    <option value="Mill Finish">Mill Finish (+Rs.0)</option>
                    <option value="Anodized">Anodized (+Rs.350)</option>
                    <option value="Powder Coated">Powder Coated (+Rs.600)</option>
                    <option value="Wood Grain">Wood Grain (+Rs.1,200)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Glass Type Specification (All Items)</label>
                  <select
                    value={batchGlass}
                    onChange={(e) => setBatchGlass(e.target.value)}
                    className="w-full pos-input py-1.5 text-xs"
                  >
                    <option value="">Keep Existing / Unchanged</option>
                    <option value="None">None (+Rs.0)</option>
                    <option value="5mm Clear Float">5mm Clear Float (+Rs.0)</option>
                    <option value="6mm Tinted">6mm Tinted (+Rs.250)</option>
                    <option value="8mm Toughened">8mm Toughened (+Rs.800)</option>
                    <option value="10mm Laminated">10mm Laminated (+Rs.1,100)</option>
                    <option value="Double Glazed">Double Glazed (+Rs.1,800)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Global Multi-Factor Margin Adjustment %</label>
                  <select
                    value={batchMarginPct}
                    onChange={(e) => setBatchMarginPct(parseFloat(e.target.value) || 0)}
                    className="w-full pos-input py-1.5 text-xs font-bold text-slate-900"
                  >
                    <option value="0">0% (Base Rate)</option>
                    <option value="5">+5% High Wind / Regional Surcharge</option>
                    <option value="10">+10% Premium Project Markup</option>
                    <option value="15">+15% Expedited Custom Order</option>
                    <option value="-5">-5% Volume Wholesale Rate</option>
                    <option value="-10">-10% VIP Contractor Rate</option>
                  </select>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end space-x-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowBatchFactorModal(false)}
                  className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold rounded"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleApplyBatchFactors}
                  className="px-4 py-1.5 bg-orange-500 hover:bg-orange-600 text-white font-extrabold rounded shadow transition flex items-center space-x-1"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Apply to All {cartItems.length} Items</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 11-Category Mathematical Surcharge Modal */}
      <Surcharge11CategoryModal
        isOpen={is11CatModalOpen}
        onClose={() => setIs11CatModalOpen(false)}
        item={surchargeModalItem}
        basePrice={
          surchargeModalItem 
            ? ((products.find(p => p.id === surchargeModalItem.product_id || p.product_code === surchargeModalItem.product_code)?.base_price) || surchargeModalItem.unit_price)
            : 10000
        }
        onApply={handleApply11CatSurcharges}
      />
    </>
  );
};
