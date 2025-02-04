import swaggerJsdoc from 'swagger-jsdoc';
// import swaggerUi from 'swagger-ui-express';

const options: swaggerJsdoc.Options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Umurava Skills Challenge API',
            version: '1.0.0',
            description: 'API documentation for the Umurava Skills Challenge',
        },
        servers: [
            {
                url: `http://localhost:${process.env.PORT}`,
            },
        ],
    },
    apis: [
        './src/routes/*.ts',
        './src/routes/admin/*.ts',
        './src/routes/participant/*.ts'
    ], // Path to the API docs
};

const specs = swaggerJsdoc(options);
export default specs;
