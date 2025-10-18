'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useCustomerModal } from './providers/CustomerUIProvider'
import { useProductUI } from './providers/ProductModalProvider'
import { Button } from './ui/Button'

// Page configuration for dynamic behavior
const pageConfig = {
  '/': {
    title: 'Kunden',
    buttonText: 'Neuer Kunde',
    useModalHook: () => useCustomerModal(),
    searchPlaceholder: 'Kunden suchen...'
  },
  '/products': {
    title: 'Produkte',
    buttonText: 'Neues Produkt',
    useModalHook: () => useProductUI(),
    searchPlaceholder: 'Produkte suchen...'
  }
}

export default function TopBar() {
  const pathname = usePathname()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '')
  
  // Get current page configuration
  const currentPageConfig = pageConfig[pathname as keyof typeof pageConfig] || pageConfig['/']
  const { openCreateModal } = currentPageConfig.useModalHook()

  // Debounce search updates
  useEffect(() => {
    const timer = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString())
      
      if (searchQuery) {
        params.set('search', searchQuery)
        params.set('page', '1') // Reset to first page on new search
      } else {
        params.delete('search')
      }
      
      router.push(`${pathname}?${params.toString()}`)
    }, 100) // 300ms debounce

    return () => clearTimeout(timer)
  }, [searchQuery, pathname, router, searchParams])

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
              <span className="text-blue-600 font-medium">{currentPageConfig.title}</span>
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
      <div className="px-3.25 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          {/* Search - Full Width */}
          <div className="relative flex-1 mr-4">
            <input
              type="text"
              placeholder={currentPageConfig.searchPlaceholder}
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
            <Button
              variant="primary"
              onClick={openCreateModal}
            >
              <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              {currentPageConfig.buttonText}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}