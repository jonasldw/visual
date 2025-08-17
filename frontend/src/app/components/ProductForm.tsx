'use client'

import { useActionState, useEffect } from 'react'
import { createProductAction, updateProductAction } from '@/app/actions/products'
import type { Product } from '@/lib/api-client'
import { Input } from './ui/Input'
import { Select } from './ui/Select'
import { Button } from './ui/Button'

interface ProductFormProps {
  product?: Product
  onSuccess?: () => void
  onCancel: () => void
}

export default function ProductForm({ product, onSuccess, onCancel }: ProductFormProps) {
  const isEdit = !!product
  const action = isEdit ? updateProductAction : createProductAction
  
  const [state, formAction, isPending] = useActionState(action, null)

  // Handle successful submission
  useEffect(() => {
    if (state?.success && onSuccess) {
      onSuccess()
    }
  }, [state?.success, onSuccess])

  return (
    <form action={formAction} className="space-y-6 max-h-[80vh] overflow-y-auto px-1">
      {/* Hidden product ID for edit mode */}
      {isEdit && (
        <input type="hidden" name="product_id" value={product.id} />
      )}

      {/* Basic Information */}
      <div className="space-y-4">
        <h4 className="text-sm font-semibold text-secondary-default">Grunddaten</h4>
        
        <div className="grid grid-cols-2 gap-4">
          <Input
            name="name"
            label="Produktname"
            defaultValue={product?.name || ''}
            required
          />
          
          <Select
            name="product_type"
            label="Produkttyp"
            defaultValue={product?.product_type || ''}
            required
            options={[
              { value: 'frame', label: 'Brille' },
              { value: 'lens', label: 'Gläser' },
              { value: 'contact_lens', label: 'Kontaktlinsen' },
              { value: 'accessory', label: 'Zubehör' }
            ]}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input
            name="sku"
            label="Artikelnummer (SKU)"
            defaultValue={product?.sku || ''}
          />
          
          <Input
            name="brand"
            label="Marke"
            defaultValue={product?.brand || ''}
          />
        </div>

        <Input
          name="model"
          label="Modell"
          defaultValue={product?.model || ''}
        />

        <Select
          name="active"
          label="Status"
          defaultValue={product?.active !== false ? 'true' : 'false'}
          options={[
            { value: 'true', label: 'Aktiv' },
            { value: 'false', label: 'Inaktiv' }
          ]}
        />
      </div>

      {/* Frame Details */}
      <div className="space-y-4">
        <h4 className="text-sm font-semibold text-secondary-default">Brillendetails</h4>
        
        <div className="grid grid-cols-2 gap-4">
          <Input
            name="frame_size"
            label="Größe"
            defaultValue={product?.frame_size || ''}
          />
          
          <Input
            name="frame_color"
            label="Farbe"
            defaultValue={product?.frame_color || ''}
          />
        </div>
      </div>

      {/* Lens Details */}
      <div className="space-y-4">
        <h4 className="text-sm font-semibold text-secondary-default">Glasdetails</h4>
        
        <Input
          name="lens_material"
          label="Material"
          defaultValue={product?.lens_material || ''}
        />
      </div>

      {/* Pricing Information */}
      <div className="space-y-4">
        <h4 className="text-sm font-semibold text-secondary-default">Preise</h4>
        
        <div className="grid grid-cols-2 gap-4">
          <Input
            type="number"
            name="current_price"
            label="Aktueller Preis (€)"
            defaultValue={product?.current_price || ''}
            step="0.01"
            min="0"
            required
          />
          
          <Select
            name="vat_rate"
            label="Mehrwertsteuersatz"
            defaultValue={product?.vat_rate ? (product.vat_rate * 100).toString() : '19'}
            options={[
              { value: '19', label: '19% (Standard)' },
              { value: '7', label: '7% (Medizinprodukte)' },
              { value: '0', label: '0% (Steuerbefreit)' }
            ]}
          />
        </div>

        <Select
          name="insurance_eligible"
          label="Kassenleistung"
          defaultValue={product?.insurance_eligible ? 'true' : 'false'}
          options={[
            { value: 'false', label: 'Nein' },
            { value: 'true', label: 'Ja' }
          ]}
        />
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
      <div className="flex justify-end space-x-3 pt-4 pb-1 border-t border-gray-200">
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
          {isPending ? 'Speichert...' : isEdit ? 'Produkt aktualisieren' : 'Produkt erstellen'}
        </Button>
      </div>
    </form>
  )
}