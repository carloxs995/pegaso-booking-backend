import { Router } from 'express';
import { getAllBookingsHandler } from '../handlers/bookings/getAllBookingsHandler';
import { getBookingDetailsHandler } from '../handlers/bookings/getBookingDetailsHandler';
import { createBookingHandler } from '../handlers/bookings/createBookingHandler';
import { updateBookingHandler } from '../handlers/bookings/updateBookingHandler';
import { deleteBookingHandler } from '../handlers/bookings/deleteBookingHandler';
import { authenticateFirebaseToken } from '../middlewares/authenticationMiddleware';

const bookingsRouter = Router();

// GET /bookings
bookingsRouter.get('/', authenticateFirebaseToken, getAllBookingsHandler);

// GET /bookings/:id
bookingsRouter.get('/:id', getBookingDetailsHandler);

// POST /bookings
bookingsRouter.post('/', createBookingHandler);

// PUT /bookings/:id
bookingsRouter.put('/:id', authenticateFirebaseToken, updateBookingHandler);

// DELETE /bookings/:id
bookingsRouter.delete('/:id', authenticateFirebaseToken, deleteBookingHandler);

export default bookingsRouter;
