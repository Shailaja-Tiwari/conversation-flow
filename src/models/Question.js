const mongoose = require('mongoose');

const optionSchema = new mongoose.Schema({
  text: { type: String, required: true },
  nextQuestionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Question', default: null },
  nextModuleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Module', default: null }
});

const questionSchema = new mongoose.Schema({
  moduleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Module', required: true },
  text: { type: String, required: true },
  isCheckpoint: { type: Boolean, default: false },
  options: [optionSchema]
}, { timestamps: true });

module.exports = mongoose.model('Question', questionSchema);