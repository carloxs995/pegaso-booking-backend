import {dbFirestore} from '../..';
import {Request, Response} from 'express';

/**
 * Get an existing booking by ID in the database.
 * @param {Request} req - The request object.
 * @param {Response} res - The response object.
 * @return {Promise<void>} The response with the created booking ID.
 */
export async function getBookingDetailsHandler(req: Request, res: Response): Promise<void> {
  const {id} = req.params;
  try {
    const doc = await dbFirestore.collection('bookings').doc(id).get();
    if (!doc.exists) {
      res.status(404).json({message: 'Prenotazione non trovata'});
    }
    res.status(200).json({id: doc.id, ...doc.data()});
  } catch (error: any) {
    console.error('Errore GET /bookings/:id:', error);
    res.status(500).json({error: error?.message});
  }
}
