import { useEffect, useRef } from 'react'
import { X } from 'lucide-react'

/**
 * Accessible dialog shell: backdrop click + Escape to close, body scroll lock,
 * focus moves in on open and is restored on close. Bottom sheet on phones,
 * centred card from `sm` up.
 */
export default function Modal({ title, titleId, onClose, children, widthClass = 'sm:max-w-md' }) {
  const panelRef = useRef(null)
  // Captured during render – i.e. BEFORE any child `autoFocus` runs – so focus can return to the opener.
  const openerRef = useRef(document.activeElement)
  const onCloseRef = useRef(onClose)
  useEffect(() => {
    onCloseRef.current = onClose
  })

  useEffect(() => {
    const previouslyFocused = openerRef.current
    const primary = panelRef.current.querySelector('[data-autofocus]')
    if (primary) primary.focus()
    else if (!panelRef.current.contains(document.activeElement)) panelRef.current.focus()
    const onKey = (e) => {
      if (e.key === 'Escape') return onCloseRef.current()
      if (e.key !== 'Tab') return
      // Keep Tab / Shift+Tab inside the dialog.
      const focusable = [...panelRef.current.querySelectorAll('button:not([disabled]), [href], input, [tabindex]:not([tabindex="-1"])')]
      if (!focusable.length) return
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (e.shiftKey && (document.activeElement === first || document.activeElement === panelRef.current)) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }
    document.addEventListener('keydown', onKey)
    const { overflow } = document.body.style
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = overflow
      previouslyFocused?.focus?.()
    }
  }, [])

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4" role="presentation">
      <div className="absolute inset-0 animate-fade-in bg-navy-900/50 backdrop-blur-[2px]" onClick={onClose} aria-hidden="true" />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-label={titleId ? undefined : title}
        tabIndex={-1}
        className={`relative max-h-[92dvh] w-full animate-sheet-in overflow-y-auto rounded-t-3xl bg-white shadow-2xl outline-none sm:animate-pop-in sm:rounded-3xl ${widthClass}`}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close dialog"
          className="absolute right-3 top-3 z-10 grid size-9 place-items-center rounded-full text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
        >
          <X size={18} />
        </button>
        {children}
      </div>
    </div>
  )
}
