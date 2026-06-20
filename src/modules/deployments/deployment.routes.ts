import { FastifyInstance } from "fastify";
import { createDeploymentHandler, getDeploymentHandler } from "./deployment.handler.js";
import { authenticate } from "../../middleware/auth.js";

const deploymentResponse = {
  type: "object",
  properties: {
    id: { type: "string" },
    status: { type: "string" },
    url: { type: ["string", "null"] },
    provider: { type: ["string", "null"] },
    error: { type: ["string", "null"] },
    createdAt: { type: "string", format: "date-time" },
    updatedAt: { type: "string", format: "date-time" },
    websiteId: { type: "string" },
  },
};

export async function deploymentRoutes(app: FastifyInstance): Promise<void> {
  app.addHook("preHandler", authenticate);

  app.post("/deployments/create", {
    schema: {
      tags: ["Deployments"],
      description: "Create a deployment for a website",
      security: [{ bearerAuth: [] }],
      body: {
        type: "object",
        required: ["websiteId"],
        properties: {
          websiteId: { type: "string", format: "uuid" },
        },
      },
      response: {
        202: {
          type: "object",
          properties: {
            jobId: { type: "string" },
            status: { type: "string" },
          },
        },
      },
    },
  }, createDeploymentHandler);

  app.get("/deployments/:id", {
    schema: {
      tags: ["Deployments"],
      description: "Get deployment by ID",
      security: [{ bearerAuth: [] }],
      params: {
        type: "object",
        required: ["id"],
        properties: {
          id: { type: "string", format: "uuid" },
        },
      },
      response: {
        200: {
          type: "object",
          properties: {
            deployment: deploymentResponse,
          },
        },
      },
    },
  }, getDeploymentHandler);
}