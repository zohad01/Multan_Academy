import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axiosInstance from '../utils/axios';
import { FiArrowLeft, FiInstagram, FiFacebook } from 'react-icons/fi';
import toast from 'react-hot-toast';

const ManageSocialMedia = () => {
  const [socialMedia, setSocialMedia] = useState({
    instagram: '',
    facebook: '',
    tiktok: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSocialMedia();
  }, []);

  const fetchSocialMedia = async () => {
    try {
      const response = await axiosInstance.get('/social-media');
      if (response.data.data) {
        setSocialMedia(response.data.data);
      }
    } catch (error) {
      toast.error('Failed to load social media links');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setSocialMedia({
      ...socialMedia,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      await axiosInstance.put('/social-media', socialMedia);
      toast.success('Social media links updated successfully!');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to update social media links');
    } finally {
      setSaving(false);
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
      <Link
        to="/admin/dashboard"
        className="text-primary-600 hover:text-primary-700 mb-4 inline-block flex items-center"
      >
        <FiArrowLeft className="mr-2" />
        Back to Dashboard
      </Link>

      <div className="max-w-2xl mx-auto">
        <div className="card">
          <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
            Manage Social Media Links
          </h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <FiInstagram className="inline mr-2" />
                Instagram URL
              </label>
              <input
                type="url"
                name="instagram"
                value={socialMedia.instagram}
                onChange={handleChange}
                className="input-field w-full"
                placeholder="https://instagram.com/yourpage"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <FiFacebook className="inline mr-2" />
                Facebook URL
              </label>
              <input
                type="url"
                name="facebook"
                value={socialMedia.facebook}
                onChange={handleChange}
                className="input-field w-full"
                placeholder="https://facebook.com/yourpage"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <svg className="inline mr-2 w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                </svg>
                TikTok URL
              </label>
              <input
                type="url"
                name="tiktok"
                value={socialMedia.tiktok}
                onChange={handleChange}
                className="input-field w-full"
                placeholder="https://tiktok.com/@yourpage"
              />
            </div>

            <div className="flex space-x-4">
              <button
                type="submit"
                disabled={saving}
                className="btn-primary flex-1"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
              <button
                type="button"
                onClick={fetchSocialMedia}
                className="btn-outline"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ManageSocialMedia;

