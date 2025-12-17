import { useState } from 'react';
import { FiX } from 'react-icons/fi';
import axiosInstance from '../utils/axios';
import toast from 'react-hot-toast';

const AddMaterialModal = ({ courseId, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    fileUrl: '',
    fileType: 'pdf',
    order: 0,
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await axiosInstance.post('/materials', {
        ...formData,
        course: courseId,
        order: parseInt(formData.order) || 0,
      });
      toast.success('Material added successfully!');
      // Reset form
      setFormData({
        title: '',
        description: '',
        fileUrl: '',
        fileType: 'pdf',
        order: 0,
      });
      onSuccess();
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to add material');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Add Material</h2>
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
              Material Title *
            </label>
            <input
              type="text"
              name="title"
              required
              value={formData.title}
              onChange={handleChange}
              className="input-field w-full"
              placeholder="Enter material title"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              File URL *
            </label>
            <input
              type="url"
              name="fileUrl"
              required
              value={formData.fileUrl}
              onChange={handleChange}
              className="input-field w-full"
              placeholder="https://example.com/document.pdf"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Enter the URL to the PDF, document, or resource
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              File Type *
            </label>
            <select
              name="fileType"
              required
              value={formData.fileType}
              onChange={handleChange}
              className="input-field w-full"
            >
              <option value="pdf">PDF</option>
              <option value="doc">Document</option>
              <option value="docx">Word Document</option>
              <option value="xls">Excel</option>
              <option value="ppt">PowerPoint</option>
              <option value="link">Link</option>
              <option value="other">Other</option>
            </select>
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
              placeholder="Enter material description"
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
              {loading ? 'Adding...' : 'Add Material'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddMaterialModal;

