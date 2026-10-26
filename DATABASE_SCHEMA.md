# Database Schema - On-Demand Tutoring Platform

## Overview
This schema supports instant, on-demand tutoring sessions with wallet system, credit scoring, and availability management.

## Collections

### users (extends better-auth user collection)
```javascript
{
  _id: ObjectId,
  // better-auth fields
  email: String,
  name: String,
  role: String, // 'student' | 'teacher' | 'admin'
  
  // Student-specific fields
  wallet: {
    balance: Number, // default: 0
    currency: String, // 'BDT'
    transactions: [{
      _id: ObjectId,
      type: String, // 'credit' | 'debit' | 'refund' | 'bonus'
      amount: Number,
      description: String,
      sessionId: ObjectId (optional),
      createdAt: Date
    }]
  },
  firstSessionDiscountUsed: Boolean, // default: false
  discountPairings: [{
    teacherId: ObjectId,
    usedAt: Date
  }],
  
  // Teacher-specific fields
  verificationStatus: String, // 'pending' | 'verified' | 'rejected'
  verificationDocuments: {
    nidNumber: String,
    nidImage: String, // URL
    credentials: [{
      type: String, // 'degree' | 'certificate' | 'experience'
      institution: String,
      year: Number,
      documentUrl: String
    }]
  },
  creditScore: {
    score: Number, // 0-100, default: 100
    history: [{
      sessionId: ObjectId,
      action: String, // 'on_time' | 'late' | 'no_show' | 'dispute_won' | 'dispute_lost'
      scoreChange: Number,
      newScore: Number,
      timestamp: Date,
      reason: String
    }]
  },
  isActive: Boolean, // default: true (can go inactive)
  earnings: {
    total: Number,
    available: Number,
    withdrawn: Number
  },
  
  createdAt: Date,
  updatedAt: Date
}
```

### teachers (teacher profiles)
```javascript
{
  _id: ObjectId,
  userId: ObjectId, // reference to users._id
  tutorName: String,
  tutorEmail: String,
  tutorImage: String,
  bio: String,
  location: String,
  teachingMethod: String, // 'Online Live Classes' | 'Offline (In-Person)' | 'Hybrid'
  
  // Expertise
  subjects: [{
    subject: String,
    topics: [String], // specific topics within subject
    hourlyRate: Number,
    perTopicRate: Number
  }],
  
  // Availability
  availability: {
    isActive: Boolean, // default: true
    timezone: String, // 'Asia/Dhaka'
    regularSlots: [{
      dayOfWeek: Number, // 0-6 (Sunday-Saturday)
      startTime: String, // '09:00'
      endTime: String, // '17:00'
      isShiftBased: Boolean // for coverage
    }],
    instantAvailability: {
      enabled: Boolean,
      currentStatus: String, // 'available' | 'busy' | 'offline'
      lastUpdated: Date
    }
  },
  
  // Stats
  stats: {
    totalSessions: Number,
    completedSessions: Number,
    cancelledSessions: Number,
    averageRating: Number,
    totalReviews: Number
  },
  
  status: String, // 'pending' | 'approved' | 'suspended'
  createdAt: Date,
  updatedAt: Date
}
```

