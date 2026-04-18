const mongoose = require('mongoose');
const Module = require('../models/Module');
const Question = require('../models/Question');
const User = require('../models/User');
const History = require('../models/History');
const { seedConversationData } = require('../utils/seedData');

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.MONGO_URI = process.env.TEST_MONGO_URI || 'mongodb://localhost:27017/convflow_test';

let testUser = null;
let testModuleA = null;
let testModuleB = null;
let testQuestions = {};

beforeAll(async () => {
  // Connect to test database
  await mongoose.connect(process.env.MONGO_URI);
  
  // Use shared seeding logic
  const seededData = await seedConversationData({ Module, Question, User });
  
  // Store references for tests
  testUser = seededData.user;
  testModuleA = seededData.modules.modA;
  testModuleB = seededData.modules.modB;
  testQuestions = seededData.questions;
});

afterAll(async () => {
  try {
    // Clean up test database
    await Module.deleteMany();
    await Question.deleteMany();
    await User.deleteMany();
    await History.deleteMany();
  } catch (error) {
    // Log error but continue to close connection
    console.error('Error during test database cleanup:', error.message);
  } finally {
    // Always close the connection, even if cleanup fails
    await mongoose.connection.close();
  }
});

// Export test data for use in test files
global.getTestData = () => ({
  user: testUser,
  moduleA: testModuleA,
  moduleB: testModuleB,
  questions: testQuestions
});
