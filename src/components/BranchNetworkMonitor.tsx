import React, { useState, useMemo } from 'react';
import { 
  Globe, 
  RefreshCw, 
  Building2, 
  Radio, 
  Activity,
  CheckCircle2,
  Sliders,
  Layers,
  TrendingUp,
  TrendingDown,
  Filter,
  ArrowRight,
  Check,
  RotateCcw,
  DollarSign,
  Percent,
  ShieldAlert,
  Tag,
  Truck,
  Info,
  Calendar,
  ListFilter,
  CheckSquare,
  Square,
  BarChart2,
  CheckCircle
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  Cell,
  ComposedChart,
  Line
} from 'recharts';
import { Branch, RealTimeEvent, Product, CategoryType } from '../types';

interface BranchNetworkMonitorProps {
  activeBranch?: Branch;
  branches: Branch[];
  products?: Product[];
  events: RealTimeEvent[];
  syncMode: 'REALTIME' | 'POLLING_5MIN';
  setSyncMode: (mode: 'REALTIME' | 'POLLING_5MIN') => void;
  onSimulatePriceUpdate: () => Promise<void>;
  onBatchMarginUpdate?: (
    items: Array<{ id: string; new_price: number; old_price: number }>,
    reason: string,
    effectiveDate?: string,
    category?: string,
    supplier?: string
  ) => Promise<void>;
}

// Supplier mapping fallback helper
const getProductSupplier = (p: Product): string => {
  if (p.supplier) return p.supplier;
  if (p.category === 'Aluminium Profiles') return 'Alumex PLC';
  if (p.category === 'Aluminium Fabrication') return 'Swisstek Aluminium';
  if (p.category === 'Glass') return 'Glazetech Lanka';
  if (p.category === 'ACP Sheets') return 'Lanka Steel & Metals';
  if (p.category === 'Hardware & Accessories') return 'St. Anthony Glazing';
  if (p.category === 'Steel Sections') return 'Imported Euro Steel';
  return 'Master HO Supplier';
};

const CATEGORY_LIST: CategoryType[] = [
  'Aluminium Profiles',
  'Aluminium Fabrication',
  'Glass',
  'ACP Sheets',
  'Hardware & Accessories',
  'Civil Works',
  'Labour & Installation',
  'Interior Design',
  'Steel Sections'
];

const SUPPLIER_LIST = [
  'Alumex PLC',
  'Swisstek Aluminium',
  'Glazetech Lanka',
  'St. Anthony Glazing',
  'Lanka Steel & Metals',
  'Imported Euro Steel'
];

