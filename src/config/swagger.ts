import swaggerJSDoc from "swagger-jsdoc";


export const swaggerSpec = swaggerJSDoc({
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Auth API",
      version: "1.0.0",
    },
  },
  apis: ["./src/modules/auth/auth.routes.ts", "./src/modules/user/user.routes.ts"],
});