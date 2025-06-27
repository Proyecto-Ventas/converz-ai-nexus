import { useState, useEffect, useCallback, useRef } from 'react'

/**
 * Custom hook that returns a debounced value
 * @param value - The value to debounce
 * @param delay - The delay in milliseconds
 * @returns The debounced value
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

/**
 * Custom hook that returns a debounced callback function
 * @param callback - The callback function to debounce
 * @param delay - The delay in milliseconds
 * @param deps - The dependencies array for the callback
 * @returns The debounced callback function
 */
export function useDebouncedCallback<Args extends unknown[]>(
  callback: (...args: Args) => void,
  delay: number,
  deps: React.DependencyList = []
): (...args: Args) => void {
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>()

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  return useCallback(
    (...args: Args) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }

      timeoutRef.current = setTimeout(() => {
        callback(...args)
      }, delay)
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [delay, ...deps]
  )
}

/**
 * Custom hook that returns a stateful value and a debounced setter function
 * @param initialValue - The initial value
 * @param delay - The delay in milliseconds
 * @returns A tuple containing the current value, the debounced value, and the setter function
 */
export function useDebouncedState<T>(
  initialValue: T,
  delay: number
): [T, T, (value: T | ((prev: T) => T)) => void] {
  const [value, setValue] = useState<T>(initialValue)
  const debouncedValue = useDebounce(value, delay)

  return [value, debouncedValue, setValue]
}

/**
 * Custom hook that returns a stateful value and a callback to update it after a delay
 * @param initialValue - The initial value
 * @param delay - The delay in milliseconds
 * @returns A tuple containing the current value and the debounced setter function
 */
export function useDebounceState<T>(
  initialValue: T,
  delay: number
): [T, (value: T | ((prev: T) => T), immediate?: boolean) => void] {
  const [value, setValue] = useState<T>(initialValue)
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>()

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  const setDebouncedValue = useCallback(
    (newValue: T | ((prev: T) => T), immediate = false) => {
      // If immediate is true, update the value immediately
      if (immediate) {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current)
          timeoutRef.current = undefined
        }
        setValue(newValue)
        return
      }

      // Otherwise, debounce the update
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }

      timeoutRef.current = setTimeout(() => {
        setValue(newValue)
        timeoutRef.current = undefined
      }, delay)
    },
    [delay]
  )

  return [value, setDebouncedValue]
}
