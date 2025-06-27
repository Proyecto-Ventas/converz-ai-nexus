import { RefObject, useEffect, useRef } from 'react'

type Event = MouseEvent | TouchEvent

/**
 * Custom hook that triggers a callback when a click occurs outside of the specified element
 * @param ref - The ref object of the element to detect outside clicks
 * @param handler - The callback function to execute when a click outside occurs
 * @param enabled - Whether the event listener is active
 */
export function useOnClickOutside<T extends HTMLElement = HTMLElement>(
  ref: RefObject<T>,
  handler: (event: Event) => void,
  enabled: boolean = true
) {
  const savedHandler = useRef(handler)

  // Update the handler if it changes
  useEffect(() => {
    savedHandler.current = handler
  }, [handler])

  useEffect(() => {
    if (!enabled) return

    const listener = (event: Event) => {
      // Do nothing if clicking ref's element or descendent elements
      if (!ref.current || ref.current.contains(event.target as Node)) {
        return
      }
      savedHandler.current(event)
    }

    // Add event listeners
    document.addEventListener('mousedown', listener as EventListener)
    document.addEventListener('touchstart', listener as EventListener)

    // Clean up
    return () => {
      document.removeEventListener('mousedown', listener as EventListener)
      document.removeEventListener('touchstart', listener as EventListener)
    }
  }, [ref, enabled])
}

/**
 * Custom hook that returns a ref and a state indicating whether the element is clicked outside
 * @param handler - The callback function to execute when a click outside occurs
 * @param enabled - Whether the event listener is active
 * @returns A tuple containing the ref and a boolean indicating if clicked outside
 */
export function useClickOutside<T extends HTMLElement = HTMLElement>(
  handler: (event: Event) => void,
  enabled: boolean = true
): [React.RefObject<T>, boolean] {
  const ref = useRef<T>(null)
  const [isOutside, setIsOutside] = useState(false)

  useOnClickOutside(
    ref,
    (event) => {
      setIsOutside(true)
      handler(event)
    },
    enabled
  )

  // Reset isOutside when the element is clicked
  useEffect(() => {
    if (!ref.current) return

    const handleClick = () => {
      setIsOutside(false)
    }

    const element = ref.current
    element.addEventListener('click', handleClick)

    return () => {
      element.removeEventListener('click', handleClick)
    }
  }, [])

  return [ref, isOutside]
}

// Re-export with a more descriptive name
export { useOnClickOutside as useClickOutsideListener }
