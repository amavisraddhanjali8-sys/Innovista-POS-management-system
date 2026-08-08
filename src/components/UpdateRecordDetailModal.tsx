import React from 'react';
import { 
  X, 
  Clock, 
  User, 
  MapPin, 
  DollarSign, 
  FileText, 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle, 
  Tag, 
  Building2,
  Printer
} from 'lucide-react';
import { PriceHistory, Product } from '../types';

interface UpdateRecordDetailModalProps {
  record: PriceHistory;
  product?: Product;
  onClose: () => void;
}

export const UpdateRecordDetailModal: React.FC<UpdateRecordDetailModalProps> = ({
  record,
  product,
  onClose
}) => {
  const priceDiff = record.new_price - record.old_price;
  const pctChange = record.old_price > 0 ? ((priceDiff / record.old_price) * 100).toFixed(1) : '0.0';

  const handlePrintAudit = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden text-slate-100 animate-in fade-in zoom-in-95 duration-200 my-auto">
        
        {/* MODAL HEADER */}
        <div className="bg-slate-950 px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-orange-500/10 border border-orange-500/30 rounded-xl">
              <Sparkles className="w-5 h-5 text-orange-400" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-mono font-extrabold uppercase bg-slate-800 text-orange-400 px-2 py-0.5 rounded border border-slate-700">
                  {record.product_code}
                </span>
                <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded border ${
                  record.update_type === 'REGIONAL_OVERRIDE'
                    ? 'bg-indigo-950 text-indigo-300 border-indigo-700/60'
                    : record.update_type === 'STATUS_CHANGE'
                    ? 'bg-amber-950 text-amber-300 border-amber-700/60'
                    : 'bg-emerald-950 text-emerald-300 border-emerald-700/60'
                }`}>
                  {record.update_type ? record.update_type.replace('_', ' ') : 'PRICE UPDATE'}
                </span>
              </div>
              <h3 className="text-base font-bold text-white mt-1">
                {record.product_name}
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* MODAL BODY */}
        <div className="p-6 space-y-5 text-xs max-h-[80vh] overflow-y-auto">
          
          {/* TOP METRIC HIGHLIGHT CARDS */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Value Change Card */}
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 flex flex-col justify-between">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Updated Record Rates
              </span>
              <div className="my-2 flex items-baseline space-x-2">
                <span className="text-slate-400 line-through text-xs font-mono">
                  Rs. {record.old_price.toLocaleString()}
                </span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                <span className="text-base font-mono font-extrabold text-white">
                  Rs. {record.new_price.toLocaleString()}
                </span>
              </div>
              <div className="text-[10px]">
                {priceDiff > 0 ? (
                  <span className="text-emerald-400 font-bold">
                    +Rs. {priceDiff.toLocaleString()} (+{pctChange}%)
                  </span>
                ) : priceDiff < 0 ? (
                  <span className="text-rose-400 font-bold">
                    -Rs. {Math.abs(priceDiff).toLocaleString()} ({pctChange}%)
                  </span>
                ) : (
                  <span className="text-slate-400 font-bold">No Rate Variance</span>
                )}
              </div>
            </div>

            {/* Scope / Region Card */}
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 flex flex-col justify-between">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Target Region & Scope
              </span>
              <div className="my-2 flex items-center space-x-1.5 font-bold text-orange-400 text-sm">
                <MapPin className="w-4 h-4 shrink-0" />
                <span className="truncate">{record.region_affected || record.branch_affected}</span>
              </div>
              <span className="text-[10px] text-slate-400 font-medium">
                {record.branch_affected}
              </span>
            </div>

            {/* Record Status Card */}
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 flex flex-col justify-between">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Status Field
              </span>
              <div className="my-2 flex items-center space-x-1.5 font-bold text-emerald-400 text-sm">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="capitalize">{record.status || record.new_status || 'Active'}</span>
              </div>
              <span className="text-[10px] text-slate-400 font-medium">
                Previous: {record.old_status || 'Active'}
              </span>
            </div>
          </div>

          {/* METADATA GRID */}
          <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 space-y-3">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-1.5 border-b border-slate-800/80 pb-2">
              <FileText className="w-3.5 h-3.5 text-orange-400" />
              <span>Audit Stamp & Timestamp Details</span>
            </h4>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <span className="text-[10px] font-medium text-slate-400 uppercase block">Date & Time</span>
                <strong className="font-mono text-slate-200 flex items-center space-x-1 mt-0.5">
                  <Clock className="w-3 h-3 text-orange-400 shrink-0" />
                  <span>{record.changed_date}</span>
                </strong>
              </div>

              <div>
                <span className="text-[10px] font-medium text-slate-400 uppercase block">Authorized By</span>
                <strong className="text-slate-200 flex items-center space-x-1 mt-0.5 truncate">
                  <User className="w-3 h-3 text-blue-400 shrink-0" />
                  <span>{record.changed_by}</span>
                </strong>
              </div>

              <div>
                <span className="text-[10px] font-medium text-slate-400 uppercase block">Audit Record ID</span>
                <strong className="font-mono text-slate-300 text-[11px] block mt-0.5">
                  {record.id}
                </strong>
              </div>
            </div>
          </div>

          {/* REASON & BUSINESS JUSTIFICATION */}
          <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 space-y-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Reason & Business Justification
            </span>
            <p className="text-xs text-slate-200 leading-relaxed font-normal bg-slate-900/80 p-3 rounded-lg border border-slate-800">
              {record.reason || 'Standard master data / price synchronization log.'}
            </p>
          </div>

          {/* OPTIONAL PRODUCT PREVIEW DETAILS IF AVAILABLE */}
          {product && (
            <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 space-y-3">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Associated Master Product Snapshot
              </span>
              <div className="flex items-center space-x-3 bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                <div className="w-10 h-10 rounded bg-slate-800 border border-slate-700 text-slate-200 flex items-center justify-center font-mono font-bold text-xs shrink-0">
                  {product.product_code.substring(0, 3)}
                </div>
                <div className="space-y-0.5">
                  <div className="font-bold text-slate-200 text-xs">{product.product_name}</div>
                  <div className="text-[10px] text-slate-400 font-mono">
                    Category: {product.category} | Unit: {product.unit} | Weight: {product.unit_weight_kg || 0}kg
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* MODAL FOOTER */}
        <div className="bg-slate-950 px-6 py-3.5 border-t border-slate-800 flex items-center justify-between">
          <button
            type="button"
            onClick={handlePrintAudit}
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5 text-amber-400" />
            <span>Print Audit Record</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="bg-orange-600 hover:bg-orange-500 text-white font-bold px-4 py-1.5 rounded-lg text-xs transition cursor-pointer"
          >
            Close Details
          </button>
        </div>

      </div>
    </div>
  );
};
