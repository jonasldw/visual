import * as React from "react"

// Utility function for className merging (similar to cn from shadcn)
function cn(...classes: (string | undefined | null | boolean)[]): string {
  return classes.filter(Boolean).join(' ')
}

export interface InputProps extends React.ComponentProps<"input"> {
  label?: string
  error?: string
  helpText?: string
  required?: boolean
  variant?: 'default' | 'error' | 'success'
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = "text", label, error, helpText, required, variant = 'default', ...props }, ref) => {
    const inputId = React.useId()
    const errorId = React.useId()
    const helpId = React.useId()

    // Determine variant styles
    const variantStyles = {
      default: "border-gray-300 focus:border-blue-500 focus:ring-blue-500/20",
      error: "border-red-500 focus:border-red-500 focus:ring-red-500/20",
      success: "border-green-500 focus:border-green-500 focus:ring-green-500/20"
    }

    const currentVariant = error ? 'error' : variant

    return (
      <div className="w-full">
        {label && (
          <label 
            htmlFor={inputId}
            className="block text-xs font-medium text-secondary-input-title mb-2"
          >
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        
        <input
          ref={ref}
          id={inputId}
          type={type}
          className={cn(
            // Base styles
            "flex h-9 w-full rounded-lg border bg-white px-3 py-2 text-sm",
            "placeholder:text-gray-400",
            "focus:outline-none focus:ring-2 focus:ring-offset-0",
            "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-gray-50",
            "transition-colors duration-200",
            
            // Variant-specific styles
            variantStyles[currentVariant],
            
            // File input specific styles
            type === "file" && "file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-gray-700",
            
            // Date input specific styles - position calendar icon on the right
            type === "date" && "justify-between [&::-webkit-calendar-picker-indicator]:cursor-pointer",
            
            className
          )}
          aria-describedby={cn(
            error && errorId,
            helpText && helpId
          )}
          aria-invalid={error ? 'true' : 'false'}
          required={required}
          {...props}
        />
        
        {error && (
          <p id={errorId} className="mt-1 text-sm text-red-600">
            {error}
          </p>
        )}
        
        {helpText && !error && (
          <p id={helpId} className="mt-1 text-sm text-gray-500">
            {helpText}
          </p>
        )}
      </div>
    )
  }
)

Input.displayName = "Input"

export { Input }