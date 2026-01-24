import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import { AuthService } from '../services/authService.js';
import {
  registerSchema,
  loginSchema,
  resetPasswordSchema,
  changePasswordSchema,
} from '../utils/validators.js';

export const authController = {
  /**
   * POST /api/auth/register
   * Inscription d'un nouvel utilisateur
   */
  register: asyncHandler(async (req: Request, res: Response) => {
    const { email, password } = registerSchema.parse(req.body);

    const result = await AuthService.register(email, password);

    res.status(201).json({
      success: true,
      data: result,
    });
  }),

  /**
   * POST /api/auth/login
   * Connexion d'un utilisateur
   */
  login: asyncHandler(async (req: Request, res: Response) => {
    const { email, password } = loginSchema.parse(req.body);

    const result = await AuthService.login(email, password);

    res.json({
      success: true,
      data: result,
    });
  }),

  /**
   * POST /api/auth/refresh
   * Rafraîchir l'access token
   */
  refresh: asyncHandler(async (req: Request, res: Response) => {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      res.status(400).json({
        success: false,
        error: 'Refresh token is required',
      });
      return;
    }

    const result = await AuthService.refreshAccessToken(refreshToken);

    res.json({
      success: true,
      data: result,
    });
  }),

  /**
   * POST /api/auth/logout
   * Déconnexion (révocation du refresh token)
   */
  logout: asyncHandler(async (req: Request, res: Response) => {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      res.status(400).json({
        success: false,
        error: 'Refresh token is required',
      });
      return;
    }

    await AuthService.logout(refreshToken);

    res.json({
      success: true,
      message: 'Logged out successfully',
    });
  }),

  /**
   * POST /api/auth/request-reset
   * Demander un reset de mot de passe
   */
  requestPasswordReset: asyncHandler(async (req: Request, res: Response) => {
    const { email } = resetPasswordSchema.parse(req.body);

    const result = await AuthService.requestPasswordReset(email);

    res.json({
      success: true,
      data: result,
    });
  }),

  /**
   * POST /api/auth/reset-password
   * Réinitialiser le mot de passe
   */
  resetPassword: asyncHandler(async (req: Request, res: Response) => {
    const { token, newPassword } = changePasswordSchema.parse(req.body);

    const result = await AuthService.resetPassword(token, newPassword);

    res.json({
      success: true,
      data: result,
    });
  }),

  /**
   * GET /api/auth/me
   * Récupérer les infos de l'utilisateur connecté
   */
  getCurrentUser: asyncHandler(async (req: Request, res: Response) => {
    res.json({
      success: true,
      data: {
        userId: req.userId,
        email: req.userEmail,
      },
    });
  }),
};
