# Server Actions Architecture Decision

## Overview

This document outlines our architectural decision to use React 19 Server Actions with Next.js 15 for form handling in the Visual CRM application. This decision was made after researching React documentation and comparing traditional client-side patterns with modern Server Actions.

## Background Context

**Project**: Visual CRM - German-localized Customer Relationship Management system for opticians  
**Tech Stack**: Next.js 15.3.3, FastAPI backend, Supabase PostgreSQL  
**Branch**: `server-actions` (experimental implementation)  
**Decision Date**: Based on React 19/Next.js 15 modern patterns

## Traditional vs Server Actions Comparison

### Traditional Client-Side Approach (What we avoided)
```typescript
// ❌ Traditional Pattern - More boilerplate
const handleSubmit = async (data) => {
  setLoading(true)
  setError(null)
  try {
    await api.customers.create(data)
    router.refresh() // Manual data revalidation
    setSuccess(true)
  } catch (error) {
    setError(error.message)
  } finally {
    setLoading(false)
  }
}
```

**Problems with traditional approach:**
- More boilerplate code
- Manual loading/error state management
- Client-side API calls (larger bundle)
- Manual data revalidation
- Complex state management

### Server Actions Approach (What we chose)
```typescript
// ✅ Server Actions Pattern - Cleaner
async function createCustomer(prevState, formData) {
  'use server'
  
  const customerData = {
    first_name: formData.get('first_name'),
    last_name: formData.get('last_name'),
    // ...
  }
  
  try {
    const result = await api.customers.create(customerData)
    revalidatePath('/') // Automatic data revalidation
    return { success: true, customer: result }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

// Client Component
const [state, formAction, isPending] = useActionState(createCustomer, null)
```

## Key Benefits of Server Actions

1. **Reduced Client Bundle Size**
   - Server logic doesn't ship to client
   - API client code runs server-side only

2. **Built-in State Management**
   - `isPending` automatically managed
   - No manual loading states needed

3. **Progressive Enhancement**
   - Forms work without JavaScript
   - Enhanced with JavaScript when available

4. **Automatic Data Revalidation**
   - `revalidatePath()` automatically refreshes server data
   - No manual cache invalidation needed

5. **Better Error Handling**
   - Centralized error handling in server action
   - Structured error responses

6. **Type Safety**
   - Full TypeScript support
   - FormData API integration

## Core Patterns and Flows

### Data Flow Architecture
```
Client Form Submit → Server Action (server) → API Call (server) → Database → Return State → Update UI
```

### useActionState Hook Signature
```typescript
const [state, formAction, isPending] = useActionState(actionFn, initialState, permalink?)
```

**Parameters:**
- `actionFn`: Server action function
- `initialState`: Initial form state
- `permalink`: Optional URL for progressive enhancement

**Returns:**
- `state`: Current form state (success/error data)
- `formAction`: Form action function to bind to form
- `isPending`: Boolean indicating if submission is in progress

### Server Action Function Pattern
```typescript
async function serverAction(prevState: any, formData: FormData) {
  'use server'
  
  // 1. Extract form data
  const data = {
    field1: formData.get('field1'),
    field2: formData.get('field2'),
  }
  
  // 2. Validate data (optional)
  if (!data.field1) {
    return { success: false, error: 'Field1 is required' }
  }
  
  // 3. Perform server-side operations
  try {
    const result = await apiCall(data)
    
    // 4. Revalidate data
    revalidatePath('/path')
    
    // 5. Return success state
    return { success: true, data: result }
  } catch (error) {
    // 6. Return error state
    return { success: false, error: error.message }
  }
}
```

### Client Component Integration
```typescript
'use client'

import { useActionState } from 'react'

function FormComponent() {
  const [state, formAction, isPending] = useActionState(serverAction, null)
  
  return (
    <form action={formAction}>
      <input name="field1" required />
      <input name="field2" />
      
      <button type="submit" disabled={isPending}>
        {isPending ? 'Saving...' : 'Save'}
      </button>
      
      {state?.success && (
        <div className="success">Successfully saved!</div>
      )}
      
      {state?.error && (
        <div className="error">Error: {state.error}</div>
      )}
    </form>
  )
}
```

## Implementation Guidelines

### File Organization
```
src/
├── app/
│   ├── actions/           # Server actions
│   │   ├── customers.ts   # Customer-related server actions
│   │   └── index.ts       # Export all actions
│   ├── components/        # Client components
│   │   ├── CustomerForm.tsx
│   │   └── Modal.tsx
│   └── lib/
│       └── api-client.ts  # API client (server-side)
```

### Naming Conventions
- Server actions: `createCustomer`, `updateCustomer`, `deleteCustomer`
- Form components: `CustomerForm`, `CustomerModal`
- State properties: `{ success: boolean, error?: string, data?: any }`

### Error Handling Pattern
```typescript
// Consistent error response structure
return {
  success: false,
  error: 'User-friendly error message',
  field?: 'specific-field-name' // For field-specific errors
}

// Success response structure
return {
  success: true,
  data: result,
  message?: 'Optional success message'
}
```

### Form Validation Strategy
1. **HTML5 Validation**: Basic client-side validation (required, email, etc.)
2. **Server Action Validation**: Business logic validation server-side
3. **TypeScript**: Type safety for form data structures

## Integration with Visual CRM

### Customer Form Implementation
The customer form will use Server Actions for:
- Creating new customers (`createCustomerAction`)
- Updating existing customers (`updateCustomerAction`)
- Form validation and error handling
- Automatic table data refresh

### API Client Integration
```typescript
// Server Action calls API client server-side
async function createCustomerAction(prevState, formData) {
  'use server'
  
  const customerData = extractCustomerData(formData)
  
  try {
    // API client runs on server
    const customer = await api.customers.create(customerData)
    
    // Refresh page data
    revalidatePath('/')
    
    return { success: true, customer }
  } catch (error) {
    return { success: false, error: error.message }
  }
}
```

## Performance Considerations

1. **Bundle Size**: Server Actions reduce client bundle size
2. **Network Requests**: Single request per form submission
3. **Caching**: Automatic revalidation with `revalidatePath()`
4. **SEO**: Progressive enhancement improves SEO

## Future Considerations

1. **Real-time Updates**: Can be combined with WebSockets/Server-Sent Events
2. **Optimistic Updates**: Can add optimistic UI updates with `useOptimistic`
3. **Form Libraries**: Compatible with react-hook-form for complex validation
4. **Testing**: Server Actions can be unit tested independently

## Decision Rationale

We chose Server Actions because:
1. **Modern React Pattern**: Follows React 19/Next.js 15 best practices
2. **Reduced Complexity**: Less boilerplate than traditional approaches
3. **Better Performance**: Smaller client bundles, server-side processing
4. **Developer Experience**: Built-in loading states, error handling
5. **Progressive Enhancement**: Works without JavaScript
6. **Future-Proof**: Aligns with React's direction

This architecture decision positions Visual CRM to leverage the latest React patterns while maintaining clean, maintainable code.