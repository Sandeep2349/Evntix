const Booking = require('../models/Bookings');
const OTP = require('../models/OTP');
const Event = require('../models/Event');
const { sendOTPEmail, sendBookingEmail } = require('../utils/email');

const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

exports.sendBookingOTP = async (req, res) => {
    try {
        const otp = generateOTP();
        await OTP.deleteMany({ email: req.user.email, action: 'event_booking' });
        await OTP.create({ email: req.user.email, otp, action: 'event_booking' });
        await sendOTPEmail(req.user.email, otp, 'event_booking');
        return res.status(200).json({ message: "OTP sent to your email for booking confirmation" });
    } catch (error) {
        console.error("Error sending booking OTP:", error);
        return res.status(500).json({ message: "Failed to send OTP email", error: error.message });
    }
};

exports.bookEvent = async (req, res) => {
    try {
        const { eventId, otp } = req.body;

        if (!eventId || !otp) {
            return res.status(400).json({ message: "Event ID and OTP are required" });
        }

        const otpRecord = await OTP.findOne({
            email: req.user.email,
            otp: String(otp).trim(),
            action: 'event_booking'
        });

        if (!otpRecord) {
            return res.status(400).json({ message: "Invalid or expired OTP" });
        }

        const event = await Event.findById(eventId);
        if (!event) {
            return res.status(404).json({ message: "Event not found" });
        }

        const availableSeats = event.availableSeats ?? event.totalSeats;
        if (availableSeats <= 0) {
            return res.status(400).json({ message: "No seats available for this event" });
        }

        const existingBooking = await Booking.findOne({
            userId: req.user._id,
            eventId,
            status: { $ne: 'cancelled' }
        });

        if (existingBooking) {
            return res.status(400).json({ message: "You have already requested a booking for this event" });
        }

        const booking = await Booking.create({
            userId: req.user._id,
            eventId,
            status: 'pending',
            paymentStatus: 'not_paid',
            amount: Number(event.ticketPrice) || 0,
            bookedAt: new Date()
        });

        await OTP.deleteMany({ email: req.user.email, action: 'event_booking' });

        try {
            await sendBookingEmail(req.user.email, req.user.name, event.title);
        } catch (emailErr) {
            console.error("Failed to send booking email:", emailErr);
        }

        return res.status(201).json({
            message: "Booking created successfully. Please check your email for confirmation.",
            bookingId: booking._id
        });
    } catch (error) {
        console.error("Error in bookEvent:", error);
        return res.status(500).json({ message: "Server error during booking", error: error.message });
    }
};

exports.confirmBooking = async (req, res) => {
    try {
        const { paymentStatus } = req.body;
        const normalizedPaymentStatus = paymentStatus === 'paid' ? 'paid' : 'not_paid';

        const booking = await Booking.findById(req.params.id);
        if (!booking) {
            return res.status(404).json({ message: "Booking not found" });
        }

        const event = await Event.findById(booking.eventId);
        if (!event) {
            return res.status(404).json({ message: "Associated event not found" });
        }

        if (booking.status !== 'confirmed') {
            const availableSeats = event.availableSeats ?? event.totalSeats;
            if (availableSeats <= 0) {
                return res.status(400).json({ message: "No seats available to confirm this booking" });
            }

            booking.status = 'confirmed';
            event.availableSeats = availableSeats - 1;
            await event.save();
        }

        booking.paymentStatus = normalizedPaymentStatus;
        await booking.save();

        return res.status(200).json({ message: "Booking updated successfully", booking });
    } catch (error) {
        console.error("Error in confirmBooking:", error);
        return res.status(500).json({ message: "Server error confirming booking", error: error.message });
    }
};

exports.getMyBookings = async (req, res) => {
    try {
        const userId = req.user?._id;

        if (!userId) {
            return res.status(401).json({ message: "Unauthorized request" });
        }

        const query = req.user.role === 'admin' ? {} : { userId };

        const bookings = await Booking.find(query)
            .populate('eventId')
            .populate('userId', 'name email')
            .sort({ bookedAt: -1 })
            .lean();

        const normalized = bookings.map((booking) => {
            if (booking.PaymentStatus !== undefined && booking.paymentStatus === undefined) {
                booking.paymentStatus = booking.PaymentStatus === 'non_paid' ? 'not_paid' : booking.PaymentStatus;
                delete booking.PaymentStatus;
            }
            return booking;
        });

        return res.status(200).json(normalized);
    } catch (error) {
        console.error("Error inside getMyBookings:", error);
        return res.status(500).json({
            message: "Failed to fetch bookings from server",
            error: error.message
        });
    }
};

exports.cancelBooking = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id);
        if (!booking) {
            return res.status(404).json({ message: "Booking not found" });
        }

        if (booking.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ message: "You are not authorized to cancel this booking" });
        }

        if (booking.status === 'confirmed') {
            const event = await Event.findById(booking.eventId);
            if (event) {
                const availableSeats = event.availableSeats ?? event.totalSeats;
                event.availableSeats = Math.min(availableSeats + 1, event.totalSeats);
                await event.save();
            }
        }

        booking.status = 'cancelled';
        await booking.save();

        return res.status(200).json({ message: "Booking cancelled successfully" });
    } catch (error) {
        console.error("Error cancelling booking:", error);
        return res.status(500).json({ message: "Server error cancelling booking" });
    }
};
