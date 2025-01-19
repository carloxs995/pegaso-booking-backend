import { Router } from 'express';
import { getAllBookingsHandler } from '../handlers/bookings/getAllBookingsHandler';
import { getBookingDetailsHandler } from '../handlers/bookings/getBookingDetailsHandler';
import { createBookingHandler } from '../handlers/bookings/createBookingHandler';
import { updateBookingHandler } from '../handlers/bookings/updateBookingHandler';
import { deleteBookingHandler } from '../handlers/bookings/deleteBookingHandler';
import { updatePaymentBookingHandler } from '../handlers/bookings/updatePaymentBookingHandler';
// import { authenticateFirebaseToken } from '../middlewares/authenticationMiddleware';

const bookingsRouter = Router();

// GET /bookings
// TODO: make strict access to Admin
bookingsRouter.get('/', getAllBookingsHandler);

// GET /bookings/:id
bookingsRouter.get('/:id', getBookingDetailsHandler);

// POST /bookings
bookingsRouter.post('/', createBookingHandler);

// PUT /bookings/:id
bookingsRouter.put('/:id', updateBookingHandler);

// PUT /bookings/:id/confirm
// TODO: make strict access to Admin
bookingsRouter.put('/:id/confirm', updatePaymentBookingHandler);

// DELETE /bookings/:id
// TODO: make strict access to Admin
bookingsRouter.delete('/:id', deleteBookingHandler);

export default bookingsRouter;
