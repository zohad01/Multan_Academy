import { useState } from 'react';
import { FiX } from 'react-icons/fi';
import axiosInstance from '../utils/axios';
import toast from 'react-hot-toast';

const AddVideoModal = ({ courseId, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    videoUrl: '',
    duration: 0,
    order: 0,
    isPreview: false,
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await axiosInstance.post('/videos', {
        ...formData,
        course: courseId,
        duration: parseInt(formData.duration) || 0,
        order: parseInt(formData.order) || 0,
      });
      toast.success('Video added successfully!');
      // Reset form
      setFormData({
        title: '',
        description: '',
        videoUrl: '',
        duration: 0,
        order: 0,
        isPreview: false,
      });
      onSuccess();
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to add video');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Add Video</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <FiX className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Video Title *
            </label>
            <input
              type="text"
              name="title"
              required
              value={formData.title}
              onChange={handleChange}
              className="input-field w-full"
              placeholder="Enter video title"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Video URL *
            </label>
            <input
              type="url"
              name="videoUrl"
              required
              value={formData.videoUrl}
              onChange={handleChange}
              className="input-field w-full"
              placeholder="https://example.com/video.mp4 or YouTube/Vimeo URL"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Supports direct video URLs, YouTube, and Vimeo links
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="input-field w-full"
              rows="3"
              placeholder="Enter video description"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Duration (seconds)
              </label>
              <input
                type="number"
                name="duration"
                value={formData.duration}
                onChange={handleChange}
                className="input-field w-full"
                min="0"
                placeholder="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Order
              </label>
              <input
                type="number"
                name="order"
                value={formData.order}
                onChange={handleChange}
                className="input-field w-full"
                min="0"
                placeholder="0"
              />
            </div>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="isPreview"
              name="isPreview"
              checked={formData.isPreview}
              onChange={handleChange}
              className="w-4 h-4 text-primary-600 rounded"
            />
            <label htmlFor="isPreview" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
              Mark as preview video (free to watch)
            </label>
          </div>

          <div className="flex justify-end space-x-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="btn-outline"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={loading}
            >
              {loading ? 'Adding...' : 'Add Video'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddVideoModal;

