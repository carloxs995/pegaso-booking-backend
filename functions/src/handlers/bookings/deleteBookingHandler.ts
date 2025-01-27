import { Request, Response } from 'express';
import { BookingsCollection } from '../../database/collections/BookingsCollection';
import { container } from 'tsyringe';
import { DITokens } from '../../di-tokens';
import { UsersService } from '../../services/UsersService';

/**
 * Delete an existing booking from the database.
 * @param {Request} req - The request object.
 * @param {Response} res - The response object.
 * @return {Promise<void>} The response with the created booking ID.
 */
export async function deleteBookingHandler(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const { hardDelete } = req.body;
    try {
        const BookingsCollection = container.resolve<BookingsCollection>(DITokens.bookingsCollection);
        const UserService = container.resolve<UsersService>(DITokens.userService);
        await BookingsCollection.deleteItem(id, UserService.getUserUIDdByHeader(req), UserService.getUserRoledByHeader(req), hardDelete);
        res.status(204).json(null);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
}
