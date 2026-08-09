import React, { useState, useMemo } from 'react';
import { 
  Package, 
  PackageCheck, 
  Plus, 
  Trash2, 
  Edit3, 
  ShoppingBag, 
  Search, 
  ChevronDown, 
  ChevronUp, 
  Layers, 
  Percent, 
  CheckCircle2, 
  X, 
  Copy, 
  Printer, 
  Info, 
  Sliders, 
  ArrowRight,
  ShieldCheck,
  Zap,
  Sparkles
} from 'lucide-react';
import { 
  PackedWorkPackage, 
  PackedWorkVariantItem, 
  Product, 
  CategoryType, 
  ProductUnit, 
  MaterialThickness, 
  MaterialFinish, 
  GlassType, 
  QuotationItem 
} from '../types';

interface PackedWorkManagementProps {
  packages: PackedWorkPackage[];
  products: Product[];
  onSavePackage: (pkg: PackedWorkPackage) => void;
  onDeletePackage: (id: string) => void;
  onProceedToQuotation?: (item: QuotationItem) => void;
  initialSelectedProductIds?: string[];
  onClearInitialSelections?: () => void;
}

export const PackedWorkManagement: React.FC<PackedWorkManagementProps> = ({
  packages,
  products,
  onSavePackage,
  onDeletePackage,
  onProceedToQuotation,
  initialSelectedProductIds = [],
  onClearInitialSelections
}) => {
  // Filter & Search State
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [expandedPackageId, setExpandedPackageId] = useState<string | null>(packages[0]?.id || null);

  // Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Designer Modal State
  const [isDesignerOpen, setIsDesignerOpen] = useState(false);
  const [editingPkg, setEditingPkg] = useState<PackedWorkPackage | null>(null);

  // Designer Form Fields
  const [pkgCode, setPkgCode] = useState('');
  const [pkgName, setPkgName] = useState('');
  const [pkgCategory, setPkgCategory] = useState<CategoryType>('Aluminium Profiles');
  const [pkgDescription, setPkgDescription] = useState('');
  const [pkgDiscountPct, setPkgDiscountPct] = useState<number>(5);
  const [pkgComplexity, setPkgComplexity] = useState<'Low' | 'Medium' | 'High' | 'Expert'>('Medium');
  const [pkgItems, setPkgItems] = useState<PackedWorkVariantItem[]>([]);

  // Variant selector in designer
  const [selectedProdId, setSelectedProdId] = useState<string>('');
  const [itemQty, setItemQty] = useState<number>(1);
  const [itemThickness, setItemThickness] = useState<MaterialThickness>('1.2mm');
  const [itemFinish, setItemFinish] = useState<MaterialFinish>('Powder Coated');
  const [itemGlass, setItemGlass] = useState<GlassType>('Clear Glass');
  const [itemColour, setItemColour] = useState<string>('White');
  const [itemHardware, setItemHardware] = useState<string>('');
  const [itemNotes, setItemNotes] = useState<string>('');

  // Handle opening designer pre-populated from selected SKUs
  React.useEffect(() => {
    if (initialSelectedProductIds && initialSelectedProductIds.length > 0) {
      const selectedProds = products.filter(p => initialSelectedProductIds.includes(p.id));
      if (selectedProds.length > 0) {
        const constructedItems: PackedWorkVariantItem[] = selectedProds.map((p, idx) => ({
          id: `pwi-init-${Date.now()}-${idx}`,
          product_id: p.id,
          product_code: p.product_code,
          product_name: p.product_name,
          category: p.category,
          unit: p.unit,
          quantity: 1,
          unit_price: p.current_price || p.base_price || 0,
          thickness_applied: '1.2mm',
          finish_applied: 'Powder Coated',
          unit_weight_kg: p.unit_weight_kg || 1,
          notes: p.variant_name || 'Selected Catalog Variant'
        }));

        setEditingPkg(null);
        setPkgCode(`PW-CUST-${Math.floor(100 + Math.random() * 900)}`);
        setPkgName(`Custom Packed Assembly (${selectedProds.length} SKUs)`);
        setPkgCategory(selectedProds[0].category || 'Aluminium Profiles');
        setPkgDescription(`Custom multi-variant package designed from ${selectedProds.length} selected catalog items.`);
        setPkgDiscountPct(5);
        setPkgComplexity('Medium');
        setPkgItems(constructedItems);
        setIsDesignerOpen(true);

        if (onClearInitialSelections) {
          onClearInitialSelections();
        }
      }
    }
  }, [initialSelectedProductIds]);

  // Open Designer for new package
  const handleOpenNewDesigner = () => {
    setEditingPkg(null);
    setPkgCode(`PW-PKG-${Math.floor(100 + Math.random() * 900)}`);
    setPkgName('');
    setPkgCategory('Aluminium Profiles');
    setPkgDescription('');
    setPkgDiscountPct(5);
    setPkgComplexity('Medium');
    setPkgItems([]);
    setIsDesignerOpen(true);
  };

  // Open Designer to edit existing
  const handleOpenEditDesigner = (pkg: PackedWorkPackage) => {
    setEditingPkg(pkg);
    setPkgCode(pkg.package_code);
    setPkgName(pkg.package_name);
    setPkgCategory(pkg.category);
    setPkgDescription(pkg.description);
    setPkgDiscountPct(pkg.bundle_discount_pct || 0);
    setPkgComplexity(pkg.installation_complexity || 'Medium');
    setPkgItems([...pkg.items]);
    setIsDesignerOpen(true);
  };

  // Add Variant Item to Designer Draft
  const handleAddVariantToPackage = () => {
    if (!selectedProdId) return;
    const prod = products.find(p => p.id === selectedProdId);
    if (!prod) return;

    const newItem: PackedWorkVariantItem = {
      id: `pwi-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      product_id: prod.id,
      product_code: prod.product_code,
      product_name: prod.product_name,
      category: prod.category,
      unit: prod.unit,
      quantity: Math.max(1, itemQty),
      unit_price: prod.current_price || prod.base_price || 0,
      thickness_applied: itemThickness,
      finish_applied: itemFinish,
      glass_type_applied: itemGlass,
      colour_applied: itemColour as any,
      hardware_spec: itemHardware || undefined,
      unit_weight_kg: prod.unit_weight_kg || 1,
      notes: itemNotes || undefined
    };

    setPkgItems(prev => [...prev, newItem]);
    setSelectedProdId('');
    setItemQty(1);
    setItemHardware('');
    setItemNotes('');
  };

  // Remove Variant Item from Designer Draft
  const handleRemoveVariantFromPackage = (itemId: string) => {
    setPkgItems(prev => prev.filter(i => i.id !== itemId));
  };

  // Update item quantity in draft
  const handleUpdateItemQty = (itemId: string, delta: number) => {
    setPkgItems(prev => prev.map(item => {
      if (item.id === itemId) {
        const nextQty = Math.max(1, item.quantity + delta);
        return { ...item, quantity: nextQty };
      }
      return item;
    }));
  };

  // Designer Calculations
  const designerListTotal = useMemo(() => {
    return pkgItems.reduce((acc, item) => acc + (item.unit_price * item.quantity), 0);
  }, [pkgItems]);

  const designerPackageTotal = useMemo(() => {
    const discountAmt = Math.round(designerListTotal * (pkgDiscountPct / 100));
    return Math.max(0, designerListTotal - discountAmt);
  }, [designerListTotal, pkgDiscountPct]);

  // Save Package Handler
  const handleSavePackageTemplate = (andAddToPOS: boolean = false) => {
    if (!pkgCode.trim() || !pkgName.trim()) {
      alert('Please fill in the Package Code and Package Name.');
      return;
    }
    if (pkgItems.length === 0) {
      alert('Please add at least one product variant to this Packed Work package.');
      return;
    }

    const newPkg: PackedWorkPackage = {
      id: editingPkg ? editingPkg.id : `pw-${Date.now()}`,
      package_code: pkgCode.toUpperCase().trim(),
      package_name: pkgName.trim(),
      description: pkgDescription.trim() || 'Custom Multi-Variant Packed Work Assembly',
      category: pkgCategory,
      bundle_discount_pct: pkgDiscountPct,
      installation_complexity: pkgComplexity,
      items: pkgItems,
      total_list_price: designerListTotal,
      total_package_price: designerPackageTotal,
      status: 'Active',
      created_at: editingPkg ? editingPkg.created_at : new Date().toISOString(),
      updated_by: 'POS Operator'
    };

    onSavePackage(newPkg);
    setIsDesignerOpen(false);

    showToast(`Saved Packed Work "${newPkg.package_code} - ${newPkg.package_name}"!`);

    if (andAddToPOS) {
      handleDispatchPackedWorkToPOS(newPkg);
    }
  };

  // DISPATCH ENTIRE PACKED WORK TO POS PANEL SIMULTANEOUSLY
  const handleDispatchPackedWorkToPOS = (pkg: PackedWorkPackage) => {
    if (!pkg || !pkg.items || pkg.items.length === 0) return;

    // Convert Packed Work Variants to QuotationItems with bundle discount proportionally applied
    const discountFactor = 1 - (pkg.bundle_discount_pct / 100);

    const quotationItemsToAdd: QuotationItem[] = pkg.items.map(v => {
      const discountedUnitPrice = Math.round(v.unit_price * discountFactor);
      return {
        id: `qi-pw-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        product_id: v.product_id,
        product_code: v.product_code,
        product_name: `${v.product_name} (${pkg.package_code})`,
        unit: v.unit as ProductUnit,
        unit_price: discountedUnitPrice,
        quantity: v.quantity,
        weight_kg: v.unit_weight_kg || 1,
        total_price: discountedUnitPrice * v.quantity,
        thickness_applied: v.thickness_applied,
        finish_applied: v.finish_applied,
        glass_type_applied: v.glass_type_applied,
        colour_applied: v.colour_applied,
        packed_work_id: pkg.id,
        packed_work_name: pkg.package_name,
        price_source_label: `Packed Work Bundle (${pkg.bundle_discount_pct}% Off)`,
        breakdown_notes: [
          `Component of ${pkg.package_code} - ${pkg.package_name}`,
          v.notes || 'Packed Variant'
        ]
      };
    });

    // Dispatch via window CustomEvent so RightBillingOrderPanel receives ALL items simultaneously
    window.dispatchEvent(new CustomEvent('innovista_add_multiple_items_to_cart', {
      detail: {
        items: quotationItemsToAdd,
        packageInfo: {
          id: pkg.id,
          code: pkg.package_code,
          name: pkg.package_name
        }
      }
    }));

    // If single item handler provided as fallback, add the first one
    if (onProceedToQuotation && quotationItemsToAdd.length > 0) {
      onProceedToQuotation(quotationItemsToAdd[0]);
    }

    showToast(`🚀 Dispatched ${pkg.items.length} product variants from "${pkg.package_code}" simultaneously to POS Cart!`);
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Filtered packages list
  const filteredPackages = useMemo(() => {
    return packages.filter(pkg => {
      const matchSearch = searchTerm === '' || 
        pkg.package_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pkg.package_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pkg.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pkg.items.some(i => i.product_name.toLowerCase().includes(searchTerm.toLowerCase()) || i.product_code.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchCat = selectedCategory === 'All' || pkg.category === selectedCategory;

      return matchSearch && matchCat;
    });
  }, [packages, searchTerm, selectedCategory]);

  return (
    <div className="space-y-4">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-[#0F203C] text-white px-4 py-3 rounded-lg shadow-xl border border-orange-500/50 flex items-center space-x-3 animate-bounce">
          <Sparkles className="w-5 h-5 text-orange-400 shrink-0" />
          <span className="text-xs font-bold">{toastMessage}</span>
        </div>
      )}

      {/* BANNER HEADER */}
      <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-[#0F203C] text-white p-4 rounded-xl shadow-md border border-purple-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-purple-500/20 border border-purple-400/40 text-purple-300 flex items-center justify-center">
              <PackageCheck className="w-5 h-5" />
            </div>
            <h2 className="text-base font-extrabold tracking-tight uppercase flex items-center gap-2">
              <span>Packed Works & Variant Assembly Designer</span>
              <span className="bg-purple-500/30 text-purple-200 border border-purple-400/30 text-[10px] px-2 py-0.5 rounded-full font-mono">
                {packages.length} Ready Bundles
              </span>
            </h2>
          </div>
          <p className="text-xs text-purple-200/80 max-w-3xl">
            Design, assemble, and group multiple product variants into unified multi-variant packed work packages. Select and add entire multi-SKU assemblies simultaneously into the POS panel with 1 click.
          </p>
        </div>

        <button
          onClick={handleOpenNewDesigner}
          className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-xs font-black shadow-lg hover:shadow-orange-500/20 transition inline-flex items-center space-x-2 shrink-0 border border-orange-400"
        >
          <Plus className="w-4 h-4" />
          <span>Design New Packed Work</span>
        </button>
      </div>

      {/* FILTER & SEARCH BAR */}
      <div className="bg-white border border-slate-200 rounded-lg p-3 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search packed works by code, name, description, or contained variant SKUs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-200 rounded-md focus:outline-none focus:border-purple-500 bg-slate-50 focus:bg-white transition"
          />
        </div>

        <div className="flex items-center space-x-2 overflow-x-auto pb-1 sm:pb-0">
          {['All', 'Aluminium Profiles', 'Glass Sheets', 'Hardware & Accessories'].map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-md text-xs font-bold transition whitespace-nowrap ${
                selectedCategory === cat
                  ? 'bg-purple-700 text-white shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* PACKED WORKS LIST / GRID */}
      <div className="grid grid-cols-1 gap-4">
        {filteredPackages.length === 0 ? (
          <div className="bg-white border border-dashed border-slate-300 rounded-xl p-8 text-center text-slate-500 space-y-3">
            <Package className="w-12 h-12 text-slate-300 mx-auto" />
            <p className="text-sm font-bold text-slate-700">No Packed Work Packages Found</p>
            <p className="text-xs text-slate-500">Try adjusting your search criteria or create a new packed work package.</p>
            <button
              onClick={handleOpenNewDesigner}
              className="bg-purple-700 hover:bg-purple-800 text-white px-4 py-2 rounded-md text-xs font-bold inline-flex items-center space-x-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Create First Packed Work</span>
            </button>
          </div>
        ) : (
          filteredPackages.map(pkg => {
            const isExpanded = expandedPackageId === pkg.id;
            const discountAmt = Math.round(pkg.total_list_price * ((pkg.bundle_discount_pct || 0) / 100));

            return (
              <div 
                key={pkg.id} 
                className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden hover:border-purple-300 transition"
              >
                {/* PACKAGE HEADER BAR */}
                <div className="p-4 bg-slate-50/80 border-b border-slate-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="bg-purple-900 text-white text-xs font-black font-mono px-2.5 py-0.5 rounded shadow-xs">
                        {pkg.package_code}
                      </span>
                      <h3 className="text-sm font-black text-slate-900">
                        {pkg.package_name}
                      </h3>
                      <span className="bg-slate-200 text-slate-700 text-[10px] font-bold px-2 py-0.5 rounded">
                        {pkg.category}
                      </span>
                      {pkg.installation_complexity && (
                        <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded ${
                          pkg.installation_complexity === 'Low' ? 'bg-emerald-100 text-emerald-800' :
                          pkg.installation_complexity === 'Medium' ? 'bg-blue-100 text-blue-800' :
                          pkg.installation_complexity === 'High' ? 'bg-amber-100 text-amber-800' :
                          'bg-rose-100 text-rose-800'
                        }`}>
                          {pkg.installation_complexity} Complexity
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-600 line-clamp-2">
                      {pkg.description}
                    </p>
                  </div>

                  {/* PRICE & POS DISPATCH ACTION BUTTON */}
                  <div className="flex flex-wrap items-center gap-3 shrink-0 self-end md:self-center">
                    <div className="text-right">
                      <div className="flex items-center justify-end space-x-1.5">
                        <span className="text-xs text-slate-400 line-through font-mono">
                          LKR {pkg.total_list_price.toLocaleString()}
                        </span>
                        {pkg.bundle_discount_pct > 0 && (
                          <span className="bg-emerald-100 text-emerald-800 font-black text-[10px] px-1.5 py-0.2 rounded border border-emerald-300">
                            -{pkg.bundle_discount_pct}% OFF
                          </span>
                        )}
                      </div>
                      <div className="text-base font-black text-purple-950 font-mono">
                        LKR {pkg.total_package_price.toLocaleString()}
                      </div>
                    </div>

                    {/* DISPATCH TO POS BUTTON */}
                    <button
                      onClick={() => handleDispatchPackedWorkToPOS(pkg)}
                      className="bg-orange-500 hover:bg-orange-600 active:scale-95 text-white px-3.5 py-2 rounded-lg text-xs font-black transition flex items-center space-x-2 shadow-md hover:shadow-orange-500/20"
                      title="Add all product variants in this packed work simultaneously to POS Panel"
                    >
                      <ShoppingBag className="w-4 h-4" />
                      <span>Add All to POS Cart</span>
                    </button>

                    {/* TOGGLE EXPAND / EDIT */}
                    <button
                      onClick={() => setExpandedPackageId(isExpanded ? null : pkg.id)}
                      className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-200 rounded-md transition"
                      title="Toggle Variant Components Breakdown"
                    >
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* COMPONENT BREAKDOWN SUMMARY RIBBON */}
                <div className="px-4 py-2 bg-purple-50/50 border-b border-slate-100 text-xs font-semibold text-purple-900 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center space-x-2">
                    <Layers className="w-3.5 h-3.5 text-purple-600" />
                    <span>Includes <strong>{pkg.items.length} Product Variants</strong>: {pkg.items.map(i => `${i.product_code} (${i.quantity} ${i.unit})`).join(', ')}</span>
                  </div>
                  <div className="flex items-center space-x-3 text-[11px]">
                    <button 
                      onClick={() => handleOpenEditDesigner(pkg)}
                      className="text-purple-700 hover:text-purple-950 font-bold underline inline-flex items-center space-x-1"
                    >
                      <Edit3 className="w-3 h-3" />
                      <span>Edit Assembly</span>
                    </button>
                    <button 
                      onClick={() => onDeletePackage(pkg.id)}
                      className="text-rose-600 hover:text-rose-800 font-bold underline inline-flex items-center space-x-1"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Remove</span>
                    </button>
                  </div>
                </div>

                {/* EXPANDED DETAILED VARIANT BREAKDOWN TABLE */}
                {isExpanded && (
                  <div className="p-4 bg-white space-y-3 animate-fadeIn">
                    <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider flex items-center space-x-1.5">
                      <Zap className="w-3.5 h-3.5 text-orange-500" />
                      <span>Packed Work Included Component Variants ({pkg.items.length})</span>
                    </h4>

                    <div className="overflow-x-auto border border-slate-200 rounded-lg">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-100 text-slate-700 font-extrabold uppercase text-[10px]">
                          <tr>
                            <th className="p-2.5">SKU Code</th>
                            <th className="p-2.5">Product Variant Name</th>
                            <th className="p-2.5">Specifications</th>
                            <th className="p-2.5 text-center">Qty</th>
                            <th className="p-2.5 text-right">Unit Rate (LKR)</th>
                            <th className="p-2.5 text-right">Line Total (LKR)</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                          {pkg.items.map((item, idx) => (
                            <tr key={item.id || idx} className="hover:bg-slate-50/80">
                              <td className="p-2.5 font-mono font-bold text-purple-900">{item.product_code}</td>
                              <td className="p-2.5 font-bold">
                                {item.product_name}
                                {item.notes && <div className="text-[10px] text-slate-500 font-normal">{item.notes}</div>}
                              </td>
                              <td className="p-2.5 text-[11px] text-slate-600">
                                <div className="flex flex-wrap gap-1">
                                  {item.thickness_applied && <span className="bg-slate-100 border px-1.5 py-0.2 rounded text-[10px]">{item.thickness_applied}</span>}
                                  {item.finish_applied && <span className="bg-slate-100 border px-1.5 py-0.2 rounded text-[10px]">{item.finish_applied}</span>}
                                  {item.glass_type_applied && <span className="bg-slate-100 border px-1.5 py-0.2 rounded text-[10px]">{item.glass_type_applied}</span>}
                                  {item.colour_applied && <span className="bg-slate-100 border px-1.5 py-0.2 rounded text-[10px]">{item.colour_applied}</span>}
                                  {item.hardware_spec && <span className="bg-amber-50 text-amber-900 border border-amber-200 px-1.5 py-0.2 rounded text-[10px]">{item.hardware_spec}</span>}
                                </div>
                              </td>
                              <td className="p-2.5 text-center font-bold font-mono">
                                {item.quantity} {item.unit}
                              </td>
                              <td className="p-2.5 text-right font-mono">
                                {item.unit_price.toLocaleString()}
                              </td>
                              <td className="p-2.5 text-right font-mono font-bold text-slate-900">
                                {(item.unit_price * item.quantity).toLocaleString()}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot className="bg-slate-50 font-bold border-t border-slate-200 text-xs">
                          <tr>
                            <td colSpan={5} className="p-2.5 text-right uppercase text-slate-600">Component List Subtotal:</td>
                            <td className="p-2.5 text-right font-mono font-bold text-slate-900">LKR {pkg.total_list_price.toLocaleString()}</td>
                          </tr>
                          {pkg.bundle_discount_pct > 0 && (
                            <tr>
                              <td colSpan={5} className="p-2.5 text-right uppercase text-emerald-700">Package Bundle Savings ({pkg.bundle_discount_pct}%):</td>
                              <td className="p-2.5 text-right font-mono font-bold text-emerald-700">- LKR {discountAmt.toLocaleString()}</td>
                            </tr>
                          )}
                          <tr className="bg-purple-100 text-purple-950 font-black">
                            <td colSpan={5} className="p-2.5 text-right uppercase">Net Packed Work Package Price:</td>
                            <td className="p-2.5 text-right font-mono text-sm">LKR {pkg.total_package_price.toLocaleString()}</td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* ========================================================================= */}
      {/* PACKED WORK DESIGNER MODAL */}
      {/* ========================================================================= */}
      {isDesignerOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95">
            {/* MODAL HEADER */}
            <div className="bg-gradient-to-r from-purple-900 to-[#0F203C] text-white p-4 flex items-center justify-between shrink-0">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-lg bg-purple-500/30 flex items-center justify-center border border-purple-400/30 text-purple-200">
                  <PackageCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black uppercase">
                    {editingPkg ? 'Edit Packed Work Package' : 'Design New Multi-Variant Packed Work'}
                  </h3>
                  <p className="text-[11px] text-purple-200/80 font-medium">
                    Assemble multiple product variants, configure options, set package discounts & dispatch to POS
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsDesignerOpen(false)}
                className="p-1.5 text-slate-300 hover:text-white hover:bg-white/10 rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* MODAL BODY */}
            <div className="p-4 sm:p-6 overflow-y-auto space-y-5 flex-1 text-xs">
              {/* SECTION 1: PACKAGE METADATA */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                <div>
                  <label className="block text-slate-700 font-extrabold uppercase text-[10px] mb-1">
                    Package Code *
                  </label>
                  <input
                    type="text"
                    value={pkgCode}
                    onChange={(e) => setPkgCode(e.target.value)}
                    placeholder="e.g. PW-SLW-2T"
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-md font-mono font-bold uppercase focus:border-purple-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-extrabold uppercase text-[10px] mb-1">
                    Package Title Name *
                  </label>
                  <input
                    type="text"
                    value={pkgName}
                    onChange={(e) => setPkgName(e.target.value)}
                    placeholder="e.g. 2-Track Sliding Window Package"
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-md font-bold focus:border-purple-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-extrabold uppercase text-[10px] mb-1">
                    Category *
                  </label>
                  <select
                    value={pkgCategory}
                    onChange={(e) => setPkgCategory(e.target.value as CategoryType)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-md font-bold focus:border-purple-600 focus:outline-none"
                  >
                    <option value="Aluminium Profiles">Aluminium Profiles</option>
                    <option value="Glass Sheets">Glass Sheets</option>
                    <option value="Hardware & Accessories">Hardware & Accessories</option>
                    <option value="Screws & Fasteners">Screws & Fasteners</option>
                    <option value="Heavy Equipment & Crane Hire">Heavy Equipment & Crane Hire</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-slate-700 font-extrabold uppercase text-[10px] mb-1">
                    Package Assembly Description
                  </label>
                  <input
                    type="text"
                    value={pkgDescription}
                    onChange={(e) => setPkgDescription(e.target.value)}
                    placeholder="Brief description of included variants and installation application..."
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-md focus:border-purple-600 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-slate-700 font-extrabold uppercase text-[10px] mb-1">
                      Bundle Discount (%)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="50"
                      value={pkgDiscountPct}
                      onChange={(e) => setPkgDiscountPct(Number(e.target.value))}
                      className="w-full px-3 py-1.5 border border-slate-300 rounded-md font-mono font-bold text-purple-900 focus:border-purple-600 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-extrabold uppercase text-[10px] mb-1">
                      Complexity
                    </label>
                    <select
                      value={pkgComplexity}
                      onChange={(e) => setPkgComplexity(e.target.value as any)}
                      className="w-full px-3 py-1.5 border border-slate-300 rounded-md font-bold focus:border-purple-600 focus:outline-none"
                    >
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                      <option value="Expert">Expert</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* SECTION 2: ADD PRODUCT VARIANT SELECTOR */}
              <div className="bg-purple-50/70 p-3.5 rounded-xl border border-purple-200 space-y-3">
                <h4 className="font-black text-purple-950 uppercase text-[11px] flex items-center space-x-1.5">
                  <Plus className="w-4 h-4 text-purple-700" />
                  <span>Add Component Product Variant to Package</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                  <div className="sm:col-span-2">
                    <label className="block text-purple-900 font-bold text-[10px] mb-0.5">Select Catalog Product SKU *</label>
                    <select
                      value={selectedProdId}
                      onChange={(e) => setSelectedProdId(e.target.value)}
                      className="w-full px-2.5 py-1.5 border border-purple-300 rounded-md bg-white font-bold text-slate-800 focus:outline-none focus:border-purple-600"
                    >
                      <option value="">-- Choose Catalog SKU --</option>
                      {products.map(p => (
                        <option key={p.id} value={p.id}>
                          {p.product_code} - {p.product_name} (LKR {p.current_price?.toLocaleString() || p.base_price?.toLocaleString()})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-purple-900 font-bold text-[10px] mb-0.5">Quantity</label>
                    <input
                      type="number"
                      min="1"
                      value={itemQty}
                      onChange={(e) => setItemQty(Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 border border-purple-300 rounded-md bg-white font-mono font-bold text-slate-800"
                    />
                  </div>

                  <div>
                    <label className="block text-purple-900 font-bold text-[10px] mb-0.5">Thickness</label>
                    <select
                      value={itemThickness}
                      onChange={(e) => setItemThickness(e.target.value as MaterialThickness)}
                      className="w-full px-2.5 py-1.5 border border-purple-300 rounded-md bg-white font-bold text-slate-800"
                    >
                      <option value="1.0mm">1.0mm</option>
                      <option value="1.2mm">1.2mm</option>
                      <option value="1.5mm">1.5mm</option>
                      <option value="2.0mm">2.0mm</option>
                      <option value="2.5mm">2.5mm</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                  <div>
                    <label className="block text-purple-900 font-bold text-[10px] mb-0.5">Finish</label>
                    <select
                      value={itemFinish}
                      onChange={(e) => setItemFinish(e.target.value as MaterialFinish)}
                      className="w-full px-2.5 py-1.5 border border-purple-300 rounded-md bg-white font-bold text-slate-800"
                    >
                      <option value="Anodized">Anodized</option>
                      <option value="Powder Coated">Powder Coated</option>
                      <option value="Wood Grain">Wood Grain</option>
                      <option value="Mill Finish">Mill Finish</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-purple-900 font-bold text-[10px] mb-0.5">Glass Spec (If Applicable)</label>
                    <select
                      value={itemGlass}
                      onChange={(e) => setItemGlass(e.target.value as GlassType)}
                      className="w-full px-2.5 py-1.5 border border-purple-300 rounded-md bg-white font-bold text-slate-800"
                    >
                      <option value="Clear Glass">Clear Glass</option>
                      <option value="Tinted Glass">Tinted Glass</option>
                      <option value="Toughened Glass">Toughened Glass</option>
                      <option value="Laminated Glass">Laminated Glass</option>
                      <option value="Double Glazed Unit">Double Glazed Unit</option>
                    </select>
                  </div>

                  <div className="sm:col-span-2 flex items-end space-x-2">
                    <div className="flex-1">
                      <label className="block text-purple-900 font-bold text-[10px] mb-0.5">Hardware / Spec Note</label>
                      <input
                        type="text"
                        placeholder="e.g. Heavy Duty Roller Assembly, Seal strip..."
                        value={itemHardware}
                        onChange={(e) => setItemHardware(e.target.value)}
                        className="w-full px-2.5 py-1.5 border border-purple-300 rounded-md bg-white text-slate-800"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleAddVariantToPackage}
                      disabled={!selectedProdId}
                      className="bg-purple-800 hover:bg-purple-900 disabled:opacity-40 text-white px-4 py-1.5 rounded-md font-bold transition shrink-0"
                    >
                      + Add Item
                    </button>
                  </div>
                </div>
              </div>

              {/* SECTION 3: CURRENT DRAFT ITEMS LIST */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-extrabold text-slate-800 uppercase text-[11px] flex items-center space-x-1.5">
                    <Layers className="w-3.5 h-3.5 text-purple-700" />
                    <span>Included Variants ({pkgItems.length})</span>
                  </h4>
                  <span className="text-[11px] text-slate-500 font-medium">
                    Adjust quantities or remove items below
                  </span>
                </div>

                {pkgItems.length === 0 ? (
                  <div className="p-6 text-center border border-dashed border-slate-300 rounded-lg text-slate-400">
                    No product variants added to this package yet. Use the selector above to add component SKUs.
                  </div>
                ) : (
                  <div className="border border-slate-200 rounded-lg overflow-hidden">
                    <table className="w-full text-left">
                      <thead className="bg-slate-100 text-slate-700 font-extrabold uppercase text-[10px]">
                        <tr>
                          <th className="p-2">SKU Code</th>
                          <th className="p-2">Variant Description</th>
                          <th className="p-2">Specs</th>
                          <th className="p-2 text-center">Qty</th>
                          <th className="p-2 text-right">Unit Rate</th>
                          <th className="p-2 text-right">Total</th>
                          <th className="p-2 text-center">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-slate-800">
                        {pkgItems.map(item => (
                          <tr key={item.id} className="hover:bg-slate-50">
                            <td className="p-2 font-mono font-bold text-purple-900">{item.product_code}</td>
                            <td className="p-2 font-bold">{item.product_name}</td>
                            <td className="p-2 text-[10px] text-slate-500">
                              {[item.thickness_applied, item.finish_applied, item.glass_type_applied, item.hardware_spec].filter(Boolean).join(' • ')}
                            </td>
                            <td className="p-2 text-center">
                              <div className="inline-flex items-center space-x-1 border border-slate-200 rounded p-0.5 bg-white">
                                <button 
                                  onClick={() => handleUpdateItemQty(item.id, -1)}
                                  className="px-1.5 py-0.5 hover:bg-slate-100 rounded text-slate-600 font-bold"
                                >-</button>
                                <span className="font-mono font-bold px-1">{item.quantity}</span>
                                <button 
                                  onClick={() => handleUpdateItemQty(item.id, 1)}
                                  className="px-1.5 py-0.5 hover:bg-slate-100 rounded text-slate-600 font-bold"
                                >+</button>
                              </div>
                            </td>
                            <td className="p-2 text-right font-mono">LKR {item.unit_price.toLocaleString()}</td>
                            <td className="p-2 text-right font-mono font-bold">LKR {(item.unit_price * item.quantity).toLocaleString()}</td>
                            <td className="p-2 text-center">
                              <button
                                onClick={() => handleRemoveVariantFromPackage(item.id)}
                                className="p-1 text-rose-500 hover:text-rose-700 rounded transition"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* SECTION 4: PACKAGE SUMMARY BREAKDOWN CARD */}
              <div className="bg-purple-900 text-white p-4 rounded-xl space-y-2">
                <div className="flex flex-wrap items-center justify-between text-xs font-bold border-b border-purple-800/80 pb-2">
                  <span className="text-purple-200 uppercase">Individual Variant Component Subtotal:</span>
                  <span className="font-mono text-sm">LKR {designerListTotal.toLocaleString()}</span>
                </div>
                {pkgDiscountPct > 0 && (
                  <div className="flex flex-wrap items-center justify-between text-xs font-bold text-emerald-300 border-b border-purple-800/80 pb-2">
                    <span className="uppercase">Package Bundle Savings ({pkgDiscountPct}%):</span>
                    <span className="font-mono">- LKR {Math.round(designerListTotal * (pkgDiscountPct / 100)).toLocaleString()}</span>
                  </div>
                )}
                <div className="flex flex-wrap items-center justify-between text-sm font-black pt-1">
                  <span className="uppercase text-amber-300 flex items-center space-x-1.5">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <span>Final Net Packed Work Package Price:</span>
                  </span>
                  <span className="font-mono text-base text-amber-300">LKR {designerPackageTotal.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* MODAL FOOTER */}
            <div className="p-4 bg-slate-100 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 shrink-0">
              <button
                onClick={() => setIsDesignerOpen(false)}
                className="px-4 py-2 border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-bold transition"
              >
                Cancel
              </button>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleSavePackageTemplate(false)}
                  className="px-4 py-2 bg-purple-800 hover:bg-purple-900 text-white rounded-lg text-xs font-black transition shadow-xs"
                >
                  Save Package Template
                </button>

                <button
                  onClick={() => handleSavePackageTemplate(true)}
                  className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-xs font-black transition shadow-md hover:shadow-orange-500/20 flex items-center space-x-1.5"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Save & Add All to POS Cart</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
