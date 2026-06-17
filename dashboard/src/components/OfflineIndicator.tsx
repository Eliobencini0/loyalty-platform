import { useOnline } from '../contexts/OnlineContext'

export function OfflineIndicator() {
  const { isOnline, wasOffline } = useOnline()

  if (isOnline && !wasOffline) {
    return null
  }

  if (wasOffline && isOnline) {
    return (
      <div className="offline-banner back-online">
        <span className="material-symbols-outlined">cloud_done</span>
        <span>Back online! Syncing data...</span>
      </div>
    )
  }

  return (
    <div className="offline-banner offline">
      <span className="material-symbols-outlined">cloud_off</span>
      <span>You're offline. Changes will sync when reconnected.</span>
    </div>
  )
}
