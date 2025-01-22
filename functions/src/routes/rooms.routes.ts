import { Router } from "express";
import { checkAvailabilityRoomHandler } from "../handlers/rooms/checkRoomAvailabilityHandler";
import { createRoomHandler } from "../handlers/rooms/createRoomHandler";
import { getRoomDetailsHandler } from "../handlers/rooms/getRoomDetailsHandler";
import { getAllRoomsHandler } from "../handlers/rooms/getAllRoomsHandler";
import { authenticateFirebaseToken } from "../middlewares/authenticationMiddleware";
import { UserRole } from "../models/user.model";

const roomsRouter = Router();

//TODO: Add Guard
//GET /rooms/check-availability
roomsRouter.get(
    '/check-availability',
    (...args) => authenticateFirebaseToken(...args, UserRole.USER),
    checkAvailabilityRoomHandler
);

//GET /details?type={TYPE}
roomsRouter.get(
    '/details',
    (...args) => authenticateFirebaseToken(...args, UserRole.USER),
    getRoomDetailsHandler
)

// POST /bookings
roomsRouter.post(
    '/',
    (...args) => authenticateFirebaseToken(...args, UserRole.ADMIN),
    createRoomHandler
);

// GET /bookings
roomsRouter.get(
    '/',
    (...args) => authenticateFirebaseToken(...args, UserRole.GUEST),
    getAllRoomsHandler
);

export default roomsRouter;
