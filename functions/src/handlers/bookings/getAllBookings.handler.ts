import {Request, Response} from 'express';
import {dbFirestore} from '../..';

/**
 * Get all bookings from the database.
 * @param {Request} req - The request object.
 * @param {Response} res - The response object.
 * @return {Promise<void>} The response with the list of bookings.
 */
export const getAllBookingsHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const snapshot = await dbFirestore.collection('bookings').get();
    const bookings: { id: string;[key: string]: any }[] = [];
    snapshot.forEach((doc) => {
      bookings.push({id: doc.id, ...doc.data()});
    });
    res.status(200).json(bookings);
  } catch (error: any) {
    console.error('Errore GET /bookings:', error);
    res.status(500).json({error: error.message});
  }
};
