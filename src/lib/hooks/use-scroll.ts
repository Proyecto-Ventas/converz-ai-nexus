import { useState, useEffect, useCallback, useRef } from 'react'

interface ScrollPosition {
  x: number
  y: number
  direction: 'up' | 'down' | null
  scrollX: number
  scrollY: number
  scrollXProgress: number
  scrollYProgress: number
  scrollDirection: 'left' | 'right' | null
}

interface ScrollOptions {
  /** The element to track scroll position for. Defaults to window. */
  element?: HTMLElement | Window | Document | null
  /** Whether to track scroll position. Defaults to true. */
  enabled?: boolean
  /** Debounce time in milliseconds. Defaults to 0 (no debounce). */
  debounce?: number
  /** Throttle time in milliseconds. Defaults to 0 (no throttle). */
  throttle?: number
  /** Callback function to be called on scroll. */
  onScroll?: (position: Omit<ScrollPosition, 'direction' | 'scrollDirection'>) => void
}

/**
 * Custom hook that tracks scroll position and direction
 * @param options - Configuration options
 * @returns The current scroll position and direction
 */
export function useScroll(options: ScrollOptions = {}): ScrollPosition {
  const {
    element,
    enabled = true,
    debounce: debounceTime = 0,
    throttle: throttleTime = 0,
    onScroll,
  } = options

  const [scrollPosition, setScrollPosition] = useState<Omit<ScrollPosition, 'direction' | 'scrollDirection'>>({
    x: 0,
    y: 0,
    scrollX: 0,
    scrollY: 0,
    scrollXProgress: 0,
    scrollYProgress: 0,
  })
  
  const [direction, setDirection] = useState<'up' | 'down' | null>(null)
  const [scrollDirection, setScrollDirection] = useState<'left' | 'right' | null>(null)
  
  const lastScrollY = useRef(0)
  const lastScrollX = useRef(0)
  const animationFrameId = useRef<number>()
  const timeoutId = useRef<NodeJS.Timeout>()
  const ticking = useRef(false)
  const scrollElement = useRef<HTMLElement | Window | Document | null>(null)

  // Update the scroll element reference when the element prop changes
  useEffect(() => {
    if (typeof document === 'undefined') return
    
    scrollElement.current = element || window
    
    // If element is a ref, use its current value
    if (element && 'current' in element) {
      scrollElement.current = element.current
    }
    
    return () => {
      scrollElement.current = null
    }
  }, [element])

  // Handle scroll event
  const handleScroll = useCallback(() => {
    if (!enabled || !scrollElement.current) return
    
    // Get the scroll element (window or a DOM element)
    const target = scrollElement.current === document ? document.documentElement : scrollElement.current
    
    // Get scroll position
    const scrollX = target === window ? window.scrollX : (target as HTMLElement).scrollLeft
    const scrollY = target === window ? window.scrollY : (target as HTMLElement).scrollTop
    
    // Calculate scroll progress (0 to 1)
    const scrollHeight = target === window 
      ? document.documentElement.scrollHeight - document.documentElement.clientHeight
      : (target as HTMLElement).scrollHeight - (target as HTMLElement).clientHeight
      
    const scrollWidth = target === window
      ? document.documentElement.scrollWidth - document.documentElement.clientWidth
      : (target as HTMLElement).scrollWidth - (target as HTMLElement).clientWidth
    
    const scrollXProgress = scrollWidth > 0 ? Math.min(scrollX / scrollWidth, 1) : 0
    const scrollYProgress = scrollHeight > 0 ? Math.min(scrollY / scrollHeight, 1) : 0
    
    // Update direction
    if (scrollY !== lastScrollY.current) {
      setDirection(scrollY > lastScrollY.current ? 'down' : 'up')
      lastScrollY.current = scrollY > 0 ? scrollY : 0
    }
    
    if (scrollX !== lastScrollX.current) {
      setScrollDirection(scrollX > lastScrollX.current ? 'right' : 'left')
      lastScrollX.current = scrollX > 0 ? scrollX : 0
    }
    
    // Update scroll position
    const newPosition = {
      x: scrollX,
      y: scrollY,
      scrollX,
      scrollY,
      scrollXProgress,
      scrollYProgress,
    }
    
    setScrollPosition(newPosition)
    
    // Call onScroll callback if provided
    if (onScroll) {
      onScroll(newPosition)
    }
    
    ticking.current = false
  }, [enabled, onScroll])

  // Throttle function
  const throttle = useCallback((callback: () => void, delay: number) => {
    if (ticking.current) return
    
    ticking.current = true
    
    if (throttleTime) {
      animationFrameId.current = requestAnimationFrame(() => {
        callback()
        setTimeout(() => {
          ticking.current = false
        }, delay)
      })
    } else {
      animationFrameId.current = requestAnimationFrame(() => {
        callback()
        ticking.current = false
      })
    }
  }, [throttleTime])

  // Debounce function
  const debounce = useCallback((callback: () => void, delay: number) => {
    if (timeoutId.current) {
      clearTimeout(timeoutId.current)
    }
    
    timeoutId.current = setTimeout(() => {
      callback()
    }, delay)
  }, [])

  // Add scroll event listener
  useEffect(() => {
    if (!enabled || !scrollElement.current) return
    
    const target = scrollElement.current === document ? window : scrollElement.current
    
    const handleScrollEvent = () => {
      if (debounceTime > 0) {
        debounce(handleScroll, debounceTime)
      } else if (throttleTime > 0) {
        throttle(handleScroll, throttleTime)
      } else {
        handleScroll()
      }
    }
    
    // Initial scroll position
    handleScroll()
    
    // Add event listener
    target.addEventListener('scroll', handleScrollEvent, { passive: true })
    
    // Clean up
    return () => {
      target.removeEventListener('scroll', handleScrollEvent)
      
      if (timeoutId.current) {
        clearTimeout(timeoutId.current)
      }
      
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current)
      }
    }
  }, [enabled, debounce, debounceTime, handleScroll, throttle, throttleTime])

  return {
    ...scrollPosition,
    direction,
    scrollDirection,
  }
}

