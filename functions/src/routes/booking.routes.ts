import { Router } from 'express';
import { getAllBookingsHandler } from '../handlers/bookings/getAllBookings.handler';
import { getBookingDetailsHandler } from '../handlers/bookings/getBookingDetails.handler';
import { createBookingHandler } from '../handlers/bookings/createBooking.handler';
import { updateBookingHandler } from '../handlers/bookings/updateBooking.handler';
import { deleteBookingHandler } from '../handlers/bookings/deleteBooking.handler';
import { authenticateFirebaseToken } from '../middlewares/authenticationMiddleware';

const router = Router();

// GET /bookings
router.get('/', authenticateFirebaseToken, getAllBookingsHandler);

// GET /bookings/:id
router.get('/:id', getBookingDetailsHandler);

// POST /bookings
router.post('/', createBookingHandler);

// PUT /bookings/:id
router.put('/:id', authenticateFirebaseToken, updateBookingHandler);

// DELETE /bookings/:id
router.delete('/:id', authenticateFirebaseToken, deleteBookingHandler);

export default router;
