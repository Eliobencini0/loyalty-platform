import { createContext, useContext, useState, useEffect } from 'react'
import type { ReactNode } from 'react'

interface OnlineContextType {
  isOnline: boolean
  wasOffline: boolean // Track if user was offline recently
}

const OnlineContext = createContext<OnlineContextType>({
  isOnline: true,
  wasOffline: false
})

export function OnlineProvider({ children }: { children: ReactNode }) {
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [wasOffline, setWasOffline] = useState(false)

  useEffect(() => {
    const handleOnline = () => {
      console.log('🌐 App is online')
      setIsOnline(true)

      // Show "back online" indicator briefly
      setWasOffline(true)
      setTimeout(() => setWasOffline(false), 3000)
    }

    const handleOffline = () => {
      console.log('📴 App is offline')
      setIsOnline(false)
      setWasOffline(false)
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  return (
    <OnlineContext.Provider value={{ isOnline, wasOffline }}>
      {children}
    </OnlineContext.Provider>
  )
}

export function useOnline() {
  const context = useContext(OnlineContext)
  if (!context) {
    throw new Error('useOnline must be used within OnlineProvider')
  }
  return context
}
