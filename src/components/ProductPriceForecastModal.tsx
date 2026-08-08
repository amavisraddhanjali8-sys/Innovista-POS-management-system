import React, { useState, useMemo } from 'react';
import { Product, PriceHistory } from '../types';
import { calculateProductTrendPrediction, SimulationParams } from '../utils/trendPredictionEngine';
import { ProductPriceTrendForecastChart } from './ProductPriceTrendForecastChart';
import { TrendingUp, X, Sliders, RefreshCw, AlertTriangle, ShieldCheck, Sparkles, Building2, Calendar, FileText } from 'lucide-react';

interface ProductPriceForecastModalProps {
  product: Product;
  priceHistory: PriceHistory[];
  onClose: () => void;
  onProposePrice?: (id: string, proposedPrice: number, reason: string) => Promise<void>;
}

export const ProductPriceForecastModal: React.FC<ProductPriceForecastModalProps> = ({
  product,
  priceHistory,
  onClose,
  onProposePrice
}) => {
  const [rawMaterialOffset, setRawMaterialOffset] = useState<number>(0);
  const [fuelInflation, setFuelInflation] = useState<number>(0);
  const [demandSurge, setDemandSurge] = useState<number>(0);

  const [proposingPrice, setProposingPrice] = useState(false);
  const [proposalSuccess, setProposalSuccess] = useState(false);

  // Compute live prediction based on current simulation sliders
  const simParams: SimulationParams = useMemo(() => ({
    rawMaterialOffsetPct: rawMaterialOffset,
    fuelInflationPct: fuelInflation,
    demandSurgePct: demandSurge
  }), [rawMaterialOffset, fuelInflation, demandSurge]);

  const prediction = useMemo(() => {
    return calculateProductTrendPrediction(product, priceHistory, simParams);
  }, [product, priceHistory, simParams]);

  const handleResetSim = () => {
    setRawMaterialOffset(0);
    setFuelInflation(0);
    setDemandSurge(0);
  };

  const handleApplyForecastAsProposal = async () => {
    if (!onProposePrice) return;
    setProposingPrice(true);
    try {
      await onProposePrice(
        product.id,
        prediction.projectedPrice30d,
        `30-Day Trend Forecast Adjustment (Simulated +${prediction.priceChangePct30d}% 30d projection)`
      );
      setProposalSuccess(true);
      setTimeout(() => {
        setProposalSuccess(false);
      }, 3000);
    } catch (e) {
      alert('Failed to submit price proposal');
    } finally {
      setProposingPrice(false);
    }
  };

  // Milestone points (7d, 15d, 30d)
  const p7 = prediction.forecastPoints[6];
  const p15 = prediction.forecastPoints[14];
  const p30 = prediction.forecastPoints[29];

  return (
    <div className="fixed inset-0 z-50 bg-white flex flex-col h-screen w-screen overflow-hidden">
      <div className="bg-white w-full h-full flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <div className="bg-orange-500/20 p-2 rounded-md border border-orange-500/30 text-orange-400">
              <TrendingUp className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-mono text-xs font-semibold bg-orange-500/20 text-orange-300 px-2 py-0.5 rounded border border-orange-400/30">
                  {product.product_code}
                </span>
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                  {product.category}
                </span>
              </div>
              <h3 className="text-sm font-semibold text-white mt-0.5">
                30-Day Predictive Price Forecast & Scenario Simulator
              </h3>
              <p className="text-[11px] text-slate-400">
                {product.product_name} • Base Rate: Rs. {product.current_price.toLocaleString()} / {product.unit}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-md hover:bg-slate-800 transition font-semibold"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-5 overflow-y-auto text-xs text-slate-800">
          {/* Main Chart Section */}
          <ProductPriceTrendForecastChart prediction={prediction} />

          {/* Interactive Market Scenario Simulator Panel */}
          <div className="bg-slate-50 border border-slate-200 rounded-md p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-slate-900">
                <Sliders className="w-4 h-4 text-orange-500" />
                <h4 className="text-xs font-semibold uppercase tracking-wider">
                  Macro-Economic & Supply Chain Scenario Simulator
                </h4>
              </div>
              {(rawMaterialOffset !== 0 || fuelInflation !== 0 || demandSurge !== 0) && (
                <button
                  onClick={handleResetSim}
                  className="text-[11px] text-orange-600 hover:text-orange-700 font-semibold flex items-center space-x-1"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Reset Sliders</span>
                </button>
              )}
            </div>

            <p className="text-[11px] text-slate-600 font-medium">
              Adjust supply chain factors below to test hypothetical commodity price movements and inspect their projected impact on the 30-day forecast:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 bg-white p-3 rounded-md border border-slate-200 shadow-2xs">
              {/* Slider 1: Raw Material Offset */}
              <div className="space-y-1">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-slate-700">Raw Material Index</span>
                  <span className={`font-mono font-semibold ${rawMaterialOffset > 0 ? 'text-orange-600' : rawMaterialOffset < 0 ? 'text-emerald-600' : 'text-slate-600'}`}>
                    {rawMaterialOffset > 0 ? `+${rawMaterialOffset}%` : `${rawMaterialOffset}%`}
                  </span>
                </div>
                <input
                  type="range"
                  min="-10"
                  max="20"
                  step="1"
                  value={rawMaterialOffset}
                  onChange={(e) => setRawMaterialOffset(parseFloat(e.target.value))}
                  className="w-full accent-orange-500 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>-10% Discount</span>
                  <span>+20% Spike</span>
                </div>
              </div>

              {/* Slider 2: Fuel & Logistics Inflation */}
              <div className="space-y-1">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-slate-700">Fuel & Freight Rate</span>
                  <span className={`font-mono font-semibold ${fuelInflation > 0 ? 'text-orange-600' : fuelInflation < 0 ? 'text-emerald-600' : 'text-slate-600'}`}>
                    {fuelInflation > 0 ? `+${fuelInflation}%` : `${fuelInflation}%`}
                  </span>
                </div>
                <input
                  type="range"
                  min="-5"
                  max="15"
                  step="1"
                  value={fuelInflation}
                  onChange={(e) => setFuelInflation(parseFloat(e.target.value))}
                  className="w-full accent-orange-500 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>-5% Fuel Drop</span>
                  <span>+15% Tariff Surge</span>
                </div>
              </div>

              {/* Slider 3: Demand Surge */}
              <div className="space-y-1">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-slate-700">Construction Demand</span>
                  <span className={`font-mono font-semibold ${demandSurge > 0 ? 'text-orange-600' : demandSurge < 0 ? 'text-emerald-600' : 'text-slate-600'}`}>
                    {demandSurge > 0 ? `+${demandSurge}%` : `${demandSurge}%`}
                  </span>
                </div>
                <input
                  type="range"
                  min="-10"
                  max="25"
                  step="1"
                  value={demandSurge}
                  onChange={(e) => setDemandSurge(parseFloat(e.target.value))}
                  className="w-full accent-orange-500 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>-10% Slump</span>
                  <span>+25% Boom</span>
                </div>
              </div>
            </div>
          </div>

          {/* Milestone Forecast Matrix Table */}
          <div className="bg-white border border-slate-200 rounded-md p-4 space-y-2.5 shadow-2xs">
            <h4 className="text-xs font-semibold uppercase text-slate-700 tracking-wider flex items-center">
              <Calendar className="w-4 h-4 text-orange-500 mr-2" />
              Forecast Horizon Milestone Projections
            </h4>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                    <th className="py-2 px-2.5">Milestone Horizon</th>
                    <th className="py-2 px-2.5">Target Date</th>
                    <th className="py-2 px-2.5">Projected Price</th>
                    <th className="py-2 px-2.5">Expected Variance</th>
                    <th className="py-2 px-2.5">Confidence Interval Range</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono text-xs">
                  <tr className="bg-orange-50/30">
                    <td className="py-2 px-2.5 font-semibold text-slate-900">Baseline Today</td>
                    <td className="py-2 px-2.5 text-slate-600">{prediction.historicalPoints[prediction.historicalPoints.length - 1]?.formattedDate}</td>
                    <td className="py-2 px-2.5 font-semibold text-slate-900">Rs. {prediction.currentPrice.toLocaleString()}</td>
                    <td className="py-2 px-2.5 text-slate-500 font-semibold">— Baseline —</td>
                    <td className="py-2 px-2.5 text-slate-500 font-semibold">Exact Baseline</td>
                  </tr>

                  {p7 && (
                    <tr>
                      <td className="py-2 px-2.5 font-semibold text-slate-800">+7 Days Forecast</td>
                      <td className="py-2 px-2.5 text-slate-600">{p7.formattedDate}</td>
                      <td className="py-2 px-2.5 font-semibold text-slate-900">Rs. {p7.price.toLocaleString()}</td>
                      <td className={`py-2 px-2.5 font-semibold ${p7.changeFromCurrent && p7.changeFromCurrent > 0 ? 'text-orange-600' : 'text-emerald-600'}`}>
                        {p7.changeFromCurrent && p7.changeFromCurrent > 0 ? `+${p7.changeFromCurrent}%` : `${p7.changeFromCurrent}%`}
                      </td>
                      <td className="py-2 px-2.5 text-slate-600">
                        Rs. {p7.lowerBound?.toLocaleString()} – Rs. {p7.upperBound?.toLocaleString()}
                      </td>
                    </tr>
                  )}

                  {p15 && (
                    <tr>
                      <td className="py-2 px-2.5 font-semibold text-slate-800">+15 Days Forecast</td>
                      <td className="py-2 px-2.5 text-slate-600">{p15.formattedDate}</td>
                      <td className="py-2 px-2.5 font-semibold text-slate-900">Rs. {p15.price.toLocaleString()}</td>
                      <td className={`py-2 px-2.5 font-semibold ${p15.changeFromCurrent && p15.changeFromCurrent > 0 ? 'text-orange-600' : 'text-emerald-600'}`}>
                        {p15.changeFromCurrent && p15.changeFromCurrent > 0 ? `+${p15.changeFromCurrent}%` : `${p15.changeFromCurrent}%`}
                      </td>
                      <td className="py-2 px-2.5 text-slate-600">
                        Rs. {p15.lowerBound?.toLocaleString()} – Rs. {p15.upperBound?.toLocaleString()}
                      </td>
                    </tr>
                  )}

                  {p30 && (
                    <tr className="bg-orange-50/50">
                      <td className="py-2 px-2.5 font-semibold text-orange-950">+30 Days Full Horizon</td>
                      <td className="py-2 px-2.5 text-orange-900">{p30.formattedDate}</td>
                      <td className="py-2 px-2.5 font-semibold text-orange-950">Rs. {p30.price.toLocaleString()}</td>
                      <td className={`py-2 px-2.5 font-semibold ${prediction.priceChangePct30d > 0 ? 'text-orange-700' : 'text-emerald-700'}`}>
                        {prediction.priceChangePct30d > 0 ? `+${prediction.priceChangePct30d}%` : `${prediction.priceChangePct30d}%`}
                      </td>
                      <td className="py-2 px-2.5 text-orange-900 font-semibold">
                        Rs. {p30.lowerBound?.toLocaleString()} – Rs. {p30.upperBound?.toLocaleString()}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-md font-semibold text-xs transition"
          >
            Close Forecast
          </button>

          {onProposePrice && (
            <button
              onClick={handleApplyForecastAsProposal}
              disabled={proposingPrice || proposalSuccess}
              className="px-4 py-1.5 bg-orange-500 hover:bg-orange-600 text-white rounded-md font-semibold text-xs transition shadow-xs flex items-center space-x-1.5"
            >
              {proposingPrice ? (
                <span>Submitting Proposal...</span>
              ) : proposalSuccess ? (
                <span className="text-emerald-200">✓ Proposal Submitted for Approval!</span>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5 text-amber-200" />
                  <span>Propose 30d Forecast Price (Rs. {prediction.projectedPrice30d.toLocaleString()})</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
