import { Fragment, memo } from 'react'
import { DoorOpen } from 'lucide-react'
import SeatButton from './SeatButton.jsx'
import { getSeatStatus } from '../utils/seatUtils.js'

/**
 * Renders one cabin row from its `groups` (blocks of seats). The gap between
 * blocks is an aisle, which carries the row number like on a real seat map.
 * Works for any configuration – nothing here knows about "3-2" or "2-3-2".
 */
const SeatRow = memo(function SeatRow({ row, seatOwners, activePassengerId, passengersById, openSeatId, onSelectSeat }) {
  return (
    <div role="group" aria-label={`Row ${row.number}${row.isExit ? ', emergency exit row' : ''}`} className="relative flex items-center gap-1">
      {row.isExit && (
        <>
          <ExitMarker className="-left-6 sm:-left-7" />
          <ExitMarker className="-right-6 sm:-right-7" />
        </>
      )}
      {row.groups.map((group, groupIndex) => (
        <Fragment key={groupIndex}>
          {groupIndex > 0 && (
            <span aria-hidden="true" className="w-6 text-center text-[11px] font-semibold tabular-nums text-slate-500 sm:w-7">
              {row.number}
            </span>
          )}
          <div className="flex gap-1">
            {group.map((seat) => {
              const status = getSeatStatus(seat, seatOwners, activePassengerId)
              return (
                <SeatButton
                  key={seat.id}
                  seat={seat}
                  status={status}
                  owner={passengersById[seatOwners[seat.id]]}
                  isOpen={openSeatId === seat.id}
                  onSelect={onSelectSeat}
                />
              )
            })}
          </div>
        </Fragment>
      ))}
    </div>
  )
})

function ExitMarker({ className }) {
  return (
    <span title="Emergency exit row" className={`absolute top-1/2 grid -translate-y-1/2 place-items-center text-rose-500 ${className}`}>
      <DoorOpen size={16} aria-hidden="true" />
      <span className="sr-only">Emergency exit</span>
    </span>
  )
}

export default SeatRow
