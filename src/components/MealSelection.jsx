import { Check, Drumstick, Leaf, Salad, Sparkles, UtensilsCrossed, Ban } from 'lucide-react'
import { MEALS } from '../data/meals.js'
import { getInitials } from './seatVisuals.js'
import { formatPrice } from '../utils/pricingUtils.js'

const MEAL_ICONS = { standard: UtensilsCrossed, veg: Leaf, nonveg: Drumstick, premium: Sparkles, none: Ban }

/**
 * One meal per passenger. The chips choose *whose* meal you're editing (shared
 * with the seat map's active passenger); selections persist per passenger.
 */
export default function MealSelection({ passengers, activePassengerId, mealSelections, onSelectPassenger, onSelectMeal }) {
  const active = passengers.find((p) => p.id === activePassengerId)
  const selectedMealId = active ? mealSelections[active.id] : null

  return (
    <section id="meals" aria-labelledby="meals-title" className="rounded-3xl border border-slate-200/80 bg-white p-4 shadow-sm sm:p-6">
      <div className="flex items-center gap-3">
        <span className="grid size-10 place-items-center rounded-xl bg-orange-50 text-orange-600"><Salad size={20} /></span>
        <div>
          <h2 id="meals-title" className="text-lg font-bold text-navy-900">Pre-order meals <span className="ml-1 rounded-full bg-orange-100 px-2 py-0.5 align-middle text-[10px] font-bold uppercase tracking-wide text-orange-700">Bonus</span></h2>
          <p className="text-sm text-slate-500">One meal per passenger. Pick a traveller, then a meal.</p>
        </div>
      </div>

      <div className="thin-scroll mt-5 flex gap-2 overflow-x-auto pb-1" role="tablist" aria-label="Passenger for meal selection">
        {passengers.map((p) => {
          const meal = MEALS.find((m) => m.id === mealSelections[p.id])
          const isActive = p.id === activePassengerId
          return (
            <button
              key={p.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => onSelectPassenger(p.id)}
              className={`flex shrink-0 items-center gap-2.5 rounded-xl border-2 py-1.5 pl-1.5 pr-3.5 text-left transition ${isActive ? 'border-navy-700 bg-navy-50' : 'border-slate-200 hover:border-navy-200'}`}
            >
              <span className={`grid size-8 place-items-center rounded-full text-xs font-extrabold ${isActive ? 'bg-navy-800 text-white' : 'bg-slate-100 text-slate-600'}`}>{getInitials(p.name)}</span>
              <span className="leading-tight">
                <span className="block max-w-28 truncate text-sm font-bold text-navy-900">{p.name}</span>
                <span className={`block text-[11px] font-medium ${meal ? 'text-emerald-600' : 'text-slate-500'}`}>{meal ? meal.name : 'No selection'}</span>
              </span>
            </button>
          )
        })}
      </div>

      {!active && <p className="mt-4 rounded-xl bg-amber-50 px-3.5 py-2.5 text-sm font-medium text-amber-800">Select a passenger above to choose their meal.</p>}

      <div className={`mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3 ${active ? '' : 'pointer-events-none opacity-50'}`} role="radiogroup" aria-label={`Meal for ${active?.name ?? 'passenger'}`}>
        {MEALS.map((meal) => {
          const Icon = MEAL_ICONS[meal.id]
          const selected = selectedMealId === meal.id
          return (
            <button
              key={meal.id}
              type="button"
              role="radio"
              aria-checked={selected}
              disabled={!active}
              onClick={() => onSelectMeal(active.id, meal.id)}
              className={`relative flex flex-col rounded-2xl border-2 p-4 text-left transition hover:-translate-y-0.5 hover:shadow-md ${selected ? 'border-navy-700 bg-navy-50 shadow-md shadow-navy-700/10' : 'border-slate-200 bg-white hover:border-navy-200'}`}
            >
              <span className="flex items-start justify-between">
                <span className={`grid size-10 place-items-center rounded-xl ${selected ? 'bg-navy-800 text-white' : 'bg-slate-100 text-slate-600'}`}><Icon size={19} /></span>
                {selected && <span className="grid size-6 place-items-center rounded-full bg-teal-500 text-white"><Check size={14} strokeWidth={3} /></span>}
              </span>
              <span className="mt-3 text-sm font-bold text-navy-900">{meal.name}</span>
              <span className="mt-1 flex-1 text-xs leading-relaxed text-slate-500">{meal.description}</span>
              <span className="mt-3 flex items-center justify-between">
                <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">{meal.tag}</span>
                <span className={`text-sm font-extrabold ${meal.price ? 'text-navy-900' : 'text-emerald-600'}`}>{meal.price ? formatPrice(meal.price) : 'Free'}</span>
              </span>
            </button>
          )
        })}
      </div>
    </section>
  )
}
