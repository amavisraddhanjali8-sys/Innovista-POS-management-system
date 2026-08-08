import { BranchSpecificSettings, BranchPushDirective, Branch } from '../types';

const STORAGE_KEY_BRANCH_SETTINGS = 'innovista_branch_settings_map_v1';
const STORAGE_KEY_PUSH_DIRECTIVES = 'innovista_branch_push_directives_v1';

// Initial default configuration per branch
export const DEFAULT_BRANCH_SETTINGS_MAP: Record<string, BranchSpecificSettings> = {
  'b-ho': {
    branch_id: 'b-ho',
    branch_code: 'HO',
    branch_name: 'Head Office Admin Center',
    custom_phone: '+94 11 288 9000 / +94 77 345 6789',
    custom_email: 'head-office@innovistapos.lk',
    custom_address: 'No. 102 Innovista Tower, Nawala Road, Rajagiriya, Colombo',
    custom_manager_title: 'Saman Perera (Master Admin)',
    custom_bank_name: 'Commercial Bank of Ceylon PLC',
    custom_account_no: '1000-849201-001',
    custom_branch_name: 'Nawala Corporate Branch',
    custom_currency: 'LKR',
    max_executive_discount_pct: 20,
    require_ho_discount_approval_above_pct: 15,
    allow_manual_price_override: true,
    allow_branch_transport_override: true,
    auto_print_invoice_on_save: true,
    regional_transport_surcharge_pct: 0.0,
    last_pushed_at: '2026-08-07 10:00 AM',
    last_pushed_by: 'Head Office Master Server',
    push_version: 1,
    push_notes: 'Initial Master Head Office System Defaults'
  },
  'b-cmb': {
    branch_id: 'b-cmb',
    branch_code: 'CMB',
    branch_name: 'Colombo Port & City Sales',
    custom_phone: '+94 11 456 7890',
    custom_email: 'colombo@innovistapos.lk',
    custom_address: '344 Baseline Road, Colombo 09',
    custom_manager_title: 'Nimal Jayasinghe (Branch Manager)',
    custom_bank_name: 'Commercial Bank of Ceylon PLC',
    custom_account_no: '1000-849201-002',
    custom_branch_name: 'Borella City Branch',
    custom_currency: 'LKR',
    max_executive_discount_pct: 15,
    require_ho_discount_approval_above_pct: 10,
    allow_manual_price_override: true,
    allow_branch_transport_override: true,
    auto_print_invoice_on_save: true,
    regional_transport_surcharge_pct: 0.0,
    last_pushed_at: '2026-08-07 10:30 AM',
    last_pushed_by: 'Saman Perera (HO Admin)',
    push_version: 1,
    push_notes: 'Urban Commercial Pricing & Port Logistics Policy'
  },
  'b-kdy': {
    branch_id: 'b-kdy',
    branch_code: 'KDY',
    branch_name: 'Kandy Hill Country Branch',
    custom_phone: '+94 81 223 4567',
    custom_email: 'kandy@innovistapos.lk',
    custom_address: '88 William Gopallawa Mawatha, Kandy',
    custom_manager_title: 'Kamal Silva (Branch Manager)',
    custom_bank_name: 'Hatton National Bank PLC',
    custom_account_no: '0030-100293-501',
    custom_branch_name: 'Kandy Main Branch',
    custom_currency: 'LKR',
    max_executive_discount_pct: 12,
    require_ho_discount_approval_above_pct: 8,
    allow_manual_price_override: false,
    allow_branch_transport_override: true,
    auto_print_invoice_on_save: true,
    regional_transport_surcharge_pct: 3.5,
    last_pushed_at: '2026-08-07 11:15 AM',
    last_pushed_by: 'Saman Perera (HO Admin)',
    push_version: 1,
    push_notes: 'Hill Country Freight Surcharge (+3.5%) & Discount Policy'
  },
  'b-gle': {
    branch_id: 'b-gle',
    branch_code: 'GLE',
    branch_name: 'Galle Coastal & Southern Node',
    custom_phone: '+94 91 224 8899',
    custom_email: 'galle@innovistapos.lk',
    custom_address: '12 Matara Road, Pettigalawatta, Galle',
    custom_manager_title: 'Anura Fernando (Branch Manager)',
    custom_bank_name: 'Bank of Ceylon',
    custom_account_no: '7020-334112-001',
    custom_branch_name: 'Galle Fort Branch',
    custom_currency: 'LKR',
    max_executive_discount_pct: 12,
    require_ho_discount_approval_above_pct: 8,
    allow_manual_price_override: false,
    allow_branch_transport_override: true,
    auto_print_invoice_on_save: false,
    regional_transport_surcharge_pct: 2.5,
    last_pushed_at: '2026-08-07 11:45 AM',
    last_pushed_by: 'Saman Perera (HO Admin)',
    push_version: 1,
    push_notes: 'Southern Expressway Freight Policy & Local Bank Terms'
  },
  'b-jfn': {
    branch_id: 'b-jfn',
    branch_code: 'JFN',
    branch_name: 'Jaffna Northern Gateway',
    custom_phone: '+94 21 222 3411',
    custom_email: 'jaffna@innovistapos.lk',
    custom_address: '45 Hospital Road, Jaffna',
    custom_manager_title: 'K. Rajendran (Branch Manager)',
    custom_bank_name: 'People\'s Bank',
    custom_account_no: '0480-200192-301',
    custom_branch_name: 'Jaffna Main Branch',
    custom_currency: 'LKR',
    max_executive_discount_pct: 10,
    require_ho_discount_approval_above_pct: 6,
    allow_manual_price_override: false,
    allow_branch_transport_override: false,
    auto_print_invoice_on_save: true,
    regional_transport_surcharge_pct: 5.0,
    last_pushed_at: '2026-08-07 12:00 PM',
    last_pushed_by: 'Saman Perera (HO Admin)',
    push_version: 1,
    push_notes: 'Northern Corridor Logistics Surcharge (+5.0%) Policy'
  }
};

