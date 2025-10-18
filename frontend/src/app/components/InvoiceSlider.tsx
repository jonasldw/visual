'use client'

import { useMemo } from 'react'
import { useInvoiceUI } from './providers/InvoiceUIProvider'
import { Button } from './ui/Button'

const STATUS_LABELS: Record<string, string> = {
  draft: 'Entwurf',
  sent: 'Versendet',
  paid: 'Bezahlt',
  partially_paid: 'Teilweise bezahlt',
  insurance_pending: 'Kasse offen',
  cancelled: 'Storniert'
}

const STATUS_CLASSES: Record<string, string> = {
  draft: 'bg-slate-100 text-slate-700',
  sent: 'bg-blue-50 text-blue-600',
  paid: 'bg-emerald-50 text-emerald-600',
  partially_paid: 'bg-amber-50 text-amber-600',
  insurance_pending: 'bg-purple-50 text-purple-600',
  cancelled: 'bg-rose-50 text-rose-600'
}

function formatCurrency(value: number | string): string {
  const numeric = typeof value === 'string' ? Number.parseFloat(value) : value
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2
  }).format(Number.isNaN(numeric) ? 0 : numeric)
}

function formatDate(value?: string | null): string {
  if (!value) {
    return '—'
  }
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return value
  }
  return date.toLocaleDateString('de-DE')
}

function getProductName(item: { product_snapshot: Record<string, unknown>; product_id?: number | null }): string {
  const snapshot = item.product_snapshot
  if (snapshot && typeof snapshot.name === 'string') {
    return snapshot.name
  }
  return item.product_id ? `Produkt #${item.product_id}` : 'Unbekanntes Produkt'
}

export default function InvoiceSlider() {
  const { showDetails, selectedInvoice, closeDetails } = useInvoiceUI()

  const statusBadge = useMemo(() => {
    const status = selectedInvoice?.status
    if (!status) {
      return null
    }
    return (
      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${STATUS_CLASSES[status] || 'bg-slate-100 text-slate-700'}`}>
        {STATUS_LABELS[status] || status}
      </span>
    )
  }, [selectedInvoice?.status])

  if (!showDetails || !selectedInvoice) {
    return null
  }

  return (
    <div className="h-full flex flex-col bg-white border-l border-gray-200">
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="space-y-1">
          <div className="text-sm font-semibold text-secondary-default">
            Rechnung {selectedInvoice.invoice_number}
          </div>
          <div className="text-xs text-gray-500">
            erstellt am {formatDate(selectedInvoice.invoice_date)}
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {statusBadge}
          <Button
            size="icon"
            variant="ghost"
            iconName="X"
            onClick={closeDetails}
            aria-label="Schließen"
            className="text-gray-500 hover:text-gray-700"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        <section className="space-y-2">
          <h3 className="text-sm font-semibold text-secondary-default">Kunde</h3>
          <div className="rounded-lg border border-gray-200 p-3 space-y-1 text-sm text-gray-700">
            <div>{`${selectedInvoice.customer?.first_name ?? ''} ${selectedInvoice.customer?.last_name ?? ''}`.trim() || 'Unbekannter Kunde'}</div>
            {selectedInvoice.customer?.email && (
              <div className="text-xs text-gray-500">{selectedInvoice.customer.email}</div>
            )}
          </div>
        </section>

        <section className="space-y-2">
          <h3 className="text-sm font-semibold text-secondary-default">Rechnungsdetails</h3>
          <div className="grid grid-cols-2 gap-3 text-sm text-gray-700">
            <div>
              <div className="text-xs text-gray-500">Rechnungsdatum</div>
              <div>{formatDate(selectedInvoice.invoice_date)}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500">Fälligkeitsdatum</div>
              <div>{formatDate(selectedInvoice.due_date)}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500">Zahlungsart</div>
              <div>{selectedInvoice.payment_method || '—'}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500">Notizen</div>
              <div>{selectedInvoice.notes || '—'}</div>
            </div>
          </div>
        </section>

        <section className="space-y-2">
          <h3 className="text-sm font-semibold text-secondary-default">Positionen</h3>
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Produkt</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Menge</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Einzelpreis</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">MwSt.</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Summe</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {(!selectedInvoice.items || selectedInvoice.items.length === 0) && (
                  <tr>
                    <td colSpan={5} className="px-4 py-4 text-center text-sm text-gray-500">
                      Keine Positionen erfasst.
                    </td>
                  </tr>
                )}
                {selectedInvoice.items && selectedInvoice.items.map((item) => (
                  <tr key={item.id}>
                    <td className="px-4 py-2 text-sm text-gray-700">
                      <div className="font-medium text-gray-900">{getProductName(item)}</div>
                      {item.product_snapshot && typeof item.product_snapshot === 'object' && 'sku' in item.product_snapshot && (
                        <div className="text-xs text-gray-500">SKU: {(item.product_snapshot as Record<string, unknown>).sku as string}</div>
                      )}
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-700">{item.quantity}</td>
                    <td className="px-4 py-2 text-sm text-gray-700">{formatCurrency(item.unit_price)}</td>
                    <td className="px-4 py-2 text-sm text-gray-700">{((typeof item.vat_rate === 'string' ? Number.parseFloat(item.vat_rate) : Number(item.vat_rate)) * 100).toFixed(0)}%</td>
                    <td className="px-4 py-2 text-sm text-gray-700">{formatCurrency(item.line_total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="space-y-2">
          <h3 className="text-sm font-semibold text-secondary-default">Summen</h3>
          <div className="rounded-lg border border-gray-200 p-3 space-y-2 text-sm text-gray-700">
            <div className="flex items-center justify-between">
              <span>Zwischensumme</span>
              <span>{formatCurrency(selectedInvoice.subtotal)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Mehrwertsteuer</span>
              <span>{formatCurrency(selectedInvoice.vat_amount)}</span>
            </div>
            <div className="flex items-center justify-between text-base font-semibold text-gray-900">
              <span>Gesamt</span>
              <span>{formatCurrency(selectedInvoice.total)}</span>
            </div>
          </div>
        </section>
      </div>

      <div className="p-4 border-t border-gray-200">
        <Button variant="secondary" onClick={closeDetails} className="w-full">
          Schließen
        </Button>
      </div>
    </div>
  )
}
