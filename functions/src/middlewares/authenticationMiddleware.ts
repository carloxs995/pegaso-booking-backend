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
    // Estrae l'header di autorizzazione dalla richiesta
    const authHeader = req.headers.authorization;

    // Se il ruolo minimo richiesto è GUEST, permette l'accesso senza ulteriori controlli
    if (minUserRole === UserRole.GUEST) {
        next();
        return;
    }

    // Verifica se l'header di autorizzazione è presente
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        // Se l'header non è valido, restituisce un errore 401 (Accesso negato)
        res.status(401).json({ message: 'Access Denied' });
        return;
    }

    try {
        // Risolve l'istanza di UsersService dal contenitore di dipendenze
        const userService = container.resolve<UsersService>(UsersService);

        // Ottiene i dati dell'utente utilizzando l'header di autorizzazione
        const userData = await userService.getUser(authHeader);
        const userRole = userData.role;

        // Verifica se il ruolo dell'utente è sufficiente per accedere alla risorsa
        if (userRole < minUserRole) {
            throw new Error('User Role not enabled');
        }

        // Imposta l'UID dell'utente nell'header della richiesta
        req = userService.setUserUIDOnRequestHeader(req, userData.id, userRole);

        // Passa al middleware successivo
        next();
    } catch (error: any) {
        // In caso di errore, restituisce un errore 403 (Accesso non permesso)
        res.status(403).json({ message: `Access not permitted: ${error?.message}` });
    }
}
