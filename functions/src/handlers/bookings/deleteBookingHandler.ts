import { Request, Response } from 'express';
import { BookingsCollection } from '../../database/collections/BookingsCollection';
import { DITokens } from '../../di-container';
import { container } from 'tsyringe';

/**
 * Delete an existing booking from the database.
 * @param {Request} req - The request object.
 * @param {Response} res - The response object.
 * @return {Promise<void>} The response with the created booking ID.
 */
export async function deleteBookingHandler(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    try {
        const BookingsCollection = container.resolve<BookingsCollection>(DITokens.bookingCollection);
        await BookingsCollection.deleteItem(id);
        res.status(204).json(null);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
}
