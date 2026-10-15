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
  phone: { type: String, default: "" },
  location: { type: String, default: "" },
  skills: [{ type: String }],
  experienceYears: { type: Number, default: 0 },
  summary: { type: String, default: "" },
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);