import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/axios';
import { useAuth } from '../context/useAuth';
import { getAvailableSeats } from '../utils/helpers';
import { FaCalendarAlt, FaMapMarkerAlt, FaChair, FaMoneyBillWave } from 'react-icons/fa';

const EventDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    
    const [event, setEvent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [bookingLoading, setBookingLoading] = useState(false);
    const [otp, setOtp] = useState('');
    const [showOTP, setShowOTP] = useState(false);
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');

    useEffect(() => {
        const fetchEvent = async () => {
            try {
                const { data } = await api.get(`/events/${id}`);
                setEvent(data);
            } catch (err) {
                console.error('Error fetching event details:', err);
                setError('Failed to load event details.');
            } finally {
                setLoading(false);
            }
        };
        fetchEvent();
    }, [id]);

    const handleBooking = async () => {
        if (!user) {
            navigate('/login');
            return;
        }
        setBookingLoading(true);
        setError('');
        setSuccessMsg('');

        try {
            if (!showOTP) {
                await api.post('/bookings/send-otp');
                setShowOTP(true);
                setSuccessMsg('OTP sent to your email. Please verify to confirm your booking request.');
            } else {
                await api.post('/bookings', { eventId: event._id, otp });
                navigate('/payment-success');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Booking request failed');
        } finally {
            setBookingLoading(false);
        }
    };

    if (loading) {
        return <div className="text-center py-20 text-xl font-semibold text-gray-600">Loading event details...</div>;
    }

    if (error && !event) {
        return <div className="text-center py-20 text-xl text-red-500 font-medium">{error || 'Event not found'}</div>;
    }

    const availableSeats = getAvailableSeats(event);
    const isSoldOut = availableSeats <= 0;
    const eventImage = event.imageurl || event.image;

    return (
        <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-xl overflow-hidden my-8 border border-gray-100">
            {/* Header Image or Fallback */}
            {eventImage ? (
                <img src={eventImage} alt={event.title} className="w-full h-80 object-cover" />
            ) : (
                <div className="w-full h-64 bg-slate-900 flex items-center justify-center text-slate-500 text-5xl font-black uppercase tracking-widest">
                    {event.category || 'EVNTIX'}
                </div>
            )}

            <div className="p-8 md:p-12">
                <div className="flex flex-col md:flex-row justify-between items-start mb-8 gap-8">
                    {/* Left Column: Event Metadata */}
                    <div className="flex-1">
                        <div className="inline-block bg-indigo-50 text-indigo-700 text-xs font-extrabold px-3.5 py-1.5 rounded-full uppercase tracking-wider mb-4 border border-indigo-100">
                            {event.category}
                        </div>
                        <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4 leading-tight">{event.title}</h1>
                        <p className="text-gray-600 text-base md:text-lg leading-relaxed mb-6 font-normal">{event.description}</p>
                    </div>

                    {/* Right Column: Ticket Booking Box */}
                    <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 min-w-[320px] w-full md:w-auto shrink-0 shadow-sm">
                        <h3 className="text-xl font-extrabold text-gray-900 mb-6 border-b border-gray-200 pb-3">Booking Details</h3>

                        <div className="space-y-5 mb-8">
                            <div className="flex items-center gap-4 text-gray-600">
                                <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-lg shrink-0">
                                    <FaMoneyBillWave />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Ticket Price</p>
                                    <p className="font-bold text-gray-900 text-lg">
                                        {event.ticketPrice === 0 ? <span className="text-emerald-600">Free</span> : `₹${event.ticketPrice}`}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-4 text-gray-600">
                                <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-lg shrink-0">
                                    <FaChair />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Availability</p>
                                    <p className="font-bold text-gray-900 text-base">
                                        <span className={availableSeats < 10 ? 'text-amber-600' : ''}>{availableSeats}</span> / {event.totalSeats} seats
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-4 text-gray-600">
                                <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-lg shrink-0">
                                    <FaCalendarAlt />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Date</p>
                                    <p className="font-bold text-gray-900 text-base">{new Date(event.date).toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-4 text-gray-600">
                                <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-lg shrink-0">
                                    <FaMapMarkerAlt />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Location</p>
                                    <p className="font-bold text-gray-900 text-base">{event.location}</p>
                                </div>
                            </div>
                        </div>

                        {showOTP && (
                            <div className="mb-5 bg-indigo-50/50 p-4 rounded-xl border border-indigo-100">
                                <label className="block text-xs font-bold text-indigo-900 mb-2 uppercase text-center">
                                    Enter OTP to Confirm Request
                                </label>
                                <input
                                    type="text"
                                    required
                                    placeholder="123456"
                                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-600 outline-none transition shadow-sm font-bold tracking-widest text-center text-xl text-gray-900"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value)}
                                    maxLength="6"
                                />
                            </div>
                        )}

                        <button
                            onClick={handleBooking}
                            disabled={isSoldOut || bookingLoading || (showOTP && !otp)}
                            className={`w-full py-4 px-6 rounded-xl font-bold text-base transition-all shadow-md ${
                                isSoldOut || (successMsg && !showOTP)
                                    ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                                    : 'bg-slate-900 hover:bg-slate-800 text-white hover:shadow-lg active:scale-[0.99]'
                            }`}
                        >
                            {bookingLoading
                                ? 'Processing...'
                                : showOTP
                                ? 'Verify OTP & Confirm'
                                : successMsg && !showOTP
                                ? 'Request Sent'
                                : isSoldOut
                                ? 'Sold Out'
                                : 'Confirm Registration'}
                        </button>

                        {error && (
                            <p className="text-red-600 mt-4 text-center text-xs font-semibold bg-red-50 p-3 rounded-xl border border-red-100">
                                {error}
                            </p>
                        )}
                        {successMsg && (
                            <p className="text-emerald-700 mt-4 text-center text-xs font-semibold bg-emerald-50 p-3 rounded-xl border border-emerald-100">
                                {successMsg}
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EventDetail;