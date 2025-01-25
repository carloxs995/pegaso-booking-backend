import { Request, Response } from 'express';
import { container } from 'tsyringe';
import { RoomsCollection } from '../../database/collections/RoomsCollection';
import { DITokens } from '../../di-tokens';
import { RoomValidator } from '../../validators/RoomValidator';
import { z } from 'zod';
import { RoomFilter } from '../../models/room.model';

/**
 * Get all rooms from the database.
 * @param {Request} req - The request object.
 * @param {Response} res - The response object.
 * @return {Promise<void>} The response with the list of rooms.
 */
export async function getAllRoomsHandler(req: Request, res: Response): Promise<void> {
    const { serviceType, checkOutDate, checkInDate, guests } = req.query as unknown as RoomFilter;
    try {
        const RoomsCollection = container.resolve<RoomsCollection>(DITokens.roomsCollection);
        const RoomsValidators = container.resolve<RoomValidator>(DITokens.roomValidator);
        const filters = RoomsValidators.parseFilters({ serviceType, checkOutDate, checkInDate, guests });
        const rooms = await RoomsCollection.getAllItems(filters);
        res.status(200).json({ data: rooms });
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
