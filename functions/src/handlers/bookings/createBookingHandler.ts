import { Request, Response } from 'express';
import { z } from 'zod';
import { BookingValidator } from '../../validators/BookingValidator';
import { BookingsCollection } from '../../database/collections/BookingsCollection';
import { container } from 'tsyringe';
import { RoomsService } from '../../services/RoomsService';
import { DITokens } from '../../di-tokens';

/**
 * Create a new booking in the database.
 * @param {Request} req - The request object.
 * @param {Response} res - The response object.
 * @return {Promise<void>} The response with the created booking ID.
 */
export async function createBookingHandler(req: Request, res: Response): Promise<void> {
    try {
        const BookingValidator = container.resolve<BookingValidator>(DITokens.bookingValidator);
        const RoomService = container.resolve<RoomsService>(DITokens.roomsService);
        const BookingsCollection = container.resolve<BookingsCollection>(DITokens.bookingsCollection);

        const data = await BookingValidator.mapItemWithDefaultValue(
            BookingValidator.parseCreation(req.body)
        );

        if (!(await RoomService.isRoomAvailable(data)).isAvailable) {
            res.status(400).json({ message: 'No room available' });
            return;
        }

        res.status(201).json({ id: await BookingsCollection.addItem(data) });
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