export const BranchNetworkMonitor: React.FC<BranchNetworkMonitorProps> = ({
  activeBranch,
  branches,
  products = [],
  events,
  syncMode,
  setSyncMode,
  onSimulatePriceUpdate,
  onBatchMarginUpdate
}) => {
  const isHO = !activeBranch || activeBranch.code === 'HO';
  const [activeTab, setActiveTab] = useState<'mesh_topology' | 'batch_margin_studio' | 'margin_analytics'>('batch_margin_studio');

  const [isSimulating, setIsSimulating] = useState(false);

  // --- BATCH MARGIN ADJUSTMENT STUDIO STATE ---
  const [filterMode, setFilterMode] = useState<'CATEGORY' | 'SUPPLIER' | 'COMBINED'>('CATEGORY');
  const [selectedCategory, setSelectedCategory] = useState<string>('Aluminium Profiles');
  const [selectedSupplier, setSelectedSupplier] = useState<string>('ALL');
  const [targetBranchScope, setTargetBranchScope] = useState<string>('ALL_BRANCHES');

  const [adjustmentType, setAdjustmentType] = useState<'PERCENTAGE_CHANGE' | 'TARGET_MARGIN_PCT' | 'FLAT_LKR_DELTA'>('PERCENTAGE_CHANGE');
  const [adjValue, setAdjValue] = useState<number>(5.0); // e.g. +5%
  const [auditReason, setAuditReason] = useState<string>('Q3 Billet Material Cost & Import Tariff Revision');
  const [effectiveDate, setEffectiveDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [roundingMode, setRoundingMode] = useState<'10' | '50' | '100' | 'none'>('50');

  // Selected Product IDs state (map of product.id -> boolean)
  const [selectedProductIds, setSelectedProductIds] = useState<Record<string, boolean>>({});

  // Success Notification Banner / Modal
  const [lastBatchSummary, setLastBatchSummary] = useState<{
    count: number;
    reason: string;
    avgMarginLift: string;
    projectedRevenueLift: number;
    timestamp: string;
  } | null>(null);

  const [isApplyingBatch, setIsApplyingBatch] = useState(false);

  const handleTestTrigger = async () => {
    setIsSimulating(true);
    try {
      await onSimulatePriceUpdate();
    } catch (e) {
      console.error(e);
    } finally {
      setTimeout(() => setIsSimulating(false), 800);
    }
  };

  // --- FILTERED PRODUCTS COMPUTATION ---
  const matchingProducts = useMemo(() => {
    return products.filter((p) => {
      const supp = getProductSupplier(p);
      let catMatch = true;
      let suppMatch = true;

      if (filterMode === 'CATEGORY' || filterMode === 'COMBINED') {
        if (selectedCategory !== 'ALL') {
          catMatch = p.category === selectedCategory;
        }
      }

      if (filterMode === 'SUPPLIER' || filterMode === 'COMBINED') {
        if (selectedSupplier !== 'ALL') {
          suppMatch = supp === selectedSupplier;
        }
      }

      return catMatch && suppMatch;
    });
  }, [products, filterMode, selectedCategory, selectedSupplier]);

  // Synchronize selection state when matching products change
  React.useEffect(() => {
    const initialSelection: Record<string, boolean> = {};
    matchingProducts.forEach((p) => {
      initialSelection[p.id] = true;
    });
    setSelectedProductIds(initialSelection);
  }, [matchingProducts]);

  // Toggle selection
  const toggleSelectAll = () => {
    const allSelected = matchingProducts.every((p) => selectedProductIds[p.id]);
    const next: Record<string, boolean> = {};
    matchingProducts.forEach((p) => {
      next[p.id] = !allSelected;
    });
    setSelectedProductIds(next);
  };

  const toggleSelectProduct = (id: string) => {
    setSelectedProductIds((prev) => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // --- COMPUTED PROPOSED PRICES & MARGIN METRICS ---
  const processedProductRows = useMemo(() => {
    return matchingProducts.map((p) => {
      const isSelected = !!selectedProductIds[p.id];
      const costPrice = p.cost_price || p.base_price ? Math.round((p.base_price || p.current_price) * 0.78) : Math.round(p.current_price * 0.78);
      let rawProposedPrice = p.current_price;

      if (adjustmentType === 'PERCENTAGE_CHANGE') {
        rawProposedPrice = p.current_price * (1 + adjValue / 100);
      } else if (adjustmentType === 'TARGET_MARGIN_PCT') {
        const marginFrac = Math.min(0.85, Math.max(0.05, adjValue / 100));
        rawProposedPrice = costPrice / (1 - marginFrac);
      } else if (adjustmentType === 'FLAT_LKR_DELTA') {
        rawProposedPrice = p.current_price + adjValue;
      }

      // Cost ceiling floor safety
      rawProposedPrice = Math.max(costPrice * 1.02, rawProposedPrice);

      // Rounding
      let finalProposedPrice = rawProposedPrice;
      if (roundingMode === '10') {
        finalProposedPrice = Math.round(rawProposedPrice / 10) * 10;
      } else if (roundingMode === '50') {
        finalProposedPrice = Math.round(rawProposedPrice / 50) * 50;
      } else if (roundingMode === '100') {
        finalProposedPrice = Math.round(rawProposedPrice / 100) * 100;
      } else {
        finalProposedPrice = Math.round(rawProposedPrice);
      }

      const currentMarginPct = p.current_price > 0 ? ((p.current_price - costPrice) / p.current_price) * 100 : 0;
      const proposedMarginPct = finalProposedPrice > 0 ? ((finalProposedPrice - costPrice) / finalProposedPrice) * 100 : 0;
      const priceDelta = finalProposedPrice - p.current_price;
      const percentageDelta = p.current_price > 0 ? (priceDelta / p.current_price) * 100 : 0;
      const marginLiftPct = proposedMarginPct - currentMarginPct;

      return {
        product: p,
        supplier: getProductSupplier(p),
        isSelected,
        costPrice,
        currentPrice: p.current_price,
        proposedPrice: finalProposedPrice,
        currentMarginPct,
        proposedMarginPct,
        priceDelta,
        percentageDelta,
        marginLiftPct
      };
    });
  }, [matchingProducts, selectedProductIds, adjustmentType, adjValue, roundingMode]);

  // Aggregate Metrics for Selected Items
  const selectedRows = useMemo(() => {
    return processedProductRows.filter((r) => r.isSelected);
  }, [processedProductRows]);

  const summaryStats = useMemo(() => {
    if (selectedRows.length === 0) {
      return {
        count: 0,
        avgCurrentMargin: 0,
        avgProposedMargin: 0,
        avgMarginLift: 0,
        totalMonthlyRevenueDelta: 0
      };
    }

    const totalCurrMargin = selectedRows.reduce((acc, r) => acc + r.currentMarginPct, 0);
    const totalPropMargin = selectedRows.reduce((acc, r) => acc + r.proposedMarginPct, 0);
    const avgCurrentMargin = totalCurrMargin / selectedRows.length;
    const avgProposedMargin = totalPropMargin / selectedRows.length;
    const avgMarginLift = avgProposedMargin - avgCurrentMargin;

    // Projected Monthly Volume Assumption (average 25 units per product across 5 branches)
    const projectedMonthlyVolume = selectedRows.length * 25 * 5;
    const avgPriceDelta = selectedRows.reduce((acc, r) => acc + r.priceDelta, 0) / selectedRows.length;
    const totalMonthlyRevenueDelta = avgPriceDelta * projectedMonthlyVolume;

    return {
      count: selectedRows.length,
      avgCurrentMargin,
      avgProposedMargin,
      avgMarginLift,
      totalMonthlyRevenueDelta
    };
  }, [selectedRows]);

  // Quick Preset Chips Handler
  const handleApplyPreset = (type: 'PERCENTAGE_CHANGE' | 'TARGET_MARGIN_PCT', val: number, presetReason: string) => {
    setAdjustmentType(type);
    setAdjValue(val);
    setAuditReason(presetReason);
  };

  // --- COMMIT BATCH MARGIN UPDATE ---
  const handleExecuteBatchUpdate = async () => {
    if (selectedRows.length === 0) return;
    if (!auditReason.trim()) {
      alert('Please enter an audit reason for this batch price adjustment.');
      return;
    }

    setIsApplyingBatch(true);

    const itemsToUpdate = selectedRows.map((r) => ({
      id: r.product.id,
      new_price: r.proposedPrice,
      old_price: r.currentPrice
    }));

    try {
      if (onBatchMarginUpdate) {
        await onBatchMarginUpdate(
          itemsToUpdate,
          auditReason,
          effectiveDate,
          filterMode === 'CATEGORY' ? selectedCategory : undefined,
          filterMode === 'SUPPLIER' ? selectedSupplier : undefined
        );
      }

      setLastBatchSummary({
        count: selectedRows.length,
        reason: auditReason,
        avgMarginLift: `${summaryStats.avgCurrentMargin.toFixed(1)}% ➔ ${summaryStats.avgProposedMargin.toFixed(1)}% (+${summaryStats.avgMarginLift.toFixed(1)}%)`,
        projectedRevenueLift: summaryStats.totalMonthlyRevenueDelta,
        timestamp: new Date().toLocaleTimeString()
      });
    } catch (e) {
      console.error(e);
      alert('Error executing batch margin update. Please try again.');
    } finally {
      setIsApplyingBatch(false);
    }
  };

  // --- RECHARTS CATEGORY MARGIN DATA ---
  const categoryAnalyticsData = useMemo(() => {
    return CATEGORY_LIST.map((cat) => {
      const catProducts = products.filter((p) => p.category === cat);
      if (catProducts.length === 0) return null;

      const avgCurrent = catProducts.reduce((acc, p) => {
        const cost = p.cost_price || p.current_price * 0.78;
        return acc + ((p.current_price - cost) / (p.current_price || 1)) * 100;
      }, 0) / catProducts.length;

      // Simulated target/proposed comparison
      const isTargeted = filterMode === 'CATEGORY' && (selectedCategory === 'ALL' || selectedCategory === cat);
      const avgProposed = isTargeted 
        ? Math.min(60, avgCurrent + (adjustmentType === 'PERCENTAGE_CHANGE' ? adjValue * 0.7 : adjValue > 15 ? adjValue - avgCurrent : 4))
        : avgCurrent;

      return {
        category: cat.replace('Aluminium ', 'Al. ').replace('Hardware & Accessories', 'Hardware'),
        currentMargin: parseFloat(avgCurrent.toFixed(1)),
        proposedMargin: parseFloat(avgProposed.toFixed(1)),
        itemCount: catProducts.length
      };
    }).filter(Boolean);
  }, [products, filterMode, selectedCategory, adjustmentType, adjValue]);

  return (
    <div className="space-y-4">
      {/* --- TOP HEADER BANNER CARD --- */}
      <div className="bg-white text-slate-900 p-3.5 sm:p-4 rounded-xl shadow-xs border border-slate-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 relative overflow-hidden">
        <div className="space-y-0.5 relative z-10">
          <div className="flex flex-wrap items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-orange-500 text-white flex items-center justify-center shadow-xs">
              <Globe className="w-4.5 h-4.5" />
            </div>
            <div>
              <h2 className="text-sm font-bold tracking-tight text-slate-900 uppercase flex items-center gap-2">
                Branch Network & Master Margin Monitor
              </h2>
              <p className="text-[11px] text-slate-500 font-medium">
                Centralized Master API mesh sync, real-time price push broadcast, and batch category/supplier margin adjustment engine.
              </p>
            </div>
          </div>
        </div>

        {/* Sync Status Badge & Mode Pills */}
        <div className="flex flex-wrap items-center gap-2 relative z-10">
          <div className="bg-orange-50 text-orange-800 border border-orange-200 text-[10px] px-2.5 py-1 rounded-lg font-bold uppercase flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></span>
            <span>5 Mesh Terminals Online</span>
          </div>

          <button
            onClick={handleTestTrigger}
            disabled={isSimulating}
            className="bg-orange-500 hover:bg-orange-600 text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center space-x-1.5 shadow-xs disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSimulating ? 'animate-spin' : ''}`} />
            <span>Simulate Master Push</span>
          </button>
        </div>
      </div>

      {/* --- SUB-TAB NAVIGATION NAVIGATION --- */}
      <div className="flex items-center space-x-2 border-b border-slate-200 text-xs font-bold bg-white p-1 rounded-xl shadow-2xs">
        <button
          onClick={() => setActiveTab('batch_margin_studio')}
          className={`px-3.5 py-2 rounded-lg flex items-center space-x-2 transition ${
            activeTab === 'batch_margin_studio'
              ? 'bg-orange-500 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>Batch Margin Adjustment Studio</span>
          <span className="bg-white/20 text-white px-1.5 py-0.5 rounded text-[10px] font-mono">
            Category & Supplier
          </span>
        </button>

        <button
          onClick={() => setActiveTab('mesh_topology')}
          className={`px-3.5 py-2 rounded-lg flex items-center space-x-2 transition ${
            activeTab === 'mesh_topology'
              ? 'bg-orange-500 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Globe className="w-4 h-4" />
          <span>Branch Mesh Topology & Live Sync</span>
        </button>

        <button
          onClick={() => setActiveTab('margin_analytics')}
          className={`px-3.5 py-2 rounded-lg flex items-center space-x-2 transition ${
            activeTab === 'margin_analytics'
              ? 'bg-orange-500 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <BarChart2 className="w-4 h-4" />
          <span>Network Margin Analytics</span>
        </button>
      </div>

      {/* STAR TOPOLOGY ISOLATION BANNER FOR NON-HO BRANCHES */}
      {!isHO && (
        <div className="bg-slate-900 border border-slate-800 text-white p-4 rounded-xl shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-fadeIn">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-orange-500/20 border border-orange-500/40 text-orange-400 flex items-center justify-center shrink-0 text-lg font-bold">
              🛡️
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-xs uppercase tracking-wider text-orange-400">
                  STAR TOPOLOGY NETWORK ISOLATION ENFORCED
                </span>
                <span className="bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[9px] font-bold px-1.5 py-0.2 rounded uppercase">
                  ISOLATED SPOKE NODE
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                <strong>{activeBranch?.name} ({activeBranch?.code})</strong> is operating in Isolated Spoke Mode. Direct peer-to-peer networking with other branches is disabled by security policy. All configuration changes and data sync occur exclusively through the Head Office Master Node (HO).
              </p>
            </div>
          </div>
          <span className="bg-slate-800 text-emerald-400 border border-slate-700 text-[10px] font-mono font-bold px-2.5 py-1 rounded-md shrink-0 flex items-center space-x-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse mr-1"></span>
            <span>HO MASTER LINK ACTIVE</span>
          </span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 1: BATCH MARGIN ADJUSTMENT STUDIO (NEW FEATURE)                      */}
      {/* ========================================================================= */}

      {activeTab === 'batch_margin_studio' && (
        <div className="space-y-4">
          {/* SUCCESS NOTIFICATION BANNER */}
          {lastBatchSummary && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3.5 flex items-start justify-between shadow-xs animate-fadeIn">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-500 text-white flex items-center justify-center shrink-0 mt-0.5">
                  <CheckCircle className="w-5 h-5" />
                </div>
                <div className="space-y-0.5">
                  <div className="flex items-center space-x-2">
                    <h4 className="text-xs font-bold text-emerald-900">
                      Batch Margin Update Broadcast Complete!
                    </h4>
                    <span className="text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded border border-emerald-200">
                      200 OK Pushed to 5 Nodes
                    </span>
                  </div>
                  <p className="text-[11px] text-emerald-800 font-medium">
                    Successfully updated <strong className="font-bold">{lastBatchSummary.count} products</strong> across all branch terminals.
                  </p>
                  <div className="flex flex-wrap items-center gap-3 text-[10px] text-emerald-700 font-mono mt-1">
                    <span>Audit Reason: "{lastBatchSummary.reason}"</span>
                    <span>•</span>
                    <span>Margin Shift: {lastBatchSummary.avgMarginLift}</span>
                    <span>•</span>
                    <span>Est. Uplift: +LKR {Math.round(lastBatchSummary.projectedRevenueLift).toLocaleString()}/mo</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setLastBatchSummary(null)}
                className="text-emerald-700 hover:text-emerald-900 text-xs font-bold underline"
              >
                Dismiss
              </button>
            </div>
          )}

          {/* PARAMETER CONFIGURATION CARD */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-4 shadow-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <Filter className="w-4 h-4 text-orange-500" />
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  1. Target Scope & Adjustment Strategy Selection
                </h3>
              </div>
              <span className="text-[10px] text-slate-500 font-medium">
                Applies instant bulk margin adjustments to multiple products simultaneously.
              </span>
            </div>

            {/* Target Filter Mode Radio Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <button
                type="button"
                onClick={() => setFilterMode('CATEGORY')}
                className={`p-2.5 rounded-lg border text-left flex items-center justify-between transition ${
                  filterMode === 'CATEGORY'
                    ? 'bg-orange-50/80 border-orange-500 text-orange-950 font-bold shadow-2xs'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <Layers className="w-4 h-4 text-orange-500" />
                  <span>Filter by Category</span>
                </div>
                <input type="radio" checked={filterMode === 'CATEGORY'} readOnly className="accent-orange-500" />
              </button>

              <button
                type="button"
                onClick={() => setFilterMode('SUPPLIER')}
                className={`p-2.5 rounded-lg border text-left flex items-center justify-between transition ${
                  filterMode === 'SUPPLIER'
                    ? 'bg-orange-50/80 border-orange-500 text-orange-950 font-bold shadow-2xs'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <Truck className="w-4 h-4 text-orange-500" />
                  <span>Filter by Supplier / Brand</span>
                </div>
                <input type="radio" checked={filterMode === 'SUPPLIER'} readOnly className="accent-orange-500" />
              </button>

              <button
                type="button"
                onClick={() => setFilterMode('COMBINED')}
                className={`p-2.5 rounded-lg border text-left flex items-center justify-between transition ${
                  filterMode === 'COMBINED'
                    ? 'bg-orange-50/80 border-orange-500 text-orange-950 font-bold shadow-2xs'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <ListFilter className="w-4 h-4 text-orange-500" />
                  <span>Combined Category + Supplier</span>
                </div>
                <input type="radio" checked={filterMode === 'COMBINED'} readOnly className="accent-orange-500" />
              </button>
            </div>

            {/* Dropdown Selectors Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              {(filterMode === 'CATEGORY' || filterMode === 'COMBINED') && (
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 flex items-center space-x-1">
                    <span>Select Product Category:</span>
                  </label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="ALL">All Product Categories</option>
                    {CATEGORY_LIST.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {(filterMode === 'SUPPLIER' || filterMode === 'COMBINED') && (
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 flex items-center space-x-1">
                    <span>Select Supplier / Brand:</span>
                  </label>
                  <select
                    value={selectedSupplier}
                    onChange={(e) => setSelectedSupplier(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="ALL">All Suppliers & Manufacturers</option>
                    {SUPPLIER_LIST.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="space-y-1">
                <label className="font-bold text-slate-700 flex items-center space-x-1">
                  <span>Target Branch Scope:</span>
                </label>
                <select
                  value={targetBranchScope}
                  onChange={(e) => setTargetBranchScope(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="ALL_BRANCHES">All 5 Branch Terminals (Global Broadcast)</option>
                  {branches.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name} ({b.code})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* ADJUSTMENT TYPE & VALUE CONTROL */}
            <div className="bg-slate-50/70 border border-slate-200 rounded-xl p-3.5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-800 text-xs uppercase tracking-wider flex items-center space-x-1.5">
                  <Sliders className="w-3.5 h-3.5 text-orange-500" />
                  <span>2. Adjustment Calculation Method & Magnitude</span>
                </span>

                {/* Adjustment Mode Selector */}
                <div className="flex items-center space-x-1.5 bg-white border border-slate-200 p-0.5 rounded-lg text-[11px] font-bold">
                  <button
                    type="button"
                    onClick={() => {
                      setAdjustmentType('PERCENTAGE_CHANGE');
                      setAdjValue(5.0);
                    }}
                    className={`px-2.5 py-1 rounded transition ${
                      adjustmentType === 'PERCENTAGE_CHANGE'
                        ? 'bg-orange-500 text-white shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Percentage (+/- %)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setAdjustmentType('TARGET_MARGIN_PCT');
                      setAdjValue(28.0);
                    }}
                    className={`px-2.5 py-1 rounded transition ${
                      adjustmentType === 'TARGET_MARGIN_PCT'
                        ? 'bg-orange-500 text-white shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Target Gross Margin %
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setAdjustmentType('FLAT_LKR_DELTA');
                      setAdjValue(500);
                    }}
                    className={`px-2.5 py-1 rounded transition ${
                      adjustmentType === 'FLAT_LKR_DELTA'
                        ? 'bg-orange-500 text-white shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Flat LKR Delta
                  </button>
                </div>
              </div>

              {/* Slider & Numeric Input */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
                <div className="sm:col-span-8 space-y-1.5">
                  <div className="flex justify-between text-xs font-bold text-slate-700">
                    <span>
                      {adjustmentType === 'PERCENTAGE_CHANGE' && 'Price Shift Percentage:'}
                      {adjustmentType === 'TARGET_MARGIN_PCT' && 'Target Gross Profit Margin:'}
                      {adjustmentType === 'FLAT_LKR_DELTA' && 'Flat Selling Price Adjustment:'}
                    </span>
                    <span className="font-mono text-orange-700 bg-orange-50 px-2 py-0.5 rounded border border-orange-200">
                      {adjustmentType === 'PERCENTAGE_CHANGE' && `${adjValue >= 0 ? '+' : ''}${adjValue}%`}
                      {adjustmentType === 'TARGET_MARGIN_PCT' && `${adjValue}% Margin`}
                      {adjustmentType === 'FLAT_LKR_DELTA' && `${adjValue >= 0 ? '+' : ''}LKR ${adjValue}`}
                    </span>
                  </div>

                  <input
                    type="range"
                    min={adjustmentType === 'PERCENTAGE_CHANGE' ? -30 : adjustmentType === 'TARGET_MARGIN_PCT' ? 10 : -5000}
                    max={adjustmentType === 'PERCENTAGE_CHANGE' ? 50 : adjustmentType === 'TARGET_MARGIN_PCT' ? 60 : 10000}
                    step={adjustmentType === 'PERCENTAGE_CHANGE' ? 0.5 : adjustmentType === 'TARGET_MARGIN_PCT' ? 0.5 : 100}
                    value={adjValue}
                    onChange={(e) => setAdjValue(parseFloat(e.target.value))}
                    className="w-full accent-orange-500 h-2 bg-slate-200 rounded-lg cursor-pointer"
                  />
                </div>

                <div className="sm:col-span-4 flex items-center space-x-2">
                  <input
                    type="number"
                    value={adjValue}
                    onChange={(e) => setAdjValue(parseFloat(e.target.value) || 0)}
                    className="w-full bg-white border border-slate-300 rounded-lg p-2 font-mono font-bold text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                  <span className="text-xs font-bold text-slate-500 shrink-0">
                    {adjustmentType === 'FLAT_LKR_DELTA' ? 'LKR' : '%'}
                  </span>
                </div>
              </div>

              {/* QUICK PRESET CHIPS */}
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mr-1">Presets:</span>
                <button
                  type="button"
                  onClick={() => handleApplyPreset('PERCENTAGE_CHANGE', 3.5, 'Alumex Billet Raw Billet Price Pass-through (+3.5%)')}
                  className="bg-white hover:bg-orange-50 text-slate-700 hover:text-orange-900 text-[10px] font-bold px-2 py-1 rounded border border-slate-200 transition"
                >
                  +3.5% Billet Cost Surge
                </button>
                <button
                  type="button"
                  onClick={() => handleApplyPreset('PERCENTAGE_CHANGE', 5.0, 'Swisstek Import Tariff Revision (+5.0%)')}
                  className="bg-white hover:bg-orange-50 text-slate-700 hover:text-orange-900 text-[10px] font-bold px-2 py-1 rounded border border-slate-200 transition"
                >
                  +5.0% Tariff Pass-through
                </button>
                <button
                  type="button"
                  onClick={() => handleApplyPreset('TARGET_MARGIN_PCT', 28.0, 'Network Master 28% Margin Alignment')}
                  className="bg-white hover:bg-orange-50 text-slate-700 hover:text-orange-900 text-[10px] font-bold px-2 py-1 rounded border border-slate-200 transition"
                >
                  Set 28% Gross Margin
                </button>
                <button
                  type="button"
                  onClick={() => handleApplyPreset('TARGET_MARGIN_PCT', 32.0, 'High Performance Architectural Profile Margin (+32%)')}
                  className="bg-white hover:bg-orange-50 text-slate-700 hover:text-orange-900 text-[10px] font-bold px-2 py-1 rounded border border-slate-200 transition"
                >
                  Set 32% Premium Margin
                </button>
                <button
                  type="button"
                  onClick={() => handleApplyPreset('PERCENTAGE_CHANGE', -2.5, 'Branch Network Q3 Promotional Rebate (-2.5%)')}
                  className="bg-white hover:bg-rose-50 text-slate-700 hover:text-rose-900 text-[10px] font-bold px-2 py-1 rounded border border-slate-200 transition"
                >
                  -2.5% Regional Promo
                </button>
              </div>
            </div>

            {/* AUDIT REASON & EFFECTIVE DATE */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 text-xs">
              <div className="sm:col-span-6 space-y-1">
                <label className="font-bold text-slate-700 block">
                  Mandatory Audit Log Reason:
                </label>
                <input
                  type="text"
                  value={auditReason}
                  onChange={(e) => setAuditReason(e.target.value)}
                  placeholder="e.g. Alumex Billet Price Revision Q3..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-medium text-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div className="sm:col-span-3 space-y-1">
                <label className="font-bold text-slate-700 block">Effective Date:</label>
                <input
                  type="date"
                  value={effectiveDate}
                  onChange={(e) => setEffectiveDate(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-mono font-medium text-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div className="sm:col-span-3 space-y-1">
                <label className="font-bold text-slate-700 block">Price Rounding:</label>
                <select
                  value={roundingMode}
                  onChange={(e) => setRoundingMode(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-medium text-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="50">Round to Nearest Rs. 50</option>
                  <option value="100">Round to Nearest Rs. 100</option>
                  <option value="10">Round to Nearest Rs. 10</option>
                  <option value="none">Exact Unrounded Decimal</option>
                </select>
              </div>
            </div>
          </div>

          {/* IMPACT PREVIEW MATRIX & TABLE */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-3 shadow-xs">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center space-x-2">
                  <CheckSquare className="w-4 h-4 text-orange-500" />
                  <span>3. Live Margin Impact Preview & Selection ({selectedRows.length} Selected)</span>
                </h3>
                <p className="text-[11px] text-slate-500">
                  Review proposed price shifts before broadcasting across the branch network. Uncheck items to exclude them from this batch.
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={toggleSelectAll}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-[11px] px-2.5 py-1 rounded transition flex items-center space-x-1"
                >
                  <span>Select / Deselect All ({matchingProducts.length})</span>
                </button>
              </div>
            </div>

            {/* SUMMARY METRIC CARDS */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Target Products</span>
                <div className="text-base font-bold text-slate-900 font-mono">
                  {selectedRows.length} <span className="text-xs text-slate-500 font-sans font-medium">of {matchingProducts.length} Items</span>
                </div>
              </div>

              <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Avg Gross Margin Lift</span>
                <div className="text-base font-bold text-orange-700 font-mono flex items-center space-x-1">
                  <span>{summaryStats.avgCurrentMargin.toFixed(1)}%</span>
                  <ArrowRight className="w-3 h-3 text-slate-400" />
                  <span className="text-emerald-700">{summaryStats.avgProposedMargin.toFixed(1)}%</span>
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1 rounded font-bold ml-1">
                    +{summaryStats.avgMarginLift.toFixed(1)}%
                  </span>
                </div>
              </div>

              <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Est. Monthly Network Lift</span>
                <div className="text-base font-bold text-emerald-700 font-mono">
                  +LKR {Math.round(summaryStats.totalMonthlyRevenueDelta).toLocaleString()}
                </div>
              </div>

              <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Broadcast Scope</span>
                <div className="text-xs font-bold text-slate-800 flex items-center space-x-1 mt-1">
                  <Globe className="w-3.5 h-3.5 text-orange-500" />
                  <span>5 Branch Terminals</span>
                </div>
              </div>
            </div>

            {/* PRODUCT PREVIEW TABLE */}
            <div className="overflow-x-auto border border-slate-200 rounded-xl max-h-96 overflow-y-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 font-bold sticky top-0 z-10 border-b border-slate-200 text-[11px] uppercase tracking-wider">
                    <th className="p-2.5 text-center w-10">
                      <input
                        type="checkbox"
                        checked={matchingProducts.length > 0 && matchingProducts.every((p) => selectedProductIds[p.id])}
                        onChange={toggleSelectAll}
                        className="accent-orange-500 w-3.5 h-3.5"
                      />
                    </th>
                    <th className="p-2.5">Code / Product Name</th>
                    <th className="p-2.5">Category & Supplier</th>
                    <th className="p-2.5 text-right">Cost Price</th>
                    <th className="p-2.5 text-right">Current Price</th>
                    <th className="p-2.5 text-right font-bold text-orange-900">Proposed Price</th>
                    <th className="p-2.5 text-center">Margin Shift</th>
                    <th className="p-2.5 text-right">Delta (LKR)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                  {processedProductRows.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="p-8 text-center text-slate-500 font-medium">
                        No products match the selected category or supplier filter.
                      </td>
                    </tr>
                  ) : (
                    processedProductRows.map((r) => (
                      <tr
                        key={r.product.id}
                        className={`hover:bg-orange-50/30 transition ${
                          r.isSelected ? 'bg-white' : 'bg-slate-50/50 opacity-60'
                        }`}
                      >
                        <td className="p-2.5 text-center">
                          <input
                            type="checkbox"
                            checked={r.isSelected}
                            onChange={() => toggleSelectProduct(r.product.id)}
                            className="accent-orange-500 w-3.5 h-3.5"
                          />
                        </td>
                        <td className="p-2.5">
                          <span className="font-mono font-bold text-slate-900 text-[11px] block">
                            {r.product.product_code}
                          </span>
                          <span className="text-slate-600 truncate max-w-[200px] block text-[11px]">
                            {r.product.product_name}
                          </span>
                        </td>
                        <td className="p-2.5">
                          <span className="bg-slate-100 text-slate-800 px-1.5 py-0.5 rounded text-[10px] font-bold block mb-0.5 w-fit">
                            {r.product.category}
                          </span>
                          <span className="text-[10px] text-slate-500 block">
                            Supplier: {r.supplier}
                          </span>
                        </td>
                        <td className="p-2.5 text-right font-mono text-slate-600 text-[11px]">
                          Rs. {r.costPrice.toLocaleString()}
                        </td>
                        <td className="p-2.5 text-right font-mono font-bold text-slate-800 text-[11px]">
                          Rs. {r.currentPrice.toLocaleString()}
                          <span className="text-[10px] text-slate-500 font-normal block">
                            ({r.currentMarginPct.toFixed(1)}% margin)
                          </span>
                        </td>
                        <td className="p-2.5 text-right font-mono font-bold text-orange-700 bg-orange-50/50 text-xs">
                          Rs. {r.proposedPrice.toLocaleString()}
                          <span className="text-[10px] text-emerald-700 font-bold block">
                            ({r.proposedMarginPct.toFixed(1)}% margin)
                          </span>
                        </td>
                        <td className="p-2.5 text-center">
                          <span
                            className={`px-2 py-0.5 rounded font-mono font-bold text-[10px] ${
                              r.marginLiftPct >= 0
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                : 'bg-rose-100 text-rose-800 border border-rose-200'
                            }`}
                          >
                            {r.marginLiftPct >= 0 ? '+' : ''}
                            {r.marginLiftPct.toFixed(1)}%
                          </span>
                        </td>
                        <td className="p-2.5 text-right font-mono font-bold text-slate-900 text-[11px]">
                          <span className={r.priceDelta >= 0 ? 'text-emerald-700' : 'text-rose-700'}>
                            {r.priceDelta >= 0 ? '+' : ''}Rs. {r.priceDelta.toLocaleString()}
                          </span>
                          <span className="text-[9px] text-slate-400 block font-normal">
                            ({r.percentageDelta >= 0 ? '+' : ''}{r.percentageDelta.toFixed(1)}%)
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* EXECUTION ACTION BUTTON */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-100">
              <div className="text-[11px] text-slate-500 font-medium">
                Executing will broadcast updated rates across all 5 branch terminals in real time.
              </div>

              <button
                type="button"
                onClick={handleExecuteBatchUpdate}
                disabled={selectedRows.length === 0 || isApplyingBatch}
                className="w-full sm:w-auto bg-orange-500 hover:bg-orange-600 text-white font-bold py-2.5 px-6 rounded-xl flex items-center justify-center space-x-2 transition shadow-md disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${isApplyingBatch ? 'animate-spin' : ''}`} />
                <span>
                  {isApplyingBatch
                    ? 'Broadcasting to Mesh Network...'
                    : `Apply & Broadcast Batch Margin Update (${selectedRows.length} Products)`}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: MESH TOPOLOGY & LIVE SYNC (EXISTING ORIGINAL FEATURES)            */}
      {/* ========================================================================= */}
      {activeTab === 'mesh_topology' && (
        <div className="space-y-4">
          {/* Sync Strategy Control Box */}
          <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs grid grid-cols-1 md:grid-cols-2 gap-3">
            <div 
              onClick={() => setSyncMode('REALTIME')}
              className={`p-3 rounded-xl border transition cursor-pointer ${
                syncMode === 'REALTIME' 
                  ? 'bg-orange-50/60 border-orange-500 text-slate-900 shadow-2xs' 
                  : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-semibold text-xs text-slate-900 flex items-center">
                  <Radio className="w-4 h-4 text-orange-500 mr-1.5" />
                  Option 1 (Best): Instant Real-Time Push
                </span>
                <input
                  type="radio"
                  checked={syncMode === 'REALTIME'}
                  onChange={() => setSyncMode('REALTIME')}
                  className="accent-orange-500 w-3.5 h-3.5"
                />
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed font-medium">
                Uses persistent WebSockets / Server-Sent Events. Head office changes push automatically to all branch terminals in seconds without manual refresh.
              </p>
            </div>

            <div 
              onClick={() => setSyncMode('POLLING_5MIN')}
              className={`p-3 rounded-xl border transition cursor-pointer ${
                syncMode === 'POLLING_5MIN' 
                  ? 'bg-orange-50/60 border-orange-500 text-slate-900 shadow-2xs' 
                  : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-semibold text-xs text-slate-900 flex items-center">
                  <RefreshCw className="w-4 h-4 text-amber-500 mr-1.5" />
                  Option 2: 5-Minute Scheduled Auto-Sync
                </span>
                <input
                  type="radio"
                  checked={syncMode === 'POLLING_5MIN'}
                  onChange={() => setSyncMode('POLLING_5MIN')}
                  className="accent-orange-500 w-3.5 h-3.5"
                />
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed font-medium">
                Branch software polls the central backend API every 5 minutes for updates. Recommended for low-bandwidth remote branch nodes.
              </p>
            </div>
          </div>

          {/* Branch Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {branches.map((b) => {
              const isBranchHO = b.code === 'HO';
              const isCurrentNode = activeBranch && b.id === activeBranch.id;
              const isPeerBlocked = !isHO && !isBranchHO && !isCurrentNode;

              return (
                <div
                  key={b.id}
                  className={`p-3.5 rounded-xl border transition relative overflow-hidden shadow-xs ${
                    isBranchHO 
                      ? 'bg-orange-50/40 border-orange-200' 
                      : isCurrentNode
                      ? 'bg-blue-50/30 border-blue-300 ring-1 ring-blue-400/50'
                      : isPeerBlocked
                      ? 'bg-slate-50/80 border-slate-200 opacity-70'
                      : 'bg-white border-slate-200 hover:border-orange-400'
                  }`}
                >
                  {isPeerBlocked && (
                    <div className="absolute top-0 right-0 bg-rose-500 text-white text-[8px] font-black px-2 py-0.5 rounded-bl uppercase tracking-wider flex items-center space-x-1">
                      <span>PEER LINK BLOCKED</span>
                    </div>
                  )}

                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-2.5">
                      <div className={`w-8 h-8 rounded-lg border flex items-center justify-center ${
                        isBranchHO 
                          ? 'bg-orange-500 border-orange-600 text-white' 
                          : isCurrentNode
                          ? 'bg-blue-600 border-blue-700 text-white font-bold'
                          : 'bg-slate-100 border-slate-200 text-slate-700'
                      }`}>
                        <Building2 className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-mono font-semibold tracking-wider text-slate-400 block">{b.code}</span>
                        <h4 className="font-semibold text-slate-900 text-xs">{b.name}</h4>
                      </div>
                    </div>

                    <span className={`px-2 py-0.5 rounded text-[10px] font-semibold flex items-center ${
                      isPeerBlocked
                        ? 'bg-slate-200 text-slate-600 border border-slate-300'
                        : b.status === 'Online'
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                        : 'bg-slate-100 text-slate-500'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full mr-1 ${isPeerBlocked ? 'bg-slate-400' : 'bg-emerald-500 animate-pulse'}`}></span>
                      {isPeerBlocked ? 'Isolated' : b.status}
                    </span>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-slate-100 space-y-1 text-xs">
                    <div className="flex justify-between text-slate-500 font-medium text-[11px]">
                      <span>Location:</span>
                      <span className="text-slate-800 font-semibold">{b.location}</span>
                    </div>
                    <div className="flex justify-between text-slate-500 font-medium text-[11px]">
                      <span>Branch Manager:</span>
                      <span className="text-slate-800 font-semibold">{b.manager_name}</span>
                    </div>
                    <div className="flex justify-between text-slate-500 font-medium text-[11px]">
                      <span>Sync Channel:</span>
                      <span className={`font-mono font-semibold ${isPeerBlocked ? 'text-slate-400' : 'text-orange-600'}`}>
                        {isPeerBlocked ? 'Peer Interconnect Disabled' : b.last_sync}
                      </span>
                    </div>
                    <div className="flex justify-between text-slate-500 font-medium text-[11px]">
                      <span>Star Network Role:</span>
                      <span className={`font-semibold ${isBranchHO ? 'text-orange-600 font-bold' : isCurrentNode ? 'text-blue-600 font-bold' : 'text-slate-500'}`}>
                        {isBranchHO ? 'Central Master Hub' : isCurrentNode ? 'Active Spoke Terminal' : 'Isolated Spoke Node'}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>


          {/* Network Live Packet Event Log */}
          <div className="bg-white border border-slate-200 rounded-xl p-3.5 space-y-2.5 shadow-xs">
            <h4 className="text-xs font-semibold text-slate-900 uppercase tracking-wider flex items-center border-b border-slate-100 pb-2">
              <Activity className="w-4 h-4 text-orange-500 mr-1.5" />
              Live Central API Event Packets & Broadcast Feed
            </h4>

            <div className="bg-slate-900 p-3 rounded-lg border border-slate-800 space-y-1.5 max-h-56 overflow-y-auto font-mono text-[11px]">
              {events.length === 0 ? (
                <p className="text-slate-500 text-center py-4 font-sans text-xs">No network packet activity recorded yet.</p>
              ) : (
                events.map((evt) => (
                  <div key={evt.id} className="text-slate-300 flex items-start space-x-2 py-0.5 border-b border-slate-800/60 last:border-0">
                    <span className="text-slate-500 font-semibold">{evt.timestamp}</span>
                    <span className="text-orange-400 font-semibold">[{evt.type}]</span>
                    <span className="text-slate-200 flex-1">{evt.message}</span>
                    <span className="text-emerald-400 text-[9px] bg-emerald-950/80 px-1.5 py-0.2 rounded border border-emerald-800">200 OK Pushed</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: NETWORK MARGIN ANALYTICS & COMPARISON                              */}
      {/* ========================================================================= */}
      {activeTab === 'margin_analytics' && (
        <div className="space-y-4">
          <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-3 shadow-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center space-x-2">
                  <BarChart2 className="w-4 h-4 text-orange-500" />
                  <span>Category Gross Margin Profile (Current vs Proposed Target)</span>
                </h3>
                <p className="text-[11px] text-slate-500">
                  Visualizes current baseline gross margins vs proposed batch adjustments across product categories.
                </p>
              </div>
            </div>

            <div className="h-72 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryAnalyticsData} margin={{ top: 10, right: 20, left: 0, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="category" tick={{ fontSize: 10, fill: '#64748b' }} interval={0} angle={-15} textAnchor="end" />
                  <YAxis tick={{ fontSize: 10, fill: '#64748b' }} unit="%" domain={[0, 60]} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff', fontSize: '11px' }}
                    formatter={(val: any) => [`${val}%`, 'Gross Margin']}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px' }} />
                  <Bar dataKey="currentMargin" name="Current Avg Margin %" fill="#94a3b8" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="proposedMargin" name="Proposed Target Margin %" fill="#f97316" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
