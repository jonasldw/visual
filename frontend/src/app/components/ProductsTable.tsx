'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Product as ApiProduct } from '@/lib/api-client'
import { useProductModal } from './providers/ProductModalProvider'
import Modal from './Modal'
import ProductForm from './ProductForm'
import { Button } from './ui/Button'
import { Icon } from './ui/Icon'

interface Product {
  id: string
  type: string
  name: string
  brand: string
  price: string
  status: string
}

// Function to transform API data to table format
function transformApiProduct(apiProduct: ApiProduct): Product {
  // Format price with currency, handle potential null/undefined values
  const price = `${(apiProduct.current_price || 0).toFixed(2)} €`
  
  // Format brand/model
  const brand = [apiProduct.brand, apiProduct.model].filter(Boolean).join(' ') || 'Keine Marke'
  
  // Format product type
  const typeMap = {
    frame: 'Brille',
    lens: 'Gläser', 
    contact_lens: 'Kontaktlinsen',
    accessory: 'Zubehör'
  }
  
  return {
    id: apiProduct.id.toString(),
    type: typeMap[apiProduct.product_type] || apiProduct.product_type,
    name: apiProduct.name,
    brand,
    price,
    status: apiProduct.active ? 'Aktiv' : 'Inaktiv'
  }
}

// Function to get product type icon
function getProductTypeIcon(productType: string) {
  switch (productType) {
    case 'Brille':
      return 'Glasses'
    case 'Gläser':
      return 'Circle'
    case 'Kontaktlinsen':
      return 'Eye'
    case 'Zubehör':
      return 'Package'
    default:
      return 'Package'
  }
}

interface ProductsTableProps {
  products: ApiProduct[]
  totalProducts: number
  currentPage: number
  search: string
  error: string | null
}