### sessions (booking sessions)
```javascript
{
  _id: ObjectId,
  sessionId: String, // unique session identifier
  
  // Participants
  studentId: ObjectId,
  teacherId: ObjectId,
  
  // Session details
  type: String, // 'instant' | 'scheduled'
  subject: String,
  topic: String,
  duration: Number, // minutes
  rateType: String, // 'hourly' | 'per_topic'
  rate: Number,
  totalCost: Number,
  
  // Timing
  scheduledTime: Date,
  bookingTime: Date,
  actualStartTime: Date,
  actualEndTime: Date,
  
  // Status tracking
  status: String, // 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'no_show' | 'disputed'
  joinTracking: {
    teacherJoinedAt: Date,
    studentJoinedAt: Date,
    teacherOnTime: Boolean, // joined within 5 minutes
    studentOnTime: Boolean
  },
  
  // Payment
  payment: {
    status: String, // 'pending' | 'paid' | 'refunded' | 'disputed'
    amount: Number,
    discountApplied: Number,
    discountType: String, // 'first_session' | 'none'
    transactionId: ObjectId
  },
  
  // Session content
  sessionData: {
    recordingUrl: String, // with consent
    whiteboardData: Object,
    sharedPhotos: [{
      url: String,
      uploadedBy: String, // 'student' | 'teacher'
      timestamp: Date,
      isAcademic: Boolean
    }]
  },
  
  // Reviews
  review: {
    rating: Number, // 1-5
    comment: String,
    submittedAt: Date
  },
  
  // Dispute
  dispute: {
    status: String, // 'none' | 'pending' | 'resolved'
    raisedBy: String, // 'student' | 'teacher'
    reason: String,
    evidence: [String], // URLs
    resolution: String,
    resolvedAt: Date
  },
  
  createdAt: Date,
  updatedAt: Date
}
```

### availability_slots (teacher availability management)
```javascript
{
  _id: ObjectId,
  teacherId: ObjectId,
  date: Date,
  slots: [{
    startTime: String,
    endTime: String,
    status: String, // 'available' | 'booked' | 'blocked'
    bookedBy: ObjectId (optional), // studentId
    sessionId: ObjectId (optional)
  }],
  createdAt: Date,
  updatedAt: Date
}
```

### disputes (dispute management)
```javascript
{
  _id: ObjectId,
  sessionId: ObjectId,
  raisedBy: ObjectId, // userId
  againstUser: ObjectId, // userId
  type: String, // 'payment' | 'behavior' | 'quality' | 'technical'
  description: String,
  status: String, // 'pending' | 'investigating' | 'resolved' | 'rejected'
  evidence: [{
    type: String, // 'image' | 'video' | 'text'
    url: String,
    description: String
  }],
  resolution: {
    action: String, // 'refund' | 'partial_refund' | 'no_action' | 'penalty'
    amount: Number,
    reason: String,
    resolvedBy: ObjectId, // adminId
    resolvedAt: Date
  },
  createdAt: Date,
  updatedAt: Date
}
```

### notifications (user notifications)
```javascript
{
  _id: ObjectId,
  userId: ObjectId,
  type: String, // 'booking_confirmed' | 'session_reminder' | 'session_started' | 'payment_received' | 'review_request'
  title: String,
  message: String,
  data: Object, // additional context
  read: Boolean,
  createdAt: Date
}
```

## Indexes

### users
- `email` (unique)
- `role`
- `verificationStatus`

### teachers  
- `userId` (unique)
- `status`
- `availability.isActive`
- `availability.instantAvailability.currentStatus`

### sessions
- `studentId`
- `teacherId`
- `status`
- `scheduledTime`
- `sessionId` (unique)

### availability_slots
- `teacherId`
- `date`
- `slots.status`

### disputes
- `sessionId`
- `raisedBy`
- `status`

## Key Relationships

1. **User → Teacher**: One-to-one (teachers are users with role='teacher')
2. **User → Wallet**: One-to-one (embedded in user document)
3. **Teacher → Sessions**: One-to-many
4. **Student → Sessions**: One-to-many  
5. **Session → Dispute**: One-to-one (optional)
6. **Session → Review**: One-to-one (optional)
7. **Teacher → Availability Slots**: One-to-many

## Business Logic Notes

### Credit Score System
- Initial score: 100
- On-time join: +2 points
- Late join (5-10 min): -5 points
- No-show: -20 points
- Dispute won: +5 points
- Dispute lost: -10 points
- Score below 70: Warning
- Score below 50: Suspension

### Wallet System
- Must have sufficient balance before booking
- Payment deducted at booking confirmation
- Refund if teacher no-show
- Teacher payout after session completion

### Instant Booking
- Teacher must join within 5 minutes
- Auto-cancel if teacher doesn't join
- Student no-show after 5 min releases teacher

### Anti-Abuse
- Track discount pairings between student-teacher
- Prevent repeated first-session discounts
- Flag suspicious patterns
