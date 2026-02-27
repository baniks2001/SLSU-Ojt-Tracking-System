# SLSU OJT Tracking System

A comprehensive **On-the-Job Training (OJT) Tracking System** for Southern Leyte State University. This web application allows students to track their daily time records, departments to manage student interns, and administrators to oversee the entire system.

## Features

### Student Features
- **Clock In/Out**: Students can clock in and out with image capture for verification
- **Shift Support**: Regular (morning/afternoon) and Graveyard (evening) shift options
- **Profile Management**: Update personal information and change passwords
- **Attendance Logs**: View and export attendance history
- **DTR Printing**: Generate and print Daily Time Record reports matching Civil Service Form No. 48
- **Announcements**: View department and system-wide announcements

### Department/OJT Advisor Features
- **Student Management**: Accept or reject student registrations
- **Attendance Monitoring**: View student attendance records
- **Announcements**: Post department-specific or system-wide announcements
- **Dashboard Statistics**: Overview of department students and their status

### Admin/SuperAdmin Features
- **Account Management**: Create, activate, deactivate, or delete user accounts
- **Department Management**: Manage department accounts and their advisors
- **Student Management**: View all students and their status
- **Admin Creation**: SuperAdmin can create additional Admin accounts
- **System Overview**: Monitor system statistics and user activity

## Tech Stack

- **Frontend**: Next.js 14 + React + TypeScript + Tailwind CSS
- **UI Components**: shadcn/ui
- **Backend**: Next.js API Routes
- **Database**: MongoDB Atlas
- **Authentication**: JWT-based authentication
- **Styling**: White and Dark Blue color theme (#003366)

## Prerequisites

- Node.js 18+ 
- MongoDB Atlas account
- SMTP email service (for password reset)

## Environment Variables

Create a `.env.local` file with the following:

```env
# MongoDB Connection
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/slsu_ojt_tracking?appName=yourApp

# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here

# Super Admin Credentials (Only one super admin in the system)
SUPER_ADMIN_EMAIL=superadmin@slsu.edu.ph
SUPER_ADMIN_PASSWORD=YourSecurePassword123!

# Email Configuration for Forgot Password
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# App Configuration
APP_NAME=SLSU OJT Tracking System
APP_URL=http://localhost:3000
```

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd slsu-ojt-tracking
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables (see above)

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Default Login Credentials

### Super Admin
- **Email**: superadmin@slsu.edu.ph (as set in .env.local)
- **Password**: As set in SUPER_ADMIN_PASSWORD in .env.local

### Other Accounts
- Register new Department accounts through the registration page
- Students can register and will be approved by their respective department OJT Advisor

## Project Structure

```
src/
├── app/
│   ├── (auth)/           # Authentication pages (login, register, forgot-password)
│   ├── (dashboard)/       # Dashboard pages
│   │   ├── student/       # Student dashboard
│   │   ├── department/    # Department dashboard
│   │   └── admin/         # Admin dashboard
│   ├── api/               # API routes
│   │   ├── auth/          # Authentication API
│   │   ├── users/         # User management API
│   │   ├── students/      # Student management API
│   │   ├── attendance/    # Attendance API
│   │   └── announcements/ # Announcements API
│   └── page.tsx           # Landing page
├── components/
│   ├── ui/                # shadcn/ui components
│   ├── ClockInOut.tsx     # Clock in/out component
│   ├── ProfileForm.tsx    # Profile management
│   ├── AttendanceLogs.tsx # Attendance history
│   ├── DTRTemplate.tsx    # DTR printing template
│   └── Announcements.tsx  # Announcements component
├── lib/
│   ├── db/
│   │   └── mongoose.ts    # MongoDB connection
│   ├── models/            # Database models
│   │   ├── User.ts
│   │   ├── Student.ts
│   │   ├── Department.ts
│   │   ├── Attendance.ts
│   │   ├── Announcement.ts
│   │   └── PasswordReset.ts
│   └── auth/
│       ├── password.ts    # Password hashing
│       └── email.ts       # Email service
└── types/                 # TypeScript types
```

## Database Models

### User
- email, password, accountType (student/department/admin/superadmin), isActive

### Student
- userId, studentId, firstName, lastName, middleName, course, department, location, hostEstablishment, contactNumber, address, ojtAdvisor, shiftType, isAccepted, isActive

### Department
- userId, departmentName, departmentCode, location, contactEmail, contactNumber, ojtAdvisorName, ojtAdvisorPosition, isActive

### Attendance
- studentId, date, morningIn/Out, afternoonIn/Out, eveningIn/Out, images for each, totalHours, undertimeMinutes, status, shiftType

### Announcement
- title, content, department, postedBy, isForAll, isActive

## API Routes

### Authentication
- `POST /api/auth` - Login, Register, Forgot Password

### Users
- `GET /api/users` - Get all users
- `PUT /api/users` - Update user
- `DELETE /api/users` - Delete user

### Students
- `GET /api/students` - Get students with filters
- `PUT /api/students` - Accept/update student
- `DELETE /api/students` - Delete student

### Attendance
- `GET /api/attendance` - Get attendance records
- `POST /api/attendance` - Clock in/out
- `PUT /api/attendance` - Update attendance

### Announcements
- `GET /api/announcements` - Get announcements
- `POST /api/announcements` - Create announcement
- `PUT /api/announcements` - Update announcement
- `DELETE /api/announcements` - Delete announcement

## Building for Production

```bash
npm run build
```

## Deployment

The application can be deployed to Vercel, Netlify, or any other platform that supports Next.js.

### Vercel Deployment
```bash
npm install -g vercel
vercel
```

## Security Features

- Password hashing with bcrypt
- JWT-based authentication
- Role-based access control
- Image capture verification for clock in/out
- SuperAdmin protected from deletion
- Account activation/deactivation

## Color Theme

- Primary: White background
- Secondary: Dark Blue (#003366)
- Accents: Blue variations for UI elements

## License

This project is proprietary software for Southern Leyte State University.

## Support

For support or questions, contact the system administrator or department IT support.

## Version History

- **v1.0** - Initial release with all core features
  - Student clock in/out with image capture
  - Department management
  - Admin/SuperAdmin dashboard
  - DTR printing (Civil Service Form No. 48)
  - Announcement system
  - Password reset via email
