import * as React from "react"
import { Icon, type IconName } from './Icon'

// Utility function for className merging
function cn(...classes: (string | undefined | null | boolean)[]): string {
  return classes.filter(Boolean).join(' ')
}

export interface ButtonProps extends React.ComponentProps<"button"> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive'
  size?: 'sm' | 'default' | 'lg' | 'icon'
  loading?: boolean
  iconName?: IconName
  iconPosition?: 'left' | 'right'
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ 
    className, 
    variant = 'primary', 
    size = 'default', 
    loading = false,
    iconName,
    iconPosition = 'left',
    children,
    disabled,
    ...props 
  }, ref) => {
    
    // Base button styles
    const baseStyles = "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg font-medium transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed [&_svg]:pointer-events-none [&_svg]:shrink-0"

    // Variant styles using current button colors
    const variantStyles = {
      primary: "border border-transparent bg-indigo-600 text-white shadow-sm hover:bg-indigo-700 focus:ring-indigo-500 active:bg-indigo-700",
      secondary: "border border-gray-300 bg-white text-gray-700 shadow-sm hover:bg-gray-50 focus:ring-indigo-500 active:bg-gray-100",
      outline: "border border-gray-300 bg-transparent text-gray-700 shadow-sm hover:bg-gray-50 focus:ring-indigo-500 active:bg-gray-100",
      ghost: "border border-transparent bg-transparent text-gray-700 hover:bg-gray-100 focus:ring-indigo-500 active:bg-gray-200",
      destructive: "border border-transparent bg-error-dark text-white shadow-sm hover:bg-red-600 focus:ring-red-500 active:bg-red-700"
    }

    // Size styles
    const sizeStyles = {
      sm: "h-8 px-3 py-1 text-xs [&_svg]:w-3 [&_svg]:h-3",
      default: "h-9 px-4 py-2 text-sm [&_svg]:w-4 [&_svg]:h-4",
      lg: "h-10 px-6 py-3 text-base [&_svg]:w-5 [&_svg]:h-5",
      icon: "h-9 w-9 p-0 [&_svg]:w-4 [&_svg]:h-4"
    }

    // Loading spinner component
    const LoadingSpinner = () => (
      <svg
        className="animate-spin w-4 h-4"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
    )

    // Icon-only variant
    const isIconOnly = size === 'icon'
    
    // Render icon using our Icon component
    const renderIcon = () => {
      if (!iconName) return null
      return <Icon name={iconName} size="sm" />
    }

    return (
      <button
        ref={ref}
        className={cn(
          baseStyles,
          variantStyles[variant],
          sizeStyles[size],
          className
        )}
        disabled={disabled || loading}
        {...props}
      >
        {loading && <LoadingSpinner />}
        
        {!loading && !isIconOnly && iconName && iconPosition === 'left' && renderIcon()}
        {!loading && isIconOnly && iconName && renderIcon()}
        
        {!isIconOnly && children}
        
        {!loading && !isIconOnly && iconName && iconPosition === 'right' && renderIcon()}
      </button>
    )
  }
)

Button.displayName = "Button"

export { Button }