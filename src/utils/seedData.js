/**
 * Shared seeding utility for creating conversation flow test data
 * Used by both production seed.js and test setup
 */

const seedConversationData = async (models) => {
  const { Module, Question, User } = models;

  // Clear existing data
  await Module.deleteMany();
  await Question.deleteMany();
  await User.deleteMany();

  // --- MODULE A (Onboarding) ---
  const modA = await Module.create({ name: 'Onboarding' });
  const modB = await Module.create({ name: 'Assessment' });

  // Create questions for Module A
  const a1 = await Question.create({
    moduleId: modA._id,
    text: 'What is your experience level?',
    options: [
      { text: 'Beginner' },
      { text: 'Intermediate' },
    ]
  });

  const a2 = await Question.create({
    moduleId: modA._id,
    text: 'What is your goal?',
    isCheckpoint: true,
    options: [
      { text: 'Get a job' },
      { text: 'Learn skills' },
    ]
  });

  const a3 = await Question.create({
    moduleId: modA._id,
    text: 'How many hours per week can you commit?',
    options: [
      { text: 'Less than 5' },
      { text: 'More than 5', nextModuleId: modB._id },
    ]
  });

  // Wire a1 options
  a1.options[0].nextQuestionId = a2._id;
  a1.options[1].nextQuestionId = a3._id;
  await a1.save();

  // Wire a2 options
  a2.options[0].nextQuestionId = a3._id;
  a2.options[1].nextQuestionId = a3._id;
  await a2.save();

  // Set module A start
  modA.startQuestionId = a1._id;
  await modA.save();

  // --- MODULE B (Assessment) ---
  const b1 = await Question.create({
    moduleId: modB._id,
    text: 'Which topic interests you most?',
    options: [
      { text: 'Backend' },
      { text: 'Frontend' },
    ]
  });

  const b2 = await Question.create({
    moduleId: modB._id,
    text: 'Rate your confidence from 1-5.',
    options: [
      { text: '1-2 (Low)' },
      { text: '3-5 (High)' },
    ]
  });

  // Wire b1 options
  b1.options[0].nextQuestionId = b2._id;
  b1.options[1].nextQuestionId = b2._id;
  await b1.save();

  // Set module B start
  modB.startQuestionId = b1._id;
  await modB.save();

  // Create default user
  const user = await User.create({ name: 'Test User' });

  // Return all created data for reference
  return {
    modules: { modA, modB },
    questions: { a1, a2, a3, b1, b2 },
    user
  };
};

module.exports = { seedConversationData };
