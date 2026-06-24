import { FastifyRequest, FastifyReply } from "fastify";
import { prisma } from "../../db/client.js";
import { GenerateBlueprintInput } from "./blueprint.schema.js";
import { AppError, NotFoundError, ForbiddenError } from "../../lib/errors.js";
import { logger } from "../../lib/logger.js";
import { captureEvent } from "../dashboard/dashboard.service.js";
import { generateBlueprintWithFallback } from "../../services/ai/provider.js";

export async function generateBlueprintHandler(
  request: FastifyRequest<{ Body: GenerateBlueprintInput }>,
  reply: FastifyReply,
): Promise<void> {
  const requestId = request.id;
  const { startupId, prompt } = request.body;
  const userId = request.user!.userId;

  try {
    logger.info({ requestId }, "[BP2] startup lookup start");
    const startup = await prisma.startup.findUnique({
      where: { id: startupId },
      select: { userId: true, description: true },
    });
    logger.info({ requestId, found: !!startup }, "[BP2] startup lookup done");

    if (!startup) {
      logger.warn({ requestId, startupId }, "[BP2] startup not found");
      throw new NotFoundError("Startup");
    }

    const effectivePrompt = prompt ?? startup.description ?? "";
    if (!effectivePrompt || effectivePrompt.length < 10) {
      logger.warn({ requestId, startupId }, "[BP3] prompt missing or too short");
      throw new Error("Prompt is required (provide in request or set startup description)");
    }

    logger.info({ requestId, startupId, userId, promptLength: effectivePrompt?.length }, "[BP1] request received");
    logger.info({ requestId, ownerMatch: startup.userId === userId }, "[BP3] ownership check");
    if (startup.userId !== userId) {
      logger.warn({ requestId, startupId, userId }, "[BP3] forbidden");
      throw new ForbiddenError("You do not own this startup");
    }

    logger.info({ requestId }, "[BP4] existing blueprint check");
    const existingBlueprint = await prisma.blueprint.findUnique({
      where: { startupId },
    });
    logger.info({ requestId, exists: !!existingBlueprint }, "[BP4] existing blueprint check done");

    if (existingBlueprint) {
      logger.info({ requestId }, "[BP4] returning existing blueprint");
      await captureEvent(startupId, "BLUEPRINT_GENERATED", { existing: true });
      reply.send({
        blueprint: existingBlueprint,
      });
      return;
    }

    logger.info({ requestId, startupId }, "[SYNC] calling AI provider directly");
    const blueprintContent = await generateBlueprintWithFallback(effectivePrompt);
    logger.info({ requestId, name: blueprintContent.name }, "[SYNC] AI provider returned");

    const blueprint = await prisma.blueprint.create({
      data: {
        startupId,
        content: blueprintContent as unknown as object,
      },
    });

    await captureEvent(startupId, "BLUEPRINT_GENERATED", { blueprintId: blueprint.id });

    logger.info({ requestId, blueprintId: blueprint.id }, "[SYNC] blueprint persisted");

    reply.send({
      blueprint,
    });
  } catch (error: unknown) {
    const e = error as Error;
    const cause = (e as { cause?: unknown }).cause;
    logger.error(
      {
        requestId, err: error, name: e?.name, message: e?.message, stack: e?.stack,
        startupId, userId, promptLength: prompt?.length,
        cause,
      },
      "[BP-ERR] handler failed",
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

  const payload = { blueprint };

  reply.send(payload);
}
