# MongoDB Setup Guide

## Option 1: MongoDB Atlas (Cloud - Recommended for Development)

### Step 1: Create MongoDB Atlas Account
1. Go to [https://www.mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Click "Try Free" or "Sign Up"
3. Create your account

### Step 2: Create a Cluster
1. After signing in, click "Build a Database"
2. Choose the **FREE** tier (M0 Sandbox)
3. Select a cloud provider and region (choose closest to you)
4. Click "Create Cluster"
5. Wait 3-5 minutes for cluster to be created

### Step 3: Create Database User
1. In the Security section, click "Database Access"
2. Click "Add New Database User"
3. Choose "Password" authentication
4. Enter username and password (save these!)
5. Set user privileges to "Atlas admin" or "Read and write to any database"
6. Click "Add User"

### Step 4: Whitelist Your IP Address
1. In the Security section, click "Network Access"
2. Click "Add IP Address"
3. Click "Allow Access from Anywhere" (for development) or add your specific IP
4. Click "Confirm"

### Step 5: Get Connection String
1. Click "Database" in the left sidebar
2. Click "Connect" on your cluster
3. Choose "Connect your application"
4. Select "Node.js" as driver
5. Copy the connection string (looks like: `mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority`)

### Step 6: Update .env File
Replace the connection string in your `backend/.env` file:

```env
MONGODB_URI=mongodb+srv://your-username:your-password@cluster0.xxxxx.mongodb.net/online-teaching-platform?retryWrites=true&w=majority
```

**Important:** Replace:
- `your-username` with your database username
- `your-password` with your database password
- `cluster0.xxxxx` with your actual cluster name
- Add database name: `/online-teaching-platform` before the `?`

---

## Option 2: Local MongoDB Installation

### For Windows:

1. **Download MongoDB Community Server**
   - Go to [https://www.mongodb.com/try/download/community](https://www.mongodb.com/try/download/community)
   - Select Windows, MSI package
   - Download and run the installer

2. **Install MongoDB**
   - Run the installer
   - Choose "Complete" installation
   - Check "Install MongoDB as a Service"
   - Check "Install MongoDB Compass" (GUI tool)
   - Click "Install"

3. **Verify Installation**
   - Open Command Prompt or PowerShell
   - Run: `mongod --version`
   - You should see MongoDB version information

4. **Start MongoDB Service**
   - MongoDB should start automatically as a Windows service
   - If not, open Services (Win+R, type `services.msc`)
   - Find "MongoDB" service and start it

5. **Update .env File**
   ```env
   MONGODB_URI=mongodb://localhost:27017/online-teaching-platform
   ```

### For macOS:

1. **Install using Homebrew** (recommended)
   ```bash
   brew tap mongodb/brew
   brew install mongodb-community
   ```

2. **Start MongoDB**
   ```bash
   brew services start mongodb-community
   ```

3. **Verify Installation**
   ```bash
   mongod --version
   ```

4. **Update .env File**
   ```env
   MONGODB_URI=mongodb://localhost:27017/online-teaching-platform
   ```

### For Linux (Ubuntu/Debian):

1. **Import MongoDB GPG Key**
   ```bash
   curl -fsSL https://pgp.mongodb.com/server-7.0.asc | sudo gpg -o /usr/share/keyrings/mongodb-server-7.0.gpg --dearmor
   ```

2. **Add MongoDB Repository**
   ```bash
   echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list
   ```

3. **Install MongoDB**
   ```bash
   sudo apt-get update
   sudo apt-get install -y mongodb-org
   ```

4. **Start MongoDB**
   ```bash
   sudo systemctl start mongod
   sudo systemctl enable mongod
   ```

5. **Update .env File**
   ```env
   MONGODB_URI=mongodb://localhost:27017/online-teaching-platform
   ```

---

## Verify MongoDB Connection

After setting up MongoDB, test the connection:

1. **Start your backend server:**
   ```bash
   cd backend
   npm run dev
   ```

2. **Look for this message in the console:**
   ```
   MongoDB Connected: ...
   ```

3. **If you see connection errors:**
   - Check your `.env` file has the correct `MONGODB_URI`
   - For Atlas: Verify username, password, and IP whitelist
   - For Local: Make sure MongoDB service is running

---

## Quick Test (Optional)

You can test MongoDB connection using MongoDB Compass or mongo shell:

**Using MongoDB Compass:**
- Download from [https://www.mongodb.com/products/compass](https://www.mongodb.com/products/compass)
- Connect using your connection string

**Using mongo shell:**
```bash
mongosh "mongodb://localhost:27017/online-teaching-platform"
```

---

## Troubleshooting

### Connection Timeout (Atlas)
- Check IP whitelist includes your current IP
- Verify username and password are correct
- Check network firewall settings

### Connection Refused (Local)
- Make sure MongoDB service is running
- Check if port 27017 is available
- Verify MongoDB is installed correctly

### Authentication Failed
- Double-check username and password
- Ensure special characters in password are URL-encoded
- For Atlas, verify user has proper permissions

