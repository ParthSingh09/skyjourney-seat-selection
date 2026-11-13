import { CalendarDays, Plane } from 'lucide-react'
import { FLIGHT } from '../data/flight.js'

const Endpoint = ({ time, place, align = 'left' }) => (
  <div className={align === 'right' ? 'text-right' : ''}>
    <p className="text-2xl font-extrabold tracking-tight text-navy-900 sm:text-3xl">{time}</p>
    <p className="text-sm font-bold text-navy-700">{place.code}</p>
    <p className="text-xs text-slate-500">{place.city}</p>
  </div>
)

export default function FlightInformation() {
  return (
    <section aria-label="Flight information" className="mx-auto max-w-7xl px-4 pt-5 sm:px-6">
      <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6">
        <div className="mb-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-semibold">
          <span className="rounded-full bg-navy-800 px-3 py-1 text-white">{FLIGHT.number}</span>
          <span className="flex items-center gap-1.5 text-slate-500"><CalendarDays size={14} /> {FLIGHT.date}</span>
          <span className="text-slate-500">{FLIGHT.aircraft}</span>
          <span className="rounded-full bg-sky-50 px-3 py-1 text-sky-700">{FLIGHT.cabin}</span>
        </div>
        <div className="flex items-center gap-3 sm:gap-6">
          <Endpoint time={FLIGHT.departure} place={FLIGHT.origin} />
          <div className="flex min-w-0 flex-1 flex-col items-center">
            <span className="text-xs font-semibold text-slate-500">{FLIGHT.duration}</span>
            <div className="relative my-1.5 flex w-full items-center">
              <span className="size-2 rounded-full border-2 border-navy-400 bg-white" />
              <span className="h-px flex-1 border-t-2 border-dashed border-navy-200" />
              <Plane size={18} className="mx-1 shrink-0 text-navy-700" />
              <span className="h-px flex-1 border-t-2 border-dashed border-navy-200" />
              <span className="size-2 rounded-full bg-navy-500" />
            </div>
            <span className="whitespace-nowrap text-[11px] font-medium text-teal-600">Non-stop</span>
          </div>
          <Endpoint time={FLIGHT.arrival} place={FLIGHT.destination} align="right" />
        </div>
      </div>
    </section>
  )
}
