const Question = require('../models/Question');
const { getUser } = require('../services/stateService');
const { getUserHistory } = require('../services/historyService');

const getCurrent = async (req, res) => {
  try {
    const user = await getUser(req.params.userId);
    if (!user.currentQuestionId)
      return res.json({ complete: true, message: 'No active question' });

    const question = await Question.findById(user.currentQuestionId);
    res.json({ question });
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message });
  }
};

const getHistory = async (req, res) => {
  try {
    const history = await getUserHistory(req.params.userId);
    res.json({ history });
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message });
  }
};

const resolveDeepLink = async (req, res) => {
  try {
    const { userId } = req.query;
    const { questionId } = req.params;

    const user = await getUser(userId);
    const requestedQ = await Question.findById(questionId);

    // question doesn't exist or belongs to different module — return current
    if (
      !requestedQ ||
      requestedQ.moduleId.toString() !== user.currentModuleId?.toString() ||
      user.currentQuestionId?.toString() !== questionId
    ) {
      const currentQ = await Question.findById(user.currentQuestionId);
      return res.json({ redirected: true, question: currentQ });
    }

    res.json({ redirected: false, question: requestedQ });
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message });
  }
};

module.exports = { getCurrent, getHistory, resolveDeepLink };