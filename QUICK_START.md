# 🚀 Quick Start Guide - TechBuddySpace

Get your internship management system up and running in 5 minutes!

---

## ⚡ Prerequisites

- Node.js 18+ installed
- MongoDB installed locally OR MongoDB Atlas account
- Git installed

---

## 📦 Step 1: Installation

```bash
# Clone or navigate to your project
cd techbuddyspace

# Install dependencies
npm install
```

---

## 🔧 Step 2: Environment Setup

Create a `.env.local` file in the root directory:

```env
# MongoDB Connection
MONGODB_URI=mongodb://localhost:27017/techbuddyspace
# OR for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/techbuddyspace

# JWT Secret (generate a random string)
JWT_SECRET=your-super-secret-jwt-key-change-this

# Admin Credentials (for initial login)
ADMIN_USERNAME=admin
ADMIN_PASSWORD=techbuddy2024

# Email Configuration (optional for now)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# Cloudflare R2 Storage (optional for now)
R2_ACCOUNT_ID=your-account-id
R2_ACCESS_KEY_ID=your-access-key
R2_SECRET_ACCESS_KEY=your-secret-key
R2_BUCKET_NAME=your-bucket-name

# OpenAI API (optional - for AI features)
OPENAI_API_KEY=your-openai-key
```

---

## 🏃 Step 3: Start Development Server

```bash
npm run dev
```

Your app will be running at `http://localhost:3000`

---

## 🎯 Step 4: Access the System

### Admin Dashboard
1. Go to: `http://localhost:3000/admin`
2. Login with:
   - Username: `admin`
   - Password: `techbuddy2024`
3. Explore admin features:
   - Create tasks
   - View leaderboard
   - Manage attendance
   - Approve leaves

### Intern Dashboard
1. Go to: `http://localhost:3000/intern/dashboard`
2. Note: Currently uses mock user ID
3. Features available:
   - View tasks
   - Check-in/out
   - Apply for leave
   - View performance
   - See leaderboard

---

## 📝 Step 5: Create Your First Task

1. Go to `/admin/tasks`
2. Click "Create New Task"
3. Fill in:
   - Title: "Welcome Task"
   - Description: "Complete your profile"
   - Assigned To: "intern_user_id" (use actual user ID later)
   - Priority: "Medium"
   - Deadline: Tomorrow's date
4. Click "Create Task"

---

## 👤 Step 6: Setup User Authentication (Important!)

Currently, the system uses mock user IDs. To enable real authentication:

### Create User Registration API

```javascript
// app/api/auth/register/route.js
import { NextResponse } from 'next/server';
import { getCollection, Collections } from '@/lib/models';
import bcrypt from 'bcryptjs';

export async function POST(request) {
  try {
    const { email, password, name, role, department } = await request.json();
    
    const usersCollection = await getCollection(Collections.USERS);
    
    // Check if user exists
    const existing = await usersCollection.findOne({ email });
    if (existing) {
      return NextResponse.json(
        { success: false, error: 'User already exists' },
        { status: 400 }
      );
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create user
    const result = await usersCollection.insertOne({
      email,
      password: hashedPassword,
      name,
      role: role || 'intern',
      department,
      joinDate: new Date(),
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    
    return NextResponse.json({
      success: true,
      userId: result.insertedId,
      message: 'User registered successfully',
    });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { success: false, error: 'Registration failed' },
      { status: 500 }
    );
  }
}
```

### Create Login API

```javascript
// app/api/auth/login/route.js
import { NextResponse } from 'next/server';
import { getCollection, Collections } from '@/lib/models';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export async function POST(request) {
  try {
    const { email, password } = await request.json();
    
    const usersCollection = await getCollection(Collections.USERS);
    
    // Find user
    const user = await usersCollection.findOne({ email });
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Invalid credentials' },
        { status: 401 }
      );
    }
    
    // Verify password
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return NextResponse.json(
        { success: false, error: 'Invalid credentials' },
        { status: 401 }
      );
    }
    
    // Generate JWT
    const token = jwt.sign(
      { userId: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    // Set cookie
    const response = NextResponse.json({
      success: true,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
    
    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });
    
    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, error: 'Login failed' },
      { status: 500 }
    );
  }
}
```

---

## 🧪 Step 7: Test the System

### Test Task Management
```bash
# Create a task
curl -X POST http://localhost:3000/api/tasks \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Task",
    "description": "Testing the system",
    "assignedTo": "test_user_id",
    "createdBy": "admin",
    "priority": "High",
    "deadline": "2026-04-10T00:00:00.000Z"
  }'

# Get all tasks
curl http://localhost:3000/api/tasks
```

