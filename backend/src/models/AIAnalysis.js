const mongoose = require('mongoose');

const aiAnalysisSchema = new mongoose.Schema({
  applicationId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Application', 
    required: true 
  },
  score: { 
    type: Number, 
    required: true, 
    min: 0, 
    max: 100 
  },
  matchedSkills: [{ type: String }],
  missingSkills: [{ type: String }],
  experienceYears: { type: Number },
  summary: { type: String, required: true }
}, { timestamps: true });

module.exports = mongoose.model('AIAnalysis', aiAnalysisSchema);