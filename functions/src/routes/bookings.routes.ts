import { Router } from 'express';
import { getAllBookingsHandler } from '../handlers/bookings/getAllBookingsHandler';
import { getBookingDetailsHandler } from '../handlers/bookings/getBookingDetailsHandler';
import { createBookingHandler } from '../handlers/bookings/createBookingHandler';
import { updateBookingHandler } from '../handlers/bookings/updateBookingHandler';
import { deleteBookingHandler } from '../handlers/bookings/deleteBookingHandler';
import { updatePaymentBookingHandler } from '../handlers/bookings/updatePaymentBookingHandler';
import { authenticateFirebaseToken } from '../middlewares/authenticationMiddleware';
import { UserRole } from '../models/user.model';

const bookingsRouter = Router();

// GET /bookings
bookingsRouter.get(
    '/',
    (...args) => authenticateFirebaseToken(...args, UserRole.USER),
    getAllBookingsHandler
);

// GET /bookings/:id
bookingsRouter.get(
    '/:id',
    (...args) => authenticateFirebaseToken(...args, UserRole.USER),
    getBookingDetailsHandler
);

// POST /bookings
bookingsRouter.post(
    '/',
    (...args) => authenticateFirebaseToken(...args, UserRole.USER),
    createBookingHandler
);

// PUT /bookings/:id
bookingsRouter.put(
    '/:id',
    (...args) => authenticateFirebaseToken(...args, UserRole.USER),
    updateBookingHandler
);

// PUT /bookings/:id/confirm
bookingsRouter.put(
    '/:id/confirm',
    (...args) => authenticateFirebaseToken(...args, UserRole.ADMIN),
    updatePaymentBookingHandler
);

// DELETE /bookings/:id
bookingsRouter.delete(
    '/:id',
    (...args) => authenticateFirebaseToken(...args, UserRole.USER),
    deleteBookingHandler
);

export default bookingsRouter;
