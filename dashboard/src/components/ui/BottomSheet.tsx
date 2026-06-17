import { useEffect, useRef } from 'react'
import type { ReactNode } from 'react'

interface BottomSheetProps {
  isOpen: boolean
  onClose: () => void
  children: ReactNode
  title?: string
}

export function BottomSheet({ isOpen, onClose, children, title }: BottomSheetProps) {
  const sheetRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }

    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <>
      <div
        className="bottom-sheet-overlay"
        onClick={onClose}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          zIndex: 999,
          animation: 'fadeIn 0.2s ease-out'
        }}
      />
      <div
        className="bottom-sheet"
        ref={sheetRef}
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: 'var(--color-bg-primary, white)',
          borderTopLeftRadius: '16px',
          borderTopRightRadius: '16px',
          maxHeight: '90vh',
          zIndex: 1000,
          animation: 'slideUp 0.3s ease-out',
          boxShadow: '0 -4px 20px rgba(0, 0, 0, 0.15)'
        }}
      >
        <div
          className="bottom-sheet-handle"
          style={{
            width: '40px',
            height: '4px',
            backgroundColor: 'var(--color-border, #ccc)',
            borderRadius: '2px',
            margin: '12px auto',
            cursor: 'pointer'
          }}
          onClick={onClose}
        />
        {title && (
          <div
            className="bottom-sheet-header"
            style={{
              padding: '0 20px 16px',
              borderBottom: '1px solid var(--color-border, #eee)'
            }}
          >
            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 600 }}>{title}</h3>
          </div>
        )}
        <div
          className="bottom-sheet-content"
          style={{
            padding: '20px',
            overflowY: 'auto',
            maxHeight: 'calc(90vh - 60px)'
          }}
        >
          {children}
        </div>
      </div>
    </>
  )
}
