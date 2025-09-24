# Task Management Application

A production-ready, full-stack task management application built with modern technologies, featuring real-time collaboration, role-based access control, and comprehensive project management capabilities.

## 🚀 Features

### Core Features
- **Authentication & Authorization**: JWT-based auth with refresh tokens and RBAC
- **Project Management**: Create, manage, and collaborate on projects
- **Task Management**: Full CRUD operations with drag-and-drop Kanban boards
- **Real-time Collaboration**: Live updates via WebSocket connections
- **Comments & Activity**: Threaded comments and comprehensive activity logs
- **File Attachments**: Upload and manage task attachments
- **Search & Filtering**: Advanced search with filters for tasks and projects
- **Notifications**: In-app notifications for task updates and mentions

### Technical Features
- **Type Safety**: Full TypeScript implementation
- **Modern UI**: React with Tailwind CSS and shadcn/ui components
- **State Management**: Zustand for global state, React Query for server state
- **Real-time Updates**: Socket.IO for live collaboration
- **Database**: MongoDB with Mongoose ODM
- **Caching**: Redis for session management and caching
- **API Documentation**: OpenAPI/Swagger documentation
- **Testing**: Comprehensive test suite with Jest and Vitest
- **Monitoring**: Prometheus metrics and structured logging

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React Frontend│    │  Express API    │    │   MongoDB       │
│   (Port 5173)   │◄──►│   (Port 4000)   │◄──►│   (Port 27017)  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Socket.IO     │    │      Redis      │    │   File Storage  │
│   (WebSocket)   │    │   (Port 6379)   │    │    (Optional)   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🛠️ Tech Stack

### Backend
- **Runtime**: Node.js 20+
- **Framework**: Express.js with TypeScript
- **Database**: MongoDB with Mongoose
- **Cache**: Redis with ioredis
- **Authentication**: JWT with bcrypt
- **Real-time**: Socket.IO
- **Validation**: Zod schemas
- **Documentation**: OpenAPI/Swagger
- **Monitoring**: Prometheus metrics
- **Logging**: Winston with structured logging

### Frontend
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS + shadcn/ui
- **State Management**: Zustand + React Query
- **Routing**: React Router v6
- **Forms**: React Hook Form with Zod validation
- **Notifications**: Sonner + React Hot Toast
- **Icons**: Lucide React
- **Markdown**: React MD Editor

### DevOps & Tools
- **Containerization**: Docker + Docker Compose
- **CI/CD**: GitHub Actions
- **Testing**: Jest (backend) + Vitest (frontend)
- **Code Quality**: ESLint + Prettier
- **Package Manager**: npm

## 🚀 Quick Start

### Prerequisites
- Node.js 20+ and npm
- MongoDB 6+
- Redis 7+
- Docker & Docker Compose (optional)

