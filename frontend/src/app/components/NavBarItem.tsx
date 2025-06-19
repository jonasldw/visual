'use client'

import Link from 'next/link'
import { ReactNode } from 'react'

interface NavBarItemProps {
  href: string
  icon: ReactNode
  label: string
  isActive?: boolean
  badge?: string | number
  isCollapsed?: boolean
  indent?: boolean
  onClick?: () => void
}

export default function NavBarItem({ 
  href, 
  icon, 
  label, 
  isActive = false, 
  badge, 
  isCollapsed = false,
  indent = false,
  onClick 
}: NavBarItemProps) {
  const baseClasses = "flex items-center py-2 px-3 text-sm transition-colors rounded-lg"
  const activeClasses = isActive 
    ? "text-gray-700 bg-[#EEEFF1]" 
    : "text-gray-700 hover:bg-gray-100"
  const indentClasses = indent ? "pl-9" : "py-1"
  
  const content = (
    <>
      <div className="w-6 h-6 flex items-center justify-center mr-3">
        <span className={`${isActive ? 'text-gray-700' : 'text-gray-500'}`}>
          {icon}
        </span>
      </div>
      {!isCollapsed && (
        <>
          <span className="flex-1">{label}</span>
          {badge && (
            <span className="ml-auto bg-blue-100 text-blue-800 text-xs font-medium px-2 py-0.5 rounded-full">
              {badge}
            </span>
          )}
        </>
      )}
    </>
  )

  if (onClick) {
    return (
      <button
        onClick={onClick}
        className={`w-full ${baseClasses} ${activeClasses} ${indentClasses}`}
      >
        {content}
      </button>
    )
  }

  return (
    <Link
      href={href}
      className={`${baseClasses} ${activeClasses} ${indentClasses}`}
    >
      {content}
    </Link>
  )
}