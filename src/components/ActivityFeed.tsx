import React, { useState, useMemo } from 'react';
import { 
  Activity, 
  Clock, 
  Tag, 
  MapPin, 
  User, 
  ChevronRight, 
  Search, 
  Filter, 
  ShieldCheck, 
  ArrowUpRight,
  Sparkles,
  FileText,
  DollarSign,
  Percent,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { 
  PriceHistory, 
  Branch, 
  SystemUser, 
  Quotation, 
  RealTimeEvent, 
  DiscountApprovalRequest,
  Product
} from '../types';

export interface ActivityFeedItem {
  id: string;
  timestamp: string;
  rawDate: Date;
  title: string;
  description: string;
  badgeType: 'PRICE_UPDATED' | 'DISCOUNT_APPROVED' | 'NEW_QUOTATION' | 'REGIONAL_OVERRIDE' | 'STATUS_CHANGED' | 'SYSTEM_EVENT';
  badgeLabel: string;
  badgeColorClass: string;
  branchName?: string;
  regionName?: string;
  performedBy?: string;
  record?: PriceHistory | null;
  quotationId?: string;
  productId?: string;
  productCode?: string;
  targetModule?: string;
}

interface ActivityFeedProps {
  priceHistory?: PriceHistory[];
  quotations?: Quotation[];
  events?: RealTimeEvent[];
  discountRequests?: DiscountApprovalRequest[];
  products?: Product[];
  activeBranch: Branch;
  currentUser?: SystemUser | null;
  onSelectRecordDetail: (record: PriceHistory) => void;
  onNavigateToTab: (tabId: string) => void;
}

export const ActivityFeed: React.FC<ActivityFeedProps> = ({
  priceHistory = [],
  quotations = [],
  events = [],
  discountRequests = [],
  products = [],
  activeBranch,
  currentUser,
  onSelectRecordDetail,
  onNavigateToTab
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [badgeFilter, setBadgeFilter] = useState<string>('ALL');

  // Determine if logged-in user or active branch is Super Admin / Head Office
  const isSuperAdmin = useMemo(() => {
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

  const currentRegion = activeBranch.region || activeBranch.name;
  const currentBranchCode = activeBranch.code;

  // Build unified feed items
  const rawFeedItems = useMemo(() => {
    const items: ActivityFeedItem[] = [];

    // 1. Price History / Regional Override Records
    priceHistory.forEach((ph) => {
      const isRegional = ph.update_type === 'REGIONAL_OVERRIDE' || ph.region_affected;
      const isStatusUpdate = ph.update_type === 'STATUS_CHANGE';

      let badgeType: ActivityFeedItem['badgeType'] = 'PRICE_UPDATED';
      let badgeLabel = 'Price Updated';
      let badgeColorClass = 'bg-emerald-100 text-emerald-800 border-emerald-300';

      if (isRegional) {
        badgeType = 'REGIONAL_OVERRIDE';
        badgeLabel = 'Regional Price';
        badgeColorClass = 'bg-indigo-100 text-indigo-800 border-indigo-300';
      } else if (isStatusUpdate) {
        badgeType = 'STATUS_CHANGED';
        badgeLabel = 'Status Updated';
        badgeColorClass = 'bg-amber-100 text-amber-800 border-amber-300';
      }

      const dateStr = ph.changed_date || '';
      const rawD = dateStr ? new Date(dateStr.replace(/-/g, '/')) : new Date();

      items.push({
        id: `ph-${ph.id}`,
        timestamp: dateStr || 'Recently',
        rawDate: isNaN(rawD.getTime()) ? new Date() : rawD,
        title: `${ph.product_code || 'PROD'} - ${ph.product_name || 'Item'}`,
        description: `${ph.reason || 'Price adjustment'} (Rs. ${(ph.old_price || 0).toLocaleString()} → Rs. ${(ph.new_price || 0).toLocaleString()})`,
        badgeType,
        badgeLabel,
        badgeColorClass,
        branchName: ph.branch_affected || 'All Branches',
        regionName: ph.region_affected || 'Master DB',
        performedBy: ph.changed_by || 'System',
        record: ph,
        productId: ph.product_id,
        productCode: ph.product_code,
        targetModule: 'master-prices'
      });
    });

    // 2. Quotations Feed
    quotations.forEach((q) => {
      const dateStr = q.created_at || q.date || '';
      const rawD = dateStr ? new Date(dateStr.replace(/-/g, '/')) : new Date();
      const itemCount = (q.items || []).length;
      const totalVal = q.net_total || q.total_amount || 0;

      items.push({
        id: `q-${q.id}`,
        timestamp: dateStr || 'Recently',
        rawDate: isNaN(rawD.getTime()) ? new Date() : rawD,
        title: `Quotation ${q.quotation_number || 'QT-000'} - ${q.customer_name || 'Client'}`,
        description: `${itemCount} item(s) · Total Rs. ${totalVal.toLocaleString()} · Status: ${q.status || 'Draft'}`,
        badgeType: 'NEW_QUOTATION',
        badgeLabel: 'New Quotation',
        badgeColorClass: 'bg-sky-100 text-sky-800 border-sky-300',
        branchName: q.branch_name || 'Head Office',
        regionName: q.branch_name,
        performedBy: q.created_by || 'Sales Executive',
        quotationId: q.id,
        targetModule: 'order-management'
      });
    });

    // 3. Discount Requests
    discountRequests.forEach((dr) => {
      const isApproved = dr.status === 'Approved';
      const dateStr = dr.created_at || '';
      const rawD = dateStr ? new Date(dateStr.replace(/-/g, '/')) : new Date();

      items.push({
        id: `dr-${dr.id}`,
        timestamp: dateStr || 'Recently',
        rawDate: isNaN(rawD.getTime()) ? new Date() : rawD,
        title: `Discount Request - ${dr.customer_name || 'Customer'}`,
        description: `${dr.discount_pct || 0}% Discount requested for ${dr.product_name || 'Quotation'} (${dr.reason || 'Special terms'})`,
        badgeType: 'DISCOUNT_APPROVED',
        badgeLabel: isApproved ? 'Discount Approved' : 'Discount Pending',
        badgeColorClass: isApproved ? 'bg-purple-100 text-purple-800 border-purple-300' : 'bg-amber-100 text-amber-800 border-amber-300',
        branchName: dr.branch_name,
        regionName: dr.branch_name,
        performedBy: dr.requested_by,
        targetModule: 'master-prices'
      });
    });

    // 4. RealTime System Events
    events.forEach((ev) => {
      const dateStr = ev.timestamp || '';
      const rawD = dateStr ? new Date(dateStr.replace(/-/g, '/')) : new Date();

      items.push({
        id: `ev-${ev.id}`,
        timestamp: dateStr || 'Recently',
        rawDate: isNaN(rawD.getTime()) ? new Date() : rawD,
        title: (ev.event_type || 'SYSTEM_EVENT').replace(/_/g, ' '),
        description: ev.details || 'System activity notification',
        badgeType: 'SYSTEM_EVENT',
        badgeLabel: 'System Event',
        badgeColorClass: 'bg-slate-100 text-slate-800 border-slate-300',
        branchName: ev.branch_name || 'Head Office',
        regionName: ev.region_name,
        performedBy: ev.user_name || 'System Auto',
        targetModule: 'master-prices'
      });
    });

    // Sort by Date descending
    return items.sort((a, b) => {
      const timeA = isNaN(a.rawDate.getTime()) ? 0 : a.rawDate.getTime();
      const timeB = isNaN(b.rawDate.getTime()) ? 0 : b.rawDate.getTime();
      return timeB - timeA;
    });
  }, [priceHistory, quotations, discountRequests, events]);

  // Branch & Region Scope Filtering
  const scopedFeedItems = useMemo(() => {
    if (isSuperAdmin) {
      return rawFeedItems;
    }

    const branchNameLower = (activeBranch.name || '').toLowerCase();
    const branchCodeLower = (currentBranchCode || '').toLowerCase();
    const regionLower = (currentRegion || '').toLowerCase();

    return rawFeedItems.filter((item) => {
      const itemBranch = (item.branchName || '').toLowerCase();
      const itemRegion = (item.regionName || '').toLowerCase();

      // Master or Global updates
      const isGlobal =
        itemBranch.includes('all branch') ||
        itemBranch.includes('master db') ||
        itemRegion.includes('all region') ||
        itemRegion.includes('head office') ||
        !item.branchName;

      if (isGlobal) return true;

      // Match user's branch or region
      const matchBranch = itemBranch.includes(branchNameLower) || (branchCodeLower && itemBranch.includes(branchCodeLower));
      const matchRegion = regionLower && itemRegion.includes(regionLower);

      return matchBranch || matchRegion;
    });
  }, [rawFeedItems, isSuperAdmin, activeBranch, currentBranchCode, currentRegion]);

  // Apply Search & Badge Filter
  const filteredItems = useMemo(() => {
    return scopedFeedItems.filter((item) => {
      // Badge filter
      if (badgeFilter !== 'ALL' && item.badgeType !== badgeFilter) {
        return false;
      }

      // Search term
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        const inTitle = item.title.toLowerCase().includes(term);
        const inDesc = item.description.toLowerCase().includes(term);
        const inBy = (item.performedBy || '').toLowerCase().includes(term);
        const inBranch = (item.branchName || '').toLowerCase().includes(term);
        return inTitle || inDesc || inBy || inBranch;
      }

      return true;
    });
  }, [scopedFeedItems, badgeFilter, searchTerm]);

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 bg-orange-50 border border-orange-200 rounded-xl text-orange-600">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
              <span>Live System Activity Feed</span>
              <span className="bg-orange-100 text-orange-800 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full">
                {filteredItems.length} Events
              </span>
            </h3>
            <p className="text-xs text-slate-500">
              Real-time audit log of price revisions, approval requests, and regional branch events.
            </p>
          </div>
        </div>

        {/* Scope Pill */}
        <div className="flex items-center space-x-2 shrink-0">
          {isSuperAdmin ? (
            <span className="inline-flex items-center space-x-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold px-3 py-1 rounded-full">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Global View (Super Admin)</span>
            </span>
          ) : (
            <span className="inline-flex items-center space-x-1.5 bg-indigo-50 text-indigo-800 border border-indigo-200 text-xs font-bold px-3 py-1 rounded-full">
              <MapPin className="w-3.5 h-3.5 text-indigo-600" />
              <span>Filtered: {activeBranch.name}</span>
            </span>
          )}
        </div>
      </div>

      {/* Toolbar & Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3 bg-slate-50 p-2.5 rounded-xl border border-slate-200/80">
        <div className="relative flex-1">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search activity by title, user, branch..."
            className="w-full bg-white border border-slate-200 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-orange-500"
          />
        </div>

        {/* Badge Filter Dropdown */}
        <div className="flex items-center space-x-2 sm:w-56">
          <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <select
            value={badgeFilter}
            onChange={(e) => setBadgeFilter(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-orange-500 font-medium"
          >
            <option value="ALL">All Event Types</option>
            <option value="PRICE_UPDATED">Price Updated</option>
            <option value="REGIONAL_OVERRIDE">Regional Override</option>
            <option value="NEW_QUOTATION">New Quotation</option>
            <option value="DISCOUNT_APPROVED">Discount Approved</option>
            <option value="STATUS_CHANGED">Status Changed</option>
            <option value="SYSTEM_EVENT">System Events</option>
          </select>
        </div>
      </div>

      {/* Activity Timeline Feed Items */}
      <div className="space-y-2.5 max-h-[420px] overflow-y-auto pr-1">
        {filteredItems.length === 0 ? (
          <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200 text-slate-500">
            <AlertCircle className="w-6 h-6 text-slate-400 mx-auto mb-2" />
            <p className="font-semibold text-slate-700">No activity feed records match your current branch or filter.</p>
            <p className="text-xs text-slate-400 mt-0.5">Activities update automatically when price changes or quotations occur.</p>
          </div>
        ) : (
          filteredItems.map((item) => (
            <div
              key={item.id}
              onClick={() => {
                if (item.record) {
                  onSelectRecordDetail(item.record);
                } else if (item.targetModule) {
                  onNavigateToTab(item.targetModule);
                }
              }}
              className="group flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 bg-white hover:bg-orange-50/40 border border-slate-200/80 rounded-xl transition cursor-pointer gap-3"
            >
              <div className="flex items-start space-x-3">
                {/* Status Badge Chip */}
                <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border shrink-0 inline-flex items-center space-x-1 ${item.badgeColorClass}`}>
                  <span>{item.badgeLabel}</span>
                </span>

                <div className="space-y-0.5">
                  <div className="flex items-center space-x-2">
                    <h4 className="text-xs font-bold text-slate-900 group-hover:text-orange-600 transition">
                      {item.title}
                    </h4>
                    {item.targetModule && (
                      <ArrowUpRight className="w-3 h-3 text-slate-400 group-hover:text-orange-600 opacity-0 group-hover:opacity-100 transition" />
                    )}
                  </div>
                  <p className="text-xs text-slate-600 font-medium">
                    {item.description}
                  </p>
                  <div className="flex items-center space-x-3 text-[11px] text-slate-400 pt-0.5">
                    <span className="flex items-center space-x-1">
                      <Clock className="w-3 h-3 text-slate-400" />
                      <span>{item.timestamp}</span>
                    </span>
                    {item.branchName && (
                      <span className="flex items-center space-x-1 font-medium text-slate-500">
                        <MapPin className="w-3 h-3 text-orange-500" />
                        <span>{item.branchName}</span>
                      </span>
                    )}
                    {item.performedBy && (
                      <span className="flex items-center space-x-1">
                        <User className="w-3 h-3 text-slate-400" />
                        <span>{item.performedBy}</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Indicator Link */}
              <div className="self-end sm:self-center shrink-0">
                <button
                  type="button"
                  className="bg-slate-100 group-hover:bg-orange-500 group-hover:text-white text-slate-700 font-bold px-2.5 py-1 rounded-lg text-xs transition inline-flex items-center space-x-1"
                >
                  <span>View Details</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
