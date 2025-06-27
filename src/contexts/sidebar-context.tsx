import * as React from 'react'
import { createContext, useContext, useState, useEffect } from 'react'

type SidebarContextType = {
  isOpen: boolean
  isMobile: boolean
  toggleSidebar: () => void
  openSidebar: () => void
  closeSidebar: () => void
  setOpen: (open: boolean) => void
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined)

/**
 * Provider for managing the sidebar state
 */
export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(true)
  const [isMobile, setIsMobile] = useState(false)

  // Check if the screen is mobile on mount and on resize
  useEffect(() => {
    const checkIfMobile = () => {
      const mobile = window.innerWidth < 1024 // lg breakpoint
      setIsMobile(mobile)
      
      // Close sidebar by default on mobile
      if (mobile) {
        setIsOpen(false)
      } else {
        setIsOpen(true)
      }
    }


    // Initial check
    checkIfMobile()

    // Add event listener
    window.addEventListener('resize', checkIfMobile)


    // Cleanup
    return () => window.removeEventListener('resize', checkIfMobile)
  }, [])

  const toggleSidebar = () => {
    setIsOpen(!isOpen)
  }

  const openSidebar = () => {
    setIsOpen(true)
  }

  const closeSidebar = () => {
    setIsOpen(false)
  }

  const setOpen = (open: boolean) => {
    setIsOpen(open)
  }

  return (
    <SidebarContext.Provider
      value={{
        isOpen,
        isMobile,
        toggleSidebar,
        openSidebar,
        closeSidebar,
        setOpen,
      }}
    >
      {children}
    </SidebarContext.Provider>
  )
}

/**
 * Hook to use the sidebar context
 * @returns The sidebar context
 */
export function useSidebar() {
  const context = useContext(SidebarContext)
  if (context === undefined) {
    throw new Error('useSidebar must be used within a SidebarProvider')
  }
  return context
}
