import { Router } from "express";
import { checkAvailabilityRoomHandler } from "../handlers/rooms/checkRoomAvailabilityHandler";

export const roomsRouter = Router();

//GET /rooms/check-availability
roomsRouter.get('/check-availability', checkAvailabilityRoomHandler)
