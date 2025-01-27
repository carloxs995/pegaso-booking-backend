import { Router } from "express";
import { checkAvailabilityRoomHandler } from "../handlers/rooms/checkRoomAvailabilityHandler";
import { createRoomHandler } from "../handlers/rooms/createRoomHandler";
import { getRoomDetailsHandler } from "../handlers/rooms/getRoomDetailsHandler";
import { getAllRoomsHandler } from "../handlers/rooms/getAllRoomsHandler";
import { authenticateFirebaseToken } from "../middlewares/authenticationMiddleware";
import { UserRole } from "../models/user.model";
import { updateRoomHandler } from "../handlers/rooms/updateRoomHandler";

const roomsRouter = Router();

//GET /rooms/check-availability
roomsRouter.get(
    '/check-availability/:id',
    (...args) => authenticateFirebaseToken(...args, UserRole.GUEST),
    checkAvailabilityRoomHandler
);

//GET /rooms/:id/details
roomsRouter.get(
    '/:id/details',
    (...args) => authenticateFirebaseToken(...args, UserRole.GUEST),
    getRoomDetailsHandler
)

// POST /rooms
roomsRouter.post(
    '/',
    (...args) => authenticateFirebaseToken(...args, UserRole.ADMIN),
    createRoomHandler
);

// GET /rooms
roomsRouter.get(
    '/',
    (...args) => authenticateFirebaseToken(...args, UserRole.GUEST),
    getAllRoomsHandler
);

// PUT /rooms
roomsRouter.put(
    '/:id',
    (...args) => authenticateFirebaseToken(...args, UserRole.ADMIN),
    updateRoomHandler
);

export default roomsRouter;
