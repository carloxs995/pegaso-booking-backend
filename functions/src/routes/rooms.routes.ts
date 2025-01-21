import { Router } from "express";
import { checkAvailabilityRoomHandler } from "../handlers/rooms/checkRoomAvailabilityHandler";
import { createRoomHandler } from "../handlers/rooms/createRoomHandler";
import { getRoomDetailsHandler } from "../handlers/rooms/getRoomDetailsHandler";

export const roomsRouter = Router();

//GET /rooms/check-availability
roomsRouter.get('/check-availability', checkAvailabilityRoomHandler)

//GET /details?type={TYPE}
roomsRouter.get('/details', getRoomDetailsHandler)

// POST /bookings
roomsRouter.post('/', createRoomHandler);

// GET /bookings
roomsRouter.get('/', getRoomDetailsHandler);
