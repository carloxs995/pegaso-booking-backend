import { Request, Response, NextFunction } from 'express';
import * as admin from 'firebase-admin';
import { UserRole } from '../models/user.model';

export async function authenticateFirebaseToken(
    req: Request,
    res: Response,
    next: NextFunction,
    minUserRole: UserRole = UserRole.USER
): Promise<void> {
    const authHeader = req.headers.authorization;

    if (minUserRole === UserRole.GUEST) {
        next();
        return;
    }

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({ message: 'Access Denied' });
        return;
    }

    const idToken = authHeader.split(' ')[1];

    try {
        const userData = await admin.auth().verifyIdToken(idToken);
        const userRole = userData.role;

        if (!userData.email_verified || userRole < minUserRole) {
            throw new Error();
        }

        next();
    } catch (error) {
        res.status(403).json({ message: 'Access not permitted' });
    }
}
