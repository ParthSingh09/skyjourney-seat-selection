import { CheckCircle2, Plane } from 'lucide-react'
import Modal from './Modal.jsx'
import { FLIGHT } from '../data/flight.js'
import { formatPrice } from '../utils/pricingUtils.js'

/** Mock success screen – no booking or payment happens. */
export default function ConfirmationModal({ reference, summary, onClose, onReset }) {
  return (
    <Modal titleId="done-title" onClose={onClose} widthClass="sm:max-w-lg">
      <div className="px-6 pb-6 pt-8">
        <div className="flex flex-col items-center text-center">
          <span className="grid size-16 place-items-center rounded-full bg-emerald-100 text-emerald-600"><CheckCircle2 size={36} /></span>
          <h2 id="done-title" className="mt-4 text-2xl font-extrabold text-navy-900">Selection confirmed</h2>
          <p className="mt-1 text-sm text-slate-500">Reference <span className="font-bold tracking-wider text-navy-800">{reference}</span></p>
        </div>

        <div className="mt-5 flex items-center justify-between rounded-2xl bg-navy-900 px-5 py-4 text-white">
          <div><p className="text-xl font-extrabold">{FLIGHT.origin.code}</p><p className="text-xs text-white/60">{FLIGHT.departure}</p></div>
          <div className="flex flex-col items-center text-xs text-white/70"><Plane size={18} className="rotate-90" />{FLIGHT.number} · {FLIGHT.duration}</div>
          <div className="text-right"><p className="text-xl font-extrabold">{FLIGHT.destination.code}</p><p className="text-xs text-white/60">{FLIGHT.arrival}</p></div>
        </div>

        <ul className="mt-4 divide-y divide-slate-100 text-sm">
          {summary.rows.map(({ passenger, seat, seatPrice, meal, mealPrice }) => (
            <li key={passenger.id} className="flex items-start justify-between gap-3 py-3">
              <div className="min-w-0">
                <p className="font-bold text-navy-900">{passenger.name}</p>
                <p className="text-xs text-slate-500">Seat {seat?.id ?? '—'} · {meal?.name ?? 'No meal selected'}</p>
              </div>
              <span className="shrink-0 font-semibold tabular-nums text-navy-900">{formatPrice(seatPrice + mealPrice)}</span>
            </li>
          ))}
        </ul>

        <div className="mt-2 space-y-1.5 rounded-2xl bg-slate-50 p-4 text-sm">
          <div className="flex justify-between text-slate-600"><span>Seat charges</span><span className="tabular-nums">{formatPrice(summary.seatTotal)}</span></div>
          <div className="flex justify-between text-slate-600"><span>Meal charges</span><span className="tabular-nums">{formatPrice(summary.mealTotal)}</span></div>
          <div className="flex justify-between border-t border-slate-200 pt-2 text-base font-extrabold text-navy-900"><span>Grand total</span><span className="tabular-nums">{formatPrice(summary.grandTotal)}</span></div>
        </div>

        <div className="mt-5 flex flex-col gap-2.5 sm:flex-row-reverse">
          <button type="button" data-autofocus onClick={onClose} className="flex-1 rounded-xl bg-navy-800 px-5 py-3 text-sm font-bold text-white hover:bg-navy-700">Done</button>
          <button type="button" onClick={onReset} className="flex-1 rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-50">Start new booking</button>
        </div>
        <p className="mt-3 text-center text-[11px] text-slate-500">Demo only – no booking or payment was processed.</p>
      </div>
    </Modal>
  )
}
