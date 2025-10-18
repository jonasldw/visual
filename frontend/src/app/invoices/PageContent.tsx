'use client'

import { ReactNode } from 'react'
import PageWrapper from '../PageWrapper'
import { useInvoiceUI } from '../components/providers/InvoiceUIProvider'

interface PageContentProps {
  children: [ReactNode, ReactNode]
}

export default function PageContent({ children }: PageContentProps) {
  const { showDetails } = useInvoiceUI()

  return <PageWrapper showSidebar={showDetails}>{children}</PageWrapper>
}
