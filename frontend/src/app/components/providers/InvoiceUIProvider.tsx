'use client'

import { createContext, useContext, useMemo, useState, ReactNode, useCallback } from 'react'
import type { InvoiceWithItems, Customer } from '@/lib/api-client'

interface InvoiceUIContextType {
  showCreateModal: boolean
  showDetails: boolean
  selectedInvoice: InvoiceWithItems | null
  customers: Customer[]
  openCreateModal: () => void
  closeCreateModal: () => void
  openDetails: (invoice: InvoiceWithItems) => void
  closeDetails: () => void
  closeAll: () => void
}

const InvoiceUIContext = createContext<InvoiceUIContextType | undefined>(undefined)

interface ProviderProps {
  children: ReactNode
  customers: Customer[]
}

export function InvoiceUIProvider({ children, customers }: ProviderProps) {
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showDetails, setShowDetails] = useState(false)
  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceWithItems | null>(null)

  const openCreateModal = useCallback(() => {
    setShowCreateModal(true)
    setShowDetails(false)
    setSelectedInvoice(null)
  }, [])

  const closeCreateModal = useCallback(() => {
    setShowCreateModal(false)
  }, [])

  const openDetails = useCallback((invoice: InvoiceWithItems) => {
    setSelectedInvoice(invoice)
    setShowDetails(true)
    setShowCreateModal(false)
  }, [])

  const closeDetails = useCallback(() => {
    setShowDetails(false)
    setSelectedInvoice(null)
  }, [])

  const closeAll = useCallback(() => {
    setShowCreateModal(false)
    setShowDetails(false)
    setSelectedInvoice(null)
  }, [])

  const value = useMemo(
    () => ({
      showCreateModal,
      showDetails,
      selectedInvoice,
      customers,
      openCreateModal,
      closeCreateModal,
      openDetails,
      closeDetails,
      closeAll
    }),
    [showCreateModal, showDetails, selectedInvoice, customers, openCreateModal, closeCreateModal, openDetails, closeDetails, closeAll]
  )

  return (
    <InvoiceUIContext.Provider value={value}>
      {children}
    </InvoiceUIContext.Provider>
  )
}

export function useInvoiceUI() {
  const context = useContext(InvoiceUIContext)
  if (!context) {
    throw new Error('useInvoiceUI must be used within InvoiceUIProvider')
  }
  return context
}

export function useInvoiceModal() {
  const { showCreateModal, openCreateModal, closeAll } = useInvoiceUI()
  return {
    showCreateModal,
    openCreateModal,
    closeAllModals: closeAll
  }
}
