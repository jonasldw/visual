'use client'

import { ReactNode } from 'react'
import ResizableLayout from './components/layouts/ResizableLayout'

interface PageWrapperProps {
  children: [ReactNode, ReactNode] // [main content, sidebar content]
  showSidebar: boolean
}

export default function PageWrapper({ children, showSidebar }: PageWrapperProps) {
  return (
    <ResizableLayout
      showSidebar={showSidebar}
      className="flex flex-col"
    >
      {children}
    </ResizableLayout>
  )
}
