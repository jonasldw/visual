'use client'

import { useActionState, useEffect } from 'react'
import { createCustomerAction, updateCustomerAction } from '@/app/actions/customers'
import type { Customer } from '@/lib/api-client'
import { Input } from './ui/Input'
import { Select } from './ui/Select'
import { Button } from './ui/Button'

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
    <form action={formAction} className="space-y-6 max-h-[80vh] overflow-y-auto px-1">
      {/* Hidden customer ID for edit mode */}
      {isEdit && (
        <input type="hidden" name="customer_id" value={customer.id} />
      )}

      {/* Basic Information */}
      <div className="space-y-4">
        <h4 className="text-sm font-semibold text-secondary-default">Grunddaten</h4>
        
        <div className="grid grid-cols-2 gap-4">
          <Input
            name="first_name"
            label="Vorname"
            defaultValue={customer?.first_name || ''}
            required
          />
          
          <Input
            name="last_name"
            label="Nachname"
            defaultValue={customer?.last_name || ''}
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input
            type="email"
            name="email"
            label="E-Mail"
            defaultValue={customer?.email || ''}
          />
          
          <Input
            type="tel"
            name="phone"
            label="Telefon"
            defaultValue={customer?.phone || ''}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input
            type="tel"
            name="mobile"
            label="Mobil"
            defaultValue={customer?.mobile || ''}
          />
          
          <Input
            type="date"
            name="date_of_birth"
            label="Geburtsdatum"
            defaultValue={customer?.date_of_birth || ''}
          />
        </div>

        <Select
          name="status"
          label="Status"
          defaultValue={customer?.status || 'aktiv'}
          options={[
            { value: 'aktiv', label: 'Aktiv' },
            { value: 'inaktiv', label: 'Inaktiv' },
            { value: 'interessent', label: 'Interessent' },
            { value: 'archiviert', label: 'Archiviert' }
          ]}
        />
      </div>

      {/* Address Information */}
      <div className="space-y-4">
        <h4 className="text-sm font-semibold text-secondary-default">Adresse</h4>
        
        <Input
          name="address_street"
          label="Straße"
          defaultValue={customer?.address_street || ''}
        />

        <div className="grid grid-cols-2 gap-4">
          <Input
            name="address_postal_code"
            label="PLZ"
            defaultValue={customer?.address_postal_code || ''}
          />
          
          <Input
            name="address_city"
            label="Stadt"
            defaultValue={customer?.address_city || ''}
          />
        </div>

        <Input
          name="address_country"
          label="Land"
          defaultValue={customer?.address_country || 'Deutschland'}
        />
      </div>

      {/* Insurance Information */}
      <div className="space-y-4">
        <h4 className="text-sm font-semibold text-secondary-default">Versicherung</h4>
        
        <Input
          name="insurance_provider"
          label="Versicherung"
          defaultValue={customer?.insurance_provider || ''}
        />

        <div className="grid grid-cols-2 gap-4">
          <Select
            name="insurance_type"
            label="Versicherungsart"
            defaultValue={customer?.insurance_type || ''}
            placeholder="Bitte wählen"
            options={[
              { value: 'gesetzlich', label: 'Gesetzlich' },
              { value: 'privat', label: 'Privat' },
              { value: 'selbstzahler', label: 'Selbstzahler' }
            ]}
          />
          
          <Input
            name="insurance_number"
            label="Versicherungsnummer"
            defaultValue={customer?.insurance_number || ''}
          />
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
      <div className="flex justify-end space-x-3 pt-4 pb-1">
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
          disabled={isPending}
        >
          {isPending ? 'Speichert...' : isEdit ? 'Kunde aktualisieren' : 'Kunde erstellen'}
        </Button>
      </div>
    </form>
  )
}