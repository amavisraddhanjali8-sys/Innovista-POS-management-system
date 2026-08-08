import React from 'react';
import { KeyboardShortcutConfig, ShortcutSettingsMap } from '../types';

export type { KeyboardShortcutConfig, ShortcutSettingsMap };

export const DEFAULT_KEYBOARD_SHORTCUTS: ShortcutSettingsMap = {
  newQuotation: {
    id: 'newQuotation',
    label: 'Open New Quotation',
    description: 'Clears active order draft and starts a fresh quotation in billing portal',
    key: 'n',
    ctrlKey: true,
    altKey: false,
    shiftKey: false,
    enabled: true,
    category: 'Actions'
  },
  focusSearch: {
    id: 'focusSearch',
    label: 'Focus Product Scanner Search',
    description: 'Focuses product catalog & barcode scanner search input in billing panel',
    key: 's',
    ctrlKey: true,
    altKey: false,
    shiftKey: false,
    enabled: true,
    category: 'Actions'
  },
  toggleBillingPanel: {
    id: 'toggleBillingPanel',
    label: 'Toggle Order & Billing Panel',
    description: 'Opens or closes the right-hand side order summary and checkout panel',
    key: 'b',
    ctrlKey: false,
    altKey: true,
    shiftKey: false,
    enabled: true,
    category: 'Panel & Tools'
  },
  openScanner: {
    id: 'openScanner',
    label: 'Open Barcode Camera Scanner',
    description: 'Launches live camera scanner modal for physical barcode and QR reading',
    key: 'x',
    ctrlKey: false,
    altKey: true,
    shiftKey: false,
    enabled: true,
    category: 'Panel & Tools'
  },
  openCheatSheet: {
    id: 'openCheatSheet',
    label: 'Keyboard Shortcuts Cheat Sheet',
    description: 'Displays interactive modal listing all active keyboard shortcuts',
    key: '?',
    ctrlKey: false,
    altKey: false,
    shiftKey: true,
    enabled: true,
    category: 'Panel & Tools'
  },
  navMasterPrices: {
    id: 'navMasterPrices',
    label: 'Go to Master Prices / POS',
    description: 'Switches navigation view to Master Price Catalog & POS pricing engine',
    key: '1',
    ctrlKey: false,
    altKey: true,
    shiftKey: false,
    enabled: true,
    category: 'Navigation'
  },
  navOrders: {
    id: 'navOrders',
    label: 'Go to Central Order Hub',
    description: 'Switches navigation view to Central Order Management & Saved Quotes',
    key: '2',
    ctrlKey: false,
    altKey: true,
    shiftKey: false,
    enabled: true,
    category: 'Navigation'
  },
  navCustomers: {
    id: 'navCustomers',
    label: 'Go to Customer Portal',
    description: 'Switches navigation view to Customer Management & Discount Tiers',
    key: '3',
    ctrlKey: false,
    altKey: true,
    shiftKey: false,
    enabled: true,
    category: 'Navigation'
  },
  navTransport: {
    id: 'navTransport',
    label: 'Go to Transport Cost Engine',
    description: 'Switches navigation view to Logistics, Fleet Rates & Distance Calculator',
    key: '5',
    ctrlKey: false,
    altKey: true,
    shiftKey: false,
    enabled: true,
    category: 'Navigation'
  },
  navSettings: {
    id: 'navSettings',
    label: 'Go to Settings & Config',
    description: 'Switches navigation view to System Settings, Branding & Shortcuts',
    key: '4',
    ctrlKey: false,
    altKey: true,
    shiftKey: false,
    enabled: true,
    category: 'Navigation'
  }
};

export const SHORTCUTS_STORAGE_KEY = 'innovista_keyboard_shortcuts';
export const SHORTCUTS_MASTER_SWITCH_KEY = 'innovista_keyboard_shortcuts_enabled';

export function getSavedShortcutSettings(): ShortcutSettingsMap {
  try {
    const saved = localStorage.getItem(SHORTCUTS_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      // Merge with defaults to guarantee all required fields and actions exist
      return { ...DEFAULT_KEYBOARD_SHORTCUTS, ...parsed };
    }
  } catch (e) {
    console.error('Failed to load shortcut settings:', e);
  }
  return { ...DEFAULT_KEYBOARD_SHORTCUTS };
}

export function isMasterShortcutsEnabled(): boolean {
  try {
    const saved = localStorage.getItem(SHORTCUTS_MASTER_SWITCH_KEY);
    if (saved !== null) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.error('Failed to check master shortcut switch:', e);
  }
  return true;
}

