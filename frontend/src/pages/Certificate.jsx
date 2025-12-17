import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import axiosInstance from '../utils/axios';
import { FiDownload, FiArrowLeft, FiCheckCircle } from 'react-icons/fi';
import toast from 'react-hot-toast';

const Certificate = () => {
  const { id } = useParams();
  const { user } = useSelector((state) => state.auth);
  const [certificate, setCertificate] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCertificate();
  }, [id]);

  const fetchCertificate = async () => {
    try {
      const response = await axiosInstance.get(`/certificates/${id}`);
      setCertificate(response.data.data);
    } catch (error) {
      toast.error('Failed to load certificate');
    } finally {
      setLoading(false);
    }
  };

  // Get backend URL for file access
  const getBackendUrl = () => {
    if (import.meta.env.VITE_API_URL) {
      return import.meta.env.VITE_API_URL;
    }
    return window.location.origin.includes('localhost') 
      ? 'http://localhost:5000' 
      : window.location.origin.replace(':5173', ':5000');
  };

  const handleDownload = () => {
    if (certificate.pdfUrl) {
      // Handle both relative and absolute URLs
      let url = certificate.pdfUrl;
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        // Relative URL, prepend backend URL
        url = url.startsWith('/') 
          ? `${getBackendUrl()}${url}` 
          : `${getBackendUrl()}/${url}`;
      }
      window.open(url, '_blank');
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  if (!certificate) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Certificate not found</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Link
        to={
          user?.role === 'admin' 
            ? '/admin/dashboard' 
            : user?.role === 'teacher'
            ? '/teacher/dashboard'
            : '/student/dashboard'
        }
        className="text-primary-600 hover:text-primary-700 mb-6 inline-flex items-center space-x-2"
      >
        <FiArrowLeft />
        <span>Back to Dashboard</span>
      </Link>

      <div className="card text-center">
        <div className="mb-6">
          <FiCheckCircle className="w-20 h-20 text-green-600 mx-auto mb-4" />
          <h1 className="text-3xl font-bold mb-2 text-gray-900 dark:text-white">
            Certificate of Completion
          </h1>
        </div>

        <div className="border-4 border-primary-600 rounded-lg p-8 mb-6">
          <p className="text-gray-600 dark:text-gray-400 mb-4">This is to certify that</p>
          <h2 className="text-4xl font-bold mb-4 text-gray-900 dark:text-white">
            {certificate.customName || certificate.student?.name || user?.name}
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            has successfully completed the course
          </p>
          <h3 className="text-2xl font-semibold text-primary-600 mb-4">
            {certificate.course?.title}
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Issued on {new Date(certificate.issueDate).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
        </div>

        <div className="mb-6">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
            Certificate ID: {certificate.certificateId}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Verification Code: {certificate.verificationCode}
          </p>
        </div>

        <button onClick={handleDownload} className="btn-primary inline-flex items-center space-x-2">
          <FiDownload />
          <span>Download Certificate</span>
        </button>
      </div>
    </div>
  );
};

export default Certificate;

