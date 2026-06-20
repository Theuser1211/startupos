import { FastifyRequest, FastifyReply } from "fastify";
import { prisma } from "../../db/client.js";
import { GenerateBlueprintInput } from "./blueprint.schema.js";
import { NotFoundError, ForbiddenError } from "../../lib/errors.js";
import { logger } from "../../lib/logger.js";
import { getQueue } from "../../queue/setup.js";

export async function generateBlueprintHandler(
  request: FastifyRequest<{ Body: GenerateBlueprintInput }>,
  reply: FastifyReply,
): Promise<void> {
  const { startupId, prompt } = request.body;
  const userId = request.user!.userId;

  try {
    const startup = await prisma.startup.findUnique({
      where: { id: startupId },
      select: { userId: true },
    });

    if (!startup) {
      throw new NotFoundError("Startup");
    }

    if (startup.userId !== userId) {
      throw new ForbiddenError("You do not own this startup");
    }

    const existingBlueprint = await prisma.blueprint.findUnique({
      where: { startupId },
    });

    if (existingBlueprint) {
      reply.send({
        jobId: null,
        blueprint: existingBlueprint,
        message: "Blueprint already exists for this startup",
      });
      return;
    }

    const existingJob = await prisma.job.findFirst({
      where: {
        startupId,
        type: "BLUEPRINT_GENERATION",
        status: { in: ["PENDING", "PROCESSING"] },
      },
    });

    if (existingJob) {
      reply.status(202).send({
        jobId: existingJob.id,
        status: existingJob.status,
        message: "Blueprint generation already in progress",
      });
      return;
    }

    const job = await prisma.job.create({
      data: {
        type: "BLUEPRINT_GENERATION",
        status: "PENDING",
        payload: { startupId, prompt },
        startupId,
      },
    });

    const queue = getQueue();
    try {
      await queue.add("blueprint-generation", {
        jobId: job.id,
        startupId,
        userId,
        type: "BLUEPRINT_GENERATION",
        payload: { prompt },
      });
    } catch (queueError) {
      await prisma.job.update({
        where: { id: job.id },
        data: {
          status: "FAILED",
          error: `Queue add failed: ${queueError instanceof Error ? queueError.message : "Unknown"}`,
        },
      });
      logger.error(
        { err: queueError, jobId: job.id, startupId },
        "Failed to add job to queue",
      );
      throw queueError;
    }

    logger.info({ jobId: job.id, startupId }, "Blueprint generation job queued");

    reply.status(202).send({
      jobId: job.id,
      status: "PENDING",
    });
  } catch (error) {
    logger.error(
      { err: error, startupId, userId, prompt: prompt?.substring(0, 100) },
      "Blueprint generation handler failed",
    );
    throw error;
  }
}

export async function getBlueprintHandler(
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply,
): Promise<void> {
  const { id } = request.params;
  const userId = request.user!.userId;

  const blueprint = await prisma.blueprint.findUnique({
    where: { id },
    include: {
      startup: { select: { userId: true, name: true } },
    },
  });

  if (!blueprint) {
    throw new NotFoundError("Blueprint");
  }

  if (blueprint.startup.userId !== userId) {
    throw new ForbiddenError("You do not own this blueprint");
  }

  reply.send({ blueprint });
}