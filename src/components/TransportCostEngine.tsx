import React, { useState, useEffect } from 'react';
import { 
  Truck, 
  MapPin, 
  Scale, 
  Navigation, 
  Settings, 
  Fuel, 
  Moon, 
  ShieldAlert, 
  Calculator, 
  CheckCircle2, 
  Clock, 
  Layers,
  Info,
  Edit2,
  X,
  ChevronRight,
  ChevronDown,
  Plus,
  Trash2,
  Building2,
  Tag,
  Route,
  DollarSign,
  Check,
  FileText,
  Sliders,
  Search,
  AlertCircle,
  ArrowRight,
  Phone,
  RefreshCw,
  Box,
  CornerDownRight
} from 'lucide-react';
import { 
  Vehicle, 
  TransportRules, 
  SiteLocation, 
  TransportCalculationResult, 
  Branch, 
  MaterialSupplier, 
  SupplyRouteLeg, 
  Quotation 
} from '../types';
import { INITIAL_SUPPLIERS } from '../data/initialData';

interface TransportCostEngineProps {
  vehicles: Vehicle[];
  rules: TransportRules;
  locations: SiteLocation[];
  activeBranch: Branch;
  quotations?: Quotation[];
  onUpdateVehicle: (id: string, data: Partial<Vehicle>) => Promise<void>;
  onUpdateRules: (rules: Partial<TransportRules>) => Promise<void>;
  onCalculateTransport: (input: any) => Promise<TransportCalculationResult>;
  onUpdateQuotation?: (updatedQuote: Quotation) => Promise<void>;
}

