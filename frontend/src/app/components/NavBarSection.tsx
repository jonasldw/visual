'use client'

import { ReactNode } from 'react'

interface NavBarSectionProps {
  title: string
  isOpen: boolean
  onToggle: () => void
  children: ReactNode
  isCollapsed?: boolean
}

export default function NavBarSection({ 
  title, 
  isOpen, 
  onToggle, 
  children, 
  isCollapsed = false 
}: NavBarSectionProps) {
  if (isCollapsed) {
    return null
  }

  return (
    <div className="mt-6">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-4 py-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
      >
        <div className="flex items-center space-x-2">
          <svg 
            className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-90' : ''}`} 
            fill="currentColor" 
            viewBox="0 0 20 20"
          >
            <path 
              fillRule="evenodd" 
              d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" 
              clipRule="evenodd" 
            />
          </svg>
          <span className="font-medium">{title}</span>
        </div>
      </button>
      {isOpen && (
        <div className="px-4 space-y-1 mt-1">
          {children}
        </div>
      )}
    </div>
  )
}