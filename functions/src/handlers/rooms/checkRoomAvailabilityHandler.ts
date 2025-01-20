import { Request, Response } from "express";
import { RoomValidator } from "../../validators/RoomValidator";

export async function checkAvailabilityRoomHandler(request: Request, response: Response): Promise<void> {
    const { serviceName, checkInDate, checkOutDate } = request.body;

    try {
        const isAvailable = RoomValidator.isRoomAvailable({ serviceName, checkInDate, checkOutDate });
        if (!isAvailable) {
            response.status(400).json({ message: 'No rooms available' });
            return;
        }

        response.status(200).json({ message: 'success' });
    } catch (error) {
        response.status(500).json({ message: "Error" });
    }
}
