import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Create uploads directory if it doesn't exist
const uploadsDir = './uploads';
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let uploadPath = './uploads';
    
    if (file.fieldname === 'video') {
      uploadPath = './uploads/videos';
    } else if (file.fieldname === 'material') {
      uploadPath = './uploads/materials';
    } else if (file.fieldname === 'profile') {
      uploadPath = './uploads/profiles';
    } else if (file.fieldname === 'receipt') {
      uploadPath = './uploads/receipts';
    }

    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }

    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  },
});

// File filter
const fileFilter = (req, file, cb) => {
  // Allow videos
  if (file.fieldname === 'video') {
    const allowedTypes = /mp4|avi|mov|wmv|flv|webm/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only video files are allowed!'));
    }
  }
  // Allow PDFs and documents
  else if (file.fieldname === 'material') {
    const allowedTypes = /pdf|doc|docx|txt/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = /pdf|msword|document|text/.test(file.mimetype);

    if (mimetype || extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only PDF and document files are allowed!'));
    }
  }
  // Allow images for profiles
  else if (file.fieldname === 'profile') {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'));
    }
  }
  // Allow images for payment receipts (images only, no PDF)
  else if (file.fieldname === 'receipt') {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = /^image\//.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files (JPG, PNG, GIF, WEBP) are allowed for payment receipts!'));
    }
  } else {
    cb(new Error('Invalid file type!'));
  }
};

// Configure multer with specific limits for receipts
const upload = multer({
  storage: storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 100 * 1024 * 1024, // 100MB default
  },
  fileFilter: fileFilter,
});

// Special upload for receipts with 5MB limit
export const uploadReceipt = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB for receipts
  },
  fileFilter: (req, file, cb) => {
    if (file.fieldname === 'receipt') {
      const allowedTypes = /jpeg|jpg|png|gif|webp/;
      const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
      const mimetype = /^image\//.test(file.mimetype);

      if (mimetype && extname) {
        return cb(null, true);
      } else {
        cb(new Error('Only image files (JPG, PNG, GIF, WEBP) are allowed for payment receipts! Max size: 5MB'));
      }
    } else {
      cb(new Error('Invalid file type!'));
    }
  },
});

export default upload;

