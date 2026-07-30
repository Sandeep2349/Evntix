import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import api from '../utils/axios';
import { getAvailableSeats, getPaymentStatus, getBookingEvent, getBookingUser } from '../utils/helpers';

const AdminDashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [events, setEvents] = useState([]);
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const [activeTab, setActiveTab] = useState('events');

    const [showEventForm, setShowEventForm] = useState(location.pathname === '/create-event');
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        date: '',
        location: '',
        category: '',
        totalSeats: '',
        ticketPrice: '',
        image: ''
    });

    const triggerRefresh = () => setRefreshTrigger((prev) => prev + 1);

    useEffect(() => {
        if (location.pathname === '/create-event') {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setShowEventForm(true);
            setActiveTab('events');
        }
    }, [location.pathname]);

    useEffect(() => {
        if (!user || user.role !== 'admin') {
            navigate('/login');
            return;
        }

        let active = true;
        Promise.all([
            api.get('/events'),
            api.get('/bookings/my') // Admin route to fetch all bookings
        ]).then(([eventsRes, bookingsRes]) => {
            if (active) {
                setEvents(eventsRes.data);
                setBookings(bookingsRes.data);
            }
        }).catch((error) => {
            console.error('Error fetching admin data:', error);
        }).finally(() => {
            if (active) {
                setLoading(false);
            }
        });

        return () => {
            active = false;
        };
    }, [user, navigate, refreshTrigger]);

    const handleCreateEvent = async (e) => {
        e.preventDefault();
        try {
            // Sends both imageurl & image keys to maintain full backend compatibility
            const payload = {
                ...formData,
                imageurl: formData.image,
                totalSeats: Number(formData.totalSeats),
                ticketPrice: Number(formData.ticketPrice) || 0
            };

            await api.post('/events', payload);
            setShowEventForm(false);
            setFormData({
                title: '',
                description: '',
                date: '',
                location: '',
                category: '',
                totalSeats: '',
                ticketPrice: '',
                image: ''
            });
            triggerRefresh();
        } catch (error) {
            alert(error.response?.data?.message || 'Error creating event');
        }
    };

    const handleDeleteEvent = async (id) => {
        if (window.confirm('Are you sure you want to delete this event?')) {
            try {
                await api.delete(`/events/${id}`);
                triggerRefresh();
            } catch (error) {
                alert('Error deleting event', error.response?.data?.message || 'Error deleting event');
            }
        }
    };

    const handleConfirmBooking = async (id, paymentStatus) => {
        try {
            await api.put(`/bookings/${id}/confirm`, { paymentStatus });
            triggerRefresh();
        } catch (error) {
            alert(error.response?.data?.message || 'Error confirming booking');
        }
    };

    const handleCancelBooking = async (id) => {
        if (window.confirm("Cancel this user's booking request?")) {
            try {
                await api.delete(`/bookings/${id}`);
                triggerRefresh();
            } catch (error) {
                alert(error.response?.data?.message || 'Error cancelling booking');
            }
        }
    };

    if (loading) return <div className="text-center py-20 text-xl font-semibold text-gray-600">Loading Evntix admin panel...</div>;

    const totalRevenue = bookings.reduce(
        (sum, b) => (getPaymentStatus(b) === 'paid' && b.status === 'confirmed' ? sum + (b.amount || 0) : sum),
        0
    );

    const paidClientsCount = new Set(
        bookings
            .filter((b) => getPaymentStatus(b) === 'paid' && b.status === 'confirmed')
            .map((b) => getBookingUser(b)?._id)
            .filter(Boolean)
    ).size;

    const pendingRequestsCount = bookings.filter((b) => b.status === 'pending').length;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
            {/* Admin Banner */}
            <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-10 mb-8 shadow-xl flex flex-col md:flex-row justify-between items-center gap-6 text-center md:text-left">
                <div>
                    <h1 className="text-3xl sm:text-4xl font-extrabold mb-2 tracking-tight">Admin Control Panel</h1>
                    <p className="text-gray-300 font-medium">Manage events, create new schedules, and review booking requests.</p>
                </div>
                <button
                    onClick={() => {
                        setShowEventForm(!showEventForm);
                        if (!showEventForm) {
                            setActiveTab('events');
                        }
                    }}
                    className="w-full md:w-auto bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3.5 px-6 rounded-xl transition shadow-md shrink-0 cursor-pointer"
                >
                    {showEventForm ? 'Close Form' : '+ Create New Event'}
                </button>
            </div>

            {/* Admin Stats Row / Quick Tabs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {/* Active Events Tab Button */}
                <button
                    onClick={() => setActiveTab('events')}
                    className={`text-left w-full bg-white p-6 rounded-2xl shadow-sm border transition-all duration-300 flex items-center justify-between cursor-pointer focus:outline-none ${
                        activeTab === 'events'
                            ? 'border-indigo-600 ring-2 ring-indigo-600/10 scale-[1.02] shadow-md'
                            : 'border-gray-100 hover:border-gray-300 hover:shadow-md hover:scale-[1.01]'
                    }`}
                >
                    <div>
                        <p className="text-gray-500 text-[10px] font-extrabold uppercase tracking-wider mb-1">Active Events</p>
                        <h3 className="text-3xl font-black text-indigo-600">{events.length}</h3>
                    </div>
                    <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center text-xl font-bold">📅</div>
                </button>

                {/* Pending Requests Tab Button */}
                <button
                    onClick={() => setActiveTab('pending')}
                    className={`text-left w-full bg-white p-6 rounded-2xl shadow-sm border transition-all duration-300 flex items-center justify-between cursor-pointer focus:outline-none ${
                        activeTab === 'pending'
                            ? 'border-amber-500 ring-2 ring-amber-500/10 scale-[1.02] shadow-md'
                            : 'border-gray-100 hover:border-gray-300 hover:shadow-md hover:scale-[1.01]'
                    }`}
                >
                    <div>
                        <p className="text-gray-500 text-[10px] font-extrabold uppercase tracking-wider mb-1">Pending Requests</p>
                        <h3 className="text-3xl font-black text-amber-500">{pendingRequestsCount}</h3>
                    </div>
                    <div className="w-12 h-12 bg-amber-50 text-amber-500 rounded-2xl flex items-center justify-center text-xl font-bold">⏳</div>
                </button>

                {/* Paid Clients Tab Button */}
                <button
                    onClick={() => setActiveTab('paid')}
                    className={`text-left w-full bg-white p-6 rounded-2xl shadow-sm border transition-all duration-300 flex items-center justify-between cursor-pointer focus:outline-none ${
                        activeTab === 'paid'
                            ? 'border-sky-500 ring-2 ring-sky-500/10 scale-[1.02] shadow-md'
                            : 'border-gray-100 hover:border-gray-300 hover:shadow-md hover:scale-[1.01]'
                    }`}
                >
                    <div>
                        <p className="text-gray-500 text-[10px] font-extrabold uppercase tracking-wider mb-1">Paid Clients</p>
                        <h3 className="text-3xl font-black text-sky-600">{paidClientsCount}</h3>
                    </div>
                    <div className="w-12 h-12 bg-sky-50 text-sky-600 rounded-2xl flex items-center justify-center text-xl font-bold">👥</div>
                </button>

                {/* Total Revenue Tab Button */}
                <button
                    onClick={() => setActiveTab('revenue')}
                    className={`text-left w-full bg-white p-6 rounded-2xl shadow-sm border transition-all duration-300 flex items-center justify-between cursor-pointer focus:outline-none ${
                        activeTab === 'revenue'
                            ? 'border-emerald-600 ring-2 ring-emerald-600/10 scale-[1.02] shadow-md'
                            : 'border-gray-100 hover:border-gray-300 hover:shadow-md hover:scale-[1.01]'
                    }`}
                >
                    <div>
                        <p className="text-gray-500 text-[10px] font-extrabold uppercase tracking-wider mb-1">Total Revenue</p>
                        <h3 className="text-3xl font-black text-emerald-600">₹{totalRevenue}</h3>
                    </div>
                    <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center text-xl font-bold">₹</div>
                </button>
            </div>

            {/* Tab Navigation Menu */}
            <div className="flex border-b border-gray-200 mb-8 overflow-x-auto scrollbar-none gap-2">
                <button
                    onClick={() => setActiveTab('events')}
                    className={`pb-4 px-4 font-bold text-sm transition-all border-b-2 whitespace-nowrap cursor-pointer ${
                        activeTab === 'events'
                            ? 'border-indigo-600 text-indigo-600'
                            : 'border-transparent text-gray-500 hover:text-gray-800'
                    }`}
                >
                    📅 Events Manager
                </button>
                <button
                    onClick={() => setActiveTab('pending')}
                    className={`pb-4 px-4 font-bold text-sm transition-all border-b-2 whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                        activeTab === 'pending'
                            ? 'border-amber-500 text-amber-500'
                            : 'border-transparent text-gray-500 hover:text-gray-800'
                    }`}
                >
                    ⏳ Pending Requests
                    {pendingRequestsCount > 0 && (
                        <span className="bg-amber-100 text-amber-800 text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                            {pendingRequestsCount}
                        </span>
                    )}
                </button>
                <button
                    onClick={() => setActiveTab('paid')}
                    className={`pb-4 px-4 font-bold text-sm transition-all border-b-2 whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                        activeTab === 'paid'
                            ? 'border-sky-500 text-sky-500'
                            : 'border-transparent text-gray-500 hover:text-gray-800'
                    }`}
                >
                    👥 Paid Clients
                    {paidClientsCount > 0 && (
                        <span className="bg-sky-100 text-sky-800 text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                            {paidClientsCount}
                        </span>
                    )}
                </button>
                <button
                    onClick={() => setActiveTab('revenue')}
                    className={`pb-4 px-4 font-bold text-sm transition-all border-b-2 whitespace-nowrap cursor-pointer ${
                        activeTab === 'revenue'
                            ? 'border-emerald-600 text-emerald-600'
                            : 'border-transparent text-gray-500 hover:text-gray-800'
                    }`}
                >
                    💰 Revenue Breakdown
                </button>
            </div>

            {/* Create Event Modal / Form Section */}
            {showEventForm && activeTab === 'events' && (
                <div className="bg-white p-8 rounded-2xl shadow-md border border-gray-100 mb-8">
                    <h2 className="text-2xl font-extrabold mb-6 text-gray-900">Create New Event</h2>
                    <form onSubmit={handleCreateEvent} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <input
                            required
                            type="text"
                            placeholder="Event Title"
                            className="border border-gray-300 px-4 py-3 rounded-xl focus:ring-2 focus:ring-indigo-600 outline-none transition"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        />
                        <input
                            required
                            type="text"
                            placeholder="Category (e.g., Tech, Music, Art)"
                            className="border border-gray-300 px-4 py-3 rounded-xl focus:ring-2 focus:ring-indigo-600 outline-none transition"
                            value={formData.category}
                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        />
                        <input
                            required
                            type="date"
                            className="border border-gray-300 px-4 py-3 rounded-xl focus:ring-2 focus:ring-indigo-600 outline-none transition text-gray-700"
                            value={formData.date}
                            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                        />
                        <input
                            required
                            type="text"
                            placeholder="Location"
                            className="border border-gray-300 px-4 py-3 rounded-xl focus:ring-2 focus:ring-indigo-600 outline-none transition"
                            value={formData.location}
                            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        />
                        <input
                            required
                            type="number"
                            placeholder="Total Seats"
                            className="border border-gray-300 px-4 py-3 rounded-xl focus:ring-2 focus:ring-indigo-600 outline-none transition"
                            value={formData.totalSeats}
                            onChange={(e) => setFormData({ ...formData, totalSeats: e.target.value })}
                        />
                        <input
                            required
                            type="number"
                            placeholder="Ticket Price (0 for Free)"
                            className="border border-gray-300 px-4 py-3 rounded-xl focus:ring-2 focus:ring-indigo-600 outline-none transition"
                            value={formData.ticketPrice}
                            onChange={(e) => setFormData({ ...formData, ticketPrice: e.target.value })}
                        />

                        <div className="md:col-span-2">
                            <input
                                type="text"
                                placeholder="Image URL (Unsplash or direct image link)"
                                className="w-full border border-gray-300 px-4 py-3 rounded-xl focus:ring-2 focus:ring-indigo-600 outline-none transition"
                                value={formData.image}
                                onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                            />
                        </div>

                        <textarea
                            required
                            placeholder="Event Description"
                            className="border border-gray-300 px-4 py-3 rounded-xl md:col-span-2 h-32 focus:ring-2 focus:ring-indigo-600 outline-none transition"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        />
                        <button
                            type="submit"
                            className="md:col-span-2 bg-slate-900 text-white font-bold py-3.5 mt-2 rounded-xl hover:bg-slate-800 transition shadow-md cursor-pointer"
                        >
                            Publish Event
                        </button>
                    </form>
                </div>
            )}

            {/* Tab Panels */}
            <div>
                {/* 1. EVENTS MANAGER TAB */}
                {activeTab === 'events' && (
                    <div className="flex flex-col">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                                Active Events
                                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-100 text-slate-700 text-sm font-extrabold">
                                    {events.length}
                                </span>
                            </h2>
                        </div>
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                            <ul className="divide-y divide-gray-100">
                                {events.length === 0 ? (
                                    <li className="p-6 text-gray-500 text-center">No events found.</li>
                                ) : (
                                    events.map((event) => {
                                        const availableSeats = getAvailableSeats(event);
                                        return (
                                            <li
                                                key={event._id}
                                                className="p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:bg-gray-50/80 transition"
                                            >
                                                <div>
                                                    <h4 className="font-bold text-gray-900 mb-1 leading-tight">{event.title}</h4>
                                                    <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
                                                        <span className="flex items-center gap-1.5 font-medium">
                                                            <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                                                            {new Date(event.date).toLocaleDateString()}
                                                        </span>
                                                        <span className="flex items-center gap-1.5 font-medium">
                                                            <span
                                                                className={`w-2 h-2 rounded-full ${
                                                                    availableSeats > 0 ? 'bg-emerald-500' : 'bg-red-500'
                                                                }`}
                                                            ></span>
                                                            {availableSeats}/{event.totalSeats} seats
                                                        </span>
                                                        <span className="font-bold text-indigo-600">
                                                            {event.ticketPrice === 0 ? 'Free' : `₹${event.ticketPrice}`}
                                                        </span>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => handleDeleteEvent(event._id)}
                                                    className="w-full sm:w-auto text-red-600 hover:text-white hover:bg-red-600 border border-red-200 px-4 py-2 rounded-xl text-xs font-bold transition shadow-sm shrink-0 cursor-pointer"
                                                >
                                                    Delete Event
                                                </button>
                                            </li>
                                        );
                                    })
                                )}
                            </ul>
                        </div>
                    </div>
                )}

                {/* 2. PENDING REQUESTS TAB */}
                {activeTab === 'pending' && (
                    <div className="flex flex-col">
                        <h2 className="text-2xl font-bold mb-6 text-gray-900 flex items-center gap-3">
                            Pending Requests
                            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-amber-100 text-amber-700 text-sm font-extrabold">
                                {pendingRequestsCount}
                            </span>
                        </h2>
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                            <ul className="divide-y divide-gray-100">
                                {bookings.filter(b => b.status === 'pending').length === 0 ? (
                                    <li className="p-12 text-gray-500 text-center">
                                        <p className="text-base font-bold text-gray-700 mb-1">No Pending Requests</p>
                                        <p className="text-xs text-gray-400">All bookings have been confirmed or rejected.</p>
                                    </li>
                                ) : (
                                    bookings.filter(b => b.status === 'pending').map((booking) => {
                                        const event = getBookingEvent(booking);
                                        const bookingUser = getBookingUser(booking);
                                        const eventAvailableSeats = getAvailableSeats(event);
                                        return (
                                            <li
                                                key={booking._id}
                                                className="p-6 hover:bg-gray-50/80 transition border-l-4 border-l-amber-400"
                                            >
                                                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                                    <div className="flex-1">
                                                        <div className="flex justify-between items-start mb-2">
                                                            <h4 className="font-bold text-gray-900 text-base leading-tight">
                                                                {event?.title || 'Deleted Event'}
                                                            </h4>
                                                        </div>
                                                        <div className="bg-gray-50 rounded-xl p-3.5 border border-gray-100 text-xs space-y-1.5 max-w-2xl">
                                                            <p className="text-gray-700 flex items-center gap-2">
                                                                <span className="font-bold w-16 text-gray-400 uppercase">User:</span>
                                                                <span className="font-semibold text-gray-900">{bookingUser?.name || 'N/A'}</span>
                                                                <span className="text-gray-400">({bookingUser?.email})</span>
                                                            </p>
                                                            <p className="text-gray-700 flex items-center gap-2">
                                                                <span className="font-bold w-16 text-gray-400 uppercase">Amount:</span>
                                                                <span className={`font-semibold ${booking.amount === 0 ? 'text-emerald-600' : 'text-gray-900'}`}>
                                                                    {booking.amount === 0 ? 'Free' : `₹${booking.amount}`}
                                                                </span>
                                                            </p>
                                                            <p className="text-gray-700 flex items-center gap-2">
                                                                <span className="font-bold w-16 text-gray-400 uppercase">Date:</span>
                                                                <span>{booking.bookedAt || booking.createdAt ? new Date(booking.bookedAt || booking.createdAt).toLocaleString() : ''}</span>
                                                            </p>
                                                            {event && (
                                                                <p className="text-gray-700 flex items-center gap-2 pt-1 border-t border-gray-200">
                                                                    <span className="font-bold w-16 text-gray-400 uppercase">Seats:</span>
                                                                    <span className={`font-bold ${eventAvailableSeats > 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                                                                        {eventAvailableSeats}
                                                                    </span>{' '}
                                                                    remaining of {event.totalSeats}
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div className="flex flex-col sm:flex-row md:flex-col gap-2 shrink-0 w-full md:w-auto">
                                                        <button
                                                            onClick={() => handleConfirmBooking(booking._id, 'paid')}
                                                            className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold py-2.5 px-4 rounded-xl transition shadow-sm cursor-pointer"
                                                        >
                                                            ✓ Approve (Paid)
                                                        </button>
                                                        <button
                                                            onClick={() => handleConfirmBooking(booking._id, 'not_paid')}
                                                            className="flex-1 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold py-2.5 px-4 rounded-xl transition shadow-sm cursor-pointer"
                                                        >
                                                            ✓ Approve (Pending Payment)
                                                        </button>
                                                        <button
                                                            onClick={() => handleCancelBooking(booking._id)}
                                                            className="bg-red-50 text-red-600 hover:bg-red-500 hover:text-white border border-red-200 text-xs font-bold py-2.5 px-4 rounded-xl transition cursor-pointer"
                                                        >
                                                            ✕ Reject Request
                                                        </button>
                                                    </div>
                                                </div>
                                            </li>
                                        );
                                    })
                                )}
                            </ul>
                        </div>
                    </div>
                )}

                {/* 3. PAID CLIENTS TAB */}
                {activeTab === 'paid' && (
                    <div className="flex flex-col">
                        <h2 className="text-2xl font-bold mb-6 text-gray-900 flex items-center gap-3">
                            Paid Clients Directory
                            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 text-sm font-extrabold">
                                {paidClientsCount}
                            </span>
                        </h2>
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                            <ul className="divide-y divide-gray-100">
                                {bookings.filter(b => getPaymentStatus(b) === 'paid' && b.status === 'confirmed').length === 0 ? (
                                    <li className="p-12 text-gray-500 text-center">
                                        <p className="text-base font-bold text-gray-700 mb-1">No Paid Clients Recorded</p>
                                        <p className="text-xs text-gray-400">Confirm pending bookings with payment to populate this directory.</p>
                                    </li>
                                ) : (
                                    bookings.filter(b => getPaymentStatus(b) === 'paid' && b.status === 'confirmed').map((booking) => {
                                        const event = getBookingEvent(booking);
                                        const bookingUser = getBookingUser(booking);
                                        return (
                                            <li
                                                key={booking._id}
                                                className="p-6 hover:bg-gray-50/80 transition border-l-4 border-l-emerald-400"
                                            >
                                                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                                    <div>
                                                        <h4 className="font-bold text-gray-900 text-base leading-tight mb-2">
                                                            {bookingUser?.name || 'N/A'}
                                                        </h4>
                                                        <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-gray-500">
                                                            <span className="flex items-center gap-1.5">
                                                                <span className="font-bold text-gray-400 uppercase">Email:</span> {bookingUser?.email}
                                                            </span>
                                                            <span className="flex items-center gap-1.5">
                                                                <span className="font-bold text-gray-400 uppercase">Event:</span> {event?.title || 'Deleted Event'}
                                                            </span>
                                                            <span className="flex items-center gap-1.5">
                                                                <span className="font-bold text-gray-400 uppercase">Date:</span> {booking.bookedAt || booking.createdAt ? new Date(booking.bookedAt || booking.createdAt).toLocaleDateString() : ''}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="text-right shrink-0">
                                                        <span className="inline-block bg-emerald-50 text-emerald-700 font-extrabold text-sm px-3 py-1 rounded-full border border-emerald-100">
                                                            Paid ₹{booking.amount}
                                                        </span>
                                                    </div>
                                                </div>
                                            </li>
                                        );
                                    })
                                )}
                            </ul>
                        </div>
                    </div>
                )}

                {/* 4. REVENUE BREAKDOWN TAB */}
                {activeTab === 'revenue' && (
                    <div className="flex flex-col">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                            <h2 className="text-2xl font-bold text-gray-900">Revenue & Registrations Breakdown</h2>
                            <div className="bg-emerald-50 text-emerald-800 border border-emerald-100 rounded-xl px-4 py-2 text-sm font-bold">
                                Total Consolidated: ₹{totalRevenue}
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-gray-50 border-b border-gray-100">
                                            <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Event Details</th>
                                            <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-center">Ticket Price</th>
                                            <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-center">Tickets Paid</th>
                                            <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-center">Capacity Filled</th>
                                            <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Revenue</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 text-sm">
                                        {events.length === 0 ? (
                                            <tr>
                                                <td colSpan="5" className="p-6 text-center text-gray-500">No events generated any revenue yet.</td>
                                            </tr>
                                        ) : (
                                            events.map(event => {
                                                const eventBookings = bookings.filter(b => getBookingEvent(b)?._id === event._id);
                                                const paidBookings = eventBookings.filter(b => getPaymentStatus(b) === 'paid' && b.status === 'confirmed');
                                                const eventRevenue = paidBookings.reduce((sum, b) => sum + (b.amount || 0), 0);
                                                const ticketsSold = paidBookings.length;
                                                const capacityFilled = event.totalSeats - getAvailableSeats(event);
                                                const fillPercentage = Math.min(Math.round((capacityFilled / event.totalSeats) * 100), 100);

                                                return (
                                                    <tr key={event._id} className="hover:bg-gray-50/50 transition">
                                                        <td className="p-4">
                                                            <div className="font-bold text-gray-900">{event.title}</div>
                                                            <div className="text-xs text-gray-400">{new Date(event.date).toLocaleDateString()}</div>
                                                        </td>
                                                        <td className="p-4 text-center font-semibold text-gray-900">
                                                            {event.ticketPrice === 0 ? <span className="text-emerald-600 font-bold">Free</span> : `₹${event.ticketPrice}`}
                                                        </td>
                                                        <td className="p-4 text-center font-bold text-gray-700">{ticketsSold}</td>
                                                        <td className="p-4">
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                                                                    <div 
                                                                        className={`h-full rounded-full ${fillPercentage > 80 ? 'bg-indigo-600' : 'bg-emerald-500'}`}
                                                                        style={{ width: `${fillPercentage}%` }}
                                                                    ></div>
                                                                </div>
                                                                <span className="text-xs font-bold text-gray-500 whitespace-nowrap">{fillPercentage}%</span>
                                                            </div>
                                                            <div className="text-[10px] text-gray-400 mt-1">{capacityFilled}/{event.totalSeats} seats filled</div>
                                                        </td>
                                                        <td className="p-4 text-right font-black text-emerald-600 text-base">₹{eventRevenue}</td>
                                                    </tr>
                                                );
                                            })
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminDashboard;