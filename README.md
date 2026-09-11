# EaseEvent

EaseEvent is a web-based event management platform designed to simplify
the complete lifecycle of academic and institutional events --- from
event creation and registration to teams, notifications, results, and
certificates.

## 🚀 Live Deployment

- **Frontend:** https://easeevent-frontend-two.vercel.app/
- **Backend API:** https://event-mangement-backend-kwq8.onrender.com/

## 📌 Project Overview

EaseEvent provides a centralized platform where administrators,
teachers, students, and participants can interact with events according
to their roles.

The platform is designed around a complete event workflow:

```text
User Registration
      ↓
Email Verification / OTP
      ↓
Login
      ↓
Role-based Dashboard
      ↓
Event Creation
      ↓
Event Approval / Publishing
      ↓
Event Registration
      ↓
Team Management
      ↓
Notifications
      ↓
Event Results
      ↓
Certificates
```

## ✨ Key Features

### 🔐 Authentication & Authorization

- User registration
- Email verification using OTP
- Login and logout
- Password hashing
- JWT-based authentication
- Role-based access control
- Protected frontend and backend routes
- User account status management

Supported roles include:

- Admin
- Teacher
- Student
- Participant

### 📅 Event Management

Administrators can create and manage events with information such as:

- Title and subtitle
- Description
- Category
- Event type
- Entry fee
- Tags
- Start and end date/time
- Event mode
- Venue / rooms
- Online meeting link
- Recurrence
- Registration requirements
- Participant limits
- Security level
- Age restrictions
- Accommodation
- Equipment
- Catering
- Team configuration
- Poster and promotional video
- Visibility
- Target audience
- External participant limits
- Result configuration
- Event status

### 📝 Dynamic Event Registration

EaseEvent supports customizable registration forms.

Event organizers can define custom fields such as:

- Text
- Textarea
- Email
- Number
- Phone
- URL
- Date
- Select
- Checkbox
- File

Custom responses are stored against the corresponding registration and
form field.

### 👥 Team Management

For team-based events, the platform supports:

- Team creation
- Team names
- Maximum team members
- Team membership
- Team member roles
- Team joining
- Team status

Teams are modeled separately from individual team members and event
registrations.

### 🔔 Notifications

The notification system supports:

- Approval notifications
- Reminder notifications
- Team notifications
- Announcements
- System notifications
- Read/unread state
- Archived notifications
- Pinned notifications
- Notification target pages

### 🏆 Results

Events can have configurable results with support for:

- Individual winners
- Team winners
- Positions/ranks
- Rank labels
- Scores
- Maximum scores
- Special awards
- Judge remarks
- Result declaration
- Certificate status

### 📜 Certificates

The project includes certificate-related settings for:

- Certificate title
- Signature name
- Signature designation
- Signature image
- Certificate footer
- Template type
- Automatic certificate generation

### 🏫 Institution Settings

The system can store institution-level information including:

- Institution name
- Logo
- Banner
- Address
- City
- State
- Country
- PIN code
- Contact email
- Contact phone
- Website
- Principal name
- Academic year

## 🛠️ Technology Stack

### Frontend

- React
- JavaScript / JSX
- Tailwind CSS
- Vite
- React Router
- Fetch/Axios-based API communication

### Backend

- Node.js
- Express.js
- REST API
- JWT authentication
- bcrypt password hashing
- Nodemailer / email-service integration where applicable

### Database

- PostgreSQL
- Supabase

### Deployment

- **Frontend:** Vercel
- **Backend:** Render
- **Database:** Supabase

## 🗂️ High-Level Database Structure

The project uses a relational PostgreSQL database.

Important tables include:

```text
users
user_profiles

events
event_form_fields
event_registrations
registration_custom_responses

event_coordinators

event_teams
event_team_members

notifications
user_notifications

event_results

institution_settings
certificate_settings
```

### Main Relationships

