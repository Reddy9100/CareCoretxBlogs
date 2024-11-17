const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

async function uploadToS3({ bucket, key, filePath }) {
  try {
    const fs = require('fs');
    const fileStream = fs.createReadStream(filePath);

    const params = {
      Bucket: bucket,
      Key: key,
      Body: fileStream,
      ContentType: 'application/json',
    };

    const command = new PutObjectCommand(params);
    const response = await s3.send(command);
    console.log('S3 Upload Success:', response);
    return `https://${bucket}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
  } catch (error) {
    console.error('S3 Upload Error:', error);
    throw error;
  }
}

module.exports = uploadToS3;
