const { goBack } = require('../services/goBackService');

const goBackHandler = async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ message: 'userId required' });

    const question = await goBack(userId);
    res.json({ question });
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message });
  }
};

module.exports = { goBackHandler };