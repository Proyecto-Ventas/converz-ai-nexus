import { useState, useEffect, useCallback } from 'react'

type Breakpoint = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'

const breakpoints: Record<Breakpoint, string> = {
  'xs': '(min-width: 0px)',
  'sm': '(min-width: 640px)',
  'md': '(min-width: 768px)',
  'lg': '(min-width: 1024px)',
  'xl': '(min-width: 1280px)',
  '2xl': '(min-width: 1536px)',
}

const breakpointValues: Record<Breakpoint, number> = {
  'xs': 0,
  'sm': 640,
  'md': 768,
  'lg': 1024,
  'xl': 1280,
  '2xl': 1536,
}

/**
 * Custom hook that returns a boolean indicating if the current viewport matches the given media query
 * @param query - The media query to match (e.g., '(min-width: 768px)')
 * @returns A boolean indicating if the media query matches
 */
export function useMediaQuery(query: string): boolean {
  const getMatches = useCallback((query: string): boolean => {
    // Prevent build error during server-side rendering
    if (typeof window === 'undefined') {
      return false
    }
    return window.matchMedia(query).matches
  }, [])

  const [matches, setMatches] = useState<boolean>(() => getMatches(query))

  useEffect(() => {
    const mediaQuery = window.matchMedia(query)
    
    // Update the state with the current value
    const handler = (event: MediaQueryListEvent) => setMatches(event.matches)
    
    // Trigger at the first client-side load
    setMatches(mediaQuery.matches)
    
    // Add listener for changes
    mediaQuery.addEventListener('change', handler)
    
    // Clean up
    return () => mediaQuery.removeEventListener('change', handler)
  }, [query])

  return matches
}

/**
 * Custom hook that returns a boolean indicating if the current viewport is at least as wide as the given breakpoint
 * @param breakpoint - The breakpoint to check against (e.g., 'md')
 * @returns A boolean indicating if the viewport is at least as wide as the breakpoint
 */
export function useBreakpoint(breakpoint: Breakpoint): boolean {
  const query = breakpoints[breakpoint] || breakpoints.md
  return useMediaQuery(query)
}

/**
 * Custom hook that returns the name of the current breakpoint
 * @returns The name of the current breakpoint (e.g., 'md')
 */
export function useCurrentBreakpoint(): Breakpoint {
  const [breakpoint, setBreakpoint] = useState<Breakpoint>('xs')
  
  useEffect(() => {
    const checkBreakpoint = () => {
      const breakpointKeys = Object.keys(breakpoints) as Breakpoint[]
      
      // Find the largest breakpoint that matches
      let currentBreakpoint: Breakpoint = 'xs'
      
      for (const key of breakpointKeys) {
        if (window.matchMedia(breakpoints[key]).matches) {
          currentBreakpoint = key
        }
      }
      
      setBreakpoint(currentBreakpoint)
    }
    
    // Initial check
    checkBreakpoint()
    
    // Add event listener
    window.addEventListener('resize', checkBreakpoint)
    
    // Clean up
    return () => window.removeEventListener('resize', checkBreakpoint)
  }, [])
  
  return breakpoint
}

/**
 * Custom hook that returns the current viewport width
 * @returns The current viewport width in pixels
 */
export function useViewportWidth(): number {
  const [width, setWidth] = useState<number>(() => {
    if (typeof window === 'undefined') return 0
    return window.innerWidth
  })
  
  useEffect(() => {
    const handleResize = () => {
      setWidth(window.innerWidth)
    }
    
    // Initial set
    handleResize()
    
    // Add event listener
    window.addEventListener('resize', handleResize)
    
    // Clean up
    return () => window.removeEventListener('resize', handleResize)
  }, [])
  
  return width
}

/**
 * Custom hook that returns the current viewport height
 * @returns The current viewport height in pixels
 */
export function useViewportHeight(): number {
  const [height, setHeight] = useState<number>(() => {
    if (typeof window === 'undefined') return 0
    return window.innerHeight
  })
  
  useEffect(() => {
    const handleResize = () => {
      setHeight(window.innerHeight)
    }
    
    // Initial set
    handleResize()
    
    // Add event listener
    window.addEventListener('resize', handleResize)
    
    // Clean up
    return () => window.removeEventListener('resize', handleResize)
  }, [])
  
  return height
}

/**
 * Custom hook that returns the current orientation (portrait or landscape)
 * @returns 'portrait' or 'landscape'
 */
export function useOrientation(): 'portrait' | 'landscape' {
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>(
    typeof window !== 'undefined' && window.matchMedia('(orientation: portrait)').matches 
      ? 'portrait' 
      : 'landscape'
  )
  
  useEffect(() => {
    const mediaQuery = window.matchMedia('(orientation: portrait)')
    
    const handleOrientationChange = (e: MediaQueryListEvent) => {
      setOrientation(e.matches ? 'portrait' : 'landscape')
    }
    
    // Add listener
    mediaQuery.addEventListener('change', handleOrientationChange)
    
    // Clean up
    return () => mediaQuery.removeEventListener('change', handleOrientationChange)
  }, [])
  
  return orientation
}

/**
 * Custom hook that returns a boolean indicating if the current viewport is in dark mode
 * @returns A boolean indicating if dark mode is active
 */
export function useDarkMode(): boolean {
  const [isDark, setIsDark] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  })
  
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    
    const handleChange = (e: MediaQueryListEvent) => {
      setIsDark(e.matches)
    }
    
    // Add listener
    mediaQuery.addEventListener('change', handleChange)
    
    // Clean up
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])
  
  return isDark
}
