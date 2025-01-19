import { Request, Response } from 'express';
import { z } from 'zod';
import { RoomValidator } from '../../validators/RoomValidator';
import { RoomsCollection } from '../../database/collections/roomsCollection';

/**
 * Create a new room in the database.
 * @param {Request} req - The request object.
 * @param {Response} res - The response object.
 * @return {Promise<void>} The response with the created booking ID.
 */
export async function createRoomHandler(req: Request, res: Response): Promise<void> {
    try {
        const data = RoomValidator.parseCreation(req.body);

        //Non è possibile creare più stanze dello stesso tipo
        if (await RoomsCollection.getItemPerType(data.type)) {
            res.status(400).json({
                message: `Room ${data.type} is already created`
            });
            return;
        }

        res.status(201).json({ id: await RoomsCollection.addItem(data) });
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
