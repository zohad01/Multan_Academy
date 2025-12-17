import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axiosInstance from '../utils/axios';
import ReactPlayer from 'react-player';
import { FiArrowLeft, FiPlay } from 'react-icons/fi';
import toast from 'react-hot-toast';

const IntroVideo = () => {
  const { type, id } = useParams();
  const [introVideo, setIntroVideo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchIntroVideo();
  }, [type, id]);

  const fetchIntroVideo = async () => {
    try {
      let response;
      if (type === 'global') {
        response = await axiosInstance.get('/intro-videos/global');
      } else if (type === 'preview' && id) {
        response = await axiosInstance.get(`/intro-videos/preview/${id}`);
      } else {
        toast.error('Invalid video type');
        setLoading(false);
        return;
      }

      if (response.data.data) {
        setIntroVideo(response.data.data);
      } else {
        toast.error('Intro video not found');
      }
    } catch (error) {
      toast.error('Failed to load intro video');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  if (!introVideo) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400 mb-4">Intro video not available</p>
          <Link to="/" className="btn-primary">
            <FiArrowLeft className="inline mr-2" />
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Link
        to={type === 'preview' && id ? `/courses/${id}` : '/'}
        className="text-primary-600 hover:text-primary-700 mb-4 inline-block flex items-center"
      >
        <FiArrowLeft className="mr-2" />
        {type === 'preview' ? 'Back to Course' : 'Back to Home'}
      </Link>

      <div className="max-w-4xl mx-auto">
        <div className="card">
          <h1 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">
            {introVideo.title}
          </h1>
          {introVideo.description && (
            <p className="text-gray-600 dark:text-gray-400 mb-6">
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
        </div>
      </div>
    </div>
  );
};

export default IntroVideo;

