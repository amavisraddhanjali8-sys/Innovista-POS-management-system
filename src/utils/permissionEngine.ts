export type SystemRole = 'Super Admin' | 'HO Admin' | 'Branch Manager' | 'Sales Executive';

export type PermissionKey =
  // Master Data & Surcharges
  | 'view_master_data'
  | 'edit_master_data'
  | 'view_surcharge_presets'
  | 'edit_surcharge_presets'
  | 'apply_surcharges'
  // Quotations & Billing
  | 'create_quotations'
  | 'edit_quotations'
  | 'delete_quotations'
  | 'approve_quotations'
  | 'override_prices_discounts'
  | 'export_pdf_print'
  // Inventory & Product Catalog
  | 'view_inventory'
  | 'edit_inventory'
  | 'view_cost_prices'
  | 'edit_master_prices'
  // Financials & Analytics
  | 'view_sales_analytics'
  | 'view_surcharge_analytics'
  // System Configurations & Branding
  | 'view_company_branding'
  | 'view_bank_currency'
  | 'manage_users'
  | 'manage_roles_permissions'
  | 'view_backup_export'
  | 'view_shortcuts';

export interface PermissionDefinition {
  key: PermissionKey;
  label: string;
  description: string;
  category: 'Master Data & Surcharges' | 'Quotations & Billing' | 'Inventory & Product Catalog' | 'Financials & Analytics' | 'System Configurations & Branding';
  isSuperAdminDefaultOnly: boolean;
}

