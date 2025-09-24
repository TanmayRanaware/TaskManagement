import 'dotenv/config';
import mongoose from 'mongoose';
import { User } from '../models/User';
import { Project } from '../models/Project';
import { Task } from '../models/Task';
import { Comment } from '../models/Comment';
import { connectDatabase } from '../config/database';
import { logger } from '../utils/logger';

const seedData = async () => {
  try {
    logger.info('🌱 Starting database seeding...');

    // Connect to database
    await connectDatabase();

    // Clear existing data
    await User.deleteMany({});
    await Project.deleteMany({});
    await Task.deleteMany({});
    await Comment.deleteMany({});

    logger.info('🗑️ Cleared existing data');

    // Create admin user
    const adminUser = new User({
      email: 'admin@taskmanager.com',
      name: 'Admin User',
      passwordHash: 'Password123!', // Will be hashed by pre-save middleware
      roles: ['admin'],
    });
    await adminUser.save();

    // Create member user
    const memberUser = new User({
      email: 'member@taskmanager.com',
      name: 'Member User',
      passwordHash: 'Password123!', // Will be hashed by pre-save middleware
      roles: ['member'],
    });
    await memberUser.save();

    logger.info('👥 Created users');

    // Create project
    const project = new Project({
      name: 'Team Alpha',
      key: 'TA',
      description: 'Main project for Team Alpha',
      ownerId: adminUser._id,
      members: [
        {
          userId: adminUser._id,
          role: 'owner',
          joinedAt: new Date(),
        },
        {
          userId: memberUser._id,
          role: 'member',
          joinedAt: new Date(),
        },
      ],
    });
    await project.save();

    logger.info('📁 Created project');

    // Create tasks
    const tasks = [
      {
        projectId: project._id,
        title: 'Setup project infrastructure',
        description: 'Set up the basic project structure and configuration',
        status: 'done',
        priority: 'High' as const,
        assigneeId: adminUser._id,
        creatorId: adminUser._id,
        labels: ['infrastructure', 'setup'],
        order: 0,
      },
      {
        projectId: project._id,
        title: 'Design user interface',
        description: 'Create wireframes and mockups for the user interface',
        status: 'in-progress',
        priority: 'High' as const,
        assigneeId: memberUser._id,
        creatorId: adminUser._id,
        labels: ['design', 'ui'],
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        order: 0,
      },
      {
        projectId: project._id,
        title: 'Implement authentication',
        description: 'Set up user authentication and authorization',
        status: 'review',
        priority: 'Medium' as const,
        assigneeId: adminUser._id,
        creatorId: adminUser._id,
        labels: ['auth', 'security'],
        order: 0,
      },
      {
        projectId: project._id,
        title: 'Create task management features',
        description: 'Implement CRUD operations for tasks',
        status: 'backlog',
        priority: 'High' as const,
        assigneeId: memberUser._id,
        creatorId: adminUser._id,
        labels: ['feature', 'crud'],
        order: 0,
      },
      {
        projectId: project._id,
        title: 'Add real-time notifications',
        description: 'Implement WebSocket connections for real-time updates',
        status: 'backlog',
        priority: 'Medium' as const,
        assigneeId: adminUser._id,
        creatorId: memberUser._id,
        labels: ['websocket', 'realtime'],
        order: 1,
      },
      {
        projectId: project._id,
        title: 'Write documentation',
        description: 'Create comprehensive API and user documentation',
        status: 'backlog',
        priority: 'Low' as const,
        assigneeId: memberUser._id,
        creatorId: adminUser._id,
        labels: ['documentation'],
        order: 2,
      },
    ];

    const createdTasks = await Task.insertMany(tasks);
    logger.info('📋 Created tasks');

    // Create comments
    const comments = [
      {
        taskId: createdTasks[1]._id,
        authorId: memberUser._id,
        body: 'I\'ve started working on the wireframes. Will have a draft ready by tomorrow.',
        mentions: [],
      },
      {
        taskId: createdTasks[1]._id,
        authorId: adminUser._id,
        body: 'Great! Let me know if you need any feedback or resources.',
        mentions: [memberUser._id],
      },
      {
        taskId: createdTasks[2]._id,
        authorId: adminUser._id,
        body: 'Authentication is implemented and ready for review. @member please test the login flow.',
        mentions: [memberUser._id],
      },
    ];

    await Comment.insertMany(comments);
    logger.info('💬 Created comments');

    logger.info('✅ Database seeding completed successfully!');
    logger.info('\n📧 Demo Credentials:');
    logger.info('Admin: admin@taskmanager.com / Password123!');
    logger.info('Member: member@taskmanager.com / Password123!');
    logger.info('\n🚀 You can now start the application and test the features!');

  } catch (error) {
    logger.error('❌ Seeding failed:', error);
    throw error;
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
};

seedData();
