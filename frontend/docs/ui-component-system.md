# UI Component System Documentation

## Overview

This document describes our custom UI component library built for the optician business management system. Our components are inspired by shadcn/ui but custom-built to match our design system and requirements.

## Philosophy

- **Custom Implementation**: Build our own components rather than using third-party libraries
- **shadcn/ui Inspiration**: Use shadcn/ui as blueprints and reference, but never use them directly
- **Research Pattern**: Always check shadcn/ui implementation via shadcn mcp before creating new components
- **Brand Integration**: All components follow our established design system and color palette
- **Consistency**: Maintain consistent APIs and patterns across all components

## Component System Architecture

### 1. Input Component (`src/app/components/ui/Input.tsx`)

**Base**: Extends `React.ComponentProps<"input">` for full HTML input compatibility

**Features**:
- Label integration with proper accessibility
- Error states with visual feedback
- Help text support
- Required indicators
- Variant system for different states

**Variants**: 
- `default` - Standard input styling
- `error` - Red border and text for validation errors
- `success` - Green styling for successful validation

**Special Handling**: 
- Date inputs with proper icon positioning using `justify-between`
- Responsive grid layouts in forms

**Usage**:
```typescript
<Input
  name="first_name"
  label="Vorname"
  required
  error={errors.first_name}
  helpText="Optional help text"
  variant="default"
/>
```

### 2. Select Component (`src/app/components/ui/Select.tsx`)

**Base**: Extends `React.ComponentProps<"select">` with custom dropdown styling

**Features**:
- Options array with `{value, label, disabled?}` structure
- Placeholder support
- Error states matching Input component
- Custom dropdown arrow replacing browser default
- Consistent styling with other form components

**Options Interface**:
```typescript
export interface SelectOption {
  value: string
  label: string
  disabled?: boolean
}
```

**Usage**:
```typescript
<Select
  name="status"
  label="Status"
  placeholder="Bitte wählen"
  defaultValue="aktiv"
  options={[
    { value: 'aktiv', label: 'Aktiv' },
    { value: 'inaktiv', label: 'Inaktiv' },
    { value: 'interessent', label: 'Interessent', disabled: true }
  ]}
/>
```

### 3. Button Component (`src/app/components/ui/Button.tsx`)

**Base**: Extends `React.ComponentProps<"button">` with enhanced functionality

**Variants**:
- `primary` - Main action buttons (indigo background)
- `secondary` - Secondary actions (white background, gray border)
- `outline` - Outlined buttons for subtle actions
- `ghost` - Minimal styling for icon buttons
- `destructive` - Red styling for dangerous actions

**Sizes**:
- `sm` - Small buttons (h-8, text-xs)
- `default` - Standard size (h-9, text-sm)
- `lg` - Large buttons (h-10, text-base)
- `icon` - Square icon-only buttons (h-9 w-9)

**Icon Integration**:
- Built-in support for Lucide icons via `iconName` prop
- Left/right positioning for text buttons
- Centered icons for icon-only buttons
- Automatic sizing based on button size

**States**:
- Loading states with animated spinner
- Disabled states with reduced opacity
- Hover and focus effects with smooth transitions

**Usage**:
```typescript
// Text button with icon
<Button variant="primary" iconName="Plus" iconPosition="left" loading={isPending}>
  Add Customer
</Button>

// Icon-only button
<Button size="icon" variant="ghost" iconName="Pencil" onClick={handleEdit} />

// Loading state
<Button variant="primary" loading={isSubmitting} disabled={isSubmitting}>
  {isSubmitting ? 'Saving...' : 'Save Changes'}
</Button>
```

### 4. Icon Component (`src/app/components/ui/Icon.tsx`)

**Base**: Wrapper around Lucide React with consistent sizing and type safety

**Type Safety**: 
- `IconName = keyof typeof icons` prevents invalid icon usage
- TypeScript will show available icon names in autocomplete
- Runtime warnings for missing icons

**Size System**:
- `xs` - 12px (w-3 h-3) for small indicators
- `sm` - 16px (w-4 h-4) for button icons
- `md` - 20px (w-5 h-5) default size
- `lg` - 24px (w-6 h-6) for headers
- `xl` - 32px (w-8 h-8) for prominent icons

**Performance**: 
- Memoized component to prevent unnecessary re-renders
- Tree-shaking support through Lucide React
- Lazy loading of icon components

**Usage**:
```typescript
// Direct icon usage
<Icon name="Pencil" size="sm" className="text-gray-500" />

// In custom components
<div className="flex items-center gap-2">
  <Icon name="AlertCircle" size="sm" className="text-red-500" />
  <span>Error message</span>
</div>
```

## Design System Integration

### Brand Colors

Components use CSS variables defined in `src/app/globals.css`:

**Primary Colors** (main interface elements):
- `--primary-ultra-light: #fbfbfb`
- `--primary-light: #f4f5f6`
- `--primary-medium: #eeeff1`
- `--primary-dark: #E6E7EA`

**Secondary Colors** (text and subtle elements):
- `--secondary-placeholder: #9fa1a7`
- `--secondary-tag-hints: #75777c`
- `--secondary-input-title: #5d5e62`
- `--secondary-default: #232529`

**Highlight Colors** (interactive states):
- `--highlight-1-light: #EBF2FF`
- `--highlight-1-medium: #ACCBFF`
- `--highlight-1-dark: #4D8EF3`

**Feedback Colors**:
- `--error-dark: #ea4436`
- `--warning-dark: #FFCB0E`
- `--success-dark: #0fc27b`

### Typography Scale

