module.exports = {
  apiFolder: 'src/app/api',
  schemaFolders: ['src/app/api'],
  outputFolder: 'src/app/api-docs',
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Alchemi Platform API',
      version: '1.0',
    },
  },
  // You can customize the look of the Swagger UI here
  // see https://github.com/swagger-api/swagger-ui/blob/master/docs/usage/configuration.md
  swaggerUiOptions: {
    docExpansion: 'list',
  },
};