### Test Attendance
```bash
# Check-in
curl -X POST http://localhost:3000/api/attendance \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "test_user_id",
    "action": "checkin",
    "location": "Office"
  }'

# Check-out
curl -X POST http://localhost:3000/api/attendance \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "test_user_id",
    "action": "checkout"
  }'
```

### Test Performance Calculation
```bash
curl -X POST http://localhost:3000/api/performance \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "test_user_id"
  }'
```

---

## 📊 Step 8: Setup MongoDB Indexes (Recommended)

Run these commands in MongoDB shell or Compass:

```javascript
// Connect to your database
use techbuddyspace

// Create indexes for better performance
db.users.createIndex({ email: 1 }, { unique: true })
db.tasks.createIndex({ assignedTo: 1 })
db.tasks.createIndex({ status: 1 })
db.tasks.createIndex({ deadline: 1 })
db.attendance.createIndex({ userId: 1, date: 1 })
db.performance.createIndex({ userId: 1 }, { unique: true })
db.leaves.createIndex({ userId: 1 })
db.notifications.createIndex({ userId: 1, read: 1 })
```

---

## 🎨 Step 9: Customize (Optional)

### Change Color Scheme
Edit `app/globals.css` to customize colors:

```css
:root {
  --primary-color: #3b82f6; /* Blue */
  --secondary-color: #8b5cf6; /* Purple */
  --success-color: #10b981; /* Green */
  --warning-color: #f59e0b; /* Orange */
  --danger-color: #ef4444; /* Red */
}
```

### Update Branding
1. Replace logo in `public/` folder
2. Update company name in admin dashboard
3. Customize email templates

---

## 🐛 Troubleshooting

### MongoDB Connection Error
```bash
# Check if MongoDB is running
mongod --version

# Start MongoDB (if installed locally)
mongod

# OR use MongoDB Atlas connection string
```

### Port Already in Use
```bash
# Kill process on port 3000
npx kill-port 3000

# OR use different port
npm run dev -- -p 3001
```

### Module Not Found
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Build Errors
```bash
# Check for TypeScript/ESLint errors
npm run lint

# Build the project
npm run build
```

---

## 📚 Next Steps

1. **Read Documentation:**
   - `README.md` - Full specifications
   - `IMPLEMENTATION_GUIDE.md` - Implementation details
   - `API_DOCUMENTATION.md` - API reference
   - `SYSTEM_OVERVIEW.md` - System architecture

2. **Implement Authentication:**
   - Create user registration page
   - Add login page
   - Implement JWT middleware
   - Add protected routes

3. **Add More Features:**
   - AI evaluation integration
   - Badge system
   - Chat functionality
   - Report generation

4. **Deploy to Production:**
   - Deploy to Vercel/Netlify
   - Setup production MongoDB
   - Configure environment variables
   - Setup custom domain

---

## 🎯 Common Tasks

### Add a New Intern
```javascript
// Use registration API or directly in MongoDB
{
  email: "intern@example.com",
  password: "hashed_password",
  name: "John Doe",
  role: "intern",
  department: "Development",
  joinDate: new Date(),
  status: "active"
}
```

### Create a Position
```javascript
// In MongoDB positions collection
{
  title: "Design Lead",
  department: "design",
  description: "Lead the design team",
  minScore: 80,
  requiredTasks: 10,
  requiredSkills: ["UI/UX", "Figma"],
  isActive: true,
  maxSlots: 1
}
```

### Award a Badge
```javascript
// In MongoDB user_badges collection
{
  userId: "user_id",
  badgeId: "badge_id",
  earnedAt: new Date(),
  reason: "Completed 10 tasks on time"
}
```

---

## 💡 Pro Tips

1. **Use MongoDB Compass** for easy database management
2. **Install Postman** for API testing
3. **Use React DevTools** for debugging
4. **Enable hot reload** for faster development
5. **Check browser console** for errors
6. **Use environment variables** for sensitive data
7. **Backup database** regularly
8. **Test on mobile devices** for responsiveness

---

## 🆘 Need Help?

- Check the documentation files
- Review API responses for error messages
- Check MongoDB connection
- Verify environment variables
- Look at browser console for errors
- Check server logs in terminal

---

## 🎉 You're All Set!

Your TechBuddySpace Internship Management System is now running!

Start by:
1. Creating some test users
2. Assigning tasks
3. Testing attendance
4. Viewing the leaderboard

Happy coding! 🚀

---

**Last Updated:** April 5, 2026
