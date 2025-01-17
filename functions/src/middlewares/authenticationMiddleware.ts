import { Request, Response, NextFunction } from 'express';
import * as admin from 'firebase-admin';

export const authenticateFirebaseToken = async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({ message: 'Accesso negato. Token mancante.' });
        return;
    }

    const idToken = authHeader.split(' ')[1];

    try {
        await admin.auth().verifyIdToken(idToken);
        next();
    } catch (error) {
        console.error('Errore nella verifica del token:', error);
        res.status(401).json({ message: 'Token not valid' });
    }
}
