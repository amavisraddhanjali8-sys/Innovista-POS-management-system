import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Barcode1D } from './BarcodeGenerator';
import { Printer, X, Package, ShieldCheck, Building2, CheckCircle2, DollarSign, Sliders, Layers, Tag, MapPin, Users } from 'lucide-react';
import { Product } from '../types';
import { ALL_SRI_LANKA_REGIONS } from '../utils/sriLankaRegions';

interface PrintableProductSpecModalProps {
  product: Product;
  onClose: () => void;
}

export const PrintableProductSpecModal: React.FC<PrintableProductSpecModalProps> = ({
  product,
  onClose
}) => {
  const handlePrint = () => {
    window.print();
  };

  const basePrice = product.base_price || product.current_price || 0;
  const costPrice = product.cost_price || Math.round(basePrice * 0.8);
  const minSellingPrice = product.min_selling_price || Math.round(basePrice * 0.9);
  const marginPct = costPrice > 0 ? (((basePrice - costPrice) / costPrice) * 100).toFixed(1) : '25.0';

  return (
    <div className="fixed inset-0 z-50 bg-[#0F203C]/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto printable-modal-overlay">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-4xl w-full max-h-[94vh] flex flex-col overflow-hidden my-auto text-[#0F203C]">
        
        {/* MODAL CONTROLS HEADER (Hidden during printing via CSS) */}
        <div className="p-4 bg-[#0F203C] text-white flex items-center justify-between shrink-0 border-b border-slate-800 printable-modal-header no-print">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-[#E87F24] rounded-xl text-white shadow-2xs">
              <Printer className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base text-white flex items-center space-x-2">
                <span>Master Datasheet & Price Spec Sheet</span>
                <span className="bg-[#FFC81E] text-[#0F203C] text-[10px] font-bold px-2 py-0.5 rounded-full font-mono">
                  {product.product_code}
                </span>
              </h3>
              <p className="text-xs text-slate-300">
                Official Head Office Technical Specification & Price Schedule for printing and archiving
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 printable-modal-controls">
            <button
              onClick={handlePrint}
              className="bg-[#E87F24] hover:bg-[#D26E1A] text-white px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 shadow-md cursor-pointer"
              title="Print Spec Sheet (Ctrl + P)"
            >
              <Printer className="w-4 h-4 text-[#FFC81E]" />
              <span>Print</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* PRINTABLE SPECIFICATION CONTAINER */}
        <div className="p-6 sm:p-8 overflow-y-auto grow bg-white printable-quotation-container space-y-6">
          
          {/* HEADER BRANDING & DATASHEET TITLE */}
          <div className="flex items-start justify-between border-b-2 border-[#0F203C] pb-4">
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-lg bg-[#0F203C] text-[#FFC81E] flex items-center justify-center font-black text-sm">
                  IN
                </div>
                <div>
                  <h1 className="font-black text-xl text-[#0F203C] tracking-tight">
                    INNOVISTA ENTERPRISE
                  </h1>
                  <span className="text-[10px] uppercase font-bold tracking-widest text-[#E87F24] block">
                    Central Master Price & Specification Datasheet
                  </span>
                </div>
              </div>
            </div>

            <div className="text-right space-y-1">
              <div className="inline-block bg-[#0F203C] text-white px-3 py-1 rounded-md text-xs font-extrabold font-mono tracking-wider">
                SKU: {product.product_code}
              </div>
              <div className="text-[10px] text-slate-500 font-medium">
                Published: {new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
              </div>
            </div>
          </div>

          {/* MAIN PRODUCT SUMMARY ROW */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 bg-slate-50 border border-slate-200 rounded-2xl p-5">
            {/* Specification Badge Box */}
            <div className="md:col-span-4 bg-white border border-slate-200 rounded-xl p-3 flex flex-col items-center justify-center text-center">
              <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-[#E87F24] to-[#0F203C] flex items-center justify-center text-white font-mono font-black text-2xl shadow-sm my-2">
                {product.product_code.substring(0, 3)}
              </div>
              <span className="text-[9px] font-bold text-slate-500 uppercase mt-2">
                Official Technical Item Code
              </span>
            </div>

            {/* Core Specs */}
            <div className="md:col-span-8 space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <span className="bg-[#E87F24]/10 text-[#E87F24] border border-[#E87F24]/30 text-[10px] font-bold px-2 py-0.5 rounded uppercase">
                    {product.category}
                  </span>
                  <h2 className="text-lg font-black text-[#0F203C] mt-1">
                    {product.product_name}
                  </h2>
                  <p className="text-xs text-slate-600 mt-0.5">
                    {product.description || 'Architectural Grade System Component for Commercial and Residential Applications.'}
                  </p>
                </div>
                <span className={`text-[10px] font-extrabold px-3 py-1 rounded-full uppercase border ${
                  product.status === 'Active'
                    ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                    : 'bg-rose-100 text-rose-800 border-rose-300'
                }`}>
                  {product.status || 'Active'}
                </span>
              </div>

              {/* Price Range Box */}
              <div className="bg-[#FEFDDF] border border-[#FFC81E]/80 rounded-xl p-3.5 grid grid-cols-3 gap-3 text-center">
                <div>
                  <span className="text-[9px] font-bold text-slate-500 uppercase block">Minimum Floor Rate</span>
                  <span className="text-sm font-extrabold text-[#D26E1A] font-mono">
                    Rs. {minSellingPrice.toLocaleString()}
                  </span>
                </div>
                <div className="border-x border-[#FFC81E]/60">
                  <span className="text-[9px] font-bold text-slate-500 uppercase block">Master Base Selling Rate</span>
                  <span className="text-base font-black text-[#0F203C] font-mono">
                    Rs. {basePrice.toLocaleString()}
                  </span>
                  <span className="text-[9px] text-slate-500 font-semibold block">per {product.unit}</span>
                </div>
                <div>
                  <span className="text-[9px] font-bold text-slate-500 uppercase block">Head Office Cost Rate</span>
                  <span className="text-sm font-extrabold text-slate-700 font-mono">
                    Rs. {costPrice.toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                <div className="bg-white p-2 rounded-lg border border-slate-200">
                  <span className="text-[9px] font-bold text-slate-400 uppercase block">Sub-Category</span>
                  <strong className="text-slate-800">{product.sub_category || 'General Line'}</strong>
                </div>
                <div className="bg-white p-2 rounded-lg border border-slate-200">
                  <span className="text-[9px] font-bold text-slate-400 uppercase block">Unit Weight</span>
                  <strong className="text-slate-800">{product.unit_weight_kg || 5.0} kg / {product.unit}</strong>
                </div>
                <div className="bg-white p-2 rounded-lg border border-slate-200">
                  <span className="text-[9px] font-bold text-slate-400 uppercase block">Profile Series</span>
                  <strong className="text-slate-800">{product.profile_series || 'Standard Series'}</strong>
                </div>
                <div className="bg-white p-2 rounded-lg border border-slate-200">
                  <span className="text-[9px] font-bold text-slate-400 uppercase block">Target Margin</span>
                  <strong className="text-emerald-700">{marginPct}%</strong>
                </div>
              </div>
            </div>
          </div>

          {/* CUSTOMER TIER & MULTI-FACTOR ENGINE SPECIFICATIONS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Customer Tier Pricing Matrix */}
            <div className="border border-slate-200 rounded-xl p-4 bg-white space-y-3">
              <h3 className="font-extrabold text-xs text-[#0F203C] uppercase tracking-wider flex items-center space-x-1.5 border-b pb-2">
                <Users className="w-4 h-4 text-[#E87F24]" />
                <span>Customer Classification Tier Rates</span>
              </h3>
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b text-[10px] font-bold text-slate-400 uppercase">
                    <th className="pb-1.5">Customer Tier</th>
                    <th className="pb-1.5 text-right">Adjustment</th>
                    <th className="pb-1.5 text-right">Effective Rate</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono">
                  <tr>
                    <td className="py-1.5 font-sans font-medium text-slate-800">Retail Customer</td>
                    <td className="py-1.5 text-right text-slate-500">Base</td>
                    <td className="py-1.5 text-right font-bold text-slate-900">Rs. {basePrice.toLocaleString()}</td>
                  </tr>
                  <tr>
                    <td className="py-1.5 font-sans font-medium text-slate-800">Trade Contractor (-5%)</td>
                    <td className="py-1.5 text-right text-emerald-600">-5.0%</td>
                    <td className="py-1.5 text-right font-bold text-slate-900">Rs. {(product.tier_prices?.['Trade Contractor'] || Math.round(basePrice * 0.95)).toLocaleString()}</td>
                  </tr>
                  <tr>
                    <td className="py-1.5 font-sans font-medium text-slate-800">Corporate Account (-8%)</td>
                    <td className="py-1.5 text-right text-emerald-600">-8.0%</td>
                    <td className="py-1.5 text-right font-bold text-slate-900">Rs. {(product.tier_prices?.['Corporate Account'] || Math.round(basePrice * 0.92)).toLocaleString()}</td>
                  </tr>
                  <tr>
                    <td className="py-1.5 font-sans font-medium text-slate-800">Architect Partner (-10%)</td>
                    <td className="py-1.5 text-right text-emerald-600">-10.0%</td>
                    <td className="py-1.5 text-right font-bold text-slate-900">Rs. {(product.tier_prices?.['Architect Partner'] || Math.round(basePrice * 0.90)).toLocaleString()}</td>
                  </tr>
                  <tr>
                    <td className="py-1.5 font-sans font-medium text-slate-800">Wholesale Distributor (-12%)</td>
                    <td className="py-1.5 text-right text-emerald-600">-12.0%</td>
                    <td className="py-1.5 text-right font-bold text-slate-900">Rs. {(product.tier_prices?.['Wholesale Distributor'] || Math.round(basePrice * 0.88)).toLocaleString()}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Technical Hardware & Engineering Specifications */}
            <div className="border border-slate-200 rounded-xl p-4 bg-white space-y-3">
              <h3 className="font-extrabold text-xs text-[#0F203C] uppercase tracking-wider flex items-center space-x-1.5 border-b pb-2">
                <Sliders className="w-4 h-4 text-[#E87F24]" />
                <span>Multi-Factor Technical Surcharges</span>
              </h3>
              <div className="space-y-2 text-xs">
                <div className="bg-slate-50 p-2 rounded-lg">
                  <span className="text-[10px] font-bold text-slate-500 uppercase block">Available Thickness Grades</span>
                  <p className="font-mono text-slate-800 mt-0.5">
                    {(product.available_thicknesses || ['1.2mm', '1.5mm', '2.0mm']).join(' • ')}
                  </p>
                </div>
                <div className="bg-slate-50 p-2 rounded-lg">
                  <span className="text-[10px] font-bold text-slate-500 uppercase block">Surface Finishes</span>
                  <p className="font-mono text-slate-800 mt-0.5">
                    {(product.available_finishes || ['Powder Coated', 'Anodized Natural', 'Wood Grain Finish']).join(' • ')}
                  </p>
                </div>
                <div className="bg-slate-50 p-2 rounded-lg">
                  <span className="text-[10px] font-bold text-slate-500 uppercase block">Hardware Components</span>
                  <p className="text-slate-700">
                    Lock: <strong className="text-slate-900">{product.lock_type || 'Multi-Point Mortise'}</strong> | Handle: <strong className="text-slate-900">{product.handle_type || 'Architectural Lever'}</strong>
                  </p>
                </div>
              </div>
            </div>

          </div>

          {/* REGIONAL ZONE OVERRIDE MATRIX */}
          <div className="border border-slate-200 rounded-xl p-4 bg-white space-y-3">
            <h3 className="font-extrabold text-xs text-[#0F203C] uppercase tracking-wider flex items-center space-x-1.5 border-b pb-2">
              <MapPin className="w-4 h-4 text-[#E87F24]" />
              <span>Regional Zone Price Overrides across Sri Lanka</span>
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
              {ALL_SRI_LANKA_REGIONS.slice(0, 8).map((reg) => {
                const regPrice = product.regional_prices?.[reg.name] || basePrice;
                return (
                  <div key={reg.id} className="p-2 rounded bg-slate-50 border border-slate-100 flex flex-col justify-between">
                    <span className="text-[9px] font-sans font-bold text-slate-600 truncate">{reg.name}</span>
                    <span className="font-bold text-[#0F203C]">Rs. {regPrice.toLocaleString()}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* FOOTER VERIFICATION & STAMP */}
          <div className="pt-6 border-t-2 border-slate-200 flex items-center justify-between text-xs text-slate-500">
            <div className="flex items-center space-x-3">
              <QRCodeSVG value={`INNOVISTA-SKU:${product.product_code}:${basePrice}`} size={44} />
              <div>
                <span className="font-bold text-[#0F203C] block">Head Office Master Registry</span>
                <span className="text-[10px]">Verified System Record SKU #{product.id}</span>
              </div>
            </div>

            <div className="text-right space-y-1">
              <div className="text-[10px] uppercase font-bold text-[#E87F24]">Official Innovista Spec Sheet</div>
              <div className="text-[9px] text-slate-400">Computer Generated Document • No Manual Signature Required</div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
