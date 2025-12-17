import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import axiosInstance from '../utils/axios';
import { FiArrowLeft, FiFile, FiUpload } from 'react-icons/fi';
import toast from 'react-hot-toast';

const Assignment = () => {
  const { id, assignmentId } = useParams();
  const { user } = useSelector((state) => state.auth);
  const [assignment, setAssignment] = useState(null);
  const [answer, setAnswer] = useState('');
  const [files, setFiles] = useState([]);
  const [submitted, setSubmitted] = useState(false);
  const [submission, setSubmission] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAssignment();
  }, [assignmentId]);

  const fetchAssignment = async () => {
    try {
      const response = await axiosInstance.get(`/assignments/${assignmentId}`);
      setAssignment(response.data.data);
      setSubmitted(response.data.data.isSubmitted);
      if (response.data.data.submission) {
        setSubmission(response.data.data.submission);
        setAnswer(response.data.data.submission.assignmentAnswer);
      }
    } catch (error) {
      toast.error('Failed to load assignment');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    setFiles(Array.from(e.target.files));
  };

  const handleSubmit = async () => {
    if (!answer.trim() && files.length === 0) {
      toast.error('Please provide an answer or upload files');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('answer', answer);
      files.forEach((file) => {
        formData.append('files', file);
      });

      const response = await axiosInstance.post(`/assignments/${assignmentId}/submit`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setSubmission(response.data.data);
      setSubmitted(true);
      toast.success('Assignment submitted successfully!');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to submit assignment');
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  if (!assignment) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Assignment not found</div>
      </div>
    );
  }

  const isOverdue = new Date(assignment.dueDate) < new Date() && !submitted;

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Link
        to={`/courses/${id}`}
        className="text-primary-600 hover:text-primary-700 mb-6 inline-flex items-center space-x-2"
      >
        <FiArrowLeft />
        <span>Back to Course</span>
      </Link>

      <div className="card">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-2 text-gray-900 dark:text-white">
              {assignment.title}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Due: {new Date(assignment.dueDate).toLocaleDateString()}
            </p>
          </div>
          {isOverdue && (
            <span className="px-3 py-1 bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 rounded">
              Overdue
            </span>
          )}
        </div>

        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">Description</h2>
          <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line">
            {assignment.description}
          </p>
        </div>

        {assignment.instructions && (
          <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900 rounded-lg">
            <h2 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">Instructions</h2>
            <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line">
              {assignment.instructions}
            </p>
          </div>
        )}

        {assignment.attachments && assignment.attachments.length > 0 && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">Attachments</h2>
            <div className="space-y-2">
              {assignment.attachments.map((attachment, index) => (
                <a
                  key={index}
                  href={attachment.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-2 text-primary-600 hover:text-primary-700"
                >
                  <FiFile />
                  <span>{attachment.fileName}</span>
                </a>
              ))}
            </div>
          </div>
        )}

        {submitted && submission && (
          <div className="mb-6 p-4 bg-green-50 dark:bg-green-900 rounded-lg">
            <h2 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">Your Submission</h2>
            <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line mb-4">
              {submission.assignmentAnswer}
            </p>
            {submission.assignmentFiles && submission.assignmentFiles.length > 0 && (
              <div>
                <h3 className="font-semibold mb-2 text-gray-900 dark:text-white">Uploaded Files</h3>
                <div className="space-y-2">
                  {submission.assignmentFiles.map((file, index) => (
                    <a
                      key={index}
                      href={file.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-2 text-primary-600 hover:text-primary-700"
                    >
                      <FiFile />
                      <span>{file.fileName}</span>
                    </a>
                  ))}
                </div>
              </div>
            )}
            {submission.assignmentScore !== null && (
              <div className="mt-4">
                <p className="text-gray-700 dark:text-gray-300">
                  Score: {submission.assignmentScore} / {assignment.totalPoints}
                </p>
                {submission.assignmentFeedback && (
                  <div className="mt-2">
                    <h3 className="font-semibold text-gray-900 dark:text-white">Feedback</h3>
                    <p className="text-gray-700 dark:text-gray-300">{submission.assignmentFeedback}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {!submitted && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Your Answer
              </label>
              <textarea
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                rows={10}
                className="input-field"
                placeholder="Type your answer here..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Upload Files (Optional)
              </label>
              <input
                type="file"
                multiple
                onChange={handleFileChange}
                className="input-field"
              />
              {files.length > 0 && (
                <div className="mt-2 space-y-1">
                  {files.map((file, index) => (
                    <div key={index} className="text-sm text-gray-600 dark:text-gray-400">
                      {file.name}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button onClick={handleSubmit} className="btn-primary w-full">
              <FiUpload className="inline mr-2" />
              Submit Assignment
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Assignment;

