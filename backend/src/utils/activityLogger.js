import ActivityLog from '../models/ActivityLog.js';

/**
 * Helper function to log admin activities automatically
 * @param {Object} options - Logging options
 * @param {String} options.adminId - Admin user ID
 * @param {String} options.action - Action performed (e.g., 'created', 'updated', 'deleted')
 * @param {String} options.resourceType - Type of resource (user, course, subject, category, etc.)
 * @param {String} options.resourceId - ID of the resource
 * @param {String} options.details - Additional details about the action
 * @param {String} options.ipAddress - IP address of the admin
 */
export const logAdminActivity = async ({
  adminId,
  action,
  resourceType,
  resourceId = null,
  details = '',
  ipAddress = '',
}) => {
  try {
    await ActivityLog.create({
      admin: adminId,
      action,
      resourceType,
      resourceId,
      details,
      ipAddress,
    });
  } catch (error) {
    // Log error but don't throw - activity logging shouldn't break the main operation
    console.error('Failed to log admin activity:', error);
  }
};

