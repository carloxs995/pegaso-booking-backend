import { Request, Response } from 'express';
import { BookingValidator } from '../../validators/BookingValidator';
import { z } from 'zod';
import { BookingsCollection } from '../../database/collections/BookingsCollection';
import { container } from 'tsyringe';
import { DITokens } from '../../di-tokens';

/**
 * Update an existing booking in the database.
 * @param {Request} req - The request object.
 * @param {Response} res - The response object.
 * @return {Promise<void>} The response with the created booking ID.
 */
export async function updateBookingHandler(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    try {
        const BookingValidator = container.resolve<BookingValidator>(DITokens.bookingValidator);
        const BookingsCollection = container.resolve<BookingsCollection>(DITokens.bookingsCollection);

        //TODO: add check if booking is related to UserId
        const data = BookingValidator.parseUpdate(req.body);
        await BookingsCollection.updateItem(id, data);
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
