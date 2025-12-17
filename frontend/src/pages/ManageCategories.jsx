import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axiosInstance from '../utils/axios';
import { FiTag, FiSearch, FiEdit, FiTrash2, FiPlus, FiX, FiCheck } from 'react-icons/fi';
import toast from 'react-hot-toast';

const ManageCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    isActive: true,
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await axiosInstance.get('/admin/categories');
      setCategories(response.data.data || []);
    } catch (error) {
      toast.error('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await axiosInstance.post('/admin/categories', formData);
      toast.success('Category created successfully');
      setShowCreateForm(false);
      setFormData({ name: '', description: '', isActive: true });
      fetchCategories();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to create category');
    }
  };

  const handleEdit = (category) => {
    setEditingCategory(category._id);
    setFormData({
      name: category.name,
      description: category.description || '',
      isActive: category.isActive !== undefined ? category.isActive : true,
    });
    setShowCreateForm(false);
  };

  const handleUpdate = async (categoryId) => {
    try {
      await axiosInstance.put(`/admin/categories/${categoryId}`, formData);
      toast.success('Category updated successfully');
      setEditingCategory(null);
      setFormData({ name: '', description: '', isActive: true });
      fetchCategories();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to update category');
    }
  };

  const handleDelete = async (categoryId, categoryName) => {
    if (!window.confirm(`Are you sure you want to delete category "${categoryName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      await axiosInstance.delete(`/admin/categories/${categoryId}`);
      toast.success('Category deleted successfully');
      fetchCategories();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to delete category');
    }
  };

  const handleCancel = () => {
    setShowCreateForm(false);
    setEditingCategory(null);
    setFormData({ name: '', description: '', isActive: true });
  };

  const filteredCategories = categories.filter((category) => {
    const matchesSearch = searchTerm === '' || 
      category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      category.description?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

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
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Manage Categories</h1>
        <div className="flex space-x-2">
          {!showCreateForm && !editingCategory && (
            <button
              onClick={() => {
                setShowCreateForm(true);
                setFormData({ name: '', description: '', isActive: true });
              }}
              className="btn-primary flex items-center space-x-2"
            >
              <FiPlus />
              <span>Add Category</span>
            </button>
          )}
          <Link to="/admin/dashboard" className="btn-outline">
            Back to Dashboard
          </Link>
        </div>
      </div>

      {/* Create/Edit Form */}
      {(showCreateForm || editingCategory) && (
        <div className="card mb-6">
          <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
            {editingCategory ? 'Edit Category' : 'Create New Category'}
          </h2>
          <form onSubmit={editingCategory ? (e) => { e.preventDefault(); handleUpdate(editingCategory); } : handleCreate}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Category Name *
                </label>
                <input
                  type="text"
                  required
                  className="input-field w-full"
                  placeholder="Enter category name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  className="input-field w-full"
                  rows="4"
                  placeholder="Enter category description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
              <div>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Active</span>
                </label>
              </div>
              <div className="flex space-x-2">
                <button type="submit" className="btn-primary flex items-center space-x-2">
                  <FiCheck />
                  <span>{editingCategory ? 'Update' : 'Create'} Category</span>
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="btn-outline flex items-center space-x-2"
                >
                  <FiX />
                  <span>Cancel</span>
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* Search */}
      <div className="card mb-6">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Search Categories
        </label>
        <div className="relative">
          <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name or description..."
            className="input-field pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Categories List */}
      {filteredCategories.length === 0 ? (
        <div className="card text-center py-12">
          <FiTag className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">No categories found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCategories.map((category) => (
            <div key={category._id} className="card">
              <div className="flex items-start justify-between mb-4">
                <FiTag className="w-8 h-8 text-primary-600 flex-shrink-0" />
                {editingCategory === category._id ? (
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleUpdate(category._id)}
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
                  </div>
                ) : (
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEdit(category)}
                      className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900 rounded"
                      title="Edit"
                    >
                      <FiEdit className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(category._id, category.name)}
                      className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900 rounded"
                      title="Delete"
                    >
                      <FiTrash2 className="w-5 h-5" />
                    </button>
                  </div>
                )}
              </div>

              {editingCategory === category._id ? (
                <div className="space-y-4">
                  <div>
                    <input
                      type="text"
                      className="input-field w-full"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>
                  <div>
                    <textarea
                      className="input-field w-full"
                      rows="3"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={formData.isActive}
                        onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                        className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">Active</span>
                    </label>
                  </div>
                </div>
              ) : (
                <>
                  <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
                    {category.name}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                    {category.description || 'No description available'}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className={`px-2 py-1 text-xs rounded font-medium ${
                      category.isActive 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                    }`}>
                      {category.isActive ? 'Active' : 'Inactive'}
                    </span>
                    <div className="text-xs text-gray-500 dark:text-gray-500">
                      {new Date(category.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
        Total: {filteredCategories.length} category/categories
      </div>
    </div>
  );
};

export default ManageCategories;

