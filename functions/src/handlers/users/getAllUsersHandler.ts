import { Request, Response } from 'express';
import { container } from 'tsyringe';
import { DITokens } from '../../di-tokens';
import { UsersService } from '../../services/UsersService';

/**
 * Get all rooms from the database.
 * @param {Request} req - The request object.
 * @param {Response} res - The response object.
 * @return {Promise<void>} The response with the list of rooms.
 */
export async function getAllUsersHandler(req: Request, res: Response): Promise<void> {
    const { pageSize, pageToken } = req.query;

    try {
        const defaultPageSize = Number(pageSize) ?? 50;
        const UsersService = container.resolve<UsersService>(DITokens.userService);
        const users = await UsersService.getUsersList(defaultPageSize, String(pageToken));
        res.status(200).json({ data: users });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
}
