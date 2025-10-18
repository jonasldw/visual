import { InvoiceUIProvider } from '../components/providers/InvoiceUIProvider'
import PageContent from './PageContent'
import TopBar from '../components/TopBar'
import InvoicesTable from '../components/InvoicesTable'
import InvoiceSlider from '../components/InvoiceSlider'
import { api, type Invoice, type Customer, type InvoiceStatus } from '@/lib/api-client'
import type { Metadata } from 'next'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Visual - Rechnungen',
}

interface PageProps {
  searchParams: Promise<{
    search?: string
    page?: string
    status?: string
  }>
}

export default async function InvoicesPage({ searchParams }: PageProps) {
  const resolvedSearchParams = await searchParams
  const search = resolvedSearchParams.search || ''
  const page = Number.parseInt(resolvedSearchParams.page || '1', 10)
  const rawStatus = resolvedSearchParams.status as InvoiceStatus | undefined
  const allowedStatuses: InvoiceStatus[] = ['draft', 'sent', 'paid', 'partially_paid', 'insurance_pending', 'cancelled']
  const status = rawStatus && allowedStatuses.includes(rawStatus) ? rawStatus : undefined

  let invoices: Invoice[] = []
  let totalInvoices = 0
  let error: string | null = null
  let customers: Customer[] = []

  try {
    const response = await api.invoices.getAll({
      search,
      page,
      per_page: 20,
      status,
      organization_id: 1
    })

    invoices = response.invoices
    totalInvoices = response.total
  } catch (err) {
    error = err instanceof Error ? err.message : 'Fehler beim Laden der Rechnungen'
    console.error('Error fetching invoices:', err)
  }

  try {
    const customerResponse = await api.customers.getAll({
      page: 1,
      per_page: 100
    })
    customers = customerResponse.customers
  } catch (err) {
    console.warn('⚠️ Failed to preload customers for invoices:', err)
  }

  return (
    <InvoiceUIProvider customers={customers}>
      <PageContent>
        {[
          <div key="main" className="flex-1 flex flex-col">
            <TopBar />
            <main className="flex-1">
              <InvoicesTable
                invoices={invoices}
                totalInvoices={totalInvoices}
                currentPage={page}
                search={search}
                error={error}
              />
            </main>
          </div>,
          <InvoiceSlider key="sidebar" />
        ]}
      </PageContent>
    </InvoiceUIProvider>
  )
}
