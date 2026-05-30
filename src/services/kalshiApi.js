/**
 * Kalshi API Service
 * 
 * Fetches live data from:
 * 1. CoinGecko (public crypto prices - no auth needed)
 * 2. Hermes API proxy (if available on the same network)
 * 3. Fallback to static demo data
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

const COINGECKO_URL = 'https://api.coingecko.com/api/v3/simple/price';
const HERMES_SERVER = 'http://168.231.114.76:9120'; // Your Hermes MC dashboard

const CACHE_KEY = 'kalshi_cache';
const CACHE_DURATION = 15 * 60 * 1000; // 15 min

async function getCached(key) {
  try {
    const raw = await AsyncStorage.getItem(CACHE_KEY);
    if (raw) {
      const cache = JSON.parse(raw);
      if (cache[key] && Date.now() - cache[key].timestamp < CACHE_DURATION) {
        return cache[key].data;
      }
    }
  } catch {}
  return null;
}

async function setCached(key, data) {
  try {
    const raw = await AsyncStorage.getItem(CACHE_KEY) || '{}';
    const cache = JSON.parse(raw);
    cache[key] = { data, timestamp: Date.now() };
    await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(cache));
  } catch {}
}

/**
 * Fetch crypto spot prices from CoinGecko.
 */
export async function getCryptoPrices() {
  const cached = await getCached('prices');
  if (cached) return cached;

  try {
    const resp = await fetch(
      `${COINGECKO_URL}?ids=bitcoin,ethereum,solana,ripple,dogecoin&vs_currencies=usd&include_24hr_change=true`,
      { headers: { Accept: 'application/json' }, signal: AbortSignal.timeout(8000) }
    );
    if (resp.ok) {
      const d = await resp.json();
      const data = {
        BTC: { price: d.bitcoin?.usd || 0, change24h: d.bitcoin?.usd_24h_change || 0 },
        ETH: { price: d.ethereum?.usd || 0, change24h: d.ethereum?.usd_24h_change || 0 },
        SOL: { price: d.solana?.usd || 0, change24h: d.solana?.usd_24h_change || 0 },
        XRP: { price: d.ripple?.usd || 0, change24h: d.ripple?.usd_24h_change || 0 },
        DOGE: { price: d.dogecoin?.usd || 0, change24h: d.dogecoin?.usd_24h_change || 0 },
      };
      await setCached('prices', data);
      return data;
    }
  } catch {}
  return null;
}

/**
 * Fetch Kalshi dashboard summary from Hermes server proxy endpoint.
 * We call the MC dashboard server which has an API proxy.
 */
export async function getDashboardSummary() {
  const cached = await getCached('dashboard');
  if (cached) return cached;

  try {
    // Try the Hermes MC server first
    const resp = await fetch(
      `${HERMES_SERVER}/api/kalshi/summary`,
      { signal: AbortSignal.timeout(5000) }
    );
    if (resp.ok) {
      const data = await resp.json();
      await setCached('dashboard', data);
      return data;
    }
  } catch {}

  return FALLBACK_DASHBOARD;
}

const FALLBACK_DASHBOARD = {
  balance: 51.96,
  portfolio_value: 1.51,
  total_positions_all_time: 56,
  winners: 13,
  losers: 40,
  breakeven: 3,
  realized_pnl: -17.87,
  cost_basis: 1120.42,
  top_winners: [
    { market: 'KXGOVCA-26 (CA Governor)', pnl: 3.60, roi: '+56%' },
    { market: 'KXTRUMPADMINLEAVE', pnl: 1.97, roi: '+10%' },
    { market: 'KXOAIANTH-40 (OpenAI Anthropic)', pnl: 0.70, roi: '+3%' },
  ],
  top_losers: [
    { market: 'KXRECSSNBER-26 (Recession)', pnl: -4.79, roi: '-7%' },
    { market: 'KXMLB-26 (Baseball)', pnl: -3.60, roi: '-1%' },
    { market: 'KXAAAGASMINCA-26DEC31', pnl: -2.30, roi: '-13%' },
  ],
  crypto_positions: [
    { market: 'BTC $100k 2026', pnl: 0.15, result: 'win' },
    { market: 'BTC Yearly High', pnl: -0.10, result: 'loss' },
  ],
};

export async function getMarketScans() {
  const cached = await getCached('scans');
  if (cached) return cached;

  try {
    const resp = await fetch(
      `${HERMES_SERVER}/api/kalshi/scans`,
      { signal: AbortSignal.timeout(5000) }
    );
    if (resp.ok) {
      const data = await resp.json();
      await setCached('scans', data);
      return data;
    }
  } catch {}

  return {
    last_scan: new Date().toISOString(),
    assets: [
      { name: 'BTC', ticker: 'KXBTC', markets: 45, active_markets: 12, best_edge: '+2.3%', signal: 'WATCH' },
      { name: 'ETH', ticker: 'KXETH', markets: 38, active: 3, best_edge: '+0.8%', signal: 'WATCH' },
      { name: 'SOL', ticker: 'KXSOL', markets: 200, active: 0, best_edge: '—', signal: 'NO LIQUIDITY' },
      { name: 'XRP', ticker: 'KXXRP', markets: 165, active: 0, best_edge: '—', signal: 'NO LIQUIDITY' },
      { name: 'DOGE', ticker: 'KXDOGE', markets: 12, active: 1, best_edge: '+1.1%', signal: 'WATCH' },
    ],
    top_opportunities: [
      { market: 'BTC >$100k by June 5', edge: '+2.3%', confidence: 0.72, yes_price: 0.65, no_price: 0.35 },
    ],
  };
}

export async function getAITraderStatus() {
  const cached = await getCached('ai');
  if (cached) return cached;

  try {
    const resp = await fetch(
      `${HERMES_SERVER}/api/kalshi/ai-status`,
      { signal: AbortSignal.timeout(5000) }
    );
    if (resp.ok) {
      const data = await resp.json();
      await setCached('ai', data);
      return data;
    }
  } catch {}

  return {
    status: 'RUNNING',
    model: 'Grok-4 Fast Reasoning',
    mode: 'PAPER',
    open_positions: 0,
    total_analyses: 61,
    health_score: 30,
    last_decision: new Date().toISOString(),
  };
}

export async function refreshAll() {
  const [prices, dashboard, scans, ai] = await Promise.allSettled([
    getCryptoPrices(),
    getDashboardSummary(),
    getMarketScans(),
    getAITraderStatus(),
  ]);
  return {
    prices: prices.status === 'fulfilled' ? prices.value : null,
    dashboard: dashboard.status === 'fulfilled' ? dashboard.value : FALLBACK_DASHBOARD,
    scans: scans.status === 'fulfilled' ? scans.value : null,
    aiStatus: ai.status === 'fulfilled' ? ai.value : null,
  };
}
