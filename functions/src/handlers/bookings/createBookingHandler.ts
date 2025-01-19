import { Request, Response } from 'express';
import { z } from 'zod';
import { BookingValidator } from '../../validators/BookingValidator';
import { BookingCollection } from '../../database/collections/bookingsCollection';
import { RoomValidator } from '../../validators/RoomValidator';

/**
 * Create a new booking in the database.
 * @param {Request} req - The request object.
 * @param {Response} res - The response object.
 * @return {Promise<void>} The response with the created booking ID.
 */
export async function createBookingHandler(req: Request, res: Response): Promise<void> {
    try {
        const data = BookingValidator.mapItemWithDefaultValue(
            BookingValidator.parseCreation(req.body)         //TODO: set servicePrice param: price according to roomType selected and guests selected

        );
        if (!(await RoomValidator.isRoomAvailable(data))) {
            res.status(400).json({ message: 'No room available' });
        }
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
