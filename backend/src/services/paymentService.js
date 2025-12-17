/**
 * Mock payment service
 * In production, this would integrate with Stripe, PayPal, etc.
 */

/**
 * Process mock payment
 */
export const processPayment = async (paymentData) => {
  // Simulate payment processing delay
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // Mock payment - always succeeds
  const transactionId = `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

  return {
    success: true,
    transactionId,
    status: 'completed',
    message: 'Payment processed successfully',
  };
};

/**
 * Verify payment
 */
export const verifyPayment = async (transactionId) => {
  // Mock verification - always returns success
  return {
    success: true,
    verified: true,
    transactionId,
  };
};

export default {
  processPayment,
  verifyPayment,
};

