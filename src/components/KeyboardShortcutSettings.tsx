import React, { useState, useEffect } from 'react';
import { 
  Keyboard, 
  Settings, 
  RotateCcw, 
  Save, 
  Check, 
  AlertTriangle, 
  CheckCircle2, 
  Edit3, 
  X, 
  Layers, 
  Scan, 
  ShoppingCart, 
  Play, 
  HelpCircle,
  Search,
  Filter,
  Eye,
  Sliders,
  Command,
  Info
} from 'lucide-react';
import { KeyboardShortcutConfig, ShortcutSettingsMap } from '../types';
import { 
  DEFAULT_KEYBOARD_SHORTCUTS, 
  getSavedShortcutSettings, 
  isMasterShortcutsEnabled, 
  saveShortcutSettings, 
  formatShortcutDisplay, 
  detectShortcutConflicts, 
  parseKeyboardEventToKeyConfig 
} from '../utils/shortcutDefaults';

interface KeyboardShortcutSettingsProps {
  onShortcutTestTriggered?: (actionId: string) => void;
  onOpenCheatSheet?: () => void;
}

export const KeyboardShortcutSettings: React.FC<KeyboardShortcutSettingsProps> = ({
  onShortcutTestTriggered,
  onOpenCheatSheet
}) => {
  const [shortcuts, setShortcuts] = useState<ShortcutSettingsMap>(getSavedShortcutSettings);
  const [masterEnabled, setMasterEnabled] = useState<boolean>(isMasterShortcutsEnabled);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);
  const [searchFilter, setSearchFilter] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');

  // Customization Modal State
  const [editingShortcut, setEditingShortcut] = useState<KeyboardShortcutConfig | null>(null);
  const [recordingMode, setRecordingMode] = useState<boolean>(false);
  const [tempKeyConfig, setTempKeyConfig] = useState<{
    key: string;
    ctrlKey: boolean;
    altKey: boolean;
    shiftKey: boolean;
  }>({ key: '', ctrlKey: false, altKey: false, shiftKey: false });

  // Conflicted list
  const conflicts = detectShortcutConflicts(shortcuts);

  // Sync with storage on mount and when external events occur
  useEffect(() => {
    const handleUpdate = () => {
      setShortcuts(getSavedShortcutSettings());
      setMasterEnabled(isMasterShortcutsEnabled());
    };
    window.addEventListener('innovista_shortcuts_changed', handleUpdate);
    return () => window.removeEventListener('innovista_shortcuts_changed', handleUpdate);
  }, []);

  const notifySuccess = (msg: string) => {
    setSaveSuccess(msg);
    setTimeout(() => setSaveSuccess(null), 3500);
  };

  // Toggle master switch
  const handleToggleMaster = (enabled: boolean) => {
    setMasterEnabled(enabled);
    saveShortcutSettings(shortcuts, enabled);
    notifySuccess(enabled ? 'Global Keyboard Shortcuts Activated!' : 'Global Keyboard Shortcuts Disabled.');
  };

  // Toggle single shortcut
  const handleToggleSingleShortcut = (id: string, enabled: boolean) => {
    const updated = {
      ...shortcuts,
      [id]: {
        ...shortcuts[id],
        enabled
      }
    };
    setShortcuts(updated);
    saveShortcutSettings(updated, masterEnabled);
    notifySuccess(`${shortcuts[id].label} ${enabled ? 'Enabled' : 'Disabled'}`);
  };

  // Open key binding editor
  const handleStartEdit = (shortcut: KeyboardShortcutConfig) => {
    setEditingShortcut(shortcut);
    setTempKeyConfig({
      key: shortcut.key,
      ctrlKey: !!shortcut.ctrlKey,
      altKey: !!shortcut.altKey,
      shiftKey: !!shortcut.shiftKey
    });
    setRecordingMode(false);
  };

  // Keystroke capture listener when recording mode is active
  useEffect(() => {
    if (!editingShortcut || !recordingMode) return;

    const handleKeyDownCapture = (e: KeyboardEvent) => {
      e.preventDefault();
      e.stopPropagation();

      const parsed = parseKeyboardEventToKeyConfig(e);
      if (parsed) {
        setTempKeyConfig(parsed);
        setRecordingMode(false); // Finished capture!
      }
    };

    window.addEventListener('keydown', handleKeyDownCapture, { capture: true });
    return () => window.removeEventListener('keydown', handleKeyDownCapture, { capture: true });
  }, [editingShortcut, recordingMode]);

  // Save customized shortcut
  const handleSaveCustomKey = () => {
    if (!editingShortcut) return;
    if (!tempKeyConfig.key) {
      alert('Please specify a key or press Record Keystroke.');
      return;
    }

    const updated = {
      ...shortcuts,
      [editingShortcut.id]: {
        ...editingShortcut,
        key: tempKeyConfig.key,
        ctrlKey: tempKeyConfig.ctrlKey,
        altKey: tempKeyConfig.altKey,
        shiftKey: tempKeyConfig.shiftKey
      }
    };

    setShortcuts(updated);
    saveShortcutSettings(updated, masterEnabled);
    notifySuccess(`Updated shortcut for "${editingShortcut.label}" to ${formatShortcutDisplay(tempKeyConfig)}!`);
    setEditingShortcut(null);
  };

  // Reset to factory defaults
  const handleResetToDefaults = () => {
    setShortcuts({ ...DEFAULT_KEYBOARD_SHORTCUTS });
    setMasterEnabled(true);
    saveShortcutSettings({ ...DEFAULT_KEYBOARD_SHORTCUTS }, true);
    notifySuccess('All keyboard shortcuts reset to factory defaults (Ctrl+N, Ctrl+S, Alt+B, etc.)');
  };

  // Test action trigger
  const handleTestShortcut = (shortcut: KeyboardShortcutConfig) => {
    if (!masterEnabled) {
      alert('Shortcuts are currently disabled. Please enable Master Global Shortcuts switch first.');
      return;
    }
    if (!shortcut.enabled) {
      alert(`The shortcut "${shortcut.label}" is currently disabled. Please turn it on first.`);
      return;
    }

    // Broadcast test action
    if (shortcut.id === 'newQuotation') {
      window.dispatchEvent(new CustomEvent('innovista_new_quotation'));
    } else if (shortcut.id === 'focusSearch') {
      window.dispatchEvent(new CustomEvent('innovista_focus_scanner_search'));
    } else if (shortcut.id === 'toggleBillingPanel') {
      window.dispatchEvent(new CustomEvent('innovista_toggle_billing_panel'));
    } else if (shortcut.id === 'openScanner') {
      window.dispatchEvent(new CustomEvent('innovista_open_scanner'));
    } else if (shortcut.id === 'openCheatSheet') {
      if (onOpenCheatSheet) onOpenCheatSheet();
    } else if (onShortcutTestTriggered) {
      onShortcutTestTriggered(shortcut.id);
    }

    notifySuccess(`⚡ Tested shortcut "${shortcut.label}" (${formatShortcutDisplay(shortcut)}) successfully!`);
  };

  // Filtered shortcuts list
  const allShortcutsList: KeyboardShortcutConfig[] = Object.values(shortcuts);
  const filteredShortcuts: KeyboardShortcutConfig[] = allShortcutsList.filter(s => {
    const matchesCat = categoryFilter === 'ALL' || s.category === categoryFilter;
    const matchesSearch = 
      s.label.toLowerCase().includes(searchFilter.toLowerCase()) ||
      s.description.toLowerCase().includes(searchFilter.toLowerCase()) ||
      formatShortcutDisplay(s).toLowerCase().includes(searchFilter.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const totalCount = Object.keys(shortcuts).length;
  const activeCount = allShortcutsList.filter(s => s.enabled).length;

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {saveSuccess && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-800 px-4 py-3 rounded-lg flex items-center justify-between text-xs font-semibold shadow-xs animate-fadeIn">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{saveSuccess}</span>
          </div>
          <button onClick={() => setSaveSuccess(null)} className="text-emerald-600 hover:text-emerald-900">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Main Settings Header & Master Control Card */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div className="flex items-start space-x-3">
            <div className="p-2.5 bg-orange-500 text-white rounded-lg shadow-xs mt-0.5">
              <Keyboard className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
                <span>Global Keyboard Shortcuts & Speed-Dial Preferences</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5 max-w-2xl">
                Configure hotkeys for quick POS operations, instant catalog barcode scanner search (<strong>Ctrl + S</strong>), 
                initiating new quotations (<strong>Ctrl + N</strong>), and rapid tab navigation.
              </p>
            </div>
          </div>

          {/* Master Switch & Reset Actions */}
          <div className="flex items-center space-x-2.5">
            <button
              onClick={handleResetToDefaults}
              className="flex items-center space-x-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-lg text-xs font-semibold border border-slate-200 transition"
              title="Reset all shortcuts to factory defaults"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Factory Defaults</span>
            </button>

            {onOpenCheatSheet && (
              <button
                onClick={onOpenCheatSheet}
                className="flex items-center space-x-1.5 bg-slate-900 hover:bg-slate-800 text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition shadow-xs"
                title="View All Shortcuts in Cheat Sheet"
              >
                <Command className="w-3.5 h-3.5 text-orange-400" />
                <span>Cheat Sheet</span>
              </button>
            )}
          </div>
        </div>

        {/* Status Dashboard Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 pt-1">
          {/* Master Toggle Card */}
          <div className={`p-3.5 rounded-xl border flex items-center justify-between transition ${
            masterEnabled 
              ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900' 
              : 'bg-rose-50/70 border-rose-200 text-rose-900'
          }`}>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider block opacity-75">
                Master Global Hotkeys
              </span>
              <div className="flex items-center space-x-1.5 mt-0.5">
                <span className={`w-2 h-2 rounded-full ${masterEnabled ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
                <span className="text-xs font-bold">{masterEnabled ? 'Listening & Active' : 'Disabled'}</span>
              </div>
            </div>

            <button
              onClick={() => handleToggleMaster(!masterEnabled)}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                masterEnabled ? 'bg-emerald-600' : 'bg-slate-300'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  masterEnabled ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Active / Total Metric */}
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                Active Shortcuts
              </span>
              <span className="text-sm font-bold text-slate-900 mt-0.5 block font-mono">
                {activeCount} of {totalCount} Enabled
              </span>
            </div>
            <div className="p-2 bg-white border border-slate-200 rounded-lg text-slate-700">
              <Sliders className="w-4 h-4 text-orange-500" />
            </div>
          </div>

          {/* Conflict Detector Indicator */}
          <div className={`p-3.5 rounded-xl border flex items-center justify-between ${
            conflicts.length > 0 
              ? 'bg-amber-50 border-amber-300 text-amber-900' 
              : 'bg-slate-50 border-slate-200 text-slate-800'
          }`}>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider block opacity-75">
                Collision Check
              </span>
              <span className="text-xs font-bold mt-0.5 block">
                {conflicts.length === 0 ? '✓ 0 Conflicts (Clean)' : `⚠️ ${conflicts.length} Key Conflicts`}
              </span>
            </div>
            <div className="p-2 bg-white border border-slate-200 rounded-lg">
              {conflicts.length === 0 ? (
                <Check className="w-4 h-4 text-emerald-600" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-amber-600" />
              )}
            </div>
          </div>

          {/* Core Spotlight: Ctrl+N & Ctrl+S */}
          <div className="p-3.5 bg-orange-50/70 border border-orange-200 rounded-xl flex items-center justify-between text-orange-950">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-orange-800 block">
                Core Speed Hotkeys
              </span>
              <span className="text-xs font-bold text-orange-950 mt-0.5 block font-mono">
                Ctrl+N (New) &bull; Ctrl+S (Scan)
              </span>
            </div>
            <Keyboard className="w-4 h-4 text-orange-500" />
          </div>
        </div>

        {/* Conflicts Warning Notice if any */}
        {conflicts.length > 0 && (
          <div className="bg-amber-50 border border-amber-300 rounded-xl p-3.5 text-xs text-amber-900 space-y-1.5 animate-fadeIn">
            <div className="flex items-center space-x-2 font-bold">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <span>Conflicting Key Combos Detected:</span>
            </div>
            <ul className="list-disc list-inside space-y-0.5 text-[11px] text-amber-800">
              {conflicts.map((c, i) => (
                <li key={i}>
                  Key combination <strong className="font-mono">{c.keyCombo}</strong> is assigned to multiple actions: {c.actions.map(a => a.label).join(', ')}.
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {['ALL', 'Actions', 'Panel & Tools', 'Navigation'].map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition whitespace-nowrap ${
                categoryFilter === cat
                  ? 'bg-orange-500 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {cat === 'ALL' ? 'All Shortcuts' : cat}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by action name, key, or category..."
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-orange-500 focus:bg-white"
          />
        </div>
      </div>

      {/* Shortcuts List / Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="divide-y divide-slate-100">
          {filteredShortcuts.map((shortcut) => {
            const formattedKey = formatShortcutDisplay(shortcut);
            const isConflicted = conflicts.some(c => c.actions.some(a => a.id === shortcut.id));

            return (
              <div 
                key={shortcut.id}
                className={`p-4 flex flex-wrap items-center justify-between gap-4 transition hover:bg-slate-50/80 ${
                  !shortcut.enabled ? 'opacity-60 bg-slate-50/40' : ''
                }`}
              >
                {/* Action Details */}
                <div className="flex items-start space-x-3.5 min-w-[280px] flex-1">
                  <div className="pt-0.5">
                    <input
                      type="checkbox"
                      checked={shortcut.enabled}
                      onChange={(e) => handleToggleSingleShortcut(shortcut.id, e.target.checked)}
                      className="w-4 h-4 text-orange-600 rounded border-slate-300 focus:ring-orange-500 cursor-pointer"
                      title={shortcut.enabled ? 'Disable this shortcut' : 'Enable this shortcut'}
                    />
                  </div>

                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-xs text-slate-900">{shortcut.label}</span>
                      <span className="px-2 py-0.2 bg-slate-100 text-slate-600 rounded text-[10px] font-semibold">
                        {shortcut.category}
                      </span>
                      {isConflicted && (
                        <span className="px-1.5 py-0.2 bg-amber-100 text-amber-800 border border-amber-200 rounded text-[9px] font-bold flex items-center space-x-1">
                          <AlertTriangle className="w-2.5 h-2.5 text-amber-600" />
                          <span>Conflict</span>
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">{shortcut.description}</p>
                  </div>
                </div>

                {/* Key Combination Display & Actions */}
                <div className="flex items-center space-x-3 shrink-0">
                  {/* Visual Key Pill */}
                  <div className="flex items-center space-x-1">
                    {formattedKey.split(' + ').map((k, idx, arr) => (
                      <React.Fragment key={idx}>
                        <kbd className="px-2.5 py-1 bg-slate-100 border border-slate-300 rounded-md shadow-xs text-xs font-mono font-bold text-slate-800">
                          {k}
                        </kbd>
                        {idx < arr.length - 1 && (
                          <span className="text-xs font-bold text-slate-400">+</span>
                        )}
                      </React.Fragment>
                    ))}
                  </div>

                  {/* Customize Key Button */}
                  <button
                    onClick={() => handleStartEdit(shortcut)}
                    className="flex items-center space-x-1 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition"
                    title="Customize key binding"
                  >
                    <Edit3 className="w-3 h-3 text-slate-500" />
                    <span>Customize</span>
                  </button>

                  {/* Test Button */}
                  <button
                    onClick={() => handleTestShortcut(shortcut)}
                    className="flex items-center space-x-1 bg-orange-50 hover:bg-orange-100 text-orange-700 border border-orange-200 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition"
                    title="Test this shortcut now"
                  >
                    <Play className="w-3 h-3 text-orange-600" />
                    <span>Test</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Helpful POS Guide Footer */}
      <div className="bg-slate-100/70 border border-slate-200 rounded-xl p-4 flex items-start space-x-3 text-xs text-slate-600">
        <Info className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-bold text-slate-800">Keyboard Shortcuts Usage Tips for Cashiers & Estimators:</p>
          <ul className="list-disc list-inside space-y-0.5 text-[11px] text-slate-600">
            <li>Press <strong>Ctrl + N</strong> anytime to wipe the cart and initialize a new quotation draft.</li>
            <li>Press <strong>Ctrl + S</strong> to focus the catalog search input and immediately type a product code or scan physical items.</li>
            <li>Press <strong>Alt + B</strong> to toggle the order summary panel open or closed.</li>
            <li>Press <strong>Alt + X</strong> to activate the live webcam barcode & QR code camera scanner.</li>
            <li>Press <strong>Shift + ?</strong> to open the quick cheat sheet overlay.</li>
          </ul>
        </div>
      </div>

      {/* Interactive Key Customization Modal */}
      {editingShortcut && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white border border-slate-200 rounded-xl shadow-2xl w-full max-w-md overflow-hidden space-y-4 p-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <div className="p-1.5 bg-orange-500 text-white rounded-md">
                  <Keyboard className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-900">Customize Shortcut Key</h3>
                  <p className="text-[11px] text-slate-500">{editingShortcut.label}</p>
                </div>
              </div>
              <button 
                onClick={() => {
                  setEditingShortcut(null);
                  setRecordingMode(false);
                }}
                className="text-slate-400 hover:text-slate-700 p-1 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Current & New Key Combo Preview */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-center space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                Selected Key Combination
              </span>
              <div className="flex items-center justify-center space-x-1.5 py-1">
                {formatShortcutDisplay(tempKeyConfig).split(' + ').map((k, idx, arr) => (
                  <React.Fragment key={idx}>
                    <kbd className="px-3 py-1.5 bg-white border border-slate-300 rounded-lg shadow-xs text-sm font-mono font-bold text-slate-900">
                      {k}
                    </kbd>
                    {idx < arr.length - 1 && (
                      <span className="text-sm font-bold text-slate-400">+</span>
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>

            {/* Option A: Keystroke Recorder Mode */}
            <div className="border border-orange-200 bg-orange-50/50 rounded-xl p-3.5 text-center space-y-2">
              <div className="flex items-center justify-center space-x-1.5 text-orange-900 font-bold text-xs">
                <Keyboard className="w-3.5 h-3.5 text-orange-600" />
                <span>Interactive Keystroke Capture</span>
              </div>
              <p className="text-[11px] text-orange-800">
                Click below, then press your desired key combination on your keyboard (e.g. <code>Ctrl + Shift + S</code>).
              </p>
              <button
                type="button"
                onClick={() => setRecordingMode(!recordingMode)}
                className={`w-full py-2 px-3 rounded-lg text-xs font-bold transition shadow-xs flex items-center justify-center space-x-2 ${
                  recordingMode 
                    ? 'bg-rose-600 hover:bg-rose-700 text-white animate-pulse' 
                    : 'bg-orange-500 hover:bg-orange-600 text-white'
                }`}
              >
                <Keyboard className="w-4 h-4" />
                <span>{recordingMode ? 'Recording... Press Any Key Combo' : 'Click to Record Keystroke'}</span>
              </button>
            </div>

            {/* Option B: Manual Modifiers Selector */}
            <div className="space-y-2.5 pt-1">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                Or Configure Modifiers Manually
              </span>

              <div className="grid grid-cols-3 gap-2">
                <label className="flex items-center space-x-2 p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold cursor-pointer">
                  <input
                    type="checkbox"
                    checked={tempKeyConfig.ctrlKey}
                    onChange={(e) => setTempKeyConfig({ ...tempKeyConfig, ctrlKey: e.target.checked })}
                    className="w-3.5 h-3.5 text-orange-600 rounded border-slate-300 focus:ring-orange-500"
                  />
                  <span>Ctrl / Cmd</span>
                </label>

                <label className="flex items-center space-x-2 p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold cursor-pointer">
                  <input
                    type="checkbox"
                    checked={tempKeyConfig.altKey}
                    onChange={(e) => setTempKeyConfig({ ...tempKeyConfig, altKey: e.target.checked })}
                    className="w-3.5 h-3.5 text-orange-600 rounded border-slate-300 focus:ring-orange-500"
                  />
                  <span>Alt</span>
                </label>

                <label className="flex items-center space-x-2 p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold cursor-pointer">
                  <input
                    type="checkbox"
                    checked={tempKeyConfig.shiftKey}
                    onChange={(e) => setTempKeyConfig({ ...tempKeyConfig, shiftKey: e.target.checked })}
                    className="w-3.5 h-3.5 text-orange-600 rounded border-slate-300 focus:ring-orange-500"
                  />
                  <span>Shift</span>
                </label>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Trigger Key (Character or Number)</label>
                <input
                  type="text"
                  maxLength={10}
                  value={tempKeyConfig.key}
                  onChange={(e) => setTempKeyConfig({ ...tempKeyConfig, key: e.target.value.toLowerCase() })}
                  placeholder="e.g. n, s, b, 1, 2, ?"
                  className="w-full pos-input font-mono text-center text-xs font-bold"
                />
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  setEditingShortcut(null);
                  setRecordingMode(false);
                }}
                className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveCustomKey}
                className="px-4 py-1.5 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-xs font-semibold transition shadow-xs flex items-center space-x-1.5"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Keybinding</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
