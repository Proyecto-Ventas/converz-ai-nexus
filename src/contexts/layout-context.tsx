import * as React from 'react'
import { createContext, useContext, useState, useEffect } from 'react'

// Types
type LayoutVariant = 'default' | 'compact' | 'comfortable'
type ColorScheme = 'light' | 'dark' | 'system'

type LayoutContextType = {
  // Layout
  layout: LayoutVariant
  setLayout: (layout: LayoutVariant) => void
  // Color scheme
  colorScheme: ColorScheme
  setColorScheme: (scheme: ColorScheme) => void
  // Sidebar
  sidebarWidth: number
  setSidebarWidth: (width: number) => void
  // Header
  headerHeight: number
  setHeaderHeight: (height: number) => void
  // Footer
  footerHeight: number
  setFooterHeight: (height: number) => void
  // Content padding
  contentPadding: number
  setContentPadding: (padding: number) => void
  // Mobile breakpoint
  mobileBreakpoint: number
  setMobileBreakpoint: (breakpoint: number) => void
  // Is mobile
  isMobile: boolean
  // Is loading
  isLoading: boolean
  setIsLoading: (loading: boolean) => void
}

// Default values
const DEFAULT_LAYOUT: LayoutVariant = 'default'
const DEFAULT_COLOR_SCHEME: ColorScheme = 'system'
const DEFAULT_SIDEBAR_WIDTH = 250
const DEFAULT_HEADER_HEIGHT = 64
const DEFAULT_FOOTER_HEIGHT = 64
const DEFAULT_CONTENT_PADDING = 24
const DEFAULT_MOBILE_BREAKPOINT = 1024

// Create context
const LayoutContext = createContext<LayoutContextType | undefined>(undefined)

/**
 * Provider for managing the layout state
 */
export function LayoutProvider({ children }: { children: React.ReactNode }) {
  // State
  const [layout, setLayout] = useState<LayoutVariant>(DEFAULT_LAYOUT)
  const [colorScheme, setColorScheme] = useState<ColorScheme>(DEFAULT_COLOR_SCHEME)
  const [sidebarWidth, setSidebarWidth] = useState(DEFAULT_SIDEBAR_WIDTH)
  const [headerHeight, setHeaderHeight] = useState(DEFAULT_HEADER_HEIGHT)
  const [footerHeight, setFooterHeight] = useState(DEFAULT_FOOTER_HEIGHT)
  const [contentPadding, setContentPadding] = useState(DEFAULT_CONTENT_PADDING)
  const [mobileBreakpoint, setMobileBreakpoint] = useState(DEFAULT_MOBILE_BREAKPOINT)
  const [isMobile, setIsMobile] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // Check if the screen is mobile on mount and on resize
  useEffect(() => {
    const checkIfMobile = () => {
      const mobile = window.innerWidth < mobileBreakpoint
      setIsMobile(mobile)
    }


    // Initial check
    checkIfMobile()

    // Add event listener
    window.addEventListener('resize', checkIfMobile)


    // Cleanup
    return () => window.removeEventListener('resize', checkIfMobile)
  }, [mobileBreakpoint])

  // Apply color scheme to document
  useEffect(() => {
    const root = window.document.documentElement
    
    // Remove all color scheme classes
    root.classList.remove('light', 'dark')
    
    if (colorScheme === 'system') {
      const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      root.classList.add(systemPrefersDark ? 'dark' : 'light')
    } else {
      root.classList.add(colorScheme)
    }
  }, [colorScheme])

  // Apply layout class to document
  useEffect(() => {
    const root = window.document.documentElement
    
    // Remove all layout classes
    root.classList.remove('layout-default', 'layout-compact', 'layout-comfortable')
    
    // Add current layout class
    root.classList.add(`layout-${layout}`)
  }, [layout])

  // Set CSS custom properties for layout
  useEffect(() => {
    const root = document.documentElement
    root.style.setProperty('--sidebar-width', `${sidebarWidth}px`)
    root.style.setProperty('--header-height', `${headerHeight}px`)
    root.style.setProperty('--footer-height', `${footerHeight}px`)
    root.style.setProperty('--content-padding', `${contentPadding}px`)
  }, [sidebarWidth, headerHeight, footerHeight, contentPadding])

  // Initial load
  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  // Context value
  const value = {
    // Layout
    layout,
    setLayout,
    // Color scheme
    colorScheme,
    setColorScheme,
    // Sidebar
    sidebarWidth,
    setSidebarWidth,
    // Header
    headerHeight,
    setHeaderHeight,
    // Footer
    footerHeight,
    setFooterHeight,
    // Content padding
    contentPadding,
    setContentPadding,
    // Mobile breakpoint
    mobileBreakpoint,
    setMobileBreakpoint,
    // Is mobile
    isMobile,
    // Loading
    isLoading,
    setIsLoading,
  }


  return (
    <LayoutContext.Provider value={value}>
      {children}
    </LayoutContext.Provider>
  )
}

/**
 * Hook to use the layout context
 * @returns The layout context
 */
export function useLayout() {
  const context = useContext(LayoutContext)
  if (context === undefined) {
    throw new Error('useLayout must be used within a LayoutProvider')
  }
  return context
}

/**
 * Higher-order component to provide layout context
 */
export function withLayout<T>(Component: React.ComponentType<T>) {
  return function WithLayout(props: T) {
    return (
      <LayoutProvider>
        <Component {...props as any} />
      </LayoutProvider>
    )
  }
}
