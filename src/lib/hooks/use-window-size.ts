import { useState, useEffect, useCallback } from 'react'

interface WindowSize {
  width: number
  height: number
  isMobile: boolean
  isTablet: boolean
  isDesktop: boolean
  isLargeDesktop: boolean
  breakpoint: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'
  orientation: 'portrait' | 'landscape'
  isLandscape: boolean
  isPortrait: boolean
  pixelRatio: number
  isRetina: boolean
}

/**
 * Custom hook that returns the current window size and other viewport information
 * @param options - Configuration options
 * @returns The current window size and viewport information
 */
export function useWindowSize(options: {
  /** Whether to listen for window resize events. Defaults to true. */
  listen?: boolean
  /** The debounce time in milliseconds for the resize event. Defaults to 100. */
  debounce?: number
  /** The throttle time in milliseconds for the resize event. Defaults to 0 (no throttle). */
  throttle?: number
} = {}): WindowSize {
  const { listen = true, debounce: debounceTime = 100, throttle: throttleTime = 0 } = options
  
  const getSize = useCallback((): Omit<WindowSize, 'breakpoint'> => {
    if (typeof window === 'undefined') {
      return {
        width: 0,
        height: 0,
        isMobile: false,
        isTablet: false,
        isDesktop: false,
        isLargeDesktop: false,
        orientation: 'portrait',
        isLandscape: false,
        isPortrait: true,
        pixelRatio: 1,
        isRetina: false,
      }
    }
    
    const width = window.innerWidth
    const height = window.innerHeight
    const pixelRatio = window.devicePixelRatio || 1
    
    const isLandscape = width > height
    const orientation = isLandscape ? 'landscape' : 'portrait'
    
    // Common device breakpoints (can be customized)
    const isMobile = width < 640
    const isTablet = width >= 640 && width < 1024
    const isDesktop = width >= 1024 && width < 1280
    const isLargeDesktop = width >= 1280
    
    return {
      width,
      height,
      isMobile,
      isTablet,
      isDesktop,
      isLargeDesktop,
      orientation,
      isLandscape,
      isPortrait: !isLandscape,
      pixelRatio,
      isRetina: pixelRatio >= 2,
    }
  }, [])
  
  const [windowSize, setWindowSize] = useState(getSize)
  const [breakpoint, setBreakpoint] = useState<'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'>('xs')
  
  // Update breakpoint based on window width
  useEffect(() => {
    const updateBreakpoint = () => {
      const { width } = getSize()
      
      if (width < 640) return setBreakpoint('xs')
      if (width < 768) return setBreakpoint('sm')
      if (width < 1024) return setBreakpoint('md')
      if (width < 1280) return setBreakpoint('lg')
      if (width < 1536) return setBreakpoint('xl')
      return setBreakpoint('2xl')
    }
    
    updateBreakpoint()
  }, [getSize])
  
  // Handle window resize with debounce and/or throttle
  useEffect(() => {
    if (!listen || typeof window === 'undefined') return
    
    let timeoutId: NodeJS.Timeout
    let animationFrameId: number
    let ticking = false
    
    const handleResize = () => {
      // Use debounce
      if (debounceTime > 0) {
        clearTimeout(timeoutId)
        timeoutId = setTimeout(() => {
          setWindowSize(getSize())
        }, debounceTime)
        return
      }
      
      // Use throttle
      if (throttleTime > 0) {
        if (!ticking) {
          animationFrameId = requestAnimationFrame(() => {
            setWindowSize(getSize())
            ticking = false
            
            if (throttleTime > 0) {
              setTimeout(() => {
                ticking = false
              }, throttleTime)
            }
          })
          ticking = true
        }
        return
      }
      
      // No debounce or throttle
      setWindowSize(getSize())
    }
    
    window.addEventListener('resize', handleResize, { passive: true })
    
    // Initial call to set size
    setWindowSize(getSize())
    
    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize)
      clearTimeout(timeoutId)
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId)
      }
    }
  }, [listen, debounceTime, throttleTime, getSize])
  
  return {
    ...windowSize,
    breakpoint,
  }
}

