const Question = require('../models/Question');
const Module = require('../models/Module');
const { getUser, updateState } = require('./stateService');
const { appendHistory } = require('./historyService');

const submitAnswer = async (userId, questionId, optionId) => {
  // 1. validate question
  const question = await Question.findById(questionId);
  if (!question) throw { status: 404, message: 'Question not found' };

  // 2. validate option
  const option = question.options.id(optionId);
  if (!option) throw { status: 400, message: 'Invalid option' };

  // 3. validate user state
  const user = await getUser(userId);
  if (user.currentQuestionId?.toString() !== questionId)
    throw { status: 400, message: 'Not your current question' };

  // 4. append history (always, before anything else)
  await appendHistory(userId, question.moduleId, questionId, optionId);

  // 5. checkpoint — store it so go-back cannot pass this point
  if (question.isCheckpoint) {
    await user.updateOne({ $addToSet: { checkpointQuestionIds: questionId } });
  }

  // 6. resolve next question
  let nextQuestion = null;

  if (option.nextQuestionId) {
    nextQuestion = await Question.findById(option.nextQuestionId);
    if (!nextQuestion) {
      // broken reference — fallback to current module start
      const mod = await Module.findById(question.moduleId);
      nextQuestion = await Question.findById(mod.startQuestionId);
    }
  } else if (option.nextModuleId) {
    const nextModule = await Module.findById(option.nextModuleId);
    if (!nextModule) throw { status: 404, message: 'Next module not found' };
    nextQuestion = await Question.findById(nextModule.startQuestionId);
  }
  // null = terminal state (flow complete)

  // 7. update state
  await updateState(
    userId,
    nextQuestion ? nextQuestion.moduleId : user.currentModuleId,
    nextQuestion ? nextQuestion._id : null
  );

  return nextQuestion;
};

module.exports = { submitAnswer };