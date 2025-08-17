# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Common Commands

### Frontend (Next.js)
- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Backend (FastAPI)
- `cd backend && python -m uvicorn app.main:app --reload` - Start development server
- `cd backend && python -m uvicorn app.main:app --host 0.0.0.0 --port 8000` - Start production server
- `cd backend && python -m pytest` - Run tests (when configured)

### Development Workflow
- Run both frontend and backend simultaneously for full-stack development
- Frontend runs on http://localhost:3000
- Backend runs on http://localhost:8000

## Project Context

This is an optician/eyewear business management system designed for the German market. The system handles:
- Customer management with optical prescriptions and insurance data
- Product catalog for frames, lenses, contact lenses, and accessories
- Invoice generation with German tax compliance and insurance billing support
- Multi-tenancy support via organization_id

### German Business Compliance Requirements
- **Sequential invoice numbering** - Must be gapless per German tax law (GoB compliance)
- **VAT rates** - Support 19% standard rate and 7% reduced rate for medical devices
- **Insurance integration** - Split billing between health insurance and patient copay
- **Historical data preservation** - Product snapshots in invoices for audit compliance
- **Multi-tenancy** - Support multiple optician businesses in single system

**Implementation Impact**:
- Invoice numbering uses PostgreSQL sequences with row locking
- Product data must be snapshotted in invoice_items table
- Invoice status workflow includes 'insurance_pending' state
- All financial amounts stored as NUMERIC for precision

## Database Schema

The system uses Supabase PostgreSQL with the following core tables:
- `customers` - Patient/customer data including prescriptions and insurance information
- `products` - Eyewear inventory (frames, lenses, contacts, accessories)
- `invoices` - Sales invoices with insurance billing support
- `invoice_items` - Line items with product snapshots for historical accuracy

For detailed schema documentation, see: `docs/database-schema.md`

## Architecture

This is a Next.js 15 application using the App Router pattern. Key architectural decisions:

- **App Router**: All routes are defined in `src/app/` directory
- **TypeScript**: Strict mode enabled with path alias `@/*` → `./src/*`
- **Styling**: Tailwind CSS v4 with PostCSS, dark mode support via CSS variables
- **Fonts**: Geist Sans and Geist Mono from Google Fonts

The application structure follows Next.js conventions:
- `src/app/layout.tsx` - Root layout wrapping all pages
- `src/app/page.tsx` - Home page component
- `src/app/globals.css` - Global styles and Tailwind directives

## Important Notes

- No testing framework is configured yet
- Using React 19 with Next.js 15.3.3
- ESLint is configured with Next.js Core Web Vitals rules
- The project uses the new Turbopack bundler for faster development builds
- Only include 'use client' in components that need client-side features (state, effects, event handlers)

## Architecture Overview

### Frontend: Next.js 15.3.3 (Deployed on Vercel)
- App Router with TypeScript
- Tailwind CSS for styling
- German localization
- Real-time UI updates
- Production: https://your-app.vercel.app

### Backend: FastAPI (Deployed on Railway)
- RESTful API endpoints
- Pydantic models for data validation
- Async/await for database operations
- CORS configuration for Next.js frontend
- Production: https://your-backend.up.railway.app

### Database: Supabase PostgreSQL
- Customer data storage
- Real-time subscriptions
- Row-level security
- Built-in authentication

### Multi-Tenancy Architecture
- **All tables include organization_id** - Every new table must include `organization_id BIGINT NOT NULL` for data isolation
- **API endpoints filter by organization** - All Supabase queries must include `.eq('organization_id', organization_id)`
- **Default organization_id = 1** - Use organization_id = 1 as default for development and single-tenant setups
- **Row Level Security (RLS)** - Database policies ensure organization-based data isolation

**Implementation Checklist for New Features**:
- [ ] Database table includes `organization_id` column with index
- [ ] Pydantic models include `organization_id: int = Field(default=1)`
- [ ] API endpoints filter by `organization_id` parameter
- [ ] Frontend API calls pass `organization_id` when needed

## React Implementation Principles

### Server Components vs Client Components
- **Default to Server Components** - All components are Server Components by default in the App Router
- **Use 'use client' directive** - Add at the top of files that need browser APIs, state, or event handlers
- **Server Components can** - Fetch data directly, access backend resources, keep sensitive data on server
- **Client Components are needed for** - useState, useEffect, onClick handlers, browser-only APIs

### Data Fetching Best Practices
- **Fetch in Server Components** - Use async/await directly in Server Components to avoid waterfalls
- **Stream with Suspense** - Pass promises to Client Components and use Suspense for progressive loading
- **Avoid client-side fetching** - Don't use useEffect for initial data loads; fetch on the server instead

### Custom Hooks Guidelines
- **Purpose-driven naming** - Name hooks after their specific use case (e.g., `useChatRoom`, not `useMount`)
- **Encapsulate effects** - Extract complex useEffect logic into custom hooks
- **Return stable functions** - Wrap returned functions with useCallback to prevent consumer re-renders
- **Handle SSR** - Provide getServerSnapshot when using useSyncExternalStore

### Performance Optimization
- **Minimize bundle size** - Server Components exclude their dependencies from the client bundle
- **Use React.memo sparingly** - Only when profiling shows performance issues
- **Optimize with useMemo/useCallback** - Cache expensive computations and stable function references
- **Avoid premature optimization** - Profile first, optimize second

### Modern Patterns
- **Server Actions** - Use 'use server' for form mutations and server-side operations
- **useActionState** - Manage form state with built-in pending states and progressive enhancement
- **useTransition** - Show pending UI for non-blocking state updates
- **Streaming SSR** - Use Suspense boundaries to progressively render content

