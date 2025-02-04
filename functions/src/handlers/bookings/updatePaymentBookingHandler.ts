import { Request, Response } from 'express';
import { BookingValidator } from '../../validators/BookingValidator';
import { z } from 'zod';
import { BookingsCollection } from '../../database/collections/BookingsCollection';
import { container } from 'tsyringe';
import { DITokens } from '../../di-tokens';
import { UsersService } from '../../services/UsersService';

/**
 * Confirm as Paid an existing booking in the database.
 * @param {Request} req - The request object.
 * @param {Response} res - The response object.
 * @return {Promise<void>} The response with the created booking ID.
 */
export async function updatePaymentBookingHandler(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    try {
        const BookingsCollection = container.resolve<BookingsCollection>(DITokens.bookingsCollection);
        const UserService = container.resolve<UsersService>(DITokens.userService);

        const item = await BookingsCollection.getItemById(id, UserService.getUserUIDdByHeader(req), UserService.getUserRoledByHeader(req));
        if (!item) {
            res.status(404).json({ message: 'Booking not found' });
            return;
        }

        await BookingsCollection.updateItem(
            id,
            {
                isPaid: true,
                status: BookingValidator.StatusSchema.enum.confirmed
            },
            UserService.getUserUIDdByHeader(req),
            UserService.getUserRoledByHeader(req)
        );

        res.status(204).json(null);
    } catch (error: any) {
        if (error instanceof z.ZodError) {
            res.status(400).json({
                message: 'Input data not valid',
                errors: error.errors,
            });
        }
        res.status(500).json({ error: error?.message });
    }
}
