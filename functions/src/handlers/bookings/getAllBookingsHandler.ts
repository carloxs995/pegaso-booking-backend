import { Request, Response } from 'express';
import { BookingCollection } from '../../database/collections/bookingCollection';

/**
 * Get all bookings from the database.
 * @param {Request} req - The request object.
 * @param {Response} res - The response object.
 * @return {Promise<void>} The response with the list of bookings.
 */
export async function getAllBookingsHandler(req: Request, res: Response): Promise<void> {
    try {
        const bookings = await BookingCollection.getAllItems();
        res.status(200).json(bookings);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
}
