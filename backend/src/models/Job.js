const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  recruiterId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  title: { type: String, required: true },
  description: { type: String, required: true },
  requiredSkills: [{ type: String }], // Array of skills for the AI to match against
  experienceLevel: { type: String }, // e.g., 'Entry', 'Mid', 'Senior'
  status: { 
    type: String, 
    enum: ['active', 'archived', 'draft'], 
    default: 'active' 
  }
}, { timestamps: true });

module.exports = mongoose.model('Job', jobSchema);