// MongoDB initialization script
db = db.getSiblingDB('taskmanagement');

// Create collections
db.createCollection('users');
db.createCollection('tasks');
db.createCollection('projects');
db.createCollection('teams');
db.createCollection('notifications');

// Create indexes for better performance
db.users.createIndex({ email: 1 }, { unique: true });
db.users.createIndex({ username: 1 }, { unique: true });
db.users.createIndex({ createdAt: 1 });

db.tasks.createIndex({ userId: 1 });
db.tasks.createIndex({ projectId: 1 });
db.tasks.createIndex({ status: 1 });
db.tasks.createIndex({ priority: 1 });
db.tasks.createIndex({ dueDate: 1 });
db.tasks.createIndex({ createdAt: 1 });

db.projects.createIndex({ userId: 1 });
db.projects.createIndex({ teamId: 1 });
db.projects.createIndex({ status: 1 });
db.projects.createIndex({ createdAt: 1 });

db.teams.createIndex({ name: 1 });
db.teams.createIndex({ createdAt: 1 });

db.notifications.createIndex({ userId: 1 });
db.notifications.createIndex({ read: 1 });
db.notifications.createIndex({ createdAt: 1 });

// Insert sample data
db.users.insertOne({
  _id: ObjectId(),
  email: 'admin@taskmanagement.com',
  username: 'admin',
  password: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/4.5.6.7',
  firstName: 'Admin',
  lastName: 'User',
  role: 'admin',
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date()
});

db.projects.insertOne({
  _id: ObjectId(),
  name: 'Sample Project',
  description: 'A sample project to get started',
  status: 'active',
  userId: ObjectId(),
  createdAt: new Date(),
  updatedAt: new Date()
});

print('Database initialized successfully!');
