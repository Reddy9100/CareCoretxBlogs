import AWS from 'aws-sdk';

export default {
  async bootstrap() {
    const s3 = new AWS.S3({
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      region: process.env.AWS_REGION,
    });

    // Ensure S3 is configured properly
    if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY || !process.env.AWS_BUCKET_NAME) {
      strapi.log.error("S3 configuration is missing. Please check your environment variables.");
      return;
    }

    // Subscribe to lifecycle events
    strapi.db.lifecycles.subscribe({
      models: ['api::blog.blog'], // Specify your content-type name (e.g., blog)

      // After Create Event
      async afterCreate(event) {
        const { result } = event;

        // Prepare structured description
        const structuredDescription = result.Description?.map((item: any) => {
          return {
            type: item.type || "paragraph", // e.g., "heading" or "paragraph"
            content: item.children?.map((child: any) => child.text).join(" ") || "",
          };
        }) || [];

        // Prepare the blog data
        const blogData = {
          id: result.id,
          title: result.Title || null,
          subtitle: result.subTitle || null,
          description: structuredDescription, // Structured description
          image: result.image ? result.image.url : null,
          publishDate: result.publishedDate,
          createdAt: result.createdAt,
          updatedAt: result.updatedAt,
        };

        // S3 upload parameters
        const params: AWS.S3.PutObjectRequest = {
          Bucket: process.env.AWS_BUCKET_NAME as string,
          Key: `blogs/${result.id}.json`,
          Body: JSON.stringify(blogData, null, 2),
          ContentType: 'application/json',
        };

        try {
          await s3.upload(params).promise();
          strapi.log.info(`Blog ID ${result.id} successfully uploaded to S3`);
        } catch (error: any) {
          strapi.log.error(`Error uploading Blog ID ${result.id}: ${error.message}`);
        }
      },

      // After Update Event
      async afterUpdate(event) {
        const { result } = event;

        // Prepare structured description
        const structuredDescription = result.Description?.map((item: any) => {
          return {
            type: item.type || "paragraph", // e.g., "heading" or "paragraph"
            content: item.children?.map((child: any) => child.text).join(" ") || "",
          };
        }) || [];

        // Prepare the blog data
        const blogData = {
          id: result.id,
          title: result.Title || null,
          subtitle: result.subTitle || null,
          description: structuredDescription, // Structured description
          image: result.image ? result.image.url : null,
          publishDate: result.publishedDate,
          createdAt: result.createdAt,
          updatedAt: result.updatedAt,
        };

        // S3 upload parameters
        const params: AWS.S3.PutObjectRequest = {
          Bucket: process.env.AWS_BUCKET_NAME as string,
          Key: `blogs/${result.id}.json`,
          Body: JSON.stringify(blogData, null, 2),
          ContentType: 'application/json',
        };

        try {
          await s3.upload(params).promise();
          strapi.log.info(`Blog ID ${result.id} successfully updated in S3`);
        } catch (error: any) {
          strapi.log.error(`Error updating Blog ID ${result.id}: ${error.message}`);
        }
      },

      // Before Delete Event
      async beforeDelete(event) {
        const { where } = event.params;

        // Assuming 'where.id' is the blog ID to delete
        const blogId = where.id;

        if (!blogId) {
          strapi.log.error('Blog ID not found for deletion.');
          return;
        }

        // S3 delete parameters
        const params: AWS.S3.DeleteObjectRequest = {
          Bucket: process.env.AWS_BUCKET_NAME as string,
          Key: `blogs/${blogId}.json`,
        };

        try {
          await s3.deleteObject(params).promise();
          strapi.log.info(`Blog ID ${blogId} successfully deleted from S3`);
        } catch (error: any) {
          strapi.log.error(`Error deleting Blog ID ${blogId} from S3: ${error.message}`);
        }
      },
    });
  },
};
