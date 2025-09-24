# TaskManagement API Documentation

## Overview

The TaskManagement API provides a comprehensive RESTful interface for managing tasks, projects, teams, and user authentication. The API is built with Node.js, Express, TypeScript, and MongoDB.

## Base URL

- Development: `http://localhost:8080/api/v1`
- Production: `https://api.taskmanagement.com/api/v1`

## Authentication

The API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## Rate Limiting

- 100 requests per 15 minutes per IP
- 1000 requests per hour for authenticated users

## Error Handling

All errors follow a consistent format:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable error message",
    "details": {}
  }
}
```

## Endpoints

### Authentication

#### POST /auth/register
Register a new user.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user_id",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe"
    },
    "token": "jwt_token",
    "refreshToken": "refresh_token"
  }
}
```

#### POST /auth/login
Login with email and password.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

#### POST /auth/refresh
Refresh access token.

**Request Body:**
```json
{
  "refreshToken": "refresh_token"
}
```

#### POST /auth/logout
Logout and invalidate tokens.

### Users

#### GET /users/profile
Get current user profile.

#### PUT /users/profile
Update user profile.

#### GET /users
Get all users (admin only).

### Tasks

#### GET /tasks
Get user's tasks with optional filtering.

**Query Parameters:**
- `status`: Filter by status (pending, in_progress, completed, cancelled)
- `priority`: Filter by priority (low, medium, high, urgent)
- `projectId`: Filter by project ID
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)

#### POST /tasks
Create a new task.

**Request Body:**
```json
{
  "title": "Task title",
  "description": "Task description",
  "priority": "medium",
  "dueDate": "2024-01-15T10:00:00Z",
  "projectId": "project_id"
}
```

#### GET /tasks/:id
Get task by ID.

#### PUT /tasks/:id
Update task.

#### DELETE /tasks/:id
Delete task.

### Projects

#### GET /projects
Get user's projects.

#### POST /projects
Create a new project.

**Request Body:**
```json
{
  "name": "Project name",
  "description": "Project description",
  "color": "#3b82f6"
}
```

#### GET /projects/:id
Get project by ID.

#### PUT /projects/:id
Update project.

#### DELETE /projects/:id
Delete project.

### Teams

#### GET /teams
Get user's teams.

#### POST /teams
Create a new team.

#### GET /teams/:id
Get team by ID.

#### POST /teams/:id/members
Add member to team.

#### DELETE /teams/:id/members/:userId
Remove member from team.

## WebSocket Events

The API supports real-time updates via WebSocket connections.

### Connection
Connect to: `ws://localhost:8080/socket.io`

### Events

#### task:created
Emitted when a new task is created.

#### task:updated
Emitted when a task is updated.

#### task:deleted
Emitted when a task is deleted.

#### project:created
Emitted when a new project is created.

#### project:updated
Emitted when a project is updated.

#### project:deleted
Emitted when a project is deleted.

## Status Codes

- `200` - OK
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict
- `422` - Validation Error
- `429` - Too Many Requests
- `500` - Internal Server Error

## Pagination

List endpoints support pagination:

```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "pages": 10
  }
}
```

## Filtering and Sorting

Many endpoints support filtering and sorting:

- `sort`: Sort field (e.g., `createdAt`, `-createdAt` for descending)
- `filter`: Filter object (e.g., `{"status": "pending"}`)

## Examples

### Creating a Task

```bash
curl -X POST http://localhost:8080/api/v1/tasks \
  -H "Authorization: Bearer your-jwt-token" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Complete project documentation",
    "description": "Write comprehensive API documentation",
    "priority": "high",
    "dueDate": "2024-01-15T10:00:00Z"
  }'
```

### Getting Tasks with Filters

```bash
curl -X GET "http://localhost:8080/api/v1/tasks?status=pending&priority=high&page=1&limit=5" \
  -H "Authorization: Bearer your-jwt-token"
```
