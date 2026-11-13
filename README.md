# SkyJourney – Flight Seat Selection & Passenger Management

A responsive, airline-style seat selection app for flight **SJ 204 (New Delhi DEL → Mumbai BOM)**. Pick 1–6 passengers, assign each an aircraft seat on an interactive cabin map (3–2 or 2–3–2 layouts), choose meals, and review live-calculated totals. Frontend only – mock data, optional `localStorage` persistence, no backend or payments.

## Technologies
React 18 · Vite 6 · Tailwind CSS 4 · lucide-react · React hooks (`useReducer`) · Node's built-in test runner for the logic tests.

## Getting started
```bash
npm install
npm run dev       # http://localhost:5173
npm test          # unit tests for seat/pricing/booking logic
npm run build     # production build in dist/
npm run preview   # serve the build locally
```

## Project structure
```
src/
  components/   Header, FlightInformation, BookingProgress, PassengerSelector, PassengerCard,
                AircraftSeatMap, SeatRow, SeatButton, SeatLegend, SeatDetailsModal, MealSelection,
                PriceSummary (+ MobilePriceBar), BookingSummary, ConfirmationModal, ConfirmDialog,
                Modal, ToastNotification, seatVisuals.js (shared seat colours/icons)
  data/         flight.js, passengers.js, seats.js (categories, cabin configs), meals.js
  hooks/        useBooking.js (state + actions), useToasts.js
  utils/        seatUtils.js, pricingUtils.js, bookingUtils.js, storage.js, booking.test.js
  App.jsx, main.jsx, styles/index.css
```

## State management
One `useReducer` in `useBooking` holds: `passengers`, `activePassengerId`, `configId`, `seatAssignments`, `parkedAssignments`, `mealSelections`, `modal` (seat details / confirm / booking success). No Context or Redux is needed – the tree is shallow and handlers are passed as props.

Business rules live in pure functions under `utils/`; the hook calls them, dispatches the result and raises toasts. Handlers read the latest state through a ref so they stay referentially stable, which lets the memoised `SeatRow`/`SeatButton` skip needless re-renders. Seats, owners, summary and totals are **derived** with `useMemo`, never stored.

## Seat assignment logic
- `seatAssignments` is a map `passengerId → seatId`. Because a passenger is a key, **one seat per passenger** is structural; `assignSeat` additionally rejects a seat already owned by someone else (**one passenger per seat**).
- `assignSeat` returns a result (`NO_PASSENGER`, `OCCUPIED`, `TAKEN`, `ALREADY_YOURS`, or success). Assigning a new seat replaces the old entry, so the previous seat is released automatically. `removeAssignment` frees a seat.
- Switching passengers only changes `activePassengerId`; assignments are untouched.
- Clicking a seat opens a details modal: confirm (available), remove (yours), or switch to the owner (someone else's). Occupied seats are disabled. Tapping with no passenger selected shows a toast and pulses the passenger panel. After a confirmed seat the next unassigned passenger becomes active.
- **Layouts are generated** from `CABIN_CONFIGS` (groups of seat letters). `SeatRow` renders any number of groups with an aisle between them, so 3–2 and 2–3–2 share the same components. A seat's category/occupancy depends only on `(row, letter)`, so e.g. 3C costs the same in both layouts.
- **Changing configuration:** assignments whose seat exists in the new cabin are kept. Seats that don't exist (e.g. 3F in 3–2) are listed in a confirmation dialog, un-assigned with a warning toast and *parked*; switching back restores them if still free. Nothing is lost silently.
- **Changing passenger count:** growing adds passengers; shrinking asks for confirmation if it would release seats/meals, then releases them.

## Pricing logic
Seat price comes from the seat's category (`Standard/Free ₹0`, `Premium ₹250`, `Extra Legroom ₹350`); meal price from the meal list. `buildBookingSummary` derives per-passenger rows, `seatTotal`, `mealTotal` and `grandTotal` from `seatAssignments` + `mealSelections` on every render – there is no separate stored total to drift. Prices are formatted with `Intl.NumberFormat('en-IN')` as `₹1,250`.

## Responsive behaviour
- **Desktop (lg+):** passengers, seat map, meals and review on the left; sticky price summary on the right.
- **Tablet:** single column; summary shown below the seat map.
- **Mobile:** passengers scroll horizontally, the cabin scrolls inside its card (aisles preserved), tap opens the details sheet (no hover reliance), and a compact sticky bottom bar shows totals and expands for the breakdown.

## Persistence
Passengers, assignments, meals and layout are saved to `localStorage` and sanitised on load (invalid seats/passengers are dropped). "Start new booking" clears it.

## Deploying
**Vercel:** push to GitHub, import the repo at vercel.com – framework preset *Vite*, build `npm run build`, output `dist`. Or `npx vercel`.

**GitHub Pages:** `vite.config.js` already uses `base: './'`. Run `npm run build`, then publish `dist/` (e.g. `npx gh-pages -d dist`, or a GitHub Actions workflow that builds and uploads `dist` with `actions/deploy-pages`).
