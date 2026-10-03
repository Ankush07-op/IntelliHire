const mongoose = require('mongoose');

const aiAnalysisSchema = new mongoose.Schema(
  {
    applicationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Application',
      required: true,
      unique: true,
    },
    status: {
      type: String,
      enum: ['processing', 'completed', 'failed'],
      default: 'processing',
    },
    score: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    matchedSkills: [{ type: String }],
    missingSkills: [{ type: String }],
    experienceYears: { type: Number, default: 0 },
    summary: { type: String, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('AIAnalysis', aiAnalysisSchema);