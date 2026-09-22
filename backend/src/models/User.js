const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { 
    type: String, 
    enum: ['recruiter', 'applicant'], 
    required: true 
  },
  companyName: { type: String }, // Specific to recruiters
  resumeUrl: { type: String },   // Specific to applicants (AWS S3 link added later)
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);