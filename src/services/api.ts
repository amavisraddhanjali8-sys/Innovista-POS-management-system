import { 
  Product, 
  PriceHistory, 
  Branch, 
  Vehicle, 
  TransportRules, 
  SiteLocation, 
  Quotation, 
  TransportCalculationInput, 
  TransportCalculationResult, 
  RealTimeEvent,
  BranchPriceOverride,
  CustomerPriceOverride,
  DiscountApprovalRequest,
  PricePriorityResolution,
  Customer,
  CompanySettings,
  SystemUser,
  CategoryConfig,
  LocationConfig,
  CustomerTypeConfig
} from '../types';


const API_BASE = '/api';

async function parseJsonResponse<T>(res: Response, defaultErrorMessage: string): Promise<T> {
  if (!res.ok) {
    throw new Error(`${defaultErrorMessage} (Status ${res.status})`);
  }
  const contentType = res.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) {
    throw new Error(`${defaultErrorMessage}: Invalid non-JSON server response`);
  }
  return res.json();
}

export async function fetchProducts(): Promise<Product[]> {
  const res = await fetch(`${API_BASE}/products`);
  if (!res.ok) throw new Error('Failed to fetch products');
  return res.json();
}

export async function resolvePricePriority(
  product_id: string, 
  branch_id?: string, 
  customer_name?: string
): Promise<PricePriorityResolution> {
  const res = await fetch(`${API_BASE}/prices/resolve`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ product_id, branch_id, customer_name })
  });
  if (!res.ok) throw new Error('Failed to resolve price priority');
  return res.json();
}

export async function fetchBranchPrices(): Promise<BranchPriceOverride[]> {
  const res = await fetch(`${API_BASE}/branch-prices`);
  if (!res.ok) throw new Error('Failed to fetch branch prices');
  return res.json();
}

export async function createBranchPriceOverride(override: Partial<BranchPriceOverride>): Promise<BranchPriceOverride> {
  const res = await fetch(`${API_BASE}/branch-prices`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(override)
  });
  if (!res.ok) throw new Error('Failed to create branch price override');
  return res.json();
}

export async function deleteBranchPriceOverride(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/branch-prices/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete branch price override');
}

export async function fetchCustomerPrices(): Promise<CustomerPriceOverride[]> {
  const res = await fetch(`${API_BASE}/customer-prices`);
  if (!res.ok) throw new Error('Failed to fetch customer prices');
  return res.json();
}

export async function createCustomerPriceOverride(rule: Partial<CustomerPriceOverride>): Promise<CustomerPriceOverride> {
  const res = await fetch(`${API_BASE}/customer-prices`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(rule)
  });
  if (!res.ok) throw new Error('Failed to create customer price rule');
  return res.json();
}

export async function deleteCustomerPriceOverride(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/customer-prices/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete customer price rule');
}

export async function fetchDiscountRequests(): Promise<DiscountApprovalRequest[]> {
  const res = await fetch(`${API_BASE}/discount-requests`);
  if (!res.ok) throw new Error('Failed to fetch discount requests');
  return res.json();
}

export async function createDiscountRequest(req: Partial<DiscountApprovalRequest>): Promise<DiscountApprovalRequest> {
  const res = await fetch(`${API_BASE}/discount-requests`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(req)
  });
  if (!res.ok) throw new Error('Failed to create discount approval request');
  return res.json();
}

export async function approveDiscountRequest(id: string, approved: boolean, reviewed_by?: string, notes?: string): Promise<DiscountApprovalRequest> {
  const res = await fetch(`${API_BASE}/discount-requests/${id}/approve`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ approved, reviewed_by, notes })
  });
  if (!res.ok) throw new Error('Failed to process discount approval');
  return res.json();
}

export async function updateBranchMargin(branchId: string, margin_pct: number): Promise<Branch> {
  const res = await fetch(`${API_BASE}/branches/${branchId}/margin`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ margin_pct })
  });
  if (!res.ok) throw new Error('Failed to update branch margin');
  return res.json();
}

export async function updateProductPrice(
  id: string, 
  new_price: number, 
  updated_by: string, 
  reason: string, 
  effective_date?: string
): Promise<{ product: Product; history: PriceHistory }> {
  const res = await fetch(`${API_BASE}/products/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ new_price, updated_by, reason, effective_date })
  });
  if (!res.ok) throw new Error('Failed to update product price');
  return res.json();
}

export async function batchUpdateProductPrices(
  items: Array<{ id: string; new_price: number; old_price: number }>,
  updated_by: string,
  reason: string,
  effective_date?: string,
  category?: string,
  supplier?: string
): Promise<{ products: Product[]; history: PriceHistory[] }> {
  const res = await fetch(`${API_BASE}/products/batch-margin`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ items, updated_by, reason, effective_date, category, supplier })
  });
  if (!res.ok) throw new Error('Failed to execute batch margin update');
  return res.json();
}

export async function updateProductMasterData(
  id: string,
  productData: Partial<Product> & { reason?: string; effective_date?: string }
): Promise<{ product: Product; history?: PriceHistory }> {
  const res = await fetch(`${API_BASE}/products/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(productData)
  });
  if (!res.ok) throw new Error('Failed to update product master data');
  return res.json();
}

