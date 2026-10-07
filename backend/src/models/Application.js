const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  jobId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Job', 
    required: true 
  },
  applicantId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  resumeUrl: { 
    type: String, 
    required: true // Cloudinary public ID populated by Multer upload
  },
  status: {
    type: String,
    enum: ['Applied', 'Shortlisted', 'Interview', 'Offered', 'Rejected'],
    default: 'Applied'
  }
}, { timestamps: true });

module.exports = mongoose.model('Application', applicationSchema);