Following Tailwind CSS typography scale:
- `text-xs` (12px) - Small labels, captions
- `text-sm` (14px) - Default component text
- `text-base` (16px) - Larger buttons, headings
- `text-lg` (18px) - Modal titles, section headers

### Spacing System

Consistent spacing using Tailwind classes:
- `gap-1` (4px) - Tight spacing between related elements
- `gap-2` (8px) - Standard spacing between icons and text
- `gap-3` (12px) - Spacing between form buttons
- `gap-4` (16px) - Spacing between form sections

## Implementation Standards

### TypeScript Requirements

All components must include:
- Proper interface extending HTML element props
- Type-safe prop definitions with defaults
- Exported types for external usage
- Generic types where applicable

**Example Interface**:
```typescript
export interface ButtonProps extends React.ComponentProps<"button"> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive'
  size?: 'sm' | 'default' | 'lg' | 'icon'
  loading?: boolean
  iconName?: IconName
  iconPosition?: 'left' | 'right'
}
```

### Prop Forwarding Pattern

Use spread operators to forward HTML attributes:
```typescript
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'default', ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(baseStyles, variantStyles[variant], sizeStyles[size], className)}
        {...props}
      >
        {children}
      </button>
    )
  }
)
```

### Accessibility Standards

All components must include:
- Proper ARIA labels and descriptions
- Keyboard navigation support
- Screen reader compatibility
- Focus management and visible focus indicators
- Color contrast compliance (WCAG AA minimum)

**Example Accessibility Features**:
```typescript
// Screen reader text for icon buttons
<Button size="icon" variant="ghost" iconName="X">
  <span className="sr-only">Close dialog</span>
</Button>

// Proper label association for inputs
<Input
  id="email"
  name="email"
  label="Email Address"
  aria-describedby="email-error"
  error={errors.email}
/>
```

### Error Handling

Components should handle errors gracefully:
- Visual error states with appropriate styling
- Error message display
- Graceful degradation for missing props
- Console warnings for development issues

## Development Process

### Research Phase

Before creating any new component:

1. **Use shadcn mcp**: Research the shadcn/ui implementation
   ```
   Use shadcn mcp to check their implementation of [component name]
   ```

2. **Study their approach**:
   - API design and prop structure
   - Variant systems and naming conventions
   - Accessibility implementations
   - TypeScript patterns

3. **Identify adaptations needed**:
   - Brand color integration
   - Custom functionality requirements
   - Design system compliance

### Implementation Phase

1. **Create component file** in `src/app/components/ui/`
2. **Follow established patterns** from existing components
3. **Implement TypeScript interfaces** with proper prop forwarding
4. **Add brand color integration** using CSS variables
5. **Include accessibility features** from the start
6. **Test integration** with existing components

### Documentation Phase

1. **Update this documentation** with new component details
2. **Add usage examples** with common patterns
3. **Document any special considerations** or limitations
4. **Include accessibility notes** and requirements

## File Structure

```
src/app/components/ui/
├── Input.tsx          # Form input with label and validation
├── Select.tsx         # Dropdown select with options
├── Button.tsx         # Action buttons with variants and icons
├── Icon.tsx           # Icon wrapper with size variants
└── [NewComponent].tsx # Future components following same patterns
```

## Integration Examples

### Form Integration

Components work seamlessly together in forms:

```typescript
<form className="space-y-6">
  <div className="grid grid-cols-2 gap-4">
    <Input
      name="first_name"
      label="Vorname"
      required
      error={errors.first_name}
    />
    <Input
      name="last_name"
      label="Nachname"
      required
      error={errors.last_name}
    />
  </div>
  
  <Select
    name="status"
    label="Status"
    defaultValue="aktiv"
    options={statusOptions}
  />
  
  <div className="flex justify-end gap-3">
    <Button variant="secondary" onClick={onCancel}>
      Cancel
    </Button>
    <Button variant="primary" type="submit" loading={isSubmitting}>
      Save Customer
    </Button>
  </div>
</form>
```

### Table Actions

Icon buttons work well for table actions:

```typescript
<div className="flex items-center justify-end gap-1">
  <Button
    size="icon"
    variant="ghost"
    iconName="Pencil"
    onClick={() => handleEdit(customer.id)}
  />
  <Button
    size="icon"
    variant="ghost"
    iconName="Eye"
    onClick={() => handleView(customer.id)}
  />
  <Button
    size="icon"
    variant="ghost"
    iconName="EllipsisVertical"
    onClick={() => handleMenu(customer.id)}
  />
</div>
```

## Future Development Guidelines

### Adding New Components

1. **Always research shadcn/ui first** using `shadcn mcp`
2. **Follow established patterns** from existing components
3. **Maintain API consistency** (variant, size, disabled, etc.)
4. **Include accessibility from the start**
5. **Test with existing components** to ensure integration
6. **Update this documentation** with new patterns

### Common Patterns to Follow

- **Variant props**: Use consistent naming across components
- **Size systems**: Follow established size scales
- **Color integration**: Use CSS variables, not hardcoded colors
- **TypeScript**: Full type safety with proper interfaces
- **Accessibility**: Screen reader support and keyboard navigation
- **Performance**: Memo components when appropriate

### Maintenance

- **Regular reviews** of component consistency
- **Update documentation** when patterns evolve
- **Refactor common patterns** into shared utilities
- **Monitor bundle size** and performance impact
- **Keep dependencies updated** (especially Lucide React)

## Resources

- **shadcn/ui Documentation**: https://ui.shadcn.com/
- **Lucide Icons**: https://lucide.dev/icons
- **Tailwind CSS**: https://tailwindcss.com/docs
- **React Accessibility**: https://react.dev/learn/accessibility
- **Local Icon Documentation**: `docs/lucide-icon-names.md`