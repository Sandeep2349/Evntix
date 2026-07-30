# Implementation Plan - Final Verification and Lint Fixes

Verify and complete all remaining steps for the Evntix platform by checking code implementations, fixing ESLint errors, and confirming a clean production build.

## Findings

1. **`client/src/pages/EventDetail.jsx`**: Fully implemented with the 2-step OTP flow (`POST /api/bookings/send-otp` and `POST /api/bookings`), seat calculation fallback (`getAvailableSeats`), and loading/error indicators. Builds cleanly.
2. **`client/src/pages/AdminDashboard.jsx`**: Mostly complete, but has some issues:
   - Needs to import and use `formatPaymentStatus` helper from `helpers.js`.
   - Accesses `fetchData` before it is declared (causing hoisting/immutability lint errors).
   - Triggers `react-hooks/set-state-in-effect` by calling `setShowEventForm` synchronously in `useEffect`.
   - Triggers `react-hooks/purity` warning for using the impure `Date.now()` within JSX render.
3. **`client/src/pages/UserDashboard.jsx`**:
   - Triggers `react-hooks/set-state-in-effect` by calling `fetchBookings()` synchronously in `useEffect` when defined as a stateful hook.
   - Triggers `react-hooks/purity` warning for using `Date.now()` inside JSX render.
4. **`client/src/pages/Home.jsx`**:
   - Triggers a `react-hooks/exhaustive-deps` warning due to a missing dependency `fetchEvents` in the `useEffect` hook.

## Proposed Changes

### Frontend Pages

---

#### [MODIFY] [AdminDashboard.jsx](file:///c:/Users/sandeep%20kumar/Desktop/Evntix-2/client/src/pages/AdminDashboard.jsx)

- Reorder `fetchData` declaration so it is defined before `useEffect`.
- Import and use `formatPaymentStatus` helper function.
- Change `showEventForm` initialization to check if `location.pathname === '/create-event'` and handle routing synchronizations in a separate, clean `useEffect` that avoids synchronous rendering issues.
- Replace `Date.now()` with `booking.bookedAt || booking.createdAt || ''` to preserve purity during render.

---

#### [MODIFY] [UserDashboard.jsx](file:///c:/Users/sandeep%20kumar/Desktop/Evntix-2/client/src/pages/UserDashboard.jsx)

- Move `fetchBookings` declaration inline within `useEffect` to cleanly avoid `set-state-in-effect` cascading renders warnings.
- Replace the impure `Date.now()` in the JSX rendering block with `booking.bookedAt || booking.createdAt || ''`.

---

#### [MODIFY] [Home.jsx](file:///c:/Users/sandeep%20kumar/Desktop/Evntix-2/client/src/pages/Home.jsx)

- Include `fetchEvents` in the dependency array of the main `useEffect` or wrap/define it inline to resolve `react-hooks/exhaustive-deps`.

## Verification Plan

### Automated Tests
- Run `npm run lint` in the `client` directory to ensure zero lint errors.
- Run `npm run build` in the `client` directory to confirm a clean compilation.
