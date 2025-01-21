import { inject, injectable } from "tsyringe";
import { IBookingBase } from "../models/booking.model";
import { IRoomType } from "../models/room.model";
import { DITokens } from "../di-container";
import { BookingsCollection } from "../database/collections/BookingsCollection";
import { RoomsCollection } from "../database/collections/RoomsCollection";
import { parseISO, differenceInDays } from "date-fns";

@injectable()
export class RoomsService {
    private readonly _bookingsCollection: BookingsCollection;
    private readonly _roomsCollection: RoomsCollection;

    constructor(
        @inject(DITokens.bookingCollection) bookingsCollection: BookingsCollection,
        @inject(DITokens.roomsCollection) roomsCollection: RoomsCollection
    ) {
        this._bookingsCollection = bookingsCollection;
        this._roomsCollection = roomsCollection;
    }

    async isRoomAvailable(
        booking: Pick<IBookingBase, 'checkInDate' | 'checkOutDate' | 'serviceName'>
    ): Promise<{ roomsMaxQuantity: number; freeRooms: number; isAvailable: boolean; }> {
        const roomDoc = await this._roomsCollection.getItemByType(booking.serviceName);

        if (!roomDoc) {
            throw Error('isRoomAvailable: item not found');
        }

        const maxQuantity = roomDoc.totalRooms;

        const bookings = await this._bookingsCollection.getAllItems({
            serviceType: booking.serviceName,
            checkInDate: booking.checkInDate,
            checkOutDate: booking.checkOutDate
        });

        const isAvailable = !!(maxQuantity - bookings.totalCount);

        return {
            roomsMaxQuantity: maxQuantity,
            freeRooms: maxQuantity - bookings.totalCount,
            isAvailable
        };
    }

    async calculateRoomPrice(roomType: IRoomType, checkInDate: string, checkOutDate: string, guests: number): Promise<number> {
        const roomDetails = await this._roomsCollection.getItemByType(roomType);
        if (!roomDetails) {
            throw new Error(`Room type not found: ${roomType}`);
        }

        const checkIn = parseISO(checkInDate);
        const checkOut = parseISO(checkOutDate);

        const nights = differenceInDays(checkOut, checkIn);
        if (nights <= 0) {
            throw new Error("checkInDate and checkOutDate date is not valid");
        }

        const basePrice = roomDetails.pricePerNight * nights;

        const extraCostPerGuest = 0.10; //10%
        const extraGuestCharge = guests > 1 ? basePrice * extraCostPerGuest * (guests - 1) : 0;

        // Prezzo finale
        const totalPrice = basePrice + extraGuestCharge;
        return totalPrice;
    }
}