### Server Actions + FastAPI Integration
- **Server Actions call FastAPI server-side** - Server Actions run on the Next.js server and call the FastAPI backend using the API client
- **No direct client API calls** - Frontend components should not directly call `api.customers.create()` - instead use Server Actions
- **API client runs server-side** - The `/lib/api-client.ts` is imported and used within Server Actions, not client components
- **Data flow**: Form submission → Server Action → API client → FastAPI → Database → revalidatePath() → UI update

**Example Pattern**:
```typescript
// ✅ Correct: Server Action calls API client server-side
async function createCustomerAction(prevState, formData) {
  'use server'
  const customerData = extractFormData(formData)
  const customer = await api.customers.create(customerData) // Server-side API call
  revalidatePath('/')
  return { success: true, customer }
}

// ❌ Incorrect: Client component calling API directly  
function CustomerForm() {
  const handleSubmit = async () => {
    await api.customers.create(data) // Client-side API call - avoid this
  }
}
```

### Custom UI Component System
- **Philosophy**: Build custom components inspired by shadcn/ui but tailored to our design system
- **Research Process**: Always check shadcn/ui implementation via `shadcn mcp` before creating new components
- **Implementation**: Use shadcn components as blueprints only - never use them directly, build custom versions
- **Components**: Input, Select, Button, Icon components with consistent APIs and styling
- **Documentation**: See `docs/ui-component-system.md` for comprehensive component documentation
- **Location**: All components in `src/app/components/ui/` directory

**Key Components**:
- **Input**: Form inputs with labels, validation, and error states
- **Select**: Dropdowns with custom styling and option arrays
- **Button**: Action buttons with variants, sizes, and icon integration
- **Icon**: Lucide React wrapper with type safety and consistent sizing

**Usage Pattern**:
```typescript
// Form components
<Input name="email" label="Email" required error={errors.email} />
<Select name="status" label="Status" options={statusOptions} />

// Buttons with icons
<Button variant="primary" iconName="Plus">Add Customer</Button>
<Button size="icon" variant="ghost" iconName="Pencil" />
```

**Development Process**: Always research shadcn/ui via `shadcn mcp` → adapt to our design system → implement custom version

### Code Quality
- **Follow existing patterns** - Match the codebase's conventions and style
- **Keep components pure** - No side effects during render; use useEffect for mutations
- **Proper cleanup** - Always return cleanup functions from useEffect
- **Type safety** - Leverage TypeScript's strict mode for better type checking

### API Client Standards
- **Explicit JSON serialization** - Always use `JSON.stringify(data)` in API calls, never auto-detect
- **Standard RequestInit types** - Use standard `RequestInit` types instead of complex type manipulation
- **Server-side API calls** - API client runs in Server Actions on the server, not in client components

**Example**:
```typescript
// ✅ Correct: Explicit JSON.stringify
create: async (customer: CustomerCreate): Promise<Customer> => {
  return request<Customer>('/api/v1/customers', {
    method: 'POST',
    body: JSON.stringify(customer), // Always explicit
  });
}

// ❌ Avoid: Auto-detection patterns
if (options.body && typeof options.body === 'object') {
  config.body = JSON.stringify(options.body);
}
```

### Error Handling Standards
- **Server Action error responses** - Return `{ success: false, error: string }` structure consistently
- **API client error handling** - Parse FastAPI error responses and provide user-friendly messages
- **Form validation** - Combine HTML5 validation with server-side business logic validation
- **Database constraint errors** - Handle unique constraints and foreign key violations gracefully

**Error Response Pattern**:
```typescript
// Server Action error handling
try {
  const result = await api.customers.create(customerData)
  return { success: true, customer: result }
} catch (error) {
  return { 
    success: false, 
    error: error.message || 'Failed to create customer' 
  }
}
```

## Styling Approach
- **Use Tailwind CSS** - Utilize utility classes for consistent styling
- **Always use Tailwind classes** - Always prefer Tailwind utility classes over arbitrary values or custom CSS
- **Clean, modern design** - Implement proper spacing and visual hierarchy
- **Interactive states** - Add hover effects and smooth transitions for better UX
- **Color coding** - Use consistent colors for status indicators and actions

#### 2. Navigation System
- **Sidebar Component**: Collapsible navigation with "Visual" branding
- **Navigation Items**: Simplified to 2 main sections:
  - "Kunden" (Customers) - currently active page
  - "Produkte" (Products) - future section
- **NavBarItem Component**: Reusable component with active/inactive states
- **Styling**: Light gray active state (`bg-[#EEEFF1]`) matching design reference

## File Structure

```
project-root/
├── frontend/ (Next.js - deployed on Vercel)
│   ├── src/app/
│   ├── components/
│   └── lib/api-client.ts
├── backend/ (FastAPI - deployed on Railway)
│   ├── app/
│   │   ├── api/
│   │   ├── models/
│   │   ├── schemas/
│   │   └── database/
│   ├── requirements.txt
│   ├── main.py
│   └── Dockerfile
├── .github/workflows/
│   └── backend.yml
├── docs/
│   ├── api-client-guidelines.md
│   ├── deployment.md
│   └── database-schema.md
├── implementation_roadmap.md
└── vercel.json
```

## Documentation

For detailed implementation guidelines, see:
- `docs/api-client-guidelines.md` - TypeScript API client patterns and best practices
- `docs/deployment.md` - Environment variables, CI/CD, and deployment configuration
- `docs/database-schema.md` - Complete database schema documentation with relationships
- `implementation_roadmap.md` - Step-by-step implementation guide for the database schema