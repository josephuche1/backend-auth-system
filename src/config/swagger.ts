import swaggerJSDoc from "swagger-jsdoc";

export const swaggerSpec = swaggerJSDoc({
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Backend Auth System API",
      version: "1.0.0",
      description: `
REST API for user authentication and authorization.

## Authentication

Most protected endpoints require a **Bearer access token** in the \`Authorization\` header:

\`\`\`
Authorization: Bearer <accessToken>
\`\`\`

Access tokens expire after **15 minutes**. Use \`POST /auth/refresh\` with a valid refresh token to obtain a new access token. Refresh tokens expire after **7 days** and are stored server-side.

## Roles

| Role  | Description                                      |
|-------|--------------------------------------------------|
| user  | Default role assigned on registration            |
| admin | Can access admin-only endpoints (e.g. list users)|

## Rate limiting

\`POST /auth/register\` and \`POST /auth/login\` are limited to **10 requests per IP** every 15 minutes.
      `.trim(),
      contact: {
        name: "API Support",
      },
    },
    servers: [
      {
        url: "http://localhost:3000",
        description: "Local development",
      },
    ],
    tags: [
      {
        name: "Health",
        description: "Service health and status",
      },
      {
        name: "Auth",
        description: "Registration, login, token refresh, and logout",
      },
      {
        name: "Users",
        description: "Authenticated user profile and admin user management",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "Short-lived access token returned from register or login",
        },
      },
      schemas: {
        User: {
          type: "object",
          properties: {
            id: {
              type: "string",
              format: "uuid",
              example: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
            },
            username: {
              type: "string",
              example: "johndoe",
            },
            email: {
              type: "string",
              format: "email",
              example: "john@example.com",
            },
            role: {
              type: "string",
              enum: ["user", "admin"],
              example: "user",
            },
            createdAt: {
              type: "string",
              format: "date-time",
              example: "2026-06-11T06:40:57.897Z",
            },
          },
        },
        RegisterRequest: {
          type: "object",
          required: ["username", "email", "password"],
          properties: {
            username: {
              type: "string",
              minLength: 3,
              example: "johndoe",
              description: "Unique display name (minimum 3 characters)",
            },
            email: {
              type: "string",
              format: "email",
              example: "john@example.com",
            },
            password: {
              type: "string",
              minLength: 6,
              format: "password",
              example: "securePass123",
              description: "Minimum 6 characters",
            },
          },
        },
        LoginRequest: {
          type: "object",
          required: ["email", "password"],
          properties: {
            email: {
              type: "string",
              format: "email",
              example: "john@example.com",
            },
            password: {
              type: "string",
              format: "password",
              example: "securePass123",
            },
          },
        },
        RefreshRequest: {
          type: "object",
          required: ["token"],
          properties: {
            token: {
              type: "string",
              example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
              description: "Refresh token received from register or login",
            },
          },
        },
        LogoutRequest: {
          type: "object",
          required: ["refreshToken"],
          properties: {
            refreshToken: {
              type: "string",
              example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
              description: "Refresh token to revoke",
            },
          },
        },
        AuthResponse: {
          type: "object",
          properties: {
            success: {
              type: "boolean",
              example: true,
            },
            data: {
              type: "object",
              properties: {
                user: {
                  $ref: "#/components/schemas/User",
                },
                accessToken: {
                  type: "string",
                  description: "JWT access token (expires in 15 minutes)",
                  example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
                },
                refreshToken: {
                  type: "string",
                  description: "JWT refresh token (expires in 7 days)",
                  example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
                },
              },
            },
          },
        },
        RefreshResponse: {
          type: "object",
          properties: {
            success: {
              type: "boolean",
              example: true,
            },
            data: {
              type: "object",
              properties: {
                accessToken: {
                  type: "string",
                  example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
                },
              },
            },
          },
        },
        SuccessResponse: {
          type: "object",
          properties: {
            success: {
              type: "boolean",
              example: true,
            },
            data: {
              type: "object",
              description: "Response payload (shape varies by endpoint)",
            },
          },
        },
        ErrorResponse: {
          type: "object",
          properties: {
            success: {
              type: "boolean",
              example: false,
            },
            message: {
              type: "string",
              example: "Invalid credentials",
            },
          },
        },
        ValidationErrorResponse: {
          type: "object",
          properties: {
            success: {
              type: "boolean",
              example: false,
            },
            message: {
              type: "string",
              example: "Validation Failed",
            },
          },
        },
        RateLimitErrorResponse: {
          type: "object",
          properties: {
            success: {
              type: "boolean",
              example: false,
            },
            message: {
              type: "string",
              example: "Too many requests. Please try again later.",
            },
          },
        },
      },
    },
  },
  apis: [
    "./src/app.ts",
    "./src/modules/auth/auth.routes.ts",
    "./src/modules/user/user.routes.ts",
  ],
});
