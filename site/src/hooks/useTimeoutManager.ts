import { useRef, useCallback, useEffect } from 'react'

/**
 * Hook to manage timeouts and ensure they're all cleaned up on unmount
 * Prevents memory leaks from pending timeouts
 */
export function useTimeoutManager() {
  const timeoutsRef = useRef<Set<NodeJS.Timeout>>(new Set())

  const setTimeout = useCallback((callback: () => void, delay: number) => {
    const timeoutId = globalThis.setTimeout(() => {
      timeoutsRef.current.delete(timeoutId)
      callback()
    }, delay)

    timeoutsRef.current.add(timeoutId)
    return timeoutId
  }, [])

  const clearTimeout = useCallback((timeoutId: NodeJS.Timeout) => {
    globalThis.clearTimeout(timeoutId)
    timeoutsRef.current.delete(timeoutId)
  }, [])

  const clearAll = useCallback(() => {
    timeoutsRef.current.forEach(timeoutId => {
      globalThis.clearTimeout(timeoutId)
    })
    timeoutsRef.current.clear()
  }, [])

  // Cleanup all timeouts on unmount
  useEffect(() => {
    return () => {
      clearAll()
    }
  }, [clearAll])

  return { setTimeout, clearTimeout, clearAll }
}
