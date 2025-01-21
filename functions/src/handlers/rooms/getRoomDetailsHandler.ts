import { Request, Response } from 'express';
import { container } from 'tsyringe';
import { RoomsCollection } from '../../database/collections/RoomsCollection';
import { IRoomType } from '../../models/room.model';
import { DITokens } from '../../di-tokens';

/**
 * Get a room by tiem in the database.
 * @param {Request} req - The request object.
 * @param {Response} res - The response object.
 * @return {Promise<void>} The response with the created booking ID.
 */
export async function getRoomDetailsHandler(req: Request, res: Response): Promise<void> {
    const { type } = req.query;

    if (!type) {
        res.status(400).json({ message: `type param is required` });
    }

    try {
        const RoomsCollection = container.resolve<RoomsCollection>(DITokens.roomsCollection);
        const item = await RoomsCollection.getItemByType(type as IRoomType);
        if (!item) {
            res.status(404).json({ message: `Room ${type} not found` });
            return;
        }

        res.status(200).json(item);
    } catch (error: any) {
        res.status(500).json({ error: error?.message });
    }
}
