# Frontend Implementation Handover

## Overview

This document provides a handover to the next agent responsible for implementing the frontend features for Products and Invoices. The backend infrastructure is complete and ready for frontend integration.

## Status Summary

### ✅ Completed (Backend & Infrastructure)
- **Database schema implementation** (Products, Invoices, Invoice_Items)
- **FastAPI endpoints** with full CRUD operations
- **API client extensions** in TypeScript with Products/Invoices methods
- **Customer management frontend** with working search/pagination (recently optimized)
- **Sequential invoice numbering** system (German compliance)
- **Multi-tenancy support** via organization_id
- **Search performance optimization** (reduced from 1.6s to ~800ms by eliminating duplicate queries)

### 🎯 Next Phase (Frontend Implementation Required)
- **Products management UI** (forms, tables, modals)
- **Invoices management UI** (complex forms with line items)
- **Navigation updates** (add Products section to sidebar)
- **Server Actions** for Products and Invoices
- **Modal providers** for state management

## Critical Architecture References

**Essential Reading:**
- `CLAUDE.md` - Complete project guidelines and architectural principles
- `docs/api-client-guidelines.md` - TypeScript patterns and best practices
- `old-md/server-actions.md` - Detailed Server Actions architecture
- `old-md/react-context.md` - Modal state management patterns

**Key Architecture Points:**
- **Server Actions Pattern**: Frontend uses Server Actions that call FastAPI server-side (never direct client API calls)
- **URL-based search**: Implemented with debouncing for live filtering
- **Context for Modal State**: Follow existing CustomerModalProvider pattern
- **German business compliance**: Sequential invoice numbering, VAT rates, insurance billing

## Current Frontend Foundation

```
frontend/src/
├── app/
│   ├── actions/
│   │   └── customers.ts          # ✅ Reference implementation
│   ├── components/
│   │   ├── CustomerForm.tsx      # ✅ Form pattern to follow
│   │   ├── CustomersTable.tsx    # ✅ Table pattern with search/pagination
│   │   ├── Modal.tsx             # ✅ Reusable modal component
│   │   ├── TopBar.tsx            # ✅ Search implementation with debouncing
│   │   ├── Sidebar.tsx           # ❌ Needs Products section
│   │   └── providers/
│   │       └── CustomerModalProvider.tsx  # ✅ Context pattern to follow
│   └── page.tsx                  # ✅ Server Component with URL params
└── lib/
    └── api-client.ts             # ✅ Extended with Products/Invoices APIs
```

## Ready-to-Use Backend APIs

The API client (`frontend/src/lib/api-client.ts`) already includes:

### Products API
```typescript
api.products.getAll(params)     // List with pagination/filtering
api.products.getById(id)        // Single product
api.products.create(product)    // Create new product
api.products.update(id, data)   // Update product
api.products.delete(id)         // Soft delete (set active=false)
```

### Invoices API
```typescript
api.invoices.getAll(params)     // List with pagination/filtering
api.invoices.getById(id)        // Invoice with items
api.invoices.create(invoice)    // Create with items
api.invoices.update(id, data)   // Update invoice
api.invoices.addItem(id, item)  // Add item to invoice
```

## Implementation Roadmap

### Phase 1: Products Management
**Priority: High**

1. **Navigation Update**
   - Add "Produkte" section to `Sidebar.tsx`
   - Create `/products` route

2. **Products Server Actions**
   - Create `frontend/src/app/actions/products.ts`
   - Follow pattern from `actions/customers.ts`
   - Implement: `createProductAction`, `updateProductAction`, `deleteProductAction`

3. **Products UI Components**
   - `ProductForm.tsx` - Create/edit form (follow `CustomerForm.tsx` pattern)
   - `ProductsTable.tsx` - List view (follow `CustomersTable.tsx` pattern)
   - `ProductModalProvider.tsx` - Context for modal state (follow `CustomerModalProvider.tsx`)

4. **Products Page**
   - Create `frontend/src/app/products/page.tsx`
   - Server Component fetching products data
   - Integrate with ProductModalProvider

### Phase 2: Invoice Management
**Priority: High**

