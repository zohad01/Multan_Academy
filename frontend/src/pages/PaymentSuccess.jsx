import { useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { FiCheckCircle, FiArrowRight } from 'react-icons/fi';

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { payment, course } = location.state || {};

  useEffect(() => {
    if (!payment || !course) {
      navigate('/courses');
    }
  }, [payment, course, navigate]);

  if (!payment || !course) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="card text-center">
        <FiCheckCircle className="w-20 h-20 text-green-600 mx-auto mb-4" />
        <h1 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">
          Payment Successful!
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          You have successfully enrolled in <strong>{course.title}</strong>
        </p>

        {payment.paymentMethod === 'mock' && (
          <div className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-900/30 border-2 border-yellow-400 dark:border-yellow-600 rounded-lg">
            <p className="text-sm text-yellow-800 dark:text-yellow-200 text-center">
              <strong>TEST MODE:</strong> This was a mock payment. No real money was charged.
            </p>
          </div>
        )}

        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 mb-6 text-left">
          <h2 className="font-semibold mb-4 text-gray-900 dark:text-white">Transaction Details</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Transaction ID</span>
              <span className="text-gray-900 dark:text-white font-mono">{payment.transactionId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Amount</span>
              <span className="text-gray-900 dark:text-white">${payment.amount}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Status</span>
              <span className="text-green-600 font-semibold capitalize">{payment.status}</span>
            </div>
            {payment.paymentMethod && (
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Payment Method</span>
                <span className="text-gray-900 dark:text-white capitalize">
                  {payment.paymentMethod === 'mock' ? 'Mock Payment (Test Mode)' : payment.paymentMethod}
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="flex space-x-4">
          <Link
            to="/student/dashboard"
            className="flex-1 btn-outline text-center"
          >
            Go to Dashboard
          </Link>
          <Link
            to={`/courses/${course._id}`}
            className="flex-1 btn-primary text-center flex items-center justify-center space-x-2"
          >
            <span>Start Learning</span>
            <FiArrowRight />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;

