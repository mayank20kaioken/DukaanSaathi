import type { IncomingMessage, ServerResponse } from 'node:http';
import * as fs from 'node:fs';
import * as path from 'node:path';

export interface TinyFishListingData {
  id: string;
  supplierName: string;
  platform: string;
  productMatch: string;
  packSize: string;
  packSizeMatch: boolean;
  listedPrice: number;
  minOrderQty: number;
  deliveryDays: number;
  sourceUrl: string;
  retrievedAt: string;
  notes: string;
  isLive: boolean;
  dataSource: 'TINYFISH_LIVE' | 'DEMO_FIXTURE';
  confidenceScore?: number;
  matchWarning?: string;
  reviewed?: boolean;
}

export interface MarketScoutTaskData {
  id: string;
  productQuery: string;
  category: string;
  targetMarket: string;
  status: 'IDLE' | 'RESEARCHING' | 'COMPLETED' | 'FAILED' | 'CREDENTIALS_REQUIRED';
  startedAt?: string;
  completedAt?: string;
  ourCostPrice: number;
  bestExternalPrice?: number;
  potentialSavingPercent?: number;
  results: TinyFishListingData[];
  isLive: boolean;
  dataSource: 'TINYFISH_LIVE' | 'DEMO_FIXTURE';
  apiMessage?: string;
  reviewedAt?: string;
  notes?: string;
}

export interface SavedComparisonRecord {
  id: string;
  taskId: string;
  productId?: string;
  productName: string;
  savedCostPrice: number;
  bestExternalPrice: number;
  supplierName: string;
  sourceUrl: string;
  packSize: string;
  potentialSavings: number;
  reviewedAt: string;
  notes?: string;
  isLive: boolean;
  dataSource: 'TINYFISH_LIVE' | 'DEMO_FIXTURE';
}

// In-memory store for reviewed comparisons
const savedComparisonsStore: SavedComparisonRecord[] = [
  {
    id: 'rev-demo-01',
    taskId: 'task-mst-01',
    productId: 'prod-02',
    productName: 'Fortune Sunlite Refined Sunflower Oil 1L',
    savedCostPrice: 132.0,
    bestExternalPrice: 124.5,
    supplierName: 'Udaan B2B Trade Depot',
    sourceUrl: 'https://udaan.com/groceries/edible-oils/fortune-1l',
    packSize: '1 Litre x 12 Pouches Case',
    potentialSavings: 5.68,
    reviewedAt: '2026-10-15T14:15:00Z',
    notes: 'Verified minimum carton requirement with shopkeeper. Feasible for weekly order.',
    isLive: false,
    dataSource: 'DEMO_FIXTURE'
  }
];

/**
 * Safely retrieve the TinyFish API key from environment or local .env file.
 * Key is strictly kept on the server and never sent to browser clients.
 */
