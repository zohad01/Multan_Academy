# Backend API Documentation

## Setup Instructions

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file:
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

3. Start MongoDB (if running locally)

4. Run the server:
```bash
npm run dev
```

## API Endpoints

All endpoints are prefixed with `/api`

### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login user
- `GET /auth/me` - Get current user (Protected)
- `PUT /auth/updatedetails` - Update user details (Protected)
- `PUT /auth/updatepassword` - Update password (Protected)

### Users
- `GET /users` - Get all users (Admin only)
- `GET /users/:id` - Get single user (Protected)
- `PUT /users/:id` - Update user (Admin only)
- `DELETE /users/:id` - Delete user (Admin only)

### Courses
- `GET /courses` - Get all published courses
- `GET /courses/:id` - Get single course
- `POST /courses` - Create course (Teacher/Admin)
- `PUT /courses/:id` - Update course (Teacher/Admin)
- `DELETE /courses/:id` - Delete course (Teacher/Admin)
- `GET /courses/teacher/my-courses` - Get teacher's courses (Teacher)
- `GET /courses/student/my-courses` - Get student's enrolled courses (Student)

### Videos
- `GET /videos/course/:courseId` - Get course videos
- `GET /videos/:id` - Get single video (Protected)
- `POST /videos` - Create video (Teacher/Admin)
- `PUT /videos/:id` - Update video (Teacher/Admin)
- `PUT /videos/:id/progress` - Update video progress (Student)
- `DELETE /videos/:id` - Delete video (Teacher/Admin)

### Materials
- `GET /materials/course/:courseId` - Get course materials
- `GET /materials/:id` - Get single material (Protected)
- `POST /materials` - Create material (Teacher/Admin)
- `PUT /materials/:id` - Update material (Teacher/Admin)
- `DELETE /materials/:id` - Delete material (Teacher/Admin)

### Quizzes
- `GET /quizzes/course/:courseId` - Get course quizzes
- `GET /quizzes/:id` - Get single quiz (Protected)
- `POST /quizzes` - Create quiz (Teacher/Admin)
- `POST /quizzes/:id/submit` - Submit quiz (Student)
- `PUT /quizzes/:id` - Update quiz (Teacher/Admin)
- `DELETE /quizzes/:id` - Delete quiz (Teacher/Admin)

### Assignments
- `GET /assignments/course/:courseId` - Get course assignments
- `GET /assignments/:id` - Get single assignment (Protected)
- `POST /assignments` - Create assignment (Teacher/Admin)
- `POST /assignments/:id/submit` - Submit assignment (Student)
- `PUT /assignments/:id/grade` - Grade assignment (Teacher/Admin)
- `DELETE /assignments/:id` - Delete assignment (Teacher/Admin)

### Payments
- `GET /payments` - Get payment history (Student)
- `GET /payments/:id` - Get single payment (Student)
- `POST /payments` - Create payment (Student)

### Certificates
- `GET /certificates` - Get student's certificates (Student)
- `GET /certificates/:id` - Get single certificate (Protected)
- `POST /certificates/generate/:courseId` - Generate certificate (Student)
- `GET /certificates/verify/:verificationCode` - Verify certificate (Public)

### Subjects
- `GET /subjects` - Get all subjects
- `GET /subjects/:id` - Get single subject
- `POST /subjects` - Create subject (Admin)
- `PUT /subjects/:id` - Update subject (Admin)
- `DELETE /subjects/:id` - Delete subject (Admin)

### Admin
- `GET /admin/stats` - Get dashboard stats (Admin)
- `GET /admin/activity-logs` - Get activity logs (Admin)
- `POST /admin/activity-logs` - Create activity log (Admin)

## Authentication

Most endpoints require authentication. Include the JWT token in the Authorization header:

```
Authorization: Bearer <token>
```

## File Uploads

Videos and materials can be uploaded using multipart/form-data. The files will be stored in the `uploads/` directory.

## Error Handling

All errors follow this format:
```json
{
  "success": false,
  "error": "Error message"
}
```

Success responses follow this format:
```json
{
  "success": true,
  "data": { ... }
}
```

