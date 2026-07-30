
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/useAuth';

// Components & Pages
import Navbar from './components/Navbar';
import Home from './pages/Home';
import EventDetail from './pages/EventDetail';
import Login from './pages/Login';
import Register from './pages/Register';
import UserDashboard from './pages/UserDashboard';
import AdminDashboard from './pages/AdminDashboard';
import PaymentSuccess from './pages/PaymentSuccess';
import PaymentFailed from './pages/PaymentFailed';

// Protected Route Guard Component
const ProtectedRoute = ({ children }) => {
    const { user } = useAuth();
    return user ? children : <Navigate to="/login" replace />;
};

// Admin Only Guard Component
const AdminRoute = ({ children }) => {
    const { user } = useAuth();
    return user && user.role === 'admin' ? children : <Navigate to="/" replace />;
};

function App() {
    return (
        <Router>
            <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
                <Navbar />
                <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <Routes>
                        {/* Public Routes */}
                        <Route path="/" element={<Home />} />
                        <Route path="/events" element={<Home />} />
                        <Route path="/events/:id" element={<EventDetail />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />
                        
                        {/* User Dashboard & Aliases */}
                        <Route 
                            path="/dashboard" 
                            element={
                                <ProtectedRoute>
                                    <UserDashboard />
                                </ProtectedRoute>
                            } 
                        />
                        <Route 
                            path="/my-bookings" 
                            element={
                                <ProtectedRoute>
                                    <UserDashboard />
                                </ProtectedRoute>
                            } 
                        />

                        {/* Admin Dashboard & Aliases */}
                        <Route 
                            path="/admin" 
                            element={
                                <AdminRoute>
                                    <AdminDashboard />
                                </AdminRoute>
                            } 
                        />
                        <Route 
                            path="/create-event" 
                            element={
                                <AdminRoute>
                                    <AdminDashboard />
                                </AdminRoute>
                            } 
                        />

                        {/* Payment Status Routes */}
                        <Route 
                            path="/payment-success" 
                            element={
                                <ProtectedRoute>
                                    <PaymentSuccess />
                                </ProtectedRoute>
                            } 
                        />
                        <Route 
                            path="/payment-failed" 
                            element={
                                <ProtectedRoute>
                                    <PaymentFailed />
                                </ProtectedRoute>
                            } 
                        />

                        {/* 404 Fallback */}
                        <Route 
                            path="*" 
                            element={
                                <div className="min-h-[60vh] flex flex-col items-center justify-center text-center">
                                    <h1 className="text-6xl font-black text-slate-800 mb-4">404</h1>
                                    <p className="text-lg text-slate-500 font-medium mb-6">Page Not Found</p>
                                    <a 
                                        href="/" 
                                        className="bg-slate-900 text-white px-6 py-3 rounded-xl font-bold hover:bg-slate-800 transition"
                                    >
                                        Return to Evntix Home
                                    </a>
                                </div>
                            } 
                        />
                    </Routes>
                </main>
            </div>
        </Router>
    );
}

export default App;