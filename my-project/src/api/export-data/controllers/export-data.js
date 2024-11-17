const extractStrapiData = require('../../../utils/strapi-data-extractor');
const uploadToS3 = require('../../../utils/s3-upload');

module.exports = {
  async exportAndUpload(ctx) {
    try {
      // Step 1: Extract all data from Strapi
      const { data, filePath } = await extractStrapiData(strapi);

      // Step 2: Upload the extracted data to S3
      const bucket = process.env.AWS_BUCKET_NAME;
      const key = `backups/strapi-data-${Date.now()}.json`;
      const fileUrl = await uploadToS3({ bucket, key, filePath });

      // Step 3: Respond with the S3 file URL
      ctx.send({
        message: 'Data exported and uploaded successfully',
        fileUrl,
      });
    } catch (error) {
      console.error('Export and Upload Error:', error);
      ctx.throw(500, 'Failed to export and upload data');
    }
  },
};
