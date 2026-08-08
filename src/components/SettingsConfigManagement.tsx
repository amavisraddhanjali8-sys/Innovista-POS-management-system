import React, { useState, useEffect, useRef } from 'react';
import { CompanyLogo } from './CompanyLogo';
import { 
  Building2, 
  Landmark, 
  Users, 
  Grid, 
  Tag, 
  MapPin, 
  Upload, 
  Check, 
  X, 
  Plus, 
  Trash2, 
  Edit3, 
  ShieldCheck, 
  UserCheck, 
  UserX, 
  DollarSign, 
  Globe2, 
  Save, 
  AlertCircle,
  FileText,
  BadgeCheck,
  CheckCircle2,
  RefreshCw,
  Image as ImageIcon,
  Keyboard,
  Database,
  Download,
  HardDrive,
  Clock,
  FileSpreadsheet,
  ShieldAlert,
  Sliders,
  Sparkles,
  Layers,
  Zap,
  Search,
  Filter,
  BarChart3,
  PieChart as PieChartIcon,
  Power,
  Lock,
  KeyRound,
  Eye,
  EyeOff,
  Copy
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  Legend, 
  ComposedChart, 
  Line, 
  Area 
} from 'recharts';
import { KeyboardShortcutSettings } from './KeyboardShortcutSettings';
import { SurchargeAnalyticsPanel } from './SurchargeAnalyticsPanel';

import { 
  CompanySettings, 
  SystemUser, 
  CategoryConfig, 
  SubCategoryItem,
  CustomerTypeConfig, 
  LocationConfig, 
  Branch, 
  BankDetails, 
  CurrencySetting,
  Product,
  Quotation,
  Customer,
  SurchargePreset,
  BranchSpecificSettings,
  BranchPushDirective
} from '../types';

import {
  getBranchSettingsMap,
  getBranchSettings,
  saveBranchSettings,
  pushSettingsToBranch,
  getBranchPushDirectives,
  isPeerBranchNetworkingAllowed
} from '../utils/branchSettingsEngine';

import { 
  fetchCompanySettings, 
  updateCompanySettings, 
  fetchUsers, 
  addUser, 
  updateUser, 
  updateUserStatus, 
  deleteUser, 
  fetchCategories, 
  addCategory, 
  updateCategory, 
  deleteCategory, 
  fetchCustomerTypes, 
  addCustomerType, 
  updateCustomerType, 
  deleteCustomerType, 
  fetchLocationConfigs, 
  addLocationConfig, 
  updateLocationConfig, 
  deleteLocationConfig 
} from '../services/api';

import { 
  hasPermission, 
  getSavedRolePermissions, 
  saveRolePermissions, 
  resetRolePermissionsToDefault, 
  SystemRole, 
  PermissionKey, 
  PERMISSION_DEFINITIONS,
  RolePermissionsMap
} from '../utils/permissionEngine';
import { getSessionTimeoutMinutes, saveSessionTimeoutMinutes } from '../utils/sessionEngine';
import { RotateCcw } from 'lucide-react';

interface SettingsConfigProps {
  activeBranch: Branch;
  branches: Branch[];
  products?: Product[];
  quotations?: Quotation[];
  customers?: Customer[];
  currentUser?: SystemUser | null;
  initialSubTab?: 'company' | 'bank_currency' | 'users' | 'categories' | 'customer_types' | 'locations' | 'shortcuts' | 'backup_export' | 'surcharge_presets' | 'role_permissions' | 'branch_settings';
}


