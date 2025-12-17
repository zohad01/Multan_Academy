import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../utils/axios';
import { FiX, FiAward } from 'react-icons/fi';
import toast from 'react-hot-toast';

const GenerateCertificateModal = ({ course, isOpen, onClose, user }) => {
  const navigate = useNavigate();
  const [customName, setCustomName] = useState(user?.name || '');
  const [generating, setGenerating] = useState(false);

  const handleGenerate = async (e) => {
    e.preventDefault();
    
    if (!customName.trim()) {
      toast.error('Please enter your name');
      return;
    }

    setGenerating(true);
    try {
      const response = await axiosInstance.post(`/certificates/generate/${course._id}`, {
        customName: customName.trim(),
      });
      
      toast.success('Certificate generated successfully!');
      onClose();
      navigate(`/certificates/${response.data.data._id}`);
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to generate certificate');
    } finally {
      setGenerating(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <FiAward className="w-6 h-6 text-yellow-600" />
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Generate Certificate
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <FiX className="w-6 h-6" />
          </button>
        </div>

        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Enter the name you want to appear on your certificate for:
        </p>
        <p className="font-semibold text-gray-900 dark:text-white mb-6">
          {course.title}
        </p>

        <form onSubmit={handleGenerate}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Name on Certificate *
            </label>
            <input
              type="text"
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              required
              className="input-field w-full"
              placeholder="Enter your full name"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              This name will appear on your certificate
            </p>
          </div>

          <div className="flex space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="btn-outline flex-1"
              disabled={generating}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary flex-1"
              disabled={generating}
            >
              {generating ? 'Generating...' : 'Generate Certificate'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default GenerateCertificateModal;

