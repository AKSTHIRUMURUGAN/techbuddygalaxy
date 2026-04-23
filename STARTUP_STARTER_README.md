# Startup Starter Event System

A complete event management system for the "Startup Starter" bootcamp with registration, QR code ticketing, and attendance tracking.

## Features

### Landing Page (`/startup-starter`)
- Beautiful gradient design with event information
- Registration form with validation
- Real-time form submission
- Automatic email confirmation with QR ticket

### Admin Panel (`/admin/startup-starter`)
- View all registrations
- Real-time statistics dashboard
- QR code scanner for:
  - Entry verification
  - Morning attendance
  - Evening attendance
- Export to Excel/PDF
- Filter and search functionality
- OD eligibility tracking

### Email System
- Automatic confirmation emails
- QR code ticket generation
- Event details and instructions
- Professional HTML email template

## Installation

### 1. Install Required Dependencies

```bash
npm install mongoose qrcode jspdf jspdf-autotable xlsx
```

### 2. Environment Variables

Add to your `.env.local`:

```env
# MongoDB (Use MongoDB Atlas - Free Tier)
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/techbuddyspace?retryWrites=true&w=majority

# Email (Gmail with App Password)
EMAIL_USER=your-email@gmail.com
EMAIL_APP_PASSWORD=your-16-character-app-password

# NextAuth (if not already set)
NEXTAUTH_SECRET=your-secret-key
NEXTAUTH_URL=http://localhost:3000
```

### 3. Database Setup

The MongoDB schema will be created automatically when the first registration is made. No manual setup required.

## Usage

### For Students

1. Visit `/startup-starter`
2. Fill out the registration form
3. Submit and receive confirmation email with QR ticket
4. Save the QR code for event entry and attendance

### For Admins

1. Login to admin panel
2. Navigate to `/admin/startup-starter`
3. Use the scanner buttons to verify:
   - **Entry**: Scan when student enters the venue
   - **Morning**: Scan morning attendance
   - **Evening**: Scan evening attendance
4. Export data as needed for OD processing

## QR Code Scanning

The QR code contains:
```json
{
  "ticketId": "SS-1234567890-ABCD1234",
  "name": "Student Name",
  "email": "student@college.edu",
  "rollNo": "21CS001"
}
```

### Scanning Process

1. Click appropriate scan button (Entry/Morning/Evening)
2. Enter the ticket ID manually or scan QR code
3. System validates and marks attendance
4. Prevents duplicate scans

## OD Eligibility

Students are eligible for OD if:
- ✅ Entry verified
- ✅ Morning attendance marked
- ✅ Evening attendance marked

## Data Export

### Excel Export
- Complete registration data
- Attendance status
- OD eligibility
- Timestamps for all scans

### PDF Export
- Summary report
- Attendance matrix
- Suitable for official records

## API Endpoints

### POST `/api/startup-starter/register`
Register a new participant

**Body:**
```json
{
  "name": "Student Name",
  "email": "student@college.edu",
  "rollNo": "21CS001",
  "department": "Computer Science",
  "phoneNo": "9876543210",
  "college": "REC"
}
```

### GET `/api/startup-starter/registrations`
Get all registrations (Admin only)

### POST `/api/startup-starter/verify`
Verify attendance (Admin only)

**Body:**
```json
{
  "ticketId": "SS-1234567890-ABCD1234",
  "scanType": "entry" | "morning" | "evening"
}
```

## Database Schema

```javascript
{
  ticketId: String (unique),
  name: String,
  email: String (unique),
  rollNo: String,
  department: String,
  phoneNo: String,
  college: String,
  registeredAt: Date,
  entryVerified: Boolean,
  entryVerifiedAt: Date,
  morningAttendance: Date,
  eveningAttendance: Date,
  createdAt: Date,
  updatedAt: Date
}
```

## File Structure

```
app/
├── startup-starter/
│   └── page.js                          # Landing page
├── admin/
│   └── startup-starter/
│       └── page.js                      # Admin panel
└── api/
    └── startup-starter/
        ├── register/
        │   └── route.js                 # Registration API
        ├── registrations/
        │   └── route.js                 # Get all registrations
        └── verify/
            └── route.js                 # Verify attendance

models/
└── StartupStarterRegistration.js        # MongoDB schema

lib/
└── dbConnect.js                         # MongoDB connection
```

## Security Features

- Admin authentication required for all admin endpoints
- Email validation and uniqueness check
- Duplicate registration prevention
- Duplicate attendance prevention
- Secure ticket ID generation

## Troubleshooting

### Email not sending
- Check SMTP credentials
- For Gmail, use App Password (not regular password)
- Enable "Less secure app access" if needed

### MongoDB connection issues
- Verify MONGODB_URI is correct
- Ensure MongoDB is running
- Check network connectivity

### QR code not generating
- Ensure `qrcode` package is installed
- Check email template rendering

## Future Enhancements

- [ ] Mobile QR scanner app
- [ ] Real-time attendance dashboard
- [ ] SMS notifications
- [ ] Certificate generation
- [ ] Team formation system
- [ ] Pitch deck submission portal

## Support

For issues or questions, contact: support@techbuddyspace.com
