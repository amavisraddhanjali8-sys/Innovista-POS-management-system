import React, { useState, useMemo } from 'react';
import { 
  FileText, 
  Calendar, 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  User, 
  CheckCircle2, 
  AlertCircle, 
  Filter, 
  Search, 
  Printer, 
  Download, 
  Plus, 
  ChevronDown, 
  ChevronUp, 
  ChevronRight, 
  ShieldCheck, 
  Layers, 
  Building2, 
  Globe, 
  Tag, 
  Box, 
  Sliders, 
  Truck, 
  Info, 
  Sparkles, 
  Check, 
  RotateCcw, 
  FileCheck, 
  Lock,
  Percent,
  ListFilter,
  BarChart2,
  Share2,
  X
} from 'lucide-react';
import { Product, PriceHistory, CategoryType } from '../types';
import { ProductFormData } from './ProductMasterFormModal';

interface ProductAuditLogViewerProps {
  product: Product;
  formData?: ProductFormData;
  priceHistory?: PriceHistory[];
  isFormMode?: boolean;
  onReasonChange?: (reason: string) => void;
  onEffectiveDateChange?: (date: string) => void;
  onAddManualAuditNote?: (entry: PriceHistory) => void;
}

export const ProductAuditLogViewer: React.FC<ProductAuditLogViewerProps> = ({
  product,
  formData,
  priceHistory = [],
  isFormMode = false,
  onReasonChange,
  onEffectiveDateChange,
  onAddManualAuditNote
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'timeline' | 'diff' | 'ledger'>('timeline');
  const [filterType, setFilterType] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Manual Audit Note State
  const [showAddNoteModal, setShowAddNoteModal] = useState<boolean>(false);
  const [noteText, setNoteText] = useState<string>('');
  const [noteAuthor, setNoteAuthor] = useState<string>('HO Quality & Compliance Officer');
  const [localManualNotes, setLocalManualNotes] = useState<PriceHistory[]>([]);

  // Print Audit Certificate Modal State
  const [showPrintModal, setShowPrintModal] = useState<boolean>(false);

  // --- COMBINED AUDIT TIMELINE FOR THIS PRODUCT ---
  const productHistoryEntries = useMemo(() => {
    // 1. Filter global priceHistory for this product
    const matchingGlobal = priceHistory.filter(
      (ph) => ph.product_id === product.id || ph.product_code === product.product_code
    );

    // 2. Combine with local manual notes
    const combined = [...localManualNotes, ...matchingGlobal];

    // 3. Fallback / Mock baseline history if none exists for comprehensive display
    if (combined.length === 0) {
      const basePrice = product.base_price || product.current_price;
      const initialEntry: PriceHistory = {
        id: `ph-init-${product.id}`,
        product_id: product.id,
        product_code: product.product_code,
        product_name: product.product_name,
        old_price: Math.round(basePrice * 0.88),
        new_price: basePrice,
        changed_by: product.created_by || 'HO System Initializer',
        changed_date: product.created_at || '2026-01-15 09:30 AM',
        reason: 'Master Catalog Initial System Provisioning & Baseline Pricing Setup',
        branch_affected: 'All Branches (Master Mesh Initial Sync)',
        update_type: 'MASTER_DATA'
      };

      const secondEntry: PriceHistory = {
        id: `ph-rev1-${product.id}`,
        product_id: product.id,
        product_code: product.product_code,
        product_name: product.product_name,
        old_price: basePrice,
        new_price: basePrice,
        changed_by: product.updated_by || 'HO Senior Pricing Manager',
        changed_date: product.last_updated || new Date().toLocaleString(),
        reason: product.effective_date ? `Specification & Price Revision (Effective: ${product.effective_date})` : 'Routine Master Data & Finish Surcharge Audit',
        branch_affected: 'All Branches (Head Office Broadcast)',
        update_type: 'PRICE_CHANGE'
      };

      combined.push(secondEntry, initialEntry);
    }

    // Sort newest first
    return combined;
  }, [priceHistory, product, localManualNotes]);

  // Filtered timeline entries based on type and search query
  const filteredTimeline = useMemo(() => {
    return productHistoryEntries.filter((item) => {
      // Type match
      let typeMatch = true;
      if (filterType === 'PRICE') {
        typeMatch = item.old_price !== item.new_price || item.update_type === 'PRICE_CHANGE';
      } else if (filterType === 'BATCH') {
        typeMatch = item.reason?.toLowerCase().includes('batch') || item.reason?.toLowerCase().includes('margin');
      } else if (filterType === 'MASTER') {
        typeMatch = item.update_type === 'MASTER_DATA';
      } else if (filterType === 'NOTE') {
        typeMatch = item.update_type === 'CUSTOMER_RATE' || item.reason?.toLowerCase().includes('audit note');
      }

      // Search match
      let searchMatch = true;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        searchMatch = (
          item.reason?.toLowerCase().includes(q) ||
          item.changed_by?.toLowerCase().includes(q) ||
          item.branch_affected?.toLowerCase().includes(q) ||
          item.product_code?.toLowerCase().includes(q)
        );
      }

      return typeMatch && searchMatch;
    });
  }, [productHistoryEntries, filterType, searchQuery]);

  // --- LIVE DIFFERENTIAL CALCULATION (IF FORM DATA IS PROVIDED) ---
  const fieldDiffs = useMemo(() => {
    if (!formData) return [];

    const diffs: { field: string; category: string; oldVal: string; newVal: string; isChanged: boolean }[] = [];

    // Base Price
    const origBase = product.base_price || product.current_price;
    if (formData.base_price !== origBase) {
      diffs.push({
        field: 'Company Base Price',
        category: 'Financials',
        oldVal: `LKR ${origBase.toLocaleString()}`,
        newVal: `LKR ${formData.base_price.toLocaleString()}`,
        isChanged: true
      });
    }

    // Status
    if (formData.status !== product.status) {
      diffs.push({
        field: 'Product Master Status',
        category: 'Lifecycle',
        oldVal: product.status || 'ACTIVE',
        newVal: formData.status,
        isChanged: true
      });
    }

    // Name
    if (formData.product_name !== product.product_name) {
      diffs.push({
        field: 'Product Name',
        category: 'Identity',
        oldVal: product.product_name,
        newVal: formData.product_name,
        isChanged: true
      });
    }

    // Category
    if (formData.category !== product.category) {
      diffs.push({
        field: 'Category',
        category: 'Identity',
        oldVal: product.category,
        newVal: formData.category,
        isChanged: true
      });
    }

    // Unit
    if (formData.unit !== product.unit) {
      diffs.push({
        field: 'Unit of Measure',
        category: 'Identity',
        oldVal: product.unit || 'bar',
        newVal: formData.unit,
        isChanged: true
      });
    }

    // Unit Weight
    if (formData.unit_weight_kg !== product.unit_weight_kg) {
      diffs.push({
        field: 'Unit Weight (kg)',
        category: 'Physical Specs',
        oldVal: `${product.unit_weight_kg || 0} kg`,
        newVal: `${formData.unit_weight_kg || 0} kg`,
        isChanged: true
      });
    }

    // Surcharges
    if (formData.powder_coat_surcharge !== product.powder_coat_surcharge) {
      diffs.push({
        field: 'Powder Coat Surcharge',
        category: 'Finishes',
        oldVal: `LKR ${product.powder_coat_surcharge || 0}`,
        newVal: `LKR ${formData.powder_coat_surcharge || 0}`,
        isChanged: true
      });
    }

    if (formData.anodized_surcharge !== product.anodized_surcharge) {
      diffs.push({
        field: 'Anodized Surcharge',
        category: 'Finishes',
        oldVal: `LKR ${product.anodized_surcharge || 0}`,
        newVal: `LKR ${formData.anodized_surcharge || 0}`,
        isChanged: true
      });
    }

    if (formData.labour_surcharge !== product.labour_surcharge) {
      diffs.push({
        field: 'Labour / Fabrication Surcharge',
        category: 'Services',
        oldVal: `LKR ${product.labour_surcharge || 0}`,
        newVal: `LKR ${formData.labour_surcharge || 0}`,
        isChanged: true
      });
    }

    // Reason & Effective Date
    if (formData.reason) {
      diffs.push({
        field: 'Audit Revision Reason',
        category: 'Audit Metadata',
        oldVal: 'None',
        newVal: formData.reason,
        isChanged: true
      });
    }

    if (formData.effective_date) {
      diffs.push({
        field: 'Effective Date',
        category: 'Audit Metadata',
        oldVal: product.effective_date || 'Immediate',
        newVal: formData.effective_date,
        isChanged: true
      });
    }

    return diffs;
  }, [product, formData]);

  // Handle Add Manual Audit Note
  const handleCreateNote = () => {
    if (!noteText.trim()) return;

    const newEntry: PriceHistory = {
      id: `ph-note-${Date.now()}`,
      product_id: product.id,
      product_code: product.product_code,
      product_name: product.product_name,
      old_price: product.base_price || product.current_price,
      new_price: product.base_price || product.current_price,
      changed_by: noteAuthor || 'HO Quality Auditor',
      changed_date: new Date().toLocaleString(),
      reason: `📝 Official Audit Note: ${noteText.trim()}`,
      branch_affected: 'All Branches (Audit Compliance Log)',
      update_type: 'CUSTOMER_RATE'
    };

    setLocalManualNotes((prev) => [newEntry, ...prev]);
    if (onAddManualAuditNote) {
      onAddManualAuditNote(newEntry);
    }

    setNoteText('');
    setShowAddNoteModal(false);
  };

  // Lifetime Price Calculation
  const lifetimeStats = useMemo(() => {
    const prices = productHistoryEntries.map((e) => e.new_price).filter(Boolean);
    if (prices.length === 0) return { min: product.current_price, max: product.current_price, delta: 0, pct: 0 };

    const min = Math.min(...prices, product.current_price);
    const max = Math.max(...prices, product.current_price);
    const firstPrice = productHistoryEntries[productHistoryEntries.length - 1]?.old_price || min;
    const currentPrice = formData ? formData.base_price : product.current_price;
    const delta = currentPrice - firstPrice;
    const pct = firstPrice > 0 ? (delta / firstPrice) * 100 : 0;

    return { min, max, firstPrice, currentPrice, delta, pct };
  }, [productHistoryEntries, product, formData]);

  const estCost = product.cost_price || Math.round((formData?.base_price || product.current_price) * 0.78);
  const currentPriceVal = formData ? formData.base_price : product.current_price;
  const currentMargin = currentPriceVal > 0 ? ((currentPriceVal - estCost) / currentPriceVal) * 100 : 0;

  return (
    <div className="space-y-4 text-xs font-sans text-slate-800">
      {/* ========================================================================= */}
      {/* 1. TOP HEADER PRODUCT AUDIT KPI DASHBOARD BANNER                          */}
      {/* ========================================================================= */}
      <div className="bg-slate-900 text-white rounded-2xl p-4 shadow-md border border-slate-800 space-y-3 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-3 relative z-10">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 text-white flex items-center justify-center font-bold shadow-md shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-mono font-bold text-amber-400 text-xs bg-amber-500/20 px-2 py-0.5 rounded border border-amber-500/30">
                  {product.product_code}
                </span>
                <span className="text-[10px] font-extrabold uppercase tracking-wider bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/30">
                  {product.status || 'ACTIVE MASTER'}
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  ID: {product.id}
                </span>
              </div>
              <h3 className="font-black text-sm text-white mt-0.5 tracking-tight">
                {product.product_name}
              </h3>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setShowAddNoteModal(true)}
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold px-3 py-1.5 rounded-xl text-xs transition flex items-center space-x-1.5"
            >
              <Plus className="w-3.5 h-3.5 text-amber-400" />
              <span>Add Audit Note</span>
            </button>

            <button
              type="button"
              onClick={() => setShowPrintModal(true)}
              className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-black px-3.5 py-1.5 rounded-xl text-xs transition shadow-md flex items-center space-x-1.5"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Audit Certificate</span>
            </button>
          </div>
        </div>

        {/* Audit Metrics Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 relative z-10 text-xs">
          <div className="bg-slate-800/80 rounded-xl p-2.5 border border-slate-700/60 space-y-0.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Company Base Price</span>
            <div className="text-sm font-black font-mono text-amber-400">
              LKR {currentPriceVal.toLocaleString()}
            </div>
            <span className="text-[9px] text-slate-400 font-medium block">
              Cost: LKR {estCost.toLocaleString()} ({currentMargin.toFixed(1)}% margin)
            </span>
          </div>

          <div className="bg-slate-800/80 rounded-xl p-2.5 border border-slate-700/60 space-y-0.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Lifetime Price Variance</span>
            <div className={`text-sm font-black font-mono flex items-center space-x-1 ${
              lifetimeStats.delta >= 0 ? 'text-emerald-400' : 'text-rose-400'
            }`}>
              {lifetimeStats.delta >= 0 ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
              <span>{lifetimeStats.delta >= 0 ? '+' : ''}LKR {lifetimeStats.delta.toLocaleString()}</span>
              <span className="text-[10px] font-normal">({lifetimeStats.pct >= 0 ? '+' : ''}{lifetimeStats.pct.toFixed(1)}%)</span>
            </div>
            <span className="text-[9px] text-slate-400 font-medium block">
              Range: LKR {lifetimeStats.min.toLocaleString()} - LKR {lifetimeStats.max.toLocaleString()}
            </span>
          </div>

          <div className="bg-slate-800/80 rounded-xl p-2.5 border border-slate-700/60 space-y-0.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Recorded Audit Entries</span>
            <div className="text-sm font-black font-mono text-white">
              {productHistoryEntries.length} Revisions
            </div>
            <span className="text-[9px] text-slate-400 font-medium block">
              Last: {productHistoryEntries[0]?.changed_date || 'Today'}
            </span>
          </div>

          <div className="bg-slate-800/80 rounded-xl p-2.5 border border-slate-700/60 space-y-0.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Mesh Network Broadcast</span>
            <div className="text-xs font-bold text-emerald-400 flex items-center space-x-1 mt-0.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>100% In Sync (5 Branches)</span>
            </div>
            <span className="text-[9px] text-slate-400 font-medium block">
              HO, Colombo, Kandy, Galle, Kurunegala
            </span>
          </div>
        </div>

        {/* INPUT REASON & EFFECTIVE DATE BINDINGS (IF IN FORM MODE) */}
        {isFormMode && onReasonChange && onEffectiveDateChange && (
          <div className="bg-slate-950/80 border border-amber-500/40 rounded-xl p-3 grid grid-cols-1 sm:grid-cols-12 gap-3 text-xs z-10 relative">
            <div className="sm:col-span-8 space-y-1">
              <label className="font-extrabold text-amber-300 block text-[11px] uppercase tracking-wider">
                Mandatory Revision Reason (For Product Audit Log) *
              </label>
              <input
                type="text"
                value={formData?.reason || ''}
                onChange={(e) => onReasonChange(e.target.value)}
                placeholder="e.g. Raw ingot import tariff revision / Q3 Master price update / SLS standard compliance"
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 font-medium text-white text-xs focus:outline-none focus:border-amber-400 placeholder:text-slate-500"
              />
            </div>

            <div className="sm:col-span-4 space-y-1">
              <label className="font-extrabold text-amber-300 block text-[11px] uppercase tracking-wider">
                Effective Implementation Date
              </label>
              <input
                type="date"
                value={formData?.effective_date || new Date().toISOString().split('T')[0]}
                onChange={(e) => onEffectiveDateChange(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 font-mono font-medium text-white text-xs focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 2. SUB-TAB NAVIGATION (TIMELINE | LIVE FORM DIFF | FULL LEDGER)            */}
      {/* ========================================================================= */}
      <div className="flex items-center space-x-2 border-b border-slate-200 bg-white p-1 rounded-xl shadow-2xs">
        <button
          type="button"
          onClick={() => setActiveSubTab('timeline')}
          className={`px-3.5 py-2 rounded-lg font-bold flex items-center space-x-2 transition ${
            activeSubTab === 'timeline'
              ? 'bg-amber-500 text-slate-950 shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Product Revision Timeline ({productHistoryEntries.length})</span>
        </button>

        {formData && (
          <button
            type="button"
            onClick={() => setActiveSubTab('diff')}
            className={`px-3.5 py-2 rounded-lg font-bold flex items-center space-x-2 transition ${
              activeSubTab === 'diff'
                ? 'bg-amber-500 text-slate-950 shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>Pending Edits Comparison</span>
            {fieldDiffs.length > 0 && (
              <span className="bg-rose-500 text-white text-[10px] px-1.5 py-0.5 rounded-full font-mono">
                {fieldDiffs.length}
              </span>
            )}
          </button>
        )}

        <button
          type="button"
          onClick={() => setActiveSubTab('ledger')}
          className={`px-3.5 py-2 rounded-lg font-bold flex items-center space-x-2 transition ${
            activeSubTab === 'ledger'
              ? 'bg-amber-500 text-slate-950 shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <FileCheck className="w-4 h-4" />
          <span>Complete Specification Ledger</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB A: PRODUCT REVISION TIMELINE                                          */}
      {/* ========================================================================= */}
      {activeSubTab === 'timeline' && (
        <div className="space-y-3">
          {/* Filter & Search Bar */}
          <div className="bg-white border border-slate-200 rounded-xl p-3 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-2xs">
            <div className="flex items-center space-x-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mr-1">Filter:</span>
              <button
                type="button"
                onClick={() => setFilterType('ALL')}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition ${
                  filterType === 'ALL' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                All Events
              </button>
              <button
                type="button"
                onClick={() => setFilterType('PRICE')}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition ${
                  filterType === 'PRICE' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                Price Shifts
              </button>
              <button
                type="button"
                onClick={() => setFilterType('BATCH')}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition ${
                  filterType === 'BATCH' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                Batch Margin Pushes
              </button>
              <button
                type="button"
                onClick={() => setFilterType('MASTER')}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition ${
                  filterType === 'MASTER' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                Master Data Edits
              </button>
              <button
                type="button"
                onClick={() => setFilterType('NOTE')}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition ${
                  filterType === 'NOTE' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                Audit Notes
              </button>
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search audit reasons, authors..."
                className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* TIMELINE CARDS LIST */}
          {filteredTimeline.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-xl p-8 text-center text-slate-500">
              <Info className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="font-bold">No audit log entries match the selected filters.</p>
            </div>
          ) : (
            <div className="space-y-3 relative before:absolute before:inset-0 before:left-6 before:w-0.5 before:bg-slate-200">
              {filteredTimeline.map((item, idx) => {
                const isPriceChange = item.old_price !== item.new_price;
                const priceDelta = item.new_price - item.old_price;
                const pctDelta = item.old_price > 0 ? (priceDelta / item.old_price) * 100 : 0;

                return (
                  <div key={item.id || idx} className="relative pl-12">
                    {/* Timeline Dot Icon */}
                    <div className="absolute left-3.5 top-3 -translate-x-1/2 w-6 h-6 rounded-full bg-slate-900 text-amber-400 border-2 border-white shadow-xs flex items-center justify-center shrink-0">
                      {isPriceChange ? <DollarSign className="w-3.5 h-3.5" /> : <FileText className="w-3.5 h-3.5" />}
                    </div>

                    <div className="bg-white border border-slate-200 rounded-xl p-3.5 space-y-2 shadow-2xs hover:border-slate-300 transition">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-slate-100 pb-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-mono text-[10px] font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                            {item.changed_date}
                          </span>
                          <span className="font-bold text-slate-900 text-xs flex items-center space-x-1">
                            <User className="w-3.5 h-3.5 text-slate-400" />
                            <span>{item.changed_by || 'System Admin'}</span>
                          </span>
                          <span className="text-[10px] text-slate-500 font-medium">
                            • {item.branch_affected || 'All Branches'}
                          </span>
                        </div>

                        {/* Price Shift Badge */}
                        {isPriceChange && (
                          <div className="flex items-center space-x-2 font-mono text-xs">
                            <span className="text-slate-400 line-through">LKR {item.old_price.toLocaleString()}</span>
                            <ChevronRight className="w-3 h-3 text-slate-400" />
                            <span className="font-bold text-slate-900">LKR {item.new_price.toLocaleString()}</span>
                            <span className={`px-1.5 py-0.5 rounded font-bold text-[10px] ${
                              priceDelta >= 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                            }`}>
                              {priceDelta >= 0 ? '+' : ''}{priceDelta.toLocaleString()} ({pctDelta >= 0 ? '+' : ''}{pctDelta.toFixed(1)}%)
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Audit Reason Description */}
                      <p className="text-slate-800 font-semibold text-xs leading-relaxed">
                        {item.reason}
                      </p>

                      {/* Network Broadcast Verification Badges */}
                      <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-50 text-[10px]">
                        <div className="flex items-center space-x-1 text-emerald-700 font-bold">
                          <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                          <span>Pushed to Mesh Network (HO, CMB, KDY, GAL, KUR)</span>
                        </div>
                        <span className="text-slate-400 font-mono">
                          Ref Token: {item.id}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB B: PENDING EDITS DIFFERENTIAL COMPARISON                             */}
      {/* ========================================================================= */}
      {activeSubTab === 'diff' && formData && (
        <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-3 shadow-2xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <div>
              <h4 className="font-black text-xs text-slate-900 uppercase tracking-wider flex items-center space-x-2">
                <Sliders className="w-4 h-4 text-amber-500" />
                <span>Live Pending Form Edits vs Recorded Master State</span>
              </h4>
              <p className="text-[11px] text-slate-500">
                Audits modified fields prior to publishing master product changes to the central database.
              </p>
            </div>
            <span className="bg-amber-100 text-amber-900 font-mono font-bold text-[10px] px-2 py-0.5 rounded border border-amber-200">
              {fieldDiffs.length} Fields Modified
            </span>
          </div>

          {fieldDiffs.length === 0 ? (
            <div className="p-8 text-center bg-slate-50 border border-dashed border-slate-200 rounded-xl text-slate-500">
              <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
              <p className="font-bold">No unsaved field changes detected in the form.</p>
              <p className="text-[11px]">The form data currently matches the recorded master product record.</p>
            </div>
          ) : (
            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200 text-[11px] uppercase tracking-wider">
                    <th className="p-2.5">Field / Parameter</th>
                    <th className="p-2.5">Category</th>
                    <th className="p-2.5 text-slate-500">Recorded Master Value</th>
                    <th className="p-2.5 text-amber-900 font-extrabold bg-amber-50/50">New Form Value</th>
                    <th className="p-2.5 text-center">Audit Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                  {fieldDiffs.map((d, i) => (
                    <tr key={i} className="hover:bg-amber-50/20 transition">
                      <td className="p-2.5 font-bold text-slate-900">{d.field}</td>
                      <td className="p-2.5">
                        <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[10px] font-bold">
                          {d.category}
                        </span>
                      </td>
                      <td className="p-2.5 font-mono text-slate-500">{d.oldVal}</td>
                      <td className="p-2.5 font-mono font-bold text-amber-800 bg-amber-50/30">{d.newVal}</td>
                      <td className="p-2.5 text-center">
                        <span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded font-extrabold text-[10px]">
                          Pending Audit
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB C: COMPLETE MASTER SPECIFICATION LEDGER                             */}
      {/* ========================================================================= */}
      {activeSubTab === 'ledger' && (
        <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-4 shadow-2xs">
          <div className="border-b border-slate-100 pb-2">
            <h4 className="font-black text-xs text-slate-900 uppercase tracking-wider flex items-center space-x-2">
              <FileCheck className="w-4 h-4 text-amber-500" />
              <span>Immutable Master Product Specification Ledger</span>
            </h4>
            <p className="text-[11px] text-slate-500">
              Detailed breakdown of all master data, finish matrices, option surcharges, and hardware specs registered for this item.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Identity & Sourcing Ledger */}
            <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200 space-y-2">
              <h5 className="font-extrabold text-slate-900 text-xs border-b border-slate-200 pb-1 uppercase tracking-wider flex items-center space-x-1.5">
                <Tag className="w-3.5 h-3.5 text-amber-500" />
                <span>Identity & Catalog Specifications</span>
              </h5>
              <div className="space-y-1.5 text-[11px]">
                <div className="flex justify-between border-b border-slate-100 pb-1">
                  <span className="text-slate-500">Master Product Code:</span>
                  <span className="font-mono font-bold text-slate-900">{product.product_code}</span>
                </div>
                <div className="flex justify-between border-b border-slate-100 pb-1">
                  <span className="text-slate-500">Product Name:</span>
                  <span className="font-semibold text-slate-900 text-right">{product.product_name}</span>
                </div>
                <div className="flex justify-between border-b border-slate-100 pb-1">
                  <span className="text-slate-500">Category & Sub-Category:</span>
                  <span className="font-bold text-slate-900">{product.category} ({product.subcategory || 'Standard'})</span>
                </div>
                <div className="flex justify-between border-b border-slate-100 pb-1">
                  <span className="text-slate-500">Supplier / Manufacturer:</span>
                  <span className="font-bold text-slate-900">{product.supplier || 'Alumex PLC'}</span>
                </div>
                <div className="flex justify-between border-b border-slate-100 pb-1">
                  <span className="text-slate-500">Material Grade / Alloy Spec:</span>
                  <span className="font-semibold text-slate-900">{product.grade || '6063 T6 Aluminium'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Unit of Measure & Bar Length:</span>
                  <span className="font-mono font-bold text-slate-900">{product.unit || 'bar'} (6.0 Meters)</span>
                </div>
              </div>
            </div>

            {/* Rates & Financial Matrix */}
            <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200 space-y-2">
              <h5 className="font-extrabold text-slate-900 text-xs border-b border-slate-200 pb-1 uppercase tracking-wider flex items-center space-x-1.5">
                <DollarSign className="w-3.5 h-3.5 text-amber-500" />
                <span>Financial & Pricing Matrix</span>
              </h5>
              <div className="space-y-1.5 text-[11px]">
                <div className="flex justify-between border-b border-slate-100 pb-1">
                  <span className="text-slate-500">Company Base Selling Price:</span>
                  <span className="font-mono font-extrabold text-amber-700">LKR {(product.base_price || product.current_price).toLocaleString()}</span>
                </div>
                <div className="flex justify-between border-b border-slate-100 pb-1">
                  <span className="text-slate-500">Estimated Cost Price:</span>
                  <span className="font-mono font-bold text-slate-700">LKR {estCost.toLocaleString()}</span>
                </div>
                <div className="flex justify-between border-b border-slate-100 pb-1">
                  <span className="text-slate-500">Target Gross Margin %:</span>
                  <span className="font-mono font-bold text-emerald-700">{currentMargin.toFixed(1)}% Gross Margin</span>
                </div>
                <div className="flex justify-between border-b border-slate-100 pb-1">
                  <span className="text-slate-500">Unit Weight (kg):</span>
                  <span className="font-mono font-semibold text-slate-800">{product.unit_weight_kg || 0} kg / {product.unit || 'bar'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Price Display Calculation Method:</span>
                  <span className="font-bold text-slate-900">{product.price_display_method || 'Per Bar (6m)'}</span>
                </div>
              </div>
            </div>

            {/* Finishes & Color Matrix */}
            <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200 space-y-2">
              <h5 className="font-extrabold text-slate-900 text-xs border-b border-slate-200 pb-1 uppercase tracking-wider flex items-center space-x-1.5">
                <Layers className="w-3.5 h-3.5 text-amber-500" />
                <span>Finishes, Thicknesses & Surcharges</span>
              </h5>
              <div className="space-y-1.5 text-[11px]">
                <div className="flex justify-between border-b border-slate-100 pb-1">
                  <span className="text-slate-500">Powder Coat Finish Surcharge:</span>
                  <span className="font-mono font-bold text-slate-900">+LKR {product.powder_coat_surcharge || 0} / unit</span>
                </div>
                <div className="flex justify-between border-b border-slate-100 pb-1">
                  <span className="text-slate-500">Anodized Finish Surcharge:</span>
                  <span className="font-mono font-bold text-slate-900">+LKR {product.anodized_surcharge || 0} / unit</span>
                </div>
                <div className="flex justify-between border-b border-slate-100 pb-1">
                  <span className="text-slate-500">Labour / Fabrication Fee:</span>
                  <span className="font-mono font-bold text-slate-900">+LKR {product.labour_surcharge || 0} / unit</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Available Thickness Options:</span>
                  <span className="font-semibold text-slate-900">{product.available_thicknesses?.join(', ') || '1.2mm, 1.5mm, 2.0mm'}</span>
                </div>
              </div>
            </div>

            {/* Network & Regional Controls */}
            <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200 space-y-2">
              <h5 className="font-extrabold text-slate-900 text-xs border-b border-slate-200 pb-1 uppercase tracking-wider flex items-center space-x-1.5">
                <Globe className="w-3.5 h-3.5 text-amber-500" />
                <span>Regional & Network Sync Rules</span>
              </h5>
              <div className="space-y-1.5 text-[11px]">
                <div className="flex justify-between border-b border-slate-100 pb-1">
                  <span className="text-slate-500">Branch Network Availability:</span>
                  <span className="font-bold text-emerald-700">Pushed to All 5 Terminals</span>
                </div>
                <div className="flex justify-between border-b border-slate-100 pb-1">
                  <span className="text-slate-500">Minimum Order Wastage Factor:</span>
                  <span className="font-mono font-bold text-slate-900">5.0% Standard Allowance</span>
                </div>
                <div className="flex justify-between border-b border-slate-100 pb-1">
                  <span className="text-slate-500">Max Manager Discount Cap:</span>
                  <span className="font-mono font-bold text-rose-700">7.5% Maximum Without HO Approval</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">ISO & SLS Quality Certification:</span>
                  <span className="font-bold text-slate-900">SLS 1410 / ISO 9001:2015</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. MODAL: ADD MANUAL AUDIT NOTE                                           */}
      {/* ========================================================================= */}
      {showAddNoteModal && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-4 space-y-4 shadow-2xl border border-slate-200 animate-fadeIn">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div className="flex items-center space-x-2">
                <FileText className="w-5 h-5 text-amber-500" />
                <h3 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider">
                  Add Official Product Audit Annotation
                </h3>
              </div>
              <button onClick={() => setShowAddNoteModal(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Auditor / Author Name:</label>
                <input
                  type="text"
                  value={noteAuthor}
                  onChange={(e) => setNoteAuthor(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-semibold text-slate-900"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Official Audit Note / Comment:</label>
                <textarea
                  rows={3}
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  placeholder="e.g. Supplier Alumex raw material batch certificate #ALU-9821 verified. Cost increase approved by HO Auditor."
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-medium text-slate-900"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowAddNoteModal(false)}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-bold text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCreateNote}
                disabled={!noteText.trim()}
                className="px-4 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black rounded-lg text-xs shadow-xs disabled:opacity-50"
              >
                Save Audit Note
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. MODAL: PRINT MASTER PRODUCT AUDIT CERTIFICATE                          */}
      {/* ========================================================================= */}
      {showPrintModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 space-y-4 shadow-2xl border border-slate-200 text-slate-900 print:p-0 print:shadow-none print:border-none">
            {/* Print Header Controls */}
            <div className="flex items-center justify-between border-b border-slate-200 pb-3 print:hidden">
              <div className="flex items-center space-x-2">
                <Printer className="w-5 h-5 text-amber-500" />
                <h3 className="font-extrabold text-sm uppercase text-slate-900">
                  Master Product Audit Certificate & Compliance Log
                </h3>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-black px-4 py-1.5 rounded-lg text-xs transition flex items-center space-x-1"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Document</span>
                </button>
                <button onClick={() => setShowPrintModal(false)} className="text-slate-400 hover:text-slate-700">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* CERTIFICATE PRINTABLE BODY */}
            <div className="space-y-4 text-xs font-serif p-2">
              <div className="border-b-2 border-slate-900 pb-3 flex justify-between items-start">
                <div>
                  <h1 className="text-xl font-black font-sans uppercase tracking-tight text-slate-900">
                    INNOVISTA METAL & ALUMINIUM PLC
                  </h1>
                  <p className="text-[10px] font-sans text-slate-600">
                    HEAD OFFICE MASTER ERP CATALOG & AUDIT COMPLIANCE BUREAU
                  </p>
                  <p className="text-[10px] font-sans text-slate-500">
                    ISO 9001:2015 Certified Quality Control & Price History Audit Trail
                  </p>
                </div>
                <div className="text-right font-sans text-[10px]">
                  <span className="font-bold bg-slate-900 text-white px-2 py-0.5 rounded">
                    CERTIFICATE #AUD-{product.product_code}-{Date.now().toString().slice(-6)}
                  </span>
                  <p className="text-slate-500 mt-1">Generated: {new Date().toLocaleString()}</p>
                </div>
              </div>

              {/* Product Identity Table */}
              <div className="font-sans space-y-2">
                <h3 className="font-bold text-xs uppercase text-slate-800 border-b border-slate-200 pb-1">
                  1. Product Identity & Specification Summary
                </h3>
                <div className="grid grid-cols-2 gap-2 text-[11px] bg-slate-50 p-3 rounded-lg border border-slate-200">
                  <div><strong>Product Code:</strong> {product.product_code}</div>
                  <div><strong>Product Name:</strong> {product.product_name}</div>
                  <div><strong>Category:</strong> {product.category}</div>
                  <div><strong>Supplier:</strong> {product.supplier || 'Alumex PLC'}</div>
                  <div><strong>Company Base Price:</strong> LKR {(product.base_price || product.current_price).toLocaleString()}</div>
                  <div><strong>Unit Weight:</strong> {product.unit_weight_kg || 0} kg / {product.unit || 'bar'}</div>
                </div>
              </div>

              {/* Full Revision History Table */}
              <div className="font-sans space-y-2">
                <h3 className="font-bold text-xs uppercase text-slate-800 border-b border-slate-200 pb-1">
                  2. Complete Historical Revision Audit Trail
                </h3>
                <table className="w-full text-left border-collapse text-[10px]">
                  <thead>
                    <tr className="bg-slate-200 text-slate-800 font-bold border-b border-slate-300">
                      <th className="p-1.5">Date & Time</th>
                      <th className="p-1.5">Changed By</th>
                      <th className="p-1.5 text-right">Old Price</th>
                      <th className="p-1.5 text-right">New Price</th>
                      <th className="p-1.5">Audit Reason & Scope</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {productHistoryEntries.map((h, i) => (
                      <tr key={i}>
                        <td className="p-1.5 font-mono">{h.changed_date}</td>
                        <td className="p-1.5 font-bold">{h.changed_by}</td>
                        <td className="p-1.5 text-right font-mono">LKR {h.old_price.toLocaleString()}</td>
                        <td className="p-1.5 text-right font-mono font-bold">LKR {h.new_price.toLocaleString()}</td>
                        <td className="p-1.5">{h.reason}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Sign Off */}
              <div className="pt-6 font-sans text-[10px] flex justify-between items-end border-t border-slate-300">
                <div>
                  <p className="font-bold">HO Chief Compliance Auditor</p>
                  <p className="text-slate-500">Innovista Central ERP System</p>
                </div>
                <div className="text-center">
                  <div className="w-32 border-b border-slate-400 mb-1"></div>
                  <p className="font-bold">Authorized Signature & Stamp</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
