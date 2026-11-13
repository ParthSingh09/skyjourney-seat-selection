import { useCallback, useEffect, useMemo, useReducer, useRef } from 'react'
import { DEFAULT_CONFIG_ID } from '../data/seats.js'
import { MEALS_BY_ID } from '../data/meals.js'
import { DEFAULT_PASSENGER_COUNT, MAX_NAME_LENGTH, createPassengers } from '../data/passengers.js'
import { generateSeatLayout, getSeatOwners } from '../utils/seatUtils.js'
import {
  assignSeat,
  buildBookingSummary,
  findNextUnassignedPassenger,
  getPassengerRemovalImpact,
  reconcileAssignmentsForConfig,
  removeAssignment,
  resizePassengers,
} from '../utils/bookingUtils.js'
import { formatPrice } from '../utils/pricingUtils.js'
import { clearPersistedState, loadPersistedState, savePersistedState } from '../utils/storage.js'

/* ---------------------------- state shape ---------------------------- *
 * passengers          [{ id, name }]
 * activePassengerId   id | null
 * configId            '3-2' | '2-3-2'
 * seatAssignments     { [passengerId]: seatId }   ← single source of truth for seats
 * parkedAssignments   { [passengerId]: seatId }   seats hidden by a config change (restorable)
 * mealSelections      { [passengerId]: mealId }
 * modal               null | { type: 'seat'|'confirm'|'booking', … }
 * passengerPrompt     counter bumped to draw attention to the passenger panel
 * ------------------------------------------------------------------- */

const createInitialState = () => ({
  passengers: createPassengers(DEFAULT_PASSENGER_COUNT),
  activePassengerId: null,
  configId: DEFAULT_CONFIG_ID,
  seatAssignments: {},
  parkedAssignments: {},
  mealSelections: {},
  modal: null,
  passengerPrompt: 0,
})

const init = () => ({ ...createInitialState(), ...(loadPersistedState() ?? {}) })

function reducer(state, action) {
  switch (action.type) {
    case 'passengers/replace':
      return { ...state, ...action.payload, modal: null }
    case 'passenger/rename':
      return {
        ...state,
        passengers: state.passengers.map((p) => (p.id === action.id ? { ...p, name: action.name } : p)),
      }
    case 'passenger/activate':
      return { ...state, activePassengerId: action.id }
    case 'passenger/prompt':
      return { ...state, passengerPrompt: state.passengerPrompt + 1 }
    case 'seats/replace':
      return { ...state, seatAssignments: action.seatAssignments, activePassengerId: action.activePassengerId ?? state.activePassengerId }
    case 'meal/set':
      return { ...state, mealSelections: { ...state.mealSelections, [action.passengerId]: action.mealId } }
    case 'config/replace':
      return { ...state, configId: action.configId, seatAssignments: action.seatAssignments, parkedAssignments: action.parkedAssignments, modal: null }
    case 'modal/open':
      return { ...state, modal: action.modal }
    case 'modal/close':
      return { ...state, modal: null }
    case 'reset':
      return { ...createInitialState(), passengerPrompt: state.passengerPrompt }
    default:
      return state
  }
}