export async function addProduct(product: Partial<Product>): Promise<Product> {
  const res = await fetch(`${API_BASE}/products`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(product)
  });
  if (!res.ok) throw new Error('Failed to add product');
  return res.json();
}

export async function deleteProduct(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/products/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete product');
}

export async function proposePriceChange(
  id: string, 
  proposed_price: number, 
  proposed_by: string, 
  proposed_reason: string
): Promise<Product> {
  const res = await fetch(`${API_BASE}/products/${id}/propose`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ proposed_price, proposed_by, proposed_reason })
  });
  if (!res.ok) throw new Error('Failed to submit price proposal');
  return res.json();
}

export async function approvePriceChange(
  id: string, 
  approved: boolean, 
  approved_by: string
): Promise<Product> {
  const res = await fetch(`${API_BASE}/products/${id}/approve`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ approved, approved_by })
  });
  if (!res.ok) throw new Error('Failed to process approval');
  return res.json();
}

export async function fetchPriceHistory(): Promise<PriceHistory[]> {
  const res = await fetch(`${API_BASE}/prices/history`);
  if (!res.ok) throw new Error('Failed to fetch price history');
  return res.json();
}

export async function fetchBranches(): Promise<Branch[]> {
  const res = await fetch(`${API_BASE}/branches`);
  if (!res.ok) throw new Error('Failed to fetch branches');
  return res.json();
}

export async function fetchVehicles(): Promise<Vehicle[]> {
  const res = await fetch(`${API_BASE}/vehicles`);
  if (!res.ok) throw new Error('Failed to fetch vehicles');
  return res.json();
}

export async function updateVehicle(id: string, data: Partial<Vehicle>): Promise<Vehicle> {
  const res = await fetch(`${API_BASE}/vehicles/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Failed to update vehicle');
  return res.json();
}

export async function fetchTransportRules(): Promise<TransportRules> {
  const res = await fetch(`${API_BASE}/transport/rules`);
  if (!res.ok) throw new Error('Failed to fetch transport rules');
  return res.json();
}

export async function updateTransportRules(rules: Partial<TransportRules>): Promise<TransportRules> {
  const res = await fetch(`${API_BASE}/transport/rules`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(rules)
  });
  if (!res.ok) throw new Error('Failed to update transport rules');
  return res.json();
}

export async function fetchLocations(): Promise<SiteLocation[]> {
  const res = await fetch(`${API_BASE}/locations`);
  if (!res.ok) throw new Error('Failed to fetch locations');
  return res.json();
}

export async function calculateTransport(input: TransportCalculationInput): Promise<TransportCalculationResult> {
  const res = await fetch(`${API_BASE}/transport/calculate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input)
  });
  if (!res.ok) throw new Error('Failed to calculate transport');
  return res.json();
}

export async function fetchQuotations(): Promise<Quotation[]> {
  const res = await fetch(`${API_BASE}/quotations`);
  if (!res.ok) throw new Error('Failed to fetch quotations');
  return res.json();
}

export async function createQuotation(quotation: Partial<Quotation>): Promise<Quotation> {
  const res = await fetch(`${API_BASE}/quotations`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(quotation)
  });
  if (!res.ok) throw new Error('Failed to create quotation');
  return res.json();
}

export async function validateQuotation(
  id: string, 
  validated_by: string, 
  external_software_ref?: string, 
  validation_notes?: string
): Promise<Quotation> {
  const res = await fetch(`${API_BASE}/quotations/${id}/validate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ validated_by, external_software_ref, validation_notes })
  });
  if (!res.ok) throw new Error('Failed to validate quotation');
  return res.json();
}

export async function fetchRecentEvents(): Promise<RealTimeEvent[]> {
  const res = await fetch(`${API_BASE}/events/recent`);
  if (!res.ok) throw new Error('Failed to fetch events');
  return res.json();
}

export function subscribeToRealTimeEvents(onEvent: (event: RealTimeEvent) => void): () => void {
  const eventSource = new EventSource('/api/events/stream');

  eventSource.onmessage = (e) => {
    try {
      const data = JSON.parse(e.data);
      if (data && data.type !== 'CONNECTED') {
        onEvent(data);
      }
    } catch (err) {
      console.error('SSE JSON parse error:', err);
    }
  };

  eventSource.onerror = () => {
    // Retry logichandled automatically by EventSource
  };

  return () => {
    eventSource.close();
  };
}

export async function fetchCustomers(): Promise<Customer[]> {
  const res = await fetch(`${API_BASE}/customers`);
  if (!res.ok) throw new Error('Failed to fetch customers');
  return res.json();
}

export async function addCustomer(cust: Partial<Customer>): Promise<Customer> {
  const res = await fetch(`${API_BASE}/customers`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(cust)
  });
  if (!res.ok) throw new Error('Failed to create customer');
  return res.json();
}

export async function updateCustomer(id: string, cust: Partial<Customer>): Promise<Customer> {
  const res = await fetch(`${API_BASE}/customers/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(cust)
  });
  if (!res.ok) throw new Error('Failed to update customer');
  return res.json();
}

