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
  resumeUrl: { type: String },   // Specific to applicants (Cloudinary public ID / link)
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);