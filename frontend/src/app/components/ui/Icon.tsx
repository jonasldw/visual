import { memo } from 'react'
import { icons, type LucideProps } from 'lucide-react'

// Utility function for className merging
function cn(...classes: (string | undefined | null | boolean)[]): string {
  return classes.filter(Boolean).join(' ')
}

export interface IconProps extends Omit<LucideProps, 'ref'> {
  name: keyof typeof icons
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
}

const Icon = memo<IconProps>(({ name, size = 'md', className, ...props }) => {
  const LucideIcon = icons[name]

  if (!LucideIcon) {
    // Handle icon not found - return null or a default icon
    console.warn(`Icon "${String(name)}" not found in Lucide icons`)
    return null
  }

  // Size mappings for consistent sizing
  const sizeClasses = {
    xs: 'w-3 h-3',
    sm: 'w-4 h-4', 
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
    xl: 'w-8 h-8'
  }

  return (
    <LucideIcon 
      className={cn(sizeClasses[size], className)} 
      {...props} 
    />
  )
})

Icon.displayName = 'Icon'

export { Icon }

// Export commonly used icon names for better DX
export type IconName = keyof typeof icons

// Helper to get all available icon names (useful for development)
export const getAvailableIcons = (): IconName[] => {
  return Object.keys(icons) as IconName[]
}