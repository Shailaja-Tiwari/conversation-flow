const Module = require('../models/Module');
const Question = require('../models/Question');
const { getUser, updateState } = require('../services/stateService');

const startModule = async (req, res) => {
  try {
    const { moduleId } = req.params;
    const { userId } = req.body;

    const mod = await Module.findById(moduleId);
    if (!mod) return res.status(404).json({ message: 'Module not found' });

    const user = await getUser(userId);
    const firstQuestion = await Question.findById(mod.startQuestionId);
    if (!firstQuestion) return res.status(404).json({ message: 'Start question not found' });

    await updateState(userId, mod._id, firstQuestion._id);

    res.json({ question: firstQuestion });
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message });
  }
};

module.exports = { startModule };