import { MEALS_BY_ID } from '../data/meals.js'

const inr = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
})

/** ₹1,250 – Indian digit grouping with the rupee symbol. */
export const formatPrice = (amount) => inr.format(amount).replace(/\s/g, '')

export const getSeatPrice = (seatId, seatsById) => seatsById[seatId]?.price ?? 0

export const getMealPrice = (mealId) => MEALS_BY_ID[mealId]?.price ?? 0

/** Sum of seat prices, always derived from the live assignment map. */
export const calculateSeatTotal = (assignments, seatsById) =>
  Object.values(assignments).reduce((sum, seatId) => sum + getSeatPrice(seatId, seatsById), 0)

/** Sum of meal prices for the passengers that still exist. */
export const calculateMealTotal = (mealSelections, passengerIds) =>
  passengerIds.reduce((sum, id) => sum + getMealPrice(mealSelections[id]), 0)

export const calculateGrandTotal = (seatTotal, mealTotal) => seatTotal + mealTotal
