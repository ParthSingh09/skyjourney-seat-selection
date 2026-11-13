import { CheckCircle2, MousePointerClick, UserRound } from 'lucide-react'
import SeatRow from './SeatRow.jsx'
import SeatLegend from './SeatLegend.jsx'
import { CABIN_CONFIGS } from '../data/seats.js'

/**
 * The cabin seen from above: nose + cockpit, rows generated from `layout`,
 * galley/lavatory at the tail. The scroll container keeps wide layouts
 * (2-3-2 on a phone) inside the card instead of overflowing the page.
 */
export default function AircraftSeatMap({
  layout, seatOwners, passengersById, activePassenger, summary, availableSeatCount, openSeatId, onSelectSeat, onChangeConfig,
}) {
  const { config } = layout
  const letters = config.groups

  return (
    <section id="seats" className="rounded-3xl border border-slate-200/80 bg-white p-4 shadow-sm sm:p-6" aria-labelledby="seatmap-title">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 id="seatmap-title" className="text-lg font-bold text-navy-900">Choose your seats</h2>
          <p className="mt-0.5 text-sm text-slate-500">
            {availableSeatCount > 0 ? `${availableSeatCount} of ${layout.seats.length} seats open` : 'No seats left in this layout'} · {CABIN_CONFIGS[config.id].description}
          </p>
        </div>

        <div role="radiogroup" aria-label="Aircraft configuration" className="inline-flex shrink-0 self-start rounded-xl bg-slate-100 p-1">
          {Object.values(CABIN_CONFIGS).map((option) => {
            const selected = option.id === config.id
            return (
              <button
                key={option.id}
                type="button"
                role="radio"
                aria-checked={selected}
                onClick={() => onChangeConfig(option.id)}
                className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${selected ? 'bg-navy-800 text-white shadow' : 'text-slate-600 hover:text-navy-900'}`}
              >
                {option.label}
              </button>
            )
          })}
        </div>
      </div>

      <StatusBanner activePassenger={activePassenger} summary={summary} />

      <div className="mt-5 rounded-2xl bg-slate-50 p-4"><SeatLegend /></div>

      <p className="mt-4 text-center text-xs font-medium text-slate-500 sm:hidden">Swipe sideways to see the whole cabin</p>

      <div className="thin-scroll mt-2 overflow-x-auto overflow-y-visible px-2 pb-4 pt-6" tabIndex={0} aria-label="Aircraft cabin seat map">
        <div className="relative mx-auto w-fit min-w-fit rounded-t-[160px] rounded-b-[48px] border-2 border-navy-100 bg-gradient-to-b from-white to-navy-50/60 px-7 pb-8 shadow-[inset_0_0_0_6px_white,0_20px_40px_-24px_rgba(11,27,61,0.35)] sm:px-9">
          {/* Cockpit */}
          <div className="flex flex-col items-center pb-5 pt-12 sm:pt-14">
            <div className="flex gap-1.5" aria-hidden="true">
              <span className="h-2.5 w-9 -rotate-[8deg] rounded-t-full bg-navy-200" />
              <span className="h-2.5 w-9 rotate-[8deg] rounded-t-full bg-navy-200" />
            </div>
            <span className="mt-2 text-[10px] font-bold uppercase tracking-[0.2em] text-navy-400">Front · Cockpit</span>
          </div>

          {/* Column letters, generated from the same groups as the rows */}
          <div className="mb-2 flex items-center gap-1" aria-hidden="true">
            {letters.map((group, gi) => (
              <div key={gi} className="flex items-center gap-1">
                {gi > 0 && <span className="w-6 sm:w-7" />}
                {group.map((letter) => (
                  <span key={letter} className="w-9 text-center text-[11px] font-bold text-navy-400 sm:w-10">{letter}</span>
                ))}
              </div>
            ))}
          </div>

          <div className="flex flex-col gap-2">
            {layout.rows.map((row) => (
              <SeatRow
                key={row.number}
                row={row}
                seatOwners={seatOwners}
                activePassengerId={activePassenger?.id ?? null}
                passengersById={passengersById}
                openSeatId={openSeatId}
                onSelectSeat={onSelectSeat}
              />
            ))}
          </div>

          <div className="mt-6 flex items-center justify-center gap-3 border-t border-dashed border-navy-100 pt-4 text-[10px] font-bold uppercase tracking-[0.2em] text-navy-400">
            Rear · Galley &amp; Lavatories
          </div>
        </div>
      </div>
    </section>
  )
}

function StatusBanner({ activePassenger, summary }) {
  if (summary.allAssigned) {
    return (
      <div className="mt-4 flex items-center gap-2.5 rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800 ring-1 ring-emerald-200">
        <CheckCircle2 size={18} className="shrink-0" />
        Every passenger has a seat. Tap a seat to change, or continue to meals.
      </div>
    )
  }
  if (!activePassenger) {
    return (
      <div className="mt-4 flex items-center gap-2.5 rounded-2xl bg-amber-50 px-4 py-3 text-sm font-medium text-amber-800 ring-1 ring-amber-200">
        <MousePointerClick size={18} className="shrink-0" />
        Select a passenger first, then choose a seat from the aircraft.
      </div>
    )
  }
  return (
    <div className="mt-4 flex items-center gap-2.5 rounded-2xl bg-navy-50 px-4 py-3 text-sm font-medium text-navy-800 ring-1 ring-navy-100">
      <UserRound size={18} className="shrink-0" />
      <span>Choosing a seat for <strong className="font-bold">{activePassenger.name}</strong></span>
    </div>
  )
}
