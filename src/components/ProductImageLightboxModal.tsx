import React, { useState } from 'react';
import {
  X,
  Maximize2,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  RotateCw,
  Upload,
  Camera,
  Image as ImageIcon,
  Check,
  Tag,
  Layers,
  Shield,
  Zap,
  Info,
  DollarSign,
  Box,
  Sliders,
  Sparkles,
  ShieldCheck,
  Printer
} from 'lucide-react';
import { Product, PricingTier } from '../types';
import { resolveProductVariantPrice } from '../utils/priceVariantEngine';
import { LocationPriceSlidingCell } from './LocationPriceSlidingCell';
import { ALL_SRI_LANKA_REGIONS } from '../utils/sriLankaRegions';
import { PrintableWarrantyModal } from './PrintableWarrantyModal';

interface ProductImageLightboxModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateImage?: (productId: string, newImageUrl: string) => void;
  onOpenEditMaster?: (product: Product) => void;
  isHO?: boolean;
}

const SAMPLE_PRESET_IMAGES: { title: string; url: string }[] = [];

export const ProductImageLightboxModal: React.FC<ProductImageLightboxModalProps> = ({
  product,
  isOpen,
  onClose,
  onUpdateImage,
  onOpenEditMaster,
  isHO = true
}) => {
  if (!isOpen || !product) return null;

  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [rotation, setRotation] = useState<number>(0);
  const [showUploader, setShowUploader] = useState<boolean>(false);
  const [customUrl, setCustomUrl] = useState<string>('');
  const [selectedTier, setSelectedTier] = useState<PricingTier>('Retail');
  const [showWarrantyModal, setShowWarrantyModal] = useState<boolean>(false);

  const activeImage = product.image_url || SAMPLE_PRESET_IMAGES[0].url;
  const basePrice = product.base_price || product.current_price || 0;
  const calc = resolveProductVariantPrice(product, { quantity: 1, customer_type: 'Retail Customer' });

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onUpdateImage) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          onUpdateImage(product.id, reader.result);
          setShowUploader(false);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleApplyPresetImage = (url: string) => {
    if (onUpdateImage) {
      onUpdateImage(product.id, url);
      setShowUploader(false);
    }
  };

  const handleApplyCustomUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (customUrl.trim() && onUpdateImage) {
      onUpdateImage(product.id, customUrl.trim());
      setCustomUrl('');
      setShowUploader(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-white flex flex-col h-screen w-screen overflow-hidden">
      <div className="bg-white w-full h-full flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="px-4 py-3 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center space-x-3">
            <span className="font-mono font-semibold text-xs bg-orange-500/20 text-orange-400 border border-orange-500/30 px-2 py-0.5 rounded">
              {product.product_code}
            </span>
            <div>
              <h2 className="text-sm font-semibold text-white tracking-tight flex items-center space-x-2">
                <span>{product.product_name}</span>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-semibold px-2 py-0.2 rounded uppercase">
                  {product.status || 'Active'}
                </span>
              </h2>
              <p className="text-[11px] text-slate-400 font-medium">
                Category: {product.category} | Profile Series: {product.profile_series || 'Standard'}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowUploader(!showUploader)}
              className="bg-orange-500 hover:bg-orange-600 text-white border border-orange-400/30 px-2.5 py-1 rounded-md text-xs font-semibold transition flex items-center space-x-1.5 shadow-xs"
            >
              <Camera className="w-3.5 h-3.5" />
              <span>{showUploader ? 'Close Image Options' : 'Upload / Change Photo'}</span>
            </button>

            {onOpenEditMaster && (
              <button
                onClick={() => {
                  onClose();
                  onOpenEditMaster(product);
                }}
                className="bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 px-2.5 py-1 rounded-md text-xs font-semibold transition flex items-center space-x-1 shadow-xs"
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>Edit Formulas</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded-md transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 overflow-y-auto grow">
          {/* Left Column: Interactive High-Res Image View & Zoom & Rotate */}
          <div className="lg:col-span-7 bg-slate-900 p-6 flex flex-col justify-between relative min-h-[380px]">
            {/* Zoom & Rotate Floating Controls */}
            <div className="absolute top-4 left-4 z-10 bg-slate-950/80 backdrop-blur-md border border-white/15 rounded-xl p-1 flex items-center space-x-1 text-white shadow-xl">
              <button
                onClick={() => setZoomLevel((z) => Math.max(0.6, z - 0.2))}
                className="p-1.5 hover:bg-white/20 rounded-lg transition"
                title="Zoom Out"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <span className="text-[11px] font-mono font-bold px-1.5">
                {Math.round(zoomLevel * 100)}%
              </span>
              <button
                onClick={() => setZoomLevel((z) => Math.min(3.0, z + 0.2))}
                className="p-1.5 hover:bg-white/20 rounded-lg transition"
                title="Zoom In"
              >
                <ZoomIn className="w-4 h-4" />
              </button>

              <div className="h-4 w-px bg-white/20 mx-1" />

              <button
                onClick={() => setRotation((r) => (r - 90) % 360)}
                className="p-1.5 hover:bg-white/20 rounded-lg transition"
                title="Rotate Counter-Clockwise"
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              <button
                onClick={() => setRotation((r) => (r + 90) % 360)}
                className="p-1.5 hover:bg-white/20 rounded-lg transition"
                title="Rotate Clockwise"
              >
                <RotateCw className="w-4 h-4" />
              </button>

              <button
                onClick={() => { setZoomLevel(1); setRotation(0); }}
                className="px-2 py-1 text-[10px] font-bold hover:bg-white/20 rounded-lg transition border-l border-white/10"
              >
                Reset
              </button>
            </div>

            {/* Vector Specification Badge Display Container */}
            <div className="grow flex items-center justify-center overflow-hidden my-auto p-4 relative min-h-[260px]">
              <div className="bg-slate-900/80 border border-white/10 rounded-2xl p-8 text-center max-w-sm w-full space-y-3">
                <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-[#E87F24] to-[#73A5CA] flex items-center justify-center text-white font-mono font-black text-xl shadow-lg">
                  {product.product_code.substring(0, 3)}
                </div>
                <h3 className="text-white font-black text-lg">{product.product_name}</h3>
                <p className="text-slate-400 text-xs font-mono">{product.product_code} • {product.category}</p>
              </div>
            </div>
          </div>

          {/* Right Column: Complete Technical Specifications & 7 Master Data Sections */}
          <div className="lg:col-span-5 p-5 bg-slate-50 space-y-4 overflow-y-auto max-h-[80vh]">
            <div className="flex items-center justify-between gap-2">
              <div>
                <span className="text-[10px] font-semibold text-orange-600 uppercase tracking-wider block mb-0.5">
                  Master Variant Engineering Lightbox
                </span>
                <h3 className="text-base font-semibold text-slate-900 leading-snug">
                  {product.product_name}
                </h3>
              </div>
              <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase border shrink-0 ${
                product.status === 'Active'
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                  : product.status === 'Inactive' || (product.status as string) === 'Deactive'
                  ? 'bg-rose-50 text-rose-700 border-rose-300'
                  : 'bg-amber-50 text-amber-700 border-amber-300'
              }`}>
                ● {product.status || 'Active'}
              </span>
            </div>

            {/* SECTION 1: IDENTITY & CATEGORY */}
            <div className="bg-white border border-slate-200 rounded-md p-3.5 space-y-2 shadow-2xs">
              <span className="text-[11px] font-semibold text-slate-900 uppercase flex items-center space-x-1.5 border-b border-slate-100 pb-1.5">
                <span className="w-4 h-4 rounded-full bg-orange-500 text-white font-mono text-[9px] flex items-center justify-center font-bold">1</span>
                <span>Identity & Category</span>
              </span>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-slate-50 p-2 rounded border border-slate-200">
                  <span className="text-[10px] text-slate-500 block">Code:</span>
                  <strong className="font-mono text-orange-600">{product.product_code}</strong>
                </div>
                <div className="bg-slate-50 p-2 rounded border border-slate-200">
                  <span className="text-[10px] text-slate-500 block">Category:</span>
                  <strong className="text-slate-800">{product.category}</strong>
                </div>
              </div>
            </div>

            {/* SECTION 2: UNITS & DISPLAY */}
            <div className="bg-white border border-slate-200 rounded-md p-3.5 space-y-2 shadow-2xs">
              <span className="text-[11px] font-semibold text-slate-900 uppercase flex items-center space-x-1.5 border-b border-slate-100 pb-1.5">
                <span className="w-4 h-4 rounded-full bg-orange-500 text-white font-mono text-[9px] flex items-center justify-center font-bold">2</span>
                <span>Units & Display Format</span>
              </span>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-slate-50 p-2 rounded border border-slate-200">
                  <span className="text-[10px] text-slate-500 block">Base Unit:</span>
                  <strong className="text-slate-900 uppercase">{product.unit}</strong>
                </div>
                <div className="bg-slate-50 p-2 rounded border border-slate-200">
                  <span className="text-[10px] text-slate-500 block">Display Method:</span>
                  <strong className="text-slate-800">{product.price_display_method || 'Standard'}</strong>
                </div>
              </div>
            </div>

            {/* SECTION 3: RATES & MARGINS */}
            <div className="bg-white border border-slate-200 rounded-md p-3.5 space-y-2 shadow-2xs">
              <span className="text-[11px] font-semibold text-slate-900 uppercase flex items-center space-x-1.5 border-b border-slate-100 pb-1.5">
                <span className="w-4 h-4 rounded-full bg-orange-500 text-white font-mono text-[9px] flex items-center justify-center font-bold">3</span>
                <span>Rates & Margin Floors</span>
              </span>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="bg-slate-50 p-2 rounded border border-slate-200">
                  <span className="text-[10px] text-slate-500 block">Base Rate:</span>
                  <strong className="font-mono text-slate-900">Rs. {basePrice.toLocaleString()}</strong>
                </div>
                <div className="bg-slate-50 p-2 rounded border border-slate-200">
                  <span className="text-[10px] text-slate-500 block">HO Cost:</span>
                  <strong className="font-mono text-slate-700">Rs. {(product.cost_price || Math.round(basePrice * 0.8)).toLocaleString()}</strong>
                </div>
                <div className="bg-slate-50 p-2 rounded border border-slate-200">
                  <span className="text-[10px] text-amber-700 block">Min Floor:</span>
                  <strong className="font-mono text-amber-800">Rs. {(product.min_selling_price || Math.round(basePrice * 0.9)).toLocaleString()}</strong>
                </div>
              </div>
            </div>

            {/* SECTION 4: SPECS & HARDWARE */}
            <div className="bg-white border border-slate-200 rounded-md p-3.5 space-y-3 shadow-2xs">
              <span className="text-[11px] font-semibold text-slate-900 uppercase flex items-center space-x-1.5 border-b border-slate-100 pb-1.5 justify-between">
                <span className="flex items-center space-x-1.5">
                  <span className="w-4 h-4 rounded-full bg-orange-500 text-white font-mono text-[9px] flex items-center justify-center font-bold">4</span>
                  <span>Specs, Engineering & Multi-Material Matrix</span>
                </span>
                <span className="text-[10px] text-blue-600 font-bold">
                  {(product.main_materials?.length || 0) + (product.hardware_accessories?.length || 0) + (product.glass_specs?.length || 0)} Items Specified
                </span>
              </span>

              {/* Core Attributes */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                <div className="bg-slate-50 p-2 rounded border border-slate-200">
                  <span className="text-[10px] text-slate-500 block">Profile Series:</span>
                  <strong className="text-slate-800 font-semibold">{product.profile_series || 'Standard'}</strong>
                </div>
                <div className="bg-slate-50 p-2 rounded border border-slate-200">
                  <span className="text-[10px] text-slate-500 block">Lock System:</span>
                  <strong className="text-slate-800 font-semibold">{product.lock_type || 'Standard Mortise'}</strong>
                </div>
                <div className="bg-slate-50 p-2 rounded border border-slate-200">
                  <span className="text-[10px] text-slate-500 block">Handle Type:</span>
                  <strong className="text-slate-800 font-semibold">{product.handle_type || 'Flush Pull'}</strong>
                </div>
                <div className="bg-slate-50 p-2 rounded border border-slate-200">
                  <span className="text-[10px] text-slate-500 block">Roller System:</span>
                  <strong className="text-slate-800 font-semibold">{product.roller_type || 'Standard Roller'}</strong>
                </div>
              </div>

              {/* Main Materials Matrix */}
              {product.main_materials && product.main_materials.length > 0 && (
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-700 uppercase tracking-wider block">Main Materials & Profiles:</span>
                  <div className="space-y-1">
                    {product.main_materials.map((m, i) => (
                      <div key={m.id || i} className="bg-slate-50 p-2 rounded border border-slate-200 text-[11px] flex items-center justify-between">
                        <div>
                          <span className="font-bold text-slate-900">{m.materialType}: </span>
                          <span className="text-slate-700 font-semibold">{m.profileName} ({m.sizeDimensions})</span>
                          <span className="text-slate-500 text-[10px] block">Brands: {m.supplierBrands?.join(', ') || 'N/A'} • {m.color}</span>
                        </div>
                        {m.surchargeLkr ? (
                          <span className="font-mono font-bold text-amber-700 text-[10px] bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded">
                            +Rs. {m.surchargeLkr.toLocaleString()}
                          </span>
                        ) : null}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Glass Specs */}
              {product.glass_specs && product.glass_specs.length > 0 && (
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-700 uppercase tracking-wider block">Glass Specifications:</span>
                  <div className="space-y-1">
                    {product.glass_specs.map((g, i) => (
                      <div key={g.id || i} className="bg-slate-50 p-2 rounded border border-slate-200 text-[11px] flex items-center justify-between">
                        <div>
                          <span className="font-bold text-slate-900">{g.glassType} ({g.thicknessMm})</span>
                          <span className="text-slate-500 text-[10px] block">Brand: {g.brand} • Supplier: {g.supplier} • Standards: {g.standards?.join(', ')}</span>
                        </div>
                        {g.surchargeLkr ? (
                          <span className="font-mono font-bold text-amber-700 text-[10px] bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded">
                            +Rs. {g.surchargeLkr.toLocaleString()}
                          </span>
                        ) : null}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Hardware & Accessories */}
              {product.hardware_accessories && product.hardware_accessories.length > 0 && (
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-700 uppercase tracking-wider block">Hardware & Accessories:</span>
                  <div className="space-y-1">
                    {product.hardware_accessories.map((h, i) => (
                      <div key={h.id || i} className="bg-slate-50 p-2 rounded border border-slate-200 text-[11px] flex items-center justify-between">
                        <div>
                          <span className="font-bold text-slate-900">{h.name}</span>
                          <span className="text-slate-500 text-[10px] block">Specs: {h.brandSpecs} • Qty: {h.qty} • Warranty: {h.warrantyPeriod}</span>
                        </div>
                        {h.surchargeLkr ? (
                          <span className="font-mono font-bold text-amber-700 text-[10px] bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded">
                            +Rs. {h.surchargeLkr.toLocaleString()}
                          </span>
                        ) : null}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Technical Features Pointwise */}
              {product.technical_details && product.technical_details.length > 0 && (
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-700 uppercase tracking-wider block">Pointwise Technical Features:</span>
                  <ul className="list-disc list-inside space-y-0.5 bg-slate-50 p-2 rounded border border-slate-200 text-[11px] text-slate-800">
                    {product.technical_details.map((t, i) => (
                      <li key={t.id || i}>
                        <strong className="text-blue-900">{t.category}:</strong> {t.point}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Warranties & DLP */}
              {((product.warranty_terms_specs && product.warranty_terms_specs.length > 0) || (product.dlp_frameworks && product.dlp_frameworks.length > 0)) && (
                <div className="space-y-2">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                    {product.warranty_terms_specs?.map((w, i) => (
                      <div key={w.id || i} className="bg-blue-50/60 border border-blue-200 p-2 rounded">
                        <span className="font-bold text-blue-900 block">{w.warrantyType} ({w.timePeriod})</span>
                        <span className="text-[10px] text-blue-800">{w.applicableMaterials}</span>
                      </div>
                    ))}
                    {product.dlp_frameworks?.map((d, i) => (
                      <div key={d.id || i} className="bg-amber-50/60 border border-amber-200 p-2 rounded">
                        <span className="font-bold text-amber-900 block">{d.periodMonths} Months DLP Framework</span>
                        <span className="text-[10px] text-amber-800">{d.terms}</span>
                      </div>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowWarrantyModal(true)}
                    className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs py-2 px-3 rounded-md transition flex items-center justify-center space-x-1.5 shadow-xs cursor-pointer"
                  >
                    <ShieldCheck className="w-4 h-4 text-emerald-200" />
                    <span>Warranty</span>
                  </button>
                </div>
              )}
              {(!product.warranty_terms_specs?.length && !product.dlp_frameworks?.length) && (
                <button
                  type="button"
                  onClick={() => setShowWarrantyModal(true)}
                  className="w-full bg-slate-800 hover:bg-slate-700 text-white font-extrabold text-xs py-2 px-3 rounded-md transition flex items-center justify-center space-x-1.5 shadow-xs cursor-pointer mt-2"
                >
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Warranty</span>
                </button>
              )}
            </div>

            {/* SECTION 5: OPTION SURCHARGES */}
            <div className="bg-white border border-slate-200 rounded-md p-3.5 space-y-2 shadow-2xs">
              <span className="text-[11px] font-semibold text-slate-900 uppercase flex items-center space-x-1.5 border-b border-slate-100 pb-1.5">
                <span className="w-4 h-4 rounded-full bg-orange-500 text-white font-mono text-[9px] flex items-center justify-center font-bold">5</span>
                <span>Option Surcharges</span>
              </span>
              <div className="bg-slate-50 p-2.5 rounded border border-slate-200 text-xs space-y-1 font-mono">
                <div className="flex justify-between text-slate-600">
                  <span>Thickness:</span>
                  <span className="font-semibold text-slate-800">{Object.keys(product.thickness_prices || {}).length || 0} rates</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Finishes:</span>
                  <span className="font-semibold text-slate-800">{Object.keys(product.finish_prices || {}).length || 0} rates</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Glass:</span>
                  <span className="font-semibold text-slate-800">{Object.keys(product.glass_prices || {}).length || 0} rates</span>
                </div>
              </div>
            </div>

            {/* SECTION 6: TIERS & MULTI-FACTOR */}
            <div className="bg-white border border-slate-200 rounded-md p-3.5 space-y-2 shadow-2xs">
              <span className="text-[11px] font-semibold text-slate-900 uppercase flex items-center space-x-1.5 border-b border-slate-100 pb-1.5">
                <span className="w-4 h-4 rounded-full bg-orange-500 text-white font-mono text-[9px] flex items-center justify-center font-bold">6</span>
                <span>Tiers & Multi-Factor</span>
              </span>
              <div className="bg-slate-50 p-2.5 rounded border border-slate-200 text-xs space-y-1 font-mono">
                <div className="flex justify-between text-slate-600">
                  <span>Customer Tier Matrix:</span>
                  <span className="font-semibold text-orange-600">{Object.keys(product.tier_prices || {}).length || 0} tiers</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Quantity Breaks:</span>
                  <span className="font-semibold text-emerald-700">{product.quantity_breaks?.length || 0} volume rules</span>
                </div>
              </div>
            </div>

            {/* SECTION 6B: LOCATION & REGIONAL PRICING SLIDING CELL & DATA LOG */}
            {isHO && Object.keys(product.region_prices || {}).length > 0 && (
              <div className="bg-white border border-slate-200 rounded-md p-3.5 space-y-3 shadow-2xs">
                <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
                  <span className="text-[11px] font-semibold text-slate-900 uppercase flex items-center space-x-1.5">
                    <span className="w-4 h-4 rounded-full bg-orange-500 text-white font-mono text-[9px] flex items-center justify-center font-bold">6B</span>
                    <span>Sri Lanka Location & Regional Pricing</span>
                  </span>
                  <span className="text-[10px] text-orange-600 font-bold">
                    {Object.keys(product.region_prices || {}).length} Regions Configured
                  </span>
                </div>

                {/* Upward Sliding Interactive Cell */}
                <div className="bg-slate-900 p-2 rounded-lg border border-slate-800">
                  <LocationPriceSlidingCell
                    regionPrices={product.region_prices}
                    basePriceVal={basePrice}
                    productName={product.product_name}
                    autoSlideGlobal={true}
                  />
                </div>

                {/* Complete Region Data Log List */}
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                    Regional Surcharge Data Log:
                  </span>
                  <div className="max-h-[140px] overflow-y-auto divide-y divide-slate-100 bg-slate-50 border border-slate-200 rounded-md text-[11px]">
                    {Object.entries(product.region_prices || {}).map(([rName, rawSurcharge]) => {
                      const rSurcharge = Number(rawSurcharge) || 0;
                      const matchedReg = ALL_SRI_LANKA_REGIONS.find(r => r.name === rName || r.district === rName);
                      return (
                        <div key={rName} className="p-2 flex items-center justify-between bg-white">
                          <div>
                            <div className="font-semibold text-slate-900">{rName}</div>
                            <div className="text-[9px] text-slate-500">
                              {matchedReg ? `${matchedReg.district} • ${matchedReg.province}` : 'Sri Lanka Zone'}
                            </div>
                          </div>
                          <div className="text-right font-mono font-bold text-orange-600">
                            Rs. {(basePrice + rSurcharge).toLocaleString()}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* SECTION 7: REVISION AUDIT */}
            <div className="bg-white border border-slate-200 rounded-md p-3.5 space-y-2 shadow-2xs">
              <span className="text-[11px] font-semibold text-slate-900 uppercase flex items-center space-x-1.5 border-b border-slate-100 pb-1.5">
                <span className="w-4 h-4 rounded-full bg-orange-500 text-white font-mono text-[9px] flex items-center justify-center font-bold">7</span>
                <span>Revision Audit Log</span>
              </span>
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className="text-slate-600">Updated: <strong className="font-mono text-slate-800">{product.last_updated || '2026-08-01'}</strong></div>
                <div className="text-slate-600">By: <strong className="text-slate-800">{product.updated_by || 'HO Admin'}</strong></div>
              </div>
            </div>

          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 bg-slate-100 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500 shrink-0">
          <div className="flex items-center space-x-2">
            <span className="font-mono">Last Updated: {product.last_updated || '2026-08-01'}</span>
            <span>•</span>
            <span>By: {product.updated_by || 'HO Master Admin'}</span>
          </div>

          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-extrabold rounded-xl transition shadow-md"
          >
            Close Spec Lightbox
          </button>
        </div>

        {/* PRINTABLE WARRANTY CERTIFICATE MODAL */}
        {showWarrantyModal && (
          <PrintableWarrantyModal
            product={product}
            onClose={() => setShowWarrantyModal(false)}
          />
        )}
      </div>
    </div>
  );
};

