import { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import ReactPlayer from 'react-player';
import axiosInstance from '../utils/axios';
import { FiPlay, FiChevronLeft, FiChevronRight, FiAlertCircle } from 'react-icons/fi';
import toast from 'react-hot-toast';
import VideoWatermark from '../components/VideoWatermark';
import {
  enableVideoProtection,
  disableVideoProtection,
  requestVideoStreamToken,
} from '../utils/videoProtection';

const VideoPlayer = () => {
  const { id, videoId } = useParams();
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const [video, setVideo] = useState(null);
  const [videos, setVideos] = useState([]);
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [played, setPlayed] = useState(0);
  const playerContainerRef = useRef(null);

  useEffect(() => {
    fetchVideo();
    fetchCourseVideos();
    
    // Enable video protection when component mounts
    enableVideoProtection();
    
    // Cleanup: disable protection when component unmounts
    return () => {
      disableVideoProtection();
    };
  }, [videoId, id]);

  const fetchVideo = async () => {
    try {
      const response = await axiosInstance.get(`/videos/${videoId}`);
      const videoData = response.data.data;
      
      // Request stream token if not a preview video
      if (videoData && !videoData.isPreview && isAuthenticated) {
        const token = await requestVideoStreamToken(videoId);
        if (token) {
          videoData.streamToken = token;
        }
      }
      
      setVideo(videoData);
    } catch (error) {
      toast.error('Failed to load video');
    } finally {
      setLoading(false);
    }
  };

  const fetchCourseVideos = async () => {
    try {
      const response = await axiosInstance.get(`/videos/course/${id}`);
      setVideos(response.data.data || []);
      
      const courseResponse = await axiosInstance.get(`/courses/${id}`);
      setCourse(courseResponse.data.data);
    } catch (error) {
      // Silently fail
    }
  };

  const handleProgress = async (state) => {
    setPlayed(state.played);
    setProgress(state.played * 100);

    // Update progress every 10 seconds
    if (Math.floor(state.played * 100) % 10 === 0) {
      await updateVideoProgress(state.played * 100, state.played >= 0.9);
    }
  };

  const handleEnded = async () => {
    await updateVideoProgress(100, true);
    toast.success('Video completed!');
  };

  const updateVideoProgress = async (progressPercent, completed) => {
    try {
      await axiosInstance.put(`/videos/${videoId}/progress`, {
        progress: progressPercent,
        completed,
      });
    } catch (error) {
      // Silently fail
    }
  };

  /**
   * Handle fullscreen mode to ensure watermark visibility
   * ReactPlayer uses native fullscreen, so we need to inject watermark into fullscreen container
   */
  useEffect(() => {
    // Only add watermark for authenticated users (primarily students)
    if (!isAuthenticated || !user) return;
    if (!playerContainerRef.current) return;

    let fullscreenInterval = null;
    let watermarkClone = null;

    const handleFullscreenChange = () => {
      // When entering fullscreen, ReactPlayer creates its own fullscreen container
      // We need to inject the watermark into that container
      const fullscreenElement = document.fullscreenElement || 
                                document.webkitFullscreenElement || 
                                document.mozFullScreenElement || 
                                document.msFullscreenElement;

      if (fullscreenElement) {
        // Small delay to ensure ReactPlayer has finished rendering fullscreen
        setTimeout(() => {
          // Find the video element in fullscreen
          const videoElement = fullscreenElement.querySelector('video');
          if (videoElement && videoElement.parentElement) {
            const container = videoElement.parentElement;
            
            // Check if watermark already exists in fullscreen container
            if (!container.querySelector('.video-watermark')) {
              // Prepare watermark text
              const userIdentifier = user?.email || user?._id || 'Unknown User';
              const watermarkText = course?.title 
                ? `${userIdentifier} | ${course.title}`
                : userIdentifier;

              // Create watermark clone for fullscreen
              watermarkClone = document.createElement('div');
              watermarkClone.className = 'video-watermark';
              watermarkClone.style.cssText = `
                position: absolute;
                top: 20px;
                left: 20px;
                color: rgba(255, 255, 255, 0.7);
                font-size: 14px;
                font-weight: 500;
                font-family: Arial, sans-serif;
                text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.8);
                pointer-events: none;
                user-select: none;
                -webkit-user-select: none;
                -moz-user-select: none;
                -ms-user-select: none;
                z-index: 9999;
                opacity: 0.5;
                white-space: nowrap;
                padding: 4px 8px;
                background-color: rgba(0, 0, 0, 0.3);
                border-radius: 4px;
                transition: top 0.5s ease, left 0.5s ease;
              `;
              watermarkClone.textContent = watermarkText;
              watermarkClone.setAttribute('data-watermark', 'true');
              watermarkClone.setAttribute('data-user-id', user?._id || '');
              
              // Position container as relative if not already
              if (window.getComputedStyle(container).position === 'static') {
                container.style.position = 'relative';
              }
              
              try {
                container.appendChild(watermarkClone);

                // Animate watermark position in fullscreen
                const updateFullscreenPosition = () => {
                  if (!fullscreenElement || !watermarkClone || !watermarkClone.parentElement) {
                    if (fullscreenInterval) {
                      clearInterval(fullscreenInterval);
                      fullscreenInterval = null;
                    }
                    return;
                  }

                  const containerRect = container.getBoundingClientRect();
                  const watermarkRect = watermarkClone.getBoundingClientRect();

                  // Validate dimensions
                  if (containerRect.width <= 0 || containerRect.height <= 0) {
                    return;
                  }

                  const maxTop = Math.max(0, containerRect.height - watermarkRect.height - 10);
                  const maxLeft = Math.max(0, containerRect.width - watermarkRect.width - 10);

                  if (maxTop >= 10 && maxLeft >= 10) {
                    const newTop = Math.max(10, Math.floor(Math.random() * maxTop));
                    const newLeft = Math.max(10, Math.floor(Math.random() * maxLeft));
                    watermarkClone.style.top = `${newTop}px`;
                    watermarkClone.style.left = `${newLeft}px`;
                  }
                };

                // Initial position update
                updateFullscreenPosition();

                // Schedule position updates every 5-10 seconds
                const scheduleNextMove = () => {
                  const delay = 5000 + Math.random() * 5000;
                  fullscreenInterval = setTimeout(() => {
                    updateFullscreenPosition();
                    scheduleNextMove();
                  }, delay);
                };
                scheduleNextMove();
              } catch (e) {
                console.debug('Failed to inject watermark in fullscreen:', e);
              }
            }
          }
        }, 100);
      } else {
        // Exit fullscreen - cleanup
        if (fullscreenInterval) {
          clearInterval(fullscreenInterval);
          fullscreenInterval = null;
        }
        if (watermarkClone && watermarkClone.parentElement) {
          watermarkClone.remove();
          watermarkClone = null;
        }
      }
    };

    // Listen for fullscreen changes
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);

    return () => {
      // Cleanup intervals and watermark on unmount
      if (fullscreenInterval) {
        clearInterval(fullscreenInterval);
      }
      if (watermarkClone && watermarkClone.parentElement) {
        watermarkClone.remove();
      }
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
    };
  }, [user, course, isAuthenticated]);

  const currentIndex = videos.findIndex((v) => v._id === videoId);
  const nextVideo = currentIndex < videos.length - 1 ? videos[currentIndex + 1] : null;
  const prevVideo = currentIndex > 0 ? videos[currentIndex - 1] : null;

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  if (!video) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Video not found</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Video Player */}
        <div className="lg:col-span-3">
          <div className="card mb-6">
            <Link
              to={`/courses/${id}`}
              className="text-primary-600 hover:text-primary-700 mb-4 inline-block"
            >
              ← Back to Course
            </Link>
            <h1 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
              {video.title}
            </h1>
            <div 
              ref={playerContainerRef}
              className="bg-black rounded-lg overflow-hidden aspect-video relative"
              style={{ position: 'relative' }}
              onContextMenu={(e) => e.preventDefault()}
            >
              {/* Protection Warning */}
              {!video.isPreview && (
                <div className="absolute top-2 left-2 z-50 bg-yellow-500 bg-opacity-90 text-yellow-900 px-3 py-1 rounded text-xs flex items-center space-x-1">
                  <FiAlertCircle />
                  <span>Screen recording is restricted</span>
                </div>
              )}
              
              <ReactPlayer
                url={video.videoUrl}
                width="100%"
                height="100%"
                controls
                onProgress={handleProgress}
                onEnded={handleEnded}
                progressInterval={10000}
                config={{
                  // Ensure ReactPlayer doesn't interfere with watermark
                  file: {
                    attributes: {
                      style: {
                        position: 'relative',
                        zIndex: 1,
                      },
                    },
                  },
                }}
              />
              {/* Video Watermark Overlay - Only show for authenticated users */}
              {isAuthenticated && user && (
                <VideoWatermark
                  userEmail={user?.email}
                  userId={user?._id}
                  courseName={course?.title}
                  isAuthenticated={isAuthenticated}
                />
              )}
            </div>
            {video.description && (
              <div className="mt-4">
                <h2 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">Description</h2>
                <p className="text-gray-600 dark:text-gray-400">{video.description}</p>
              </div>
            )}
          </div>

          {/* Navigation */}
          <div className="flex justify-between">
            {prevVideo ? (
              <Link
                to={`/courses/${id}/video/${prevVideo._id}`}
                className="btn-outline flex items-center space-x-2"
              >
                <FiChevronLeft />
                <span>Previous</span>
              </Link>
            ) : (
              <div></div>
            )}
            {nextVideo ? (
              <Link
                to={`/courses/${id}/video/${nextVideo._id}`}
                className="btn-primary flex items-center space-x-2"
              >
                <span>Next</span>
                <FiChevronRight />
              </Link>
            ) : (
              <div></div>
            )}
          </div>
        </div>

        {/* Sidebar - Video List */}
        <div className="lg:col-span-1">
          <div className="card sticky top-24">
            <h2 className="text-lg font-bold mb-4 text-gray-900 dark:text-white">
              Course Videos
            </h2>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {videos.map((v, index) => (
                <Link
                  key={v._id}
                  to={`/courses/${id}/video/${v._id}`}
                  className={`flex items-center space-x-3 p-3 rounded-lg transition-colors ${
                    v._id === videoId
                      ? 'bg-primary-100 dark:bg-primary-900 text-primary-900 dark:text-primary-100'
                      : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                >
                  <div className="w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {v.title}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {Math.floor(v.duration / 60)} min
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;

