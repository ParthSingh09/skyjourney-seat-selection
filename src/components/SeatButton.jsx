import { memo } from 'react'
import { X } from 'lucide-react'
import { CATEGORY_VISUALS, STATUS_VISUALS, getInitials } from './seatVisuals.js'
import { SEAT_CATEGORIES } from '../data/seats.js'
import { formatPrice } from '../utils/pricingUtils.js'

/**
 * One seat. `status` is available | occupied | mine | taken.
 *  - mine  = assigned to the active passenger (strong blue)
 *  - taken = assigned to another passenger (soft blue, shows their initials)
 * Hover/focus shows a price tooltip; on touch devices a tap opens the details sheet instead.
 */
const SeatButton = memo(function SeatButton({ seat, status, owner, isOpen, onSelect }) {
  const category = SEAT_CATEGORIES[seat.category]
  const visual = CATEGORY_VISUALS[seat.category]
  const Icon = visual.icon
  const assigned = status === 'mine' || status === 'taken'

  const tooltip =
    status === 'occupied'
      ? `${seat.id} · Occupied`
      : assigned
        ? `${seat.id} · ${owner.name}`
        : `${seat.id} · ${category.label} · ${formatPrice(seat.price)}`

  const label =
    status === 'occupied'
      ? `Seat ${seat.id}, occupied`
      : assigned
        ? `Seat ${seat.id}, assigned to ${owner.name}`
        : `Seat ${seat.id}, ${category.label}, ${formatPrice(seat.price)}`

  const tone = status === 'available' ? visual.seat : STATUS_VISUALS[status].seat

  return (
    <button
      type="button"
      disabled={status === 'occupied'}
      onClick={() => onSelect(seat.id)}
      aria-label={label}
      aria-pressed={status === 'mine'}
      className={`group relative flex h-10 w-9 shrink-0 flex-col items-center justify-center rounded-t-xl rounded-b-md border-2 border-b-[5px] text-[11px] font-bold leading-none transition duration-150 sm:h-11 sm:w-10 ${tone} ${
        status === 'occupied' ? '' : 'active:scale-95 hover:-translate-y-0.5'
      } ${isOpen ? 'outline-2 outline-offset-2 outline-navy-700' : ''} focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy-700`}
    >
      {status === 'occupied' && <X size={14} strokeWidth={2.5} aria-hidden="true" />}
      {assigned && (
        <>
          <span className="text-[12px]">{getInitials(owner.name)}</span>
          <span className="mt-0.5 text-[8px] font-semibold opacity-80">{seat.id}</span>
        </>
      )}
      {status === 'available' && (
        <>
          <span>{seat.id}</span>
          {Icon && <Icon size={9} strokeWidth={2.75} className="absolute right-0.5 top-0.5 opacity-70" aria-hidden="true" />}
        </>
      )}

      <span
        role="tooltip"
        className="pointer-events-none absolute bottom-full left-1/2 z-30 mb-2 -translate-x-1/2 whitespace-nowrap rounded-lg bg-navy-900 px-2.5 py-1.5 text-[11px] font-semibold text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100"
      >
        {tooltip}
      </span>
    </button>
  )
})

export default SeatButton
