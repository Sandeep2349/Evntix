const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    eventId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Event',
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'cancelled'],
        default: 'pending'
    },
    paymentStatus: {
        type: String,
        enum: ['not_paid', 'paid'],
        default: 'not_paid'
    },
    amount: {
        type: Number,
        required: true
    },
    bookedAt: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

// Normalize legacy PaymentStatus field when reading from DB
bookingSchema.set('toJSON', {
    transform: (_doc, ret) => {
        if (ret.PaymentStatus !== undefined && ret.paymentStatus === undefined) {
            ret.paymentStatus = ret.PaymentStatus === 'non_paid' ? 'not_paid' : ret.PaymentStatus;
            delete ret.PaymentStatus;
        }
        return ret;
    }
});

module.exports = mongoose.model('Booking', bookingSchema);
