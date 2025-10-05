## Architecture: Server Components vs Client Components Data Flow

### Complete Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│  REQUEST PHASE (Server)                                     │
├─────────────────────────────────────────────────────────────┤
│  1. Browser requests "/?page=1&search=john"                 │
│     ↓                                                        │
│  2. Next.js routes to app/page.tsx                          │
│     ↓                                                        │
│  3. Server Component executes:                              │
│     export default async function Home() {                  │
│       const response = await api.customers.getAll()         │
│       return <CustomersTable customers={response.customers}/>│
│     }                                                        │
│     ↓                                                        │
│  4. API client makes HTTP request to FastAPI backend:       │
│     GET http://localhost:8000/api/v1/customers?page=1       │
│     ↓                                                        │
│  5. FastAPI queries Supabase PostgreSQL                     │
│     ↓                                                        │
│  6. Data returns to Next.js server                          │
│     ↓                                                        │
│  7. Server renders React components to HTML                 │
│     (includes serialized data in script tags)               │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│  HYDRATION PHASE (Browser)                                  │
├─────────────────────────────────────────────────────────────┤
│  8. Browser receives HTML + embedded JSON data              │
│     ↓                                                        │
│  9. React hydrates client components:                       │
│     - CustomersTable receives customers prop                │
│     - CustomerUIProvider initializes state                  │
│     - CustomerSlider is hidden initially                    │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│  INTERACTION PHASE (Browser - NO SERVER CALLS)              │
├─────────────────────────────────────────────────────────────┤
│  10. User clicks eye icon on Customer A                     │
│      ↓                                                       │
│  11. handleViewCustomer(customerId) executes:               │
│      - Searches in-memory apiCustomers array                │
│      - Calls openSlider(customer) from Context              │
│      ↓                                                       │
│  12. Context updates state:                                 │
│      - setSelectedCustomer(customer)                        │
│      - setShowSlider(true)                                  │
│      ↓                                                       │
│  13. React re-renders:                                      │
│      - CustomerSlider now visible                           │
│      - CustomerForm receives customer prop                  │
│      - Form inputs use defaultValue from prop               │
│      ↓                                                       │
│  14. User clicks eye icon on Customer B                     │
│      ↓                                                       │
│  15. Same flow as steps 11-13                               │
│      - NEW customer object passed to Context                │
│      - CustomerSlider re-renders                            │
│      - CustomerForm re-renders                              │
│      - BUT: defaultValue doesn't update inputs!             │
│      - BUG: Form still shows Customer A data                │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│  MUTATION PHASE (Server Action)                             │
├─────────────────────────────────────────────────────────────┤
│  16. User edits form and clicks "Kunde aktualisieren"       │
│      ↓                                                       │
│  17. Form submission triggers Server Action:                │
│      updateCustomerAction(formData)                         │
│      ↓                                                       │
│  18. Server Action runs on Next.js server:                  │
│      - Extracts data from formData                          │
│      - Calls api.customers.update(id, data)                 │
│      - Makes HTTP PUT to FastAPI                            │
│      - FastAPI updates Supabase                             │
│      ↓                                                       │
│  19. Server Action calls revalidatePath('/')                │
│      - Marks page cache as stale                            │
│      ↓                                                       │
│  20. Next navigation/refresh will re-fetch from server      │
└─────────────────────────────────────────────────────────────┘
```

### Key Architectural Patterns

**Pattern 1: Server Components for Data Fetching**
```typescript
// app/page.tsx (Server Component)
export default async function Home() {
  // Runs on server, can use async/await
  const data = await api.customers.getAll()

  // Pass data as props to Client Components
  return <CustomersTable customers={data.customers} />
}
```

**Pattern 2: Client Components for Interactivity**
```typescript
// components/CustomersTable.tsx (Client Component)
'use client'

export default function CustomersTable({ customers }) {
  // Runs in browser, can use hooks and event handlers
  const [selectedRows, setSelectedRows] = useState(new Set())

  const handleClick = (id) => {
    // Work with in-memory data only
    const customer = customers.find(c => c.id === id)
  }
}
```

**Pattern 3: Server Actions for Mutations**
```typescript
// app/actions/customers.ts
'use server'

export async function updateCustomerAction(formData) {
  // Runs on server
  const result = await api.customers.update(id, data)

  // Trigger re-fetch on next navigation
  revalidatePath('/')

  return { success: true }
}
```

**Pattern 4: Context for UI State (Not Data)**
```typescript
// components/providers/CustomerUIProvider.tsx
'use client'

export function CustomerUIProvider({ children }) {
  // UI state only - which customer is selected for viewing
  const [selectedCustomer, setSelectedCustomer] = useState(null)

  // NOT for data fetching - just UI coordination
  const openSlider = (customer) => {
    setSelectedCustomer(customer) // Customer object from props
  }
}
```

### Comparison with Traditional SPA

| Aspect | Traditional SPA (React Query) | Next.js App Router |
|--------|------------------------------|---------------------|
| Data Fetching | Client-side (useQuery) | Server-side (Server Components) |
| Initial Load | Empty → Fetch → Render | HTML with data arrives |
| Loading States | Required (isLoading) | Optional (Suspense for streaming) |
| Caching | React Query cache | Next.js page cache |
| Refetch | queryClient.invalidateQueries() | revalidatePath() |
| Mutations | useMutation hook | Server Actions |
| SEO | Limited (needs SSR) | Built-in (Server Components) |
| Bundle Size | Includes API client | API client on server only |

---