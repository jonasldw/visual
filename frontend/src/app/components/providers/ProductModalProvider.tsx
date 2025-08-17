'use client'

import { createContext, useContext, useState } from 'react'
import type { Product } from '@/lib/api-client'

interface ProductModalContextType {
  // Create modal state
  showCreateModal: boolean
  setShowCreateModal: (show: boolean) => void
  
  // Edit modal state  
  showEditModal: boolean
  setShowEditModal: (show: boolean) => void
  editingProduct: Product | null
  setEditingProduct: (product: Product | null) => void
  
  // Utility functions
  openCreateModal: () => void
  openEditModal: (product: Product) => void
  closeAllModals: () => void
}

const ProductModalContext = createContext<ProductModalContextType | null>(null)

export function ProductModalProvider({ children }: { children: React.ReactNode }) {
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)

  const openCreateModal = () => {
    setShowCreateModal(true)
  }

  const openEditModal = (product: Product) => {
    setEditingProduct(product)
    setShowEditModal(true)
  }

  const closeAllModals = () => {
    setShowCreateModal(false)
    setShowEditModal(false)
    setEditingProduct(null)
  }

  return (
    <ProductModalContext.Provider value={{
      showCreateModal,
      setShowCreateModal,
      showEditModal,
      setShowEditModal,
      editingProduct,
      setEditingProduct,
      openCreateModal,
      openEditModal,
      closeAllModals
    }}>
      {children}
    </ProductModalContext.Provider>
  )
}

export function useProductModal() {
  const context = useContext(ProductModalContext)
  if (!context) {
    throw new Error('useProductModal must be used within ProductModalProvider')
  }
  return context
}