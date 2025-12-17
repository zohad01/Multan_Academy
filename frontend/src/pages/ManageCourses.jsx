import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axiosInstance from '../utils/axios';
import { FiBook, FiSearch, FiEdit, FiTrash2, FiEye, FiEyeOff, FiUsers, FiX, FiMail, FiClock, FiTrendingUp, FiPlus, FiCheck, FiAlertCircle } from 'react-icons/fi';
import toast from 'react-hot-toast';

const ManageCourses = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterLevel, setFilterLevel] = useState('');
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [enrolledStudents, setEnrolledStudents] = useState([]);
  const [studentsLoading, setStudentsLoading] = useState(false);
  const [showStudentsModal, setShowStudentsModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [teachers, setTeachers] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [creating, setCreating] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: 0,
    teacher: '',
    subject: '',
    level: 'beginner',
    duration: 0,
    thumbnail: '',
    isPublished: false,
  });

  useEffect(() => {
    fetchCourses();
    fetchTeachers();
    fetchSubjects();
  }, [filterLevel]);

  const fetchTeachers = async () => {
    try {
      const response = await axiosInstance.get('/users?role=teacher&limit=100');
      setTeachers(response.data.data || []);
    } catch (error) {
      // Silently fail
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

  const fetchCourses = async () => {
    try {
      const params = new URLSearchParams();
      if (filterLevel) params.append('level', filterLevel);
      params.append('limit', '100'); // Get more courses

      const response = await axiosInstance.get(`/courses?${params.toString()}`);
      setCourses(response.data.data || []);
    } catch (error) {
      toast.error('Failed to load courses');
    } finally {
      setLoading(false);
    }
  };

  const handleTogglePublish = async (courseId, currentStatus) => {
    try {
      await axiosInstance.put(`/courses/${courseId}`, {
        isPublished: !currentStatus,
      });
      toast.success(`Course ${!currentStatus ? 'published' : 'unpublished'} successfully`);
      fetchCourses();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to update course');
    }
  };

  const handleDelete = async (courseId, courseTitle) => {
    if (!window.confirm(`Are you sure you want to delete course "${courseTitle}"? This action cannot be undone.`)) {
      return;
    }

    try {
      await axiosInstance.delete(`/courses/${courseId}`);
      toast.success('Course deleted successfully');
      fetchCourses();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to delete course');
    }
  };

  const handleViewStudents = async (course) => {
    setSelectedCourse(course);
    setShowStudentsModal(true);
    setStudentsLoading(true);
    setEnrolledStudents([]);

    try {
      const response = await axiosInstance.get(`/courses/${course._id}/students`);
      setEnrolledStudents(response.data.data || []);
    } catch (error) {
      toast.error('Failed to load enrolled students');
    } finally {
      setStudentsLoading(false);
    }
  };

  const handleApproveCourse = async (courseId, courseTitle) => {
    if (!window.confirm(`Approve and publish course "${courseTitle}"?`)) {
      return;
    }

    try {
      await axiosInstance.put(`/admin/courses/${courseId}/approve`);
      toast.success('Course approved and published successfully');
      fetchCourses();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to approve course');
    }
  };

  const handleRejectCourse = async (courseId, courseTitle) => {
    const reason = window.prompt(`Reject course "${courseTitle}"?\nPlease provide a reason (optional):`);
    if (reason === null) return; // User cancelled

    try {
      await axiosInstance.put(`/admin/courses/${courseId}/reject`, { reason: reason || '' });
      toast.success('Course rejected and unpublished successfully');
      fetchCourses();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to reject course');
    }
  };

  const handleCreateCourse = async (e) => {
    e.preventDefault();
    setCreating(true);

    try {
      const response = await axiosInstance.post('/courses', formData);
      toast.success('Course created successfully');
      setShowCreateModal(false);
      setFormData({
        title: '',
        description: '',
        price: 0,
        teacher: '',
        subject: '',
        level: 'beginner',
        duration: 0,
        thumbnail: '',
        isPublished: false,
      });
      fetchCourses();
      // Navigate to edit page
      navigate(`/teacher/courses/${response.data.data._id}/edit`);
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to create course');
    } finally {
      setCreating(false);
    }
  };

  const filteredCourses = courses.filter((course) => {
    const matchesSearch = searchTerm === '' || 
      course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.teacher?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const getLevelBadgeColor = (level) => {
    switch (level) {
      case 'beginner':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'advanced':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
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
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Manage Courses</h1>
        <div className="flex space-x-2">
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn-primary flex items-center space-x-2"
          >
            <FiPlus />
            <span>Create Course</span>
          </button>
          <Link to="/admin/dashboard" className="btn-outline">
            Back to Dashboard
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="card mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Search Courses
            </label>
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by title, description, or teacher..."
                className="input-field pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Filter by Level
            </label>
            <select
              className="input-field"
              value={filterLevel}
              onChange={(e) => setFilterLevel(e.target.value)}
            >
              <option value="">All Levels</option>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>
        </div>
      </div>

      {/* Courses Grid */}
      {filteredCourses.length === 0 ? (
        <div className="card text-center py-12">
          <FiBook className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">No courses found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course) => (
            <div key={course._id} className="card">
              <div className="w-full h-48 bg-gray-200 dark:bg-gray-700 rounded-lg mb-4 flex items-center justify-center overflow-hidden">
                {course.thumbnail ? (
                  <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover" />
                ) : (
                  <FiBook className="w-16 h-16 text-gray-400" />
                )}
              </div>
              
              <div className="mb-4">
                <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white line-clamp-2">
                  {course.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-3 line-clamp-2">
                  {course.description}
                </p>
                
                <div className="flex flex-wrap gap-2 mb-3">
                  <span className={`px-2 py-1 text-xs rounded font-medium ${getLevelBadgeColor(course.level)}`}>
                    {course.level?.charAt(0).toUpperCase() + course.level?.slice(1)}
                  </span>
                  <span className={`px-2 py-1 text-xs rounded font-medium flex items-center space-x-1 ${
                    course.isPublished && course.isActive
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                      : !course.isActive
                      ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                      : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                  }`}>
                    {course.isPublished && course.isActive ? <FiEye /> : !course.isActive ? <FiAlertCircle /> : <FiEyeOff />}
                    <span>
                      {course.isPublished && course.isActive
                        ? 'Published'
                        : !course.isActive
                        ? 'Rejected'
                        : 'Draft'}
                    </span>
                  </span>
                </div>

                <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  <span className="font-medium">Teacher:</span> {course.teacher?.name || 'N/A'}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  <span className="font-medium">Subject:</span> {course.subject?.name || 'N/A'}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  <span className="font-medium">Price:</span> ${course.price || 0}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  <span className="font-medium">Enrolled:</span> {course.studentsEnrolled?.length || 0} students
                </div>
              </div>

              <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                <Link
                  to={`/courses/${course._id}`}
                  className="flex-1 btn-outline text-center text-sm min-w-[80px]"
                >
                  View
                </Link>
                <Link
                  to={`/teacher/courses/${course._id}/edit`}
                  className="flex-1 btn-primary text-center text-sm min-w-[80px] flex items-center justify-center"
                  title="Edit Course"
                >
                  <FiEdit className="inline mr-1" />
                  Edit
                </Link>
                <button
                  onClick={() => handleViewStudents(course)}
                  className="flex-1 btn-outline text-sm min-w-[100px] flex items-center justify-center"
                  title="View Enrolled Students"
                  disabled={!course.studentsEnrolled || course.studentsEnrolled.length === 0}
                >
                  <FiUsers className="inline mr-1" />
                  Students ({course.studentsEnrolled?.length || 0})
                </button>
                {!course.isPublished || !course.isActive ? (
                  <>
                    <button
                      onClick={() => handleApproveCourse(course._id, course.title)}
                      className="flex-1 btn-outline text-green-600 text-sm min-w-[100px] flex items-center justify-center"
                      title="Approve & Publish Course"
                    >
                      <FiCheck className="inline mr-1" />
                      Approve
                    </button>
                    {course.isPublished && !course.isActive ? (
                      <button
                        onClick={() => handleRejectCourse(course._id, course.title)}
                        className="btn-outline text-red-600 text-sm"
                        title="Reject Course"
                        disabled
                      >
                        <FiAlertCircle />
                      </button>
                    ) : (
                      <button
                        onClick={() => handleRejectCourse(course._id, course.title)}
                        className="btn-outline text-red-600 text-sm"
                        title="Reject Course"
                      >
                        <FiX />
                      </button>
                    )}
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => handleTogglePublish(course._id, course.isPublished)}
                      className={`flex-1 btn-outline text-sm min-w-[100px] ${
                        course.isPublished ? 'text-yellow-600' : 'text-green-600'
                      }`}
                      title={course.isPublished ? 'Unpublish' : 'Publish'}
                    >
                      {course.isPublished ? <FiEyeOff className="inline mr-1" /> : <FiEye className="inline mr-1" />}
                      {course.isPublished ? 'Unpublish' : 'Publish'}
                    </button>
                    <button
                      onClick={() => handleRejectCourse(course._id, course.title)}
                      className="btn-outline text-red-600 text-sm"
                      title="Reject Course"
                    >
                      <FiX />
                    </button>
                  </>
                )}
                <button
                  onClick={() => handleDelete(course._id, course.title)}
                  className="btn-outline text-red-600 text-sm"
                  title="Delete Course"
                >
                  <FiTrash2 />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
        Total: {filteredCourses.length} course(s)
      </div>

      {/* Students Modal */}
      {showStudentsModal && selectedCourse && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Enrolled Students
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {selectedCourse.title}
                </p>
              </div>
              <button
                onClick={() => {
                  setShowStudentsModal(false);
                  setSelectedCourse(null);
                  setEnrolledStudents([]);
                }}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <FiX className="w-6 h-6 text-gray-600 dark:text-gray-400" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6">
              {studentsLoading ? (
                <div className="text-center py-12">
                  <div className="text-gray-600 dark:text-gray-400">Loading students...</div>
                </div>
              ) : enrolledStudents.length === 0 ? (
                <div className="text-center py-12">
                  <FiUsers className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-400">No students enrolled yet.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Total Enrolled: <span className="font-semibold text-gray-900 dark:text-white">{enrolledStudents.length}</span> student(s)
                    </p>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-200 dark:border-gray-700">
                          <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">Name</th>
                          <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">Email</th>
                          <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">Progress</th>
                          <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">Enrolled</th>
                          <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">Last Accessed</th>
                        </tr>
                      </thead>
                      <tbody>
                        {enrolledStudents.map((student) => (
                          <tr
                            key={student._id}
                            className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
                          >
                            <td className="py-4 px-4">
                              <div className="flex items-center space-x-2">
                                <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
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
                                <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2 max-w-[100px]">
                                  <div
                                    className="bg-primary-600 h-2 rounded-full transition-all"
                                    style={{ width: `${student.progress.completionPercentage}%` }}
                                  />
                                </div>
                                <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                                  {student.progress.completionPercentage}%
                                </span>
                              </div>
                            </td>
                            <td className="py-4 px-4 text-sm text-gray-600 dark:text-gray-400">
                              {new Date(student.enrollmentDate).toLocaleDateString()}
                            </td>
                            <td className="py-4 px-4 text-sm text-gray-600 dark:text-gray-400">
                              {student.progress.lastAccessed
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

            {/* Modal Footer */}
            <div className="flex justify-end p-6 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => {
                  setShowStudentsModal(false);
                  setSelectedCourse(null);
                  setEnrolledStudents([]);
                }}
                className="btn-outline"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Course Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Create New Course</h2>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setFormData({
                    title: '',
                    description: '',
                    price: 0,
                    teacher: '',
                    subject: '',
                    level: 'beginner',
                    duration: 0,
                    thumbnail: '',
                    isPublished: false,
                  });
                }}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                <FiX className="w-6 h-6 text-gray-600 dark:text-gray-400" />
              </button>
            </div>

            <form onSubmit={handleCreateCourse} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Course Title *
                </label>
                <input
                  type="text"
                  required
                  className="input-field w-full"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Enter course title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description *
                </label>
                <textarea
                  required
                  className="input-field w-full"
                  rows="4"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Enter course description"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Assign Teacher *
                  </label>
                  <select
                    required
                    className="input-field w-full"
                    value={formData.teacher}
                    onChange={(e) => setFormData({ ...formData, teacher: e.target.value })}
                  >
                    <option value="">Select a teacher</option>
                    {teachers.map((teacher) => (
                      <option key={teacher._id} value={teacher._id}>
                        {teacher.name} ({teacher.email})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Subject *
                  </label>
                  <select
                    required
                    className="input-field w-full"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  >
                    <option value="">Select a subject</option>
                    {subjects.map((subject) => (
                      <option key={subject._id} value={subject._id}>
                        {subject.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Price ($) *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    className="input-field w-full"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Level *
                  </label>
                  <select
                    required
                    className="input-field w-full"
                    value={formData.level}
                    onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Duration (hours)
                  </label>
                  <input
                    type="number"
                    min="0"
                    className="input-field w-full"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) || 0 })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Thumbnail URL
                </label>
                <input
                  type="url"
                  className="input-field w-full"
                  value={formData.thumbnail}
                  onChange={(e) => setFormData({ ...formData, thumbnail: e.target.value })}
                  placeholder="https://example.com/image.jpg"
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isPublished"
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  checked={formData.isPublished}
                  onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
                />
                <label htmlFor="isPublished" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Publish course immediately
                </label>
              </div>

              <div className="flex justify-end space-x-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    setFormData({
                      title: '',
                      description: '',
                      price: 0,
                      teacher: '',
                      subject: '',
                      level: 'beginner',
                      duration: 0,
                      thumbnail: '',
                      isPublished: false,
                    });
                  }}
                  className="btn-outline"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="btn-primary"
                >
                  {creating ? 'Creating...' : 'Create Course'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageCourses;

