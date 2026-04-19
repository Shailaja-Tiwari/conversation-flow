require('dotenv').config();
const mongoose = require('mongoose');
const Module = require('./src/models/Module');
const Question = require('./src/models/Question');
const User = require('./src/models/User');
const { seedConversationData } = require('./src/utils/seedData');

const seed = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  
  // Use shared seeding logic
  const data = await seedConversationData({ Module, Question, User });

  console.log('Seeded successfully');
  console.log('Module A (Onboarding):', data.modules.modA._id);
  console.log('Module B (Assessment):', data.modules.modB._id);
  console.log('User:', data.user._id);
  console.log('\nQuestion Flow:');
  console.log('  a1 -> a2 (checkpoint) -> a3 -> [Module B]');
  console.log('  b1 -> b2 (terminal)');
  
  process.exit(0);
};

seed().catch(err => { console.error(err); process.exit(1); });

