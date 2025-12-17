# Setup Instructions - Online Teaching Platform

## ✅ Step 1: MongoDB Atlas Setup (COMPLETED!)
Great! You've successfully created your MongoDB Atlas cluster. Your connection string is ready.

## 📝 Step 2: Create Backend .env File

**IMPORTANT:** Create a file named `.env` in the `backend` folder with the following content:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# MongoDB Configuration
# Your MongoDB Atlas connection string (replace with your actual credentials)
MONGODB_URI=mongodb+srv://your-username:your-password@cluster0.xxxxx.mongodb.net/online-teaching-platform?retryWrites=true&w=majority

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-make-it-long-and-random-123456789
JWT_EXPIRE=7d

# Frontend URL
FRONTEND_URL=http://localhost:5173

# File Upload Configuration
MAX_FILE_SIZE=104857600
UPLOAD_PATH=./uploads
```

**How to create the file:**
1. Navigate to the `backend` folder
2. Create a new file named `.env` (make sure it starts with a dot)
3. Copy and paste the content above
4. Save the file

## 📦 Step 3: Install Dependencies

### Backend Dependencies:
```bash
cd backend
npm install
```

### Frontend Dependencies:
```bash
cd frontend
npm install
```

## 🚀 Step 4: Start the Application

### Terminal 1 - Start Backend:
```bash
cd backend
npm run dev
```

You should see:
```
Server running in development mode on port 5000
MongoDB Connected: cluster0-shard-00-00.xxxxx.mongodb.net
```

### Terminal 2 - Start Frontend:
```bash
cd frontend
npm run dev
```

You should see:
```
VITE v5.x.x  ready in xxx ms

➜  Local:   http://localhost:5173/
```

## ✅ Step 5: Verify Everything Works

1. **Open your browser** and go to: `http://localhost:5173`
2. You should see the **Landing Page** of the Online Teaching Platform
3. Try clicking **"Sign Up"** to create a test account

## 🎯 You're on the Right Track!

Based on your MongoDB Atlas screenshot, you're doing everything correctly:
- ✅ Cluster created (Cluster0)
- ✅ Connection string obtained
- ✅ Sample data loading (optional - you can ignore this)

## 🔍 Important Notes:

1. **IP Whitelist in MongoDB Atlas:**
   - Make sure your IP address is whitelisted in MongoDB Atlas
   - Go to: Network Access → Add IP Address → Allow Access from Anywhere (for development)

2. **Database Name:**
   - The connection string includes `/online-teaching-platform` as the database name
   - MongoDB will create this database automatically when you first connect

3. **JWT Secret:**
   - Change the `JWT_SECRET` in `.env` to a long random string for production
   - For now, the default is fine for development

## 🐛 Troubleshooting:

### If backend won't start:
- Check if port 5000 is already in use
- Verify `.env` file exists and has correct MongoDB URI
- Make sure all dependencies are installed (`npm install`)

### If MongoDB connection fails:
- Verify your IP is whitelisted in MongoDB Atlas
- Check username and password in connection string
- Make sure cluster is running (not paused)

### If frontend won't start:
- Check if port 5173 is already in use
- Verify all dependencies are installed
- Check for any error messages in the terminal

## 📚 Next Steps After Setup:

1. Create your first admin user (via MongoDB or registration)
2. Create subjects/categories
3. Create courses as a teacher
4. Test student enrollment and course access

---

**You're all set! Follow the steps above and you'll have the platform running in no time! 🎉**

