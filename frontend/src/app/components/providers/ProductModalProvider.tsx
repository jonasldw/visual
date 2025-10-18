'use client'

import { createContext, useContext, useState, ReactNode } from 'react'
import type { Product } from '@/lib/api-client'

interface ProductUIContextType {
  showCreateModal: boolean
  showSlider: boolean
  selectedProduct: Product | null
  openCreateModal: () => void
  closeCreateModal: () => void
  openSlider: (product: Product) => void
  closeSlider: () => void
  closeAll: () => void
}

const ProductUIContext = createContext<ProductUIContextType | undefined>(undefined)

export function ProductUIProvider({ children }: { children: ReactNode }) {
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showSlider, setShowSlider] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)

  const openCreateModal = () => {
    setShowCreateModal(true)
    setShowSlider(false)
  }

  const closeCreateModal = () => {
    setShowCreateModal(false)
  }

  const openSlider = (product: Product) => {
    setSelectedProduct(product)
    setShowSlider(true)
    setShowCreateModal(false)
  }

  const closeSlider = () => {
    setShowSlider(false)
    setSelectedProduct(null)
  }

  const closeAll = () => {
    setShowCreateModal(false)
    setShowSlider(false)
    setSelectedProduct(null)
  }

  return (
    <ProductUIContext.Provider
      value={{
        showCreateModal,
        showSlider,
        selectedProduct,
        openCreateModal,
        closeCreateModal,
        openSlider,
        closeSlider,
        closeAll
      }}
    >
      {children}
    </ProductUIContext.Provider>
  )
}

export function ProductModalProvider({ children }: { children: ReactNode }) {
  return <ProductUIProvider>{children}</ProductUIProvider>
}

export function useProductUI() {
  const context = useContext(ProductUIContext)
  if (context === undefined) {
    throw new Error('useProductUI must be used within ProductUIProvider')
  }
  return context
}

export function useProductModal() {
  const context = useProductUI()
  return {
    showCreateModal: context.showCreateModal,
    showEditModal: false,
    editingProduct: context.selectedProduct,
    openCreateModal: context.openCreateModal,
    openEditModal: context.openSlider,
    closeAllModals: context.closeAll,
    showSlider: context.showSlider,
    selectedProduct: context.selectedProduct,
    closeSlider: context.closeSlider
  }
}