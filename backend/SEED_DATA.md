# Seed Data Information - Online Teaching Platform

## Overview

This seeder creates comprehensive test data aligned with **Nearpeer.org** style and the project architecture requirements, including:
- Multiple teachers per subject (as per architecture requirement)
- Complete course content (videos, materials, quizzes, assignments)
- Student enrollments with payment records
- Progress tracking data
- Quiz and assignment submissions with grades
- Certificates for completed courses
- Admin activity logs

## How to Run Seeder

```bash
cd backend
npm run seed
```

**Note:** This will **clear all existing data** and create fresh test data.

---

## Test Accounts

### Admin Account
- **Email:** `admin@test.com`
- **Password:** `admin123`
- **Role:** Admin
- **Access:** Full admin panel access

### Teacher Accounts (6 Teachers)

#### Web Development Teachers (Multiple teachers per subject)
1. **Dr. Ahmed Khan**
   - **Email:** `ahmed.khan@test.com`
   - **Password:** `teacher123`
   - **Specialization:** Full Stack Web Development
   - **Experience:** 8 years
   - **Courses:** Complete React Development Bootcamp

2. **Sarah Ali**
   - **Email:** `sarah.ali@test.com`
   - **Password:** `teacher123`
   - **Specialization:** Frontend Development
   - **Experience:** 6 years
   - **Courses:** Advanced React Patterns & Performance

#### Data Science Teachers (Multiple teachers per subject)
3. **Dr. Muhammad Hassan**
   - **Email:** `hassan@test.com`
   - **Password:** `teacher123`
   - **Specialization:** Data Science & Machine Learning
   - **Experience:** 10 years
   - **Courses:** Python for Data Science & Machine Learning

4. **Fatima Sheikh**
   - **Email:** `fatima@test.com`
   - **Password:** `teacher123`
   - **Specialization:** Data Analysis & Visualization
   - **Experience:** 5 years
   - **Courses:** Data Analysis with Python & SQL

#### Mobile Development Teacher
5. **Usman Malik**
   - **Email:** `usman@test.com`
   - **Password:** `teacher123`
   - **Specialization:** React Native & Flutter
   - **Experience:** 7 years
   - **Courses:** React Native Mobile App Development

#### UI/UX Design Teacher
6. **Ayesha Raza**
   - **Email:** `ayesha@test.com`
   - **Password:** `teacher123`
   - **Specialization:** UI/UX Design & Figma
   - **Experience:** 6 years
   - **Courses:** Complete UI/UX Design Masterclass

### Student Accounts (15 Students)
- **Emails:** `student1@test.com` to `student15@test.com`
- **Password:** `student123` (for all)
- **Names:** Ali Ahmed, Sana Khan, Hassan Ali, Fatima Sheikh, Usman Malik, Ayesha Raza, Bilal Hassan, Zainab Ali, Omar Khan, Maryam Sheikh, Ahmed Raza, Hira Malik, Saad Ali, Amina Khan, Taha Sheikh

---

## Data Created

### Subjects (5)
1. **Web Development** - Programming
2. **Data Science** - Data & Analytics
3. **Mobile Development** - Programming
4. **UI/UX Design** - Design
5. **DevOps & Cloud** - Operations

### Courses (6)

1. **Complete React Development Bootcamp**
   - **Teacher:** Dr. Ahmed Khan
   - **Subject:** Web Development
   - **Price:** $49.99
   - **Level:** Beginner
   - **Duration:** 60 hours
   - **Videos:** 10 videos
   - **Materials:** 3 PDFs/Documents
   - **Quizzes:** 1 quiz
   - **Assignments:** 1 assignment
   - **Enrolled Students:** 3

2. **Advanced React Patterns & Performance**
   - **Teacher:** Sarah Ali
   - **Subject:** Web Development (Same subject, different teacher)
   - **Price:** $69.99
   - **Level:** Advanced
   - **Duration:** 45 hours

3. **Python for Data Science & Machine Learning**
   - **Teacher:** Dr. Muhammad Hassan
   - **Subject:** Data Science
   - **Price:** $59.99
   - **Level:** Intermediate
   - **Duration:** 80 hours
   - **Videos:** 6 videos
   - **Materials:** 2 PDFs
   - **Quizzes:** 1 quiz
   - **Assignments:** 1 assignment
   - **Enrolled Students:** 3

4. **Data Analysis with Python & SQL**
   - **Teacher:** Fatima Sheikh
   - **Subject:** Data Science (Same subject, different teacher)
   - **Price:** $54.99
   - **Level:** Beginner
   - **Duration:** 50 hours

