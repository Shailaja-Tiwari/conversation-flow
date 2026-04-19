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

  if (history.length === 0)
    throw { status: 400, message: 'No history to go back to' };

  // find previous question (second to last)
  const previous = history[history.length - 1];

  // block if previous question is a checkpoint
  if (user.checkpointQuestionIds.map(id => id.toString()).includes(previous.questionId.toString()))
    throw { status: 400, message: 'Cannot go back past a checkpoint' };

  const question = await Question.findById(previous.questionId);
  if (!question) throw { status: 404, message: 'Previous question not found' };

  // history is never deleted — state just moves back
  // update state to previous question
  await updateState(userId, user.currentModuleId, question._id);

  return question;
};

module.exports = { goBack };