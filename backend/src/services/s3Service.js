const { S3Client, PutObjectCommand, GetObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const path = require('path');

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

/**
 * Uploads a file buffer directly to AWS S3
 */
const uploadToS3 = async (file) => {
  const fileExtension = path.extname(file.originalname);
  const uniqueKey = `resumes/${Date.now()}_${Math.random().toString(36).substring(2, 9)}${fileExtension}`;

  const command = new PutObjectCommand({
    Bucket: process.env.AWS_S3_BUCKET_NAME,
    Key: uniqueKey,
    Body: file.buffer,
    ContentType: file.mimetype,
  });

  await s3Client.send(command);
  return uniqueKey; // Store the S3 key in MongoDB
};

/**
 * Generates an expiring pre-signed URL to securely access a private S3 file
 */
const getPresignedDownloadUrl = async (s3Key) => {
  const command = new GetObjectCommand({
    Bucket: process.env.AWS_S3_BUCKET_NAME,
    Key: s3Key,
  });

  // Pre-signed URL expires in 15 minutes (900 seconds)
  return await getSignedUrl(s3Client, command, { expiresIn: 900 });
};

module.exports = { uploadToS3, getPresignedDownloadUrl };