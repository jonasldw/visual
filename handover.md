# Frontend Implementation Handover

## Overview

This document provides a handover to the next agent responsible for implementing the frontend features for Products and Invoices. The backend infrastructure is complete and ready for frontend integration.

## Status Summary

### ✅ Completed (Backend)
- Database schema implementation (Products, Invoices, Invoice_Items)
- FastAPI endpoints with full CRUD operations
- Pydantic models and validation
- API client extensions in TypeScript
- Sequential invoice numbering system (German compliance)
- Multi-tenancy support via organization_id

### 🎯 Next Phase (Frontend)
- Server Actions for Products and Invoices
- UI components and forms
- Navigation updates
- Integration with existing customer workflow

## Architecture Foundation

**Key Documentation to Review:**
- `CLAUDE.md` - Complete project guidelines and architectural principles
- `docs/api-client-guidelines.md` - TypeScript patterns and best practices
- `old-md/server-actions.md` - Detailed Server Actions architecture
- `old-md/react-context.md` - Modal state management patterns

**Critical Architecture Points:**
- **Server Actions Pattern**: Frontend uses Server Actions that call FastAPI server-side (see `CLAUDE.md` → React Implementation Principles → Server Actions + FastAPI Integration)
- **No Direct Client API Calls**: Components should NOT directly call `api.products.create()` - use Server Actions instead
- **Context for Modal State**: Follow existing CustomerModalProvider pattern for new modals

## Current Frontend Structure

```
frontend/src/
├── app/
│   ├── actions/
│   │   └── customers.ts          # Existing Server Actions pattern
│   ├── components/
│   │   ├── CustomerForm.tsx      # Reference implementation
│   │   ├── CustomersTable.tsx    # Reference implementation  
│   │   ├── Modal.tsx             # Reusable modal component
│   │   ├── Sidebar.tsx           # Navigation - needs Products section
│   │   └── providers/
│   │       └── CustomerModalProvider.tsx  # Context pattern to follow
│   └── page.tsx                  # Home page with customer list
└── lib/
    └── api-client.ts             # ✅ Extended with Products/Invoices APIs
```

## Ready-to-Use Backend APIs

### Products API (`api.products`)
```typescript
// Available methods (see frontend/src/lib/api-client.ts)
api.products.getAll(params)     // List with pagination/filtering
api.products.getById(id)        // Single product
api.products.create(product)    // Create new product
api.products.update(id, data)   // Update product
api.products.delete(id)         // Soft delete (set active=false)
```

### Invoices API (`api.invoices`)
```typescript
// Available methods (see frontend/src/lib/api-client.ts)
api.invoices.getAll(params)     // List with pagination/filtering
api.invoices.getById(id)        // Invoice with items
api.invoices.create(invoice)    // Create with items
api.invoices.update(id, data)   // Update invoice
api.invoices.delete(id)         // Delete invoice
api.invoices.addItem(id, item)  // Add item to invoice
api.invoices.updateItem(...)    // Update invoice item
api.invoices.deleteItem(...)    // Delete invoice item
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

## Key Implementation Guidelines

### 1. Server Actions Pattern (Critical)
```typescript
// ✅ Correct: Server Action calling API server-side
async function createProductAction(prevState, formData) {
  'use server'
  
  const productData = {
    name: formData.get('name'),
    product_type: formData.get('product_type'),
    current_price: parseFloat(formData.get('current_price')),
    // ...
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

### 2. Component Patterns
- **Server Components**: Use for data fetching (page.tsx files)
- **Client Components**: Use 'use client' only for interactivity (forms, modals)
- **Modal State**: Use Context providers for modal management
- **Form Handling**: Use `useActionState` hook with Server Actions

### 3. German Business Rules
- **Product Types**: 'frame', 'lens', 'contact_lens', 'accessory'
- **Invoice Status**: 'draft', 'sent', 'paid', 'partially_paid', 'insurance_pending', 'cancelled'
- **VAT Rates**: 19% standard, 7% reduced (selectable per product)
- **Invoice Numbers**: Auto-generated (YYYY-000001 format)

### 4. Multi-Tenancy
- All API calls include `organization_id: 1` (default for development)
- Future consideration for multiple organizations

## Data Relationships

```
Customer (1) ←→ (n) Invoice (1) ←→ (n) Invoice_Items (n) ←→ (1) Product
                     ↓
               Auto-calculated totals
```

**Key Points:**
- Invoices link to customers (required)
- Invoice items reference products but store snapshots
- Product snapshots preserve historical data (see `CLAUDE.md` → German Business Compliance)

## Testing Strategy

**Manual Testing Checklist:**
1. Create products of different types
2. Create invoices with multiple line items
3. Verify automatic invoice numbering
4. Test customer-invoice relationships
5. Verify German formatting (currency, dates)

**Backend Testing:**
- Backend endpoints are ready for testing
- Use FastAPI docs at `http://localhost:8000/docs`
- All CRUD operations implemented and tested

## Common Patterns Reference

**Form Components**: Follow `CustomerForm.tsx` structure
**Table Components**: Follow `CustomersTable.tsx` pagination and search
**Modal Management**: Follow `CustomerModalProvider.tsx` context pattern
**Server Actions**: Follow `actions/customers.ts` error handling

## Ready to Start

1. **Review Documentation**: Start with `CLAUDE.md` React Implementation Principles
2. **Examine Existing Code**: Study `CustomerForm.tsx` and `CustomersTable.tsx` patterns
3. **Set Up Development**: Ensure backend is running (`npm run dev` in both frontend and backend)
4. **Begin with Products**: Start with simpler Products management before complex Invoices

The backend foundation is solid and ready. Focus on following the established patterns and the Server Actions architecture documented in `CLAUDE.md`.

**Next Agent: Your implementation should result in a complete Products and Invoices management system that integrates seamlessly with the existing Customers workflow.**