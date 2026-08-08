import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Barcode1D } from './BarcodeGenerator';
import { 
  FileText, 
  Search, 
  Filter, 
  CheckCircle2, 
  Clock, 
  ShieldCheck, 
  AlertCircle, 
  XCircle,
  Printer, 
  Eye, 
  User, 
  Phone, 
  MapPin, 
  Building2, 
  Truck, 
  Layers, 
  ChevronRight, 
  X, 
  Calendar, 
  Tag, 
  Download, 
  FileSpreadsheet,
  RefreshCw,
  QrCode,
  DollarSign,
  ShoppingCart,
  Maximize2,
  Minimize2,
  LayoutGrid,
  List
} from 'lucide-react';
import { Quotation, Branch, QuotationItem } from '../types';
import { generateAndDownloadQuotationPDF } from '../utils/pdfExportEngine';
import { PrintableQuotationModal } from './PrintableQuotationModal';

// Dedicated Status Indicator Badge Component
export const QuotationStatusBadge: React.FC<{ status: string; isDark?: boolean; className?: string }> = ({ 
  status, 
  isDark = false,
  className = '' 
}) => {
  const normalized = (status || '').toLowerCase().trim();

  let badgeStyle = '';
  let icon = null;

  if (normalized.includes('validated') || normalized.includes('approved') || normalized.includes('verified') || normalized.includes('official')) {
    badgeStyle = isDark 
      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50 shadow-2xs' 
      : 'bg-emerald-50 text-emerald-800 border-emerald-300 shadow-2xs';
    icon = <ShieldCheck className="w-3 h-3 text-emerald-500 shrink-0" />;
  } else if (normalized.includes('pending') || normalized.includes('awaiting') || normalized.includes('review')) {
    badgeStyle = isDark 
      ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-2xs' 
      : 'bg-amber-50 text-amber-800 border-amber-300 shadow-2xs';
    icon = <Clock className="w-3 h-3 text-amber-500 shrink-0" />;
  } else if (normalized.includes('cancel') || normalized.includes('reject') || normalized.includes('void') || normalized.includes('decline')) {
    badgeStyle = isDark 
      ? 'bg-rose-500/20 text-rose-300 border-rose-500/50 shadow-2xs' 
      : 'bg-rose-50 text-rose-800 border-rose-300 shadow-2xs';
    icon = <XCircle className="w-3 h-3 text-rose-500 shrink-0" />;
  } else if (normalized.includes('draft') || normalized.includes('temp')) {
    badgeStyle = isDark 
      ? 'bg-blue-500/20 text-blue-300 border-blue-500/50 shadow-2xs' 
      : 'bg-blue-50 text-blue-800 border-blue-300 shadow-2xs';
    icon = <FileText className="w-3 h-3 text-blue-500 shrink-0" />;
  } else {
    badgeStyle = isDark 
      ? 'bg-slate-700 text-slate-200 border-slate-600' 
      : 'bg-slate-100 text-slate-800 border-slate-200';
    icon = <Tag className="w-3 h-3 text-slate-400 shrink-0" />;
  }

  return (
    <span className={`inline-flex items-center space-x-1 text-[10px] font-black px-2.5 py-0.5 rounded-full border uppercase tracking-wider ${badgeStyle} ${className}`}>
      {icon}
      <span>{status || 'Draft'}</span>
    </span>
  );
};

interface OrderManagementPortalProps {
  quotations: Quotation[];
  branches: Branch[];
  activeBranch: Branch;
  onValidateQuotation: (id: string, extRef?: string, notes?: string) => Promise<void>;
  onProceedToQuotation?: (item: QuotationItem) => void;
  onRefreshData?: () => void;
}

