import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Please add a student'],
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: [true, 'Please add a course'],
    },
    transactionId: {
      type: String,
      required: true,
      unique: true,
    },
    amount: {
      type: Number,
      required: [true, 'Please add an amount'],
    },
    currency: {
      type: String,
      default: 'USD',
    },
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'refunded', 'rejected'],
      default: 'pending',
    },
    paymentMethod: {
      type: String,
      enum: ['mock', 'easypaisa', 'jazzcash', 'bank_transfer'],
      default: 'mock',
    },
    paymentDate: {
      type: Date,
      default: Date.now,
    },
    enrollmentCompleted: {
      type: Boolean,
      default: false,
    },
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    verifiedAt: {
      type: Date,
    },
    rejectionReason: {
      type: String,
      default: '',
    },
    // Manual payment fields
    paymentReferenceId: {
      type: String,
      unique: true,
      sparse: true, // Allow null values with unique index
    },
    receiptImage: {
      type: String,
      default: '',
    },
    manualTransactionId: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient queries
paymentSchema.index({ student: 1, course: 1 });
paymentSchema.index({ transactionId: 1 });
paymentSchema.index({ status: 1 });

const Payment = mongoose.model('Payment', paymentSchema);

export default Payment;