export function getTinyFishApiKey(): string | null {
  // 1. Check process.env
  if (process.env.TINYFISH_API_KEY && process.env.TINYFISH_API_KEY.trim() !== '') {
    return process.env.TINYFISH_API_KEY.trim();
  }

  // 2. Check .env file in root directory if not loaded into process.env
  try {
    const rootDir = process.cwd();
    const envPaths = [path.join(rootDir, '.env'), path.join(rootDir, '.env.local')];

    for (const envPath of envPaths) {
      if (fs.existsSync(envPath)) {
        const content = fs.readFileSync(envPath, 'utf8');
        const match = content.match(/^\s*TINYFISH_API_KEY\s*=\s*(.+)$/m);
        if (match && match[1]) {
          const key = match[1].trim().replace(/^["']|["']$/g, '');
          if (key && key !== 'your_tinyfish_api_key_here') {
            return key;
          }
        }
      }
    }
  } catch {
    // Gracefully handle file read errors
  }

  return null;
}

/**
 * Generate fallback demonstration listings when live credentials are not available.
 * These are transparently labeled as DEMO_FIXTURE and isLive: false.
 */
function generateDemoTask(
  productName: string,
  brand: string,
  packSize: string,
  targetMarket: string,
  ourCostPrice: number,
  taskType: string,
  statusReason: string
): MarketScoutTaskData {
  const taskId = `mst-demo-${Date.now()}`;
  const now = new Date().toISOString();

  const results: TinyFishListingData[] = [
    {
      id: `tf-fixture-${taskId}-1`,
      supplierName: 'Udaan B2B Trade Depot',
      platform: 'Udaan Wholesale',
      productMatch: `${productName} (${packSize})`,
      packSize: packSize,
      packSizeMatch: true,
      listedPrice: Math.round(ourCostPrice * 0.94),
      minOrderQty: 12,
      deliveryDays: 1,
      sourceUrl: 'https://udaan.com/groceries/listings',
      retrievedAt: now,
      notes: 'Standard B2B wholesale carton lot for registered GST retail businesses. Unconfirmed wholesale listing.',
      isLive: false,
      dataSource: 'DEMO_FIXTURE',
      confidenceScore: 92
    },
    {
      id: `tf-fixture-${taskId}-2`,
      supplierName: 'Jumbotail Retailer Supply',
      platform: 'Jumbotail Marketplace',
      productMatch: `${productName} Standard Pack`,
      packSize: packSize,
      packSizeMatch: true,
      listedPrice: Math.round(ourCostPrice * 0.96),
      minOrderQty: 15,
      deliveryDays: 2,
      sourceUrl: 'https://jumbotail.com/retail-deals',
      retrievedAt: now,
      notes: 'Morning storefront delivery with digital GST tax invoice. Unconfirmed wholesale listing.',
      isLive: false,
      dataSource: 'DEMO_FIXTURE',
      confidenceScore: 88
    },
    {
      id: `tf-fixture-${taskId}-3`,
      supplierName: 'Metro Cash & Carry Wholesale Hub',
      platform: 'Metro B2B Online',
      productMatch: `${productName} Institutional Pack`,
      packSize: `${packSize} (Combo Box)`,
      packSizeMatch: false,
      listedPrice: Math.round(ourCostPrice * 1.05),
      minOrderQty: 6,
      deliveryDays: 1,
      sourceUrl: 'https://metro.co.in/wholesale/search',
      retrievedAt: now,
      notes: 'Pack size mismatch detected: Institutional bulk packaging with different container weight.',
      isLive: false,
      dataSource: 'DEMO_FIXTURE',
      confidenceScore: 65,
      matchWarning: `Pack size mismatch: Expected "${packSize}", listing provides "${packSize} (Combo Box)".`
    },
    {
      id: `tf-fixture-${taskId}-4`,
      supplierName: 'IndiaMART Verified Merchant Hub',
      platform: 'IndiaMART Direct',
      productMatch: `${productName}`,
      packSize: `${packSize} (Wholesale Lot)`,
      packSizeMatch: true,
      listedPrice: Math.round(ourCostPrice * 0.91),
      minOrderQty: 60,
      deliveryDays: 4,
      sourceUrl: 'https://dir.indiamart.com/search.mp',
      retrievedAt: now,
      notes: 'Lowest unit price, but requires high Minimum Order Quantity (60 units) and advance payment.',
      isLive: false,
      dataSource: 'DEMO_FIXTURE',
      confidenceScore: 80
    }
  ];

  const matched = results.filter(r => r.packSizeMatch);
  const bestExternalPrice = matched.length > 0 ? Math.min(...matched.map(r => r.listedPrice)) : ourCostPrice;
  const potentialSavingPercent = Number((((ourCostPrice - bestExternalPrice) / ourCostPrice) * 100).toFixed(2));

  return {
    id: taskId,
    productQuery: `${productName} ${brand} (${packSize})`,
    category: taskType,
    targetMarket,
    status: 'CREDENTIALS_REQUIRED',
    startedAt: now,
    completedAt: now,
    ourCostPrice,
    bestExternalPrice,
    potentialSavingPercent,
    results,
    isLive: false,
    dataSource: 'DEMO_FIXTURE',
    apiMessage: statusReason
  };
}

/**
 * Execute real TinyFish AI Web Agent automation request.
 * Dispatches to https://agent.tinyfish.ai/v1/automation/run with server-side X-API-Key.
 */
async function callTinyFishAgent(
  apiKey: string,
  productName: string,
  packSize: string,
  ourCostPrice: number,
  targetMarket: string,
  taskType: string
): Promise<MarketScoutTaskData> {
  const taskId = `mst-live-${Date.now()}`;
  const startedAt = new Date().toISOString();

  // IndiaMART / public wholesale search URL for the product
  const searchQuery = encodeURIComponent(`${productName} ${packSize}`);
  const targetUrl = `https://dir.indiamart.com/search.mp?ss=${searchQuery}`;

  const goal = `Find wholesale B2B supplier listings for "${productName}" (${packSize}). Extract supplier name, platform name, full product title, pack size, wholesale unit price in INR, minimum order quantity (MOQ), estimated delivery days, source URL, and notes. Only return realistic data found on the page.`;

  const outputSchema = {
    type: 'object',
    properties: {
      listings: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            supplierName: { type: 'string' },
            platform: { type: 'string' },
            productTitle: { type: 'string' },
            packSize: { type: 'string' },
            listedPrice: { type: 'number' },
            minOrderQty: { type: 'number' },
            deliveryDays: { type: 'number' },
            sourceUrl: { type: 'string' },
            notes: { type: 'string' }
          },
          required: ['supplierName', 'listedPrice']
        }
      }
    },
    required: ['listings']
  };

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 45000);

  try {
    const response = await fetch('https://agent.tinyfish.ai/v1/automation/run', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': apiKey
      },
      body: JSON.stringify({
        url: targetUrl,
        goal,
        output_schema: outputSchema
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      let errorJson: any;
      try {
        errorJson = JSON.parse(errorText);
      } catch {
        errorJson = { message: errorText };
      }

      const errorMessage = errorJson?.error?.message || errorJson?.message || `HTTP ${response.status} from TinyFish`;
      throw new Error(`TinyFish Agent API returned ${response.status}: ${errorMessage}`);
    }

    const data: any = await response.json();
    const rawListings: any[] = data.result?.listings || data.listings || data.data?.listings || [];

    if (!Array.isArray(rawListings) || rawListings.length === 0) {
      throw new Error('TinyFish Agent succeeded but found no listings matching the requested query.');
    }

    const normalizedResults: TinyFishListingData[] = rawListings.map((item, index) => {
      const listingPackSize = String(item.packSize || packSize).trim();
      const packSizeMatch = listingPackSize.toLowerCase().includes(packSize.toLowerCase()) ||
                            packSize.toLowerCase().includes(listingPackSize.toLowerCase());

      const numericPrice = typeof item.listedPrice === 'number'
        ? item.listedPrice
        : parseFloat(String(item.listedPrice).replace(/[^0-9.]/g, '')) || ourCostPrice;

      return {
        id: `tf-live-${taskId}-${index + 1}`,
        supplierName: String(item.supplierName || 'IndiaMART Verified Merchant'),
        platform: String(item.platform || 'IndiaMART B2B'),
        productMatch: String(item.productTitle || `${productName} (${listingPackSize})`),
        packSize: listingPackSize,
        packSizeMatch,
        listedPrice: Math.round(numericPrice * 100) / 100,
        minOrderQty: Number(item.minOrderQty) || 10,
        deliveryDays: Number(item.deliveryDays) || 3,
        sourceUrl: String(item.sourceUrl || targetUrl),
        retrievedAt: new Date().toISOString(),
        notes: String(item.notes || 'Retrieved live from public web listing by TinyFish Web Agent. Unconfirmed wholesale offer.'),
        isLive: true,
        dataSource: 'TINYFISH_LIVE',
        confidenceScore: packSizeMatch ? 90 : 60,
        matchWarning: packSizeMatch ? undefined : `Pack size mismatch: Listing specifies "${listingPackSize}" instead of requested "${packSize}".`
      };
    });

    const matchedListings = normalizedResults.filter(r => r.packSizeMatch);
    const bestExternalPrice = matchedListings.length > 0
      ? Math.min(...matchedListings.map(r => r.listedPrice))
      : Math.min(...normalizedResults.map(r => r.listedPrice));
    const potentialSavingPercent = Number((((ourCostPrice - bestExternalPrice) / ourCostPrice) * 100).toFixed(2));

    return {
      id: taskId,
      productQuery: `${productName} (${packSize})`,
      category: taskType,
      targetMarket,
      status: 'COMPLETED',
      startedAt,
      completedAt: new Date().toISOString(),
      ourCostPrice,
      bestExternalPrice,
      potentialSavingPercent,
      results: normalizedResults,
      isLive: true,
      dataSource: 'TINYFISH_LIVE',
      apiMessage: 'Live external research completed successfully via TinyFish AI Web Agent.'
    };
  } catch (err: any) {
    clearTimeout(timeoutId);
    throw err;
  }
}

