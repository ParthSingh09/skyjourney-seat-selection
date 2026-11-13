export const FLIGHT = {
  airline: 'SkyJourney',
  number: 'SJ 204',
  date: 'Fri, 20 Nov 2026',
  origin: { code: 'DEL', city: 'New Delhi', airport: 'Indira Gandhi Intl' },
  destination: { code: 'BOM', city: 'Mumbai', airport: 'Chhatrapati Shivaji Maharaj Intl' },
  departure: '09:30 AM',
  arrival: '11:45 AM',
  duration: '2h 15m',
  aircraft: 'Airbus A320neo',
  cabin: 'Economy',
}

export const USER = { name: 'Aarav Mehta', tier: 'Gold Member', initials: 'AM' }

// Booking progress is purely visual – Seat Selection is the current step.
export const BOOKING_STEPS = [
  { id: 'flight', label: 'Flight Details' },
  { id: 'passengers', label: 'Passenger Details' },
  { id: 'seats', label: 'Seat Selection', anchor: 'seats' },
  { id: 'meals', label: 'Meals', anchor: 'meals' },
  { id: 'review', label: 'Review & Summary', anchor: 'review' },
]
export const CURRENT_STEP_ID = 'seats'
