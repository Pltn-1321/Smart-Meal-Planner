import { Request, Response, NextFunction } from 'express';
import { TokenService } from '../services/tokenService.js';
import { AuthenticationError } from '../utils/errors.js';

// Étendre l'interface Request pour inclure userId
declare global {
  namespace Express {
    interface Request {
      userId?: string;
      userEmail?: string;
    }
  }
}

/**
 * Middleware d'authentification JWT
 * Vérifie la présence et la validité du token dans le header Authorization
 */
export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Récupérer le token du header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AuthenticationError('No token provided');
    }

    const token = authHeader.substring(7); // Enlever "Bearer "

    // Vérifier le token
    const payload = TokenService.verifyAccessToken(token);

    // Attacher les infos utilisateur à la requête
    req.userId = payload.userId;
    req.userEmail = payload.email;

    next();
  } catch (error) {
    next(new AuthenticationError('Invalid or expired token'));
  }
};

/**
 * Middleware optionnel d'authentification
 * N'échoue pas si pas de token, mais l'attache quand même si présent
 */
export const optionalAuthenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const payload = TokenService.verifyAccessToken(token);
      req.userId = payload.userId;
      req.userEmail = payload.email;
    }

    next();
  } catch (error) {
    // On ignore les erreurs et on continue sans authentification
    next();
  }
};
