import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axiosInstance from '../utils/axios';
import { FiUsers, FiSearch, FiEdit, FiTrash2, FiX, FiCheck, FiMail, FiUser, FiShield, FiLock, FiUnlock } from 'react-icons/fi';
import toast from 'react-hot-toast';

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterRole, setFilterRole] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [editingUser, setEditingUser] = useState(null);
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    role: '',
    isActive: true,
  });

  useEffect(() => {
    fetchUsers();
  }, [filterRole]);

  const fetchUsers = async () => {
    try {
      const params = new URLSearchParams();
      if (filterRole) params.append('role', filterRole);
      params.append('limit', '100'); // Get more users

      const response = await axiosInstance.get(`/users?${params.toString()}`);
      setUsers(response.data.data || []);
    } catch (error) {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (user) => {
    setEditingUser(user._id);
    setEditForm({
      name: user.name,
      email: user.email,
      role: user.role,
      isActive: user.isActive !== undefined ? user.isActive : true,
    });
  };

  const handleSave = async (userId) => {
    try {
      const response = await axiosInstance.put(`/users/${userId}`, editForm);
      toast.success('User updated successfully');
      setEditingUser(null);
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to update user');
    }
  };

  const handleDelete = async (userId, userName, userRole) => {
    if (!window.confirm(`Are you sure you want to delete user "${userName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const response = await axiosInstance.delete(`/users/${userId}`);
      toast.success(response.data.message || 'User deleted successfully');
      fetchUsers();
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Failed to delete user';
      toast.error(errorMessage);
      
      // Show specific message for teachers with courses
      if (error.response?.data?.coursesCount !== undefined) {
        toast.error(`This teacher owns ${error.response.data.coursesCount} course(s). Please reassign or delete courses first.`);
      }
    }
  };

  const handleToggleBlock = async (userId, userName, currentStatus) => {
    const action = currentStatus ? 'block' : 'unblock';
    if (!window.confirm(`Are you sure you want to ${action} user "${userName}"?`)) {
      return;
    }

    try {
      await axiosInstance.put(`/users/${userId}`, {
        isActive: !currentStatus,
      });
      toast.success(`User ${currentStatus ? 'blocked' : 'unblocked'} successfully`);
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.error || `Failed to ${action} user`);
    }
  };

  const handleCancel = () => {
    setEditingUser(null);
    setEditForm({ name: '', email: '', role: '', isActive: true });
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch = searchTerm === '' || 
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const getRoleIcon = (role) => {
    switch (role) {
      case 'admin':
        return <FiShield className="text-red-600" />;
      case 'teacher':
        return <FiUser className="text-blue-600" />;
      case 'student':
        return <FiUsers className="text-green-600" />;
      default:
        return <FiUser />;
    }
  };

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'teacher':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'student':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
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
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Manage Users</h1>
        <Link to="/admin/dashboard" className="btn-outline">
          Back to Dashboard
        </Link>
      </div>

      {/* Filters */}
      <div className="card mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Search Users
            </label>
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name or email..."
                className="input-field pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Filter by Role
            </label>
            <select
              className="input-field"
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
            >
              <option value="">All Roles</option>
              <option value="admin">Admin</option>
              <option value="teacher">Teacher</option>
              <option value="student">Student</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Table */}
      {filteredUsers.length === 0 ? (
        <div className="card text-center py-12">
          <FiUsers className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">No users found.</p>
        </div>
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">Name</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">Email</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">Role</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">Status</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">Created</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-900 dark:text-white">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user._id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800">
                  <td className="py-4 px-4">
                    {editingUser === user._id ? (
                      <input
                        type="text"
                        className="input-field w-full"
                        value={editForm.name}
                        onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                      />
                    ) : (
                      <div className="flex items-center space-x-2">
                        {getRoleIcon(user.role)}
                        <span className="text-gray-900 dark:text-white">{user.name}</span>
                      </div>
                    )}
                  </td>
                  <td className="py-4 px-4">
                    {editingUser === user._id ? (
                      <input
                        type="email"
                        className="input-field w-full"
                        value={editForm.email}
                        onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                      />
                    ) : (
                      <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
                        <FiMail className="w-4 h-4" />
                        <span>{user.email}</span>
                      </div>
                    )}
                  </td>
                  <td className="py-4 px-4">
                    {editingUser === user._id ? (
                      <select
                        className="input-field w-full"
                        value={editForm.role}
                        onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                      >
                        <option value="student">Student</option>
                        <option value="teacher">Teacher</option>
                        <option value="admin">Admin</option>
                      </select>
                    ) : (
                      <span className={`px-2 py-1 text-xs rounded font-medium ${getRoleBadgeColor(user.role)}`}>
                        {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                      </span>
                    )}
                  </td>
                  <td className="py-4 px-4">
                    {editingUser === user._id ? (
                      <select
                        className="input-field w-full"
                        value={editForm.isActive ? 'true' : 'false'}
                        onChange={(e) => setEditForm({ ...editForm, isActive: e.target.value === 'true' })}
                      >
                        <option value="true">Active</option>
                        <option value="false">Inactive</option>
                      </select>
                    ) : (
                      <span className={`flex items-center space-x-1 ${user.isActive ? 'text-green-600' : 'text-red-600'}`}>
                        {user.isActive ? <FiCheck /> : <FiX />}
                        <span>{user.isActive ? 'Active' : 'Inactive'}</span>
                      </span>
                    )}
                  </td>
                  <td className="py-4 px-4 text-gray-600 dark:text-gray-400 text-sm">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex justify-end space-x-2">
                      {editingUser === user._id ? (
                        <>
                          <button
                            onClick={() => handleSave(user._id)}
                            className="p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-900 rounded"
                            title="Save"
                          >
                            <FiCheck className="w-5 h-5" />
                          </button>
                          <button
                            onClick={handleCancel}
                            className="p-2 text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 rounded"
                            title="Cancel"
                          >
                            <FiX className="w-5 h-5" />
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => handleEdit(user)}
                            className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900 rounded"
                            title="Edit"
                          >
                            <FiEdit className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleToggleBlock(user._id, user.name, user.isActive)}
                            className={`p-2 rounded ${
                              user.isActive
                                ? 'text-yellow-600 hover:bg-yellow-50 dark:hover:bg-yellow-900'
                                : 'text-green-600 hover:bg-green-50 dark:hover:bg-green-900'
                            }`}
                            title={user.isActive ? 'Block User' : 'Unblock User'}
                          >
                            {user.isActive ? <FiLock className="w-5 h-5" /> : <FiUnlock className="w-5 h-5" />}
                          </button>
                          <button
                            onClick={() => handleDelete(user._id, user.name, user.role)}
                            className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900 rounded"
                            title="Delete"
                            disabled={user.role === 'admin'}
                          >
                            <FiTrash2 className="w-5 h-5" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
        Total: {filteredUsers.length} user(s)
      </div>
    </div>
  );
};

export default ManageUsers;