export function useBooking(notify) {
  const [state, rawDispatch] = useReducer(reducer, undefined, init)

  // Handlers read the latest state through a ref so they can stay referentially
  // stable (keeps memoised seat components from re-rendering needlessly).
  // The ref is advanced synchronously with the same pure reducer React uses, so two
  // actions fired in the same tick (e.g. a double click) never see stale state.
  const stateRef = useRef(state)
  const dispatch = useCallback((action) => {
    stateRef.current = reducer(stateRef.current, action)
    rawDispatch(action)
  }, [])

  useEffect(() => {
    savePersistedState(state)
  }, [state.passengers, state.configId, state.seatAssignments, state.parkedAssignments, state.mealSelections, state.activePassengerId]) // eslint-disable-line react-hooks/exhaustive-deps

  /* ------------------------------ derived ------------------------------ */
  const layout = useMemo(() => generateSeatLayout(state.configId), [state.configId])
  const seatOwners = useMemo(() => getSeatOwners(state.seatAssignments), [state.seatAssignments])
  const passengersById = useMemo(() => Object.fromEntries(state.passengers.map((p) => [p.id, p])), [state.passengers])
  const summary = useMemo(
    () =>
      buildBookingSummary({
        passengers: state.passengers,
        seatAssignments: state.seatAssignments,
        mealSelections: state.mealSelections,
        seatsById: layout.seatsById,
      }),
    [state.passengers, state.seatAssignments, state.mealSelections, layout],
  )
  const availableSeatCount = layout.availableCount - Object.keys(state.seatAssignments).length

  /* ----------------------------- passengers ---------------------------- */
  const selectPassenger = useCallback((id) => dispatch({ type: 'passenger/activate', id }), [])

  const renamePassenger = useCallback((id, rawName) => {
    const passengers = stateRef.current.passengers
    const index = passengers.findIndex((p) => p.id === id)
    const name = rawName.trim().slice(0, MAX_NAME_LENGTH) || createPassengers(index + 1)[index].name
    dispatch({ type: 'passenger/rename', id, name })
  }, [])

  const applyPassengerCount = useCallback(
    (count) => {
      const current = stateRef.current
      const impact = getPassengerRemovalImpact(current, count)
      const next = resizePassengers(current, count)
      dispatch({
        type: 'passengers/replace',
        payload: {
          passengers: next.passengers,
          seatAssignments: next.seatAssignments,
          mealSelections: next.mealSelections,
          parkedAssignments: next.parkedAssignments,
          activePassengerId: next.activePassengerId,
        },
      })
      if (count > current.passengers.length) notify('success', `Now booking for ${count} passengers.`)
      else if (impact.length) {
        const seats = impact.filter((i) => i.seatId).map((i) => i.seatId)
        notify('warning', `Removed ${current.passengers.length - count} passenger(s).${seats.length ? ` Released seat${seats.length > 1 ? 's' : ''} ${seats.join(', ')}.` : ''}`)
      } else notify('info', `Now booking for ${count} passenger${count > 1 ? 's' : ''}.`)
    },
    [notify],
  )

  /** Shrinking the party can discard seats/meals, so ask first when that would happen. */
  const requestPassengerCount = useCallback(
    (count) => {
      const current = stateRef.current
      if (count === current.passengers.length) return
      const impact = count < current.passengers.length ? getPassengerRemovalImpact(current, count) : []
      if (!impact.length) return applyPassengerCount(count)
      dispatch({
        type: 'modal/open',
        modal: {
          type: 'confirm',
          kind: 'passengers',
          count,
          title: `Reduce to ${count} passenger${count > 1 ? 's' : ''}?`,
          message: 'These passengers will be removed and their selections released:',
          items: impact.map((i) => {
            const bits = [i.seatId && `Seat ${i.seatId}`, i.mealId && MEALS_BY_ID[i.mealId].name].filter(Boolean)
            return `${i.passenger.name} – ${bits.join(' · ')}`
          }),
          confirmLabel: 'Remove passengers',
        },
      })
    },
    [applyPassengerCount],
  )

  /* ------------------------------- seats ------------------------------- */
  const onSeatClick = useCallback(
    (seatId) => {
      const { configId, activePassengerId, seatAssignments, passengers } = stateRef.current
      const seat = generateSeatLayout(configId).seatsById[seatId]
      if (!seat) return
      if (seat.occupied) return notify('error', `Seat ${seat.id} is already occupied.`)
      if (!activePassengerId) {
        dispatch({ type: 'passenger/prompt' })
        return notify('warning', 'Select a passenger first, then choose a seat.')
      }
      const ownerId = getSeatOwners(seatAssignments)[seatId]
      if (ownerId && ownerId !== activePassengerId) {
        const owner = passengers.find((p) => p.id === ownerId)
        notify('error', `Seat ${seat.id} is already assigned to ${owner?.name ?? 'another passenger'}.`)
      }
      dispatch({ type: 'modal/open', modal: { type: 'seat', seatId } })
    },
    [notify],
  )

  const confirmSeat = useCallback(
    (seatId) => {
      const { configId, activePassengerId, seatAssignments, passengers } = stateRef.current
      const seat = generateSeatLayout(configId).seatsById[seatId]
      const result = assignSeat({ assignments: seatAssignments, passengerId: activePassengerId, seat })
      if (!result.ok) {
        const messages = {
          NO_PASSENGER: 'Select a passenger first.',
          OCCUPIED: `Seat ${seatId} is already occupied.`,
          TAKEN: `Seat ${seatId} is already assigned to ${passengers.find((p) => p.id === result.ownerId)?.name}.`,
          ALREADY_YOURS: `Seat ${seatId} is already assigned to this passenger.`,
        }
        notify(result.code === 'ALREADY_YOURS' ? 'info' : 'error', messages[result.code] ?? 'That seat cannot be selected.')
        dispatch({ type: 'modal/close' })
        return
      }

      const passenger = passengers.find((p) => p.id === activePassengerId)
      // After a FIRST seat, jump to the next passenger who still needs one.
      // When the passenger is just changing seats, stay on them.
      const next = result.releasedSeatId ? null : findNextUnassignedPassenger(passengers, result.assignments, activePassengerId)
      dispatch({ type: 'seats/replace', seatAssignments: result.assignments, activePassengerId: next?.id ?? activePassengerId })
      dispatch({ type: 'modal/close' })

      // Keep the toast short – the seat-map banner already says who is selecting next.
      const price = seat.price ? ` (${formatPrice(seat.price)})` : ''
      const released = result.releasedSeatId ? ` ${result.releasedSeatId} is free again.` : ''
      const allSeated = passengers.every((p) => result.assignments[p.id])
      notify('success', `Seat ${seat.id}${price} → ${passenger.name}.${released}${allSeated ? ' Everyone is seated!' : ''}`)
    },
    [notify],
  )

  const removeSeat = useCallback(
    (passengerId) => {
      const { seatAssignments, passengers } = stateRef.current
      const { assignments, releasedSeatId } = removeAssignment(seatAssignments, passengerId)
      if (!releasedSeatId) return
      dispatch({ type: 'seats/replace', seatAssignments: assignments })
      dispatch({ type: 'modal/close' })
      const name = passengers.find((p) => p.id === passengerId)?.name
      notify('info', `Seat ${releasedSeatId} removed from ${name} and is available again.`)
    },
    [notify],
  )

  const switchToPassenger = useCallback((id) => {
    dispatch({ type: 'passenger/activate', id })
    dispatch({ type: 'modal/close' })
  }, [])

  /* -------------------------------- meals ------------------------------- */
  const setMeal = useCallback(
    (passengerId, mealId) => {
      const name = stateRef.current.passengers.find((p) => p.id === passengerId)?.name
      dispatch({ type: 'meal/set', passengerId, mealId })
      notify('success', `${MEALS_BY_ID[mealId].name} selected for ${name}.`, 2400)
    },
    [notify],
  )

  /* ---------------------------- configuration --------------------------- */
  const applyConfigChange = useCallback(
    (configId) => {
      const { seatAssignments, parkedAssignments, passengers } = stateRef.current
      const next = generateSeatLayout(configId)
      const result = reconcileAssignmentsForConfig({
        assignments: seatAssignments,
        parked: parkedAssignments,
        seatsById: next.seatsById,
        passengerIds: passengers.map((p) => p.id),
      })
      dispatch({ type: 'config/replace', configId, seatAssignments: result.assignments, parkedAssignments: result.parked })

      const nameOf = (id) => passengers.find((p) => p.id === id)?.name
      notify('success', `Switched to ${next.config.label} layout.`)
      if (result.dropped.length)
        notify('warning', `Seat${result.dropped.length > 1 ? 's' : ''} ${result.dropped.map((d) => `${d.seatId} (${nameOf(d.passengerId)})`).join(', ')} not available in this layout – please reassign.`, 6000)
      if (result.restored.length)
        notify('info', `Restored ${result.restored.map((r) => `${r.seatId} for ${nameOf(r.passengerId)}`).join(', ')}.`, 5000)
    },
    [notify],
  )

  /** Warn (rather than silently drop) when a layout change would unseat someone. */
  const requestConfigChange = useCallback(
    (configId) => {
      const current = stateRef.current
      if (configId === current.configId) return
      const next = generateSeatLayout(configId)
      const { dropped } = reconcileAssignmentsForConfig({
        assignments: current.seatAssignments,
        parked: current.parkedAssignments,
        seatsById: next.seatsById,
        passengerIds: current.passengers.map((p) => p.id),
      })
      if (!dropped.length) return applyConfigChange(configId)
      dispatch({
        type: 'modal/open',
        modal: {
          type: 'confirm',
          kind: 'config',
          configId,
          title: `Switch to ${next.config.label} layout?`,
          message: 'These seats don’t exist in the new layout. Those passengers will need a new seat (we’ll restore them if you switch back):',
          items: dropped.map((d) => `${current.passengers.find((p) => p.id === d.passengerId)?.name} – Seat ${d.seatId}`),
          confirmLabel: 'Switch layout',
        },
      })
    },
    [applyConfigChange],
  )

  const confirmPending = useCallback(() => {
    const { modal } = stateRef.current
    if (modal?.type !== 'confirm') return
    if (modal.kind === 'config') applyConfigChange(modal.configId)
    if (modal.kind === 'passengers') applyPassengerCount(modal.count)
  }, [applyConfigChange, applyPassengerCount])

  /* ------------------------------- booking ------------------------------ */
  const confirmBooking = useCallback(() => {
    const { passengers, seatAssignments } = stateRef.current
    const missing = passengers.filter((p) => !seatAssignments[p.id])
    if (missing.length) return notify('warning', `Assign a seat to ${missing.map((p) => p.name).join(', ')} before confirming.`)
    const reference = `SJ${Math.random().toString(36).slice(2, 8).toUpperCase()}`
    dispatch({ type: 'modal/open', modal: { type: 'booking', reference } })
  }, [notify])

  const closeModal = useCallback(() => dispatch({ type: 'modal/close' }), [])

  const resetBooking = useCallback(() => {
    clearPersistedState()
    dispatch({ type: 'reset' })
    notify('info', 'Started a new booking.')
  }, [notify])

  const actions = useMemo(
    () => ({
      selectPassenger, renamePassenger, requestPassengerCount, onSeatClick, confirmSeat, removeSeat,
      switchToPassenger, setMeal, requestConfigChange, confirmPending, confirmBooking, closeModal, resetBooking,
    }),
    [selectPassenger, renamePassenger, requestPassengerCount, onSeatClick, confirmSeat, removeSeat, switchToPassenger, setMeal, requestConfigChange, confirmPending, confirmBooking, closeModal, resetBooking],
  )

  return { state, layout, seatOwners, passengersById, summary, availableSeatCount, actions }
}
