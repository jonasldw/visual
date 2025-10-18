'use server'

import { revalidatePath } from 'next/cache'
import { api } from '@/lib/api-client'
import type { InvoiceCreate, InvoiceStatus, InvoiceItemCreate, Invoice } from '@/lib/api-client'

export interface ActionState {
  success: boolean
  error?: string
  message?: string
  invoice?: unknown
}

function parseDecimal(value: FormDataEntryValue | null): number | undefined {
  if (!value) {
    return undefined
  }

  const parsed = typeof value === 'string' ? Number.parseFloat(value) : Number(value)

  if (Number.isNaN(parsed)) {
    return undefined
  }

  return parsed
}

function extractInvoiceItems(formData: FormData): InvoiceItemCreate[] {
  const rawItems = formData.get('items')
  if (!rawItems) {
    return []
  }

  try {
    const parsed = JSON.parse(rawItems as string)
    if (Array.isArray(parsed)) {
      return parsed as InvoiceItemCreate[]
    }
  } catch (error) {
    console.warn('⚠️ Failed to parse invoice items JSON. Falling back to empty list.', error)
  }

  return []
}

function extractInvoiceData(formData: FormData): InvoiceCreate {
  const invoiceDate = (formData.get('invoice_date') as string) || new Date().toISOString().slice(0, 10)
  const dueDate = (formData.get('due_date') as string) || undefined
  const status = formData.get('status') as InvoiceStatus | null

  return {
    organization_id: 1,
    customer_id: Number(formData.get('customer_id') || 0),
    invoice_date: invoiceDate,
    due_date: dueDate,
    prescription_snapshot: formData.get('prescription_snapshot')
      ? JSON.parse(formData.get('prescription_snapshot') as string)
      : undefined,
    insurance_provider: (formData.get('insurance_provider') as string) || undefined,
    insurance_claim_number: (formData.get('insurance_claim_number') as string) || undefined,
    insurance_coverage_amount: parseDecimal(formData.get('insurance_coverage_amount')),
    patient_copay_amount: parseDecimal(formData.get('patient_copay_amount')),
    status: status || 'draft',
    payment_method: (formData.get('payment_method') as string) || undefined,
    notes: (formData.get('notes') as string) || undefined,
    subtotal: parseDecimal(formData.get('subtotal')) ?? 0,
    vat_amount: parseDecimal(formData.get('vat_amount')) ?? 0,
    total: parseDecimal(formData.get('total')) ?? 0,
    items: extractInvoiceItems(formData)
  }
}

function validateInvoiceData(invoice: InvoiceCreate): string | null {
  if (!invoice.customer_id) {
    return 'Ein Kunde muss ausgewählt werden.'
  }

  if (invoice.subtotal < 0 || invoice.vat_amount < 0 || invoice.total < 0) {
    return 'Finanzbeträge dürfen nicht negativ sein.'
  }

  if (invoice.total === 0) {
    return 'Die Gesamtsumme darf nicht 0 sein.'
  }

  const calculatedTotal = Number((invoice.subtotal + invoice.vat_amount).toFixed(2))
  if (Math.abs(calculatedTotal - Number(invoice.total.toFixed(2))) > 0.01) {
    return 'Gesamtsumme muss Summe aus Zwischensumme und Mehrwertsteuer entsprechen.'
  }

  return null
}

export async function createInvoiceAction(
  prevState: ActionState | null,
  formData: FormData
): Promise<ActionState> {
  try {
    const invoiceData = extractInvoiceData(formData)

    const validationError = validateInvoiceData(invoiceData)
    if (validationError) {
      return {
        success: false,
        error: validationError
      }
    }

    const invoice = await api.invoices.create(invoiceData)
    revalidatePath('/invoices')

    return {
      success: true,
      invoice,
      message: 'Rechnung erfolgreich erstellt'
    }
  } catch (error) {
    console.error('❌ Failed to create invoice:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Interner Fehler beim Erstellen der Rechnung'
    }
  }
}

export async function getCustomerInvoicesAction(
  customerId: number,
  organizationId: number = 1
) {
  try {
    const response = await api.invoices.getAll({
      customer_id: customerId,
      page: 1,
      per_page: 50,
      organization_id: organizationId,
      include_items: false
    })

    return {
      success: true,
      invoices: response.invoices as Invoice[]
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Fehler beim Laden der Rechnungen',
      invoices: []
    }
  }
}