export const INITIAL_PUSH_DIRECTIVES: BranchPushDirective[] = [
  {
    id: 'push-dir-101',
    timestamp: new Date().toISOString(),
    pushed_by: 'Saman Perera (Head Office Admin)',
    target_branch_id: 'b-kdy',
    target_branch_code: 'KDY',
    target_branch_name: 'Kandy Hill Country Branch',
    directive_title: 'Kandy Hill Country Operational Policy & Surcharge Directive',
    version_number: 1,
    changes_summary: [
      'Set Max Executive Discount Limit to 12.0%',
      'Require Head Office approval for discounts exceeding 8.0%',
      'Applied +3.5% Hill Country Regional Freight Surcharge',
      'Configured local Hatton National Bank payment details'
    ],
    settings_snapshot: DEFAULT_BRANCH_SETTINGS_MAP['b-kdy'],
    status: 'Pushed & Active'
  },
  {
    id: 'push-dir-102',
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    pushed_by: 'Saman Perera (Head Office Admin)',
    target_branch_id: 'b-gle',
    target_branch_code: 'GLE',
    target_branch_name: 'Galle Coastal & Southern Node',
    directive_title: 'Galle Branch Local Banking & Discount Directive',
    version_number: 1,
    changes_summary: [
      'Updated branch bank details to Bank of Ceylon Galle Fort Branch',
      'Configured +2.5% Expressway Logistics Surcharge',
      'Enforced Sales Executive discount limit of 12.0%'
    ],
    settings_snapshot: DEFAULT_BRANCH_SETTINGS_MAP['b-gle'],
    status: 'Pushed & Active'
  }
];

// Read settings map from LocalStorage
export function getBranchSettingsMap(): Record<string, BranchSpecificSettings> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_BRANCH_SETTINGS);
    if (raw) {
      const parsed = JSON.parse(raw);
      return { ...DEFAULT_BRANCH_SETTINGS_MAP, ...parsed };
    }
  } catch (e) {
    console.error('Failed to parse branch settings map from localStorage', e);
  }
  return { ...DEFAULT_BRANCH_SETTINGS_MAP };
}

// Get branch settings for a specific branch
export function getBranchSettings(branchId: string, branchFallback?: Branch): BranchSpecificSettings {
  const map = getBranchSettingsMap();
  if (map[branchId]) {
    return map[branchId];
  }
  // Generate default if not present
  const code = branchFallback?.code || 'BR';
  const name = branchFallback?.name || 'Branch Office';
  return {
    branch_id: branchId,
    branch_code: code,
    branch_name: name,
    custom_phone: '+94 11 000 0000',
    custom_email: `${code.toLowerCase()}@innovistapos.lk`,
    custom_address: branchFallback?.location || 'Branch Office Address',
    custom_manager_title: branchFallback?.manager_name || 'Branch Manager',
    custom_currency: 'LKR',
    max_executive_discount_pct: 10,
    require_ho_discount_approval_above_pct: 8,
    allow_manual_price_override: false,
    allow_branch_transport_override: true,
    auto_print_invoice_on_save: true,
    regional_transport_surcharge_pct: 0.0,
    last_pushed_at: new Date().toLocaleString(),
    last_pushed_by: 'Head Office Admin',
    push_version: 1,
    push_notes: 'Standard Default Branch Policy'
  };
}

