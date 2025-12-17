import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import axiosInstance from '../utils/axios';
import { FiBook, FiUsers, FiPlus, FiEdit, FiAward, FiVideo } from 'react-icons/fi';
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
        <p>No certificates issued for your courses yet</p>
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

const TeacherDashboard = () => {
  const { user } = useSelector((state) => state.auth);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalCourses: 0,
    publishedCourses: 0,
    totalStudents: 0,
  });

  useEffect(() => {
    fetchMyCourses();
  }, []);

  const fetchMyCourses = async () => {
    try {
      const response = await axiosInstance.get('/courses/teacher/my-courses');
      setCourses(response.data.data || []);
      
      const published = response.data.data.filter((c) => c.isPublished).length;
      const totalStudents = response.data.data.reduce(
        (sum, c) => sum + (c.studentsEnrolled?.length || 0),
        0
      );

      setStats({
        totalCourses: response.data.data.length,
        publishedCourses: published,
        totalStudents,
      });
    } catch (error) {
      toast.error('Failed to load courses');
    } finally {
      setLoading(false);
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
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Teacher Dashboard
        </h1>
        <Link to="/teacher/courses/create" className="btn-primary flex items-center space-x-2">
          <FiPlus />
          <span>Create Course</span>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
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
              <p className="text-gray-600 dark:text-gray-400 text-sm">Published</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.publishedCourses}</p>
            </div>
            <FiEdit className="w-8 h-8 text-secondary-600" />
          </div>
        </div>
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Total Students</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalStudents}</p>
            </div>
            <FiUsers className="w-8 h-8 text-accent-600" />
          </div>
        </div>
      </div>

      {/* Certificates Section */}
      <div className="card mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Course Certificates</h2>
          <Link to="/certificates" className="btn-outline text-sm flex items-center space-x-1">
            <FiAward />
            <span>View All</span>
          </Link>
        </div>
        <CertificatesList />
      </div>

      {/* My Courses */}
      <div>
        <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">My Courses</h2>
        {courses.length === 0 ? (
          <div className="card text-center py-12">
            <FiBook className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400 mb-4">You haven't created any courses yet.</p>
            <Link to="/teacher/courses/create" className="btn-primary">
              Create Your First Course
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <div key={course._id} className="card">
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
                <div className="flex items-center justify-between mb-4">
                  <span className={`px-2 py-1 rounded text-xs ${
                    course.isPublished
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                      : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                  }`}>
                    {course.isPublished ? 'Published' : 'Draft'}
                  </span>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {course.studentsEnrolled?.length || 0} students
                  </span>
                </div>
                <div className="flex space-x-2">
                  <Link
                    to={`/courses/${course._id}`}
                    className="flex-1 btn-outline text-center"
                  >
                    View
                  </Link>
                  <Link
                    to={`/teacher/courses/${course._id}/edit`}
                    className="flex-1 btn-primary text-center"
                  >
                    Edit
                  </Link>
                </div>
                <div className="mt-2">
                  <Link
                    to={`/live-classes/create?courseId=${course._id}`}
                    className="w-full btn-outline text-center text-sm flex items-center justify-center space-x-1"
                  >
                    <FiVideo />
                    <span>Schedule Live Class</span>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TeacherDashboard;

