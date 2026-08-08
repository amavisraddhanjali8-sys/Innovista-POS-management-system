import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Building2, 
  Bell, 
  Layers, 
  Truck, 
  Globe, 
  ChevronDown,
  Activity,
  X,
  Search,
  Plus,
  History,
  CheckCircle2,
  Calculator,
  Settings,
  FileText,
  Users,
  Scan,
  LogOut,
  Keyboard,
  LayoutDashboard,
  Key,
  ShieldCheck,
  Tag,
  Sliders,
  Database,
  Sparkles,
  Filter,
  ArrowRight,
  CornerDownLeft,
  Zap,
  Landmark,
  ShieldAlert,
  Wrench,
  Palette,
  Scissors,
  Compass,
  DollarSign,
  MapPin,
  Lock,
  BadgeCheck
} from 'lucide-react';
import { 
  Branch, 
  RealTimeEvent, 
  SystemUser, 
  Product, 
  Quotation, 
  Customer, 
  Vehicle, 
  PriceHistory 
} from '../types';
import { CompanyLogo } from './CompanyLogo';
import { POS_SURCHARGE_CATEGORIES } from '../utils/surchargeCategoryEngine';

export interface SearchResultItem {
  id: string;
  type: 'PRODUCT' | 'PRICE_RULE' | 'BRANCH' | 'CLIENT' | 'ORDER' | 'VEHICLE' | 'SETTING' | 'PORTAL' | 'TOOL' | 'AUDIT_LOG';
  title: string;
  subtitle: string;
  badge: string;
  badgeColor: string; // e.g. bg-blue-100 text-blue-800
  code?: string;
  price?: string;
  status?: string;
  iconName: string;
  tabId: string;
  subTabId?: string;
  actionType?: 'NAVIGATE' | 'SWITCH_BRANCH' | 'OPEN_SCANNER' | 'OPEN_CHEAT_SHEET' | 'OPEN_2FA' | 'OPEN_PASSPHRASE' | 'OPEN_EVENT_DRAWER';
  payload?: any;
}

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  activeBranch: Branch;
  setActiveBranch: (branch: Branch) => void;
  branches: Branch[];
  events: RealTimeEvent[];
  unreadCount: number;
  clearUnread: () => void;
  syncMode: 'REALTIME' | 'POLLING_5MIN';
  setSyncMode: (mode: 'REALTIME' | 'POLLING_5MIN') => void;
  onOpenAddModal?: () => void;
  onOpenScannerModal?: () => void;
  onOpenCheatSheet?: () => void;
  currentUser?: SystemUser | null;
  onLogout?: () => void;
  onOpenChangePassword?: () => void;
  onOpenMfaSecurity?: () => void;
  products?: Product[];
  quotations?: Quotation[];
  customers?: Customer[];
  vehicles?: Vehicle[];
  history?: PriceHistory[];
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  activeBranch,
  setActiveBranch,
  branches,
  events,
  unreadCount,
  clearUnread,
  syncMode,
  setSyncMode,
  onOpenAddModal,
  onOpenScannerModal,
  onOpenCheatSheet,
  currentUser,
  onLogout,
  onOpenChangePassword,
  onOpenMfaSecurity,
  products = [],
  quotations = [],
  customers = [],
  vehicles = [],
  history = []
}) => {
  const [showEventsDrawer, setShowEventsDrawer] = useState(false);
  const [showBranchDropdown, setShowBranchDropdown] = useState(false);

  // --- GLOBAL SEARCH COMMAND CENTER STATE ---
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [selectedItemIndex, setSelectedItemIndex] = useState(0);
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<'ALL' | 'PRODUCTS' | 'PRICE_RULES' | 'BRANCHES' | 'CLIENTS' | 'ORDERS' | 'SETTINGS'>('ALL');
  const [searchToast, setSearchToast] = useState<{ message: string; target: string } | null>(null);

  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchDropdownRef = useRef<HTMLDivElement>(null);

  const isHO = activeBranch.code === 'HO';

  const navTabs = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      badge: 'METRICS'
    },
    {
      id: 'master-prices',
      label: 'Master Prices',
      icon: Layers,
      badge: 'HO'
    },
    {
      id: 'order-management',
      label: 'Order Management',
      icon: FileText,
      badge: 'ORDERS'
    },
    {
      id: 'customer-portal',
      label: 'Customer Portal',
      icon: Users,
      badge: 'CLIENTS'
    },
    {
      id: 'transport-engine',
      label: 'Transport Engine',
      icon: Truck,
      badge: null
    },
    {
      id: 'branch-network',
      label: 'Branch Network',
      icon: Globe,
      badge: '5'
    },
    {
      id: 'price-history',
      label: 'Audit Log',
      icon: History,
      badge: null
    },
    {
      id: 'settings-config',
      label: 'Settings & Config',
      icon: Settings,
      badge: 'ADMIN'
    }
  ];

  // Helper Toast for Jump Notifications
  const triggerSearchToast = (message: string, target: string) => {
    setSearchToast({ message, target });
    setTimeout(() => {
      setSearchToast((prev) => (prev?.message === message ? null : prev));
    }, 3000);
  };

  // --- BUILD MULTI-ENTITY MASTER SEARCH INDEX ENGINE ---
  const masterSearchIndex = useMemo<SearchResultItem[]>(() => {
    const items: SearchResultItem[] = [];

    // 1. Core System Portals
    items.push(
      {
        id: 'portal-dashboard',
        type: 'PORTAL',
        title: 'Dashboard & KPI Analytics',
        subtitle: 'Main executive metrics, daily revenue, branch stats, and sales charts',
        badge: 'PORTAL',
        badgeColor: 'bg-[#0F203C] text-white',
        iconName: 'LayoutDashboard',
        tabId: 'dashboard',
        actionType: 'NAVIGATE'
      },
      {
        id: 'portal-master-prices',
        type: 'PORTAL',
        title: 'Master Price Catalog & POS Engine',
        subtitle: 'Product catalog, variant pricing, 3-tier matrix & retail POS calculator',
        badge: 'PORTAL',
        badgeColor: 'bg-[#0F203C] text-white',
        iconName: 'Layers',
        tabId: 'master-prices',
        actionType: 'NAVIGATE'
      },
      {
        id: 'portal-orders',
        type: 'PORTAL',
        title: 'Central Order & Quotations Hub',
        subtitle: 'Order tracking, proforma invoices, sales quotes, and customer orders',
        badge: 'PORTAL',
        badgeColor: 'bg-[#0F203C] text-white',
        iconName: 'FileText',
        tabId: 'order-management',
        actionType: 'NAVIGATE'
      },
      {
        id: 'portal-customers',
        type: 'PORTAL',
        title: 'Customer Management & Price Terms',
        subtitle: 'Client directory, special price overrides, credit terms, and contract rates',
        badge: 'PORTAL',
        badgeColor: 'bg-[#0F203C] text-white',
        iconName: 'Users',
        tabId: 'customer-portal',
        actionType: 'NAVIGATE'
      },
      {
        id: 'portal-transport',
        type: 'PORTAL',
        title: 'Transport Cost Engine & Logistics',
        subtitle: 'Freight rate calculator, vehicle fleet management, distance matrix & road rules',
        badge: 'PORTAL',
        badgeColor: 'bg-[#0F203C] text-white',
        iconName: 'Truck',
        tabId: 'transport-engine',
        actionType: 'NAVIGATE'
      },
      {
        id: 'portal-branches',
        type: 'PORTAL',
        title: 'Branch Network & Multi-Node Monitor',
        subtitle: '5-branch network status, HO node overrides, regional margins & sync status',
        badge: 'PORTAL',
        badgeColor: 'bg-[#0F203C] text-white',
        iconName: 'Globe',
        tabId: 'branch-network',
        actionType: 'NAVIGATE'
      },
      {
        id: 'portal-audit',
        type: 'PORTAL',
        title: 'Price Audit Log & Governance Track',
        subtitle: 'Price override audit trail, employee activity logs, and historical rate changes',
        badge: 'PORTAL',
        badgeColor: 'bg-[#0F203C] text-white',
        iconName: 'History',
        tabId: 'price-history',
        actionType: 'NAVIGATE'
      },
      {
        id: 'portal-settings',
        type: 'PORTAL',
        title: 'Settings & Enterprise Configuration',
        subtitle: 'Company branding, categories, users, surcharges, shortcuts & system settings',
        badge: 'PORTAL',
        badgeColor: 'bg-[#0F203C] text-white',
        iconName: 'Settings',
        tabId: 'settings-config',
        actionType: 'NAVIGATE'
      }
    );

    // 2. Settings Sub-Tabs & System Config Sections
    const settingsSubTabs = [
      { id: 'company', title: 'Company Branding & Enterprise Profile', sub: 'Logo, enterprise address, tax registration, and official headers', icon: 'Building2' },
      { id: 'bank_currency', title: 'Bank Details, Currency Engine & Payment Gateways', sub: 'Commercial bank account numbers, SWIFT codes, LKR currency rules', icon: 'Landmark' },
      { id: 'users', title: 'User Management, Staff Roles & Login Credentials', sub: 'Employee profiles, employee IDs, active status, system roles & password resets', icon: 'Users' },
      { id: 'categories', title: 'Product Categories & Sub-category Management', sub: 'Master product categories, sub-categories, activation toggles, and edit options', icon: 'Grid' },
      { id: 'customer_types', title: 'Customer Types, Tiers & Discount Tier Matrix', sub: 'Wholesale dealer, contractor, export, retail customer tier margins & discounts', icon: 'Tag' },
      { id: 'locations', title: 'Regional Logistic Locations & Freight Delivery Zones', sub: 'Colombo, Kandy, Galle, Jaffna, Kurunegala district freight delivery rates', icon: 'MapPin' },
      { id: 'surcharge_presets', title: '11-Category POS Spec Surcharges Engine', sub: '6063-T6 alloy, 8mm tempered, powder coating, high-rise crane & urgent surcharges', icon: 'Sliders' },
      { id: 'role_permissions', title: 'Role Permissions Matrix & Access Security Rules', sub: 'Super admin, branch manager, sales executive feature permission checkboxes', icon: 'ShieldCheck' },
      { id: 'branch_settings', title: 'Branch Configuration & Policy Directive Push', sub: 'Individual branch node policy overrides, regional pricing rules & HO broadcast', icon: 'Globe' },
      { id: 'shortcuts', title: 'Keyboard Shortcuts & Global Hotkeys Editor', sub: 'Customizable keyboard shortcut hotkeys, Ctrl+N, Ctrl+S, Alt+B keybindings', icon: 'Keyboard' },
      { id: 'backup_export', title: 'Data Backup, JSON / Excel Export & Database Recovery', sub: 'Export system master catalog to Excel/JSON, create system backup snapshots', icon: 'Database' }
    ];

    settingsSubTabs.forEach((st) => {
      items.push({
        id: `setting-${st.id}`,
        type: 'SETTING',
        title: st.title,
        subtitle: st.sub,
        badge: 'SETTING',
        badgeColor: 'bg-purple-100 text-purple-800 border border-purple-200',
        iconName: st.icon,
        tabId: 'settings-config',
        subTabId: st.id,
        actionType: 'NAVIGATE'
      });
    });

    // 3. Quick System Tools & Action Modals
    items.push(
      {
        id: 'tool-scanner',
        type: 'TOOL',
        title: 'Barcode Camera & QR Code Scanner',
        subtitle: 'Scan product barcodes or quote QR codes directly via camera or USB scanner',
        badge: 'ACTION',
        badgeColor: 'bg-emerald-100 text-emerald-800 border border-emerald-200',
        iconName: 'Scan',
        tabId: activeTab,
        actionType: 'OPEN_SCANNER'
      },
      {
        id: 'tool-cheatsheet',
        type: 'TOOL',
        title: 'Keyboard Shortcuts Cheat Sheet',
        subtitle: 'Quick reference cheat sheet modal for all system hotkeys (Shift + ?)',
        badge: 'ACTION',
        badgeColor: 'bg-blue-100 text-blue-800 border border-blue-200',
        iconName: 'Keyboard',
        tabId: activeTab,
        actionType: 'OPEN_CHEAT_SHEET'
      },
      {
        id: 'tool-2fa',
        type: 'TOOL',
        title: 'Google Authenticator 2FA Security Center',
        subtitle: 'Setup two-factor authentication, generate QR codes and TOTP security keys',
        badge: 'SECURITY',
        badgeColor: 'bg-orange-100 text-orange-800 border border-orange-200',
        iconName: 'ShieldCheck',
        tabId: activeTab,
        actionType: 'OPEN_2FA'
      },
      {
        id: 'tool-passphrase',
        type: 'TOOL',
        title: 'Change Account Passphrase / Password',
        subtitle: 'Update your login password and manage credential security',
        badge: 'SECURITY',
        badgeColor: 'bg-amber-100 text-amber-800 border border-amber-200',
        iconName: 'Key',
        tabId: activeTab,
        actionType: 'OPEN_PASSPHRASE'
      },
      {
        id: 'tool-broadcast',
        type: 'TOOL',
        title: 'Master Real-time Event Stream Drawer',
        subtitle: 'View live broadcast stream of price updates, order validations and branch notifications',
        badge: 'BROADCAST',
        badgeColor: 'bg-rose-100 text-rose-800 border border-rose-200',
        iconName: 'Activity',
        tabId: activeTab,
        actionType: 'OPEN_EVENT_DRAWER'
      }
    );

    // 4. Price Rules & Surcharge Options (`POS_SURCHARGE_CATEGORIES`)
    POS_SURCHARGE_CATEGORIES.forEach((cat) => {
      // Add Category itself
      items.push({
        id: `surcharge-cat-${cat.id}`,
        type: 'PRICE_RULE',
        title: `${cat.name} Surcharge Category [${cat.code}]`,
        subtitle: `${cat.description} (${cat.options.length} preset options)`,
        badge: 'PRICE RULE',
        badgeColor: 'bg-amber-100 text-amber-900 border border-amber-300',
        code: cat.code,
        iconName: 'Sliders',
        tabId: 'settings-config',
        subTabId: 'surcharge_presets',
        actionType: 'NAVIGATE'
      });

      // Add individual options
      cat.options.forEach((opt) => {
        const valStr = opt.type === 'percentage' ? `+${opt.value}%` : `+LKR ${opt.value.toLocaleString()}`;
        items.push({
          id: `surcharge-opt-${opt.id}`,
          type: 'PRICE_RULE',
          title: opt.name,
          subtitle: `${cat.name} Surcharge: ${opt.description}`,
          badge: 'SURCHARGE',
          badgeColor: 'bg-amber-50 text-amber-800 border border-amber-200',
          code: cat.code,
          price: valStr,
          iconName: 'Tag',
          tabId: 'settings-config',
          subTabId: 'surcharge_presets',
          actionType: 'NAVIGATE'
        });
      });
    });

    // 5. Products & Items (`products`)
    products.forEach((p) => {
      const priceLkr = `Rs. ${p.base_price.toLocaleString()}`;
      items.push({
        id: `product-${p.id}`,
        type: 'PRODUCT',
        title: `${p.product_name} (${p.product_code})`,
        subtitle: `${p.category} | ${p.sub_category || 'General'} • ${p.alloy_specification || ''} ${p.finish || ''}`,
        badge: 'PRODUCT',
        badgeColor: 'bg-blue-100 text-blue-800 border border-blue-200',
        code: p.product_code,
        price: priceLkr,
        status: p.status,
        iconName: 'Layers',
        tabId: 'master-prices',
        actionType: 'NAVIGATE',
        payload: p
      });
    });

    // 6. Branch Network Nodes (`branches`)
    branches.forEach((b) => {
      items.push({
        id: `branch-${b.id}`,
        type: 'BRANCH',
        title: `${b.name} (${b.code})`,
        subtitle: `Manager: ${b.manager_name} • Phone: ${b.phone} • ${b.city || 'Sri Lanka'}`,
        badge: 'BRANCH NODE',
        badgeColor: 'bg-orange-100 text-orange-900 border border-orange-300',
        code: b.code,
        status: b.is_active ? 'Active' : 'Offline',
        iconName: 'Building2',
        tabId: 'branch-network',
        actionType: 'SWITCH_BRANCH',
        payload: b
      });
    });

    // 7. Customers & Corporate Clients (`customers`)
    customers.forEach((c) => {
      items.push({
        id: `customer-${c.id}`,
        type: 'CLIENT',
        title: c.name,
        subtitle: `${c.customer_type} • Code: ${c.code} • Phone: ${c.phone} • Email: ${c.email}`,
        badge: 'CLIENT',
        badgeColor: 'bg-indigo-100 text-indigo-800 border border-indigo-200',
        code: c.code,
        price: c.credit_limit ? `Credit: LKR ${c.credit_limit.toLocaleString()}` : undefined,
        iconName: 'Users',
        tabId: 'customer-portal',
        actionType: 'NAVIGATE',
        payload: c
      });
    });

    // 8. Orders, Quotes & Invoices (`quotations`)
    quotations.forEach((q) => {
      items.push({
        id: `order-${q.id}`,
        type: 'ORDER',
        title: `Order #${q.quotation_number} - ${q.customer_name}`,
        subtitle: `Branch: ${q.branch_code} • Site: ${q.site_address || 'N/A'} • Items: ${q.items.length}`,
        badge: 'ORDER',
        badgeColor: 'bg-emerald-100 text-emerald-800 border border-emerald-200',
        code: q.quotation_number,
        price: `Rs. ${q.total_amount.toLocaleString()}`,
        status: q.status,
        iconName: 'FileText',
        tabId: 'order-management',
        actionType: 'NAVIGATE',
        payload: q
      });
    });

    // 9. Vehicles & Transport Fleet (`vehicles`)
    vehicles.forEach((v) => {
      items.push({
        id: `vehicle-${v.id}`,
        type: 'VEHICLE',
        title: `${v.name} (${v.registration_number})`,
        subtitle: `Driver: ${v.driver_name} • Capacity: ${v.capacity_tons} Tons • Base Rate: Rs. ${v.fuel_consumption_per_km}/km`,
        badge: 'FLEET',
        badgeColor: 'bg-cyan-100 text-cyan-800 border border-cyan-200',
        code: v.registration_number,
        status: v.is_available ? 'Available' : 'On Delivery',
        iconName: 'Truck',
        tabId: 'transport-engine',
        actionType: 'NAVIGATE',
        payload: v
      });
    });

    // 10. Historical Audit Logs (`history`)
    history.slice(0, 15).forEach((h) => {
      items.push({
        id: `audit-${h.id}`,
        type: 'AUDIT_LOG',
        title: `Audit: ${h.action} on ${h.product_name}`,
        subtitle: `By ${h.changed_by || 'System User'} • ${h.timestamp} • Reason: ${h.notes || 'Master Data Update'}`,
        badge: 'AUDIT',
        badgeColor: 'bg-slate-200 text-slate-800 border border-slate-300',
        price: h.new_price ? `Rs. ${h.new_price.toLocaleString()}` : undefined,
        iconName: 'History',
        tabId: 'price-history',
        actionType: 'NAVIGATE'
      });
    });

    return items;
  }, [products, branches, customers, quotations, vehicles, history, activeTab]);

  // --- FILTER RESULTS BASED ON QUERY & CATEGORY PILL ---
  const filteredSearchResults = useMemo(() => {
    let result = masterSearchIndex;

    // Apply category pill filter if selected
    if (activeCategoryFilter === 'PRODUCTS') {
      result = result.filter((i) => i.type === 'PRODUCT');
    } else if (activeCategoryFilter === 'PRICE_RULES') {
      result = result.filter((i) => i.type === 'PRICE_RULE');
    } else if (activeCategoryFilter === 'BRANCHES') {
      result = result.filter((i) => i.type === 'BRANCH');
    } else if (activeCategoryFilter === 'CLIENTS') {
      result = result.filter((i) => i.type === 'CLIENT');
    } else if (activeCategoryFilter === 'ORDERS') {
      result = result.filter((i) => i.type === 'ORDER');
    } else if (activeCategoryFilter === 'SETTINGS') {
      result = result.filter((i) => i.type === 'SETTING' || i.type === 'PORTAL' || i.type === 'TOOL');
    }

    if (!searchQuery.trim()) {
      return result;
    }

    const query = searchQuery.toLowerCase().trim();
    return result.filter((item) => {
      const matchTitle = item.title.toLowerCase().includes(query);
      const matchSub = item.subtitle.toLowerCase().includes(query);
      const matchCode = item.code ? item.code.toLowerCase().includes(query) : false;
      const matchPrice = item.price ? item.price.toLowerCase().includes(query) : false;
      const matchBadge = item.badge.toLowerCase().includes(query);
      return matchTitle || matchSub || matchCode || matchPrice || matchBadge;
    });
  }, [masterSearchIndex, searchQuery, activeCategoryFilter]);

  // Reset selected index when filtered list changes
  useEffect(() => {
    setSelectedItemIndex(0);
  }, [searchQuery, activeCategoryFilter]);

  // --- GLOBAL KEYBOARD SHORTCUT (⌘K / Ctrl+K & Navigation Keys) ---
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // 1. Toggle or Focus Global Search (⌘K / Ctrl+K)
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        e.stopPropagation();
        setIsSearchOpen(true);
        setTimeout(() => {
          if (searchInputRef.current) {
            searchInputRef.current.focus();
            searchInputRef.current.select();
          }
        }, 50);
        return;
      }

      // If search box is open, handle Arrow Navigation, Enter & Escape
      if (isSearchOpen) {
        if (e.key === 'Escape') {
          e.preventDefault();
          setIsSearchOpen(false);
          return;
        }

        if (e.key === 'ArrowDown') {
          e.preventDefault();
          setSelectedItemIndex((prev) => (prev < filteredSearchResults.length - 1 ? prev + 1 : 0));
          return;
        }

        if (e.key === 'ArrowUp') {
          e.preventDefault();
          setSelectedItemIndex((prev) => (prev > 0 ? prev - 1 : filteredSearchResults.length - 1));
          return;
        }

        if (e.key === 'Enter') {
          e.preventDefault();
          if (filteredSearchResults.length > 0 && selectedItemIndex < filteredSearchResults.length) {
            handleSelectResult(filteredSearchResults[selectedItemIndex]);
          }
          return;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown, { capture: true });
    return () => window.removeEventListener('keydown', handleKeyDown, { capture: true });
  }, [isSearchOpen, filteredSearchResults, selectedItemIndex]);

  // Handle outside click to close dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        searchDropdownRef.current &&
        !searchDropdownRef.current.contains(e.target as Node) &&
        searchInputRef.current &&
        !searchInputRef.current.contains(e.target as Node)
      ) {
        setIsSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // --- AUTOMATIC MOVEMENT & SELECTION ENGINE ---
  const handleSelectResult = (item: SearchResultItem) => {
    setIsSearchOpen(false);
    setSearchQuery('');

    // Trigger Notification Toast
    triggerSearchToast(`Navigating to ${item.title}...`, item.badge);

    // 1. Handle Special Action Types
    if (item.actionType === 'SWITCH_BRANCH' && item.payload) {
      setActiveBranch(item.payload);
      setActiveTab('branch-network');
      return;
    }

    if (item.actionType === 'OPEN_SCANNER') {
      if (onOpenScannerModal) onOpenScannerModal();
      return;
    }

    if (item.actionType === 'OPEN_CHEAT_SHEET') {
      if (onOpenCheatSheet) onOpenCheatSheet();
      return;
    }

    if (item.actionType === 'OPEN_2FA') {
      if (onOpenMfaSecurity) onOpenMfaSecurity();
      return;
    }

    if (item.actionType === 'OPEN_PASSPHRASE') {
      if (onOpenChangePassword) onOpenChangePassword();
      return;
    }

    if (item.actionType === 'OPEN_EVENT_DRAWER') {
      setShowEventsDrawer(true);
      return;
    }

    // 2. Main Navigation Action
    setActiveTab(item.tabId);

    // 3. Dispatch Specific Sub-tab or Filter Events to Target Modules
    if (item.subTabId) {
      window.dispatchEvent(
        new CustomEvent('innovista_navigate_settings_subtab', {
          detail: { subTab: item.subTabId }
        })
      );
    }

    if (item.type === 'PRODUCT') {
      const q = item.code || item.title;
      window.dispatchEvent(
        new CustomEvent('innovista_search_filter_product', {
          detail: { query: q }
        })
      );
    }

    if (item.type === 'ORDER') {
      const q = item.code || item.title;
      window.dispatchEvent(
        new CustomEvent('innovista_search_filter_order', {
          detail: { query: q }
        })
      );
    }

    if (item.type === 'CLIENT') {
      const q = item.code || item.title;
      window.dispatchEvent(
        new CustomEvent('innovista_search_filter_customer', {
          detail: { query: q }
        })
      );
    }
  };

  // Helper Icon Renderer
  const renderItemIcon = (iconName: string) => {
    switch (iconName) {
      case 'LayoutDashboard': return <LayoutDashboard className="w-4 h-4 text-blue-600" />;
      case 'Layers': return <Layers className="w-4 h-4 text-orange-500" />;
      case 'FileText': return <FileText className="w-4 h-4 text-emerald-600" />;
      case 'Users': return <Users className="w-4 h-4 text-indigo-600" />;
      case 'Truck': return <Truck className="w-4 h-4 text-cyan-600" />;
      case 'Globe': return <Globe className="w-4 h-4 text-blue-500" />;
      case 'History': return <History className="w-4 h-4 text-slate-600" />;
      case 'Settings': return <Settings className="w-4 h-4 text-purple-600" />;
      case 'Building2': return <Building2 className="w-4 h-4 text-orange-600" />;
      case 'Sliders': return <Sliders className="w-4 h-4 text-amber-600" />;
      case 'Tag': return <Tag className="w-4 h-4 text-amber-500" />;
      case 'Scan': return <Scan className="w-4 h-4 text-emerald-600" />;
      case 'Keyboard': return <Keyboard className="w-4 h-4 text-blue-600" />;
      case 'ShieldCheck': return <ShieldCheck className="w-4 h-4 text-orange-600" />;
      case 'Key': return <Key className="w-4 h-4 text-amber-600" />;
      case 'Activity': return <Activity className="w-4 h-4 text-rose-600" />;
      case 'Landmark': return <Landmark className="w-4 h-4 text-emerald-700" />;
      case 'MapPin': return <MapPin className="w-4 h-4 text-rose-500" />;
      case 'Database': return <Database className="w-4 h-4 text-slate-700" />;
      case 'Grid': return <Sliders className="w-4 h-4 text-orange-500" />;
      default: return <Sparkles className="w-4 h-4 text-orange-500" />;
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-xs">
      {/* Toast Alert for Search Navigation */}
      {searchToast && (
        <div className="fixed top-16 right-6 z-50 bg-slate-900 text-white border border-slate-700 shadow-2xl rounded-xl p-3 px-4 flex items-center space-x-3 backdrop-blur-md animate-fadeIn transition-all">
          <div className="p-1.5 bg-orange-500 text-white rounded-lg">
            <Zap className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-orange-400 block">
              Global Jump
            </span>
            <span className="text-xs font-bold text-white">{searchToast.message}</span>
          </div>
        </div>
      )}

      {/* 1. TOP HEADER BAR (Logo, Enhanced Search Bar, Action CTAs, User Profile) */}
      <div className="max-w-[1750px] mx-auto px-4 sm:px-6 py-2 flex flex-wrap items-center justify-between gap-3 bg-white">
        {/* Brand Logo & Tagline */}
        <div className="flex items-center space-x-2 shrink-0 cursor-pointer" onClick={() => setActiveTab('master-prices')}>
          <CompanyLogo size="sm" />
        </div>

        {/* Global Quick Search Input & Auto-Suggest Command Center */}
        <div className="flex-1 max-w-xl relative">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search products, codes, price rules, branches, settings, orders, clients..."
              value={searchQuery}
              onFocus={() => setIsSearchOpen(true)}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                if (!isSearchOpen) setIsSearchOpen(true);
              }}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-20 py-2 text-xs text-slate-900 placeholder-slate-400 font-semibold focus:outline-none focus:border-orange-500 focus:bg-white focus:ring-2 focus:ring-orange-500/20 transition shadow-2xs"
            />
            {searchQuery ? (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-10 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            ) : null}
            <kbd className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-mono text-slate-500 bg-slate-200/80 px-1.5 py-0.5 rounded font-bold border border-slate-300">
              ⌘K
            </kbd>
          </div>

          {/* AUTO-SUGGEST & COMMAND CENTER OVERLAY DROPDOWN */}
          {isSearchOpen && (
            <div
              ref={searchDropdownRef}
              className="absolute left-0 right-0 mt-2 bg-white border border-slate-200 rounded-2xl shadow-2xl z-50 overflow-hidden max-h-[580px] flex flex-col animate-fadeIn"
            >
              {/* Header Bar with Shortcut Tips */}
              <div className="bg-slate-900 text-white p-3 px-4 flex items-center justify-between border-b border-slate-800 text-xs">
                <div className="flex items-center space-x-2">
                  <Search className="w-4 h-4 text-orange-400" />
                  <span className="font-extrabold tracking-wide uppercase text-[11px] text-slate-200">
                    Global Search Command Center
                  </span>
                  <span className="bg-orange-500/20 text-orange-300 border border-orange-500/30 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full">
                    {filteredSearchResults.length} MATCHES
                  </span>
                </div>
                <div className="flex items-center space-x-3 text-[10px] text-slate-400 font-mono hidden sm:flex">
                  <span><kbd className="bg-slate-800 px-1 py-0.5 rounded text-slate-200">↑↓</kbd> Navigate</span>
                  <span><kbd className="bg-slate-800 px-1 py-0.5 rounded text-slate-200">↵</kbd> Auto-Jump</span>
                  <span><kbd className="bg-slate-800 px-1 py-0.5 rounded text-slate-200">ESC</kbd> Close</span>
                </div>
              </div>

              {/* Quick Category Filter Pills */}
              <div className="p-2 bg-slate-50 border-b border-slate-200 flex items-center space-x-1 overflow-x-auto text-xs scrollbar-none">
                <button
                  onClick={() => setActiveCategoryFilter('ALL')}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition shrink-0 ${
                    activeCategoryFilter === 'ALL'
                      ? 'bg-slate-900 text-white shadow-2xs'
                      : 'text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  All Aspects ({masterSearchIndex.length})
                </button>
                <button
                  onClick={() => setActiveCategoryFilter('PRODUCTS')}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition shrink-0 ${
                    activeCategoryFilter === 'PRODUCTS'
                      ? 'bg-blue-600 text-white shadow-2xs'
                      : 'text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Products ({products.length})
                </button>
                <button
                  onClick={() => setActiveCategoryFilter('PRICE_RULES')}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition shrink-0 ${
                    activeCategoryFilter === 'PRICE_RULES'
                      ? 'bg-amber-600 text-white shadow-2xs'
                      : 'text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Price Rules
                </button>
                <button
                  onClick={() => setActiveCategoryFilter('BRANCHES')}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition shrink-0 ${
                    activeCategoryFilter === 'BRANCHES'
                      ? 'bg-orange-600 text-white shadow-2xs'
                      : 'text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Branches ({branches.length})
                </button>
                <button
                  onClick={() => setActiveCategoryFilter('CLIENTS')}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition shrink-0 ${
                    activeCategoryFilter === 'CLIENTS'
                      ? 'bg-indigo-600 text-white shadow-2xs'
                      : 'text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Clients ({customers.length})
                </button>
                <button
                  onClick={() => setActiveCategoryFilter('ORDERS')}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition shrink-0 ${
                    activeCategoryFilter === 'ORDERS'
                      ? 'bg-emerald-600 text-white shadow-2xs'
                      : 'text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Orders ({quotations.length})
                </button>
                <button
                  onClick={() => setActiveCategoryFilter('SETTINGS')}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition shrink-0 ${
                    activeCategoryFilter === 'SETTINGS'
                      ? 'bg-purple-600 text-white shadow-2xs'
                      : 'text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Settings & Portals
                </button>
              </div>

              {/* Suggestions List Container */}
              <div className="flex-1 overflow-y-auto p-2 space-y-1 divide-y divide-slate-100 max-h-[420px]">
                {filteredSearchResults.length === 0 ? (
                  <div className="text-center py-10 px-4 space-y-2">
                    <Search className="w-8 h-8 text-slate-300 mx-auto" />
                    <p className="text-sm font-bold text-slate-700">No matching system items found</p>
                    <p className="text-xs text-slate-400">
                      Try searching by product code (e.g. AP-SL3), price rule, branch name, client, or setting.
                    </p>
                  </div>
                ) : (
                  filteredSearchResults.map((item, idx) => {
                    const isSelected = idx === selectedItemIndex;

                    return (
                      <div
                        key={item.id}
                        onClick={() => handleSelectResult(item)}
                        onMouseEnter={() => setSelectedItemIndex(idx)}
                        className={`p-2.5 rounded-xl cursor-pointer transition flex items-center justify-between gap-3 ${
                          isSelected
                            ? 'bg-orange-50 border border-orange-200 shadow-2xs text-orange-950 font-bold'
                            : 'hover:bg-slate-50 text-slate-800'
                        }`}
                      >
                        <div className="flex items-center space-x-3 min-w-0 flex-1">
                          {/* Category Icon */}
                          <div
                            className={`p-2 rounded-xl shrink-0 flex items-center justify-center border shadow-2xs ${
                              isSelected ? 'bg-orange-500 text-white border-orange-600' : 'bg-slate-100 border-slate-200'
                            }`}
                          >
                            {renderItemIcon(item.iconName)}
                          </div>

                          <div className="min-w-0 flex-1 space-y-0.5">
                            <div className="flex items-center space-x-2">
                              <span className="text-xs font-black truncate text-slate-900">{item.title}</span>
                              <span className={`text-[9px] font-extrabold px-2 py-0.2 rounded-md uppercase shrink-0 ${item.badgeColor}`}>
                                {item.badge}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-500 truncate font-medium">{item.subtitle}</p>
                          </div>
                        </div>

                        {/* Right Meta (Code, Price, Auto-Jump Indicator) */}
                        <div className="flex items-center space-x-2 shrink-0 text-right">
                          {item.price && (
                            <span className="text-xs font-extrabold font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                              {item.price}
                            </span>
                          )}
                          {item.code && (
                            <span className="text-[10px] font-bold font-mono text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                              {item.code}
                            </span>
                          )}
                          <div className={`p-1.5 rounded-lg transition ${isSelected ? 'bg-orange-500 text-white' : 'text-slate-300 opacity-0 group-hover:opacity-100'}`}>
                            <CornerDownLeft className="w-3.5 h-3.5" />
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Quick Popular Access Shortcuts Footer (When searchQuery is empty) */}
              {!searchQuery && (
                <div className="bg-slate-50 border-t border-slate-200 p-3 text-xs space-y-2">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
                    Instant One-Click Portal Quick Jumps
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    <button
                      onClick={() => handleSelectResult(masterSearchIndex[1])} // Master Prices
                      className="px-2.5 py-1 bg-white hover:bg-orange-50 border border-slate-200 hover:border-orange-300 text-slate-800 rounded-lg font-bold transition flex items-center space-x-1"
                    >
                      <Layers className="w-3.5 h-3.5 text-orange-500" />
                      <span>Master Prices POS</span>
                    </button>
                    <button
                      onClick={() => handleSelectResult(masterSearchIndex[2])} // Orders
                      className="px-2.5 py-1 bg-white hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 text-slate-800 rounded-lg font-bold transition flex items-center space-x-1"
                    >
                      <FileText className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Order Management</span>
                    </button>
                    <button
                      onClick={() => handleSelectResult(masterSearchIndex[14])} // Surcharges Sub-tab
                      className="px-2.5 py-1 bg-white hover:bg-amber-50 border border-slate-200 hover:border-amber-300 text-slate-800 rounded-lg font-bold transition flex items-center space-x-1"
                    >
                      <Sliders className="w-3.5 h-3.5 text-amber-600" />
                      <span>11 Surcharge Categories</span>
                    </button>
                    <button
                      onClick={() => handleSelectResult(masterSearchIndex[10])} // Users Sub-tab
                      className="px-2.5 py-1 bg-white hover:bg-purple-50 border border-slate-200 hover:border-purple-300 text-slate-800 rounded-lg font-bold transition flex items-center space-x-1"
                    >
                      <Users className="w-3.5 h-3.5 text-purple-600" />
                      <span>Users & Roles</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right CTA Buttons & User Controls */}
        <div className="flex items-center space-x-2 shrink-0">
          {/* Node / Branch Switcher */}
          <div className="relative">
            {currentUser?.role === 'Super Admin' || currentUser?.role === 'HO Admin' || currentUser?.branch_id === 'b-ho' ? (
              <button
                onClick={() => setShowBranchDropdown(!showBranchDropdown)}
                className="flex items-center space-x-2 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer"
              >
                <Building2 className="w-3.5 h-3.5 text-slate-600" />
                <span className="truncate max-w-[120px] sm:max-w-none">{activeBranch.name}</span>
                <span className="bg-slate-900 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                  {activeBranch.code}
                </span>
                <ChevronDown className="w-3 h-3 text-slate-500" />
              </button>
            ) : (
              <div
                className="flex items-center space-x-2 bg-slate-100 text-slate-700 border border-slate-200 px-3 py-1.5 rounded-lg text-xs font-bold select-none cursor-not-allowed"
                title={`Branch Locked: As ${currentUser?.role || 'Branch Staff'}, you are restricted to viewing and managing your assigned branch (${activeBranch.name}).`}
              >
                <Building2 className="w-3.5 h-3.5 text-slate-600" />
                <span className="truncate max-w-[120px] sm:max-w-none">{activeBranch.name}</span>
                <span className="bg-slate-800 text-slate-200 text-[9px] font-bold px-1.5 py-0.5 rounded flex items-center space-x-1">
                  <Lock className="w-2.5 h-2.5 text-orange-400 shrink-0" />
                  <span>{activeBranch.code}</span>
                </span>
              </div>
            )}

            {showBranchDropdown && (currentUser?.role === 'Super Admin' || currentUser?.role === 'HO Admin' || currentUser?.branch_id === 'b-ho') && (
              <div className="absolute right-0 mt-1.5 w-64 bg-white border border-slate-200 rounded-xl shadow-xl z-50 py-1 text-xs">
                <div className="px-3 py-1.5 border-b border-slate-100 text-[10px] font-bold uppercase text-slate-400">
                  Select Branch Location Node
                </div>
                {branches.map((b) => (
                  <button
                    key={b.id}
                    onClick={() => {
                      setActiveBranch(b);
                      setShowBranchDropdown(false);
                    }}
                    className={`w-full text-left px-3 py-2 flex items-center justify-between hover:bg-slate-50 transition cursor-pointer ${
                      activeBranch.id === b.id ? 'bg-orange-50 text-orange-600 font-bold border-l-2 border-orange-500' : 'text-slate-700'
                    }`}
                  >
                    <div>
                      <div className="font-semibold text-slate-900">{b.name}</div>
                      <div className="text-[10px] text-slate-400">{b.manager_name}</div>
                    </div>
                    <span className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-bold ${
                      b.code === 'HO' ? 'bg-orange-500 text-white' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {b.code}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Sync Mode Status Pill */}
          <button
            onClick={() => setSyncMode(syncMode === 'REALTIME' ? 'POLLING_5MIN' : 'REALTIME')}
            className="hidden lg:flex items-center space-x-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer"
            title="Toggle System Sync Mode"
          >
            <span className={`w-2 h-2 rounded-full ${syncMode === 'REALTIME' ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
            <span>{syncMode === 'REALTIME' ? 'Live WebSocket' : '5-Min Batch'}</span>
          </button>

          {/* Notification Bell */}
          <button
            onClick={() => {
              setShowEventsDrawer(!showEventsDrawer);
              clearUnread();
            }}
            className="relative p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition cursor-pointer flex items-center justify-center"
            title="Real-Time Master Event Stream"
          >
            <Bell className="w-3.5 h-3.5" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-orange-500 text-white font-bold text-[9px] w-4 h-4 rounded-full flex items-center justify-center animate-bounce shadow-2xs">
                {unreadCount}
              </span>
            )}
          </button>

          {/* "Barcode Scanner" Button */}
          <button
            onClick={() => {
              if (onOpenScannerModal) onOpenScannerModal();
            }}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-3 py-1.5 rounded-lg shadow-2xs transition flex items-center space-x-1.5 hover:shadow-xs cursor-pointer"
            title="Open Barcode & QR Scanner (Alt + X)"
          >
            <Scan className="w-3.5 h-3.5 text-white" />
            <span className="hidden sm:inline">Scanner</span>
          </button>

          {/* Shortcuts Quick Reference Button */}
          {onOpenCheatSheet && (
            <button
              onClick={onOpenCheatSheet}
              className="bg-slate-100 hover:bg-slate-200 text-[#0F203C] font-bold text-xs px-3 py-1.5 rounded-lg border border-slate-200 shadow-2xs transition flex items-center space-x-1.5 cursor-pointer"
              title="Keyboard Shortcuts Cheat Sheet (Shift + ?)"
            >
              <Keyboard className="w-3.5 h-3.5 text-[#E87F24]" />
              <span className="hidden sm:inline">Shortcuts</span>
            </button>
          )}

          {/* "+ Add New" Primary CTA Button in ORANGE */}
          <button
            onClick={() => {
              if (onOpenAddModal) onOpenAddModal();
              setActiveTab('master-prices');
            }}
            className="bg-[#E87F24] hover:bg-[#D26E1A] text-white font-bold text-xs px-3.5 py-1.5 rounded-lg shadow-2xs transition flex items-center space-x-1.5 hover:shadow-xs cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add New</span>
          </button>

          {/* "POS" Primary CTA Button in Dark Accent */}
          <button
            onClick={() => setActiveTab('master-prices')}
            className="bg-[#0F203C] hover:bg-[#1A2E4E] text-white font-bold text-xs px-3.5 py-1.5 rounded-lg shadow-2xs transition flex items-center space-x-1.5 hover:shadow-xs cursor-pointer"
          >
            <Calculator className="w-3.5 h-3.5 text-[#FFC81E]" />
            <span>POS</span>
          </button>

          {/* User Profile Badge & Sign Out */}
          {currentUser && (
            <div className="flex items-center space-x-2 pl-2 border-l border-slate-200">
              <div className="hidden lg:flex flex-col text-right">
                <div className="flex items-center justify-end space-x-1.5">
                  <span className="text-xs font-bold text-slate-900 line-clamp-1">{currentUser.name}</span>
                  {currentUser.employee_id && (
                    <span className="text-[9px] font-mono font-bold text-orange-700 bg-orange-50 border border-orange-200 px-1.5 py-0.2 rounded">
                      {currentUser.employee_id}
                    </span>
                  )}
                </div>
                <span className="text-[10px] font-semibold text-orange-600 uppercase">{currentUser.role}</span>
              </div>
              {onOpenMfaSecurity && (
                <button
                  onClick={onOpenMfaSecurity}
                  className="bg-slate-100 hover:bg-orange-50 hover:text-orange-700 text-slate-700 font-semibold text-xs p-1.5 sm:px-2.5 sm:py-1.5 rounded-md border border-slate-200 hover:border-orange-300 transition flex items-center space-x-1 cursor-pointer"
                  title="Google Authenticator 2FA Security"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-orange-600" />
                  <span className="hidden sm:inline text-[11px]">2FA Security</span>
                </button>
              )}
              {onOpenChangePassword && (
                <button
                  onClick={onOpenChangePassword}
                  className="bg-slate-100 hover:bg-amber-50 hover:text-amber-700 text-slate-700 font-semibold text-xs p-1.5 sm:px-2.5 sm:py-1.5 rounded-md border border-slate-200 hover:border-amber-300 transition flex items-center space-x-1 cursor-pointer"
                  title="Change Password"
                >
                  <Key className="w-3.5 h-3.5 text-amber-600" />
                  <span className="hidden sm:inline text-[11px]">Passphrase</span>
                </button>
              )}
              <button
                onClick={onLogout}
                className="bg-slate-100 hover:bg-red-50 hover:text-red-600 text-slate-700 font-semibold text-xs p-1.5 sm:px-2.5 sm:py-1.5 rounded-md border border-slate-200 hover:border-red-200 transition flex items-center space-x-1 cursor-pointer"
                title="Sign Out / Switch Session"
              >
                <LogOut className="w-3.5 h-3.5 text-slate-500 hover:text-red-600" />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 2. SUB NAVIGATION BAR - COMPACT TABS */}
      <div className="bg-white border-t border-slate-200 px-4 sm:px-6 py-1">
        <div className="max-w-[1750px] mx-auto flex items-center justify-between">
          <nav className="flex items-center space-x-1 overflow-x-auto py-0.5 scrollbar-none">
            {navTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-1.5 px-3 py-1 rounded-md text-xs font-semibold transition whitespace-nowrap cursor-pointer ${
                    isActive 
                      ? 'bg-[#0F203C] text-white shadow-xs' 
                      : 'text-[#0F203C] hover:text-[#0F203C] hover:bg-slate-100'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#FFC81E]' : 'text-[#73A5CA]'}`} />
                  <span>{tab.label}</span>
                  {tab.badge && (
                    <span className={`text-[9px] px-1.5 py-0.2 rounded font-semibold uppercase ${
                      isActive 
                        ? 'bg-[#E87F24] text-white' 
                        : 'bg-[#FEFDDF] text-[#0F203C] border border-[#FFC81E]/40'
                    }`}>
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Real-Time Event Stream Drawer */}
      {showEventsDrawer && (
        <div className="fixed inset-y-0 right-0 w-80 sm:w-96 bg-white text-slate-900 border-l border-slate-200 shadow-2xl z-50 flex flex-col">
          <div className="p-3.5 border-b border-slate-200 flex items-center justify-between bg-slate-900 text-white">
            <div className="flex items-center space-x-2">
              <Activity className="w-4 h-4 text-orange-400" />
              <h3 className="text-xs font-semibold uppercase tracking-wider">Master Event Stream</h3>
            </div>
            <button 
              onClick={() => setShowEventsDrawer(false)}
              className="text-slate-400 hover:text-white p-1 rounded-md"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-2 bg-slate-50">
            {events.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-8">No events broadcasted yet.</p>
            ) : (
              events.map((evt) => (
                <div key={evt.id} className="p-2.5 bg-white border border-slate-200 rounded-md space-y-1 shadow-xs">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-bold text-orange-600">{evt.title}</span>
                    <span className="text-slate-400 text-[10px]">{evt.timestamp}</span>
                  </div>
                  <p className="text-xs text-slate-700">{evt.message}</p>
                  {evt.old_price !== undefined && evt.new_price !== undefined && (
                    <div className="mt-1 flex items-center space-x-2 text-[10px] bg-slate-50 p-1.5 rounded border border-slate-200 font-mono">
                      <span className="text-rose-500 line-through">Rs. {evt.old_price.toLocaleString()}</span>
                      <span className="text-slate-400">→</span>
                      <span className="text-emerald-600 font-bold">Rs. {evt.new_price.toLocaleString()}</span>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </header>
  );
};