// Save branch settings locally
export function saveBranchSettings(settings: BranchSpecificSettings): void {
  try {
    const map = getBranchSettingsMap();
    map[settings.branch_id] = settings;
    localStorage.setItem(STORAGE_KEY_BRANCH_SETTINGS, JSON.stringify(map));
    window.dispatchEvent(new CustomEvent('innovista_branch_settings_updated', { detail: settings }));
  } catch (e) {
    console.error('Failed to save branch settings to localStorage', e);
  }
}

// Push settings to target branch
export function pushSettingsToBranch(
  targetBranchId: string,
  settings: BranchSpecificSettings,
  pushedBy: string,
  notes?: string
): { updatedSettings: BranchSpecificSettings; directive: BranchPushDirective } {
  const now = new Date();
  const timestampStr = now.toLocaleString();

  const newVersion = (settings.push_version || 1) + 1;
  const updatedSettings: BranchSpecificSettings = {
    ...settings,
    last_pushed_at: timestampStr,
    last_pushed_by: pushedBy,
    push_version: newVersion,
    push_notes: notes || `Head Office Policy Push Version ${newVersion}`
  };

  saveBranchSettings(updatedSettings);

  const changesSummary: string[] = [
    `Pushed Max Discount Limit: ${updatedSettings.max_executive_discount_pct}%`,
    `HO Approval Threshold: >${updatedSettings.require_ho_discount_approval_above_pct}%`,
    `Regional Transport Surcharge: +${updatedSettings.regional_transport_surcharge_pct}%`,
    `Manual Unit Price Override: ${updatedSettings.allow_manual_price_override ? 'ALLOWED' : 'RESTRICTED'}`,
    `Branch Bank Info: ${updatedSettings.custom_bank_name || 'Commercial Bank'}`
  ];

  const directive: BranchPushDirective = {
    id: `push-dir-${Date.now()}`,
    timestamp: now.toISOString(),
    pushed_by: pushedBy,
    target_branch_id: targetBranchId,
    target_branch_code: updatedSettings.branch_code,
    target_branch_name: updatedSettings.branch_name,
    directive_title: `HO Directives Push v${newVersion} for ${updatedSettings.branch_name}`,
    version_number: newVersion,
    changes_summary: changesSummary,
    settings_snapshot: updatedSettings,
    status: 'Pushed & Active'
  };

  savePushDirective(directive);

  return { updatedSettings, directive };
}

// Save Push Directive Audit Record
export function savePushDirective(directive: BranchPushDirective): void {
  try {
    const directives = getBranchPushDirectives();
    directives.unshift(directive);
    localStorage.setItem(STORAGE_KEY_PUSH_DIRECTIVES, JSON.stringify(directives.slice(0, 50)));
    window.dispatchEvent(new CustomEvent('innovista_branch_directive_pushed', { detail: directive }));
  } catch (e) {
    console.error('Failed to save push directive', e);
  }
}

// Get push directives list
export function getBranchPushDirectives(branchId?: string): BranchPushDirective[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PUSH_DIRECTIVES);
    let list: BranchPushDirective[] = raw ? JSON.parse(raw) : INITIAL_PUSH_DIRECTIVES;
    if (branchId && branchId !== 'ALL' && branchId !== 'b-ho') {
      list = list.filter(d => d.target_branch_id === branchId || d.target_branch_id === 'ALL');
    }
    return list;
  } catch (e) {
    console.error('Failed to read push directives', e);
    return INITIAL_PUSH_DIRECTIVES;
  }
}

// Check Star Topology Networking Permission
// Rule: Only Head Office (HO) can network with and push to other branches. Non-HO branches CANNOT network with peer branches.
export function isPeerBranchNetworkingAllowed(activeBranchCode: string): boolean {
  return activeBranchCode === 'HO';
}
