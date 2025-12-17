import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import axiosInstance from '../utils/axios';
import { FiUsers, FiBook, FiTrendingUp, FiActivity, FiClock, FiDollarSign, FiAward } from 'react-icons/fi';
import toast from 'react-hot-toast';

// Certificates List Component
const CertificatesList = () => {
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCertificates();
  }, []);

  const fetchCertificates = async () => {
    try {
      const response = await axiosInstance.get('/certificates?limit=5');
      setCertificates(response.data.data || []);
    } catch (error) {
      // Silently fail
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-4 text-gray-600 dark:text-gray-400">Loading certificates...</div>;
  }

  if (certificates.length === 0) {
    return (
      <div className="text-center py-4 text-gray-600 dark:text-gray-400">
        <FiAward className="w-8 h-8 mx-auto mb-2 opacity-50" />
        <p>No certificates issued yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {certificates.map((cert) => (
        <Link
          key={cert._id}
          to={`/certificates/${cert._id}`}
          className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
          <div className="flex items-center space-x-3">
            <FiAward className="w-5 h-5 text-yellow-600" />
            <div>
              <p className="font-medium text-gray-900 dark:text-white">
                {cert.student?.name || 'Unknown Student'}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {cert.course?.title || 'Unknown Course'}
              </p>
            </div>
          </div>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {new Date(cert.issueDate).toLocaleDateString()}
          </span>
        </Link>
      ))}
    </div>
  );
};

const AdminDashboard = () => {
  const { user } = useSelector((state) => state.auth);
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalTeachers: 0,
    totalCourses: 0,
    totalSubjects: 0,
    publishedCourses: 0,
    enrolledStudents: 0,
    pendingPayments: 0,
  });
  const [activityLogs, setActivityLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [logsLoading, setLogsLoading] = useState(true);

  useEffect(() => {
    fetchStats();
    fetchActivityLogs();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await axiosInstance.get('/admin/stats');
      setStats(response.data.data);
    } catch (error) {
      toast.error('Failed to load statistics');
    } finally {
      setLoading(false);
    }
  };

  const fetchActivityLogs = async () => {
    try {
      const response = await axiosInstance.get('/admin/activity-logs?limit=10');
      setActivityLogs(response.data.data || []);
    } catch (error) {
      toast.error('Failed to load activity logs');
    } finally {
      setLogsLoading(false);
    }
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
        Admin Dashboard
      </h1>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Total Students</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalStudents}</p>
            </div>
            <FiUsers className="w-8 h-8 text-primary-600" />
          </div>
        </div>
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Total Teachers</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalTeachers}</p>
            </div>
            <FiUsers className="w-8 h-8 text-secondary-600" />
          </div>
        </div>
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Total Courses</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalCourses}</p>
            </div>
            <FiBook className="w-8 h-8 text-accent-600" />
          </div>
        </div>
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Published Courses</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.publishedCourses}</p>
            </div>
            <FiTrendingUp className="w-8 h-8 text-green-600" />
          </div>
        </div>
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Total Subjects</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalSubjects}</p>
            </div>
            <FiBook className="w-8 h-8 text-purple-600" />
          </div>
        </div>
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Enrolled Students</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.enrolledStudents}</p>
            </div>
            <FiActivity className="w-8 h-8 text-blue-600" />
          </div>
        </div>
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Pending Payments</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.pendingPayments}</p>
            </div>
            <FiDollarSign className="w-8 h-8 text-yellow-600" />
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card mb-8">
        <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <Link to="/admin/users" className="btn-outline text-center">
            Manage Users
          </Link>
          <Link to="/admin/courses" className="btn-outline text-center">
            Manage Courses
          </Link>
          <Link to="/admin/payments" className="btn-outline text-center">
            Manage Payments
          </Link>
          <Link to="/admin/subjects" className="btn-outline text-center">
            Manage Subjects
          </Link>
          <Link to="/admin/categories" className="btn-outline text-center">
            Manage Categories
          </Link>
          <Link to="/admin/social-media" className="btn-outline text-center">
            Social Media
          </Link>
        </div>
      </div>

      {/* Certificates Section */}
      <div className="card mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Recent Certificates</h2>
          <Link to="/certificates" className="btn-outline text-sm">
            View All Certificates
          </Link>
        </div>
        <CertificatesList />
      </div>

      {/* Activity Logs */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Recent Activity Logs</h2>
          <FiClock className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        </div>
        {logsLoading ? (
          <div className="text-center py-8">
            <div className="text-gray-600 dark:text-gray-400">Loading activity logs...</div>
          </div>
        ) : activityLogs.length === 0 ? (
          <div className="text-center py-8">
            <FiActivity className="w-12 h-12 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-600 dark:text-gray-400">No activity logs yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {activityLogs.map((log) => (
              <div
                key={log._id}
                className="flex items-start justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
              >
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {log.admin?.name || 'Admin'}
                    </span>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {log.action}
                    </span>
                    <span className="px-2 py-1 text-xs rounded bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200">
                      {log.resourceType}
                    </span>
                  </div>
                  {log.details && (
                    <p className="text-sm text-gray-600 dark:text-gray-400">{log.details}</p>
                  )}
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                    {new Date(log.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;

