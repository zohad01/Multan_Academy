import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../store/slices/authSlice';
import { useTheme } from '../context/ThemeContext';
import { FiSun, FiMoon, FiUser, FiLogOut, FiMenu, FiX, FiInstagram, FiFacebook } from 'react-icons/fi';
import { useState, useEffect } from 'react';
import axiosInstance from '../utils/axios';

const Layout = () => {
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { darkMode, toggleDarkMode } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [socialMedia, setSocialMedia] = useState({
    instagram: '',
    facebook: '',
    tiktok: '',
  });

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
      // Silently fail - social media is optional
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  const getDashboardLink = () => {
    if (!user) return null;
    switch (user.role) {
      case 'student':
        return '/student/dashboard';
      case 'teacher':
        return '/teacher/dashboard';
      case 'admin':
        return '/admin/dashboard';
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-md sticky top-0 z-50">
        <nav className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-3">
              <img 
                src="/assets/brand/logo-primary.jpeg" 
                alt="Multan Academy Logo" 
                className="h-12 w-auto"
              />
              <span className="text-xl font-bold text-gray-900 dark:text-white hidden sm:block">
                Multan Academy
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-6">
              <Link
                to="/courses"
                className="text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
              >
                Courses
              </Link>

              {isAuthenticated ? (
                <>
                  <Link
                    to={getDashboardLink()}
                    className="text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                  >
                    Dashboard
                  </Link>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <FiUser className="text-gray-700 dark:text-gray-300" />
                      <span className="text-gray-700 dark:text-gray-300">
                        {user?.name}
                      </span>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="flex items-center space-x-2 text-gray-700 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                    >
                      <FiLogOut />
                      <span>Logout</span>
                    </button>
                  </div>
                </>
              ) : (
                <div className="flex items-center space-x-4">
                  <Link
                    to="/login"
                    className="text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                  >
                    Login
                  </Link>
                  <Link
                    to="/signup"
                    className="btn-primary"
                  >
                    Sign Up
                  </Link>
                </div>
              )}

              <button
                onClick={toggleDarkMode}
                className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                aria-label="Toggle dark mode"
              >
                {darkMode ? (
                  <FiSun className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                ) : (
                  <FiMoon className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                )}
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700"
            >
              {mobileMenuOpen ? (
                <FiX className="w-6 h-6" />
              ) : (
                <FiMenu className="w-6 h-6" />
              )}
            </button>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <div className="md:hidden mt-4 space-y-4 pb-4">
              <Link
                to="/courses"
                className="block text-gray-700 dark:text-gray-300 hover:text-primary-600"
                onClick={() => setMobileMenuOpen(false)}
              >
                Courses
              </Link>
              {isAuthenticated ? (
                <>
                  <Link
                    to={getDashboardLink()}
                    className="block text-gray-700 dark:text-gray-300 hover:text-primary-600"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <div className="flex items-center space-x-2 text-gray-700 dark:text-gray-300">
                    <FiUser />
                    <span>{user?.name}</span>
                  </div>
                  <button
                    onClick={() => {
                      handleLogout();
                      setMobileMenuOpen(false);
                    }}
                    className="flex items-center space-x-2 text-gray-700 dark:text-gray-300 hover:text-red-600"
                  >
                    <FiLogOut />
                    <span>Logout</span>
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="block text-gray-700 dark:text-gray-300 hover:text-primary-600"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Login
                  </Link>
                  <Link
                    to="/signup"
                    className="block btn-primary text-center"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Sign Up
                  </Link>
                </>
              )}
              <button
                onClick={toggleDarkMode}
                className="flex items-center space-x-2 text-gray-700 dark:text-gray-300"
              >
                {darkMode ? <FiSun /> : <FiMoon />}
                <span>Toggle Theme</span>
              </button>
            </div>
          )}
        </nav>
      </header>

      {/* Main Content */}
      <main className="flex-grow">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 dark:bg-gray-900 text-white py-8 mt-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-lg font-bold mb-4">Multan Academy</h3>
              <p className="text-gray-400">
                Empowering students and teachers with the best online learning experience.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-bold mb-4">Quick Links</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link to="/courses" className="hover:text-white transition-colors">
                    Courses
                  </Link>
                </li>
                <li>
                  <Link to="/" className="hover:text-white transition-colors">
                    About Us
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-bold mb-4">Contact</h3>
              <p className="text-gray-400 mb-4">
                Email: support@multanacademy.com
              </p>
              {(socialMedia.instagram || socialMedia.facebook || socialMedia.tiktok) && (
                <div>
                  <h4 className="text-sm font-semibold mb-2 text-gray-300">Follow Us</h4>
                  <div className="flex space-x-4">
                    {socialMedia.instagram && (
                      <a
                        href={socialMedia.instagram}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-400 hover:text-pink-500 transition-colors"
                        aria-label="Instagram"
                      >
                        <FiInstagram className="w-5 h-5" />
                      </a>
                    )}
                    {socialMedia.facebook && (
                      <a
                        href={socialMedia.facebook}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-400 hover:text-blue-500 transition-colors"
                        aria-label="Facebook"
                      >
                        <FiFacebook className="w-5 h-5" />
                      </a>
                    )}
                    {socialMedia.tiktok && (
                      <a
                        href={socialMedia.tiktok}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-400 hover:text-black dark:hover:text-white transition-colors"
                        aria-label="TikTok"
                      >
                        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                        </svg>
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Multan Academy. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;

