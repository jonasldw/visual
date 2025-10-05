'use client'

import { ReactNode, useEffect } from 'react'
import { Button } from './ui/Button'
import { Backdrop } from './ui/Backdrop'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: ReactNode
}

export default function Modal({ isOpen, onClose, title, children }: ModalProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
        <Backdrop onClick={onClose} blur="xs" opacity={50} />

        {/* Modal */}
        <div className="relative z-10 transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
          {/* Header */}
          <div className="bg-white px-4 py-3 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-normal text-secondary-default">
                {title}
              </h3>
              <Button
                size="icon"
                variant="ghost"
                onClick={onClose}
                iconName="X"
                className="text-gray-400 hover:text-gray-500"
              >
                <span className="sr-only">Schließen</span>
              </Button>
            </div>
          </div>
          
          {/* Content */}
          <div className="bg-white px-4 py-4">
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}