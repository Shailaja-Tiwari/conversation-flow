const { submitAnswer } = require('../services/answerService');

const answer = async (req, res) => {
  try {
    const { userId, questionId, optionId } = req.body;
    if (!userId || !questionId || !optionId)
      return res.status(400).json({ message: 'userId, questionId, optionId required' });

    const nextQuestion = await submitAnswer(userId, questionId, optionId);

    if (!nextQuestion)
      return res.json({ complete: true, message: 'Flow complete' });

    res.json({ question: nextQuestion });
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message });
  }
};

module.exports = { answer };