import {Router} from 'express';
import {getAllBookingsHandler} from '../handlers/bookings/getAllBookings.handler';
import {getBookingDetailsHandler} from '../handlers/bookings/getBookingDetails.handler';
import {createBookingHandler} from '../handlers/bookings/createBooking.handler';
import {updateBooking} from '../handlers/bookings/updateBooking.handler';
import {deleteBooking} from '../handlers/bookings/deleteBooking.handler';

const router = Router();

// GET /bookings
router.get('/', getAllBookingsHandler);

// GET /bookings/:id
router.get('/:id', getBookingDetailsHandler);

// POST /bookings
router.post('/', createBookingHandler);

// PUT /bookings/:id
router.put('/:id', updateBooking);

// DELETE /bookings/:id
router.delete('/:id', deleteBooking);

export default router;
