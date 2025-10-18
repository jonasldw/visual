'use client'

import { useRef } from 'react'
import { useProductUI } from './providers/ProductModalProvider'
import ProductForm from './ProductForm'
import { Button } from './ui/Button'

export default function ProductSlider() {
  const { showSlider, selectedProduct, closeSlider } = useProductUI()
  const formRef = useRef<HTMLFormElement>(null)

  if (!showSlider || !selectedProduct) {
    return null
  }

  const handleSuccess = () => {
    closeSlider()
  }

  const handleSubmit = () => {
    formRef.current?.requestSubmit()
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between p-3.25 px-4 border-b border-primary-dark">
        <div className="flex flex-col">
          <span className="font-medium text-secondary-default text-sm">
            {selectedProduct.name}
          </span>
          <span className="text-xs text-gray-500">
            {selectedProduct.brand || selectedProduct.model || 'Produktdetails'}
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

      <div className="flex-1 overflow-y-auto p-4">
        <ProductForm
          key={selectedProduct.id}
          product={selectedProduct}
          onSuccess={handleSuccess}
          onCancel={closeSlider}
          hideActions={true}
          formRef={formRef}
        />
      </div>

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
            Produkt aktualisieren
          </Button>
        </div>
      </div>
    </div>
  )
}
