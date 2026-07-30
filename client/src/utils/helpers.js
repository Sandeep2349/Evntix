export const getAvailableSeats = (event) => {
    if (!event) return 0;
    return event.availableSeats ?? event.totalSeats ?? 0;
};

export const getPaymentStatus = (booking) => {
    if (!booking) return 'not_paid';
    const status = booking.paymentStatus ?? booking.PaymentStatus;
    if (status === 'non_paid') return 'not_paid';
    return status || 'not_paid';
};

export const formatPaymentStatus = (status) => {
    return getPaymentStatus({ paymentStatus: status }).replace('_', ' ');
};

export const getBookingEvent = (booking) => booking?.eventId || booking?.event || null;

export const getBookingUser = (booking) => booking?.userId || booking?.user || null;
