import { getDB } from './schema'

// ============================================================================
// CUSTOMERS
// ============================================================================

export async function getCachedCustomers(merchantId: string) {
  const db = await getDB()
  return db.getAllFromIndex('customers', 'by-merchant', merchantId)
}

export async function cacheCustomers(customers: any[]) {
  const db = await getDB()
  const tx = db.transaction('customers', 'readwrite')
  await Promise.all(customers.map(c => tx.store.put({ ...c, lastSync: Date.now() })))
  await tx.done
}

export async function clearCustomersCache() {
  const db = await getDB()
  await db.clear('customers')
}

// ============================================================================
// CAMPAIGNS
// ============================================================================

export async function getCachedCampaigns(merchantId: string) {
  const db = await getDB()
  return db.getAllFromIndex('campaigns', 'by-merchant', merchantId)
}

export async function cacheCampaigns(campaigns: any[]) {
  const db = await getDB()
  const tx = db.transaction('campaigns', 'readwrite')
  await Promise.all(campaigns.map(c => tx.store.put({ ...c, lastSync: Date.now() })))
  await tx.done
}

export async function clearCampaignsCache() {
  const db = await getDB()
  await db.clear('campaigns')
}

// ============================================================================
// DASHBOARD STATS
// ============================================================================

export async function getCachedDashboardStats(merchantId: string) {
  const db = await getDB()
  return db.get('dashboardStats', merchantId)
}

export async function cacheDashboardStats(merchantId: string, stats: any) {
  const db = await getDB()
  await db.put('dashboardStats', {
    merchantId,
    ...stats,
    syncedAt: Date.now()
  })
}

export async function clearDashboardStatsCache() {
  const db = await getDB()
  await db.clear('dashboardStats')
}

// ============================================================================
// SCAN HISTORY
// ============================================================================

export async function addScanToHistory(scan: {
  customerId: string
  customerName: string
  points: number
  synced: boolean
}) {
  const db = await getDB()
  return db.add('scanHistory', {
    ...scan,
    timestamp: Date.now()
  })
}

export async function getScanHistory(limit: number = 100) {
  const db = await getDB()
  const tx = db.transaction('scanHistory', 'readonly')
  const index = tx.store.index('by-timestamp')

  const scans: any[] = []
  let cursor = await index.openCursor(null, 'prev') // Newest first

  while (cursor && scans.length < limit) {
    scans.push(cursor.value)
    cursor = await cursor.continue()
  }

  return scans
}

export async function markScanAsSynced(scanId: number) {
  const db = await getDB()
  const scan = await db.get('scanHistory', scanId)
  if (scan) {
    await db.put('scanHistory', { ...scan, synced: true })
  }
}

export async function getUnsyncedScans() {
  const db = await getDB()
  return db.getAllFromIndex('scanHistory', 'by-synced', 0 as any) // false stored as 0
}

export async function clearScanHistory() {
  const db = await getDB()
  await db.clear('scanHistory')
}

// ============================================================================
// PENDING SYNC QUEUE
// ============================================================================

export interface PendingSyncItem {
  id?: number
  type: 'scan' | 'feedback' | 'campaign' | 'points' | 'customer'
  method: 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  url: string
  payload: any
  createdAt: number
  retries: number
  lastError?: string
}

export async function addToPendingSync(item: Omit<PendingSyncItem, 'id' | 'createdAt' | 'retries'>) {
  const db = await getDB()
  return db.add('pendingSync', {
    ...item,
    createdAt: Date.now(),
    retries: 0
  })
}

export async function getPendingSyncItems(): Promise<PendingSyncItem[]> {
  const db = await getDB()
  return db.getAll('pendingSync') as Promise<PendingSyncItem[]>
}

export async function getPendingSyncItemsByType(type: string) {
  const db = await getDB()
  return db.getAllFromIndex('pendingSync', 'by-type', type)
}

export async function removeSyncItem(id: number) {
  const db = await getDB()
  return db.delete('pendingSync', id)
}

export async function updateSyncItem(id: number, updates: Partial<PendingSyncItem>) {
  const db = await getDB()
  const item = await db.get('pendingSync', id)
  if (item) {
    await db.put('pendingSync', { ...item, ...updates })
  }
}

export async function incrementSyncRetry(id: number, error: string) {
  const db = await getDB()
  const item = await db.get('pendingSync', id)
  if (item) {
    await db.put('pendingSync', {
      ...item,
      retries: item.retries + 1,
      lastError: error
    })
  }
}

export async function clearPendingSync() {
  const db = await getDB()
  await db.clear('pendingSync')
}

// ============================================================================
// SYNC METADATA
// ============================================================================

export async function getLastSyncTime(storeName: string): Promise<number> {
  const db = await getDB()
  const meta = await db.get('syncMeta', storeName)
  return meta?.lastSync || 0
}

export async function setLastSyncTime(storeName: string, timestamp: number = Date.now()) {
  const db = await getDB()
  const existing = await db.get('syncMeta', storeName)
  await db.put('syncMeta', {
    storeName,
    lastSync: timestamp,
    itemCount: existing?.itemCount || 0
  })
}

export async function updateSyncMeta(storeName: string, itemCount: number) {
  const db = await getDB()
  await db.put('syncMeta', {
    storeName,
    lastSync: Date.now(),
    itemCount
  })
}

export async function getAllSyncMeta() {
  const db = await getDB()
  return db.getAll('syncMeta')
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Check if data is stale based on TTL
 */
export function isStale(lastSync: number, ttlMs: number): boolean {
  return !lastSync || (Date.now() - lastSync > ttlMs)
}

/**
 * Get database size estimation
 */
export async function getDBSize(): Promise<{ usage: number; quota: number }> {
  if ('storage' in navigator && 'estimate' in navigator.storage) {
    const estimate = await navigator.storage.estimate()
    return {
      usage: estimate.usage || 0,
      quota: estimate.quota || 0
    }
  }
  return { usage: 0, quota: 0 }
}

/**
 * Clear all cached data (keep sync queue)
 */
export async function clearAllCaches() {
  await clearCustomersCache()
  await clearCampaignsCache()
  await clearDashboardStatsCache()
  await clearScanHistory()
  console.log('All caches cleared (sync queue preserved)')
}
