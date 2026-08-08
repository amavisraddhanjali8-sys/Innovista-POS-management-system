import React, { useState } from 'react';
import { 
  Keyboard, 
  X, 
  Search, 
  Settings, 
  Layers, 
  FileText, 
  Users, 
  Truck, 
  Building2, 
  Scan, 
  ShoppingCart, 
  CheckCircle2, 
  AlertCircle,
  HelpCircle,
  ExternalLink
} from 'lucide-react';
import { ShortcutSettingsMap, KeyboardShortcutConfig } from '../types';
import { formatShortcutDisplay, isMasterShortcutsEnabled } from '../utils/shortcutDefaults';

interface CheatSheetModalProps {
  isOpen: boolean;
  onClose: () => void;
  shortcuts: ShortcutSettingsMap;
  onGoToSettings?: () => void;
}

export const KeyboardShortcutCheatSheetModal: React.FC<CheatSheetModalProps> = ({
  isOpen,
  onClose,
  shortcuts,
  onGoToSettings
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const masterEnabled = isMasterShortcutsEnabled();

  if (!isOpen) return null;

  const allShortcuts: KeyboardShortcutConfig[] = Object.values(shortcuts);
  const filtered = allShortcuts.filter(s => 
    s.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    formatShortcutDisplay(s).toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const categories: Array<'Actions' | 'Navigation' | 'Panel & Tools'> = ['Actions', 'Panel & Tools', 'Navigation'];

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Actions':
        return <ShoppingCart className="w-4 h-4 text-orange-500" />;
      case 'Navigation':
        return <Layers className="w-4 h-4 text-blue-500" />;
      case 'Panel & Tools':
        return <Scan className="w-4 h-4 text-emerald-500" />;
      default:
        return <Keyboard className="w-4 h-4 text-slate-500" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-fadeIn">
      <div 
        className="bg-white border border-slate-200 rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-slate-900 text-white p-4 px-5 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-orange-500 text-white rounded-lg shadow-xs">
              <Keyboard className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-sm font-bold tracking-wide text-white">Keyboard Shortcuts & Hotkeys</h2>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  masterEnabled ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                }`}>
                  {masterEnabled ? '⚡ Active' : '⚠️ Disabled'}
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Quick reference guide for POS speed-dial key combinations
              </p>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition"
            title="Close Cheat Sheet (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Actions Bar */}
        <div className="p-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by action, category, or key combo (e.g. 'Ctrl+N', 'Search')..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
              autoFocus
            />
          </div>

          {onGoToSettings && (
            <button
              onClick={() => {
                onClose();
                onGoToSettings();
              }}
              className="flex items-center space-x-1.5 bg-white hover:bg-orange-50 text-orange-600 border border-orange-200 hover:border-orange-300 px-3 py-1.5 rounded-lg text-xs font-semibold shadow-2xs transition shrink-0"
            >
              <Settings className="w-3.5 h-3.5" />
              <span>Customize Keys</span>
              <ExternalLink className="w-3 h-3 ml-0.5 text-orange-400" />
            </button>
          )}
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {!masterEnabled && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-start space-x-3 text-xs text-amber-900">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Global Shortcuts are Currently Disabled</p>
                <p className="text-[11px] text-amber-700 mt-0.5">
                  You can re-enable keyboard shortcuts anytime in System Settings &gt; Keyboard Shortcuts.
                </p>
              </div>
            </div>
          )}

          {filtered.length === 0 ? (
            <div className="py-12 text-center text-slate-500 space-y-2">
              <Search className="w-8 h-8 mx-auto text-slate-300" />
              <p className="text-sm font-semibold">No shortcuts match "{searchTerm}"</p>
              <p className="text-xs text-slate-400">Try searching for 'Quotation', 'Search', or 'Alt'.</p>
            </div>
          ) : (
            categories.map(cat => {
              const catShortcuts = filtered.filter(s => s.category === cat);
              if (catShortcuts.length === 0) return null;

              return (
                <div key={cat} className="space-y-2.5">
                  <div className="flex items-center space-x-2 border-b border-slate-200 pb-1.5">
                    {getCategoryIcon(cat)}
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                      {cat} ({catShortcuts.length})
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                    {catShortcuts.map(s => {
                      const displayKey = formatShortcutDisplay(s);
                      return (
                        <div 
                          key={s.id}
                          className={`p-3 rounded-lg border transition flex items-center justify-between gap-3 ${
                            s.enabled 
                              ? 'bg-slate-50 border-slate-200 hover:border-orange-300 hover:bg-orange-50/40 shadow-2xs' 
                              : 'bg-slate-100/60 border-slate-200 text-slate-400 opacity-60'
                          }`}
                        >
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center space-x-1.5">
                              <span className="font-bold text-xs text-slate-900 truncate">{s.label}</span>
                              {!s.enabled && (
                                <span className="text-[9px] bg-slate-200 text-slate-500 px-1.5 py-0.2 rounded font-semibold">
                                  Off
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-slate-500 truncate mt-0.5">{s.description}</p>
                          </div>

                          <div className="shrink-0 flex items-center space-x-1">
                            {displayKey.split(' + ').map((part, idx, arr) => (
                              <React.Fragment key={idx}>
                                <kbd className="px-2 py-1 bg-white border border-slate-300 rounded shadow-xs text-xs font-mono font-bold text-slate-800">
                                  {part}
                                </kbd>
                                {idx < arr.length - 1 && (
                                  <span className="text-xs font-bold text-slate-400">+</span>
                                )}
                              </React.Fragment>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-50 border-t border-slate-200 p-3 px-5 flex items-center justify-between text-xs text-slate-500 shrink-0">
          <div className="flex items-center space-x-1 text-[11px]">
            <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
            <span>Tip: Press <kbd className="font-mono bg-white border border-slate-300 px-1 py-0.2 rounded text-[10px] font-bold">Shift + ?</kbd> anywhere to open this sheet.</span>
          </div>

          <button
            onClick={onClose}
            className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-semibold text-xs transition"
          >
            Close (Esc)
          </button>
        </div>
      </div>
    </div>
  );
};
