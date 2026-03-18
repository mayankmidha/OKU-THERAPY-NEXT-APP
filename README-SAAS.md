# OKU Therapy SaaS Platform

A comprehensive mental health SaaS platform built with Next.js 14, TypeScript, Tailwind CSS, and Prisma with PostgreSQL.

## 🚀 Features

### 🔐 Authentication System
- **NextAuth.js** integration with custom credentials provider
- **Role-based access control** (CLIENT, THERAPIST, ADMIN)
- **Secure password hashing** with bcrypt
- **Session management** and middleware protection

### 👥 User Roles

#### Client Features
- **Personal Dashboard** with mood tracking
- **Assessment System** (GAD-7 Anxiety, PHQ-9 Depression, ADHD, Burnout, PTSD)
- **Mood Logger** with emoji-based interface
- **Session Booking** and management
- **Progress Tracking** and history

#### Therapist Features
- **Professional Dashboard** with schedule management
- **Client Management** and profiles
- **Session Notes** and documentation
- **Availability Settings** and calendar integration
- **Approval System** for new therapists

#### Admin Features
- **Platform Management** and oversight
- **User Administration** and approvals
- **Analytics** and reporting
- **System Configuration**

### 🗄️ Database Architecture
- **PostgreSQL** with Prisma ORM
- **User Management** with profiles
- **Booking System** with services
- **Assessment Tracking** and results
- **Mood Tracking** and analytics
- **Session Notes** and documentation

### 🛡️ Security Features
- **Role-based middleware** protection
- **Secure API routes** with validation
- **Session validation** and timeout
- **Protected routes** by user type
- **Input sanitization** and XSS protection

## 📋 Prerequisites

- Node.js 18+ 
- PostgreSQL database
- npm or yarn

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/mayankmidha/OKU-THERAPY-NEXT-APP.git
   cd OKU-THERAPY-NEXT-APP
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp env-example.txt .env
   ```
   
   Edit `.env` with your configuration:
   ```env
   DATABASE_URL="postgresql://username:password@localhost:5432/oku_therapy_db"
   NEXTAUTH_SECRET="your-super-secret-key-change-this-in-production"
   NEXTAUTH_URL="http://localhost:3000"
   ```

4. **Set up the database**
   ```bash
   npx prisma db push
   npx prisma generate
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🏗️ Project Structure

```
├── app/
│   ├── api/                 # API routes
│   │   ├── auth/           # Authentication endpoints
│   │   ├── client/         # Client-specific APIs
│   │   └── therapist/      # Therapist-specific APIs
│   ├── auth/               # Authentication pages
│   │   ├── signin/         # Login page
│   │   └── signup/         # Registration page
│   └── dashboard/          # Dashboard pages
│       ├── client/         # Client dashboard
│       └── therapist/      # Therapist dashboard
├── components/             # Reusable components
├── lib/                   # Utility functions
│   ├── auth.ts            # NextAuth configuration
│   └── prisma.ts          # Prisma client
├── prisma/                # Database schema
│   └── schema.prisma      # Prisma schema
└── types/                 # TypeScript definitions
```

## 🧪 Database Schema

The platform uses a comprehensive database schema with the following main models:

- **User**: Base user model with role assignment
- **ClientProfile**: Extended client information
- **TherapistProfile**: Professional therapist details
- **Booking**: Session scheduling and management
- **Service**: Therapy services and pricing
- **Assessment**: Mental health assessments and results
- **MoodEntry**: Daily mood tracking
- **SessionNote**: Therapist session documentation

## 🔧 Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npx prisma studio` - Open Prisma Studio
- `npx prisma db push` - Push schema changes
- `npx prisma generate` - Generate Prisma client

### API Routes

#### Authentication
- `POST /api/auth/signin` - User login
- `POST /api/auth/signup` - User registration
- `GET/POST /api/auth/[...nextauth]` - NextAuth.js handler

#### Client APIs
- `GET /api/client/sessions` - Get client sessions
- `GET /api/client/mood/recent` - Get recent mood entry
- `POST /api/client/mood` - Create mood entry
- `POST /api/client/assessments` - Submit assessment

#### Therapist APIs
- `GET /api/therapist/profile` - Get therapist profile
- `GET /api/therapist/sessions` - Get therapist sessions
- `GET /api/therapist/clients/count` - Get client count

## 🚀 Deployment

### Vercel (Recommended)
1. Push your code to GitHub
2. Connect your Vercel account to the repository
3. Set environment variables in Vercel dashboard
4. Deploy automatically

### Manual Deployment
1. Build the application: `npm run build`
2. Set up production database
3. Configure environment variables
4. Start the server: `npm start`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support, please email support@okutherapy.com or create an issue on GitHub.

## 🌟 Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- Authentication by [NextAuth.js](https://next-auth.js.org/)
- Database with [Prisma](https://www.prisma.io/)
- Styled with [Tailwind CSS](https://tailwindcss.com/)
- Icons by [Lucide](https://lucide.dev/)