export const TransportCostEngine: React.FC<TransportCostEngineProps> = ({
  vehicles,
  rules,
  locations,
  activeBranch,
  quotations = [],
  onUpdateVehicle,
  onUpdateRules,
  onCalculateTransport,
  onUpdateQuotation
}) => {
  // Navigation View Modes
  const [activeViewMode, setActiveViewMode] = useState<'ROUTE_OPTIMIZER' | 'SUPPLIERS_REGISTRY' | 'FLEET_BENCHMARKS'>('ROUTE_OPTIMIZER');

  // Registered Material Suppliers State
  const [suppliers, setSuppliers] = useState<MaterialSupplier[]>(INITIAL_SUPPLIERS);
  const [supplierSearchTerm, setSupplierSearchTerm] = useState('');
  const [supplierCategoryFilter, setSupplierCategoryFilter] = useState<string>('ALL');
  
  // New Supplier Modal State
  const [showSupplierModal, setShowSupplierModal] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<MaterialSupplier | null>(null);
  const [supName, setSupName] = useState('');
  const [supCat, setSupCat] = useState<MaterialSupplier['material_category']>('Aluminium Profiles');
  const [supLoc, setSupLoc] = useState('');
  const [supDistrict, setSupDistrict] = useState('Colombo');
  const [supPhone, setSupPhone] = useState('');
  const [supDefaultVehicle, setSupDefaultVehicle] = useState('Medium Flatbed Lorry (5 Ton)');
  const [supBaseFee, setSupBaseFee] = useState<number>(3500);
  const [supPerKmRate, setSupPerKmRate] = useState<number>(200);

  // Selected Target Project / Quotation State
  const [selectedProjectQuoteId, setSelectedProjectQuoteId] = useState<string>(quotations[0]?.id || '');
  const selectedQuotation = quotations.find(q => q.id === selectedProjectQuoteId || q.quotation_number === selectedProjectQuoteId);

  // Searchable Project Selection State
  const [projectSearchQuery, setProjectSearchQuery] = useState('');
  const [isProjectDropdownOpen, setIsProjectDropdownOpen] = useState(false);
  const [showProjectSearchModal, setShowProjectSearchModal] = useState(false);
  const [projectStatusFilter, setProjectStatusFilter] = useState<'ALL' | 'VALIDATED' | 'PENDING' | 'DRAFTS'>('ALL');
  const [autoSyncOnSelect, setAutoSyncOnSelect] = useState(true);

  // Filtered Quotations based on Search Query & Status
  const filteredQuotations = quotations.filter(q => {
    // Status Filter
    if (projectStatusFilter === 'VALIDATED' && !(q.status === 'Validated Official' || q.status === 'Approved' || q.status === 'Verified Quote')) return false;
    if (projectStatusFilter === 'PENDING' && !(q.status === 'Pending HO Validation' || q.status === 'Pending Approval')) return false;
    if (projectStatusFilter === 'DRAFTS' && !(q.status === 'Temporary Branch Draft' || q.status === 'Draft')) return false;

    if (!projectSearchQuery.trim()) return true;

    const term = projectSearchQuery.toLowerCase().trim();
    const qNumMatch = (q.quotation_number || '').toLowerCase().includes(term);
    const custMatch = (q.customer_name || '').toLowerCase().includes(term);
    const phoneMatch = (q.customer_phone || '').toLowerCase().includes(term);
    const locMatch = (q.site_location_name || '').toLowerCase().includes(term) || (q.site_address || '').toLowerCase().includes(term);
    const branchMatch = (q.branch_name || '').toLowerCase().includes(term);
    const itemMatch = q.items?.some(it => (it.product_name || '').toLowerCase().includes(term) || (it.product_code || '').toLowerCase().includes(term));

    return qNumMatch || custMatch || phoneMatch || locMatch || branchMatch || itemMatch;
  });

  // Multi-Leg Supply Route Rides State
  const [selectedLocationId, setSelectedLocationId] = useState<string>(locations[0]?.id || 'loc-01');
  const [useCustomDistance, setUseCustomDistance] = useState(false);
  const [customDistanceKm, setCustomDistanceKm] = useState<number>(35);
  const [isNightDelivery, setIsNightDelivery] = useState(false);
  const [isRemoteArea, setIsRemoteArea] = useState(false);
  const [includeDriverAllowance, setIncludeDriverAllowance] = useState(true);

  // Initial Multi-Ride Supply Legs
  const [supplyLegs, setSupplyLegs] = useState<SupplyRouteLeg[]>([
    {
      id: 'leg-1',
      supplier_id: 'sup-01',
      supplier_name: 'Lanka Aluminium Extrusions Ltd (Ekala Yard)',
      material_category: 'Aluminium Profiles',
      origin_location: 'Ekala Industrial Zone, Ja-Ela',
      vehicle_type: 'Medium Flatbed Lorry (5 Ton)',
      cargo_weight_kg: 1800,
      max_length_m: 6.0,
      distance_km: 25,
      leg_cost: 10750,
      notes: 'Main structure bars delivery'
    },
    {
      id: 'leg-2',
      supplier_id: 'sup-02',
      supplier_name: 'Asahi Glass Lanka PLC (Kaduwela Glass Factory)',
      material_category: 'Glass Sheets',
      origin_location: 'Kaduwela Industrial Park',
      vehicle_type: 'Medium Flatbed Lorry (5 Ton)',
      cargo_weight_kg: 900,
      max_length_m: 2.4,
      distance_km: 18,
      leg_cost: 10500,
      notes: 'Toughened glass panels fragile'
    },
    {
      id: 'leg-3',
      supplier_id: 'sup-03',
      supplier_name: 'Innovista Hardware & Accessories Central Hub',
      material_category: 'Hardware & Accessories',
      origin_location: 'Baseline Depot, Colombo 09',
      vehicle_type: 'Small Commercial Van (1 Ton)',
      cargo_weight_kg: 200,
      max_length_m: 1.5,
      distance_km: 12,
      leg_cost: 4300,
      notes: 'Locks, rollers, rubber gaskets'
    }
  ]);

  // Success Notification Banner
  const [attachedSuccessMessage, setAttachedSuccessMessage] = useState<string | null>(null);

  // Admin Fleet Rates Modal State
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [vBaseChargeInput, setVBaseChargeInput] = useState('');
  const [vPerKmInput, setVPerKmInput] = useState('');

  // Rules adjustment state
  const [fuelPriceInput, setFuelPriceInput] = useState(rules.fuel_price_per_l.toString());
  const [driverAllowanceInput, setDriverAllowanceInput] = useState(rules.driver_allowance.toString());
  const [showRulesModal, setShowRulesModal] = useState(false);

  const isHO = activeBranch.code === 'HO';

  // Calculate individual supply leg cost
  const calculateLegCost = (leg: SupplyRouteLeg): number => {
    const matchedVehicle = vehicles.find(v => v.type === leg.vehicle_type) || vehicles[0];
    const matchedSupplier = suppliers.find(s => s.id === leg.supplier_id);
    
    const base = matchedVehicle ? matchedVehicle.base_charge : 3500;
    const perKm = matchedVehicle ? matchedVehicle.per_km_rate : 200;
    const distanceCost = leg.distance_km * perKm;
    
    // Fuel adjustment based on rules
    const fuelPriceDiff = rules.fuel_price_per_l - (rules.base_fuel_rate || 350);
    const fuelSurcharge = fuelPriceDiff > 0 ? (leg.distance_km * (fuelPriceDiff / 10)) : 0;

    // Supplier pickup fee
    const pickupFee = matchedSupplier ? matchedSupplier.base_pickup_fee : 2000;

    return Math.round(base + distanceCost + fuelSurcharge + pickupFee);
  };

  // Recalculate all legs whenever vehicles, suppliers, or distance changes
  useEffect(() => {
    setSupplyLegs(prev => prev.map(leg => ({
      ...leg,
      leg_cost: calculateLegCost(leg)
    })));
  }, [vehicles, suppliers, rules]);

  // Calculate Total Multi-Leg Transport Cost
  const rawLegsTotal = supplyLegs.reduce((acc, leg) => acc + leg.leg_cost, 0);
  const nightSurchargeAmount = isNightDelivery ? Math.round(rawLegsTotal * (rules.night_delivery_surcharge_pct / 100)) : 0;
  const remoteSurchargeAmount = isRemoteArea ? Math.round(rawLegsTotal * (rules.remote_area_surcharge_pct / 100)) : 0;
  const totalCrewAllowance = includeDriverAllowance ? (rules.driver_allowance * Math.max(1, supplyLegs.length)) : 0;

  const grandTotalMultiLegCost = rawLegsTotal + nightSurchargeAmount + remoteSurchargeAmount + totalCrewAllowance;
  const totalCargoWeightKg = supplyLegs.reduce((acc, leg) => acc + leg.cargo_weight_kg, 0);
  const totalMileageKm = supplyLegs.reduce((acc, leg) => acc + leg.distance_km, 0);

  // Add New Supply Ride Leg
  const handleAddSupplyLeg = () => {
    const defaultSup = suppliers[0] || INITIAL_SUPPLIERS[0];
    const newLeg: SupplyRouteLeg = {
      id: `leg-${Date.now()}`,
      supplier_id: defaultSup.id,
      supplier_name: defaultSup.supplier_name,
      material_category: defaultSup.material_category,
      origin_location: defaultSup.location_name,
      vehicle_type: defaultSup.default_vehicle_type || 'Medium Flatbed Lorry (5 Ton)',
      cargo_weight_kg: 500,
      max_length_m: 3.0,
      distance_km: 20,
      leg_cost: 0
    };
    newLeg.leg_cost = calculateLegCost(newLeg);
    setSupplyLegs(prev => [...prev, newLeg]);
  };

  // Remove Supply Ride Leg
  const handleRemoveSupplyLeg = (legId: string) => {
    setSupplyLegs(prev => prev.filter(l => l.id !== legId));
  };

  // Update Specific Supply Leg Field
  const handleUpdateLeg = (legId: string, updates: Partial<SupplyRouteLeg>) => {
    setSupplyLegs(prev => prev.map(l => {
      if (l.id !== legId) return l;
      const updated = { ...l, ...updates };

      // If supplier changed, auto set name, category, origin, default vehicle
      if (updates.supplier_id) {
        const matchedSup = suppliers.find(s => s.id === updates.supplier_id);
        if (matchedSup) {
          updated.supplier_name = matchedSup.supplier_name;
          updated.material_category = matchedSup.material_category;
          updated.origin_location = matchedSup.location_name;
          if (matchedSup.default_vehicle_type) {
            updated.vehicle_type = matchedSup.default_vehicle_type;
          }
        }
      }

      updated.leg_cost = calculateLegCost(updated);
      return updated;
    }));
  };

  // Handler for selecting a project from search list or modal
  const handleSelectProject = (quoteId: string, triggerSync: boolean = true) => {
    setSelectedProjectQuoteId(quoteId);
    setIsProjectDropdownOpen(false);
    setShowProjectSearchModal(false);

    const found = quotations.find(q => q.id === quoteId || q.quotation_number === quoteId);
    if (found) {
      setProjectSearchQuery(`#${found.quotation_number} — ${found.customer_name}`);
      if (triggerSync || autoSyncOnSelect) {
        handleSyncProjectData(found);
      }
    }
  };

  // Sync Project / Quotation Data into Multi-Leg Optimizer
  const handleSyncProjectData = (quoteOverride?: Quotation) => {
    const quoteToSync = quoteOverride || selectedQuotation;
    if (!quoteToSync) return;

    // Calculate total weight from quotation items
    const totalQuoteWeight = quoteToSync.items?.reduce((acc, it) => acc + ((it.weight_kg || 1) * (it.quantity || 1)), 0) || 2500;
    
    // Distribute cargo weight across legs
    setSupplyLegs(prev => {
      if (prev.length === 0) return prev;
      const weightPerLeg = Math.max(100, Math.round(totalQuoteWeight / prev.length));
      return prev.map(leg => {
        const updated = { ...leg, cargo_weight_kg: weightPerLeg };
        updated.leg_cost = calculateLegCost(updated);
        return updated;
      });
    });

    // Auto-match site location if available
    if (quoteToSync.site_location_name) {
      const matchedLoc = locations.find(l => 
        l.name.toLowerCase().includes(quoteToSync.site_location_name.toLowerCase()) || 
        quoteToSync.site_location_name.toLowerCase().includes(l.name.toLowerCase())
      );
      if (matchedLoc) {
        setSelectedLocationId(matchedLoc.id);
        setIsRemoteArea(matchedLoc.is_remote);
      }
    }

    setAttachedSuccessMessage(`Synced Project #${quoteToSync.quotation_number} cargo weight (${totalQuoteWeight.toLocaleString()} kg) & location details across ${supplyLegs.length} supply rides!`);
    setTimeout(() => setAttachedSuccessMessage(null), 4500);
  };

  // Attach Multi-Supplier Transportation Cost to Project / Quotation
  const handleAttachLogisticsToProject = async () => {
    if (!selectedQuotation || !onUpdateQuotation) return;

    const sub = selectedQuotation.subtotal || selectedQuotation.material_subtotal || selectedQuotation.subtotal_price || 0;
    const fab = selectedQuotation.fabrication_cost || 0;
    const inst = selectedQuotation.installation_cost || 0;
    const disc = selectedQuotation.discount_amount || 0;
    const tax = selectedQuotation.tax_amount || 0;

    const newNetTotal = Math.max(0, (sub + fab + inst) - disc + tax + grandTotalMultiLegCost);

    const updatedQuote: Quotation = {
      ...selectedQuotation,
      transport_cost: grandTotalMultiLegCost,
      net_total: newNetTotal,
      transport_details: {
        vehicle_used: vehicles.find(v => v.type === supplyLegs[0]?.vehicle_type) || vehicles[0],
        vehicle_type: supplyLegs.map(l => l.vehicle_type).join(', '),
        total_weight_kg: totalCargoWeightKg,
        distance_km: totalMileageKm,
        base_charge: rawLegsTotal,
        distance_cost: totalMileageKm * 200,
        fuel_adjustment: 0,
        driver_allowance: totalCrewAllowance,
        night_surcharge: nightSurchargeAmount,
        remote_surcharge: remoteSurchargeAmount,
        total_transport_cost: grandTotalMultiLegCost,
        travel_time_min: totalMileageKm * 1.5,
        breakdown_lines: supplyLegs.map(l => ({
          label: `Ride (${l.material_category}): ${l.supplier_name}`,
          amount: l.leg_cost
        }))
      }
    };

    try {
      await onUpdateQuotation(updatedQuote);
      setAttachedSuccessMessage(`Multi-Supplier Logistics Cost of Rs. ${grandTotalMultiLegCost.toLocaleString()} successfully attached to Project #${selectedQuotation.quotation_number}!`);
      setTimeout(() => setAttachedSuccessMessage(null), 5000);
    } catch (err) {
      console.error('Failed to attach transport cost:', err);
    }
  };

  // Supplier CRUD Handlers
  const handleSaveSupplier = (e: React.FormEvent) => {
    e.preventDefault();
    if (!supName || !supLoc) return;

    if (editingSupplier) {
      setSuppliers(prev => prev.map(s => s.id === editingSupplier.id ? {
        ...s,
        supplier_name: supName,
        material_category: supCat,
        location_name: supLoc,
        district: supDistrict,
        contact_phone: supPhone,
        default_vehicle_type: supDefaultVehicle,
        base_pickup_fee: Number(supBaseFee),
        per_km_rate: Number(supPerKmRate)
      } : s));
    } else {
      const newSup: MaterialSupplier = {
        id: `sup-${Date.now()}`,
        supplier_name: supName,
        material_category: supCat,
        location_name: supLoc,
        district: supDistrict,
        contact_phone: supPhone,
        default_vehicle_type: supDefaultVehicle,
        base_pickup_fee: Number(supBaseFee),
        per_km_rate: Number(supPerKmRate),
        estimated_prep_time_hours: 3
      };
      setSuppliers(prev => [newSup, ...prev]);
    }

    setShowSupplierModal(false);
    setEditingSupplier(null);
    setSupName('');
    setSupLoc('');
  };

  const handleDeleteSupplier = (id: string) => {
    setSuppliers(prev => prev.filter(s => s.id !== id));
  };

  const handleSaveVehicleRates = async () => {
    if (!editingVehicle) return;
    try {
      await onUpdateVehicle(editingVehicle.id, {
        base_charge: parseFloat(vBaseChargeInput),
        per_km_rate: parseFloat(vPerKmInput)
      });
      setEditingVehicle(null);
    } catch (e) {
      alert('Failed to update vehicle rates');
    }
  };

  const handleSaveGlobalRules = async () => {
    try {
      await onUpdateRules({
        fuel_price_per_l: parseFloat(fuelPriceInput),
        driver_allowance: parseFloat(driverAllowanceInput)
      });
      setShowRulesModal(false);
      alert('Global Transport & Fuel Surcharge Rules Updated!');
    } catch (e) {
      alert('Failed to update transport rules');
    }
  };

  return (
    <div className="space-y-5">
      {/* --- TOP BANNER & MODE NAVIGATION --- */}
      <div className="bg-white text-slate-900 p-4 rounded-xl shadow-2xs border border-slate-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 relative overflow-hidden">
        <div className="space-y-1 relative z-10">
          <div className="flex flex-wrap items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-orange-500 text-white flex items-center justify-center shadow-xs">
              <Truck className="w-5 h-5" />
            </div>
            <h2 className="text-base font-black tracking-tight text-slate-900 uppercase">
              MULTI-SUPPLIER LOGISTICS & TRANSPORT ENGINE
            </h2>
            <span className="bg-orange-100 text-orange-800 border border-orange-200 text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase">
              Multi-Ride & Route Optimizer
            </span>
          </div>
          <p className="text-xs text-slate-500 font-medium">
            Configure material pickup rides across multiple suppliers, calculate multi-leg transport routes, and attach project logistics costs directly to customer quotations.
          </p>
        </div>

        {/* View Mode Tabs */}
        <div className="flex items-center space-x-1.5 bg-slate-100 p-1 rounded-lg border border-slate-200 shrink-0">
          <button
            onClick={() => setActiveViewMode('ROUTE_OPTIMIZER')}
            className={`px-3 py-1.5 rounded-md text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer ${
              activeViewMode === 'ROUTE_OPTIMIZER'
                ? 'bg-orange-500 text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Route className="w-3.5 h-3.5" />
            <span>Route & Project Optimizer</span>
          </button>

          <button
            onClick={() => setActiveViewMode('SUPPLIERS_REGISTRY')}
            className={`px-3 py-1.5 rounded-md text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer ${
              activeViewMode === 'SUPPLIERS_REGISTRY'
                ? 'bg-orange-500 text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Material Suppliers ({suppliers.length})</span>
          </button>

          <button
            onClick={() => setActiveViewMode('FLEET_BENCHMARKS')}
            className={`px-3 py-1.5 rounded-md text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer ${
              activeViewMode === 'FLEET_BENCHMARKS'
                ? 'bg-orange-500 text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Fuel className="w-3.5 h-3.5" />
            <span>Fleet & Fuel Benchmarks</span>
          </button>
        </div>
      </div>

      {/* SUCCESS NOTIFICATION TOAST BANNER */}
      {attachedSuccessMessage && (
        <div className="bg-emerald-500 text-white p-3.5 rounded-xl shadow-md border border-emerald-600 flex items-center justify-between animate-fade-in">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-100" />
            <span className="font-extrabold text-xs tracking-wide">{attachedSuccessMessage}</span>
          </div>
          <button onClick={() => setAttachedSuccessMessage(null)} className="text-emerald-100 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODE 1: ROUTE & PROJECT SUPPLY OPTIMIZER (MAIN CALCULATOR) */}
      {/* ========================================================================= */}
      {activeViewMode === 'ROUTE_OPTIMIZER' && (
        <div className="space-y-5">
          {/* PROJECT SELECTION & SEARCH INTEGRATION HEADER CARD */}
          <div className="bg-white p-4.5 rounded-xl border border-slate-200 shadow-2xs space-y-3.5">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-[10px] font-black text-orange-600 uppercase tracking-wider">
                    TARGET PROJECT / QUOTATION INTEGRATION
                  </span>
                  <span className="bg-slate-100 text-slate-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-slate-200">
                    {quotations.length} Active Projects
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Search, filter, select, and synchronize project cargo specs & site logistics with the transport engine.
                </p>
              </div>

              {/* Sync controls */}
              <div className="flex items-center space-x-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setShowProjectSearchModal(true)}
                  className="bg-slate-900 hover:bg-slate-800 text-white text-xs px-3 py-2 rounded-lg font-bold flex items-center space-x-1.5 transition shadow-xs cursor-pointer"
                >
                  <Search className="w-3.5 h-3.5 text-orange-400" />
                  <span>Browse & Search Projects...</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSyncProjectData()}
                  disabled={!selectedQuotation}
                  className="bg-orange-500 hover:bg-orange-600 text-white text-xs px-3.5 py-2 rounded-lg font-bold flex items-center space-x-1.5 transition shadow-xs cursor-pointer disabled:opacity-50"
                  title="Recalculate total cargo weight and site location from selected quotation"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Sync Project Cargo</span>
                </button>
              </div>
            </div>

            {/* Live Search Input & Dropdown Combobox Row */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
              {/* Searchable Combobox */}
              <div className="md:col-span-7 relative">
                <div className="relative flex items-center">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
                  <input
                    type="text"
                    value={projectSearchQuery}
                    onFocus={() => setIsProjectDropdownOpen(true)}
                    onChange={(e) => {
                      setProjectSearchQuery(e.target.value);
                      setIsProjectDropdownOpen(true);
                    }}
                    placeholder="Search project by Quote #, Customer Name, Site Location, Branch..."
                    className="w-full bg-slate-50 hover:bg-white focus:bg-white border border-slate-300 rounded-lg pl-9 pr-24 py-2 text-xs font-bold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-orange-500 transition shadow-2xs"
                  />
                  
                  {projectSearchQuery && (
                    <button
                      type="button"
                      onClick={() => {
                        setProjectSearchQuery('');
                        setIsProjectDropdownOpen(false);
                      }}
                      className="absolute right-16 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => setIsProjectDropdownOpen(!isProjectDropdownOpen)}
                    className="absolute right-2 text-xs font-bold text-slate-600 hover:text-slate-900 bg-slate-200/80 hover:bg-slate-200 px-2 py-1 rounded flex items-center space-x-1 cursor-pointer"
                  >
                    <span>List</span>
                    <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isProjectDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>
                </div>

                {/* Dropdown Overlay List */}
                {isProjectDropdownOpen && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-xl z-50 max-h-72 overflow-y-auto divide-y divide-slate-100 animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="p-2 bg-slate-50 border-b border-slate-100 flex items-center justify-between text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                      <span>Matching Projects ({filteredQuotations.length})</span>
                      <button 
                        type="button"
                        onClick={() => setIsProjectDropdownOpen(false)}
                        className="text-slate-400 hover:text-slate-700 cursor-pointer"
                      >
                        Close
                      </button>
                    </div>

                    {filteredQuotations.length === 0 ? (
                      <div className="p-4 text-center text-slate-400 text-xs">
                        No matching projects found for "{projectSearchQuery}"
                      </div>
                    ) : (
                      filteredQuotations.map(q => {
                        const isSelected = q.id === selectedProjectQuoteId || q.quotation_number === selectedProjectQuoteId;
                        const itemsCount = q.items?.length || 0;
                        const totalWeight = q.items?.reduce((acc, it) => acc + ((it.weight_kg || 1) * (it.quantity || 1)), 0) || 0;

                        return (
                          <div
                            key={q.id}
                            onClick={() => handleSelectProject(q.id, true)}
                            className={`p-3 hover:bg-orange-50/60 cursor-pointer transition flex items-center justify-between space-x-3 ${
                              isSelected ? 'bg-orange-50/90 border-l-4 border-orange-500' : ''
                            }`}
                          >
                            <div className="space-y-0.5 grow min-w-0">
                              <div className="flex items-center space-x-2">
                                <span className="font-mono font-bold text-slate-900 text-xs">
                                  #{q.quotation_number}
                                </span>
                                <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded border ${
                                  q.status === 'Validated Official' || q.status === 'Approved' || q.status === 'Verified Quote'
                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                    : q.status === 'Pending HO Validation' || q.status === 'Pending Approval'
                                    ? 'bg-amber-50 text-amber-700 border-amber-200'
                                    : 'bg-slate-100 text-slate-700 border-slate-200'
                                }`}>
                                  {q.status}
                                </span>
                              </div>
                              <div className="font-bold text-slate-800 text-xs truncate">
                                {q.customer_name}
                              </div>
                              <div className="text-[10px] text-slate-500 flex items-center space-x-2 font-mono">
                                <span className="truncate">📍 {q.site_location_name || q.site_address || 'Site'}</span>
                                <span>•</span>
                                <span>📦 {itemsCount} items ({totalWeight.toLocaleString()} kg)</span>
                              </div>
                            </div>

                            <div className="text-right shrink-0">
                              <span className="text-[10px] text-slate-400 block uppercase font-mono">Net Total</span>
                              <span className="font-mono font-bold text-slate-900 text-xs">
                                Rs. {(q.net_total || 0).toLocaleString()}
                              </span>
                              {isSelected && (
                                <span className="inline-flex items-center space-x-1 text-[10px] font-bold text-orange-600 mt-0.5">
                                  <Check className="w-3 h-3" />
                                  <span>Selected</span>
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                )}
              </div>

              {/* Active Selected Project Summary Badge */}
              <div className="md:col-span-5 bg-slate-900 text-white p-3 rounded-xl border border-slate-800 shadow-2xs flex items-center justify-between">
                {selectedQuotation ? (
                  <div className="flex items-center justify-between w-full space-x-3">
                    <div className="space-y-0.5 min-w-0">
                      <div className="flex items-center space-x-1.5">
                        <span className="font-mono font-bold text-orange-400 text-xs">
                          #{selectedQuotation.quotation_number}
                        </span>
                        <span className="text-[9px] bg-slate-800 text-slate-300 px-1.5 py-0.2 rounded border border-slate-700 font-medium truncate">
                          {selectedQuotation.customer_name}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono truncate">
                        {selectedQuotation.site_location_name || selectedQuotation.site_address || 'Site'} • {(selectedQuotation.items?.length || 0)} Items
                      </div>
                    </div>

                    <div className="text-right shrink-0 border-l border-slate-800 pl-3">
                      <span className="text-[9px] text-slate-400 block font-mono uppercase">Net Total</span>
                      <span className="font-mono font-black text-emerald-400 text-xs">
                        Rs. {(selectedQuotation.net_total || 0).toLocaleString()}
                      </span>
                    </div>
                  </div>
                ) : (
                  <span className="text-xs text-slate-400 italic">No project selected yet. Use search or list to select.</span>
                )}
              </div>
            </div>
          </div>

          {/* MAIN GRID: MULTI-SUPPLIER SUPPLY LEGS (LEFT 7 COLS) & CONSOLIDATED LOGISTICS QUOTE (RIGHT 5 COLS) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            
            {/* LEFT 7 COLS: MULTI-SUPPLIER SUPPLY RIDES MATRIX */}
            <div className="lg:col-span-7 bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h3 className="font-black text-slate-900 text-xs uppercase tracking-wider flex items-center space-x-1.5">
                    <Layers className="w-4 h-4 text-orange-500" />
                    <span>Multi-Supplier Ride Setup ({supplyLegs.length} Rides)</span>
                  </h3>
                  <p className="text-[11px] text-slate-500">Configure separate transport rides for aluminium, glass, hardware, fasteners, and heavy crane machinery.</p>
                </div>

                <button
                  type="button"
                  onClick={handleAddSupplyLeg}
                  className="bg-orange-500 hover:bg-orange-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center space-x-1 shadow-2xs cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Add Supply Ride</span>
                </button>
              </div>

              {/* SUPPLY LEGS CARDS LIST */}
              <div className="space-y-3">
                {supplyLegs.map((leg, idx) => (
                  <div key={leg.id} className="bg-slate-50 border border-slate-200 p-3.5 rounded-xl space-y-3 relative hover:border-orange-300 transition">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                      <div className="flex items-center space-x-2">
                        <span className="w-5 h-5 bg-slate-900 text-white rounded-full text-[10px] font-mono font-bold flex items-center justify-center">
                          {idx + 1}
                        </span>
                        <span className="font-extrabold text-xs text-slate-900 uppercase">
                          Supply Ride #{idx + 1} — {leg.material_category}
                        </span>
                      </div>

                      <div className="flex items-center space-x-2">
                        <span className="font-mono font-black text-emerald-700 text-xs bg-emerald-50 px-2 py-0.5 border border-emerald-200 rounded">
                          Ride Cost: Rs. {leg.leg_cost.toLocaleString()}
                        </span>

                        {supplyLegs.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveSupplyLeg(leg.id)}
                            className="p-1 text-rose-600 hover:bg-rose-50 rounded cursor-pointer"
                            title="Remove this supply ride"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* RIDE CONTROLS GRID */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      {/* Supplier Selection */}
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase block mb-0.5">Supplier / Origin Yard</label>
                        <select
                          value={leg.supplier_id}
                          onChange={(e) => handleUpdateLeg(leg.id, { supplier_id: e.target.value })}
                          className="w-full bg-white border border-slate-300 rounded-lg p-2 font-semibold text-xs text-slate-900 focus:outline-none focus:border-orange-500"
                        >
                          {suppliers.map(s => (
                            <option key={s.id} value={s.id}>
                              {s.supplier_name} ({s.location_name})
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Material Category */}
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase block mb-0.5">Material Category</label>
                        <select
                          value={leg.material_category}
                          onChange={(e) => handleUpdateLeg(leg.id, { material_category: e.target.value })}
                          className="w-full bg-white border border-slate-300 rounded-lg p-2 font-semibold text-xs text-slate-900 focus:outline-none focus:border-orange-500"
                        >
                          <option value="Aluminium Profiles">Aluminium Profiles</option>
                          <option value="Glass Sheets">Glass Sheets</option>
                          <option value="Hardware & Accessories">Hardware & Accessories</option>
                          <option value="Screws & Fasteners">Screws & Fasteners</option>
                          <option value="Heavy Equipment & Crane Hire">Heavy Equipment & Crane Hire</option>
                          <option value="ACP & Composite Boards">ACP & Composite Boards</option>
                          <option value="General Materials">General Materials</option>
                        </select>
                      </div>

                      {/* Vehicle Assigned */}
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase block mb-0.5">Assigned Logistics Vehicle</label>
                        <select
                          value={leg.vehicle_type}
                          onChange={(e) => handleUpdateLeg(leg.id, { vehicle_type: e.target.value })}
                          className="w-full bg-white border border-slate-300 rounded-lg p-2 font-semibold text-xs text-slate-900 focus:outline-none focus:border-orange-500"
                        >
                          {vehicles.map(v => (
                            <option key={v.id} value={v.type}>
                              {v.type} (Cap: {v.capacity_kg}kg)
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Distance (KM) */}
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase block mb-0.5">Distance to Site (KM)</label>
                        <input
                          type="number"
                          min="1"
                          value={leg.distance_km}
                          onChange={(e) => handleUpdateLeg(leg.id, { distance_km: Number(e.target.value) })}
                          className="w-full bg-white border border-slate-300 rounded-lg p-2 font-mono font-bold text-xs focus:outline-none focus:border-orange-500"
                        />
                      </div>

                      {/* Cargo Weight (KG) */}
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase block mb-0.5">Cargo Payload Weight (KG)</label>
                        <input
                          type="number"
                          min="1"
                          value={leg.cargo_weight_kg}
                          onChange={(e) => handleUpdateLeg(leg.id, { cargo_weight_kg: Number(e.target.value) })}
                          className="w-full bg-white border border-slate-300 rounded-lg p-2 font-mono font-bold text-xs focus:outline-none focus:border-orange-500"
                        />
                      </div>

                      {/* Notes / Instructions */}
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase block mb-0.5">Ride Instructions / Notes</label>
                        <input
                          type="text"
                          placeholder="e.g. Handle with care, fragile glass"
                          value={leg.notes || ''}
                          onChange={(e) => handleUpdateLeg(leg.id, { notes: e.target.value })}
                          className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs focus:outline-none focus:border-orange-500"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* SURCHARGE & CONDITION TOGGLES */}
              <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl space-y-2">
                <span className="text-[10px] font-extrabold text-slate-800 uppercase tracking-wider block">
                  Global Delivery Conditions & Surcharges
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                  <label className="flex items-center space-x-2 bg-white p-2 rounded-lg border border-slate-200 cursor-pointer hover:border-orange-400 transition">
                    <input
                      type="checkbox"
                      checked={isNightDelivery}
                      onChange={(e) => setIsNightDelivery(e.target.checked)}
                      className="rounded border-slate-300 text-orange-500 focus:ring-orange-500"
                    />
                    <Moon className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                    <span className="font-semibold text-slate-800">Night Delivery (+{rules.night_delivery_surcharge_pct}%)</span>
                  </label>

                  <label className="flex items-center space-x-2 bg-white p-2 rounded-lg border border-slate-200 cursor-pointer hover:border-orange-400 transition">
                    <input
                      type="checkbox"
                      checked={isRemoteArea}
                      onChange={(e) => setIsRemoteArea(e.target.checked)}
                      className="rounded border-slate-300 text-orange-500 focus:ring-orange-500"
                    />
                    <ShieldAlert className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                    <span className="font-semibold text-slate-800">Remote Area (+{rules.remote_area_surcharge_pct}%)</span>
                  </label>

                  <label className="flex items-center space-x-2 bg-white p-2 rounded-lg border border-slate-200 cursor-pointer hover:border-orange-400 transition">
                    <input
                      type="checkbox"
                      checked={includeDriverAllowance}
                      onChange={(e) => setIncludeDriverAllowance(e.target.checked)}
                      className="rounded border-slate-300 text-orange-500 focus:ring-orange-500"
                    />
                    <Clock className="w-3.5 h-3.5 text-cyan-600 shrink-0" />
                    <span className="font-semibold text-slate-800">Crew Allowance</span>
                  </label>
                </div>
              </div>
            </div>

            {/* RIGHT 5 COLS: CONSOLIDATED LOGISTICS QUOTE & PROJECT ATTACHMENT */}
            <div className="lg:col-span-5 space-y-4">
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-md text-white space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                  <span className="text-xs font-black uppercase tracking-wider text-orange-400 flex items-center space-x-1.5">
                    <Calculator className="w-4 h-4 text-orange-400" />
                    <span>Consolidated Logistics Quote</span>
                  </span>
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/30 font-bold uppercase">
                    Live Multi-Ride
                  </span>
                </div>

                {/* SUMMARY STATS BAR */}
                <div className="grid grid-cols-3 gap-2 bg-slate-950 p-2.5 rounded-lg border border-slate-800 text-center font-mono">
                  <div>
                    <span className="text-[9px] text-slate-400 uppercase block">Total Rides</span>
                    <span className="font-bold text-white text-sm">{supplyLegs.length} Rides</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-400 uppercase block">Cargo Weight</span>
                    <span className="font-bold text-amber-400 text-sm">{totalCargoWeightKg.toLocaleString()} kg</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-400 uppercase block">Total Distance</span>
                    <span className="font-bold text-cyan-400 text-sm">{totalMileageKm} KM</span>
                  </div>
                </div>

                {/* ITEMIZED BREAKDOWN */}
                <div className="space-y-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Supply Route Cost Breakdown
                  </span>
                  <div className="bg-slate-950 rounded-lg p-3 border border-slate-800 space-y-2 text-xs font-mono">
                    {supplyLegs.map((leg, i) => (
                      <div key={leg.id} className="flex items-start justify-between text-slate-300 text-[11px]">
                        <div>
                          <span className="font-bold text-slate-200 block">Ride {i + 1}: {leg.material_category}</span>
                          <span className="text-[10px] text-slate-400 font-sans block">{leg.supplier_name} ({leg.distance_km} KM)</span>
                        </div>
                        <span className="font-bold text-white">Rs. {leg.leg_cost.toLocaleString()}</span>
                      </div>
                    ))}

                    {isNightDelivery && (
                      <div className="flex items-center justify-between text-indigo-300 text-[11px] pt-1 border-t border-slate-800">
                        <span>Night Surcharge (+{rules.night_delivery_surcharge_pct}%)</span>
                        <span>Rs. {nightSurchargeAmount.toLocaleString()}</span>
                      </div>
                    )}

                    {isRemoteArea && (
                      <div className="flex items-center justify-between text-amber-300 text-[11px] pt-1 border-t border-slate-800">
                        <span>Remote Terrain Surcharge (+{rules.remote_area_surcharge_pct}%)</span>
                        <span>Rs. {remoteSurchargeAmount.toLocaleString()}</span>
                      </div>
                    )}

                    {includeDriverAllowance && (
                      <div className="flex items-center justify-between text-cyan-300 text-[11px] pt-1 border-t border-slate-800">
                        <span>Crew & Driver Allowance ({supplyLegs.length} trips)</span>
                        <span>Rs. {totalCrewAllowance.toLocaleString()}</span>
                      </div>
                    )}

                    <div className="border-t-2 border-slate-800 pt-2 flex items-center justify-between font-extrabold text-sm text-white">
                      <span>Total Logistics Cost</span>
                      <span className="text-emerald-400 text-lg font-mono">
                        Rs. {grandTotalMultiLegCost.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* SMART OPTIMIZATION RECOMMENDATION */}
                <div className="bg-slate-800/90 border border-slate-700 p-3 rounded-lg space-y-1">
                  <span className="text-[10px] font-bold text-orange-400 uppercase tracking-wider flex items-center space-x-1">
                    <Info className="w-3.5 h-3.5" />
                    <span>Supply Route Optimization Insight</span>
                  </span>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    {supplyLegs.length > 2 
                      ? `Consolidating Accessories & Screws into 1 combined ride from Baseline Depot can reduce total mileage by 12 KM and save approx Rs. 3,800.`
                      : `Route is currently optimized for direct supplier-to-site delivery.`}
                  </p>
                </div>

                {/* ATTACH TO PROJECT BUTTON */}
                <button
                  type="button"
                  onClick={handleAttachLogisticsToProject}
                  disabled={!selectedQuotation}
                  className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-black text-xs py-3 rounded-xl shadow-md transition flex items-center justify-center space-x-2 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>
                    {selectedQuotation 
                      ? `Attach Rs. ${grandTotalMultiLegCost.toLocaleString()} to Project #${selectedQuotation.quotation_number}`
                      : `Select a Project Above to Attach Cost`
                    }
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODE 2: MATERIAL SUPPLIERS & PICKUP HUBS REGISTRY */}
      {/* ========================================================================= */}
      {activeViewMode === 'SUPPLIERS_REGISTRY' && (
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-black text-slate-900 text-sm uppercase tracking-wider flex items-center space-x-2">
                <Building2 className="w-5 h-5 text-orange-500" />
                <span>Material Suppliers & Pickup Hubs Registry ({suppliers.length})</span>
              </h3>
              <p className="text-xs text-slate-500">Manage external suppliers for aluminium profiles, glass, hardware, fasteners, and heavy machinery hire.</p>
            </div>

            <button
              type="button"
              onClick={() => {
                setEditingSupplier(null);
                setSupName('');
                setSupLoc('');
                setShowSupplierModal(true);
              }}
              className="bg-orange-500 hover:bg-orange-600 text-white px-3.5 py-2 rounded-lg text-xs font-bold transition flex items-center space-x-1.5 shadow-2xs cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>+ Register New Supplier</span>
            </button>
          </div>

          {/* SEARCH & CATEGORY FILTERS */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div className="relative w-full sm:w-72">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search supplier, location, district..."
                value={supplierSearchTerm}
                onChange={(e) => setSupplierSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-orange-500"
              />
            </div>

            <div className="flex items-center gap-1 overflow-x-auto text-[10px] w-full sm:w-auto">
              {['ALL', 'Aluminium Profiles', 'Glass Sheets', 'Hardware & Accessories', 'Screws & Fasteners', 'Heavy Equipment & Crane Hire'].map(cat => (
                <button
                  key={cat}
                  onClick={() => setSupplierCategoryFilter(cat)}
                  className={`px-2.5 py-1 rounded font-bold whitespace-nowrap cursor-pointer ${
                    supplierCategoryFilter === cat ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* SUPPLIERS TABLE */}
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900 text-white font-bold uppercase text-[10px]">
                <tr>
                  <th className="p-3">Supplier & Yard Name</th>
                  <th className="p-3">Material Category</th>
                  <th className="p-3">Pickup Location / District</th>
                  <th className="p-3">Default Fleet Vehicle</th>
                  <th className="p-3 text-right">Base Pickup Fee</th>
                  <th className="p-3 text-right">Per KM Rate</th>
                  <th className="p-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                {suppliers
                  .filter(s => {
                    const matchesSearch = s.supplier_name.toLowerCase().includes(supplierSearchTerm.toLowerCase()) ||
                      s.location_name.toLowerCase().includes(supplierSearchTerm.toLowerCase());
                    const matchesCat = supplierCategoryFilter === 'ALL' ? true : s.material_category === supplierCategoryFilter;
                    return matchesSearch && matchesCat;
                  })
                  .map(s => (
                    <tr key={s.id} className="hover:bg-slate-50">
                      <td className="p-3 font-sans">
                        <span className="font-bold text-slate-900 block text-xs">{s.supplier_name}</span>
                        {s.contact_phone && <span className="text-[10px] text-slate-400 flex items-center mt-0.5"><Phone className="w-3 h-3 mr-1" />{s.contact_phone}</span>}
                      </td>
                      <td className="p-3 font-sans">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-orange-50 text-orange-800 border border-orange-200">
                          {s.material_category}
                        </span>
                      </td>
                      <td className="p-3 font-sans text-slate-700">
                        {s.location_name} {s.district && <span className="text-slate-400">({s.district})</span>}
                      </td>
                      <td className="p-3 font-sans text-slate-800 font-semibold">
                        {s.default_vehicle_type || 'Flatbed Lorry'}
                      </td>
                      <td className="p-3 text-right font-bold text-slate-900">
                        Rs. {s.base_pickup_fee.toLocaleString()}
                      </td>
                      <td className="p-3 text-right font-bold text-emerald-700">
                        Rs. {s.per_km_rate} / KM
                      </td>
                      <td className="p-3 text-center">
                        <div className="flex items-center justify-center space-x-1">
                          <button
                            onClick={() => {
                              setEditingSupplier(s);
                              setSupName(s.supplier_name);
                              setSupCat(s.material_category);
                              setSupLoc(s.location_name);
                              setSupDistrict(s.district || 'Colombo');
                              setSupPhone(s.contact_phone || '');
                              setSupDefaultVehicle(s.default_vehicle_type || 'Medium Flatbed Lorry (5 Ton)');
                              setSupBaseFee(s.base_pickup_fee);
                              setSupPerKmRate(s.per_km_rate);
                              setShowSupplierModal(true);
                            }}
                            className="p-1 text-slate-600 hover:text-orange-600 hover:bg-orange-50 rounded cursor-pointer"
                            title="Edit supplier details"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteSupplier(s.id)}
                            className="p-1 text-rose-600 hover:bg-rose-50 rounded cursor-pointer"
                            title="Delete supplier"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODE 3: FLEET BENCHMARKS & SURCHARGE SETTINGS */}
      {/* ========================================================================= */}
      {activeViewMode === 'FLEET_BENCHMARKS' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Master Fleet Rates */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h4 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider flex items-center space-x-1.5">
                <Truck className="w-4 h-4 text-orange-500" />
                <span>Master Fleet Vehicles & Capacities</span>
              </h4>
              {isHO && <span className="text-[10px] text-orange-600 font-bold">(Editable by Head Office)</span>}
            </div>

            <div className="space-y-2 text-xs">
              {vehicles.map(v => (
                <div key={v.id} className="bg-slate-50 border border-slate-200 p-3 rounded-lg flex items-center justify-between">
                  <div>
                    <span className="font-bold text-slate-900 block text-xs">{v.type}</span>
                    <span className="text-[10px] text-slate-500 font-medium">
                      Payload Cap: {v.capacity_kg} kg | Max Length: {v.max_length_m}m
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="font-mono text-emerald-700 font-bold block text-xs">
                      Base: Rs. {v.base_charge.toLocaleString()}
                    </span>
                    <span className="text-[10px] text-slate-500 font-medium">
                      + Rs. {v.per_km_rate} / KM
                    </span>
                  </div>
                  {isHO && (
                    <button
                      onClick={() => {
                        setEditingVehicle(v);
                        setVBaseChargeInput(v.base_charge.toString());
                        setVPerKmInput(v.per_km_rate.toString());
                      }}
                      className="ml-2 px-2.5 py-1 bg-white hover:bg-orange-50 text-orange-600 border border-slate-200 hover:border-orange-300 rounded text-[11px] font-bold transition cursor-pointer"
                    >
                      Edit
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Global Transport Rules */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h4 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider flex items-center space-x-1.5">
                <Fuel className="w-4 h-4 text-orange-500" />
                <span>Fuel Surcharge & Driver Allowance Rules</span>
              </h4>
              <button
                onClick={() => {
                  setFuelPriceInput(rules.fuel_price_per_l.toString());
                  setDriverAllowanceInput(rules.driver_allowance.toString());
                  setShowRulesModal(true);
                }}
                className="bg-orange-500 hover:bg-orange-600 text-white px-3 py-1 rounded text-xs font-bold transition shadow-2xs cursor-pointer"
              >
                Adjust Benchmarks
              </button>
            </div>

            <div className="space-y-2 text-xs font-mono">
              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 flex items-center justify-between">
                <span className="font-sans font-semibold text-slate-700">Diesel Fuel Price Index</span>
                <span className="font-bold text-slate-900">Rs. {rules.fuel_price_per_l} / Liter</span>
              </div>

              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 flex items-center justify-between">
                <span className="font-sans font-semibold text-slate-700">Driver & Crew Allowance</span>
                <span className="font-bold text-slate-900">Rs. {rules.driver_allowance.toLocaleString()} / Trip</span>
              </div>

              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 flex items-center justify-between">
                <span className="font-sans font-semibold text-slate-700">Night Delivery Surcharge Rate</span>
                <span className="font-bold text-indigo-700">+{rules.night_delivery_surcharge_pct}%</span>
              </div>

              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 flex items-center justify-between">
                <span className="font-sans font-semibold text-slate-700">Remote Area Surcharge Rate</span>
                <span className="font-bold text-amber-700">+{rules.remote_area_surcharge_pct}%</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUPPLIER CREATE / EDIT MODAL */}
      {showSupplierModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <form onSubmit={handleSaveSupplier} className="bg-white border border-slate-200 rounded-xl max-w-md w-full p-5 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <h3 className="font-black text-slate-900 text-xs uppercase flex items-center space-x-1.5">
                <Building2 className="w-4 h-4 text-orange-500" />
                <span>{editingSupplier ? 'Edit Supplier Details' : 'Register New Material Supplier'}</span>
              </h3>
              <button type="button" onClick={() => setShowSupplierModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Supplier / Yard Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Lanka Aluminium Extrusions Yard"
                  value={supName}
                  onChange={(e) => setSupName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-semibold focus:border-orange-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Material Category</label>
                  <select
                    value={supCat}
                    onChange={(e) => setSupCat(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-semibold focus:border-orange-500 focus:outline-none"
                  >
                    <option value="Aluminium Profiles">Aluminium Profiles</option>
                    <option value="Glass Sheets">Glass Sheets</option>
                    <option value="Hardware & Accessories">Hardware & Accessories</option>
                    <option value="Screws & Fasteners">Screws & Fasteners</option>
                    <option value="Heavy Equipment & Crane Hire">Heavy Equipment & Crane Hire</option>
                    <option value="ACP & Composite Boards">ACP & Composite Boards</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">District Location</label>
                  <input
                    type="text"
                    value={supDistrict}
                    onChange={(e) => setSupDistrict(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-semibold focus:border-orange-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Pickup Location / Yard Address</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ekala Industrial Zone, Ja-Ela"
                  value={supLoc}
                  onChange={(e) => setSupLoc(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-semibold focus:border-orange-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Base Pickup Fee (LKR)</label>
                  <input
                    type="number"
                    min="0"
                    value={supBaseFee}
                    onChange={(e) => setSupBaseFee(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 font-mono font-bold text-slate-900 focus:border-orange-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Rate Per KM (LKR)</label>
                  <input
                    type="number"
                    min="0"
                    value={supPerKmRate}
                    onChange={(e) => setSupPerKmRate(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 font-mono font-bold text-slate-900 focus:border-orange-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowSupplierModal(false)}
                className="px-3.5 py-2 bg-slate-100 text-slate-700 rounded-lg text-xs font-bold hover:bg-slate-200 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs rounded-lg transition shadow-2xs cursor-pointer"
              >
                Save Supplier
              </button>
            </div>
          </form>
        </div>
      )}

      {/* EDIT VEHICLE MODAL */}
      {editingVehicle && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-xl max-w-sm w-full p-4 space-y-3 shadow-lg">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="text-xs font-black text-slate-900 uppercase">Edit Fleet Rate: {editingVehicle.type}</h3>
              <button onClick={() => setEditingVehicle(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2.5 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Base Charge (LKR)</label>
                <input
                  type="number"
                  value={vBaseChargeInput}
                  onChange={(e) => setVBaseChargeInput(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-slate-900 font-bold focus:border-orange-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Rate Per KM (LKR)</label>
                <input
                  type="number"
                  value={vPerKmInput}
                  onChange={(e) => setVPerKmInput(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-slate-900 font-bold focus:border-orange-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setEditingVehicle(null)}
                className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg text-xs font-bold hover:bg-slate-200 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveVehicleRates}
                className="px-3 py-1.5 bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs rounded-lg transition shadow-2xs cursor-pointer"
              >
                Save Rate Card
              </button>
            </div>
          </div>
        </div>
      )}

      {/* BENCHMARKS MODAL */}
      {showRulesModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-xl max-w-sm w-full p-4 space-y-3 shadow-lg">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="text-xs font-black text-slate-900 uppercase">Adjust Fuel & Fleet Benchmarks</h3>
              <button onClick={() => setShowRulesModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2.5 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Diesel Fuel Price / Liter (LKR)</label>
                <input
                  type="number"
                  value={fuelPriceInput}
                  onChange={(e) => setFuelPriceInput(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-slate-900 font-bold focus:border-orange-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Default Crew Allowance / Trip (LKR)</label>
                <input
                  type="number"
                  value={driverAllowanceInput}
                  onChange={(e) => setDriverAllowanceInput(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-slate-900 font-bold focus:border-orange-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setShowRulesModal(false)}
                className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg text-xs font-bold hover:bg-slate-200 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveGlobalRules}
                className="px-3 py-1.5 bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs rounded-lg transition shadow-2xs cursor-pointer"
              >
                Save Benchmarks
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SEARCHABLE PROJECT SELECTION & SYNCHRONIZATION MODAL */}
      {showProjectSearchModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[85vh] flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="bg-slate-900 text-white p-4 flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-lg bg-orange-500 text-white flex items-center justify-center shadow-xs">
                  <Search className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-black text-sm uppercase tracking-wider text-white">
                    SELECT PROJECT TO SYNCHRONIZE LOGISTICS
                  </h3>
                  <p className="text-xs text-slate-400">
                    Search through active quotations and sync material specs, cargo weights, and site addresses directly to transport calculator.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowProjectSearchModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Search Bar & Filters */}
            <div className="p-4 bg-slate-50 border-b border-slate-200 space-y-3">
              <div className="flex flex-col sm:flex-row items-center gap-3">
                <div className="relative grow w-full">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={projectSearchQuery}
                    onChange={(e) => setProjectSearchQuery(e.target.value)}
                    placeholder="Search by quote #, customer name, phone, site address, item..."
                    className="w-full bg-white border border-slate-300 rounded-xl pl-9 pr-8 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:border-orange-500 transition shadow-2xs"
                    autoFocus
                  />
                  {projectSearchQuery && (
                    <button
                      type="button"
                      onClick={() => setProjectSearchQuery('')}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Status Filter Tabs */}
                <div className="flex items-center space-x-1 bg-white p-1 rounded-xl border border-slate-200 shrink-0 w-full sm:w-auto overflow-x-auto">
                  {(['ALL', 'VALIDATED', 'PENDING', 'DRAFTS'] as const).map(st => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setProjectStatusFilter(st)}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                        projectStatusFilter === st
                          ? 'bg-orange-500 text-white shadow-2xs'
                          : 'text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {st === 'ALL' ? 'All' : st === 'VALIDATED' ? 'Validated' : st === 'PENDING' ? 'Pending' : 'Drafts'}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Results Grid List */}
            <div className="p-4 overflow-y-auto grow space-y-2.5">
              {filteredQuotations.length === 0 ? (
                <div className="text-center py-12 space-y-2 text-slate-400">
                  <FileText className="w-10 h-10 mx-auto text-slate-300" />
                  <p className="text-xs font-bold text-slate-600">No project quotations match your search criteria</p>
                  <p className="text-[11px] text-slate-400">Try adjusting your search query or status filter.</p>
                </div>
              ) : (
                filteredQuotations.map(q => {
                  const isSelected = q.id === selectedProjectQuoteId || q.quotation_number === selectedProjectQuoteId;
                  const itemsCount = q.items?.length || 0;
                  const totalWeightKg = q.items?.reduce((acc, it) => acc + ((it.weight_kg || 1) * (it.quantity || 1)), 0) || 0;

                  return (
                    <div
                      key={q.id}
                      className={`p-3.5 rounded-xl border transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                        isSelected 
                          ? 'bg-orange-50/90 border-orange-500 ring-2 ring-orange-500/20' 
                          : 'bg-white border-slate-200 hover:border-orange-300 hover:shadow-2xs'
                      }`}
                    >
                      <div className="space-y-1 grow">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-mono font-black text-slate-900 text-xs bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-md">
                            #{q.quotation_number}
                          </span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                            q.status === 'Validated Official' || q.status === 'Approved' || q.status === 'Verified Quote'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : q.status === 'Pending HO Validation' || q.status === 'Pending Approval'
                              ? 'bg-amber-50 text-amber-700 border-amber-200'
                              : 'bg-slate-100 text-slate-700 border-slate-200'
                          }`}>
                            {q.status}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            Date: {q.date || 'Today'}
                          </span>
                        </div>

                        <div className="font-extrabold text-slate-900 text-sm">
                          {q.customer_name} {q.customer_phone ? `(${q.customer_phone})` : ''}
                        </div>

                        <div className="text-xs text-slate-600 flex flex-wrap items-center gap-x-3 gap-y-1">
                          <span className="flex items-center space-x-1">
                            <MapPin className="w-3.5 h-3.5 text-orange-500" />
                            <span>{q.site_location_name || q.site_address || 'Site Location Unspecified'}</span>
                          </span>
                          <span>•</span>
                          <span className="font-mono text-slate-700">
                            📦 {itemsCount} Items • Est. Cargo Weight: <strong>{totalWeightKg.toLocaleString()} kg</strong>
                          </span>
                        </div>
                      </div>

                      <div className="flex sm:flex-col items-center sm:items-end justify-between border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100 shrink-0 space-y-1">
                        <div>
                          <span className="text-[10px] text-slate-400 block font-mono uppercase text-right">Net Quote Total</span>
                          <span className="font-mono font-black text-slate-900 text-sm">
                            Rs. {(q.net_total || 0).toLocaleString()}
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleSelectProject(q.id, true)}
                          className={`text-xs font-bold px-3 py-1.5 rounded-lg flex items-center space-x-1.5 transition cursor-pointer ${
                            isSelected
                              ? 'bg-emerald-600 text-white shadow-2xs'
                              : 'bg-orange-500 hover:bg-orange-600 text-white shadow-2xs'
                          }`}
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                          <span>{isSelected ? 'Proceed to Sync Cargo' : 'Select & Sync'}</span>
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-3.5 bg-slate-100 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600">
              <span>Showing {filteredQuotations.length} of {quotations.length} active projects</span>
              <button
                type="button"
                onClick={() => setShowProjectSearchModal(false)}
                className="bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold px-4 py-1.5 rounded-lg transition cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
