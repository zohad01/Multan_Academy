import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import axiosInstance from '../utils/axios';
import { FiArrowLeft, FiCalendar, FiClock, FiVideo } from 'react-icons/fi';
import toast from 'react-hot-toast';

const CreateLiveClass = () => {
  const [searchParams] = useSearchParams();
  const courseId = searchParams.get('courseId');
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [formData, setFormData] = useState({
    course: courseId || '',
    title: '',
    description: '',
    scheduledAt: '',
    duration: 60,
    meetingUrl: '',
    meetingId: '',
    meetingPassword: '',
    provider: 'zoom',
  });
  const [loading, setLoading] = useState(false);
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    if (courseId) {
      fetchCourse();
    } else {
      fetchTeacherCourses();
    }
  }, [courseId, user]);

  const fetchCourse = async () => {
    try {
      const response = await axiosInstance.get(`/courses/${courseId}`);
      setFormData((prev) => ({ ...prev, course: courseId }));
    } catch (error) {
      toast.error('Failed to load course');
    }
  };

  const fetchTeacherCourses = async () => {
    try {
      const response = await axiosInstance.get('/courses/teacher/my-courses');
      setCourses(response.data.data || []);
    } catch (error) {
      // Silently fail
    }
  };

  const onChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axiosInstance.post('/live-classes', formData);
      toast.success('Live class created successfully!');
      navigate(`/live-classes/${response.data.data._id}`);
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to create live class');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Link
        to={courseId ? `/courses/${courseId}` : '/teacher/dashboard'}
        className="text-primary-600 hover:text-primary-700 mb-4 inline-block flex items-center"
      >
        <FiArrowLeft className="mr-2" />
        Back
      </Link>

      <div className="max-w-2xl mx-auto">
        <div className="card">
          <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
            Create Live Class
          </h1>

          <form onSubmit={onSubmit} className="space-y-6">
            {!courseId && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Course *
                </label>
                <select
                  name="course"
                  value={formData.course}
                  onChange={onChange}
                  required
                  className="input-field"
                >
                  <option value="">Select a course</option>
                  {courses.map((course) => (
                    <option key={course._id} value={course._id}>
                      {course.title}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Title *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={onChange}
                required
                className="input-field"
                placeholder="Live Class Title"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={onChange}
                rows={4}
                className="input-field"
                placeholder="Describe what will be covered in this live class"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Scheduled Date & Time *
                </label>
                <input
                  type="datetime-local"
                  name="scheduledAt"
                  value={formData.scheduledAt}
                  onChange={onChange}
                  required
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Duration (minutes) *
                </label>
                <input
                  type="number"
                  name="duration"
                  value={formData.duration}
                  onChange={onChange}
                  required
                  min="1"
                  className="input-field"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Provider *
              </label>
              <select
                name="provider"
                value={formData.provider}
                onChange={onChange}
                required
                className="input-field"
              >
                <option value="zoom">Zoom</option>
                <option value="meet">Google Meet</option>
                <option value="webrtc">WebRTC</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Meeting URL *
              </label>
              <input
                type="url"
                name="meetingUrl"
                value={formData.meetingUrl}
                onChange={onChange}
                required
                className="input-field"
                placeholder="https://zoom.us/j/..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Meeting ID
                </label>
                <input
                  type="text"
                  name="meetingId"
                  value={formData.meetingId}
                  onChange={onChange}
                  className="input-field"
                  placeholder="Optional"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Meeting Password
                </label>
                <input
                  type="text"
                  name="meetingPassword"
                  value={formData.meetingPassword}
                  onChange={onChange}
                  className="input-field"
                  placeholder="Optional"
                />
              </div>
            </div>

            <div className="flex space-x-4">
              <button
                type="submit"
                disabled={loading}
                className="btn-primary flex-1"
              >
                {loading ? 'Creating...' : 'Create Live Class'}
              </button>
              <Link
                to={courseId ? `/courses/${courseId}` : '/teacher/dashboard'}
                className="btn-outline"
              >
                Cancel
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateLiveClass;

