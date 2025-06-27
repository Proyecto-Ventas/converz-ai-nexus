import { useEffect, useRef, useCallback } from 'react'

/**
 * Custom hook that returns a ref indicating if the component is mounted
 * @returns A ref that is true if the component is mounted, false otherwise
 */
export function useMounted() {
  const isMounted = useRef(false)

  useEffect(() => {
    isMounted.current = true
    return () => {
      isMounted.current = false
    }
  }, [])

  return isMounted
}

/**
 * Custom hook that returns a function to check if the component is mounted
 * @returns A function that returns true if the component is mounted, false otherwise
 */
export function useIsMounted() {
  const isMounted = useMounted()
  return useCallback(() => isMounted.current, [isMounted])
}

/**
 * Custom hook that runs an effect only when the component is mounted
 * @param effect - The effect to run when the component is mounted
 * @param deps - The dependencies array for the effect
 */
export function useMountedEffect(
  effect: (isMounted: () => boolean) => void | (() => void),
  deps: React.DependencyList = []
) {
  const isMounted = useMounted()

  useEffect(() => {
    let cleanup: void | (() => void)
    
    const runEffect = () => {
      cleanup = effect(() => isMounted.current)
    }
    
    runEffect()
    
    return () => {
      if (typeof cleanup === 'function') {
        cleanup()
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMounted, ...deps])
}

/**
 * Custom hook that runs an async effect only when the component is mounted
 * @param effect - The async effect to run when the component is mounted
 * @param deps - The dependencies array for the effect
 */
export function useAsyncMountedEffect(
  effect: (isMounted: () => boolean) => Promise<void | (() => void)>,
  deps: React.DependencyList = []
) {
  useMountedEffect(
    (isMounted) => {
      let ignore = false
      let cleanup: void | (() => void)

      const runEffect = async () => {
        try {
          const result = await effect(isMounted)
          if (!ignore && isMounted()) {
            cleanup = result
          }
        } catch (error) {
          if (!ignore && isMounted()) {
            console.error('Error in async mounted effect:', error)
          }
        }
      }


      runEffect()

      return () => {
        ignore = true
        if (typeof cleanup === 'function') {
          cleanup()
        }
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    deps
  )
}

/**
 * Custom hook that runs a callback only when the component is mounted
 * @param callback - The callback to run when the component is mounted
 * @param deps - The dependencies array for the callback
 */
export function useMountedCallback<T extends (...args: any[]) => any>(
  callback: T,
  deps: React.DependencyList = []
): T {
  const isMounted = useMounted()
  
  return useCallback((...args: Parameters<T>) => {
    if (isMounted.current) {
      return callback(...args)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMounted, callback, ...deps]) as T
}

/**
 * Custom hook that returns a ref indicating if the component is in the first render
 * @returns A ref that is true in the first render, false otherwise
 */
export function useFirstRender() {
  const isFirstRender = useRef(true)
  
  useEffect(() => {
    isFirstRender.current = false
  }, [])
  
  return isFirstRender
}

/**
 * Custom hook that returns a function to check if it's the first render
 * @returns A function that returns true in the first render, false otherwise
 */
export function useIsFirstRender() {
  const isFirstRender = useFirstRender()
  return useCallback(() => isFirstRender.current, [isFirstRender])
}

/**
 * Custom hook that runs an effect only in the first render
 * @param effect - The effect to run in the first render
 * @param deps - The dependencies array for the effect
 */
export function useFirstRenderEffect(
  effect: React.EffectCallback,
  deps: React.DependencyList = []
) {
  const isFirstRender = useFirstRender()
  
  useEffect(() => {
    if (isFirstRender.current) {
      return effect()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isFirstRender, ...deps])
}
