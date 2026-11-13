import { ArrowRight, ChevronDown, Plane } from 'lucide-react'
import { FLIGHT, USER } from '../data/flight.js'

export default function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-navy-900 text-white shadow-lg shadow-navy-900/10">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
        <a href="#" className="flex items-center gap-2.5" aria-label={`${FLIGHT.airline} home`}>
          <span className="grid size-9 place-items-center rounded-xl bg-white text-navy-900">
            <Plane size={19} strokeWidth={2.5} className="-rotate-45" />
          </span>
          <span className="text-lg font-extrabold tracking-tight">{FLIGHT.airline}</span>
        </a>

        <div className="hidden items-center gap-3 rounded-full bg-white/10 px-4 py-1.5 text-sm md:flex" aria-label="Flight summary">
          <span className="font-bold">{FLIGHT.origin.code}</span>
          <ArrowRight size={14} className="text-white/60" />
          <span className="font-bold">{FLIGHT.destination.code}</span>
          <span className="h-4 w-px bg-white/20" />
          <span className="font-semibold text-sky-200">{FLIGHT.number}</span>
          <span className="text-white/70">{FLIGHT.departure} – {FLIGHT.arrival}</span>
        </div>
        <span className="text-sm font-bold text-sky-200 md:hidden">{FLIGHT.number} · {FLIGHT.origin.code}→{FLIGHT.destination.code}</span>

        <button type="button" className="flex items-center gap-2.5 rounded-full py-1 pl-1 pr-2 transition hover:bg-white/10" aria-label="Profile menu">
          <span className="grid size-9 place-items-center rounded-full bg-gradient-to-br from-sky-300 to-indigo-400 text-xs font-extrabold text-navy-900">{USER.initials}</span>
          <span className="hidden text-left leading-tight lg:block">
            <span className="block text-sm font-semibold">{USER.name}</span>
            <span className="block text-[11px] text-amber-300">{USER.tier}</span>
          </span>
          <ChevronDown size={16} className="hidden text-white/60 lg:block" />
        </button>
      </div>
    </header>
  )
}
