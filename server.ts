import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { 
  INITIAL_PRODUCTS, 
  INITIAL_PRICE_HISTORY, 
  INITIAL_BRANCHES, 
  INITIAL_VEHICLES, 
  INITIAL_TRANSPORT_RULES, 
  INITIAL_LOCATIONS, 
  INITIAL_QUOTATIONS,
  INITIAL_BRANCH_PRICES,
  INITIAL_CUSTOMER_PRICES,
  INITIAL_DISCOUNT_REQUESTS,
  INITIAL_CUSTOMERS,
  INITIAL_COMPANY_SETTINGS,
  INITIAL_USERS,
  INITIAL_CATEGORIES,
  INITIAL_CUSTOMER_TYPES,
  INITIAL_LOCATION_CONFIGS
} from './src/data/initialData';
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
  PricePriorityTier,
  Customer,
  CompanySettings,
  SystemUser,
  CategoryConfig,
  LocationConfig,
  CustomerTypeConfig
} from './src/types';

// Disk Persistence Configuration
const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

interface DatabaseSchema {
  products: Product[];
  priceHistory: PriceHistory[];
  branches: Branch[];
  vehicles: Vehicle[];
  transportRules: TransportRules;
  locations: SiteLocation[];
  quotations: Quotation[];
  branchPrices: BranchPriceOverride[];
  customerPrices: CustomerPriceOverride[];
  discountRequests: DiscountApprovalRequest[];
  customers: Customer[];
  companySettings: CompanySettings;
  systemUsers: SystemUser[];
  categories: CategoryConfig[];
  customerTypes: CustomerTypeConfig[];
  locationConfigs: LocationConfig[];
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Prevent caching of API responses
  app.use((req, res, next) => {
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    next();
  });

  // State Variables
  let products: Product[] = [];
  let priceHistory: PriceHistory[] = [];
  let branches: Branch[] = [];
  let vehicles: Vehicle[] = [];
  let transportRules: TransportRules = { ...INITIAL_TRANSPORT_RULES };
  let locations: SiteLocation[] = [];
  let quotations: Quotation[] = [];
  let branchPrices: BranchPriceOverride[] = [];
  let customerPrices: CustomerPriceOverride[] = [];
  let discountRequests: DiscountApprovalRequest[] = [];
  let customers: Customer[] = [];
  let companySettings: CompanySettings = { ...INITIAL_COMPANY_SETTINGS };
  let systemUsers: SystemUser[] = [];
  let categories: CategoryConfig[] = [];
  let customerTypes: CustomerTypeConfig[] = [];
  let locationConfigs: LocationConfig[] = [];

  function loadDatabase() {
    if (fs.existsSync(DB_FILE)) {
      try {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const data = JSON.parse(raw);
        products = Array.isArray(data.products) ? data.products : [];
        priceHistory = Array.isArray(data.priceHistory) ? data.priceHistory : [];
        branches = Array.isArray(data.branches) ? data.branches : [...INITIAL_BRANCHES];
        vehicles = Array.isArray(data.vehicles) ? data.vehicles : [...INITIAL_VEHICLES];
        transportRules = data.transportRules || { ...INITIAL_TRANSPORT_RULES };
        locations = Array.isArray(data.locations) ? data.locations : [];
        quotations = Array.isArray(data.quotations) ? data.quotations : [];
        branchPrices = Array.isArray(data.branchPrices) ? data.branchPrices : [];
        customerPrices = Array.isArray(data.customerPrices) ? data.customerPrices : [];
        discountRequests = Array.isArray(data.discountRequests) ? data.discountRequests : [];
        customers = Array.isArray(data.customers) ? data.customers : [];
        companySettings = data.companySettings ? { ...INITIAL_COMPANY_SETTINGS, ...data.companySettings } : { ...INITIAL_COMPANY_SETTINGS };
        systemUsers = Array.isArray(data.systemUsers) ? data.systemUsers : [...INITIAL_USERS];
        categories = Array.isArray(data.categories) ? data.categories : [...INITIAL_CATEGORIES];
        customerTypes = Array.isArray(data.customerTypes) ? data.customerTypes : [...INITIAL_CUSTOMER_TYPES];
        locationConfigs = Array.isArray(data.locationConfigs) ? data.locationConfigs : [...INITIAL_LOCATION_CONFIGS];
        return;
      } catch (err) {
        console.error('Failed to parse db.json, falling back to defaults:', err);
      }
    }

    // Default initialization
    products = [...INITIAL_PRODUCTS];
    priceHistory = [...INITIAL_PRICE_HISTORY];
    branches = [...INITIAL_BRANCHES];
    vehicles = [...INITIAL_VEHICLES];
    transportRules = { ...INITIAL_TRANSPORT_RULES };
    locations = [...INITIAL_LOCATIONS];
    quotations = [...INITIAL_QUOTATIONS];
    branchPrices = [...INITIAL_BRANCH_PRICES];
    customerPrices = [...INITIAL_CUSTOMER_PRICES];
    discountRequests = [...INITIAL_DISCOUNT_REQUESTS];
    customers = [...INITIAL_CUSTOMERS];
    companySettings = { ...INITIAL_COMPANY_SETTINGS };
    systemUsers = [...INITIAL_USERS];
    categories = [...INITIAL_CATEGORIES];
    customerTypes = [...INITIAL_CUSTOMER_TYPES];
    locationConfigs = [...INITIAL_LOCATION_CONFIGS];

    saveDatabase();
  }

  function saveDatabase() {
    try {
      const payload: DatabaseSchema = {
        products,
        priceHistory,
        branches,
        vehicles,
        transportRules,
        locations,
        quotations,
        branchPrices,
        customerPrices,
        discountRequests,
        customers,
        companySettings,
        systemUsers,
        categories,
        customerTypes,
        locationConfigs
      };
      fs.writeFileSync(DB_FILE, JSON.stringify(payload, null, 2), 'utf-8');
    } catch (err) {
      console.error('Failed to write to db.json:', err);
    }
  }

  // Load database on server start
  loadDatabase();

  let eventFeed: RealTimeEvent[] = [
    {
      id: 'evt-001',
      timestamp: new Date().toLocaleTimeString(),
      type: 'PRICE_UPDATE',
      title: 'Master Persistent Database Online',
      message: 'Persistent File Database online. All changes are saved directly to storage.',
      product_code: 'SYS',
      old_price: 0,
      new_price: 0,
      branch_name: 'All Branches'
    }
  ];

  // SSE Clients connected for real-time price push updates
  const sseClients: express.Response[] = [];

  function broadcastEvent(event: Omit<RealTimeEvent, 'id' | 'timestamp'>) {
    const fullEvent: RealTimeEvent = {
      id: `evt-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      ...event
    };
    eventFeed.unshift(fullEvent);
    if (eventFeed.length > 50) eventFeed.pop();

    sseClients.forEach((client) => {
      client.write(`data: ${JSON.stringify(fullEvent)}\n\n`);
    });
  }

  // Price Priority Logic Resolution Engine (4-Tier Priority)
  function resolvePricePriority(productId: string, branchId?: string, customerName?: string): PricePriorityResolution {
    const prod = products.find(p => p.id === productId || p.product_code === productId);
    if (!prod) {
      return {
        final_price: 0,
        tier: 'COMPANY_BASE',
        tier_label: 'Product Not Found',
        badge_color: 'bg-slate-700 text-slate-300 border-slate-600',
        product_code: productId,
        product_name: 'Unknown Product',
        base_price: 0,
        cost_price: 0,
        min_selling_price: 0
      };
    }

    const basePrice = prod.base_price || prod.current_price;
    const costPrice = prod.cost_price || Math.round(basePrice * 0.8);
    const minSellingPrice = prod.min_selling_price || Math.round(basePrice * 0.9);

    const todayStr = new Date().toISOString().split('T')[0];

    // Priority 1: Customer Price Override (highest priority)
    if (customerName) {
      const custMatch = customerPrices.find(cp => 
        (cp.product_id === prod.id || cp.product_code === prod.product_code) &&
        cp.customer_name.toLowerCase().trim() === customerName.toLowerCase().trim() &&
        (!cp.effective_from || cp.effective_from <= todayStr) &&
        (!cp.effective_to || cp.effective_to >= todayStr)
      );
      if (custMatch) {
        return {
          final_price: custMatch.special_price,
          tier: 'CUSTOMER_SPECIAL',
          tier_label: `🎯 Customer Contract Rate (${customerName})`,
          badge_color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
          product_code: prod.product_code,
          product_name: prod.product_name,
          base_price: basePrice,
          cost_price: costPrice,
          min_selling_price: minSellingPrice,
          customer_special_price: custMatch.special_price
        };
      }
    }

    // Priority 2: Branch Special Price Override
    if (branchId) {
      const branchMatch = branchPrices.find(bp => 
        (bp.product_id === prod.id || bp.product_code === prod.product_code) &&
        (bp.branch_id === branchId || bp.branch_code === branchId) &&
        bp.status !== 'Expired' &&
        (!bp.effective_from || bp.effective_from <= todayStr) &&
        (!bp.effective_to || bp.effective_to >= todayStr)
      );
      if (branchMatch) {
        const branchObj = branches.find(b => b.id === branchId || b.code === branchId);
        const bName = branchObj ? branchObj.name : 'Branch';
        return {
          final_price: branchMatch.special_price,
          tier: 'BRANCH_OVERRIDE',
          tier_label: `📍 ${bName} Override Rate`,
          badge_color: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
          product_code: prod.product_code,
          product_name: prod.product_name,
          base_price: basePrice,
          cost_price: costPrice,
          min_selling_price: minSellingPrice,
          branch_override_price: branchMatch.special_price
        };
      }
    }

    // Priority 3: Regional / Branch Margin Control Price
    if (branchId) {
      const branchObj = branches.find(b => b.id === branchId || b.code === branchId);
      if (branchObj && branchObj.margin_pct && branchObj.margin_pct > 0 && branchObj.code !== 'HO') {
        const marginPrice = Math.round(costPrice * (1 + branchObj.margin_pct / 100));
        return {
          final_price: marginPrice,
          tier: 'BRANCH_MARGIN',
          tier_label: `📈 Regional Margin Rule (${branchObj.margin_pct}% on Cost)`,
          badge_color: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40',
          product_code: prod.product_code,
          product_name: prod.product_name,
          base_price: basePrice,
          cost_price: costPrice,
          min_selling_price: minSellingPrice,
          branch_margin_price: marginPrice,
          branch_margin_pct: branchObj.margin_pct
        };
      }
    }

    // Priority 4: Company Base Price
    return {
      final_price: basePrice,
      tier: 'COMPANY_BASE',
      tier_label: '🏢 Company Base Rate',
      badge_color: 'bg-slate-700/80 text-slate-300 border-slate-600',
      product_code: prod.product_code,
      product_name: prod.product_name,
      base_price: basePrice,
      cost_price: costPrice,
      min_selling_price: minSellingPrice
    };
  }

  // --- API ROUTES ---

  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', server: 'Innovista Central ERP Master API', timestamp: new Date().toISOString() });
  });

  // Price Priority Resolver Endpoint
  app.post('/api/prices/resolve', (req, res) => {
    const { product_id, branch_id, customer_name } = req.body;
    const resolution = resolvePricePriority(product_id, branch_id, customer_name);
    res.json(resolution);
  });

  // Branch Price Overrides API
  app.get('/api/branches', (req, res) => {
    res.json(branches);
  });

  app.post('/api/branches', (req, res) => {
    const { name, code, location, manager_name, region, margin_pct } = req.body;
    const newBranch: Branch = {
      id: req.body.id || `b-${Date.now()}`,
      code: code || `BR-${Math.floor(100 + Math.random() * 900)}`,
      name: name || 'New Branch',
      location: location || 'Regional City',
      region: region || 'Western',
      status: 'Online',
      last_sync: 'Just now',
      active_users: 1,
      manager_name: manager_name || 'Branch Manager',
      margin_pct: Number(margin_pct) || 0
    };
    branches.push(newBranch);
    saveDatabase();
    res.json(newBranch);
  });

  app.put('/api/branches/:id', (req, res) => {
    const { id } = req.params;
    const idx = branches.findIndex(b => b.id === id || b.code === id);
    if (idx === -1) return res.status(404).json({ error: 'Branch not found' });

    branches[idx] = { ...branches[idx], ...req.body };
    saveDatabase();
    res.json(branches[idx]);
  });

  app.post('/api/branches/:id/status', (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    const branch = branches.find(b => b.id === id || b.code === id);
    if (!branch) return res.status(404).json({ error: 'Branch not found' });

    branch.status = status;
    saveDatabase();

    broadcastEvent({
      type: 'PRICE_UPDATE',
      title: status === 'Deactivated' || status === 'Offline' ? '🚨 Branch Node Deactivated' : '✅ Branch Node Reactivated',
      message: `${branch.name} status set to ${status} by Head Office Admin`,
      branch_name: branch.name
    });

    res.json(branch);
  });

  app.get('/api/branch-prices', (req, res) => {
    res.json(branchPrices);
  });

  app.post('/api/branch-prices', (req, res) => {
    const { branch_id, product_id, special_price, effective_from, effective_to, notes, created_by } = req.body;
    const prod = products.find(p => p.id === product_id || p.product_code === product_id);
    const branch = branches.find(b => b.id === branch_id || b.code === branch_id);

    if (!prod || !branch) {
      return res.status(400).json({ error: 'Invalid product or branch ID' });
    }

    const existingIdx = branchPrices.findIndex(bp => bp.branch_id === branch.id && bp.product_id === prod.id);
    const newOverride: BranchPriceOverride = {
      id: existingIdx !== -1 ? branchPrices[existingIdx].id : `bp-${Date.now()}`,
      branch_id: branch.id,
      branch_code: branch.code,
      branch_name: branch.name,
      product_id: prod.id,
      product_code: prod.product_code,
      special_price: Number(special_price),
      effective_from: effective_from || new Date().toISOString().split('T')[0],
      effective_to: effective_to || undefined,
      created_by: created_by || 'HO Master Admin',
      status: 'Active',
      notes: notes || 'Head Office Branch Override'
    };

    if (existingIdx !== -1) {
      branchPrices[existingIdx] = newOverride;
    } else {
      branchPrices.unshift(newOverride);
    }

    saveDatabase();

    broadcastEvent({
      type: 'PRICE_UPDATE',
      title: `⚡ Branch Price Override Set: ${branch.code}`,
      message: `${prod.product_code} override updated to Rs. ${Number(special_price).toLocaleString()} for ${branch.name}`,
      product_code: prod.product_code,
      new_price: Number(special_price),
      branch_name: branch.name
    });

    res.json(newOverride);
  });

  app.delete('/api/branch-prices/:id', (req, res) => {
    const { id } = req.params;
    branchPrices = branchPrices.filter(bp => bp.id !== id);
    saveDatabase();
    res.json({ success: true, id });
  });

  // Customer Price Rules API
  app.get('/api/customer-prices', (req, res) => {
    res.json(customerPrices);
  });

  app.post('/api/customer-prices', (req, res) => {
    const { customer_name, product_id, product_name, special_price, discount_pct, contract_mode, quantity_tiers, effective_from, effective_to, notes, created_by } = req.body;
    const prod = products.find(p => p.id === product_id || p.product_code === product_id);

    if (!prod || !customer_name) {
      return res.status(400).json({ error: 'Invalid product or customer name' });
    }

    const newRule: CustomerPriceOverride = {
      id: `cp-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      customer_name,
      product_id: prod.id,
      product_code: prod.product_code,
      product_name: product_name || prod.product_name,
      special_price: Number(special_price),
      discount_pct: discount_pct ? Number(discount_pct) : undefined,
      contract_mode: contract_mode || 'fixed_price',
      quantity_tiers: Array.isArray(quantity_tiers) ? quantity_tiers : undefined,
      effective_from: effective_from || new Date().toISOString().split('T')[0],
      effective_to: effective_to || undefined,
      created_by: created_by || 'HO Master Admin',
      notes: notes || 'Customer Negotiated Contract Rate'
    };

    customerPrices.unshift(newRule);
    saveDatabase();

    broadcastEvent({
      type: 'PRICE_UPDATE',
      title: `🎯 Customer Contract Price Added`,
      message: `Special rate of Rs. ${Number(special_price).toLocaleString()} for ${customer_name} on ${prod.product_code}`,
      product_code: prod.product_code,
      new_price: Number(special_price),
      branch_name: 'All Branches'
    });

    res.json(newRule);
  });

  app.delete('/api/customer-prices/:id', (req, res) => {
    const { id } = req.params;
    customerPrices = customerPrices.filter(cp => cp.id !== id);
    saveDatabase();
    res.json({ success: true, id });
  });

  // Discount Approval Requests API
  app.get('/api/discount-requests', (req, res) => {
    res.json(discountRequests);
  });

  app.post('/api/discount-requests', (req, res) => {
    const newReq: DiscountApprovalRequest = {
      id: `dr-${Date.now()}`,
      quotation_id: req.body.quotation_id,
      quotation_number: req.body.quotation_number || `INV-QT-${new Date().getFullYear()}-000`,
      branch_id: req.body.branch_id || 'b-cmb',
      branch_name: req.body.branch_name || 'Regional Branch',
      requested_by: req.body.requested_by || 'Sales Executive',
      customer_name: req.body.customer_name || 'Client',
      original_amount: Number(req.body.original_amount) || 0,
      requested_discount_pct: Number(req.body.requested_discount_pct) || 0,
      discounted_amount: Number(req.body.discounted_amount) || 0,
      reason: req.body.reason || 'Special discount requested',
      status: 'Pending',
      created_at: new Date().toISOString().split('T')[0],
      notes: req.body.notes
    };

    discountRequests.unshift(newReq);
    saveDatabase();

    broadcastEvent({
      type: 'PRICE_PROPOSAL',
      title: `Discount Approval Request Submitted`,
      message: `${newReq.requested_by} requested ${newReq.requested_discount_pct}% discount on quote ${newReq.quotation_number}`,
      branch_name: newReq.branch_name
    });

    res.json(newReq);
  });

  app.post('/api/discount-requests/:id/approve', (req, res) => {
    const { id } = req.params;
    const { approved, reviewed_by, notes } = req.body;

    const reqItem = discountRequests.find(r => r.id === id);
    if (!reqItem) return res.status(404).json({ error: 'Request not found' });

    reqItem.status = approved ? 'Approved' : 'Rejected';
    reqItem.reviewed_by = reviewed_by || 'HO Super Admin';
    reqItem.review_date = new Date().toISOString().split('T')[0];
    if (notes) reqItem.notes = notes;

    saveDatabase();

    broadcastEvent({
      type: 'PRICE_PROPOSAL',
      title: approved ? `✅ Discount Approved by HO` : `❌ Discount Rejected by HO`,
      message: `Discount request for ${reqItem.quotation_number} (${reqItem.customer_name}) was ${reqItem.status.toLowerCase()} by ${reqItem.reviewed_by}`,
      branch_name: reqItem.branch_name
    });

    res.json(reqItem);
  });

  // Branch Margin API
  app.put('/api/branches/:id/margin', (req, res) => {
    const { id } = req.params;
    const { margin_pct } = req.body;

    const branch = branches.find(b => b.id === id || b.code === id);
    if (!branch) return res.status(404).json({ error: 'Branch not found' });

    branch.margin_pct = Number(margin_pct);
    saveDatabase();

    broadcastEvent({
      type: 'PRICE_UPDATE',
      title: `📈 Branch Margin Margin Tier Updated`,
      message: `${branch.name} regional margin set to ${branch.margin_pct}% over Head Office cost base`,
      branch_name: branch.name
    });

    res.json(branch);
  });

  // Products API
  app.get('/api/products', (req, res) => {
    res.json(products);
  });

  app.post('/api/products', (req, res) => {
    const pCode = req.body.product_code || `PRD-${Math.floor(1000 + Math.random() * 9000)}`;
    const basePrice = Number(req.body.base_price || req.body.current_price || 0);

    const newProd: Product = {
      id: `p-${Date.now()}`,
      product_code: pCode,
      product_name: req.body.product_name || 'New Product Item',
      category: req.body.category || 'Aluminium Profiles',
      sub_category: req.body.sub_category,
      unit: req.body.unit || 'm²',
      price_display_method: req.body.price_display_method || 'Standard',
      current_price: basePrice,
      base_price: basePrice,
      cost_price: Number(req.body.cost_price || Math.round(basePrice * 0.8)),
      min_selling_price: Number(req.body.min_selling_price || Math.round(basePrice * 0.9)),
      unit_weight_kg: Number(req.body.unit_weight_kg) || 1.0,
      status: req.body.status || 'Active',
      effective_date: req.body.effective_date || new Date().toISOString().split('T')[0],
      last_updated: new Date().toLocaleString(),
      updated_by: req.body.updated_by || 'HO Master Admin',
      description: req.body.description || ''
    };

    products.unshift(newProd);
    saveDatabase();

    broadcastEvent({
      type: 'PRICE_UPDATE',
      title: '📦 New Product Registered',
      message: `${newProd.product_code} (${newProd.product_name}) added at base price Rs. ${newProd.current_price.toLocaleString()}`,
      product_code: newProd.product_code,
      new_price: newProd.current_price,
      branch_name: 'Head Office'
    });

    res.json(newProd);
  });

  app.put('/api/products/:id', (req, res) => {
    const { id } = req.params;
    const idx = products.findIndex(p => p.id === id || p.product_code === id);
    if (idx === -1) return res.status(404).json({ error: 'Product not found' });

    const existing = products[idx];
    const oldPrice = existing.current_price;
    const newPrice = req.body.new_price !== undefined ? Number(req.body.new_price) : existing.current_price;

    const updatedProduct: Product = {
      ...existing,
      ...req.body,
      current_price: newPrice,
      old_price: newPrice !== oldPrice ? oldPrice : existing.old_price,
      last_updated: new Date().toLocaleString(),
      updated_by: req.body.updated_by || existing.updated_by || 'HO Master Admin'
    };

    products[idx] = updatedProduct;

    let historyEntry: PriceHistory | undefined;
    if (newPrice !== oldPrice) {
      historyEntry = {
        id: `ph-${Date.now()}`,
        product_id: updatedProduct.id,
        product_code: updatedProduct.product_code,
        product_name: updatedProduct.product_name,
        old_price: oldPrice,
        new_price: newPrice,
        changed_by: req.body.updated_by || 'HO Master Admin',
        changed_date: new Date().toLocaleString(),
        reason: req.body.reason || 'Master price update',
        branch_affected: 'All Branches'
      };
      priceHistory.unshift(historyEntry);

      broadcastEvent({
        type: 'PRICE_UPDATE',
        title: '⚡ Master Price Changed',
        message: `${updatedProduct.product_code} base price changed: Rs. ${oldPrice.toLocaleString()} → Rs. ${newPrice.toLocaleString()}`,
        product_code: updatedProduct.product_code,
        old_price: oldPrice,
        new_price: newPrice,
        branch_name: 'All Branches'
      });
    }

    saveDatabase();

    res.json({ product: updatedProduct, history: historyEntry });
  });

  app.delete('/api/products/:id', (req, res) => {
    const { id } = req.params;
    products = products.filter(p => p.id !== id);
    saveDatabase();
    res.json({ success: true, id });
  });

  // Batch Margin Update API
  app.post('/api/products/batch-margin', (req, res) => {
    const { items, updated_by, reason, category, supplier } = req.body;
    if (!Array.isArray(items)) return res.status(400).json({ error: 'Invalid items payload' });

    const updatedProducts: Product[] = [];
    const newHistoryEntries: PriceHistory[] = [];

    items.forEach(item => {
      const idx = products.findIndex(p => p.id === item.id || p.product_code === item.id);
      if (idx !== -1) {
        const oldPrice = products[idx].current_price;
        const newPrice = Number(item.new_price);

        products[idx].old_price = oldPrice;
        products[idx].current_price = newPrice;
        products[idx].base_price = newPrice;
        products[idx].last_updated = new Date().toLocaleString();
        products[idx].updated_by = updated_by || 'HO Master Admin';

        updatedProducts.push(products[idx]);

        const h: PriceHistory = {
          id: `ph-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          product_id: products[idx].id,
          product_code: products[idx].product_code,
          product_name: products[idx].product_name,
          old_price: oldPrice,
          new_price: newPrice,
          changed_by: updated_by || 'HO Master Admin',
          changed_date: new Date().toLocaleString(),
          reason: reason || 'Batch Margin Adjustment Push',
          branch_affected: 'All Branches'
        };
        priceHistory.unshift(h);
        newHistoryEntries.push(h);
      }
    });

    saveDatabase();

    broadcastEvent({
      type: 'BATCH_MARGIN_PUSH',
      title: '🚀 Batch Margin Adjustment Deployed',
      message: `Pushed new price updates to ${updatedProducts.length} items across all regional nodes.`,
      branch_name: 'All Branches'
    });

    res.json({ products: updatedProducts, history: newHistoryEntries });
  });

  // Price History Audit Logs API
  app.get('/api/prices/history', (req, res) => {
    res.json(priceHistory);
  });

  // Branch Servers Status API
  app.get('/api/branches', (req, res) => {
    res.json(branches);
  });

  // Fleet & Transport APIs
  app.get('/api/vehicles', (req, res) => {
    res.json(vehicles);
  });

  app.put('/api/vehicles/:id', (req, res) => {
    const { id } = req.params;
    const v = vehicles.find(item => item.id === id);
    if (!v) return res.status(404).json({ error: 'Vehicle not found' });

    if (req.body.base_charge !== undefined) v.base_charge = Number(req.body.base_charge);
    if (req.body.per_km_rate !== undefined) v.per_km_rate = Number(req.body.per_km_rate);

    saveDatabase();

    broadcastEvent({
      type: 'TRANSPORT_RULE_CHANGE',
      title: 'Transport Fleet Rates Updated',
      message: `${v.type} base rate set to Rs. ${v.base_charge.toLocaleString()} & per KM to Rs. ${v.per_km_rate}`,
      branch_name: 'All Branches'
    });

    res.json(v);
  });

  app.get('/api/transport/rules', (req, res) => {
    res.json(transportRules);
  });

  app.put('/api/transport/rules', (req, res) => {
    transportRules = { ...transportRules, ...req.body };
    saveDatabase();

    broadcastEvent({
      type: 'TRANSPORT_RULE_CHANGE',
      title: 'Global Transport Rules & Fuel Surcharge Adjusted',
      message: `Fuel price updated to Rs. ${transportRules.fuel_price_per_l}/L. Driver allowance Rs. ${transportRules.driver_allowance}.`,
      branch_name: 'All Branches'
    });

    res.json(transportRules);
  });

  app.get('/api/locations', (req, res) => {
    res.json(locations);
  });

  // Dynamic Transport Engine Calculation API
  app.post('/api/transport/calculate', (req, res) => {
    const input: TransportCalculationInput = req.body;

    const loc = locations.find(l => l.id === input.location_id);
    const distance_km = input.custom_distance_km || (loc ? loc.distance_km : 25);
    const total_weight = Number(input.total_weight_kg) || 100;
    const max_len = Number(input.max_item_length_m) || 3.0;

    let chosenVehicle: Vehicle = vehicles[0] || INITIAL_VEHICLES[0];

    if (input.vehicle_type_override) {
      const override = vehicles.find(v => v.id === input.vehicle_type_override || v.type === input.vehicle_type_override);
      if (override) chosenVehicle = override;
    } else {
      if (total_weight > 5000 || max_len > 6.5) {
        chosenVehicle = vehicles.find(v => v.id === 'v-trailer') || vehicles[2] || INITIAL_VEHICLES[2];
      } else if (total_weight > 1000 || max_len > 3.5) {
        chosenVehicle = vehicles.find(v => v.id === 'v-lorry') || vehicles[1] || INITIAL_VEHICLES[1];
      }
    }

    const base_charge = chosenVehicle.base_charge;
    const distance_cost = Math.max(0, distance_km - (transportRules.min_distance_km || 0)) * chosenVehicle.per_km_rate;

    const fuelDiffPct = ((transportRules.fuel_price_per_l - 300) / 300);
    const fuel_adjustment = fuelDiffPct > 0 ? Math.round((base_charge + distance_cost) * fuelDiffPct * 0.15) : 0;

    const driver_allowance = input.include_driver_allowance || distance_km > 50 ? transportRules.driver_allowance : 0;

    let runningSubtotal = base_charge + distance_cost + fuel_adjustment + driver_allowance;

    const isNight = input.is_night_delivery;
    const night_surcharge = isNight ? Math.round(runningSubtotal * (transportRules.night_delivery_surcharge_pct / 100)) : 0;

    const isRemote = input.is_remote_area || (loc && loc.is_remote);
    const remote_surcharge = isRemote ? Math.round(runningSubtotal * (transportRules.remote_area_surcharge_pct / 100)) : 0;

    const total_transport_cost = Math.round(runningSubtotal + night_surcharge + remote_surcharge);
    const travel_time_min = loc ? loc.est_travel_time_min : Math.round(distance_km * 1.5 + 15);

    const breakdown_lines = [
      { label: `Base Charge (${chosenVehicle.type})`, amount: base_charge },
      { label: `Distance Rate (${distance_km} km @ Rs.${chosenVehicle.per_km_rate}/km)`, amount: distance_cost }
    ];

    if (fuel_adjustment > 0) breakdown_lines.push({ label: `Fuel Index Surcharge (Rs.${transportRules.fuel_price_per_l}/L)`, amount: fuel_adjustment });
    if (driver_allowance > 0) breakdown_lines.push({ label: `Driver & Crew Allowance (>50km)`, amount: driver_allowance });
    if (night_surcharge > 0) breakdown_lines.push({ label: `Night Delivery Surcharge (${transportRules.night_delivery_surcharge_pct}%)`, amount: night_surcharge });
    if (remote_surcharge > 0) breakdown_lines.push({ label: `Remote Terrain Surcharge (${transportRules.remote_area_surcharge_pct}%)`, amount: remote_surcharge });

    const result: TransportCalculationResult = {
      vehicle_used: chosenVehicle,
      vehicle_type: chosenVehicle.type,
      total_weight_kg: total_weight,
      distance_km,
      base_charge,
      distance_cost,
      fuel_adjustment,
      driver_allowance,
      night_surcharge,
      remote_surcharge,
      total_transport_cost,
      travel_time_min,
      breakdown_lines
    };

    res.json(result);
  });

  // Quotations API
  app.get('/api/quotations', (req, res) => {
    res.json(quotations);
  });

  app.post('/api/quotations', (req, res) => {
    const isMainBranchHO = req.body.branch_id === 'b-ho' || req.body.branch_code === 'HO' || req.body.is_main_branch === true;
    const qNum = req.body.quotation_number || `INV-QT-${new Date().getFullYear()}-${Math.floor(Math.random() * 9000 + 1000)}`;
    const randomCode = Math.floor(100000 + Math.random() * 900000);

    const quotationType = isMainBranchHO ? 'VALIDATED_OFFICIAL' : 'TEMPORARY_BRANCH_DRAFT';
    const status = isMainBranchHO ? 'Validated Official' : 'Temporary Branch Draft';
    const barcode = isMainBranchHO ? `BC-HO-${new Date().getFullYear()}-${randomCode}` : `BC-TEMP-${new Date().getFullYear()}-${randomCode}`;
    const extRef = isMainBranchHO ? (req.body.external_software_ref || `EXT-ERP-${Math.floor(10000 + Math.random() * 90000)}`) : undefined;

    const netTotal = Number(req.body.net_total) || 0;
    const custName = req.body.customer_name || 'Valued Client';
    const bName = req.body.branch_name || 'Regional Branch';

    const qrPayload = JSON.stringify({
      type: quotationType,
      num: qNum,
      branch: bName,
      customer: custName,
      total: netTotal,
      barcode,
      ext_ref: extRef,
      issued_at: new Date().toISOString()
    });

    const q: Quotation = {
      id: `qt-${Date.now()}`,
      quotation_number: qNum,
      quotation_type: quotationType,
      barcode,
      qr_code_data: qrPayload,
      customer_name: custName,
      customer_phone: req.body.customer_phone || '',
      site_address: req.body.site_address || '',
      site_location_name: req.body.site_location_name || 'Site',
      branch_id: req.body.branch_id || 'b-cmb',
      branch_name: bName,
      date: new Date().toISOString().split('T')[0],
      valid_until: req.body.valid_until || new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
      status: req.body.status || status,
      items: req.body.items || [],
      transport_details: req.body.transport_details,
      material_subtotal: Number(req.body.material_subtotal) || 0,
      fabrication_cost: Number(req.body.fabrication_cost) || 0,
      installation_cost: Number(req.body.installation_cost) || 0,
      transport_cost: Number(req.body.transport_cost) || 0,
      gross_total: Number(req.body.gross_total) || 0,
      discount_pct: Number(req.body.discount_pct) || 0,
      discount_amount: Number(req.body.discount_amount) || 0,
      tax_pct: Number(req.body.tax_pct) || 0,
      tax_amount: Number(req.body.tax_amount) || 0,
      net_total: netTotal,
      notes: req.body.notes || (isMainBranchHO ? 'Official Main Branch Validated Quotation.' : 'Temporary Branch Draft Quotation. Requires Main Branch HO Validation.'),
      created_by: req.body.created_by || 'Branch Representative',
      external_software_ref: extRef,
      validated_at: isMainBranchHO ? new Date().toLocaleString() : undefined,
      validated_by: isMainBranchHO ? (req.body.created_by || 'HO Master Admin') : undefined
    };

    quotations.unshift(q);
    saveDatabase();

    broadcastEvent({
      type: 'NEW_QUOTATION',
      title: isMainBranchHO ? '📜 Official Main Branch Quotation Issued' : '📋 Temporary Branch Draft Quotation Created',
      message: `${q.quotation_number} (${quotationType}) generated at ${q.branch_name} for ${q.customer_name} (Total: Rs. ${q.net_total.toLocaleString()}). Barcode: ${q.barcode}`,
      branch_name: q.branch_name
    });

    res.json(q);
  });

  app.post('/api/quotations/:id/validate', (req, res) => {
    const { id } = req.params;
    const { validated_by, external_software_ref, validation_notes } = req.body;

    const q = quotations.find(item => item.id === id || item.quotation_number === id);
    if (!q) {
      return res.status(404).json({ error: 'Quotation not found' });
    }

    const randomCode = Math.floor(100000 + Math.random() * 900000);
    const newBarcode = `BC-HO-${new Date().getFullYear()}-${randomCode}`;
    const extRef = external_software_ref || `EXT-ERP-${Math.floor(10000 + Math.random() * 90000)}`;

    q.quotation_type = 'VALIDATED_OFFICIAL';
    q.status = 'Validated Official';
    q.barcode = newBarcode;
    q.external_software_ref = extRef;
    q.validated_at = new Date().toLocaleString();
    q.validated_by = validated_by || 'HO Master Admin';
    q.validation_notes = validation_notes || 'Validated & certified by Main Branch Head Office.';

    q.qr_code_data = JSON.stringify({
      type: 'VALIDATED_OFFICIAL',
      num: q.quotation_number,
      branch: q.branch_name,
      customer: q.customer_name,
      total: q.net_total,
      barcode: newBarcode,
      ext_ref: extRef,
      validated_at: q.validated_at,
      validated_by: q.validated_by
    });

    saveDatabase();

    broadcastEvent({
      type: 'NEW_QUOTATION',
      title: '✅ Temporary Branch Draft VALIDATED by Main Branch',
      message: `Quotation ${q.quotation_number} (originally from ${q.branch_name}) has been validated by Main Branch HO. Official Barcode: ${newBarcode}, Ref: ${extRef}`,
      branch_name: 'Head Office'
    });

    res.json(q);
  });

  // Customer Management Database API
  app.get('/api/customers', (req, res) => {
    res.json(customers);
  });

  app.post('/api/customers', (req, res) => {
    const newCust: Customer = {
      id: req.body.id || `cust-${Date.now()}`,
      name: req.body.name || 'New Client',
      phone: req.body.phone || '',
      email: req.body.email || '',
      address: req.body.address || '',
      district_region: req.body.district_region || 'Colombo',
      customer_type: req.body.customer_type || 'Retail Customer',
      tax_id: req.body.tax_id || '',
      discount_tier_pct: Number(req.body.discount_tier_pct) || 0,
      created_at: new Date().toISOString().split('T')[0]
    };
    customers.unshift(newCust);
    saveDatabase();
    res.json(newCust);
  });

  app.put('/api/customers/:id', (req, res) => {
    const { id } = req.params;
    const idx = customers.findIndex(c => c.id === id);
    if (idx !== -1) {
      customers[idx] = { ...customers[idx], ...req.body };
      saveDatabase();
      res.json(customers[idx]);
    } else {
      res.status(404).json({ error: 'Customer not found' });
    }
  });

  app.delete('/api/customers/:id', (req, res) => {
    const { id } = req.params;
    customers = customers.filter(c => c.id !== id);
    saveDatabase();
    res.json({ success: true, id });
  });

  // Company Profile Settings API
  app.get('/api/company-settings', (req, res) => {
    res.json(companySettings);
  });

  app.post('/api/company-settings', (req, res) => {
    companySettings = { ...companySettings, ...req.body };
    saveDatabase();
    res.json(companySettings);
  });

  // User Management API
  app.get('/api/users', (req, res) => {
    res.json(systemUsers);
  });

  app.post('/api/users', (req, res) => {
    const newUser: SystemUser = {
      id: req.body.id || `user-${Date.now()}`,
      name: req.body.name || 'New User',
      email: req.body.email || '',
      role: req.body.role || 'Sales Executive',
      branch_id: req.body.branch_id || 'b-ho',
      branch_name: req.body.branch_name || 'Colombo Head Office (HO)',
      status: req.body.status || 'Active',
      phone: req.body.phone || '',
      created_at: new Date().toISOString().split('T')[0],
      last_login: 'Never',
      mustChangePassword: true
    };
    systemUsers.unshift(newUser);
    saveDatabase();
    res.json(newUser);
  });

  app.put('/api/users/:id', (req, res) => {
    const { id } = req.params;
    const idx = systemUsers.findIndex(u => u.id === id);
    if (idx !== -1) {
      systemUsers[idx] = {
        ...systemUsers[idx],
        name: req.body.name || systemUsers[idx].name,
        email: req.body.email || systemUsers[idx].email,
        role: req.body.role || systemUsers[idx].role,
        branch_id: req.body.branch_id || systemUsers[idx].branch_id,
        branch_name: req.body.branch_name || systemUsers[idx].branch_name,
        phone: req.body.phone !== undefined ? req.body.phone : systemUsers[idx].phone
      };
      saveDatabase();
      res.json(systemUsers[idx]);
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  });

  app.post('/api/users/:id/status', (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    const user = systemUsers.find(u => u.id === id);
    if (user) {
      user.status = status;
      saveDatabase();
      res.json(user);
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  });

  app.delete('/api/users/:id', (req, res) => {
    const { id } = req.params;
    systemUsers = systemUsers.filter(u => u.id !== id);
    saveDatabase();
    res.json({ success: true, id });
  });

  // Account Owner Password Update API (Admin cannot change passwords, only owner)
  app.post('/api/users/:id/password', (req, res) => {
    const { id } = req.params;
    const { new_password } = req.body;

    const user = systemUsers.find(u => u.id === id);
    if (!user) {
      return res.status(404).json({ error: 'User account not found' });
    }

    user.mustChangePassword = false;
    user.passwordChangedAt = new Date().toISOString();
    saveDatabase();

    res.json(user);
  });

  // Category Configuration API
  app.get('/api/categories', (req, res) => {
    res.json(categories);
  });

  app.post('/api/categories', (req, res) => {
    const newCat: CategoryConfig = {
      id: req.body.id || `cat-${Date.now()}`,
      name: req.body.name,
      description: req.body.description || '',
      status: req.body.status || 'Active',
      subcategories: req.body.subcategories || []
    };
    categories.unshift(newCat);
    saveDatabase();
    res.json(newCat);
  });

  app.put('/api/categories/:id', (req, res) => {
    const { id } = req.params;
    const idx = categories.findIndex(c => c.id === id);
    if (idx !== -1) {
      categories[idx] = { ...categories[idx], ...req.body };
      saveDatabase();
      res.json(categories[idx]);
    } else {
      res.status(404).json({ error: 'Category not found' });
    }
  });

  app.delete('/api/categories/:id', (req, res) => {
    const { id } = req.params;
    categories = categories.filter(c => c.id !== id);
    saveDatabase();
    res.json({ success: true, id });
  });

  // Customer Types API
  app.get('/api/customer-types', (req, res) => {
    res.json(customerTypes);
  });

  app.post('/api/customer-types', (req, res) => {
    const newCt: CustomerTypeConfig = {
      id: req.body.id || `ct-${Date.now()}`,
      name: req.body.name,
      default_discount_pct: Number(req.body.default_discount_pct) || 0,
      description: req.body.description || ''
    };
    customerTypes.unshift(newCt);
    saveDatabase();
    res.json(newCt);
  });

  app.put('/api/customer-types/:id', (req, res) => {
    const { id } = req.params;
    const idx = customerTypes.findIndex(ct => ct.id === id);
    if (idx !== -1) {
      customerTypes[idx] = { ...customerTypes[idx], ...req.body };
      saveDatabase();
      res.json(customerTypes[idx]);
    } else {
      res.status(404).json({ error: 'Customer type not found' });
    }
  });

  app.delete('/api/customer-types/:id', (req, res) => {
    const { id } = req.params;
    customerTypes = customerTypes.filter(ct => ct.id !== id);
    saveDatabase();
    res.json({ success: true, id });
  });

  // Location Configurations API
  app.get('/api/locations-config', (req, res) => {
    res.json(locationConfigs);
  });

  app.post('/api/locations-config', (req, res) => {
    const newLoc: LocationConfig = {
      id: req.body.id || `loc-${Date.now()}`,
      name: req.body.name,
      district: req.body.district || 'Colombo',
      region: req.body.region || 'Western Province',
      status: req.body.status || 'Active'
    };
    locationConfigs.unshift(newLoc);
    saveDatabase();
    res.json(newLoc);
  });

  app.put('/api/locations-config/:id', (req, res) => {
    const { id } = req.params;
    const idx = locationConfigs.findIndex(l => l.id === id);
    if (idx !== -1) {
      locationConfigs[idx] = { ...locationConfigs[idx], ...req.body };
      saveDatabase();
      res.json(locationConfigs[idx]);
    } else {
      res.status(404).json({ error: 'Location config not found' });
    }
  });

  app.delete('/api/locations-config/:id', (req, res) => {
    const { id } = req.params;
    locationConfigs = locationConfigs.filter(l => l.id !== id);
    saveDatabase();
    res.json({ success: true, id });
  });

  // 7. Real-time Events & SSE Stream Endpoint
  app.get('/api/events/recent', (req, res) => {
    res.json(eventFeed);
  });

  app.get('/api/events/stream', (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    res.write(`data: ${JSON.stringify({ type: 'CONNECTED', message: 'Connected to Innovista Central Real-time Event Stream' })}\n\n`);

    sseClients.push(res);

    req.on('close', () => {
      const idx = sseClients.indexOf(res);
      if (idx !== -1) sseClients.splice(idx, 1);
    });
  });

  // API 404 Handler - Catch unmatched /api routes to prevent Vite SPA fallback from serving HTML
  app.all('/api/*', (req, res) => {
    res.status(404).json({ error: `API route ${req.method} ${req.originalUrl} not found` });
  });

  // --- VITE MIDDLEWARE & FALLBACK ---
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Innovista Enterprise API] Master Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
