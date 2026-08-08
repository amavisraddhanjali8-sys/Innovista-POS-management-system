import React, { useState } from 'react';
import { ProductTrendPrediction, TrendDataPoint } from '../types';
import { TrendingUp, TrendingDown, Minus, Info, Sparkles, AlertCircle, ShieldCheck } from 'lucide-react';

interface ProductPriceTrendForecastChartProps {
  prediction: ProductTrendPrediction;
  compact?: boolean;
}

export const ProductPriceTrendForecastChart: React.FC<ProductPriceTrendForecastChartProps> = ({
  prediction,
  compact = false
}) => {
  const [horizon, setHorizon] = useState<7 | 15 | 30>(30);
  const [hoveredPoint, setHoveredPoint] = useState<TrendDataPoint | null>(null);

  const {
    productCode,
    productName,
    currentPrice,
    projectedPrice30d,
    priceChangeAmount30d,
    priceChangePct30d,
    trendDirection,
    confidencePct,
    volatility,
    historicalPoints,
    forecastPoints,
    allPoints
  } = prediction;

  // Filter forecast points according to selected horizon
  const visibleForecastPoints = forecastPoints.slice(0, horizon);
  const chartPoints = [...historicalPoints, ...visibleForecastPoints];

  // SVG Chart Dimensions & Padding
  const width = compact ? 450 : 700;
  const height = compact ? 180 : 280;
  const paddingLeft = 60;
  const paddingRight = 30;
  const paddingTop = 30;
  const paddingBottom = 40;

  const innerWidth = width - paddingLeft - paddingRight;
  const innerHeight = height - paddingTop - paddingBottom;

  // Find Min & Max price values for Y-axis scale (including confidence bounds)
  let minPrice = Math.min(
    ...chartPoints.map((p) => p.lowerBound ?? p.price),
    currentPrice
  );
  let maxPrice = Math.max(
    ...chartPoints.map((p) => p.upperBound ?? p.price),
    currentPrice
  );

  // Add 5% padding to scale top and bottom
  const priceRange = Math.max(10, maxPrice - minPrice);
  minPrice = Math.floor((minPrice - priceRange * 0.1) / 100) * 100;
  maxPrice = Math.ceil((maxPrice + priceRange * 0.1) / 100) * 100;
  const currentPriceRange = Math.max(1, maxPrice - minPrice);

  // Helper coordinate getters
  const getX = (index: number) => {
    return paddingLeft + (index / (chartPoints.length - 1)) * innerWidth;
  };

  const getY = (priceVal: number) => {
    const ratio = (priceVal - minPrice) / currentPriceRange;
    return height - paddingBottom - ratio * innerHeight;
  };

  // Divide points into historical vs forecast for rendering path strings
  const todayIndex = historicalPoints.length - 1;

  // Construct SVG Path strings
  const histCoords = historicalPoints.map((p, i) => `${getX(i)},${getY(p.price)}`).join(' L ');
  const forecastCoords = visibleForecastPoints.map((p, i) => `${getX(todayIndex + i + 1)},${getY(p.price)}`).join(' L ');
  const forecastStartPoint = `${getX(todayIndex)},${getY(historicalPoints[todayIndex].price)}`;
  const fullForecastPath = `M ${forecastStartPoint} L ${forecastCoords}`;

  // Confidence Bounds polygon coordinates
  const upperBoundCoords = visibleForecastPoints.map((p, i) => `${getX(todayIndex + i + 1)},${getY(p.upperBound ?? p.price)}`).join(' L ');
  const lowerBoundReverseCoords = visibleForecastPoints
    .slice()
    .reverse()
    .map((p, i) => {
      const idx = visibleForecastPoints.length - 1 - i;
      return `${getX(todayIndex + idx + 1)},${getY(p.lowerBound ?? p.price)}`;
    })
    .join(' L ');

  const confidencePolygon = `M ${forecastStartPoint} L ${upperBoundCoords} L ${lowerBoundReverseCoords} Z`;

  // Gradient fill for historical section
  const firstHistX = getX(0);
  const lastHistX = getX(todayIndex);
  const bottomY = height - paddingBottom;
  const histAreaPath = `M ${firstHistX},${bottomY} L ${histCoords} L ${lastHistX},${bottomY} Z`;

  // Grid ticks
  const yTicks = [minPrice, Math.round(minPrice + currentPriceRange * 0.33), Math.round(minPrice + currentPriceRange * 0.66), maxPrice];

  return (
    <div className="space-y-4">
      {/* Top Predictive Metrics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-3.5">
          <span className="text-[10px] font-bold text-slate-500 uppercase block tracking-wider">Current Master Rate</span>
          <div className="text-lg font-black text-slate-900 mt-0.5 font-mono">
            Rs. {currentPrice.toLocaleString()}
          </div>
          <span className="text-[10px] font-semibold text-slate-400">Today's Baseline</span>
        </div>

        <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-3.5">
          <span className="text-[10px] font-bold text-slate-500 uppercase block tracking-wider">30d Projected Forecast</span>
          <div className="text-lg font-black text-blue-700 mt-0.5 font-mono flex items-center">
            <span>Rs. {projectedPrice30d.toLocaleString()}</span>
          </div>
          <span className={`text-[10px] font-extrabold flex items-center mt-0.5 ${
            trendDirection === 'UP' ? 'text-amber-700' : trendDirection === 'DOWN' ? 'text-emerald-700' : 'text-slate-600'
          }`}>
            {trendDirection === 'UP' && <TrendingUp className="w-3 h-3 mr-0.5" />}
            {trendDirection === 'DOWN' && <TrendingDown className="w-3 h-3 mr-0.5" />}
            {trendDirection === 'STABLE' && <Minus className="w-3 h-3 mr-0.5" />}
            {priceChangePct30d > 0 ? `+${priceChangePct30d}%` : `${priceChangePct30d}%`} (Rs. {priceChangeAmount30d > 0 ? `+${priceChangeAmount30d.toLocaleString()}` : priceChangeAmount30d.toLocaleString()})
          </span>
        </div>

        <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-3.5">
          <span className="text-[10px] font-bold text-slate-500 uppercase block tracking-wider">Forecast Confidence</span>
          <div className="text-lg font-black text-emerald-700 mt-0.5 flex items-center space-x-1">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>{confidencePct}%</span>
          </div>
          <span className="text-[10px] font-semibold text-emerald-800">High Reliability Engine</span>
        </div>

        <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-3.5">
          <span className="text-[10px] font-bold text-slate-500 uppercase block tracking-wider">Volatility Index</span>
          <div className="mt-1">
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-black uppercase tracking-wider ${
              volatility === 'HIGH' 
                ? 'bg-rose-100 text-rose-800 border border-rose-300' 
                : volatility === 'MEDIUM' 
                ? 'bg-amber-100 text-amber-800 border border-amber-300' 
                : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
            }`}>
              {volatility} Volatility
            </span>
          </div>
          <span className="text-[10px] font-semibold text-slate-500 block mt-1">Commodity Sensitivity</span>
        </div>
      </div>

      {/* Interactive Horizon Selector & Legend */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-slate-100/70 p-2.5 rounded-2xl border border-slate-200 text-xs">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1.5">
            <div className="w-3 h-0.5 bg-blue-600 rounded"></div>
            <span className="text-[11px] font-bold text-slate-700">Historical Price</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <div className="w-3.5 h-0.5 border-t-2 border-dashed border-amber-500"></div>
            <span className="text-[11px] font-bold text-amber-800">30-Day Forecast</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <div className="w-3 h-3 bg-amber-200/60 border border-amber-400 rounded-sm"></div>
            <span className="text-[11px] font-bold text-slate-600">Confidence Band</span>
          </div>
        </div>

        <div className="flex items-center space-x-1">
          <span className="text-[10px] font-extrabold text-slate-500 uppercase mr-1">Horizon:</span>
          {[7, 15, 30].map((h) => (
            <button
              key={h}
              onClick={() => setHorizon(h as any)}
              className={`px-2.5 py-1 rounded-xl text-[11px] font-bold transition ${
                horizon === h
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-white text-slate-600 hover:bg-slate-200 border border-slate-200'
              }`}
            >
              +{h} Days
            </button>
          ))}
        </div>
      </div>

      {/* SVG Chart Area */}
      <div className="relative bg-white border border-slate-200/90 rounded-2xl p-4 shadow-sm overflow-hidden">
        {hoveredPoint && (
          <div 
            className="absolute z-20 bg-slate-900 text-white p-2.5 rounded-xl shadow-xl text-xs space-y-1 pointer-events-none transition-all duration-75 border border-slate-700"
            style={{
              left: `${Math.min(width - 160, Math.max(70, getX(chartPoints.findIndex(p => p.date === hoveredPoint.date))))}px`,
              top: `${Math.max(10, getY(hoveredPoint.price) - 75)}px`
            }}
          >
            <div className="flex items-center justify-between space-x-2 border-b border-slate-700 pb-1 font-mono">
              <span className="text-[11px] font-bold text-blue-300">{hoveredPoint.formattedDate}</span>
              <span className={`text-[10px] px-1.5 py-0.5 rounded font-black ${
                hoveredPoint.isForecast ? 'bg-amber-500/30 text-amber-300' : 'bg-blue-500/30 text-blue-300'
              }`}>
                {hoveredPoint.isForecast ? 'PREDICTED' : 'HISTORICAL'}
              </span>
            </div>
            <div className="font-mono font-black text-sm text-white">
              Rs. {hoveredPoint.price.toLocaleString()}
            </div>
            {hoveredPoint.isForecast && hoveredPoint.lowerBound && hoveredPoint.upperBound && (
              <div className="text-[10px] text-slate-400 font-mono">
                Range: Rs. {hoveredPoint.lowerBound.toLocaleString()} - Rs. {hoveredPoint.upperBound.toLocaleString()}
              </div>
            )}
            {hoveredPoint.changeFromCurrent !== undefined && (
              <div className={`text-[10px] font-bold ${
                hoveredPoint.changeFromCurrent > 0 ? 'text-amber-400' : hoveredPoint.changeFromCurrent < 0 ? 'text-emerald-400' : 'text-slate-400'
              }`}>
                {hoveredPoint.changeFromCurrent > 0 ? `+${hoveredPoint.changeFromCurrent}% vs Today` : `${hoveredPoint.changeFromCurrent}% vs Today`}
              </div>
            )}
          </div>
        )}

        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto overflow-visible select-none">
          <defs>
            <linearGradient id="histGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" />
            </linearGradient>

            <linearGradient id="forecastGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.02" />
            </linearGradient>
          </defs>

          {/* Background Grid Lines & Y-Axis Labels */}
          {yTicks.map((tick, idx) => {
            const y = getY(tick);
            return (
              <g key={idx}>
                <line
                  x1={paddingLeft}
                  y1={y}
                  x2={width - paddingRight}
                  y2={y}
                  stroke="#e2e8f0"
                  strokeDasharray="4 4"
                  strokeWidth="1"
                />
                <text
                  x={paddingLeft - 8}
                  y={y + 4}
                  textAnchor="end"
                  className="fill-slate-400 text-[10px] font-mono font-medium"
                >
                  Rs. {typeof tick === 'number' && tick >= 1000 ? `${(tick / 1000).toFixed(1)}k` : (tick ?? 0)}
                </text>
              </g>
            );
          })}

          {/* Historical Shaded Area */}
          <path d={histAreaPath} fill="url(#histGradient)" />

          {/* Confidence Band Polygon */}
          <path d={confidencePolygon} fill="url(#forecastGradient)" stroke="#fcd34d" strokeWidth="1" strokeDasharray="3 3" />

          {/* Historical Price Line */}
          <path
            d={`M ${histCoords}`}
            fill="none"
            stroke="#2563eb"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Forecast Price Line (Dashed) */}
          <path
            d={fullForecastPath}
            fill="none"
            stroke="#d97706"
            strokeWidth="3"
            strokeDasharray="6 4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Today Separator Line & Label */}
          {(() => {
            const todayX = getX(todayIndex);
            const todayY = getY(historicalPoints[todayIndex].price);
            return (
              <g>
                <line
                  x1={todayX}
                  y1={paddingTop - 10}
                  x2={todayX}
                  y2={height - paddingBottom}
                  stroke="#3b82f6"
                  strokeWidth="1.5"
                  strokeDasharray="2 2"
                />
                <circle cx={todayX} cy={todayY} r="6" className="fill-blue-600 stroke-white stroke-2 animate-pulse" />
                <rect
                  x={todayX - 24}
                  y={paddingTop - 18}
                  width="48"
                  height="16"
                  rx="8"
                  className="fill-blue-600"
                />
                <text
                  x={todayX}
                  y={paddingTop - 6}
                  textAnchor="middle"
                  className="fill-white text-[9px] font-black tracking-wider uppercase"
                >
                  TODAY
                </text>
              </g>
            );
          })()}

          {/* Interactive Node Circles for Each Data Point */}
          {chartPoints.map((p, idx) => {
            const x = getX(idx);
            const y = getY(p.price);
            const isToday = idx === todayIndex;
            const isHovered = hoveredPoint?.date === p.date;

            // Render x-axis labels periodically (e.g. every 5-6 points)
            const showXLabel = idx === 0 || idx === todayIndex || idx === chartPoints.length - 1 || idx % Math.ceil(chartPoints.length / 7) === 0;

            return (
              <g key={p.date}>
                {showXLabel && (
                  <text
                    x={x}
                    y={height - paddingBottom + 16}
                    textAnchor="middle"
                    className={`text-[9px] font-mono ${
                      p.isForecast ? 'fill-amber-600 font-bold' : isToday ? 'fill-blue-600 font-extrabold' : 'fill-slate-400'
                    }`}
                  >
                    {p.formattedDate}
                  </text>
                )}

                <circle
                  cx={x}
                  cy={y}
                  r={isHovered ? 7 : isToday ? 5 : p.isForecast ? 3.5 : 3}
                  className={`transition-all duration-150 cursor-pointer ${
                    p.isForecast 
                      ? isHovered ? 'fill-amber-600 stroke-white stroke-2' : 'fill-amber-500 stroke-white stroke-1' 
                      : isHovered ? 'fill-blue-700 stroke-white stroke-2' : 'fill-blue-600 stroke-white stroke-1'
                  }`}
                  onMouseEnter={() => setHoveredPoint(p)}
                  onMouseLeave={() => setHoveredPoint(null)}
                />
              </g>
            );
          })}
        </svg>
      </div>

      {/* Recommended Action & Market Drivers */}
      <div className="bg-slate-900 text-white rounded-2xl p-4 space-y-3 shadow-md">
        <div className="flex items-center space-x-2 text-blue-400">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <h5 className="text-xs font-black uppercase tracking-wider text-amber-300">
            Strategic AI Pricing Recommendation & Commodity Drivers
          </h5>
        </div>
        <p className="text-xs text-slate-200 leading-relaxed font-medium">
          {prediction.recommendation}
        </p>

        <div className="pt-2 border-t border-slate-800 space-y-1.5">
          <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Primary Market Driver Factors:</span>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {prediction.marketDrivers.map((driver, idx) => (
              <div key={idx} className="bg-slate-800/80 border border-slate-700 rounded-xl p-2 text-[11px] text-slate-300 flex items-start space-x-1.5">
                <span className="text-amber-400 font-bold">•</span>
                <span>{driver}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
