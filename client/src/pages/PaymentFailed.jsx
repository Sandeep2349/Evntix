
import { Link } from 'react-router-dom';
import { FaTimesCircle } from 'react-icons/fa';

const PaymentFailed = () => {
    return (
        <div className="min-h-[75vh] flex flex-col items-center justify-center px-4 py-12">
            <div className="bg-white p-8 md:p-10 rounded-3xl shadow-xl max-w-md w-full text-center border-t-8 border-red-500 border-x border-b border-gray-100">
                <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
                    <FaTimesCircle className="text-5xl" />
                </div>
                
                <h1 className="text-3xl font-extrabold text-gray-900 mb-3">Booking Failed</h1>
                <p className="text-gray-500 mb-8 text-sm md:text-base leading-relaxed">
                    We couldn't process your request. Please ensure your verification details are correct or try selecting another event.
                </p>

                <div className="space-y-3">
                    <Link 
                        to="/" 
                        className="block w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3.5 px-6 rounded-xl transition shadow-md hover:shadow-lg text-sm"
                    >
                        Explore Events
                    </Link>
                    <Link 
                        to="/my-bookings" 
                        className="block w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-3.5 px-6 rounded-xl transition text-sm"
                    >
                        View My Bookings
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default PaymentFailed;