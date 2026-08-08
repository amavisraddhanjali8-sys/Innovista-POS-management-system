import React, { useState, useEffect } from 'react';
import { 
  X, 
  Check, 
  RotateCcw, 
  Layers, 
  Shield, 
  Key, 
  Wrench, 
  Palette, 
  Scissors, 
  Truck, 
  Compass, 
  Building, 
  Zap, 
  Layers3, 
  Calculator, 
  CheckCircle2, 
  Sparkles,
  DollarSign
} from 'lucide-react';
import { POS_SURCHARGE_CATEGORIES, calculate11CategorySurcharges } from '../utils/surchargeCategoryEngine';
import { QuotationItem } from '../types';

interface Surcharge11CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: QuotationItem | null;
  basePrice: number;
  onApply: (selections: Record<string, string>, breakdown: any[], finalUnitPrice: number) => void;
}

export const Surcharge11CategoryModal: React.FC<Surcharge11CategoryModalProps> = ({
  isOpen,
  onClose,
  item,
  basePrice,
  onApply
}) => {
  if (!isOpen) return null;

  // Initialize selections from item or default 'none' option for each category
  const getInitialSelections = () => {
    const init: Record<string, string> = {};
    POS_SURCHARGE_CATEGORIES.forEach(cat => {
      if (item?.surcharge_selections_11cat && item.surcharge_selections_11cat[cat.id]) {
        init[cat.id] = item.surcharge_selections_11cat[cat.id];
      } else {
        const noneOpt = cat.options.find(o => o.isDefaultNone || o.value === 0);
        init[cat.id] = noneOpt ? noneOpt.id : cat.options[0].id;
      }
    });
    return init;
  };

  const [selections, setSelections] = useState<Record<string, string>>(getInitialSelections);

  useEffect(() => {
    setSelections(getInitialSelections());
  }, [item, basePrice]);

  const handleResetAllToNone = () => {
    const noneMap: Record<string, string> = {};
    POS_SURCHARGE_CATEGORIES.forEach(cat => {
      const noneOpt = cat.options.find(o => o.isDefaultNone || o.value === 0);
      noneMap[cat.id] = noneOpt ? noneOpt.id : cat.options[0].id;
    });
    setSelections(noneMap);
  };

  const handleSelectOption = (categoryId: string, optionId: string) => {
    setSelections(prev => ({
      ...prev,
      [categoryId]: optionId
    }));
  };

  // Perform calculation
  const calcResult = calculate11CategorySurcharges(basePrice, selections);

  const getCategoryIcon = (iconName: string) => {
    switch (iconName) {
      case 'Layers': return <Layers className="w-4 h-4 text-emerald-600" />;
      case 'Shield': return <Shield className="w-4 h-4 text-blue-600" />;
      case 'Key': return <Key className="w-4 h-4 text-amber-600" />;
      case 'Wrench': return <Wrench className="w-4 h-4 text-purple-600" />;
      case 'Palette': return <Palette className="w-4 h-4 text-pink-600" />;
      case 'Scissors': return <Scissors className="w-4 h-4 text-red-600" />;
      case 'Truck': return <Truck className="w-4 h-4 text-indigo-600" />;
      case 'Compass': return <Compass className="w-4 h-4 text-cyan-600" />;
      case 'Building': return <Building className="w-4 h-4 text-teal-600" />;
      case 'Zap': return <Zap className="w-4 h-4 text-yellow-600" />;
      case 'Layers3': return <Layers3 className="w-4 h-4 text-orange-600" />;
      default: return <Calculator className="w-4 h-4 text-slate-600" />;
    }
  };

  const handleConfirm = () => {
    onApply(selections, calcResult.breakdown, calcResult.finalUnitPrice);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4 animate-fadeIn overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[92vh] flex flex-col my-auto overflow-hidden">
        
        {/* Modal Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between border-b border-slate-800">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="p-2 bg-orange-500/20 text-orange-400 border border-orange-500/30 rounded-xl">
                <Calculator className="w-5 h-5" />
              </span>
              <h3 className="text-base font-bold text-white tracking-wide">
                11-Category POS Surcharge Calculation Engine
              </h3>
            </div>
            <p className="text-xs text-slate-300">
              {item ? `Configuring item: ${item.product_name} (${item.product_code})` : 'Batch Configurator for Active Cart'}
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Calculation Real-Time Summary Ribbon */}
        <div className="bg-slate-50 border-b border-slate-200 p-4 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="bg-white p-3 rounded-xl border border-slate-200 space-y-0.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Base Unit Rate</span>
            <div className="text-base font-black text-slate-900 font-mono">
              Rs. {basePrice.toLocaleString()}
            </div>
          </div>

          <div className="bg-white p-3 rounded-xl border border-orange-200 space-y-0.5">
            <span className="text-[10px] font-bold text-orange-600 uppercase flex items-center justify-between">
              <span>Added Surcharges ({calcResult.breakdown.length} Active)</span>
              {calcResult.totalSurchargePct > 0 && (
                <span className="font-mono text-orange-600 font-extrabold">+{calcResult.totalSurchargePct}%</span>
              )}
            </span>
            <div className="text-base font-black text-orange-600 font-mono">
              +Rs. {calcResult.totalSurchargeLkr.toLocaleString()}
            </div>
          </div>

          <div className="bg-emerald-600 text-white p-3 rounded-xl space-y-0.5 shadow-sm">
            <span className="text-[10px] font-bold uppercase text-emerald-100">Final Calculated Rate</span>
            <div className="text-base font-black text-white font-mono">
              Rs. {calcResult.finalUnitPrice.toLocaleString()} / unit
            </div>
          </div>
        </div>

        {/* 11 Categories Form Grid */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Select Surcharge Options (Default is 'None' - 0% Surcharge)
            </span>

            <button
              onClick={handleResetAllToNone}
              className="text-xs text-slate-500 hover:text-slate-900 font-medium flex items-center space-x-1 hover:bg-slate-100 px-2.5 py-1 rounded-lg transition"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
              <span>Reset All to Default 'None'</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {POS_SURCHARGE_CATEGORIES.map((cat, idx) => {
              const selectedOptId = selections[cat.id];
              const selectedOpt = cat.options.find(o => o.id === selectedOptId);
              const isApplied = selectedOpt && !selectedOpt.isDefaultNone && selectedOpt.value > 0;

              return (
                <div 
                  key={cat.id} 
                  className={`p-3.5 rounded-xl border transition space-y-2 ${
                    isApplied 
                      ? 'bg-orange-50/40 border-orange-300 ring-1 ring-orange-200 shadow-2xs' 
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="p-1.5 bg-slate-100 rounded-lg border border-slate-200">
                        {getCategoryIcon(cat.iconName)}
                      </span>
                      <div>
                        <span className="text-xs font-bold text-slate-900">{cat.name}</span>
                        <span className="ml-1.5 text-[9px] font-mono text-slate-400 font-bold uppercase">
                          [{cat.code}]
                        </span>
                      </div>
                    </div>

                    {isApplied && (
                      <span className="bg-orange-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full font-mono">
                        +{selectedOpt.type === 'percentage' ? `${selectedOpt.value}%` : `Rs. ${selectedOpt.value}`}
                      </span>
                    )}
                  </div>

                  <select
                    value={selectedOptId}
                    onChange={(e) => handleSelectOption(cat.id, e.target.value)}
                    className="w-full text-xs font-medium bg-white text-slate-800 border border-slate-300 rounded-lg px-2.5 py-2 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
                  >
                    {cat.options.map(opt => (
                      <option key={opt.id} value={opt.id}>
                        {opt.name} {opt.value > 0 ? `(+${opt.type === 'percentage' ? `${opt.value}%` : `Rs. ${opt.value}`})` : ''}
                      </option>
                    ))}
                  </select>

                  {selectedOpt && (
                    <p className="text-[11px] text-slate-500 italic line-clamp-1">
                      {selectedOpt.description}
                    </p>
                  )}
                </div>
              );
            })}
          </div>

          {/* Active Applied Breakdown Badges */}
          {calcResult.breakdown.length > 0 && (
            <div className="p-3.5 bg-orange-50/80 rounded-xl border border-orange-200 space-y-2">
              <span className="text-xs font-bold text-orange-900 block">
                Applied Surcharge Breakdown ({calcResult.breakdown.length} Selected):
              </span>
              <div className="flex flex-wrap gap-1.5">
                {calcResult.breakdown.map(b => (
                  <span 
                    key={b.categoryId} 
                    className="bg-white text-orange-800 border border-orange-300 text-[11px] font-semibold px-2.5 py-1 rounded-lg shadow-2xs flex items-center space-x-1"
                  >
                    <CheckCircle2 className="w-3 h-3 text-orange-600" />
                    <span>{b.categoryName}: <strong>{b.optionName}</strong> (+Rs. {b.amountLkr.toLocaleString()})</span>
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-100 border-t border-slate-200 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-white text-slate-700 hover:bg-slate-200 border border-slate-300 rounded-xl text-xs font-bold transition"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleConfirm}
            className="px-6 py-2.5 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-bold transition flex items-center space-x-2 shadow-md"
          >
            <Check className="w-4 h-4" />
            <span>Apply Surcharges (Rs. {calcResult.finalUnitPrice.toLocaleString()}/unit)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
