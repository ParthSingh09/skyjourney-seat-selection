import { useState } from 'react'
import { ChevronUp, Receipt } from 'lucide-react'
import { formatPrice } from '../utils/pricingUtils.js'

/** Seat lines + totals. Every number comes from the derived `summary`. */
function Breakdown({ summary }) {
  return (
    <>
      <ul className="space-y-2.5">
        {summary.rows.map(({ passenger, seat, seatPrice }, i) => (
          <li key={passenger.id} className="flex items-baseline justify-between gap-3 text-sm">
            <span className="min-w-0 truncate text-slate-600">
              <span className="font-semibold text-navy-900">Passenger {i + 1}</span> – {seat ? `Seat ${seat.id}` : <span className="text-amber-600">No seat</span>}
            </span>
            <span className="shrink-0 font-semibold tabular-nums text-navy-900">{formatPrice(seatPrice)}</span>
          </li>
        ))}
      </ul>
      <div className="mt-4 border-t border-dashed border-slate-300 pt-4">
        <div className="flex items-baseline justify-between">
          <span className="text-sm font-bold text-navy-900">Total Seat Charges</span>
          <span className="text-xl font-extrabold tabular-nums text-navy-900">{formatPrice(summary.seatTotal)}</span>
        </div>
        <div className="mt-2 flex justify-between text-xs text-slate-500">
          <span>Meal charges</span>
          <span className="font-semibold tabular-nums">{formatPrice(summary.mealTotal)}</span>
        </div>
      </div>
    </>
  )
}

export default function PriceSummary({ summary, passengerCount }) {
  return (
    <aside aria-label="Price summary" className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm lg:shadow-lg lg:shadow-navy-900/5">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-base font-bold text-navy-900"><Receipt size={18} className="text-navy-600" /> Price summary</h2>
        <span className="rounded-full bg-navy-50 px-2.5 py-1 text-xs font-bold text-navy-700">{passengerCount} passenger{passengerCount > 1 ? 's' : ''}</span>
      </div>
      <Breakdown summary={summary} />
      <div className="mt-4 flex items-center justify-between rounded-2xl bg-navy-900 px-4 py-3.5 text-white">
        <span className="text-sm font-semibold text-white/80">Grand total</span>
        <span className="text-2xl font-extrabold tabular-nums" aria-live="polite">{formatPrice(summary.grandTotal)}</span>
      </div>
      <p className="mt-3 text-center text-xs text-slate-500">{summary.assignedCount}/{passengerCount} seats assigned</p>
    </aside>
  )
}

/** Compact sticky bar for phones; expands upward to show the breakdown. */
export function MobilePriceBar({ summary, passengerCount }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 shadow-[0_-8px_24px_-12px_rgba(11,27,61,0.25)] backdrop-blur md:hidden" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
      {open && (
        <div className="max-h-[50dvh] animate-fade-in overflow-y-auto border-b border-slate-100 px-4 py-4">
          <Breakdown summary={summary} />
        </div>
      )}
      <div className="flex items-center gap-3 px-4 py-3">
        <button type="button" onClick={() => setOpen((v) => !v)} aria-expanded={open} className="flex min-w-0 flex-1 items-center gap-2 text-left">
          <ChevronUp size={18} className={`shrink-0 text-slate-500 transition ${open ? 'rotate-180' : ''}`} />
          <span className="min-w-0 leading-tight">
            <span className="block text-[11px] font-medium text-slate-500">{passengerCount} pax · {summary.assignedCount} seat{summary.assignedCount === 1 ? '' : 's'} · Seats {formatPrice(summary.seatTotal)}</span>
            <span className="block text-lg font-extrabold tabular-nums text-navy-900">{formatPrice(summary.grandTotal)}</span>
          </span>
        </button>
        <a href="#review" onClick={() => setOpen(false)} className="rounded-xl bg-navy-800 px-5 py-3 text-sm font-bold text-white active:scale-95">Review</a>
      </div>
    </div>
  )
}
