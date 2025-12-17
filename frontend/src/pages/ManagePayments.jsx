import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axiosInstance from '../utils/axios';
import { FiDollarSign, FiSearch, FiCheck, FiX, FiClock, FiMail, FiBook, FiUser, FiImage, FiEye } from 'react-icons/fi';
import toast from 'react-hot-toast';

const ManagePayments = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [verifyingId, setVerifyingId] = useState(null);
  const [rejectingId, setRejectingId] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [receiptPreview, setReceiptPreview] = useState(null);

  useEffect(() => {
    fetchPayments();
  }, [filterStatus]);

  const fetchPayments = async () => {
    try {
      const params = new URLSearchParams();
      if (filterStatus) params.append('status', filterStatus);
      params.append('limit', '100');

      const response = await axiosInstance.get(`/admin/payments?${params.toString()}`);
      setPayments(response.data.data || []);
    } catch (error) {
      toast.error('Failed to load payments');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (paymentId) => {
    if (!window.confirm('Are you sure you want to verify this payment? This will enroll the student in the course.')) {
      return;
    }

    setVerifyingId(paymentId);
    try {
      await axiosInstance.put(`/admin/payments/${paymentId}/verify`);
      toast.success('Payment verified successfully');
      fetchPayments();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to verify payment');
    } finally {
      setVerifyingId(null);
    }
  };

  const handleReject = async (paymentId) => {
    if (!rejectionReason.trim()) {
      toast.error('Please provide a rejection reason');
      return;
    }

    if (!window.confirm('Are you sure you want to reject this payment?')) {
      return;
    }

    setRejectingId(paymentId);
    try {
      await axiosInstance.put(`/admin/payments/${paymentId}/reject`, {
        reason: rejectionReason,
      });
      toast.success('Payment rejected successfully');
      setRejectionReason('');
      setRejectingId(null);
      fetchPayments();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to reject payment');
    } finally {
      setRejectingId(null);
    }
  };

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'failed':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'refunded':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const filteredPayments = payments.filter((payment) => {
    const matchesSearch = searchTerm === '' ||
      payment.student?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.student?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.course?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.transactionId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.paymentReferenceId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.manualTransactionId?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const getReceiptUrl = (receiptPath) => {
    if (!receiptPath) return null;
    if (receiptPath.startsWith('http')) return receiptPath;
    // Receipts are served from /uploads (not under /api)
    if (receiptPath.startsWith('/uploads')) {
      return receiptPath;
    }
    return receiptPath;
  };

  const pendingPayments = filteredPayments.filter(p => p.status === 'pending').length;
  const completedPayments = filteredPayments.filter(p => p.status === 'completed').length;
  const totalAmount = filteredPayments
    .filter(p => p.status === 'completed')
    .reduce((sum, p) => sum + (p.amount || 0), 0);

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
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Manage Payments</h1>
        <Link to="/admin/dashboard" className="btn-outline">
          Back to Dashboard
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Pending Payments</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{pendingPayments}</p>
            </div>
            <FiClock className="w-8 h-8 text-yellow-600" />
          </div>
        </div>
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Completed</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{completedPayments}</p>
            </div>
            <FiCheck className="w-8 h-8 text-green-600" />
          </div>
        </div>
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">${totalAmount.toFixed(2)}</p>
            </div>
            <FiDollarSign className="w-8 h-8 text-blue-600" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Search Payments
            </label>
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by student, course, or transaction ID..."
                className="input-field pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Filter by Status
            </label>
            <select
              className="input-field"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
              <option value="rejected">Rejected</option>
              <option value="failed">Failed</option>
              <option value="refunded">Refunded</option>
            </select>
          </div>
        </div>
      </div>

      {/* Payments Table */}
      {filteredPayments.length === 0 ? (
        <div className="card text-center py-12">
          <FiDollarSign className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">No payments found.</p>
        </div>
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">Payment Info</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">Student</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">Course</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">Amount</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">Status</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">Date</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-900 dark:text-white">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPayments.map((payment) => (
                <tr
                  key={payment._id}
                  className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <td className="py-4 px-4">
                    <div className="space-y-1">
                      <div className="text-sm font-mono text-gray-900 dark:text-white">
                        <span className="text-xs text-gray-500 dark:text-gray-400">TXN ID:</span> {payment.transactionId}
                      </div>
                      {payment.paymentReferenceId && (
                        <div className="text-xs font-mono text-blue-600 dark:text-blue-400">
                          <span className="text-gray-500 dark:text-gray-400">Ref:</span> {payment.paymentReferenceId}
                        </div>
                      )}
                      {payment.manualTransactionId && (
                        <div className="text-xs font-mono text-gray-700 dark:text-gray-300">
                          <span className="text-gray-500 dark:text-gray-400">
                            {payment.paymentMethod === 'easypaisa' ? 'EasyPaisa' : 
                             payment.paymentMethod === 'jazzcash' ? 'JazzCash' : 
                             'Bank Transfer'} ID:
                          </span> {payment.manualTransactionId}
                        </div>
                      )}
                      {payment.receiptImage && (
                        <button
                          onClick={() => setReceiptPreview(payment)}
                          className="mt-1 flex items-center space-x-1 text-xs text-primary-600 hover:text-primary-700 dark:text-primary-400"
                        >
                          <FiImage className="w-3 h-3" />
                          <span>View Receipt</span>
                        </button>
                      )}
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                        {payment.student?.name?.charAt(0).toUpperCase() || '?'}
                      </div>
                      <div>
                        <div className="text-gray-900 dark:text-white font-medium">
                          {payment.student?.name || 'N/A'}
                        </div>
                        <div className="text-xs text-gray-600 dark:text-gray-400 flex items-center space-x-1">
                          <FiMail className="w-3 h-3" />
                          <span>{payment.student?.email || 'N/A'}</span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center space-x-2 text-gray-900 dark:text-white">
                      <FiBook className="w-4 h-4" />
                      <span className="text-sm">{payment.course?.title || 'N/A'}</span>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <span className="font-semibold text-gray-900 dark:text-white">
                      ${payment.amount?.toFixed(2) || '0.00'}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <span className={`px-2 py-1 text-xs rounded font-medium ${getStatusBadgeColor(payment.status)}`}>
                      {payment.status?.charAt(0).toUpperCase() + payment.status?.slice(1)}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-600 dark:text-gray-400">
                    {new Date(payment.createdAt).toLocaleDateString()}
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex justify-end space-x-2">
                      {payment.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleVerify(payment._id)}
                            disabled={verifyingId === payment._id}
                            className="p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-900 rounded disabled:opacity-50"
                            title="Verify Payment"
                          >
                            <FiCheck className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => {
                              setRejectingId(payment._id);
                              setRejectionReason('');
                            }}
                            disabled={rejectingId === payment._id}
                            className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900 rounded disabled:opacity-50"
                            title="Reject Payment"
                          >
                            <FiX className="w-5 h-5" />
                          </button>
                        </>
                      )}
                      {payment.status === 'completed' && payment.verifiedBy && (
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          Verified {new Date(payment.verifiedAt).toLocaleDateString()}
                        </span>
                      )}
                      {payment.status === 'rejected' && payment.rejectionReason && (
                        <span className="text-xs text-red-600 dark:text-red-400" title={payment.rejectionReason}>
                          Rejected: {payment.rejectionReason}
                        </span>
                      )}
                      {payment.status === 'failed' && (
                        <span className="text-xs text-red-600 dark:text-red-400">
                          Failed
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Receipt Preview Modal */}
      {receiptPreview && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  Payment Receipt - {receiptPreview.course?.title}
                </h3>
                <button
                  onClick={() => setReceiptPreview(null)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  <FiX className="w-6 h-6" />
                </button>
              </div>
              
              <div className="mb-4 space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <p><strong>Student:</strong> {receiptPreview.student?.name} ({receiptPreview.student?.email})</p>
                <p><strong>Amount:</strong> ${receiptPreview.amount?.toFixed(2)}</p>
                <p><strong>Payment Method:</strong> {
                  receiptPreview.paymentMethod === 'easypaisa' ? 'EasyPaisa' :
                  receiptPreview.paymentMethod === 'jazzcash' ? 'JazzCash' :
                  receiptPreview.paymentMethod === 'bank_transfer' ? 'Bank Transfer' :
                  'Mock Payment'
                }</p>
                {receiptPreview.manualTransactionId && (
                  <p><strong>Transaction ID:</strong> <code className="font-mono">{receiptPreview.manualTransactionId}</code></p>
                )}
                {receiptPreview.paymentReferenceId && (
                  <p><strong>Reference ID:</strong> <code className="font-mono">{receiptPreview.paymentReferenceId}</code></p>
                )}
              </div>

              {receiptPreview.receiptImage ? (
                <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-gray-50 dark:bg-gray-900">
                  <img
                    src={getReceiptUrl(receiptPreview.receiptImage)}
                    alt="Payment Receipt"
                    className="max-w-full h-auto mx-auto rounded"
                  />
                  <div className="mt-2 text-center">
                    <a
                      href={getReceiptUrl(receiptPreview.receiptImage)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400 inline-flex items-center space-x-1"
                    >
                      <FiEye className="w-4 h-4" />
                      <span>Open in new tab</span>
                    </a>
                  </div>
                </div>
              ) : (
                <div className="text-center text-gray-500 dark:text-gray-400 py-8 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <FiImage className="w-16 h-16 mx-auto mb-2 opacity-50" />
                  <p>No receipt available</p>
                </div>
              )}

              <div className="mt-4 flex justify-end">
                <button
                  onClick={() => setReceiptPreview(null)}
                  className="btn-outline"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Rejection Modal */}
      {rejectingId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Reject Payment
            </h3>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Rejection Reason *
              </label>
              <textarea
                className="input-field w-full"
                rows="4"
                placeholder="Please provide a reason for rejecting this payment..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
              />
            </div>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => {
                  setRejectingId(null);
                  setRejectionReason('');
                }}
                className="btn-outline"
              >
                Cancel
              </button>
              <button
                onClick={() => handleReject(rejectingId)}
                className="btn-primary"
                disabled={!rejectionReason.trim()}
              >
                Reject Payment
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
        Total: {filteredPayments.length} payment(s)
      </div>
    </div>
  );
};

export default ManagePayments;

