const Question = require('../models/Question');
const History = require('../models/History');
const User = require('../models/User');
const { updateState } = require('./stateService');

const goBack = async (userId) => {
  const user = await User.findById(userId);
  if (!user) throw { status: 404, message: 'User not found' };

  // get history for current module only, sorted oldest first
  const history = await History.find({
    userId,
    moduleId: user.currentModuleId
  }).sort({ createdAt: 1 });

  // need at least 2 entries to go back (current + one before it)
  if (history.length < 2)
    throw { status: 400, message: 'No history to go back to' };

  // FIX: second-to-last entry is the actual previous question
  // history[length - 1] is the current question (last answered)
  // history[length - 2] is the one before it — that's where we go back to
  const previous = history[history.length - 2];

  // block if that previous question is a checkpoint
  if (user.checkpointQuestionIds.map(id => id.toString()).includes(previous.questionId.toString()))
    throw { status: 400, message: 'Cannot go back past a checkpoint' };

  const question = await Question.findById(previous.questionId);
  if (!question) throw { status: 404, message: 'Previous question not found' };

  // history is never deleted — state just moves back
  await updateState(userId, user.currentModuleId, question._id);

  return question;
};

module.exports = { goBack };
