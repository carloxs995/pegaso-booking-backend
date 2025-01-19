import { Request, Response } from 'express';
import { BookingCollection } from '../../database/collections/bookingCollection';

/**
 * Get an existing booking by ID in the database.
 * @param {Request} req - The request object.
 * @param {Response} res - The response object.
 * @return {Promise<void>} The response with the created booking ID.
 */
export async function getBookingDetailsHandler(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    try {
        const item = await BookingCollection.getItemById(id);
        if (!item) {
            res.status(404).json({ message: 'Booking not found' });
            return;
        }
        res.status(200).json(item);
    } catch (error: any) {
        res.status(500).json({ error: error?.message });
    }
}
