import { Request, Response } from "express";
import { RoomsCollection } from "../../database/collections/roomsCollection";
import { BookingCollection } from "../../database/collections/bookingsCollection";

export async function checkAvailabilityRoomHandler(request: Request, response: Response): Promise<void> {
    const { serviceName, checkInDate, checkOutDate } = request.body;

    try {
        const roomDoc = await RoomsCollection.getItemPerType(serviceName);

        if (!roomDoc) {
            response.status(404).json({ message: "Room not found" });
            return;
        }

        const maxQuantity = roomDoc.capacity;
        const bookingsSnapshot = await BookingCollection.getAllItems({
            serviceType: serviceName,
            checkInDate,
            checkOutDate
        });

        if(maxQuantity - bookingsSnapshot.totalCount) {
            response.status(400).json({ message: 'No rooms available' });
        }

        response.status(200).json({ message: 'success' });
    } catch (error) {
        response.status(500).json({ message: "Error" });
    }
}
