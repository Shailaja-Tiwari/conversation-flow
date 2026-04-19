const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  currentModuleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Module', default: null },
  currentQuestionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Question', default: null },
  checkpointQuestionIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Question' }],
  goBackIndex: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);