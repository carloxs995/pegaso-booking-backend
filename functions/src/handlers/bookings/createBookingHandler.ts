import { Request, Response } from 'express';
import { z } from 'zod';
import { BookingValidator } from '../../validators/BookingValidator';
import { IBookingBase } from '../../models/booking.model';
import { BookingCollection } from '../../database/collections/bookingCollection';

/**
 * Create a new booking in the database.
 * @param {Request} req - The request object.
 * @param {Response} res - The response object.
 * @return {Promise<void>} The response with the created booking ID.
 */
export async function createBookingHandler(req: Request<any, any, IBookingBase>, res: Response): Promise<void> {
    try {
        const data = BookingValidator.parseCreation(req.body);
        res.status(201).json({ id: await BookingCollection.addItem(data) });
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
