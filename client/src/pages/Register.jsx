import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/useAuth'; // Modern hook import

const Register = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [otp, setOtp] = useState('');
    const [showOTP, setShowOTP] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { register, verifyOTP } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            if (!showOTP) {
                await register(name, email, password);
                setShowOTP(true);
                setError('');
            } else {
                await verifyOTP(email, otp);
                navigate('/'); // Redirect to Home or Dashboard after verification
            }
        } catch (err) {
            // Extracts message if err is an object, otherwise uses string err
            setError(typeof err === 'string' ? err : err.message || 'An error occurred during registration.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-md mx-auto mt-16 bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
            <div className="text-center mb-8">
                <h2 className="text-3xl font-extrabold text-gray-900 mb-2">Create an Account</h2>
                <p className="text-gray-500 font-medium">Join Evntix today</p>
            </div>

            {error && (
                <div className="bg-red-50 text-red-600 p-3.5 rounded-xl mb-6 text-center text-sm font-medium border border-red-100 shadow-sm">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
                {!showOTP ? (
                    <>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Full Name
                            </label>
                            <input
                                type="text"
                                required
                                placeholder="John Doe"
                                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none transition shadow-sm text-gray-900"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Email Address
                            </label>
                            <input
                                type="email"
                                required
                                placeholder="you@example.com"
                                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none transition shadow-sm text-gray-900"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Password
                            </label>
                            <input
                                type="password"
                                required
                                placeholder="••••••••"
                                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none transition shadow-sm text-gray-900"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                    </>
                ) : (
                    <div>
                        <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-xl mb-5 text-center">
                            <p className="text-sm text-indigo-900 font-medium">
                                An OTP code was sent to <span className="font-bold">{email}</span>.
                            </p>
                            <button
                                type="button"
                                onClick={() => setShowOTP(false)}
                                className="text-xs text-indigo-600 hover:underline mt-1 font-semibold"
                            >
                                Change email address?
                            </button>
                        </div>
                        
                        <label className="block text-sm font-semibold text-gray-700 mb-2 text-center">
                            Verification Code (OTP)
                        </label>
                        <input
                            type="text"
                            required
                            placeholder="123456"
                            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none transition shadow-sm font-bold tracking-widest text-center text-xl text-gray-900"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                            maxLength="6"
                        />
                    </div>
                )}

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-slate-900 text-white font-bold py-3.5 rounded-xl hover:bg-slate-800 focus:ring-4 focus:ring-slate-200 transition shadow-md mt-4 disabled:opacity-70"
                >
                    {loading ? 'Processing...' : (showOTP ? 'Verify & Complete Setup' : 'Sign Up')}
                </button>
            </form>

            {!showOTP && (
                <p className="text-center mt-6 text-gray-600 text-sm">
                    Already have an account?{' '}
                    <Link to="/login" className="text-indigo-600 font-bold hover:underline">
                        Sign in
                    </Link>
                </p>
            )}
        </div>
    );
};

export default Register;