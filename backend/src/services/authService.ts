import bcrypt from 'bcryptjs';
import { prisma } from '../config/database.js';
import { TokenService, TokenPayload } from './tokenService.js';
import { AuthenticationError, ValidationError } from '../utils/errors.js';

export class AuthService {
  /**
   * Inscription d'un nouvel utilisateur
   */
  static async register(email: string, password: string) {
    // Vérifier si l'utilisateur existe déjà
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ValidationError('Email already registered');
    }

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(password, 10);

    // Créer l'utilisateur
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
      },
      select: {
        id: true,
        email: true,
        createdAt: true,
      },
    });

    // Générer les tokens
    const payload: TokenPayload = {
      userId: user.id,
      email: user.email,
    };

    const accessToken = TokenService.generateAccessToken(payload);
    const refreshToken = TokenService.generateRefreshToken(payload);

    // Stocker le refresh token
    await TokenService.storeRefreshToken(user.id, refreshToken);

    return {
      user,
      accessToken,
      refreshToken,
    };
  }

  /**
   * Connexion d'un utilisateur
   */
  static async login(email: string, password: string) {
    // Trouver l'utilisateur
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new AuthenticationError('Invalid credentials');
    }

    // Vérifier le mot de passe
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new AuthenticationError('Invalid credentials');
    }

    // Générer les tokens
    const payload: TokenPayload = {
      userId: user.id,
      email: user.email,
    };

    const accessToken = TokenService.generateAccessToken(payload);
    const refreshToken = TokenService.generateRefreshToken(payload);

    // Stocker le refresh token
    await TokenService.storeRefreshToken(user.id, refreshToken);

    return {
      user: {
        id: user.id,
        email: user.email,
        createdAt: user.createdAt,
      },
      accessToken,
      refreshToken,
    };
  }

  /**
   * Rafraîchir un access token
   */
  static async refreshAccessToken(refreshToken: string) {
    try {
      // Vérifier le token JWT
      const payload = TokenService.verifyRefreshToken(refreshToken);

      // Vérifier si le token existe en DB et n'est pas expiré
      const isValid = await TokenService.validateRefreshToken(refreshToken);

      if (!isValid) {
        throw new AuthenticationError('Invalid or expired refresh token');
      }

      // Générer un nouveau access token
      const newAccessToken = TokenService.generateAccessToken({
        userId: payload.userId,
        email: payload.email,
      });

      return {
        accessToken: newAccessToken,
      };
    } catch (error) {
      throw new AuthenticationError('Invalid refresh token');
    }
  }

  /**
   * Déconnexion (révocation du refresh token)
   */
  static async logout(refreshToken: string) {
    await TokenService.revokeRefreshToken(refreshToken);
  }

  /**
   * Révoquer tous les tokens d'un utilisateur (pour reset password par exemple)
   */
  static async logoutAllSessions(userId: string) {
    await TokenService.revokeAllUserTokens(userId);
  }

  /**
   * Demander un reset de mot de passe
   * Note: Dans une vraie app, on enverrait un email avec un lien
   * Ici on génère juste un token temporaire
   */
  static async requestPasswordReset(email: string) {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // Ne pas révéler si l'email existe ou non (sécurité)
      return { message: 'If the email exists, a reset link has been sent' };
    }

    // Générer un token de reset (expire dans 1h)
    const resetToken = TokenService.generateAccessToken({
      userId: user.id,
      email: user.email,
    });

    // TODO: Envoyer un email avec le token
    // Pour l'instant, on retourne juste le token (à utiliser uniquement en dev!)
    return {
      message: 'Password reset token generated',
      resetToken: process.env.NODE_ENV === 'development' ? resetToken : undefined,
    };
  }

  /**
   * Réinitialiser le mot de passe avec un token
   */
  static async resetPassword(resetToken: string, newPassword: string) {
    try {
      // Vérifier le token
      const payload = TokenService.verifyAccessToken(resetToken);

      // Hasher le nouveau mot de passe
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      // Mettre à jour le mot de passe
      await prisma.user.update({
        where: { id: payload.userId },
        data: { password: hashedPassword },
      });

      // Révoquer tous les tokens existants
      await TokenService.revokeAllUserTokens(payload.userId);

      return { message: 'Password reset successful' };
    } catch (error) {
      throw new AuthenticationError('Invalid or expired reset token');
    }
  }
}
