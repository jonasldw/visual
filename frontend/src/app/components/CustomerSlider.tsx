'use client'

import { useCustomerUI } from './providers/CustomerUIProvider'
import CustomerForm from './CustomerForm'
import { Button } from './ui/Button'

export default function CustomerSlider() {
  const { showSlider, selectedCustomer, closeSlider } = useCustomerUI()

  if (!showSlider || !selectedCustomer) {
    return null
  }

  const handleSuccess = () => {
    closeSlider()
    // Data refresh happens automatically via revalidatePath in server action
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
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

      {/* Form Content */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full p-4">
          <CustomerForm
            customer={selectedCustomer}
            onSuccess={handleSuccess}
            onCancel={closeSlider}
          />
        </div>
      </div>
    </div>
  )
}