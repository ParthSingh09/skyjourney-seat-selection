import { Check } from 'lucide-react'
import { BOOKING_STEPS, CURRENT_STEP_ID } from '../data/flight.js'

/** Visual-only stepper; later steps link to the matching section on this page. */
export default function BookingProgress() {
  const currentIndex = BOOKING_STEPS.findIndex((s) => s.id === CURRENT_STEP_ID)
  return (
    <nav aria-label="Booking progress" className="mx-auto max-w-7xl px-4 pt-5 sm:px-6">
      <ol className="flex items-center rounded-2xl border border-slate-200/80 bg-white px-3 py-3 shadow-sm sm:px-6">
        {BOOKING_STEPS.map((step, index) => {
          const done = index < currentIndex
          const current = index === currentIndex
          const body = (
            <>
              <span
                className={`grid size-8 shrink-0 place-items-center rounded-full text-xs font-bold transition ${
                  done ? 'bg-teal-500 text-white' : current ? 'bg-navy-800 text-white ring-4 ring-navy-100' : 'bg-slate-100 text-slate-500'
                }`}
              >
                {done ? <Check size={15} strokeWidth={3} /> : index + 1}
              </span>
              <span className={`${current ? 'inline' : 'hidden lg:inline'} text-sm font-semibold ${current ? 'text-navy-900' : done ? 'text-slate-700' : 'text-slate-500'}`}>
                {step.label}
              </span>
            </>
          )
          return (
            <li key={step.id} className={`flex items-center ${index < BOOKING_STEPS.length - 1 ? 'flex-1' : ''}`} aria-current={current ? 'step' : undefined}>
              {step.anchor && !current ? (
                <a href={`#${step.anchor}`} className="flex items-center gap-2 rounded-full hover:opacity-80">{body}</a>
              ) : (
                <span className="flex items-center gap-2">{body}</span>
              )}
              {index < BOOKING_STEPS.length - 1 && (
                <span className={`mx-2 h-0.5 flex-1 rounded-full sm:mx-3 ${done ? 'bg-teal-400' : 'bg-slate-200'}`} aria-hidden="true" />
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
