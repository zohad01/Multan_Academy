import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import axiosInstance from '../utils/axios';
import { FiBook, FiPlay, FiAward, FiTrendingUp, FiFileText, FiDollarSign, FiClock, FiCheckCircle, FiXCircle } from 'react-icons/fi';
import toast from 'react-hot-toast';

const StudentDashboard = () => {
  const { user } = useSelector((state) => state.auth);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalCourses: 0,
    completedCourses: 0,
    inProgress: 0,
    certificates: 0,
  });
  const [payments, setPayments] = useState([]);
  const [paymentsLoading, setPaymentsLoading] = useState(true);

  useEffect(() => {
    fetchEnrolledCourses();
    if (user?.role === 'student') {
      fetchPayments();
    }
  }, []);

  const fetchEnrolledCourses = async () => {
    try {
      const [coursesResponse, certificatesResponse] = await Promise.all([
        axiosInstance.get('/courses/student/my-courses'),
        axiosInstance.get('/certificates').catch(() => ({ data: { data: [] } })), // Fetch certificates, ignore if fails
      ]);
      
      const courses = coursesResponse.data.data || [];
      const certificates = certificatesResponse.data.data || [];
      setCourses(courses);
      
      // Calculate stats
      // For admins, show all published courses, for students show only enrolled
      const completed = user?.role === 'admin' 
        ? 0 // Admins don't have progress
        : courses.filter((c) => c.progress?.completionPercentage === 100).length;
      const inProgress = user?.role === 'admin'
        ? 0 // Admins don't have progress
        : courses.filter((c) => c.progress?.completionPercentage > 0 && c.progress?.completionPercentage < 100).length;

      setStats({
        totalCourses: courses.length,
        completedCourses: completed,
        inProgress: inProgress,
        certificates: certificates.length, // Admins see all certificates
      });
    } catch (error) {
      toast.error('Failed to load courses');
    } finally {
      setLoading(false);
    }
  };

  const fetchPayments = async () => {
    try {
      const response = await axiosInstance.get('/payments');
      setPayments(response.data.data || []);
    } catch (error) {
      // Silently fail, payments are optional
      console.error('Failed to load payments:', error);
    } finally {
      setPaymentsLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <FiCheckCircle className="w-5 h-5 text-green-600" />;
      case 'pending':
        return <FiClock className="w-5 h-5 text-yellow-600" />;
      case 'failed':
        return <FiXCircle className="w-5 h-5 text-red-600" />;
      case 'rejected':
        return <FiXCircle className="w-5 h-5 text-red-600" />;
      default:
        return <FiDollarSign className="w-5 h-5 text-gray-600" />;
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      completed: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      failed: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      rejected: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    };
    return badges[status] || 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">
        {user?.role === 'admin' ? 'Student Panel View' : `Welcome back, ${user?.name}!`}
      </h1>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Total Courses</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalCourses}</p>
            </div>
            <FiBook className="w-8 h-8 text-primary-600" />
          </div>
        </div>
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-sm">In Progress</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.inProgress}</p>
            </div>
            <FiPlay className="w-8 h-8 text-secondary-600" />
          </div>
        </div>
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Completed</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.completedCourses}</p>
            </div>
            <FiTrendingUp className="w-8 h-8 text-accent-600" />
          </div>
        </div>
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Certificates</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.certificates}</p>
            </div>
            <FiAward className="w-8 h-8 text-yellow-600" />
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card mb-8">
        <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Quick Access</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link to="/gradebook" className="btn-outline flex items-center justify-center space-x-2">
            <FiFileText />
            <span>View Gradebook</span>
          </Link>
          <Link to="/courses" className="btn-outline flex items-center justify-center space-x-2">
            <FiBook />
            <span>Browse Courses</span>
          </Link>
        </div>
      </div>

      {/* Payment Status Section (Students only) */}
      {user?.role === 'student' && !paymentsLoading && payments.length > 0 && (
        <div className="card mb-8">
          <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white flex items-center">
            <FiDollarSign className="mr-2" />
            Payment Status
          </h2>
          <div className="space-y-3">
            {payments
              .filter((p) => ['pending', 'rejected', 'failed'].includes(p.status))
              .map((payment) => (
                <div
                  key={payment._id}
                  className="p-4 border border-yellow-200 dark:border-yellow-800 rounded-lg bg-yellow-50 dark:bg-yellow-900"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        {getStatusIcon(payment.status)}
                        <span className="font-semibold text-gray-900 dark:text-white">
                          {payment.course?.title || 'Unknown Course'}
                        </span>
                        <span className={`px-2 py-1 text-xs rounded-full font-medium ${getStatusBadge(payment.status)}`}>
                          {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                        <p>
                          <strong>Amount:</strong> ${payment.amount?.toFixed(2)}
                          {payment.paymentMethod && payment.paymentMethod !== 'mock' && (
                            <span className="ml-2 text-xs">
                              ({payment.paymentMethod === 'easypaisa' ? 'EasyPaisa' : 
                                payment.paymentMethod === 'jazzcash' ? 'JazzCash' : 
                                payment.paymentMethod === 'bank_transfer' ? 'Bank Transfer' : 
                                payment.paymentMethod})
                            </span>
                          )}
                        </p>
                        {payment.paymentReferenceId && (
                          <p>
                            <strong>Reference ID:</strong> <code className="text-xs">{payment.paymentReferenceId}</code>
                          </p>
                        )}
                        {payment.status === 'pending' && (
                          <p className="text-yellow-700 dark:text-yellow-300 font-medium mt-2">
                            ⏳ Please wait, payment is under review. You will be enrolled once approved.
                          </p>
                        )}
                        {(payment.status === 'rejected' || payment.status === 'failed') && payment.rejectionReason && (
                          <p className="text-red-700 dark:text-red-300 mt-2">
                            <strong>Reason:</strong> {payment.rejectionReason}
                          </p>
                        )}
                        {payment.status === 'rejected' && (
                          <p className="text-red-700 dark:text-red-300 mt-2 text-sm">
                            You can submit a new payment for this course if needed.
                          </p>
                        )}
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          Submitted: {new Date(payment.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Enrolled Courses */}
      <div>
        <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">My Courses</h2>
        {courses.length === 0 ? (
          <div className="card text-center py-12">
            <FiBook className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {user?.role === 'admin' ? 'No published courses available.' : "You haven't enrolled in any courses yet."}
            </p>
            <Link to="/courses" className="btn-primary">
              Browse Courses
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <Link
                key={course._id}
                to={`/courses/${course._id}`}
                className="card hover:shadow-lg transition-shadow"
              >
                <div className="mb-4">
                  <div className="w-full h-48 bg-gray-200 dark:bg-gray-700 rounded-lg mb-4 flex items-center justify-center">
                    {course.thumbnail ? (
                      <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover rounded-lg" />
                    ) : (
                      <FiBook className="w-16 h-16 text-gray-400" />
                    )}
                  </div>
                  <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
                    {course.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">
                    {course.description}
                  </p>
                  <div className="mb-4">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600 dark:text-gray-400">Progress</span>
                      <span className="text-gray-900 dark:text-white font-medium">
                        {course.progress?.completionPercentage || 0}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-primary-600 h-2 rounded-full transition-all"
                        style={{ width: `${course.progress?.completionPercentage || 0}%` }}
                      />
                    </div>
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Teacher: {course.teacher?.name}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentDashboard;