export const OrderManagementPortal: React.FC<OrderManagementPortalProps> = ({
  quotations,
  branches,
  activeBranch,
  onValidateQuotation,
  onProceedToQuotation,
  onRefreshData
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [branchFilter, setBranchFilter] = useState<string>('ALL');
  const [viewMode, setViewMode] = useState<'GRID' | 'TABLE'>('GRID');

  // Sync search filter from global search bar
  useEffect(() => {
    const handleFilterOrder = (e: any) => {
      if (e.detail?.query) {
        setSearchTerm(e.detail.query);
      }
    };
    window.addEventListener('innovista_search_filter_order', handleFilterOrder);
    return () => window.removeEventListener('innovista_search_filter_order', handleFilterOrder);
  }, []);
  
  // Selected Order for Detail Modal
  const [selectedOrder, setSelectedOrder] = useState<Quotation | null>(null);
  const [showPrintView, setShowPrintView] = useState(false);
  const [isOrderFullscreen, setIsOrderFullscreen] = useState(false);
  const [printModalQuote, setPrintModalQuote] = useState<Quotation | null>(null);

  // Validation Form State
  const [extRefInput, setExtRefInput] = useState('');
  const [validationNotesInput, setValidationNotesInput] = useState('');
  const [isValidating, setIsValidating] = useState(false);

  const isHO = activeBranch.code === 'HO';

  // Filtered orders
  const filteredOrders = quotations.filter((q) => {
    const matchesSearch = 
      q.quotation_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.customer_phone.includes(searchTerm) ||
      (q.site_address && q.site_address.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (q.notes && q.notes.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = 
      statusFilter === 'ALL' ? true :
      statusFilter === 'VALIDATED' ? (q.status === 'Validated Official' || q.status === 'Approved' || q.status === 'Verified Quote') :
      statusFilter === 'DRAFT' ? (q.status === 'Temporary Branch Draft' || q.status === 'Draft') :
      statusFilter === 'PENDING' ? (q.status === 'Pending HO Validation' || q.status === 'Pending Approval') :
      statusFilter === 'CANCELLED' ? (q.status === 'Cancelled' || q.status === 'Rejected' || q.status === 'Voided') : true;

    const matchesBranch = 
      branchFilter === 'ALL' ? true :
      q.branch_id === branchFilter || q.branch_code === branchFilter;

    return matchesSearch && matchesStatus && matchesBranch;
  });

  // Calculate Key Metrics
  const totalOrders = quotations.length;
  const validatedOrdersCount = quotations.filter(q => q.status === 'Validated Official' || q.status === 'Approved' || q.status === 'Verified Quote').length;
  const pendingValidationCount = quotations.filter(q => q.status === 'Pending HO Validation' || q.status === 'Pending Approval').length;
  const draftOrdersCount = quotations.filter(q => q.status === 'Temporary Branch Draft' || q.status === 'Draft').length;
  const cancelledOrdersCount = quotations.filter(q => q.status === 'Cancelled' || q.status === 'Rejected' || q.status === 'Voided').length;
  const totalRevenueLKR = quotations.reduce((acc, q) => acc + (q.net_total || 0), 0);

  const handleValidateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder) return;
    setIsValidating(true);
    try {
      await onValidateQuotation(selectedOrder.id, extRefInput, validationNotesInput);
      setSelectedOrder(prev => prev ? { 
        ...prev, 
        status: 'Validated Official', 
        validated_by: activeBranch.manager_name,
        validated_at: new Date().toISOString(),
        external_software_ref: extRefInput,
        validation_notes: validationNotesInput
      } : null);
      setExtRefInput('');
      setValidationNotesInput('');
    } catch (err) {
      console.error('Validation failed:', err);
    } finally {
      setIsValidating(false);
    }
  };

  // Export Orders & Quotations History to CSV Report
  const handleExportOrdersCSV = () => {
    const ordersToExport = filteredOrders.length > 0 ? filteredOrders : quotations;
    if (!ordersToExport || ordersToExport.length === 0) {
      alert('No order or quotation records available to export.');
      return;
    }

    const headers = [
      'Quotation / Order #',
      'Customer Name',
      'Customer Phone',
      'Branch Code',
      'Status',
      'Subtotal (LKR)',
      'Discount (LKR)',
      'Transport (LKR)',
      'Net Total (LKR)',
      'Site Address',
      'Created Date',
      'Validated By',
      'HO Ext Ref'
    ];

    const csvRows = [
      headers.join(','),
      ...ordersToExport.map(q => {
        const row = [
          `"${(q.quotation_number || '').replace(/"/g, '""')}"`,
          `"${(q.customer_name || '').replace(/"/g, '""')}"`,
          `"${(q.customer_phone || '').replace(/"/g, '""')}"`,
          `"${(q.branch_code || q.branch_id || '').replace(/"/g, '""')}"`,
          `"${(q.status || 'Draft').replace(/"/g, '""')}"`,
          q.subtotal || 0,
          q.discount_amount || 0,
          q.transport_cost || 0,
          q.net_total || 0,
          `"${(q.site_address || '').replace(/"/g, '""')}"`,
          `"${(q.created_at || '').replace(/"/g, '""')}"`,
          `"${(q.validated_by || '').replace(/"/g, '""')}"`,
          `"${(q.external_software_ref || '').replace(/"/g, '""')}"`
        ];
        return row.join(',');
      })
    ];

    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Order_Quotation_History_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* 1. PORTAL HEADER BANNER */}
      <div className="bg-white rounded-xl p-5 text-slate-900 shadow-xs border border-slate-200">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="bg-orange-500 text-white p-1.5 rounded-md text-xs font-bold uppercase tracking-wider">
                Order Hub
              </span>
              <h1 className="text-xl md:text-2xl font-black tracking-tight text-slate-900">
                Central Order Management & Saved Quotes Portal
              </h1>
            </div>
            <p className="text-xs text-slate-500 font-medium">
              Complete details, line-by-line material specifications, transport breakdowns & official HO validation.
            </p>
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            <button
              onClick={handleExportOrdersCSV}
              className="bg-emerald-600 hover:bg-emerald-700 text-white border border-emerald-600 px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center space-x-1.5 shadow-2xs cursor-pointer"
              title="Export Order & Quotation History to CSV spreadsheet"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Export to CSV</span>
            </button>

            {onRefreshData && (
              <button
                onClick={onRefreshData}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Refresh Orders</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 2. SUMMARY METRIC CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Total Saved Orders & Quotes
            </span>
            <strong className="text-xl font-black text-slate-900 font-mono">
              {totalOrders}
            </strong>
          </div>
          <div className="p-2.5 bg-blue-50 text-blue-600 rounded-lg">
            <FileText className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Validated Official Invoices
            </span>
            <strong className="text-xl font-black text-emerald-600 font-mono">
              {validatedOrdersCount}
            </strong>
          </div>
          <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-lg">
            <ShieldCheck className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Pending HO Validation
            </span>
            <strong className="text-xl font-black text-amber-600 font-mono">
              {pendingValidationCount}
            </strong>
          </div>
          <div className="p-2.5 bg-amber-50 text-amber-600 rounded-lg">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Cumulative Registered Volume
            </span>
            <strong className="text-xl font-black text-orange-600 font-mono">
              Rs. {totalRevenueLKR.toLocaleString()}
            </strong>
          </div>
          <div className="p-2.5 bg-orange-50 text-orange-600 rounded-lg">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* 3. SEARCH & FILTERS CONTROLS */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by Order #, Customer Name, Phone, Address..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-orange-500 font-medium text-slate-800"
          />
        </div>

        {/* Filter Pills / Selects & View Toggle */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Status Select */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 font-bold text-slate-700 focus:outline-none focus:border-orange-500 cursor-pointer"
          >
            <option value="ALL">All Statuses ({totalOrders})</option>
            <option value="VALIDATED">Validated / Official ({validatedOrdersCount})</option>
            <option value="PENDING">Pending Validation ({pendingValidationCount})</option>
            <option value="DRAFT">Branch Drafts ({draftOrdersCount})</option>
            <option value="CANCELLED">Cancelled / Rejected ({cancelledOrdersCount})</option>
          </select>

          {/* Branch Select */}
          <select
            value={branchFilter}
            onChange={(e) => setBranchFilter(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 font-bold text-slate-700 focus:outline-none focus:border-orange-500 cursor-pointer"
          >
            <option value="ALL">All Branches</option>
            {branches.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>

          {/* Export CSV Button */}
          <button
            type="button"
            onClick={handleExportOrdersCSV}
            className="bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 px-2.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center space-x-1 cursor-pointer"
            title="Download CSV report of filtered orders"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
            <span className="hidden sm:inline">CSV Report</span>
          </button>

          {/* View Mode Toggle */}
          <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200 shrink-0">
            <button
              type="button"
              onClick={() => setViewMode('GRID')}
              className={`px-2.5 py-1 rounded text-xs font-bold transition flex items-center space-x-1 cursor-pointer ${
                viewMode === 'GRID' ? 'bg-white text-orange-600 shadow-2xs font-extrabold' : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Card Grid View"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Grid</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('TABLE')}
              className={`px-2.5 py-1 rounded text-xs font-bold transition flex items-center space-x-1 cursor-pointer ${
                viewMode === 'TABLE' ? 'bg-white text-orange-600 shadow-2xs font-extrabold' : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Structured Table View"
            >
              <List className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Table</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4. ORDERS GRID / TABLE */}
      {filteredOrders.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center space-y-3">
          <FileText className="w-10 h-10 text-slate-300 mx-auto" />
          <h4 className="font-bold text-slate-700 text-sm">No Orders Found</h4>
          <p className="text-xs text-slate-400">
            No saved orders or quotes match your search filters.
          </p>
        </div>
      ) : viewMode === 'GRID' ? (
        /* GRID CARDS VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredOrders.map((order) => {
            const isPending = order.status === 'Pending HO Validation' || order.status === 'Pending Approval';

            return (
              <div
                key={order.id}
                className="bg-white border border-slate-200 hover:border-orange-500 rounded-xl overflow-hidden shadow-xs hover:shadow-md transition duration-200 flex flex-col justify-between"
              >
                {/* Header Header Bar */}
                <div className="p-3 bg-slate-900 text-white flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-xs font-black text-orange-400">
                      #{order.quotation_number}
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium">
                      {order.date}
                    </span>
                  </div>

                  <QuotationStatusBadge status={order.status} isDark={true} />
                </div>

                {/* Card Body */}
                <div className="p-3.5 space-y-3 grow">
                  {/* Customer Info */}
                  <div>
                    <h4 className="text-xs font-black text-slate-900 flex items-center space-x-1.5">
                      <User className="w-3.5 h-3.5 text-orange-500 shrink-0" />
                      <span className="truncate">{order.customer_name}</span>
                    </h4>
                    {order.customer_phone && (
                      <p className="text-[11px] text-slate-500 flex items-center space-x-1 mt-0.5 font-mono">
                        <Phone className="w-3 h-3 text-slate-400 shrink-0" />
                        <span>{order.customer_phone}</span>
                      </p>
                    )}
                    {order.site_address && (
                      <p className="text-[11px] text-slate-500 flex items-center space-x-1 mt-0.5 truncate">
                        <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                        <span className="truncate">{order.site_address}</span>
                      </p>
                    )}
                  </div>

                  {/* Branch & Created By */}
                  <div className="flex items-center justify-between text-[10px] text-slate-500 bg-slate-50 p-2 rounded border border-slate-200">
                    <div className="flex items-center space-x-1">
                      <Building2 className="w-3 h-3 text-slate-400" />
                      <span>{order.branch_name || 'Head Office'}</span>
                    </div>
                    {order.created_by && (
                      <span>Rep: <strong className="text-slate-700">{order.created_by}</strong></span>
                    )}
                  </div>

                  {/* Items summary */}
                  <div className="space-y-1">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">
                      Order Breakdown ({order.items.length} Line Items)
                    </span>
                    <div className="space-y-1 max-h-[85px] overflow-y-auto pr-1">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="text-[10px] flex items-center justify-between bg-white p-1 rounded border border-slate-100">
                          <span className="text-slate-800 font-semibold truncate max-w-[170px]">
                            {item.quantity}x {item.product_name}
                          </span>
                          <span className="font-mono text-slate-700">
                            Rs. {item.total_price.toLocaleString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Grand Net Total */}
                  <div className="bg-orange-50 p-2.5 rounded-lg border border-orange-200 flex items-center justify-between">
                    <div>
                      <span className="text-[9px] font-black text-orange-800 uppercase tracking-wider block">
                        Net Total Amount
                      </span>
                      <span className="text-xs text-slate-500">
                        {order.transport_cost > 0 ? `+ Rs. ${order.transport_cost.toLocaleString()} Transport` : 'Includes Delivery'}
                      </span>
                    </div>
                    <strong className="text-base font-black text-orange-600 font-mono">
                      Rs. {order.net_total.toLocaleString()}
                    </strong>
                  </div>
                </div>

                {/* Footer Action Bar */}
                <div className="p-2 bg-slate-50 border-t border-slate-200 flex items-center space-x-1.5">
                  <button
                    onClick={() => setSelectedOrder(order)}
                    className="flex-1 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs py-1.5 px-2 rounded flex items-center justify-center space-x-1 transition cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5 text-orange-400" />
                    <span>View Details</span>
                  </button>

                  <button
                    onClick={() => {
                      const orderBranch = branches.find(b => b.id === order.branch_id || b.code === order.branch_code) || activeBranch;
                      generateAndDownloadQuotationPDF(order, undefined, orderBranch);
                    }}
                    className="bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs py-1.5 px-2 rounded flex items-center space-x-1 transition shadow-2xs cursor-pointer"
                    title="Export Quotation PDF Document"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>PDF</span>
                  </button>

                  <button
                    onClick={() => setPrintModalQuote(order)}
                    className="bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs py-1.5 px-2 rounded flex items-center space-x-1 transition shadow-2xs cursor-pointer"
                    title="Trigger printer-friendly version of quotation using CSS media queries"
                  >
                    <Printer className="w-3.5 h-3.5 text-[#FFC81E]" />
                    <span>Print</span>
                  </button>

                  {isHO && isPending && (
                    <button
                      onClick={() => {
                        setSelectedOrder(order);
                      }}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-1.5 px-2 rounded flex items-center space-x-1 transition cursor-pointer"
                      title="Validate Official Invoice"
                    >
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Validate</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* STRUCTURED TABLE LIST VIEW */
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-900 text-white font-bold text-[10px] uppercase tracking-wider border-b border-slate-800">
                <tr>
                  <th className="p-3">Order / Quote #</th>
                  <th className="p-3">Customer Details</th>
                  <th className="p-3">Site / Location</th>
                  <th className="p-3">Branch</th>
                  <th className="p-3 text-center font-mono">Items</th>
                  <th className="p-3 text-right">Net Total Amount</th>
                  <th className="p-3 text-center">Status Indicator</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {filteredOrders.map((order) => {
                  const isPending = order.status === 'Pending HO Validation' || order.status === 'Pending Approval';
                  const orderBranch = branches.find(b => b.id === order.branch_id || b.code === order.branch_code) || activeBranch;

                  return (
                    <tr key={order.id} className="hover:bg-slate-50/80 transition">
                      <td className="p-3 font-mono">
                        <span className="font-black text-slate-900 text-xs block">
                          #{order.quotation_number}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {order.date}
                        </span>
                      </td>

                      <td className="p-3">
                        <div className="font-bold text-slate-900">{order.customer_name}</div>
                        {order.customer_phone && (
                          <div className="text-[10px] text-slate-500 font-mono">📞 {order.customer_phone}</div>
                        )}
                      </td>

                      <td className="p-3 text-slate-600 max-w-[180px] truncate">
                        <div className="truncate font-medium">{order.site_address || 'Site Unspecified'}</div>
                        {order.site_location_name && (
                          <div className="text-[10px] text-slate-400">📍 {order.site_location_name}</div>
                        )}
                      </td>

                      <td className="p-3 text-slate-700">
                        <span className="bg-slate-100 text-slate-800 text-[10px] font-bold px-2 py-0.5 rounded border border-slate-200">
                          {order.branch_name || 'Head Office'}
                        </span>
                      </td>

                      <td className="p-3 text-center font-mono font-bold text-slate-800">
                        {order.items?.length || 0} items
                      </td>

                      <td className="p-3 text-right font-mono font-black text-slate-900">
                        Rs. {(order.net_total || 0).toLocaleString()}
                      </td>

                      <td className="p-3 text-center">
                        <QuotationStatusBadge status={order.status} isDark={false} />
                      </td>

                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end space-x-1">
                          <button
                            onClick={() => setSelectedOrder(order)}
                            className="bg-slate-900 hover:bg-slate-800 text-white text-[11px] font-bold px-2.5 py-1 rounded flex items-center space-x-1 cursor-pointer transition"
                            title="View Details"
                          >
                            <Eye className="w-3 h-3 text-orange-400" />
                            <span>View</span>
                          </button>

                          <button
                            onClick={() => generateAndDownloadQuotationPDF(order, undefined, orderBranch)}
                            className="bg-orange-500 hover:bg-orange-600 text-white text-[11px] font-bold px-2 py-1 rounded cursor-pointer transition"
                            title="Download PDF"
                          >
                            <Download className="w-3 h-3" />
                          </button>

                          <button
                            onClick={() => setPrintModalQuote(order)}
                            className="bg-slate-800 hover:bg-slate-700 text-white text-[11px] font-bold px-2 py-1 rounded cursor-pointer transition"
                            title="Print"
                          >
                            <Printer className="w-3 h-3 text-[#FFC81E]" />
                          </button>

                          {isHO && isPending && (
                            <button
                              onClick={() => setSelectedOrder(order)}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold px-2 py-1 rounded flex items-center space-x-0.5 cursor-pointer transition"
                              title="Validate Invoice"
                            >
                              <ShieldCheck className="w-3 h-3" />
                              <span>Validate</span>
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

      {/* 5. FULL ORDER SPEC & RECEIPT MODAL */}
      {selectedOrder && (
        <div className={`fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center ${isOrderFullscreen ? 'p-0' : 'p-3 overflow-y-auto'}`}>
          <div className={`bg-white border border-slate-200 flex flex-col overflow-hidden transition-all duration-200 ${
            isOrderFullscreen 
              ? 'w-screen h-screen max-w-none max-h-none rounded-none' 
              : 'rounded-xl shadow-2xl max-w-4xl w-full max-h-[92vh]'
          }`}>
            {/* Modal Header */}
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center space-x-2">
                <FileText className="w-5 h-5 text-orange-400" />
                <div>
                  <h3 className="font-black text-base tracking-tight flex items-center space-x-2">
                    <span>{selectedOrder.quotation_number}</span>
                    <span className="text-xs font-mono text-slate-400 font-normal">
                      ({selectedOrder.quotation_type || 'Official Order'})
                    </span>
                  </h3>
                  <p className="text-[11px] text-slate-300">
                    Created on {selectedOrder.date} • Branch: {selectedOrder.branch_name}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-1.5">
                <button
                  onClick={() => setIsOrderFullscreen(!isOrderFullscreen)}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-2.5 py-1.5 rounded text-xs font-bold transition flex items-center space-x-1 cursor-pointer"
                  title={isOrderFullscreen ? "Exit Fullscreen" : "View in Fullscreen Mode"}
                >
                  {isOrderFullscreen ? <Minimize2 className="w-3.5 h-3.5 text-orange-400" /> : <Maximize2 className="w-3.5 h-3.5 text-orange-400" />}
                  <span>{isOrderFullscreen ? 'Exit' : 'Fullscreen'}</span>
                </button>

                <button
                  onClick={() => {
                    const orderBranch = branches.find(b => b.id === selectedOrder.branch_id || b.code === selectedOrder.branch_code) || activeBranch;
                    generateAndDownloadQuotationPDF(selectedOrder, undefined, orderBranch);
                  }}
                  className="bg-orange-500 hover:bg-orange-600 text-white px-2.5 py-1.5 rounded text-xs font-bold transition flex items-center space-x-1 shadow-2xs cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>PDF</span>
                </button>

                <button
                  onClick={() => setPrintModalQuote(selectedOrder)}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-2.5 py-1.5 rounded text-xs font-bold transition flex items-center space-x-1 cursor-pointer"
                  title="Trigger printer-friendly version of quotation using CSS media queries"
                >
                  <Printer className="w-3.5 h-3.5 text-[#FFC81E]" />
                  <span>Print</span>
                </button>

                <button
                  onClick={() => setShowPrintView(!showPrintView)}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-2.5 py-1.5 rounded text-xs font-bold transition flex items-center space-x-1 cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5 text-orange-400" />
                  <span>{showPrintView ? 'Specs' : 'Invoice'}</span>
                </button>

                <button
                  onClick={() => {
                    setSelectedOrder(null);
                    setIsOrderFullscreen(false);
                  }}
                  className="p-1 rounded text-slate-400 hover:text-white transition cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-5 overflow-y-auto grow text-slate-800">
              {showPrintView ? (
                /* Print Invoice View */
                <div className="bg-white border-2 border-slate-800 p-6 rounded-lg space-y-4 font-sans text-xs">
                  <div className="flex justify-between items-start border-b border-slate-300 pb-3">
                    <div>
                      <h2 className="text-xl font-black text-slate-900 tracking-tight">INNOVISTA ENTERPRISE</h2>
                      <p className="text-[10px] text-slate-600">Aluminium & Glass Systems • Head Office Central ERP</p>
                      <p className="text-[10px] text-slate-600">Colombo, Sri Lanka • Hotlines: +94 11 234 5678</p>
                    </div>
                    <div className="text-right flex flex-col items-end space-y-1">
                      <h3 className="text-lg font-black text-orange-600 uppercase">OFFICIAL INVOICE</h3>
                      <p className="font-mono text-xs font-bold">{selectedOrder.quotation_number}</p>
                      <p className="text-[10px] text-slate-500">Date: {selectedOrder.date}</p>
                      <div className="pt-1 flex items-center space-x-2">
                        <Barcode1D value={selectedOrder.barcode || selectedOrder.quotation_number} height={35} width={1.5} />
                        <div className="p-0.5 bg-white border border-slate-300 rounded">
                          <QRCodeSVG value={JSON.stringify({ order: selectedOrder.quotation_number, total: selectedOrder.net_total, customer: selectedOrder.customer_name })} size={40} />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 bg-slate-50 p-3 rounded border border-slate-200">
                    <div>
                      <span className="text-[9px] font-bold text-slate-400 uppercase">CUSTOMER DETAILS</span>
                      <h4 className="font-bold text-slate-900 text-xs">{selectedOrder.customer_name}</h4>
                      <p className="text-[11px] text-slate-600">{selectedOrder.customer_phone}</p>
                      <p className="text-[11px] text-slate-600">{selectedOrder.site_address}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-[9px] font-bold text-slate-400 uppercase">BRANCH & VALIDATION</span>
                      <p className="font-semibold text-slate-800">{selectedOrder.branch_name}</p>
                      <p className="text-[10px] text-slate-600">Status: <strong>{selectedOrder.status}</strong></p>
                      {selectedOrder.external_software_ref && (
                        <p className="text-[10px] font-mono text-emerald-700 font-bold">Ref: {selectedOrder.external_software_ref}</p>
                      )}
                    </div>
                  </div>

                  {/* Print Table */}
                  <table className="w-full text-left text-xs border border-slate-300 border-collapse">
                    <thead className="bg-slate-900 text-white uppercase text-[10px]">
                      <tr>
                        <th className="p-2 border border-slate-700">Item</th>
                        <th className="p-2 border border-slate-700 text-center">Unit</th>
                        <th className="p-2 border border-slate-700 text-center">Qty</th>
                        <th className="p-2 border border-slate-700 text-right">Unit Rate</th>
                        <th className="p-2 border border-slate-700 text-right">Total Price</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedOrder.items.map((item, idx) => (
                        <tr key={idx} className="border-b border-slate-200">
                          <td className="p-2 font-semibold">
                            {item.product_name} ({item.product_code})
                            {item.thickness_applied && <span className="text-[10px] text-slate-500 block">• Thickness: {item.thickness_applied}</span>}
                          </td>
                          <td className="p-2 text-center font-mono">{item.unit}</td>
                          <td className="p-2 text-center font-mono">{item.quantity}</td>
                          <td className="p-2 text-right font-mono">Rs. {item.unit_price.toLocaleString()}</td>
                          <td className="p-2 text-right font-mono font-bold">Rs. {item.total_price.toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  <div className="flex justify-end pt-2">
                    <div className="w-64 space-y-1 text-right font-mono text-xs">
                      <div className="flex justify-between text-slate-600">
                        <span>Materials Subtotal:</span>
                        <span>Rs. {(selectedOrder.material_subtotal || selectedOrder.items.reduce((a,b)=>a+b.total_price,0)).toLocaleString()}</span>
                      </div>
                      {selectedOrder.transport_cost > 0 && (
                        <div className="flex justify-between text-slate-600">
                          <span>Transport Charge:</span>
                          <span>Rs. {selectedOrder.transport_cost.toLocaleString()}</span>
                        </div>
                      )}
                      {selectedOrder.discount_amount > 0 && (
                        <div className="flex justify-between text-emerald-600">
                          <span>Special Discount:</span>
                          <span>- Rs. {selectedOrder.discount_amount.toLocaleString()}</span>
                        </div>
                      )}
                      <div className="flex justify-between font-black text-sm text-slate-900 pt-2 border-t border-slate-400">
                        <span>GRAND TOTAL:</span>
                        <span>Rs. {selectedOrder.net_total.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-200 text-center text-[10px] text-slate-500">
                    Thank you for doing business with INNOVISTA. Authorized Signature: ______________________
                  </div>
                </div>
              ) : (
                /* Full Spec Details View */
                <div className="space-y-4">
                  {/* Status & Barcode Header */}
                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center space-x-2">
                      <QuotationStatusBadge status={selectedOrder.status} isDark={false} />
                      {selectedOrder.barcode && (
                        <span className="font-mono text-xs bg-white px-2 py-0.5 rounded border border-slate-300 font-bold">
                          {selectedOrder.barcode}
                        </span>
                      )}
                    </div>

                    <div className="text-right text-[11px] font-mono text-slate-600">
                      <span>Valid Until: <strong>{selectedOrder.valid_until || '30 Days'}</strong></span>
                    </div>
                  </div>

                  {/* Customer & Delivery Box */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        Customer Account Details
                      </span>
                      <h4 className="font-bold text-slate-900 text-sm flex items-center space-x-1.5">
                        <User className="w-4 h-4 text-orange-600" />
                        <span>{selectedOrder.customer_name}</span>
                      </h4>
                      <p className="text-xs text-slate-600 flex items-center space-x-1 font-mono">
                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                        <span>{selectedOrder.customer_phone || 'No Contact Phone'}</span>
                      </p>
                    </div>

                    <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        Site & Delivery Address
                      </span>
                      <p className="text-xs text-slate-800 font-semibold flex items-start space-x-1.5">
                        <MapPin className="w-4 h-4 text-orange-600 shrink-0 mt-0.5" />
                        <span>{selectedOrder.site_address || 'Colombo Central Site'}</span>
                      </p>
                      <p className="text-[11px] text-slate-500">
                        Location Zone: <strong>{selectedOrder.site_location_name || 'Colombo Region'}</strong>
                      </p>
                    </div>
                  </div>

                  {/* Line Items Specification Breakdown */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center space-x-1">
                      <Layers className="w-4 h-4 text-orange-500" />
                      <span>Item Specifications & Line Breakdown ({selectedOrder.items.length} items)</span>
                    </h4>

                    <div className="border border-slate-200 rounded-lg overflow-hidden">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-900 text-white font-bold uppercase text-[10px]">
                          <tr>
                            <th className="p-2.5">Product</th>
                            <th className="p-2.5">Tech Specs</th>
                            <th className="p-2.5 text-center">Unit & Qty</th>
                            <th className="p-2.5 text-right">Unit Rate</th>
                            <th className="p-2.5 text-right">Total</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {selectedOrder.items.map((item, idx) => (
                            <tr key={idx} className="hover:bg-slate-50">
                              <td className="p-2.5">
                                <div className="font-bold text-slate-900">{item.product_name}</div>
                                <span className="font-mono text-[10px] text-orange-600">{item.product_code}</span>
                              </td>
                              <td className="p-2.5 text-[10px] text-slate-600 space-y-0.5">
                                {item.thickness_applied && <div>Gauge: <strong>{item.thickness_applied}</strong></div>}
                                {item.finish_applied && <div>Finish: <strong>{item.finish_applied}</strong></div>}
                                {item.glass_type_applied && <div>Glass: <strong>{item.glass_type_applied}</strong></div>}
                              </td>
                              <td className="p-2.5 text-center font-mono font-bold">
                                {item.quantity} {item.unit}
                              </td>
                              <td className="p-2.5 text-right font-mono text-slate-700">
                                Rs. {item.unit_price.toLocaleString()}
                              </td>
                              <td className="p-2.5 text-right font-mono font-bold text-slate-900">
                                Rs. {item.total_price.toLocaleString()}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Financial Summary Box */}
                  <div className="bg-slate-900 text-white p-4 rounded-xl space-y-2 font-mono text-xs">
                    <div className="flex justify-between text-slate-400">
                      <span>Materials Subtotal:</span>
                      <span>Rs. {(selectedOrder.material_subtotal || selectedOrder.items.reduce((a,b)=>a+b.total_price,0)).toLocaleString()}</span>
                    </div>

                    {selectedOrder.transport_cost > 0 && (
                      <div className="flex justify-between text-slate-400">
                        <span>Transport & Freight ({selectedOrder.site_location_name}):</span>
                        <span>+ Rs. {selectedOrder.transport_cost.toLocaleString()}</span>
                      </div>
                    )}

                    {selectedOrder.discount_amount > 0 && (
                      <div className="flex justify-between text-emerald-400">
                        <span>Special Customer Discount:</span>
                        <span>- Rs. {selectedOrder.discount_amount.toLocaleString()}</span>
                      </div>
                    )}

                    {selectedOrder.tax_amount > 0 && (
                      <div className="flex justify-between text-slate-400">
                        <span>VAT ({selectedOrder.tax_pct || 18}%):</span>
                        <span>+ Rs. {selectedOrder.tax_amount.toLocaleString()}</span>
                      </div>
                    )}

                    <div className="flex justify-between text-sm font-black text-orange-400 pt-2 border-t border-slate-800">
                      <span>GRAND TOTAL NET AMOUNT:</span>
                      <span>Rs. {selectedOrder.net_total.toLocaleString()}</span>
                    </div>
                  </div>

                  {/* HO Validation Section */}
                  {isHO && selectedOrder.status !== 'Validated Official' && (
                    <form onSubmit={handleValidateSubmit} className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl space-y-3">
                      <div className="flex items-center space-x-2 text-emerald-900 font-bold text-xs">
                        <ShieldCheck className="w-4 h-4 text-emerald-600" />
                        <span>Head Office Validation & Registration Engine</span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        <div>
                          <label className="text-[10px] font-bold text-emerald-800 uppercase block">
                            External ERP / SAP Reference #
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. SAP-2026-9901"
                            value={extRefInput}
                            onChange={(e) => setExtRefInput(e.target.value)}
                            className="w-full text-xs p-2 bg-white border border-emerald-300 rounded font-mono"
                          />
                        </div>

                        <div>
                          <label className="text-[10px] font-bold text-emerald-800 uppercase block">
                            Validation Approval Notes
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. Verified by Head Office Manager"
                            value={validationNotesInput}
                            onChange={(e) => setValidationNotesInput(e.target.value)}
                            className="w-full text-xs p-2 bg-white border border-emerald-300 rounded"
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={isValidating}
                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs py-2 rounded shadow transition flex items-center justify-center space-x-1.5"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>{isValidating ? 'Validating...' : 'Approve & Issue Official Validated Invoice'}</span>
                      </button>
                    </form>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {printModalQuote && (
        <PrintableQuotationModal
          quotation={printModalQuote}
          activeBranch={branches.find(b => b.id === printModalQuote.branch_id || b.code === printModalQuote.branch_code) || activeBranch}
          onClose={() => setPrintModalQuote(null)}
        />
      )}
    </div>
  );
};
