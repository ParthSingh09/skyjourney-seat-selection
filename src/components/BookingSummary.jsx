import { ArrowRight, CheckCheck, ClipboardList } from 'lucide-react'
import { FLIGHT } from '../data/flight.js'
import { formatPrice } from '../utils/pricingUtils.js'

export default function BookingSummary({ summary, onConfirm }) {
  const missing = summary.unassignedCount
  return (
    <section id="review" aria-labelledby="review-title" className="rounded-3xl border border-slate-200/80 bg-white p-4 shadow-sm sm:p-6">
      <div className="flex items-center gap-3">
        <span className="grid size-10 place-items-center rounded-xl bg-teal-50 text-teal-600"><ClipboardList size={20} /></span>
        <div>
          <h2 id="review-title" className="text-lg font-bold text-navy-900">Review &amp; summary</h2>
          <p className="text-sm text-slate-500">Check everything before you confirm.</p>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-1 rounded-2xl bg-navy-50 px-4 py-3 text-sm">
        <span className="flex items-center gap-2 font-bold text-navy-900">{FLIGHT.origin.city} ({FLIGHT.origin.code}) <ArrowRight size={14} /> {FLIGHT.destination.city} ({FLIGHT.destination.code})</span>
        <span className="font-semibold text-navy-700">{FLIGHT.number}</span>
        <span className="text-slate-600">Dep {FLIGHT.departure} · Arr {FLIGHT.arrival}</span>
      </div>

      {/* Table on tablet+, stacked cards on phones */}
      <div className="mt-5 hidden overflow-hidden rounded-2xl border border-slate-200 sm:block">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3">Passenger</th><th className="px-4 py-3">Seat</th><th className="px-4 py-3">Category</th>
              <th className="px-4 py-3 text-right">Seat</th><th className="px-4 py-3">Meal</th><th className="px-4 py-3 text-right">Meal</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {summary.rows.map(({ passenger, seat, seatCategory, seatPrice, meal, mealPrice }) => (
              <tr key={passenger.id}>
                <td className="px-4 py-3 font-semibold text-navy-900">{passenger.name}</td>
                <td className="px-4 py-3 font-semibold">{seat ? seat.id : <span className="text-amber-600">Not assigned</span>}</td>
                <td className="px-4 py-3 text-slate-600">{seatCategory?.label ?? '—'}</td>
                <td className="px-4 py-3 text-right tabular-nums">{formatPrice(seatPrice)}</td>
                <td className="px-4 py-3 text-slate-600">{meal?.name ?? <span className="text-slate-500">Not selected</span>}</td>
                <td className="px-4 py-3 text-right tabular-nums">{formatPrice(mealPrice)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <ul className="mt-5 space-y-3 sm:hidden">
        {summary.rows.map(({ passenger, seat, seatCategory, seatPrice, meal, mealPrice }) => (
          <li key={passenger.id} className="rounded-2xl border border-slate-200 p-4 text-sm">
            <p className="font-bold text-navy-900">{passenger.name}</p>
            <dl className="mt-2 space-y-1 text-slate-600">
              <div className="flex justify-between"><dt>Seat</dt><dd className="font-semibold">{seat ? `${seat.id} · ${seatCategory.label} · ${formatPrice(seatPrice)}` : <span className="text-amber-600">Not assigned</span>}</dd></div>
              <div className="flex justify-between"><dt>Meal</dt><dd className="font-semibold">{meal ? `${meal.name} · ${formatPrice(mealPrice)}` : <span className="text-slate-500">Not selected</span>}</dd></div>
            </dl>
          </li>
        ))}
      </ul>

      <div className="mt-5 ml-auto max-w-sm space-y-2 text-sm">
        <div className="flex justify-between text-slate-600"><span>Total seat charges</span><span className="font-semibold tabular-nums text-navy-900">{formatPrice(summary.seatTotal)}</span></div>
        <div className="flex justify-between text-slate-600"><span>Total meal charges</span><span className="font-semibold tabular-nums text-navy-900">{formatPrice(summary.mealTotal)}</span></div>
        <div className="flex items-baseline justify-between border-t border-slate-200 pt-3"><span className="font-bold text-navy-900">Grand total</span><span className="text-2xl font-extrabold tabular-nums text-navy-900">{formatPrice(summary.grandTotal)}</span></div>
      </div>

      {missing > 0 && (
        <p className="mt-4 rounded-xl bg-amber-50 px-3.5 py-2.5 text-sm font-medium text-amber-800">
          {summary.assignedCount === 0 ? 'No seats assigned yet.' : `${missing} passenger${missing > 1 ? 's' : ''} still need${missing > 1 ? '' : 's'} a seat.`} Choose seats above to continue.
        </p>
      )}

      <button
        type="button"
        onClick={onConfirm}
        className="mt-5 flex w-full items-center justify-center gap-2.5 rounded-2xl bg-gradient-to-r from-navy-800 to-indigo-700 px-6 py-4 text-base font-extrabold text-white shadow-xl shadow-navy-800/25 transition hover:brightness-110 active:scale-[0.99]"
      >
        <CheckCheck size={20} /> Confirm Selection · {formatPrice(summary.grandTotal)}
      </button>
    </section>
  )
}