/**
 * Custom hook that returns a boolean indicating if the user has scrolled past a certain point
 * @param offset - The offset from the top of the page in pixels
 * @param options - Scroll options
 * @returns A boolean indicating if the user has scrolled past the offset
 */
export function useScrolled(offset: number = 0, options: Omit<ScrollOptions, 'onScroll'> = {}): boolean {
  const [scrolled, setScrolled] = useState(false)
  
  useScroll({
    ...options,
    onScroll: ({ y }) => {
      setScrolled(y > offset)
    },
  })
  
  return scrolled
}

/**
 * Custom hook that returns the scroll progress (0 to 1) of the page or element
 * @param options - Scroll options
 * @returns The scroll progress (0 to 1)
 */
export function useScrollProgress(options: Omit<ScrollOptions, 'onScroll'> = {}): number {
  const [progress, setProgress] = useState(0)
  
  useScroll({
    ...options,
    onScroll: ({ scrollYProgress }) => {
      setProgress(scrollYProgress)
    },
  })
  
  return progress
}

/**
 * Custom hook that returns the scroll direction ('up' or 'down')
 * @param options - Scroll options
 * @returns The scroll direction ('up' or 'down')
 */
export function useScrollDirection(options: Omit<ScrollOptions, 'onScroll'> = {}): 'up' | 'down' | null {
  const [direction, setDirection] = useState<'up' | 'down' | null>(null)
  
  useScroll({
    ...options,
    onScroll: ({ y }, prevY) => {
      if (y > prevY) {
        setDirection('down')
      } else if (y < prevY) {
        setDirection('up')
      }
    },
  })
  
  return direction
}

/**
 * Custom hook that returns a ref to an element and a boolean indicating if it's in the viewport
 * @param options - Intersection Observer options
 * @returns A tuple containing the ref and a boolean indicating if the element is in the viewport
 */
export function useInViewport(
  options: IntersectionObserverInit = {}
): [React.RefObject<Element>, boolean] {
  const [inViewport, setInViewport] = useState(false)
  const ref = useRef<Element>(null)
  
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      setInViewport(entry.isIntersecting)
    }, {
      root: null,
      rootMargin: '0px',
      threshold: 0.1,
      ...options,
    })
    
    if (ref.current) {
      observer.observe(ref.current)
    }
    
    return () => {
      if (ref.current) {
        observer.unobserve(ref.current)
      }
    }
  }, [options])
  
  return [ref, inViewport]
}
