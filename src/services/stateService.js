const User = require('../models/User');

const getUser = async (userId) => {
  const user = await User.findById(userId);
  if (!user) throw { status: 400, message: 'User not found' };
  return user;
};

const updateState = async (userId, moduleId, questionId) => {
  return User.findByIdAndUpdate(
    userId,
    { currentModuleId: moduleId, currentQuestionId: questionId },
    { new: true }
  );
};

module.exports = { getUser, updateState };