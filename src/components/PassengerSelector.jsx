import { useEffect, useRef } from 'react'
import { Info, Users } from 'lucide-react'
import PassengerCard from './PassengerCard.jsx'
import { MAX_PASSENGERS, MIN_PASSENGERS } from '../data/passengers.js'

const COUNTS = Array.from({ length: MAX_PASSENGERS - MIN_PASSENGERS + 1 }, (_, i) => MIN_PASSENGERS + i)

export default function PassengerSelector({ passengers, activePassengerId, seatsById, seatAssignments, prompt, onSelect, onRename, onRemoveSeat, onChangeCount }) {
  const sectionRef = useRef(null)
  const ringRef = useRef(null)

  // When the user taps a seat with nobody selected, scroll here and pulse the panel.
  useEffect(() => {
    if (!prompt) return
    sectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    const ring = ringRef.current
    ring?.classList.remove('animate-ring-pulse')
    void ring?.offsetWidth // restart the animation
    ring?.classList.add('animate-ring-pulse')
  }, [prompt])

  return (
    <section id="passengers" ref={sectionRef} aria-labelledby="passengers-title" className="rounded-3xl border border-slate-200/80 bg-white p-4 shadow-sm sm:p-6">
      <div ref={ringRef} className="rounded-2xl">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-xl bg-navy-50 text-navy-700"><Users size={20} /></span>
            <div>
              <h2 id="passengers-title" className="text-lg font-bold text-navy-900">Passengers</h2>
              <p className="text-sm text-slate-500">Rename travellers and see who sits where.</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <span id="count-label" className="text-sm font-semibold text-slate-600">Travellers</span>
            <div role="radiogroup" aria-labelledby="count-label" className="inline-flex rounded-xl bg-slate-100 p-1">
              {COUNTS.map((n) => (
                <button
                  key={n}
                  type="button"
                  role="radio"
                  aria-checked={passengers.length === n}
                  onClick={() => onChangeCount(n)}
                  className={`size-9 rounded-lg text-sm font-bold transition ${passengers.length === n ? 'bg-navy-800 text-white shadow' : 'text-slate-600 hover:text-navy-900'}`}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>
        </div>

        <p className="mt-4 flex items-center gap-2 rounded-xl bg-navy-50 px-3.5 py-2.5 text-sm font-medium text-navy-700">
          <Info size={16} className="shrink-0" />
          Select a passenger first, then choose a seat from the aircraft.
        </p>

        <div className="thin-scroll -mx-1 mt-5 flex snap-x gap-3 overflow-x-auto px-1 pb-2 pt-2 sm:grid sm:grid-cols-2 sm:overflow-visible xl:grid-cols-3">
          {passengers.map((passenger, index) => (
            <PassengerCard
              key={passenger.id}
              passenger={passenger}
              index={index}
              isActive={passenger.id === activePassengerId}
              seat={seatsById[seatAssignments[passenger.id]] ?? null}
              onSelect={onSelect}
              onRename={onRename}
              onRemoveSeat={onRemoveSeat}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
