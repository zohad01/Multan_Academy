# Online Teaching Platform

A full-stack online teaching platform similar to Nearpeer.org, built with React, Node.js, Express, and MongoDB.

## Features

### Student Features
- Email-based registration & login
- Dashboard with purchased courses and progress tracking
- Access to video lectures, assignments, and quizzes
- Auto-generated certificates upon course completion
- Secure password encryption
- Only shows courses purchased by the student

### Teacher Features
- Teacher registration & login
- Profile management
- Create, update, and delete courses
- Upload videos, PDFs, and notes
- Multiple teachers can teach the same subject

### Admin Features
- Manage users (students, teachers)
- Manage courses and subjects
- Admin activity logs
- Role-based access control

### Course Management
- Add videos and materials
- Progress tracking for each student
- Track completion percentage
- Optional live classes (placeholder for Zoom integration)

### Payment & Access Control
- Mock payment gateway integration
- Students can access only purchased courses
- Transaction security

### Security & Compliance
- Encrypted passwords (bcrypt)
- Secure API endpoints (JWT)
- Video piracy protection (token-based access)
- Admin activity logging
- Environment-based secrets & config

## Technology Stack

### Frontend
- React.js (Vite)
- TailwindCSS
- Redux Toolkit
- React Router
- Axios
- React Player (for videos)

### Backend
- Node.js
- Express.js
- MongoDB (Mongoose)
- JWT Authentication
- Multer (file uploads)
- PDFKit (certificate generation)

## Project Structure

```
learning/
├── frontend/
│   ├── src/
│   │   ├── components/        # Reusable UI components
│   │   ├── pages/             # Page components
│   │   ├── store/             # Redux store & slices
│   │   ├── services/          # API services
│   │   ├── utils/             # Utilities & helpers
│   │   ├── context/           # React contexts (Theme)
│   │   └── styles/            # Global styles & theme
│   ├── package.json
│   └── vite.config.js
│
├── backend/
│   ├── src/
│   │   ├── config/            # Database, env configs
│   │   ├── models/            # MongoDB schemas
│   │   ├── routes/            # API routes
│   │   ├── controllers/       # Route controllers
│   │   ├── services/          # Business logic
│   │   ├── middleware/        # Auth, error handling
│   │   └── utils/             # Helpers, validators
│   ├── uploads/               # Local file storage
│   ├── package.json
│   └── .env.example
│
└── README.md
```

## Installation

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or Atlas)
- npm or yarn

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file from `.env.example`:
```bash
cp .env.example .env
```

4. Update `.env` with your configuration:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/online-teaching-platform
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRE=7d
FRONTEND_URL=http://localhost:5173
MAX_FILE_SIZE=104857600
UPLOAD_PATH=./uploads
```

5. Start the backend server:
```bash
npm run dev
```

The backend will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The frontend will run on `http://localhost:5173`

## Usage

1. Start MongoDB (if running locally)
2. Start the backend server
3. Start the frontend server
4. Open `http://localhost:5173` in your browser

### Creating an Admin User

To create an admin user, you can use MongoDB directly or create a script:

```javascript
// In MongoDB shell or script
db.users.insertOne({
  name: "Admin User",
  email: "admin@example.com",
  password: "$2a$10$...", // Hashed password
  role: "admin",
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date()
});
```

Or use the registration endpoint and manually update the role in the database.

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/updatedetails` - Update user details
- `PUT /api/auth/updatepassword` - Update password

### Courses
- `GET /api/courses` - Get all courses
- `GET /api/courses/:id` - Get single course
- `POST /api/courses` - Create course (Teacher/Admin)
- `PUT /api/courses/:id` - Update course (Teacher/Admin)
- `DELETE /api/courses/:id` - Delete course (Teacher/Admin)
- `GET /api/courses/teacher/my-courses` - Get teacher's courses
- `GET /api/courses/student/my-courses` - Get student's enrolled courses

### Videos
- `GET /api/videos/course/:courseId` - Get course videos
- `GET /api/videos/:id` - Get single video
- `POST /api/videos` - Create video (Teacher/Admin)
- `PUT /api/videos/:id` - Update video (Teacher/Admin)
- `PUT /api/videos/:id/progress` - Update video progress (Student)
- `DELETE /api/videos/:id` - Delete video (Teacher/Admin)

### Quizzes
- `GET /api/quizzes/course/:courseId` - Get course quizzes
- `GET /api/quizzes/:id` - Get single quiz
- `POST /api/quizzes` - Create quiz (Teacher/Admin)
- `POST /api/quizzes/:id/submit` - Submit quiz (Student)
- `PUT /api/quizzes/:id` - Update quiz (Teacher/Admin)
- `DELETE /api/quizzes/:id` - Delete quiz (Teacher/Admin)

### Assignments
- `GET /api/assignments/course/:courseId` - Get course assignments
- `GET /api/assignments/:id` - Get single assignment
- `POST /api/assignments` - Create assignment (Teacher/Admin)
- `POST /api/assignments/:id/submit` - Submit assignment (Student)
- `PUT /api/assignments/:id/grade` - Grade assignment (Teacher/Admin)
- `DELETE /api/assignments/:id` - Delete assignment (Teacher/Admin)

### Payments
- `GET /api/payments` - Get payment history (Student)
- `GET /api/payments/:id` - Get single payment (Student)
- `POST /api/payments` - Create payment (Student)

### Certificates
- `GET /api/certificates` - Get student's certificates
- `GET /api/certificates/:id` - Get single certificate
- `POST /api/certificates/generate/:courseId` - Generate certificate (Student)
- `GET /api/certificates/verify/:verificationCode` - Verify certificate (Public)

### Admin
- `GET /api/admin/stats` - Get dashboard stats
- `GET /api/admin/activity-logs` - Get activity logs

## Environment Variables

### Backend (.env)
- `PORT` - Server port (default: 5000)
- `NODE_ENV` - Environment (development/production)
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - Secret key for JWT tokens
- `JWT_EXPIRE` - JWT expiration time
- `FRONTEND_URL` - Frontend URL for CORS
- `MAX_FILE_SIZE` - Maximum file upload size in bytes

## Security Features

- Password hashing with bcrypt
- JWT token authentication
- Role-based access control
- Protected API routes
- CORS configuration
- Rate limiting
- Helmet.js for security headers
- Input validation

## Development

### Running in Development Mode

Backend:
```bash
cd backend
npm run dev
```

Frontend:
```bash
cd frontend
npm run dev
```

### Building for Production

Backend:
```bash
cd backend
npm start
```

Frontend:
```bash
cd frontend
npm run build
npm run preview
```

## License

This project is open source and available under the MIT License.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

