'use client'

interface BackdropProps {
  onClick?: () => void
  blur?: 'none' | 'xs' | 'sm' | 'md' | 'lg'
  opacity?: number
  color?: string // CSS variable name without 'var()' wrapper, e.g. '--secondary-default'
  className?: string
}

export function Backdrop({
  onClick,
  blur = 'xs',
  opacity = 50,
  color = '--secondary-default',
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
      className={`fixed inset-0 z-0 transition-opacity ${blurClasses[blur]} ${className}`}
      style={{
        backgroundColor: `color-mix(in srgb, var(${color}) ${opacity}%, transparent)`
      }}
      onClick={onClick}
    />
  )
}
