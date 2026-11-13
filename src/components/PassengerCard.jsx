import { memo, useEffect, useRef, useState } from 'react'
import { Armchair, Check, Pencil, X } from 'lucide-react'
import { getInitials } from './seatVisuals.js'
import { MAX_NAME_LENGTH } from '../data/passengers.js'
import { SEAT_CATEGORIES } from '../data/seats.js'
import { formatPrice } from '../utils/pricingUtils.js'

/**
 * Selecting area and editing/removal controls are sibling buttons (never nested),
 * so the card stays valid HTML and keyboard friendly.
 */
const PassengerCard = memo(function PassengerCard({ passenger, index, isActive, seat, onSelect, onRename, onRemoveSeat }) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(passenger.name)
  const inputRef = useRef(null)
  const cancelledRef = useRef(false) // Escape sets this so the resulting blur doesn't save

  useEffect(() => {
    if (editing) inputRef.current?.select()
  }, [editing])

  const startEditing = () => {
    setDraft(passenger.name)
    cancelledRef.current = false
    setEditing(true)
  }
  const commit = () => {
    if (!editing) return
    onRename(passenger.id, draft)
    setEditing(false)
  }

  return (
    <div
      className={`group relative flex min-w-[15.5rem] snap-start items-stretch rounded-2xl border-2 p-3 transition sm:min-w-0 ${
        isActive ? 'border-navy-700 bg-navy-50/70 shadow-md shadow-navy-700/10' : 'border-slate-200 bg-white hover:border-navy-200'
      }`}
    >
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <span className={`grid size-11 shrink-0 place-items-center rounded-full text-sm font-extrabold ${isActive ? 'bg-navy-800 text-white' : 'bg-slate-100 text-slate-600'}`}>
          {getInitials(passenger.name)}
        </span>

        {editing ? (
          <form
            className="flex min-w-0 flex-1 items-center gap-1"
            onSubmit={(e) => {
              e.preventDefault()
              commit()
            }}
          >
            <input
              ref={inputRef}
              value={draft}
              maxLength={MAX_NAME_LENGTH}
              onChange={(e) => setDraft(e.target.value)}
              onBlur={() => !cancelledRef.current && commit()}
              onKeyDown={(e) => {
                if (e.key !== 'Escape') return
                cancelledRef.current = true
                setEditing(false)
              }}
              aria-label={`Name for passenger ${index + 1}`}
              className="min-w-0 flex-1 rounded-lg border border-navy-300 bg-white px-2 py-1.5 text-sm font-semibold text-navy-900 outline-none focus:ring-2 focus:ring-navy-300"
            />
            <button type="submit" aria-label="Save name" className="grid size-8 place-items-center rounded-lg bg-navy-800 text-white hover:bg-navy-700"><Check size={15} /></button>
          </form>
        ) : (
          <button type="button" onClick={() => onSelect(passenger.id)} aria-pressed={isActive} className="min-w-0 flex-1 rounded-lg text-left outline-offset-4">
            <span className="block text-[11px] font-semibold uppercase tracking-wide text-slate-500">Passenger {index + 1}</span>
            <span className="block truncate text-sm font-bold text-navy-900">{passenger.name}</span>
            {seat ? (
              <>
                <span className="mt-0.5 flex items-center gap-1.5 whitespace-nowrap text-xs font-bold text-blue-700">
                  <Armchair size={13} /> Seat {seat.id}
                </span>
                <span className="block truncate text-[11px] font-medium text-slate-500">{SEAT_CATEGORIES[seat.category].label} · {formatPrice(seat.price)}</span>
              </>
            ) : (
              <span className="mt-0.5 block text-xs font-medium text-amber-600">Not assigned</span>
            )}
          </button>
        )}
      </div>

      {!editing && (
        <div className="ml-1 flex flex-col justify-between">
          <button type="button" onClick={startEditing} aria-label={`Edit name of ${passenger.name}`} className="grid size-8 place-items-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-navy-700">
            <Pencil size={14} />
          </button>
          {seat && (
            <button type="button" onClick={() => onRemoveSeat(passenger.id)} aria-label={`Remove seat ${seat.id} from ${passenger.name}`} className="grid size-8 place-items-center rounded-lg text-slate-500 transition hover:bg-rose-50 hover:text-rose-600">
              <X size={15} />
            </button>
          )}
        </div>
      )}

      {isActive && <span className="absolute -top-2 left-4 rounded-full bg-navy-800 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">Selecting</span>}
    </div>
  )
})

export default PassengerCard
