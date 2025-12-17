import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiBook, FiUsers, FiAward, FiVideo, FiCheckCircle, FiPlay } from 'react-icons/fi';
import axiosInstance from '../utils/axios';
import ReactPlayer from 'react-player';

const LandingPage = () => {
  const [introVideo, setIntroVideo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchIntroVideo();
  }, []);

  const fetchIntroVideo = async () => {
    try {
      const response = await axiosInstance.get('/intro-videos/global');
      if (response.data.data) {
        setIntroVideo(response.data.data);
      }
    } catch (error) {
      // Silently fail - intro video is optional
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary-600 to-secondary-600 text-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-5xl font-bold mb-6">
              Learn Anything, Anytime, Anywhere
            </h1>
            <p className="text-xl mb-8 text-primary-100">
              Join thousands of students learning from expert teachers at Multan Academy
            </p>
            <div className="flex justify-center space-x-4">
              <Link to="/signup" className="btn-primary bg-white text-primary-600 hover:bg-gray-100">
                Get Started
              </Link>
              <Link to="/courses" className="btn-outline border-white text-white hover:bg-white hover:text-primary-600">
                Browse Courses
              </Link>
            </div>
            <div className="flex justify-center space-x-4 mt-4">
              <Link to="/login/student" className="text-primary-100 hover:text-white text-sm">
                Student Login
              </Link>
              <span className="text-primary-100">|</span>
              <Link to="/login/teacher" className="text-primary-100 hover:text-white text-sm">
                Teacher Login
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Intro Video Section */}
      {!loading && introVideo && (
        <section className="py-16 bg-white dark:bg-gray-800">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-center mb-8 text-gray-900 dark:text-white">
                {introVideo.title}
              </h2>
              {introVideo.description && (
                <p className="text-center text-gray-600 dark:text-gray-400 mb-6">
                  {introVideo.description}
                </p>
              )}
              <div className="bg-black rounded-lg overflow-hidden aspect-video">
                <ReactPlayer
                  url={introVideo.videoUrl}
                  width="100%"
                  height="100%"
                  controls
                  playing={false}
                />
              </div>
              <div className="text-center mt-4">
                <Link
                  to={`/intro-video/global`}
                  className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
                >
                  Watch Full Video →
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Features Section */}
      <section className="py-16 bg-white dark:bg-gray-800">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-900 dark:text-white">
            Why Choose Our Platform?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="card text-center">
              <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiVideo className="w-8 h-8 text-primary-600 dark:text-primary-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
                Video Lectures
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Access high-quality video lectures from expert teachers
              </p>
            </div>
            <div className="card text-center">
              <div className="w-16 h-16 bg-secondary-100 dark:bg-secondary-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiBook className="w-8 h-8 text-secondary-600 dark:text-secondary-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
                Interactive Learning
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Engage with quizzes, assignments, and track your progress
              </p>
            </div>
            <div className="card text-center">
              <div className="w-16 h-16 bg-accent-100 dark:bg-accent-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiAward className="w-8 h-8 text-accent-600 dark:text-accent-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
                Certificates
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Earn certificates upon course completion
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-900 dark:text-white">
            How It Works
          </h2>
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="w-12 h-12 bg-primary-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                  1
                </div>
                <h3 className="font-semibold mb-2 text-gray-900 dark:text-white">Sign Up</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Create your free account
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-primary-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                  2
                </div>
                <h3 className="font-semibold mb-2 text-gray-900 dark:text-white">Browse Courses</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Explore our course catalog
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-primary-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                  3
                </div>
                <h3 className="font-semibold mb-2 text-gray-900 dark:text-white">Enroll & Learn</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Purchase and start learning
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-primary-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                  4
                </div>
                <h3 className="font-semibold mb-2 text-gray-900 dark:text-white">Get Certified</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Complete and earn certificates
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Start Learning?
          </h2>
          <p className="text-xl mb-8 text-primary-100">
            Join thousands of students already learning on our platform
          </p>
          <Link to="/signup" className="btn-primary bg-white text-primary-600 hover:bg-gray-100">
            Get Started Today
          </Link>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;

