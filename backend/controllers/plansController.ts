import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import { prisma } from '../config/database.js';
import { savePlanSchema } from '../utils/validators.js';
import { NotFoundError, ForbiddenError } from '../utils/errors.js';

export const plansController = {
  /**
   * GET /api/plans
   * Récupérer tous les plans de l'utilisateur
   */
  getAll: asyncHandler(async (req: Request, res: Response) => {
    const plans = await prisma.savedPlan.findMany({
      where: { userId: req.userId! },
      orderBy: { updatedAt: 'desc' },
    });

    res.json({
      success: true,
      data: plans,
    });
  }),

  /**
   * GET /api/plans/:id
   * Récupérer un plan spécifique
   */
  getById: asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    const plan = await prisma.savedPlan.findUnique({
      where: { id },
    });

    if (!plan) {
      throw new NotFoundError('Plan not found');
    }

    if (plan.userId !== req.userId) {
      throw new ForbiddenError('Access denied');
    }

    res.json({
      success: true,
      data: plan,
    });
  }),

  /**
   * POST /api/plans
   * Créer un nouveau plan
   */
  create: asyncHandler(async (req: Request, res: Response) => {
    const validatedData = savePlanSchema.parse(req.body);

    const plan = await prisma.savedPlan.create({
      data: {
        userId: req.userId!,
        ...validatedData,
      },
    });

    res.status(201).json({
      success: true,
      data: plan,
    });
  }),

  /**
   * PUT /api/plans/:id
   * Mettre à jour un plan
   */
  update: asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const validatedData = savePlanSchema.parse(req.body);

    const existingPlan = await prisma.savedPlan.findUnique({
      where: { id },
    });

    if (!existingPlan) {
      throw new NotFoundError('Plan not found');
    }

    if (existingPlan.userId !== req.userId) {
      throw new ForbiddenError('Access denied');
    }

    const plan = await prisma.savedPlan.update({
      where: { id },
      data: validatedData,
    });

    res.json({
      success: true,
      data: plan,
    });
  }),

  /**
   * DELETE /api/plans/:id
   * Supprimer un plan
   */
  delete: asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    const existingPlan = await prisma.savedPlan.findUnique({
      where: { id },
    });

    if (!existingPlan) {
      throw new NotFoundError('Plan not found');
    }

    if (existingPlan.userId !== req.userId) {
      throw new ForbiddenError('Access denied');
    }

    await prisma.savedPlan.delete({
      where: { id },
    });

    res.json({
      success: true,
      message: 'Plan deleted successfully',
    });
  }),
};
