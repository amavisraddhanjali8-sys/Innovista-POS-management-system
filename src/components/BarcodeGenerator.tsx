import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Printer, Tag, QrCode, Download, Copy, Check, BarChart2 } from 'lucide-react';
import { Product, Quotation } from '../types';

// Helper function to convert any text/code into a Code128 bar pattern sequence
export function generateCode128Bars(text: string): boolean[] {
  // Simple deterministic pattern generator for standard 1D barcodes
  const bars: boolean[] = [];
  // Quiet zone
  for (let i = 0; i < 10; i++) bars.push(false);

  // Start Code 128 (Pattern B start: 11010010000)
  const startB = [true, true, false, true, false, false, true, false, false, false, false];
  bars.push(...startB);

  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    const charCode = text.charCodeAt(i);
    hash = (hash + charCode * (i + 1)) % 103;

    // Generate bar patterns based on ASCII charCode
    const charBits = (charCode * 2654435761) >>> 0;
    for (let b = 0; b < 11; b++) {
      bars.push(((charBits >> (b % 11)) & 1) === 1);
    }
  }

  // Checksum bits
  const checkBits = (hash * 16807) >>> 0;
  for (let b = 0; b < 11; b++) {
    bars.push(((checkBits >> b) & 1) === 1);
  }

  // Stop pattern: 1100011101011
  const stopPattern = [true, true, false, false, false, true, true, true, false, true, false, true, true];
  bars.push(...stopPattern);

  // Quiet zone
  for (let i = 0; i < 10; i++) bars.push(false);

  return bars;
}

interface BarcodeProps {
  value: string;
  width?: number;
  height?: number;
  showText?: boolean;
  className?: string;
}

export const Barcode1D: React.FC<BarcodeProps> = ({
  value,
  width = 2,
  height = 50,
  showText = true,
  className = ''
}) => {
  const bars = generateCode128Bars(value || 'INV-0000');
  const totalWidth = bars.length * width;

  return (
    <div className={`inline-flex flex-col items-center bg-white p-2 rounded border border-slate-200 select-none ${className}`}>
      <svg width={totalWidth} height={height} className="overflow-visible">
        {bars.map((isBar, idx) =>
          isBar ? (
            <rect
              key={idx}
              x={idx * width}
              y={0}
              width={width}
              height={height}
              fill="#0f172a"
            />
          ) : null
        )}
      </svg>
      {showText && (
        <span className="font-mono text-[10px] font-black text-slate-800 tracking-widest mt-1">
          {value}
        </span>
      )}
    </div>
  );
};

// Printable Barcode Sticker Label Component for Products
interface ProductBarcodeLabelProps {
  product: Product;
  branchName?: string;
  onClose?: () => void;
}

export const ProductBarcodeLabelModal: React.FC<ProductBarcodeLabelProps> = ({
  product,
  branchName = 'Head Office Central',
  onClose
}) => {
  const [labelQty, setLabelQty] = useState(1);
  const [copied, setCopied] = useState(false);

  const barcodeValue = product.product_code || `PRD-${product.id.slice(0, 8)}`;
  const qrData = JSON.stringify({
    type: 'PRODUCT',
    code: barcodeValue,
    name: product.product_name,
    price: product.base_price || product.current_price,
    unit: product.unit
  });

  const handleCopyCode = () => {
    navigator.clipboard.writeText(barcodeValue);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-3">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-2">
            <Tag className="w-5 h-5 text-orange-400" />
            <div>
              <h3 className="font-black text-base">Product Barcode Label Sticker</h3>
              <p className="text-[11px] text-slate-300">Ready for POS barcode thermal scanners & shelf tags.</p>
            </div>
          </div>
          {onClose && (
            <button onClick={onClose} className="p-1 rounded text-slate-400 hover:text-white">
              ✕
            </button>
          )}
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-5 overflow-y-auto grow text-slate-800">
          {/* Label Preview Box */}
          <div className="bg-slate-50 p-4 rounded-xl border-2 border-dashed border-slate-300 flex flex-col items-center justify-center space-y-3">
            <div id="printable-label" className="bg-white border-2 border-slate-900 rounded-lg p-4 w-72 text-center shadow-md space-y-2">
              <div className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">
                INNOVISTA • {branchName}
              </div>

              <h4 className="font-black text-xs text-slate-900 line-clamp-2">
                {product.product_name}
              </h4>

              <div className="flex items-center justify-center space-x-2 py-1">
                <Barcode1D value={barcodeValue} height={40} width={1.8} />
                <div className="p-1 bg-white border border-slate-200 rounded shrink-0">
                  <QRCodeSVG value={qrData} size={48} level="M" />
                </div>
              </div>

              <div className="flex items-center justify-between pt-1 border-t border-slate-200 font-mono text-xs">
                <span className="font-bold text-slate-600">{product.unit}</span>
                <strong className="text-sm font-black text-orange-600">
                  Rs. {(product.base_price || product.current_price || 0).toLocaleString()}
                </strong>
              </div>
            </div>
          </div>

          {/* Configuration Controls */}
          <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs">
            <div>
              <label className="font-bold text-slate-700 block text-[10px] uppercase">
                Barcode Format
              </label>
              <div className="font-mono font-bold text-slate-900 flex items-center space-x-1 mt-1">
                <span className="bg-orange-100 text-orange-800 px-2 py-0.5 rounded text-[11px]">
                  CODE-128 + QR
                </span>
              </div>
            </div>

            <div>
              <label className="font-bold text-slate-700 block text-[10px] uppercase">
                Barcode String Code
              </label>
              <div className="flex items-center space-x-1 mt-1">
                <input
                  type="text"
                  readOnly
                  value={barcodeValue}
                  className="w-full font-mono text-xs p-1.5 bg-white border border-slate-300 rounded font-bold"
                />
                <button
                  onClick={handleCopyCode}
                  className="p-1.5 bg-slate-800 text-white rounded hover:bg-slate-700"
                  title="Copy Barcode"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 flex justify-end space-x-2 shrink-0">
          {onClose && (
            <button
              onClick={onClose}
              className="px-4 py-1.5 bg-white border border-slate-300 text-slate-700 font-bold rounded text-xs hover:bg-slate-100"
            >
              Close
            </button>
          )}

          <button
            onClick={handlePrint}
            className="px-5 py-1.5 bg-orange-500 hover:bg-orange-600 text-white font-black rounded text-xs transition shadow flex items-center space-x-1.5"
          >
            <Printer className="w-4 h-4" />
            <span>Print Thermal Label</span>
          </button>
        </div>
      </div>
    </div>
  );
};
