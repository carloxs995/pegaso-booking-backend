import {dbFirestore} from '../..';
import {Request, Response} from 'express';

/**
 * Delete an existing booking from the database.
 * @param {Request} req - The request object.
 * @param {Response} res - The response object.
 * @return {Promise<void>} The response with the created booking ID.
 */
export async function deleteBookingHandler(req: Request, res: Response): Promise<void> {
  const {id} = req.params;
  try {
    await dbFirestore.collection('bookings').doc(id).delete();
    res.status(200).json({message: 'Prenotazione eliminata'});
  } catch (error: any) {
    console.error('Errore DELETE /bookings/:id:', error);
    res.status(500).json({error: error.message});
  }
}
