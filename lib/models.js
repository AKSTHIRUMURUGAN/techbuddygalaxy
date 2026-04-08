// Database Models and Schemas for TechBuddySpace Internship Management System

export const Collections = {
  USERS: 'users',
  TASKS: 'tasks',
  PERFORMANCE: 'performance',
  ATTENDANCE: 'attendance',
  LEAVES: 'leaves',
  OD_REQUESTS: 'od_requests',
  POSITIONS: 'positions',
  POSITION_RECOMMENDATIONS: 'position_recommendations',
  BADGES: 'badges',
  USER_BADGES: 'user_badges',
  NOTIFICATIONS: 'notifications',
  MESSAGES: 'messages',
  REPORTS: 'reports',
  APPLICATIONS: 'applications',
};

// User Schema
export const UserSchema = {
  email: String,
  password: String, // hashed
  name: String,
  role: String, // 'admin', 'intern', 'team_lead'
  department: String,
  joinDate: Date,
  profileImage: String,
  skills: Array,
  phone: String,
  status: String, // 'active', 'inactive'
  createdAt: Date,
  updatedAt: Date,
};

// Task Schema
export const TaskSchema = {
  title: String,
  description: String,
  assignedTo: String, // userId
  createdBy: String, // adminId
  status: String, // 'Pending', 'In Progress', 'Completed', 'Overdue'
  priority: String, // 'Low', 'Medium', 'High', 'Urgent'
  deadline: Date,
  startDate: Date,
  completedDate: Date,
  subtasks: Array, // [{title, status, assignedTo}]
  attachments: Array, // [{name, url, uploadedAt}]
  notes: Array, // [{text, createdBy, createdAt}]
  progress: Number, // 0-100
  aiScore: Number,
  aiFeedback: String,
  tags: Array,
  estimatedHours: Number,
  actualHours: Number,
  createdAt: Date,
  updatedAt: Date,
};

// Performance Schema
export const PerformanceSchema = {
  userId: String,
  performanceScore: Number, // 0-100
  speedScore: Number, // 0-100
  qualityScore: Number, // 0-100
  consistencyScore: Number, // 0-100
  attendanceScore: Number, // 0-100
  avgQuality: Number,
  onTimeRate: Number, // 0-1
  attendanceRate: Number, // 0-1
  tasksCompleted: Number,
  tasksOnTime: Number,
  totalTasks: Number,
  avgCompletionTime: Number, // in hours
  lastCalculated: Date,
  monthlyScores: Array, // [{month, year, score}]
  createdAt: Date,
  updatedAt: Date,
};

// Attendance Schema
export const AttendanceSchema = {
  userId: String,
  date: Date,
  checkIn: Date,
  checkOut: Date,
  totalHours: Number,
  status: String, // 'Present', 'Late', 'Absent', 'Half Day', 'On Leave', 'On Duty'
  location: String,
  notes: String,
  createdAt: Date,
  updatedAt: Date,
};

// Leave Schema
export const LeaveSchema = {
  userId: String,
  type: String, // 'Sick Leave', 'Casual Leave', 'Emergency Leave'
  fromDate: Date,
  toDate: Date,
  totalDays: Number,
  reason: String,
  status: String, // 'Pending', 'Approved', 'Rejected'
  approvedBy: String,
  approvedAt: Date,
  rejectionReason: String,
  createdAt: Date,
  updatedAt: Date,
};

// OD (On Duty) Schema
export const ODSchema = {
  userId: String,
  date: Date,
  reason: String,
  location: String,
  proof: String, // file URL
  status: String, // 'Pending', 'Approved', 'Rejected'
  approvedBy: String,
  approvedAt: Date,
  rejectionReason: String,
  createdAt: Date,
  updatedAt: Date,
};

// Position Schema
export const PositionSchema = {
  title: String,
  department: String,
  description: String,
  minScore: Number, // minimum performance score required
  requiredTasks: Number, // minimum tasks completed
  requiredSkills: Array,
  responsibilities: Array,
  benefits: Array,
  isActive: Boolean,
  currentHolders: Array, // userIds
  maxSlots: Number,
  createdAt: Date,
  updatedAt: Date,
};

// Position Recommendation Schema
export const PositionRecommendationSchema = {
  userId: String,
  recommendedRole: String,
  positionId: String,
  reason: String,
  performanceScore: Number,
  tasksCompleted: Number,
  skills: Array,
  status: String, // 'Pending', 'Approved', 'Rejected'
  reviewedBy: String,
  reviewedAt: Date,
  notes: String,
  createdAt: Date,
  updatedAt: Date,
};

// Badge Schema
export const BadgeSchema = {
  name: String,
  description: String,
  icon: String,
  criteria: Object, // {type, value}
  rarity: String, // 'Common', 'Rare', 'Epic', 'Legendary'
  points: Number,
  isActive: Boolean,
  createdAt: Date,
};

// User Badge Schema
export const UserBadgeSchema = {
  userId: String,
  badgeId: String,
  earnedAt: Date,
  reason: String,
};

// Notification Schema
export const NotificationSchema = {
  userId: String,
  title: String,
  message: String,
  type: String, // 'task', 'alert', 'message', 'leave', 'badge', 'performance'
  link: String,
  read: Boolean,
  priority: String, // 'low', 'medium', 'high'
  createdAt: Date,
};

// Message Schema
export const MessageSchema = {
  senderId: String,
  receiverId: String,
  message: String,
  attachments: Array,
  read: Boolean,
  conversationId: String,
  createdAt: Date,
};

// Report Schema
export const ReportSchema = {
  userId: String,
  type: String, // 'internship', 'performance', 'attendance'
  period: Object, // {from, to}
  data: Object,
  generatedBy: String,
  fileUrl: String,
  createdAt: Date,
};

// Helper function to calculate performance score
export function calculatePerformanceScore(metrics) {
  const {
    speedScore = 0,
    qualityScore = 0,
    consistencyScore = 0,
    attendanceScore = 0,
  } = metrics;

  return (
    speedScore * 0.25 +
    qualityScore * 0.4 +
    consistencyScore * 0.15 +
    attendanceScore * 0.2
  );
}

// Helper function to calculate leaderboard rank score
export function calculateRankScore(performanceScore, tasksCompleted, consistencyScore) {
  return (
    performanceScore * 0.5 +
    tasksCompleted * 0.3 +
    consistencyScore * 0.2
  );
}

// Helper function to check badge eligibility
export function checkBadgeEligibility(user, performance, badge) {
  const { criteria } = badge;
  
  switch (criteria.type) {
    case 'tasks_completed':
      return performance.tasksCompleted >= criteria.value;
    case 'performance_score':
      return performance.performanceScore >= criteria.value;
    case 'on_time_rate':
      return performance.onTimeRate >= criteria.value;
    case 'attendance_rate':
      return performance.attendanceRate >= criteria.value;
    case 'quality_score':
      return performance.qualityScore >= criteria.value;
    default:
      return false;
  }
}
