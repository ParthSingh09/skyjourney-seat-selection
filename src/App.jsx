import Header from './components/Header.jsx'
import FlightInformation from './components/FlightInformation.jsx'
import BookingProgress from './components/BookingProgress.jsx'
import PassengerSelector from './components/PassengerSelector.jsx'
import AircraftSeatMap from './components/AircraftSeatMap.jsx'
import SeatDetailsModal from './components/SeatDetailsModal.jsx'
import MealSelection from './components/MealSelection.jsx'
import PriceSummary, { MobilePriceBar } from './components/PriceSummary.jsx'
import BookingSummary from './components/BookingSummary.jsx'
import ConfirmationModal from './components/ConfirmationModal.jsx'
import ConfirmDialog from './components/ConfirmDialog.jsx'
import ToastNotification from './components/ToastNotification.jsx'
import { useToasts } from './hooks/useToasts.js'
import { useBooking } from './hooks/useBooking.js'
import { getSeatStatus } from './utils/seatUtils.js'

export default function App() {
  const { toasts, notify, dismiss } = useToasts()
  const { state, layout, seatOwners, passengersById, summary, availableSeatCount, actions } = useBooking(notify)
  const { passengers, activePassengerId, seatAssignments, mealSelections, modal } = state
  const activePassenger = passengersById[activePassengerId] ?? null

  const modalSeat = modal?.type === 'seat' ? layout.seatsById[modal.seatId] : null

  return (
    <div className="min-h-dvh pb-28 md:pb-12">
      <Header />
      <FlightInformation />
      <BookingProgress />

      {/* Source order = tablet/mobile order (summary sits under the map).
          On lg the summary is pinned to a right-hand column spanning rows 1-4. */}
      <main className="mx-auto grid max-w-7xl grid-cols-[minmax(0,1fr)] gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="lg:col-start-1">
          <PassengerSelector
            passengers={passengers}
            activePassengerId={activePassengerId}
            seatsById={layout.seatsById}
            seatAssignments={seatAssignments}
            prompt={state.passengerPrompt}
            onSelect={actions.selectPassenger}
            onRename={actions.renamePassenger}
            onRemoveSeat={actions.removeSeat}
            onChangeCount={actions.requestPassengerCount}
          />
        </div>

        <div className="lg:col-start-1">
          <AircraftSeatMap
            layout={layout}
            seatOwners={seatOwners}
            passengersById={passengersById}
            activePassenger={activePassenger}
            summary={summary}
            availableSeatCount={availableSeatCount}
            openSeatId={modalSeat?.id ?? null}
            onSelectSeat={actions.onSeatClick}
            onChangeConfig={actions.requestConfigChange}
          />
        </div>

        <div className="hidden md:block lg:col-start-2 lg:row-span-4 lg:row-start-1">
          <div className="lg:sticky lg:top-20">
            <PriceSummary summary={summary} passengerCount={passengers.length} />
          </div>
        </div>

        <div className="lg:col-start-1">
          <MealSelection
            passengers={passengers}
            activePassengerId={activePassengerId}
            mealSelections={mealSelections}
            onSelectPassenger={actions.selectPassenger}
            onSelectMeal={actions.setMeal}
          />
        </div>

        <div className="lg:col-start-1">
          <BookingSummary summary={summary} onConfirm={actions.confirmBooking} />
        </div>
      </main>

      <MobilePriceBar summary={summary} passengerCount={passengers.length} />
      <ToastNotification toasts={toasts} onDismiss={dismiss} />

      {modalSeat && (
        <SeatDetailsModal
          seat={modalSeat}
          status={getSeatStatus(modalSeat, seatOwners, activePassengerId)}
          owner={passengersById[seatOwners[modalSeat.id]] ?? null}
          activePassenger={activePassenger}
          currentSeat={layout.seatsById[seatAssignments[activePassengerId]] ?? null}
          onConfirm={actions.confirmSeat}
          onRemove={actions.removeSeat}
          onSwitch={actions.switchToPassenger}
          onClose={actions.closeModal}
        />
      )}
      {modal?.type === 'confirm' && (
        <ConfirmDialog
          title={modal.title}
          message={modal.message}
          items={modal.items}
          confirmLabel={modal.confirmLabel}
          onConfirm={actions.confirmPending}
          onCancel={actions.closeModal}
        />
      )}
      {modal?.type === 'booking' && (
        <ConfirmationModal
          reference={modal.reference}
          summary={summary}
          onClose={actions.closeModal}
          onReset={() => {
            actions.closeModal()
            actions.resetBooking()
          }}
        />
      )}
    </div>
  )
}
