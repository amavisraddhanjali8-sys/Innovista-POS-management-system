import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Building2, 
  MapPin, 
  Play, 
  Pause, 
  ChevronUp, 
  ChevronDown, 
  Sliders, 
  Tag, 
  TrendingUp, 
  ArrowUpRight, 
  ArrowDownRight,
  Sparkles,
  Edit3
} from 'lucide-react';
import { Branch, BranchPriceOverride } from '../types';

interface BranchPriceSlidingCellProps {
  branches: Branch[];
  itemBranchOverrides: BranchPriceOverride[];
  basePriceVal: number;
  productName?: string;
  productCode?: string;
  autoSlideGlobal?: boolean;
  displayModeGlobal?: 'code' | 'location';
  viewTypeGlobal?: 'price' | 'variance';
  cellLayoutGlobal?: 'ticker' | 'grid';
  onOpenOverrideModal?: (branchId: string) => void;
}

export const BranchPriceSlidingCell: React.FC<BranchPriceSlidingCellProps> = ({
  branches,
  itemBranchOverrides,
  basePriceVal,
  productName,
  productCode,
  autoSlideGlobal = true,
  displayModeGlobal = 'location',
  viewTypeGlobal = 'price',
  cellLayoutGlobal = 'ticker',
  onOpenOverrideModal
}) => {
  const nonHOBranches = branches.filter(b => b.code !== 'HO');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  
  // Local cell level toggle overrides (if user clicks toggles inside cell hover)
  const [localLayout, setLocalLayout] = useState<'ticker' | 'grid'>(cellLayoutGlobal);
  const [localDisplayMode, setLocalDisplayMode] = useState<'code' | 'location'>(displayModeGlobal);
  const [localViewType, setLocalViewType] = useState<'price' | 'variance'>(viewTypeGlobal);

  // Sync with global control props when changed
  useEffect(() => {
    setLocalLayout(cellLayoutGlobal);
  }, [cellLayoutGlobal]);

  useEffect(() => {
    setLocalDisplayMode(displayModeGlobal);
  }, [displayModeGlobal]);

  useEffect(() => {
    setLocalViewType(viewTypeGlobal);
  }, [viewTypeGlobal]);

  // Auto-slide effect every 2.5s if not paused & layout is ticker
  useEffect(() => {
    if (!autoSlideGlobal || isPaused || localLayout !== 'ticker' || nonHOBranches.length <= 1) {
      return;
    }

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % nonHOBranches.length);
    }, 2400);

    return () => clearInterval(interval);
  }, [autoSlideGlobal, isPaused, localLayout, nonHOBranches.length]);

  if (nonHOBranches.length === 0) {
    return <span className="text-slate-400 text-[10px]">No Regional Branches</span>;
  }

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % nonHOBranches.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + nonHOBranches.length) % nonHOBranches.length);
  };

  const currentBranch = nonHOBranches[currentIndex] || nonHOBranches[0];
  const overrideMatch = itemBranchOverrides.find(
    bp => bp.branch_id === currentBranch.id || bp.branch_code === currentBranch.code
  );
  const effectivePrice = overrideMatch ? overrideMatch.special_price : basePriceVal;
  const isOverride = !!overrideMatch;
  const diffVal = effectivePrice - basePriceVal;
  const diffPct = basePriceVal > 0 ? (diffVal / basePriceVal) * 100 : 0;

  return (
    <div 
      className="relative group bg-white border border-slate-200 rounded-md p-1.5 shadow-2xs min-w-[210px] max-w-[260px] transition hover:border-orange-400 hover:shadow-xs"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Ticker View Mode */}
      {localLayout === 'ticker' ? (
        <div className="space-y-1">
          {/* Top Ticker Header with Controls */}
          <div className="flex items-center justify-between text-[9px] font-semibold text-slate-500 border-b border-slate-100 pb-1">
            <div className="flex items-center space-x-1 text-slate-700">
              <MapPin className="w-3 h-3 text-orange-500 animate-bounce" />
              <span className="uppercase tracking-wider font-semibold text-slate-800">Branch Rate Ticker</span>
            </div>

            {/* Quick Cell Controls */}
            <div className="flex items-center space-x-1 opacity-90 group-hover:opacity-100 transition">
              <button
                type="button"
                onClick={() => setLocalDisplayMode(localDisplayMode === 'location' ? 'code' : 'location')}
                title="Toggle Location Name vs Branch Code"
                className="px-1 py-0.5 rounded-sm bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-[8px] uppercase"
              >
                {localDisplayMode === 'location' ? 'PLACE' : 'CODE'}
              </button>

              <button
                type="button"
                onClick={() => setLocalViewType(localViewType === 'price' ? 'variance' : 'price')}
                title="Toggle Absolute Price vs Variance %"
                className="px-1 py-0.5 rounded-sm bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-[8px] uppercase"
              >
                {localViewType === 'price' ? 'PRICE' : 'VAR%'}
              </button>

              <button
                type="button"
                onClick={() => setLocalLayout('grid')}
                title="Switch to All Branch Grid Matrix"
                className="px-1 py-0.5 rounded-sm bg-orange-50 hover:bg-orange-100 text-orange-600 font-semibold text-[8px]"
              >
                GRID
              </button>
            </div>
          </div>

          {/* Upward Sliding Container */}
          <div className="relative h-[42px] overflow-hidden rounded-md bg-slate-50 p-1 border border-slate-100 flex items-center justify-between">
            <AnimatePresence mode="wait">
              <motion.div
                key={`${currentBranch.id}-${localDisplayMode}-${localViewType}`}
                initial={{ y: 22, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -22, opacity: 0 }}
                transition={{ duration: 0.25, ease: "easeInOut" }}
                className="flex-1 flex items-center justify-between pr-1"
              >
                <div className="flex items-center space-x-1.5 overflow-hidden">
                  <div className={`w-2 h-2 rounded-full shrink-0 ${isOverride ? 'bg-orange-500 animate-pulse' : 'bg-slate-400'}`} />
                  <div className="truncate">
                    <div className="font-semibold text-[11px] text-slate-900 leading-tight truncate">
                      {localDisplayMode === 'location' ? (currentBranch.location || currentBranch.name) : currentBranch.code}
                    </div>
                    <div className="text-[9px] text-slate-500 font-medium truncate">
                      {currentBranch.name}
                    </div>
                  </div>
                </div>

                {/* Price or Variance Display */}
                <div className="text-right shrink-0">
                  {localViewType === 'price' ? (
                    <div>
                      <div className={`font-semibold text-xs ${isOverride ? 'text-orange-600 font-mono' : 'text-slate-900 font-mono'}`}>
                        Rs. {effectivePrice.toLocaleString()}
                      </div>
                      {isOverride ? (
                        <span className="text-[8px] bg-orange-100 text-orange-800 px-1 py-0.2 rounded-sm font-semibold uppercase">
                          Override
                        </span>
                      ) : (
                        <span className="text-[8px] text-slate-400 font-normal">Base Rate</span>
                      )}
                    </div>
                  ) : (
                    <div>
                      {diffVal === 0 ? (
                        <span className="text-[10px] font-semibold text-slate-500">Base Rate (0%)</span>
                      ) : diffVal > 0 ? (
                        <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1 py-0.5 rounded-sm border border-emerald-200 inline-flex items-center">
                          <ArrowUpRight className="w-3 h-3 mr-0.5" />+{diffPct.toFixed(1)}%
                        </span>
                      ) : (
                        <span className="text-[10px] font-semibold text-rose-700 bg-rose-50 px-1 py-0.5 rounded-sm border border-rose-200 inline-flex items-center">
                          <ArrowDownRight className="w-3 h-3 mr-0.5" />{diffPct.toFixed(1)}%
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Quick Action Edit button on hover */}
            {onOpenOverrideModal && (
              <button
                type="button"
                onClick={() => onOpenOverrideModal(currentBranch.id)}
                title={`Configure override for ${currentBranch.name}`}
                className="opacity-0 group-hover:opacity-100 ml-1 p-1 rounded-md bg-orange-500 text-white hover:bg-orange-600 transition shrink-0"
              >
                <Edit3 className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Bottom Slide Navigation Bar & Dot Indicators */}
          <div className="flex items-center justify-between text-[9px] pt-0.5 text-slate-500">
            <div className="flex items-center space-x-1">
              <button
                type="button"
                onClick={handlePrev}
                className="p-0.5 hover:bg-slate-200 rounded-sm text-slate-700 transition"
                title="Previous Branch"
              >
                <ChevronDown className="w-3 h-3 rotate-180" />
              </button>
              <button
                type="button"
                onClick={handleNext}
                className="p-0.5 hover:bg-slate-200 rounded-sm text-slate-700 transition"
                title="Next Branch"
              >
                <ChevronDown className="w-3 h-3" />
              </button>
              <button
                type="button"
                onClick={() => setIsPaused(!isPaused)}
                className="p-0.5 hover:bg-slate-200 rounded-sm text-slate-700 transition"
                title={isPaused ? "Play Auto Slide" : "Pause Auto Slide"}
              >
                {isPaused ? <Play className="w-2.5 h-2.5 text-emerald-600" /> : <Pause className="w-2.5 h-2.5 text-amber-600" />}
              </button>
            </div>

            {/* Indicator Dots */}
            <div className="flex items-center space-x-1">
              {nonHOBranches.map((b, idx) => (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => setCurrentIndex(idx)}
                  className={`h-1.5 rounded-full transition-all ${
                    idx === currentIndex 
                      ? 'w-3 bg-orange-500' 
                      : 'w-1.5 bg-slate-300 hover:bg-slate-400'
                  }`}
                  title={b.name}
                />
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* Full Grid View Mode */
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-[9px] font-semibold text-slate-500 border-b border-slate-100 pb-1">
            <span className="uppercase text-slate-700 font-semibold">Branch Rate Matrix</span>
            <button
              type="button"
              onClick={() => setLocalLayout('ticker')}
              className="px-1.5 py-0.5 rounded-sm bg-orange-50 hover:bg-orange-100 text-orange-600 font-semibold text-[8px]"
            >
              SLIDE TICKER
            </button>
          </div>

          <div className="grid grid-cols-2 gap-1 text-[10px]">
            {nonHOBranches.map((b) => {
              const o = itemBranchOverrides.find(bp => bp.branch_id === b.id || bp.branch_code === b.code);
              const price = o ? o.special_price : basePriceVal;
              const hasO = !!o;

              return (
                <div
                  key={b.id}
                  onClick={() => onOpenOverrideModal && onOpenOverrideModal(b.id)}
                  className={`p-1 rounded-sm border text-left cursor-pointer transition ${
                    hasO 
                      ? 'bg-orange-50/80 text-orange-950 border-orange-200 hover:bg-orange-100 font-semibold' 
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <div className="text-[9px] text-slate-500 font-medium truncate">
                    {localDisplayMode === 'location' ? (b.location || b.name.split(' ')[0]) : b.code}
                  </div>
                  <div className="font-semibold font-mono text-[11px] text-slate-900">
                    Rs. {price.toLocaleString()}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
