'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Customer as ApiCustomer } from '@/lib/api-client'
import { useCustomerUI } from './providers/CustomerUIProvider'
import Modal from './Modal'
import CustomerForm from './CustomerForm'
import { Button } from './ui/Button'

interface Customer {
  id: string
  name: string
  address: string
  lastSaleDate: string | null
  dateOfBirth: string | null
  phone: string
}

// Function to transform API data to table format
function transformApiCustomer(apiCustomer: ApiCustomer): Customer {
  // Format address
  const addressParts = []
  if (apiCustomer.address_street) addressParts.push(apiCustomer.address_street)
  if (apiCustomer.address_postal_code || apiCustomer.address_city) {
    addressParts.push(`${apiCustomer.address_postal_code || ''} ${apiCustomer.address_city || ''}`.trim())
  }
  const address = addressParts.join(', ') || 'Keine Adresse'

  return {
    id: apiCustomer.id.toString(),
    name: `${apiCustomer.first_name} ${apiCustomer.last_name}`,
    address,
    lastSaleDate: null, // Will be fetched from invoices later
    dateOfBirth: apiCustomer.date_of_birth || null,
    phone: apiCustomer.phone || apiCustomer.mobile || 'Keine Telefonnummer'
  }
}


interface CustomersTableProps {
  customers: ApiCustomer[]
  totalCustomers: number
  currentPage: number
  search: string
  error: string | null
}

export default function CustomersTable({ customers: apiCustomers, totalCustomers, currentPage, search, error }: CustomersTableProps) {
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set())
  const {
    showCreateModal,
    openSlider,
    closeAll
  } = useCustomerUI()
  
  // Transform API customers to table format
  const customers = apiCustomers.map(transformApiCustomer)
  
  // DEBUG: Log the data transformation
  if (apiCustomers.length > 0) {
    console.log('🔍 Raw API Customer:', apiCustomers[0])
    console.log('🔄 Transformed Customer:', customers[0])
  }

  const handleSelectAll = () => {
    if (selectedRows.size === customers.length) {
      setSelectedRows(new Set())
    } else {
      setSelectedRows(new Set(customers.map(c => c.id)))
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

  const handleViewCustomer = (customerId: string) => {
    const customer = apiCustomers.find(c => c.id.toString() === customerId)
    if (customer) {
      openSlider(customer)
    }
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
        <table className="min-w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="w-12 px-4 py-3 text-left">
                <input
                  type="checkbox"
                  checked={selectedRows.size === customers.length}
                  onChange={handleSelectAll}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
              </th>
              <th className="px-4 py-3 text-left">
                <button className="flex items-center space-x-1 text-xs font-medium text-gray-500 uppercase tracking-wider hover:text-gray-700">
                  <span>Name</span>
                  <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M5 8l5 5 5-5H5z"/>
                  </svg>
                </button>
              </th>
              <th className="px-4 py-3 text-left">
                <button className="flex items-center space-x-1 text-xs font-medium text-gray-500 uppercase tracking-wider hover:text-gray-700">
                  <span>Adresse</span>
                  <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M5 8l5 5 5-5H5z"/>
                  </svg>
                </button>
              </th>
              <th className="px-4 py-3 text-left">
                <button className="flex items-center space-x-1 text-xs font-medium text-gray-500 uppercase tracking-wider hover:text-gray-700">
                  <span>Letzter Verkaufsdatum</span>
                  <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M5 8l5 5 5-5H5z"/>
                  </svg>
                </button>
              </th>
              <th className="px-4 py-3 text-left">
                <button className="flex items-center space-x-1 text-xs font-medium text-gray-500 uppercase tracking-wider hover:text-gray-700">
                  <span>Geburtstag</span>
                  <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M5 8l5 5 5-5H5z"/>
                  </svg>
                </button>
              </th>
              <th className="px-4 py-3 text-left">
                <button className="flex items-center space-x-1 text-xs font-medium text-gray-500 uppercase tracking-wider hover:text-gray-700">
                  <span>Telefon</span>
                  <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M5 8l5 5 5-5H5z"/>
                  </svg>
                </button>
              </th>
              <th className="px-4 py-3 text-right">
                <div className="flex items-center justify-end space-x-1 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <span>Aktionen</span>
                  <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M5 8l5 5 5-5H5z"/>
                  </svg>
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white">
            {customers.map((customer) => (
              <tr key={customer.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="px-4 py-3">
                  <input
                    type="checkbox"
                    checked={selectedRows.has(customer.id)}
                    onChange={() => handleSelectRow(customer.id)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mr-3">
                      <span className="text-white text-sm font-medium">{customer.name.charAt(0)}</span>
                    </div>
                    <div className="text-sm font-medium text-gray-900">{customer.name}</div>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-gray-700">
                  {customer.address}
                </td>
                <td className="px-4 py-3 text-sm text-gray-700">
                  {customer.lastSaleDate ? new Date(customer.lastSaleDate).toLocaleDateString('de-DE') : '—'}
                </td>
                <td className="px-4 py-3 text-sm text-gray-700">
                  {customer.dateOfBirth ? new Date(customer.dateOfBirth).toLocaleDateString('de-DE') : '—'}
                </td>
                <td className="px-4 py-3 text-sm text-gray-700">
                  {customer.phone}
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Button
                      size="icon"
                      variant="ghost"
                      iconName="Eye"
                      onClick={() => handleViewCustomer(customer.id)}
                      className="text-gray-500 hover:text-blue-600"
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
            Zeige {customers.length > 0 ? ((currentPage - 1) * 20 + 1) : 0}-
            {Math.min(currentPage * 20, totalCustomers)} von {totalCustomers} Kunden
          </span>
        </div>
        <div className="flex items-center space-x-2">
          {currentPage > 1 ? (
            <Link
              href={`/?${new URLSearchParams({ search, page: (currentPage - 1).toString() }).toString()}`}
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
          {Array.from({ length: Math.ceil(totalCustomers / 20) }, (_, i) => i + 1)
            .filter(p => p === 1 || p === Math.ceil(totalCustomers / 20) || Math.abs(p - currentPage) <= 1)
            .map(pageNum => (
              pageNum === currentPage ? (
                <span key={pageNum} className="px-3 py-1 text-sm bg-blue-50 text-blue-600 rounded">
                  {pageNum}
                </span>
              ) : (
                <Link
                  key={pageNum}
                  href={`/?${new URLSearchParams({ search, page: pageNum.toString() }).toString()}`}
                  className="px-3 py-1 text-sm text-gray-700 hover:bg-gray-100 rounded"
                >
                  {pageNum}
                </Link>
              )
            ))}
          
          {currentPage * 20 < totalCustomers ? (
            <Link
              href={`/?${new URLSearchParams({ search, page: (currentPage + 1).toString() }).toString()}`}
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
      
      {/* Create Customer Modal - controlled by TopBar button via context */}
      <Modal
        isOpen={showCreateModal}
        onClose={closeAll}
        title="Neuen Kunden erstellen"
      >
        <CustomerForm
          onSuccess={handleModalSuccess}
          onCancel={closeAll}
        />
      </Modal>
    </div>
  )
}