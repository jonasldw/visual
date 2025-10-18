'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Product as ApiProduct } from '@/lib/api-client'
import { useProductUI } from './providers/ProductModalProvider'
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
  // Format price with currency, handle string/number conversion
  const priceValue = typeof apiProduct.current_price === 'string' 
    ? parseFloat(apiProduct.current_price) 
    : (apiProduct.current_price || 0)
  const price = `${priceValue.toFixed(2)} €`
  
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
  const [hoveredRowId, setHoveredRowId] = useState<string | null>(null)
  const {
    showCreateModal,
    openSlider,
    closeAll
  } = useProductUI()
  
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

  const handleViewProduct = (productId: string) => {
    const product = apiProducts.find(p => p.id.toString() === productId)
    if (product) {
      openSlider(product)
    }
  }

  const handleRowClick = (productId: string) => {
    handleViewProduct(productId)
  }

  const handleModalSuccess = () => {
    closeAll()
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
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="sticky left-0 z-20 w-12 px-4 py-3 text-left bg-white border-r border-gray-200">
                <input
                  type="checkbox"
                  checked={selectedRows.size === products.length}
                  onChange={handleSelectAll}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
              </th>
              <th className="sticky left-12 z-20 min-w-[220px] px-4 py-3 text-left bg-white border-r border-gray-200">
                <button className="flex items-center space-x-1 text-xs font-medium text-gray-500 uppercase tracking-wider hover:text-gray-700">
                  <span>Typ</span>
                  <Icon name="ChevronDown" size="xs" />
                </button>
              </th>
              <th className="min-w-[260px] px-4 py-3 text-left">
                <button className="flex items-center space-x-1 text-xs font-medium text-gray-500 uppercase tracking-wider hover:text-gray-700">
                  <span>Produktname</span>
                  <Icon name="ChevronDown" size="xs" />
                </button>
              </th>
              <th className="min-w-[240px] px-4 py-3 text-left">
                <button className="flex items-center space-x-1 text-xs font-medium text-gray-500 uppercase tracking-wider hover:text-gray-700">
                  <span>Marke/Modell</span>
                  <Icon name="ChevronDown" size="xs" />
                </button>
              </th>
              <th className="min-w-[160px] px-4 py-3 text-left">
                <button className="flex items-center space-x-1 text-xs font-medium text-gray-500 uppercase tracking-wider hover:text-gray-700">
                  <span>Preis</span>
                  <Icon name="ChevronDown" size="xs" />
                </button>
              </th>
              <th className="min-w-[150px] px-4 py-3 text-left">
                <button className="flex items-center space-x-1 text-xs font-medium text-gray-500 uppercase tracking-wider hover:text-gray-700">
                  <span>Status</span>
                  <Icon name="ChevronDown" size="xs" />
                </button>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white">
            {products.map((product) => (
              <tr
                key={product.id}
                onClick={() => handleRowClick(product.id)}
                onMouseEnter={() => setHoveredRowId(product.id)}
                onMouseLeave={() => setHoveredRowId(null)}
                className="relative border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors group"
              >
                <td
                  onClick={(e) => e.stopPropagation()}
                  className="sticky left-0 z-10 px-4 py-3 bg-white group-hover:bg-gray-50 border-r border-gray-200 transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={selectedRows.has(product.id)}
                    onChange={() => handleSelectRow(product.id)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                </td>
                <td className="sticky left-12 z-10 min-w-[220px] px-4 py-3 bg-white group-hover:bg-gray-50 border-r border-gray-200 transition-colors">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-blue-600 rounded-full flex items-center justify-center mr-3">
                      <Icon name={getProductTypeIcon(product.type)} size="sm" className="text-white" />
                    </div>
                    <div className="text-sm font-medium text-gray-900">{product.type}</div>
                  </div>
                </td>
                <td className="min-w-[260px] px-4 py-3 text-sm text-gray-900 font-medium">
                  {product.name}
                </td>
                <td className="min-w-[240px] px-4 py-3 text-sm text-gray-700">
                  {product.brand}
                </td>
                <td className="min-w-[160px] px-4 py-3 text-sm text-gray-900 font-medium">
                  {product.price}
                </td>
                <td className="min-w-[150px] px-4 py-3">
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                    product.status === 'Aktiv'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {product.status}
                  </span>
                </td>

                {hoveredRowId === product.id && (
                  <td className="absolute right-4 top-1/2 -translate-y-1/2 z-30">
                    <div
                      onClick={(e) => e.stopPropagation()}
                      className="flex items-center gap-1 bg-white rounded-lg shadow-md border border-primary-medium"
                    >
                      <Button
                        size="icon"
                        variant="ghost"
                        iconName="EllipsisVertical"
                        className="text-gray-500 hover:text-gray-700"
                      />
                    </div>
                  </td>
                )}
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
        onClose={closeAll}
        title="Neues Produkt erstellen"
      >
        <ProductForm
          onSuccess={handleModalSuccess}
          onCancel={closeAll}
        />
      </Modal>
    </div>
  )
}