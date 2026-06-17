import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import type { ReactNode } from 'react'
import { getPendingSyncItems } from '../db/operations'

interface SyncContextType {
  pendingCount: number
  refresh: () => Promise<void>
  isSyncing: boolean
}

const SyncContext = createContext<SyncContextType>({
  pendingCount: 0,
  refresh: async () => {},
  isSyncing: false
})

export function SyncProvider({ children }: { children: ReactNode }) {
  const [pendingCount, setPendingCount] = useState(0)
  const [isSyncing] = useState(false)

  const refresh = useCallback(async () => {
    try {
      const items = await getPendingSyncItems()
      setPendingCount(items.length)
      console.log(`📊 Sync queue: ${items.length} pending items`)
    } catch (error) {
      console.error('Failed to get pending sync items:', error)
    }
  }, [])

  useEffect(() => {
    // Initial refresh
    refresh()

    // Refresh every 5 seconds
    const interval = setInterval(refresh, 5000)

    // Listen for online event to trigger sync
    const handleOnline = () => {
      console.log('🔄 Back online - checking sync queue')
      refresh()
    }

    window.addEventListener('online', handleOnline)

    return () => {
      clearInterval(interval)
      window.removeEventListener('online', handleOnline)
    }
  }, [refresh])

  // Listen for IndexedDB changes (if supported)
  useEffect(() => {
    // Custom event for when items are added to sync queue
    const handleSyncAdded = () => {
      console.log('📝 Item added to sync queue')
      refresh()
    }

    window.addEventListener('sync-queue-changed', handleSyncAdded)

    return () => {
      window.removeEventListener('sync-queue-changed', handleSyncAdded)
    }
  }, [refresh])

  return (
    <SyncContext.Provider value={{ pendingCount, refresh, isSyncing }}>
      {children}
    </SyncContext.Provider>
  )
}

export function useSync() {
  const context = useContext(SyncContext)
  if (!context) {
    throw new Error('useSync must be used within SyncProvider')
  }
  return context
}

/**
 * Helper to dispatch sync queue changed event
 */
export function notifySyncQueueChanged() {
  window.dispatchEvent(new Event('sync-queue-changed'))
}
