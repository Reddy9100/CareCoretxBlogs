const fs = require('fs');

async function extractStrapiData(strapi) {
  try {
    const data = {};

    // Fetch all content types
    const contentTypes = Object.keys(strapi.contentTypes);

    for (const type of contentTypes) {
      if (!type.startsWith('plugin::')) {
        // Fetch all entries for each content type
        const entries = await strapi.entityService.findMany(type, { populate: '*' });
        data[type] = entries;
      }
    }

    // Save the data locally as a JSON file for upload
    const filePath = './exported-strapi-data.json';
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');

    return { data, filePath };
  } catch (error) {
    console.error('Error extracting data from Strapi:', error);
    throw error;
  }
}

module.exports = extractStrapiData;