```text
users
 ├── user_profiles
 ├── events (created_by)
 ├── event_registrations
 ├── event_coordinators
 ├── event_teams
 ├── event_team_members
 └── user_notifications

events
 ├── event_form_fields
 ├── event_registrations
 ├── event_coordinators
 ├── event_teams
 ├── notifications
 └── event_results

event_registrations
 └── registration_custom_responses

event_teams
 └── event_team_members

notifications
 └── user_notifications
```

## 🔄 Event Lifecycle

An event can move through different stages depending on the
application's approval workflow.

A typical lifecycle is:

```text
Draft
  ↓
Pending
  ↓
Approved / Published
  ↓
Registration
  ↓
Event Conducted
  ↓
Results Declared
  ↓
Certificates Issued
```

## 🔑 Environment Variables

Do not commit secrets to Git.

### Backend

Create a `.env` file in the backend project containing the environment
variables required by your deployment, for example:

```env
PORT=5000
NODE_ENV=development

DATABASE_URL=your_database_connection_string

JWT_SECRET=your_jwt_secret

BCRYPT_ROUNDS=10

RESEND_API_KEY=your_resend_api_key
MAIL_FROM=your_verified_sender
```

The exact variables should match the backend configuration used by the
project.

### Frontend

Configure the production backend URL using the environment variable
expected by the frontend application.

For example:

```env
VITE_API_URL=https://event-mangement-backend-kwq8.onrender.com
```

Do not expose private backend secrets in frontend environment variables.

## 💻 Local Development

### 1. Clone the repository

```bash
git clone <repository-url>
cd <project-directory>
```

### 2. Install frontend dependencies

```bash
cd frontend
npm install
```

### 3. Configure frontend environment variables

Create the appropriate `.env` file and configure the backend API URL.

### 4. Start the frontend

```bash
npm run dev
```

### 5. Install backend dependencies

Open another terminal:

```bash
cd backend
npm install
```

### 6. Configure backend environment variables

Create the backend `.env` file with the required database,
authentication, and email-service configuration.

### 7. Start the backend

```bash
npm run dev
```

If the backend project uses a different start script, use the script
defined in its `package.json`.

## 🧪 Production Testing Checklist

Before considering a deployment production-ready, test the complete
workflow.

### Authentication

- [ ] Registration works
- [ ] OTP is sent
- [ ] OTP verification works
- [ ] User is created successfully
- [ ] Login works
- [ ] Logout works
- [ ] Invalid credentials are rejected
- [ ] Protected routes reject unauthorized users
- [ ] Role-based permissions work

### Events

- [ ] Admin can create an event
- [ ] Event status is stored correctly
- [ ] Event approval works
- [ ] Published events are visible to intended users
- [ ] Event details load correctly
- [ ] Event editing works
- [ ] Event deletion works where permitted

### Registration

- [ ] Registration form loads
- [ ] Required fields validate
- [ ] Custom fields work
- [ ] Registration is stored
- [ ] Duplicate registration is prevented
- [ ] Registration status works
- [ ] Admin can review registrations

### Teams

- [ ] Team creation works
- [ ] Members can join teams
- [ ] Team limits are enforced
- [ ] Team roles work
- [ ] Team registration works

### Notifications

- [ ] Notifications are created
- [ ] Correct users receive notifications
- [ ] Read/unread state works
- [ ] Archive functionality works
- [ ] Pinned notifications work

### Results & Certificates

- [ ] Results can be declared
- [ ] Individual results work
- [ ] Team results work
- [ ] Scores and ranks are stored
- [ ] Certificate settings work
- [ ] Certificates can be generated/issued where implemented

## 🔑 Demo Accounts

The following accounts can be used for testing the deployed EaseEvent application.

> ⚠️ **Demo credentials only:** These credentials are included for development/testing purposes. Do not use these passwords for real accounts or expose production credentials in a public repository.

