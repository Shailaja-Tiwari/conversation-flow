const mongoose = require('mongoose');

const moduleSchema = new mongoose.Schema({
  name: { type: String, required: true },
  startQuestionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Question' }
}, { timestamps: true });

module.exports = mongoose.model('Module', moduleSchema);