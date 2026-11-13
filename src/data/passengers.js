export const MIN_PASSENGERS = 1
export const MAX_PASSENGERS = 6
export const DEFAULT_PASSENGER_COUNT = 3
export const MAX_NAME_LENGTH = 24

const DEFAULT_NAMES = ['John Doe', 'Jane Doe', 'Alex Smith', 'Maria Garcia', 'Rahul Sharma', 'Priya Patel']

/**
 * Passenger ids are position based (p1…p6) – unique within a booking and
 * stable while the passenger exists, so assignments can key off them safely.
 */
export const createPassenger = (index) => ({
  id: `p${index + 1}`,
  name: DEFAULT_NAMES[index] ?? `Passenger ${index + 1}`,
})

export const createPassengers = (count) => Array.from({ length: count }, (_, i) => createPassenger(i))
