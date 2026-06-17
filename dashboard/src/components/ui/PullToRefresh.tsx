import { useState, useRef } from 'react'
import type { ReactNode } from 'react'

interface PullToRefreshProps {
  onRefresh: () => Promise<void>
  children: ReactNode
  threshold?: number
}

export function PullToRefresh({
  onRefresh,
  children,
  threshold = 80
}: PullToRefreshProps) {
  const [pulling, setPulling] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [pullDistance, setPullDistance] = useState(0)
  const startY = useRef(0)
  const containerRef = useRef<HTMLDivElement>(null)

  const handleTouchStart = (e: React.TouchEvent) => {
    // Only activate pull-to-refresh if at the top of the page
    if (window.scrollY === 0) {
      startY.current = e.touches[0].clientY
    }
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (refreshing || window.scrollY > 0) return

    const currentY = e.touches[0].clientY
    const diff = currentY - startY.current

    if (diff > 0 && diff < 200) {
      setPullDistance(diff)
      if (diff > threshold) {
        setPulling(true)
      } else {
        setPulling(false)
      }
    }
  }

  const handleTouchEnd = async () => {
    if (pulling && !refreshing) {
      setRefreshing(true)
      setPullDistance(threshold)

      try {
        await onRefresh()
      } catch (error) {
        console.error('Refresh failed:', error)
      } finally {
        setRefreshing(false)
        setPulling(false)
        setPullDistance(0)
      }
    } else {
      setPulling(false)
      setPullDistance(0)
    }
  }

  const rotation = Math.min((pullDistance / threshold) * 180, 180)
  const opacity = Math.min(pullDistance / threshold, 1)

  return (
    <div
      ref={containerRef}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={{
        position: 'relative',
        minHeight: '100%'
      }}
    >
      {(pulling || refreshing || pullDistance > 0) && (
        <div
          className="pull-to-refresh-indicator"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: `${Math.min(pullDistance, threshold)}px`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: refreshing ? 'height 0.3s ease' : 'none',
            opacity: opacity
          }}
        >
          <span
            className="material-symbols-outlined"
            style={{
              fontSize: '24px',
              color: 'var(--color-primary, #4F46E5)',
              transform: `rotate(${rotation}deg)`,
              transition: refreshing ? 'transform 0.3s ease' : 'none',
              animation: refreshing ? 'spin 1s linear infinite' : 'none'
            }}
          >
            {refreshing ? 'sync' : 'arrow_downward'}
          </span>
        </div>
      )}
      <div
        style={{
          transform: `translateY(${Math.min(pullDistance, threshold)}px)`,
          transition: refreshing || (!pulling && pullDistance === 0) ? 'transform 0.3s ease' : 'none'
        }}
      >
        {children}
      </div>
    </div>
  )
}
