/**
 * Video Protection Utilities
 * 
 * Functions to disable dev tools, right-click, keyboard shortcuts
 * and manage video tokens for enhanced content protection
 */

let protectionEnabled = false;
let videoToken = null;

/**
 * Disable right-click context menu
 */
export const disableRightClick = () => {
  document.addEventListener('contextmenu', (e) => {
    e.preventDefault();
    return false;
  }, false);
};

/**
 * Disable common keyboard shortcuts
 */
export const disableKeyboardShortcuts = () => {
  document.addEventListener('keydown', (e) => {
    // Disable F12 (DevTools)
    if (e.key === 'F12') {
      e.preventDefault();
      return false;
    }

    // Disable Ctrl+Shift+I (DevTools)
    if (e.ctrlKey && e.shiftKey && e.key === 'I') {
      e.preventDefault();
      return false;
    }

    // Disable Ctrl+Shift+J (Console)
    if (e.ctrlKey && e.shiftKey && e.key === 'J') {
      e.preventDefault();
      return false;
    }

    // Disable Ctrl+U (View Source)
    if (e.ctrlKey && e.key === 'u') {
      e.preventDefault();
      return false;
    }

    // Disable Ctrl+S (Save Page)
    if (e.ctrlKey && e.key === 's') {
      e.preventDefault();
      return false;
    }

    // Disable Ctrl+P (Print)
    if (e.ctrlKey && e.key === 'p') {
      e.preventDefault();
      return false;
    }

    // Disable Ctrl+Shift+C (Inspect Element)
    if (e.ctrlKey && e.shiftKey && e.key === 'C') {
      e.preventDefault();
      return false;
    }

    // Disable Ctrl+Shift+K (Web Console in Firefox)
    if (e.ctrlKey && e.shiftKey && e.key === 'K') {
      e.preventDefault();
      return false;
    }
  }, false);
};

/**
 * Disable text selection
 */
export const disableTextSelection = () => {
  document.addEventListener('selectstart', (e) => {
    e.preventDefault();
    return false;
  }, false);

  // CSS approach
  document.body.style.userSelect = 'none';
  document.body.style.webkitUserSelect = 'none';
  document.body.style.mozUserSelect = 'none';
  document.body.style.msUserSelect = 'none';
};

/**
 * Enable video protection
 */
export const enableVideoProtection = () => {
  if (protectionEnabled) return;

  disableRightClick();
  disableKeyboardShortcuts();
  disableTextSelection();
  protectionEnabled = true;
};

/**
 * Disable video protection
 */
export const disableVideoProtection = () => {
  protectionEnabled = false;
  document.body.style.userSelect = '';
  document.body.style.webkitUserSelect = '';
  document.body.style.mozUserSelect = '';
  document.body.style.msUserSelect = '';
};

/**
 * Set video token
 */
export const setVideoToken = (token) => {
  videoToken = token;
};

/**
 * Get video token
 */
export const getVideoToken = () => {
  return videoToken;
};

/**
 * Clear video token
 */
export const clearVideoToken = () => {
  videoToken = null;
};

/**
 * Request video stream token from backend
 */
export const requestVideoStreamToken = async (videoId) => {
  try {
    const axiosInstance = (await import('./axios.js')).default;
    const response = await axiosInstance.get(`/videos/${videoId}/stream-token`);
    
    if (response.data.success && response.data.data.streamToken) {
      setVideoToken(response.data.data.streamToken);
      return response.data.data.streamToken;
    }
    
    return null;
  } catch (error) {
    console.error('Failed to get video stream token:', error);
    return null;
  }
};

