import {Request, Response} from 'express';
import { dbFirestore } from '../../database/firestore';

/**
 * Update an existing booking in the database.
 * @param {Request} req - The request object.
 * @param {Response} res - The response object.
 * @return {Promise<void>} The response with the created booking ID.
 */
export async function updateBookingHandler(req: Request, res: Response): Promise<void> {
  const {id} = req.params;
  const data = req.body;
  try {
    await dbFirestore.collection('bookings').doc(id).update(data);
    res.status(204).json(null);
  } catch (error: any) {
    res.status(500).json({error: error?.message});
  }
}