### Local Development

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd task-management
   ```

2. **Install dependencies**
   ```bash
   # Install root dependencies
   npm install
   
   # Install backend dependencies
   cd server && npm install && cd ..
   
   # Install frontend dependencies
   cd web && npm install && cd ..
   ```

3. **Set up environment variables**
   ```bash
   # Copy environment files
   cp .env.example .env
   cp server/.env.example server/.env
   cp web/.env.example web/.env
   
   # Update the environment variables as needed
   ```

4. **Start the databases**
   ```bash
   # Using Docker Compose (recommended)
   docker-compose up -d mongo redis
   
   # Or start manually
   # MongoDB: brew services start mongodb-community
   # Redis: brew services start redis
   ```

5. **Seed the database (optional)**
   ```bash
   cd server && npm run seed
   ```

6. **Start the development servers**
   ```bash
   # Start both backend and frontend
   npm run dev
   
   # Or start individually
   npm run dev:server  # Backend on http://localhost:4000
   npm run dev:web     # Frontend on http://localhost:5173
   ```

### Demo Credentials
After seeding the database:
- **Admin**: admin@taskmanager.com / Password123!
- **Member**: member@taskmanager.com / Password123!

## 📁 Project Structure

```
task-management/
├── server/                 # Backend API
│   ├── src/
│   │   ├── config/        # Database and app configuration
│   │   ├── controllers/   # Route controllers
│   │   ├── middleware/    # Express middleware
│   │   ├── models/        # MongoDB models
│   │   ├── routes/        # API routes
│   │   ├── services/      # Business logic
│   │   ├── sockets/       # Socket.IO handlers
│   │   ├── utils/         # Utility functions
│   │   └── index.ts       # Server entry point
│   ├── tests/             # Backend tests
│   └── package.json
├── web/                   # Frontend React app
│   ├── src/
│   │   ├── api/          # API client
│   │   ├── components/   # React components
│   │   ├── pages/        # Page components
│   │   ├── stores/       # Zustand stores
│   │   ├── styles/       # CSS styles
│   │   └── utils/        # Utility functions
│   ├── tests/            # Frontend tests
│   └── package.json
├── docker-compose.yml     # Development environment
├── .github/workflows/     # CI/CD pipelines
└── README.md
```

## 🔧 Configuration

### Environment Variables

#### Backend (.env)
```env
PORT=4000
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/taskmgr
REDIS_URL=redis://localhost:6379
JWT_ACCESS_SECRET=your-access-secret
JWT_REFRESH_SECRET=your-refresh-secret
CORS_ORIGIN=http://localhost:5173
PROMETHEUS_ENABLED=true
```

#### Frontend (.env)
```env
VITE_API_URL=http://localhost:4000
VITE_WS_URL=ws://localhost:4000
```

## 🧪 Testing

### Backend Tests
```bash
cd server
npm run test              # Run all tests
npm run test:watch        # Watch mode
npm run test:coverage     # Coverage report
```

### Frontend Tests
```bash
cd web
npm run test              # Run all tests
npm run test:ui           # UI test runner
npm run test:coverage     # Coverage report
```

## 📊 API Documentation

Once the server is running, visit:
- **Swagger UI**: http://localhost:4000/docs
- **OpenAPI JSON**: http://localhost:4000/docs/json
- **Health Check**: http://localhost:4000/healthz
- **Metrics**: http://localhost:4000/metrics

## 🐳 Docker Deployment

### Development
```bash
# Start all services
docker-compose up --build

# Start specific services
docker-compose up mongo redis server web
```

### Production
```bash
# Build production images
docker-compose -f docker-compose.prod.yml build

# Deploy to production
docker-compose -f docker-compose.prod.yml up -d
```

## 🚀 Deployment

### AWS ECS/ECR
1. Build and push Docker images to ECR
2. Create ECS task definitions
3. Deploy ECS services with ALB
4. Configure auto-scaling and monitoring

### Render
1. Connect GitHub repository
2. Configure environment variables
3. Deploy automatically on push

## 📈 Monitoring & Observability

- **Health Checks**: `/healthz`, `/ready`, `/live`
- **Metrics**: Prometheus metrics at `/metrics`
- **Logging**: Structured JSON logs with Winston
- **Error Tracking**: Comprehensive error handling and logging

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: Check the `/docs` folder for detailed documentation
- **Issues**: Report bugs and request features via GitHub Issues
- **Discussions**: Join the community discussions

## 🎯 Roadmap

- [ ] Advanced reporting and analytics
- [ ] Mobile applications (React Native)
- [ ] Advanced notification system with email/SMS
- [ ] Integration with external tools (Slack, GitHub, etc.)
- [ ] Advanced file management with cloud storage
- [ ] Multi-language support
- [ ] Advanced role management
- [ ] API rate limiting and quotas
- [ ] Advanced search with Elasticsearch
- [ ] Performance monitoring and optimization

---

Built with ❤️ using modern web technologies for scalable, maintainable, and efficient task management.