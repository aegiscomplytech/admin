"use client"

import { useEffect, useState } from "react"

/** The value, updated only after it stopped changing for `delay` ms (e.g. a search box). */
export function useDebouncedValue(value, delay = 300) {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])
  return debounced
}
