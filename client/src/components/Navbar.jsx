import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import { FaTicketAlt, FaBars, FaTimes, FaUserCircle, FaSignOutAlt, FaPlusCircle } from 'react-icons/fa';

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    return (
        <nav className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-50 shadow-md">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    
                    {/* Brand Logo */}
                    <Link to="/" className="flex items-center gap-2 text-xl font-bold text-indigo-500 hover:text-indigo-400 transition-colors">
                        <FaTicketAlt className="text-2xl" />
                        <span>Evntix</span>
                    </Link>

                    {/* Desktop Navigation Links */}
                    <div className="hidden md:flex items-center space-x-6">
                        <Link to="/events" className="text-gray-300 hover:text-white transition-colors">
                            Events
                        </Link>

                        {user ? (
                            <>
                                {/* Conditional Admin Link */}
                                {user.role === 'admin' && (
                                    <Link 
                                        to="/create-event" 
                                        className="flex items-center gap-1 text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
                                    >
                                        <FaPlusCircle /> Create Event
                                    </Link>
                                )}

                                <Link to="/my-bookings" className="text-gray-300 hover:text-white transition-colors">
                                    My Bookings
                                </Link>

                                {/* User Info Profile Badge */}
                                <div className="flex items-center gap-2 pl-4 border-l border-slate-700">
                                    <FaUserCircle className="text-gray-400 text-lg" />
                                    <span className="text-sm font-medium text-gray-200">{user.name}</span>
                                </div>

                                {/* Logout Button */}
                                <button
                                    onClick={handleLogout}
                                    className="flex items-center gap-2 bg-red-600/10 hover:bg-red-600 text-red-500 hover:text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-all"
                                >
                                    <FaSignOutAlt /> Logout
                                </button>
                            </>
                        ) : (
                            /* Unauthenticated Guest State */
                            <div className="flex items-center space-x-4">
                                <Link 
                                    to="/login" 
                                    className="text-gray-300 hover:text-white transition-colors"
                                >
                                    Login
                                </Link>
                                <Link 
                                    to="/register" 
                                    className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all shadow-sm"
                                >
                                    Sign Up
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Mobile Hamburger Button */}
                    <div className="md:hidden flex items-center">
                        <button
                            onClick={toggleMobileMenu}
                            className="text-gray-400 hover:text-white focus:outline-none p-2"
                        >
                            {isMobileMenuOpen ? <FaTimes size={22} /> : <FaBars size={22} />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Dropdown Menu */}
            {isMobileMenuOpen && (
                <div className="md:hidden bg-slate-800 border-b border-slate-700 px-4 pt-2 pb-4 space-y-3">
                    <Link 
                        to="/events" 
                        onClick={toggleMobileMenu}
                        className="block text-gray-300 hover:text-white py-1"
                    >
                        Events
                    </Link>

                    {user ? (
                        <>
                            {user.role === 'admin' && (
                                <Link 
                                    to="/create-event" 
                                    onClick={toggleMobileMenu}
                                    className="block text-indigo-400 hover:text-indigo-300 py-1"
                                >
                                    + Create Event
                                </Link>
                            )}

                            <Link 
                                to="/my-bookings" 
                                onClick={toggleMobileMenu}
                                className="block text-gray-300 hover:text-white py-1"
                            >
                                My Bookings
                            </Link>

                            <div className="pt-2 border-t border-slate-700 flex items-center justify-between">
                                <span className="text-sm text-gray-300">{user.name}</span>
                                <button
                                    onClick={() => {
                                        toggleMobileMenu();
                                        handleLogout();
                                    }}
                                    className="text-red-400 hover:text-red-300 text-sm font-medium flex items-center gap-1"
                                >
                                    <FaSignOutAlt /> Logout
                                </button>
                            </div>
                        </>
                    ) : (
                        <div className="pt-2 border-t border-slate-700 space-y-2">
                            <Link 
                                to="/login" 
                                onClick={toggleMobileMenu}
                                className="block text-gray-300 hover:text-white py-1"
                            >
                                Login
                            </Link>
                            <Link 
                                to="/register" 
                                onClick={toggleMobileMenu}
                                className="block bg-indigo-600 hover:bg-indigo-500 text-white text-center py-2 rounded-lg font-medium"
                            >
                                Sign Up
                            </Link>
                        </div>
                    )}
                </div>
            )}
        </nav>
    );
};

export default Navbar;