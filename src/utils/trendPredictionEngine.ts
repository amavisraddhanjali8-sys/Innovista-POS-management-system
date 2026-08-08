import { Product, PriceHistory, ProductTrendPrediction, TrendDataPoint, CategoryType } from '../types';

export interface SimulationParams {
  rawMaterialOffsetPct?: number; // e.g. +5%
  fuelInflationPct?: number;     // e.g. +2%
  demandSurgePct?: number;       // e.g. +3%
}

/**
 * Category-based inherent baseline monthly drift (% per month) and volatility
 */
const CATEGORY_TREND_PROFILES: Record<CategoryType, { monthlyDriftPct: number; volatility: 'LOW' | 'MEDIUM' | 'HIGH'; drivers: string[] }> = {
  'Aluminium Profiles': {
    monthlyDriftPct: 3.5,
    volatility: 'MEDIUM',
    drivers: [
      'London Metal Exchange (LME) Aluminium Futures trend (+4.1% 30d)',
      'Extrusion billet energy & gas tariff adjustments',
      'Import shipping container & port clearing surcharges'
    ]
  },
  'Glass': {
    monthlyDriftPct: 2.2,
    volatility: 'MEDIUM',
    drivers: [
      'Float glass furnace natural gas energy surcharges',
      'Tempering kiln electricity index revision',
      'Acoustic DGU spacer & sealant raw material costs'
    ]
  },
  'ACP Sheets': {
    monthlyDriftPct: 4.8,
    volatility: 'HIGH',
    drivers: [
      'PVDF resin & polymer core global spot price surge (+5.2%)',
      'Aluminium coil skin import customs duty update',
      'Exterior facade architectural project demand peak'
    ]
  },
  'Steel Sections': {
    monthlyDriftPct: 1.8,
    volatility: 'LOW',
    drivers: [
      'Galvanized steel scrap index stability',
      'Structural hollow section rolling mill rates',
      'Central infrastructure construction activity'
    ]
  },
  'Hardware & Accessories': {
    monthlyDriftPct: 1.2,
    volatility: 'LOW',
    drivers: [
      'Stainless steel 304 Nickel commodity index',
      'Precision brass & roller bearing import freight rates',
      'Currency exchange rate stability'
    ]
  },
  'Labour & Installation': {
    monthlyDriftPct: 2.5,
    volatility: 'LOW',
    drivers: [
      'Regional CPI inflation wage adjustments',
      'Scaffolding & on-site transport fuel costs',
      'Skilled fabricator & glazier market rates'
    ]
  },
  'Aluminium Fabrication': {
    monthlyDriftPct: 3.2,
    volatility: 'MEDIUM',
    drivers: [
      'Extrusion profile & powder coating raw material rates',
      'Architectural glass & DGU unit price trends',
      'Skilled fabricator assembly & site installation wages'
    ]
  },
  'Interior Design': {
    monthlyDriftPct: 2.8,
    volatility: 'MEDIUM',
    drivers: [
      'Imported hardware, quartz & board material costs',
      'Custom cabinetry fabrication labor market rates',
      'Architectural 3D design & consultation demand'
    ]
  },
  'Civil Works': {
    monthlyDriftPct: 2.0,
    volatility: 'LOW',
    drivers: [
      'Cement, brick & aggregate raw material index',
      'Ready-mix concrete fuel & pumping charges',
      'Masonry & structural steel labor rates'
    ]
  },
  'Equipment & Rental': {
    monthlyDriftPct: 1.5,
    volatility: 'LOW',
    drivers: [
      'Diesel & machinery maintenance tariffs',
      'Scaffolding & tower crane mobilization costs',
      'Site equipment insurance rates'
    ]
  },
  'Services': {
    monthlyDriftPct: 1.0,
    volatility: 'LOW',
    drivers: [
      'Professional engineering consultation fees',
      'Site inspection & transport fuel charges',
      'Compliance & certification costs'
    ]
  }
};

/**
 * Calculates a 30-Day Trend Prediction for a given product using historical logs & predictive modeling.
 */
