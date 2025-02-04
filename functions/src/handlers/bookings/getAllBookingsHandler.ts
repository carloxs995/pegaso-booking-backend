import { Request, Response } from 'express';
import { container } from 'tsyringe';
import { BookingsCollection } from '../../database/collections/BookingsCollection';
import { DITokens } from '../../di-tokens';
import { BookingValidator } from '../../validators/BookingValidator';
import { z } from 'zod';
import { UsersService } from '../../services/UsersService';

/**
 * Get all bookings from the database.
 * @param {Request} req - The request object.
 * @param {Response} res - The response object.
 * @return {Promise<void>} The response with the list of bookings.
 */
export async function getAllBookingsHandler(req: Request, res: Response): Promise<void> {
    try {
        const BookingValidator = container.resolve<BookingValidator>(DITokens.bookingValidator);
        const BookingsCollection = container.resolve<BookingsCollection>(DITokens.bookingsCollection);
        const UserService = container.resolve<UsersService>(DITokens.userService);

        const filters = BookingValidator.parseFilters(req.query);
        const bookings = await BookingsCollection.getAllItems(filters, UserService.getUserUIDdByHeader(req), UserService.getUserRoledByHeader(req));
        res.status(200).json({ data: bookings });
    } catch (error: any) {
        if (error instanceof z.ZodError) {
            res.status(400).json({
                message: 'Input data not valid',
                errors: error.errors,
            });
        }
        res.status(500).json({ error: error.message });
    }
}
