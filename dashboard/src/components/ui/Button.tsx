import type { ReactNode, ButtonHTMLAttributes } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode
  variant?: 'primary' | 'secondary' | 'text' | 'danger'
  size?: 'default' | 'large'
  fullWidth?: boolean
}

export function Button({
  children,
  variant = 'primary',
  size = 'default',
  fullWidth = false,
  className = '',
  ...props
}: ButtonProps) {
  const baseClasses = 'btn'
  const variantClasses = variant === 'primary' ? 'btn-primary' :
                        variant === 'secondary' ? 'btn-secondary' :
                        variant === 'danger' ? 'btn-danger' :
                        'btn-text'
  const sizeClasses = size === 'large' ? 'btn-large' : ''
  const widthClasses = fullWidth ? 'btn-full-width' : ''

  const combinedClasses = [baseClasses, variantClasses, sizeClasses, widthClasses, className]
    .filter(Boolean)
    .join(' ')

  return (
    <button
      className={combinedClasses}
      style={{
        minHeight: size === 'large' ? '48px' : '44px',
        minWidth: size === 'large' ? '48px' : '44px'
      }}
      {...props}
    >
      {children}
    </button>
  )
}
