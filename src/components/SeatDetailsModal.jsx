import { ArrowLeftRight, CheckCircle2, Lock, Trash2, UserRound } from 'lucide-react'
import Modal from './Modal.jsx'
import { CATEGORY_VISUALS } from './seatVisuals.js'
import { SEAT_CATEGORIES } from '../data/seats.js'
import { formatPrice } from '../utils/pricingUtils.js'

const Row = ({ label, children }) => (
  <div className="flex items-center justify-between gap-4 py-3">
    <dt className="text-sm text-slate-500">{label}</dt>
    <dd className="text-right text-sm font-semibold text-navy-900">{children}</dd>
  </div>
)

/**
 * Three situations for a clicked seat:
 *  - available            → confirm it for the active passenger (replacing their old seat, if any)
 *  - assigned to active   → offer to remove it
 *  - assigned to someone  → explain, and offer to switch to that passenger
 */
export default function SeatDetailsModal({ seat, status, owner, activePassenger, currentSeat, onConfirm, onRemove, onSwitch, onClose }) {
  const category = SEAT_CATEGORIES[seat.category]
  const visual = CATEGORY_VISUALS[seat.category]
  const Icon = visual.icon
  const isMine = status === 'mine'
  const isTaken = status === 'taken'

  const statusLabel = isMine ? (
    <span className="inline-flex items-center gap-1.5 text-blue-700"><CheckCircle2 size={15} /> Assigned</span>
  ) : isTaken ? (
    <span className="inline-flex items-center gap-1.5 text-rose-600"><Lock size={14} /> Assigned to another passenger</span>
  ) : (
    <span className="inline-flex items-center gap-1.5 text-emerald-600"><span className="size-2 rounded-full bg-emerald-500" /> Available</span>
  )

  const receiver = isTaken ? owner : activePassenger

  return (
    <Modal titleId="seat-title" onClose={onClose}>
      <div className="px-6 pb-6 pt-7">
        <div className="flex items-center gap-4">
          <span className={`grid size-16 shrink-0 place-items-center rounded-t-2xl rounded-b-lg border-2 border-b-[6px] text-xl font-extrabold ${visual.swatch}`}>{seat.id}</span>
          <div className="min-w-0">
            <h2 id="seat-title" className="text-xl font-extrabold text-navy-900">Seat {seat.id}</h2>
            <p className={`mt-1 inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-bold ring-1 ${visual.soft}`}>
              {Icon && <Icon size={12} strokeWidth={2.75} />} {category.label}
            </p>
          </div>
        </div>

        <p className="mt-3 text-sm text-slate-500">{category.blurb}{seat.isExitRow ? ' · Emergency exit row' : ''}</p>

        <dl className="mt-4 divide-y divide-slate-100 rounded-2xl bg-slate-50 px-4">
          <Row label="Seat number">{seat.id}</Row>
          <Row label="Category">{category.label}</Row>
          <Row label="Price">
            <span className="text-base font-extrabold">{seat.price ? formatPrice(seat.price) : '₹0'}</span>
          </Row>
          <Row label="Status">{statusLabel}</Row>
          <Row label={isTaken ? 'Assigned to' : 'Passenger'}>
            <span className="inline-flex items-center gap-1.5"><UserRound size={14} className="text-slate-500" />{receiver?.name ?? '—'}</span>
          </Row>
        </dl>

        {!isMine && !isTaken && currentSeat && (
          <p className="mt-3 rounded-xl bg-amber-50 px-3.5 py-2.5 text-xs font-medium text-amber-800">
            {activePassenger.name} currently has seat {currentSeat.id}. Confirming will release it.
          </p>
        )}
        {isTaken && (
          <p className="mt-3 rounded-xl bg-rose-50 px-3.5 py-2.5 text-xs font-medium text-rose-700">
            This seat belongs to {owner.name}. Switch to them to change or remove it.
          </p>
        )}

        <div className="mt-5 flex flex-col gap-2.5 sm:flex-row-reverse">
          {isMine && (
            <button type="button" onClick={() => onRemove(activePassenger.id)} className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-rose-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-rose-700">
              <Trash2 size={16} /> Remove seat
            </button>
          )}
          {isTaken && (
            <button type="button" onClick={() => onSwitch(owner.id)} className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-navy-800 px-5 py-3 text-sm font-bold text-white transition hover:bg-navy-700">
              <ArrowLeftRight size={16} /> Switch to {owner.name.split(' ')[0]}
            </button>
          )}
          {!isMine && !isTaken && (
            <button type="button" data-autofocus onClick={() => onConfirm(seat.id)} className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-navy-800 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-navy-800/25 transition hover:bg-navy-700 active:scale-[0.98]">
              <CheckCircle2 size={17} /> Confirm Selection{seat.price ? ` · ${formatPrice(seat.price)}` : ''}
            </button>
          )}
          <button type="button" onClick={onClose} className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50">
            {isMine ? 'Keep seat' : 'Cancel'}
          </button>
        </div>
      </div>
    </Modal>
  )
}
