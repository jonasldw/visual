'use client'

import { createContext, useContext, useState, ReactNode } from 'react'
import type { Customer } from '@/lib/api-client'

interface CustomerUIContextType {
  // Modal state (create)
  showCreateModal: boolean
  
  // Slider state (view/edit)
  showSlider: boolean
  selectedCustomer: Customer | null
  
  // Actions
  openCreateModal: () => void
  closeCreateModal: () => void
  openSlider: (customer: Customer) => void
  closeSlider: () => void
  closeAll: () => void
}

const CustomerUIContext = createContext<CustomerUIContextType | undefined>(undefined)

export function CustomerUIProvider({ children }: { children: ReactNode }) {
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showSlider, setShowSlider] = useState(false)
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)

  const openCreateModal = () => {
    setShowCreateModal(true)
    setShowSlider(false) // Prevent conflicts
  }

  const closeCreateModal = () => {
    setShowCreateModal(false)
  }

  const openSlider = (customer: Customer) => {
    setSelectedCustomer(customer)
    setShowSlider(true)
    setShowCreateModal(false) // Prevent conflicts
  }

  const closeSlider = () => {
    setShowSlider(false)
    setSelectedCustomer(null)
  }

  const closeAll = () => {
    setShowCreateModal(false)
    setShowSlider(false)
    setSelectedCustomer(null)
  }

  return (
    <CustomerUIContext.Provider
      value={{
        showCreateModal,
        showSlider,
        selectedCustomer,
        openCreateModal,
        closeCreateModal,
        openSlider,
        closeSlider,
        closeAll
      }}
    >
      {children}
    </CustomerUIContext.Provider>
  )
}

export function useCustomerUI() {
  const context = useContext(CustomerUIContext)
  if (context === undefined) {
    throw new Error('useCustomerUI must be used within CustomerUIProvider')
  }
  return context
}

// Legacy hook for backward compatibility during transition
export function useCustomerModal() {
  const context = useCustomerUI()
  return {
    showCreateModal: context.showCreateModal,
    showEditModal: false, // No longer used
    editingCustomer: null, // No longer used
    openCreateModal: context.openCreateModal,
    openEditModal: () => {}, // No longer used
    closeAllModals: context.closeAll
  }
}