export const PERMISSION_DEFINITIONS: PermissionDefinition[] = [
  // --- Category 1: Master Data & Surcharges ---
  {
    key: 'view_master_data',
    label: 'View Master Data Configurations',
    description: 'Access to Categories, Customer Types, and Locations/Regions in Settings',
    category: 'Master Data & Surcharges',
    isSuperAdminDefaultOnly: true
  },
  {
    key: 'edit_master_data',
    label: 'Edit Master Data Configurations',
    description: 'Add, update, or delete Categories, Customer Types, and Locations/Regions',
    category: 'Master Data & Surcharges',
    isSuperAdminDefaultOnly: true
  },
  {
    key: 'view_surcharge_presets',
    label: 'View Surcharge Presets & Surcharge Details',
    description: 'Access to Surcharge Preset templates, multi-factor pricing rules & surcharge matrices',
    category: 'Master Data & Surcharges',
    isSuperAdminDefaultOnly: true
  },
  {
    key: 'edit_surcharge_presets',
    label: 'Edit Surcharge Presets & Pricing Factors',
    description: 'Create, edit, delete or import Surcharge Presets and modify pricing multipliers',
    category: 'Master Data & Surcharges',
    isSuperAdminDefaultOnly: true
  },
  {
    key: 'apply_surcharges',
    label: 'Apply Surcharges in POS Billing',
    description: 'Utilize 11-category surcharge calculation engine and preset multipliers in cart items',
    category: 'Master Data & Surcharges',
    isSuperAdminDefaultOnly: false
  },

  // --- Category 2: Quotations & Billing ---
  {
    key: 'create_quotations',
    label: 'Create & Save Sales Quotations',
    description: 'Add items to cart and generate new sales orders and quotations',
    category: 'Quotations & Billing',
    isSuperAdminDefaultOnly: false
  },
  {
    key: 'edit_quotations',
    label: 'Edit Existing Quotations',
    description: 'Modify line items, quantities, or terms on saved quotations',
    category: 'Quotations & Billing',
    isSuperAdminDefaultOnly: false
  },
  {
    key: 'delete_quotations',
    label: 'Delete / Cancel Quotations',
    description: 'Remove or void existing quotations in order history',
    category: 'Quotations & Billing',
    isSuperAdminDefaultOnly: false
  },
  {
    key: 'approve_quotations',
    label: 'Sign & Approve Quotations',
    description: 'Grant administrative signoff on pending high-value quotations or credit terms',
    category: 'Quotations & Billing',
    isSuperAdminDefaultOnly: false
  },
  {
    key: 'override_prices_discounts',
    label: 'Price & Discount Overrides',
    description: 'Apply custom manual unit price overrides or extra line item discount percentages in cart',
    category: 'Quotations & Billing',
    isSuperAdminDefaultOnly: false
  },
  {
    key: 'export_pdf_print',
    label: 'Export PDF & Print Quotations',
    description: 'Generate official PDF documents or print customer quotations',
    category: 'Quotations & Billing',
    isSuperAdminDefaultOnly: false
  },

  // --- Category 3: Inventory & Product Catalog ---
  {
    key: 'view_inventory',
    label: 'View Product Catalog',
    description: 'Access product specifications, aluminium profiles, glass and accessories catalog',
    category: 'Inventory & Product Catalog',
    isSuperAdminDefaultOnly: false
  },
  {
    key: 'edit_inventory',
    label: 'Add & Edit Catalog Products',
    description: 'Create new products, edit specifications, upload images, and manage catalog items',
    category: 'Inventory & Product Catalog',
    isSuperAdminDefaultOnly: false
  },
  {
    key: 'view_cost_prices',
    label: 'View Head Office Cost Prices',
    description: 'View internal product cost prices, margin thresholds, and cost ceiling limits',
    category: 'Inventory & Product Catalog',
    isSuperAdminDefaultOnly: true
  },
  {
    key: 'edit_master_prices',
    label: 'Edit Base Product Selling Prices',
    description: 'Update base product selling prices and propose price changes across catalog',
    category: 'Inventory & Product Catalog',
    isSuperAdminDefaultOnly: false
  },

  // --- Category 4: Financials & Analytics ---
  {
    key: 'view_sales_analytics',
    label: 'View Sales & Revenue Dashboard',
    description: 'Access executive sales analytics, revenue metrics, and performance charts',
    category: 'Financials & Analytics',
    isSuperAdminDefaultOnly: false
  },
  {
    key: 'view_surcharge_analytics',
    label: 'View Surcharge Revenue & Margin Analytics',
    description: 'Analyze surcharge uplift impact, category breakdowns, and profit margins',
    category: 'Financials & Analytics',
    isSuperAdminDefaultOnly: false
  },

  // --- Category 5: System Configurations & Branding ---
  {
    key: 'view_company_branding',
    label: 'Company Branding & Details',
    description: 'View and edit company registration, VAT/Tax IDs, address, and logo',
    category: 'System Configurations & Branding',
    isSuperAdminDefaultOnly: false
  },
  {
    key: 'view_bank_currency',
    label: 'Bank Accounts & Currencies',
    description: 'View and edit banking details, SWIFT codes, and exchange rate settings',
    category: 'System Configurations & Branding',
    isSuperAdminDefaultOnly: false
  },
  {
    key: 'manage_users',
    label: 'User Management & Signing',
    description: 'Approve pending registration requests, assign branch roles, and activate user accounts',
    category: 'System Configurations & Branding',
    isSuperAdminDefaultOnly: false
  },
  {
    key: 'manage_roles_permissions',
    label: 'Manage RBAC Role Permission Matrix',
    description: 'Configure role-based view and action permissions across all staff roles',
    category: 'System Configurations & Branding',
    isSuperAdminDefaultOnly: true
  },
  {
    key: 'view_backup_export',
    label: 'Database Backup & Export',
    description: 'Trigger periodic manual backups and download complete JSON/CSV data dumps',
    category: 'System Configurations & Branding',
    isSuperAdminDefaultOnly: false
  },
  {
    key: 'view_shortcuts',
    label: 'Keyboard Hotkeys Configuration',
    description: 'View and customize global POS keyboard shortcuts and shortcut mappings',
    category: 'System Configurations & Branding',
    isSuperAdminDefaultOnly: false
  }
];

export type RolePermissionsMap = Record<SystemRole, Record<PermissionKey, boolean>>;

