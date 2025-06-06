'use client'

import { useState } from 'react'

interface Customer {
  id: string
  name: string
  lastExam: string
  prescription: string
  nextAppointment: string
  insurance: string
  status: 'active' | 'due' | 'overdue'
  purchaseHistory: number
  email: string
  phone: string
}

const mockData: Customer[] = [
  {
    id: 'CUS-001',
    name: 'Sarah Johnson',
    lastExam: '2023-06-15',
    prescription: 'OD: -2.50 -0.75 x 180 | OS: -2.25 -0.50 x 170',
    nextAppointment: '2024-06-15',
    insurance: 'VSP Vision',
    status: 'active',
    purchaseHistory: 3,
    email: 'sarah.j@email.com',
    phone: '(555) 123-4567'
  },
  {
    id: 'CUS-002',
    name: 'Michael Chen',
    lastExam: '2022-11-20',
    prescription: 'OD: -1.75 SPH | OS: -1.50 SPH',
    nextAppointment: '2024-11-20',
    insurance: 'EyeMed',
    status: 'due',
    purchaseHistory: 5,
    email: 'mchen@email.com',
    phone: '(555) 234-5678'
  },
  {
    id: 'CUS-003',
    name: 'Emma Williams',
    lastExam: '2021-09-10',
    prescription: 'OD: +1.25 -0.50 x 090 | OS: +1.00 -0.25 x 085',
    nextAppointment: 'Overdue',
    insurance: 'Davis Vision',
    status: 'overdue',
    purchaseHistory: 2,
    email: 'emma.w@email.com',
    phone: '(555) 345-6789'
  },
  {
    id: 'CUS-004',
    name: 'James Wilson',
    lastExam: '2023-08-05',
    prescription: 'OD: -3.00 -1.25 x 045 | OS: -3.25 -1.00 x 135',
    nextAppointment: '2024-08-05',
    insurance: 'Anthem Blue Cross',
    status: 'active',
    purchaseHistory: 7,
    email: 'jwilson@email.com',
    phone: '(555) 456-7890'
  },
  {
    id: 'CUS-005',
    name: 'Olivia Brown',
    lastExam: '2023-03-22',
    prescription: 'OD: Plano | OS: Plano (Reading: +1.50)',
    nextAppointment: '2025-03-22',
    insurance: 'United Healthcare',
    status: 'active',
    purchaseHistory: 1,
    email: 'olivia.b@email.com',
    phone: '(555) 567-8901'
  }
]

export default function CustomersTable() {
  const [customers] = useState<Customer[]>(mockData)
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set())
  const [sortColumn, setSortColumn] = useState<keyof Customer | null>(null)
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')

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

  const getStatusColor = (status: Customer['status']) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-700'
      case 'due':
        return 'bg-yellow-100 text-yellow-700'
      case 'overdue':
        return 'bg-red-100 text-red-700'
      default:
        return 'bg-gray-100 text-gray-700'
    }
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
                  <span>Kunde</span>
                  <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M5 8l5 5 5-5H5z"/>
                  </svg>
                </button>
              </th>
              <th className="px-4 py-3 text-left">
                <button className="flex items-center space-x-1 text-xs font-medium text-gray-500 uppercase tracking-wider hover:text-gray-700">
                  <span>Letzte Untersuchung</span>
                  <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M5 8l5 5 5-5H5z"/>
                  </svg>
                </button>
              </th>
              <th className="px-4 py-3 text-left">
                <button className="flex items-center space-x-1 text-xs font-medium text-gray-500 uppercase tracking-wider hover:text-gray-700">
                  <span>Rezept</span>
                  <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M5 8l5 5 5-5H5z"/>
                  </svg>
                </button>
              </th>
              <th className="px-4 py-3 text-left">
                <button className="flex items-center space-x-1 text-xs font-medium text-gray-500 uppercase tracking-wider hover:text-gray-700">
                  <span>Nächster Termin</span>
                  <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M5 8l5 5 5-5H5z"/>
                  </svg>
                </button>
              </th>
              <th className="px-4 py-3 text-left">
                <button className="flex items-center space-x-1 text-xs font-medium text-gray-500 uppercase tracking-wider hover:text-gray-700">
                  <span>Versicherung</span>
                  <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M5 8l5 5 5-5H5z"/>
                  </svg>
                </button>
              </th>
              <th className="px-4 py-3 text-left">
                <button className="flex items-center space-x-1 text-xs font-medium text-gray-500 uppercase tracking-wider hover:text-gray-700">
                  <span>Status</span>
                  <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M5 8l5 5 5-5H5z"/>
                  </svg>
                </button>
              </th>
              <th className="px-4 py-3 text-center">
                <button className="flex items-center space-x-1 text-xs font-medium text-gray-500 uppercase tracking-wider hover:text-gray-700">
                  <span>Käufe</span>
                  <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M5 8l5 5 5-5H5z"/>
                  </svg>
                </button>
              </th>
              <th className="px-4 py-3 text-right">
                <button className="flex items-center space-x-1 text-xs font-medium text-gray-500 uppercase tracking-wider hover:text-gray-700">
                  <span>Aktionen</span>
                  <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M5 8l5 5 5-5H5z"/>
                  </svg>
                </button>
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
                    <div>
                      <div className="text-sm font-medium text-gray-900">{customer.name}</div>
                      <div className="text-xs text-gray-500">{customer.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-gray-700">
                  {new Date(customer.lastExam).toLocaleDateString()}
                </td>
                <td className="px-4 py-3">
                  <div className="text-sm text-gray-700 max-w-xs" title={customer.prescription}>
                    <div className="truncate">{customer.prescription.split('|')[0].trim()}</div>
                    <div className="text-xs text-gray-500 truncate">{customer.prescription.split('|')[1]?.trim()}</div>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-gray-700">
                  {customer.nextAppointment === 'Overdue' 
                    ? <span className="text-red-600 font-medium">Überfällig</span>
                    : new Date(customer.nextAppointment).toLocaleDateString()
                  }
                </td>
                <td className="px-4 py-3 text-sm text-gray-700">
                  {customer.insurance}
                </td>
                <td className="px-4 py-3">
                  <div className="flex space-x-1">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded ${getStatusColor(customer.status)}`}>
                      {customer.status === 'due' ? 'fällig' : customer.status === 'overdue' ? 'überfällig' : 'aktiv'}
                    </span>
                    {customer.status === 'due' && (
                      <span className="inline-flex px-2 py-1 text-xs font-medium rounded bg-orange-100 text-orange-800">
                        erinnerung
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-gray-700 text-center">
                  {customer.purchaseHistory}
                </td>
                <td className="px-4 py-3 text-right">
                  <button className="text-blue-600 hover:text-blue-800 text-sm mr-3">
                    Anzeigen
                  </button>
                  <button className="text-gray-500 hover:text-gray-700 text-sm">
                    •••
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Pagination */}
      <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-100">
        <div className="flex items-center text-sm text-gray-500">
          <span>Zeige 1-5 von 5 Kunden</span>
        </div>
        <div className="flex items-center space-x-2">
          <button className="px-3 py-1 text-sm text-gray-500 hover:text-gray-700 disabled:opacity-50" disabled>
            Zurück
          </button>
          <button className="px-3 py-1 text-sm bg-blue-50 text-blue-600 rounded">
            1
          </button>
          <button className="px-3 py-1 text-sm text-gray-500 hover:text-gray-700 disabled:opacity-50" disabled>
            Weiter
          </button>
        </div>
      </div>
    </div>
  )
}