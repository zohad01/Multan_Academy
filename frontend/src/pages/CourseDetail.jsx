import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import axiosInstance from '../utils/axios';
import ReactPlayer from 'react-player';
import { FiPlay, FiBook, FiDollarSign, FiUser, FiClock, FiFileText, FiEdit, FiSettings, FiPlus, FiTrash2, FiVideo, FiAward } from 'react-icons/fi';
import toast from 'react-hot-toast';
import GenerateCertificateModal from '../components/GenerateCertificateModal';

// Get backend URL for file access
const getBackendUrl = () => {
  // Check for environment variable first
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  // Fallback to default backend URL
  return window.location.origin.includes('localhost') 
    ? 'http://localhost:5000' 
    : window.location.origin.replace(':5173', ':5000');
};

const CourseDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [pendingPayment, setPendingPayment] = useState(null);
  const [previewVideo, setPreviewVideo] = useState(null);
  const [liveClasses, setLiveClasses] = useState([]);
  const [showCertificateModal, setShowCertificateModal] = useState(false);
  const [hasCertificate, setHasCertificate] = useState(false);

  useEffect(() => {
    fetchCourse();
    fetchPreviewVideo();
    fetchLiveClasses();
    if (isAuthenticated && user?.role === 'student') {
      checkPendingPayment();
      checkCertificate();
    }
  }, [id, isAuthenticated, user]);

  const fetchCourse = async () => {
    try {
      const response = await axiosInstance.get(`/courses/${id}`);
      setCourse(response.data.data);
    } catch (error) {
      toast.error('Failed to load course');
    } finally {
      setLoading(false);
    }
  };

  const checkPendingPayment = async () => {
    try {
      const response = await axiosInstance.get('/payments');
      const payments = response.data.data || [];
      const pending = payments.find(
        (p) => (p.course?._id === id || p.course === id) && p.status === 'pending'
      );
      setPendingPayment(pending || null);
    } catch (error) {
      // Silently fail - payments are optional
    }
  };

  const fetchPreviewVideo = async () => {
    try {
      const response = await axiosInstance.get(`/intro-videos/preview/${id}`);
      if (response.data.data) {
        setPreviewVideo(response.data.data);
      }
    } catch (error) {
      // Silently fail - preview video is optional
    }
  };

  const fetchLiveClasses = async () => {
    try {
      const response = await axiosInstance.get(`/live-classes/course/${id}`);
      setLiveClasses(response.data.data || []);
    } catch (error) {
      // Silently fail - live classes are optional
    }
  };

  const checkCertificate = async () => {
    try {
      const response = await axiosInstance.get('/certificates');
      const certificates = response.data.data || [];
      const hasCert = certificates.some(
        (cert) => (cert.course?._id === id || cert.course === id)
      );
      setHasCertificate(hasCert);
    } catch (error) {
      // Silently fail
    }
  };

  const handleEnroll = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    // If course has a price, redirect to payment page
    if (course && course.price > 0) {
      navigate(`/payment/${id}`);
      return;
    }

    // Free course - enroll directly
    setEnrolling(true);
    try {
      await axiosInstance.post(`/courses/${id}/enroll`);
      toast.success('Successfully enrolled in course!');
      // Refresh course data to show enrolled state
      await fetchCourse();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to enroll in course');
    } finally {
      setEnrolling(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Course not found</div>
      </div>
    );
  }

  const isEnrolled = course.isEnrolled;
  // Check if user is the course owner (teacher) - check both backend response and direct comparison
  const isOwner = course.isOwner || (course.teacher && user && (
    (course.teacher._id && course.teacher._id === user._id) || 
    (course.teacher.toString && course.teacher.toString() === user._id) ||
    (typeof course.teacher === 'string' && course.teacher === user._id)
  ) && user.role === 'teacher');
  const isAdmin = course.isAdmin || user?.role === 'admin'; // Admin user
  const canEdit = course.canEdit || isAdmin || isOwner; // Can edit if owner, admin, or canEdit flag
  const canAccessContent = isEnrolled || isOwner || isAdmin; // Teachers, admins, and enrolled students can access content

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2">
          <div className="w-full h-96 bg-gray-200 dark:bg-gray-700 rounded-lg mb-6 flex items-center justify-center">
            {course.thumbnail ? (
              <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover rounded-lg" />
            ) : (
              <FiBook className="w-32 h-32 text-gray-400" />
            )}
          </div>

          <h1 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">{course.title}</h1>
          
          <div className="flex items-center space-x-4 mb-6 text-gray-600 dark:text-gray-400">
            <div className="flex items-center space-x-2">
              <FiUser />
              <span>{course.teacher?.name}</span>
            </div>
            <div className="flex items-center space-x-2">
              <FiClock />
              <span>{course.duration} hours</span>
            </div>
            <span className={`px-2 py-1 rounded text-xs ${
              course.level === 'beginner' ? 'bg-green-100 text-green-800' :
              course.level === 'intermediate' ? 'bg-yellow-100 text-yellow-800' :
              'bg-red-100 text-red-800'
            }`}>
              {course.level}
            </span>
          </div>

          <div className="card mb-6">
            <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Description</h2>
            <p className="text-gray-600 dark:text-gray-400 whitespace-pre-line">
              {course.description}
            </p>
          </div>

          {/* Preview Video Section */}
          {previewVideo && !isEnrolled && (
            <div className="card mb-6">
              <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
                Course Preview
              </h2>
              {previewVideo.description && (
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  {previewVideo.description}
                </p>
              )}
              <div className="bg-black rounded-lg overflow-hidden aspect-video">
                <ReactPlayer
                  url={previewVideo.videoUrl}
                  width="100%"
                  height="100%"
                  controls
                  playing={false}
                />
              </div>
              <div className="mt-4">
                <Link
                  to={`/intro-video/preview/${id}`}
                  className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
                >
                  Watch Full Preview →
                </Link>
              </div>
            </div>
          )}

          {/* Videos */}
          <div className="card mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Course Videos</h2>
              {canEdit && (
                <Link
                  to={`/teacher/courses/${id}/edit?tab=videos`}
                  className="btn-outline text-sm flex items-center space-x-1"
                >
                  <FiPlus />
                  <span>Add Video</span>
                </Link>
              )}
            </div>
            {course.videos && course.videos.length > 0 ? (
              <>
              {!canAccessContent && !isOwner && (
                <div className="mb-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                  <p className="text-sm text-yellow-800 dark:text-yellow-200">
                    Enroll in this course to access all videos
                  </p>
                </div>
              )}
              <div className="space-y-2">
                {course.videos.map((video, index) => (
                  <Link
                    key={video._id}
                    to={(canAccessContent || isOwner) ? `/courses/${id}/video/${video._id}` : '#'}
                    onClick={(e) => {
                      if (!canAccessContent && !isOwner) {
                        e.preventDefault();
                        toast.error('Please enroll in the course to access videos');
                      }
                    }}
                    className={`flex items-center space-x-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg transition-colors ${
                      (canAccessContent || isOwner)
                        ? 'hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer' 
                        : 'opacity-60 cursor-not-allowed'
                    }`}
                  >
                    <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center">
                      <FiPlay className="text-primary-600 dark:text-primary-400" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {index + 1}. {video.title}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {video.duration} seconds
                      </p>
                    </div>
                    {!canAccessContent && !isOwner && (
                      <span className="text-xs text-gray-500">🔒</span>
                    )}
                  </Link>
                ))}
              </div>
              </>
            ) : (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                {canEdit ? (
                  <p>No videos yet. <Link to={`/teacher/courses/${id}/edit?tab=videos`} className="text-primary-600 hover:underline">Add your first video</Link></p>
                ) : (
                  <p>No videos available</p>
                )}
              </div>
            )}
          </div>

          {/* Materials */}
          <div className="card mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Course Materials</h2>
              {canEdit && (
                <Link
                  to={`/teacher/courses/${id}/edit?tab=materials`}
                  className="btn-outline text-sm flex items-center space-x-1"
                >
                  <FiPlus />
                  <span>Add Material</span>
                </Link>
              )}
            </div>
            {course.materials && course.materials.length > 0 ? (
              <>
              {!canAccessContent && !isOwner && (
                <div className="mb-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                  <p className="text-sm text-yellow-800 dark:text-yellow-200">
                    Enroll in this course to access all materials
                  </p>
                </div>
              )}
              <div className="space-y-2">
                {course.materials.map((material) => {
                  const handleMaterialClick = async (e) => {
                    e.preventDefault();
                    
                    if (!canAccessContent && !isOwner) {
                      toast.error('Please enroll in the course to access materials');
                      return;
                    }

                    if (!material._id) {
                      toast.error('Material ID not found');
                      return;
                    }

                    try {
                      // Get token from localStorage
                      const token = localStorage.getItem('token');
                      if (!token) {
                        toast.error('Please login to access materials');
                        return;
                      }

                      // Make authenticated request to download material
                      const backendUrl = getBackendUrl();
                      const response = await fetch(`${backendUrl}/api/materials/${material._id}/download`, {
                        method: 'GET',
                        headers: {
                          'Authorization': `Bearer ${token}`,
                        },
                      });

                      if (!response.ok) {
                        const errorData = await response.json().catch(() => ({}));
                        throw new Error(errorData.error || 'Failed to download material');
                      }

                      // Check if response is JSON (external URL redirect)
                      const contentType = response.headers.get('content-type');
                      if (contentType && contentType.includes('application/json')) {
                        const data = await response.json();
                        if (data.redirect && data.url) {
                          window.open(data.url, '_blank');
                          return;
                        }
                      }

                      // Get the blob data
                      const blob = await response.blob();
                      
                      // Create a blob URL and open it
                      const blobUrl = window.URL.createObjectURL(blob);
                      const link = document.createElement('a');
                      link.href = blobUrl;
                      link.target = '_blank';
                      link.rel = 'noopener noreferrer';
                      
                      // Set filename if available
                      const contentDisposition = response.headers.get('content-disposition');
                      if (contentDisposition) {
                        const filenameMatch = contentDisposition.match(/filename="?(.+)"?/i);
                        if (filenameMatch) {
                          link.download = filenameMatch[1];
                        }
                      } else {
                        // Use material title as filename
                        const ext = material.fileType || 'pdf';
                        link.download = `${material.title}.${ext}`;
                      }
                      
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                      
                      // Clean up blob URL after a delay
                      setTimeout(() => window.URL.revokeObjectURL(blobUrl), 100);
                    } catch (error) {
                      toast.error(error.message || 'Failed to download material');
                    }
                  };

                  return (
                    <div
                      key={material._id}
                      onClick={handleMaterialClick}
                      className={`flex items-center space-x-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg transition-colors ${
                        (canAccessContent || isOwner)
                          ? 'hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer' 
                          : 'opacity-60 cursor-not-allowed'
                      }`}
                    >
                      <FiBook className="text-primary-600" />
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 dark:text-white">{material.title}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{material.fileType?.toUpperCase() || 'FILE'}</p>
                      </div>
                      {!canAccessContent && !isOwner && (
                        <span className="text-xs text-gray-500">🔒</span>
                      )}
                    </div>
                  );
                })}
              </div>
              </>
            ) : (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                {canEdit ? (
                  <p>No materials yet. <Link to={`/teacher/courses/${id}/edit?tab=materials`} className="text-primary-600 hover:underline">Add your first material</Link></p>
                ) : (
                  <p>No materials available</p>
                )}
              </div>
            )}
          </div>

          {/* Quizzes */}
          <div className="card mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Course Quizzes</h2>
              {canEdit && (
                <Link
                  to={`/teacher/courses/${id}/edit?tab=quizzes`}
                  className="btn-outline text-sm flex items-center space-x-1"
                >
                  <FiPlus />
                  <span>Add Quiz</span>
                </Link>
              )}
            </div>
            {course.quizzes && course.quizzes.length > 0 ? (
              <>
              {!canAccessContent && !isOwner && (
                <div className="mb-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                  <p className="text-sm text-yellow-800 dark:text-yellow-200">
                    Enroll in this course to access all quizzes
                  </p>
                </div>
              )}
              <div className="space-y-2">
                {course.quizzes.map((quiz) => (
                  <Link
                    key={quiz._id}
                    to={(canAccessContent || isOwner) ? `/courses/${id}/quiz/${quiz._id}` : '#'}
                    onClick={(e) => {
                      if (!canAccessContent && !isOwner) {
                        e.preventDefault();
                        toast.error('Please enroll in the course to access quizzes');
                      }
                    }}
                    className={`flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg transition-colors ${
                      (canAccessContent || isOwner)
                        ? 'hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer' 
                        : 'opacity-60 cursor-not-allowed'
                    }`}
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-secondary-100 dark:bg-secondary-900 rounded-full flex items-center justify-center">
                        <FiBook className="text-secondary-600 dark:text-secondary-400" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">{quiz.title}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {quiz.questions?.length || 0} questions • {quiz.totalPoints || 0} points
                        </p>
                      </div>
                    </div>
                    {(canAccessContent || isOwner) ? (
                      <span className="text-sm text-primary-600">{canEdit || isOwner ? 'View Quiz →' : 'Take Quiz →'}</span>
                    ) : (
                      <span className="text-xs text-gray-500">🔒</span>
                    )}
                  </Link>
                ))}
              </div>
              </>
            ) : (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                {canEdit ? (
                  <p>No quizzes yet. <Link to={`/teacher/courses/${id}/edit?tab=quizzes`} className="text-primary-600 hover:underline">Add your first quiz</Link></p>
                ) : (
                  <p>No quizzes available</p>
                )}
              </div>
            )}
          </div>

          {/* Live Classes */}
          <div className="card mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Live Classes</h2>
              {canEdit && (
                <Link
                  to={`/live-classes/create?courseId=${id}`}
                  className="btn-outline text-sm flex items-center space-x-1"
                >
                  <FiPlus />
                  <span>Schedule Live Class</span>
                </Link>
              )}
            </div>
            {liveClasses.length > 0 ? (
              <div className="space-y-2">
                {liveClasses.map((liveClass) => {
                  const scheduledDate = new Date(liveClass.scheduledAt);
                  const isUpcoming = scheduledDate > new Date();
                  const isLive = liveClass.status === 'live';
                  
                  return (
                    <Link
                      key={liveClass._id}
                      to={`/live-classes/${liveClass._id}`}
                      className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg transition-colors hover:bg-gray-50 dark:hover:bg-gray-800"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center">
                          <FiVideo className="text-purple-600 dark:text-purple-400" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900 dark:text-white">{liveClass.title}</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {scheduledDate.toLocaleDateString()} at {scheduledDate.toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          isLive
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                            : isUpcoming
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                            : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
                        }`}
                      >
                        {liveClass.status.toUpperCase()}
                      </span>
                    </Link>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                {canEdit ? (
                  <p>No live classes scheduled. <Link to={`/live-classes/create?courseId=${id}`} className="text-primary-600 hover:underline">Schedule your first live class</Link></p>
                ) : (
                  <p>No live classes scheduled</p>
                )}
              </div>
            )}
          </div>

          {/* Assignments */}
          <div className="card">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Course Assignments</h2>
              {canEdit && (
                <Link
                  to={`/teacher/courses/${id}/edit?tab=assignments`}
                  className="btn-outline text-sm flex items-center space-x-1"
                >
                  <FiPlus />
                  <span>Add Assignment</span>
                </Link>
              )}
            </div>
            {course.assignments && course.assignments.length > 0 ? (
              <>
              {!canAccessContent && !isOwner && (
                <div className="mb-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                  <p className="text-sm text-yellow-800 dark:text-yellow-200">
                    Enroll in this course to access all assignments
                  </p>
                </div>
              )}
              <div className="space-y-2">
                {course.assignments.map((assignment) => (
                  <Link
                    key={assignment._id}
                    to={(canAccessContent || isOwner) ? `/courses/${id}/assignment/${assignment._id}` : '#'}
                    onClick={(e) => {
                      if (!canAccessContent && !isOwner) {
                        e.preventDefault();
                        toast.error('Please enroll in the course to access assignments');
                      }
                    }}
                    className={`flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg transition-colors ${
                      (canAccessContent || isOwner)
                        ? 'hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer' 
                        : 'opacity-60 cursor-not-allowed'
                    }`}
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-accent-100 dark:bg-accent-900 rounded-full flex items-center justify-center">
                        <FiFileText className="text-accent-600 dark:text-accent-400" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">{assignment.title}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Due: {new Date(assignment.dueDate).toLocaleDateString()} • {assignment.totalPoints} points
                        </p>
                      </div>
                    </div>
                    {(canAccessContent || isOwner) ? (
                      <span className="text-sm text-primary-600">View Assignment →</span>
                    ) : (
                      <span className="text-xs text-gray-500">🔒</span>
                    )}
                  </Link>
                ))}
              </div>
              </>
            ) : (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                {canEdit ? (
                  <p>No assignments yet. <Link to={`/teacher/courses/${id}/edit?tab=assignments`} className="text-primary-600 hover:underline">Add your first assignment</Link></p>
                ) : (
                  <p>No assignments available</p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="card sticky top-24">
            <div className="text-center mb-6">
              <div className="text-4xl font-bold text-primary-600 mb-2">
                ${course.price}
              </div>
              {isEnrolled && (
                <div className="mb-4">
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">Progress</div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-primary-600 h-2 rounded-full transition-all"
                      style={{ width: `${course.progress?.completionPercentage || 0}%` }}
                    />
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                    {course.progress?.completionPercentage || 0}% Complete
                  </div>
                </div>
              )}
            </div>

            {(canEdit || isOwner) ? (
              <div className="space-y-2">
                <Link
                  to={`/teacher/courses/${id}/edit`}
                  className="btn-primary w-full text-center"
                >
                  <FiEdit className="inline mr-2" />
                  Edit Course
                </Link>
                {course.videos && course.videos.length > 0 && (
                  <Link
                    to={`/courses/${id}/video/${course.videos[0]._id}`}
                    className="btn-outline w-full text-center"
                  >
                    <FiPlay className="inline mr-2" />
                    Preview Course
                  </Link>
                )}
                <div className="text-center mt-4">
                  <span className="text-sm text-blue-600 dark:text-blue-400 font-semibold">
                    {isAdmin ? '👤 Admin' : '👤 Course Owner'}
                  </span>
                </div>
                <div className="text-center mt-2">
                  <span className="text-xs text-gray-600 dark:text-gray-400">
                    {course.studentsEnrolled?.length || 0} students enrolled
                  </span>
                </div>
              </div>
            ) : isEnrolled ? (
              <div className="space-y-2">
                {course.videos && course.videos.length > 0 && (
                  <Link
                    to={`/courses/${id}/video/${course.videos[0]._id}`}
                    className="btn-primary w-full text-center"
                  >
                    <FiPlay className="inline mr-2" />
                    Continue Learning
                  </Link>
                )}
                {course.progress?.completionPercentage === 100 && !hasCertificate && (
                  <button
                    onClick={() => setShowCertificateModal(true)}
                    className="btn-outline w-full text-center flex items-center justify-center space-x-2"
                  >
                    <FiAward />
                    <span>Generate Certificate</span>
                  </button>
                )}
                {hasCertificate && (
                  <Link
                    to="/certificates"
                    className="btn-outline w-full text-center flex items-center justify-center space-x-2"
                  >
                    <FiAward />
                    <span>View Certificate</span>
                  </Link>
                )}
                <div className="text-center mt-4">
                  <span className="text-sm text-green-600 dark:text-green-400 font-semibold">
                    ✓ Enrolled
                  </span>
                </div>
              </div>
            ) : pendingPayment ? (
              <div className="space-y-2">
                <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                  <p className="text-sm text-yellow-800 dark:text-yellow-200 font-medium mb-2">
                    ⏳ Payment Under Review
                  </p>
                  <p className="text-xs text-yellow-700 dark:text-yellow-300">
                    Your payment is being reviewed by admin. You will be enrolled once approved.
                  </p>
                  {pendingPayment.paymentReferenceId && (
                    <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-2 font-mono">
                      Ref: {pendingPayment.paymentReferenceId}
                    </p>
                  )}
                </div>
                <Link
                  to="/student/dashboard"
                  className="btn-outline w-full text-center"
                >
                  View Payment Status
                </Link>
              </div>
            ) : (
              <button 
                onClick={handleEnroll} 
                className="btn-primary w-full"
                disabled={enrolling}
              >
                <FiDollarSign className="inline mr-2" />
                {enrolling ? 'Enrolling...' : course.price > 0 ? 'Pay Now' : 'Enroll Now'}
              </button>
            )}

            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <h3 className="font-semibold mb-4 text-gray-900 dark:text-white">Course Includes</h3>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li>• {course.videos?.length || 0} Video Lectures</li>
                <li>• {course.materials?.length || 0} Course Materials</li>
                <li>• {course.quizzes?.length || 0} Quizzes</li>
                <li>• {course.assignments?.length || 0} Assignments</li>
                <li>• Certificate of Completion</li>
                <li>• Lifetime Access</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Certificate Generation Modal */}
      {showCertificateModal && (
        <GenerateCertificateModal
          course={course}
          isOpen={showCertificateModal}
          onClose={() => {
            setShowCertificateModal(false);
            checkCertificate();
          }}
          user={user}
        />
      )}
    </div>
  );
};

export default CourseDetail;