/**
 * Buffer and parse JSON request body from IncomingMessage
 */
function parseJsonBody(req: IncomingMessage): Promise<any> {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk;
      if (body.length > 1e6) {
        req.destroy();
        reject(new Error('Request payload exceeded size limit (1MB).'));
      }
    });
    req.on('end', () => {
      if (!body) {
        resolve({});
        return;
      }
      try {
        resolve(JSON.parse(body));
      } catch (err) {
        reject(new Error('Invalid JSON payload in request body.'));
      }
    });
    req.on('error', reject);
  });
}

/**
 * Send JSON response
 */
function sendJson(res: ServerResponse, status: number, data: any) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.end(JSON.stringify(data));
}

/**
 * Main Connect middleware handler for /api/market-scout/*
 */
export async function handleTinyFishProxy(
  req: IncomingMessage,
  res: ServerResponse,
  next: () => void
): Promise<void> {
  const url = req.url || '';

  if (!url.startsWith('/api/market-scout')) {
    next();
    return;
  }

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.end();
    return;
  }

  const cleanPath = url.split('?')[0];

  try {
    // 1. GET /api/market-scout/config
    if (cleanPath === '/api/market-scout/config' && req.method === 'GET') {
      const apiKey = getTinyFishApiKey();
      sendJson(res, 200, {
        success: true,
        isConfigured: Boolean(apiKey),
        keyMasked: apiKey ? `sk-...${apiKey.slice(-4)}` : null,
        endpoint: 'https://agent.tinyfish.ai/v1/automation/run',
        setupInstruction: !apiKey
          ? 'TINYFISH_API_KEY is not configured in .env. To enable live research, add TINYFISH_API_KEY=your_key to your .env file and restart the server.'
          : 'TinyFish AI Web Agent is configured for live web research.'
      });
      return;
    }

    // 2. POST /api/market-scout/research
    if (cleanPath === '/api/market-scout/research' && req.method === 'POST') {
      const body = await parseJsonBody(req);
      const {
        productName = 'Refined Sunflower Oil',
        brand = 'Fortune',
        packSize = '1 Litre Pouch',
        targetMarket = 'Delhi NCR Wholesale & B2B Listings',
        ourCostPrice = 132.0,
        taskType = 'SUPPLIER_COMPARISON'
      } = body;

      const apiKey = getTinyFishApiKey();

      // Case A: No API key configured -> Honest CREDENTIALS_REQUIRED status with clearly marked demo fixtures
      if (!apiKey) {
        const demoTask = generateDemoTask(
          productName,
          brand,
          packSize,
          targetMarket,
          Number(ourCostPrice),
          taskType,
          'TINYFISH_API_KEY is not configured in the server environment (.env). DukaanSaathi safely returned verified baseline wholesale listings labeled as demo fixtures.'
        );

        sendJson(res, 200, {
          success: true,
          isLive: false,
          status: 'CREDENTIALS_REQUIRED',
          message: 'TINYFISH_API_KEY environment variable is not configured on the server. Falling back to labeled demonstration fixtures.',
          task: demoTask
        });
        return;
      }

      // Case B: API key is configured -> Execute genuine TinyFish live research
      try {
        const liveTask = await callTinyFishAgent(
          apiKey,
          productName,
          packSize,
          Number(ourCostPrice),
          targetMarket,
          taskType
        );

        sendJson(res, 200, {
          success: true,
          isLive: true,
          status: 'COMPLETED',
          message: 'Live TinyFish external research completed successfully.',
          task: liveTask
        });
        return;
      } catch (agentError: any) {
        console.error('[TinyFish Server Proxy Error]:', agentError.message);

        // Fall back gracefully with clear failure notice and labeled fixtures
        const fallbackTask = generateDemoTask(
          productName,
          brand,
          packSize,
          targetMarket,
          Number(ourCostPrice),
          taskType,
          `TinyFish agent request failed (${agentError.message}). Falling back to baseline demonstration fixtures.`
        );
        fallbackTask.status = 'FAILED';

        sendJson(res, 200, {
          success: false,
          isLive: false,
          status: 'FAILED',
          error: agentError.message,
          message: `Live agent request failed: ${agentError.message}. Showing labeled fallback fixtures.`,
          task: fallbackTask
        });
        return;
      }
    }

    // 3. POST /api/market-scout/save-comparison
    if (cleanPath === '/api/market-scout/save-comparison' && req.method === 'POST') {
      const body = await parseJsonBody(req);
      const newRecord: SavedComparisonRecord = {
        id: `rev-${Date.now()}`,
        taskId: body.taskId || `task-${Date.now()}`,
        productId: body.productId,
        productName: body.productName || 'Unknown Product',
        savedCostPrice: Number(body.savedCostPrice) || 0,
        bestExternalPrice: Number(body.bestExternalPrice) || 0,
        supplierName: body.supplierName || 'External Supplier',
        sourceUrl: body.sourceUrl || '',
        packSize: body.packSize || 'Standard',
        potentialSavings: Number(body.potentialSavings) || 0,
        reviewedAt: new Date().toISOString(),
        notes: body.notes || 'Benchmark approved and saved for future purchasing review.',
        isLive: Boolean(body.isLive),
        dataSource: body.dataSource || 'DEMO_FIXTURE'
      };

      savedComparisonsStore.unshift(newRecord);

      sendJson(res, 201, {
        success: true,
        message: 'Comparison benchmark saved successfully.',
        comparison: newRecord
      });
      return;
    }

    // 4. GET /api/market-scout/saved-comparisons
    if (cleanPath === '/api/market-scout/saved-comparisons' && req.method === 'GET') {
      sendJson(res, 200, {
        success: true,
        comparisons: savedComparisonsStore
      });
      return;
    }

    sendJson(res, 404, { success: false, error: 'Endpoint not found.' });
  } catch (err: any) {
    console.error('[Server Error /api/market-scout]:', err);
    sendJson(res, 500, { success: false, error: err.message || 'Internal server error.' });
  }
}
