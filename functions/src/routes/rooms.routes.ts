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
roomsRouter.get('/check-availability', checkAvailabilityRoomHandler)

//GET /details?type={TYPE}
roomsRouter.get('/details', getRoomDetailsHandler)

// POST /bookings
roomsRouter.post(
    '/',
    (...args) => authenticateFirebaseToken(...args, UserRole.ADMIN),
    createRoomHandler
);

// GET /bookings
roomsRouter.get('/', getAllRoomsHandler);

export default roomsRouter;
