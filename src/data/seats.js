/** Seat categories. `price` is the single source of truth for seat pricing. */
export const SEAT_CATEGORIES = {
  standard: { id: 'standard', label: 'Standard', price: 0, blurb: 'Regular economy seat' },
  free: { id: 'free', label: 'Free Seat', price: 0, blurb: 'Complimentary pick, no extra charge' },
  extra: { id: 'extra', label: 'Extra Legroom', price: 350, blurb: 'Up to 6" more legroom' },
  premium: { id: 'premium', label: 'Premium', price: 250, blurb: 'Forward zone, priority boarding' },
}

/**
 * Cabin configurations. Each inner array is one block of seats; the gap
 * between blocks is an aisle. Layouts are generated from these – nothing
 * about the seat map is hard-coded in JSX.
 */
export const CABIN_CONFIGS = {
  '3-2': {
    id: '3-2',
    label: '3–2',
    description: '5 seats per row',
    groups: [['A', 'B', 'C'], ['D', 'E']],
  },
  '2-3-2': {
    id: '2-3-2',
    label: '2–3–2',
    description: '7 seats per row',
    groups: [['A', 'B'], ['C', 'D', 'E'], ['F', 'G']],
  },
}

export const DEFAULT_CONFIG_ID = '3-2'
export const TOTAL_ROWS = 12
export const EXIT_ROWS = [4, 9]

/** Hand-picked seats from the assessment brief (rows 1–2). */
export const SEAT_CATEGORY_OVERRIDES = {
  '1A': 'standard',
  '1B': 'standard',
  '1C': 'extra',
  '1D': 'standard',
  '1E': 'premium',
  '2A': 'extra',
  '2B': 'standard',
  '2C': 'premium',
  '2D': 'standard',
  '2E': 'standard',
}
