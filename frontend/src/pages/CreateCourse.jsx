import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import axiosInstance from '../utils/axios';
import { FiSave, FiX, FiArrowLeft } from 'react-icons/fi';
import toast from 'react-hot-toast';

const CreateCourse = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [subjects, setSubjects] = useState([]);
  const [creating, setCreating] = useState(false);

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

  useEffect(() => {
    fetchSubjects();
  }, []);

  const fetchSubjects = async () => {
    try {
      const response = await axiosInstance.get('/subjects');
      setSubjects(response.data.data || []);
    } catch (error) {
      toast.error('Failed to load subjects');
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleCreateCourse = async (e) => {
    e.preventDefault();

    // Validate required fields
    if (!formData.title.trim()) {
      toast.error('Please enter a course title');
      return;
    }
    if (!formData.subject) {
      toast.error('Please select a subject');
      return;
    }
    if (!formData.description.trim()) {
      toast.error('Please enter a course description');
      return;
    }

    setCreating(true);
    try {
      const response = await axiosInstance.post('/courses', formData);
      toast.success('Course created successfully!');
      // Navigate to edit page to add content (videos, quizzes, etc.)
      navigate(`/teacher/courses/${response.data.data._id}/edit`);
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to create course');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link 
            to="/teacher/dashboard" 
            className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
          >
            <FiArrowLeft className="w-6 h-6" />
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Create New Course
          </h1>
        </div>
        <Link 
          to="/teacher/dashboard" 
          className="btn-outline"
        >
          <FiX className="inline mr-2" />
          Cancel
        </Link>
      </div>

      <div className="card">
        <form onSubmit={handleCreateCourse} className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Course Details</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Course Title * <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className="input-field"
                placeholder="Enter course title"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Price ($) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                className="input-field"
                min="0"
                step="0.01"
                placeholder="0.00"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Subject <span className="text-red-500">*</span>
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
                Level <span className="text-red-500">*</span>
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
                Duration (hours) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="duration"
                value={formData.duration}
                onChange={handleInputChange}
                className="input-field"
                min="0"
                step="0.5"
                placeholder="0"
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
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Optional: Add a thumbnail image URL for your course
              </p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              className="input-field"
              rows="6"
              placeholder="Enter a detailed description of your course..."
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
              Publish this course immediately (make it visible to students)
            </label>
          </div>

          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              <strong>Note:</strong> After creating the course, you'll be able to add videos, quizzes, assignments, and materials.
            </p>
          </div>

          <div className="flex justify-end space-x-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Link
              to="/teacher/dashboard"
              className="btn-outline"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={creating}
              className="btn-primary"
            >
              <FiSave className="inline mr-2" />
              {creating ? 'Creating...' : 'Create Course'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateCourse;

