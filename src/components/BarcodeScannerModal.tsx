import React, { useState, useEffect, useRef } from 'react';
import { 
  Scan, 
  QrCode, 
  X, 
  Search, 
  CheckCircle2, 
  AlertCircle, 
  Camera, 
  Keyboard, 
  ShoppingBag, 
  FileText,
  Volume2
} from 'lucide-react';
import { Product, Quotation } from '../types';

interface BarcodeScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  quotations: Quotation[];
  onProductScanned: (product: Product) => void;
  onQuotationScanned: (quotation: Quotation) => void;
}

export const BarcodeScannerModal: React.FC<BarcodeScannerModalProps> = ({
  isOpen,
  onClose,
  products,
  quotations,
  onProductScanned,
  onQuotationScanned
}) => {
  const [scannedInput, setScannedInput] = useState('');
  const [isSequentialMode, setIsSequentialMode] = useState<boolean>(true);
  const [sessionScannedList, setSessionScannedList] = useState<Array<{
    code: string;
    name: string;
    price: number;
    timestamp: string;
  }>>([]);
  const [lastAddedToast, setLastAddedToast] = useState<string | null>(null);

  const [matchResult, setMatchResult] = useState<{
    type: 'PRODUCT' | 'ORDER' | 'UNKNOWN';
    product?: Product;
    quotation?: Quotation;
    code: string;
  } | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);

  // Synthesize crisp audio beep on barcode scan match
  const playScanBeep = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1200, ctx.currentTime);
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.12);
    } catch (e) {
      // ignore audio context policy blocks
    }
  };

  // Focus input automatically on open
  useEffect(() => {
    if (isOpen) {
      setScannedInput('');
      setMatchResult(null);
      setLastAddedToast(null);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleProcessBarcode = (codeToProcess: string) => {
    const cleanCode = codeToProcess.trim().toUpperCase();
    if (!cleanCode) return;

    // 1. Check Product match
    const foundProduct = products.find(p => 
      p.product_code.toUpperCase() === cleanCode ||
      p.id.toUpperCase() === cleanCode ||
      p.product_name.toUpperCase().includes(cleanCode)
    );

    if (foundProduct) {
      if (isSequentialMode) {
        // Sequential mode: Add item immediately to active quotation, stay open for next scan
        onProductScanned(foundProduct);
        playScanBeep();

        const price = foundProduct.base_price || foundProduct.current_price || 0;
        const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        
        setSessionScannedList(prev => [
          { code: foundProduct.product_code, name: foundProduct.product_name, price, timestamp: timeStr },
          ...prev
        ]);

        setLastAddedToast(`Added: ${foundProduct.product_code} — ${foundProduct.product_name} (Rs. ${price.toLocaleString()})`);
        setScannedInput('');
        setMatchResult(null);

        // Keep laser reader focused for immediate rapid fire scanning
        setTimeout(() => inputRef.current?.focus(), 50);
        return;
      } else {
        setMatchResult({
          type: 'PRODUCT',
          product: foundProduct,
          code: cleanCode
        });
        return;
      }
    }

    // 2. Check Order / Quotation match
    const foundQuotation = quotations.find(q => 
      q.quotation_number.toUpperCase() === cleanCode ||
      q.id.toUpperCase() === cleanCode ||
      (q.barcode && q.barcode.toUpperCase() === cleanCode)
    );

    if (foundQuotation) {
      setMatchResult({
        type: 'ORDER',
        quotation: foundQuotation,
        code: cleanCode
      });
      return;
    }

    // 3. Unknown
    setMatchResult({
      type: 'UNKNOWN',
      code: cleanCode
    });
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleProcessBarcode(scannedInput);
  };

  const handleConfirmScan = () => {
    if (!matchResult) return;
    if (matchResult.type === 'PRODUCT' && matchResult.product) {
      onProductScanned(matchResult.product);
      onClose();
    } else if (matchResult.type === 'ORDER' && matchResult.quotation) {
      onQuotationScanned(matchResult.quotation);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-3">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-orange-500 rounded-lg text-white">
              <Scan className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="font-black text-base">Barcode Scanner & Laser Reader</h3>
              <p className="text-[11px] text-slate-300">Point USB Laser Scanner or type Code to instantly trigger POS / Order lookup.</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4 text-xs max-h-[85vh] overflow-y-auto">

          {/* Sequential Mode Toggle Control Bar */}
          <div className="bg-slate-100 border border-slate-200 rounded-xl p-3 flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-slate-800 text-xs">Sequential Rapid Multi-Scan Mode</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold font-mono ${
                  isSequentialMode ? 'bg-emerald-500 text-white animate-pulse' : 'bg-slate-300 text-slate-700'
                }`}>
                  {isSequentialMode ? 'ENABLED' : 'OFF'}
                </span>
              </div>
              <p className="text-[10px] text-slate-500">
                {isSequentialMode 
                  ? 'Continuously scan barcodes without closing modal — items auto-add to active quotation!' 
                  : 'Single-scan mode: Shows item preview and requires manual confirmation.'}
              </p>
            </div>

            <button
              type="button"
              onClick={() => setIsSequentialMode(!isSequentialMode)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition shrink-0 ${
                isSequentialMode 
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs' 
                  : 'bg-slate-200 hover:bg-slate-300 text-slate-800'
              }`}
            >
              {isSequentialMode ? 'Sequential ON' : 'Turn ON Multi-Scan'}
            </button>
          </div>

          {/* Active Toast Alert for Sequential Scan Success */}
          {lastAddedToast && (
            <div className="bg-emerald-600 text-white p-3 rounded-xl shadow-md font-bold text-xs flex items-center justify-between animate-fade-in border border-emerald-400">
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-200 shrink-0 animate-bounce" />
                <span>{lastAddedToast}</span>
              </div>
              <button onClick={() => setLastAddedToast(null)} className="text-emerald-200 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Active Scanner Laser Visual Box */}
          <div className="relative bg-slate-900 rounded-xl p-6 text-center overflow-hidden border border-slate-800 space-y-3">
            <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-0.5 bg-rose-500 shadow-[0_0_12px_rgba(244,63,94,1)] animate-bounce pointer-events-none" />

            <div className="flex justify-center space-x-3 text-slate-400">
              <Camera className="w-6 h-6 animate-pulse text-orange-400" />
              <Keyboard className="w-6 h-6 text-slate-400" />
            </div>

            <p className="text-xs text-slate-300 font-mono">
              Ready for rapid sequential scanning (USB Laser Barcode Reader & 2D QR)
            </p>

            {/* Input Form */}
            <form onSubmit={handleFormSubmit} className="relative max-w-sm mx-auto">
              <input
                ref={inputRef}
                type="text"
                placeholder="Laser Scan or Type Barcode Code..."
                value={scannedInput}
                onChange={(e) => setScannedInput(e.target.value)}
                className="w-full text-center font-mono font-bold text-sm bg-slate-800 text-orange-400 border-2 border-orange-500/60 rounded-lg p-2.5 focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-500/20"
              />
              <button
                type="submit"
                className="absolute right-1.5 top-1.5 bottom-1.5 px-3 bg-orange-500 hover:bg-orange-600 text-white font-extrabold rounded text-xs transition cursor-pointer"
              >
                Scan
              </button>
            </form>
          </div>

          {/* Quick Demo Sample Barcodes */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase block">
              Quick Test Sample Barcodes (Click to scan)
            </span>
            <div className="flex flex-wrap gap-1.5">
              {products.slice(0, 4).map((p) => (
                <button
                  key={p.id}
                  onClick={() => {
                    setScannedInput(p.product_code);
                    handleProcessBarcode(p.product_code);
                  }}
                  className="bg-slate-100 hover:bg-orange-50 hover:border-orange-300 border border-slate-200 px-2 py-1 rounded font-mono text-[11px] text-slate-800 flex items-center space-x-1 cursor-pointer"
                >
                  <ShoppingBag className="w-3 h-3 text-orange-500" />
                  <span>{p.product_code}</span>
                </button>
              ))}

              {quotations.slice(0, 2).map((q) => (
                <button
                  key={q.id}
                  onClick={() => {
                    setScannedInput(q.quotation_number);
                    handleProcessBarcode(q.quotation_number);
                  }}
                  className="bg-slate-100 hover:bg-blue-50 hover:border-blue-300 border border-slate-200 px-2 py-1 rounded font-mono text-[11px] text-slate-800 flex items-center space-x-1 cursor-pointer"
                >
                  <FileText className="w-3 h-3 text-blue-500" />
                  <span>{q.quotation_number}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Session Scanned Items Log */}
          {sessionScannedList.length > 0 && (
            <div className="bg-slate-900 text-white rounded-xl p-3.5 space-y-2 border border-slate-800">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <div className="flex items-center space-x-2">
                  <Scan className="w-4 h-4 text-emerald-400" />
                  <span className="font-bold text-xs">Active Session Scan Log ({sessionScannedList.length} items)</span>
                </div>
                <button
                  onClick={() => setSessionScannedList([])}
                  className="text-[10px] text-slate-400 hover:text-rose-400 font-semibold"
                >
                  Clear Session Log
                </button>
              </div>

              <div className="max-h-36 overflow-y-auto space-y-1.5 pr-1 divide-y divide-slate-800 text-[11px]">
                {sessionScannedList.map((item, idx) => (
                  <div key={idx} className="pt-1.5 flex items-center justify-between">
                    <div>
                      <div className="flex items-center space-x-1.5">
                        <span className="font-mono font-bold text-orange-400 text-[10px] bg-slate-800 px-1 rounded">
                          {item.code}
                        </span>
                        <span className="font-semibold text-slate-200">{item.name}</span>
                      </div>
                      <span className="text-[9px] text-slate-400 font-mono">{item.timestamp}</span>
                    </div>
                    <span className="font-mono font-bold text-emerald-400">
                      Rs. {item.price.toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>

              <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                <span className="text-slate-300 font-medium text-[11px]">
                  Total Added Value: <strong className="text-amber-400 font-mono font-bold">
                    Rs. {sessionScannedList.reduce((acc, i) => acc + i.price, 0).toLocaleString()}
                  </strong>
                </span>
                <button
                  onClick={onClose}
                  className="bg-orange-500 hover:bg-orange-600 text-white font-extrabold text-xs px-3 py-1.5 rounded-lg transition"
                >
                  Finish & View Order Panel
                </button>
              </div>
            </div>
          )}

          {/* Match Result Display */}
          {matchResult && (
            <div className="pt-2">
              {matchResult.type === 'PRODUCT' && matchResult.product && (
                <div className="bg-emerald-50 border-2 border-emerald-300 p-4 rounded-xl space-y-2">
                  <div className="flex items-center space-x-2 text-emerald-900 font-bold text-xs">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Product Barcode Match Found!</span>
                  </div>

                  <div className="flex items-center justify-between bg-white p-2.5 rounded border border-emerald-200">
                    <div>
                      <h4 className="font-bold text-slate-900 text-xs">{matchResult.product.product_name}</h4>
                      <span className="font-mono text-[11px] text-orange-600 font-bold">{matchResult.product.product_code}</span>
                    </div>

                    <strong className="font-mono text-sm font-black text-slate-900">
                      Rs. {(matchResult.product.base_price || matchResult.product.current_price).toLocaleString()}
                    </strong>
                  </div>

                  <button
                    onClick={handleConfirmScan}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs py-2 rounded shadow transition flex items-center justify-center space-x-1"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Add Item to Quotation / Cart</span>
                  </button>
                </div>
              )}

              {matchResult.type === 'ORDER' && matchResult.quotation && (
                <div className="bg-blue-50 border-2 border-blue-300 p-4 rounded-xl space-y-2">
                  <div className="flex items-center space-x-2 text-blue-900 font-bold text-xs">
                    <CheckCircle2 className="w-4 h-4 text-blue-600" />
                    <span>Order / Quotation Barcode Match Found!</span>
                  </div>

                  <div className="flex items-center justify-between bg-white p-2.5 rounded border border-blue-200">
                    <div>
                      <h4 className="font-bold text-slate-900 text-xs">{matchResult.quotation.customer_name}</h4>
                      <span className="font-mono text-[11px] text-blue-600 font-bold">{matchResult.quotation.quotation_number}</span>
                    </div>

                    <strong className="font-mono text-sm font-black text-slate-900">
                      Rs. {matchResult.quotation.net_total.toLocaleString()}
                    </strong>
                  </div>

                  <button
                    onClick={handleConfirmScan}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs py-2 rounded shadow transition flex items-center justify-center space-x-1"
                  >
                    <FileText className="w-4 h-4" />
                    <span>Open Order Specification & Details</span>
                  </button>
                </div>
              )}

              {matchResult.type === 'UNKNOWN' && (
                <div className="bg-rose-50 border border-rose-200 p-3 rounded-lg flex items-center space-x-2 text-rose-800 text-xs font-semibold">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>No product or order found matching barcode: "{matchResult.code}"</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
