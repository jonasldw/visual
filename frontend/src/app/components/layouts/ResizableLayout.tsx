'use client'

import { ReactNode } from 'react'
import { PanelGroup, Panel, PanelResizeHandle } from 'react-resizable-panels'
import { GripVertical } from 'lucide-react'

interface ResizableLayoutProps {
  children: [ReactNode, ReactNode] // [main content, sidebar content]
  showSidebar: boolean
  onSidebarCollapse?: () => void
  className?: string
}

export default function ResizableLayout({ 
  children, 
  showSidebar, 
  className = '' 
}: ResizableLayoutProps) {
  const [mainContent, sidebarContent] = children

  if (!showSidebar) {
    return <div className={`flex-1 ${className}`}>{mainContent}</div>
  }

  return (
    <div className={`flex-1 ${className}`}>
      <PanelGroup direction="horizontal" className="h-full">
        <Panel defaultSize={70} minSize={40}>
          {mainContent}
        </Panel>
        
        <PanelResizeHandle className="w-px bg-border hover:bg-blue-500 transition-colors duration-200 relative group">
          <div className="absolute inset-y-0 -left-1 -right-1 flex items-center justify-center">
            <div className="w-3 h-8 bg-border group-hover:bg-blue-500 rounded-sm flex items-center justify-center transition-colors duration-200">
              <GripVertical className="w-2.5 h-2.5 text-muted-foreground group-hover:text-white transition-colors duration-200" />
            </div>
          </div>
        </PanelResizeHandle>
        
        <Panel defaultSize={30} minSize={20} maxSize={70}>
          <div className="h-full flex flex-col bg-white border-l border-primary-dark">
            {sidebarContent}
          </div>
        </Panel>
      </PanelGroup>
    </div>
  )
}