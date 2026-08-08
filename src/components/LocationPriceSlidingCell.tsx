import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  MapPin, 
  Play, 
  Pause, 
  ChevronUp, 
  ChevronDown, 
  ArrowUpRight, 
  ArrowDownRight,
  Globe,
  Tag,
  Search,
  Sliders
} from 'lucide-react';
import { ALL_SRI_LANKA_REGIONS, SriLankaRegion } from '../utils/sriLankaRegions';

interface LocationPriceSlidingCellProps {
  regionPrices?: Record<string, number>; // e.g. { 'Colombo': 0, 'Kandy': 600, 'Jaffna': 1400 }
  basePriceVal: number;
  productName?: string;
  autoSlideGlobal?: boolean;
  onSelectRegion?: (regionName: string, priceVal: number) => void;
}

export const LocationPriceSlidingCell: React.FC<LocationPriceSlidingCellProps> = ({
  regionPrices = {},
  basePriceVal,
  productName,
  autoSlideGlobal = true,
  onSelectRegion
}) => {
  // Collect all regions that have specific prices
  const configuredRegionKeys = Object.keys(regionPrices);
  if (configuredRegionKeys.length === 0) {
    return null;
  }

  const activeRegions: Array<{ name: string; surcharge: number; district: string; province: string; type?: string }> = 
    configuredRegionKeys.map(k => {
      const matched = ALL_SRI_LANKA_REGIONS.find(r => r.name === k || r.district === k || r.province === k);
      return {
        name: k,
        surcharge: regionPrices[k] || 0,
        district: matched?.district || k,
        province: matched?.province || 'Sri Lanka Region',
        type: matched?.type || 'Regional Zone'
      };
    });

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [displayMode, setDisplayMode] = useState<'location' | 'district'>('location');
  const [viewType, setViewType] = useState<'price' | 'variance'>('price');
  const [isGridOpen, setIsGridOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Auto-slide effect every 2.5 seconds
  useEffect(() => {
    if (!autoSlideGlobal || isPaused || isGridOpen || activeRegions.length <= 1) {
      return;
    }

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % activeRegions.length);
    }, 2500);

    return () => clearInterval(interval);
  }, [autoSlideGlobal, isPaused, isGridOpen, activeRegions.length]);

  const currentItem = activeRegions[currentIndex] || activeRegions[0];
  const totalRate = basePriceVal + (currentItem?.surcharge || 0);
  const diffVal = currentItem?.surcharge || 0;
  const diffPct = basePriceVal > 0 ? (diffVal / basePriceVal) * 100 : 0;

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % activeRegions.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + activeRegions.length) % activeRegions.length);
  };

  const filteredGridRegions = ALL_SRI_LANKA_REGIONS.filter(r => 
    !searchQuery || 
    r.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    r.district.toLowerCase().includes(searchQuery.toLowerCase()) || 
    r.province.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div 
      className="relative group bg-white border border-slate-200 rounded-md p-1.5 shadow-2xs min-w-[210px] max-w-[260px] transition hover:border-orange-400 hover:shadow-xs"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Header controls */}
      <div className="flex items-center justify-between text-[9px] font-semibold text-slate-500 border-b border-slate-100 pb-1">
        <div className="flex items-center space-x-1 text-slate-700">
          <MapPin className="w-3 h-3 text-orange-500 animate-bounce" />
          <span className="uppercase tracking-wider font-semibold text-slate-800">SL Region Rate</span>
        </div>

        <div className="flex items-center space-x-1">
          <button
            type="button"
            onClick={() => setDisplayMode(displayMode === 'location' ? 'district' : 'location')}
            title="Toggle Location Name vs District"
            className="px-1 py-0.5 rounded-sm bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-[8px] uppercase"
          >
            {displayMode === 'location' ? 'PLACE' : 'DISTRICT'}
          </button>

          <button
            type="button"
            onClick={() => setViewType(viewType === 'price' ? 'variance' : 'price')}
            title="Toggle Absolute Price vs Variance %"
            className="px-1 py-0.5 rounded-sm bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-[8px] uppercase"
          >
            {viewType === 'price' ? 'PRICE' : 'VAR%'}
          </button>

          <button
            type="button"
            onClick={() => setIsGridOpen(!isGridOpen)}
            title="View All Regions Matrix Modal"
            className="px-1 py-0.5 rounded-sm bg-orange-50 hover:bg-orange-100 text-orange-600 font-semibold text-[8px]"
          >
            GRID
          </button>
        </div>
      </div>

      {/* Upward Sliding Box */}
      <div className="relative h-[42px] overflow-hidden rounded-md bg-slate-50 p-1 border border-slate-100 flex items-center justify-between my-1">
        <AnimatePresence mode="wait">
          <motion.div
            key={`${currentItem.name}-${displayMode}-${viewType}`}
            initial={{ y: 22, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -22, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="flex-1 flex items-center justify-between pr-1"
          >
            <div className="flex items-center space-x-1.5 overflow-hidden">
              <div className={`w-2 h-2 rounded-full shrink-0 ${currentItem.surcharge > 0 ? 'bg-orange-500 animate-pulse' : 'bg-slate-400'}`} />
              <div className="truncate">
                <div className="font-semibold text-[11px] text-slate-900 leading-tight truncate">
                  {displayMode === 'location' ? currentItem.name : currentItem.district}
                </div>
                <div className="text-[9px] text-slate-500 font-medium truncate">
                  {currentItem.province}
                </div>
              </div>
            </div>

            <div className="text-right shrink-0">
              {viewType === 'price' ? (
                <div>
                  <div className={`font-semibold text-xs font-mono ${currentItem.surcharge > 0 ? 'text-orange-600' : 'text-slate-900'}`}>
                    Rs. {totalRate.toLocaleString()}
                  </div>
                  {currentItem.surcharge > 0 ? (
                    <span className="text-[8px] bg-orange-100 text-orange-800 px-1 py-0.2 rounded-sm font-semibold uppercase">
                      +Rs. {currentItem.surcharge}
                    </span>
                  ) : (
                    <span className="text-[8px] text-slate-400 font-normal">Base Rate</span>
                  )}
                </div>
              ) : (
                <div>
                  {diffVal === 0 ? (
                    <span className="text-[10px] font-semibold text-slate-500">Base (0%)</span>
                  ) : (
                    <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1 py-0.5 rounded-sm border border-emerald-200 inline-flex items-center">
                      <ArrowUpRight className="w-3 h-3 mr-0.5" />+{diffPct.toFixed(1)}%
                    </span>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Footer Navigation bar */}
      <div className="flex items-center justify-between text-[9px] text-slate-400">
        <span className="font-medium">{currentIndex + 1} of {activeRegions.length} Regions</span>
        <div className="flex items-center space-x-1">
          <button
            type="button"
            onClick={() => setIsPaused(!isPaused)}
            className="p-0.5 hover:text-slate-700 transition"
            title={isPaused ? "Resume Auto-Slide" : "Pause Auto-Slide"}
          >
            {isPaused ? <Play className="w-2.5 h-2.5 text-emerald-600" /> : <Pause className="w-2.5 h-2.5 text-orange-500" />}
          </button>
          <button
            type="button"
            onClick={handlePrev}
            className="p-0.5 hover:text-slate-700 transition"
            title="Previous Region"
          >
            <ChevronDown className="w-3 h-3" />
          </button>
          <button
            type="button"
            onClick={handleNext}
            className="p-0.5 hover:text-slate-700 transition"
            title="Next Region"
          >
            <ChevronUp className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* All Sri Lanka Regions Modal Matrix Grid */}
      {isGridOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl border border-slate-200 w-full max-w-2xl overflow-hidden flex flex-col max-h-[85vh]">
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold flex items-center space-x-2">
                  <Globe className="w-4 h-4 text-orange-400" />
                  <span>Sri Lanka Regional & Postal Division Rate Matrix</span>
                </h3>
                <p className="text-xs text-slate-400">Select any region or postal division to preview or apply location price</p>
              </div>
              <button
                onClick={() => setIsGridOpen(false)}
                className="text-slate-400 hover:text-white text-xs font-bold px-2 py-1 rounded bg-slate-800"
              >
                ✕ Close
              </button>
            </div>

            <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center space-x-2">
              <Search className="w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search Sri Lanka postal code, city, district or province..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-xs bg-white border border-slate-300 rounded px-2 py-1 focus:outline-none focus:border-orange-500"
              />
            </div>

            <div className="p-4 overflow-y-auto space-y-2 flex-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {filteredGridRegions.map((reg) => {
                  const configuredVal = regionPrices[reg.name] ?? reg.defaultSurchargeLkr ?? 0;
                  const regTotal = basePriceVal + configuredVal;
                  return (
                    <div 
                      key={reg.id}
                      onClick={() => {
                        if (onSelectRegion) onSelectRegion(reg.name, regTotal);
                        setIsGridOpen(false);
                      }}
                      className="p-2.5 bg-white border border-slate-200 rounded hover:border-orange-500 hover:bg-orange-50/30 transition cursor-pointer flex items-center justify-between"
                    >
                      <div>
                        <div className="font-semibold text-slate-900 flex items-center space-x-1">
                          <span>{reg.name}</span>
                          {reg.postalCode && (
                            <span className="text-[9px] bg-slate-100 text-slate-600 px-1 rounded font-mono">
                              {reg.postalCode}
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-slate-500">{reg.district} • {reg.province}</div>
                      </div>

                      <div className="text-right">
                        <div className="font-mono font-semibold text-orange-600">Rs. {regTotal.toLocaleString()}</div>
                        <div className="text-[9px] text-slate-400">
                          {configuredVal > 0 ? `+Rs. ${configuredVal}` : 'Base Rate'}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
