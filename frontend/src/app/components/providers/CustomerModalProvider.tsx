'use client'

import { createContext, useContext, useState } from 'react'
import type { Customer } from '@/lib/api-client'

interface CustomerModalContextType {
  // Create modal state
  showCreateModal: boolean
  setShowCreateModal: (show: boolean) => void
  
  // Edit modal state  
  showEditModal: boolean
  setShowEditModal: (show: boolean) => void
  editingCustomer: Customer | null
  setEditingCustomer: (customer: Customer | null) => void
  
  // Utility functions
  openCreateModal: () => void
  openEditModal: (customer: Customer) => void
  closeAllModals: () => void
}

const CustomerModalContext = createContext<CustomerModalContextType | null>(null)

export function CustomerModalProvider({ children }: { children: React.ReactNode }) {
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null)

  const openCreateModal = () => {
    setShowCreateModal(true)
  }

  const openEditModal = (customer: Customer) => {
    setEditingCustomer(customer)
    setShowEditModal(true)
  }

  const closeAllModals = () => {
    setShowCreateModal(false)
    setShowEditModal(false)
    setEditingCustomer(null)
  }

  return (
    <CustomerModalContext value={{
      showCreateModal,
      setShowCreateModal,
      showEditModal,
      setShowEditModal,
      editingCustomer,
      setEditingCustomer,
      openCreateModal,
      openEditModal,
      closeAllModals
    }}>
      {children}
    </CustomerModalContext>
  )
}

export function useCustomerModal() {
  const context = useContext(CustomerModalContext)
  if (!context) {
    throw new Error('useCustomerModal must be used within CustomerModalProvider')
  }
  return context
}