import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import axiosInstance from '../utils/axios';
import { FiBook, FiAward, FiFileText } from 'react-icons/fi';
import toast from 'react-hot-toast';

const Gradebook = () => {
  const { user } = useSelector((state) => state.auth);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEnrolledCourses();
  }, []);

  const fetchEnrolledCourses = async () => {
    try {
      const response = await axiosInstance.get('/courses/student/my-courses');
      setCourses(response.data.data || []);
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
      <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">
        {user?.role === 'admin' ? 'Student Panel - Gradebook View' : 'My Gradebook'}
      </h1>

      {courses.length === 0 ? (
        <div className="card text-center py-12">
          <FiBook className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">
            {user?.role === 'admin' ? 'No courses available.' : 'No courses enrolled yet.'}
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {courses.map((course) => (
            <div key={course._id} className="card">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <Link
                    to={`/courses/${course._id}`}
                    className="text-xl font-semibold text-primary-600 hover:text-primary-700"
                  >
                    {course.title}
                  </Link>
                  <p className="text-gray-600 dark:text-gray-400 mt-1">
                    Teacher: {course.teacher?.name}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {course.progress?.completionPercentage || 0}%
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Complete</div>
                </div>
              </div>

              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-4">
                <div
                  className="bg-primary-600 h-2 rounded-full transition-all"
                  style={{ width: `${course.progress?.completionPercentage || 0}%` }}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold mb-2 text-gray-900 dark:text-white">Quizzes</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Check quiz results in course
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2 text-gray-900 dark:text-white">Assignments</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Check assignment grades in course
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Gradebook;