/**
 * Custom hook that returns a boolean indicating if the viewport is mobile-sized
 * @param maxWidth - The maximum width in pixels to be considered mobile. Defaults to 767.
 * @returns A boolean indicating if the viewport is mobile-sized
 */
export function useIsMobile(maxWidth: number = 767): boolean {
  const [isMobile, setIsMobile] = useState(false)
  
  useEffect(() => {
    if (typeof window === 'undefined') return
    
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth <= maxWidth)
    }
    
    // Initial check
    checkIfMobile()
    
    // Add event listener
    window.addEventListener('resize', checkIfMobile)
    
    // Clean up
    return () => window.removeEventListener('resize', checkIfMobile)
  }, [maxWidth])
  
  return isMobile
}

/**
 * Custom hook that returns a boolean indicating if the viewport is tablet-sized
 * @param minWidth - The minimum width in pixels to be considered tablet. Defaults to 768.
 * @param maxWidth - The maximum width in pixels to be considered tablet. Defaults to 1023.
 * @returns A boolean indicating if the viewport is tablet-sized
 */
export function useIsTablet(
  minWidth: number = 768,
  maxWidth: number = 1023
): boolean {
  const [isTablet, setIsTablet] = useState(false)
  
  useEffect(() => {
    if (typeof window === 'undefined') return
    
    const checkIfTablet = () => {
      const width = window.innerWidth
      setIsTablet(width >= minWidth && width <= maxWidth)
    }
    
    // Initial check
    checkIfTablet()
    
    // Add event listener
    window.addEventListener('resize', checkIfTablet)
    
    // Clean up
    return () => window.removeEventListener('resize', checkIfTablet)
  }, [minWidth, maxWidth])
  
  return isTablet
}

/**
 * Custom hook that returns a boolean indicating if the viewport is desktop-sized
 * @param minWidth - The minimum width in pixels to be considered desktop. Defaults to 1024.
 * @returns A boolean indicating if the viewport is desktop-sized
 */
export function useIsDesktop(minWidth: number = 1024): boolean {
  const [isDesktop, setIsDesktop] = useState(false)
  
  useEffect(() => {
    if (typeof window === 'undefined') return
    
    const checkIfDesktop = () => {
      setIsDesktop(window.innerWidth >= minWidth)
    }
    
    // Initial check
    checkIfDesktop()
    
    // Add event listener
    window.addEventListener('resize', checkIfDesktop)
    
    // Clean up
    return () => window.removeEventListener('resize', checkIfDesktop)
  }, [minWidth])
  
  return isDesktop
}

/**
 * Custom hook that returns the current pixel ratio of the device
 * @returns The current device pixel ratio
 */
export function usePixelRatio(): number {
  const [pixelRatio, setPixelRatio] = useState(
    typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1
  )
  
  useEffect(() => {
    if (typeof window === 'undefined') return
    
    const updatePixelRatio = () => {
      setPixelRatio(window.devicePixelRatio || 1)
    }
    
    // Listen for changes in pixel ratio (happens when moving between displays with different DPI)
    const mediaQuery = window.matchMedia(`(resolution: ${window.devicePixelRatio}dppx)`)
    mediaQuery.addEventListener('change', updatePixelRatio)
    
    // Initial check
    updatePixelRatio()
    
    // Clean up
    return () => {
      mediaQuery.removeEventListener('change', updatePixelRatio)
    }
  }, [])
  
  return pixelRatio
}

/**
 * Custom hook that returns a boolean indicating if the device has a retina display
 * @returns A boolean indicating if the device has a retina display
 */
export function useIsRetina(): boolean {
  const pixelRatio = usePixelRatio()
  return pixelRatio >= 2
}
