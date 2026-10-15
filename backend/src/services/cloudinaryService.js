const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');

// Configure Cloudinary with environment variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

/**
 * Uploads a file buffer directly to Cloudinary
 * @param {Object} file - Multer file object
 * @returns {Promise<string>} - Cloudinary Public ID
 */
const uploadToCloudinary = (file) => {
  return new Promise((resolve, reject) => {
    const isDoc = file.mimetype.includes('word') || (file.originalname && /\.docx?$/i.test(file.originalname));
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: 'intellihire_resumes',
        resource_type: isDoc ? 'raw' : 'auto', // Auto handles pdf as image
        use_filename: true,
      },
      (error, result) => {
        if (error) return reject(error);
        // Resolve with public_id (stored in MongoDB as Application.resumeUrl)
        resolve(result.public_id);
      }
    );

    // Pipe the memory buffer into the Cloudinary upload stream
    streamifier.createReadStream(file.buffer).pipe(uploadStream);
  });
};

/**
 * Generates an expiring download/view URL for candidate resumes
 * @param {string} publicId - Cloudinary Public ID stored in MongoDB
 * @param {boolean} [inline=false] - If true, omits attachment flag to allow iframe preview
 * @returns {string} - Signed Cloudinary URL
 */
const getPresignedDownloadUrl = (publicId, inline = false) => {
  // Detect if raw document (.docx, .doc) or image/pdf
  const isRaw = /\.docx?$|\.doc$/i.test(publicId);
  const resourceType = isRaw ? 'raw' : 'image';

  const options = {
    resource_type: resourceType,
    sign_url: true,
    expires_at: Math.floor(Date.now() / 1000) + 900,
    secure: true,
  };

  // Only force attachment header if download is desired, otherwise allow inline iframe render
  if (!inline) {
    options.flags = 'attachment';
  }

  return cloudinary.url(publicId, options);
};

module.exports = {
  uploadToCloudinary,
  getPresignedDownloadUrl,
};