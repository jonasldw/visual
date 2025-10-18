'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import type { InvoiceWithItems, InvoiceStatus } from '@/lib/api-client'
import { useInvoiceUI } from './providers/InvoiceUIProvider'
import Modal from './Modal'
import InvoiceForm from './InvoiceForm'
import { Button } from './ui/Button'

interface InvoicesTableProps {
  invoices: InvoiceWithItems[]
  totalInvoices: number
  currentPage: number
  search: string
  error: string | null
}

interface TableInvoice {
  id: string
  invoiceNumber: string
  customerName: string
  invoiceDate: string
  totalAmount: string
  status: InvoiceStatus
  statusLabel: string
  customerEmail: string | null
}

const STATUS_LABELS: Record<InvoiceStatus, string> = {
  draft: 'Entwurf',
  sent: 'Versendet',
  paid: 'Bezahlt',
  partially_paid: 'Teilweise bezahlt',
  insurance_pending: 'Kasse offen',
  cancelled: 'Storniert'
}

const STATUS_CLASSES: Record<InvoiceStatus, string> = {
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

function transformInvoice(apiInvoice: InvoiceWithItems): TableInvoice {
  const customerName = apiInvoice.customer
    ? `${apiInvoice.customer.first_name ?? ''} ${apiInvoice.customer.last_name ?? ''}`.trim()
    : ''

  return {
    id: apiInvoice.id.toString(),
    invoiceNumber: apiInvoice.invoice_number,
    customerName: customerName || 'Unbekannter Kunde',
    customerEmail: apiInvoice.customer?.email ?? null,
    invoiceDate: apiInvoice.invoice_date ?? '',
    totalAmount: formatCurrency(apiInvoice.total),
    status: apiInvoice.status ?? 'draft',
    statusLabel: STATUS_LABELS[apiInvoice.status ?? 'draft'] || apiInvoice.status || 'Unbekannt'
  }
}

export default function InvoicesTable({ invoices: apiInvoices, totalInvoices, currentPage, search, error }: InvoicesTableProps) {
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set())
  const { showCreateModal, closeCreateModal, openDetails, closeAll, customers } = useInvoiceUI()

  const invoices = useMemo(() => apiInvoices.map(transformInvoice), [apiInvoices])

  const handleSelectAll = () => {
    if (selectedRows.size === invoices.length) {
      setSelectedRows(new Set())
    } else {
      setSelectedRows(new Set(invoices.map((invoice) => invoice.id)))
    }
  }

  const handleSelectRow = (id: string) => {
    const newSelected = new Set(selectedRows)
    if (newSelected.has(id)) {
      newSelected.delete(id)
    } else {
      newSelected.add(id)
    }
    setSelectedRows(newSelected)
  }

  const handleRowClick = (invoiceId: string) => {
    const invoice = apiInvoices.find((item) => item.id.toString() === invoiceId)
    if (invoice) {
      openDetails(invoice)
    }
  }

  const handleModalSuccess = () => {
    closeAll()
  }

  if (error) {
    return (
      <div className="bg-white overflow-hidden">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="text-red-600 mb-2">⚠️ Fehler beim Laden der Daten</div>
            <div className="text-gray-600 text-sm">{error}</div>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Erneut versuchen
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="w-12 px-4 py-3 text-left">
                <input
                  type="checkbox"
                  checked={selectedRows.size === invoices.length && invoices.length > 0}
                  onChange={handleSelectAll}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Rechnungsnummer
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Kunde
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Datum
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Gesamtbetrag
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Aktionen
              </th>
            </tr>
          </thead>
          <tbody className="bg-white">
            {invoices.map((invoice) => (
              <tr
                key={invoice.id}
                className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer"
                onClick={() => handleRowClick(invoice.id)}
              >
                <td className="px-4 py-3" onClick={(event) => event.stopPropagation()}>
                  <input
                    type="checkbox"
                    checked={selectedRows.has(invoice.id)}
                    onChange={() => handleSelectRow(invoice.id)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                </td>
                <td className="px-4 py-3 text-sm font-medium text-gray-900">
                  {invoice.invoiceNumber}
                </td>
                <td className="px-4 py-3 text-sm text-gray-700">
                  <div className="flex flex-col">
                    <span>{invoice.customerName}</span>
                    {invoice.customerEmail && (
                      <span className="text-xs text-gray-500">{invoice.customerEmail}</span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-gray-700">
                  {invoice.invoiceDate ? new Date(invoice.invoiceDate).toLocaleDateString('de-DE') : '—'}
                </td>
                <td className="px-4 py-3 text-sm text-gray-900 font-medium">
                  {invoice.totalAmount}
                </td>
                <td className="px-4 py-3 text-sm">
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${STATUS_CLASSES[invoice.status]}`}>
                    {invoice.statusLabel}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end space-x-2" onClick={(event) => event.stopPropagation()}>
                    <Button
                      size="icon"
                      variant="ghost"
                      iconName="Eye"
                      aria-label="Rechnung anzeigen"
                      onClick={() => handleRowClick(invoice.id)}
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-100">
        <div className="flex items-center text-sm text-gray-500">
          <span>
            Zeige {invoices.length > 0 ? ((currentPage - 1) * 20 + 1) : 0}-
            {Math.min(currentPage * 20, totalInvoices)} von {totalInvoices} Rechnungen
          </span>
        </div>
        <div className="flex items-center space-x-2">
          {currentPage > 1 ? (
            <Link
              href={`/invoices?${new URLSearchParams({ search, page: (currentPage - 1).toString() }).toString()}`}
              className="px-3 py-1 text-sm text-gray-700 hover:bg-gray-100 rounded"
            >
              Zurück
            </Link>
          ) : (
            <button className="px-3 py-1 text-sm text-gray-400 cursor-not-allowed" disabled>
              Zurück
            </button>
          )}

          {Array.from({ length: Math.ceil(totalInvoices / 20) }, (_, index) => index + 1)
            .filter((page) => page === 1 || page === Math.ceil(totalInvoices / 20) || Math.abs(page - currentPage) <= 1)
            .map((page) => (
              page === currentPage ? (
                <span key={page} className="px-3 py-1 text-sm bg-blue-50 text-blue-600 rounded">
                  {page}
                </span>
              ) : (
                <Link
                  key={page}
                  href={`/invoices?${new URLSearchParams({ search, page: page.toString() }).toString()}`}
                  className="px-3 py-1 text-sm text-gray-700 hover:bg-gray-100 rounded"
                >
                  {page}
                </Link>
              )
            ))}

          {currentPage * 20 < totalInvoices ? (
            <Link
              href={`/invoices?${new URLSearchParams({ search, page: (currentPage + 1).toString() }).toString()}`}
              className="px-3 py-1 text-sm text-gray-700 hover:bg-gray-100 rounded"
            >
              Weiter
            </Link>
          ) : (
            <button className="px-3 py-1 text-sm text-gray-400 cursor-not-allowed" disabled>
              Weiter
            </button>
          )}
        </div>
      </div>

      <Modal
        isOpen={showCreateModal}
        onClose={closeCreateModal}
        title="Neue Rechnung erstellen"
      >
        <InvoiceForm
          customers={customers}
          onSuccess={handleModalSuccess}
          onCancel={closeCreateModal}
        />
      </Modal>
    </div>
  )
}
