const AWS = require('aws-sdk'); // Import AWS SDK

// Create an instance of S3
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

module.exports = {
  lifecycles: {
    // Before creating a new blog
    async beforeCreate(event) {
      const data = event.params.data;

      console.log('Before creating a blog post:', JSON.stringify(data, null, 2));

      const blogData = {
        title: data.Title, // Title of the blog
        subtitle: data.subTitle, // Subtitle of the blog
        desc: data.Description ? data.Description[0]?.children[0]?.text : '', // Rich text description
        img: data.image ? data.image.url : '', // Image URL
        date: data.publishedDate, // Published date
      };

      const fileName = `${data.documentId}.json`; // Generate S3 key
      const blogDataString = JSON.stringify(blogData);

      const uploadParams = {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: `blogs/${fileName}`,
        Body: blogDataString,
        ContentType: 'application/json',
      };

      try {
        const result = await s3.upload(uploadParams).promise();
        console.log('Blog data uploaded to S3:', JSON.stringify(result, null, 2));

        data.s3FileUrl = result.Location; // Save S3 URL back to the data object
      } catch (error) {
        console.error('Error uploading blog data to S3:', error);
      }
    },

    // After updating an existing blog
    async afterUpdate(event) {
      const data = event.result;

      console.log('After updating a blog post:', JSON.stringify(data, null, 2));

      const blogData = {
        title: data.Title, // Title of the blog
        subtitle: data.subTitle, // Subtitle of the blog
        desc: data.Description ? data.Description[0]?.children[0]?.text : '', // Rich text description
        img: data.image ? data.image.url : '', // Image URL
        date: data.publishedDate, // Published date
      };

      const fileName = `${data.documentId}.json`; // Generate S3 key
      const blogDataString = JSON.stringify(blogData);

      const uploadParams = {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: `blogs/${fileName}`,
        Body: blogDataString,
        ContentType: 'application/json',
      };

      try {
        const result = await s3.upload(uploadParams).promise();
        console.log('Updated blog data uploaded to S3:', JSON.stringify(result, null, 2));
      } catch (error) {
        console.error('Error updating blog data in S3:', error);
      }
    },

    // Before deleting a blog
    async beforeDelete(event) {
      const blogId = event.params.where.id;

      console.log('Before deleting a blog post:', blogId);

      // Fetch the blog to get the documentId
      const blog = await strapi.entityService.findOne('api::blog.blog', blogId, {
        fields: ['documentId'],
      });

      if (!blog || !blog.documentId) {
        console.error(`Blog with ID ${blogId} not found or missing documentId. Skipping S3 deletion.`);
        return;
      }

      const fileName = `${blog.documentId}.json`;

      const deleteParams = {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: `blogs/${fileName}`,
      };

      try {
        const result = await s3.deleteObject(deleteParams).promise();
        console.log('Deleted blog data from S3:', JSON.stringify(result, null, 2));
      } catch (error) {
        console.error('Error deleting blog data from S3:', error);
      }
    },
  },
};