export async function deleteCustomer(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/customers/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete customer');
}

// Company Profile & Settings
export async function fetchCompanySettings(): Promise<CompanySettings> {
  const res = await fetch(`${API_BASE}/company-settings`);
  return parseJsonResponse<CompanySettings>(res, 'Failed to fetch company settings');
}

export async function updateCompanySettings(settings: Partial<CompanySettings>): Promise<CompanySettings> {
  const res = await fetch(`${API_BASE}/company-settings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(settings)
  });
  if (!res.ok) throw new Error('Failed to update company settings');
  return res.json();
}

// System Users Management
export async function fetchUsers(): Promise<SystemUser[]> {
  const res = await fetch(`${API_BASE}/users`);
  return parseJsonResponse<SystemUser[]>(res, 'Failed to fetch system users');
}

export async function addUser(user: Partial<SystemUser>): Promise<SystemUser> {
  const res = await fetch(`${API_BASE}/users`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(user)
  });
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || 'Failed to create user account');
  }
  return res.json();
}

export async function updateUser(id: string, data: Partial<SystemUser>): Promise<SystemUser> {
  const res = await fetch(`${API_BASE}/users/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Failed to update user');
  return res.json();
}

export async function updateUserStatus(id: string, status: 'Active' | 'Pending Approval' | 'Deactivated'): Promise<SystemUser> {
  const res = await fetch(`${API_BASE}/users/${id}/status`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status })
  });
  if (!res.ok) throw new Error('Failed to update user status');
  return res.json();
}

export async function deleteUser(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/users/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete user');
}

export async function updateUserPassword(id: string, new_password: string): Promise<SystemUser> {
  const res = await fetch(`${API_BASE}/users/${id}/password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ new_password })
  });
  if (!res.ok) throw new Error('Failed to update password');
  return res.json();
}

// Categories Management
export async function fetchCategories(): Promise<CategoryConfig[]> {
  const res = await fetch(`${API_BASE}/categories`);
  return parseJsonResponse<CategoryConfig[]>(res, 'Failed to fetch categories');
}

export async function addCategory(cat: Partial<CategoryConfig>): Promise<CategoryConfig> {
  const res = await fetch(`${API_BASE}/categories`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(cat)
  });
  if (!res.ok) throw new Error('Failed to create category');
  return res.json();
}

export async function updateCategory(id: string, cat: Partial<CategoryConfig>): Promise<CategoryConfig> {
  const res = await fetch(`${API_BASE}/categories/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(cat)
  });
  if (!res.ok) throw new Error('Failed to update category');
  return res.json();
}

export async function deleteCategory(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/categories/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete category');
}

// Customer Types Management
export async function fetchCustomerTypes(): Promise<CustomerTypeConfig[]> {
  const res = await fetch(`${API_BASE}/customer-types`);
  return parseJsonResponse<CustomerTypeConfig[]>(res, 'Failed to fetch customer types');
}

export async function addCustomerType(ct: Partial<CustomerTypeConfig>): Promise<CustomerTypeConfig> {
  const res = await fetch(`${API_BASE}/customer-types`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(ct)
  });
  if (!res.ok) throw new Error('Failed to create customer type');
  return res.json();
}

export async function updateCustomerType(id: string, ct: Partial<CustomerTypeConfig>): Promise<CustomerTypeConfig> {
  const res = await fetch(`${API_BASE}/customer-types/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(ct)
  });
  if (!res.ok) throw new Error('Failed to update customer type');
  return res.json();
}

export async function deleteCustomerType(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/customer-types/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete customer type');
}

// Location Configs Management
export async function fetchLocationConfigs(): Promise<LocationConfig[]> {
  const res = await fetch(`${API_BASE}/locations-config`);
  return parseJsonResponse<LocationConfig[]>(res, 'Failed to fetch location configs');
}

export async function addLocationConfig(loc: Partial<LocationConfig>): Promise<LocationConfig> {
  const res = await fetch(`${API_BASE}/locations-config`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(loc)
  });
  if (!res.ok) throw new Error('Failed to create location config');
  return res.json();
}

export async function updateLocationConfig(id: string, loc: Partial<LocationConfig>): Promise<LocationConfig> {
  const res = await fetch(`${API_BASE}/locations-config/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(loc)
  });
  if (!res.ok) throw new Error('Failed to update location config');
  return res.json();
}

export async function deleteLocationConfig(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/locations-config/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete location config');
}

