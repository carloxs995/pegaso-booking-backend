import { Request, Response } from 'express';
import { BookingsCollection } from '../../database/collections/BookingsCollection';
import { container } from 'tsyringe';
import { DITokens } from '../../di-tokens';

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
        const item = await BookingsCollection.getItemById(id);
        if (!item) {
            res.status(404).json({ message: 'Booking not found' });
            return;
        }
        res.status(200).json(item);
    } catch (error: any) {
        res.status(500).json({ error: error?.message });
    }
}
