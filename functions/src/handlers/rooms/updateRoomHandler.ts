import { Request, Response } from 'express';
import { z } from 'zod';
import { container } from 'tsyringe';
import { DITokens } from '../../di-tokens';
import { RoomValidator } from '../../validators/RoomValidator';
import { RoomsCollection } from '../../database/collections/RoomsCollection';

/**
 * Update an existing rooms in the database.
 * @param {Request} req - The request object.
 * @param {Response} res - The response object.
 * @return {Promise<void>} The response with the created booking ID.
 */
export async function updateRoomHandler(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    try {
        const RoomValidator = container.resolve<RoomValidator>(DITokens.roomValidator);
        const RoomsCollection = container.resolve<RoomsCollection>(DITokens.roomsCollection);
        const data = RoomValidator.parseUpdate(req.body);

        await RoomsCollection.updateItem(id, data);
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