export default function ProductsTable({ products: apiProducts, totalProducts, currentPage, search, error }: ProductsTableProps) {
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set())
  const {
    showCreateModal,
    showEditModal,
    editingProduct,
    openEditModal,
    closeAllModals
  } = useProductModal()
  
  // Transform API products to table format
  const products = apiProducts.map(transformApiProduct)
  
  // DEBUG: Log the data transformation
  if (apiProducts.length > 0) {
    console.log('🔍 Raw API Product:', apiProducts[0])
    console.log('🔄 Transformed Product:', products[0])
  }

  const handleSelectAll = () => {
    if (selectedRows.size === products.length) {
      setSelectedRows(new Set())
    } else {
      setSelectedRows(new Set(products.map(p => p.id)))
    }
  }

  const handleSelectRow = (id: string) => {
    const newSelected = new Set(selectedRows)
    if (newSelected.has(id)) {
      newSelected.delete(id)
    } else {
      newSelected.add(id)
    }
    setSelectedRows(newSelected)
  }

  const handleEditProduct = (productId: string) => {
    const product = apiProducts.find(p => p.id.toString() === productId)
    if (product) {
      openEditModal(product)
    }
  }

  const handleModalSuccess = () => {
    closeAllModals()
    // Data will be refreshed automatically by revalidatePath in server action
  }

  // Error state
  if (error) {
    return (
      <div className="bg-white overflow-hidden">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="text-red-600 mb-2">⚠️ Fehler beim Laden der Daten</div>
            <div className="text-gray-600 text-sm">{error}</div>
            <button 
              onClick={() => window.location.reload()} 
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Erneut versuchen
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="w-12 px-4 py-3 text-left">
                <input
                  type="checkbox"
                  checked={selectedRows.size === products.length}
                  onChange={handleSelectAll}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
              </th>
              <th className="px-4 py-3 text-left">
                <button className="flex items-center space-x-1 text-xs font-medium text-gray-500 uppercase tracking-wider hover:text-gray-700">
                  <span>Typ</span>
                  <Icon name="ChevronDown" size="xs" />
                </button>
              </th>
              <th className="px-4 py-3 text-left">
                <button className="flex items-center space-x-1 text-xs font-medium text-gray-500 uppercase tracking-wider hover:text-gray-700">
                  <span>Produktname</span>
                  <Icon name="ChevronDown" size="xs" />
                </button>
              </th>
              <th className="px-4 py-3 text-left">
                <button className="flex items-center space-x-1 text-xs font-medium text-gray-500 uppercase tracking-wider hover:text-gray-700">
                  <span>Marke/Modell</span>
                  <Icon name="ChevronDown" size="xs" />
                </button>
              </th>
              <th className="px-4 py-3 text-left">
                <button className="flex items-center space-x-1 text-xs font-medium text-gray-500 uppercase tracking-wider hover:text-gray-700">
                  <span>Preis</span>
                  <Icon name="ChevronDown" size="xs" />
                </button>
              </th>
              <th className="px-4 py-3 text-left">
                <button className="flex items-center space-x-1 text-xs font-medium text-gray-500 uppercase tracking-wider hover:text-gray-700">
                  <span>Status</span>
                  <Icon name="ChevronDown" size="xs" />
                </button>
              </th>
              <th className="px-4 py-3 text-right">
                <div className="flex items-center justify-end space-x-1 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <span>Aktionen</span>
                  <Icon name="ChevronDown" size="xs" />
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white">
            {products.map((product) => (
              <tr key={product.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="px-4 py-3">
                  <input
                    type="checkbox"
                    checked={selectedRows.has(product.id)}
                    onChange={() => handleSelectRow(product.id)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-blue-600 rounded-full flex items-center justify-center mr-3">
                      <Icon name={getProductTypeIcon(product.type)} size="sm" className="text-white" />
                    </div>
                    <div className="text-sm font-medium text-gray-900">{product.type}</div>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-gray-900 font-medium">
                  {product.name}
                </td>
                <td className="px-4 py-3 text-sm text-gray-700">
                  {product.brand}
                </td>
                <td className="px-4 py-3 text-sm text-gray-900 font-medium">
                  {product.price}
                </td>
                <td className="px-4 py-3">
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                    product.status === 'Aktiv' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {product.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => handleEditProduct(product.id)}
                      iconName="Pencil"
                    />
                    <Button
                      size="icon"
                      variant="ghost"
                      iconName="Eye"
                    />
                    <Button
                      size="icon"
                      variant="ghost"
                      iconName="EllipsisVertical"
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Pagination */}
      <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-100">
        <div className="flex items-center text-sm text-gray-500">
          <span>
            Zeige {products.length > 0 ? ((currentPage - 1) * 20 + 1) : 0}-
            {Math.min(currentPage * 20, totalProducts)} von {totalProducts} Produkten
          </span>
        </div>
        <div className="flex items-center space-x-2">
          {currentPage > 1 ? (
            <Link
              href={`/products?${new URLSearchParams({ search, page: (currentPage - 1).toString() }).toString()}`}
              className="px-3 py-1 text-sm text-gray-700 hover:bg-gray-100 rounded"
            >
              Zurück
            </Link>
          ) : (
            <button className="px-3 py-1 text-sm text-gray-400 cursor-not-allowed" disabled>
              Zurück
            </button>
          )}
          
          {/* Page numbers */}
          {Array.from({ length: Math.ceil(totalProducts / 20) }, (_, i) => i + 1)
            .filter(p => p === 1 || p === Math.ceil(totalProducts / 20) || Math.abs(p - currentPage) <= 1)
            .map(pageNum => (
              pageNum === currentPage ? (
                <span key={pageNum} className="px-3 py-1 text-sm bg-blue-50 text-blue-600 rounded">
                  {pageNum}
                </span>
              ) : (
                <Link
                  key={pageNum}
                  href={`/products?${new URLSearchParams({ search, page: pageNum.toString() }).toString()}`}
                  className="px-3 py-1 text-sm text-gray-700 hover:bg-gray-100 rounded"
                >
                  {pageNum}
                </Link>
              )
            ))}
          
          {currentPage * 20 < totalProducts ? (
            <Link
              href={`/products?${new URLSearchParams({ search, page: (currentPage + 1).toString() }).toString()}`}
              className="px-3 py-1 text-sm text-gray-700 hover:bg-gray-100 rounded"
            >
              Weiter
            </Link>
          ) : (
            <button className="px-3 py-1 text-sm text-gray-400 cursor-not-allowed" disabled>
              Weiter
            </button>
          )}
        </div>
      </div>
      
      {/* Create Product Modal - controlled by TopBar button via context */}
      <Modal
        isOpen={showCreateModal}
        onClose={closeAllModals}
        title="Neues Produkt erstellen"
      >
        <ProductForm
          onSuccess={handleModalSuccess}
          onCancel={closeAllModals}
        />
      </Modal>

      {/* Edit Product Modal - controlled by table edit buttons */}
      <Modal
        isOpen={showEditModal}
        onClose={closeAllModals}
        title="Produkt bearbeiten"
      >
        {editingProduct && (
          <ProductForm
            product={editingProduct}
            onSuccess={handleModalSuccess}
            onCancel={closeAllModals}
          />
        )}
      </Modal>
    </div>
  )
}