# React Context Documentation & Implementation Guide

This document contains the latest React Context patterns and our specific implementation approach for the Visual CRM project.

## Overview

React Context provides a way to pass data through the component tree without having to pass props down manually at every level. This is particularly useful for "global" data like themes, user authentication, or in our case - modal state management.

## React 19 Context Patterns (Latest Documentation)

### 1. Basic Context Creation
```typescript
import { createContext } from 'react';

export const MyContext = createContext(defaultValue);
```

### 2. React 19 Simplified Provider Syntax
React 19 introduces a new syntax allowing `<Context>` to be rendered directly as a provider:

```typescript
// ✅ React 19 - Simplified syntax
const ThemeContext = createContext('');

function App({ children }) {
  return (
    <ThemeContext value="dark">
      {children}
    </ThemeContext>
  );
}

// ❌ Old syntax (still works)
function App({ children }) {
  return (
    <ThemeContext.Provider value="dark">
      {children}
    </ThemeContext.Provider>
  );
}
```

### 3. Consuming Context with useContext
```typescript
import { useContext } from 'react';

function MyComponent() {
  const theme = useContext(ThemeContext);
  return <div className={`panel-${theme}`}>Content</div>;
}
```

### 4. Multiple Context Organization
```typescript
// Contexts.js - Common pattern for organizing contexts
import { createContext } from 'react';

export const ThemeContext = createContext('light');
export const AuthContext = createContext(null);
export const CustomerModalContext = createContext(null);
```

### 5. Provider with Dynamic Values
```typescript
function App() {
  const [theme, setTheme] = useState('dark');
  const [currentUser, setCurrentUser] = useState({ name: 'Taylor' });

  return (
    <ThemeContext value={theme}>
      <AuthContext value={currentUser}>
        <Page />
      </AuthContext>
    </ThemeContext>
  );
}
```

### 6. Custom Hook Pattern
```typescript
function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}
```

## Complete Example from React Documentation

```typescript
import { createContext, useContext } from 'react';

const ThemeContext = createContext(null);

export default function MyApp() {
  return (
    <ThemeContext value="dark">
      <Form />
    </ThemeContext>
  )
}

function Form() {
  return (
    <Panel title="Welcome">
      <Button>Sign up</Button>
      <Button>Log in</Button>
    </Panel>
  );
}

function Panel({ title, children }) {
  const theme = useContext(ThemeContext);
  const className = 'panel-' + theme;
  return (
    <section className={className}>
      <h1>{title}</h1>
      {children}
    </section>
  )
}

function Button({ children }) {
  const theme = useContext(ThemeContext);
  const className = 'button-' + theme;
  return (
    <button className={className}>
      {children}
    </button>
  );
}
```

## Visual CRM Implementation: Customer Modal Context

### Problem Statement
We need to share modal state between:
- **TopBar** component (has "Neuer Kunde" button)
- **CustomersTable** component (needs to show modals)
- **Modal components** (need to know when to display)

### Current HomeClient Pattern Issues
```typescript
// ❌ Current approach - adds unnecessary wrapper layer
// HomeClient.tsx acts as a bridge just to share modal state
// page.tsx (Server) → HomeClient.tsx (Client) → TopBar + CustomersTable
```

### Proposed Context Solution

#### 1. Context Definition
```typescript
// components/providers/CustomerModalProvider.tsx
'use client'

import { createContext, useContext, useState } from 'react'
import type { Customer } from '@/lib/api-client'

interface CustomerModalContextType {
  // Create modal state
  showCreateModal: boolean
  setShowCreateModal: (show: boolean) => void
  
  // Edit modal state  
  showEditModal: boolean
  setShowEditModal: (show: boolean) => void
  editingCustomer: Customer | null
  setEditingCustomer: (customer: Customer | null) => void
  
  // Utility functions
  openCreateModal: () => void
  openEditModal: (customer: Customer) => void
  closeAllModals: () => void
}

const CustomerModalContext = createContext<CustomerModalContextType | null>(null)

export function CustomerModalProvider({ children }: { children: React.ReactNode }) {
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null)

  const openCreateModal = () => {
    setShowCreateModal(true)
  }

  const openEditModal = (customer: Customer) => {
    setEditingCustomer(customer)
    setShowEditModal(true)
  }

  const closeAllModals = () => {
    setShowCreateModal(false)
    setShowEditModal(false)
    setEditingCustomer(null)
  }

  return (
    <CustomerModalContext value={{
      showCreateModal,
      setShowCreateModal,
      showEditModal,
      setShowEditModal,
      editingCustomer,
      setEditingCustomer,
      openCreateModal,
      openEditModal,
      closeAllModals
    }}>
      {children}
    </CustomerModalContext>
  )
}

export function useCustomerModal() {
  const context = useContext(CustomerModalContext)
  if (!context) {
    throw new Error('useCustomerModal must be used within CustomerModalProvider')
  }
  return context
}
```

