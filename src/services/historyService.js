const History = require('../models/History');

const appendHistory = async (userId, moduleId, questionId, optionId) => {
  return History.create({ userId, moduleId, questionId, optionId });
};

const getUserHistory = async (userId) => {
  return History.find({ userId }).sort({ createdAt: 1 });
};

module.exports = { appendHistory, getUserHistory };