/**
 * Session Management Utilities
 * 
 * Handles automated logout, inactivity timeout, and session duration tracking
 */

let inactivityTimer = null;
let sessionTimer = null;
let sessionStartTime = null;
let sessionConfig = {
  sessionTimeoutMinutes: 30,
  inactivityTimeoutMinutes: 15,
  maxSessionDurationHours: 8,
};

/**
 * Initialize session management
 */
export const initSessionManager = (config, onTimeout) => {
  if (config) {
    sessionConfig = { ...sessionConfig, ...config };
  }

  sessionStartTime = Date.now();
  
  // Reset inactivity timer on user activity
  resetInactivityTimer(onTimeout);
  
  // Set up activity listeners
  const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
  events.forEach((event) => {
    document.addEventListener(event, () => resetInactivityTimer(onTimeout), true);
  });

  // Check max session duration
  checkMaxSessionDuration(onTimeout);
};

/**
 * Reset inactivity timer
 */
const resetInactivityTimer = (onTimeout) => {
  if (inactivityTimer) {
    clearTimeout(inactivityTimer);
  }

  inactivityTimer = setTimeout(() => {
    if (onTimeout) {
      onTimeout('inactivity');
    }
  }, sessionConfig.inactivityTimeoutMinutes * 60 * 1000);
};

/**
 * Check max session duration
 */
const checkMaxSessionDuration = (onTimeout) => {
  if (sessionTimer) {
    clearInterval(sessionTimer);
  }

  sessionTimer = setInterval(() => {
    const sessionDuration = (Date.now() - sessionStartTime) / (1000 * 60 * 60); // hours
    
    if (sessionDuration >= sessionConfig.maxSessionDurationHours) {
      if (onTimeout) {
        onTimeout('maxDuration');
      }
    }
  }, 60000); // Check every minute
};

/**
 * Clear session timers
 */
export const clearSessionManager = () => {
  if (inactivityTimer) {
    clearTimeout(inactivityTimer);
    inactivityTimer = null;
  }
  
  if (sessionTimer) {
    clearInterval(sessionTimer);
    sessionTimer = null;
  }
  
  sessionStartTime = null;
};

/**
 * Get session config
 */
export const getSessionConfig = () => {
  return { ...sessionConfig };
};

/**
 * Update session config
 */
export const updateSessionConfig = (config) => {
  sessionConfig = { ...sessionConfig, ...config };
};

/**
 * Get session duration in minutes
 */
export const getSessionDuration = () => {
  if (!sessionStartTime) return 0;
  return Math.floor((Date.now() - sessionStartTime) / (1000 * 60));
};

/**
 * Get time until inactivity timeout in minutes
 */
export const getTimeUntilInactivityTimeout = () => {
  return sessionConfig.inactivityTimeoutMinutes;
};

/**
 * Get time until max session duration in hours
 */
export const getTimeUntilMaxSession = () => {
  if (!sessionStartTime) return sessionConfig.maxSessionDurationHours;
  const elapsed = (Date.now() - sessionStartTime) / (1000 * 60 * 60);
  return Math.max(0, sessionConfig.maxSessionDurationHours - elapsed);
};