#### 2. Provider Integration (Server Component Compatible)
```typescript
// page.tsx (stays as Server Component!)
import { CustomerModalProvider } from './components/providers/CustomerModalProvider'
import TopBar from './components/TopBar'
import CustomersTable from './components/CustomersTable'
import { api } from '@/lib/api-client'

export default async function Home() {
  // Server-side data fetching
  let customers = []
  let totalCustomers = 0
  let error = null

  try {
    const response = await api.customers.getAll()
    customers = response.customers
    totalCustomers = response.total
  } catch (err) {
    error = err instanceof Error ? err.message : 'Failed to fetch customers'
  }

  return (
    <CustomerModalProvider>
      <div className="flex-1 flex flex-col">
        <TopBar />
        <main className="flex-1 p-4">
          <CustomersTable 
            customers={customers}
            totalCustomers={totalCustomers}
            error={error}
          />
        </main>
      </div>
    </CustomerModalProvider>
  )
}
```

#### 3. Component Usage
```typescript
// components/TopBar.tsx
'use client'

import { useCustomerModal } from './providers/CustomerModalProvider'

export default function TopBar() {
  const { openCreateModal } = useCustomerModal()

  return (
    <button onClick={openCreateModal}>
      Neuer Kunde
    </button>
  )
}

// components/CustomersTable.tsx
'use client'

import { useCustomerModal } from './providers/CustomerModalProvider'
import Modal from './Modal'
import CustomerForm from './CustomerForm'

export default function CustomersTable({ customers, totalCustomers, error }) {
  const { 
    showCreateModal, 
    showEditModal, 
    editingCustomer,
    openEditModal,
    closeAllModals 
  } = useCustomerModal()

  const handleEditCustomer = (customer) => {
    openEditModal(customer)
  }

  return (
    <>
      <div className="bg-white overflow-hidden">
        <table>
          {customers.map(customer => (
            <tr key={customer.id}>
              <td>{customer.name}</td>
              <td>
                <button onClick={() => handleEditCustomer(customer)}>
                  Bearbeiten
                </button>
              </td>
            </tr>
          ))}
        </table>
      </div>

      {/* Create Modal - controlled by TopBar button via context */}
      <Modal
        isOpen={showCreateModal}
        onClose={closeAllModals}
        title="Neuen Kunden erstellen"
      >
        <CustomerForm
          onSuccess={closeAllModals}
          onCancel={closeAllModals}
        />
      </Modal>

      {/* Edit Modal - controlled by table edit buttons */}
      <Modal
        isOpen={showEditModal}
        onClose={closeAllModals}
        title="Kunde bearbeiten"
      >
        {editingCustomer && (
          <CustomerForm
            customer={editingCustomer}
            onSuccess={closeAllModals}
            onCancel={closeAllModals}
          />
        )}
      </Modal>
    </>
  )
}
```

## Benefits of Context Approach

### ✅ Architecture Benefits
- **Server Component Compatibility**: page.tsx stays as Server Component
- **Clean Separation**: Modal logic isolated in dedicated provider
- **No Wrapper Layers**: Eliminates unnecessary HomeClient component
- **Scalable**: Easy to add more modal types or global state

### ✅ Developer Experience
- **Type Safety**: Full TypeScript support with custom hook
- **Error Boundaries**: Automatic error if used outside provider
- **Utility Functions**: `openCreateModal()`, `openEditModal()` simplify usage
- **Single Source of Truth**: All modal state in one place

### ✅ Performance
- **Selective Re-renders**: Only components using modal state re-render
- **Bundle Optimization**: Provider only loaded where needed
- **Server-Side Benefits**: Data fetching remains server-side

## Implementation Steps

1. **Create CustomerModalProvider** with context and custom hook
2. **Wrap page.tsx** with provider (keeps Server Component)
3. **Update TopBar** to use `useCustomerModal()` hook
4. **Update CustomersTable** to use `useCustomerModal()` hook and keep existing Modal.tsx usage
5. **Remove HomeClient** component (no longer needed)
6. **Test integration** and verify Server Actions still work

**Note:** We reuse our existing `Modal.tsx` component rather than creating a separate `CustomerModals` container. The modals remain in `CustomersTable.tsx` but now use context for state management.

## React 19 Considerations

- **Simplified Provider Syntax**: Use `<Context>` instead of `<Context.Provider>`
- **Automatic Batching**: State updates are automatically batched
- **Better DevTools**: Enhanced context debugging in React DevTools
- **Concurrent Features**: Context works seamlessly with Suspense and transitions

## Best Practices

1. **Custom Hooks**: Always provide custom hook (`useCustomerModal`) 
2. **Error Boundaries**: Throw error if context used outside provider
3. **TypeScript**: Define strict interface for context value
4. **Separation**: Keep context logic separate from UI components
5. **Documentation**: Document context purpose and usage patterns

This approach provides a clean, scalable, and performant solution for modal state management while maintaining compatibility with our Server Actions architecture.