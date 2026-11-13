import test from 'node:test'
import assert from 'node:assert/strict'
import { generateSeatLayout, getSeatOwners, getSeatStatus } from './seatUtils.js'
import { assignSeat, removeAssignment, resizePassengers, reconcileAssignmentsForConfig, buildBookingSummary } from './bookingUtils.js'
import { formatPrice } from './pricingUtils.js'
import { createPassengers } from '../data/passengers.js'

const two = generateSeatLayout('3-2')
const three = generateSeatLayout('2-3-2')
const firstFree = (layout, pred = () => true) => layout.seats.find((s) => !s.occupied && pred(s))

test('layouts are generated with the right shape', () => {
  assert.equal(two.rows.length, 12)
  assert.ok(two.rows.every((r) => r.groups.length === 2 && r.groups[0].length === 3 && r.groups[1].length === 2))
  assert.ok(three.rows.every((r) => r.groups.map((g) => g.length).join() === '2,3,2'))
  assert.equal(two.seats.length, 60)
  assert.equal(three.seats.length, 84)
})

test('brief pricing examples hold', () => {
  const prices = Object.fromEntries(['1A', '1B', '1C', '1D', '1E', '2A', '2B', '2C'].map((id) => [id, two.seatsById[id].price]))
  assert.deepEqual(prices, { '1A': 0, '1B': 0, '1C': 350, '1D': 0, '1E': 250, '2A': 350, '2B': 0, '2C': 250 })
})

test('every category and some occupied seats exist in both layouts', () => {
  for (const layout of [two, three]) {
    for (const cat of ['standard', 'free', 'extra', 'premium']) assert.ok(layout.seats.some((s) => s.category === cat && !s.occupied), cat)
    assert.ok(layout.seats.some((s) => s.occupied))
  }
})

test('assign, change and release seats', () => {
  let a = {}
  const r1 = assignSeat({ assignments: a, passengerId: 'p1', seat: two.seatsById['1C'] })
  assert.ok(r1.ok); a = r1.assignments
  const r2 = assignSeat({ assignments: a, passengerId: 'p1', seat: two.seatsById['2A'] })
  assert.equal(r2.releasedSeatId, '1C'); a = r2.assignments
  assert.deepEqual(a, { p1: '2A' })
  assert.equal(getSeatOwners(a)['1C'], undefined) // 1C available again
  assert.equal(assignSeat({ assignments: a, passengerId: 'p2', seat: two.seatsById['2A'] }).code, 'TAKEN')
  assert.equal(assignSeat({ assignments: a, passengerId: null, seat: two.seatsById['2B'] }).code, 'NO_PASSENGER')
  const occ = two.seats.find((s) => s.occupied)
  assert.equal(assignSeat({ assignments: a, passengerId: 'p2', seat: occ }).code, 'OCCUPIED')
  // other passengers' seats survive
  a = assignSeat({ assignments: a, passengerId: 'p2', seat: two.seatsById['2B'] }).assignments
  assert.deepEqual(removeAssignment(a, 'p1').assignments, { p2: '2B' })
  assert.equal(getSeatStatus(two.seatsById['2B'], getSeatOwners(a), 'p2'), 'mine')
  assert.equal(getSeatStatus(two.seatsById['2B'], getSeatOwners(a), 'p1'), 'taken')
})

test('config change parks missing seats and restores them later', () => {
  const g = firstFree(three, (s) => s.letter === 'G')
  const c = two.seatsById['1C']
  const ids = ['p1', 'p2']
  const start = { p1: g.id, p2: c.id }
  const down = reconcileAssignmentsForConfig({ assignments: start, parked: {}, seatsById: two.seatsById, passengerIds: ids })
  assert.deepEqual(down.assignments, { p2: '1C' })
  assert.equal(down.dropped.length, 1)
  assert.equal(down.parked.p1, g.id)
  const up = reconcileAssignmentsForConfig({ assignments: down.assignments, parked: down.parked, seatsById: three.seatsById, passengerIds: ids })
  assert.deepEqual(up.assignments, start)
  assert.equal(up.restored.length, 1)
})

test('shrinking passengers releases their seats and meals', () => {
  const state = {
    passengers: createPassengers(3),
    seatAssignments: { p1: '1A', p3: '1B' },
    mealSelections: { p3: 'veg' },
    parkedAssignments: {},
    activePassengerId: 'p3',
  }
  const next = resizePassengers(state, 2)
  assert.deepEqual(next.seatAssignments, { p1: '1A' })
  assert.deepEqual(next.mealSelections, {})
  assert.equal(next.activePassengerId, null)
  assert.equal(resizePassengers(next, 6).passengers.length, 6)
})

test('totals are derived from state', () => {
  const summary = buildBookingSummary({
    passengers: createPassengers(3),
    seatAssignments: { p1: '1C', p2: '1E', p3: '2B' },
    mealSelections: { p1: 'veg', p2: 'premium' },
    seatsById: two.seatsById,
  })
  assert.equal(summary.seatTotal, 600)
  assert.equal(summary.mealTotal, 450)
  assert.equal(summary.grandTotal, 1050)
  assert.equal(formatPrice(1050), '₹1,050')
  assert.ok(summary.allAssigned)
})
