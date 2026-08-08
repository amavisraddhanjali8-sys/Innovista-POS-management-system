import React, { useState } from 'react';
import { PriceHistory } from '../types';
import { Search, History, ArrowUpRight, ArrowDownRight, Calendar, User, ShieldCheck } from 'lucide-react';

interface PriceHistoryAuditProps {
  history: PriceHistory[];
}

export const PriceHistoryAudit: React.FC<PriceHistoryAuditProps> = ({ history }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredHistory = history.filter((h) => 
    h.product_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    h.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    h.changed_by.toLowerCase().includes(searchTerm.toLowerCase()) ||
    h.reason.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4">
      {/* --- TOP BANNER CARD - LIGHT THEME STYLE --- */}
      <div className="bg-white text-slate-900 p-3.5 sm:p-4 rounded-lg shadow-xs border border-slate-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 relative overflow-hidden">
        <div className="space-y-0.5 relative z-10">
          <div className="flex flex-wrap items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-orange-500 text-white flex items-center justify-center shadow-xs">
              <History className="w-4 h-4" />
            </div>
            <h2 className="text-sm font-bold tracking-tight text-slate-900 uppercase">
              Master Price Audit Log & Change History
            </h2>
            <span className="bg-emerald-100 text-emerald-800 border border-emerald-200 text-[10px] px-2 py-0.5 rounded font-bold uppercase">
              Immutable Ledger
            </span>
          </div>
          <p className="text-[11px] text-slate-500 font-medium">
            Complete historical record of every master price adjustment, user justification, and timestamp across all 5 branches.
          </p>
        </div>

        {/* Search */}
        <div className="relative min-w-[260px] w-full md:w-auto relative z-10">
          <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search log by code, user, or reason..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-md pl-8 pr-3 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-orange-500 transition"
          />
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-100 text-slate-700 text-[10px] font-bold uppercase tracking-wider border-b border-slate-200">
                <th className="py-2.5 px-3">Timestamp</th>
                <th className="py-2.5 px-3">Item Code</th>
                <th className="py-2.5 px-3">Product Name</th>
                <th className="py-2.5 px-3">Old Price</th>
                <th className="py-2.5 px-3">New Master Price</th>
                <th className="py-2.5 px-3">Price Delta</th>
                <th className="py-2.5 px-3">Changed By</th>
                <th className="py-2.5 px-3">Business Justification</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredHistory.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-10 text-slate-400 font-medium">
                    No price history entries found matching search criteria.
                  </td>
                </tr>
              ) : (
                filteredHistory.map((item) => {
                  const delta = (item.new_price || 0) - (item.old_price || 0);
                  const deltaPct = item.old_price && item.old_price > 0 ? (((delta / item.old_price) * 100) || 0).toFixed(1) : '0.0';

                  return (
                    <tr key={item.id} className="hover:bg-slate-50 transition">
                      <td className="py-2 px-3 text-slate-500 font-mono text-[11px] whitespace-nowrap">
                        <div className="flex items-center space-x-1.5">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span>{item.changed_date}</span>
                        </div>
                      </td>
                      <td className="py-2 px-3 font-mono font-semibold text-orange-600 whitespace-nowrap">
                        {item.product_code}
                      </td>
                      <td className="py-2 px-3 font-semibold text-slate-900">
                        {item.product_name}
                      </td>
                      <td className="py-2 px-3 text-slate-400 line-through font-mono">
                        Rs. {item.old_price.toLocaleString()}
                      </td>
                      <td className="py-2 px-3 font-semibold text-emerald-700 font-mono">
                        Rs. {item.new_price.toLocaleString()}
                      </td>
                      <td className="py-2 px-3 font-mono whitespace-nowrap">
                        <span className={`inline-flex items-center font-semibold px-2 py-0.5 rounded text-[10px] ${
                          delta > 0 
                            ? 'bg-rose-50 text-rose-700 border border-rose-200' 
                            : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        }`}>
                          {delta > 0 ? <ArrowUpRight className="w-3 h-3 mr-0.5" /> : <ArrowDownRight className="w-3 h-3 mr-0.5" />}
                          {delta > 0 ? `+Rs. ${delta.toLocaleString()} (+${deltaPct}%)` : `-Rs. ${Math.abs(delta).toLocaleString()} (${deltaPct}%)`}
                        </span>
                      </td>
                      <td className="py-2 px-3 text-slate-800 font-semibold whitespace-nowrap">
                        <div className="flex items-center space-x-1.5">
                          <User className="w-3.5 h-3.5 text-orange-500" />
                          <span>{item.changed_by}</span>
                        </div>
                      </td>
                      <td className="py-2 px-3 text-slate-600 italic max-w-xs truncate text-[11px]">
                        "{item.reason}"
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
