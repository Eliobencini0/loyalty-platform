import { openDB } from 'idb'
import type { DBSchema, IDBPDatabase } from 'idb'

// TypeScript schema for IndexedDB
// Using any for complex nested structures to avoid DBSchema type conflicts
export interface LoyaltyDB extends DBSchema {
  customers: {
    key: string
    value: {
      id: string
      merchantId: string
      firstName: string
      lastName: string
      email: string
      pointsBalance: number
      lastSync: number
    }
    indexes: { 'by-merchant': string }
  }
  campaigns: {
    key: string
    value: {
      id: string
      merchantId: string
      name: string
      gameType: string
      active: boolean
      prizes: any[]
      lastSync: number
    }
    indexes: { 'by-merchant': string }
  }
  dashboardStats: {
    key: string
    value: {
      merchantId: string
      activeMembers: number
      newMembers: number
      avgRating: number | null
      retention: number | null
      nearRewardCustomers: number
      trends: any
      syncedAt: number
    }
  }
  scanHistory: {
    key: number
    value: {
      id?: number
      customerId: string
      customerName: string
      points: number
      timestamp: number
      synced: boolean
    }
    indexes: { 'by-synced': number; 'by-timestamp': number }
  }
  pendingSync: {
    key: number
    value: {
      id?: number
      type: string
      method: string
      url: string
      payload: any
      createdAt: number
      retries: number
      lastError?: string
    }
    indexes: { 'by-type': string; 'by-created': number }
  }
  syncMeta: {
    key: string
    value: {
      storeName: string
      lastSync: number
      itemCount: number
    }
  }
}

let dbInstance: IDBPDatabase<LoyaltyDB> | null = null

/**
 * Get or create the IndexedDB instance
 */
export async function getDB(): Promise<IDBPDatabase<LoyaltyDB>> {
  if (dbInstance) {
    return dbInstance
  }

  dbInstance = await openDB<LoyaltyDB>('loyalty-db', 1, {
    upgrade(db, oldVersion, newVersion) {
      console.log(`Upgrading IndexedDB from v${oldVersion} to v${newVersion}`)

      // Customers store
      if (!db.objectStoreNames.contains('customers')) {
        const customersStore = db.createObjectStore('customers', { keyPath: 'id' })
        customersStore.createIndex('by-merchant', 'merchantId', { unique: false })
      }

      // Campaigns store
      if (!db.objectStoreNames.contains('campaigns')) {
        const campaignsStore = db.createObjectStore('campaigns', { keyPath: 'id' })
        campaignsStore.createIndex('by-merchant', 'merchantId', { unique: false })
      }

      // Dashboard stats store
      if (!db.objectStoreNames.contains('dashboardStats')) {
        db.createObjectStore('dashboardStats', { keyPath: 'merchantId' })
      }

      // Scan history store
      if (!db.objectStoreNames.contains('scanHistory')) {
        const scanStore = db.createObjectStore('scanHistory', {
          keyPath: 'id',
          autoIncrement: true
        })
        scanStore.createIndex('by-synced', 'synced', { unique: false })
        scanStore.createIndex('by-timestamp', 'timestamp', { unique: false })
      }

      // Pending sync queue store
      if (!db.objectStoreNames.contains('pendingSync')) {
        const syncStore = db.createObjectStore('pendingSync', {
          keyPath: 'id',
          autoIncrement: true
        })
        syncStore.createIndex('by-type', 'type', { unique: false })
        syncStore.createIndex('by-created', 'createdAt', { unique: false })
      }

      // Sync metadata store
      if (!db.objectStoreNames.contains('syncMeta')) {
        db.createObjectStore('syncMeta', { keyPath: 'storeName' })
      }
    },
    blocked() {
      console.warn('IndexedDB upgrade blocked - close other tabs')
    },
    blocking() {
      console.warn('IndexedDB blocking - this tab is blocking an upgrade')
      if (dbInstance) {
        dbInstance.close()
        dbInstance = null
      }
    },
    terminated() {
      console.error('IndexedDB connection terminated unexpectedly')
      dbInstance = null
    }
  })

  return dbInstance
}

/**
 * Close the database connection
 */
export function closeDB(): void {
  if (dbInstance) {
    dbInstance.close()
    dbInstance = null
  }
}

/**
 * Delete the entire database (for testing/reset)
 */
export async function deleteDB(): Promise<void> {
  closeDB()
  await new Promise<void>((resolve, reject) => {
    const request = indexedDB.deleteDatabase('loyalty-db')
    request.onsuccess = () => resolve()
    request.onerror = () => reject(request.error)
    request.onblocked = () => {
      console.warn('Database deletion blocked')
      reject(new Error('Database deletion blocked'))
    }
  })
}
