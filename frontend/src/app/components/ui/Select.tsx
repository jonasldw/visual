import * as React from "react"

// Utility function for className merging
function cn(...classes: (string | undefined | null | boolean)[]): string {
  return classes.filter(Boolean).join(' ')
}

export interface SelectOption {
  value: string
  label: string
  disabled?: boolean
}

export interface SelectProps extends Omit<React.ComponentProps<"select">, 'children'> {
  label?: string
  error?: string
  helpText?: string
  required?: boolean
  variant?: 'default' | 'error' | 'success'
  options: SelectOption[]
  placeholder?: string
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ 
    className, 
    label, 
    error, 
    helpText, 
    required, 
    variant = 'default', 
    options, 
    placeholder,
    ...props 
  }, ref) => {
    const selectId = React.useId()
    const errorId = React.useId()
    const helpId = React.useId()

    // Determine variant styles
    const variantStyles = {
      default: "border-gray-300 focus:border-highlight-1-dark focus:ring-highlight-1-dark/20",
      error: "border-error-dark focus:border-error-dark focus:ring-error-dark/20",
      success: "border-success-dark focus:border-success-dark focus:ring-success-dark/20"
    }

    const currentVariant = error ? 'error' : variant

    return (
      <div className="w-full">
        {label && (
          <label 
            htmlFor={selectId}
            className="block text-xs font-medium text-secondary-input-title mb-2"
          >
            {label}
            {required && <span className="text-error-dark ml-1">*</span>}
          </label>
        )}
        
        <div className="relative">
          <select
            ref={ref}
            id={selectId}
            className={cn(
              // Base styles
              "flex h-9 w-full rounded-lg border bg-white px-3 py-2 text-sm",
              "focus:outline-none focus:ring-2 focus:ring-offset-0",
              "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-gray-50",
              "transition-colors duration-200",
              "appearance-none", // Remove default arrow
              
              // Variant-specific styles
              variantStyles[currentVariant],
              
              // Placeholder styling
              "[&>option:first-child]:text-secondary-placeholder",
              
              className
            )}
            aria-describedby={cn(
              error && errorId,
              helpText && helpId
            )}
            aria-invalid={error ? 'true' : 'false'}
            required={required}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((option) => (
              <option 
                key={option.value} 
                value={option.value}
                disabled={option.disabled}
                className="text-secondary-default"
              >
                {option.label}
              </option>
            ))}
          </select>
          
          {/* Custom dropdown arrow */}
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            <svg
              className="w-4 h-4 text-secondary-placeholder"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M19 9l-7 7-7-7" 
              />
            </svg>
          </div>
        </div>
        
        {error && (
          <p id={errorId} className="mt-1 text-sm text-error-dark">
            {error}
          </p>
        )}
        
        {helpText && !error && (
          <p id={helpId} className="mt-1 text-sm text-secondary-placeholder">
            {helpText}
          </p>
        )}
      </div>
    )
  }
)

Select.displayName = "Select"

export { Select }