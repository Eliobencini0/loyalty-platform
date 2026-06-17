import { useSync } from '../contexts/SyncContext'

export function SyncQueueBadge() {
  const { pendingCount, isSyncing } = useSync()

  if (pendingCount === 0) {
    return null
  }

  return (
    <div
      className="sync-badge"
      title={`${pendingCount} pending operation${pendingCount > 1 ? 's' : ''}`}
    >
      {isSyncing ? (
        <span className="material-symbols-outlined spinning">sync</span>
      ) : (
        <>
          <span className="material-symbols-outlined">sync</span>
          <span className="badge-count">{pendingCount}</span>
        </>
      )}
    </div>
  )
}
