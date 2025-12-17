import { useEffect, useState, useRef } from 'react';

/**
 * VideoWatermark Component
 * 
 * Displays a dynamic, user-specific watermark overlay on video players.
 * Features:
 * - User email/user ID display
 * - Optional course name
 * - Random position changes every 5-10 seconds
 * - Semi-transparent design
 * - Prevents pointer events and text selection
 * - Works in fullscreen mode
 * 
 * @param {Object} props
 * @param {string} props.userEmail - User's email address
 * @param {string} props.userId - User's ID
 * @param {string} props.courseName - Optional course name
 * @param {boolean} props.isAuthenticated - Whether user is authenticated
 */
const VideoWatermark = ({ userEmail, userId, courseName, isAuthenticated }) => {
  const [position, setPosition] = useState({ top: 20, left: 20 });
  const [opacity, setOpacity] = useState(0.5);
  const watermarkRef = useRef(null);
  const intervalRef = useRef(null);

  /**
   * Calculate random position within video boundaries
   * Ensures watermark stays within visible area
   */
  const updatePosition = () => {
    if (!watermarkRef.current) return;

    const container = watermarkRef.current.parentElement;
    if (!container) return;

    const containerRect = container.getBoundingClientRect();
    const watermarkRect = watermarkRef.current.getBoundingClientRect();

    // Ensure container has valid dimensions
    if (containerRect.width <= 0 || containerRect.height <= 0) {
      return;
    }

    // Calculate maximum positions (accounting for watermark size)
    const maxTop = Math.max(0, containerRect.height - watermarkRect.height - 10);
    const maxLeft = Math.max(0, containerRect.width - watermarkRect.width - 10);

    // Ensure we have valid range for positioning
    if (maxTop < 10 || maxLeft < 10) {
      // If container is too small, use default position
      setPosition({ top: 10, left: 10 });
      return;
    }

    // Generate random position within boundaries
    const newTop = Math.max(10, Math.floor(Math.random() * maxTop));
    const newLeft = Math.max(10, Math.floor(Math.random() * maxLeft));

    setPosition({ top: newTop, left: newLeft });
  };

  /**
   * Initialize watermark positioning
   * Position changes every 5-10 seconds randomly
   */
  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }

    // Initial position (with small delay to ensure container is rendered)
    const initTimer = setTimeout(() => {
      updatePosition();
    }, 100);

    // Set up interval for random position changes
    const scheduleNextMove = () => {
      // Random interval between 5000ms (5s) and 10000ms (10s)
      const delay = 5000 + Math.random() * 5000;
      
      intervalRef.current = setTimeout(() => {
        updatePosition();
        scheduleNextMove();
      }, delay);
    };

    // Start scheduling moves after initial position
    const scheduleTimer = setTimeout(() => {
      scheduleNextMove();
    }, 1000);

    // Update position on window resize
    const handleResize = () => {
      updatePosition();
    };
    window.addEventListener('resize', handleResize);

    // Prevent watermark removal via DOM manipulation
    const preventRemoval = () => {
      if (!watermarkRef.current) return;
      
      // Check if watermark is still in DOM
      if (!watermarkRef.current.isConnected) {
        // Watermark was removed, try to find container and re-attach
        const container = watermarkRef.current.parentElement || 
                         document.querySelector('[class*="aspect-video"]') ||
                         document.querySelector('.react-player__preview');
        
        if (container && !container.querySelector('.video-watermark')) {
          try {
            container.appendChild(watermarkRef.current);
          } catch (e) {
            // Container might not accept children, ignore
            console.debug('Watermark re-attachment failed:', e);
          }
        }
      }
    };

    const removalCheckInterval = setInterval(preventRemoval, 2000);

    // Cleanup
    return () => {
      clearTimeout(initTimer);
      clearTimeout(scheduleTimer);
      if (intervalRef.current) {
        clearTimeout(intervalRef.current);
      }
      clearInterval(removalCheckInterval);
      window.removeEventListener('resize', handleResize);
    };
  }, [isAuthenticated, userEmail, userId, courseName]);

  // Hide watermark if user is not authenticated or no user data
  if (!isAuthenticated || (!userEmail && !userId)) {
    return null;
  }

  // Prepare watermark text - use email if available, otherwise user ID
  const userIdentifier = userEmail || userId || 'Unknown User';
  const watermarkText = courseName 
    ? `${userIdentifier} | ${courseName}`
    : userIdentifier;

  return (
    <div
      ref={watermarkRef}
      className="video-watermark"
      style={{
        position: 'absolute',
        top: `${position.top}px`,
        left: `${position.left}px`,
        color: 'rgba(255, 255, 255, 0.7)',
        fontSize: '14px',
        fontWeight: '500',
        fontFamily: 'Arial, sans-serif',
        textShadow: '2px 2px 4px rgba(0, 0, 0, 0.8)',
        pointerEvents: 'none', // Prevent interaction with watermark
        userSelect: 'none', // Prevent text selection
        WebkitUserSelect: 'none',
        MozUserSelect: 'none',
        msUserSelect: 'none',
        zIndex: 9999, // Ensure it's on top
        opacity: opacity,
        whiteSpace: 'nowrap',
        padding: '4px 8px',
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
        borderRadius: '4px',
        transition: 'opacity 0.3s ease, top 0.5s ease, left 0.5s ease',
      }}
      // Additional security: prevent context menu and text selection
      onContextMenu={(e) => e.preventDefault()}
      onDragStart={(e) => e.preventDefault()}
      onSelectStart={(e) => e.preventDefault()}
      // Make watermark harder to remove via DOM manipulation
      data-watermark="true"
      data-user-id={userId}
      // Additional CSS to prevent removal
      contentEditable={false}
      draggable={false}
    >
      {watermarkText}
      {/* Add invisible overlay to prevent clicking through */}
      <span
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          pointerEvents: 'none',
          userSelect: 'none',
        }}
        aria-hidden="true"
      />
    </div>
  );
};

export default VideoWatermark;

