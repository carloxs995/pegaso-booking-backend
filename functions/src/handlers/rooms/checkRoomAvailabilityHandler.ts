import { Request, Response } from "express";
import { RoomsService } from "../../services/RoomsService";
import { container } from "tsyringe";
import { DITokens } from "../../di-tokens";

export async function checkAvailabilityRoomHandler(request: Request, response: Response): Promise<void> {
    const { id } = request.params;
    const { checkInDate, checkOutDate } = request.query as {
        checkInDate: string;
        checkOutDate: string;
    };

    try {
        if (!checkInDate || !checkOutDate) {
            response.status(400).json({ message: 'some param is missing' })
            return;
        }

        const RoomService = container.resolve<RoomsService>(DITokens.roomsService);
        const roomAvailability = await RoomService.isRoomAvailable(id, { checkInDate, checkOutDate });
        response.status(200).json({ data: roomAvailability });
    } catch (error: any) {
        response.status(500).json({ message: error?.message || 'error' });
    }
}
