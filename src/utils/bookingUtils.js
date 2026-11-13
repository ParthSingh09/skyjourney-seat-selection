import { MAX_PASSENGERS, MIN_PASSENGERS, createPassenger } from '../data/passengers.js'
import { MEALS_BY_ID } from '../data/meals.js'
import { SEAT_CATEGORIES } from '../data/seats.js'
import { getSeatOwners, isSeatAvailable } from './seatUtils.js'
import { calculateGrandTotal, calculateMealTotal, calculateSeatTotal, getMealPrice } from './pricingUtils.js'

/* ------------------------------------------------------------------ *
 * Seat assignment – pure functions, no React. Each returns a result
 * object instead of throwing so the UI can show the right message.
 * ------------------------------------------------------------------ */

/**
 * Assign `seat` to `passengerId`.
 * Rules enforced here:
 *  - a passenger must be selected
 *  - occupied seats and seats owned by someone else are rejected
 *  - a passenger holds ONE seat: assigning a new one releases the old one
 *    (the map is passengerId → seatId, so this falls out naturally)
 */
export function assignSeat({ assignments, passengerId, seat }) {
  if (!passengerId) return { ok: false, code: 'NO_PASSENGER' }
  if (!seat) return { ok: false, code: 'NO_SEAT' }
  if (seat.occupied) return { ok: false, code: 'OCCUPIED' }

  const owners = getSeatOwners(assignments)
  if (owners[seat.id] === passengerId) return { ok: false, code: 'ALREADY_YOURS' }
  if (!isSeatAvailable(seat, owners)) return { ok: false, code: 'TAKEN', ownerId: owners[seat.id] }

  const releasedSeatId = assignments[passengerId] ?? null
  return { ok: true, assignments: { ...assignments, [passengerId]: seat.id }, releasedSeatId }
}

/** Remove a passenger's seat; the seat instantly becomes available again. */
export function removeAssignment(assignments, passengerId) {
  const releasedSeatId = assignments[passengerId] ?? null
  if (!releasedSeatId) return { assignments, releasedSeatId: null }
  const { [passengerId]: _released, ...rest } = assignments
  return { assignments: rest, releasedSeatId }
}

/** Next passenger without a seat, searching forward from `afterId` and wrapping. */
export function findNextUnassignedPassenger(passengers, assignments, afterId) {
  const start = Math.max(passengers.findIndex((p) => p.id === afterId), -1)
  for (let step = 1; step <= passengers.length; step += 1) {
    const candidate = passengers[(start + step) % passengers.length]
    if (candidate && !assignments[candidate.id]) return candidate
  }
  return null
}

/* ------------------------------------------------------------------ *
 * Passenger count changes
 * ------------------------------------------------------------------ */

const omitKeys = (obj, keys) => Object.fromEntries(Object.entries(obj).filter(([k]) => !keys.includes(k)))

/** Which passengers (and what they'd lose) a reduction to `count` would affect. */
export function getPassengerRemovalImpact({ passengers, seatAssignments, mealSelections }, count) {
  return passengers
    .slice(count)
    .filter((p) => seatAssignments[p.id] || mealSelections[p.id])
    .map((p) => ({ passenger: p, seatId: seatAssignments[p.id] ?? null, mealId: mealSelections[p.id] ?? null }))
}

/**
 * Grow or shrink the passenger list. Existing passengers (names, seats, meals)
 * are untouched; removed passengers release their seat, meal and parked seat.
 */
export function resizePassengers(state, rawCount) {
  const count = Math.min(MAX_PASSENGERS, Math.max(MIN_PASSENGERS, rawCount))
  const { passengers, seatAssignments, mealSelections, parkedAssignments, activePassengerId } = state

  if (count >= passengers.length) {
    const added = Array.from({ length: count - passengers.length }, (_, i) => createPassenger(passengers.length + i))
    return { ...state, passengers: [...passengers, ...added] }
  }

  const keep = passengers.slice(0, count)
  const removedIds = passengers.slice(count).map((p) => p.id)
  return {
    ...state,
    passengers: keep,
    seatAssignments: omitKeys(seatAssignments, removedIds),
    mealSelections: omitKeys(mealSelections, removedIds),
    parkedAssignments: omitKeys(parkedAssignments, removedIds),
    activePassengerId: removedIds.includes(activePassengerId) ? null : activePassengerId,
  }
}

/* ------------------------------------------------------------------ *
 * Changing aircraft configuration
 * ------------------------------------------------------------------ */

/**
 * Re-map assignments onto a new cabin without losing information:
 *  1. seats that still exist (and are bookable) stay put
 *  2. seats that don't exist (e.g. 3F in a 5-abreast cabin) are *parked*
 *     and reported as `dropped` so the UI can warn the user
 *  3. previously parked seats are restored when they exist again and are free
 */
export function reconcileAssignmentsForConfig({ assignments, parked, seatsById, passengerIds }) {
  const nextAssignments = {}
  const nextParked = { ...parked }
  const dropped = []
  const restored = []

  Object.entries(assignments).forEach(([passengerId, seatId]) => {
    const seat = seatsById[seatId]
    if (seat && !seat.occupied) nextAssignments[passengerId] = seatId
    else {
      nextParked[passengerId] = seatId
      dropped.push({ passengerId, seatId, reason: seat ? 'occupied' : 'missing' })
    }
  })

  const taken = new Set(Object.values(nextAssignments))
  Object.entries(nextParked).forEach(([passengerId, seatId]) => {
    const seat = seatsById[seatId]
    const canRestore = passengerIds.includes(passengerId) && !nextAssignments[passengerId] && seat && !seat.occupied && !taken.has(seatId)
    if (canRestore) {
      nextAssignments[passengerId] = seatId
      taken.add(seatId)
      restored.push({ passengerId, seatId })
      delete nextParked[passengerId]
    }
  })

  // Don't keep a parked seat for a passenger who has since chosen another one.
  Object.keys(nextParked).forEach((id) => {
    if (nextAssignments[id] && !dropped.some((d) => d.passengerId === id)) delete nextParked[id]
  })

  return { assignments: nextAssignments, parked: nextParked, dropped, restored }
}

/* ------------------------------------------------------------------ *
 * Summary – every figure is derived from the assignment/meal state.
 * ------------------------------------------------------------------ */

export function buildBookingSummary({ passengers, seatAssignments, mealSelections, seatsById }) {
  const rows = passengers.map((passenger) => {
    const seat = seatsById[seatAssignments[passenger.id]] ?? null
    const meal = MEALS_BY_ID[mealSelections[passenger.id]] ?? null
    return {
      passenger,
      seat,
      seatCategory: seat ? SEAT_CATEGORIES[seat.category] : null,
      seatPrice: seat ? seat.price : 0,
      meal,
      mealPrice: getMealPrice(meal?.id),
    }
  })

  // Totals use only passengers that still exist, so stale data can never leak in.
  const liveAssignments = Object.fromEntries(passengers.filter((p) => seatAssignments[p.id]).map((p) => [p.id, seatAssignments[p.id]]))
  const seatTotal = calculateSeatTotal(liveAssignments, seatsById)
  const mealTotal = calculateMealTotal(mealSelections, passengers.map((p) => p.id))
  const assignedCount = rows.filter((r) => r.seat).length

  return {
    rows,
    seatTotal,
    mealTotal,
    grandTotal: calculateGrandTotal(seatTotal, mealTotal),
    assignedCount,
    unassignedCount: passengers.length - assignedCount,
    allAssigned: assignedCount === passengers.length,
  }
}
