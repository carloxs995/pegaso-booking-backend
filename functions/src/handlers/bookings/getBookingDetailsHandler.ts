import { Request, Response } from 'express';
import { BookingsCollection } from '../../database/collections/BookingsCollection';
import { container } from 'tsyringe';
import { DITokens } from '../../di-tokens';
import { UsersService } from '../../services/UsersService';

/**
 * Get an existing booking by ID in the database.
 * @param {Request} req - The request object.
 * @param {Response} res - The response object.
 * @return {Promise<void>} The response with the created booking ID.
 */
export async function getBookingDetailsHandler(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    try {
        const BookingsCollection = container.resolve<BookingsCollection>(DITokens.bookingsCollection);
        const UserService = container.resolve<UsersService>(DITokens.userService);

        const item = await BookingsCollection.getItemById(id, UserService.getUserUIDdByHeader(req), UserService.getUserRoledByHeader(req));

        if (!item) {
            res.status(404).json({ message: 'Booking not found' });
            return;
        }
        res.status(200).json(item);
    } catch (error: any) {
        res.status(500).json({ error: error?.message });
    }
}