5. **React Native Mobile App Development**
   - **Teacher:** Usman Malik
   - **Subject:** Mobile Development
   - **Price:** $64.99
   - **Level:** Intermediate
   - **Duration:** 55 hours
   - **Videos:** 3 videos
   - **Enrolled Students:** 2

6. **Complete UI/UX Design Masterclass**
   - **Teacher:** Ayesha Raza
   - **Subject:** UI/UX Design
   - **Price:** $49.99
   - **Level:** Beginner
   - **Duration:** 40 hours
   - **Enrolled Students:** 2

### Content Details

#### Videos
- **Course 1 (React):** 10 videos (1 preview, 9 full)
- **Course 3 (Data Science):** 6 videos (1 preview, 5 full)
- **Course 5 (React Native):** 3 videos (1 preview, 2 full)

#### Materials
- React Cheat Sheet (PDF)
- Week 1 Lecture Notes (PDF)
- React Project Templates (DOC)
- Python Data Science Handbook (PDF)
- NumPy & Pandas Exercises (PDF)

#### Quizzes
1. **React Fundamentals Quiz** (Course 1)
   - 5 questions
   - Total points: 50
   - Passing score: 60%
   - Time limit: 30 minutes

2. **Python Data Science Quiz** (Course 3)
   - 3 questions
   - Total points: 45
   - Passing score: 60%
   - Time limit: 25 minutes

#### Assignments
1. **Build a React Todo Application** (Course 1)
   - Due: 14 days from seeding
   - Points: 100
   - Status: 2 submissions (1 graded: 95/100, 1 pending)

2. **Data Analysis Project** (Course 3)
   - Due: 21 days from seeding
   - Points: 100

### Student Progress & Activity

#### Enrollments (10 total)
- Student 1: Enrolled in React Bootcamp & Data Science
- Student 2: Enrolled in React Bootcamp & React Native
- Student 3: Enrolled in React Bootcamp & UI/UX Design
- Student 4: Enrolled in Data Science
- Student 5: Enrolled in Data Science
- Student 6: Enrolled in React Native
- Student 7: Enrolled in UI/UX Design

#### Progress Tracking
- **Student 1 - React Course:** 100% complete (all 10 videos watched)
- **Student 2 - React Course:** 60% complete (6 videos watched)
- **Student 1 - Data Science Course:** 75% complete (5 videos watched)

#### Quiz Submissions
- **Student 1 - React Quiz:** Passed (100% - 50/50 points)
- **Student 2 - React Quiz:** Failed (40% - 20/50 points)
- **Student 1 - Data Science Quiz:** Passed (100% - 45/45 points)

#### Assignment Submissions
- **Student 1 - Todo App:** Submitted & Graded (95/100)
- **Student 2 - Todo App:** Submitted (Pending grading)

#### Certificates
- **Student 1:** Certificate for completing React Development Bootcamp (100% completion)

#### Payments
- 10 payment records created (all completed)
- Transaction IDs generated for each enrollment
- Payment dates vary (simulating enrollments over time)

### Admin Activity Logs
- 3 activity log entries
- Subject creation
- Course approval
- User profile update

---

## Key Features Demonstrated

✅ **Multiple Teachers Per Subject** - Web Development and Data Science subjects have multiple teachers teaching different courses

✅ **Complete Course Structure** - Videos, materials, quizzes, and assignments

✅ **Student Enrollments** - Students enrolled in courses with payment records

✅ **Progress Tracking** - Video watching progress and completion percentages

✅ **Quiz System** - Quiz submissions with automatic grading

✅ **Assignment System** - Assignment submissions with teacher grading

✅ **Certificates** - Auto-generated certificates for completed courses

✅ **Payment Records** - Complete payment history for enrollments

✅ **Admin Activity Logs** - Track admin actions

---

## Testing Scenarios

### As Admin
1. Login: `admin@test.com` / `admin123`
2. View dashboard statistics
3. Manage users, courses, subjects
4. View activity logs

### As Teacher
1. Login: `ahmed.khan@test.com` / `teacher123`
2. View your courses
3. See enrolled students
4. Grade assignments
5. View course analytics

### As Student
1. Login: `student1@test.com` / `student123`
2. View enrolled courses
3. Watch videos (progress tracked)
4. Take quizzes
5. Submit assignments
6. View grades and certificates
7. See progress bars

---

## Notes

- All passwords are hashed using bcrypt
- Video URLs use sample videos from Google Cloud Storage (for testing)
- Material file URLs are placeholders (actual files need to be uploaded)
- Payment system uses mock transactions
- Certificates have verification codes for validation
- Progress tracking is automatically calculated based on video completion

---

## Re-running the Seeder

To reset and re-seed the database:

```bash
npm run seed
```

**Warning:** This will delete all existing data and create fresh test data!
