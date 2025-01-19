import { Router } from "express";
import { checkAvailabilityRoomHandler } from "../handlers/rooms/checkRoomAvailabilityHandler";
import { createRoomHandler } from "../handlers/rooms/createRoomHandler";

export const roomsRouter = Router();

//GET /rooms/check-availability
roomsRouter.get('/check-availability', checkAvailabilityRoomHandler)

// POST /bookings
roomsRouter.post('/', createRoomHandler);