export function saveShortcutSettings(shortcuts: ShortcutSettingsMap, masterEnabled: boolean = true): void {
  try {
    localStorage.setItem(SHORTCUTS_STORAGE_KEY, JSON.stringify(shortcuts));
    localStorage.setItem(SHORTCUTS_MASTER_SWITCH_KEY, JSON.stringify(masterEnabled));
    window.dispatchEvent(new CustomEvent('innovista_shortcuts_changed', { 
      detail: { shortcuts, masterEnabled } 
    }));
  } catch (e) {
    console.error('Failed to save shortcut settings:', e);
  }
}

export function formatShortcutDisplay(config: Partial<KeyboardShortcutConfig>): string {
  if (!config || !config.key) return 'Unset';
  const parts: string[] = [];
  if (config.ctrlKey) parts.push('Ctrl');
  if (config.altKey) parts.push('Alt');
  if (config.shiftKey && config.key !== '?') parts.push('Shift');
  
  let keyLabel = config.key.toUpperCase();
  if (config.key === ' ') keyLabel = 'Space';
  if (config.key === 'Escape') keyLabel = 'Esc';
  if (config.key === 'Enter') keyLabel = 'Enter';
  if (config.key === 'ArrowUp') keyLabel = '↑';
  if (config.key === 'ArrowDown') keyLabel = '↓';
  if (config.key === 'ArrowLeft') keyLabel = '←';
  if (config.key === 'ArrowRight') keyLabel = '→';
  if (config.key === '?') keyLabel = '?';

  parts.push(keyLabel);
  return parts.join(' + ');
}

export function getShortcutKeySignature(config: Partial<KeyboardShortcutConfig>): string {
  if (!config || !config.key) return '';
  const ctrl = config.ctrlKey ? 'ctrl' : '';
  const alt = config.altKey ? 'alt' : '';
  const shift = config.shiftKey ? 'shift' : '';
  const key = config.key.toLowerCase();
  return `${ctrl}:${alt}:${shift}:${key}`;
}

export function detectShortcutConflicts(shortcuts: ShortcutSettingsMap): Array<{ keyCombo: string; actions: KeyboardShortcutConfig[] }> {
  const map: Record<string, KeyboardShortcutConfig[]> = {};

  Object.values(shortcuts).forEach(s => {
    if (!s.enabled || !s.key) return;
    const sig = getShortcutKeySignature(s);
    if (!map[sig]) {
      map[sig] = [];
    }
    map[sig].push(s);
  });

  const conflicts: Array<{ keyCombo: string; actions: KeyboardShortcutConfig[] }> = [];
  Object.entries(map).forEach(([sig, list]) => {
    if (list.length > 1) {
      conflicts.push({
        keyCombo: formatShortcutDisplay(list[0]),
        actions: list
      });
    }
  });

  return conflicts;
}

export function parseKeyboardEventToKeyConfig(e: KeyboardEvent | React.KeyboardEvent): {
  key: string;
  ctrlKey: boolean;
  altKey: boolean;
  shiftKey: boolean;
} | null {
  // Ignore bare modifier key presses
  if (['Control', 'Alt', 'Shift', 'Meta', 'CapsLock', 'Tab'].includes(e.key)) {
    return null;
  }

  const ctrlOrCmd = e.ctrlKey || e.metaKey;
  let key = e.key;
  if (key === ' ') key = 'Space';

  return {
    key: key.toLowerCase() === 'space' ? ' ' : key.toLowerCase(),
    ctrlKey: !!ctrlOrCmd,
    altKey: !!e.altKey,
    shiftKey: !!e.shiftKey && key !== '?' // for '?' shift is implicit
  };
}

export function matchesKeyboardEvent(e: KeyboardEvent, config: KeyboardShortcutConfig): boolean {
  if (!config.enabled || !config.key) return false;
  
  // Normalize key match
  const pressedKey = e.key.toLowerCase();
  const configKey = config.key.toLowerCase();

  const ctrlOrCmd = e.ctrlKey || e.metaKey;
  
  const matchesCtrl = !!config.ctrlKey === ctrlOrCmd;
  const matchesAlt = !!config.altKey === e.altKey;
  
  // Special case for '?' which requires Shift on most keyboards
  let matchesShift = !!config.shiftKey === e.shiftKey;
  if (configKey === '?' && e.key === '?') {
    matchesShift = true;
  }

  const matchesKey = pressedKey === configKey || (configKey === 'space' && e.key === ' ');

  return matchesCtrl && matchesAlt && matchesShift && matchesKey;
}

