import mongoose from 'mongoose';
import dotenv from 'dotenv';
import connectDB from '../config/database.js';
import User from '../models/User.js';
import Subject from '../models/Subject.js';
import Course from '../models/Course.js';
import Video from '../models/Video.js';
import Material from '../models/Material.js';
import Quiz from '../models/Quiz.js';
import Assignment from '../models/Assignment.js';
import Progress from '../models/Progress.js';
import Payment from '../models/Payment.js';
import Certificate from '../models/Certificate.js';
import Submission from '../models/Submission.js';
import ActivityLog from '../models/ActivityLog.js';

// Load env vars
dotenv.config();

const seedData = async () => {
  try {
    // Connect to database
    await connectDB();
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    console.log('\n🗑️  Clearing existing data...');
    await User.deleteMany({});
    await Subject.deleteMany({});
    await Course.deleteMany({});
    await Video.deleteMany({});
    await Material.deleteMany({});
    await Quiz.deleteMany({});
    await Assignment.deleteMany({});
    await Progress.deleteMany({});
    await Payment.deleteMany({});
    await Certificate.deleteMany({});
    await Submission.deleteMany({});
    await ActivityLog.deleteMany({});
    
    // Drop Submission collection to reset indexes
    try {
      await mongoose.connection.db.collection('submissions').drop();
      console.log('✅ Submission collection dropped (to reset indexes)');
    } catch (error) {
      // Collection might not exist, which is fine
    }
    
    console.log('✅ Existing data cleared\n');

    // ==================== CREATE ADMIN ====================
    // Note: Password will be hashed automatically by User model's pre-save hook
    const admin = new User({
      name: 'Admin User',
      email: 'admin@test.com',
      password: 'admin123', // Will be hashed by pre-save hook
      role: 'admin',
      isActive: true,
    });
    await admin.save();
    console.log('✅ Admin user created:', admin.email);

    // ==================== CREATE TEACHERS (Multiple per subject) ====================
    // Note: Password will be hashed automatically by User model's pre-save hook
    
    // Web Development Teachers (Multiple teachers per subject as per architecture)
    const teacher1 = new User({
      name: 'Dr. Ahmed Khan',
      email: 'ahmed.khan@test.com',
      password: 'teacher123', // Will be hashed by pre-save hook
      role: 'teacher',
      specialization: 'Full Stack Web Development',
      experience: 8,
      bio: 'Senior Full Stack Developer with 8+ years of experience. Expert in React, Node.js, and modern web technologies. Taught 5000+ students online.',
      phone: '+92-300-1234567',
      isActive: true,
    });
    await teacher1.save();

    const teacher2 = new User({
      name: 'Sarah Ali',
      email: 'sarah.ali@test.com',
      password: 'teacher123', // Will be hashed by pre-save hook
      role: 'teacher',
      specialization: 'Frontend Development',
      experience: 6,
      bio: 'Frontend specialist with expertise in React, Vue.js, and modern CSS. Passionate about creating beautiful user interfaces.',
      phone: '+92-300-1234568',
      isActive: true,
    });
    await teacher2.save();

    // Data Science Teachers
    const teacher3 = new User({
      name: 'Dr. Muhammad Hassan',
      email: 'hassan@test.com',
      password: 'teacher123', // Will be hashed by pre-save hook
      role: 'teacher',
      specialization: 'Data Science & Machine Learning',
      experience: 10,
      bio: 'PhD in Data Science. Expert in Python, Machine Learning, and Deep Learning. Published researcher with 50+ papers.',
      phone: '+92-300-1234569',
      isActive: true,
    });
    await teacher3.save();

    const teacher4 = new User({
      name: 'Fatima Sheikh',
      email: 'fatima@test.com',
      password: 'teacher123', // Will be hashed by pre-save hook
      role: 'teacher',
      specialization: 'Data Analysis & Visualization',
      experience: 5,
      bio: 'Data analyst with expertise in Python, SQL, and Tableau. Helped 2000+ students start their data science journey.',
      phone: '+92-300-1234570',
      isActive: true,
    });
    await teacher4.save();

    // Mobile Development Teachers
    const teacher5 = new User({
      name: 'Usman Malik',
      email: 'usman@test.com',
      password: 'teacher123', // Will be hashed by pre-save hook
      role: 'teacher',
      specialization: 'React Native & Flutter',
      experience: 7,
      bio: 'Mobile app developer with 7+ years of experience. Built 50+ apps for iOS and Android. Expert in React Native and Flutter.',
      phone: '+92-300-1234571',
      isActive: true,
    });
    await teacher5.save();

    // UI/UX Design Teachers
    const teacher6 = new User({
      name: 'Ayesha Raza',
      email: 'ayesha@test.com',
      password: 'teacher123', // Will be hashed by pre-save hook
      role: 'teacher',
      specialization: 'UI/UX Design & Figma',
      experience: 6,
      bio: 'Award-winning UI/UX designer. Expert in design thinking, user research, and creating intuitive interfaces. Worked with top tech companies.',
      phone: '+92-300-1234572',
      isActive: true,
    });
    await teacher6.save();

    const teachers = [teacher1, teacher2, teacher3, teacher4, teacher5, teacher6];
    console.log(`✅ ${teachers.length} Teachers created (Multiple teachers per subject)`);

    // ==================== CREATE STUDENTS ====================
    // Note: Password will be hashed automatically by User model's pre-save hook
    const students = [];
    const studentNames = [
      'Ali Ahmed', 'Sana Khan', 'Hassan Ali', 'Fatima Sheikh', 'Usman Malik',
      'Ayesha Raza', 'Bilal Hassan', 'Zainab Ali', 'Omar Khan', 'Maryam Sheikh',
      'Ahmed Raza', 'Hira Malik', 'Saad Ali', 'Amina Khan', 'Taha Sheikh'
    ];

    for (let i = 0; i < studentNames.length; i++) {
      const student = new User({
        name: studentNames[i],
        email: `student${i + 1}@test.com`,
        password: 'student123', // Will be hashed by pre-save hook
        role: 'student',
        isActive: true,
      });
      await student.save();
      students.push(student);
    }
    console.log(`✅ ${students.length} Students created`);

    // ==================== CREATE SUBJECTS ====================
    const subjects = [];
    const subjectData = [
      {
        name: 'Web Development',
        description: 'Learn modern web development technologies including HTML, CSS, JavaScript, React, Node.js, and more',
        category: 'Programming',
      },
      {
        name: 'Data Science',
        description: 'Master data analysis, machine learning, and artificial intelligence using Python and modern tools',
        category: 'Data & Analytics',
      },
      {
        name: 'Mobile Development',
        description: 'Build cross-platform mobile applications using React Native, Flutter, and native technologies',
        category: 'Programming',
      },
      {
        name: 'UI/UX Design',
        description: 'Learn design principles, user research, prototyping, and create beautiful user interfaces',
        category: 'Design',
      },
      {
        name: 'DevOps & Cloud',
        description: 'Learn deployment, CI/CD, Docker, Kubernetes, and cloud platforms like AWS and Azure',
        category: 'Operations',
      },
    ];

    for (const data of subjectData) {
      const subject = await Subject.create(data);
      subjects.push(subject);
    }
    console.log(`✅ ${subjects.length} Subjects created`);

    // ==================== CREATE COURSES ====================
    const courses = [];

    // Course 1: React Development (Multiple teachers teaching same subject)
    const course1 = await Course.create({
      title: 'Complete React Development Bootcamp',
      description: 'Master React from fundamentals to advanced concepts. Build real-world projects including e-commerce apps, social media platforms, and more. Learn React Hooks, Context API, Redux, and modern React patterns.',
      price: 49.99,
      teacher: teacher1._id, // Dr. Ahmed Khan
      subject: subjects[0]._id, // Web Development
      category: 'Programming',
      level: 'beginner',
      duration: 60,
      isPublished: true,
      isActive: true,
    });
    courses.push(course1);

    // Course 2: Advanced React (Same subject, different teacher)
    const course2 = await Course.create({
      title: 'Advanced React Patterns & Performance',
      description: 'Deep dive into advanced React concepts, performance optimization, code splitting, lazy loading, and building scalable React applications.',
      price: 69.99,
      teacher: teacher2._id, // Sarah Ali
      subject: subjects[0]._id, // Web Development (same subject, different teacher)
      category: 'Programming',
      level: 'advanced',
      duration: 45,
      isPublished: true,
      isActive: true,
    });
    courses.push(course2);

    // Course 3: Python Data Science
    const course3 = await Course.create({
      title: 'Python for Data Science & Machine Learning',
      description: 'Complete guide to data science with Python. Learn NumPy, Pandas, Matplotlib, Seaborn, Scikit-learn, and build machine learning models from scratch.',
      price: 59.99,
      teacher: teacher3._id, // Dr. Muhammad Hassan
      subject: subjects[1]._id, // Data Science
      category: 'Data & Analytics',
      level: 'intermediate',
      duration: 80,
      isPublished: true,
      isActive: true,
    });
    courses.push(course3);

    // Course 4: Data Analysis (Same subject, different teacher)
    const course4 = await Course.create({
      title: 'Data Analysis with Python & SQL',
      description: 'Learn to analyze data using Python and SQL. Master data cleaning, transformation, visualization, and create insightful reports.',
      price: 54.99,
      teacher: teacher4._id, // Fatima Sheikh
      subject: subjects[1]._id, // Data Science (same subject, different teacher)
      category: 'Data & Analytics',
      level: 'beginner',
      duration: 50,
      isPublished: true,
      isActive: true,
    });
    courses.push(course4);

    // Course 5: React Native
    const course5 = await Course.create({
      title: 'React Native Mobile App Development',
      description: 'Build cross-platform mobile apps using React Native. Learn navigation, state management, API integration, and publish apps to App Store and Play Store.',
      price: 64.99,
      teacher: teacher5._id,
      subject: subjects[2]._id,
      category: 'Programming',
      level: 'intermediate',
      duration: 55,
      isPublished: true,
      isActive: true,
    });
    courses.push(course5);

    // Course 6: UI/UX Design
    const course6 = await Course.create({
      title: 'Complete UI/UX Design Masterclass',
      description: 'Learn design thinking, user research, wireframing, prototyping with Figma, and create beautiful, user-friendly interfaces.',
      price: 49.99,
      teacher: teacher6._id,
      subject: subjects[3]._id,
      category: 'Design',
      level: 'beginner',
      duration: 40,
      isPublished: true,
      isActive: true,
    });
    courses.push(course6);

    console.log(`✅ ${courses.length} Courses created (Multiple teachers per subject)`);

    // ==================== ENROLL STUDENTS & CREATE PAYMENTS ====================
    console.log('\n💰 Creating enrollments and payments...');
    
    // Enroll students in courses with payment records
    const enrollments = [
      { student: students[0], course: course1, paymentDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
      { student: students[1], course: course1, paymentDate: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000) },
      { student: students[2], course: course1, paymentDate: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000) },
      { student: students[0], course: course3, paymentDate: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000) },
      { student: students[3], course: course3, paymentDate: new Date(Date.now() - 22 * 24 * 60 * 60 * 1000) },
      { student: students[4], course: course3, paymentDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000) },
      { student: students[1], course: course5, paymentDate: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000) },
      { student: students[5], course: course5, paymentDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000) },
      { student: students[2], course: course6, paymentDate: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000) },
      { student: students[6], course: course6, paymentDate: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000) },
    ];

    for (const enrollment of enrollments) {
      // Enroll student
      enrollment.course.studentsEnrolled.push(enrollment.student._id);
      await enrollment.course.save();
      
      enrollment.student.enrolledCourses.push(enrollment.course._id);
      await enrollment.student.save();

      // Create payment record
      const transactionId = `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
      await Payment.create({
        student: enrollment.student._id,
        course: enrollment.course._id,
        transactionId,
        amount: enrollment.course.price,
        currency: 'USD',
        status: 'completed',
        paymentMethod: 'mock',
        paymentDate: enrollment.paymentDate,
        enrollmentCompleted: true,
      });
    }
    console.log(`✅ ${enrollments.length} Enrollments with payment records created`);

    // ==================== CREATE VIDEOS ====================
    console.log('\n🎥 Creating videos...');
    
    // Videos for Course 1 (React Bootcamp)
    const course1Videos = [
      { title: 'Introduction to React', description: 'What is React and why use it?', duration: 600, order: 1, isPreview: true },
      { title: 'Setting Up Development Environment', description: 'Install Node.js, VS Code, and create your first React app', duration: 900, order: 2, isPreview: false },
      { title: 'JSX Fundamentals', description: 'Understanding JSX syntax and expressions', duration: 1200, order: 3, isPreview: false },
      { title: 'Components and Props', description: 'Creating reusable components and passing data with props', duration: 1500, order: 4, isPreview: false },
      { title: 'State and useState Hook', description: 'Managing component state with useState', duration: 1800, order: 5, isPreview: false },
      { title: 'Event Handling', description: 'Handling user interactions and events', duration: 1200, order: 6, isPreview: false },
      { title: 'Conditional Rendering', description: 'Rendering components conditionally', duration: 1000, order: 7, isPreview: false },
      { title: 'Lists and Keys', description: 'Rendering lists of data efficiently', duration: 1100, order: 8, isPreview: false },
      { title: 'useEffect Hook', description: 'Side effects and lifecycle in functional components', duration: 2000, order: 9, isPreview: false },
      { title: 'Building a Todo App Project', description: 'Complete project: Build a todo application', duration: 3600, order: 10, isPreview: false },
    ];

    const course1VideoDocs = [];
    for (const videoData of course1Videos) {
      const video = await Video.create({
        ...videoData,
        course: course1._id,
        videoUrl: `https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4`,
        isActive: true,
      });
      course1VideoDocs.push(video);
    }

    // Videos for Course 3 (Python Data Science)
    const course3Videos = [
      { title: 'Introduction to Data Science', description: 'Overview of data science and its applications', duration: 800, order: 1, isPreview: true },
      { title: 'Python Basics Review', description: 'Python fundamentals for data science', duration: 1500, order: 2, isPreview: false },
      { title: 'NumPy Fundamentals', description: 'Working with NumPy arrays and operations', duration: 2000, order: 3, isPreview: false },
      { title: 'Pandas DataFrames', description: 'Data manipulation with Pandas', duration: 2400, order: 4, isPreview: false },
      { title: 'Data Visualization with Matplotlib', description: 'Creating charts and visualizations', duration: 1800, order: 5, isPreview: false },
      { title: 'Data Cleaning Techniques', description: 'Handling missing data and outliers', duration: 2000, order: 6, isPreview: false },
    ];

    for (const videoData of course3Videos) {
      await Video.create({
        ...videoData,
        course: course3._id,
        videoUrl: `https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4`,
        isActive: true,
      });
    }

    // Videos for Course 5 (React Native)
    const course5Videos = [
      { title: 'Introduction to React Native', description: 'What is React Native and why use it?', duration: 700, order: 1, isPreview: true },
      { title: 'Setting Up React Native Environment', description: 'Install Android Studio, Xcode, and setup', duration: 1500, order: 2, isPreview: false },
      { title: 'React Native Components', description: 'Core components and styling', duration: 1800, order: 3, isPreview: false },
    ];

    for (const videoData of course5Videos) {
      await Video.create({
        ...videoData,
        course: course5._id,
        videoUrl: `https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4`,
        isActive: true,
      });
    }

    console.log('✅ Videos created for courses');

    // ==================== CREATE MATERIALS ====================
    console.log('\n📄 Creating course materials...');
    
    const materials = [
      { title: 'React Cheat Sheet', description: 'Quick reference guide for React concepts', course: course1, fileType: 'pdf', order: 1 },
      { title: 'Week 1 Lecture Notes', description: 'Detailed notes from week 1 lectures', course: course1, fileType: 'pdf', order: 2 },
      { title: 'React Project Templates', description: 'Starter templates for React projects', course: course1, fileType: 'doc', order: 3 },
      { title: 'Python Data Science Handbook', description: 'Comprehensive guide to Python for data science', course: course3, fileType: 'pdf', order: 1 },
      { title: 'NumPy & Pandas Exercises', description: 'Practice exercises with solutions', course: course3, fileType: 'pdf', order: 2 },
    ];

    for (const materialData of materials) {
      await Material.create({
        title: materialData.title,
        description: materialData.description,
        course: materialData.course._id,
        fileUrl: `/uploads/materials/${materialData.title.toLowerCase().replace(/\s+/g, '-')}.pdf`,
        fileType: materialData.fileType,
        order: materialData.order,
        isActive: true,
      });
    }
    console.log(`✅ ${materials.length} Course materials created`);

    // ==================== CREATE QUIZZES ====================
    console.log('\n📝 Creating quizzes...');
    
    const quiz1 = await Quiz.create({
      title: 'React Fundamentals Quiz',
      description: 'Test your understanding of React basics',
      course: course1._id,
      questions: [
        {
          question: 'What is React?',
          options: ['A database', 'A JavaScript library for building user interfaces', 'A programming language', 'A CSS framework'],
          correctAnswer: 1,
          points: 10,
        },
        {
          question: 'What is JSX?',
          options: ['JavaScript XML', 'Java Syntax Extension', 'JSON XML', 'JavaScript Extension'],
          correctAnswer: 0,
          points: 10,
        },
        {
          question: 'Which hook is used for side effects?',
          options: ['useState', 'useEffect', 'useContext', 'useReducer'],
          correctAnswer: 1,
          points: 10,
        },
        {
          question: 'What is the purpose of keys in React lists?',
          options: ['To style elements', 'To help React identify which items have changed', 'To add event handlers', 'To create animations'],
          correctAnswer: 1,
          points: 10,
        },
        {
          question: 'What does useState return?',
          options: ['A single value', 'An array with current state and setter function', 'A function', 'An object'],
          correctAnswer: 1,
          points: 10,
        },
      ],
      passingScore: 60,
      timeLimit: 30,
      isActive: true,
    });

    const quiz2 = await Quiz.create({
      title: 'Python Data Science Quiz',
      description: 'Test your Python and data science knowledge',
      course: course3._id,
      questions: [
        {
          question: 'What is NumPy primarily used for?',
          options: ['Web development', 'Numerical computing in Python', 'Database management', 'Text processing'],
          correctAnswer: 1,
          points: 15,
        },
        {
          question: 'What is a DataFrame in Pandas?',
          options: ['A 2D labeled data structure', 'A function', 'A variable', 'A class'],
          correctAnswer: 0,
          points: 15,
        },
        {
          question: 'Which library is commonly used for data visualization in Python?',
          options: ['NumPy', 'Pandas', 'Matplotlib', 'Requests'],
          correctAnswer: 2,
          points: 15,
        },
      ],
      passingScore: 60,
      timeLimit: 25,
      isActive: true,
    });

    console.log('✅ Quizzes created');

    // ==================== CREATE ASSIGNMENTS ====================
    console.log('\n📋 Creating assignments...');
    
    const assignment1 = await Assignment.create({
      title: 'Build a React Todo Application',
      description: 'Create a fully functional todo application with the following features:\n- Add new todos\n- Mark todos as complete/incomplete\n- Delete todos\n- Filter todos (all, active, completed)\n- Persist data in localStorage',
      course: course1._id,
      dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      totalPoints: 100,
      instructions: 'Submit your code via GitHub repository link. Include a README with setup instructions and screenshots of your application.',
      isActive: true,
    });

    const assignment2 = await Assignment.create({
      title: 'Data Analysis Project',
      description: 'Choose a dataset (Kaggle, UCI, or any public dataset) and perform comprehensive data analysis:\n- Load and explore the data\n- Clean and preprocess the data\n- Perform exploratory data analysis\n- Create visualizations\n- Write a report with your findings',
      course: course3._id,
      dueDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000),
      totalPoints: 100,
      instructions: 'Submit both your Jupyter notebook (.ipynb) and a PDF report. Use Pandas, NumPy, and Matplotlib/Seaborn.',
      isActive: true,
    });

    console.log('✅ Assignments created');

    // ==================== CREATE PROGRESS TRACKING ====================
    console.log('\n📊 Creating progress tracking data...');
    
    // Student 0 - Course 1 (React) - 100% complete (for certificate)
    const progress1 = await Progress.create({
      student: students[0]._id,
      course: course1._id,
      videosWatched: course1VideoDocs.map((video, index) => ({
        video: video._id,
        watchedAt: new Date(Date.now() - (10 - index) * 24 * 60 * 60 * 1000),
        progress: 100,
        completed: true,
      })),
      completionPercentage: 100,
      lastAccessed: new Date(),
    });

    // Student 1 - Course 1 (React) - 60% complete
    const progress2 = await Progress.create({
      student: students[1]._id,
      course: course1._id,
      videosWatched: course1VideoDocs.slice(0, 6).map((video, index) => ({
        video: video._id,
        watchedAt: new Date(Date.now() - (6 - index) * 24 * 60 * 60 * 1000),
        progress: index < 5 ? 100 : 50,
        completed: index < 5,
      })),
      completionPercentage: 60,
      lastAccessed: new Date(),
    });

    // Student 0 - Course 3 (Data Science) - 75% complete
    const course3VideosList = await Video.find({ course: course3._id }).sort({ order: 1 });
    const progress3 = await Progress.create({
      student: students[0]._id,
      course: course3._id,
      videosWatched: course3VideosList.slice(0, 5).map((video, index) => ({
        video: video._id,
        watchedAt: new Date(Date.now() - (5 - index) * 24 * 60 * 60 * 1000),
        progress: 100,
        completed: true,
      })),
      completionPercentage: 75,
      lastAccessed: new Date(),
    });

    console.log('✅ Progress tracking data created');

    // ==================== CREATE QUIZ SUBMISSIONS ====================
    console.log('\n✍️  Creating quiz submissions...');
    
    // Student 0 - Quiz 1 (Passed)
    await Submission.create({
      student: students[0]._id,
      course: course1._id,
      quiz: quiz1._id,
      quizAnswers: [
        { questionIndex: 0, selectedAnswer: 1, isCorrect: true, points: 10 },
        { questionIndex: 1, selectedAnswer: 0, isCorrect: true, points: 10 },
        { questionIndex: 2, selectedAnswer: 1, isCorrect: true, points: 10 },
        { questionIndex: 3, selectedAnswer: 1, isCorrect: true, points: 10 },
        { questionIndex: 4, selectedAnswer: 1, isCorrect: true, points: 10 },
      ],
      quizScore: 50,
      quizPercentage: 100,
      quizPassed: true,
      submittedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    });

    // Student 1 - Quiz 1 (Failed)
    await Submission.create({
      student: students[1]._id,
      course: course1._id,
      quiz: quiz1._id,
      quizAnswers: [
        { questionIndex: 0, selectedAnswer: 1, isCorrect: true, points: 10 },
        { questionIndex: 1, selectedAnswer: 2, isCorrect: false, points: 0 },
        { questionIndex: 2, selectedAnswer: 0, isCorrect: false, points: 0 },
        { questionIndex: 3, selectedAnswer: 1, isCorrect: true, points: 10 },
        { questionIndex: 4, selectedAnswer: 0, isCorrect: false, points: 0 },
      ],
      quizScore: 20,
      quizPercentage: 40,
      quizPassed: false,
      submittedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    });

    // Student 0 - Quiz 2 (Passed)
    await Submission.create({
      student: students[0]._id,
      course: course3._id,
      quiz: quiz2._id,
      quizAnswers: [
        { questionIndex: 0, selectedAnswer: 1, isCorrect: true, points: 15 },
        { questionIndex: 1, selectedAnswer: 0, isCorrect: true, points: 15 },
        { questionIndex: 2, selectedAnswer: 2, isCorrect: true, points: 15 },
      ],
      quizScore: 45,
      quizPercentage: 100,
      quizPassed: true,
      submittedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
    });

    console.log('✅ Quiz submissions created');

    // ==================== CREATE ASSIGNMENT SUBMISSIONS ====================
    console.log('\n📤 Creating assignment submissions...');
    
    // Student 0 - Assignment 1 (Graded)
    await Submission.create({
      student: students[0]._id,
      course: course1._id,
      assignment: assignment1._id,
      assignmentAnswer: 'I have completed the todo application with all required features. The app includes add, delete, complete, and filter functionality. Data is persisted in localStorage.',
      assignmentFiles: [
        { fileUrl: '/uploads/submissions/todo-app.zip', fileName: 'todo-app.zip' },
      ],
      assignmentScore: 95,
      assignmentFeedback: 'Excellent work! All features are implemented correctly. Code is clean and well-organized. Minor suggestion: Add error handling for edge cases.',
      gradedBy: teacher1._id,
      gradedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      submittedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    });

    // Student 1 - Assignment 1 (Submitted, not graded yet)
    await Submission.create({
      student: students[1]._id,
      course: course1._id,
      assignment: assignment1._id,
      assignmentAnswer: 'Todo app is complete with basic features. Still working on localStorage persistence.',
      assignmentFiles: [
        { fileUrl: '/uploads/submissions/todo-app-student1.zip', fileName: 'todo-app-student1.zip' },
      ],
      submittedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    });

    console.log('✅ Assignment submissions created');

    // ==================== CREATE CERTIFICATES ====================
    console.log('\n🏆 Creating certificates...');
    
    // Student 0 completed Course 1 (100% progress)
    const cert1 = await Certificate.create({
      student: students[0]._id,
      course: course1._id,
      certificateId: `CERT-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      verificationCode: Math.random().toString(36).substr(2, 16).toUpperCase(),
      pdfUrl: `/uploads/certificates/cert-${students[0]._id}-${course1._id}.pdf`,
      issueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    });

    console.log('✅ Certificates created');

    // ==================== CREATE ADMIN ACTIVITY LOGS ====================
    console.log('\n📝 Creating admin activity logs...');
    
    await ActivityLog.create({
      admin: admin._id,
      action: 'Created subject',
      resourceType: 'subject',
      resourceId: subjects[0]._id,
      details: 'Created Web Development subject',
      ipAddress: '127.0.0.1',
    });

    await ActivityLog.create({
      admin: admin._id,
      action: 'Approved course',
      resourceType: 'course',
      resourceId: course1._id,
      details: 'Approved React Development Bootcamp course for publication',
      ipAddress: '127.0.0.1',
    });

    await ActivityLog.create({
      admin: admin._id,
      action: 'Updated user',
      resourceType: 'user',
      resourceId: teacher1._id,
      details: 'Updated teacher profile information',
      ipAddress: '127.0.0.1',
    });

    console.log('✅ Admin activity logs created');

    // ==================== SUMMARY ====================
    console.log('\n' + '='.repeat(60));
    console.log('🎉 SEEDING COMPLETED SUCCESSFULLY!');
    console.log('='.repeat(60));
    console.log('\n📊 DATABASE SUMMARY:');
    console.log(`   👤 Users: 1 Admin, ${teachers.length} Teachers, ${students.length} Students`);
    console.log(`   📚 Subjects: ${subjects.length} (with multiple teachers per subject)`);
    console.log(`   🎓 Courses: ${courses.length}`);
    console.log(`   🎥 Videos: ${await Video.countDocuments()}`);
    console.log(`   📄 Materials: ${await Material.countDocuments()}`);
    console.log(`   📝 Quizzes: ${await Quiz.countDocuments()}`);
    console.log(`   📋 Assignments: ${await Assignment.countDocuments()}`);
    console.log(`   📊 Progress Records: ${await Progress.countDocuments()}`);
    console.log(`   💰 Payments: ${await Payment.countDocuments()}`);
    console.log(`   ✍️  Submissions: ${await Submission.countDocuments()}`);
    console.log(`   🏆 Certificates: ${await Certificate.countDocuments()}`);
    console.log(`   📝 Activity Logs: ${await ActivityLog.countDocuments()}`);
    
    console.log('\n🔑 TEST ACCOUNTS:');
    console.log('   Admin:    admin@test.com / admin123');
    console.log('   Teachers: ahmed.khan@test.com, sarah.ali@test.com, hassan@test.com, etc. / teacher123');
    console.log('   Students: student1@test.com to student15@test.com / student123');
    
    console.log('\n✨ KEY FEATURES DEMONSTRATED:');
    console.log('   ✅ Multiple teachers per subject (as per architecture)');
    console.log('   ✅ Student enrollments with payment records');
    console.log('   ✅ Progress tracking with video completion');
    console.log('   ✅ Quiz submissions with grades');
    console.log('   ✅ Assignment submissions (graded and pending)');
    console.log('   ✅ Certificate for completed course');
    console.log('   ✅ Admin activity logs');
    console.log('\n' + '='.repeat(60) + '\n');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error seeding database:', error);
    console.error(error.stack);
    process.exit(1);
  }
};

// Run seeder
seedData();
