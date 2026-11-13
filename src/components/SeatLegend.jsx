import { Armchair, X } from 'lucide-react'
import { CATEGORY_VISUALS, STATUS_VISUALS } from './seatVisuals.js'
import { SEAT_CATEGORIES } from '../data/seats.js'
import { formatPrice } from '../utils/pricingUtils.js'

const Swatch = ({ className, children }) => (
  <span className={`grid size-6 shrink-0 place-items-center rounded-t-lg rounded-b-sm border-2 border-b-4 ${className}`}>{children}</span>
)

/** Legend generated from the same visual config the seats use. */
export default function SeatLegend() {
  return (
    <ul className="grid grid-cols-2 gap-x-4 gap-y-2.5 text-xs sm:grid-cols-3 lg:grid-cols-4" aria-label="Seat legend">
      {Object.values(SEAT_CATEGORIES).map((category) => {
        const { icon: Icon, swatch } = CATEGORY_VISUALS[category.id]
        return (
          <li key={category.id} className="flex items-center gap-2">
            <Swatch className={swatch}>{Icon && <Icon size={11} strokeWidth={2.75} />}</Swatch>
            <span className="leading-tight">
              <span className="block font-semibold text-slate-800">{category.label}</span>
              <span className="text-slate-500">{category.price ? formatPrice(category.price) : 'Free'}</span>
            </span>
          </li>
        )
      })}
      <li className="flex items-center gap-2">
        <Swatch className={STATUS_VISUALS.mine.swatch}><Armchair size={11} /></Swatch>
        <span className="leading-tight">
          <span className="block font-semibold text-slate-800">Selected</span>
          <span className="text-slate-500">Active passenger</span>
        </span>
      </li>
      <li className="flex items-center gap-2">
        <Swatch className={STATUS_VISUALS.taken.swatch}><Armchair size={11} /></Swatch>
        <span className="leading-tight">
          <span className="block font-semibold text-slate-800">Assigned</span>
          <span className="text-slate-500">Other passenger</span>
        </span>
      </li>
      <li className="flex items-center gap-2">
        <Swatch className={STATUS_VISUALS.occupied.swatch}><X size={11} strokeWidth={3} /></Swatch>
        <span className="leading-tight">
          <span className="block font-semibold text-slate-800">Occupied</span>
          <span className="text-slate-500">Unavailable</span>
        </span>
      </li>
    </ul>
  )
}
