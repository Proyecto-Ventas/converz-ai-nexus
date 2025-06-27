import { useState, useEffect, useCallback, Dispatch, SetStateAction } from 'react'

type SetValue<T> = Dispatch<SetStateAction<T>>
type Options = {
  /** Whether to sync changes across tabs */
  sync?: boolean
  /** Whether to parse the stored JSON with a reviver function */
  reviver?: (key: string, value: any) => any
  /** Whether to log debug information */
  debug?: boolean
}

/**
 * Custom hook that persists state to localStorage
 * @param key - The key to use in localStorage
 * @param initialValue - The initial value
 * @param options - Additional options
 * @returns A tuple containing the stored value and a function to update it
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T,
  options: Options = {}
): [T, SetValue<T>] {
  const { sync = true, reviver, debug = false } = options
  
  // Get from local storage then parse stored json or return initialValue
  const readValue = useCallback((): T => {
    // Prevent build error "window is undefined" but keep working
    if (typeof window === 'undefined') {
      return initialValue
    }

    try {
      const item = window.localStorage.getItem(key)
      return item ? JSON.parse(item, reviver) : initialValue
    } catch (error) {
      if (debug) {
        console.warn(`Error reading localStorage key "${key}":`, error)
      }
      return initialValue
    }
  }, [initialValue, key, reviver, debug])

  // State to store our value
  // Pass initial state function to useState so logic is only executed once
  const [storedValue, setStoredValue] = useState<T>(() => {
    return readValue()
  })

  // Return a wrapped version of useState's setter function that ...
  // ... persists the new value to localStorage.
  const setValue: SetValue<T> = useCallback(
    (value) => {
      try {
        // Allow value to be a function so we have the same API as useState
        const valueToStore =
          value instanceof Function ? value(storedValue) : value

        // Save to state
        setStoredValue(valueToStore)


        // Save to local storage
        if (typeof window !== 'undefined') {
          window.localStorage.setItem(key, JSON.stringify(valueToStore))
          
          if (debug) {
            console.log(`Updated localStorage key "${key}":`, valueToStore)
          }
        }
      } catch (error) {
        if (debug) {
          console.warn(`Error setting localStorage key "${key}":`, error)
        }
      }
    },
    [key, storedValue, debug]
  )

  // Listen for changes to this local storage key made from other tabs/windows
  useEffect(() => {
    if (!sync) return

    const handleStorageChange = (event: StorageEvent) => {
      if (event.key !== key || event.storageArea !== window.localStorage) {
        return
      }

      try {
        const newValue = event.newValue ? JSON.parse(event.newValue, reviver) : initialValue
        
        if (newValue !== storedValue) {
          setStoredValue(newValue)
          
          if (debug) {
            console.log(`Synced localStorage key "${key}" from another tab:`, newValue)
          }
        }
      } catch (error) {
        if (debug) {
          console.warn(`Error parsing synced localStorage key "${key}":`, error)
        }
      }
    }

    // Add event listener
    window.addEventListener('storage', handleStorageChange)

    // Clean up
    return () => {
      window.removeEventListener('storage', handleStorageChange)
    }
  }, [key, initialValue, storedValue, sync, reviver, debug])

  // Handle the case where the key changes
  useEffect(() => {
    setStoredValue(readValue())
  }, [key, readValue])

  return [storedValue, setValue]
}

/**
 * Custom hook that returns a function to get a value from localStorage
 * @param key - The key to use in localStorage
 * @param initialValue - The initial value
 * @param options - Additional options
 * @returns A function that returns the current value from localStorage
 */
export function useLocalStorageValue<T>(
  key: string,
  initialValue: T,
  options: Omit<Options, 'sync'> = {}
): () => T {
  const [value] = useLocalStorage(key, initialValue, { ...options, sync: false })
  
  return useCallback(() => value, [value])
}

/**
 * Custom hook that returns a function to set a value in localStorage
 * @param key - The key to use in localStorage
 * @param initialValue - The initial value
 * @param options - Additional options
 * @returns A function to update the value in localStorage
 */
export function useSetLocalStorage<T>(
  key: string,
  initialValue: T,
  options: Omit<Options, 'sync'> = {}
): (value: T | ((prev: T) => T)) => void {
  const [, setValue] = useLocalStorage(key, initialValue, { ...options, sync: false })
  
  return setValue
}

/**
 * Custom hook that returns a function to remove a value from localStorage
 * @param key - The key to remove from localStorage
 * @param options - Additional options
 * @returns A function to remove the key from localStorage
 */
export function useRemoveLocalStorage(
  key: string,
  options: Pick<Options, 'debug'> = {}
): () => void {
  const { debug = false } = options
  
  return useCallback(() => {
    try {
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem(key)
        
        if (debug) {
          console.log(`Removed localStorage key "${key}"`)
        }
      }
    } catch (error) {
      if (debug) {
        console.warn(`Error removing localStorage key "${key}":`, error)
      }
    }
  }, [key, debug])
}
