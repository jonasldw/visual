'use client'

import { useEffect, useMemo, useState } from 'react'
import type { Invoice, InvoiceStatus } from '@/lib/api-client'
import { getCustomerInvoicesAction } from '@/app/actions/invoices'

interface CustomerInvoicesSectionProps {
  customerId: number
  organizationId?: number
}

const statusLabels: Record<InvoiceStatus, string> = {
  draft: 'Entwurf',
  sent: 'Gesendet',
  paid: 'Bezahlt',
  partially_paid: 'Teilweise bezahlt',
  insurance_pending: 'Versicherung offen',
  cancelled: 'Storniert'
}

const currencyFormatter = new Intl.NumberFormat('de-DE', {
  style: 'currency',
  currency: 'EUR'
})

const dateFormatter = new Intl.DateTimeFormat('de-DE', {
  dateStyle: 'medium'
})

export default function CustomerInvoicesSection({
  customerId,
  organizationId
}: CustomerInvoicesSectionProps) {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isCancelled = false

    async function loadInvoices() {
      setIsLoading(true)
      setError(null)

      const result = await getCustomerInvoicesAction(
        customerId,
        organizationId ?? 1
      )

      if (!isCancelled) {
        if (result.success) {
          setInvoices(result.invoices)
        } else {
          setError(result.error || 'Unbekannter Fehler beim Laden der Rechnungen')
        }
        setIsLoading(false)
      }
    }

    loadInvoices()

    return () => {
      isCancelled = true
    }
  }, [customerId, organizationId])

  const content = useMemo(() => {
    if (isLoading) {
      return (
        <div className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-4 text-sm text-gray-600">
          Rechnungen werden geladen …
        </div>
      )
    }

    if (error) {
      return (
        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-4 text-sm text-red-700">
          {error}
        </div>
      )
    }

    if (invoices.length === 0) {
      return (
        <div className="rounded-lg border border-dashed border-gray-200 bg-gray-50 px-3 py-4 text-sm text-gray-500">
          Es sind noch keine Rechnungen für diesen Kunden vorhanden.
        </div>
      )
    }

    return (
      <ul className="space-y-3">
        {invoices.map((invoice) => (
          <li
            key={invoice.id}
            className="rounded-lg border border-gray-200 bg-white p-3 shadow-sm"
          >
            <div className="flex items-start justify-between text-sm font-medium text-gray-900">
              <span>{invoice.invoice_number || `Rechnung #${invoice.id}`}</span>
              <span>{currencyFormatter.format(invoice.total)}</span>
            </div>
            <div className="mt-2 flex flex-wrap items-center justify-between gap-y-1 text-xs text-gray-500">
              <span>
                {invoice.invoice_date
                  ? dateFormatter.format(new Date(invoice.invoice_date))
                  : 'Kein Rechnungsdatum'}
              </span>
              <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-medium uppercase tracking-wide text-gray-600">
                {invoice.status ? statusLabels[invoice.status] : 'Status unbekannt'}
              </span>
            </div>
          </li>
        ))}
      </ul>
    )
  }, [error, invoices, isLoading])

  return (
    <section aria-label="Rechnungen" className="pb-4">
      <header className="mb-3">
        <h2 className="text-sm font-semibold text-secondary-default">Rechnungen</h2>
        <p className="text-xs text-gray-500">
          Alle Rechnungen, die diesem Kunden zugeordnet sind.
        </p>
      </header>
      {content}
    </section>
  )
}
