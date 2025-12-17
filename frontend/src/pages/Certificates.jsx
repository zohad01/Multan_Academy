import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import axiosInstance from '../utils/axios';
import { FiAward, FiArrowLeft, FiSearch, FiEye } from 'react-icons/fi';
import toast from 'react-hot-toast';

const Certificates = () => {
  const { user } = useSelector((state) => state.auth);
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchCertificates();
  }, []);

  const fetchCertificates = async () => {
    try {
      const response = await axiosInstance.get('/certificates');
      setCertificates(response.data.data || []);
    } catch (error) {
      toast.error('Failed to load certificates');
    } finally {
      setLoading(false);
    }
  };

  const filteredCertificates = certificates.filter((cert) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      cert.student?.name?.toLowerCase().includes(searchLower) ||
      cert.student?.email?.toLowerCase().includes(searchLower) ||
      cert.course?.title?.toLowerCase().includes(searchLower) ||
      cert.certificateId?.toLowerCase().includes(searchLower)
    );
  });

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <Link
            to={
              user?.role === 'admin'
                ? '/admin/dashboard'
                : user?.role === 'teacher'
                ? '/teacher/dashboard'
                : '/student/dashboard'
            }
            className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
          >
            <FiArrowLeft className="w-6 h-6" />
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {user?.role === 'admin' ? 'All Certificates' : user?.role === 'teacher' ? 'Course Certificates' : 'My Certificates'}
          </h1>
        </div>
      </div>

      {/* Search */}
      <div className="card mb-6">
        <div className="relative">
          <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search by student name, email, course, or certificate ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field pl-10 w-full"
          />
        </div>
      </div>

      {/* Certificates List */}
      <div className="card">
        {filteredCertificates.length === 0 ? (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            <FiAward className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p>
              {searchTerm
                ? 'No certificates found matching your search'
                : user?.role === 'admin'
                ? 'No certificates issued yet'
                : user?.role === 'teacher'
                ? 'No certificates issued for your courses yet'
                : "You haven't earned any certificates yet"}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">Student</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">Course</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">Certificate ID</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">Issue Date</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCertificates.map((cert) => (
                  <tr
                    key={cert._id}
                    className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    <td className="py-4 px-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center text-white font-semibold">
                          {cert.student?.name?.charAt(0).toUpperCase() || '?'}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {cert.student?.name || 'Unknown Student'}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {cert.student?.email || ''}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <p className="font-medium text-gray-900 dark:text-white">
                        {cert.course?.title || 'Unknown Course'}
                      </p>
                    </td>
                    <td className="py-4 px-4">
                      <code className="text-sm text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                        {cert.certificateId}
                      </code>
                    </td>
                    <td className="py-4 px-4 text-sm text-gray-600 dark:text-gray-400">
                      {new Date(cert.issueDate).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </td>
                    <td className="py-4 px-4">
                      <Link
                        to={`/certificates/${cert._id}`}
                        className="inline-flex items-center space-x-1 text-primary-600 hover:text-primary-700"
                      >
                        <FiEye className="w-4 h-4" />
                        <span className="text-sm">View</span>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Certificates;

