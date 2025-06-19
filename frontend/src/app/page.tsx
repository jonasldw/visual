import { CustomerModalProvider } from './components/providers/CustomerModalProvider'
import TopBar from './components/TopBar'
import CustomersTable from './components/CustomersTable'
import { api, Customer } from '@/lib/api-client'

export const dynamic = 'force-dynamic'

export default async function Home() {
  // Fetch data in Server Component
  let customers: Customer[] = []
  let totalCustomers = 0
  let error: string | null = null

  try {
    const response = await api.customers.getAll()
    customers = response.customers
    totalCustomers = response.total
  } catch (err) {
    error = err instanceof Error ? err.message : 'Failed to fetch customers'
    console.error('Error fetching customers:', err)
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