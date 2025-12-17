import { useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import axiosInstance from '../utils/axios';
import { 
  FiSave, FiX, FiPlus, FiEdit2, FiTrash2, FiPlay, FiBook, 
  FiFileText, FiUsers, FiSettings, FiArrowLeft, FiMail, FiClock, FiTrendingUp, FiAward, FiSearch
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import AddVideoModal from '../components/AddVideoModal';
import AddQuizModal from '../components/AddQuizModal';
import AddAssignmentModal from '../components/AddAssignmentModal';
import AddMaterialModal from '../components/AddMaterialModal';

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

const EditCourse = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useSelector((state) => state.auth);
  const activeTab = searchParams.get('tab') || 'details';

  const [course, setCourse] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: 0,
    subject: '',
    level: 'beginner',
    duration: 0,
    thumbnail: '',
    isPublished: false,
  });

  // Content state
  const [videos, setVideos] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [enrolledStudents, setEnrolledStudents] = useState([]);
  const [studentsLoading, setStudentsLoading] = useState(false);
  const [studentCertificates, setStudentCertificates] = useState({});
  const [studentSearchTerm, setStudentSearchTerm] = useState('');
  
  // Modal states
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [showQuizModal, setShowQuizModal] = useState(false);
  const [showAssignmentModal, setShowAssignmentModal] = useState(false);
  const [showMaterialModal, setShowMaterialModal] = useState(false);

  useEffect(() => {
    fetchCourse();
    fetchSubjects();
  }, [id]);

  useEffect(() => {
    if (activeTab === 'students' && course && course._id) {
      fetchEnrolledStudents();
    }
  }, [activeTab, course]);

  const fetchCourse = async () => {
    try {
      const response = await axiosInstance.get(`/courses/${id}`);
      const courseData = response.data.data;
      
      // Verify user is authenticated and is a teacher/admin
      if (!user || (user.role !== 'teacher' && user.role !== 'admin')) {
        toast.error('Only teachers and admins can edit courses');
        navigate('/');
        return;
      }

      // Check if user can edit (owner or admin)
      // Backend returns isOwner and canEdit, but also check directly if user is the teacher
      const isOwner = courseData.isOwner || (courseData.teacher && courseData.teacher._id === user._id) || (courseData.teacher && courseData.teacher.toString() === user._id);
      const canEdit = courseData.canEdit || isOwner || (user && user.role === 'admin');
      
      if (!canEdit) {
        toast.error('You are not authorized to edit this course. Only the course owner can edit it.');
        setTimeout(() => {
          navigate(user?.role === 'admin' ? '/admin/courses' : user?.role === 'teacher' ? '/teacher/dashboard' : `/courses/${id}`);
        }, 2000);
        return;
      }

      setCourse(courseData);
      setFormData({
        title: courseData.title || '',
        description: courseData.description || '',
        price: courseData.price || 0,
        subject: courseData.subject?._id || courseData.subject || '',
        level: courseData.level || 'beginner',
        duration: courseData.duration || 0,
        thumbnail: courseData.thumbnail || '',
        isPublished: courseData.isPublished || false,
      });
      setVideos(courseData.videos || []);
      setMaterials(courseData.materials || []);
      setQuizzes(courseData.quizzes || []);
      setAssignments(courseData.assignments || []);
    } catch (error) {
      if (error.response?.status === 403) {
        toast.error('You are not authorized to edit this course');
      } else if (error.response?.status === 404) {
        toast.error('Course not found');
      } else {
        toast.error('Failed to load course');
      }
      navigate(user?.role === 'admin' ? '/admin/courses' : '/teacher/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const fetchSubjects = async () => {
    try {
      const response = await axiosInstance.get('/subjects');
      setSubjects(response.data.data || []);
    } catch (error) {
      // Silently fail
    }
  };

  const fetchEnrolledStudents = async () => {
    if (!course || !course._id) return;
    
    setStudentsLoading(true);
    try {
      const [studentsResponse, certificatesResponse] = await Promise.all([
        axiosInstance.get(`/courses/${course._id}/students`),
        axiosInstance.get(`/certificates`).catch(() => ({ data: { data: [] } })), // Fetch certificates for teacher's courses
      ]);
      
      const students = studentsResponse.data.data || [];
      const certificates = certificatesResponse.data.data || [];
      
      // Create a map of studentId -> certificate for this course
      const certMap = {};
      certificates
        .filter(cert => {
          const certCourseId = cert.course?._id || cert.course;
          const courseId = course._id.toString();
          return certCourseId && certCourseId.toString() === courseId;
        })
        .forEach(cert => {
          const studentId = cert.student?._id || cert.student;
          if (studentId) {
            // Use string ID for consistent key matching
            certMap[studentId.toString()] = cert;
          }
        });
      
      setStudentCertificates(certMap);
      setEnrolledStudents(students);
    } catch (error) {
      console.error('Error fetching enrolled students:', error);
      toast.error(error.response?.data?.error || 'Failed to load enrolled students');
    } finally {
      setStudentsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSaveCourse = async () => {
    setSaving(true);
    try {
      await axiosInstance.put(`/courses/${id}`, formData);
      toast.success('Course updated successfully!');
      await fetchCourse();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to update course');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteVideo = async (videoId) => {
    if (!window.confirm('Are you sure you want to delete this video?')) return;
    
    try {
      await axiosInstance.delete(`/videos/${videoId}`);
      toast.success('Video deleted successfully');
      setVideos(videos.filter(v => v._id !== videoId));
    } catch (error) {
      toast.error('Failed to delete video');
    }
  };

  const handleDeleteMaterial = async (materialId) => {
    if (!window.confirm('Are you sure you want to delete this material?')) return;
    
    try {
      await axiosInstance.delete(`/materials/${materialId}`);
      toast.success('Material deleted successfully');
      setMaterials(materials.filter(m => m._id !== materialId));
    } catch (error) {
      toast.error('Failed to delete material');
    }
  };

  const handleDeleteQuiz = async (quizId) => {
    if (!window.confirm('Are you sure you want to delete this quiz?')) return;
    
    try {
      await axiosInstance.delete(`/quizzes/${quizId}`);
      toast.success('Quiz deleted successfully');
      setQuizzes(quizzes.filter(q => q._id !== quizId));
    } catch (error) {
      toast.error('Failed to delete quiz');
    }
  };

  const handleDeleteAssignment = async (assignmentId) => {
    if (!window.confirm('Are you sure you want to delete this assignment?')) return;
    
    try {
      await axiosInstance.delete(`/assignments/${assignmentId}`);
      toast.success('Assignment deleted successfully');
      setAssignments(assignments.filter(a => a._id !== assignmentId));
    } catch (error) {
      toast.error('Failed to delete assignment');
    }
  };

  const handleDeleteCourse = async () => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${course.title}"?\n\n` +
      `This will immediately remove the course from student view. ` +
      `This action cannot be undone.`
    );

    if (!confirmed) return;

    try {
      await axiosInstance.delete(`/courses/${id}`);
      toast.success('Course deleted successfully');
      navigate('/teacher/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to delete course');
    }
  };

  const tabs = [
    { id: 'details', label: 'Course Details', icon: FiSettings },
    { id: 'videos', label: 'Videos', icon: FiPlay },
    { id: 'materials', label: 'Materials', icon: FiBook },
    { id: 'quizzes', label: 'Quizzes', icon: FiFileText },
    { id: 'assignments', label: 'Assignments', icon: FiFileText },
    { id: 'students', label: 'Students', icon: FiUsers },
  ];

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  if (!course) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link 
            to={user?.role === 'admin' ? '/admin/courses' : `/courses/${id}`} 
            className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
          >
            <FiArrowLeft className="w-6 h-6" />
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {user?.role === 'admin' ? 'Manage Course' : 'Edit Course'}
          </h1>
        </div>
        <Link 
          to={user?.role === 'admin' ? '/admin/courses' : `/courses/${id}`} 
          className="btn-outline"
        >
          <FiX className="inline mr-2" />
          Cancel
        </Link>
      </div>

      {/* Tabs */}
      <div className="card mb-6">
        <div className="flex space-x-1 border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setSearchParams({ tab: tab.id })}
                className={`flex items-center space-x-2 px-4 py-3 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-b-2 border-primary-600 text-primary-600'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <Icon />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      <div className="card">
        {activeTab === 'details' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Course Details</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Course Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="input-field"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Price ($) *
                </label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  className="input-field"
                  min="0"
                  step="0.01"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Subject *
                </label>
                <select
                  name="subject"
                  value={formData.subject}
                  onChange={handleInputChange}
                  className="input-field"
                  required
                >
                  <option value="">Select a subject</option>
                  {subjects.map((subject) => (
                    <option key={subject._id} value={subject._id}>
                      {subject.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Level *
                </label>
                <select
                  name="level"
                  value={formData.level}
                  onChange={handleInputChange}
                  className="input-field"
                  required
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Duration (hours) *
                </label>
                <input
                  type="number"
                  name="duration"
                  value={formData.duration}
                  onChange={handleInputChange}
                  className="input-field"
                  min="0"
                  step="0.5"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Thumbnail URL
                </label>
                <input
                  type="url"
                  name="thumbnail"
                  value={formData.thumbnail}
                  onChange={handleInputChange}
                  className="input-field"
                  placeholder="https://example.com/image.jpg"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Description *
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                className="input-field"
                rows="6"
                required
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="isPublished"
                name="isPublished"
                checked={formData.isPublished}
                onChange={handleInputChange}
                className="w-4 h-4 text-primary-600 rounded"
              />
              <label htmlFor="isPublished" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                Publish this course (make it visible to students)
              </label>
            </div>

            <div className="flex justify-between items-center pt-4 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={handleDeleteCourse}
                className="btn-outline text-red-600 border-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
              >
                <FiTrash2 className="inline mr-2" />
                Delete Course
              </button>
              <button
                onClick={handleSaveCourse}
                disabled={saving}
                className="btn-primary"
              >
                <FiSave className="inline mr-2" />
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        )}

        {activeTab === 'videos' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Course Videos</h2>
              <button
                onClick={() => setShowVideoModal(true)}
                className="btn-primary"
              >
                <FiPlus className="inline mr-2" />
                Add Video
              </button>
            </div>
            {videos.length > 0 ? (
              <div className="space-y-4">
                {videos.map((video, index) => (
                  <div
                    key={video._id}
                    className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center">
                        <FiPlay className="text-primary-600 dark:text-primary-400" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          {index + 1}. {video.title}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {video.duration} seconds
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Link
                        to={`/courses/${id}/video/${video._id}`}
                        className="btn-outline text-sm"
                      >
                        View
                      </Link>
                      <button
                        onClick={() => handleDeleteVideo(video._id)}
                        className="btn-outline text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                      >
                        <FiTrash2 />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                <FiPlay className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p>No videos added yet. Click "Add Video" to get started.</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'materials' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Course Materials</h2>
              <button
                onClick={() => setShowMaterialModal(true)}
                className="btn-primary"
              >
                <FiPlus className="inline mr-2" />
                Add Material
              </button>
            </div>
            {materials.length > 0 ? (
              <div className="space-y-4">
                {materials.map((material) => (
                  <div
                    key={material._id}
                    className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
                  >
                    <div className="flex items-center space-x-4">
                      <FiBook className="text-primary-600" />
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">{material.title}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {material.fileType?.toUpperCase()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={async () => {
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
                        }}
                        className="btn-outline text-sm"
                      >
                        View
                      </button>
                      <button
                        onClick={() => handleDeleteMaterial(material._id)}
                        className="btn-outline text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                      >
                        <FiTrash2 />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                <FiBook className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p>No materials added yet. Click "Add Material" to get started.</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'quizzes' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Course Quizzes</h2>
              <button
                onClick={() => setShowQuizModal(true)}
                className="btn-primary"
              >
                <FiPlus className="inline mr-2" />
                Add Quiz
              </button>
            </div>
            {quizzes.length > 0 ? (
              <div className="space-y-4">
                {quizzes.map((quiz) => (
                  <div
                    key={quiz._id}
                    className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
                  >
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">{quiz.title}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {quiz.questions?.length || 0} questions • {quiz.totalPoints || 0} points
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Link
                        to={`/courses/${id}/quiz/${quiz._id}`}
                        className="btn-outline text-sm"
                      >
                        View
                      </Link>
                      <button
                        onClick={() => handleDeleteQuiz(quiz._id)}
                        className="btn-outline text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                      >
                        <FiTrash2 />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                <FiFileText className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p>No quizzes added yet. Click "Add Quiz" to get started.</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'assignments' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Course Assignments</h2>
              <button
                onClick={() => setShowAssignmentModal(true)}
                className="btn-primary"
              >
                <FiPlus className="inline mr-2" />
                Add Assignment
              </button>
            </div>
            {assignments.length > 0 ? (
              <div className="space-y-4">
                {assignments.map((assignment) => (
                  <div
                    key={assignment._id}
                    className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
                  >
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">{assignment.title}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Due: {new Date(assignment.dueDate).toLocaleDateString()} • {assignment.totalPoints} points
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Link
                        to={`/courses/${id}/assignment/${assignment._id}`}
                        className="btn-outline text-sm"
                      >
                        View
                      </Link>
                      <button
                        onClick={() => handleDeleteAssignment(assignment._id)}
                        className="btn-outline text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                      >
                        <FiTrash2 />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                <FiFileText className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p>No assignments added yet. Click "Add Assignment" to get started.</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'students' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Enrolled Students</h2>
            </div>
            {studentsLoading ? (
              <div className="text-center py-12">
                <div className="text-gray-600 dark:text-gray-400">Loading students...</div>
              </div>
            ) : enrolledStudents.length === 0 ? (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                <FiUsers className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p>No students enrolled yet.</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Total Students: <span className="font-semibold text-gray-900 dark:text-white">{enrolledStudents.length}</span>
                  </p>
                  <div className="relative w-full sm:w-auto sm:min-w-[300px]">
                    <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search by name or email..."
                      className="input-field pl-10 w-full"
                      value={studentSearchTerm}
                      onChange={(e) => setStudentSearchTerm(e.target.value)}
                    />
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200 dark:border-gray-700">
                        <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">Name</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">Email</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">Progress</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">Videos Watched</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">Certificate</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">Enrolled</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">Last Accessed</th>
                      </tr>
                    </thead>
                    <tbody>
                      {enrolledStudents
                        .filter((student) => {
                          if (!studentSearchTerm) return true;
                          const searchLower = studentSearchTerm.toLowerCase();
                          return (
                            student.name?.toLowerCase().includes(searchLower) ||
                            student.email?.toLowerCase().includes(searchLower)
                          );
                        })
                        .map((student) => (
                        <tr
                          key={student._id}
                          className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
                        >
                          <td className="py-4 px-4">
                            <div className="flex items-center space-x-2">
                              <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center text-white font-semibold">
                                {student.name.charAt(0).toUpperCase()}
                              </div>
                              <span className="text-gray-900 dark:text-white font-medium">{student.name}</span>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
                              <FiMail className="w-4 h-4" />
                              <span>{student.email}</span>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center space-x-2">
                              <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2 max-w-[120px]">
                                <div
                                  className={`h-2 rounded-full transition-all ${
                                    (student.progress?.completionPercentage || 0) === 100
                                      ? 'bg-green-600'
                                      : (student.progress?.completionPercentage || 0) >= 50
                                      ? 'bg-primary-600'
                                      : 'bg-yellow-600'
                                  }`}
                                  style={{ width: `${student.progress?.completionPercentage || 0}%` }}
                                />
                              </div>
                              <span className="text-sm text-gray-600 dark:text-gray-400 font-medium min-w-[45px]">
                                {student.progress?.completionPercentage || 0}%
                              </span>
                            </div>
                          </td>
                          <td className="py-4 px-4 text-sm text-gray-600 dark:text-gray-400">
                            {student.progress?.videosWatched || 0}
                          </td>
                          <td className="py-4 px-4">
                            {studentCertificates[student._id.toString()] ? (
                              <Link
                                to={`/certificates/${studentCertificates[student._id.toString()]._id}`}
                                className="inline-flex items-center space-x-1 text-primary-600 hover:text-primary-700"
                              >
                                <FiAward className="w-4 h-4" />
                                <span className="text-sm">View</span>
                              </Link>
                            ) : student.progress?.completionPercentage === 100 ? (
                              <span className="text-xs text-gray-500">Pending</span>
                            ) : (
                              <span className="text-xs text-gray-400">-</span>
                            )}
                          </td>
                          <td className="py-4 px-4 text-sm text-gray-600 dark:text-gray-400">
                            {new Date(student.enrollmentDate).toLocaleDateString()}
                          </td>
                          <td className="py-4 px-4 text-sm text-gray-600 dark:text-gray-400">
                            {student.progress?.lastAccessed
                              ? new Date(student.progress.lastAccessed).toLocaleDateString()
                              : 'Never'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modals */}
      {showVideoModal && (
        <AddVideoModal
          courseId={id}
          onClose={() => setShowVideoModal(false)}
          onSuccess={fetchCourse}
        />
      )}
      {showQuizModal && (
        <AddQuizModal
          courseId={id}
          onClose={() => setShowQuizModal(false)}
          onSuccess={fetchCourse}
        />
      )}
      {showAssignmentModal && (
        <AddAssignmentModal
          courseId={id}
          onClose={() => setShowAssignmentModal(false)}
          onSuccess={fetchCourse}
        />
      )}
      {showMaterialModal && (
        <AddMaterialModal
          courseId={id}
          onClose={() => setShowMaterialModal(false)}
          onSuccess={fetchCourse}
        />
      )}
    </div>
  );
};

export default EditCourse;

