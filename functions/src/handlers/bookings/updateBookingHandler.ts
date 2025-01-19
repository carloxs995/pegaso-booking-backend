import { Request, Response } from 'express';
import { BookingValidator } from '../../validators/BookingValidator';
import { z } from 'zod';
import { BookingCollection } from '../../database/collections/bookingCollection';

/**
 * Update an existing booking in the database.
 * @param {Request} req - The request object.
 * @param {Response} res - The response object.
 * @return {Promise<void>} The response with the created booking ID.
 */
export async function updateBookingHandler(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const data = req.body;
    try {
        BookingValidator.parseUpdate(data);
        await BookingCollection.updateItem(id, data);
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
