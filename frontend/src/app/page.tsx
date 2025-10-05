import { CustomerUIProvider } from './components/providers/CustomerUIProvider'
import ResizableLayout from './components/layouts/ResizableLayout'
import CustomerSlider from './components/CustomerSlider'
import TopBar from './components/TopBar'
import CustomersTable from './components/CustomersTable'
import { api, Customer } from '@/lib/api-client'

export const dynamic = 'force-dynamic'

interface PageProps {
  searchParams: Promise<{
    search?: string
    page?: string
  }>
}

export default async function Home({ searchParams }: PageProps) {
  // Parse search params
  const resolvedSearchParams = await searchParams
  const search = resolvedSearchParams.search || ''
  const page = parseInt(resolvedSearchParams.page || '1', 10)
  
  // Fetch data in Server Component with search and pagination
  let customers: Customer[] = []
  let totalCustomers = 0
  let error: string | null = null

  try {
    const response = await api.customers.getAll({
      search,
      page,
      per_page: 20
    })
    customers = response.customers
    totalCustomers = response.total
  } catch (err) {
    error = err instanceof Error ? err.message : 'Failed to fetch customers'
    console.error('Error fetching customers:', err)
  }

  return (
    <CustomerUIProvider>
      <ResizableLayout 
        showSidebar={true} // This will be dynamically controlled by provider state
        className="flex flex-col"
      >
        {[
          // Main content
          <div key="main" className="flex-1 flex flex-col">
            <TopBar />
            <main className="flex-1 p-4">
              <CustomersTable 
                customers={customers}
                totalCustomers={totalCustomers}
                currentPage={page}
                search={search}
                error={error}
              />
            </main>
          </div>,

          // Sidebar content
          <CustomerSlider key="sidebar" />
        ]}
      </ResizableLayout>
    </CustomerUIProvider>
  )
}