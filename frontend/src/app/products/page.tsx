import { ProductModalProvider } from '../components/providers/ProductModalProvider'
import TopBar from '../components/TopBar'
import ProductsTable from '../components/ProductsTable'
import { api, Product } from '@/lib/api-client'

export const dynamic = 'force-dynamic'

interface PageProps {
  searchParams: Promise<{
    search?: string
    page?: string
  }>
}

export default async function ProductsPage({ searchParams }: PageProps) {
  // Parse search params
  const resolvedSearchParams = await searchParams
  const search = resolvedSearchParams.search || ''
  const page = parseInt(resolvedSearchParams.page || '1', 10)
  
  // Fetch data in Server Component with search and pagination
  let products: Product[] = []
  let totalProducts = 0
  let error: string | null = null

  try {
    const response = await api.products.getAll({
      search,
      page,
      per_page: 20,
      organization_id: 1
    })
    
    products = response.products
    totalProducts = response.total
  } catch (err) {
    error = err instanceof Error ? err.message : 'Failed to load products'
  }

  return (
    <ProductModalProvider>
      <div className="flex-1 flex flex-col">
        <TopBar />
        <main className="flex-1 p-4">
          <ProductsTable 
            products={products}
            totalProducts={totalProducts}
            currentPage={page}
            search={search}
            error={error}
          />
        </main>
      </div>
    </ProductModalProvider>
  )
}