| Role    | Name      | Email                      | Password   |
| ------- | --------- | -------------------------- | ---------- |
| Admin   | Admin     | `admin@example.com`        | `admin123` |
| Teacher | Lucky     | `chauhan12lucky@gmail.com` | `12345678` |
| User    | Test User | `testuser@gmail.com`       | `12345678` |

### Login Testing

Use the accounts above to test role-based functionality:

- **Admin:** Test event creation, event management, approvals, users, results, and administrative features.
- **Teacher:** Test teacher-specific dashboard and event-related functionality.
- **User:** Test participant/student-facing event discovery and registration functionality.

## 🔒 Security Considerations

- Never commit `.env` files.
- Never expose JWT secrets in frontend code.
- Never expose database passwords or service-role keys.
- Passwords must be stored as secure hashes.
- Validate and sanitize incoming request data.
- Use role-based authorization on protected backend endpoints.
- Configure CORS for trusted frontend origins.
- Validate uploaded files and their types.
- Avoid returning sensitive database information in API responses.
- Use HTTPS in production.
- Keep production secrets inside Vercel/Render environment settings
  rather than source code.

## 📁 Suggested Project Structure

```text
EaseEvent/
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── hooks/
│   │   ├── context/
│   │   └── main.jsx
│   ├── index.html
│   └── package.json
│
├── backend/
│   ├── controllers/
│   ├── routes/
│   ├── middleware/
│   ├── services/
│   ├── utils/
│   ├── config/
│   ├── server.js
│   └── package.json
│
└── README.md
```

The exact structure may differ from the current implementation.

## 🌐 Deployment

### Frontend --- Vercel

The React/Vite frontend is deployed on Vercel.

Production frontend:

```text
https://easeevent-frontend-two.vercel.app/
```

### Backend --- Render

The Node.js/Express backend is deployed on Render.

Production backend:

```text
https://event-mangement-backend-kwq8.onrender.com/
```

### Database --- Supabase

The application uses PostgreSQL through Supabase for persistent data
storage.

## 🧩 Production Architecture

```text
                    ┌──────────────────────┐
                    │      EaseEvent       │
                    │   React Frontend     │
                    │       Vercel         │
                    └──────────┬───────────┘
                               │
                               │ HTTPS / REST API
                               ▼
                    ┌──────────────────────┐
                    │    Node + Express    │
                    │       Backend        │
                    │       Render         │
                    └───────┬───────┬──────┘
                            │       │
                PostgreSQL  │       │ Email API
                            │       │
                            ▼       ▼
                    ┌──────────┐  ┌──────────┐
                    │ Supabase │  │  Resend  │
                    │ Database │  │   Email  │
                    └──────────┘  └──────────┘
```

## 🚧 Current Production Notes

The application is deployed, but production readiness should be verified
through end-to-end testing.

In particular:

1.  Test email OTP delivery in the deployed environment.
2.  Verify the production email sender/domain configuration before
    allowing arbitrary users to receive OTPs.
3.  Verify all environment variables on Vercel and Render.
4.  Test CORS and authentication from the deployed frontend.
5.  Test the complete event and registration lifecycle.
6.  Check mobile responsiveness and production error states.

## 🎯 Future Improvements

Possible future improvements include:

- Custom domain
- Dedicated production email domain
- Advanced event analytics
- Attendance management
- QR-code based event check-in
- Payment gateway integration
- Automated reminders
- Advanced certificate generation
- Event calendar integration
- Search and filtering improvements
- Audit logs
- Rate limiting and additional API protection
- Automated testing and CI/CD improvements

## 👨‍💻 Project

**Project Name:** EaseEvent\
**Type:** Event Management Platform\
**Frontend:** React\
**Backend:** Node.js + Express\
**Database:** PostgreSQL / Supabase\
**Frontend Hosting:** Vercel\
**Backend Hosting:** Render

---

## 📄 License

Lucky chauhan
