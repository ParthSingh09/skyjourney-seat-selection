import { useCallback, useRef, useState } from 'react'

const MAX_VISIBLE = 2

/** Tiny toast queue: notify(type, message) where type is success | error | info | warning. */
export function useToasts() {
  const [toasts, setToasts] = useState([])
  const nextId = useRef(0)

  const dismiss = useCallback((id) => setToasts((list) => list.filter((t) => t.id !== id)), [])

  const notify = useCallback(
    (type, message, duration = 3200) => {
      const id = (nextId.current += 1)
      setToasts((list) => [...list.slice(-(MAX_VISIBLE - 1)), { id, type, message }])
      window.setTimeout(() => dismiss(id), duration)
    },
    [dismiss],
  )

  return { toasts, notify, dismiss }
}
