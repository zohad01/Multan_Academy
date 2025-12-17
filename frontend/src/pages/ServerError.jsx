import { Link } from 'react-router-dom';
import { FiHome, FiRefreshCw } from 'react-icons/fi';

const ServerError = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="text-center">
        <h1 className="text-9xl font-bold text-red-600">500</h1>
        <h2 className="text-3xl font-semibold text-gray-900 dark:text-white mt-4">
          Server Error
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mt-2 mb-8">
          Something went wrong on our end. Please try again later.
        </p>
        <div className="flex justify-center space-x-4">
          <Link
            to="/"
            className="inline-flex items-center space-x-2 btn-primary"
          >
            <FiHome />
            <span>Go Home</span>
          </Link>
          <button
            onClick={() => window.location.reload()}
            className="inline-flex items-center space-x-2 btn-outline"
          >
            <FiRefreshCw />
            <span>Refresh</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ServerError;

