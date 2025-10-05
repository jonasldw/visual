'use client'

import { ReactNode } from 'react'
import PageWrapper from '../PageWrapper'
import { useCustomerUI } from '../components/providers/CustomerUIProvider'

interface PageContentProps {
  children: [ReactNode, ReactNode] // [main content, sidebar content]
}

export default function PageContent({ children }: PageContentProps) {
  const { showSlider } = useCustomerUI()

  return <PageWrapper showSidebar={showSlider}>{children}</PageWrapper>
}
