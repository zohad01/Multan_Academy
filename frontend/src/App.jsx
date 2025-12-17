import { Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import StudentLogin from './pages/StudentLogin';
import TeacherLogin from './pages/TeacherLogin';
import Signup from './pages/Signup';
import StudentDashboard from './pages/StudentDashboard';
import TeacherDashboard from './pages/TeacherDashboard';
import CreateCourse from './pages/CreateCourse';
import EditCourse from './pages/EditCourse';
import AdminDashboard from './pages/AdminDashboard';
import ManageUsers from './pages/ManageUsers';
import ManageCourses from './pages/ManageCourses';
import ManagePayments from './pages/ManagePayments';
import ManageSubjects from './pages/ManageSubjects';
import ManageCategories from './pages/ManageCategories';
import ManageSocialMedia from './pages/ManageSocialMedia';
import Courses from './pages/Courses';
import CourseDetail from './pages/CourseDetail';
import VideoPlayer from './pages/VideoPlayer';
import Quiz from './pages/Quiz';
import Assignment from './pages/Assignment';
import Gradebook from './pages/Gradebook';
import Certificate from './pages/Certificate';
import Certificates from './pages/Certificates';
import Payment from './pages/Payment';
import PaymentSuccess from './pages/PaymentSuccess';
import IntroVideo from './pages/IntroVideo';
import LiveClass from './pages/LiveClass';
import CreateLiveClass from './pages/CreateLiveClass';
import NotFound from './pages/NotFound';
import ServerError from './pages/ServerError';

function App() {
  return (
    <ThemeProvider>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<LandingPage />} />
          <Route path="login" element={<Login />} />
          <Route path="login/student" element={<StudentLogin />} />
          <Route path="login/teacher" element={<TeacherLogin />} />
          <Route path="signup" element={<Signup />} />
          <Route path="courses" element={<Courses />} />
          <Route path="courses/:id" element={<CourseDetail />} />
          <Route path="intro-video/:type/:id?" element={<IntroVideo />} />
          <Route path="live-classes/:id" element={<LiveClass />} />
          
          {/* Protected Student Routes */}
          <Route
            path="student/dashboard"
            element={
              <ProtectedRoute allowedRoles={['student', 'admin']}>
                <StudentDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="courses/:id/video/:videoId"
            element={
              <ProtectedRoute allowedRoles={['student', 'teacher', 'admin']}>
                <VideoPlayer />
              </ProtectedRoute>
            }
          />
          <Route
            path="courses/:id/quiz/:quizId"
            element={
              <ProtectedRoute allowedRoles={['student', 'teacher', 'admin']}>
                <Quiz />
              </ProtectedRoute>
            }
          />
          <Route
            path="courses/:id/assignment/:assignmentId"
            element={
              <ProtectedRoute allowedRoles={['student', 'teacher', 'admin']}>
                <Assignment />
              </ProtectedRoute>
            }
          />
          <Route
            path="gradebook"
            element={
              <ProtectedRoute allowedRoles={['student', 'admin']}>
                <Gradebook />
              </ProtectedRoute>
            }
          />
          <Route
            path="certificates"
            element={
              <ProtectedRoute allowedRoles={['student', 'teacher', 'admin']}>
                <Certificates />
              </ProtectedRoute>
            }
          />
          <Route
            path="certificates/:id"
            element={
              <ProtectedRoute allowedRoles={['student', 'teacher', 'admin']}>
                <Certificate />
              </ProtectedRoute>
            }
          />
          <Route
            path="payment/:courseId"
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <Payment />
              </ProtectedRoute>
            }
          />
          <Route
            path="payment/success"
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <PaymentSuccess />
              </ProtectedRoute>
            }
          />

          {/* Protected Teacher Routes */}
          <Route
            path="teacher/dashboard"
            element={
              <ProtectedRoute allowedRoles={['teacher']}>
                <TeacherDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="teacher/courses/create"
            element={
              <ProtectedRoute allowedRoles={['teacher']}>
                <CreateCourse />
              </ProtectedRoute>
            }
          />
          <Route
            path="teacher/courses/:id/edit"
            element={
              <ProtectedRoute allowedRoles={['teacher', 'admin']}>
                <EditCourse />
              </ProtectedRoute>
            }
          />
          <Route
            path="live-classes/create"
            element={
              <ProtectedRoute allowedRoles={['teacher', 'admin']}>
                <CreateLiveClass />
              </ProtectedRoute>
            }
          />

          {/* Protected Admin Routes */}
          <Route
            path="admin/dashboard"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="admin/users"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <ManageUsers />
              </ProtectedRoute>
            }
          />
          <Route
            path="admin/courses"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <ManageCourses />
              </ProtectedRoute>
            }
          />
          <Route
            path="admin/payments"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <ManagePayments />
              </ProtectedRoute>
            }
          />
          <Route
            path="admin/subjects"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <ManageSubjects />
              </ProtectedRoute>
            }
          />
          <Route
            path="admin/categories"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <ManageCategories />
              </ProtectedRoute>
            }
          />
          <Route
            path="admin/social-media"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <ManageSocialMedia />
              </ProtectedRoute>
            }
          />

          {/* Error Pages */}
          <Route path="500" element={<ServerError />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </ThemeProvider>
  );
}

export default App;