export const DEFAULT_ROLE_PERMISSIONS: RolePermissionsMap = {
  'Super Admin': {
    view_master_data: true,
    edit_master_data: true,
    view_surcharge_presets: true,
    edit_surcharge_presets: true,
    apply_surcharges: true,
    create_quotations: true,
    edit_quotations: true,
    delete_quotations: true,
    approve_quotations: true,
    override_prices_discounts: true,
    export_pdf_print: true,
    view_inventory: true,
    edit_inventory: true,
    view_cost_prices: true,
    edit_master_prices: true,
    view_sales_analytics: true,
    view_surcharge_analytics: true,
    view_company_branding: true,
    view_bank_currency: true,
    manage_users: true,
    manage_roles_permissions: true,
    view_backup_export: true,
    view_shortcuts: true
  },
  'HO Admin': {
    view_master_data: true,
    edit_master_data: true,
    view_surcharge_presets: true,
    edit_surcharge_presets: true,
    apply_surcharges: true,
    create_quotations: true,
    edit_quotations: true,
    delete_quotations: true,
    approve_quotations: true,
    override_prices_discounts: true,
    export_pdf_print: true,
    view_inventory: true,
    edit_inventory: true,
    view_cost_prices: false, // Default Super Admin exclusive!
    edit_master_prices: true,
    view_sales_analytics: true,
    view_surcharge_analytics: true,
    view_company_branding: true,
    view_bank_currency: true,
    manage_users: true,
    manage_roles_permissions: false, // Default Super Admin exclusive!
    view_backup_export: true,
    view_shortcuts: true
  },
  'Branch Manager': {
    view_master_data: false,
    edit_master_data: false,
    view_surcharge_presets: false,
    edit_surcharge_presets: false,
    apply_surcharges: true,
    create_quotations: true,
    edit_quotations: true,
    delete_quotations: false,
    approve_quotations: true,
    override_prices_discounts: true,
    export_pdf_print: true,
    view_inventory: true,
    edit_inventory: false,
    view_cost_prices: false,
    edit_master_prices: false,
    view_sales_analytics: true,
    view_surcharge_analytics: false,
    view_company_branding: true,
    view_bank_currency: false,
    manage_users: false,
    manage_roles_permissions: false,
    view_backup_export: false,
    view_shortcuts: true
  },
  'Sales Executive': {
    view_master_data: false,
    edit_master_data: false,
    view_surcharge_presets: false,
    edit_surcharge_presets: false,
    apply_surcharges: true,
    create_quotations: true,
    edit_quotations: false,
    delete_quotations: false,
    approve_quotations: false,
    override_prices_discounts: false,
    export_pdf_print: true,
    view_inventory: true,
    edit_inventory: false,
    view_cost_prices: false,
    edit_master_prices: false,
    view_sales_analytics: false,
    view_surcharge_analytics: false,
    view_company_branding: false,
    view_bank_currency: false,
    manage_users: false,
    manage_roles_permissions: false,
    view_backup_export: false,
    view_shortcuts: true
  }
};

export const PERMISSIONS_STORAGE_KEY = 'innovista_role_permissions';

export function getSavedRolePermissions(): RolePermissionsMap {
  try {
    const saved = localStorage.getItem(PERMISSIONS_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        'Super Admin': { ...DEFAULT_ROLE_PERMISSIONS['Super Admin'], ...(parsed['Super Admin'] || {}) },
        'HO Admin': { ...DEFAULT_ROLE_PERMISSIONS['HO Admin'], ...(parsed['HO Admin'] || {}) },
        'Branch Manager': { ...DEFAULT_ROLE_PERMISSIONS['Branch Manager'], ...(parsed['Branch Manager'] || {}) },
        'Sales Executive': { ...DEFAULT_ROLE_PERMISSIONS['Sales Executive'], ...(parsed['Sales Executive'] || {}) }
      };
    }
  } catch (e) {
    console.error('Failed to load role permissions:', e);
  }
  return { ...DEFAULT_ROLE_PERMISSIONS };
}

export function saveRolePermissions(map: RolePermissionsMap): void {
  try {
    localStorage.setItem(PERMISSIONS_STORAGE_KEY, JSON.stringify(map));
    window.dispatchEvent(new CustomEvent('innovista_permissions_changed', { detail: map }));
  } catch (e) {
    console.error('Failed to save role permissions:', e);
  }
}

export function resetRolePermissionsToDefault(): RolePermissionsMap {
  const defaults = JSON.parse(JSON.stringify(DEFAULT_ROLE_PERMISSIONS));
  saveRolePermissions(defaults);
  return defaults;
}

export function hasPermission(role: SystemRole | string | undefined | null, key: PermissionKey): boolean {
  if (!role) return false;
  
  // Super Admin always has full root access
  if (role === 'Super Admin' || role === 'HO MASTER') {
    return true;
  }

  const map = getSavedRolePermissions();
  const roleKey = role as SystemRole;
  
  if (map[roleKey] && map[roleKey][key] !== undefined) {
    return map[roleKey][key];
  }

  return false;
}
