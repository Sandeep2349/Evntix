
import { Link } from 'react-router-dom';
import { FaCheckCircle } from 'react-icons/fa';

const PaymentSuccess = () => {
    return (
        <div className="min-h-[75vh] flex flex-col items-center justify-center px-4 py-12">
            <div className="bg-white p-8 md:p-10 rounded-3xl shadow-xl max-w-md w-full text-center border-t-8 border-emerald-500 border-x border-b border-gray-100">
                <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
                    <FaCheckCircle className="text-5xl" />
                </div>

                <h1 className="text-3xl font-extrabold text-gray-900 mb-3">Booking Confirmed!</h1>
                <p className="text-gray-500 mb-8 text-sm md:text-base leading-relaxed">
                    Your ticket request has been submitted successfully. A confirmation message has been sent to your registered email address.
                </p>

                <div className="space-y-3">
                    <Link 
                        to="/my-bookings" 
                        className="block w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3.5 px-6 rounded-xl transition shadow-md hover:shadow-lg text-sm"
                    >
                        View My Tickets
                    </Link>
                    <Link 
                        to="/" 
                        className="block w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-3.5 px-6 rounded-xl transition text-sm"
                    >
                        Discover More Events
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default PaymentSuccess;