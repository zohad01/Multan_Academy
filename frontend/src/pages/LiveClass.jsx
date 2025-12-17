import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import axiosInstance from '../utils/axios';
import { FiCalendar, FiClock, FiVideo, FiUsers, FiArrowLeft, FiExternalLink } from 'react-icons/fi';
import toast from 'react-hot-toast';

const LiveClass = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const [liveClass, setLiveClass] = useState(null);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    fetchLiveClass();
  }, [id, isAuthenticated, navigate]);

  const fetchLiveClass = async () => {
    try {
      const response = await axiosInstance.get(`/live-classes/${id}`);
      setLiveClass(response.data.data);
    } catch (error) {
      toast.error('Failed to load live class');
      navigate(-1);
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async () => {
    if (!liveClass.canJoin) {
      toast.error('You are not authorized to join this live class');
      return;
    }

    setJoining(true);
    try {
      const response = await axiosInstance.post(`/live-classes/${id}/join`);
      const { meetingUrl } = response.data.data;
      
      if (meetingUrl) {
        window.open(meetingUrl, '_blank');
        toast.success('Opening live class...');
      } else {
        toast.error('Meeting URL not available');
      }
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to join live class');
    } finally {
      setJoining(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  if (!liveClass) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Live class not found</div>
      </div>
    );
  }

  const scheduledDate = new Date(liveClass.scheduledAt);
  const isUpcoming = scheduledDate > new Date();
  const isLive = liveClass.status === 'live';
  const isCompleted = liveClass.status === 'completed';
  const isCancelled = liveClass.status === 'cancelled';

  return (
    <div className="container mx-auto px-4 py-8">
      <Link
        to={liveClass.course?._id ? `/courses/${liveClass.course._id}` : '/courses'}
        className="text-primary-600 hover:text-primary-700 mb-4 inline-block flex items-center"
      >
        <FiArrowLeft className="mr-2" />
        Back to Course
      </Link>

      <div className="max-w-4xl mx-auto">
        <div className="card">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold mb-2 text-gray-900 dark:text-white">
                {liveClass.title}
              </h1>
              {liveClass.course && (
                <Link
                  to={`/courses/${liveClass.course._id}`}
                  className="text-primary-600 hover:text-primary-700 dark:text-primary-400"
                >
                  {liveClass.course.title}
                </Link>
              )}
            </div>
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                isLive
                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                  : isCompleted
                  ? 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
                  : isCancelled
                  ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                  : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
              }`}
            >
              {liveClass.status.toUpperCase()}
            </span>
          </div>

          {liveClass.description && (
            <p className="text-gray-600 dark:text-gray-400 mb-6 whitespace-pre-line">
              {liveClass.description}
            </p>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="flex items-center space-x-3">
              <FiCalendar className="text-primary-600" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Scheduled Date</p>
                <p className="font-semibold text-gray-900 dark:text-white">
                  {scheduledDate.toLocaleDateString()}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <FiClock className="text-primary-600" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Time</p>
                <p className="font-semibold text-gray-900 dark:text-white">
                  {scheduledDate.toLocaleTimeString()}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <FiClock className="text-primary-600" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Duration</p>
                <p className="font-semibold text-gray-900 dark:text-white">
                  {liveClass.duration} minutes
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <FiUsers className="text-primary-600" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Enrolled Students</p>
                <p className="font-semibold text-gray-900 dark:text-white">
                  {liveClass.enrolledStudents?.length || 0}
                </p>
              </div>
            </div>
          </div>

          {liveClass.teacher && (
            <div className="mb-6">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Instructor</p>
              <p className="font-semibold text-gray-900 dark:text-white">
                {liveClass.teacher.name}
              </p>
            </div>
          )}

          {liveClass.canJoin && (isUpcoming || isLive) && !isCancelled && (
            <button
              onClick={handleJoin}
              disabled={joining}
              className="btn-primary w-full md:w-auto flex items-center justify-center space-x-2"
            >
              <FiVideo />
              <span>{joining ? 'Joining...' : isLive ? 'Join Live Class' : 'Join When Live'}</span>
              <FiExternalLink />
            </button>
          )}

          {!liveClass.canJoin && (
            <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              You must be enrolled in this course to join the live class.
            </p>
          </div>
          )}

          {isCompleted && (
            <div className="p-4 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                This live class has been completed.
              </p>
            </div>
          )}

          {isCancelled && (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-sm text-red-800 dark:text-red-200">
                This live class has been cancelled.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LiveClass;