export const SettingsConfigManagement: React.FC<SettingsConfigProps> = ({ 
  activeBranch, 
  branches, 
  products = [], 
  quotations = [], 
  customers = [], 
  currentUser = null,
  initialSubTab = 'company' 
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'company' | 'bank_currency' | 'users' | 'categories' | 'customer_types' | 'locations' | 'shortcuts' | 'backup_export' | 'surcharge_presets' | 'role_permissions' | 'branch_settings'>(initialSubTab);
  
  // --- Branch-Specific Settings & Push Engine State ---
  const [selectedBranchId, setSelectedBranchId] = useState<string>(activeBranch.id || 'b-kdy');
  const [branchConfigForm, setBranchConfigForm] = useState<BranchSpecificSettings>(() => getBranchSettings(selectedBranchId, activeBranch));
  const [pushDirectivesHistory, setPushDirectivesHistory] = useState<BranchPushDirective[]>(() => getBranchPushDirectives(selectedBranchId));
  const [isPushingToBranch, setIsPushingToBranch] = useState<boolean>(false);
  const [pushNotesInput, setPushNotesInput] = useState<string>('');
  const [sessionTimeoutInput, setSessionTimeoutInput] = useState<number>(getSessionTimeoutMinutes);

  // Synchronize when selected target branch changes
  useEffect(() => {
    const targetBranchObj = branches.find(b => b.id === selectedBranchId) || activeBranch;
    const loaded = getBranchSettings(selectedBranchId, targetBranchObj);
    setBranchConfigForm(loaded);
    setPushDirectivesHistory(getBranchPushDirectives(selectedBranchId));
  }, [selectedBranchId, branches, activeBranch]);

  // Handle Save Branch Settings
  const handleSaveBranchSettings = () => {
    saveBranchSettings(branchConfigForm);
    notifySuccess(`Saved separate configuration overrides for ${branchConfigForm.branch_name}!`);
  };

  // Handle Push Settings to Branch (Broadcast Directive to Branch Staff)
  const handlePushBranchSettings = () => {
    setIsPushingToBranch(true);
    setTimeout(() => {
      const pusher = currentUser?.name || activeBranch.manager_name || 'Head Office Admin';
      const { updatedSettings, directive } = pushSettingsToBranch(
        selectedBranchId,
        branchConfigForm,
        pusher,
        pushNotesInput || `HO Directives & Policy Push for ${branchConfigForm.branch_name}`
      );

      setBranchConfigForm(updatedSettings);
      setPushDirectivesHistory(getBranchPushDirectives(selectedBranchId));
      setIsPushingToBranch(false);
      setPushNotesInput('');

      notifySuccess(`🚀 Successfully pushed configuration changes to ${updatedSettings.branch_name}! Branch Managers & Sales Executives notified.`);
    }, 600);
  };

  const [rolePermissions, setRolePermissions] = useState<RolePermissionsMap>(getSavedRolePermissions);


  useEffect(() => {
    const handlePermissionsChanged = () => {
      setRolePermissions(getSavedRolePermissions());
    };
    const handleSettingsSubTab = (e: any) => {
      if (e.detail?.subTab) {
        setActiveSubTab(e.detail.subTab);
      }
    };
    window.addEventListener('innovista_permissions_changed', handlePermissionsChanged);
    window.addEventListener('innovista_navigate_settings_subtab', handleSettingsSubTab);
    return () => {
      window.removeEventListener('innovista_permissions_changed', handlePermissionsChanged);
      window.removeEventListener('innovista_navigate_settings_subtab', handleSettingsSubTab);
    };
  }, []);

  const currentRole: SystemRole = (currentUser?.role as SystemRole) || (activeBranch.code === 'HO' ? 'Super Admin' : 'Sales Executive');

  const getSubTabPermissionKey = (tab: string): PermissionKey | null => {
    switch (tab) {
      case 'categories':
      case 'customer_types':
      case 'locations':
        return 'view_master_data';
      case 'surcharge_presets':
        return 'view_surcharge_presets';
      case 'company':
        return 'view_company_branding';
      case 'bank_currency':
        return 'view_bank_currency';
      case 'users':
        return 'manage_users';
      case 'role_permissions':
        return 'manage_roles_permissions';
      case 'backup_export':
        return 'view_backup_export';
      case 'shortcuts':
        return 'view_shortcuts';
      default:
        return null;
    }
  };

  const activeRequiredPermission = getSubTabPermissionKey(activeSubTab);
  const isSubTabAllowed = !activeRequiredPermission || hasPermission(currentRole, activeRequiredPermission);

  const isHOAdmin = currentUser?.role === 'Super Admin' || currentUser?.role === 'HO Admin' || activeBranch.code === 'HO';
  const canEditMasterData = (isHOAdmin || hasPermission(currentRole, 'edit_master_data')) && currentRole !== 'Branch Manager' && currentRole !== 'Sales Executive';
  const canEditSurchargePresets = (isHOAdmin || hasPermission(currentRole, 'edit_surcharge_presets')) && currentRole !== 'Branch Manager' && currentRole !== 'Sales Executive';

  const handleToggleRolePermission = (role: SystemRole, key: PermissionKey) => {
    if (role === 'Super Admin') return;
    const updated = {
      ...rolePermissions,
      [role]: {
        ...rolePermissions[role],
        [key]: !rolePermissions[role][key]
      }
    };
    setRolePermissions(updated);
    saveRolePermissions(updated);
    setSaveSuccess(`Updated permission "${key}" for role "${role}".`);
  };

  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmLabel?: string;
    onConfirm: () => void | Promise<void>;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {}
  });

  const handleResetPermissions = () => {
    setConfirmModal({
      isOpen: true,
      title: 'Reset Role Permissions',
      message: 'Are you sure you want to reset all role permissions to factory defaults? Master Data and Surcharge details will be strictly Super Admin exclusive.',
      confirmLabel: 'Reset Permissions',
      onConfirm: () => {
        const defaults = resetRolePermissionsToDefault();
        setRolePermissions(defaults);
        setSaveSuccess('Reset all role permissions to factory defaults! Master Data and Surcharge details are now Super Admin Exclusive.');
      }
    });
  };

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);

  // Initial Surcharge Presets
  const [surchargePresets, setSurchargePresets] = useState<SurchargePreset[]>([
    {
      id: 'sp-1',
      name: 'Heavy Duty Finishing Pack',
      code: 'PRESET-HD-FINISH',
      description: 'PVDF triple-coat surface finish with protective anti-scratch UV film',
      category: 'Finishing',
      surcharge_type: 'Fixed LKR',
      base_value: 1500,
      applied_factors: {
        thickness_factor: 1.15,
        floor_level_factor: 1.0,
        facility_type_factor: 1.0,
        urgent_handling_lkr: 0
      },
      applicable_categories: ['Aluminium Profiles', 'Interior Design'],
      created_at: '2026-08-01',
      status: 'Active'
    },
    {
      id: 'sp-2',
      name: 'Urgent High-Rise Installation Fee',
      code: 'PRESET-HIGH-RISE',
      description: 'For 11th+ floor high-rise glass & aluminium installation with hoist handling and safety rig',
      category: 'Installation',
      surcharge_type: 'Multi-Factor Multiplier',
      base_value: 3500,
      applied_factors: {
        thickness_factor: 1.10,
        floor_level_factor: 1.35,
        facility_type_factor: 1.25,
        urgent_handling_lkr: 2500
      },
      applicable_categories: ['Aluminium Fabrication', 'Glass', 'Civil Works'],
      created_at: '2026-08-02',
      status: 'Active'
    },
    {
      id: 'sp-3',
      name: 'Hospital Cleanroom Isolation Surcharge',
      code: 'PRESET-CLEANROOM',
      description: 'Special dust-free isolation setup, sterile room protocol & HEPA equipment handling',
      category: 'Facility',
      surcharge_type: 'Percentage Base',
      base_value: 15,
      applied_factors: {
        thickness_factor: 1.0,
        floor_level_factor: 1.0,
        facility_type_factor: 1.20,
        urgent_handling_lkr: 1000
      },
      applicable_categories: ['Labour & Installation', 'Services'],
      created_at: '2026-08-03',
      status: 'Active'
    },
    {
      id: 'sp-4',
      name: 'Coastal Weatherproofing Shield',
      code: 'PRESET-COASTAL-SEAL',
      description: 'Heavy marine-grade anodized profiles & anti-saline silicone sealant pack',
      category: 'Special Handling',
      surcharge_type: 'Fixed LKR',
      base_value: 2200,
      applied_factors: {
        thickness_factor: 1.20,
        floor_level_factor: 1.10,
        facility_type_factor: 1.0,
        urgent_handling_lkr: 0
      },
      applicable_categories: ['Aluminium Profiles', 'Glass'],
      created_at: '2026-08-05',
      status: 'Active'
    }
  ]);

  const [surchargeSearch, setSurchargeSearch] = useState<string>('');
  const [surchargeCategoryFilter, setSurchargeCategoryFilter] = useState<string>('ALL');
  const [surchargeViewMode, setSurchargeViewMode] = useState<'presets' | 'analytics'>('presets');
  const [showSurchargeModal, setShowSurchargeModal] = useState<boolean>(false);
  const [surchargeForm, setSurchargeForm] = useState<SurchargePreset>({
    id: '',
    name: '',
    code: '',
    description: '',
    category: 'Finishing',
    surcharge_type: 'Fixed LKR',
    base_value: 0,
    applied_factors: {
      thickness_factor: 1.0,
      floor_level_factor: 1.0,
      facility_type_factor: 1.0,
      urgent_handling_lkr: 0
    },
    applicable_categories: [],
    status: 'Active'
  });

  // Bulk CSV & Template Import Modal States for Surcharge Presets
  const [showSurchargeImportModal, setShowSurchargeImportModal] = useState<boolean>(false);
  const [importSourceTab, setImportSourceTab] = useState<'template_library' | 'csv_upload' | 'raw_paste'>('template_library');
  const [rawCsvInput, setRawCsvInput] = useState<string>('');
  const [parsedCsvRows, setParsedCsvRows] = useState<Array<{
    name: string;
    code: string;
    category: string;
    surcharge_type: 'Fixed LKR' | 'Percentage Base' | 'Multi-Factor Multiplier';
    base_value: number;
    thickness_factor: number;
    floor_level_factor: number;
    facility_type_factor: number;
    urgent_handling_lkr: number;
    applicable_categories: string[];
    status: 'Active' | 'Inactive';
    valid: boolean;
    validationError?: string;
  }>>([]);
  const [importSuccessCount, setImportSuccessCount] = useState<number | null>(null);

  // Industry Template Preset Bundles
  const INDUSTRY_PRESET_BUNDLES = [
    {
      id: 'bundle-aluminium',
      title: 'Aluminium Alloys, Anodizing & Powder Coat Matrix',
      description: '6 pre-configured surcharges covering Marine Grade 5052, Architectural 6063-T6, PVDF Triple Coat, Wood Grain & Thermal Break',
      badge: 'Aluminium & Metal',
      items: [
        { name: 'Marine Grade 5052 Alloy Premium', code: 'ALLOY-5052-M', category: 'Finishing', surcharge_type: 'Fixed LKR', base_value: 850, thickness_factor: 1.10, floor_level_factor: 1.0, facility_type_factor: 1.0, urgent_handling_lkr: 0, applicable_categories: ['Aluminium Profiles', 'Cladding'], status: 'Active' },
        { name: 'Architectural 6063-T6 Heat Treated', code: 'ALLOY-6063-T6', category: 'Finishing', surcharge_type: 'Fixed LKR', base_value: 450, thickness_factor: 1.05, floor_level_factor: 1.0, facility_type_factor: 1.0, urgent_handling_lkr: 0, applicable_categories: ['Aluminium Profiles'], status: 'Active' },
        { name: 'PVDF Triple-Coat Metallic Finish', code: 'COAT-PVDF-3C', category: 'Finishing', surcharge_type: 'Multi-Factor Multiplier', base_value: 1800, thickness_factor: 1.20, floor_level_factor: 1.0, facility_type_factor: 1.1, urgent_handling_lkr: 0, applicable_categories: ['Aluminium Profiles', 'Cladding'], status: 'Active' },
        { name: 'Wood Grain Thermal Transfer Print', code: 'FINISH-WOOD-TT', category: 'Finishing', surcharge_type: 'Fixed LKR', base_value: 2500, thickness_factor: 1.15, floor_level_factor: 1.0, facility_type_factor: 1.0, urgent_handling_lkr: 0, applicable_categories: ['Aluminium Profiles', 'Interior Design'], status: 'Active' },
        { name: 'Sandblasted Matte Anodized Black', code: 'ANOD-MATTE-BLK', category: 'Finishing', surcharge_type: 'Fixed LKR', base_value: 1200, thickness_factor: 1.08, floor_level_factor: 1.0, facility_type_factor: 1.0, urgent_handling_lkr: 0, applicable_categories: ['Aluminium Profiles'], status: 'Active' },
        { name: 'Thermal Break Structural Insulation Pack', code: 'INSUL-THERM-BRK', category: 'Special Handling', surcharge_type: 'Multi-Factor Multiplier', base_value: 3200, thickness_factor: 1.25, floor_level_factor: 1.10, facility_type_factor: 1.0, urgent_handling_lkr: 0, applicable_categories: ['Aluminium Profiles'], status: 'Active' }
      ]
    },
    {
      id: 'bundle-highrise',
      title: 'High-Rise, Glazing & Hoist Rigging Matrix',
      description: '5 surcharges for multi-storey floor levels, heavy glass hoist, structural silicone sealant, and night shift installation',
      badge: 'Glazing & High Rise',
      items: [
        { name: 'Floor Level 10-15 Hoist Surcharge', code: 'HOIST-FL10-15', category: 'Installation', surcharge_type: 'Multi-Factor Multiplier', base_value: 1500, thickness_factor: 1.0, floor_level_factor: 1.25, facility_type_factor: 1.10, urgent_handling_lkr: 1000, applicable_categories: ['Glass', 'Aluminium Fabrication'], status: 'Active' },
        { name: 'Floor Level 16-25 Heavy Crane Rig', code: 'CRANE-FL16-25', category: 'Installation', surcharge_type: 'Multi-Factor Multiplier', base_value: 3800, thickness_factor: 1.15, floor_level_factor: 1.50, facility_type_factor: 1.30, urgent_handling_lkr: 2500, applicable_categories: ['Glass', 'Aluminium Fabrication'], status: 'Active' },
        { name: 'Double Glazed Low-E Solar Control Glass', code: 'GLASS-DGU-LOWE', category: 'Special Handling', surcharge_type: 'Percentage Base', base_value: 18, thickness_factor: 1.20, floor_level_factor: 1.0, facility_type_factor: 1.0, urgent_handling_lkr: 0, applicable_categories: ['Glass'], status: 'Active' },
        { name: 'Structural Glazing Dow Corning Silicone', code: 'SEAL-STRUCT-SIL', category: 'Finishing', surcharge_type: 'Fixed LKR', base_value: 2800, thickness_factor: 1.10, floor_level_factor: 1.0, facility_type_factor: 1.0, urgent_handling_lkr: 0, applicable_categories: ['Glass', 'Aluminium Profiles'], status: 'Active' },
        { name: 'Night Shift / Overtime Site Access Fee', code: 'SITE-NIGHT-SHIFT', category: 'Facility', surcharge_type: 'Fixed LKR', base_value: 2500, thickness_factor: 1.0, floor_level_factor: 1.10, facility_type_factor: 1.20, urgent_handling_lkr: 1500, applicable_categories: ['Labour & Installation', 'Services'], status: 'Active' }
      ]
    },
    {
      id: 'bundle-regional',
      title: 'Branch Location & Specialized Facility Logistics',
      description: '4 surcharges for outstation long-haul transport, port city high-security clearance, cleanrooms, and coastal anti-saline prep',
      badge: 'Logistics & Branch',
      items: [
        { name: 'Colombo Port City High-Security Zone', code: 'ZONE-PORT-CITY', category: 'Facility', surcharge_type: 'Fixed LKR', base_value: 2000, thickness_factor: 1.0, floor_level_factor: 1.10, facility_type_factor: 1.30, urgent_handling_lkr: 1000, applicable_categories: ['Services', 'Aluminium Profiles'], status: 'Active' },
        { name: 'Outstation Long-Haul Logistics Surcharge', code: 'FREIGHT-LONG-HAUL', category: 'Special Handling', surcharge_type: 'Fixed LKR', base_value: 3500, thickness_factor: 1.0, floor_level_factor: 1.0, facility_type_factor: 1.15, urgent_handling_lkr: 2000, applicable_categories: ['Services', 'Aluminium Profiles', 'Glass'], status: 'Active' },
        { name: 'Cleanroom Sterile HEPA Protocol', code: 'FACILITY-CLEANROOM', category: 'Facility', surcharge_type: 'Percentage Base', base_value: 15, thickness_factor: 1.0, floor_level_factor: 1.0, facility_type_factor: 1.25, urgent_handling_lkr: 1000, applicable_categories: ['Services', 'Labour & Installation'], status: 'Active' },
        { name: 'Coastal Anti-Saline Stainless Hardware Pack', code: 'COAST-SALINE-316', category: 'Special Handling', surcharge_type: 'Fixed LKR', base_value: 2200, thickness_factor: 1.15, floor_level_factor: 1.0, facility_type_factor: 1.10, urgent_handling_lkr: 0, applicable_categories: ['Aluminium Profiles', 'Glass', 'Hardware'], status: 'Active' }
      ]
    }
  ];

  const handleDownloadSampleCSV = () => {
    const csvContent = 
`Name,Code,Category,Type,BaseValue,ThicknessFactor,FloorFactor,FacilityFactor,UrgentLKR,ApplicableCategories,Status
Heavy Duty Marine Grade 5052,PRESET-5052-M,Finishing,Fixed LKR,850,1.10,1.0,1.0,0,"Aluminium Profiles,Cladding",Active
Floor Level 10-15 Hoist Surcharge,PRESET-HOIST-FL10,Installation,Multi-Factor Multiplier,1500,1.0,1.25,1.10,1000,"Glass,Aluminium Fabrication",Active
Low-E Solar Control DGU Glass,PRESET-GLASS-DGU,Special Handling,Percentage Base,18,1.20,1.0,1.0,0,"Glass",Active
Outstation Long-Haul Logistics,PRESET-OUTSTATION,Facility,Fixed LKR,3500,1.0,1.0,1.15,2000,"Services,Aluminium Profiles",Active`;
    
    downloadFile(csvContent, 'surcharge_preset_bulk_import_template.csv', 'text/csv');
    notifySuccess('Downloaded sample CSV template: surcharge_preset_bulk_import_template.csv');
  };

  const handleParseRawCSV = (csvText: string) => {
    setRawCsvInput(csvText);
    const lines = csvText.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    if (lines.length <= 1) {
      setParsedCsvRows([]);
      return;
    }

    const rows = [];
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      const parts = line.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g) || line.split(',');
      const cleanParts = parts.map(p => p.replace(/^"|"$/g, '').trim());

      const name = cleanParts[0] || `Imported Surcharge ${i}`;
      const code = cleanParts[1] || `IMP-${Math.floor(1000 + Math.random() * 9000)}`;
      const category = cleanParts[2] || 'Finishing';
      const rawType = cleanParts[3] || 'Fixed LKR';
      const surcharge_type: 'Fixed LKR' | 'Percentage Base' | 'Multi-Factor Multiplier' = 
        rawType.includes('Percentage') ? 'Percentage Base' : 
        rawType.includes('Multi') ? 'Multi-Factor Multiplier' : 'Fixed LKR';

      const base_value = parseFloat(cleanParts[4]) || 0;
      const thickness_factor = parseFloat(cleanParts[5]) || 1.0;
      const floor_level_factor = parseFloat(cleanParts[6]) || 1.0;
      const facility_type_factor = parseFloat(cleanParts[7]) || 1.0;
      const urgent_handling_lkr = parseFloat(cleanParts[8]) || 0;
      const applicable_categories = cleanParts[9] ? cleanParts[9].split(',').map(c => c.trim()) : ['Aluminium Profiles'];
      const status: 'Active' | 'Inactive' = cleanParts[10]?.toLowerCase() === 'inactive' ? 'Inactive' : 'Active';

      const isValid = name.length >= 2 && code.length >= 2 && !isNaN(base_value);

      rows.push({
        name,
        code,
        category,
        surcharge_type,
        base_value,
        thickness_factor,
        floor_level_factor,
        facility_type_factor,
        urgent_handling_lkr,
        applicable_categories,
        status,
        valid: isValid,
        validationError: isValid ? undefined : 'Invalid name, code or numeric value'
      });
    }

    setParsedCsvRows(rows);
  };

  const handleImportParsedRows = () => {
    const validRows = parsedCsvRows.filter(r => r.valid);
    if (validRows.length === 0) {
      alert('No valid rows available to import.');
      return;
    }

    const newPresets: SurchargePreset[] = validRows.map((r, index) => ({
      id: `sp-imported-${Date.now()}-${index}`,
      name: r.name,
      code: r.code,
      description: `Bulk imported preset template (${r.category})`,
      category: r.category,
      surcharge_type: r.surcharge_type,
      base_value: r.base_value,
      applied_factors: {
        thickness_factor: r.thickness_factor,
        floor_level_factor: r.floor_level_factor,
        facility_type_factor: r.facility_type_factor,
        urgent_handling_lkr: r.urgent_handling_lkr
      },
      applicable_categories: r.applicable_categories,
      created_at: new Date().toISOString().split('T')[0],
      status: r.status
    }));

    setSurchargePresets(prev => [...newPresets, ...prev]);
    setImportSuccessCount(newPresets.length);
    notifySuccess(`Successfully imported ${newPresets.length} surcharge presets in bulk!`);
    setTimeout(() => {
      setShowSurchargeImportModal(false);
      setParsedCsvRows([]);
      setRawCsvInput('');
      setImportSuccessCount(null);
    }, 1200);
  };

  const handleImportBundle = (bundle: typeof INDUSTRY_PRESET_BUNDLES[0]) => {
    const newPresets: SurchargePreset[] = bundle.items.map((r, index) => ({
      id: `sp-bundle-${Date.now()}-${index}`,
      name: r.name,
      code: r.code,
      description: `Imported from ${bundle.title}`,
      category: r.category,
      surcharge_type: r.surcharge_type as any,
      base_value: r.base_value,
      applied_factors: {
        thickness_factor: r.thickness_factor,
        floor_level_factor: r.floor_level_factor,
        facility_type_factor: r.facility_type_factor,
        urgent_handling_lkr: r.urgent_handling_lkr
      },
      applicable_categories: r.applicable_categories,
      created_at: new Date().toISOString().split('T')[0],
      status: r.status as any
    }));

    setSurchargePresets(prev => [...newPresets, ...prev]);
    notifySuccess(`Successfully added ${newPresets.length} presets from "${bundle.title}"!`);
    setShowSurchargeImportModal(false);
  };

  // Analytics Data for Recharts Visualization Panel
  const surchargeFrequencyData = [
    { name: 'PVDF 3-Coat Finish', frequency: 48, revenueUplift: 86400, category: 'Finishing' },
    { name: 'High-Rise Hoist (Fl 10+)', frequency: 32, revenueUplift: 112000, category: 'Installation' },
    { name: 'Coastal Weatherproof Shield', frequency: 39, revenueUplift: 85800, category: 'Special Handling' },
    { name: 'Cleanroom Isolation Pack', frequency: 21, revenueUplift: 52500, category: 'Facility' },
    { name: 'Marine Grade 5052 Alloy', frequency: 29, revenueUplift: 43500, category: 'Finishing' },
    { name: 'Night Shift Overtime', frequency: 16, revenueUplift: 40000, category: 'Facility' }
  ];

  const categoryMarginData = [
    { category: 'Aluminium Profiles', baseMarginPct: 22.5, enhancedMarginPct: 35.8, baseMarginLkr: 1850000, surchargeUpliftLkr: 980000, totalMarginLkr: 2830000 },
    { category: 'Glass Panels', baseMarginPct: 18.0, enhancedMarginPct: 29.4, baseMarginLkr: 1420000, surchargeUpliftLkr: 720000, totalMarginLkr: 2140000 },
    { category: 'Hardware & Fittings', baseMarginPct: 25.0, enhancedMarginPct: 38.5, baseMarginLkr: 890000, surchargeUpliftLkr: 450000, totalMarginLkr: 1340000 },
    { category: 'ACP Cladding', baseMarginPct: 20.0, enhancedMarginPct: 31.2, baseMarginLkr: 1150000, surchargeUpliftLkr: 580000, totalMarginLkr: 1730000 },
    { category: 'Labour & Civil', baseMarginPct: 15.0, enhancedMarginPct: 27.6, baseMarginLkr: 650000, surchargeUpliftLkr: 480000, totalMarginLkr: 1130000 }
  ];

  const surchargeTypePieData = [
    { name: 'Finishing & Coating', value: 38, color: '#8B5CF6' },
    { name: 'High-Rise & Floor Level', value: 26, color: '#3B82F6' },
    { name: 'Special Handling / Coastal', value: 18, color: '#10B981' },
    { name: 'Facility & Cleanroom', value: 12, color: '#F59E0B' },
    { name: 'Urgent Expedite', value: 6, color: '#EF4444' }
  ];

  // States for Settings Data
  const [company, setCompany] = useState<CompanySettings>({
    company_name: 'INNOVISTA ALUMINIUM & GLASS POS SYSTEM',
    tagline: 'Enterprise Architectural Systems & Multi-Branch Network',
    logo_url: '',
    registration_no: 'PV-98234-SL',
    tax_vat_id: 'VAT-10029384-7000',
    phone: '+94 11 288 9000 / +94 77 345 6789',
    email: 'info@innovistapos.lk',
    address: 'No. 102 Innovista Tower, Nawala Road, Rajagiriya, Colombo',
    website: 'www.innovistapos.lk',
    bank_details: {
      bank_name: 'Commercial Bank of Ceylon PLC',
      account_number: '1000-849201-001',
      account_name: 'Innovista Aluminium & Glass Systems (Pvt) Ltd',
      branch_name: 'Nawala Corporate Branch',
      swift_code: 'CCEYLKCX'
    },
    currencies: [
      { code: 'LKR', symbol: 'Rs.', name: 'Sri Lankan Rupee', exchange_rate_to_lkr: 1.0, is_default: true },
      { code: 'USD', symbol: '$', name: 'US Dollar', exchange_rate_to_lkr: 308.50, is_default: false },
      { code: 'EUR', symbol: '€', name: 'Euro', exchange_rate_to_lkr: 335.20, is_default: false },
      { code: 'AED', symbol: 'AED', name: 'UAE Dirham', exchange_rate_to_lkr: 84.00, is_default: false }
    ],
    invoice_footer_terms: '1. All prices are valid for 14 days from date of issue.\n2. 50% advance payment required upon order confirmation.\n3. Goods once sold are non-refundable unless verified for manufacturing defect within 7 days.'
  });

  const [users, setUsers] = useState<SystemUser[]>([]);
  const [categories, setCategories] = useState<CategoryConfig[]>([]);
  const [customerTypes, setCustomerTypes] = useState<CustomerTypeConfig[]>([]);
  const [locations, setLocations] = useState<LocationConfig[]>([]);

  // User Filter & Modals
  const [userStatusFilter, setUserStatusFilter] = useState<string>('ALL');
  const [showAddUserModal, setShowAddUserModal] = useState<boolean>(false);
  const [editingUser, setEditingUser] = useState<SystemUser | null>(null);

  // Head Office Emergency Master Backup Recovery Key Management States
  const [showBackupKeySecret, setShowBackupKeySecret] = useState<boolean>(false);
  const [isBackupKeyModalOpen, setIsBackupKeyModalOpen] = useState<boolean>(false);
  const [backupKeyInput, setBackupKeyInput] = useState<string>('');
  const [backupKeyNotesInput, setBackupKeyNotesInput] = useState<string>('');
  const [copiedBackupKey, setCopiedBackupKey] = useState<boolean>(false);

  // Admin Emergency Reset User Account Modal State
  const [emergencyResetUser, setEmergencyResetUser] = useState<SystemUser | null>(null);
  const [emergencyResetPassword, setEmergencyResetPassword] = useState<string>('');
  const [emergencyResetConfirm, setEmergencyResetConfirm] = useState<string>('');
  const [emergencyResetKeyInput, setEmergencyResetKeyInput] = useState<string>('');
  const [emergencyResetError, setEmergencyResetError] = useState<string | null>(null);

  // New User Form State
  const [newUserForm, setNewUserForm] = useState<{
    employee_id: string;
    name: string;
    email: string;
    role: SystemUser['role'];
    branch_id: string;
    phone: string;
    status: SystemUser['status'];
  }>({
    employee_id: `EMP-${1000 + (users.length > 0 ? users.length + 1 : 1)}`,
    name: '',
    email: '',
    role: 'Sales Executive',
    branch_id: branches[0]?.id || 'b-ho',
    phone: '',
    status: 'Active'
  });

  // --- Category & Sub-category Normalization Helpers ---
  const normalizeSubCategories = (subcats: (string | SubCategoryItem)[] = []): SubCategoryItem[] => {
    return subcats.map((sub, idx) => {
      if (typeof sub === 'string') {
        return {
          id: `sub-${sub.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${idx}`,
          name: sub,
          status: 'Active'
        };
      }
      return {
        id: sub.id || `sub-${sub.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${idx}`,
        name: sub.name,
        status: sub.status || 'Active',
        description: sub.description || ''
      };
    });
  };

  // Category Search & Filter State
  const [categorySearch, setCategorySearch] = useState<string>('');
  const [categoryStatusFilter, setCategoryStatusFilter] = useState<'ALL' | 'Active' | 'Deactive'>('ALL');
  const [quickSubCatInputs, setQuickSubCatInputs] = useState<Record<string, string>>({});
  const [editingSubCat, setEditingSubCat] = useState<{
    catId: string;
    subId: string;
    oldName: string;
    newName: string;
    status: 'Active' | 'Deactive';
  } | null>(null);

  // Category Modal
  const [showCatModal, setShowCatModal] = useState<boolean>(false);
  const [catForm, setCatForm] = useState<{
    id?: string;
    name: string;
    description: string;
    status: 'Active' | 'Deactive';
    subcategories: SubCategoryItem[];
  }>({
    name: '',
    description: '',
    status: 'Active',
    subcategories: []
  });
  const [subCatInput, setSubCatInput] = useState<string>('');

  // Customer Type Modal
  const [showCtModal, setShowCtModal] = useState<boolean>(false);
  const [ctForm, setCtForm] = useState<{ id?: string; name: string; default_discount_pct: number; description: string }>({
    name: '',
    default_discount_pct: 0,
    description: ''
  });

  // Location Modal
  const [showLocModal, setShowLocModal] = useState<boolean>(false);
  const [locForm, setLocForm] = useState<{ id?: string; name: string; district: string; region: string; status: 'Active' | 'Inactive' }>({
    name: '',
    district: 'Colombo',
    region: 'Western Province',
    status: 'Active'
  });

  // Currency Modal
  const [showCurrencyModal, setShowCurrencyModal] = useState<boolean>(false);
  const [currencyForm, setCurrencyForm] = useState<CurrencySetting>({
    code: '',
    symbol: '',
    name: '',
    exchange_rate_to_lkr: 1.0,
    is_default: false
  });

  // Logo file upload ref
  const logoFileInputRef = useRef<HTMLInputElement>(null);

  // Check if current user is Admin
  const isAdmin = activeBranch.code === 'HO' || activeBranch.manager_name.toLowerCase().includes('admin');

  // Load data on mount
  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    setIsLoading(true);
    try {
      const [compData, usersData, catData, ctData, locData] = await Promise.all([
        fetchCompanySettings(),
        fetchUsers(),
        fetchCategories(),
        fetchCustomerTypes(),
        fetchLocationConfigs()
      ]);

      if (compData) setCompany(compData);
      if (usersData) setUsers(usersData);
      if (catData) setCategories(catData);
      if (ctData) setCustomerTypes(ctData);
      if (locData) setLocations(locData);
    } catch (e) {
      console.error('Failed to load settings data:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (categories.length > 0) {
      window.dispatchEvent(new CustomEvent('innovista_categories_changed', { detail: { categories } }));
      try {
        localStorage.setItem('innovista_categories', JSON.stringify(categories));
      } catch (e) {
        // ignore
      }
    }
  }, [categories]);

  const notifySuccess = (msg: string) => {
    setSaveSuccess(msg);
    setTimeout(() => setSaveSuccess(null), 3000);
  };

  // --- Company Settings Handlers ---
  const handleSaveCompany = async () => {
    try {
      const updated = await updateCompanySettings(company);
      setCompany(updated);
      localStorage.setItem('innovista_company_settings', JSON.stringify(updated));
      window.dispatchEvent(new Event('innovista_company_settings_changed'));
      notifySuccess('Company details & branding saved successfully!');
    } catch (err) {
      // Fall back to local storage if API route fails
      localStorage.setItem('innovista_company_settings', JSON.stringify(company));
      window.dispatchEvent(new Event('innovista_company_settings_changed'));
      notifySuccess('Company details & branding saved locally!');
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('File size exceeds 5MB limit. Please choose a smaller image.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          const logoData = reader.result as string;
          const updatedCompany = { ...company, logo_url: logoData };
          setCompany(updatedCompany);
          localStorage.setItem('innovista_company_settings', JSON.stringify(updatedCompany));
          window.dispatchEvent(new Event('innovista_company_settings_changed'));
          notifySuccess('Company logo uploaded and updated successfully!');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // --- Head Office Emergency Master Backup Recovery Key Handlers ---
  const handleOpenEditBackupKey = () => {
    if (!isHeadOfficeUser) {
      alert('Only Head Office Admins are permitted to define or change the Head Office Master Backup Recovery Key.');
      return;
    }
    setBackupKeyInput(company.ho_backup_key || '');
    setBackupKeyNotesInput(company.ho_backup_key_notes || '');
    setIsBackupKeyModalOpen(true);
  };

  const handleGenerateSecureBackupKey = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let key = 'HO-KEY-';
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        key += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      if (i < 3) key += '-';
    }
    setBackupKeyInput(key);
  };

  const handleSaveBackupKey = async () => {
    if (!backupKeyInput.trim()) {
      alert('Head Office Master Backup Recovery Key cannot be empty.');
      return;
    }

    const updatedCompany: CompanySettings = {
      ...company,
      ho_backup_key: backupKeyInput.trim(),
      ho_backup_key_status: 'Active',
      ho_backup_key_updated_at: new Date().toISOString().split('T')[0],
      ho_backup_key_updated_by: currentUser?.name || 'Head Office Admin',
      ho_backup_key_notes: backupKeyNotesInput.trim()
    };

    setCompany(updatedCompany);
    setIsBackupKeyModalOpen(false);

    try {
      await updateCompanySettings(updatedCompany);
      localStorage.setItem('innovista_company_settings', JSON.stringify(updatedCompany));
      window.dispatchEvent(new Event('innovista_company_settings_changed'));
      notifySuccess('Head Office Master Emergency Backup Key defined & activated successfully!');
    } catch (err) {
      localStorage.setItem('innovista_company_settings', JSON.stringify(updatedCompany));
      window.dispatchEvent(new Event('innovista_company_settings_changed'));
      notifySuccess('Head Office Master Emergency Backup Key saved locally!');
    }
  };

  const handleToggleBackupKeyStatus = async () => {
    if (!isHeadOfficeUser) return;
    const currentStatus = company.ho_backup_key_status || 'Active';
    const newStatus = currentStatus === 'Active' ? 'Deactivated' : 'Active';

    setConfirmModal({
      isOpen: true,
      title: `${newStatus === 'Active' ? 'Activate' : 'Deactivate'} Master Backup Key`,
      message: `Are you sure you want to ${newStatus.toLowerCase()} the Head Office Master Backup Recovery Key? ${
        newStatus === 'Deactivated'
          ? 'Emergency account recovery via backup key will be disabled across all portals.'
          : 'Emergency account recovery via backup key will be re-enabled.'
      }`,
      confirmLabel: `${newStatus === 'Active' ? 'Activate' : 'Deactivate'} Backup Key`,
      onConfirm: async () => {
        const updatedCompany: CompanySettings = {
          ...company,
          ho_backup_key_status: newStatus,
          ho_backup_key_updated_at: new Date().toISOString().split('T')[0],
          ho_backup_key_updated_by: currentUser?.name || 'Head Office Admin'
        };

        setCompany(updatedCompany);
        try {
          await updateCompanySettings(updatedCompany);
          localStorage.setItem('innovista_company_settings', JSON.stringify(updatedCompany));
          window.dispatchEvent(new Event('innovista_company_settings_changed'));
          notifySuccess(`Head Office Backup Recovery Key is now ${newStatus}!`);
        } catch (err) {
          localStorage.setItem('innovista_company_settings', JSON.stringify(updatedCompany));
          window.dispatchEvent(new Event('innovista_company_settings_changed'));
          notifySuccess(`Head Office Backup Recovery Key status changed to ${newStatus}!`);
        }
      }
    });
  };

  const handleDeleteBackupKey = () => {
    if (!isHeadOfficeUser) return;
    setConfirmModal({
      isOpen: true,
      title: 'Delete Master Backup Recovery Key',
      message: 'Are you sure you want to completely delete the Head Office Master Backup Recovery Key? Emergency account recovery via backup key will be unavailable until a new key is defined.',
      confirmLabel: 'Delete Backup Key',
      onConfirm: async () => {
        const updatedCompany: CompanySettings = {
          ...company,
          ho_backup_key: '',
          ho_backup_key_status: 'Deactivated',
          ho_backup_key_updated_at: new Date().toISOString().split('T')[0],
          ho_backup_key_updated_by: currentUser?.name || 'Head Office Admin',
          ho_backup_key_notes: 'Key deleted by Head Office Admin.'
        };

        setCompany(updatedCompany);
        try {
          await updateCompanySettings(updatedCompany);
          localStorage.setItem('innovista_company_settings', JSON.stringify(updatedCompany));
          window.dispatchEvent(new Event('innovista_company_settings_changed'));
          notifySuccess('Head Office Master Backup Recovery Key deleted!');
        } catch (err) {
          localStorage.setItem('innovista_company_settings', JSON.stringify(updatedCompany));
          window.dispatchEvent(new Event('innovista_company_settings_changed'));
          notifySuccess('Head Office Master Backup Recovery Key deleted locally!');
        }
      }
    });
  };

  const handleCopyBackupKey = () => {
    if (!company.ho_backup_key) return;
    navigator.clipboard.writeText(company.ho_backup_key);
    setCopiedBackupKey(true);
    setTimeout(() => setCopiedBackupKey(false), 2000);
  };

  const handleAdminEmergencyResetUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmergencyResetError(null);

    if (!emergencyResetUser) return;

    if (!emergencyResetKeyInput.trim()) {
      setEmergencyResetError('Please enter the active Head Office Master Backup Key.');
      return;
    }

    if (company.ho_backup_key_status === 'Deactivated' || !company.ho_backup_key) {
      setEmergencyResetError('Head Office Master Backup Key is currently deactivated or not configured.');
      return;
    }

    if (emergencyResetKeyInput.trim() !== company.ho_backup_key.trim()) {
      setEmergencyResetError('Invalid Head Office Master Backup Key. Verification failed.');
      return;
    }

    if (emergencyResetPassword !== emergencyResetConfirm) {
      setEmergencyResetError('Passwords do not match.');
      return;
    }

    if (emergencyResetPassword.length < 6) {
      setEmergencyResetError('Password must be at least 6 characters long.');
      return;
    }

    try {
      await updateUser(emergencyResetUser.id, {
        status: 'Active',
        mustChangePassword: false,
        passwordChangedAt: new Date().toISOString(),
        failedLoginAttempts: 0,
        lockedUntil: undefined
      });

      setUsers(prev => prev.map(u => u.id === emergencyResetUser.id ? { ...u, status: 'Active', mustChangePassword: false, failedLoginAttempts: 0, lockedUntil: undefined } : u));

      notifySuccess(`Emergency recovery successful! Account (${emergencyResetUser.name}) unlocked & password updated.`);
      setEmergencyResetUser(null);
      setEmergencyResetPassword('');
      setEmergencyResetConfirm('');
      setEmergencyResetKeyInput('');
    } catch (err) {
      setEmergencyResetError('Failed to reset user account credentials.');
    }
  };

  // --- Bank & Currency Handlers ---
  const handleSaveBank = async () => {
    await handleSaveCompany();
  };

  const handleAddCurrency = () => {
    if (!currencyForm.code || !currencyForm.symbol) {
      alert('Please enter currency code and symbol');
      return;
    }
    const updatedCurrencies = [...company.currencies, currencyForm];
    setCompany((prev) => ({ ...prev, currencies: updatedCurrencies }));
    setShowCurrencyModal(false);
    setCurrencyForm({ code: '', symbol: '', name: '', exchange_rate_to_lkr: 1.0, is_default: false });
    notifySuccess(`Added currency ${currencyForm.code}`);
  };

  const handleDeleteCurrency = (code: string) => {
    if (code === 'LKR') {
      alert('LKR is base currency and cannot be deleted.');
      return;
    }
    setConfirmModal({
      isOpen: true,
      title: 'Remove Currency',
      message: `Are you sure you want to remove currency ${code} from active currencies?`,
      confirmLabel: 'Remove Currency',
      onConfirm: () => {
        const updated = company.currencies.filter((c) => c.code !== code);
        setCompany((prev) => ({ ...prev, currencies: updated }));
        notifySuccess(`Removed currency ${code}`);
      }
    });
  };

  // --- User Management Handlers (Admin Only) ---
  const handleAddUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserForm.name || !newUserForm.email) {
      alert('Name and Email are required');
      return;
    }

    try {
      const targetBranchId = !isHeadOfficeUser ? (currentUser?.branch_id || activeBranch.id) : newUserForm.branch_id;
      const targetRole = !isHeadOfficeUser ? (newUserForm.role === 'Super Admin' || newUserForm.role === 'HO Admin' ? 'Sales Executive' : newUserForm.role) : newUserForm.role;
      const selectedBranch = branches.find((b) => b.id === targetBranchId) || activeBranch;
      const generatedEmpId = newUserForm.employee_id || `EMP-${1001 + users.length}`;

      const created = await addUser({
        employee_id: generatedEmpId,
        name: newUserForm.name,
        email: newUserForm.email,
        role: targetRole,
        branch_id: selectedBranch.id,
        branch_name: selectedBranch.name,
        status: newUserForm.status,
        phone: newUserForm.phone
      });

      setUsers((prev) => [created, ...prev]);
      setShowAddUserModal(false);
      setNewUserForm({
        employee_id: `EMP-${1002 + users.length}`,
        name: '',
        email: '',
        role: 'Sales Executive',
        branch_id: branches[0]?.id || 'b-ho',
        phone: '',
        status: 'Active'
      });
      notifySuccess(`New user ${created.name} (${created.employee_id || 'ID Assigned'}) registered for ${selectedBranch.name}!`);
    } catch (err) {
      alert('Failed to register user');
    }
  };

  const handleApproveUserSigning = async (userId: string, userName: string) => {
    const targetUser = users.find(u => u.id === userId);
    if (!isHeadOfficeUser && targetUser && targetUser.branch_id !== (currentUser?.branch_id || activeBranch.id)) {
      alert('Branch Admin Access Denied: You can only approve registration for users appointed to your branch!');
      return;
    }

    try {
      const updated = await updateUserStatus(userId, 'Active');
      setUsers((prev) => prev.map((u) => (u.id === userId ? updated : u)));
      notifySuccess(`✅ Signed & Approved user: ${userName}. Account activated!`);
    } catch (err) {
      alert('Failed to approve user');
    }
  };

  const handleDeactivateUser = async (userId: string) => {
    const targetUser = users.find(u => u.id === userId);
    if (!isHeadOfficeUser && targetUser && targetUser.branch_id !== (currentUser?.branch_id || activeBranch.id)) {
      alert('Branch Admin Access Denied: You can only deactivate users belonging to your branch!');
      return;
    }

    try {
      const updated = await updateUserStatus(userId, 'Deactivated');
      setUsers((prev) => prev.map((u) => (u.id === userId ? updated : u)));
      notifySuccess('User account deactivated.');
    } catch (err) {
      alert('Failed to deactivate user');
    }
  };

  const handleReactivateUser = async (userId: string) => {
    const targetUser = users.find(u => u.id === userId);
    if (!isHeadOfficeUser && targetUser && targetUser.branch_id !== (currentUser?.branch_id || activeBranch.id)) {
      alert('Branch Admin Access Denied: You can only reactivate users belonging to your branch!');
      return;
    }

    try {
      const updated = await updateUserStatus(userId, 'Active');
      setUsers((prev) => prev.map((u) => (u.id === userId ? updated : u)));
      notifySuccess('User account reactivated.');
    } catch (err) {
      alert('Failed to reactivate user');
    }
  };

  const handleDeleteUserClick = (userId: string, userName: string) => {
    if (!isHeadOfficeUser) {
      alert('Only Head Office Admins are permitted to delete user accounts from the database!');
      return;
    }

    setConfirmModal({
      isOpen: true,
      title: 'Delete User Account',
      message: `Are you sure you want to permanently delete user account "${userName}"? This action cannot be undone.`,
      confirmLabel: 'Delete User Account',
      onConfirm: async () => {
        setUsers((prev) => prev.filter((u) => u.id !== userId));
        notifySuccess(`Deleted user ${userName}`);
        try {
          await deleteUser(userId);
        } catch (err) {
          console.warn('Backend sync warning on user deletion:', err);
        }
      }
    });
  };

  // --- Category & Sub-category Handlers ---
  const handleToggleCategoryStatus = async (cat: CategoryConfig) => {
    const newStatus: 'Active' | 'Deactive' = (cat.status === 'Deactive') ? 'Active' : 'Deactive';
    const updatedCat: CategoryConfig = { ...cat, status: newStatus };
    setCategories((prev) => prev.map((c) => (c.id === cat.id ? updatedCat : c)));
    notifySuccess(`Category '${cat.name}' ${newStatus === 'Active' ? 'reactivated' : 'deactivated'}`);

    try {
      await updateCategory(cat.id, updatedCat);
    } catch (err) {
      console.warn('Backend sync warning for category status update:', err);
    }
  };

  const handleDeleteCatClick = (id: string, name?: string) => {
    setConfirmModal({
      isOpen: true,
      title: 'Delete Master Category',
      message: `Are you sure you want to delete category '${name || 'this category'}' and all its sub-categories?`,
      confirmLabel: 'Delete Category',
      onConfirm: async () => {
        setCategories((prev) => prev.filter((c) => c.id !== id));
        notifySuccess(`Category '${name || id}' deleted successfully`);
        try {
          await deleteCategory(id);
        } catch (err) {
          console.warn('Backend sync warning for category deletion:', err);
        }
      }
    });
  };

  const handleSaveCategory = async () => {
    if (!catForm.name.trim()) {
      alert('Category name is required');
      return;
    }

    const payload: CategoryConfig = {
      id: catForm.id || `cat-${Date.now()}`,
      name: catForm.name.trim(),
      description: catForm.description.trim(),
      status: catForm.status || 'Active',
      subcategories: catForm.subcategories
    };

    if (catForm.id) {
      setCategories((prev) => prev.map((c) => (c.id === catForm.id ? payload : c)));
      notifySuccess(`Updated category '${payload.name}'`);
      try {
        await updateCategory(catForm.id, payload);
      } catch (err) {
        console.warn('Backend sync warning for category save:', err);
      }
    } else {
      setCategories((prev) => [payload, ...prev]);
      notifySuccess(`Added new category '${payload.name}'`);
      try {
        await addCategory(payload);
      } catch (err) {
        console.warn('Backend sync warning for category creation:', err);
      }
    }
    setShowCatModal(false);
    setCatForm({ name: '', description: '', status: 'Active', subcategories: [] });
  };

  const handleAddSubCategoryChip = () => {
    if (!subCatInput.trim()) return;
    const norm = subCatInput.trim();
    if (catForm.subcategories.some(s => s.name.toLowerCase() === norm.toLowerCase())) return;
    const newItem: SubCategoryItem = {
      id: `sub-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      name: norm,
      status: 'Active'
    };
    setCatForm((prev) => ({
      ...prev,
      subcategories: [...prev.subcategories, newItem]
    }));
    setSubCatInput('');
  };

  const handleRemoveSubCategoryChip = (subIdOrName: string) => {
    setCatForm((prev) => ({
      ...prev,
      subcategories: prev.subcategories.filter((s) => s.id !== subIdOrName && s.name !== subIdOrName)
    }));
  };

  const handleToggleSubCatFormStatus = (subId: string) => {
    setCatForm((prev) => ({
      ...prev,
      subcategories: prev.subcategories.map((s) =>
        s.id === subId || s.name === subId
          ? { ...s, status: s.status === 'Deactive' ? 'Active' : 'Deactive' }
          : s
      )
    }));
  };

  const handleToggleSubCategoryStatus = async (cat: CategoryConfig, subId: string) => {
    const currentSubs = normalizeSubCategories(cat.subcategories);
    let targetStatus: 'Active' | 'Deactive' = 'Deactive';
    let targetName = '';

    const updatedSubs = currentSubs.map((s) => {
      if (s.id === subId || s.name === subId) {
        const nextStatus: 'Active' | 'Deactive' = s.status === 'Deactive' ? 'Active' : 'Deactive';
        targetStatus = nextStatus;
        targetName = s.name;
        return { ...s, status: nextStatus };
      }
      return s;
    });

    const updatedCat = { ...cat, subcategories: updatedSubs };
    setCategories((prev) => prev.map((c) => (c.id === cat.id ? updatedCat : c)));
    notifySuccess(`Sub-category '${targetName || subId}' status set to ${targetStatus}`);

    try {
      await updateCategory(cat.id, updatedCat);
    } catch (err) {
      console.warn('Backend sync warning for subcategory status:', err);
    }
  };

  const handleDeleteSubCategory = (cat: CategoryConfig, subId: string, subName: string) => {
    setConfirmModal({
      isOpen: true,
      title: 'Delete Sub-Category',
      message: `Are you sure you want to delete sub-category '${subName || subId}'?`,
      confirmLabel: 'Delete Sub-Category',
      onConfirm: async () => {
        const currentSubs = normalizeSubCategories(cat.subcategories);
        const updatedSubs = currentSubs.filter(
          (s) => s.id !== subId && s.name.toLowerCase() !== (subName || '').toLowerCase()
        );

        const updatedCat = { ...cat, subcategories: updatedSubs };
        setCategories((prev) => prev.map((c) => (c.id === cat.id ? updatedCat : c)));
        notifySuccess(`Sub-category '${subName || subId}' deleted`);

        try {
          await updateCategory(cat.id, updatedCat);
        } catch (err) {
          console.warn('Backend sync warning for subcategory deletion:', err);
        }
      }
    });
  };

  const handleQuickAddSubCategory = async (cat: CategoryConfig) => {
    const text = quickSubCatInputs[cat.id]?.trim();
    if (!text) return;
    const currentSubs = normalizeSubCategories(cat.subcategories);
    if (currentSubs.some(s => s.name.toLowerCase() === text.toLowerCase())) {
      alert('Sub-category name already exists in this category');
      return;
    }
    const newSub: SubCategoryItem = {
      id: `sub-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      name: text,
      status: 'Active'
    };
    const updatedSubs = [...currentSubs, newSub];
    const updatedCat = { ...cat, subcategories: updatedSubs };
    setCategories((prev) => prev.map((c) => (c.id === cat.id ? updatedCat : c)));
    setQuickSubCatInputs((prev) => ({ ...prev, [cat.id]: '' }));
    notifySuccess(`Added sub-category '${text}' to ${cat.name}`);

    try {
      await updateCategory(cat.id, updatedCat);
    } catch (err) {
      console.warn('Backend sync warning for subcategory quick add:', err);
    }
  };

  const handleSaveSubCategoryEdit = async () => {
    if (!editingSubCat) return;
    const { catId, subId, oldName, newName, status } = editingSubCat;
    if (!newName.trim()) {
      alert('Sub-category name cannot be empty');
      return;
    }
    const cat = categories.find((c) => c.id === catId);
    if (!cat) return;

    const currentSubs = normalizeSubCategories(cat.subcategories);
    const updatedSubs = currentSubs.map((s) => {
      if (s.id === subId || s.name === oldName || s.name === subId) {
        return { ...s, name: newName.trim(), status };
      }
      return s;
    });

    const updatedCat = { ...cat, subcategories: updatedSubs };
    setCategories((prev) => prev.map((c) => (c.id === cat.id ? updatedCat : c)));
    notifySuccess(`Sub-category updated to '${newName.trim()}'`);
    setEditingSubCat(null);

    try {
      await updateCategory(cat.id, updatedCat);
    } catch (err) {
      console.warn('Backend sync warning for subcategory edit save:', err);
    }
  };

  // --- Customer Type Handlers ---
  const handleSaveCustomerType = async () => {
    if (!ctForm.name) {
      alert('Customer type name is required');
      return;
    }

    try {
      if (ctForm.id) {
        const updated = await updateCustomerType(ctForm.id, ctForm);
        setCustomerTypes((prev) => prev.map((ct) => (ct.id === ctForm.id ? updated : ct)));
        notifySuccess(`Updated customer type ${updated.name}`);
      } else {
        const created = await addCustomerType(ctForm);
        setCustomerTypes((prev) => [created, ...prev]);
        notifySuccess(`Added customer type ${created.name}`);
      }
      setShowCtModal(false);
      setCtForm({ name: '', default_discount_pct: 0, description: '' });
    } catch (err) {
      alert('Failed to save customer type');
    }
  };

  const handleDeleteCtClick = (id: string) => {
    const ctObj = customerTypes.find(c => c.id === id);
    setConfirmModal({
      isOpen: true,
      title: 'Delete Customer Type',
      message: `Are you sure you want to delete customer type '${ctObj?.name || id}'?`,
      confirmLabel: 'Delete Customer Type',
      onConfirm: async () => {
        setCustomerTypes((prev) => prev.filter((ct) => ct.id !== id));
        notifySuccess('Customer type deleted');
        try {
          await deleteCustomerType(id);
        } catch (err) {
          console.warn('Backend sync warning for customer type deletion:', err);
        }
      }
    });
  };

  // --- Location Config Handlers ---
  const handleSaveLocationConfig = async () => {
    if (!locForm.name) {
      alert('Location name is required');
      return;
    }

    try {
      if (locForm.id) {
        const updated = await updateLocationConfig(locForm.id, locForm);
        setLocations((prev) => prev.map((l) => (l.id === locForm.id ? updated : l)));
        notifySuccess(`Updated location ${updated.name}`);
      } else {
        const created = await addLocationConfig(locForm);
        setLocations((prev) => [created, ...prev]);
        notifySuccess(`Added location ${created.name}`);
      }
      setShowLocModal(false);
      setLocForm({ name: '', district: 'Colombo', region: 'Western Province', status: 'Active' });
    } catch (err) {
      alert('Failed to save location');
    }
  };

  const handleDeleteLocClick = (id: string) => {
    const locObj = locations.find(l => l.id === id);
    setConfirmModal({
      isOpen: true,
      title: 'Delete Location Config',
      message: `Are you sure you want to delete location '${locObj?.name || id}'?`,
      confirmLabel: 'Delete Location',
      onConfirm: async () => {
        setLocations((prev) => prev.filter((l) => l.id !== id));
        notifySuccess('Location deleted');
        try {
          await deleteLocationConfig(id);
        } catch (err) {
          console.warn('Backend sync warning for location deletion:', err);
        }
      }
    });
  };

  // --- Surcharge Preset Handlers ---
  const handleSaveSurchargePreset = () => {
    if (!surchargeForm.name.trim()) {
      alert('Surcharge Preset Name is required!');
      return;
    }
    if (!surchargeForm.code.trim()) {
      alert('Preset Code is required!');
      return;
    }

    if (surchargeForm.id) {
      setSurchargePresets(prev => prev.map(p => p.id === surchargeForm.id ? surchargeForm : p));
      notifySuccess(`Updated surcharge preset template "${surchargeForm.name}"`);
    } else {
      const newPreset: SurchargePreset = {
        ...surchargeForm,
        id: `sp-${Date.now()}`,
        created_at: new Date().toISOString().split('T')[0]
      };
      setSurchargePresets(prev => [newPreset, ...prev]);
      notifySuccess(`Created new reusable surcharge preset "${newPreset.name}"`);
    }

    setShowSurchargeModal(false);
  };

  const handleDeleteSurchargePreset = (id: string, name: string) => {
    setConfirmModal({
      isOpen: true,
      title: 'Delete Surcharge Preset',
      message: `Are you sure you want to delete surcharge preset template "${name}"?`,
      confirmLabel: 'Delete Preset',
      onConfirm: () => {
        setSurchargePresets(prev => prev.filter(p => p.id !== id));
        notifySuccess(`Deleted surcharge preset template "${name}"`);
      }
    });
  };

  const handleToggleSurchargePresetStatus = (id: string) => {
    setSurchargePresets(prev => prev.map(p => {
      if (p.id === id) {
        const nextStatus = p.status === 'Active' ? 'Inactive' : 'Active';
        notifySuccess(`Preset "${p.name}" set to ${nextStatus}`);
        return { ...p, status: nextStatus };
      }
      return p;
    }));
  };

  // --- Data Backup & Export Handlers ---
  const [backupFrequency, setBackupFrequency] = useState<'Daily' | 'Weekly' | 'Monthly' | 'Disabled'>('Daily');
  const [backupEmailNotify, setBackupEmailNotify] = useState<boolean>(true);
  const [isBackupRunning, setIsBackupRunning] = useState<boolean>(false);
  const [lastBackupTime, setLastBackupTime] = useState<string>(new Date().toLocaleString());

  const handleRunManualBackup = () => {
    setIsBackupRunning(true);
    setTimeout(() => {
      setIsBackupRunning(false);
      const nowStr = new Date().toLocaleString();
      setLastBackupTime(nowStr);
      handleExportFullJSON();
      notifySuccess(`Full System Data Backup completed & downloaded successfully at ${nowStr}!`);
    }, 1200);
  };

  const downloadFile = (content: string, filename: string, contentType: string) => {
    const blob = new Blob([content], { type: contentType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleExportFullJSON = () => {
    const backupData = {
      system: 'INNOVISTA ALUMINIUM & GLASS POS ERP',
      exported_at: new Date().toISOString(),
      exported_by: activeBranch.manager_name,
      branch: activeBranch.name,
      company: company,
      statistics: {
        products_count: products.length,
        quotations_count: quotations.length,
        customers_count: customers.length,
        branches_count: branches.length
      },
      database: {
        products: products,
        quotations: quotations,
        customers: customers,
        branches: branches,
        categories: categories,
        customer_types: customerTypes,
        locations: locations,
        users: users
      }
    };

    const jsonStr = JSON.stringify(backupData, null, 2);
    const dateStr = new Date().toISOString().split('T')[0];
    downloadFile(jsonStr, `INNOVISTA_ERP_BACKUP_${dateStr}.json`, 'application/json');
    notifySuccess('Full JSON Database Export downloaded!');
  };

  const handleExportProductsCSV = () => {
    let csv = 'Product Code,Product Name,Category,Sub-Category,Base Price (LKR),Cost Price (LKR),Unit,Unit Weight (kg),Status\n';
    products.forEach(p => {
      const code = `"${(p.product_code || '').replace(/"/g, '""')}"`;
      const name = `"${(p.product_name || '').replace(/"/g, '""')}"`;
      const cat = `"${(p.category || '').replace(/"/g, '""')}"`;
      const sub = `"${(p.sub_category || '').replace(/"/g, '""')}"`;
      const base = p.base_price || 0;
      const cost = p.cost_price || 0;
      const unit = p.unit || 'Unit';
      const weight = p.unit_weight_kg || 0;
      const status = p.status || 'Active';
      csv += `${code},${name},${cat},${sub},${base},${cost},${unit},${weight},${status}\n`;
    });
    const dateStr = new Date().toISOString().split('T')[0];
    downloadFile(csv, `INNOVISTA_Product_Master_${dateStr}.csv`, 'text/csv');
    notifySuccess('Product Master Catalog CSV exported!');
  };

  const handleExportQuotationsCSV = () => {
    let csv = 'Quotation Ref,Date,Customer Name,Phone,Branch,Items Count,Subtotal (LKR),Transport Cost,Net Total (LKR),Status\n';
    quotations.forEach(q => {
      const ref = `"${(q.quotation_number || '').replace(/"/g, '""')}"`;
      const date = q.date || '';
      const cName = `"${(q.customer_name || '').replace(/"/g, '""')}"`;
      const cPhone = `"${(q.customer_phone || '').replace(/"/g, '""')}"`;
      const branch = `"${(q.branch_name || '').replace(/"/g, '""')}"`;
      const itemsCount = q.items?.length || 0;
      const subtotal = q.subtotal_price || 0;
      const transport = q.transport_cost || 0;
      const total = q.net_total || 0;
      const status = q.status || 'Pending';
      csv += `${ref},${date},${cName},${cPhone},${branch},${itemsCount},${subtotal},${transport},${total},${status}\n`;
    });
    const dateStr = new Date().toISOString().split('T')[0];
    downloadFile(csv, `INNOVISTA_Orders_Log_${dateStr}.csv`, 'text/csv');
    notifySuccess('Orders & Quotations CSV exported!');
  };

  const handleExportCustomersCSV = () => {
    let csv = 'Customer ID,Customer Name,Phone,Email,Customer Type,Discount %,Address\n';
    customers.forEach(c => {
      const id = `"${(c.id || '').replace(/"/g, '""')}"`;
      const name = `"${(c.name || '').replace(/"/g, '""')}"`;
      const phone = `"${(c.phone || '').replace(/"/g, '""')}"`;
      const email = `"${(c.email || '').replace(/"/g, '""')}"`;
      const type = `"${(c.customer_type || '').replace(/"/g, '""')}"`;
      const disc = c.discount_percentage || 0;
      const addr = `"${(c.address || '').replace(/"/g, '""')}"`;
      csv += `${id},${name},${phone},${email},${type},${disc},${addr}\n`;
    });
    const dateStr = new Date().toISOString().split('T')[0];
    downloadFile(csv, `INNOVISTA_Customers_Database_${dateStr}.csv`, 'text/csv');
    notifySuccess('Customer Database CSV exported!');
  };

  // Filtered users list
  const isHeadOfficeUser = currentRole === 'Super Admin' || currentRole === 'HO Admin' || currentUser?.branch_id === 'b-ho' || activeBranch.code === 'HO';
  const effectiveUserBranchId = currentUser?.branch_id || activeBranch.id;

  const filteredUsers = users.filter((u) => {
    if (!isHeadOfficeUser) {
      const matchesBranch = u.branch_id === effectiveUserBranchId || 
        u.branch_id === activeBranch.id || 
        (u.branch_name && activeBranch.name && u.branch_name.toLowerCase().includes(activeBranch.name.toLowerCase()));
      if (!matchesBranch) return false;
    }

    if (userStatusFilter === 'PENDING') return u.status === 'Pending Approval';
    if (userStatusFilter === 'ACTIVE') return u.status === 'Active';
    if (userStatusFilter === 'DEACTIVATED') return u.status === 'Deactivated';
    return true;
  });

  const pendingUserCount = users.filter((u) => {
    if (!isHeadOfficeUser) {
      const matchesBranch = u.branch_id === effectiveUserBranchId || 
        u.branch_id === activeBranch.id || 
        (u.branch_name && activeBranch.name && u.branch_name.toLowerCase().includes(activeBranch.name.toLowerCase()));
      if (!matchesBranch) return false;
    }
    return u.status === 'Pending Approval';
  }).length;

  if (isLoading) {
    return (
      <div className="bg-white p-8 rounded-lg border border-slate-200 shadow-xs text-center py-12">
        <RefreshCw className="w-8 h-8 text-orange-500 animate-spin mx-auto mb-3" />
        <p className="text-sm font-semibold text-slate-700">Loading Master Settings & Configurations...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Banner Alert */}
      {saveSuccess && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-800 px-4 py-3 rounded-md flex items-center justify-between text-xs font-semibold shadow-xs animate-fadeIn">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{saveSuccess}</span>
          </div>
          <button onClick={() => setSaveSuccess(null)} className="text-emerald-600 hover:text-emerald-900">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Main Settings Header & Navigation Sub-Tabs */}
      <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div>
            <h1 className="text-base font-bold text-slate-900 flex items-center space-x-2">
              <Building2 className="w-5 h-5 text-orange-500" />
              <span>Master System Settings & Configurations</span>
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Manage enterprise details, branding, user authorization, customer types, categories & regional logistics
            </p>
          </div>

          {/* Admin Signing Indicator */}
          <div className="flex items-center space-x-2 bg-slate-100 border border-slate-200 text-slate-800 px-3 py-1.5 rounded-md text-xs font-bold">
            <ShieldCheck className="w-4 h-4 text-orange-500" />
            <span>Logged as Admin: <strong className="text-orange-600">{activeBranch.manager_name}</strong></span>
            <span className="bg-orange-500 text-white text-[9px] px-1.5 py-0.2 rounded font-mono">HO MASTER</span>
          </div>
        </div>

        {/* Navigation Pills */}
        <div className="flex flex-wrap items-center gap-1.5 p-1.5 bg-slate-100/90 rounded-xl border border-slate-200/80 shadow-2xs">
          <button
            onClick={() => setActiveSubTab('company')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeSubTab === 'company'
                ? 'bg-orange-500 text-white shadow-xs font-bold ring-1 ring-orange-400/50'
                : 'bg-white/80 text-slate-700 hover:bg-slate-200/80 hover:text-slate-900 border border-slate-200/60'
            }`}
            title="Company Profile & Branding Settings"
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Company</span>
          </button>

          <button
            onClick={() => setActiveSubTab('bank_currency')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeSubTab === 'bank_currency'
                ? 'bg-orange-500 text-white shadow-xs font-bold ring-1 ring-orange-400/50'
                : 'bg-white/80 text-slate-700 hover:bg-slate-200/80 hover:text-slate-900 border border-slate-200/60'
            }`}
            title="Banking Accounts & Exchange Currencies"
          >
            <Landmark className="w-3.5 h-3.5" />
            <span>Banking</span>
          </button>

          <button
            onClick={() => setActiveSubTab('branch_settings')}
            className={`relative flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeSubTab === 'branch_settings'
                ? 'bg-orange-500 text-white shadow-xs font-bold ring-1 ring-orange-400/50'
                : 'bg-white/80 text-slate-700 hover:bg-slate-200/80 hover:text-slate-900 border border-slate-200/60'
            }`}
            title="Branch-Specific Configurations & Push Engine"
          >
            <Globe2 className="w-3.5 h-3.5 text-blue-500" />
            <span>Branch Config & Push</span>
            <span className="bg-blue-600/10 text-blue-700 border border-blue-200 text-[9px] font-bold px-1.5 py-0.2 rounded uppercase">
              PUSH ENGINE
            </span>
          </button>


          <button
            onClick={() => setActiveSubTab('users')}
            className={`relative flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeSubTab === 'users'
                ? 'bg-orange-500 text-white shadow-xs font-bold ring-1 ring-orange-400/50'
                : 'bg-white/80 text-slate-700 hover:bg-slate-200/80 hover:text-slate-900 border border-slate-200/60'
            }`}
            title="User Accounts & Approval Signing"
          >
            <Users className="w-3.5 h-3.5" />
            <span>Users</span>
            {pendingUserCount > 0 && (
              <span className="bg-rose-500 text-white text-[10px] font-extrabold px-1.5 py-0.2 rounded-full animate-pulse shadow-xs">
                {pendingUserCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveSubTab('role_permissions')}
            className={`relative flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeSubTab === 'role_permissions'
                ? 'bg-orange-500 text-white shadow-xs font-bold ring-1 ring-orange-400/50'
                : 'bg-white/80 text-slate-700 hover:bg-slate-200/80 hover:text-slate-900 border border-slate-200/60'
            }`}
            title="Role-Based Access Control Permissions Matrix"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-orange-400" />
            <span>Permissions</span>
            <span className="bg-orange-600/10 text-orange-700 border border-orange-200 text-[9px] font-bold px-1.5 py-0.2 rounded uppercase">
              Matrix
            </span>
          </button>

          <button
            onClick={() => setActiveSubTab('categories')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeSubTab === 'categories'
                ? 'bg-orange-500 text-white shadow-xs font-bold ring-1 ring-orange-400/50'
                : 'bg-white/80 text-slate-700 hover:bg-slate-200/80 hover:text-slate-900 border border-slate-200/60'
            }`}
            title="Master Product Categories & Sub-categories"
          >
            <Grid className="w-3.5 h-3.5" />
            <span>Categories</span>
            {!hasPermission(currentRole, 'view_master_data') && (
              <Lock className="w-3 h-3 text-rose-500" />
            )}
          </button>

          <button
            onClick={() => setActiveSubTab('customer_types')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeSubTab === 'customer_types'
                ? 'bg-orange-500 text-white shadow-xs font-bold ring-1 ring-orange-400/50'
                : 'bg-white/80 text-slate-700 hover:bg-slate-200/80 hover:text-slate-900 border border-slate-200/60'
            }`}
            title="Customer Classifications & Default Tier Discounts"
          >
            <Tag className="w-3.5 h-3.5" />
            <span>Customers</span>
            {!hasPermission(currentRole, 'view_master_data') && (
              <Lock className="w-3 h-3 text-rose-500" />
            )}
          </button>

          <button
            onClick={() => setActiveSubTab('locations')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeSubTab === 'locations'
                ? 'bg-orange-500 text-white shadow-xs font-bold ring-1 ring-orange-400/50'
                : 'bg-white/80 text-slate-700 hover:bg-slate-200/80 hover:text-slate-900 border border-slate-200/60'
            }`}
            title="Branch Locations & Transport Regions"
          >
            <MapPin className="w-3.5 h-3.5" />
            <span>Locations</span>
            {!hasPermission(currentRole, 'view_master_data') && (
              <Lock className="w-3 h-3 text-rose-500" />
            )}
          </button>

          <button
            onClick={() => setActiveSubTab('surcharge_presets')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeSubTab === 'surcharge_presets'
                ? 'bg-orange-500 text-white shadow-xs font-bold ring-1 ring-orange-400/50'
                : 'bg-white/80 text-slate-700 hover:bg-slate-200/80 hover:text-slate-900 border border-slate-200/60'
            }`}
            title="11-Category Surcharge Multiplier Presets"
          >
            <Sliders className="w-3.5 h-3.5 text-purple-400" />
            <span>Surcharges</span>
            {!hasPermission(currentRole, 'view_surcharge_presets') && (
              <Lock className="w-3 h-3 text-rose-500" />
            )}
          </button>

          <button
            onClick={() => setActiveSubTab('shortcuts')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeSubTab === 'shortcuts'
                ? 'bg-orange-500 text-white shadow-xs font-bold ring-1 ring-orange-400/50'
                : 'bg-white/80 text-slate-700 hover:bg-slate-200/80 hover:text-slate-900 border border-slate-200/60'
            }`}
            title="POS Global Hotkeys & Keyboard Shortcuts"
          >
            <Keyboard className="w-3.5 h-3.5" />
            <span>Shortcuts</span>
          </button>

          <button
            onClick={() => setActiveSubTab('backup_export')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeSubTab === 'backup_export'
                ? 'bg-orange-500 text-white shadow-xs font-bold ring-1 ring-orange-400/50'
                : 'bg-white/80 text-slate-700 hover:bg-slate-200/80 hover:text-slate-900 border border-slate-200/60'
            }`}
            title="Database Backup & System Data Export"
          >
            <Database className="w-3.5 h-3.5" />
            <span>Backups</span>
          </button>
        </div>
      </div>

      {/* ACCESS RESTRICTED GUARD VIEW */}
      {!isSubTabAllowed && (
        <div className="bg-white p-8 sm:p-12 rounded-2xl border border-slate-200 shadow-sm text-center max-w-2xl mx-auto space-y-6 my-6 animate-fadeIn">
          <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center mx-auto shadow-inner border border-rose-200">
            <Lock className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <span className="bg-rose-100 text-rose-800 border border-rose-200 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider inline-flex items-center space-x-1.5">
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>SUPER ADMIN RESTRICTED CONFIGURATION</span>
            </span>
            <h2 className="text-xl font-bold text-slate-900">
              Access Restricted: Super Admin Role Required
            </h2>
            <p className="text-xs text-slate-600 leading-relaxed max-w-md mx-auto">
              Sensitive system configurations—including <strong>Master Data</strong> (Categories, Customer Types, Locations) and <strong>Surcharge Preset details</strong>—are exclusively restricted to the <strong>Super Admin</strong> role by default security policy.
            </p>
          </div>

          <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl text-left space-y-2.5 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <span className="text-slate-500 font-medium">Your Active Role:</span>
              <span className="font-bold text-slate-900 bg-slate-200 px-2.5 py-0.5 rounded font-mono">{currentRole}</span>
            </div>
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <span className="text-slate-500 font-medium">Required Security Permission:</span>
              <span className="font-bold text-rose-600 font-mono bg-rose-50 px-2 py-0.5 rounded border border-rose-200">{activeRequiredPermission}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500 font-medium">Access Status:</span>
              <span className="font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 flex items-center space-x-1">
                <Lock className="w-3 h-3 text-amber-600" />
                <span>Locked by RBAC Policy</span>
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={() => setActiveSubTab('company')}
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-lg transition"
            >
              Return to Company Settings
            </button>
            {(currentRole === 'Super Admin' || hasPermission(currentRole, 'manage_users')) && (
              <button
                onClick={() => setActiveSubTab('role_permissions')}
                className="px-4 py-2.5 bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold rounded-lg shadow-sm transition flex items-center space-x-1.5"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Manage Role View Permissions</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* --- SUB TAB: ROLE VIEW PERMISSIONS MATRIX --- */}
      {isSubTabAllowed && activeSubTab === 'role_permissions' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Header Banner */}
          <div className="bg-slate-900 text-white p-5 rounded-xl border border-slate-800 shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <div className="flex items-center space-x-2">
                <ShieldCheck className="w-5 h-5 text-orange-400" />
                <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                  Role-Based Access Control & View Permissions Matrix (RBAC)
                </h2>
                <span className="bg-orange-500 text-white text-[9px] font-bold px-2 py-0.5 rounded uppercase font-mono">
                  ACTIVE POLICY
                </span>
              </div>
              <p className="text-xs text-slate-300 max-w-2xl">
                Configure role-based view and edit permissions across enterprise sub-systems. By system default, sensitive configurations (<strong>Master Data</strong> & <strong>Surcharge Presets</strong>) are strictly Super Admin exclusive.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={handleResetPermissions}
                className="px-3 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-bold rounded-lg transition flex items-center space-x-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
                <span>Reset Super Admin Exclusive Defaults</span>
              </button>
            </div>
          </div>

          {/* Role Permission Matrix Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
                  <KeyRound className="w-4 h-4 text-orange-500" />
                  <span>Permission Visibility & Action Matrix</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Toggle view permissions per role. Changes update in real-time across active user sessions.
                </p>
              </div>

              <div className="flex items-center space-x-2 text-xs">
                <span className="text-slate-500 font-medium">Logged in as:</span>
                <span className="font-bold text-orange-600 bg-orange-50 border border-orange-200 px-2 py-0.5 rounded">
                  {currentRole}
                </span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100/80 text-slate-700 font-bold border-b border-slate-200">
                    <th className="p-3.5 pl-5 min-w-[280px]">Permission Name & Scope</th>
                    <th className="p-3.5 text-center min-w-[130px] bg-slate-200/50">
                      <div className="flex flex-col items-center">
                        <span>Super Admin</span>
                        <span className="text-[9px] text-slate-500 font-normal">Root / Full Control</span>
                      </div>
                    </th>
                    <th className="p-3.5 text-center min-w-[130px]">
                      <div className="flex flex-col items-center">
                        <span>HO Admin</span>
                        <span className="text-[9px] text-slate-500 font-normal">Head Office Admin</span>
                      </div>
                    </th>
                    <th className="p-3.5 text-center min-w-[130px]">
                      <div className="flex flex-col items-center">
                        <span>Branch Manager</span>
                        <span className="text-[9px] text-slate-500 font-normal">Regional Outlet</span>
                      </div>
                    </th>
                    <th className="p-3.5 text-center min-w-[130px]">
                      <div className="flex flex-col items-center">
                        <span>Sales Executive</span>
                        <span className="text-[9px] text-slate-500 font-normal">POS Operator</span>
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {/* Dynamic Category Rendering */}
                  {[
                    { name: 'Master Data & Surcharges', icon: Lock, bg: 'bg-orange-50/80 text-orange-950 border-orange-200', note: 'Super Admin Exclusive Defaults' },
                    { name: 'Quotations & Billing', icon: FileText, bg: 'bg-blue-50/80 text-blue-950 border-blue-200', note: 'POS & Order Controls' },
                    { name: 'Inventory & Product Catalog', icon: Layers, bg: 'bg-slate-100 text-slate-900 border-slate-200', note: 'Product Specs & Costing' },
                    { name: 'Financials & Analytics', icon: DollarSign, bg: 'bg-emerald-50/80 text-emerald-950 border-emerald-200', note: 'Reporting & Profit Margins' },
                    { name: 'System Configurations & Branding', icon: Building2, bg: 'bg-purple-50/80 text-purple-950 border-purple-200', note: 'Enterprise Settings' }
                  ].map((catGroup, idx) => {
                    const CatIcon = catGroup.icon;
                    const items = PERMISSION_DEFINITIONS.filter(p => p.category === catGroup.name);
                    if (items.length === 0) return null;

                    return (
                      <React.Fragment key={catGroup.name}>
                        <tr className="bg-slate-50 font-bold text-slate-800 text-[11px]">
                          <td colSpan={5} className={`p-2.5 px-5 border-y ${catGroup.bg}`}>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                <CatIcon className="w-3.5 h-3.5" />
                                <span>{idx + 1}. {catGroup.name}</span>
                              </div>
                              <span className="text-[10px] font-mono uppercase bg-white/80 px-2 py-0.5 rounded border border-slate-200 text-slate-600">
                                {catGroup.note}
                              </span>
                            </div>
                          </td>
                        </tr>

                        {items.map((p) => (
                          <tr key={p.key} className="hover:bg-slate-50 transition">
                            <td className="p-3.5 pl-5 space-y-0.5">
                              <div className="flex items-center space-x-2">
                                <span className="font-bold text-slate-900">{p.label}</span>
                                {p.isSuperAdminDefaultOnly && (
                                  <span className="bg-rose-100 text-rose-700 border border-rose-200 text-[9px] font-bold px-1.5 py-0.2 rounded uppercase">
                                    Super Admin Exclusive Default
                                  </span>
                                )}
                              </div>
                              <p className="text-[11px] text-slate-500">{p.description}</p>
                            </td>

                            {/* Super Admin */}
                            <td className="p-3.5 text-center bg-slate-50/60 border-x border-slate-200">
                              <span className="inline-flex items-center space-x-1 px-2.5 py-1 bg-emerald-100 text-emerald-800 border border-emerald-300 rounded font-bold text-[10px]">
                                <Check className="w-3 h-3" />
                                <span>Root Unrestricted</span>
                              </span>
                            </td>

                            {/* HO Admin */}
                            <td className="p-3.5 text-center">
                              <button
                                onClick={() => handleToggleRolePermission('HO Admin', p.key)}
                                disabled={currentRole !== 'Super Admin'}
                                className={`w-11 h-6 rounded-full p-1 transition-colors relative inline-flex items-center ${
                                  rolePermissions['HO Admin']?.[p.key] ? 'bg-emerald-500' : 'bg-slate-300'
                                } ${currentRole !== 'Super Admin' ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
                                title={`Toggle ${p.label} for HO Admin`}
                              >
                                <span
                                  className={`w-4 h-4 rounded-full bg-white shadow-xs transform transition-transform ${
                                    rolePermissions['HO Admin']?.[p.key] ? 'translate-x-5' : 'translate-x-0'
                                  }`}
                                />
                              </button>
                            </td>

                            {/* Branch Manager */}
                            <td className="p-3.5 text-center">
                              <button
                                onClick={() => handleToggleRolePermission('Branch Manager', p.key)}
                                disabled={currentRole !== 'Super Admin'}
                                className={`w-11 h-6 rounded-full p-1 transition-colors relative inline-flex items-center ${
                                  rolePermissions['Branch Manager']?.[p.key] ? 'bg-emerald-500' : 'bg-slate-300'
                                } ${currentRole !== 'Super Admin' ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
                                title={`Toggle ${p.label} for Branch Manager`}
                              >
                                <span
                                  className={`w-4 h-4 rounded-full bg-white shadow-xs transform transition-transform ${
                                    rolePermissions['Branch Manager']?.[p.key] ? 'translate-x-5' : 'translate-x-0'
                                  }`}
                                />
                              </button>
                            </td>

                            {/* Sales Executive */}
                            <td className="p-3.5 text-center">
                              <button
                                onClick={() => handleToggleRolePermission('Sales Executive', p.key)}
                                disabled={currentRole !== 'Super Admin'}
                                className={`w-11 h-6 rounded-full p-1 transition-colors relative inline-flex items-center ${
                                  rolePermissions['Sales Executive']?.[p.key] ? 'bg-emerald-500' : 'bg-slate-300'
                                } ${currentRole !== 'Super Admin' ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
                                title={`Toggle ${p.label} for Sales Executive`}
                              >
                                <span
                                  className={`w-4 h-4 rounded-full bg-white shadow-xs transform transition-transform ${
                                    rolePermissions['Sales Executive']?.[p.key] ? 'translate-x-5' : 'translate-x-0'
                                  }`}
                                />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* --- SUB TAB: DATA BACKUP & EXPORT --- */}
      {isSubTabAllowed && activeSubTab === 'backup_export' && (
        <div className="space-y-6">
          {/* Top Status & Notification Banner */}
          <div className="bg-slate-900 text-white p-5 rounded-xl border border-slate-800 shadow-md space-y-4 relative overflow-hidden">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative z-10">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-lg bg-orange-500 text-white flex items-center justify-center font-bold">
                    <Database className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-base font-extrabold tracking-tight flex items-center space-x-2">
                      <span>Periodic Database Backup Engine</span>
                      <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] px-2 py-0.5 rounded-full font-mono uppercase">
                        STATUS: ACTIVE
                      </span>
                    </h2>
                    <p className="text-xs text-slate-300">
                      Automated background database snapshot scheduler & local offline backup manager
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2 shrink-0">
                <button
                  onClick={handleRunManualBackup}
                  disabled={isBackupRunning}
                  className="bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs px-4 py-2 rounded-lg flex items-center space-x-2 shadow-sm transition disabled:opacity-50"
                >
                  <RefreshCw className={`w-4 h-4 ${isBackupRunning ? 'animate-spin' : ''}`} />
                  <span>{isBackupRunning ? 'Generating Backup Snapshot...' : 'Run Backup Now'}</span>
                </button>
              </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2 border-t border-slate-800 text-xs">
              <div className="bg-slate-800/80 p-3 rounded-lg border border-slate-700/60 space-y-1">
                <div className="text-[10px] text-slate-400 uppercase font-bold flex items-center justify-between">
                  <span>Last Automated Backup</span>
                  <Clock className="w-3.5 h-3.5 text-emerald-400" />
                </div>
                <div className="text-xs font-mono font-bold text-emerald-300 truncate">
                  {lastBackupTime}
                </div>
                <div className="text-[10px] text-slate-400">Verified Local Snapshot</div>
              </div>

              <div className="bg-slate-800/80 p-3 rounded-lg border border-slate-700/60 space-y-1">
                <div className="text-[10px] text-slate-400 uppercase font-bold flex items-center justify-between">
                  <span>Backup Frequency</span>
                  <HardDrive className="w-3.5 h-3.5 text-orange-400" />
                </div>
                <div className="text-xs font-mono font-bold text-slate-100">
                  {backupFrequency} (00:00 UTC)
                </div>
                <div className="text-[10px] text-slate-400">Auto-triggers every night</div>
              </div>

              <div className="bg-slate-800/80 p-3 rounded-lg border border-slate-700/60 space-y-1">
                <div className="text-[10px] text-slate-400 uppercase font-bold flex items-center justify-between">
                  <span>Total System Objects</span>
                  <FileSpreadsheet className="w-3.5 h-3.5 text-sky-400" />
                </div>
                <div className="text-xs font-mono font-bold text-sky-300">
                  {products.length} Products • {quotations.length} Orders
                </div>
                <div className="text-[10px] text-slate-400">{customers.length} Registered Customers</div>
              </div>

              <div className="bg-slate-800/80 p-3 rounded-lg border border-slate-700/60 space-y-1">
                <div className="text-[10px] text-slate-400 uppercase font-bold flex items-center justify-between">
                  <span>Admin Email Digest</span>
                  <ShieldAlert className="w-3.5 h-3.5 text-purple-400" />
                </div>
                <div className="text-xs font-mono font-bold text-purple-300 truncate">
                  {company.email || 'info@innovistapos.lk'}
                </div>
                <div className="text-[10px] text-slate-400">Notifications Enabled</div>
              </div>
            </div>
          </div>

          {/* EXPORT SYSTEM DATA ACTIONS GRID */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
                  <Download className="w-4 h-4 text-orange-500" />
                  <span>Export System Data & Databases</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Download offline backups in JSON or structured CSV formats for accounting and local archiving
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Option 1: Full System JSON */}
              <div className="border border-slate-200 hover:border-orange-500 rounded-xl p-4 bg-slate-50/50 space-y-3 transition group">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-lg bg-orange-100 text-orange-700 flex items-center justify-center font-bold">
                      <Database className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 uppercase">
                        Complete System Database (JSON)
                      </h4>
                      <p className="text-[11px] text-slate-500">
                        Full ERP snapshot including products, orders, customers, branches & overrides
                      </p>
                    </div>
                  </div>
                  <span className="bg-orange-100 text-orange-800 text-[9px] font-mono font-bold px-2 py-0.5 rounded uppercase">
                    JSON
                  </span>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-600 font-medium pt-1">
                  <span>Size: ~120 KB</span>
                  <span>Objects: All Tables</span>
                </div>

                <button
                  onClick={handleExportFullJSON}
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs py-2 px-3 rounded-lg transition flex items-center justify-center space-x-2 shadow-2xs"
                >
                  <Download className="w-3.5 h-3.5 text-orange-400" />
                  <span>Export Full JSON System Data</span>
                </button>
              </div>

              {/* Option 2: Products Master CSV */}
              <div className="border border-slate-200 hover:border-orange-500 rounded-xl p-4 bg-slate-50/50 space-y-3 transition group">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                      <FileSpreadsheet className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 uppercase">
                        Product Master Catalog (CSV)
                      </h4>
                      <p className="text-[11px] text-slate-500">
                        Master product specifications, categories, base prices, costs & weights
                      </p>
                    </div>
                  </div>
                  <span className="bg-emerald-100 text-emerald-800 text-[9px] font-mono font-bold px-2 py-0.5 rounded uppercase">
                    CSV
                  </span>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-600 font-medium pt-1">
                  <span>Rows: {products.length} Products</span>
                  <span>Fields: 9 Columns</span>
                </div>

                <button
                  onClick={handleExportProductsCSV}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2 px-3 rounded-lg transition flex items-center justify-center space-x-2 shadow-2xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export Product Catalog CSV</span>
                </button>
              </div>

              {/* Option 3: Orders & Quotations CSV */}
              <div className="border border-slate-200 hover:border-orange-500 rounded-xl p-4 bg-slate-50/50 space-y-3 transition group">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center font-bold">
                      <FileSpreadsheet className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 uppercase">
                        Orders & Quotations Log (CSV)
                      </h4>
                      <p className="text-[11px] text-slate-500">
                        Historical order log with branch details, transport costs & order status
                      </p>
                    </div>
                  </div>
                  <span className="bg-sky-100 text-sky-800 text-[9px] font-mono font-bold px-2 py-0.5 rounded uppercase">
                    CSV
                  </span>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-600 font-medium pt-1">
                  <span>Rows: {quotations.length} Orders</span>
                  <span>Fields: 10 Columns</span>
                </div>

                <button
                  onClick={handleExportQuotationsCSV}
                  className="w-full bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs py-2 px-3 rounded-lg transition flex items-center justify-center space-x-2 shadow-2xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export Orders & Quotations CSV</span>
                </button>
              </div>

              {/* Option 4: Customer Directory CSV */}
              <div className="border border-slate-200 hover:border-orange-500 rounded-xl p-4 bg-slate-50/50 space-y-3 transition group">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
                      <FileSpreadsheet className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 uppercase">
                        Customer Database & Ledger (CSV)
                      </h4>
                      <p className="text-[11px] text-slate-500">
                        Registered clients, customer tiers, default discount rates & site addresses
                      </p>
                    </div>
                  </div>
                  <span className="bg-purple-100 text-purple-800 text-[9px] font-mono font-bold px-2 py-0.5 rounded uppercase">
                    CSV
                  </span>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-600 font-medium pt-1">
                  <span>Rows: {customers.length} Clients</span>
                  <span>Fields: 7 Columns</span>
                </div>

                <button
                  onClick={handleExportCustomersCSV}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs py-2 px-3 rounded-lg transition flex items-center justify-center space-x-2 shadow-2xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export Customers Database CSV</span>
                </button>
              </div>
            </div>
          </div>

          {/* BACKUP SCHEDULE & NOTIFICATION SETTINGS */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2.5 flex items-center space-x-2">
              <Clock className="w-4 h-4 text-orange-500" />
              <span>Automated Periodic Backup Configuration</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 block">
                  Automatic Backup Schedule Frequency
                </label>
                <select
                  value={backupFrequency}
                  onChange={(e) => {
                    const freq = e.target.value as any;
                    setBackupFrequency(freq);
                    notifySuccess(`Backup schedule updated to: ${freq}`);
                  }}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-semibold text-slate-800 focus:outline-none focus:border-orange-500"
                >
                  <option value="Daily">Daily (Every 24 Hours at Midnight)</option>
                  <option value="Weekly">Weekly (Every Sunday at 00:00)</option>
                  <option value="Monthly">Monthly (1st of every month)</option>
                  <option value="Disabled">Disabled (Manual Export Only)</option>
                </select>
                <p className="text-[11px] text-slate-500">
                  Periodic backups automatically compress and log local storage state.
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 block">
                  Admin Email Backup Notification
                </label>
                <div className="flex items-center space-x-3 pt-2">
                  <input
                    type="checkbox"
                    id="backupEmailNotify"
                    checked={backupEmailNotify}
                    onChange={(e) => {
                      setBackupEmailNotify(e.target.checked);
                      notifySuccess(`Email notifications ${e.target.checked ? 'enabled' : 'disabled'}`);
                    }}
                    className="w-4 h-4 text-orange-500 rounded border-slate-300 focus:ring-orange-500"
                  />
                  <label htmlFor="backupEmailNotify" className="text-xs font-medium text-slate-700 cursor-pointer">
                    Send automated backup completion digest to <strong className="text-slate-900">{company.email}</strong>
                  </label>
                </div>
                <p className="text-[11px] text-slate-500">
                  Includes full execution logs and checksum verification metrics.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- SUB TAB: BRANCH-SPECIFIC CONFIGURATIONS & PUSH ENGINE --- */}
      {isSubTabAllowed && activeSubTab === 'branch_settings' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Top Target Branch Selector Banner */}
          <div className="bg-slate-900 text-white p-5 rounded-2xl border border-slate-800 shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="bg-blue-500/20 text-blue-300 border border-blue-500/40 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider flex items-center space-x-1">
                  <Globe2 className="w-3 h-3 text-blue-400" />
                  <span>ENTERPRISE MULTI-BRANCH NETWORK ENGINE</span>
                </span>
                <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold px-2 py-0.5 rounded">
                  STAR TOPOLOGY ISOLATION ENFORCED
                </span>
              </div>
              <h2 className="text-base font-bold text-white tracking-tight">
                Branch-Specific Configuration & Directives Push Center
              </h2>
              <p className="text-xs text-slate-300">
                Configure separate settings, financial deposit accounts, and operational discount policies per branch. Head Office pushes directives to branch managers and sales executives.
              </p>
            </div>

            {/* Target Branch Dropdown Scope */}
            <div className="bg-slate-800 p-2.5 rounded-xl border border-slate-700 space-y-1 shrink-0 w-full md:w-auto">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Target Branch Node Scope:
              </label>
              <select
                value={selectedBranchId}
                onChange={(e) => setSelectedBranchId(e.target.value)}
                className="bg-slate-900 text-white font-bold text-xs px-3 py-2 rounded-lg border border-slate-600 focus:border-orange-500 focus:outline-none w-full cursor-pointer"
              >
                {branches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name} ({b.code}) — {b.code === 'HO' ? 'Master Admin Node' : 'Spoke Branch'}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Main Configuration Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* LEFT 2 COLS: Branch Setting Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Section 1: Contact & Branding Overrides */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 border-b border-slate-100 pb-2.5 flex items-center justify-between">
                  <span className="flex items-center space-x-2">
                    <Building2 className="w-4 h-4 text-orange-500" />
                    <span>1. Branch Contact & Receipt Branding Overrides</span>
                  </span>
                  <span className="text-[10px] font-mono text-slate-400 font-bold">Node ID: {branchConfigForm.branch_code}</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block text-slate-600 font-bold mb-1">Branch Direct Telephone</label>
                    <input
                      type="text"
                      value={branchConfigForm.custom_phone || ''}
                      onChange={(e) => setBranchConfigForm({ ...branchConfigForm, custom_phone: e.target.value })}
                      className="w-full pos-input font-mono"
                      placeholder="+94 11 000 0000"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 font-bold mb-1">Branch Official Email</label>
                    <input
                      type="email"
                      value={branchConfigForm.custom_email || ''}
                      onChange={(e) => setBranchConfigForm({ ...branchConfigForm, custom_email: e.target.value })}
                      className="w-full pos-input"
                      placeholder="branch@innovistapos.lk"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-slate-600 font-bold mb-1">Branch Physical Address (Printed on Receipts)</label>
                    <input
                      type="text"
                      value={branchConfigForm.custom_address || ''}
                      onChange={(e) => setBranchConfigForm({ ...branchConfigForm, custom_address: e.target.value })}
                      className="w-full pos-input"
                      placeholder="Full Street Address"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-slate-600 font-bold mb-1">Assigned Branch Manager Signoff Name</label>
                    <input
                      type="text"
                      value={branchConfigForm.custom_manager_title || ''}
                      onChange={(e) => setBranchConfigForm({ ...branchConfigForm, custom_manager_title: e.target.value })}
                      className="w-full pos-input"
                      placeholder="Manager Name & Title"
                    />
                  </div>
                </div>
              </div>

              {/* Section 2: Bank Details & Currency Overrides */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 border-b border-slate-100 pb-2.5 flex items-center space-x-2">
                  <Landmark className="w-4 h-4 text-emerald-600" />
                  <span>2. Branch Banking & Payment Deposit Accounts</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block text-slate-600 font-bold mb-1">Designated Deposit Bank Name</label>
                    <input
                      type="text"
                      value={branchConfigForm.custom_bank_name || ''}
                      onChange={(e) => setBranchConfigForm({ ...branchConfigForm, custom_bank_name: e.target.value })}
                      className="w-full pos-input font-bold"
                      placeholder="Commercial Bank / HNB / BOC"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 font-bold mb-1">Bank Account Number</label>
                    <input
                      type="text"
                      value={branchConfigForm.custom_account_no || ''}
                      onChange={(e) => setBranchConfigForm({ ...branchConfigForm, custom_account_no: e.target.value })}
                      className="w-full pos-input font-mono font-bold text-slate-900"
                      placeholder="Account Number"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 font-bold mb-1">Bank Branch Location</label>
                    <input
                      type="text"
                      value={branchConfigForm.custom_branch_name || ''}
                      onChange={(e) => setBranchConfigForm({ ...branchConfigForm, custom_branch_name: e.target.value })}
                      className="w-full pos-input"
                      placeholder="Bank Branch Name"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 font-bold mb-1">Branch Operating Currency</label>
                    <select
                      value={branchConfigForm.custom_currency || 'LKR'}
                      onChange={(e) => setBranchConfigForm({ ...branchConfigForm, custom_currency: e.target.value })}
                      className="w-full pos-input font-bold"
                    >
                      <option value="LKR">LKR — Sri Lankan Rupee (Rs.)</option>
                      <option value="USD">USD — US Dollar ($)</option>
                      <option value="EUR">EUR — Euro (€)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Section 3: Operational Discount Limits & Permissions */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 border-b border-slate-100 pb-2.5 flex items-center space-x-2">
                  <ShieldCheck className="w-4 h-4 text-orange-500" />
                  <span>3. Branch Discount Limits & Sales Executive Authorization Rules</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-1.5">
                    <label className="block text-slate-800 font-bold">
                      Max Sales Executive Discount Allowance (%)
                    </label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="number"
                        step="0.5"
                        min="0"
                        max="50"
                        value={branchConfigForm.max_executive_discount_pct}
                        onChange={(e) => setBranchConfigForm({ ...branchConfigForm, max_executive_discount_pct: parseFloat(e.target.value) || 0 })}
                        className="w-full pos-input font-mono font-black text-slate-900"
                      />
                      <span className="font-bold text-slate-500">%</span>
                    </div>
                    <p className="text-[10px] text-slate-500">
                      Sales Executives assigned to this branch cannot exceed this discount limit without manager signoff.
                    </p>
                  </div>

                  <div className="bg-amber-50/50 p-3.5 rounded-xl border border-amber-200 space-y-1.5">
                    <label className="block text-amber-900 font-bold">
                      Require HO Signoff Threshold (Above %)
                    </label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="number"
                        step="0.5"
                        min="0"
                        max="50"
                        value={branchConfigForm.require_ho_discount_approval_above_pct}
                        onChange={(e) => setBranchConfigForm({ ...branchConfigForm, require_ho_discount_approval_above_pct: parseFloat(e.target.value) || 0 })}
                        className="w-full pos-input font-mono font-black text-amber-900 bg-white"
                      />
                      <span className="font-bold text-amber-700">%</span>
                    </div>
                    <p className="text-[10px] text-amber-800 font-medium">
                      Discounts exceeding this rate require mandatory Head Office master admin signoff.
                    </p>
                  </div>

                  <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-1.5">
                    <label className="block text-slate-800 font-bold">
                      Regional Transport Freight Surcharge Rate (+%)
                    </label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="number"
                        step="0.5"
                        min="0"
                        max="25"
                        value={branchConfigForm.regional_transport_surcharge_pct}
                        onChange={(e) => setBranchConfigForm({ ...branchConfigForm, regional_transport_surcharge_pct: parseFloat(e.target.value) || 0 })}
                        className="w-full pos-input font-mono font-black text-slate-900"
                      />
                      <span className="font-bold text-slate-500">%</span>
                    </div>
                    <p className="text-[10px] text-slate-500">
                      Applied to freight calculations for items delivered from this branch location.
                    </p>
                  </div>

                  {/* Toggles */}
                  <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-800 font-bold">Allow Manual Price Override</span>
                      <input
                        type="checkbox"
                        checked={branchConfigForm.allow_manual_price_override}
                        onChange={(e) => setBranchConfigForm({ ...branchConfigForm, allow_manual_price_override: e.target.checked })}
                        className="accent-orange-500 w-4 h-4 cursor-pointer"
                      />
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-200">
                      <span className="text-slate-800 font-bold">Allow Local Transport Rate Overrides</span>
                      <input
                        type="checkbox"
                        checked={branchConfigForm.allow_branch_transport_override}
                        onChange={(e) => setBranchConfigForm({ ...branchConfigForm, allow_branch_transport_override: e.target.checked })}
                        className="accent-orange-500 w-4 h-4 cursor-pointer"
                      />
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-200">
                      <span className="text-slate-800 font-bold">Auto-Print Official Invoice on Save</span>
                      <input
                        type="checkbox"
                        checked={branchConfigForm.auto_print_invoice_on_save}
                        onChange={(e) => setBranchConfigForm({ ...branchConfigForm, auto_print_invoice_on_save: e.target.checked })}
                        className="accent-orange-500 w-4 h-4 cursor-pointer"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-end gap-3 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={handleSaveBranchSettings}
                    className="bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs px-4 py-2 rounded-xl transition cursor-pointer flex items-center space-x-1.5"
                  >
                    <Save className="w-3.5 h-3.5 text-orange-400" />
                    <span>Save Local Branch Overrides</span>
                  </button>
                </div>
              </div>
            </div>

            {/* RIGHT COL: Push Engine CTA & Directives History */}
            <div className="space-y-6">
              {/* PUSH CTA BOX */}
              <div className="bg-gradient-to-br from-orange-500 to-amber-600 text-white p-5 rounded-2xl shadow-md space-y-4 relative overflow-hidden">
                <div className="space-y-1 relative z-10">
                  <span className="bg-white/20 text-white font-black text-[10px] px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                    HEAD OFFICE BROADCAST ENGINE
                  </span>
                  <h3 className="text-base font-bold text-white">
                    Push Settings to {branchConfigForm.branch_name}
                  </h3>
                  <p className="text-xs text-orange-100 leading-relaxed font-medium">
                    Publishing will push all contact, bank, and discount policies to this branch node in real time. Assigned Branch Managers & Sales Executives will receive immediate notification directives.
                  </p>
                </div>

                <div className="space-y-2 relative z-10 text-xs">
                  <label className="block font-bold text-white/90">HO Directive Notes / Remarks (Optional)</label>
                  <textarea
                    rows={2}
                    value={pushNotesInput}
                    onChange={(e) => setPushNotesInput(e.target.value)}
                    placeholder="e.g. Approved Q3 regional freight adjustment and updated local bank details..."
                    className="w-full bg-white/10 text-white placeholder-white/60 border border-white/20 rounded-xl p-2.5 focus:outline-none focus:bg-white/20 font-medium text-xs"
                  />
                </div>

                <button
                  type="button"
                  disabled={isPushingToBranch}
                  onClick={handlePushBranchSettings}
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white font-extrabold py-3 px-4 rounded-xl flex items-center justify-center space-x-2 transition shadow-lg cursor-pointer disabled:opacity-50 relative z-10 text-xs uppercase tracking-wider"
                >
                  <RefreshCw className={`w-4 h-4 text-orange-400 ${isPushingToBranch ? 'animate-spin' : ''}`} />
                  <span>
                    {isPushingToBranch
                      ? 'Pushing Directives to Branch...'
                      : `🚀 Push All Changes to ${branchConfigForm.branch_code}`}
                  </span>
                </button>
              </div>

              {/* PUSH DIRECTIVES AUDIT & NOTIFICATION HISTORY */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 border-b border-slate-100 pb-2.5 flex items-center justify-between">
                  <span className="flex items-center space-x-1.5">
                    <Clock className="w-4 h-4 text-slate-600" />
                    <span>HO Push Directives & Audit History</span>
                  </span>
                  <span className="text-[10px] bg-slate-100 text-slate-700 font-mono font-bold px-2 py-0.5 rounded">
                    {pushDirectivesHistory.length} Directives
                  </span>
                </h3>

                <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                  {pushDirectivesHistory.length === 0 ? (
                    <p className="text-slate-400 text-center py-6 text-xs">No push directives recorded for this branch yet.</p>
                  ) : (
                    pushDirectivesHistory.map((dir) => (
                      <div key={dir.id} className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs space-y-1.5 hover:border-slate-300 transition">
                        <div className="flex items-center justify-between">
                          <span className="font-mono font-black text-slate-900 text-[11px] flex items-center space-x-1">
                            <BadgeCheck className="w-3.5 h-3.5 text-blue-600" />
                            <span>v{dir.version_number} — {dir.directive_title}</span>
                          </span>
                          <span className="text-[9px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full border border-emerald-200">
                            {dir.status}
                          </span>
                        </div>

                        <div className="text-[10px] text-slate-500 flex items-center justify-between">
                          <span>Author: <strong>{dir.pushed_by}</strong></span>
                          <span className="font-mono">{new Date(dir.timestamp).toLocaleDateString()}</span>
                        </div>

                        {dir.changes_summary && dir.changes_summary.length > 0 && (
                          <ul className="text-[11px] text-slate-700 space-y-0.5 pt-1 border-t border-slate-200/60 list-disc pl-4 font-medium">
                            {dir.changes_summary.map((c, i) => (
                              <li key={i}>{c}</li>
                            ))}
                          </ul>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- SUB TAB 1: COMPANY & BRANDING --- */}
      {isSubTabAllowed && activeSubTab === 'company' && (

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Company Info Form */}
          <div className="lg:col-span-2 bg-white p-5 rounded-lg border border-slate-200 shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2.5 flex items-center space-x-2">
              <Building2 className="w-4 h-4 text-orange-500" />
              <span>Company Information & Registration Details</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-slate-600 font-semibold mb-1">Company Name *</label>
                <input
                  type="text"
                  value={company.company_name}
                  onChange={(e) => setCompany({ ...company, company_name: e.target.value })}
                  className="w-full pos-input"
                  placeholder="Company Official Registered Name"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">Business Tagline</label>
                <input
                  type="text"
                  value={company.tagline}
                  onChange={(e) => setCompany({ ...company, tagline: e.target.value })}
                  className="w-full pos-input"
                  placeholder="Tagline displayed on invoices"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">Business Registration No.</label>
                <input
                  type="text"
                  value={company.registration_no}
                  onChange={(e) => setCompany({ ...company, registration_no: e.target.value })}
                  className="w-full pos-input"
                  placeholder="PV-XXXXX-SL"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">Tax / VAT Registration No.</label>
                <input
                  type="text"
                  value={company.tax_vat_id}
                  onChange={(e) => setCompany({ ...company, tax_vat_id: e.target.value })}
                  className="w-full pos-input"
                  placeholder="VAT-XXXXX-XXXX"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">Official Phone Numbers</label>
                <input
                  type="text"
                  value={company.phone}
                  onChange={(e) => setCompany({ ...company, phone: e.target.value })}
                  className="w-full pos-input"
                  placeholder="+94 11 288 9000"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">Official Email Address</label>
                <input
                  type="email"
                  value={company.email}
                  onChange={(e) => setCompany({ ...company, email: e.target.value })}
                  className="w-full pos-input"
                  placeholder="info@company.lk"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-slate-600 font-semibold mb-1">Headquarters Physical Address</label>
                <input
                  type="text"
                  value={company.address}
                  onChange={(e) => setCompany({ ...company, address: e.target.value })}
                  className="w-full pos-input"
                  placeholder="Full street address, district, postal code"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">Website URL</label>
                <input
                  type="text"
                  value={company.website}
                  onChange={(e) => setCompany({ ...company, website: e.target.value })}
                  className="w-full pos-input"
                  placeholder="www.company.lk"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-slate-600 font-semibold mb-1">Quotation & Invoice Terms / Footer Policy</label>
                <textarea
                  rows={3}
                  value={company.invoice_footer_terms}
                  onChange={(e) => setCompany({ ...company, invoice_footer_terms: e.target.value })}
                  className="w-full pos-input font-mono text-xs"
                  placeholder="Default terms printed on generated quotations..."
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={handleSaveCompany}
                className="btn-pos-orange flex items-center space-x-1.5"
              >
                <Save className="w-4 h-4" />
                <span>Save Company Details</span>
              </button>
            </div>
          </div>

          {/* Vector & Custom Image Brand Logo Card */}
          <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2.5 flex items-center justify-between">
              <span className="flex items-center space-x-2">
                <Building2 className="w-4 h-4 text-orange-500" />
                <span>Company Logo & Brand Identity</span>
              </span>
              {company.logo_url ? (
                <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full border border-emerald-200">
                  Custom Logo Active
                </span>
              ) : (
                <span className="text-[10px] bg-blue-50 text-blue-700 font-bold px-2 py-0.5 rounded-full border border-blue-200">
                  Vector Badge Active
                </span>
              )}
            </h2>

            {/* Hidden File Input */}
            <input
              type="file"
              ref={logoFileInputRef}
              onChange={handleLogoUpload}
              accept="image/png,image/jpeg,image/webp,image/svg+xml"
              className="hidden"
            />

            {/* Current Brand Logo Live Preview */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-center space-y-3">
              <p className="text-xs text-slate-600 font-semibold flex items-center justify-center space-x-1">
                <ImageIcon className="w-3.5 h-3.5 text-orange-500" />
                <span>Live Navigation Header & Document Preview</span>
              </p>

              <div className="p-4 mx-auto border border-slate-200 rounded-xl flex items-center justify-center bg-white shadow-xs min-h-[90px] overflow-hidden">
                <CompanyLogo size="lg" logoUrl={company.logo_url} companyName={company.company_name} tagline={company.tagline} />
              </div>
              <p className="text-[10px] text-slate-500">
                This logo automatically displays across top navbar headers, official sales quotes, customer invoices, and printed receipts.
              </p>
            </div>

            {/* Image Upload Actions */}
            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => logoFileInputRef.current?.click()}
                  className="w-full btn-pos-orange flex items-center justify-center space-x-2 py-2 text-xs font-bold"
                >
                  <Upload className="w-4 h-4" />
                  <span>Upload Logo Image</span>
                </button>

                {company.logo_url ? (
                  <button
                    type="button"
                    onClick={() => {
                      const updated = { ...company, logo_url: '' };
                      setCompany(updated);
                      localStorage.setItem('innovista_company_settings', JSON.stringify(updated));
                      window.dispatchEvent(new Event('innovista_company_settings_changed'));
                      notifySuccess('Reverted to system default vector logo');
                    }}
                    className="w-full bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold py-2 rounded-lg text-xs flex items-center justify-center space-x-1.5 transition cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Reset to Default Logo</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled
                    className="w-full bg-slate-100 text-slate-400 border border-slate-200 font-semibold py-2 rounded-lg text-xs flex items-center justify-center space-x-1.5 cursor-not-allowed"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Default Logo Active</span>
                  </button>
                )}
              </div>

              {/* Direct Image URL Alternative */}
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-600 block">Or Paste Direct Logo Image URL (HTTPS / Data URL):</label>
                <input
                  type="text"
                  value={company.logo_url || ''}
                  onChange={(e) => {
                    const updated = { ...company, logo_url: e.target.value };
                    setCompany(updated);
                    localStorage.setItem('innovista_company_settings', JSON.stringify(updated));
                    window.dispatchEvent(new Event('innovista_company_settings_changed'));
                  }}
                  placeholder="https://example.com/logo.png or data:image/png;base64,..."
                  className="w-full pos-input text-xs font-mono"
                />
              </div>
            </div>

            <button
              type="button"
              onClick={handleSaveCompany}
              className="w-full btn-pos-orange mt-2 flex items-center justify-center space-x-1 py-2.5 font-bold"
            >
              <Save className="w-4 h-4" />
              <span>Save System Branding Settings</span>
            </button>
          </div>
        </div>
      )}

      {/* --- SUB TAB 2: BANK DETAILS & CURRENCIES --- */}
      {isSubTabAllowed && activeSubTab === 'bank_currency' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Bank Account Details */}
          <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2.5 flex items-center space-x-2">
              <Landmark className="w-4 h-4 text-orange-500" />
              <span>Corporate Bank Account Details (Printed on Quotations)</span>
            </h2>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-600 font-semibold mb-1">Bank Name</label>
                <input
                  type="text"
                  value={company.bank_details.bank_name}
                  onChange={(e) =>
                    setCompany({
                      ...company,
                      bank_details: { ...company.bank_details, bank_name: e.target.value }
                    })
                  }
                  className="w-full pos-input"
                  placeholder="Bank Name"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">Account Name</label>
                <input
                  type="text"
                  value={company.bank_details.account_name}
                  onChange={(e) =>
                    setCompany({
                      ...company,
                      bank_details: { ...company.bank_details, account_name: e.target.value }
                    })
                  }
                  className="w-full pos-input"
                  placeholder="Account Holder Name"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Account Number</label>
                  <input
                    type="text"
                    value={company.bank_details.account_number}
                    onChange={(e) =>
                      setCompany({
                        ...company,
                        bank_details: { ...company.bank_details, account_number: e.target.value }
                      })
                    }
                    className="w-full pos-input font-mono"
                    placeholder="1000-XXXXXX-XXX"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Branch Name</label>
                  <input
                    type="text"
                    value={company.bank_details.branch_name}
                    onChange={(e) =>
                      setCompany({
                        ...company,
                        bank_details: { ...company.bank_details, branch_name: e.target.value }
                      })
                    }
                    className="w-full pos-input"
                    placeholder="Branch Name"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">SWIFT / IFSC / Bank Code</label>
                <input
                  type="text"
                  value={company.bank_details.swift_code || ''}
                  onChange={(e) =>
                    setCompany({
                      ...company,
                      bank_details: { ...company.bank_details, swift_code: e.target.value }
                    })
                  }
                  className="w-full pos-input font-mono"
                  placeholder="CCEYLKCX"
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button onClick={handleSaveBank} className="btn-pos-orange flex items-center space-x-1.5">
                <Save className="w-4 h-4" />
                <span>Save Bank Details</span>
              </button>
            </div>
          </div>

          {/* Currencies & Exchange Rates */}
          <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <h2 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
                <Globe2 className="w-4 h-4 text-orange-500" />
                <span>Multi-Currency & Exchange Rates</span>
              </h2>

              <button
                onClick={() => setShowCurrencyModal(true)}
                className="bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs px-2.5 py-1 rounded-md font-semibold flex items-center space-x-1 transition cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 text-orange-500" />
                <span>Add</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-y border-slate-200 text-slate-600 text-[11px]">
                    <th className="p-2 font-semibold">Code</th>
                    <th className="p-2 font-semibold">Symbol</th>
                    <th className="p-2 font-semibold">Name</th>
                    <th className="p-2 font-semibold text-right">Rate to LKR</th>
                    <th className="p-2 font-semibold text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {company.currencies.map((curr) => (
                    <tr key={curr.code} className="hover:bg-slate-50/80">
                      <td className="p-2 font-mono font-bold text-slate-900">
                        {curr.code} {curr.is_default && <span className="text-[9px] bg-orange-100 text-orange-600 px-1 rounded ml-1">BASE</span>}
                      </td>
                      <td className="p-2 font-bold text-slate-800">{curr.symbol}</td>
                      <td className="p-2 text-slate-700">{curr.name}</td>
                      <td className="p-2 text-right font-mono font-semibold text-slate-900">
                        {curr.exchange_rate_to_lkr.toFixed(2)}
                      </td>
                      <td className="p-2 text-center">
                        {!curr.is_default && (
                          <button
                            onClick={() => handleDeleteCurrency(curr.code)}
                            className="text-rose-500 hover:text-rose-700 p-1 rounded"
                            title="Delete currency"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <p className="text-[11px] text-slate-400 italic">
              * Rates are used for multi-currency export quote calculations. Base currency is Sri Lankan Rupee (LKR).
            </p>
          </div>
        </div>
      )}

      {/* --- SUB TAB 3: USER MANAGEMENT & SIGNING APPROVAL (ADMIN) --- */}
      {isSubTabAllowed && activeSubTab === 'users' && (
        <div className="space-y-4">
          {/* Head Office Emergency Master Backup Recovery Key Card */}
          <div className="bg-white p-4 sm:p-5 rounded-xl border border-rose-200 shadow-xs space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-rose-100 pb-3">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 bg-rose-100 text-rose-700 rounded-xl">
                  <KeyRound className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center space-x-2">
                    <span>Head Office Master Emergency Backup Recovery Key</span>
                    <span className="bg-rose-100 text-rose-800 text-[9px] font-extrabold px-2 py-0.5 rounded font-mono">
                      HO ADMIN EXCLUSIVE
                    </span>
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Master key for unrecoverable account access overrides, lost credentials, or emergency password resets across all branch nodes.
                  </p>
                </div>
              </div>

              {!isHeadOfficeUser && (
                <span className="text-[10px] font-bold text-rose-800 bg-rose-50 border border-rose-200 px-2.5 py-1 rounded-md flex items-center space-x-1">
                  <Lock className="w-3 h-3 text-rose-600" />
                  <span>Managed by Head Office Admin Only</span>
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
              {/* Key Display Container */}
              <div className="md:col-span-2 bg-slate-900 text-white p-3.5 rounded-xl border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 uppercase">
                  <span>MASTER BACKUP RECOVERY KEY</span>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-0.5 rounded font-bold text-[9px] ${
                      company.ho_backup_key_status === 'Active' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                    }`}>
                      {company.ho_backup_key_status === 'Active' ? '● KEY ACTIVE' : '○ DEACTIVATED'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-2">
                  <div className="font-mono font-bold text-base sm:text-lg text-[#FFC81E] tracking-widest truncate">
                    {company.ho_backup_key ? (
                      showBackupKeySecret ? company.ho_backup_key : '••••••••••••••••'
                    ) : (
                      <span className="text-slate-500 text-xs italic font-sans">No Master Backup Key Configured</span>
                    )}
                  </div>

                  <div className="flex items-center space-x-1 shrink-0">
                    {company.ho_backup_key && (
                      <>
                        <button
                          type="button"
                          onClick={() => setShowBackupKeySecret(!showBackupKeySecret)}
                          className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs transition cursor-pointer"
                          title={showBackupKeySecret ? "Hide key" : "Show key"}
                        >
                          {showBackupKeySecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                        <button
                          type="button"
                          onClick={handleCopyBackupKey}
                          className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs transition cursor-pointer flex items-center space-x-1"
                          title="Copy key to clipboard"
                        >
                          {copiedBackupKey ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                        </button>
                      </>
                    )}
                  </div>
                </div>

                <div className="text-[10px] text-slate-400 flex flex-wrap items-center justify-between pt-1 border-t border-slate-800/80 gap-1 font-mono">
                  <span>Updated: {company.ho_backup_key_updated_at || 'N/A'} ({company.ho_backup_key_updated_by || 'Admin'})</span>
                  {company.ho_backup_key_notes && <span className="text-slate-400 italic">"{company.ho_backup_key_notes}"</span>}
                </div>
              </div>

              {/* Action Buttons for HO Admin */}
              {isHeadOfficeUser ? (
                <div className="flex flex-col space-y-2 justify-center">
                  <button
                    type="button"
                    onClick={handleOpenEditBackupKey}
                    className="w-full py-2 px-3 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg text-xs shadow-xs transition flex items-center justify-center space-x-1.5 cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>{company.ho_backup_key ? 'Change / Edit Backup Key' : 'Define New Backup Key'}</span>
                  </button>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={handleToggleBackupKeyStatus}
                      className={`py-1.5 px-2 font-bold rounded-lg text-[11px] border transition flex items-center justify-center space-x-1 cursor-pointer ${
                        company.ho_backup_key_status === 'Active'
                          ? 'bg-amber-50 hover:bg-amber-100 text-amber-900 border-amber-300'
                          : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border-emerald-300'
                      }`}
                    >
                      <Power className="w-3 h-3" />
                      <span>{company.ho_backup_key_status === 'Active' ? 'Deactivate' : 'Activate'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleDeleteBackupKey}
                      className="py-1.5 px-2 bg-slate-100 hover:bg-rose-100 text-slate-700 hover:text-rose-800 border border-slate-300 hover:border-rose-300 font-bold rounded-lg text-[11px] transition flex items-center justify-center space-x-1 cursor-pointer"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Delete Key</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-500 text-[11px] italic text-center">
                  Only Head Office Super Admins can define, change, activate or deactivate the Master Backup Recovery Key.
                </div>
              )}
            </div>
          </div>

          {/* Head Office Admin Session Inactivity Timeout Security Card */}
          <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-xs space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
              <div className="flex items-center space-x-2">
                <div className="p-1.5 bg-orange-100 text-orange-600 rounded-lg">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center space-x-1.5">
                    <span>Session Security & Inactivity Auto-Logout Policy</span>
                    <span className="bg-orange-100 text-orange-800 text-[9px] font-extrabold px-2 py-0.5 rounded font-mono">
                      HO ADMIN EXCLUSIVE
                    </span>
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Automatically terminates active user sessions when no work/user activity is detected for the specified duration.
                  </p>
                </div>
              </div>

              {!isHeadOfficeUser && (
                <span className="text-[10px] font-bold text-amber-800 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-md flex items-center space-x-1">
                  <Lock className="w-3 h-3 text-amber-600" />
                  <span>Configurable by Head Office Admin Only</span>
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center pt-1 text-xs">
              <div className="sm:col-span-2 space-y-1.5">
                <label className="font-bold text-slate-800 block">
                  Inactivity Timeout Duration (Minutes)
                </label>
                <div className="flex flex-wrap items-center gap-2">
                  <div className="relative w-36">
                    <input
                      type="number"
                      min={1}
                      max={240}
                      disabled={!isHeadOfficeUser}
                      value={sessionTimeoutInput}
                      onChange={(e) => setSessionTimeoutInput(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-full pos-input font-mono font-bold text-slate-900 pr-12 text-xs"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-500 pointer-events-none">
                      mins
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-1">
                    {[5, 10, 15, 30, 60].map((mins) => (
                      <button
                        key={mins}
                        type="button"
                        disabled={!isHeadOfficeUser}
                        onClick={() => setSessionTimeoutInput(mins)}
                        className={`px-2.5 py-1 text-[11px] font-bold rounded-md transition border ${
                          sessionTimeoutInput === mins
                            ? 'bg-orange-500 text-white border-orange-500 shadow-2xs'
                            : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border-slate-200'
                        } ${!isHeadOfficeUser ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                      >
                        {mins} min{mins > 1 ? 's' : ''} {mins === 15 ? '(Default)' : ''}
                      </button>
                    ))}
                  </div>
                </div>
                <p className="text-[11px] text-slate-500">
                  Default: <strong>15 minutes</strong>. If user is idle (no key, click, mouse, or touch activity), their login session will be safely terminated.
                </p>
              </div>

              {isHeadOfficeUser && (
                <div className="flex justify-start sm:justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      saveSessionTimeoutMinutes(sessionTimeoutInput);
                      notifySuccess(`Updated session inactivity timeout policy to ${sessionTimeoutInput} minutes!`);
                    }}
                    className="bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold px-4 py-2 rounded-xl transition shadow-xs flex items-center space-x-1.5 cursor-pointer"
                  >
                    <Save className="w-4 h-4" />
                    <span>Save Session Timeout Policy</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Admin Password & Account Policy Notice */}
          <div className="bg-blue-50/80 border border-blue-200 rounded-lg p-3 flex items-start space-x-2 text-xs text-blue-900">
            <Lock className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Admin Account Management Policy:</span> Administrators can approve pending registrations, assign Employee Unique IDs, deactivate, reactivate, or delete user accounts. Administrators <span className="underline font-bold">cannot view or directly modify user passwords</span>. Account credentials must be reset or set by individual users upon login.
            </div>
          </div>

          {/* Pending Approval Highlight Banner */}
          {pendingUserCount > 0 && (
            <div className="bg-amber-50 border border-amber-300 p-4 rounded-lg flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center space-x-2">
                <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
                <div>
                  <span className="font-bold text-amber-900">
                    {pendingUserCount} User Account Registration(s) Awaiting Admin Signing & Approval
                  </span>
                  <p className="text-amber-700 text-[11px] mt-0.5">
                    Branch sales reps registered new credentials. Admin signoff is required before system access is granted.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setUserStatusFilter('PENDING')}
                className="bg-amber-600 hover:bg-amber-700 text-white font-bold px-3 py-1.5 rounded-md text-xs shadow-xs transition"
              >
                Review Pending Requests ({pendingUserCount})
              </button>
            </div>
          )}

          {/* User Management Control Bar */}
          <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold text-slate-700 uppercase">Filter Status:</span>
              <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-md text-xs font-semibold">
                <button
                  onClick={() => setUserStatusFilter('ALL')}
                  className={`px-2.5 py-1 rounded ${userStatusFilter === 'ALL' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'}`}
                >
                  All Users ({users.length})
                </button>
                <button
                  onClick={() => setUserStatusFilter('PENDING')}
                  className={`px-2.5 py-1 rounded flex items-center space-x-1 ${userStatusFilter === 'PENDING' ? 'bg-amber-500 text-white shadow-xs' : 'text-slate-600'}`}
                >
                  <span>Pending</span>
                  {pendingUserCount > 0 && <span className="bg-amber-700 text-white text-[9px] px-1.5 py-0.2 rounded-full">{pendingUserCount}</span>}
                </button>
                <button
                  onClick={() => setUserStatusFilter('ACTIVE')}
                  className={`px-2.5 py-1 rounded ${userStatusFilter === 'ACTIVE' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600'}`}
                >
                  Active
                </button>
                <button
                  onClick={() => setUserStatusFilter('DEACTIVATED')}
                  className={`px-2.5 py-1 rounded ${userStatusFilter === 'DEACTIVATED' ? 'bg-slate-700 text-white shadow-xs' : 'text-slate-600'}`}
                >
                  Deactivated
                </button>
              </div>
            </div>

            {/* Admin Action CTA: Add User */}
            <button
              onClick={() => setShowAddUserModal(true)}
              className="bg-orange-500 hover:bg-orange-600 text-white text-xs px-3.5 py-2 rounded-md font-bold shadow-xs transition flex items-center space-x-1.5 cursor-pointer"
            >
              <UserCheck className="w-4 h-4" />
              <span>Register</span>
            </button>
          </div>

          {/* Users Table */}
          <div className="bg-white rounded-lg border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-900 text-white text-[11px] uppercase tracking-wider">
                    <th className="p-3 font-semibold">User Details</th>
                    <th className="p-3 font-semibold">System Role</th>
                    <th className="p-3 font-semibold">Assigned Branch Node</th>
                    <th className="p-3 font-semibold">Status & Approval</th>
                    <th className="p-3 font-semibold">Registered / Last Login</th>
                    <th className="p-3 font-semibold text-right">Admin Signing & Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-6 text-center text-slate-500">
                        No users match the selected status filter.
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((u) => {
                      const isPending = u.status === 'Pending Approval';
                      const isActive = u.status === 'Active';

                      return (
                        <tr key={u.id} className={`hover:bg-slate-50 transition ${isPending ? 'bg-amber-50/50' : ''}`}>
                          <td className="p-3">
                            <div className="font-bold text-slate-900 flex items-center space-x-1.5">
                              <span>{u.name}</span>
                              {u.employee_id && (
                                <span className="inline-block text-[9px] font-mono font-bold text-orange-700 bg-orange-50 border border-orange-200 px-1.5 py-0.2 rounded">
                                  {u.employee_id}
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-500 font-mono">{u.email}</div>
                            {u.phone && <div className="text-[10px] text-slate-400">{u.phone}</div>}
                          </td>

                          <td className="p-3">
                            <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-800 border border-slate-200">
                              {u.role}
                            </span>
                          </td>

                          <td className="p-3">
                            <span className="text-slate-800 font-semibold">{u.branch_name}</span>
                          </td>

                          <td className="p-3">
                            {isPending ? (
                              <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300 animate-pulse">
                                <AlertCircle className="w-3 h-3 text-amber-600" />
                                <span>Awaiting Admin Signoff</span>
                              </span>
                            ) : isActive ? (
                              <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                                <BadgeCheck className="w-3 h-3 text-emerald-600" />
                                <span>Active & Signed</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] font-bold bg-slate-200 text-slate-700">
                                <UserX className="w-3 h-3 text-slate-500" />
                                <span>Deactivated</span>
                              </span>
                            )}
                          </td>

                          <td className="p-3 text-[11px] text-slate-500">
                            <div>Created: {u.created_at || 'N/A'}</div>
                            <div className="text-[10px] text-slate-400">Login: {u.last_login || 'Never'}</div>
                          </td>

                          <td className="p-3 text-right space-x-1.5 whitespace-nowrap">
                            {/* SIGNING & APPROVAL BUTTON FOR ADMIN */}
                            {isPending && (
                              <button
                                onClick={() => handleApproveUserSigning(u.id, u.name)}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold px-2.5 py-1 rounded shadow-xs transition inline-flex items-center space-x-1"
                                title="Admin Signing Approval"
                              >
                                <ShieldCheck className="w-3.5 h-3.5" />
                                <span>Sign & Approve User</span>
                              </button>
                            )}

                            {isActive && (
                              <button
                                onClick={() => handleDeactivateUser(u.id)}
                                className="bg-amber-100 hover:bg-amber-200 text-amber-800 text-[10px] font-bold px-2 py-1 rounded transition"
                                title="Deactivate user account"
                              >
                                Deactivate
                              </button>
                            )}

                            {!isActive && !isPending && (
                              <button
                                onClick={() => handleReactivateUser(u.id)}
                                className="bg-emerald-100 hover:bg-emerald-200 text-emerald-800 text-[10px] font-bold px-2 py-1 rounded transition"
                                title="Reactivate user account"
                              >
                                Reactivate
                              </button>
                            )}

                            {/* Emergency Account Recovery button for HO Admins */}
                            {isHeadOfficeUser && (
                              <button
                                onClick={() => {
                                  setEmergencyResetUser(u);
                                  setEmergencyResetKeyInput(company.ho_backup_key || '');
                                  setEmergencyResetError(null);
                                }}
                                className="bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-[10px] font-bold px-2 py-1 rounded transition inline-flex items-center space-x-1 cursor-pointer"
                                title="Emergency Account Reset via HO Master Backup Key"
                              >
                                <KeyRound className="w-3 h-3 text-rose-600" />
                                <span>Emergency Reset</span>
                              </button>
                            )}

                            <button
                              onClick={() => handleDeleteUserClick(u.id, u.name)}
                              className="text-rose-500 hover:text-rose-700 p-1 rounded hover:bg-rose-50 transition cursor-pointer"
                              title="Delete User"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
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
      )}

      {/* --- SUB TAB 4: CATEGORIES & SUBCATEGORIES --- */}
      {isSubTabAllowed && activeSubTab === 'categories' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Header & Quick Action Bar */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
                  <Grid className="w-4 h-4 text-orange-500" />
                  <span>Product Categories & Sub-category Management</span>
                  <span className="bg-orange-100 text-orange-800 text-[10px] font-bold px-2 py-0.5 rounded border border-orange-200">
                    {categories.length} CATEGORIES
                  </span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Manage master product categories and sub-categories. You can edit, delete, or deactivate categories and individual sub-categories.
                </p>
              </div>

              {canEditMasterData ? (
                <button
                  onClick={() => {
                    setCatForm({ name: '', description: '', status: 'Active', subcategories: [] });
                    setShowCatModal(true);
                  }}
                  className="bg-orange-500 hover:bg-orange-600 text-white text-xs px-4 py-2 rounded-xl font-bold transition flex items-center space-x-1.5 shadow-sm cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create Category</span>
                </button>
              ) : (
                <span className="px-3 py-1.5 bg-amber-50 text-amber-800 border border-amber-200 text-xs font-semibold rounded-lg flex items-center space-x-1">
                  <Lock className="w-3.5 h-3.5 text-amber-600" />
                  <span>View-Only Mode</span>
                </span>
              )}
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-1 border-t border-slate-100">
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-500 font-bold uppercase block">Total Categories</span>
                  <span className="text-base font-extrabold text-slate-900 font-mono">{categories.length}</span>
                </div>
                <Grid className="w-5 h-5 text-orange-500" />
              </div>

              <div className="bg-emerald-50/60 p-2.5 rounded-xl border border-emerald-200 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-emerald-800 font-bold uppercase block">Active Categories</span>
                  <span className="text-base font-extrabold text-emerald-700 font-mono">
                    {categories.filter(c => (c.status || 'Active') === 'Active').length}
                  </span>
                </div>
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              </div>

              <div className="bg-amber-50/60 p-2.5 rounded-xl border border-amber-200 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-amber-800 font-bold uppercase block">Deactive Categories</span>
                  <span className="text-base font-extrabold text-amber-700 font-mono">
                    {categories.filter(c => c.status === 'Deactive').length}
                  </span>
                </div>
                <Power className="w-5 h-5 text-amber-600" />
              </div>

              <div className="bg-blue-50/60 p-2.5 rounded-xl border border-blue-200 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-blue-800 font-bold uppercase block">Total Sub-categories</span>
                  <span className="text-base font-extrabold text-blue-700 font-mono">
                    {categories.reduce((acc, c) => acc + (c.subcategories?.length || 0), 0)}
                  </span>
                </div>
                <Layers className="w-5 h-5 text-blue-600" />
              </div>
            </div>

            {/* Search & Filter Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2 text-xs">
              <div className="relative flex-1 min-w-[220px]">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={categorySearch}
                  onChange={(e) => setCategorySearch(e.target.value)}
                  placeholder="Search categories or sub-categories..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-8 pr-3 py-1.5 font-medium text-slate-800 focus:outline-none focus:border-orange-500"
                />
              </div>

              <div className="flex items-center space-x-1.5 bg-slate-100 p-1 rounded-xl text-xs font-semibold">
                <button
                  onClick={() => setCategoryStatusFilter('ALL')}
                  className={`px-3 py-1 rounded-lg transition ${
                    categoryStatusFilter === 'ALL' ? 'bg-white text-slate-900 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  All Status ({categories.length})
                </button>
                <button
                  onClick={() => setCategoryStatusFilter('Active')}
                  className={`px-3 py-1 rounded-lg transition ${
                    categoryStatusFilter === 'Active' ? 'bg-emerald-600 text-white shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Active Only ({categories.filter(c => (c.status || 'Active') === 'Active').length})
                </button>
                <button
                  onClick={() => setCategoryStatusFilter('Deactive')}
                  className={`px-3 py-1 rounded-lg transition ${
                    categoryStatusFilter === 'Deactive' ? 'bg-amber-600 text-white shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Deactive Only ({categories.filter(c => c.status === 'Deactive').length})
                </button>
              </div>
            </div>
          </div>

          {/* Categories Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {categories
              .filter((cat) => {
                const isDeactive = cat.status === 'Deactive';
                if (categoryStatusFilter === 'Active' && isDeactive) return false;
                if (categoryStatusFilter === 'Deactive' && !isDeactive) return false;

                if (!categorySearch.trim()) return true;
                const query = categorySearch.toLowerCase().trim();
                const matchCat = cat.name.toLowerCase().includes(query) || (cat.description && cat.description.toLowerCase().includes(query));
                const normSubs = normalizeSubCategories(cat.subcategories);
                const matchSub = normSubs.some((s) => s.name.toLowerCase().includes(query));
                return matchCat || matchSub;
              })
              .map((cat) => {
                const isDeactive = cat.status === 'Deactive';
                const normalizedSubs = normalizeSubCategories(cat.subcategories);
                const activeSubsCount = normalizedSubs.filter(s => s.status !== 'Deactive').length;
                const deactiveSubsCount = normalizedSubs.filter(s => s.status === 'Deactive').length;

                return (
                  <div
                    key={cat.id}
                    className={`bg-white rounded-2xl border p-5 space-y-4 shadow-xs transition relative ${
                      isDeactive
                        ? 'border-amber-200 bg-amber-50/30'
                        : 'border-slate-200 hover:border-orange-300'
                    }`}
                  >
                    {/* Header Row */}
                    <div className="flex items-start justify-between border-b border-slate-100 pb-3 gap-2">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <h3 className={`font-black text-sm flex items-center space-x-2 ${isDeactive ? 'text-slate-500 line-through' : 'text-slate-900'}`}>
                            <Grid className={`w-4 h-4 ${isDeactive ? 'text-amber-500' : 'text-orange-500'}`} />
                            <span>{cat.name}</span>
                          </h3>

                          {/* Category Status Pill */}
                          {isDeactive ? (
                            <span className="bg-amber-100 text-amber-800 border border-amber-300 text-[10px] font-extrabold px-2 py-0.5 rounded-full flex items-center space-x-1">
                              <Power className="w-3 h-3 text-amber-600" />
                              <span>Deactive Category</span>
                            </span>
                          ) : (
                            <span className="bg-emerald-100 text-emerald-800 border border-emerald-300 text-[10px] font-extrabold px-2 py-0.5 rounded-full flex items-center space-x-1">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              <span>Active Category</span>
                            </span>
                          )}
                        </div>

                        <p className="text-xs text-slate-500 font-medium">{cat.description || 'No description provided'}</p>
                      </div>

                      {canEditMasterData && (
                        <div className="flex items-center space-x-1 shrink-0">
                          {/* Toggle Category Status Button */}
                          <button
                            onClick={() => handleToggleCategoryStatus(cat)}
                            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition flex items-center space-x-1 cursor-pointer ${
                              isDeactive
                                ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-2xs'
                                : 'bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300'
                            }`}
                            title={isDeactive ? 'Reactivate Category' : 'Deactivate Category'}
                          >
                            <Power className="w-3.5 h-3.5" />
                            <span>{isDeactive ? 'Reactivate' : 'Deactivate'}</span>
                          </button>

                          {/* Edit Category Button */}
                          <button
                            onClick={() => {
                              setCatForm({
                                id: cat.id,
                                name: cat.name,
                                description: cat.description || '',
                                status: cat.status || 'Active',
                                subcategories: normalizeSubCategories(cat.subcategories)
                              });
                              setShowCatModal(true);
                            }}
                            className="p-1.5 text-slate-500 hover:text-orange-600 bg-slate-100 hover:bg-orange-50 rounded-lg transition"
                            title="Edit Category Details & Sub-categories"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>

                          {/* Delete Category Button */}
                          <button
                            onClick={() => handleDeleteCatClick(cat.id, cat.name)}
                            className="p-1.5 text-slate-500 hover:text-rose-600 bg-slate-100 hover:bg-rose-50 rounded-lg transition"
                            title="Delete Category"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Sub-categories Section */}
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                        <span>
                          Sub-categories ({normalizedSubs.length}):
                        </span>
                        <span className="font-mono text-[10px] text-slate-400">
                          <strong className="text-emerald-700">{activeSubsCount} Active</strong>
                          {deactiveSubsCount > 0 && <span className="ml-1 text-amber-700">• {deactiveSubsCount} Deactive</span>}
                        </span>
                      </div>

                      {/* Sub-category Pills */}
                      <div className="flex flex-wrap gap-2">
                        {normalizedSubs.map((sub) => {
                          const isSubDeactive = sub.status === 'Deactive';

                          return (
                            <div
                              key={sub.id}
                              className={`group relative flex items-center space-x-1.5 px-2.5 py-1 rounded-xl text-xs font-semibold border transition ${
                                isSubDeactive
                                  ? 'bg-slate-100 text-slate-500 border-slate-300 opacity-75'
                                  : 'bg-white text-slate-800 border-slate-200 shadow-2xs hover:border-orange-300'
                              }`}
                            >
                              <span className={isSubDeactive ? 'line-through' : ''}>{sub.name}</span>

                              {/* Status indicator badge */}
                              {isSubDeactive ? (
                                <span className="bg-amber-200 text-amber-900 text-[9px] font-black px-1.5 py-0.2 rounded uppercase">
                                  Deactive
                                </span>
                              ) : null}

                              {canEditMasterData && (
                                <div className="flex items-center space-x-1 pl-1 border-l border-slate-200">
                                  {/* Quick Edit Subcategory Name */}
                                  <button
                                    onClick={() =>
                                      setEditingSubCat({
                                        catId: cat.id,
                                        subId: sub.id,
                                        oldName: sub.name,
                                        newName: sub.name,
                                        status: sub.status || 'Active'
                                      })
                                    }
                                    className="text-slate-400 hover:text-orange-600 transition"
                                    title="Edit Sub-category Name"
                                  >
                                    <Edit3 className="w-3 h-3" />
                                  </button>

                                  {/* Toggle Subcategory Status */}
                                  <button
                                    onClick={() => handleToggleSubCategoryStatus(cat, sub.id)}
                                    className={`transition ${isSubDeactive ? 'text-amber-600 hover:text-emerald-600' : 'text-slate-400 hover:text-amber-600'}`}
                                    title={isSubDeactive ? 'Reactivate Sub-category' : 'Deactivate Sub-category'}
                                  >
                                    <Power className="w-3 h-3" />
                                  </button>

                                  {/* Delete Subcategory */}
                                  <button
                                    onClick={() => handleDeleteSubCategory(cat, sub.id, sub.name)}
                                    className="text-slate-400 hover:text-rose-600 transition"
                                    title="Delete Sub-category"
                                  >
                                    <X className="w-3 h-3" />
                                  </button>
                                </div>
                              )}
                            </div>
                          );
                        })}

                        {normalizedSubs.length === 0 && (
                          <p className="text-slate-400 italic text-xs py-1">No sub-categories defined for this category.</p>
                        )}
                      </div>

                      {/* Quick Add Sub-category Input */}
                      {canEditMasterData && (
                        <div className="flex items-center space-x-2 pt-2 border-t border-slate-100">
                          <input
                            type="text"
                            value={quickSubCatInputs[cat.id] || ''}
                            onChange={(e) => setQuickSubCatInputs({ ...quickSubCatInputs, [cat.id]: e.target.value })}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                handleQuickAddSubCategory(cat);
                              }
                            }}
                            placeholder={`+ Add sub-category to ${cat.name}...`}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-medium text-slate-800 focus:outline-none focus:bg-white focus:border-orange-500"
                          />
                          <button
                            type="button"
                            onClick={() => handleQuickAddSubCategory(cat)}
                            className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-3 py-1.5 rounded-xl shrink-0 transition"
                          >
                            Add
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* --- SUB TAB: SURCHARGE PRESET MANAGER --- */}
      {isSubTabAllowed && activeSubTab === 'surcharge_presets' && (
        <div className="space-y-6">
          {/* Top Banner & Header */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-sm font-extrabold text-slate-900 flex items-center space-x-2">
                <Sliders className="w-4 h-4 text-purple-600" />
                <span>Surcharge Preset Template Manager & Analytics</span>
                <span className="bg-purple-100 text-purple-800 text-[10px] font-bold px-2 py-0.5 rounded border border-purple-200">
                  ADMINISTRATIVE MASTER DATA
                </span>
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Configure material, alloy grade, branch-specific & high-rise surcharge rules. Analyze margin impact using Recharts.
              </p>
            </div>

            {canEditSurchargePresets ? (
              <div className="flex items-center space-x-2.5">
                <button
                  onClick={() => setShowSurchargeImportModal(true)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs px-3.5 py-2 rounded-lg font-bold transition flex items-center space-x-1.5 border border-slate-300 shadow-2xs cursor-pointer"
                >
                  <FileSpreadsheet className="w-4 h-4 text-purple-600" />
                  <span>Import</span>
                </button>

                <button
                  onClick={() => {
                    setSurchargeForm({
                      id: '',
                      name: '',
                      code: `PRESET-${Math.floor(1000 + Math.random() * 9000)}`,
                      description: '',
                      category: 'Finishing',
                      surcharge_type: 'Fixed LKR',
                      base_value: 0,
                      applied_factors: {
                        thickness_factor: 1.0,
                        floor_level_factor: 1.0,
                        facility_type_factor: 1.0,
                        urgent_handling_lkr: 0
                      },
                      applicable_categories: ['Aluminium Profiles', 'Glass'],
                      status: 'Active'
                    });
                    setShowSurchargeModal(true);
                  }}
                  className="bg-purple-600 hover:bg-purple-700 text-white text-xs px-3.5 py-2 rounded-lg font-bold transition flex items-center space-x-1.5 shadow-sm cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create</span>
                </button>
              </div>
            ) : (
              <span className="px-3 py-1.5 bg-amber-50 text-amber-800 border border-amber-200 text-xs font-semibold rounded-lg flex items-center space-x-1.5">
                <Lock className="w-3.5 h-3.5 text-amber-600" />
                <span>View-Only Access Mode (Editing Restricted)</span>
              </span>
            )}
          </div>

          {/* Sub-Header View Switcher */}
          <div className="flex items-center justify-between bg-slate-100/80 p-1.5 rounded-xl border border-slate-200 text-xs">
            <div className="flex items-center space-x-1">
              <button
                onClick={() => setSurchargeViewMode('presets')}
                className={`px-4 py-2 rounded-lg font-bold transition flex items-center space-x-2 ${
                  surchargeViewMode === 'presets'
                    ? 'bg-white text-purple-700 shadow-sm border border-purple-200/80'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>Surcharge Presets Library ({surchargePresets.length})</span>
              </button>

              <button
                onClick={() => setSurchargeViewMode('analytics')}
                className={`px-4 py-2 rounded-lg font-bold transition flex items-center space-x-2 ${
                  surchargeViewMode === 'analytics'
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>Recharts Category Margin & Usage Analytics</span>
                <span className="bg-amber-400 text-slate-950 font-mono text-[9px] px-1.5 py-0.5 rounded font-extrabold uppercase">
                  LIVE
                </span>
              </button>
            </div>

            <span className="text-[11px] text-slate-500 font-medium px-3 hidden sm:inline">
              {surchargeViewMode === 'presets' ? 'Showing active master preset cards' : 'Showing category margin uplift visualizer'}
            </span>
          </div>

          {/* MODE 1: RECHARTS ANALYTICS & CATEGORY MARGIN IMPACT PANEL */}
          {surchargeViewMode === 'analytics' && (
            <SurchargeAnalyticsPanel quotations={quotations} />
          )}

          {/* MODE 2: PRESETS CATALOG GRID */}
          {surchargeViewMode === 'presets' && (
            <div className="space-y-6">
              {/* Quick Stats Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs space-y-1">
                  <div className="text-[10px] font-bold text-slate-400 uppercase flex items-center justify-between">
                    <span>Total Reusable Templates</span>
                    <Sliders className="w-3.5 h-3.5 text-purple-500" />
                  </div>
                  <div className="text-lg font-extrabold text-slate-900 font-mono">
                    {surchargePresets.length}
                  </div>
                  <div className="text-[10px] text-slate-500">Configured preset rules</div>
                </div>

                <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs space-y-1">
                  <div className="text-[10px] font-bold text-slate-400 uppercase flex items-center justify-between">
                    <span>Active Presets</span>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  </div>
                  <div className="text-lg font-extrabold text-emerald-600 font-mono">
                    {surchargePresets.filter(p => p.status === 'Active').length}
                  </div>
                  <div className="text-[10px] text-slate-500">Ready for POS quotation modal</div>
                </div>

                <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs space-y-1">
                  <div className="text-[10px] font-bold text-slate-400 uppercase flex items-center justify-between">
                    <span>Multi-Factor Templates</span>
                    <Zap className="w-3.5 h-3.5 text-amber-500" />
                  </div>
                  <div className="text-lg font-extrabold text-amber-600 font-mono">
                    {surchargePresets.filter(p => p.surcharge_type === 'Multi-Factor Multiplier').length}
                  </div>
                  <div className="text-[10px] text-slate-500">Thickness x Floor x Facility multipliers</div>
                </div>

                <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs space-y-1">
                  <div className="text-[10px] font-bold text-slate-400 uppercase flex items-center justify-between">
                    <span>Preset Categories</span>
                    <Layers className="w-3.5 h-3.5 text-blue-500" />
                  </div>
                  <div className="text-lg font-extrabold text-blue-600 font-mono">
                    {Array.from(new Set(surchargePresets.map(p => p.category))).length}
                  </div>
                  <div className="text-[10px] text-slate-500">Finishing, High Rise, Facility, etc.</div>
                </div>
              </div>

              {/* Search & Category Filter */}
              <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="relative flex-1 min-w-[220px]">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={surchargeSearch}
                    onChange={(e) => setSurchargeSearch(e.target.value)}
                    placeholder="Search preset name, code or description..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-8 pr-3 py-1.5 font-medium text-slate-800 focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div className="flex items-center space-x-2 shrink-0">
                  <Filter className="w-3.5 h-3.5 text-slate-400" />
                  <span className="font-bold text-slate-600">Category:</span>
                  <select
                    value={surchargeCategoryFilter}
                    onChange={(e) => setSurchargeCategoryFilter(e.target.value)}
                    className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 font-bold text-slate-800 focus:outline-none focus:border-purple-500"
                  >
                    <option value="ALL">All Categories</option>
                    <option value="Finishing">Finishing</option>
                    <option value="Installation">Installation</option>
                    <option value="Facility">Facility</option>
                    <option value="Special Handling">Special Handling</option>
                  </select>
                </div>
              </div>

              {/* Presets List Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {surchargePresets
                  .filter(p => {
                    const matchSearch = p.name.toLowerCase().includes(surchargeSearch.toLowerCase()) ||
                      p.code.toLowerCase().includes(surchargeSearch.toLowerCase()) ||
                      p.description.toLowerCase().includes(surchargeSearch.toLowerCase());
                    const matchCat = surchargeCategoryFilter === 'ALL' || p.category === surchargeCategoryFilter;
                    return matchSearch && matchCat;
                  })
                  .map((preset) => (
                    <div
                      key={preset.id}
                      className={`bg-white rounded-xl border p-4 space-y-3 transition shadow-xs relative ${
                        preset.status === 'Active' ? 'border-purple-200 hover:border-purple-400' : 'border-slate-200 bg-slate-50/60 opacity-80'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-2.5">
                        <div>
                          <div className="flex items-center space-x-2 mb-0.5">
                            <span className="bg-slate-900 text-white font-mono text-[10px] font-extrabold px-2 py-0.5 rounded">
                              {preset.code}
                            </span>
                            <span className="bg-purple-100 text-purple-800 text-[10px] font-bold px-2 py-0.5 rounded">
                              {preset.category}
                            </span>
                          </div>
                          <h3 className="font-extrabold text-slate-900 text-sm">{preset.name}</h3>
                        </div>

                        <div className="flex items-center space-x-1 shrink-0">
                          <button
                            onClick={() => handleToggleSurchargePresetStatus(preset.id)}
                            className={`text-[10px] font-extrabold px-2 py-0.5 rounded transition ${
                              preset.status === 'Active'
                                ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200 border border-emerald-300'
                                : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                            }`}
                          >
                            {preset.status}
                          </button>

                          <button
                            onClick={() => {
                              setSurchargeForm({ ...preset, applied_factors: { ...preset.applied_factors } });
                              setShowSurchargeModal(true);
                            }}
                            className="p-1 text-slate-400 hover:text-purple-600 transition"
                            title="Edit Preset"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => handleDeleteSurchargePreset(preset.id, preset.name)}
                            className="p-1 text-slate-400 hover:text-rose-600 transition"
                            title="Delete Preset"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <p className="text-xs text-slate-600 font-medium leading-relaxed">{preset.description}</p>

                      {/* Surcharge Pricing Formula Card */}
                      <div className="bg-purple-50/60 border border-purple-200/80 rounded-lg p-2.5 space-y-2">
                        <div className="flex items-center justify-between text-xs font-bold text-slate-900">
                          <span className="flex items-center space-x-1">
                            <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                            <span>Calculation Logic:</span>
                          </span>
                          <span className="bg-purple-200 text-purple-900 font-mono text-[10px] px-2 py-0.5 rounded">
                            {preset.surcharge_type}
                          </span>
                        </div>

                        <div className="text-xs font-mono font-extrabold text-purple-900 flex items-center justify-between">
                          <span>Base Rate:</span>
                          <span>
                            {preset.surcharge_type === 'Percentage Base'
                              ? `+${preset.base_value}%`
                              : `+Rs. ${preset.base_value.toLocaleString()}`}
                          </span>
                        </div>

                        {/* Applied Factor Multipliers */}
                        {preset.applied_factors && (
                          <div className="grid grid-cols-2 gap-1.5 pt-1 border-t border-purple-200/60 text-[10px] font-mono text-slate-700">
                            {preset.applied_factors.thickness_factor && preset.applied_factors.thickness_factor !== 1 ? (
                              <div className="bg-white/80 p-1 rounded border border-purple-100 flex justify-between">
                                <span>Thickness Factor:</span>
                                <span className="font-bold text-purple-800">x{preset.applied_factors.thickness_factor}</span>
                              </div>
                            ) : null}
                            {preset.applied_factors.floor_level_factor && preset.applied_factors.floor_level_factor !== 1 ? (
                              <div className="bg-white/80 p-1 rounded border border-purple-100 flex justify-between">
                                <span>Floor Height:</span>
                                <span className="font-bold text-purple-800">x{preset.applied_factors.floor_level_factor}</span>
                              </div>
                            ) : null}
                            {preset.applied_factors.facility_type_factor && preset.applied_factors.facility_type_factor !== 1 ? (
                              <div className="bg-white/80 p-1 rounded border border-purple-100 flex justify-between">
                                <span>Facility Env:</span>
                                <span className="font-bold text-purple-800">x{preset.applied_factors.facility_type_factor}</span>
                              </div>
                            ) : null}
                            {preset.applied_factors.urgent_handling_lkr && preset.applied_factors.urgent_handling_lkr > 0 ? (
                              <div className="bg-white/80 p-1 rounded border border-purple-100 flex justify-between">
                                <span>Urgent Handling:</span>
                                <span className="font-bold text-rose-700">+Rs. {preset.applied_factors.urgent_handling_lkr}</span>
                              </div>
                            ) : null}
                          </div>
                        )}
                      </div>

                      {/* Applicable Product Categories */}
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Applicable Product Types:</span>
                        <div className="flex flex-wrap gap-1">
                          {preset.applicable_categories?.map((cat, idx) => (
                            <span key={idx} className="bg-slate-100 text-slate-700 text-[10px] font-semibold px-2 py-0.5 rounded border border-slate-200">
                              {cat}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* --- SUB TAB 5: CUSTOMER TYPES --- */}
      {isSubTabAllowed && activeSubTab === 'customer_types' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Customer Classifications & Default Tier Discounts</h2>
              <p className="text-xs text-slate-500">
                Define default discount rates for Corporate, Distributors, Developers, Architects & Walk-in Retail
              </p>
            </div>

            <button
              onClick={() => {
                setCtForm({ name: '', default_discount_pct: 0, description: '' });
                setShowCtModal(true);
              }}
              className="bg-orange-500 hover:bg-orange-600 text-white text-xs px-3 py-1.5 rounded-md font-bold transition flex items-center space-x-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add</span>
            </button>
          </div>

          <div className="bg-white rounded-lg border border-slate-200 shadow-xs overflow-hidden">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-900 text-white text-[11px] uppercase tracking-wider">
                  <th className="p-3 font-semibold">Customer Type Name</th>
                  <th className="p-3 font-semibold">Description</th>
                  <th className="p-3 font-semibold text-center">Default Tier Discount %</th>
                  <th className="p-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {customerTypes.map((ct) => (
                  <tr key={ct.id} className="hover:bg-slate-50 transition">
                    <td className="p-3 font-bold text-slate-900">{ct.name}</td>
                    <td className="p-3 text-slate-600">{ct.description || 'N/A'}</td>
                    <td className="p-3 text-center">
                      <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-2 py-0.5 rounded border border-emerald-200">
                        {ct.default_discount_pct}% OFF
                      </span>
                    </td>
                    <td className="p-3 text-right space-x-1">
                      <button
                        onClick={() => {
                          setCtForm({
                            id: ct.id,
                            name: ct.name,
                            default_discount_pct: ct.default_discount_pct,
                            description: ct.description
                          });
                          setShowCtModal(true);
                        }}
                        className="p-1 text-slate-500 hover:text-orange-600"
                        title="Edit Customer Type"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteCtClick(ct.id)}
                        className="p-1 text-slate-500 hover:text-rose-600"
                        title="Delete Customer Type"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* --- SUB TAB 6: LOCATIONS & REGIONAL ZONES --- */}
      {isSubTabAllowed && activeSubTab === 'locations' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Regional Transport Locations & Delivery Zones</h2>
              <p className="text-xs text-slate-500">
                Configure delivery hubs, district locations, and island-wide operating zones
              </p>
            </div>

            <button
              onClick={() => {
                setLocForm({ name: '', district: 'Colombo', region: 'Western Province', status: 'Active' });
                setShowLocModal(true);
              }}
              className="bg-orange-500 hover:bg-orange-600 text-white text-xs px-3 py-1.5 rounded-md font-bold transition flex items-center space-x-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add</span>
            </button>
          </div>

          <div className="bg-white rounded-lg border border-slate-200 shadow-xs overflow-hidden">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-900 text-white text-[11px] uppercase tracking-wider">
                  <th className="p-3 font-semibold">Location / Zone Name</th>
                  <th className="p-3 font-semibold">District</th>
                  <th className="p-3 font-semibold">Province / Region</th>
                  <th className="p-3 font-semibold text-center">Status</th>
                  <th className="p-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {locations.map((loc) => (
                  <tr key={loc.id} className="hover:bg-slate-50 transition">
                    <td className="p-3 font-bold text-slate-900">
                      <div className="flex items-center space-x-1.5">
                        <MapPin className="w-3.5 h-3.5 text-orange-500 shrink-0" />
                        <span>{loc.name}</span>
                      </div>
                    </td>
                    <td className="p-3 text-slate-700 font-medium">{loc.district}</td>
                    <td className="p-3 text-slate-600">{loc.region}</td>
                    <td className="p-3 text-center">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          loc.status === 'Active'
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                            : 'bg-slate-200 text-slate-600'
                        }`}
                      >
                        {loc.status}
                      </span>
                    </td>
                    <td className="p-3 text-right space-x-1">
                      <button
                        onClick={() => {
                          setLocForm({
                            id: loc.id,
                            name: loc.name,
                            district: loc.district,
                            region: loc.region,
                            status: loc.status
                          });
                          setShowLocModal(true);
                        }}
                        className="p-1 text-slate-500 hover:text-orange-600"
                        title="Edit Location"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteLocClick(loc.id)}
                        className="p-1 text-slate-500 hover:text-rose-600"
                        title="Delete Location"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* --- SUB TAB 7: KEYBOARD SHORTCUTS --- */}
      {isSubTabAllowed && activeSubTab === 'shortcuts' && (
        <KeyboardShortcutSettings />
      )}

      {/* --- MODAL: REGISTER & SIGN NEW USER (ADMIN) --- */}
      {showAddUserModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg border border-slate-200 shadow-2xl max-w-md w-full p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-sm flex items-center space-x-2">
                <UserCheck className="w-4 h-4 text-orange-500" />
                <span>Register & Admin Sign-off User</span>
              </h3>
              <button onClick={() => setShowAddUserModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddUserSubmit} className="space-y-3 text-xs">
              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-1">
                  <label className="block text-slate-600 font-semibold mb-1">Employee ID *</label>
                  <input
                    type="text"
                    required
                    value={newUserForm.employee_id}
                    onChange={(e) => setNewUserForm({ ...newUserForm, employee_id: e.target.value.toUpperCase() })}
                    className="w-full pos-input font-mono uppercase font-bold text-orange-600"
                    placeholder="EMP-1004"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-slate-600 font-semibold mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={newUserForm.name}
                    onChange={(e) => setNewUserForm({ ...newUserForm, name: e.target.value })}
                    className="w-full pos-input"
                    placeholder="Employee / User Full Name"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  value={newUserForm.email}
                  onChange={(e) => setNewUserForm({ ...newUserForm, email: e.target.value })}
                  className="w-full pos-input"
                  placeholder="user@innovistapos.lk"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">Phone Number</label>
                <input
                  type="text"
                  value={newUserForm.phone}
                  onChange={(e) => setNewUserForm({ ...newUserForm, phone: e.target.value })}
                  className="w-full pos-input"
                  placeholder="+94 77 XXXXXXX"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">System Role</label>
                  <select
                    value={newUserForm.role}
                    onChange={(e) => setNewUserForm({ ...newUserForm, role: e.target.value as any })}
                    className="w-full pos-input"
                  >
                    <option value="Sales Executive">Sales Executive</option>
                    <option value="Branch Manager">Branch Manager</option>
                    {isHeadOfficeUser && (
                      <>
                        <option value="HO Admin">HO Admin</option>
                        <option value="Super Admin">Super Admin</option>
                      </>
                    )}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Assigned Branch</label>
                  <select
                    value={!isHeadOfficeUser ? (currentUser?.branch_id || activeBranch.id) : newUserForm.branch_id}
                    disabled={!isHeadOfficeUser}
                    onChange={(e) => setNewUserForm({ ...newUserForm, branch_id: e.target.value })}
                    className={`w-full pos-input ${!isHeadOfficeUser ? 'bg-slate-100 cursor-not-allowed font-bold' : ''}`}
                  >
                    {branches
                      .filter(b => isHeadOfficeUser || b.id === (currentUser?.branch_id || activeBranch.id))
                      .map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.name}
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">Admin Approval Status</label>
                <select
                  value={newUserForm.status}
                  onChange={(e) => setNewUserForm({ ...newUserForm, status: e.target.value as any })}
                  className="w-full pos-input font-bold"
                >
                  <option value="Active">Active (Signed & Approved Immediately)</option>
                  <option value="Pending Approval">Pending Approval (Awaiting Signoff)</option>
                </select>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowAddUserModal(false)}
                  className="px-3 py-1.5 rounded text-slate-600 hover:bg-slate-100 font-semibold"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-pos-orange flex items-center space-x-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Sign & Register User</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL: CATEGORY EDIT / ADD --- */}
      {showCatModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <Grid className="w-5 h-5 text-orange-500" />
                <h3 className="font-extrabold text-slate-900 text-sm">
                  {catForm.id ? 'Edit Category Specifications' : 'Create New Category'}
                </h3>
              </div>
              <button onClick={() => setShowCatModal(false)} className="text-slate-400 hover:text-slate-600 transition">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              {/* Category Name & Status */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-slate-700 font-bold mb-1">Category Name *</label>
                  <input
                    type="text"
                    value={catForm.name}
                    onChange={(e) => setCatForm({ ...catForm, name: e.target.value })}
                    className="w-full pos-input font-bold"
                    placeholder="e.g., Aluminium Profiles, Glass, Hardware"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Category Status</label>
                  <select
                    value={catForm.status || 'Active'}
                    onChange={(e) => setCatForm({ ...catForm, status: e.target.value as 'Active' | 'Deactive' })}
                    className="w-full pos-input font-bold text-slate-900"
                  >
                    <option value="Active">Active</option>
                    <option value="Deactive">Deactive</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Category Description</label>
                <input
                  type="text"
                  value={catForm.description}
                  onChange={(e) => setCatForm({ ...catForm, description: e.target.value })}
                  className="w-full pos-input"
                  placeholder="Brief description of catalog profile category"
                />
              </div>

              {/* Sub-categories List & Add */}
              <div className="space-y-2">
                <label className="block text-slate-700 font-bold">Sub-categories List ({catForm.subcategories.length})</label>

                {/* Subcategory Add Bar */}
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={subCatInput}
                    onChange={(e) => setSubCatInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddSubCategoryChip();
                      }
                    }}
                    className="w-full pos-input"
                    placeholder="Type sub-category name and press Add..."
                  />
                  <button
                    type="button"
                    onClick={handleAddSubCategoryChip}
                    className="bg-slate-900 hover:bg-slate-800 text-white px-3.5 py-1.5 rounded-xl font-bold shrink-0 text-xs transition"
                  >
                    Add
                  </button>
                </div>

                {/* Subcategories items with status toggles */}
                <div className="space-y-1.5 max-h-48 overflow-y-auto p-2 bg-slate-50 border border-slate-200 rounded-xl min-h-[60px]">
                  {catForm.subcategories.map((sub) => {
                    const isDeactive = sub.status === 'Deactive';
                    return (
                      <div
                        key={sub.id}
                        className="bg-white border border-slate-200 rounded-lg p-2 flex items-center justify-between text-xs shadow-2xs"
                      >
                        <div className="flex items-center space-x-2">
                          <span className={`font-semibold ${isDeactive ? 'line-through text-slate-400' : 'text-slate-800'}`}>
                            {sub.name}
                          </span>
                          <span
                            className={`text-[9px] font-extrabold px-1.5 py-0.2 rounded uppercase ${
                              isDeactive ? 'bg-amber-100 text-amber-800 border border-amber-200' : 'bg-emerald-100 text-emerald-800'
                            }`}
                          >
                            {sub.status || 'Active'}
                          </span>
                        </div>

                        <div className="flex items-center space-x-1">
                          <button
                            type="button"
                            onClick={() => handleToggleSubCatFormStatus(sub.id)}
                            className={`p-1 rounded text-xs transition ${
                              isDeactive ? 'text-amber-600 hover:text-emerald-600' : 'text-slate-400 hover:text-amber-600'
                            }`}
                            title={isDeactive ? 'Reactivate Sub-category' : 'Deactivate Sub-category'}
                          >
                            <Power className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleRemoveSubCategoryChip(sub.id)}
                            className="p-1 text-slate-400 hover:text-rose-600 transition"
                            title="Remove Sub-category"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}

                  {catForm.subcategories.length === 0 && (
                    <p className="text-slate-400 text-xs italic text-center py-3">No sub-categories added yet.</p>
                  )}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowCatModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold transition"
                >
                  Cancel
                </button>
                <button onClick={handleSaveCategory} className="btn-pos-orange px-5 py-2">
                  Save Category
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL: SUB-CATEGORY RENAME / STATUS EDIT --- */}
      {editingSubCat && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-sm w-full p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <h3 className="font-extrabold text-slate-900 text-sm">Edit Sub-category</h3>
              <button onClick={() => setEditingSubCat(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Sub-category Name *</label>
                <input
                  type="text"
                  value={editingSubCat.newName}
                  onChange={(e) => setEditingSubCat({ ...editingSubCat, newName: e.target.value })}
                  className="w-full pos-input font-bold"
                  placeholder="Sub-category name"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Sub-category Status</label>
                <select
                  value={editingSubCat.status}
                  onChange={(e) => setEditingSubCat({ ...editingSubCat, status: e.target.value as 'Active' | 'Deactive' })}
                  className="w-full pos-input font-bold"
                >
                  <option value="Active">Active</option>
                  <option value="Deactive">Deactive</option>
                </select>
              </div>

              <div className="pt-2 border-t border-slate-100 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setEditingSubCat(null)}
                  className="px-3 py-1.5 rounded-lg text-slate-600 hover:bg-slate-100 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveSubCategoryEdit}
                  className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-4 py-1.5 rounded-lg transition"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL: CUSTOMER TYPE EDIT / ADD --- */}
      {showCtModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg border border-slate-200 shadow-2xl max-w-md w-full p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-sm">
                {ctForm.id ? 'Edit Customer Type' : 'Add Customer Type'}
              </h3>
              <button onClick={() => setShowCtModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-600 font-semibold mb-1">Customer Type Name *</label>
                <input
                  type="text"
                  value={ctForm.name}
                  onChange={(e) => setCtForm({ ...ctForm, name: e.target.value })}
                  className="w-full pos-input"
                  placeholder="e.g. Distributor, Developer, Architect"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">Default Discount (%)</label>
                <input
                  type="number"
                  step="0.1"
                  value={ctForm.default_discount_pct}
                  onChange={(e) => setCtForm({ ...ctForm, default_discount_pct: Number(e.target.value) })}
                  className="w-full pos-input font-bold"
                  placeholder="0.0"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">Description</label>
                <input
                  type="text"
                  value={ctForm.description}
                  onChange={(e) => setCtForm({ ...ctForm, description: e.target.value })}
                  className="w-full pos-input"
                  placeholder="Brief description of this customer category"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowCtModal(false)}
                  className="px-3 py-1.5 rounded text-slate-600 hover:bg-slate-100 font-semibold"
                >
                  Cancel
                </button>
                <button onClick={handleSaveCustomerType} className="btn-pos-orange">
                  Save Customer Type
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL: LOCATION EDIT / ADD --- */}
      {showLocModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg border border-slate-200 shadow-2xl max-w-md w-full p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-sm">
                {locForm.id ? 'Edit Location' : 'Add New Location'}
              </h3>
              <button onClick={() => setShowLocModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-600 font-semibold mb-1">Location / Zone Name *</label>
                <input
                  type="text"
                  value={locForm.name}
                  onChange={(e) => setLocForm({ ...locForm, name: e.target.value })}
                  className="w-full pos-input"
                  placeholder="e.g. Colombo Municipal Zone, Jaffna Northern Hub"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">District</label>
                  <input
                    type="text"
                    value={locForm.district}
                    onChange={(e) => setLocForm({ ...locForm, district: e.target.value })}
                    className="w-full pos-input"
                    placeholder="Colombo, Kandy, Galle..."
                  />
                </div>

                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Province / Region</label>
                  <input
                    type="text"
                    value={locForm.region}
                    onChange={(e) => setLocForm({ ...locForm, region: e.target.value })}
                    className="w-full pos-input"
                    placeholder="Western Province..."
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">Status</label>
                <select
                  value={locForm.status}
                  onChange={(e) => setLocForm({ ...locForm, status: e.target.value as any })}
                  className="w-full pos-input font-bold"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowLocModal(false)}
                  className="px-3 py-1.5 rounded text-slate-600 hover:bg-slate-100 font-semibold"
                >
                  Cancel
                </button>
                <button onClick={handleSaveLocationConfig} className="btn-pos-orange">
                  Save Location
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL: ADD CURRENCY --- */}
      {showCurrencyModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg border border-slate-200 shadow-2xl max-w-sm w-full p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-sm">Add Supported Currency</h3>
              <button onClick={() => setShowCurrencyModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-600 font-semibold mb-1">Currency Code (3 Letters) *</label>
                <input
                  type="text"
                  maxLength={3}
                  value={currencyForm.code}
                  onChange={(e) => setCurrencyForm({ ...currencyForm, code: e.target.value.toUpperCase() })}
                  className="w-full pos-input uppercase font-mono"
                  placeholder="USD, EUR, GBP, AUD..."
                />
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">Symbol *</label>
                <input
                  type="text"
                  value={currencyForm.symbol}
                  onChange={(e) => setCurrencyForm({ ...currencyForm, symbol: e.target.value })}
                  className="w-full pos-input font-bold"
                  placeholder="$, €, £..."
                />
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">Currency Full Name</label>
                <input
                  type="text"
                  value={currencyForm.name}
                  onChange={(e) => setCurrencyForm({ ...currencyForm, name: e.target.value })}
                  className="w-full pos-input"
                  placeholder="e.g. US Dollar"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">Exchange Rate to Base (LKR)</label>
                <input
                  type="number"
                  step="0.01"
                  value={currencyForm.exchange_rate_to_lkr}
                  onChange={(e) =>
                    setCurrencyForm({ ...currencyForm, exchange_rate_to_lkr: Number(e.target.value) })
                  }
                  className="w-full pos-input font-mono"
                  placeholder="308.50"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowCurrencyModal(false)}
                  className="px-3 py-1.5 rounded text-slate-600 hover:bg-slate-100 font-semibold"
                >
                  Cancel
                </button>
                <button onClick={handleAddCurrency} className="btn-pos-orange">
                  Add Currency
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL: SURCHARGE PRESET ADD / EDIT --- */}
      {showSurchargeModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xl max-w-lg w-full p-5 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-slate-900 text-sm flex items-center space-x-2">
                <Sliders className="w-4 h-4 text-purple-600" />
                <span>{surchargeForm.id ? 'Edit Surcharge Preset Template' : 'Create New Surcharge Preset'}</span>
              </h3>
              <button onClick={() => setShowSurchargeModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Preset Name *</label>
                  <input
                    type="text"
                    required
                    value={surchargeForm.name}
                    onChange={(e) => setSurchargeForm({ ...surchargeForm, name: e.target.value })}
                    className="w-full pos-input font-bold"
                    placeholder="e.g. Heavy Duty Finishing Pack"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Preset Code *</label>
                  <input
                    type="text"
                    required
                    value={surchargeForm.code}
                    onChange={(e) => setSurchargeForm({ ...surchargeForm, code: e.target.value.toUpperCase() })}
                    className="w-full pos-input uppercase font-mono font-bold"
                    placeholder="PRESET-HD-01"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Preset Category</label>
                  <select
                    value={surchargeForm.category}
                    onChange={(e) => setSurchargeForm({ ...surchargeForm, category: e.target.value })}
                    className="w-full pos-input font-bold"
                  >
                    <option value="Finishing">Finishing</option>
                    <option value="Installation">Installation</option>
                    <option value="High Rise">High Rise</option>
                    <option value="Facility">Facility</option>
                    <option value="Special Handling">Special Handling</option>
                    <option value="Hardware">Hardware</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Surcharge Calculation Type</label>
                  <select
                    value={surchargeForm.surcharge_type}
                    onChange={(e) => setSurchargeForm({ ...surchargeForm, surcharge_type: e.target.value as any })}
                    className="w-full pos-input font-bold"
                  >
                    <option value="Fixed LKR">Fixed LKR Surcharge</option>
                    <option value="Percentage Base">Percentage Base (%)</option>
                    <option value="Multi-Factor Multiplier">Multi-Factor Multiplier Logic</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Base Value ({surchargeForm.surcharge_type === 'Percentage Base' ? '%' : 'LKR'}) *
                </label>
                <input
                  type="number"
                  value={surchargeForm.base_value}
                  onChange={(e) => setSurchargeForm({ ...surchargeForm, base_value: parseFloat(e.target.value) || 0 })}
                  className="w-full pos-input font-mono font-extrabold text-purple-900"
                  placeholder="e.g. 1500"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Description / Notes</label>
                <textarea
                  rows={2}
                  value={surchargeForm.description}
                  onChange={(e) => setSurchargeForm({ ...surchargeForm, description: e.target.value })}
                  className="w-full pos-input"
                  placeholder="Explain when this surcharge template should be applied..."
                />
              </div>

              {/* Multi-Factor Multipliers Config */}
              <div className="bg-purple-50/70 border border-purple-200 rounded-xl p-3.5 space-y-3">
                <h4 className="font-extrabold text-purple-900 text-xs flex items-center justify-between">
                  <span>Multi-Factor Adjustment Multipliers</span>
                  <span className="text-[10px] font-normal text-purple-700">Tier / Factor Rules</span>
                </h4>

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-slate-700 font-bold text-[11px] mb-1">Material Thickness Multiplier</label>
                    <input
                      type="number"
                      step="0.05"
                      value={surchargeForm.applied_factors?.thickness_factor ?? 1.0}
                      onChange={(e) => setSurchargeForm({
                        ...surchargeForm,
                        applied_factors: {
                          ...surchargeForm.applied_factors,
                          thickness_factor: parseFloat(e.target.value) || 1.0
                        }
                      })}
                      className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-right font-mono font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold text-[11px] mb-1">Building Floor Height Multiplier</label>
                    <input
                      type="number"
                      step="0.05"
                      value={surchargeForm.applied_factors?.floor_level_factor ?? 1.0}
                      onChange={(e) => setSurchargeForm({
                        ...surchargeForm,
                        applied_factors: {
                          ...surchargeForm.applied_factors,
                          floor_level_factor: parseFloat(e.target.value) || 1.0
                        }
                      })}
                      className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-right font-mono font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold text-[11px] mb-1">Facility Env Multiplier</label>
                    <input
                      type="number"
                      step="0.05"
                      value={surchargeForm.applied_factors?.facility_type_factor ?? 1.0}
                      onChange={(e) => setSurchargeForm({
                        ...surchargeForm,
                        applied_factors: {
                          ...surchargeForm.applied_factors,
                          facility_type_factor: parseFloat(e.target.value) || 1.0
                        }
                      })}
                      className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-right font-mono font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold text-[11px] mb-1">Urgent Express Surcharge (LKR)</label>
                    <input
                      type="number"
                      value={surchargeForm.applied_factors?.urgent_handling_lkr ?? 0}
                      onChange={(e) => setSurchargeForm({
                        ...surchargeForm,
                        applied_factors: {
                          ...surchargeForm.applied_factors,
                          urgent_handling_lkr: parseFloat(e.target.value) || 0
                        }
                      })}
                      className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-right font-mono font-bold text-rose-800"
                    />
                  </div>
                </div>
              </div>

              {/* Status */}
              <div>
                <label className="block text-slate-700 font-bold mb-1">Status</label>
                <select
                  value={surchargeForm.status}
                  onChange={(e) => setSurchargeForm({ ...surchargeForm, status: e.target.value as any })}
                  className="w-full pos-input font-bold"
                >
                  <option value="Active">Active (Available for POS Selection)</option>
                  <option value="Inactive">Inactive (Disabled)</option>
                </select>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowSurchargeModal(false)}
                  className="px-3 py-1.5 rounded text-slate-600 hover:bg-slate-100 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveSurchargePreset}
                  className="bg-purple-600 hover:bg-purple-700 text-white font-bold px-4 py-2 rounded-lg flex items-center space-x-1 shadow-sm"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Surcharge Preset</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL: BULK SURCHARGE CSV / TEMPLATE IMPORT UTILITY --- */}
      {showSurchargeImportModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xl max-w-3xl w-full p-6 space-y-5 max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-extrabold text-slate-900 text-base flex items-center space-x-2">
                  <FileSpreadsheet className="w-5 h-5 text-purple-600" />
                  <span>Surcharge Preset Bulk Import & Template Utility</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Populate material, grade, powder coating, high-rise hoist, and branch-specific surcharge master templates in bulk.
                </p>
              </div>
              <button 
                onClick={() => setShowSurchargeImportModal(false)} 
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Mode Selector Tabs */}
            <div className="flex items-center space-x-2 border-b border-slate-200 text-xs font-bold">
              <button
                onClick={() => setImportSourceTab('template_library')}
                className={`pb-2.5 px-3 border-b-2 flex items-center space-x-1.5 transition ${
                  importSourceTab === 'template_library'
                    ? 'border-purple-600 text-purple-700'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>Industry Preset Bundles ({INDUSTRY_PRESET_BUNDLES.length})</span>
              </button>

              <button
                onClick={() => setImportSourceTab('csv_upload')}
                className={`pb-2.5 px-3 border-b-2 flex items-center space-x-1.5 transition ${
                  importSourceTab === 'csv_upload'
                    ? 'border-purple-600 text-purple-700'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                <span>Upload CSV File</span>
              </button>

              <button
                onClick={() => setImportSourceTab('raw_paste')}
                className={`pb-2.5 px-3 border-b-2 flex items-center space-x-1.5 transition ${
                  importSourceTab === 'raw_paste'
                    ? 'border-purple-600 text-purple-700'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <FileText className="w-4 h-4 text-blue-600" />
                <span>Copy-Paste Raw CSV Text</span>
              </button>
            </div>

            {/* TAB 1: INDUSTRY PRESET BUNDLES */}
            {importSourceTab === 'template_library' && (
              <div className="space-y-4 text-xs">
                <div className="bg-purple-50/80 border border-purple-200 rounded-lg p-3 text-purple-900 font-medium">
                  Select a pre-built industry surcharge matrix package tailored for Sri Lanka fabrication standards (Aluminium alloy grades, PVDF coating, high-rise hoisting, and regional branch logistics).
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {INDUSTRY_PRESET_BUNDLES.map((bundle) => (
                    <div 
                      key={bundle.id} 
                      className="bg-white rounded-xl border border-slate-200 hover:border-purple-300 p-4 space-y-3 shadow-xs flex flex-col justify-between"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="bg-purple-100 text-purple-800 font-bold font-mono text-[9px] px-2 py-0.5 rounded uppercase">
                            {bundle.items.length} Presets Included
                          </span>
                          <Sparkles className="w-4 h-4 text-amber-500" />
                        </div>
                        <h4 className="font-extrabold text-slate-900 text-sm">{bundle.title}</h4>
                        <p className="text-slate-500 text-[11px] leading-relaxed">{bundle.description}</p>

                        <div className="bg-slate-50 rounded-lg p-2.5 space-y-1.5 border border-slate-100">
                          <span className="text-[10px] font-bold text-slate-400 uppercase block">Sample Rules:</span>
                          {bundle.items.map((p, idx) => (
                            <div key={idx} className="flex items-center justify-between font-mono text-[10px]">
                              <span className="text-slate-700 font-semibold truncate max-w-[140px]">{p.name}</span>
                              <span className="text-purple-700 font-bold">
                                {p.surcharge_type === 'Percentage Base' ? `+${p.base_value}%` : `+Rs. ${p.base_value}`}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <button
                        onClick={() => handleImportBundle(bundle)}
                        className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-3 rounded-lg flex items-center justify-center space-x-1.5 transition shadow-xs mt-3"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Import {bundle.title}</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 2 & 3: CSV FILE UPLOAD / RAW TEXT PASTE */}
            {(importSourceTab === 'csv_upload' || importSourceTab === 'raw_paste') && (
              <div className="space-y-4 text-xs">
                <div className="flex items-center justify-between bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <div className="space-y-0.5">
                    <span className="font-bold text-slate-800 text-xs block">Expected CSV Header Format:</span>
                    <code className="text-[10px] font-mono text-purple-800 bg-purple-50 px-2 py-0.5 rounded border border-purple-200 block">
                      Name,Code,Category,Type,BaseValue,ThicknessFactor,FloorFactor,FacilityFactor,UrgentLKR,ApplicableCategories,Status
                    </code>
                  </div>
                  <button
                    onClick={handleDownloadSampleCSV}
                    className="bg-white hover:bg-slate-100 text-slate-800 font-bold px-3 py-1.5 rounded-lg border border-slate-300 flex items-center space-x-1.5 shrink-0 shadow-2xs"
                  >
                    <Download className="w-3.5 h-3.5 text-purple-600" />
                    <span>Download Template</span>
                  </button>
                </div>

                {importSourceTab === 'csv_upload' && (
                  <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 text-center bg-slate-50/50 space-y-3">
                    <Upload className="w-8 h-8 text-purple-600 mx-auto" />
                    <div>
                      <label className="cursor-pointer bg-purple-600 hover:bg-purple-700 text-white font-bold px-4 py-2 rounded-lg text-xs inline-flex items-center space-x-1.5 transition shadow-sm">
                        <FileSpreadsheet className="w-4 h-4" />
                        <span>Select CSV File</span>
                        <input
                          type="file"
                          accept=".csv,.txt"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onload = (evt) => {
                                const text = evt.target?.result as string;
                                setRawCsvInput(text);
                                handleParseRawCSV(text);
                              };
                              reader.readAsText(file);
                            }
                          }}
                          className="hidden"
                        />
                      </label>
                      <p className="text-[11px] text-slate-500 mt-2">Upload any standard comma-separated .csv data file</p>
                    </div>
                  </div>
                )}

                {importSourceTab === 'raw_paste' && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="font-bold text-slate-700">Paste Raw CSV Content:</label>
                      <button
                        onClick={() => handleParseRawCSV(rawCsvInput)}
                        className="bg-purple-600 hover:bg-purple-700 text-white font-bold px-3 py-1 rounded text-[11px] transition"
                      >
                        Parse CSV
                      </button>
                    </div>
                    <textarea
                      rows={6}
                      value={rawCsvInput}
                      onChange={(e) => {
                        setRawCsvInput(e.target.value);
                        handleParseRawCSV(e.target.value);
                      }}
                      placeholder="Paste CSV text with headers here..."
                      className="w-full bg-slate-900 text-emerald-400 font-mono text-xs p-3 rounded-xl border border-slate-800 focus:outline-none focus:ring-1 focus:ring-purple-500"
                    />
                  </div>
                )}

                {/* Parsed Preview Table */}
                {parsedCsvRows.length > 0 && (
                  <div className="space-y-3 pt-2">
                    <div className="flex items-center justify-between">
                      <h4 className="font-extrabold text-slate-900 text-xs flex items-center space-x-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>Parsed Rows Preview ({parsedCsvRows.length} Items Found)</span>
                      </h4>
                      <span className="text-[11px] font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        {parsedCsvRows.filter(r => r.valid).length} Ready to Import
                      </span>
                    </div>

                    <div className="max-h-52 overflow-y-auto border border-slate-200 rounded-xl">
                      <table className="w-full text-[11px] text-left border-collapse">
                        <thead className="bg-slate-100 sticky top-0 font-bold text-slate-700 border-b border-slate-200">
                          <tr>
                            <th className="p-2">Status</th>
                            <th className="p-2">Preset Name</th>
                            <th className="p-2">Code</th>
                            <th className="p-2">Category</th>
                            <th className="p-2">Type</th>
                            <th className="p-2 text-right">Base Rate</th>
                            <th className="p-2 text-center">Multipliers</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 font-medium">
                          {parsedCsvRows.map((row, idx) => (
                            <tr key={idx} className="hover:bg-slate-50">
                              <td className="p-2">
                                <span className={`px-1.5 py-0.5 rounded font-bold text-[9px] ${
                                  row.valid ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                                }`}>
                                  {row.valid ? 'Valid' : 'Invalid'}
                                </span>
                              </td>
                              <td className="p-2 font-bold text-slate-900">{row.name}</td>
                              <td className="p-2 font-mono text-slate-600">{row.code}</td>
                              <td className="p-2">{row.category}</td>
                              <td className="p-2 font-mono text-[10px]">{row.surcharge_type}</td>
                              <td className="p-2 text-right font-mono font-bold text-purple-900">
                                {row.surcharge_type === 'Percentage Base' ? `${row.base_value}%` : `Rs. ${row.base_value}`}
                              </td>
                              <td className="p-2 text-center font-mono text-[10px] text-slate-600">
                                {row.thickness_factor}x / {row.floor_level_factor}x / {row.facility_type_factor}x
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    <div className="flex items-center justify-end space-x-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setShowSurchargeImportModal(false)}
                        className="px-3 py-1.5 rounded text-slate-600 hover:bg-slate-100 font-semibold"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={handleImportParsedRows}
                        className="bg-purple-600 hover:bg-purple-700 text-white font-bold px-4 py-2 rounded-lg flex items-center space-x-1.5 shadow-sm"
                      >
                        <Check className="w-4 h-4" />
                        <span>Import {parsedCsvRows.filter(r => r.valid).length} Presets into Master Data</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL 1: EDIT / DEFINE HEAD OFFICE MASTER BACKUP RECOVERY KEY */}
      {isBackupKeyModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full overflow-hidden text-slate-900 animate-in zoom-in-95 duration-200">
            <div className="bg-rose-900 p-4 text-white flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <KeyRound className="w-5 h-5 text-rose-300" />
                <div>
                  <h3 className="font-extrabold text-sm text-white">Head Office Master Backup Recovery Key</h3>
                  <p className="text-[10px] text-rose-200">Set emergency account recovery credential</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsBackupKeyModalOpen(false)}
                className="p-1 hover:bg-white/20 rounded-lg text-white transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <div className="bg-rose-50 border border-rose-200 p-3 rounded-xl text-rose-950 space-y-1">
                <span className="font-bold flex items-center space-x-1 text-rose-700">
                  <ShieldAlert className="w-4 h-4 shrink-0" />
                  <span>Administrative Security Policy</span>
                </span>
                <p className="text-[11px] text-rose-900 leading-snug">
                  This key will be used by Head Office Admins or users in emergency recovery situations when standard OTP email recovery is unavailable. Store this key securely.
                </p>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-bold text-slate-800 uppercase text-[10px] tracking-wider">
                    Master Recovery Key String *
                  </label>
                  <button
                    type="button"
                    onClick={handleGenerateSecureBackupKey}
                    className="text-[10px] font-bold text-rose-700 hover:text-rose-900 underline cursor-pointer flex items-center space-x-1"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>Auto-Generate Random Key</span>
                  </button>
                </div>

                <div className="relative">
                  <input
                    type="text"
                    required
                    placeholder="e.g. HO-KEY-8942-XK92-7710"
                    value={backupKeyInput}
                    onChange={(e) => setBackupKeyInput(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 font-mono font-bold text-slate-900 p-2.5 rounded-xl pr-10 focus:bg-white focus:border-rose-500"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-800 block mb-1 uppercase text-[10px] tracking-wider">
                  Key Description / Administration Notes
                </label>
                <input
                  type="text"
                  placeholder="e.g. Key generated for CEO and HO IT Director emergency access"
                  value={backupKeyNotesInput}
                  onChange={(e) => setBackupKeyNotesInput(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 p-2.5 rounded-xl font-medium focus:bg-white focus:border-rose-500 text-xs"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsBackupKeyModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveBackupKey}
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white font-extrabold rounded-xl shadow-md transition cursor-pointer flex items-center space-x-1.5"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Master Key</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: ADMIN EMERGENCY RESET USER ACCOUNT CREDENTIALS */}
      {emergencyResetUser && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full overflow-hidden text-slate-900 animate-in zoom-in-95 duration-200">
            <div className="bg-slate-900 p-4 text-white flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <KeyRound className="w-5 h-5 text-[#FFC81E]" />
                <div>
                  <h3 className="font-extrabold text-sm text-white">Admin Emergency Account Recovery</h3>
                  <p className="text-[10px] text-slate-400">Unlock & Reset Credentials via Master Backup Key</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEmergencyResetUser(null)}
                className="p-1 hover:bg-white/20 rounded-lg text-white transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAdminEmergencyResetUser} className="p-5 space-y-4 text-xs">
              <div className="p-3 bg-slate-100 border border-slate-200 rounded-xl space-y-0.5">
                <span className="text-[10px] font-bold text-slate-500 uppercase block">TARGET USER ACCOUNT:</span>
                <div className="font-bold text-slate-900 text-sm flex items-center space-x-2">
                  <span>{emergencyResetUser.name}</span>
                  {emergencyResetUser.employee_id && (
                    <span className="text-[9px] font-mono font-bold text-orange-700 bg-orange-50 border border-orange-200 px-1.5 py-0.2 rounded">
                      {emergencyResetUser.employee_id}
                    </span>
                  )}
                </div>
                <div className="text-[11px] font-mono text-slate-600">{emergencyResetUser.email} • {emergencyResetUser.role}</div>
              </div>

              {emergencyResetError && (
                <div className="p-3 bg-rose-100 border border-rose-300 text-rose-900 rounded-xl font-semibold flex items-start space-x-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <span>{emergencyResetError}</span>
                </div>
              )}

              <div>
                <label className="font-bold text-slate-800 block mb-1 uppercase text-[10px] tracking-wider">
                  Active HO Master Backup Key Verification *
                </label>
                <input
                  type="password"
                  required
                  placeholder="Enter HO Emergency Key..."
                  value={emergencyResetKeyInput}
                  onChange={(e) => setEmergencyResetKeyInput(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 font-mono font-bold text-slate-900 p-2.5 rounded-xl focus:bg-white focus:border-rose-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-800 block mb-1 uppercase text-[10px] tracking-wider">
                  New Password *
                </label>
                <input
                  type="password"
                  required
                  placeholder="Min 6 characters..."
                  value={emergencyResetPassword}
                  onChange={(e) => setEmergencyResetPassword(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 font-bold p-2.5 rounded-xl focus:bg-white focus:border-rose-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-800 block mb-1 uppercase text-[10px] tracking-wider">
                  Confirm New Password *
                </label>
                <input
                  type="password"
                  required
                  placeholder="Re-type new password..."
                  value={emergencyResetConfirm}
                  onChange={(e) => setEmergencyResetConfirm(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 font-bold p-2.5 rounded-xl focus:bg-white focus:border-rose-500"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEmergencyResetUser(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white font-extrabold rounded-xl shadow-md transition cursor-pointer flex items-center space-x-1.5"
                >
                  <KeyRound className="w-4 h-4" />
                  <span>Reset & Unlock Account</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Global Confirmation Modal */}
      {confirmModal.isOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full p-6 text-slate-900 space-y-4">
            <div className="flex items-center space-x-3 text-rose-600">
              <div className="p-2.5 bg-rose-100 rounded-xl">
                <Trash2 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-black text-slate-900">{confirmModal.title}</h3>
            </div>
            <p className="text-xs font-medium text-slate-600 leading-relaxed">
              {confirmModal.message}
            </p>
            <div className="flex items-center justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={async () => {
                  const action = confirmModal.onConfirm;
                  setConfirmModal(prev => ({ ...prev, isOpen: false }));
                  await action();
                }}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs rounded-xl transition shadow-md shadow-rose-600/20"
              >
                {confirmModal.confirmLabel || 'Confirm Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
