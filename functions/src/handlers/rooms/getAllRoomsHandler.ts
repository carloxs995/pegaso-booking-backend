import { Request, Response } from 'express';
import { container } from 'tsyringe';
import { RoomsCollection } from '../../database/collections/RoomsCollection';
import { DITokens } from '../../di-tokens';

/**
 * Get all rooms from the database.
 * @param {Request} req - The request object.
 * @param {Response} res - The response object.
 * @return {Promise<void>} The response with the list of rooms.
 */
export async function getAllRoomsHandler(req: Request, res: Response): Promise<void> {
    try {
        const RoomsCollection = container.resolve<RoomsCollection>(DITokens.roomsCollection);
        const rooms = await RoomsCollection.getAllItems();
        res.status(200).json({ data: rooms });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
}
