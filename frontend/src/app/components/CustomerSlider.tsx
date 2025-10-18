'use client'

import { useRef } from 'react'
import { useCustomerUI } from './providers/CustomerUIProvider'
import CustomerForm from './CustomerForm'
import { Button } from './ui/Button'
import CustomerInvoicesSection from './CustomerInvoicesSection'

export default function CustomerSlider() {
  const { showSlider, selectedCustomer, closeSlider } = useCustomerUI()
  const formRef = useRef<HTMLFormElement>(null)

  if (!showSlider || !selectedCustomer) {
    return null
  }

  const handleSuccess = () => {
    closeSlider()
    // Data refresh happens automatically via revalidatePath in server action
  }

  const handleSubmit = () => {
    formRef.current?.requestSubmit()
  }

  return (
    <div className="h-full flex flex-col">
      {/* Fixed Header */}
      <div className="flex items-center justify-between p-3.25 px-4 border-b border-primary-dark">
        <div className="flex flex-col">
          <span className="font-medium text-secondary-default text-sm">
            {selectedCustomer.first_name} {selectedCustomer.last_name}
          </span>
        </div>

        <Button
          size="icon"
          variant="ghost"
          onClick={closeSlider}
          className="text-gray-500 hover:text-gray-700"
          iconName="X"
        />
      </div>

      {/* Scrollable Content Area */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-6">
          <CustomerForm
            key={selectedCustomer.id}
            customer={selectedCustomer}
            onSuccess={handleSuccess}
            onCancel={closeSlider}
            hideActions={true}
            formRef={formRef}
          />

          <CustomerInvoicesSection
            key={`invoices-${selectedCustomer.id}`}
            customerId={selectedCustomer.id}
            organizationId={selectedCustomer.organization_id}
          />
        </div>
      </div>

      {/* Sticky Footer with Actions */}
      <div className="p-4">
        <div className="flex justify-end space-x-3">
          <Button
            type="button"
            variant="secondary"
            onClick={closeSlider}
          >
            Abbrechen
          </Button>

          <Button
            type="button"
            variant="primary"
            onClick={handleSubmit}
          >
            Kunde aktualisieren
          </Button>
        </div>
      </div>
    </div>
  )
}