import { Router } from "express";
import { checkAvailabilityRoomsHandler } from "../handlers/rooms/checkRoomsAvailabilityHandler";

export const roomsRouter = Router();

//GET /rooms/check-availability
roomsRouter.get('/check-availability', checkAvailabilityRoomsHandler)
