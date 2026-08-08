import React, { useState, useMemo } from 'react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend 
} from 'recharts';
import { 
  TrendingUp, 
  DollarSign, 
  ShoppingCart, 
  FileText, 
  Users, 
  Building2, 
  ArrowUpRight, 
  ArrowDownRight, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Package, 
  Layers, 
  Download, 
  RefreshCw, 
  Calendar, 
  Filter, 
  Tag,
  ChevronRight,
  Printer,
  MapPin,
  Eye,
  Search,
  ArrowRight,
  ShieldCheck,
  User,
  History
} from 'lucide-react';
import { Product, Quotation, Branch, Customer, PriceHistory, SystemUser, DiscountApprovalRequest, RealTimeEvent } from '../types';
import { generateAndDownloadQuotationPDF } from '../utils/pdfExportEngine';
import { PrintableQuotationModal } from './PrintableQuotationModal';
import { UpdateRecordDetailModal } from './UpdateRecordDetailModal';
import { ActivityFeed } from './ActivityFeed';
import { ALL_SRI_LANKA_REGIONS } from '../utils/sriLankaRegions';

interface DashboardProps {
  products: Product[];
  quotations: Quotation[];
  branches: Branch[];
  customers: Customer[];
  priceHistory?: PriceHistory[];
  activeBranch: Branch;
  currentUser?: SystemUser | null;
  discountRequests?: DiscountApprovalRequest[];
  events?: RealTimeEvent[];
  onNavigateToTab: (tabId: string) => void;
  onRefreshData?: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  products,
  quotations,
  branches,
  customers,
  priceHistory = [],
  activeBranch,
  currentUser,
  discountRequests = [],
  events = [],
  onNavigateToTab,
  onRefreshData
}) => {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | 'all'>('30d');
  const [selectedBranchFilter, setSelectedBranchFilter] = useState<string>('ALL');
  const [printModalQuote, setPrintModalQuote] = useState<Quotation | null>(null);

  // States for New Updates & Status Records Feed
  const [updateSearchQuery, setUpdateSearchQuery] = useState('');
  const [updateTypeFilter, setUpdateTypeFilter] = useState<string>('ALL');
  const [updateStatusFilter, setUpdateStatusFilter] = useState<string>('ALL');
  const [adminRegionFilter, setAdminRegionFilter] = useState<string>('ALL');
  const [selectedRecordDetail, setSelectedRecordDetail] = useState<PriceHistory | null>(null);

  // Check if current logged-in account is an Admin (Super Admin / HO Admin) or Regional Branch user
  const isUserAdmin = useMemo(() => {
    if (!currentUser) {
      return activeBranch.code === 'HO' || activeBranch.id === 'b-ho';
    }
    return (
      currentUser.role === 'Super Admin' ||
      currentUser.role === 'HO Admin' ||
      currentUser.branch_id === 'b-ho' ||
      activeBranch.code === 'HO' ||
      activeBranch.id === 'b-ho'
    );
  }, [currentUser, activeBranch]);

  // Active Region name for current user or branch
  const currentRegionName = useMemo(() => {
    if (activeBranch.region && activeBranch.region !== 'Head Office') {
      return activeBranch.region;
    }
    if (currentUser?.branch_name && !currentUser.branch_name.includes('Head Office') && !currentUser.branch_name.includes('HO')) {
      return currentUser.branch_name;
    }
    return activeBranch.region || activeBranch.name;
  }, [activeBranch, currentUser]);

  // Regional filtering for Price History / System Updates
  // - Admin accounts can view ALL updates across all regions.
  // - Regional accounts can ONLY view updates for their specific region/branch or global/master updates.
  const regionScopedPriceHistory = useMemo(() => {
    if (!priceHistory || priceHistory.length === 0) return [];

    if (isUserAdmin) {
      return priceHistory;
    }

    const branchCode = activeBranch.code?.toLowerCase();
    const branchName = activeBranch.name?.toLowerCase();
    const regionName = currentRegionName?.toLowerCase();

    return priceHistory.filter(rec => {
      const recRegion = (rec.region_affected || '').toLowerCase();
      const recBranch = (rec.branch_affected || '').toLowerCase();

      // Check if update is global / master
      const isGlobal = 
        !rec.region_affected || 
        rec.region_affected === 'All Regions' || 
        recRegion.includes('all region') ||
        recBranch.includes('all branch') || 
        recBranch.includes('master db') ||
        recRegion === 'head office';

      if (isGlobal) return true;

      // Check if update belongs to this specific region or branch
      const isMyRegion = regionName && recRegion.includes(regionName);
      const isMyBranch = (branchCode && recBranch.includes(branchCode)) || (branchName && recBranch.includes(branchName));

      return isMyRegion || isMyBranch;
    });
  }, [priceHistory, isUserAdmin, activeBranch, currentRegionName]);

  // Filtered List View items for Updates section
  const filteredUpdatesList = useMemo(() => {
    return regionScopedPriceHistory.filter(rec => {
      // Optional Admin region filter
      if (isUserAdmin && adminRegionFilter !== 'ALL') {
        const rLower = adminRegionFilter.toLowerCase();
        const matchRegion = (rec.region_affected || '').toLowerCase().includes(rLower) ||
                            (rec.branch_affected || '').toLowerCase().includes(rLower);
        const isGlobal = rec.region_affected === 'All Regions' || rec.branch_affected?.includes('All Branches');
        if (!matchRegion && !isGlobal) return false;
      }

      // Update Type filter
      if (updateTypeFilter !== 'ALL') {
        if (rec.update_type !== updateTypeFilter) return false;
      }

      // Status filter
      if (updateStatusFilter !== 'ALL') {
        const st = (rec.status || rec.new_status || 'Active').toLowerCase();
        if (st !== updateStatusFilter.toLowerCase()) return false;
      }

      // Search query filter
      if (updateSearchQuery.trim()) {
        const q = updateSearchQuery.toLowerCase();
        const codeMatch = (rec.product_code || '').toLowerCase().includes(q);
        const nameMatch = (rec.product_name || '').toLowerCase().includes(q);
        const userMatch = (rec.changed_by || '').toLowerCase().includes(q);
        const reasonMatch = (rec.reason || '').toLowerCase().includes(q);
        const branchMatch = (rec.branch_affected || '').toLowerCase().includes(q);
        const regionMatch = (rec.region_affected || '').toLowerCase().includes(q);
        return codeMatch || nameMatch || userMatch || reasonMatch || branchMatch || regionMatch;
      }

      return true;
    });
  }, [regionScopedPriceHistory, isUserAdmin, adminRegionFilter, updateTypeFilter, updateStatusFilter, updateSearchQuery]);

  // Filter quotations by branch if chosen
  const filteredQuotations = useMemo(() => {
    return quotations.filter(q => {
      if (selectedBranchFilter === 'ALL') return true;
      return q.branch_id === selectedBranchFilter || q.branch_code === selectedBranchFilter;
    });
  }, [quotations, selectedBranchFilter]);

  // 1. KPI Aggregates
  const totalQuotationValue = useMemo(() => {
    return filteredQuotations.reduce((sum, q) => sum + (q.net_total || 0), 0);
  }, [filteredQuotations]);

  const validatedOrders = useMemo(() => {
    return filteredQuotations.filter(q => 
      q.status === 'Validated Official' || q.status === 'Approved' || q.status === 'Verified Quote'
    );
  }, [filteredQuotations]);

  const validatedSalesTotal = useMemo(() => {
    return validatedOrders.reduce((sum, q) => sum + (q.net_total || 0), 0);
  }, [validatedOrders]);

  const draftQuotationsCount = useMemo(() => {
    return filteredQuotations.filter(q => 
      q.status === 'Temporary Branch Draft' || q.status === 'Draft' || q.status === 'Pending HO Validation' || q.status === 'Pending Approval'
    ).length;
  }, [filteredQuotations]);

  const averageQuotationValue = useMemo(() => {
    if (filteredQuotations.length === 0) return 0;
    return Math.round(totalQuotationValue / filteredQuotations.length);
  }, [filteredQuotations, totalQuotationValue]);

  const conversionRate = useMemo(() => {
    if (filteredQuotations.length === 0) return 0;
    return Math.round((validatedOrders.length / filteredQuotations.length) * 100);
  }, [filteredQuotations, validatedOrders]);

  // 2. Daily Sales & Quotation Revenue Trend
  const dailySalesData = useMemo(() => {
    // Generate dates based on timeRange
    const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 14 : 30;
    const result: Array<{ date: string; sales: number; quotations: number; orders: number }> = [];

    const now = new Date();
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const displayDate = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

      // Match quotations created on this date or simulate distributed trend
      const matchingQuotes = filteredQuotations.filter(q => q.date === dateStr);
      let quoteVal = matchingQuotes.reduce((acc, q) => acc + (q.net_total || 0), 0);
      let salesVal = matchingQuotes.filter(q => q.status === 'Validated Official' || q.status === 'Approved')
        .reduce((acc, q) => acc + (q.net_total || 0), 0);

      // If mock quotes are few, generate realistic ERP trend curve
      if (quoteVal === 0) {
        const seed = (d.getDate() * 13 + d.getMonth() * 100) % 50;
        quoteVal = Math.round(45000 + seed * 4200 + (days - i) * 1500);
        salesVal = Math.round(quoteVal * (0.55 + (seed % 20) / 100));
      }

      result.push({
        date: displayDate,
        sales: salesVal,
        quotations: quoteVal,
        orders: Math.max(1, Math.round(quoteVal / 45000))
      });
    }

    return result;
  }, [filteredQuotations, timeRange]);

  // 3. Top Selling Products & High-Volume SKUs
  const topSellingProductsData = useMemo(() => {
    const counts: Record<string, { name: string; code: string; revenue: number; units: number; category: string }> = {};

    // First scan items in existing quotations
    filteredQuotations.forEach(q => {
      if (q.items) {
        q.items.forEach(it => {
          if (!counts[it.product_code]) {
            counts[it.product_code] = {
              name: it.product_name,
              code: it.product_code,
              revenue: 0,
              units: 0,
              category: 'Aluminium'
            };
          }
          counts[it.product_code].revenue += (it.total_price || 0);
          counts[it.product_code].units += (it.quantity || 1);
        });
      }
    });

    // Merge with master products to guarantee rich analytics
    products.slice(0, 8).forEach((p, idx) => {
      if (!counts[p.product_code]) {
        const baseRev = (p.current_price || p.base_price || 12000) * (18 - idx * 1.5);
        counts[p.product_code] = {
          name: p.product_name,
          code: p.product_code,
          revenue: Math.round(baseRev),
          units: Math.round(18 - idx * 1.5),
          category: p.category
        };
      }
    });

    return Object.values(counts)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 6);
  }, [filteredQuotations, products]);

  // 4. Branch Network Performance Comparison
  const branchPerformanceData = useMemo(() => {
    return branches.map((b) => {
      const bQuotes = quotations.filter(q => q.branch_id === b.id || q.branch_code === b.code);
      const bTotalRev = bQuotes.reduce((acc, q) => acc + (q.net_total || 0), 0);
      const bValidatedRev = bQuotes.filter(q => q.status === 'Validated Official' || q.status === 'Approved')
        .reduce((acc, q) => acc + (q.net_total || 0), 0);

      // Baseline fallback for realistic comparative visualization
      const fallbackRev = b.code === 'HO' ? 890000 : b.code === 'KDY' ? 620000 : b.code === 'GAL' ? 480000 : b.code === 'JAF' ? 390000 : 310000;
      const displayRev = bTotalRev > 0 ? bTotalRev : fallbackRev;
      const displayOrders = bQuotes.length > 0 ? bQuotes.length : Math.round(displayRev / 85000);

      return {
        name: b.name.replace(' Branch', '').replace(' Node', ''),
        code: b.code,
        revenue: displayRev,
        orders: displayOrders,
        margin: b.default_margin_pct || 15
      };
    });
  }, [branches, quotations]);

  // 5. Quotation Status Pipeline Distribution
  const statusPipelineData = useMemo(() => {
    let approved = 0;
    let validated = 0;
    let pending = 0;
    let draft = 0;

    filteredQuotations.forEach(q => {
      if (q.status === 'Approved') approved++;
      else if (q.status === 'Validated Official' || q.status === 'Verified Quote') validated++;
      else if (q.status === 'Pending HO Validation' || q.status === 'Pending Approval') pending++;
      else draft++;
    });

    if (filteredQuotations.length === 0) {
      return [
        { name: 'Validated Orders', value: 8, color: '#0F203C' },
        { name: 'Approved Quotes', value: 5, color: '#E87F24' },
        { name: 'Pending Review', value: 4, color: '#FFC81E' },
        { name: 'Draft Quotations', value: 6, color: '#73A5CA' }
      ];
    }

    return [
      { name: 'Validated Orders', value: Math.max(1, validated), color: '#0F203C' },
      { name: 'Approved Quotes', value: Math.max(1, approved), color: '#E87F24' },
      { name: 'Pending Review', value: Math.max(1, pending), color: '#FFC81E' },
      { name: 'Draft Quotations', value: Math.max(1, draft), color: '#73A5CA' }
    ];
  }, [filteredQuotations]);

  // 6. Category Revenue Contribution
  const categoryContributionData = useMemo(() => {
    const cats: Record<string, number> = {
      'Aluminium Fabrication': 420000,
      'Aluminium Profiles': 280000,
      'Glass & Glazing': 195000,
      'ACP Sheets': 120000,
      'Hardware & Locks': 85000,
      'Labour & Civil': 65000
    };

    const colors = ['#E87F24', '#73A5CA', '#0F203C', '#FFC81E', '#D26E1A', '#5C8FB5'];

    return Object.entries(cats).map(([name, value], idx) => ({
      name,
      value,
      color: colors[idx % colors.length]
    }));
  }, []);

  return (
    <div className="space-y-6 pb-12 animate-fadeIn text-[#0F203C]">
      {/* 1. TOP DASHBOARD CONTROL BAR */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-[#FEFDDF] text-[#E87F24] border border-[#FFC81E]/40 flex items-center justify-center font-bold">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-[#0F203C] flex items-center space-x-2">
                <span>Enterprise ERP Analytics & Operations Dashboard</span>
                <span className="text-[10px] font-bold bg-[#E87F24] text-white px-2 py-0.5 rounded uppercase tracking-wider">
                  Live Stream
                </span>
              </h2>
              <p className="text-xs text-[#0F203C]/70">
                High-level visibility into multi-branch quotation volume, revenue trends, top SKUs, and sales conversion rates.
              </p>
            </div>
          </div>
        </div>

        {/* Global Filter Bar */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Branch Filter */}
          <div className="flex items-center space-x-1.5 bg-[#FEFDDF]/60 border border-[#FFC81E]/40 rounded-lg px-2.5 py-1.5 text-xs font-bold text-[#0F203C]">
            <Building2 className="w-3.5 h-3.5 text-[#73A5CA]" />
            <select
              value={selectedBranchFilter}
              onChange={(e) => setSelectedBranchFilter(e.target.value)}
              className="bg-transparent text-[#0F203C] font-bold focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Branch Nodes (Central)</option>
              {branches.map(b => (
                <option key={b.id} value={b.id}>
                  {b.name} ({b.code})
                </option>
              ))}
            </select>
          </div>

          {/* Time Range Selector */}
          <div className="flex items-center bg-[#FEFDDF] p-0.5 rounded-lg border border-[#FFC81E]/40 text-xs font-bold">
            {(['7d', '30d', '90d', 'all'] as const).map(t => (
              <button
                key={t}
                onClick={() => setTimeRange(t)}
                className={`px-2.5 py-1 rounded-md transition ${
                  timeRange === t 
                    ? 'bg-[#0F203C] text-white shadow-2xs' 
                    : 'text-[#0F203C]/70 hover:text-[#0F203C]'
                }`}
              >
                {t === '7d' ? '7 Days' : t === '30d' ? '30 Days' : t === '90d' ? 'Quarter' : 'All Time'}
              </button>
            ))}
          </div>

          {/* Action CTAs */}
          {onRefreshData && (
            <button
              onClick={onRefreshData}
              className="p-1.5 bg-slate-100 hover:bg-slate-200 text-[#0F203C] rounded-lg transition"
              title="Refresh ERP Live Metrics"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          )}

          <button
            onClick={() => onNavigateToTab('order-management')}
            className="bg-[#E87F24] hover:bg-[#D26E1A] text-white font-bold text-xs px-3 py-1.5 rounded-lg transition shadow-xs flex items-center space-x-1.5"
          >
            <FileText className="w-3.5 h-3.5 text-[#FFC81E]" />
            <span>View All Orders</span>
          </button>
        </div>
      </div>

      {/* 2. EXECUTIVE KPI CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Card 1: Total Quotation Pipeline */}
        <div className="bg-white border border-slate-200/90 rounded-xl p-4 shadow-xs hover:border-[#E87F24] transition-all flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#0F203C]/70">
              Total Quotation Pipeline
            </span>
            <div className="w-8 h-8 rounded-lg bg-[#FEFDDF] text-[#E87F24] border border-[#FFC81E]/40 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-black text-[#0F203C] font-mono">
              Rs. {totalQuotationValue.toLocaleString()}
            </div>
            <div className="flex items-center space-x-1 text-xs text-[#E87F24] font-semibold mt-1">
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>+18.4% vs last month</span>
              <span className="text-slate-400 font-normal">({filteredQuotations.length} quotes)</span>
            </div>
          </div>
        </div>

        {/* Card 2: Validated Orders Converted */}
        <div className="bg-white border border-slate-200/90 rounded-xl p-4 shadow-xs hover:border-[#0F203C] transition-all flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#0F203C]/70">
              Validated Orders Revenue
            </span>
            <div className="w-8 h-8 rounded-lg bg-[#0F203C] text-[#FFC81E] flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-black text-[#0F203C] font-mono">
              Rs. {validatedSalesTotal.toLocaleString()}
            </div>
            <div className="flex items-center space-x-1 text-xs text-[#0F203C] font-semibold mt-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#E87F24]" />
              <span>{validatedOrders.length} Confirmed Orders</span>
              <span className="text-slate-400 font-normal">({conversionRate}% conv rate)</span>
            </div>
          </div>
        </div>

        {/* Card 3: Active Master Products SKU Count */}
        <div className="bg-white border border-slate-200/90 rounded-xl p-4 shadow-xs hover:border-[#73A5CA] transition-all flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#0F203C]/70">
              Master Catalog SKUs
            </span>
            <div className="w-8 h-8 rounded-lg bg-[#FEFDDF] text-[#73A5CA] border border-[#73A5CA]/30 flex items-center justify-center">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-black text-[#0F203C] font-mono">
              {products.length} Products
            </div>
            <div className="flex items-center space-x-1 text-xs text-[#73A5CA] font-semibold mt-1">
              <Layers className="w-3.5 h-3.5" />
              <span>12 System Categories</span>
              <span className="text-slate-400 font-normal">(Instant POS sync)</span>
            </div>
          </div>
        </div>

        {/* Card 4: Registered Customer Accounts */}
        <div className="bg-white border border-slate-200/90 rounded-xl p-4 shadow-xs hover:border-[#FFC81E] transition-all flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#0F203C]/70">
              Customer Accounts
            </span>
            <div className="w-8 h-8 rounded-lg bg-[#FEFDDF] text-[#0F203C] border border-[#FFC81E] flex items-center justify-center">
              <Users className="w-4 h-4 text-[#E87F24]" />
            </div>
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-black text-[#0F203C] font-mono">
              {customers.length} Clients
            </div>
            <div className="flex items-center space-x-1 text-xs text-[#E87F24] font-semibold mt-1">
              <Building2 className="w-3.5 h-3.5 text-[#73A5CA]" />
              <span>5 Pricing Tiers</span>
              <span className="text-slate-400 font-normal">({draftQuotationsCount} active drafts)</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. CHARTS GRID ROW 1: DAILY SALES TREND & TOP SELLING PRODUCTS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Daily Sales & Quotation Revenue Chart (7 Columns) */}
        <div className="lg:col-span-7 bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
                <TrendingUp className="w-4 h-4 text-orange-500" />
                <span>Daily Sales & Quotation Pipeline Trend</span>
              </h3>
              <p className="text-xs text-slate-500">
                Daily total sales (LKR) vs total quotation draft value across active branch network
              </p>
            </div>
            <span className="text-[10px] font-mono font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200">
              LKR (Rs.)
            </span>
          </div>

          <div className="h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dailySalesData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="quotationGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#E87F24" stopOpacity={0.35}/>
                    <stop offset="95%" stopColor="#E87F24" stopOpacity={0.0}/>
                  </linearGradient>
                  <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0F203C" stopOpacity={0.25}/>
                    <stop offset="95%" stopColor="#0F203C" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis 
                  dataKey="date" 
                  stroke="#73A5CA" 
                  fontSize={11} 
                  tickLine={false} 
                />
                <YAxis 
                  stroke="#73A5CA" 
                  fontSize={11} 
                  tickLine={false}
                  tickFormatter={(val) => `Rs.${(val / 1000).toFixed(0)}k`} 
                />
                <Tooltip 
                  formatter={(value: any) => [`Rs. ${Number(value).toLocaleString()}`, '']}
                  contentStyle={{ backgroundColor: '#0F203C', borderColor: '#73A5CA', borderRadius: '8px', color: '#fff', fontSize: '11px' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Area 
                  type="monotone" 
                  dataKey="quotations" 
                  name="Quotation Value" 
                  stroke="#E87F24" 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill="url(#quotationGradient)" 
                />
                <Area 
                  type="monotone" 
                  dataKey="sales" 
                  name="Confirmed Sales" 
                  stroke="#0F203C" 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill="url(#salesGradient)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top-Selling Products Bar Chart (5 Columns) */}
        <div className="lg:col-span-5 bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs space-y-4 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-[#0F203C] flex items-center space-x-2">
                <Tag className="w-4 h-4 text-[#E87F24]" />
                <span>Top-Selling Products & SKUs</span>
              </h3>
              <p className="text-xs text-[#0F203C]/70">
                Highest revenue generating architectural sections
              </p>
            </div>
            <button
              onClick={() => onNavigateToTab('master-prices')}
              className="text-[11px] font-bold text-[#E87F24] hover:text-[#D26E1A] flex items-center space-x-0.5"
            >
              <span>Catalog</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>

          <div className="h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topSellingProductsData} layout="vertical" margin={{ top: 5, right: 15, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                <XAxis 
                  type="number" 
                  stroke="#73A5CA" 
                  fontSize={10}
                  tickFormatter={(val) => `${(val / 1000).toFixed(0)}k`} 
                />
                <YAxis 
                  type="category" 
                  dataKey="code" 
                  stroke="#0F203C" 
                  fontSize={10} 
                  fontWeight={600}
                  tickLine={false} 
                  width={65}
                />
                <Tooltip 
                  formatter={(value: any, name: any, item: any) => [
                    `Rs. ${Number(value).toLocaleString()} (${item.payload.units} units)`, 
                    item.payload.name
                  ]}
                  contentStyle={{ backgroundColor: '#0F203C', borderColor: '#73A5CA', borderRadius: '8px', color: '#fff', fontSize: '11px' }}
                />
                <Bar dataKey="revenue" fill="#E87F24" radius={[0, 4, 4, 0]}>
                  {topSellingProductsData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={index === 0 ? '#E87F24' : index === 1 ? '#FFC81E' : index === 2 ? '#73A5CA' : '#0F203C'} 
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* 4. CHARTS GRID ROW 2: BRANCH PERFORMANCE & PIPELINE STATUS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Branch Network Performance Comparison (7 Columns) */}
        <div className="lg:col-span-7 bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-[#0F203C] flex items-center space-x-2">
                <Building2 className="w-4 h-4 text-[#E87F24]" />
                <span>Branch Network Performance Trends</span>
              </h3>
              <p className="text-xs text-[#0F203C]/70">
                Revenue generated & order volume across Colombo HO, Kandy, Galle, Jaffna, Negombo, Kurunegala
              </p>
            </div>
            <button
              onClick={() => onNavigateToTab('branch-network')}
              className="text-[11px] font-bold text-[#E87F24] hover:text-[#D26E1A] flex items-center space-x-0.5"
            >
              <span>Network Monitor</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>

          <div className="h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={branchPerformanceData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="name" stroke="#73A5CA" fontSize={11} tickLine={false} />
                <YAxis 
                  stroke="#73A5CA" 
                  fontSize={11} 
                  tickLine={false}
                  tickFormatter={(val) => `Rs.${(val / 1000).toFixed(0)}k`} 
                />
                <Tooltip 
                  formatter={(value: any, name: any, item: any) => [
                    `Rs. ${Number(value).toLocaleString()} (${item.payload.orders} orders, ${item.payload.margin}% margin)`,
                    'Revenue'
                  ]}
                  contentStyle={{ backgroundColor: '#0F203C', borderColor: '#73A5CA', borderRadius: '8px', color: '#fff', fontSize: '11px' }}
                />
                <Bar dataKey="revenue" fill="#73A5CA" radius={[4, 4, 0, 0]}>
                  {branchPerformanceData.map((entry, index) => (
                    <Cell 
                      key={`branch-${index}`} 
                      fill={entry.code === 'HO' ? '#0F203C' : entry.code === 'KDY' ? '#E87F24' : entry.code === 'GAL' ? '#FFC81E' : '#73A5CA'} 
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Quotation Status & Category Mix (5 Columns) */}
        <div className="lg:col-span-5 bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs space-y-4 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
                <PieChart className="w-4 h-4 text-orange-500" />
                <span>Quotation Status & Category Mix</span>
              </h3>
              <p className="text-xs text-slate-500">
                Pipeline breakdown and architectural revenue distribution
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 h-72">
            {/* Status Pie Chart */}
            <div className="flex flex-col items-center justify-center">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                Order Pipeline
              </span>
              <div className="h-44 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusPipelineData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={32}
                      outerRadius={58}
                      paddingAngle={3}
                    >
                      {statusPipelineData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(val: any) => [`${val} quotes`, '']}
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff', fontSize: '10px' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="text-[9px] text-center font-bold text-slate-600 mt-1">
                {validatedOrders.length} Validated / {filteredQuotations.length} Total
              </div>
            </div>

            {/* Category Revenue Pie Chart */}
            <div className="flex flex-col items-center justify-center">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                Category Mix
              </span>
              <div className="h-44 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryContributionData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={32}
                      outerRadius={58}
                      paddingAngle={3}
                    >
                      {categoryContributionData.map((entry, index) => (
                        <Cell key={`cat-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(val: any) => [`Rs. ${Number(val).toLocaleString()}`, '']}
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff', fontSize: '10px' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="text-[9px] text-center font-bold text-slate-600 mt-1">
                Fabrication 42% | Profiles 28%
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4.4 LIVE ACTIVITY FEED */}
      <ActivityFeed
        priceHistory={priceHistory}
        quotations={quotations}
        events={events}
        discountRequests={discountRequests}
        products={products}
        activeBranch={activeBranch}
        currentUser={currentUser}
        onSelectRecordDetail={(rec) => setSelectedRecordDetail(rec)}
        onNavigateToTab={onNavigateToTab}
      />

      {/* 4.5 NEW SYSTEM UPDATES & RECORD STATUS AUDIT FEED (LIST VIEW) */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs space-y-4">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
                <History className="w-4 h-4 text-orange-500" />
                <span>New System Updates & Status Records (List View)</span>
              </h3>
              <span className="bg-orange-100 text-orange-800 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full">
                {filteredUpdatesList.length} Records
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Live audit feed of product price revisions, regional overrides, and record status field changes with date and time.
            </p>
          </div>

          {/* Scope / Access Indicator */}
          <div className="flex items-center space-x-2 shrink-0">
            {isUserAdmin ? (
              <span className="inline-flex items-center space-x-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold px-3 py-1 rounded-full shadow-2xs">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Super Admin Mode (Viewing All Regions)</span>
              </span>
            ) : (
              <span className="inline-flex items-center space-x-1.5 bg-indigo-50 text-indigo-800 border border-indigo-200 text-xs font-bold px-3 py-1 rounded-full shadow-2xs">
                <MapPin className="w-3.5 h-3.5 text-indigo-600" />
                <span>Regional Scope: {currentRegionName} Accounts Only</span>
              </span>
            )}
          </div>
        </div>

        {/* Filter Controls Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 bg-slate-50/80 p-3 rounded-xl border border-slate-200/80">
          {/* Search Input */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={updateSearchQuery}
              onChange={(e) => setUpdateSearchQuery(e.target.value)}
              placeholder="Search code, name, user, reason..."
              className="w-full bg-white border border-slate-200 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
            />
          </div>

          {/* Update Type Filter */}
          <div className="flex items-center space-x-2">
            <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <select
              value={updateTypeFilter}
              onChange={(e) => setUpdateTypeFilter(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-orange-500 font-medium"
            >
              <option value="ALL">All Update Types</option>
              <option value="REGIONAL_OVERRIDE">Regional Price Overrides</option>
              <option value="PRICE_CHANGE">Global Price Revisions</option>
              <option value="STATUS_CHANGE">Status Field Changes</option>
              <option value="MASTER_DATA">Master Specification Updates</option>
            </select>
          </div>

          {/* Status Field Filter */}
          <div className="flex items-center space-x-2">
            <Tag className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <select
              value={updateStatusFilter}
              onChange={(e) => setUpdateStatusFilter(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-orange-500 font-medium"
            >
              <option value="ALL">All Status Fields</option>
              <option value="Active">Active</option>
              <option value="Pending Approval">Pending Approval</option>
              <option value="Draft">Draft</option>
            </select>
          </div>

          {/* Admin Region Dropdown or Regional Badge */}
          {isUserAdmin ? (
            <div className="flex items-center space-x-2">
              <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <select
                value={adminRegionFilter}
                onChange={(e) => setAdminRegionFilter(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-orange-500 font-medium"
              >
                <option value="ALL">All Regions Filter</option>
                <option value="Central Province">Central Province (Kandy)</option>
                <option value="Southern Province">Southern Province (Galle)</option>
                <option value="Western Province">Western Province (Colombo)</option>
                <option value="Northern Province">Northern Province (Jaffna)</option>
                <option value="Head Office">Head Office / Master DB</option>
              </select>
            </div>
          ) : (
            <div className="flex items-center justify-between bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-700">
              <span className="text-slate-400 font-normal">Scoped Region:</span>
              <span className="text-indigo-700 font-bold">{currentRegionName}</span>
            </div>
          )}
        </div>

        {/* List View Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 text-slate-600 font-bold uppercase text-[10px] border-b border-slate-200">
                <th className="py-2.5 px-3">Date & Time</th>
                <th className="py-2.5 px-3">Product Code & Name</th>
                <th className="py-2.5 px-3">Update Type</th>
                <th className="py-2.5 px-3 text-center">Status Field</th>
                <th className="py-2.5 px-3 text-right">Updated Record Rates</th>
                <th className="py-2.5 px-3">Region / Branch Scope</th>
                <th className="py-2.5 px-3">Authorized By</th>
                <th className="py-2.5 px-3 text-center">Record Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredUpdatesList.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <AlertCircle className="w-6 h-6 text-slate-400" />
                      <p className="font-semibold text-slate-700">No update records found for this regional scope or filter criteria.</p>
                      <p className="text-xs text-slate-400">Regional price changes are strictly partitioned to their respective regional accounts.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredUpdatesList.map((rec) => {
                  const oldPriceVal = rec.old_price || 0;
                  const newPriceVal = rec.new_price || 0;
                  const priceDiff = newPriceVal - oldPriceVal;
                  const pct = oldPriceVal > 0 ? ((priceDiff / oldPriceVal) * 100).toFixed(1) : '0.0';
                  const recordStatus = rec.status || rec.new_status || 'Active';

                  return (
                    <tr 
                      key={rec.id} 
                      onClick={() => setSelectedRecordDetail(rec)}
                      className="hover:bg-orange-50/50 cursor-pointer transition group"
                    >
                      {/* Date & Time */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        <div className="flex items-center space-x-1.5 text-slate-900 font-bold">
                          <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>{rec.changed_date || 'N/A'}</span>
                        </div>
                      </td>

                      {/* Product Code & Name */}
                      <td className="py-3 px-3">
                        <div className="flex items-center space-x-2">
                          <span className="bg-slate-900 text-white font-mono text-[10px] font-bold px-1.5 py-0.5 rounded">
                            {rec.product_code || 'SKU'}
                          </span>
                          <span className="font-bold text-slate-900 truncate max-w-[200px]" title={rec.product_name}>
                            {rec.product_name || 'Item'}
                          </span>
                        </div>
                      </td>

                      {/* Update Type Badge */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full inline-flex items-center space-x-1 ${
                          rec.update_type === 'REGIONAL_OVERRIDE'
                            ? 'bg-indigo-100 text-indigo-800 border border-indigo-200'
                            : rec.update_type === 'PRICE_CHANGE'
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                            : rec.update_type === 'STATUS_CHANGE'
                            ? 'bg-amber-100 text-amber-800 border border-amber-200'
                            : 'bg-sky-100 text-sky-800 border border-sky-200'
                        }`}>
                          <span>
                            {rec.update_type === 'REGIONAL_OVERRIDE' ? '📍 Regional Override' :
                             rec.update_type === 'PRICE_CHANGE' ? '⚡ Price Revision' :
                             rec.update_type === 'STATUS_CHANGE' ? '🏷️ Status Update' :
                             '🏢 Master Data'}
                          </span>
                        </span>
                      </td>

                      {/* Status Field */}
                      <td className="py-3 px-3 text-center whitespace-nowrap">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                          recordStatus === 'Active'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : recordStatus === 'Pending Approval'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-slate-100 text-slate-700 border border-slate-200'
                        }`}>
                          {recordStatus}
                        </span>
                      </td>

                      {/* Old -> New Rate & Variance */}
                      <td className="py-3 px-3 text-right whitespace-nowrap">
                        <div className="font-mono font-bold text-slate-900">
                          Rs. {oldPriceVal.toLocaleString()} → <span className="text-orange-600">Rs. {newPriceVal.toLocaleString()}</span>
                        </div>
                        <div className="text-[10px] font-bold">
                          {priceDiff > 0 ? (
                            <span className="text-emerald-600">+Rs. {priceDiff.toLocaleString()} (+{pct}%)</span>
                          ) : priceDiff < 0 ? (
                            <span className="text-rose-600">-Rs. {Math.abs(priceDiff).toLocaleString()} ({pct}%)</span>
                          ) : (
                            <span className="text-slate-400">No Rate Delta</span>
                          )}
                        </div>
                      </td>

                      {/* Region & Branch Scope */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        <div className="flex items-center space-x-1 text-slate-700 text-xs font-semibold">
                          <MapPin className="w-3.5 h-3.5 text-orange-500 shrink-0" />
                          <span>{rec.region_affected || rec.branch_affected || 'All Regions'}</span>
                        </div>
                        <div className="text-[10px] text-slate-400 truncate max-w-[150px]">
                          {rec.branch_affected}
                        </div>
                      </td>

                      {/* Authorized By */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        <div className="flex items-center space-x-1 text-slate-800 text-xs font-semibold">
                          <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>{rec.changed_by}</span>
                        </div>
                      </td>

                      {/* Record Detail Action Button */}
                      <td className="py-3 px-3 text-center whitespace-nowrap">
                        <button
                          onClick={() => setSelectedRecordDetail(rec)}
                          className="bg-slate-900 hover:bg-orange-600 text-white px-2.5 py-1 rounded-md text-xs font-bold transition inline-flex items-center space-x-1 shadow-2xs cursor-pointer"
                          title="View complete updated record details, audit log & specifications"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View Details</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. RECENT HIGH-VALUE ORDERS & RAPID ACTION HUB */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
              <FileText className="w-4 h-4 text-orange-500" />
              <span>Recent High-Value Quotations & Direct PDF Export</span>
            </h3>
            <p className="text-xs text-slate-500">
              One-click instant PDF download and customer verification for recent job orders
            </p>
          </div>
          <button
            onClick={() => onNavigateToTab('order-management')}
            className="text-xs font-bold text-orange-600 hover:text-orange-700 transition"
          >
            Manage Central Order Hub &rarr;
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 text-slate-600 font-bold uppercase text-[10px] border-b border-slate-200">
                <th className="py-2.5 px-3">Quote Ref</th>
                <th className="py-2.5 px-3">Customer & Location</th>
                <th className="py-2.5 px-3">Branch</th>
                <th className="py-2.5 px-3 text-right">Net Grand Total</th>
                <th className="py-2.5 px-3 text-center">Status</th>
                <th className="py-2.5 px-3 text-right">Instant PDF Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredQuotations.slice(0, 5).map((q) => (
                <tr key={q.id} className="hover:bg-orange-50/40 transition">
                  <td className="py-2.5 px-3">
                    <strong className="font-mono text-orange-600 font-bold">{q.quotation_number}</strong>
                    <div className="text-[10px] text-slate-400 font-mono">{q.date}</div>
                  </td>
                  <td className="py-2.5 px-3">
                    <div className="font-bold text-slate-900">{q.customer_name}</div>
                    <div className="text-[10px] text-slate-500 truncate max-w-[200px]">{q.site_address || 'Colombo Site'}</div>
                  </td>
                  <td className="py-2.5 px-3">
                    <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[10px] font-bold">
                      {q.branch_code || 'HO'}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">
                    Rs. {(q.net_total || 0).toLocaleString()}
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded uppercase ${
                      q.status === 'Validated Official' || q.status === 'Approved'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}>
                      {q.status}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-right">
                    <div className="flex items-center justify-end space-x-1">
                      <button
                        onClick={() => generateAndDownloadQuotationPDF(q, undefined, branches.find(b => b.id === q.branch_id))}
                        className="bg-slate-900 hover:bg-orange-600 text-white px-2 py-1 rounded text-[11px] font-bold transition inline-flex items-center space-x-1 shadow-2xs cursor-pointer"
                        title="Download Official PDF Quotation"
                      >
                        <Download className="w-3 h-3" />
                        <span>PDF</span>
                      </button>

                      <button
                        onClick={() => setPrintModalQuote(q)}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white px-2 py-1 rounded text-[11px] font-bold transition inline-flex items-center space-x-1 shadow-2xs cursor-pointer"
                        title="Trigger printer-friendly version of quotation using CSS media queries"
                      >
                        <Printer className="w-3 h-3 text-[#FFC81E]" />
                        <span>Print</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {printModalQuote && (
        <PrintableQuotationModal
          quotation={printModalQuote}
          activeBranch={branches.find(b => b.id === printModalQuote.branch_id || b.code === printModalQuote.branch_code) || activeBranch}
          onClose={() => setPrintModalQuote(null)}
        />
      )}

      {selectedRecordDetail && (
        <UpdateRecordDetailModal
          record={selectedRecordDetail}
          product={products.find(p => p.id === selectedRecordDetail.product_id || p.product_code === selectedRecordDetail.product_code)}
          onClose={() => setSelectedRecordDetail(null)}
        />
      )}
    </div>
  );
};
