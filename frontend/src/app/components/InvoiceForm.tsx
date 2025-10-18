'use client'

import { useActionState, useEffect, useMemo, useState } from 'react'
import { createInvoiceAction } from '@/app/actions/invoices'
import type { Customer } from '@/lib/api-client'
import { Input } from './ui/Input'
import { Select } from './ui/Select'
import { Button } from './ui/Button'

interface InvoiceFormProps {
  customers: Customer[]
  onSuccess?: () => void
  onCancel: () => void
}

const STATUS_OPTIONS = [
  { value: 'draft', label: 'Entwurf' },
  { value: 'sent', label: 'Versendet' },
  { value: 'paid', label: 'Bezahlt' },
  { value: 'partially_paid', label: 'Teilweise bezahlt' },
  { value: 'insurance_pending', label: 'Kasse offen' },
  { value: 'cancelled', label: 'Storniert' }
]

const PAYMENT_METHOD_OPTIONS = [
  { value: 'bar', label: 'Barzahlung' },
  { value: 'karte', label: 'Kartenzahlung' },
  { value: 'rechnung', label: 'Rechnung' },
  { value: 'ueberweisung', label: 'Überweisung' }
]

export default function InvoiceForm({ customers, onSuccess, onCancel }: InvoiceFormProps) {
  const [state, formAction, isPending] = useActionState(createInvoiceAction, null)
  const [subtotal, setSubtotal] = useState('0.00')
  const [vatAmount, setVatAmount] = useState('0.00')
  const today = useMemo(() => new Date().toISOString().slice(0, 10), [])

  const totalAmount = useMemo(() => {
    const subtotalValue = Number.parseFloat(subtotal) || 0
    const vatValue = Number.parseFloat(vatAmount) || 0
    return (subtotalValue + vatValue).toFixed(2)
  }, [subtotal, vatAmount])

  useEffect(() => {
    if (state?.success && onSuccess) {
      onSuccess()
    }
  }, [state?.success, onSuccess])

  const customerOptions = useMemo(
    () => customers.map((customer) => ({
      value: customer.id.toString(),
      label: `${customer.first_name ?? ''} ${customer.last_name ?? ''}`.trim() || 'Unbekannter Kunde'
    })),
    [customers]
  )

  return (
    <form action={formAction} className="space-y-6">
      <div className="space-y-4">
        <h4 className="text-sm font-semibold text-secondary-default">Kundendaten</h4>

        <Select
          name="customer_id"
          label="Kunde"
          required
          placeholder={customers.length === 0 ? 'Keine Kunden verfügbar' : 'Kunden auswählen'}
          options={customerOptions}
        />

        <div className="grid grid-cols-2 gap-4">
          <Input
            type="date"
            name="invoice_date"
            label="Rechnungsdatum"
            defaultValue={today}
            required
          />
          <Input
            type="date"
            name="due_date"
            label="Fälligkeitsdatum"
          />
        </div>

        <Select
          name="status"
          label="Status"
          defaultValue="draft"
          options={STATUS_OPTIONS}
        />

        <Select
          name="payment_method"
          label="Zahlungsart"
          placeholder="Bitte wählen"
          options={PAYMENT_METHOD_OPTIONS}
        />
      </div>

      <div className="space-y-4">
        <h4 className="text-sm font-semibold text-secondary-default">Finanzen</h4>

        <div className="grid grid-cols-2 gap-4">
          <Input
            type="number"
            step="0.01"
            min="0"
            name="subtotal"
            label="Zwischensumme (€)"
            value={subtotal}
            onChange={(event) => setSubtotal(event.target.value)}
            required
          />
          <Input
            type="number"
            step="0.01"
            min="0"
            name="vat_amount"
            label="Mehrwertsteuer (€)"
            value={vatAmount}
            onChange={(event) => setVatAmount(event.target.value)}
            required
          />
        </div>

        <Input
          type="number"
          name="total"
          label="Gesamtsumme (€)"
          value={totalAmount}
          readOnly
        />

        <div className="grid grid-cols-2 gap-4">
          <Input
            type="number"
            step="0.01"
            min="0"
            name="insurance_coverage_amount"
            label="Kassenanteil (€)"
          />
          <Input
            type="number"
            step="0.01"
            min="0"
            name="patient_copay_amount"
            label="Eigenanteil Patient (€)"
          />
        </div>
      </div>

      <div className="space-y-4">
        <h4 className="text-sm font-semibold text-secondary-default">Versicherungsdetails</h4>
        <Input
          name="insurance_provider"
          label="Krankenkasse"
        />
        <Input
          name="insurance_claim_number"
          label="Kassenscheinnummer"
        />
      </div>

      <div className="space-y-2">
        <h4 className="text-sm font-semibold text-secondary-default">Notizen</h4>
        <textarea
          name="notes"
          rows={4}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Interne Hinweise oder Zahlungsinformationen"
        />
      </div>

      {state?.error && (
        <div className="rounded-md bg-red-50 p-4 text-sm text-red-600">
          {state.error}
        </div>
      )}

      {state?.success && (
        <div className="rounded-md bg-green-50 p-4 text-sm text-green-600">
          {state.message}
        </div>
      )}

      <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
        <Button
          type="button"
          variant="secondary"
          onClick={onCancel}
        >
          Abbrechen
        </Button>
        <Button
          type="submit"
          variant="primary"
          loading={isPending}
          disabled={isPending || customers.length === 0}
        >
          {isPending ? 'Speichert…' : 'Rechnung erstellen'}
        </Button>
      </div>
    </form>
  )
}
