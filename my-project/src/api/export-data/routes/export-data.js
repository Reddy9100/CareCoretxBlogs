module.exports = {
    routes: [
      {
        method: 'GET',
        path: '/export-data',
        handler: 'export-data.exportAndUpload',
        config: {
          policies: [],
          middlewares: [],
        },
      },
    ],
  };
  