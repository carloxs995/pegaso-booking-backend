import { Request, Response } from "express";

export async function checkAvailabilityRoomsHandler(request: Request, response: Response): Promise<void> {
    // const { roomType, checkIn, checkOut } = request.body;

    try {
        // const roomDoc = await dbFirestore.collection("rooms").doc(roomType).get();

        // if (!roomDoc.exists) {
        //     response.status(404).json({ message: "Tipo di stanza non trovato." });
        //     return;
        // }

        // const maxQuantity = roomDoc.data();

        // const bookingsSnapshot = await dbFirestore.collection("bookings")
        //     .where("roomType", "==", roomType)
        //     .where("checkIn", "<", checkOut)
        //     .where("checkOut", ">", checkIn)
        //     .count()
        //     .get();

        // let bookedRooms = 0;
        // bookingsSnapshot.forEach(doc => {
        //     bookedRooms += doc.data().quantity;
        // });

        // const availableRooms = maxQuantity - bookedRooms;

        response.status(200).json({ message: 'success' });
    } catch (error) {
        response.status(500).json({ message: "Error" });
    }
}
