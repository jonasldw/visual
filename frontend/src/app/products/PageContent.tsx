'use client'

import { ReactNode } from 'react'
import PageWrapper from '../PageWrapper'
import { useProductUI } from '../components/providers/ProductModalProvider'

interface PageContentProps {
  children: [ReactNode, ReactNode]
}

export default function PageContent({ children }: PageContentProps) {
  const { showSlider } = useProductUI()

  return <PageWrapper showSidebar={showSlider}>{children}</PageWrapper>
}
