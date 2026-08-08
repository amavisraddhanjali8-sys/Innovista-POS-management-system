import React, { useState, useEffect } from 'react';
import { 
  Users, 
  UserPlus, 
  Search, 
  Filter, 
  Building2, 
  Phone, 
  Mail, 
  MapPin, 
  Percent, 
  Tag, 
  DollarSign, 
  FileText, 
  Edit3, 
  Trash2, 
  Plus, 
  CheckCircle2, 
  X, 
  Layers, 
  ShieldCheck,
  ChevronRight,
  UserCheck,
  Maximize2,
  Minimize2,
  CheckSquare,
  Square,
  Sliders,
  Eye,
  Check
} from 'lucide-react';
import { Customer, CustomerType, CustomerPriceOverride, Product, Quotation } from '../types';

interface CustomerManagementPortalProps {
  customers: Customer[];
  products: Product[];
  quotations: Quotation[];
  customerPrices: CustomerPriceOverride[];
  onAddCustomer: (cust: Partial<Customer>) => Promise<Customer>;
  onUpdateCustomer: (id: string, cust: Partial<Customer>) => Promise<Customer>;
  onDeleteCustomer: (id: string) => Promise<void>;
  onCreateCustomerOverride: (rule: Partial<CustomerPriceOverride>) => Promise<void>;
  onDeleteCustomerOverride: (id: string) => Promise<void>;
}

