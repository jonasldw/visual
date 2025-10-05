'use client'

interface BackdropProps {
  onClick?: () => void
  blur?: 'none' | 'xs' | 'sm' | 'md' | 'lg'
  opacity?: number
  className?: string
}

export function Backdrop({
  onClick,
  blur = 'xs',
  opacity = 50,
  className = ''
}: BackdropProps) {
  const blurClasses = {
    none: '',
    xs: 'backdrop-blur-xs',
    sm: 'backdrop-blur-sm',
    md: 'backdrop-blur-md',
    lg: 'backdrop-blur-lg'
  }

  return (
    <div
      className={`fixed inset-0 z-0 transition-opacity bg-secondary-default/${opacity} ${blurClasses[blur]} ${className}`}
      onClick={onClick}
    />
  )
}
