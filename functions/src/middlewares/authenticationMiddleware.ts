import { Request, Response, NextFunction } from 'express';
import { UserRole } from '../models/user.model';
import { container } from 'tsyringe';
import { UsersService } from '../services/UsersService';

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

    try {
        const userService = container.resolve<UsersService>(UsersService);
        const userData = await userService.getUser(authHeader);
        const userRole = userData.role;

        if (userRole < minUserRole) {
            throw new Error('User Role not enabled');
        }

        req = userService.setUserUIDOnRequestHeader(req, userData.uid);
        next();
    } catch (error: any) {
        res.status(403).json({ message: `Access not permitted: ${error?.message}` });
    }
}