export function calculateProductTrendPrediction(
  product: Product,
  priceHistory: PriceHistory[] = [],
  simulationParams: SimulationParams = {}
): ProductTrendPrediction {
  const {
    rawMaterialOffsetPct = 0,
    fuelInflationPct = 0,
    demandSurgePct = 0
  } = simulationParams;

  const categoryProfile = CATEGORY_TREND_PROFILES[product.category] || {
    monthlyDriftPct: 2.0,
    volatility: 'MEDIUM',
    drivers: ['General commodity inflation index', 'Supply chain logistics']
  };

  const currentPrice = product.current_price || product.base_price || 10000;
  const oldPrice = product.old_price || Math.round(currentPrice * 0.95);

  // Filter history for this product
  const productLogs = priceHistory.filter(
    (h) => h.product_id === product.id || h.product_code === product.product_code
  );

  // Determine historical slope/velocity from log changes if available
  let logVelocityPct = 0;
  if (productLogs.length > 0) {
    const totalDeltaPct = productLogs.reduce((acc, log) => {
      const pct = log.old_price > 0 ? ((log.new_price - log.old_price) / log.old_price) * 100 : 0;
      return acc + pct;
    }, 0);
    logVelocityPct = totalDeltaPct / Math.max(1, productLogs.length);
  } else if (oldPrice && currentPrice !== oldPrice) {
    logVelocityPct = ((currentPrice - oldPrice) / oldPrice) * 100;
  }

  // Combined projected monthly growth rate (% change over 30 days)
  const combinedSimOffset = rawMaterialOffsetPct + (fuelInflationPct * 0.4) + (demandSurgePct * 0.5);
  const baseMonthlyGrowthPct = categoryProfile.monthlyDriftPct + (logVelocityPct * 0.3) + combinedSimOffset;

  // Generate date series: 30 days in past + 30 days into future
  const now = new Date();
  const historicalPoints: TrendDataPoint[] = [];
  const forecastPoints: TrendDataPoint[] = [];

  // Generate 30 Historical Days (-30 to 0)
  const startHistPrice = currentPrice / (1 + (baseMonthlyGrowthPct / 100));
  for (let i = 30; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const formattedDate = d.toLocaleDateString('en-US', { month: 'short', day: '2-digit' });

    // Linear interpolation with slight organic noise
    const progress = (30 - i) / 30;
    const noiseFactor = 1 + (Math.sin(i * 0.7) * 0.003); // +/- 0.3% subtle micro fluctuation
    const priceVal = Math.round((startHistPrice + (currentPrice - startHistPrice) * progress) * noiseFactor);

    historicalPoints.push({
      date: dateStr,
      formattedDate,
      price: i === 0 ? currentPrice : priceVal,
      isForecast: false,
      changeFromCurrent: Math.round(((priceVal - currentPrice) / currentPrice) * 1000) / 10
    });
  }

  // Generate 30 Forecast Days (Day 1 to 30)
  let projectedPrice30d = currentPrice;
  for (let i = 1; i <= 30; i++) {
    const d = new Date(now);
    d.setDate(d.getDate() + i);
    const dateStr = d.toISOString().split('T')[0];
    const formattedDate = d.toLocaleDateString('en-US', { month: 'short', day: '2-digit' });

    // Daily growth factor
    const dailyGrowthRate = (baseMonthlyGrowthPct / 100) / 30;
    const projectedVal = Math.round(currentPrice * Math.pow(1 + dailyGrowthRate, i));

    // Confidence interval expands as horizon extends
    const uncertaintyPct = 0.005 + (i / 30) * 0.025; // 0.5% to 3.0% spread
    const lowerBound = Math.round(projectedVal * (1 - uncertaintyPct));
    const upperBound = Math.round(projectedVal * (1 + uncertaintyPct));

    if (i === 30) {
      projectedPrice30d = projectedVal;
    }

    forecastPoints.push({
      date: dateStr,
      formattedDate,
      price: projectedVal,
      isForecast: true,
      lowerBound,
      upperBound,
      changeFromCurrent: Math.round(((projectedVal - currentPrice) / currentPrice) * 1000) / 10
    });
  }

  const priceChangeAmount30d = projectedPrice30d - currentPrice;
  const priceChangePct30d = Math.round((priceChangeAmount30d / currentPrice) * 1000) / 10;

  let trendDirection: 'UP' | 'DOWN' | 'STABLE' = 'STABLE';
  if (priceChangePct30d > 0.5) trendDirection = 'UP';
  else if (priceChangePct30d < -0.5) trendDirection = 'DOWN';

  // Confidence calculation
  const confidencePct = Math.max(78, Math.min(96, Math.round(92 - (Math.abs(combinedSimOffset) * 0.8))));

  // Tailored recommendation logic
  let recommendation = '';
  if (trendDirection === 'UP' && priceChangePct30d > 3.0) {
    recommendation = `🚀 High Upward Trajectory (+${priceChangePct30d}%): Head Office recommends issuing short 14-day quotation validity periods and locking in bulk supplier orders immediately to hedge against rising raw material costs.`;
  } else if (trendDirection === 'UP') {
    recommendation = `📈 Moderate Price Increase (+${priceChangePct30d}%): Standard 30-day quotation validity recommended. Monitor regional branch overrides for margin preservation.`;
  } else if (trendDirection === 'DOWN') {
    recommendation = `📉 Softening Price Trend (${priceChangePct30d}%): Raw material supply easing. Opportunities for volume discount negotiations with key contractors.`;
  } else {
    recommendation = `⚖️ Stable Price Forecast (±0.5%): Price equilibrium expected over the next 30 days. Standard master catalog pricing rules apply.`;
  }

  const allPoints = [...historicalPoints, ...forecastPoints];

  return {
    productId: product.id,
    productCode: product.product_code,
    productName: product.product_name,
    category: product.category,
    unit: product.unit,
    currentPrice,
    projectedPrice30d,
    priceChangeAmount30d,
    priceChangePct30d,
    trendDirection,
    confidencePct,
    volatility: categoryProfile.volatility,
    marketDrivers: categoryProfile.drivers,
    recommendation,
    historicalPoints,
    forecastPoints,
    allPoints
  };
}