export const CustomerManagementPortal: React.FC<CustomerManagementPortalProps> = ({
  customers,
  products,
  quotations,
  customerPrices,
  onAddCustomer,
  onUpdateCustomer,
  onDeleteCustomer,
  onCreateCustomerOverride,
  onDeleteCustomerOverride
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');

  // Sync search filter from global search bar
  useEffect(() => {
    const handleFilterCustomer = (e: any) => {
      if (e.detail?.query) {
        setSearchTerm(e.detail.query);
      }
    };
    window.addEventListener('innovista_search_filter_customer', handleFilterCustomer);
    return () => window.removeEventListener('innovista_search_filter_customer', handleFilterCustomer);
  }, []);
  
  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [contractCustomer, setContractCustomer] = useState<Customer | null>(null); // For Special Pricing Tier Modal
  const [historyCustomer, setHistoryCustomer] = useState<Customer | null>(null); // For Order History Modal

  // Customer Form State
  const [formName, setFormName] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formAddress, setFormAddress] = useState('');
  const [formDistrict, setFormDistrict] = useState('Colombo');
  const [formCustomerType, setFormCustomerType] = useState<CustomerType>('Company');
  const [formTaxId, setFormTaxId] = useState('');
  const [formDiscountTierPct, setFormDiscountTierPct] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Special Contract Rate Form State
  const [isContractFullscreen, setIsContractFullscreen] = useState(true);
  const [contractSearchTerm, setContractSearchTerm] = useState('');
  const [contractCategoryFilter, setContractCategoryFilter] = useState('ALL');
  const [selectedProdIds, setSelectedProdIds] = useState<string[]>([]);
  const [contractMode, setContractMode] = useState<'fixed_price' | 'discount_pct'>('discount_pct');
  const [contractValue, setContractValue] = useState<number>(10);
  const [quantityTiers, setQuantityTiers] = useState<{ id: string; min_qty: number; max_qty: number; unit_price: number; label: string }[]>([
    { id: '1', min_qty: 1, max_qty: 50, unit_price: 0, label: 'Tier 1: Standard Order (1-50 Qty)' },
    { id: '2', min_qty: 51, max_qty: 200, unit_price: 0, label: 'Tier 2: Bulk Volume (51-200 Qty)' },
  ]);
  const [effectiveFrom, setEffectiveFrom] = useState('');
  const [effectiveTo, setEffectiveTo] = useState('');
  const [isBulkApplying, setIsBulkApplying] = useState(false);

  // Toggle Product Selection
  const toggleSelectProduct = (prodId: string) => {
    setSelectedProdIds(prev => 
      prev.includes(prodId) ? prev.filter(id => id !== prodId) : [...prev, prodId]
    );
  };

  // Add Quantity Tier Row
  const handleAddQuantityTierRow = () => {
    const nextMin = quantityTiers.length > 0 ? quantityTiers[quantityTiers.length - 1].max_qty + 1 : 1;
    setQuantityTiers(prev => [
      ...prev,
      {
        id: Date.now().toString(),
        min_qty: nextMin,
        max_qty: nextMin + 100,
        unit_price: 0,
        label: `Tier ${prev.length + 1}: High Volume (${nextMin}+ Qty)`
      }
    ]);
  };

  // Remove Quantity Tier Row
  const handleRemoveQuantityTierRow = (tierId: string) => {
    setQuantityTiers(prev => prev.filter(t => t.id !== tierId));
  };

  // Submit Multi-Product Contract Pricing Setup
  const handleApplyContractPrices = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!contractCustomer || selectedProdIds.length === 0) return;

    setIsBulkApplying(true);
    try {
      for (const prodId of selectedProdIds) {
        const prod = products.find(p => p.id === prodId || p.product_code === prodId);
        if (!prod) continue;

        const baseP = prod.base_price || prod.current_price;
        const calculatedSpecialPrice = contractMode === 'discount_pct' 
          ? Math.round(baseP * (1 - (contractValue / 100))) 
          : Number(contractValue);

        // Build quantity tiers
        const formattedTiers = quantityTiers.map(qt => ({
          id: qt.id,
          min_qty: qt.min_qty,
          max_qty: qt.max_qty,
          unit_price: qt.unit_price > 0 ? qt.unit_price : Math.round(calculatedSpecialPrice * (qt.min_qty > 100 ? 0.95 : 0.98)),
          label: qt.label
        }));

        await onCreateCustomerOverride({
          customer_id: contractCustomer.id,
          customer_name: contractCustomer.name,
          product_id: prod.id,
          product_code: prod.product_code,
          product_name: prod.product_name,
          special_price: calculatedSpecialPrice,
          discount_pct: contractMode === 'discount_pct' ? contractValue : undefined,
          contract_mode: contractMode,
          quantity_tiers: formattedTiers,
          effective_from: effectiveFrom || new Date().toISOString().split('T')[0],
          effective_to: effectiveTo || ''
        });
      }

      // Reset selection
      setSelectedProdIds([]);
    } catch (err) {
      console.error('Failed to apply contract rates:', err);
    } finally {
      setIsBulkApplying(false);
    }
  };

  // Filtered Customers
  const filteredCustomers = customers.filter((c) => {
    const matchesSearch = 
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.phone.includes(searchTerm) ||
      (c.email && c.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (c.tax_id && c.tax_id.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesType = typeFilter === 'ALL' ? true : c.customer_type === typeFilter;

    return matchesSearch && matchesType;
  });

  // Calculate Metrics
  const totalCustomers = customers.length;
  const corporateClientsCount = customers.filter(c => c.customer_type === 'Company' || c.customer_type === 'Government' || c.customer_type === 'Hotel').length;
  const developersCount = customers.filter(c => c.customer_type === 'Developer' || c.customer_type === 'Architect' || c.customer_type === 'Apartment Builder').length;
  const avgDiscount = totalCustomers > 0 ? (customers.reduce((a, b) => a + (b.discount_tier_pct || 0), 0) / totalCustomers).toFixed(1) : '0.0';

  // Open Create Modal
  const handleOpenCreate = () => {
    setEditingCustomer(null);
    setFormName('');
    setFormPhone('');
    setFormEmail('');
    setFormAddress('');
    setFormDistrict('Colombo');
    setFormCustomerType('Company');
    setFormTaxId('');
    setFormDiscountTierPct(0);
    setShowAddModal(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (c: Customer) => {
    setEditingCustomer(c);
    setFormName(c.name);
    setFormPhone(c.phone);
    setFormEmail(c.email || '');
    setFormAddress(c.address || '');
    setFormDistrict(c.district_region || 'Colombo');
    setFormCustomerType(c.customer_type || 'Company');
    setFormTaxId(c.tax_id || '');
    setFormDiscountTierPct(c.discount_tier_pct || 0);
    setShowAddModal(true);
  };

  // Submit Add/Edit Customer
  const handleSubmitCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formPhone.trim()) return;

    setIsSubmitting(true);
    try {
      const payload: Partial<Customer> = {
        name: formName.trim(),
        phone: formPhone.trim(),
        email: formEmail.trim(),
        address: formAddress.trim(),
        district_region: formDistrict,
        customer_type: formCustomerType,
        tax_id: formTaxId.trim(),
        discount_tier_pct: Number(formDiscountTierPct) || 0
      };

      if (editingCustomer) {
        await onUpdateCustomer(editingCustomer.id, payload);
      } else {
        await onAddCustomer(payload);
      }

      setShowAddModal(false);
    } catch (err) {
      console.error('Failed to save customer:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. PORTAL HEADER BANNER */}
      <div className="bg-white rounded-xl p-5 text-slate-900 shadow-xs border border-slate-200">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="bg-orange-500 text-white p-1.5 rounded-md text-xs font-bold uppercase tracking-wider">
                Client Portal
              </span>
              <h1 className="text-xl md:text-2xl font-black tracking-tight text-slate-900">
                Customer Management & Automatic Discount Tiers
              </h1>
            </div>
            <p className="text-xs text-slate-500 font-medium">
              Register clients, manage profiles, setup custom discount tiers and product contract pricing rules.
            </p>
          </div>

          <button
            onClick={handleOpenCreate}
            className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-extrabold text-xs transition shadow-md flex items-center space-x-2 shrink-0"
          >
            <UserPlus className="w-4 h-4" />
            <span>+ Register New Customer</span>
          </button>
        </div>
      </div>

      {/* 2. SUMMARY METRIC CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Registered Customers
            </span>
            <strong className="text-xl font-black text-slate-900 font-mono">
              {totalCustomers}
            </strong>
          </div>
          <div className="p-2.5 bg-blue-50 text-blue-600 rounded-lg">
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Corporate & Government
            </span>
            <strong className="text-xl font-black text-emerald-600 font-mono">
              {corporateClientsCount}
            </strong>
          </div>
          <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-lg">
            <Building2 className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Developers & Architects
            </span>
            <strong className="text-xl font-black text-indigo-600 font-mono">
              {developersCount}
            </strong>
          </div>
          <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-lg">
            <UserCheck className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Avg Discount Tier %
            </span>
            <strong className="text-xl font-black text-orange-600 font-mono">
              {avgDiscount}%
            </strong>
          </div>
          <div className="p-2.5 bg-orange-50 text-orange-600 rounded-lg">
            <Percent className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* 3. SEARCH & FILTERS */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search customer by name, phone, email, tax ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-orange-500 font-medium text-slate-800"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 font-bold text-slate-700 focus:outline-none focus:border-orange-500"
          >
            <option value="ALL">All Customer Types</option>
            <option value="Company">Company / Corporate</option>
            <option value="Developer">Developer</option>
            <option value="Architect">Architect</option>
            <option value="Retail Customer">Retail Customer</option>
            <option value="Government">Government</option>
            <option value="Dealer">Dealer / Distributor</option>
          </select>
        </div>
      </div>

      {/* 4. CUSTOMER CARDS GRID */}
      {filteredCustomers.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center space-y-3">
          <Users className="w-10 h-10 text-slate-300 mx-auto" />
          <h4 className="font-bold text-slate-700 text-sm">No Customers Registered</h4>
          <p className="text-xs text-slate-400">
            Click "+ Register New Customer" to manually add a client profile and discount tier.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCustomers.map((cust) => {
            // Count custom special contract rates for this customer
            const customRatesCount = customerPrices.filter(
              cp => cp.customer_name.toLowerCase().trim() === cust.name.toLowerCase().trim()
            ).length;

            // Count orders for this customer
            const custOrders = quotations.filter(
              q => q.customer_name.toLowerCase().trim() === cust.name.toLowerCase().trim()
            );

            return (
              <div
                key={cust.id}
                className="bg-white border border-slate-200 hover:border-orange-500 rounded-xl overflow-hidden shadow-xs hover:shadow-md transition duration-200 flex flex-col justify-between"
              >
                {/* Header Header */}
                <div className="p-3 bg-slate-900 text-white flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-7 h-7 rounded-full bg-orange-500 text-white font-black text-xs flex items-center justify-center">
                      {cust.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-white line-clamp-1">{cust.name}</h4>
                      <span className="text-[9px] text-slate-400 uppercase font-medium">{cust.customer_type}</span>
                    </div>
                  </div>

                  {cust.discount_tier_pct ? (
                    <span className="text-[10px] font-black text-emerald-300 bg-emerald-900/60 px-2 py-0.5 rounded border border-emerald-500/40">
                      🎯 {cust.discount_tier_pct}% Tier
                    </span>
                  ) : (
                    <span className="text-[9px] text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
                      Standard
                    </span>
                  )}
                </div>

                {/* Body Details */}
                <div className="p-3.5 space-y-2.5 grow text-slate-700 text-xs">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-1.5 text-slate-800 font-mono text-[11px]">
                      <Phone className="w-3.5 h-3.5 text-orange-500 shrink-0" />
                      <span>{cust.phone}</span>
                    </div>

                    {cust.email && (
                      <div className="flex items-center space-x-1.5 text-slate-600 text-[11px] truncate">
                        <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{cust.email}</span>
                      </div>
                    )}

                    {cust.address && (
                      <div className="flex items-start space-x-1.5 text-slate-600 text-[11px]">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                        <span className="line-clamp-2">{cust.address} ({cust.district_region})</span>
                      </div>
                    )}
                  </div>

                  {/* Badges / Extras */}
                  <div className="flex flex-wrap gap-1.5 pt-1 text-[10px]">
                    {cust.tax_id && (
                      <span className="bg-slate-100 text-slate-700 font-mono px-2 py-0.5 rounded border border-slate-200">
                        VAT/TAX: <strong>{cust.tax_id}</strong>
                      </span>
                    )}

                    <span className="bg-blue-50 text-blue-800 px-2 py-0.5 rounded border border-blue-200 font-bold">
                      {customRatesCount} Custom Price Rules
                    </span>

                    <span className="bg-orange-50 text-orange-800 px-2 py-0.5 rounded border border-orange-200 font-bold">
                      {custOrders.length} Saved Orders
                    </span>
                  </div>
                </div>

                {/* Footer Action Bar */}
                <div className="p-2 bg-slate-50 border-t border-slate-200 flex items-center gap-1">
                  <button
                    onClick={() => handleOpenEdit(cust)}
                    className="p-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded font-bold text-[10px] transition flex items-center justify-center space-x-1"
                    title="Edit Customer Profile"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-slate-600" />
                    <span>Edit</span>
                  </button>

                  <button
                    onClick={() => setContractCustomer(cust)}
                    className="flex-1 bg-orange-500 hover:bg-orange-600 text-white font-extrabold text-[10px] py-1.5 px-2 rounded transition shadow-2xs flex items-center justify-center space-x-1"
                    title="Setup Custom Price Rules"
                  >
                    <Tag className="w-3.5 h-3.5" />
                    <span>Setup Contract Rates</span>
                  </button>

                  <button
                    onClick={() => setHistoryCustomer(cust)}
                    className="p-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded font-bold text-[10px] transition flex items-center justify-center space-x-1"
                    title="View Customer Order History"
                  >
                    <FileText className="w-3.5 h-3.5 text-orange-400" />
                  </button>

                  <button
                    onClick={async () => {
                      await onDeleteCustomer(cust.id);
                    }}
                    className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 rounded transition"
                    title="Delete Customer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 5. ADD / EDIT CUSTOMER MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-3">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden">
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <UserPlus className="w-5 h-5 text-orange-400" />
                <h3 className="font-black text-base">
                  {editingCustomer ? 'Edit Customer Profile' : 'Register New Customer'}
                </h3>
              </div>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitCustomer} className="p-5 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block">Customer / Business Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Access Engineering PLC"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded font-semibold focus:outline-none focus:border-orange-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block">Phone Number *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. +94 77 123 4567"
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded font-mono focus:outline-none focus:border-orange-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block">Email Address</label>
                  <input
                    type="email"
                    placeholder="e.g. procurement@access.lk"
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded focus:outline-none focus:border-orange-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block">Customer Category Type</label>
                  <select
                    value={formCustomerType}
                    onChange={(e) => setFormCustomerType(e.target.value as CustomerType)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded font-semibold focus:outline-none focus:border-orange-500"
                  >
                    <option value="Company">Company / Corporate</option>
                    <option value="Developer">Developer / Contractor</option>
                    <option value="Architect">Architect / Consultant</option>
                    <option value="Retail Customer">Retail Individual</option>
                    <option value="Government">Government Authority</option>
                    <option value="Dealer">Dealer / Distributor</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block">District / Region</label>
                  <select
                    value={formDistrict}
                    onChange={(e) => setFormDistrict(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded font-semibold focus:outline-none focus:border-orange-500"
                  >
                    <option value="Colombo">Colombo</option>
                    <option value="Gampaha">Gampaha</option>
                    <option value="Kalutara">Kalutara</option>
                    <option value="Kandy">Kandy</option>
                    <option value="Galle">Galle</option>
                    <option value="Kurunegala">Kurunegala</option>
                    <option value="Jaffna">Jaffna</option>
                    <option value="Island-wide">Island-wide</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block">Tax / VAT Reg ID</label>
                  <input
                    type="text"
                    placeholder="e.g. VAT-1098234-90"
                    value={formTaxId}
                    onChange={(e) => setFormTaxId(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded font-mono focus:outline-none focus:border-orange-500"
                  />
                </div>
              </div>

              {/* AUTOMATIC DISCOUNT TIER CONFIGURATION */}
              <div className="bg-orange-50 p-3.5 rounded-lg border border-orange-200 space-y-2">
                <div className="flex items-center space-x-2 text-orange-900 font-bold">
                  <Percent className="w-4 h-4 text-orange-600" />
                  <span>Automatic Customer Discount Tier (%)</span>
                </div>
                <p className="text-[11px] text-orange-800">
                  Setting a discount tier percentage will automatically apply this discount whenever creating an order for this customer!
                </p>

                <div className="flex items-center space-x-3 pt-1">
                  <input
                    type="number"
                    min="0"
                    max="50"
                    step="0.5"
                    value={formDiscountTierPct}
                    onChange={(e) => setFormDiscountTierPct(Number(e.target.value))}
                    className="w-24 p-2 bg-white border border-orange-300 rounded font-mono font-bold text-sm text-orange-700 text-center"
                  />
                  <span className="font-bold text-slate-700 text-xs">% Default Automatic Discount</span>
                </div>
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-orange-500 hover:bg-orange-600 text-white font-black rounded shadow transition"
                >
                  {isSubmitting ? 'Saving...' : editingCustomer ? 'Update Customer' : 'Save Customer Profile'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. SPECIAL CONTRACT PRICING & QUANTITY TIERS MODAL */}
      {contractCustomer && (
        <div className={`fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-xs flex items-center justify-center ${isContractFullscreen ? 'p-0' : 'p-3 overflow-y-auto'}`}>
          <div className={`bg-white border border-slate-200 flex flex-col overflow-hidden transition-all duration-200 ${
            isContractFullscreen 
              ? 'w-screen h-screen max-w-none max-h-none rounded-none' 
              : 'rounded-xl shadow-2xl max-w-6xl w-full max-h-[92vh]'
          }`}>
            {/* Modal Header */}
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center space-x-2">
                <Tag className="w-5 h-5 text-orange-400" />
                <div>
                  <h3 className="font-black text-base flex items-center space-x-2">
                    <span>Contract Rates & Tier Matrix — {contractCustomer.name}</span>
                    <span className="text-xs bg-orange-500/30 text-orange-300 border border-orange-400/40 px-2 py-0.5 rounded font-mono">
                      {contractCustomer.customer_type}
                    </span>
                  </h3>
                  <p className="text-[11px] text-slate-300">
                    Configure multi-product contract prices, discount percentages, and quantity volume tiers for this customer.
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => setIsContractFullscreen(!isContractFullscreen)}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-3 py-1.5 rounded text-xs font-bold transition flex items-center space-x-1 cursor-pointer"
                >
                  {isContractFullscreen ? <Minimize2 className="w-3.5 h-3.5 text-orange-400" /> : <Maximize2 className="w-3.5 h-3.5 text-orange-400" />}
                  <span>{isContractFullscreen ? 'Exit' : 'Fullscreen'}</span>
                </button>

                <button 
                  onClick={() => {
                    setContractCustomer(null);
                    setSelectedProdIds([]);
                  }} 
                  className="p-1 rounded text-slate-400 hover:text-white transition cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-5 space-y-6 overflow-y-auto text-xs grow bg-slate-50">
              {/* TOP GRID: Product Selector (Left) + Contract Rules & Tiers Form (Right) */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                
                {/* LEFT COL: Product Search & Multi-Select List (5 cols) */}
                <div className="lg:col-span-5 bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col space-y-3 max-h-[500px]">
                  <div className="flex items-center justify-between pb-1 border-b border-slate-100">
                    <span className="font-extrabold text-slate-900 text-xs flex items-center space-x-1.5">
                      <Search className="w-4 h-4 text-orange-500" />
                      <span>Select Products ({selectedProdIds.length} Selected)</span>
                    </span>

                    {selectedProdIds.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setSelectedProdIds([])}
                        className="text-[10px] text-rose-600 font-bold hover:underline"
                      >
                        Clear Selection
                      </button>
                    )}
                  </div>

                  {/* Search Input */}
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search by code, name, category..."
                      value={contractSearchTerm}
                      onChange={(e) => setContractSearchTerm(e.target.value)}
                      className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-orange-500"
                    />
                  </div>

                  {/* Category Filter Pills */}
                  <div className="flex items-center gap-1 overflow-x-auto pb-1 text-[10px] shrink-0">
                    {['ALL', 'Aluminium Profiles', 'Glass', 'ACP Sheets', 'Hardware & Accessories'].map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setContractCategoryFilter(cat)}
                        className={`px-2 py-0.5 rounded font-bold whitespace-nowrap cursor-pointer ${
                          contractCategoryFilter === cat 
                            ? 'bg-slate-900 text-white' 
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>

                  {/* Product Cards List */}
                  <div className="overflow-y-auto grow space-y-1.5 pr-1">
                    {products
                      .filter(p => {
                        const matchesSearch = 
                          p.product_code.toLowerCase().includes(contractSearchTerm.toLowerCase()) ||
                          p.product_name.toLowerCase().includes(contractSearchTerm.toLowerCase()) ||
                          p.category.toLowerCase().includes(contractSearchTerm.toLowerCase());
                        const matchesCat = contractCategoryFilter === 'ALL' ? true : p.category === contractCategoryFilter;
                        return matchesSearch && matchesCat;
                      })
                      .map((prod) => {
                        const isSelected = selectedProdIds.includes(prod.id);
                        const baseP = prod.base_price || prod.current_price;
                        return (
                          <div
                            key={prod.id}
                            onClick={() => toggleSelectProduct(prod.id)}
                            className={`p-2.5 rounded-lg border transition cursor-pointer flex items-center justify-between ${
                              isSelected 
                                ? 'bg-orange-50/80 border-orange-400 text-orange-950 shadow-2xs' 
                                : 'bg-white border-slate-200 hover:border-slate-300 text-slate-800'
                            }`}
                          >
                            <div className="flex items-center space-x-2.5 min-w-0">
                              <div className={`p-1 rounded shrink-0 ${isSelected ? 'text-orange-600' : 'text-slate-400'}`}>
                                {isSelected ? <CheckSquare className="w-4 h-4 text-orange-600" /> : <Square className="w-4 h-4" />}
                              </div>
                              <div className="truncate">
                                <div className="font-bold text-xs truncate flex items-center space-x-1">
                                  <span className="font-mono text-[10px] text-orange-600 bg-white px-1 border rounded shrink-0">
                                    {prod.product_code}
                                  </span>
                                  <span className="truncate">{prod.product_name}</span>
                                </div>
                                <div className="text-[10px] text-slate-500 font-medium">
                                  Category: {prod.category}
                                </div>
                              </div>
                            </div>

                            <div className="text-right shrink-0 font-mono font-bold text-slate-900 text-xs pl-2">
                              Rs. {baseP.toLocaleString()}
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>

                {/* RIGHT COL: Contract Pricing Mode & Quantity Tiers Setup (7 cols) */}
                <div className="lg:col-span-7 space-y-4">
                  {/* Pricing Mode Selection Box */}
                  <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-slate-900 text-xs flex items-center space-x-1.5">
                        <Sliders className="w-4 h-4 text-orange-500" />
                        <span>Contract Pricing Rule Mode</span>
                      </span>

                      <div className="flex items-center space-x-1 bg-slate-100 p-0.5 rounded-lg border border-slate-200">
                        <button
                          type="button"
                          onClick={() => setContractMode('discount_pct')}
                          className={`px-3 py-1 text-xs font-bold rounded-md transition cursor-pointer ${
                            contractMode === 'discount_pct' 
                              ? 'bg-orange-500 text-white shadow-2xs' 
                              : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          Discount % Off Base
                        </button>
                        <button
                          type="button"
                          onClick={() => setContractMode('fixed_price')}
                          className={`px-3 py-1 text-xs font-bold rounded-md transition cursor-pointer ${
                            contractMode === 'fixed_price' 
                              ? 'bg-orange-500 text-white shadow-2xs' 
                              : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          Fixed Rate (LKR)
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase block">
                          {contractMode === 'discount_pct' ? 'Contract Discount Percentage (%)' : 'Contract Fixed Unit Rate (LKR)'}
                        </label>
                        <input
                          type="number"
                          required
                          min="0"
                          value={contractValue}
                          onChange={(e) => setContractValue(Number(e.target.value))}
                          className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg font-mono font-bold text-sm text-slate-900 focus:outline-none focus:border-orange-500"
                        />
                      </div>

                      <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase block">Effective Date From</label>
                        <input
                          type="date"
                          value={effectiveFrom}
                          onChange={(e) => setEffectiveFrom(e.target.value)}
                          className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg font-mono text-xs focus:outline-none focus:border-orange-500"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Quantity Volume Tiers Matrix Builder */}
                  <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-extrabold text-slate-900 text-xs block">Quantity Discount Tiers Matrix</span>
                        <p className="text-[10px] text-slate-500">Tiered pricing triggers automatically when ordering in volume.</p>
                      </div>

                      <button
                        type="button"
                        onClick={handleAddQuantityTierRow}
                        className="bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 text-xs px-2.5 py-1 rounded-lg font-bold flex items-center space-x-1 cursor-pointer transition"
                      >
                        <Plus className="w-3.5 h-3.5 text-orange-500" />
                        <span>Add Tier</span>
                      </button>
                    </div>

                    {/* Quantity Tiers List */}
                    <div className="space-y-2">
                      {quantityTiers.map((tier, idx) => (
                        <div key={tier.id} className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 grid grid-cols-1 sm:grid-cols-12 gap-2 items-center">
                          <div className="sm:col-span-5">
                            <input
                              type="text"
                              value={tier.label}
                              onChange={(e) => {
                                const newLabel = e.target.value;
                                setQuantityTiers(prev => prev.map(t => t.id === tier.id ? { ...t, label: newLabel } : t));
                              }}
                              className="w-full text-xs p-1.5 bg-white border border-slate-300 rounded font-semibold text-slate-800"
                              placeholder="Tier Label"
                            />
                          </div>

                          <div className="sm:col-span-3 flex items-center space-x-1 font-mono text-xs">
                            <input
                              type="number"
                              min="1"
                              value={tier.min_qty}
                              onChange={(e) => {
                                const val = Number(e.target.value);
                                setQuantityTiers(prev => prev.map(t => t.id === tier.id ? { ...t, min_qty: val } : t));
                              }}
                              className="w-14 text-center p-1 bg-white border border-slate-300 rounded font-bold"
                            />
                            <span className="text-slate-400">-</span>
                            <input
                              type="number"
                              min="1"
                              value={tier.max_qty}
                              onChange={(e) => {
                                const val = Number(e.target.value);
                                setQuantityTiers(prev => prev.map(t => t.id === tier.id ? { ...t, max_qty: val } : t));
                              }}
                              className="w-14 text-center p-1 bg-white border border-slate-300 rounded font-bold"
                            />
                          </div>

                          <div className="sm:col-span-3">
                            <input
                              type="number"
                              placeholder="Custom Tier Rate (LKR)"
                              value={tier.unit_price || ''}
                              onChange={(e) => {
                                const val = Number(e.target.value);
                                setQuantityTiers(prev => prev.map(t => t.id === tier.id ? { ...t, unit_price: val } : t));
                              }}
                              className="w-full text-xs p-1.5 bg-white border border-slate-300 rounded font-mono font-bold text-emerald-700"
                            />
                          </div>

                          <div className="sm:col-span-1 text-right">
                            <button
                              type="button"
                              onClick={() => handleRemoveQuantityTierRow(tier.id)}
                              className="p-1 text-rose-600 hover:bg-rose-50 rounded cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Apply Button */}
                  <button
                    type="button"
                    onClick={handleApplyContractPrices}
                    disabled={selectedProdIds.length === 0 || isBulkApplying}
                    className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-black text-xs py-3 rounded-xl shadow-md transition flex items-center justify-center space-x-2 cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>
                      {isBulkApplying 
                        ? 'Applying Contract Rates...' 
                        : selectedProdIds.length === 0 
                          ? 'Select Products Above to Apply Rates' 
                          : `+ Apply Contract Rates & Quantity Tiers to ${selectedProdIds.length} Selected Product(s)`
                      }
                    </span>
                  </button>
                </div>
              </div>

              {/* BOTTOM SECTION: Existing Active Contract Pricing Rules & Tiers Matrix Table */}
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-extrabold text-slate-900 text-sm flex items-center space-x-1.5">
                      <Tag className="w-4 h-4 text-orange-500" />
                      <span>Active Contract Price Rules & Tier Matrix ({customerPrices.filter(cp => cp.customer_name.toLowerCase().trim() === contractCustomer.name.toLowerCase().trim()).length})</span>
                    </h4>
                    <p className="text-[11px] text-slate-500">Live contract rate overrides applied automatically during quotation creation.</p>
                  </div>
                </div>

                {customerPrices.filter(cp => cp.customer_name.toLowerCase().trim() === contractCustomer.name.toLowerCase().trim()).length === 0 ? (
                  <p className="text-slate-400 italic text-center py-6 text-xs">No contract rate rules configured for this customer yet.</p>
                ) : (
                  <div className="border border-slate-200 rounded-lg overflow-hidden">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-900 text-white font-bold uppercase text-[10px]">
                        <tr>
                          <th className="p-2.5">Product Variant</th>
                          <th className="p-2.5">Contract Mode</th>
                          <th className="p-2.5 text-right">Contracted Rate</th>
                          <th className="p-2.5">Quantity Volume Tiers</th>
                          <th className="p-2.5 text-center">Effective Date</th>
                          <th className="p-2.5 text-center">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-mono">
                        {customerPrices
                          .filter(cp => cp.customer_name.toLowerCase().trim() === contractCustomer.name.toLowerCase().trim())
                          .map((cp) => {
                            const prod = products.find(p => p.id === cp.product_id || p.product_code === cp.product_code);
                            const basePrice = prod ? (prod.base_price || prod.current_price) : 0;
                            return (
                              <tr key={cp.id} className="hover:bg-slate-50">
                                <td className="p-2.5">
                                  <span className="font-bold text-orange-600 bg-orange-50 px-1 py-0.2 border border-orange-200 rounded mr-1">
                                    {cp.product_code}
                                  </span>
                                  <span className="font-sans font-semibold text-slate-800">{cp.product_name || prod?.product_name || 'Product'}</span>
                                  {basePrice > 0 && <span className="text-[10px] text-slate-400 block font-mono">Base: Rs. {basePrice.toLocaleString()}</span>}
                                </td>
                                <td className="p-2.5 font-sans">
                                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                                    {cp.contract_mode === 'discount_pct' ? `${cp.discount_pct || 10}% Off Base` : 'Fixed Contract Rate'}
                                  </span>
                                </td>
                                <td className="p-2.5 text-right font-bold text-emerald-600 text-sm">
                                  Rs. {cp.special_price.toLocaleString()}
                                </td>
                                <td className="p-2.5 font-sans">
                                  {cp.quantity_tiers && cp.quantity_tiers.length > 0 ? (
                                    <div className="flex flex-wrap gap-1">
                                      {cp.quantity_tiers.map((qt, i) => (
                                        <span key={i} className="text-[10px] bg-slate-100 text-slate-800 font-mono px-1.5 py-0.5 rounded border border-slate-200">
                                          {qt.min_qty}-{qt.max_qty} Qty: <strong className="text-emerald-700">Rs. {qt.unit_price.toLocaleString()}</strong>
                                        </span>
                                      ))}
                                    </div>
                                  ) : (
                                    <span className="text-slate-400 italic text-[10px]">Standard volume applies</span>
                                  )}
                                </td>
                                <td className="p-2.5 text-center text-slate-600 text-[11px]">
                                  {cp.effective_from || 'Immediate'}
                                </td>
                                <td className="p-2.5 text-center">
                                  <button
                                    onClick={() => onDeleteCustomerOverride(cp.id)}
                                    className="p-1 text-rose-600 hover:bg-rose-50 rounded cursor-pointer"
                                    title="Delete contract rate rule"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 7. CUSTOMER ORDER HISTORY MODAL */}
      {historyCustomer && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-3">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-2xl w-full overflow-hidden max-h-[90vh] flex flex-col">
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center space-x-2">
                <FileText className="w-5 h-5 text-orange-400" />
                <div>
                  <h3 className="font-black text-base">Order History — {historyCustomer.name}</h3>
                  <p className="text-[11px] text-slate-300">All registered quotes and orders for this customer.</p>
                </div>
              </div>
              <button onClick={() => setHistoryCustomer(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-3 overflow-y-auto text-xs grow">
              {quotations.filter(q => q.customer_name.toLowerCase().trim() === historyCustomer.name.toLowerCase().trim()).length === 0 ? (
                <p className="text-slate-400 italic text-center py-6">No order history recorded for this customer yet.</p>
              ) : (
                <div className="space-y-2">
                  {quotations
                    .filter(q => q.customer_name.toLowerCase().trim() === historyCustomer.name.toLowerCase().trim())
                    .map((q) => (
                      <div key={q.id} className="bg-slate-50 p-3 rounded-lg border border-slate-200 flex items-center justify-between">
                        <div>
                          <div className="font-mono font-black text-orange-600 text-xs">{q.quotation_number}</div>
                          <div className="text-[11px] text-slate-600">{q.date} • {q.items.length} Items</div>
                        </div>

                        <div className="text-right">
                          <span className="font-mono font-black text-slate-900 text-sm block">Rs. {q.net_total.toLocaleString()}</span>
                          <span className="text-[9px] font-bold uppercase px-1.5 py-0.2 rounded bg-slate-200 text-slate-700">
                            {q.status}
                          </span>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
