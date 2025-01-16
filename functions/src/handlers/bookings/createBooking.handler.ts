import {dbFirestore} from '../..';
import {Request, Response} from 'express';

/**
 * Create a new booking in the database.
 * @param {Request} req - The request object.
 * @param {Response} res - The response object.
 * @return {Promise<void>} The response with the created booking ID.
 */
export async function createBookingHandler(req: Request, res: Response): Promise<void> {
  try {
    // Esempio di body: { name: 'Mario Rossi', date: '2023-12-01', ... }
    const data = req.body;
    // Se vuoi fare validazione, puoi farlo qui prima di salvare.
    const docRef = await dbFirestore.collection('bookings').add(data);
    res.status(201).json({id: docRef.id});
  } catch (error: any) {
    console.error('Errore POST /bookings:', error);
    res.status(500).json({error: error?.message});
  }
}
