'use client'

import { useActionState, useEffect } from 'react'
import { createCustomerAction, updateCustomerAction } from '@/app/actions/customers'
import type { Customer } from '@/lib/api-client'

interface CustomerFormProps {
  customer?: Customer
  onSuccess?: () => void
  onCancel: () => void
}

export default function CustomerForm({ customer, onSuccess, onCancel }: CustomerFormProps) {
  const isEdit = !!customer
  const action = isEdit ? updateCustomerAction : createCustomerAction
  
  const [state, formAction, isPending] = useActionState(action, null)

  // Handle successful submission
  useEffect(() => {
    if (state?.success && onSuccess) {
      onSuccess()
    }
  }, [state?.success, onSuccess])

  return (
    <form action={formAction} className="space-y-6">
      {/* Hidden customer ID for edit mode */}
      {isEdit && (
        <input type="hidden" name="customer_id" value={customer.id} />
      )}

      {/* Basic Information */}
      <div className="space-y-4">
        <h4 className="text-sm font-medium text-gray-900">Grunddaten</h4>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="first_name" className="block text-sm font-medium text-gray-700">
              Vorname *
            </label>
            <input
              type="text"
              name="first_name"
              id="first_name"
              defaultValue={customer?.first_name || ''}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>
          
          <div>
            <label htmlFor="last_name" className="block text-sm font-medium text-gray-700">
              Nachname *
            </label>
            <input
              type="text"
              name="last_name"
              id="last_name"
              defaultValue={customer?.last_name || ''}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              E-Mail
            </label>
            <input
              type="email"
              name="email"
              id="email"
              defaultValue={customer?.email || ''}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>
          
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
              Telefon
            </label>
            <input
              type="tel"
              name="phone"
              id="phone"
              defaultValue={customer?.phone || ''}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="mobile" className="block text-sm font-medium text-gray-700">
              Mobil
            </label>
            <input
              type="tel"
              name="mobile"
              id="mobile"
              defaultValue={customer?.mobile || ''}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>
          
          <div>
            <label htmlFor="date_of_birth" className="block text-sm font-medium text-gray-700">
              Geburtsdatum
            </label>
            <input
              type="date"
              name="date_of_birth"
              id="date_of_birth"
              defaultValue={customer?.date_of_birth || ''}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>
        </div>

        <div>
          <label htmlFor="status" className="block text-sm font-medium text-gray-700">
            Status
          </label>
          <select
            name="status"
            id="status"
            defaultValue={customer?.status || 'aktiv'}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          >
            <option value="aktiv">Aktiv</option>
            <option value="inaktiv">Inaktiv</option>
            <option value="interessent">Interessent</option>
            <option value="archiviert">Archiviert</option>
          </select>
        </div>
      </div>

      {/* Address Information */}
      <div className="space-y-4">
        <h4 className="text-sm font-medium text-gray-900">Adresse</h4>
        
        <div>
          <label htmlFor="address_street" className="block text-sm font-medium text-gray-700">
            Straße
          </label>
          <input
            type="text"
            name="address_street"
            id="address_street"
            defaultValue={customer?.address_street || ''}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="address_postal_code" className="block text-sm font-medium text-gray-700">
              PLZ
            </label>
            <input
              type="text"
              name="address_postal_code"
              id="address_postal_code"
              defaultValue={customer?.address_postal_code || ''}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>
          
          <div>
            <label htmlFor="address_city" className="block text-sm font-medium text-gray-700">
              Stadt
            </label>
            <input
              type="text"
              name="address_city"
              id="address_city"
              defaultValue={customer?.address_city || ''}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>
        </div>

        <div>
          <label htmlFor="address_country" className="block text-sm font-medium text-gray-700">
            Land
          </label>
          <input
            type="text"
            name="address_country"
            id="address_country"
            defaultValue={customer?.address_country || 'Deutschland'}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>
      </div>

      {/* Insurance Information */}
      <div className="space-y-4">
        <h4 className="text-sm font-medium text-gray-900">Versicherung</h4>
        
        <div>
          <label htmlFor="insurance_provider" className="block text-sm font-medium text-gray-700">
            Versicherung
          </label>
          <input
            type="text"
            name="insurance_provider"
            id="insurance_provider"
            defaultValue={customer?.insurance_provider || ''}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="insurance_type" className="block text-sm font-medium text-gray-700">
              Versicherungsart
            </label>
            <select
              name="insurance_type"
              id="insurance_type"
              defaultValue={customer?.insurance_type || ''}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            >
              <option value="">Bitte wählen</option>
              <option value="gesetzlich">Gesetzlich</option>
              <option value="privat">Privat</option>
              <option value="selbstzahler">Selbstzahler</option>
            </select>
          </div>
          
          <div>
            <label htmlFor="insurance_number" className="block text-sm font-medium text-gray-700">
              Versicherungsnummer
            </label>
            <input
              type="text"
              name="insurance_number"
              id="insurance_number"
              defaultValue={customer?.insurance_number || ''}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>
        </div>
      </div>

      {/* Messages */}
      {state?.error && (
        <div className="rounded-md bg-red-50 p-4">
          <div className="text-sm text-red-700">{state.error}</div>
        </div>
      )}

      {state?.success && (
        <div className="rounded-md bg-green-50 p-4">
          <div className="text-sm text-green-700">{state.message}</div>
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          Abbrechen
        </button>
        
        <button
          type="submit"
          disabled={isPending}
          className="rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isPending ? 'Speichert...' : isEdit ? 'Kunde aktualisieren' : 'Kunde erstellen'}
        </button>
      </div>
    </form>
  )
}