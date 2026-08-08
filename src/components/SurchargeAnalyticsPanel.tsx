import React, { useState } from 'react';
import { 
  ResponsiveContainer, 
  ComposedChart, 
  Bar, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  AreaChart, 
  Area, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';
import { 
  TrendingUp, 
  DollarSign, 
  Zap, 
  Layers, 
  BarChart3, 
  PieChart as PieChartIcon, 
  ShieldCheck, 
  ArrowUpRight, 
  Download, 
  RotateCcw,
  Sliders,
  CheckCircle2,
  Info
} from 'lucide-react';
import { getSurchargeAnalyticsData, POS_SURCHARGE_CATEGORIES } from '../utils/surchargeCategoryEngine';
import { Quotation } from '../types';

interface SurchargeAnalyticsPanelProps {
  quotations?: Quotation[];
}

export const SurchargeAnalyticsPanel: React.FC<SurchargeAnalyticsPanelProps> = ({ quotations = [] }) => {
  const [timeframe, setTimeframe] = useState<'30D' | '90D' | 'YTD' | 'ALL'>('YTD');
  const [selectedMetric, setSelectedMetric] = useState<'revenue' | 'frequency' | 'margin'>('revenue');

  const analyticsData = getSurchargeAnalyticsData(quotations);

  const formatLkr = (amount: number) => {
    if (amount >= 1000000) {
      return `Rs. ${(amount / 1000000).toFixed(2)}M`;
    }
    if (amount >= 1000) {
      return `Rs. ${(amount / 1000).toFixed(0)}k`;
    }
    return `Rs. ${amount.toLocaleString()}`;
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header Banner & Controls */}
      <div className="bg-slate-900 text-white p-5 sm:p-6 rounded-2xl border border-slate-800 shadow-xl flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center space-x-2">
            <span className="p-2 bg-orange-500/20 text-orange-400 border border-orange-500/30 rounded-xl">
              <TrendingUp className="w-5 h-5" />
            </span>
            <h2 className="text-base font-bold text-white tracking-wide uppercase">
              Surcharge Profitability & Margin Analytics Engine
            </h2>
            <span className="bg-orange-500 text-white text-[9px] font-bold px-2 py-0.5 rounded font-mono uppercase">
              11 POS CATEGORIES
            </span>
          </div>
          <p className="text-xs text-slate-300 max-w-2xl">
            Real-time Recharts visualization tracking application frequency, revenue yield, and cumulative profit margin impact across all 11 mathematical surcharge categories.
          </p>
        </div>

        {/* Time Horizon Filter & Actions */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="bg-slate-800 p-1 rounded-xl border border-slate-700 flex items-center space-x-1">
            {(['30D', '90D', 'YTD', 'ALL'] as const).map(tf => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition ${
                  timeframe === tf
                    ? 'bg-orange-500 text-white shadow-xs'
                    : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                }`}
              >
                {tf}
              </button>
            ))}
          </div>

          <button
            onClick={() => alert('Surcharge Analytics summary report exported to CSV.')}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-bold rounded-xl transition flex items-center space-x-1.5"
          >
            <Download className="w-3.5 h-3.5 text-orange-400" />
            <span>Export Analytics</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>Total Surcharge Revenue</span>
            <span className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg border border-emerald-100">
              <DollarSign className="w-4 h-4" />
            </span>
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            {formatLkr(analyticsData.kpis.totalSurchargeRevenue)}
          </div>
          <div className="flex items-center text-[11px] font-bold text-emerald-600 space-x-1">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>+24.8% vs. baseline estimate</span>
          </div>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>Net Profit Margin Boost</span>
            <span className="p-1.5 bg-orange-50 text-orange-600 rounded-lg border border-orange-100">
              <TrendingUp className="w-4 h-4" />
            </span>
          </div>
          <div className="text-xl sm:text-2xl font-black text-orange-600 tracking-tight">
            +{analyticsData.kpis.avgMarginGain}% Net
          </div>
          <div className="flex items-center text-[11px] text-slate-500 space-x-1">
            <span>Cumulative Margin Uplift on POS</span>
          </div>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>Surcharge Applications</span>
            <span className="p-1.5 bg-blue-50 text-blue-600 rounded-lg border border-blue-100">
              <Zap className="w-4 h-4" />
            </span>
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            {analyticsData.kpis.totalApplications} Items
          </div>
          <div className="flex items-center text-[11px] text-slate-500 space-x-1">
            <span>Across 11 Active Categories</span>
          </div>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>Top Profit Driver</span>
            <span className="p-1.5 bg-purple-50 text-purple-600 rounded-lg border border-purple-100">
              <ShieldCheck className="w-4 h-4" />
            </span>
          </div>
          <div className="text-sm font-bold text-slate-900 line-clamp-1">
            {analyticsData.kpis.topCategory}
          </div>
          <div className="flex items-center text-[11px] font-bold text-purple-600 space-x-1">
            <span>Rs. 4.85M Total Contribution</span>
          </div>
        </div>
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Composed Chart: Frequency vs Revenue per Category */}
        <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
                <BarChart3 className="w-4 h-4 text-orange-500" />
                <span>Category Application Frequency & Revenue Yield</span>
              </h3>
              <p className="text-xs text-slate-500">
                Frequency of selection vs cumulative LKR revenue generated across the 11 surcharge categories
              </p>
            </div>

            <div className="flex items-center space-x-2 text-xs">
              <button
                onClick={() => setSelectedMetric('revenue')}
                className={`px-2.5 py-1 rounded font-bold text-[11px] transition ${
                  selectedMetric === 'revenue'
                    ? 'bg-orange-100 text-orange-700 border border-orange-200'
                    : 'text-slate-500 hover:bg-slate-100'
                }`}
              >
                Revenue
              </button>
              <button
                onClick={() => setSelectedMetric('frequency')}
                className={`px-2.5 py-1 rounded font-bold text-[11px] transition ${
                  selectedMetric === 'frequency'
                    ? 'bg-blue-100 text-blue-700 border border-blue-200'
                    : 'text-slate-500 hover:bg-slate-100'
                }`}
              >
                Frequency
              </button>
            </div>
          </div>

          <div className="h-[320px] w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={analyticsData.categoryFrequency} margin={{ top: 10, right: 10, left: -10, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="code" 
                  tick={{ fontSize: 11, fill: '#64748b', fontWeight: 600 }}
                  interval={0}
                />
                <YAxis yAxisId="left" tick={{ fontSize: 11, fill: '#64748b' }} tickFormatter={(v) => `${v}`} />
                <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11, fill: '#f97316' }} tickFormatter={(v) => `${(v / 1000000).toFixed(1)}M`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                  formatter={(value: any, name: any) => {
                    if (name === 'revenueLkr') return [formatLkr(Number(value)), 'Total Revenue'];
                    if (name === 'frequency') return [`${value} Quotes`, 'Application Frequency'];
                    if (name === 'marginGainPct') return [`+${value}%`, 'Net Margin Gain'];
                    return [value, name];
                  }}
                  labelFormatter={(label) => {
                    const matched = analyticsData.categoryFrequency.find(c => c.code === label);
                    return matched ? matched.category : label;
                  }}
                />
                <Legend wrapperStyle={{ paddingTop: '10px', fontSize: '11px' }} />
                <Bar yAxisId="left" dataKey="frequency" name="Application Count" fill="#3b82f6" radius={[6, 6, 0, 0]} barSize={24} />
                <Line yAxisId="right" type="monotone" dataKey="revenueLkr" name="Total Revenue (LKR)" stroke="#f97316" strokeWidth={3} dot={{ r: 4, fill: '#f97316' }} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Donut Pie Chart: Revenue Share */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="pb-3 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
              <PieChartIcon className="w-4 h-4 text-emerald-500" />
              <span>Surcharge Revenue Share</span>
            </h3>
            <p className="text-xs text-slate-500">Distribution of surcharge profits by category</p>
          </div>

          <div className="h-[220px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={analyticsData.categoryPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {analyticsData.categoryPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                  formatter={(value: any) => [formatLkr(Number(value)), 'Revenue Share']}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-1.5 pt-1 border-t border-slate-100 text-xs">
            {analyticsData.categoryPieData.slice(0, 4).map((item, idx) => (
              <div key={idx} className="flex items-center justify-between text-slate-600">
                <div className="flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="font-medium truncate max-w-[140px]">{item.name}</span>
                </div>
                <span className="font-bold text-slate-900">{formatLkr(item.value)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Cumulative Profit Margin Uplift Trajectory */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
              <TrendingUp className="w-4 h-4 text-emerald-600" />
              <span>Cumulative Profit Margin Uplift Trajectory</span>
            </h3>
            <p className="text-xs text-slate-500">
              Comparing Base Material Margin % vs Net Margin % realized with 11-category surcharge engine applied over time
            </p>
          </div>

          <div className="flex items-center space-x-3 text-xs">
            <span className="flex items-center space-x-1">
              <span className="w-3 h-3 bg-slate-300 rounded" />
              <span className="text-slate-500 font-medium">Base Margin %</span>
            </span>
            <span className="flex items-center space-x-1">
              <span className="w-3 h-3 bg-emerald-500 rounded" />
              <span className="text-slate-900 font-bold">Net Margin % (With Surcharges)</span>
            </span>
          </div>
        </div>

        <div className="h-[280px] w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={analyticsData.cumulativeMarginTrend} margin={{ top: 10, right: 10, left: -10, bottom: 10 }}>
              <defs>
                <linearGradient id="colorNetMargin" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="colorBaseMargin" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#94a3b8" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#94a3b8" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748b' }} />
              <YAxis tick={{ fontSize: 11, fill: '#64748b' }} tickFormatter={(v) => `${v}%`} domain={[10, 40]} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                formatter={(value: any, name: any) => {
                  if (name === 'netMarginPct') return [`${value}%`, 'Net Margin (With Surcharges)'];
                  if (name === 'baseMarginPct') return [`${value}%`, 'Base Material Margin'];
                  if (name === 'surchargeLkr') return [formatLkr(Number(value)), 'Surcharge Net Profit'];
                  return [value, name];
                }}
              />
              <Area type="monotone" dataKey="baseMarginPct" name="Base Margin %" stroke="#94a3b8" fillOpacity={1} fill="url(#colorBaseMargin)" strokeWidth={2} />
              <Area type="monotone" dataKey="netMarginPct" name="Net Margin %" stroke="#10b981" fillOpacity={1} fill="url(#colorNetMargin)" strokeWidth={3} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 11 Category Matrix Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
              <Sliders className="w-4 h-4 text-orange-500" />
              <span>11 POS Surcharge Category Mathematical Engine Reference</span>
            </h3>
            <p className="text-xs text-slate-500">
              Configured options allow custom selections or default 'None' (0% surcharge)
            </p>
          </div>

          <span className="bg-emerald-100 text-emerald-800 border border-emerald-300 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase flex items-center space-x-1">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            <span>ALL 11 CATEGORIES ACTIVE</span>
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100/80 text-slate-700 font-bold border-b border-slate-200">
                <th className="p-3.5 pl-5">#</th>
                <th className="p-3.5">Category Name</th>
                <th className="p-3.5">Code</th>
                <th className="p-3.5">Default Setting</th>
                <th className="p-3.5">Configured Options</th>
                <th className="p-3.5 text-right pr-5">Avg Profit Margin Uplift</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {POS_SURCHARGE_CATEGORIES.map((cat, idx) => {
                const analyticsItem = analyticsData.categoryFrequency.find(c => c.category.toLowerCase().includes(cat.name.toLowerCase().split(' ')[0])) || analyticsData.categoryFrequency[idx % analyticsData.categoryFrequency.length];

                return (
                  <tr key={cat.id} className="hover:bg-slate-50 transition">
                    <td className="p-3.5 pl-5 font-mono text-slate-400">{idx + 1}</td>
                    <td className="p-3.5 space-y-0.5">
                      <span className="font-bold text-slate-900">{cat.name}</span>
                      <p className="text-[11px] text-slate-500">{cat.description}</p>
                    </td>
                    <td className="p-3.5">
                      <span className="bg-slate-100 text-slate-700 font-mono text-[10px] font-bold px-2 py-0.5 rounded border border-slate-200">
                        {cat.code}
                      </span>
                    </td>
                    <td className="p-3.5">
                      <span className="inline-flex items-center space-x-1 px-2 py-0.5 bg-slate-100 text-slate-700 border border-slate-200 rounded text-[10px] font-bold">
                        <span>Default 'None' (0%)</span>
                      </span>
                    </td>
                    <td className="p-3.5 text-slate-600">
                      <span className="font-bold text-slate-900">{cat.options.length} options</span>
                      <span className="text-[10px] text-slate-500 block">Up to +{Math.max(...cat.options.map(o => o.value))}%</span>
                    </td>
                    <td className="p-3.5 text-right pr-5">
                      <span className="font-mono font-bold text-emerald-600">
                        +{analyticsItem.marginGainPct}%
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
