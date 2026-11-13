import {
  CABIN_CONFIGS,
  EXIT_ROWS,
  SEAT_CATEGORIES,
  SEAT_CATEGORY_OVERRIDES,
  TOTAL_ROWS,
} from '../data/seats.js'

const letterIndex = (letter) => letter.charCodeAt(0) - 64 // A = 1

/**
 * Category depends ONLY on (row, letter) – never on the cabin configuration –
 * so seat "3C" is the same seat, at the same price, in both layouts.
 */
function resolveCategory(row, letter) {
  const id = `${row}${letter}`
  if (SEAT_CATEGORY_OVERRIDES[id]) return SEAT_CATEGORY_OVERRIDES[id]
  if (EXIT_ROWS.includes(row)) return 'extra'
  if (row <= 6 && (letter === 'A' || letter === 'C')) return 'premium'
  if (row >= 7 && (row + letterIndex(letter)) % 3 === 0) return 'free'
  return 'standard'
}

/** Deterministic "already booked" seats so the demo is stable between reloads. */
function resolveOccupied(row, letter) {
  if (row <= 2) return false // keep the rows from the brief bookable
  return (row * 7 + letterIndex(letter) * 13) % 6 === 1
}

const layoutCache = new Map()

/**
 * Builds the full cabin for a configuration.
 * Returns rows (with seat groups for rendering) plus flat lookups.
 */
export function generateSeatLayout(configId, totalRows = TOTAL_ROWS) {
  const cacheKey = `${configId}:${totalRows}`
  if (layoutCache.has(cacheKey)) return layoutCache.get(cacheKey)

  const config = CABIN_CONFIGS[configId]
  if (!config) throw new Error(`Unknown cabin configuration: ${configId}`)

  const seatsById = {}
  const rows = Array.from({ length: totalRows }, (_, i) => {
    const number = i + 1
    const groups = config.groups.map((letters) =>
      letters.map((letter) => {
        const category = resolveCategory(number, letter)
        const seat = {
          id: `${number}${letter}`,
          row: number,
          letter,
          category,
          price: SEAT_CATEGORIES[category].price,
          occupied: resolveOccupied(number, letter),
          isExitRow: EXIT_ROWS.includes(number),
        }
        seatsById[seat.id] = seat
        return seat
      }),
    )
    return { number, groups, isExit: EXIT_ROWS.includes(number) }
  })

  const seats = Object.values(seatsById)
  const layout = {
    config,
    rows,
    seats,
    seatsById,
    availableCount: seats.filter((s) => !s.occupied).length,
  }
  layoutCache.set(cacheKey, layout)
  return layout
}

/** Inverts passengerId → seatId into seatId → passengerId. */
export const getSeatOwners = (assignments) =>
  Object.fromEntries(Object.entries(assignments).map(([passengerId, seatId]) => [seatId, passengerId]))

/** A seat can be picked only if it exists, isn't pre-booked and has no owner. */
export const isSeatAvailable = (seat, owners) => Boolean(seat) && !seat.occupied && !owners[seat.id]

/** Visual/interaction state of a seat from the active passenger's point of view. */
export function getSeatStatus(seat, owners, activePassengerId) {
  if (seat.occupied) return 'occupied'
  const owner = owners[seat.id]
  if (!owner) return 'available'
  return owner === activePassengerId ? 'mine' : 'taken'
}
