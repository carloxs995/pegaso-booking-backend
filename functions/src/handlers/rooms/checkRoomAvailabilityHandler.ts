import { Request, Response } from "express";
import { RoomsService } from "../../services/RoomsService";
import { container } from "tsyringe";
import { DITokens } from "../../di-container";

export async function checkAvailabilityRoomHandler(request: Request, response: Response): Promise<void> {
    const { serviceName, checkInDate, checkOutDate } = request.body;

    try {
        const RoomService = container.resolve<RoomsService>(DITokens.roomsService);
        const roomAvailability = await RoomService.isRoomAvailable({ serviceName, checkInDate, checkOutDate });
        response.status(200).json({ data: roomAvailability });
    } catch (error) {
        response.status(500).json({ message: "Error" });
    }
}
