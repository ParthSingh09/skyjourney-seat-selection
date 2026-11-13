import { AlertTriangle, CheckCircle2, Info, XCircle, X } from 'lucide-react'

const TONES = {
  success: { icon: CheckCircle2, bar: 'bg-emerald-500', iconClass: 'text-emerald-600' },
  error: { icon: XCircle, bar: 'bg-rose-500', iconClass: 'text-rose-600' },
  warning: { icon: AlertTriangle, bar: 'bg-amber-500', iconClass: 'text-amber-600' },
  info: { icon: Info, bar: 'bg-navy-500', iconClass: 'text-navy-600' },
}

/** Stack of toasts, announced politely to screen readers. */
export default function ToastNotification({ toasts, onDismiss }) {
  return (
    <div aria-live="polite" className="pointer-events-none fixed inset-x-0 top-3 z-[60] flex flex-col items-center gap-2 px-3 sm:top-5">
      {toasts.map((toast) => {
        const tone = TONES[toast.type] ?? TONES.info
        const Icon = tone.icon
        return (
          <div
            key={toast.id}
            role={toast.type === 'error' ? 'alert' : 'status'}
            className="pointer-events-auto relative flex w-full max-w-md animate-toast-in items-start gap-3 overflow-hidden rounded-2xl bg-white py-3 pl-5 pr-3 shadow-xl ring-1 ring-slate-900/10"
          >
            <span className={`absolute inset-y-0 left-0 w-1.5 ${tone.bar}`} aria-hidden="true" />
            <Icon size={20} className={`mt-0.5 shrink-0 ${tone.iconClass}`} aria-hidden="true" />
            <p className="flex-1 text-sm font-medium leading-snug text-slate-800">{toast.message}</p>
            <button type="button" onClick={() => onDismiss(toast.id)} aria-label="Dismiss notification" className="grid size-6 shrink-0 place-items-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-700">
              <X size={14} />
            </button>
          </div>
        )
      })}
    </div>
  )
}
