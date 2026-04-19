const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  currentModuleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Module', default: null },
  currentQuestionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Question', default: null },
  checkpointQuestionIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Question' }]
  // removed: goBackIndex — was never read or written anywhere in the codebase
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
