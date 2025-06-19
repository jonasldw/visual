'use client'

import { useState } from 'react'

import { useCustomerModal } from './providers/CustomerModalProvider'

export default function TopBar() {
  const { openCreateModal } = useCustomerModal()
  const [searchQuery, setSearchQuery] = useState('')

  return (
    <div className="bg-white">
      {/* Main Navigation Bar */}
      <div className="border-b border-gray-200 px-6 py-3.25">
        <div className="flex items-center justify-between">
          {/* Left - Breadcrumb */}
          <div className="flex items-center space-x-2 text-sm">
            <div className="flex items-center">
              <div className="w-6 h-6 bg-orange-500 rounded-md flex items-center justify-center mr-3">
                <span className="text-white text-xs font-bold">O</span>
              </div>
              <span className="font-medium text-gray-900">Visual</span>
              <svg className="h-4 w-4 text-gray-400 mx-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
              <span className="text-blue-600 font-medium">Kunden</span>
            </div>
          </div>

          {/* Right - User Profile */}
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-medium">U</span>
            </div>
          </div>
        </div>
      </div>

      {/* Secondary Navigation Bar */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          {/* Search - Full Width */}
          <div className="relative flex-1 mr-4">
            <input
              type="text"
              placeholder="Suchen..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-4 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            />
            <svg
              className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          {/* Right Section */}
          <div className="flex items-center space-x-3">
            <button 
              onClick={openCreateModal}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium"
            >
              <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Neuer Kunde
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}