1. **Invoices Server Actions**
   - Create `frontend/src/app/actions/invoices.ts`
   - Implement: `createInvoiceAction`, `updateInvoiceAction`, `addItemAction`

2. **Invoice UI Components**
   - `InvoiceForm.tsx` - Complex form with customer selection and line items
   - `InvoiceTable.tsx` - List view with status indicators
   - `InvoiceItemForm.tsx` - Component for adding/editing line items
   - `InvoiceModalProvider.tsx` - Context for modal state

3. **Invoice Features**
   - Customer search/selection in invoice form
   - Product search/selection for line items
   - Automatic total calculations (handled by backend)
   - Status workflow management (draft → sent → paid)

### Phase 3: Integration & Polish
**Priority: Medium**

1. **Cross-Feature Integration**
   - Link customers to their invoices
   - Product selection in invoice items
   - Search across entities

2. **German Localization**
   - All labels and messages in German
   - Currency formatting (€)
   - Date formatting (DD.MM.YYYY)

## Key Patterns to Follow

### Server Actions (Critical)
```typescript
// ✅ Correct pattern - see actions/customers.ts
async function createProductAction(prevState, formData) {
  'use server'
  
  const productData = {
    name: formData.get('name'),
    product_type: formData.get('product_type'),
    current_price: parseFloat(formData.get('current_price')),
  }
  
  try {
    const product = await api.products.create(productData)
    revalidatePath('/products')
    return { success: true, product }
  } catch (error) {
    return { success: false, error: error.message }
  }
}
```

### Search & Pagination (Recently Implemented)
- **URL parameters** as single source of truth (`?search=term&page=2`)
- **Debouncing** in client components (300ms delay)
- **Server-side filtering** in page.tsx using searchParams
- **Performance optimized** (single query instead of two)

### Component Architecture
- **Server Components**: Data fetching in page.tsx
- **Client Components**: Forms, modals, interactive elements only
- **Context Providers**: Modal state management
- **Reusable Components**: Follow existing Modal.tsx pattern

## German Business Requirements

### Product Types
- `frame` (Brille)
- `lens` (Gläser)
- `contact_lens` (Kontaktlinsen)
- `accessory` (Zubehör)

### Invoice Status Flow
- `draft` → `sent` → `paid` / `partially_paid` / `insurance_pending` → `cancelled`

### Tax Compliance
- **Sequential numbering**: YYYY-000001 format (backend handles this)
- **VAT rates**: 19% standard, 7% reduced for medical devices
- **Product snapshots**: Preserve historical data in invoice_items

## Development Environment

### Backend Running
- FastAPI server on `http://localhost:8000`
- Auto-reload enabled for development
- Recently optimized search performance (single query pattern)
- API docs available at `/docs`

### Frontend Setup
- Next.js 15 with App Router
- Tailwind CSS for styling
- TypeScript with strict mode
- URL-based search/pagination working

## Data Flow Architecture

```
Customer (1) ←→ (n) Invoice (1) ←→ (n) Invoice_Items (n) ←→ (1) Product
                     ↓
               Auto-calculated totals
```

**Critical Points:**
- Invoices require customer selection
- Invoice items reference products but store snapshots
- Multi-tenancy via `organization_id: 1` (default)

## Performance Considerations

### Recent Optimizations
- **Search queries**: Reduced from 1.6s to ~800ms by eliminating duplicate database calls
- **URL-based state**: Provides shareability and browser history support
- **Debounced input**: Prevents excessive API calls while typing

### Future Considerations
- **Component library**: Input component development in progress
- **Code splitting**: Consider for large forms
- **Caching**: URL params provide natural caching via browser

## Ready to Start

The foundation is solid with working customer management as a reference. Focus on:
1. **Following existing patterns** rather than creating new ones
2. **Products first** (simpler) before complex invoice management
3. **Server Actions architecture** for all data mutations
4. **German business rules** for product types and validation

**Backend is running and ready.** All APIs tested and optimized. The customer module provides a complete reference implementation for the patterns to follow.

**Success Metric:** Complete Products and Invoices management that integrates seamlessly with existing customer workflow, maintaining the same UX patterns and performance standards.