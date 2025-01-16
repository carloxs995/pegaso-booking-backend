import {dbFirestore} from '../..';
import {Request, Response} from 'express';

/**
 * Update an existing booking in the database.
 * @param {Request} req - The request object.
 * @param {Response} res - The response object.
 * @return {Promise<void>} The response with the created booking ID.
 */
export async function updateBooking(req: Request, res: Response): Promise<void> {
  const {id} = req.params;
  const data = req.body;
  try {
    await dbFirestore.collection('bookings').doc(id).update(data);
    res.status(200).json({message: 'Prenotazione aggiornata'});
  } catch (error: any) {
    console.error('Errore PUT /bookings/:id:', error);
    res.status(500).json({error: error.message});
  }
}
