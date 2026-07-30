import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import api from '../utils/axios';
import { 
    getPaymentStatus, 
    formatPaymentStatus, 
    getBookingEvent 
} from '../utils/helpers';
import { FaTicketAlt, FaTimesCircle, FaCalendarAlt, FaMoneyBillWave, FaClock } from 'react-icons/fa';

const UserDashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    const triggerRefresh = () => setRefreshTrigger((prev) => prev + 1);

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }

        let active = true;
        api.get('/bookings/my')
            .then(({ data }) => {
                if (active) {
                    setBookings(data);
                }
            })
            .catch((error) => {
                console.error('Error fetching user bookings:', error);
            })
            .finally(() => {
                if (active) {
                    setLoading(false);
                }
            });

        return () => {
            active = false;
        };
    }, [user, navigate, refreshTrigger]);

    const cancelBooking = async (id) => {
        if (window.confirm('Are you sure you want to cancel this booking request?')) {
            try {
                await api.delete(`/bookings/${id}`);
                triggerRefresh();
            } catch (error) {
                alert(error.response?.data?.message || 'Error cancelling booking');
            }
        }
    };

    if (loading) {
        return <div className="text-center py-20 text-xl font-semibold text-gray-600">Loading your Evntix dashboard...</div>;
    }

    const userInitial = user?.name ? user.name.charAt(0).toUpperCase() : 'U';

    return (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
            {/* User Profile Header Card */}
            <div className="bg-white rounded-3xl shadow-sm p-6 sm:p-8 mb-8 border border-gray-100 flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-5 sm:gap-6">
                <div className="w-20 h-20 bg-slate-900 text-white rounded-2xl flex items-center justify-center text-3xl font-black uppercase tracking-widest shrink-0 shadow-md">
                    {userInitial}
                </div>
                <div className="flex flex-col items-center sm:items-start">
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-1">
                        Welcome back, {user?.name || 'User'}!
                    </h1>
                    <p className="text-gray-500 text-sm flex items-center justify-center sm:justify-start gap-2 font-medium">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> 
                        {user?.email}
                    </p>
                </div>
            </div>

            {/* Section Title */}
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900 flex items-center gap-3">
                    <FaTicketAlt className="text-indigo-600" /> My Booking Requests
                </h2>
                <span className="text-sm font-bold text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                    {bookings.length} {bookings.length === 1 ? 'Booking' : 'Bookings'}
                </span>
            </div>

            {/* Bookings List / Empty State */}
            {bookings.length === 0 ? (
                <div className="bg-white rounded-3xl shadow-sm p-12 text-center border border-gray-100">
                    <div className="w-20 h-20 bg-indigo-50 text-indigo-500 rounded-full flex items-center justify-center mx-auto mb-4">
                        <FaTicketAlt className="text-3xl" />
                    </div>
                    <h3 className="text-xl font-extrabold text-gray-900 mb-2">No Bookings Found</h3>
                    <p className="text-gray-500 mb-8 max-w-md mx-auto text-sm">
                        You haven't reserved any tickets yet. Browse our list of upcoming events and reserve your spot today!
                    </p>
                    <Link 
                        to="/" 
                        className="inline-block bg-slate-900 hover:bg-slate-800 text-white font-bold py-3.5 px-8 rounded-xl transition shadow-md text-sm"
                    >
                        Explore Events
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {bookings.map((booking) => {
                        // FIX: Use getBookingEvent helper to safely resolve event details
                        const eventData = getBookingEvent(booking);
                        const paymentStatus = getPaymentStatus(booking);
                        const amount = Number(booking.amount) || Number(eventData?.ticketPrice) || 0;

                        return (
                            <div 
                                key={booking._id} 
                                className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition border border-gray-100 flex flex-col"
                            >
                                <div className="p-6 border-b border-gray-50 flex-grow">
                                    {eventData ? (
                                        <>
                                            <div className="flex justify-between items-start mb-4 gap-3">
                                                <h3 className="text-lg font-bold text-gray-900 leading-tight">
                                                    {eventData.title}
                                                </h3>
                                                <div className="flex flex-col gap-1 items-end shrink-0">
                                                    <span 
                                                        className={`px-2.5 py-0.5 text-[10px] font-black rounded-full uppercase tracking-wider ${
                                                            booking.status === 'confirmed' 
                                                                ? 'bg-emerald-100 text-emerald-700' 
                                                                : booking.status === 'cancelled' 
                                                                ? 'bg-red-100 text-red-700' 
                                                                : 'bg-amber-100 text-amber-700'
                                                        }`}
                                                    >
                                                        {booking.status}
                                                    </span>
                                                    {booking.status !== 'cancelled' && (
                                                        <span 
                                                            className={`px-2.5 py-0.5 text-[10px] font-black rounded-full uppercase tracking-wider ${
                                                                paymentStatus === 'paid' 
                                                                    ? 'bg-indigo-100 text-indigo-700' 
                                                                    : 'bg-gray-100 text-gray-700'
                                                            }`}
                                                        >
                                                            {formatPaymentStatus(paymentStatus)}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="text-xs text-gray-600 space-y-2 mb-2 bg-gray-50/80 p-3.5 rounded-xl border border-gray-100">
                                                <p className="flex items-center gap-2">
                                                    <FaCalendarAlt className="text-gray-400" />
                                                    <span className="font-semibold text-gray-900">Event Date:</span> 
                                                    {new Date(eventData.date).toLocaleDateString()}
                                                </p>
                                                <p className="flex items-center gap-2">
                                                    <FaMoneyBillWave className="text-gray-400" />
                                                    <span className="font-semibold text-gray-900">Amount:</span> 
                                                    {amount === 0 ? <span className="text-emerald-600 font-bold">Free</span> : `₹${amount}`}
                                                </p>
                                                <p className="flex items-center gap-2">
                                                    <FaClock className="text-gray-400" />
                                                    <span className="font-semibold text-gray-900">Requested:</span> 
                                                    {booking.bookedAt || booking.createdAt ? new Date(booking.bookedAt || booking.createdAt).toLocaleDateString() : ''}
                                                </p>
                                            </div>
                                        </>
                                    ) : (
                                        <div className="p-4 bg-red-50 rounded-xl text-red-600 text-xs font-semibold italic">
                                            Event details unavailable (this event may have been removed by the host).
                                        </div>
                                    )}
                                </div>

                                {/* Card Footer Actions */}
                                <div className="p-4 bg-gray-50 flex justify-between items-center shrink-0 border-t border-gray-100">
                                    {eventData && booking.status !== 'cancelled' ? (
                                        <>
                                            <Link 
                                                to={`/events/${eventData._id}`} 
                                                className="text-indigo-600 font-bold text-xs hover:underline"
                                            >
                                                View Event
                                            </Link>
                                            <button
                                                onClick={() => cancelBooking(booking._id)}
                                                className="text-red-500 hover:text-red-700 font-bold text-xs transition flex items-center gap-1 bg-red-50 px-3 py-1.5 rounded-lg border border-red-100"
                                            >
                                                <FaTimesCircle /> Cancel
                                            </button>
                                        </>
                                    ) : (
                                        <div className="w-full text-center text-xs text-gray-400 font-medium italic">
                                            Request Closed
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default UserDashboard;