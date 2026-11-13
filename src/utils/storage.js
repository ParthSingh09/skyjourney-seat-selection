import { CABIN_CONFIGS } from '../data/seats.js'
import { MEALS_BY_ID } from '../data/meals.js'
import { MAX_NAME_LENGTH, MAX_PASSENGERS, MIN_PASSENGERS } from '../data/passengers.js'
import { generateSeatLayout } from './seatUtils.js'

const STORAGE_KEY = 'skyjourney.booking.v1'

/** Reads persisted booking state and sanitises it – bad/stale data is dropped, never trusted. */
export function loadPersistedState() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const data = JSON.parse(raw)

    const passengers = Array.isArray(data.passengers)
      ? data.passengers
          .filter((p) => p && /^p[1-6]$/.test(p.id) && typeof p.name === 'string')
          .slice(0, MAX_PASSENGERS)
          .map((p) => ({ id: p.id, name: p.name.slice(0, MAX_NAME_LENGTH) }))
      : []
    if (passengers.length < MIN_PASSENGERS) return null

    const configId = CABIN_CONFIGS[data.configId] ? data.configId : null
    if (!configId) return null
    const { seatsById } = generateSeatLayout(configId)
    const ids = new Set(passengers.map((p) => p.id))

    const used = new Set()
    const seatAssignments = {}
    Object.entries(data.seatAssignments ?? {}).forEach(([pid, seatId]) => {
      const seat = seatsById[seatId]
      if (ids.has(pid) && seat && !seat.occupied && !used.has(seatId)) {
        seatAssignments[pid] = seatId
        used.add(seatId)
      }
    })

    const mealSelections = Object.fromEntries(
      Object.entries(data.mealSelections ?? {}).filter(([pid, mealId]) => ids.has(pid) && MEALS_BY_ID[mealId]),
    )
    const parkedAssignments = Object.fromEntries(
      Object.entries(data.parkedAssignments ?? {}).filter(([pid, seatId]) => ids.has(pid) && typeof seatId === 'string'),
    )
    const activePassengerId = ids.has(data.activePassengerId) ? data.activePassengerId : null

    return { passengers, configId, seatAssignments, mealSelections, parkedAssignments, activePassengerId }
  } catch {
    return null
  }
}

export function savePersistedState(state) {
  try {
    const { passengers, configId, seatAssignments, mealSelections, parkedAssignments, activePassengerId } = state
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ passengers, configId, seatAssignments, mealSelections, parkedAssignments, activePassengerId }),
    )
  } catch {
    /* storage unavailable (private mode / quota) – persistence is optional */
  }
}

export function clearPersistedState() {
  try {
    window.localStorage.removeItem(STORAGE_KEY)
  } catch {
    /* ignore */
  }
}
