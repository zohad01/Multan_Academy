import { Link } from 'react-router-dom';
import { FiUser, FiBook } from 'react-icons/fi';

const Login = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
            Choose Your Login Type
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
            Select how you want to sign in
          </p>
        </div>
        
        <div className="space-y-4">
          <Link
            to="/login/student"
            className="group relative w-full flex items-center justify-center py-4 px-4 border-2 border-primary-300 dark:border-primary-700 text-base font-medium rounded-lg text-primary-700 dark:text-primary-300 bg-primary-50 dark:bg-primary-900/30 hover:bg-primary-100 dark:hover:bg-primary-900/50 transition-colors"
          >
            <FiUser className="mr-3 h-6 w-6" />
            <span>Login as Student</span>
          </Link>
          
          <Link
            to="/login/teacher"
            className="group relative w-full flex items-center justify-center py-4 px-4 border-2 border-secondary-300 dark:border-secondary-700 text-base font-medium rounded-lg text-secondary-700 dark:text-secondary-300 bg-secondary-50 dark:bg-secondary-900/30 hover:bg-secondary-100 dark:hover:bg-secondary-900/50 transition-colors"
          >
            <FiBook className="mr-3 h-6 w-6" />
            <span>Login as Teacher</span>
          </Link>
        </div>

        <div className="text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Don't have an account?{' '}
            <Link
              to="/signup"
              className="font-medium text-primary-600 hover:text-primary-500"
            >
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;

